// Port-isolated headless-Chrome screenshot for AST 100 figure verification.
// Parallel-safe variant of the instructor harness shot.mjs — port + Chrome
// profile come from env so many screenshots can run concurrently.
//
// usage: CDP_PORT=9330 node shot_port.mjs <url> <out.png> [setupJS] [w] [h]
//        CLIP='<selector>'  clips the screenshot to that element.
//
// Fullscreen recipe (setupJS): set the theme, scroll the target figure into
// view to trigger hydration, then add `.is-fs` after a short delay:
//   document.documentElement.setAttribute('data-theme','light');
//   var f=document.querySelectorAll('[data-figure-frame]')[N];
//   f.scrollIntoView({block:'center'});
//   setTimeout(function(){f.classList.add('is-fs')},900)
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const [url, out, setup = "", w = "1600", h = "900"] = process.argv.slice(2);
const port = Number(process.env.CDP_PORT || 9223);

const chrome = spawn("google-chrome", [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/cdp-profile-${port}`,
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
await new Promise((r) => setTimeout(r, 3800)); // load + hydrate
if (setup) {
  await send("Runtime.evaluate", { expression: setup, awaitPromise: false });
  await new Promise((r) => setTimeout(r, 1800));
}
let clip;
if (process.env.CLIP) {
  const res = await send("Runtime.evaluate", {
    expression: `(() => { const r = document.querySelector(${JSON.stringify(process.env.CLIP)}).getBoundingClientRect(); return JSON.stringify({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }); })()`,
    returnByValue: true,
  });
  const r = JSON.parse(res.result.value);
  clip = { x: r.x, y: r.y, width: r.width, height: r.height, scale: Math.min(3, 1400 / r.width) };
}
const shot = await send("Page.captureScreenshot", { format: "png", ...(clip ? { clip } : {}) });
writeFileSync(out, Buffer.from(shot.data, "base64"));
chrome.kill();
process.exit(0);
