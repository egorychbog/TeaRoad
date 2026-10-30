import 'dotenv/config';
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, 'assets'), { recursive: true });

// Tailwind is pinned for reproducible utility generation without shipping its compiler to the browser.
execSync('npx --yes tailwindcss@3.4.17 -c tailwind.config.cjs -i src/styles.css -o dist/assets/app.css --minify', {
  cwd: root,
  stdio: 'inherit',
});

await build({
  entryPoints: [{ in: 'src/main.jsx', out: 'app' }],
  outdir: path.join(dist, 'assets'),
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
  splitting: true,
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''),
    'import.meta.env.VITE_SITE_URL': JSON.stringify(process.env.VITE_SITE_URL || 'https://chai-path-complete.vercel.app'),
  },
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'esm',
  jsx: 'automatic',
});

const html = await fs.readFile('index.html', 'utf8');
const outputHtml = html
  .replace(
    '</head>',
    '    <link rel="stylesheet" href="/assets/app.css" />\n  </head>',
  )
  .replace(
    '<script type="module" src="/src/main.jsx"></script>',
    '<script type="module" src="/assets/app.js"></script>',
  );

await fs.writeFile(path.join(dist, 'index.html'), outputHtml);

const siteUrl = (process.env.VITE_SITE_URL || 'https://chai-path-complete.vercel.app').replace(/\/+$/, '');

try {
  await fs.cp(path.join(root, 'public'), dist, { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

// Inject the public production origin into canonical URLs, robots.txt and sitemap.xml.
for (const filename of ['index.html', 'robots.txt', 'sitemap.xml']) {
  const filePath = path.join(dist, filename);
  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, content.replaceAll('__SITE_URL__', siteUrl));
}
