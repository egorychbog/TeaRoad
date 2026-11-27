import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = (process.argv[2] || 'https://tearoad.localhost').replace(/\/+$/, '');
const chromePath = process.env.CHROME_PATH;
const width = 390;
const height = 844;

if (!chromePath) {
  throw new Error('Set CHROME_PATH to a Chrome or Chrome for Testing executable.');
}

await fs.access(chromePath);

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForPage(port) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Chrome DevTools endpoint did not become ready.');
}

function connectCdp(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 0;

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const operation = pending.get(message.id);
    if (!operation) return;
    pending.delete(message.id);
    clearTimeout(operation.timer);
    if (message.error) operation.reject(new Error(message.error.message));
    else operation.resolve(message.result);
  });

  return {
    socket,
    async ready() {
      await opened;
    },
    send(method, params = {}) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }, 15_000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
  }
  return result.result?.value;
}

async function waitFor(cdp, expression, label, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

const instrumentation = `(() => {
  const state = window.__teaRoadVitals = { events: [], lcp: [], cls: 0, shifts: [] };
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId) state.events.push({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
          interactionId: entry.interactionId,
          processingStart: entry.processingStart,
          processingEnd: entry.processingEnd,
        });
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) state.lcp.push({ startTime: entry.startTime, size: entry.size });
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          state.cls += entry.value;
          state.shifts.push({ startTime: entry.startTime, value: entry.value });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
})();`;

function summarizeInteractions(events) {
  const byId = new Map();
  for (const event of events) {
    const current = byId.get(event.interactionId);
    if (!current || event.duration > current.duration) byId.set(event.interactionId, event);
  }
  const interactions = [...byId.values()].sort((a, b) => b.duration - a.duration);
  return {
    estimatedINPms: interactions.length ? Math.round(interactions[0].duration) : null,
    interactionCount: interactions.length,
    interactions: interactions.map((event) => ({
      event: event.name,
      durationMs: Math.round(event.duration),
      startTimeMs: Math.round(event.startTime),
      processingMs: Math.round(event.processingEnd - event.processingStart),
    })),
  };
}

async function clickTarget(cdp, selector, text) {
  const target = await evaluate(cdp, `(() => {
    const elements = [...document.querySelectorAll(${JSON.stringify(selector)})];
    const element = elements.find((item) => ${text
      ? `item.innerText.trim().includes(${JSON.stringify(text)})`
      : 'true'});
    if (!element) return null;
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);

  if (!target) throw new Error(`Could not find interaction target: ${text || selector}`);

  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: target.x, y: target.y });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: target.x, y: target.y, button: 'left', clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: target.x, y: target.y, button: 'left', clickCount: 1 });
  await new Promise((resolve) => setTimeout(resolve, 800));
}

const port = await getFreePort();
const tempRoot = path.resolve(os.tmpdir());
const profile = await fs.mkdtemp(path.join(tempRoot, 'tearoad-cwv-'));
const chromeArgs = [
  '--headless=new',
  '--disable-extensions',
  '--disable-background-networking',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--host-resolver-rules=MAP gc.kis.v2.scr.kaspersky-labs.com ~NOTFOUND',
  'about:blank',
];
const chrome = spawn(chromePath, chromeArgs, { stdio: 'ignore' });
let cdp;

try {
  const page = await waitForPage(port);
  cdp = connectCdp(page.webSocketDebuggerUrl);
  await cdp.ready();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: instrumentation });

  const productUrl = `${baseUrl}/product/ulun-honey-orchid`;
  await cdp.send('Page.navigate', { url: productUrl });
  await waitFor(cdp, "document.readyState === 'complete' && document.body.innerText.includes('Добавить в корзину')", 'product page');
  await new Promise((resolve) => setTimeout(resolve, 2_000));

  const productActions = [];
  await clickTarget(cdp, 'button', 'Добавить в корзину');
  productActions.push('Добавить товар в корзину');
  await clickTarget(cdp, 'button', 'В избранное');
  productActions.push('Добавить товар в избранное');
  const productMetrics = await evaluate(cdp, `(() => {
    const state = window.__teaRoadVitals;
    return { url: location.href, lcpMs: Math.round(Math.max(...state.lcp.map((item) => item.startTime), 0)), cls: Number(state.cls.toFixed(4)), events: state.events };
  })()`);

  const cartUrl = `${baseUrl}/cart`;
  await cdp.send('Page.navigate', { url: cartUrl });
  await waitFor(cdp, "document.readyState === 'complete' && !!document.querySelector('button[aria-label=\"Увеличить количество\"]')", 'cart item');
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  const cartActions = [];
  await clickTarget(cdp, 'button[aria-label="Увеличить количество"]');
  cartActions.push('Увеличить количество в корзине');
  await clickTarget(cdp, 'button[aria-label="Уменьшить количество"]');
  cartActions.push('Уменьшить количество в корзине');
  const cartMetrics = await evaluate(cdp, `(() => {
    const state = window.__teaRoadVitals;
    return { url: location.href, lcpMs: Math.round(Math.max(...state.lcp.map((item) => item.startTime), 0)), cls: Number(state.cls.toFixed(4)), events: state.events };
  })()`);

  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  const screenshotsDir = path.join(repoRoot, 'docs', 'audit', 'screenshots');
  const reportsDir = path.join(repoRoot, 'docs', 'audit', 'reports');
  await fs.mkdir(screenshotsDir, { recursive: true });
  await fs.mkdir(reportsDir, { recursive: true });
  await fs.writeFile(path.join(screenshotsDir, 'cwv-cart-interactions-mobile.png'), Buffer.from(screenshot.data, 'base64'));

  const versionResponse = await fetch(`http://127.0.0.1:${port}/json/version`);
  const version = await versionResponse.json();
  const output = {
    measuredAt: new Date().toISOString(),
    browser: version.Browser,
    viewport: `${width}x${height} mobile emulation`,
    method: 'Chrome DevTools Protocol input events with PerformanceEventTiming, LargestContentfulPaint, and LayoutShift observers.',
    interpretation: 'estimatedINPms is the slowest observed interaction in this short session; the sample is laboratory data, not CrUX field data.',
    routes: [
      {
        ...productMetrics,
        actions: productActions,
        ...summarizeInteractions(productMetrics.events),
      },
      {
        ...cartMetrics,
        actions: cartActions,
        ...summarizeInteractions(cartMetrics.events),
      },
    ],
  };
  for (const route of output.routes) delete route.events;
  await fs.writeFile(path.join(reportsDir, 'cwv-interactions.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(output, null, 2));
} finally {
  cdp?.close();
  if (process.platform === 'win32' && chrome.pid) {
    spawnSync('taskkill.exe', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } else {
    chrome.kill();
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  const tempPrefix = `${tempRoot}${path.sep}`;
  const resolvedProfile = path.resolve(profile);
  if (resolvedProfile.startsWith(tempPrefix) && path.basename(resolvedProfile).startsWith('tearoad-cwv-')) {
    try {
      await fs.rm(resolvedProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
    } catch {
      console.warn(`Temporary Chrome profile remains at ${resolvedProfile}`);
    }
  }
}
