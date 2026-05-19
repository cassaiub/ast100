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
        if (numRef.current) numRef.current.style.transform = `translate(-50%, calc(-50% + ${y * 0.25}px))`;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10">
      <div ref={numRef} className="ghost-num absolute left-1/2 top-1/2 leading-none" style={{ fontSize: "clamp(16rem, 34vw, 32rem)", transform: "translate(-50%, -50%)" }} aria-hidden="true">1.3</div>
      <div className="relative max-w-[1100px] mx-auto w-full">
        <div data-fade style={{ ["--delay" as string]: "120ms" }} className="font-mono text-[11px] tracking-[0.32em] uppercase text-plasma/80 mb-7 flex items-center gap-3">
          <span className="block w-9 h-px bg-plasma/50" />
          Subsection 1.3 · Chapter 1
        </div>
        <h1 data-fade style={{ ["--delay" as string]: "220ms" }} className="title-gradient font-serif font-medium tracking-tight leading-[1.02]">
          <span className="block" style={{ fontSize: "clamp(2.6rem, 7vw, 6.2rem)" }}>
            Synthesis of <span className="italic font-light text-white/70">Elements</span>
          </span>
        </h1>
        <p data-fade style={{ ["--delay" as string]: "420ms" }} className="mt-10 max-w-[60ch] text-[17px] md:text-[19px] text-white/75 leading-[1.65]">
          A fifteen-minute window of cosmic alchemy. The Universe forged
          deuterium, helium, and traces of lithium — then expanded so
          quickly that the recipe stayed forever: 75% hydrogen, 25% helium.
        </p>
        <div data-fade style={{ ["--delay" as string]: "620ms" }} className="mt-16 font-mono text-[11px] tracking-[0.24em] uppercase text-white/40 flex items-center gap-3">
          <span className="scroll-cue inline-block">↓</span> scroll to begin
        </div>
      </div>
      <div className="hidden lg:flex absolute right-10 bottom-10 flex-col items-end gap-1 font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
        <div>t = 1 µs &nbsp;◇&nbsp; 15 min</div>
        <div className="text-plasma/60">{"deuterium bottleneck · $10^{9}$ K"}</div>
      </div>
    </section>
  );
}
