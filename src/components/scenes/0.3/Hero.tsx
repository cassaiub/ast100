import { useEffect, useRef } from "react";

export default function Hero() {
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
      <div
        ref={numRef}
        className="ghost-num absolute left-1/2 top-1/2 leading-none"
        style={{ fontSize: "clamp(16rem, 34vw, 32rem)", transform: "translate(-50%, -50%)" }}
        aria-hidden="true"
      >
        0.3
      </div>

      <div className="relative max-w-[1100px] mx-auto w-full">
        <div
          data-fade
          style={{ ["--delay" as string]: "120ms" }}
          className="font-mono text-[11px] tracking-[0.32em] uppercase text-plasma/80 mb-7 flex items-center gap-3"
        >
          <span className="block w-9 h-px bg-plasma/50" />
          Subsection 0.3 · Chapter 0
        </div>

        <h1
          data-fade
          style={{ ["--delay" as string]: "220ms" }}
          className="title-gradient font-serif font-medium tracking-tight leading-[1.02]"
        >
          <span className="block" style={{ fontSize: "clamp(2.6rem, 7vw, 6.2rem)" }}>
            The <span className="italic font-light text-white/70">Observable</span>
          </span>
          <span className="block" style={{ fontSize: "clamp(2.6rem, 7vw, 6.2rem)" }}>
            Universe
          </span>
        </h1>

        <p
          data-fade
          style={{ ["--delay" as string]: "420ms" }}
          className="mt-10 max-w-[60ch] text-[17px] md:text-[19px] text-white/75 leading-[1.65]"
        >
          A finite speed of light, a finite age, and a horizon we can never
          see past. Everything you have ever seen is a delayed signal — and
          everyone everywhere sits at the centre of their own bubble.
        </p>

        <div
          data-fade
          style={{ ["--delay" as string]: "620ms" }}
          className="mt-16 font-mono text-[11px] tracking-[0.24em] uppercase text-white/40 flex items-center gap-3"
        >
          <span className="scroll-cue inline-block">↓</span> scroll to begin
        </div>
      </div>

      <div className="hidden lg:flex absolute right-10 bottom-10 flex-col items-end gap-1 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
        <div>c &nbsp;=&nbsp; 299 792 458 m/s</div>
        <div className="text-plasma/60">horizon · 13.8 Gyr · 46 Gly</div>
      </div>
    </section>
  );
}
