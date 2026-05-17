/* Page-level runtime for every chapter page:
   - Fade-up entrance observer for [data-fade] nodes
   - Reading progress bar (top, 1px) — cheap, always-on
   - Smooth scroll on desktop only, never on touch, never if reduced-motion */

function bootFadeUp() {
  const els = document.querySelectorAll<HTMLElement>("[data-fade]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  );
  els.forEach((el) => io.observe(el));
}

function bootReadingProgress() {
  const bar = document.getElementById("reading-progress");
  if (!bar) return;
  let raf = 0;
  function paint() {
    raf = 0;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = docH > 0 ? Math.max(0, Math.min(1, window.scrollY / docH)) : 0;
    if (bar) bar.style.setProperty("--progress", p.toFixed(4));
  }
  function onScroll() {
    if (!raf) raf = requestAnimationFrame(paint);
  }
  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

function bootSmoothScroll() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasTouch = "ontouchstart" in window;
  if (reduced || hasTouch) return;

  let target = window.scrollY;
  let current = target;
  let raf = 0;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }
  function tick() {
    current += (target - current) * 0.1;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo(0, current);
      raf = 0;
      return;
    }
    window.scrollTo(0, current);
    raf = requestAnimationFrame(tick);
  }
  function onWheel(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function onScrollSync() {
    if (!raf) {
      target = window.scrollY;
      current = target;
    }
  }
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScrollSync, { passive: true });
}

function boot() {
  bootFadeUp();
  bootReadingProgress();
  bootSmoothScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
