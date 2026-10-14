import fs from 'node:fs/promises';
import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';

const [input, outputDir = 'tmp/pdf-pages'] = process.argv.slice(2);

if (!input) {
  console.error('Usage: node tools/render-pdf.mjs <input.pdf> [output-dir]');
  process.exit(1);
}

await fs.mkdir(outputDir, { recursive: true });

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const data = new Uint8Array(await fs.readFile(input));
const document = await pdfjs.getDocument({ data }).promise;

for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
  const page = await document.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  await page.render({ canvasContext: context, viewport }).promise;

  const filename = path.join(
    outputDir,
    `page-${String(pageNumber).padStart(2, '0')}.png`,
  );
  await fs.writeFile(filename, canvas.toBuffer('image/png'));
  console.log(filename);
}
