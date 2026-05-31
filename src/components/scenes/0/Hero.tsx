import { useEffect, useRef } from "react";
import LiveTimeCounter from "./LiveTimeCounter";

/* Chapter 0 hero — ghost "0" + parallax + emerging river thread + live time.
   The `tease` paragraph below the H1 is the single source-of-truth lesson
   description, passed in from the page and mirrored on the chapter
   overview (`/chapter/0`) card. See `course-nav.ts` `overviewTease`. */
export default function Hero({ tease }: { tease: string }) {
  const numRef = useRef<HTMLDivElement | null>(null);
  const threadRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let length = 0;
    if (threadRef.current) {
      length = threadRef.current.getTotalLength();
      threadRef.current.style.strokeDasharray = String(length);
      threadRef.current.style.strokeDashoffset = String(length);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (numRef.current && !reduced) {
          numRef.current.style.transform = `translate(-50%, calc(-50% + ${y * 0.28}px))`;
        }
        if (threadRef.current && length) {
          const k = Math.max(0, Math.min(1, y / (vh * 1.4)));
          threadRef.current.style.strokeDashoffset = String(length * (1 - k));
        }
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-10"
      data-screen-label="01 Hero"
    >
      {/* Live time counter — top-right corner of hero (desktop only) */}
      <div className="absolute right-6 md:right-10 top-20 md:top-24 z-10 hidden md:block">
        <LiveTimeCounter />
      </div>

      {/* River thread — emerges from top of hero, falls toward Scene 2 */}
      <svg
        className="thread-svg pointer-events-none absolute right-[18%] md:right-[14%] top-0"
        style={{ width: "min(360px, 36vw)", height: "120vh" }}
        viewBox="0 0 360 1200"
        preserveAspectRatio="xMidYMin meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-thread" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.0" />
            <stop offset="14%" stopColor="#22d3ee" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          ref={threadRef}
          d="M 180 0 C 200 90, 130 200, 200 320 C 270 440, 110 540, 200 680 C 290 820, 130 900, 220 1020 C 260 1080, 200 1140, 200 1200"
          stroke="url(#hero-thread)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.45))" }}
        />
        <circle
          cx="180"
          cy="0"
          r="6"
          fill="#22d3ee"
          opacity="0.85"
          style={{ filter: "drop-shadow(0 0 10px #22d3ee)" }}
        />
      </svg>

      {/* Ghost chapter number */}
      <div
        ref={numRef}
        className="ghost-num absolute left-1/2 top-1/2 leading-none"
        style={{
          fontSize: "clamp(20rem, 40vw, 36rem)",
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden="true"
      >
        0
      </div>

      <div className="relative max-w-[1100px] mx-auto w-full">
        <div
          data-fade
          style={{ ["--delay" as string]: "120ms" }}
          className="font-mono text-[11px] tracking-[0.32em] uppercase text-plasma/80 mb-7 flex items-center gap-3"
        >
          <span className="block w-9 h-px bg-plasma/50" />
          Chapter 0 · The Map of the Course
        </div>

        <h1
          data-fade
          style={{ ["--delay" as string]: "220ms" }}
          className="title-gradient font-serif font-medium tracking-tight leading-[1.02]"
        >
          <span className="block" style={{ fontSize: "clamp(2.6rem, 7.6vw, 6rem)" }}>
            Seven Ages
          </span>
          <span
            className="block italic font-light text-white/70"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 5.4rem)" }}
          >
            of the Universe
          </span>
        </h1>

        <p
          data-fade
          style={{ ["--delay" as string]: "420ms" }}
          className="mt-10 max-w-[64ch] text-[1.05em] leading-[1.74] text-white/70"
        >
          {tease}
        </p>

        <div
          data-fade
          style={{ ["--delay" as string]: "620ms" }}
          className="mt-14 flex flex-wrap items-center gap-6 font-mono text-[10px] tracking-[0.28em] uppercase text-white/45"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-plasma shadow-[0_0_10px_#22d3ee]" />
            7 ages
          </span>
          <span className="text-white/15">·</span>
          <span>49 events</span>
          <span className="text-white/15">·</span>
          <span>13.8 Gyr</span>
          <span className="text-white/15">·</span>
          <span className="text-solar/80">Brahmaputra metaphor</span>
        </div>
      </div>

      <div className="absolute left-1/2 bottom-8 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.28em] uppercase text-white/45">
        <span className="scroll-cue inline-block">↓</span>
        scroll to follow the river
      </div>

      <div className="hidden lg:flex absolute right-10 bottom-10 flex-col items-end gap-1 font-mono text-[10px] tracking-[0.2em] uppercase text-white/35">
        <div>Source · Tibet &nbsp;◇&nbsp; Mouth · Bay of Bengal</div>
        <div className="text-plasma/55">
          Particle → Galactic → Stellar → Planetary → Chemical → Biological → Cultural
        </div>
      </div>
    </section>
  );
}
