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

await fs.writeFile(path.join(dist, 'index.html'), outputHtml);

try {
  await fs.cp(path.join(root, 'public'), dist, { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

// Validate the production artifact before it can be published. A missing source image
// should fail the build rather than silently turn the image URL into the SPA HTML.
const requiredOutputFiles = ['index.html', 'assets/app.js', 'assets/app.css'];
for (const file of requiredOutputFiles) {
  try {
    await fs.access(path.join(dist, file));
  } catch {
    throw new Error(`Build failed: required output file is missing: ${file}`);
  }
}

const appSource = await fs.readFile(path.join(root, 'src/App.jsx'), 'utf8');
const referencedAssets = new Set(
  [...appSource.matchAll(/asset\(\s*['"]([^'"]+)['"]\s*\)/g)].map((match) => match[1]),
);
for (const match of appSource.matchAll(/['"]\/assets\/([^'"]+\.(?:png|jpe?g|webp|svg|ico))['"]/gi)) {
  referencedAssets.add(match[1]);
}

const missingAssets = [];
for (const name of referencedAssets) {
  try {
    await fs.access(path.join(dist, 'assets', name));
  } catch {
    missingAssets.push(name);
  }
}
if (missingAssets.length > 0) {
  throw new Error(`Build failed: missing referenced image assets: ${missingAssets.join(', ')}`);
}
