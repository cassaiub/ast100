import { useEffect, useRef } from "react";

/* The `tease` paragraph below the H1 is the single source-of-truth lesson
   description, passed in from the page and mirrored on the chapter
   overview (`/chapter/7`) card. See `course-nav.ts` sub `tease`. */
export default function Hero({ tease }: { tease: string }) {
  const numRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (numRef.current) {
          numRef.current.style.transform = `translate(-50%, calc(-50% + ${y * 0.25}px))`;
        }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10">
      <div ref={numRef} className="ghost-num absolute left-1/2 top-1/2 leading-none" style={{ fontSize: "clamp(16rem, 34vw, 32rem)", transform: "translate(-50%, -50%)" }} aria-hidden="true">7.4</div>
      <div className="relative max-w-[1100px] mx-auto w-full">
        <div data-fade style={{ ["--delay" as string]: "120ms" }} className="font-mono text-[11px] tracking-[0.32em] uppercase text-plasma/80 mb-7 flex items-center gap-3">
          <span className="block w-9 h-px bg-plasma/50" />
          Subsection 7.4 · Chapter 7
        </div>
        <h1 data-fade style={{ ["--delay" as string]: "220ms" }} className="title-gradient font-serif font-medium tracking-tight leading-[1.02]">
          <span className="block" style={{ fontSize: "clamp(2.6rem, 7vw, 6.2rem)" }}>
            Search for <span className="italic font-light text-white/70">Intelligence</span>
          </span>
        </h1>
        <p data-fade style={{ ["--delay" as string]: "420ms" }} className="mt-10 max-w-[64ch] text-[1.05em] leading-[1.74] text-white/70">
          {tease}
        </p>
        <div data-fade style={{ ["--delay" as string]: "620ms" }} className="mt-16 font-mono text-[11px] tracking-[0.24em] uppercase text-white/40 flex items-center gap-3">
          <span className="scroll-cue inline-block">↓</span> scroll to begin
        </div>
      </div>
      <div className="hidden lg:flex absolute right-10 bottom-10 flex-col items-end gap-1 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
        <div>are we alone? · still listening</div>
        <div className="text-plasma/60">technosignatures · dark forest · SETI</div>
      </div>
    </section>
  );
}
