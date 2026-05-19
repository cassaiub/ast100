import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { mulberry32 } from "../../../data/chapter-0-events";

/* ── Shared figure frame ─────────────────────────────────────────────── */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure data-fade className="my-12">
      <div className="figure-stub rounded-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/70">
            <span className="inline-block w-2 h-2 rounded-full bg-plasma/70 shadow-[0_0_8px_var(--c-accent)] mr-2 align-middle"></span>
            figure {idx} · {kicker}
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60">
            interactive
          </div>
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

/* ── Cosmic Tug-of-War ────────────────────────────────────────────────
   Slider scrubs the balance between cosmic expansion (Hubble's H₀)
   and local gravity. At gravity-dominant the matter collapses to
   a central glowing structure. At expansion-dominant the same matter
   scatters across the field. Equilibrium briefly stabilises in
   between — the narrow window in which structure can form. */
export function TugOfWarPanel() {
  /* balance: 0 = pure gravity (collapse), 0.5 = equilibrium, 1 = pure expansion */
  const [balance, setBalance] = useState(0.42);
  const W = 720;
  const H = 280;
  const N = 18;

  /* Pre-generated random offsets per particle so each one has a
     distinct equilibrium position rather than a perfect line. */
  const offsets = useMemo(() => {
    const rng = mulberry32(42);
    return Array.from({ length: N }, (_, i) => ({
      i,
      jitter: (rng() - 0.5) * 32,
      verticalJitter: (rng() - 0.5) * 26,
      radius: 2.6 + rng() * 1.4,
    }));
  }, []);

  /* Map balance -> per-particle position. Center is at (W/2, H/2).
     At balance=0 we collapse all to center with tight glow. At 0.5
     particles sit at evenly-spaced equilibrium. At 1 they scatter
     past edges (we clip with overflow:hidden visually). */
  const cx = W / 2;
  const cy = H / 2;
  const spread = (balance - 0.5) * 2; /* -1 (collapse) to +1 (scatter) */

  const dots = offsets.map(({ i, jitter, verticalJitter, radius }) => {
    const equilibX = (i + 0.5) * (W / N);
    const px = cx + (equilibX - cx) * (1 + spread * 1.8) + jitter * (1 - Math.abs(spread));
    const py = cy + verticalJitter * (1 - Math.abs(spread));
    /* When deeply collapsed, force everything to center */
    const collapseFactor = Math.max(0, -spread);
    const finalX = px * (1 - collapseFactor) + cx * collapseFactor;
    const finalY = py * (1 - collapseFactor) + cy * collapseFactor;
    return { x: finalX, y: finalY, r: radius };
  });

  const collapseGlowR = Math.max(0, -spread) * 70;
  const scatterFade = Math.max(0, spread);
  const label =
    balance < 0.2
      ? "gravity wins — collapse"
      : balance < 0.4
        ? "gravity dominates"
        : balance < 0.6
          ? "equilibrium — structures form"
          : balance < 0.8
            ? "expansion dominates"
            : "expansion wins — scatter";

  return (
    <FigurePanel
      idx="0.2.1"
      kicker="Cosmic Tug-of-War · Expansion vs Gravity"
      caption="The same fourteen-billion-year story, told as a single dial. Slide too far toward gravity and structure collapses; slide too far toward expansion and matter scatters before it can clump. The interesting middle is where galaxies, stars, and worlds live."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Faint rope / cosmic stretch line */}
          <line
            x1={20}
            y1={H / 2}
            x2={W - 20}
            y2={H / 2}
            stroke="rgb(var(--c-text-rgb) / 0.08)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Collapse glow */}
          {collapseGlowR > 1 && (
            <>
              <circle
                cx={cx}
                cy={cy}
                r={collapseGlowR}
                fill="rgb(var(--c-accent-rgb) / 0.16)"
              />
              <circle
                cx={cx}
                cy={cy}
                r={collapseGlowR * 0.5}
                fill="rgb(var(--c-accent-rgb) / 0.5)"
              />
            </>
          )}

          {dots.map(({ x, y, r }, i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="rgb(var(--c-accent-rgb) / 0.85)"
              opacity={1 - scatterFade * 0.55}
              style={{ transition: "cx 320ms var(--ease), cy 320ms var(--ease), opacity 320ms var(--ease)" }}
            />
          ))}

          {/* Arrows */}
          <g className="font-mono">
            <text
              x={28}
              y={32}
              fontSize="9"
              letterSpacing="2"
              fill="rgb(var(--c-accent-rgb) / 0.7)"
            >
              ← GRAVITY · Ω
            </text>
            <text
              x={W - 28}
              y={32}
              textAnchor="end"
              fontSize="9"
              letterSpacing="2"
              fill="rgb(var(--c-accent-rgb) / 0.7)"
            >
              EXPANSION · H₀ →
            </text>
          </g>
        </svg>

        {/* Live status */}
        <div className="absolute left-0 right-0 bottom-2 flex items-center justify-center pointer-events-none">
          <div
            className="font-mono text-[10px] tracking-[0.22em] uppercase"
            style={{ color: "rgb(var(--c-accent-rgb) / 0.85)" }}
          >
            {label}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            balance
          </label>
          <span className="font-mono text-[10px] text-plasma/85">
            Ω = {(1 - balance).toFixed(2)} · H₀ = {balance.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={balance}
          onChange={(e) => setBalance(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>collapse</span>
          <span>structures</span>
          <span>big rip</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Entropy Island ───────────────────────────────────────────────────
   A bounded "Universe" of randomly distributed particles. Inside a
   circular island, particles organise into a rotating constellation
   over time; outside, particles randomise further. Total entropy
   rises, even as the island looks orderly — the central point. */
export function EntropyIslandPanel() {
  const [t, setT] = useState(0); // 0 → 1
  const [playing, setPlaying] = useState(false);
  const W = 720;
  const H = 320;

  /* Pre-generate two sets of points: initial (chaotic) and final.
     Inside the island, "final" positions form a slowly-rotating
     constellation; outside, "final" positions are randomised again
     but with higher dispersion. We linearly interpolate. */
  const { outside, island, islandFinal } = useMemo(() => {
    const rng = mulberry32(7);
    const islandR = 90;
    const cx = W / 2;
    const cy = H / 2;
    /* Outside particles: random across the field, but never inside
       the island circle. */
    const outside: { x0: number; y0: number; x1: number; y1: number }[] = [];
    let attempts = 0;
    while (outside.length < 90 && attempts < 5000) {
      attempts++;
      const x = rng() * W;
      const y = rng() * H;
      const d = Math.hypot(x - cx, y - cy);
      if (d < islandR + 6) continue;
      const x1 = x + (rng() - 0.5) * 90;
      const y1 = y + (rng() - 0.5) * 60;
      outside.push({ x0: x, y0: y, x1, y1 });
    }
    /* Island particles: at t=0 chaotic inside the circle, at t=1
       arranged on a 3-arm spiral. */
    const island: { x0: number; y0: number }[] = [];
    const islandFinal: { x: number; y: number }[] = [];
    const ISLAND_N = 36;
    for (let i = 0; i < ISLAND_N; i++) {
      const r0 = Math.sqrt(rng()) * (islandR - 8);
      const a0 = rng() * Math.PI * 2;
      island.push({ x0: cx + Math.cos(a0) * r0, y0: cy + Math.sin(a0) * r0 });
      /* 3-arm spiral pattern */
      const arm = i % 3;
      const t01 = (i / ISLAND_N) * 3 - arm;
      const ang = arm * ((Math.PI * 2) / 3) + t01 * 2.4;
      const rad = 12 + t01 * (islandR - 18);
      islandFinal.push({
        x: cx + Math.cos(ang) * rad,
        y: cy + Math.sin(ang) * rad,
      });
    }
    return { outside, island, islandFinal };
  }, []);

  /* Animation tick when playing */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const next = Math.min(1, prev + dt * 0.35);
        if (next >= 1) setPlaying(false);
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

  return (
    <FigurePanel
      idx="0.2.2"
      kicker="Entropy Island · Local Order, Global Chaos"
      caption="The Universe must grow more disordered overall. But local pockets — galaxies, stars, organisms — can become more ordered by exporting their disorder elsewhere. The island sharpens; the surrounding field scatters."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Outer 'Universe' border */}
          <rect
            x={0.5}
            y={0.5}
            width={W - 1}
            height={H - 1}
            fill="none"
            stroke="rgb(var(--c-text-rgb) / 0.08)"
            strokeWidth="1"
          />

          {/* Island region */}
          <circle
            cx={W / 2}
            cy={H / 2}
            r={94}
            fill="rgb(var(--c-accent-rgb) / 0.05)"
            stroke="rgb(var(--c-accent-rgb) / 0.3)"
            strokeWidth="0.8"
            strokeDasharray="3 4"
          />

          {/* Outside particles — drift apart over time */}
          {outside.map((p, i) => {
            const x = lerp(p.x0, p.x1, t);
            const y = lerp(p.y0, p.y1, t);
            return (
              <circle
                key={`o-${i}`}
                cx={x}
                cy={y}
                r={1.6}
                fill="rgb(var(--c-text-rgb) / 0.32)"
              />
            );
          })}

          {/* Island particles — arrange into spiral */}
          {island.map((p, i) => {
            const fx = islandFinal[i].x;
            const fy = islandFinal[i].y;
            const x = lerp(p.x0, fx, t);
            const y = lerp(p.y0, fy, t);
            return (
              <circle
                key={`i-${i}`}
                cx={x}
                cy={y}
                r={2.4 + t * 0.5}
                fill="rgb(var(--c-accent-rgb) / 0.95)"
              />
            );
          })}

          {/* Labels */}
          <g className="font-mono">
            <text
              x={W / 2}
              y={H / 2 + 130}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="3"
              fill="rgb(var(--c-accent-rgb) / 0.7)"
            >
              ISLAND · LOCAL ORDER
            </text>
            <text
              x={28}
              y={28}
              fontSize="9"
              letterSpacing="3"
              fill="rgb(var(--c-text-rgb) / 0.45)"
            >
              UNIVERSE · GLOBAL ENTROPY
            </text>
          </g>
        </svg>

        {/* Live entropy meters */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1 pointer-events-none">
          <div
            className="font-mono text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "rgb(var(--c-text-rgb) / 0.5)" }}
          >
            S<sub>global</sub>{" "}
            <span style={{ color: "rgb(var(--c-accent-rgb) / 0.9)" }}>
              ↑ {(t * 100).toFixed(0)}%
            </span>
          </div>
          <div
            className="font-mono text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "rgb(var(--c-text-rgb) / 0.5)" }}
          >
            S<sub>island</sub>{" "}
            <span style={{ color: "rgb(var(--c-accent-rgb) / 0.9)" }}>
              ↓ {((1 - t) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (t >= 1) {
              setT(0);
              setPlaying(true);
            } else {
              setPlaying((p) => !p);
            }
          }}
          className="pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          {t >= 1 ? "▶ replay" : playing ? "■ pause" : "▶ play"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => {
            setPlaying(false);
            setT(parseFloat(e.target.value));
          }}
          className="cosmic-slider flex-1"
        />
        <span className="font-mono text-[10px] text-plasma/85 w-12 text-right">
          t = {t.toFixed(2)}
        </span>
      </div>
    </FigurePanel>
  );
}

/* ── Energy Rate Density ──────────────────────────────────────────────
   A complexity ranking: how much energy flows per gram per second
   through each kind of system. The surprise is that stars — which
   we think of as the most energetic things in the Universe — sit
   at the bottom, and human society sits at the top. */
const ERD_ROWS: { name: string; value: number; note: string }[] = [
  { name: "Sun (Sol)", value: 2, note: "Average energy flow through a star's body." },
  { name: "Galaxy", value: 0.5, note: "Whole-galaxy energy rate density." },
  { name: "Earth's biosphere", value: 900, note: "All life on Earth, averaged." },
  { name: "Mature plant", value: 5_000, note: "Photosynthesis + metabolic flow." },
  { name: "Mammal", value: 20_000, note: "A warm-blooded animal at rest." },
  { name: "Human brain", value: 150_000, note: "≈20 W in 1.4 kg — neurons are dense." },
  {
    name: "Modern society",
    value: 500_000,
    note: "Global civilisation: power-per-mass of the technosphere.",
  },
];

export function EnergyRateDensityPanel() {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...ERD_ROWS.map((r) => r.value));
  /* Use log scale for bar widths because values span 6 orders of magnitude. */
  const logMax = Math.log10(max + 1);
  const widthOf = (v: number) =>
    Math.max(0.04, Math.log10(v + 1) / logMax) * 100;

  return (
    <FigurePanel
      idx="0.2.3"
      kicker="Energy Rate Density · the Complexity Ladder"
      caption="Eric Chaisson's metric for measuring complexity: erg per gram per second. Stars are huge but spread thin — only a few erg/g/s pass through them. A human society burns half a million erg/g/s — more concentrated energy flow than anything else we know."
    >
      <ol className="flex flex-col gap-2 my-2">
        {ERD_ROWS.map((row, i) => {
          const isHover = hover === i;
          return (
            <li
              key={row.name}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="grid grid-cols-[160px_1fr_120px] gap-3 items-center cursor-default"
            >
              <div
                className="font-serif text-[14px] leading-tight"
                style={{
                  color: isHover ? "var(--c-accent)" : "var(--c-text-strong)",
                  transition: "color 200ms var(--ease)",
                }}
              >
                {row.name}
              </div>
              <div className="relative h-6 rounded-full overflow-hidden" style={{ background: "rgb(var(--c-text-rgb) / 0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${widthOf(row.value)}%`,
                    background: isHover
                      ? "linear-gradient(90deg, rgb(var(--c-accent-rgb) / 0.85), rgb(var(--c-accent-rgb) / 0.55))"
                      : "linear-gradient(90deg, rgb(var(--c-accent-rgb) / 0.55), rgb(var(--c-accent-rgb) / 0.3))",
                    boxShadow: isHover ? "0 0 18px rgb(var(--c-accent-rgb) / 0.4)" : "none",
                    transition: "width 600ms var(--ease), background 200ms var(--ease), box-shadow 200ms var(--ease)",
                  }}
                />
              </div>
              <div
                className="font-mono text-[11px] tracking-[0.1em] text-right"
                style={{
                  color: isHover
                    ? "var(--c-accent)"
                    : "rgb(var(--c-text-rgb) / 0.7)",
                  transition: "color 200ms var(--ease)",
                }}
              >
                {row.value.toLocaleString()}{" "}
                <span className="text-white/40">erg/g/s</span>
              </div>
            </li>
          );
        })}
      </ol>
      <div
        className="mt-4 text-[13px] text-white/75 leading-[1.6] max-w-[68ch] min-h-[3em]"
      >
        {hover !== null ? (
          <>
            <span className="text-plasma font-mono tracking-[0.14em]">
              {ERD_ROWS[hover].name.toUpperCase()}
            </span>
            <span className="mx-2 text-white/35">/</span>
            {ERD_ROWS[hover].note}
          </>
        ) : (
          <span className="text-white/55 italic">
            Hover a row to read what each ladder rung means.
          </span>
        )}
      </div>
    </FigurePanel>
  );
}

/* ── Inflation Visualizer ────────────────────────────────────────────
   The first 10⁻³² seconds: the Universe grew by a factor of ≥10²⁶ in
   an instant of exponential expansion.  The user scrubs time across
   the inflation epoch; the Universe-radius readout flips from
   sub-Planck to grapefruit-scale.  A logarithmic y-axis shows the
   blade of the exponential curve. */
export function InflationVisualizerPanel() {
  /* log10(t) range: −43 (Planck) → −32 (inflation ends) */
  const [logT, setLogT] = useState(-36);
  const W = 720;
  const H = 320;
  const PAD_X = 60;
  const PAD_Y_TOP = 40;
  const PAD_Y_BOT = 220;

  /* Approximate scale factor a(t) across inflation. We model the
     pre-inflation epoch as nearly constant (radiation-era), then an
     exponential jump during inflation (e-folds N(t) = (t - t_start)/τ),
     then a smooth handoff. Numbers are pedagogical, not precise.
     End-state target: a multiplied by ~10²⁶ during inflation. */
  function aFor(lt: number): number {
    const tStart = -36;
    const tEnd = -32;
    if (lt <= tStart) return 1; // pre-inflation reference
    if (lt >= tEnd) return 1e26;
    const k = (lt - tStart) / (tEnd - tStart);
    return Math.pow(10, k * 26);
  }
  const a = aFor(logT);
  const logA = Math.log10(a);

  /* Curve points on a log y-axis */
  const curvePts: string[] = [];
  const N = 200;
  const lMin = -43;
  const lMax = -30;
  for (let i = 0; i <= N; i++) {
    const t = lMin + (i / N) * (lMax - lMin);
    const v = Math.log10(aFor(t));
    const x = PAD_X + ((t - lMin) / (lMax - lMin)) * (W - 2 * PAD_X);
    /* y on log scale 0 → 28 e-folds */
    const y = PAD_Y_BOT - (v / 28) * (PAD_Y_BOT - PAD_Y_TOP);
    curvePts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const cursorX = PAD_X + ((logT - lMin) / (lMax - lMin)) * (W - 2 * PAD_X);
  const cursorY = PAD_Y_BOT - (logA / 28) * (PAD_Y_BOT - PAD_Y_TOP);

  /* Universe-radius readout. Reference: at lMin, observable patch ~10⁻³⁵ m
     (Planck length). Multiplied by a(t). */
  const radius = 1e-35 * a;
  function fmtRadius(r: number): string {
    if (r < 1e-30) return `${r.toExponential(2)} m (sub-Planck)`;
    if (r < 1e-15) return `${r.toExponential(2)} m (sub-atomic)`;
    if (r < 1e-9) return `${r.toExponential(2)} m (atomic-scale)`;
    if (r < 1) return `${(r * 100).toFixed(2)} cm`;
    if (r < 1000) return `${r.toFixed(1)} m`;
    return `${(r / 1000).toFixed(1)} km`;
  }
  function fmtTime(lt: number): string {
    return `10^${lt.toFixed(0)} s`;
  }

  /* Scale-relative size of the Universe circle (visual) — also log-y */
  const visRadius = Math.min(80, Math.max(4, 4 + (logA / 28) * 76));

  return (
    <FigurePanel
      idx="0.2.4"
      kicker="Inflation · 10²⁶ × in 10⁻³² Seconds"
      caption="Inflation is the single most dramatic event in cosmic history. In a sliver of a sliver of a second, the Universe expanded by a factor greater than a hundred-trillion-trillion. Scrub the slider to watch space itself unspool."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Axes frame */}
          <line x1={PAD_X} y1={PAD_Y_TOP} x2={PAD_X} y2={PAD_Y_BOT} stroke="rgb(var(--c-text-rgb) / 0.18)" strokeWidth="0.8" />
          <line x1={PAD_X} y1={PAD_Y_BOT} x2={W - PAD_X} y2={PAD_Y_BOT} stroke="rgb(var(--c-text-rgb) / 0.18)" strokeWidth="0.8" />
          {/* Y ticks at e-folds 0, 10, 20, 26 */}
          {[0, 10, 20, 26].map((e) => {
            const y = PAD_Y_BOT - (e / 28) * (PAD_Y_BOT - PAD_Y_TOP);
            return (
              <g key={e}>
                <line x1={PAD_X - 4} y1={y} x2={PAD_X} y2={y} stroke="rgb(var(--c-text-rgb) / 0.3)" />
                <text x={PAD_X - 8} y={y + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
                  10^{e}
                </text>
              </g>
            );
          })}
          <text x={20} y={PAD_Y_TOP - 12} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">
            SCALE · a(t)
          </text>
          {/* X ticks at log10 t = -42, -38, -34, -30 */}
          {[-42, -38, -34, -30].map((lt) => {
            const x = PAD_X + ((lt - lMin) / (lMax - lMin)) * (W - 2 * PAD_X);
            return (
              <g key={lt}>
                <line x1={x} y1={PAD_Y_BOT} x2={x} y2={PAD_Y_BOT + 4} stroke="rgb(var(--c-text-rgb) / 0.3)" />
                <text x={x} y={PAD_Y_BOT + 16} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
                  10^{lt} s
                </text>
              </g>
            );
          })}
          <text x={W - PAD_X} y={PAD_Y_BOT + 32} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">
            TIME →
          </text>

          {/* Inflation epoch shading */}
          {(() => {
            const x1 = PAD_X + ((-36 - lMin) / (lMax - lMin)) * (W - 2 * PAD_X);
            const x2 = PAD_X + ((-32 - lMin) / (lMax - lMin)) * (W - 2 * PAD_X);
            return (
              <g>
                <rect x={x1} y={PAD_Y_TOP} width={x2 - x1} height={PAD_Y_BOT - PAD_Y_TOP} fill="rgb(var(--c-accent-rgb) / 0.06)" />
                <text x={(x1 + x2) / 2} y={PAD_Y_TOP - 4} textAnchor="middle" fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb) / 0.8)">
                  INFLATION
                </text>
              </g>
            );
          })()}

          {/* Exponential curve */}
          <path d={curvePts.join(" ")} stroke="rgb(var(--c-accent-rgb))" strokeWidth="2.2" fill="none" style={{ filter: "drop-shadow(0 0 5px rgb(var(--c-accent-rgb) / 0.5))" }} />

          {/* Cursor */}
          <line x1={cursorX} x2={cursorX} y1={PAD_Y_TOP} y2={PAD_Y_BOT} stroke="rgb(var(--c-text-rgb) / 0.95)" strokeWidth="1.2" />
          <circle cx={cursorX} cy={cursorY} r="5" fill="rgb(var(--c-text-rgb))" />

          {/* Universe-size visual on the right */}
          <g transform={`translate(${W - 120}, ${PAD_Y_TOP + 100})`}>
            <circle cx={0} cy={0} r={visRadius} fill="rgb(var(--c-accent-rgb) / 0.25)" stroke="rgb(var(--c-accent-rgb))" strokeWidth="1.4" />
            <circle cx={0} cy={0} r="2" fill="rgb(var(--c-accent-rgb))" />
            <text x={0} y={visRadius + 16} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb) / 0.8)">
              OBSERVABLE PATCH
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="p-3 rounded-md" style={{ background: "rgb(var(--c-accent-rgb) / 0.05)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)" }}>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">time</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: "1.2rem", color: "var(--c-accent)" }}>
            {fmtTime(logT)}
          </div>
        </div>
        <div className="p-3 rounded-md" style={{ background: "rgb(var(--c-accent-rgb) / 0.05)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)" }}>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">scale factor a</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: "1.2rem", color: "var(--c-accent)" }}>
            ×10^{logA.toFixed(1)}
          </div>
        </div>
        <div className="p-3 rounded-md" style={{ background: "rgb(var(--c-accent-rgb) / 0.05)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)" }}>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">patch radius</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: "1.05rem", color: "var(--c-accent)" }}>
            {fmtRadius(radius)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            scrub log₁₀(t)
          </label>
          <span className="font-mono text-[10px] text-plasma">
            t = {fmtTime(logT)}
          </span>
        </div>
        <input
          type="range"
          min={-43}
          max={-30}
          step={0.1}
          value={logT}
          onChange={(e) => setLogT(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>Planck epoch</span>
          <span>inflation begins</span>
          <span>inflation ends</span>
        </div>
      </div>
    </FigurePanel>
  );
}
