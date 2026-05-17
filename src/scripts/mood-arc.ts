/* Mood-arc backdrop driver — one rAF-throttled scroll listener.
   Updates four CSS opacity values on #mood-l1..#mood-l4 to paint
   a slow cool→warm tint shift across the page. */

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function bump(m: number, peak: number, width: number): number {
  const d = Math.abs(m - peak) / width;
  const v = Math.max(0, 1 - d);
  return v * v * (3 - 2 * v);
}

function install() {
  const l1 = document.getElementById("mood-l1");
  const l2 = document.getElementById("mood-l2");
  const l3 = document.getElementById("mood-l3");
  const l4 = document.getElementById("mood-l4");
  if (!l1 || !l2 || !l3 || !l4) return;

  let raf = 0;
  function frame() {
    raf = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const m = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    document.documentElement.style.setProperty("--mood", m.toFixed(4));

    const a1 = 1 - smoothstep(0.1, 0.55, m);
    const a2 = bump(m, 0.35, 0.32);
    const a3 = bump(m, 0.65, 0.32);
    const a4 = smoothstep(0.55, 0.95, m);

    if (l1) l1.style.opacity = a1.toFixed(3);
    if (l2) l2.style.opacity = a2.toFixed(3);
    if (l3) l3.style.opacity = a3.toFixed(3);
    if (l4) l4.style.opacity = a4.toFixed(3);
  }
  function onScroll() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
  install();
}
