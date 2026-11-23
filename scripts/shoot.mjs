// Minimal CDP screenshot driver (Node 22+ built-in WebSocket, no deps).
// Captures real screenshots of the live demos (Chrome DevTools Protocol, no dependencies).
// usage: npm run shots   (or: node scripts/shoot.mjs [outDir] [jobs.json])
// Jobs live in scripts/shots.json. Needs Node 22+ and Edge or Chrome (set CHROME_PATH if elsewhere).
// jobs: [{ url, out, width, height, dpr, mobile, media, colorScheme, reducedMotion, steps: [js...], wait, fullPage, selector, format, quality }]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const [outDir = "assets/shots", jobsFile = "scripts/shots.json"] = process.argv.slice(2);
const jobs = JSON.parse(readFileSync(jobsFile, "utf8"));
mkdirSync(outDir, { recursive: true });

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
const port = 9300 + Math.floor(Math.random() * 400);
const profile = join(tmpdir(), "cdp-shoot-" + port);
const proc = spawn(browser, [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--no-first-run", "--disable-gpu", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
}
if (!wsUrl) { proc.kill(); throw new Error("no CDP target"); }

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id;
  pending.set(n, (m) => (m.error ? rej(new Error(method + ": " + m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return r.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");
for (const job of jobs) {
  const { width = 1440, height = 900, dpr = 1 } = job;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: !!job.mobile });
  if (job.colorScheme) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: job.colorScheme }] });
  if (job.media) await send("Emulation.setEmulatedMedia", { media: job.media });
  if (job.reducedMotion) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  if (job.url) {
    await send("Page.navigate", { url: job.url });
    await sleep(job.wait ?? 2500);
  }
  for (const step of job.steps || []) {
    const v = await evaluate(step);
    if (v !== undefined) console.log("  step ->", JSON.stringify(v).slice(0, 200));
    await sleep(job.stepWait ?? 900);
  }
  if (job.scrollTo != null) { await evaluate(`window.scrollTo(0, ${job.scrollTo})`); await sleep(500); }
  let clip;
  if (job.fullPage) {
    const h = await evaluate("Math.ceil(document.documentElement.scrollHeight)");
    await send("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: dpr, mobile: !!job.mobile });
    await sleep(600);
  }
  if (job.selector) {
    const r = await evaluate(`(() => { const b = document.querySelector(${JSON.stringify(job.selector)}).getBoundingClientRect(); return { x: b.x + scrollX, y: b.y + scrollY, width: b.width, height: b.height }; })()`);
    clip = { ...r, scale: 1 };
  }
  const shot = await send("Page.captureScreenshot", { format: job.format || "png", quality: job.quality, captureBeyondViewport: !!(job.fullPage || clip), clip });
  const file = join(outDir, job.out);
  writeFileSync(file, Buffer.from(shot.data, "base64"));
  console.log("wrote", file);
  if (job.logs) console.log(await evaluate(job.logs));
}
ws.close();
proc.kill();
