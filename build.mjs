import 'dotenv/config';
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, 'assets'), { recursive: true });

await build({
  entryPoints: ['src/main.jsx'],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''),
  },
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'esm',
  jsx: 'automatic',
  loader: {
    '.css': 'css',
  },
  outfile: 'dist/assets/app.js',
});

const html = await fs.readFile('index.html', 'utf8');
const outputHtml = html
  .replace(
    '</head>',
    '    <link rel="stylesheet" href="/assets/app.css" />\n  </head>',
  )
  .replace(
    '<script type="module" src="/src/App.jsx"></script>',
    '<script type="module" src="/assets/app.js"></script>',
  );

if (!outputHtml.includes('<link rel="stylesheet" href="/assets/app.css" />')) {
  throw new Error('Build failed: generated index.html is missing app.css.');
}
if (!outputHtml.includes('<script type="module" src="/assets/app.js"></script>')) {
  throw new Error('Build failed: generated index.html is missing the bundled app.js entry point.');
}

await fs.writeFile(path.join(dist, 'index.html'), outputHtml);

// Copy the contents of public into dist, including every original image in public/assets.
const publicDir = path.join(root, 'public');
try {
  for (const entry of await fs.readdir(publicDir)) {
    await fs.cp(
      path.join(publicDir, entry),
      path.join(dist, entry),
      { recursive: true, force: true },
    );
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

// Fail the build instead of publishing a broken site if any referenced image is absent.
const appSource = await fs.readFile(path.join(root, 'src/App.jsx'), 'utf8');
const referencedAssets = new Set(
  [...appSource.matchAll(/asset\(\s*['"`]([^'"`]+)['"`]\s*\)/g)].map((match) => match[1]),
);
const missingAssets = [];
for (const name of referencedAssets) {
  try {
    await fs.access(path.join(dist, 'assets', name));
  } catch {
    missingAssets.push(name);
  }
}
if (missingAssets.length > 0) {
  throw new Error(`Build failed: missing image assets: ${missingAssets.join(', ')}`);
}
