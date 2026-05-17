/* Chapter 0 page runtime: fade-up entrance observer only.
   (Reading progress, smooth scroll, audio, mobile-nav, mood-arc are
   handled by their own React islands / scripts on this page.) */

function boot() {
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
