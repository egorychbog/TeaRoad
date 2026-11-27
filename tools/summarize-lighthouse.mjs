import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const reportsDir = path.join(repoRoot, 'docs', 'audit', 'reports');
const outputFile = path.join(repoRoot, 'docs', 'audit', 'lighthouse-summary.md');

const entries = await fs.readdir(reportsDir, { withFileTypes: true });
const reportFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.report.json'))
  .map((entry) => entry.name);

if (reportFiles.length === 0) {
  console.error('JSON-отчёты не найдены. Сначала запустите tools/run-lighthouse-audit.ps1.');
  process.exit(1);
}

const groups = new Map();

for (const filename of reportFiles) {
  const match = filename.match(/^(.*)-(?:run-(\d+)|single)\.report\.json$/);
  if (!match) continue;

  const groupName = match[1];
  const runNumber = match[2] ? Number(match[2]) : 1;
  const raw = await fs.readFile(path.join(reportsDir, filename), 'utf8');
  const report = JSON.parse(raw);

  if (!groups.has(groupName)) groups.set(groupName, []);
  groups.get(groupName).push({ filename, runNumber, report });
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function categoryScore(report, key) {
  const score = report.categories?.[key]?.score;
  return Number.isFinite(score) ? score * 100 : null;
}

function metric(report, id) {
  const value = report.audits?.[id]?.numericValue;
  return Number.isFinite(value) ? value : null;
}

function fmtScore(value) {
  return value === null ? '—' : String(Math.round(value));
}

function fmtSeconds(value) {
  return value === null ? '—' : (value / 1000).toFixed(2) + ' с';
}

function fmtMs(value) {
  return value === null ? '—' : Math.round(value) + ' мс';
}

function fmtCls(value) {
  return value === null ? '—' : value.toFixed(3);
}

const lines = [
  '# Сводка Lighthouse',
  '',
  'Сформировано: ' + new Date().toLocaleString('ru-RU'),
  '',
  '> Таблица создана из JSON-отчётов Lighthouse. Для публичных страниц метрики FCP/LCP/TBT/CLS/Speed Index взяты из запуска, оценка Performance которого совпадает с медианной. INP в Lighthouse Navigation не измеряется — его нужно внести из Chrome DevTools → Performance.',
  '',
  '| Страница | Performance: запуски | Медиана Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|'
];

for (const [name, records] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  records.sort((a, b) => a.runNumber - b.runNumber);
  const perfRuns = records.map((item) => categoryScore(item.report, 'performance'));
  const medianPerf = median(perfRuns);
  const chosen = records.find((item) => categoryScore(item.report, 'performance') === medianPerf) ?? records[0];
  const report = chosen.report;
  const categoryMedian = (key) => median(records.map((item) => categoryScore(item.report, key)));

  const runLabels = perfRuns.map((score) => score === null ? '—' : String(Math.round(score))).join(', ');
  const pageUrl = report.finalDisplayedUrl || report.requestedUrl || '';
  const displayPage = pageUrl ? new URL(pageUrl).pathname : name;

  lines.push(
    '| ' + displayPage + ' (' + name + ') | ' + runLabels + ' | ' + fmtScore(medianPerf) + ' | ' +
    fmtScore(categoryMedian('accessibility')) + ' | ' +
    fmtScore(categoryMedian('best-practices')) + ' | ' +
    fmtScore(categoryMedian('seo')) + ' | ' +
    fmtSeconds(metric(report, 'first-contentful-paint')) + ' | ' +
    fmtSeconds(metric(report, 'largest-contentful-paint')) + ' | ' +
    fmtMs(metric(report, 'total-blocking-time')) + ' | ' +
    fmtCls(metric(report, 'cumulative-layout-shift')) + ' | ' +
    fmtSeconds(metric(report, 'speed-index')) + ' |'
  );
}

lines.push(
  '',
  '## Исходные отчёты',
  '',
  ...reportFiles.sort().map((file) => '- [' + file.replace('.report.json', '.report.html') + '](reports/' + file.replace('.report.json', '.report.html') + ') · JSON: [' + file + '](reports/' + file + ')'),
  ''
);

await fs.writeFile(outputFile, lines.join('\n'), 'utf8');
console.log('Сводка сохранена: ' + outputFile);
