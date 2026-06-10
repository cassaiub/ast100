// Headless-Chrome screenshot via CDP (no deps — Node 22 global WebSocket).
// usage: node shot.mjs <url> <out.png> [setupJS] [width] [height]
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const [url, out, setup = "", w = "1600", h = "900"] = process.argv.slice(2);
const port = 9223;

const chrome = spawn("google-chrome", [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  "--no-first-run",
  `--window-size=${w},${h}`,
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "about:blank",
], { stdio: "ignore" });

await new Promise((r) => setTimeout(r, 1800));
const targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json());
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
};
await new Promise((r) => (ws.onopen = r));
await send("Page.enable");
await send("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 3500)); // load + hydrate
if (setup) {
  await send("Runtime.evaluate", { expression: setup, awaitPromise: false });
  await new Promise((r) => setTimeout(r, 1500));
}
let clip;
if (process.env.CLIP) {
  const res = await send("Runtime.evaluate", {
    expression: `(() => { const r = document.querySelector(${JSON.stringify(process.env.CLIP)}).getBoundingClientRect(); return JSON.stringify({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }); })()`,
    returnByValue: true,
  });
  const r = JSON.parse(res.result.value);
  if (process.env.FRAC) {
    const [fx, fy, fw, fh] = process.env.FRAC.split(",").map(Number);
    r.x += r.width * fx; r.y += r.height * fy; r.width *= fw; r.height *= fh;
  }
  clip = { x: r.x, y: r.y, width: r.width, height: r.height, scale: Math.min(3, 1400 / r.width) };
}
const shot = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip } : {}) });
writeFileSync(out, Buffer.from(shot.data, "base64"));
chrome.kill();
process.exit(0);
