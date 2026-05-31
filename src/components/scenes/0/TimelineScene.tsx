import { useEffect, useMemo, useRef, useState } from "react";
import {
  EVENTS,
  TIMELINE_AGES,
  pctToAgo,
  type CosmicEvent,
  type TimelineAge,
} from "../../../data/chapter-0-events";
import { AGE_VISUALS } from "./AgeVisuals";

function TimelineRail({ pct, ageIdx }: { pct: number; ageIdx: number }) {
  const ago = pctToAgo(pct);
  return (
    <div className="hidden xl:block">
      <div className="timeline-rail">
        <div className="flex flex-col gap-3 select-none">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/35">
            % cosmic history
          </div>
          <div
            className="font-mono text-plasma"
            style={{ fontSize: "2.6rem", lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            {(pct * 100).toFixed(
              pct < 0.001 ? 6 : pct < 0.01 ? 4 : pct < 0.1 ? 2 : 1,
            )}
            <span className="text-white/35 text-[1rem] ml-1">%</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            {ago}
          </div>
          <div className="mt-4 w-px h-32 bg-white/[0.08] relative">
            <div
              className="absolute left-0 top-0 w-px bg-plasma"
              style={{
                height: `${pct * 100}%`,
                boxShadow: "0 0 6px rgba(34,211,238,0.7)",
                transition: "height 320ms linear",
              }}
            />
          </div>
          <div className="mt-3 font-mono text-[10px] tracking-[0.22em] uppercase text-white/55 max-w-[12ch]">
            {TIMELINE_AGES[ageIdx]?.name}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  ev,
  isBigBang,
  isYouAreHere,
}: {
  ev: CosmicEvent;
  isBigBang: boolean;
  isYouAreHere: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [ignited, setIgnited] = useState(false);

  useEffect(() => {
    if (!isBigBang) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIgnited(true);
      return;
    }
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setIgnited(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setIgnited(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isBigBang]);

  const cls = [
    "event-card pl-7 md:pl-10 border-l border-white/[0.06] hover:border-plasma/40 transition-colors duration-500 py-1",
    isBigBang ? "bigbang" : "",
    isBigBang && ignited ? "lit" : "",
    isYouAreHere ? "you-are-here" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Non-big-bang cards use the global fade-up observer.
  const fadeAttr: Record<string, true> | undefined = isBigBang
    ? undefined
    : { "data-fade": true };

  return (
    <article ref={ref} {...fadeAttr} className={cls}>
      <span className="tick" />
      {isBigBang && (
        <span className={`bigbang-flash ${ignited ? "fire" : ""}`} aria-hidden="true" />
      )}
      {isYouAreHere && <span className="you-are-here-label">you are here</span>}
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-plasma/85 mb-2">
        {ev.marker}
      </div>
      <h3
        className="font-serif font-medium text-white leading-[1.1] tracking-tight"
        style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.3rem)" }}
      >
        {ev.title}
      </h3>
      <p className="mt-3 text-[16px] text-white/72 leading-[1.65] max-w-[58ch]">
        {ev.body}
      </p>
    </article>
  );
}

function AgeDivider({
  age,
  n,
  ageIdx,
}: {
  age: TimelineAge;
  n: number;
  ageIdx: number;
}) {
  const Visual = AGE_VISUALS[ageIdx];
  return (
    <header data-fade className="age-band mb-10 mt-20 first:mt-2 relative">
      {Visual && (
        <div
          data-theme="dark"
          className="mobile-age-visual relative mb-6 ml-[-28px] md:ml-[-40px] rounded-2xl overflow-hidden"
          style={{
            width: 200,
            height: 200,
            background:
              "radial-gradient(circle at 50% 45%, #0b1230 0%, #050714 70%, #02030a 100%)",
            border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          }}
        >
          <Visual on />
        </div>
      )}
      <div className="flex items-center gap-4 mb-3">
        <div className="font-mono text-plasma/85 text-[12px] tracking-[0.22em]">
          {String(n).padStart(2, "0")}
        </div>
        <span
          className="block h-px flex-1"
          style={{ background: `linear-gradient(90deg, ${age.color}80, transparent)` }}
        />
      </div>
      <div className="flex items-baseline gap-5 flex-wrap">
        <h3
          className="font-serif font-medium text-white tracking-tight leading-[1]"
          style={{ fontSize: "clamp(2rem, 3.6vw, 3rem)" }}
        >
          {age.name}
        </h3>
        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/45">
          {age.range}
        </div>
      </div>
    </header>
  );
}

export default function TimelineScene() {
  const [ageIdx, setAgeIdx] = useState(0);
  const [pct, setPct] = useState(0);

  const ageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const eventsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onScroll() {
      const c = window.innerHeight * 0.4;
      let cur = 0;
      for (let i = 0; i < TIMELINE_AGES.length; i++) {
        const el = ageRefs.current[i];
        if (el && el.getBoundingClientRect().top < c) cur = i;
      }
      setAgeIdx(cur);

      const block = eventsRef.current;
      if (block) {
        const r = block.getBoundingClientRect();
        const total = r.height - window.innerHeight * 0.4;
        const passed = -r.top + window.innerHeight * 0.4;
        const k = Math.max(0, Math.min(1, passed / Math.max(total, 1)));
        const samples = EVENTS.map((e) => e.pct);
        const fi = k * (samples.length - 1);
        const i0 = Math.floor(fi);
        const i1 = Math.min(samples.length - 1, i0 + 1);
        const frac = fi - i0;
        const p = samples[i0] + (samples[i1] - samples[i0]) * frac;
        setPct(p);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const grouped = useMemo(() => {
    const g: CosmicEvent[][] = TIMELINE_AGES.map(() => []);
    EVENTS.forEach((ev) => g[ev.age].push(ev));
    return g;
  }, []);

  return (
    <section className="relative" data-screen-label="03 Timeline">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <header className="pt-24 md:pt-32 mb-16 max-w-[1100px]">
          <div
            data-fade
            className="font-mono text-[11px] tracking-[0.28em] uppercase text-plasma/80 mb-3 flex items-center gap-3"
          >
            <span className="block w-6 h-px bg-plasma/50" /> Section Two · Timelines
          </div>
          <h2
            data-fade
            style={{ ["--delay" as string]: "80ms" }}
            className="section-title"
          >
            <span className="section-number">2.</span>
            <span className="section-title-text">Forty-nine turns of the river</span>
          </h2>
          <p
            data-fade
            style={{ ["--delay" as string]: "160ms" }}
            className="mt-5 max-w-[60ch] text-white/65 text-[16px]"
          >
            From the singularity to the screen you are reading this on — forty-nine events,
            grouped into seven ages, on a single 13.8-billion-year scroll.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[120px_minmax(0,1fr)_minmax(0,400px)] gap-10 xl:gap-12">
          <div>
            <div className="sticky top-0 h-screen flex items-center">
              <TimelineRail pct={pct} ageIdx={ageIdx} />
            </div>
          </div>

          <div ref={eventsRef} className="max-w-[68ch]">
            {TIMELINE_AGES.map((age, ai) => (
              <div
                key={age.id}
                ref={(el) => {
                  ageRefs.current[ai] = el;
                }}
              >
                <AgeDivider age={age} n={ai + 1} ageIdx={ai} />
                <div className="flex flex-col gap-12">
                  {grouped[ai].map((ev) => {
                    const globalIdx = EVENTS.indexOf(ev);
                    return (
                      <EventCard
                        key={ev.title}
                        ev={ev}
                        isBigBang={globalIdx === 0}
                        isYouAreHere={globalIdx === EVENTS.length - 1}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="relative hidden xl:block">
            <div className="sticky top-0 h-screen flex items-center">
              {/* Cosmic visuals always render against deep space, even
                  when the page is in day mode — data-theme="dark" forces
                  dark tokens for this subtree so the colors stay true. */}
              <div
                data-theme="dark"
                className="relative w-full aspect-square max-w-[400px] rounded-3xl overflow-hidden"
                style={{
                  background:
                    "radial-gradient(circle at 50% 45%, #0b1230 0%, #050714 70%, #02030a 100%)",
                  border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
                  boxShadow:
                    "0 30px 80px -30px rgb(var(--c-accent-rgb) / 0.18), inset 0 0 60px rgb(var(--c-accent-rgb) / 0.04)",
                }}
              >
                {AGE_VISUALS.map((V, i) => (
                  <V key={i} on={i === ageIdx} />
                ))}
                <div className="absolute left-0 bottom-0 right-0 p-4 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase">
                  <span className="text-plasma/80">{TIMELINE_AGES[ageIdx].name}</span>
                  <span className="text-white/35">{TIMELINE_AGES[ageIdx].range}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
