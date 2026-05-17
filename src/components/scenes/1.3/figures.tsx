import { useState, type ReactNode } from "react";

function FigurePanel({ idx, kicker, caption, children }: { idx: string; kicker: string; caption: ReactNode; children: ReactNode }) {
  return (
    <figure data-fade className="my-12">
      <div className="figure-stub rounded-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/70">
            <span className="inline-block w-2 h-2 rounded-full bg-plasma/70 shadow-[0_0_8px_var(--c-accent)] mr-2 align-middle"></span>
            figure {idx} · {kicker}
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60">interactive</div>
        </div>
        {children}
      </div>
      <figcaption className="mt-3 text-[14px] text-white/75 font-sans leading-[1.55]">
        <span className="text-plasma font-mono tracking-[0.14em]">Fig. {idx}</span>
        <span className="mx-2 text-white/35">/</span>
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── Nucleosynthesis Timeline ───────────────────────────────────────
   Scrub through the first 20 minutes of the universe and watch which
   nuclei exist at each stage. */
type Stage = { t: string; T: string; logSec: number; phase: string; products: string[]; note: string };
const STAGES: Stage[] = [
  { t: "1 µs",   T: "10¹³ K", logSec: -6,   phase: "Quark soup",       products: ["q", "q̄", "g"], note: "Quark-gluon plasma. Gluons bind nothing yet — too hot." },
  { t: "1 µs+",  T: "10¹³ K", logSec: -5.5, phase: "Hadronization",    products: ["p", "n"],       note: "Universe cools below 10¹³ K. Quarks confine: 2 ups + 1 down = proton, 1 up + 2 downs = neutron." },
  { t: "1 s",    T: "10¹⁰ K", logSec: 0,    phase: "Neutrino decouple", products: ["p", "n", "e⁻", "νₑ"], note: "Neutrinos stop interacting and begin streaming forever as the Cosmic Neutrino Background." },
  { t: "10 s",   T: "3×10⁹ K", logSec: 1,   phase: "Deuterium bottleneck", products: ["p", "n", "²D ↛"], note: "Protons + neutrons try to form deuterium but high-energy photons shatter it instantly." },
  { t: "3 min",  T: "10⁹ K", logSec: 2.25, phase: "Bottleneck opens",  products: ["²D", "p", "n"], note: "Below 10⁹ K, photons can't dissociate deuterium. The chain unlocks." },
  { t: "5 min",  T: "5×10⁸ K", logSec: 2.5, phase: "He-3 forms",        products: ["²D", "³He", "p", "n"], note: "Deuterium absorbs a proton to become helium-3 (2 protons + 1 neutron)." },
  { t: "10 min", T: "3×10⁸ K", logSec: 2.8, phase: "He-4 alpha",        products: ["⁴He", "p", "²D", "³He"], note: "He-3 captures a free neutron to become He-4 — incredibly stable. Almost all available neutrons get locked into alpha particles." },
  { t: "15 min", T: "10⁸ K", logSec: 3,    phase: "Freeze-out",        products: ["¹H ≈75%", "⁴He ≈25%", "²D · ³He · ⁷Li (trace)"], note: "Universe too cool and diffuse for further fusion. Composition locked: 75% H, 25% He, traces of lithium." },
];

export function NucleosynthesisTimelinePanel() {
  const [sel, setSel] = useState(4); // start at "bottleneck opens"
  const cur = STAGES[sel];
  return (
    <FigurePanel
      idx="1.3.1"
      kicker="Nucleosynthesis · Fifteen Minutes That Built the Recipe"
      caption="Click through the eight stages of primordial nucleosynthesis. Watch quarks condense into protons, hit the deuterium bottleneck, then race through a brief window to lock in the 75% H / 25% He cosmic recipe forever."
    >
      <ol className="flex gap-1 mb-4 flex-wrap">
        {STAGES.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSel(i)}
            className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${sel === i ? "is-active" : ""}`}
          >
            {s.t}
          </button>
        ))}
      </ol>

      <div
        className="grid md:grid-cols-[200px_1fr] gap-4 p-4 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.05)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-1">
            t = {cur.t}
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] text-white/55">
            T ≈ {cur.T}
          </div>
          <div className="font-serif font-medium mt-3 leading-tight" style={{ fontSize: "1.3rem", color: "var(--c-accent)" }}>
            {cur.phase}
          </div>
        </div>
        <div>
          <div className="flex gap-2 flex-wrap mb-3">
            {cur.products.map((p, i) => (
              <span
                key={i}
                className="font-mono text-[12px] tracking-[0.06em] px-3 py-1 rounded"
                style={{
                  background: "rgb(var(--c-accent-rgb) / 0.12)",
                  color: "var(--c-text-strong)",
                  border: "1px solid rgb(var(--c-accent-rgb) / 0.28)",
                }}
              >
                {p}
              </span>
            ))}
          </div>
          <div className="text-[13px] text-white/85 leading-[1.6] font-sans">
            {cur.note}
          </div>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Primordial Abundance · Pie chart with a slider ─────────────────
   Two outcomes side by side: the universe we got (75/25/trace) vs the
   universe we'd have if expansion had been slower (almost all iron).
   A slider mocks the "expansion rate" and the pie shifts. The locked
   recipe is the universe we live in. */
export function PrimordialAbundancePanel() {
  const [rate, setRate] = useState(1); // 0 = slow, 1 = actual, 2 = fast

  /* Compute composition. Default (rate=1) is the real universe. */
  let H = 75, He = 25, heavy = 0;
  if (rate < 1) {
    /* Slower expansion would fuse more H into heavier elements */
    const k = 1 - rate;
    H = 75 - 70 * k;
    He = 25 - 15 * k;
    heavy = 100 - H - He;
  } else if (rate > 1) {
    /* Faster expansion → freezes earlier, more H, less He */
    const k = (rate - 1);
    H = 75 + 18 * k;
    He = 25 - 18 * k;
    heavy = 0;
  }
  const total = H + He + heavy;
  const H_pct = (H / total) * 100;
  const He_pct = (He / total) * 100;
  const heavy_pct = (heavy / total) * 100;

  /* Polar arcs for the donut */
  const W = 360, H2 = 220, cx = W / 2, cy = H2 / 2 + 6, r = 84, ir = 56;
  function arcPath(startPct: number, endPct: number) {
    const a0 = (startPct / 100) * Math.PI * 2 - Math.PI / 2;
    const a1 = (endPct / 100) * Math.PI * 2 - Math.PI / 2;
    const large = endPct - startPct > 50 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi1 = cx + ir * Math.cos(a1), yi1 = cy + ir * Math.sin(a1);
    const xi0 = cx + ir * Math.cos(a0), yi0 = cy + ir * Math.sin(a0);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z`;
  }
  const rateLabel = rate < 0.6 ? "all-iron cosmos" : rate < 0.95 ? "metal-rich, no stars" : rate < 1.05 ? "our universe" : rate < 1.5 ? "almost pure H" : "no helium at all";
  const isReal = Math.abs(rate - 1) < 0.05;

  return (
    <FigurePanel
      idx="1.3.2"
      kicker="The 75/25 Recipe · A Cosmic Lucky Number"
      caption="The universe expanded at just the right rate. Slower, and almost all hydrogen would have fused into iron — stagnant, lifeless. Faster, and no helium would have formed at all. Slide to see why our specific expansion is one of the most consequential numbers in physics."
    >
      <div className="grid md:grid-cols-[1fr_1.4fr] gap-6 items-center">
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H2}`} className="block w-full h-auto">
            <path d={arcPath(0, H_pct)} fill="rgb(var(--c-accent-rgb))" opacity="0.85" />
            <path d={arcPath(H_pct, H_pct + He_pct)} fill="rgb(var(--c-solar-rgb))" opacity="0.85" />
            {heavy_pct > 0 && <path d={arcPath(H_pct + He_pct, 100)} fill="rgb(180 60 60)" opacity="0.85" />}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontFamily="var(--font-serif)" fontStyle="italic" fill="rgb(var(--c-text-rgb) / 0.9)">
              {isReal ? "real" : "what-if"}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">
              UNIVERSE
            </text>
          </svg>
        </div>
        <div className="space-y-3">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: isReal ? "var(--c-accent)" : "rgb(220 80 80)" }}>
            {rateLabel}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Hydrogen", pct: H_pct, color: "rgb(var(--c-accent-rgb))" },
              { label: "Helium", pct: He_pct, color: "rgb(var(--c-solar-rgb))" },
              { label: "Heavier", pct: heavy_pct, color: "rgb(180 60 60)" },
            ].map((row) => (
              <div key={row.label}>
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">{row.label}</div>
                <div className="font-serif font-medium" style={{ fontSize: "1.7rem", color: row.color }}>
                  {row.pct.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            expansion rate
          </label>
          <span className="font-mono text-[10px] text-plasma">
            {rate < 1 ? "slower" : rate > 1 ? "faster" : "actual"} × {rate.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0.4}
          max={1.8}
          step={0.02}
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>slow · all iron</span>
          <span>our universe</span>
          <span>fast · no He</span>
        </div>
      </div>
    </FigurePanel>
  );
}
