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
