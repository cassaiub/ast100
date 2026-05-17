import { useEffect, useRef, useState } from "react";
import { subPath, overviewPath } from "../../data/course-nav";

const SCENES = [
  { idx: 0, code: "01", name: "Hero",     selector: '[data-screen-label="01 Hero"]' },
  { idx: 1, code: "02", name: "River",    selector: '[data-screen-label="02 River"]' },
  { idx: 2, code: "03", name: "Timeline", selector: '[data-screen-label="03 Timeline"]' },
  { idx: 3, code: "04", name: "Continue", selector: '[data-screen-label="04 Footer"]' },
];

const SUBSECTIONS = [
  { id: "0.0", title: "Chapter Overview",          tease: "You are here.",                                                       href: overviewPath(0), current: true },
  { id: "0.1", title: "Spacetime & Energy-Matter", tease: "How space, time, matter, and energy stitch into one fabric.",         href: subPath("0.1") },
  { id: "0.2", title: "Cosmic Evolution",          tease: "Increasing complexity — the engine of cosmic history.",               href: subPath("0.2") },
  { id: "0.3", title: "Observable Universe",       tease: "What we can see, what we cannot, and why it matters.",                href: subPath("0.3") },
  { id: "0.4", title: "Light & Telescopes",        tease: "How starlight becomes data — and a picture of the past.",             href: subPath("0.4") },
];

export default function MobileNav() {
  const [scene, setScene] = useState(0);
  const [open, setOpen] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const idleTimer = useRef<number>(0);

  // Track current scene via IntersectionObserver. Defer to idle.
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const ric =
      window.requestIdleCallback ||
      ((cb: () => void) => window.setTimeout(cb, 1));
    const handle = ric(() => {
      const els = SCENES.map((s) => document.querySelector(s.selector)).filter(
        (x): x is Element => Boolean(x),
      );
      if (!els.length) return;
      const map = new Map(els.map((el, i) => [el, i]));
      io = new IntersectionObserver(
        (entries) => {
          let bestIdx = scene;
          let bestRatio = 0;
          entries.forEach((e) => {
            if (e.intersectionRatio > bestRatio) {
              bestRatio = e.intersectionRatio;
              bestIdx = map.get(e.target) ?? bestIdx;
            }
          });
          if (bestRatio > 0) setScene(bestIdx);
        },
        { threshold: [0.15, 0.4, 0.7] },
      );
      els.forEach((el) => io!.observe(el));
    });
    return () => {
      if (io) io.disconnect();
      if (typeof handle === "number") clearTimeout(handle);
    };
  }, []);

  // Hide bar while scrolling down, show on stop/scroll-up.
  useEffect(() => {
    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const dy = y - lastScrollY.current;
        lastScrollY.current = y;
        if (Math.abs(dy) > 4) setBarHidden(dy > 0 && y > 200);
        window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => setBarHidden(false), 600);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const cur = SCENES[scene];

  return (
    <>
      <div
        className={`mobile-nav-backdrop ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <div
        className={`mobile-nav-bar ${barHidden && !open ? "hidden" : ""} flex items-center justify-between gap-3`}
        role="button"
        aria-expanded={open}
        aria-label={`Currently in ${cur.code} ${cur.name}. Tap for chapter index.`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-plasma shadow-[0_0_8px_#22d3ee] shrink-0" />
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/85 truncate">
            {cur.code} · {cur.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {SCENES.map((s) => (
            <span
              key={s.idx}
              className="block w-1.5 h-1.5 rounded-full"
              style={{
                background: s.idx === scene ? "#22d3ee" : "rgba(255,255,255,0.22)",
                boxShadow: s.idx === scene ? "0 0 6px rgba(34,211,238,0.7)" : "none",
                transition: "all 400ms var(--ease)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45">
            {open ? "close" : "menu"}
          </span>
          <span
            className="inline-block w-3 h-3 border-r border-b border-white/50"
            style={{
              transform: open
                ? "rotate(45deg) translate(-1px,-1px)"
                : "rotate(-135deg) translate(-1px,-1px)",
              transition: "transform 400ms var(--ease)",
            }}
          />
        </div>
      </div>

      <div
        className={`mobile-nav-sheet ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Chapter 0 index"
      >
        <div className="px-5 pt-4 pb-2 flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>
        <div className="px-5 pb-3">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-plasma/85 mb-1">
            Chapter 0 · index
          </div>
          <div className="font-serif text-white/95 leading-tight" style={{ fontSize: "1.4rem" }}>
            Seven Ages of the Universe
          </div>
        </div>

        <ol className="px-3 pb-6 pt-1 flex flex-col">
          {SUBSECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={s.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-4 py-3.5 px-3 rounded-lg active:bg-white/[0.03] transition-colors"
                aria-current={s.current ? "page" : undefined}
              >
                <span
                  className={`font-mono text-[11px] tracking-[0.18em] pt-1 shrink-0 ${s.current ? "text-plasma" : "text-white/40"}`}
                >
                  {s.id}
                </span>
                <span className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className={`font-serif leading-tight ${s.current ? "text-plasma" : "text-white/90"}`}
                    style={{ fontSize: "1.05rem" }}
                  >
                    {s.title}
                  </span>
                  <span className="text-[12px] text-white/50 leading-snug">{s.tease}</span>
                </span>
                {s.current && (
                  <span className="ml-auto self-center font-mono text-[9px] tracking-[0.22em] uppercase text-plasma/85 shrink-0">
                    now
                  </span>
                )}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
