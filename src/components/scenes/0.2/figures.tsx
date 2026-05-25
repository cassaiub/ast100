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
    <figure data-fade className="figure-stub my-12 rounded-md p-4 md:p-6">
      <div className="figure-body">{children}</div>
      <figcaption>
        <span className="figure-tag">Fig. {idx}</span>
        <span className="figure-title"> — {kicker}.</span>{" "}
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
      idx="0.2.a"
      kicker="Cosmic Tug-of-War · Expansion vs Gravity"
      caption="The same fourteen-billion-year story, told as a single dial. Slide too far toward gravity and structure collapses; slide too far toward expansion and matter scatters before it can clump. The interesting middle is where galaxies, stars, and worlds live."
    >
      <div className="fig-viz relative w-full overflow-hidden rounded-md">
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
      idx="0.2.b"
      kicker="Entropy Island · Local Order, Global Chaos"
      caption="The Universe must grow more disordered overall. But local pockets — galaxies, stars, organisms — can become more ordered by exporting their disorder elsewhere. The island sharpens; the surrounding field scatters."
    >
      <div className="fig-viz relative w-full overflow-hidden rounded-md">
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
          data-shortcut=" "
          aria-label={t >= 1 ? "Replay" : playing ? "Pause" : "Play"}
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
   Chaisson's complexity metric Φₘ: free energy flowing through every
   kilogram of a system, every second. Plotted against cosmic time it
   forms a steeply rising curve from the first proto-galaxies to a
   modern jet engine — nine orders of magnitude in 13.8 billion years. */
const ERD_POINTS: {
  name: string;
  t: number;
  erd: number;
  note: string;
}[] = [
  {
    name: "First galaxies",
    t: 0.5,
    erd: 1e-5,
    note: "Primordial hydrogen-helium clumps assembling — feeble luminous matter at the cosmic dawn.",
  },
  {
    name: "Sun ignites",
    t: 9.2,
    erd: 2e-4,
    note: "A G-type main-sequence star — only ≈2 erg/g/s averaged across its plasma mass.",
  },
  {
    name: "Earth forms",
    t: 9.3,
    erd: 7.5e-3,
    note: "Radiogenic, tidal, and insolation flux through a rocky planet — about 75 erg/g/s.",
  },
  {
    name: "First life",
    t: 10.3,
    erd: 5e-2,
    note: "Prokaryotic single cells — chemistry promoted to metabolism for the first time.",
  },
  {
    name: "Land plants",
    t: 13.3,
    erd: 0.7,
    note: "Photosynthetic flora — orders of magnitude above the average biosphere throughput.",
  },
  {
    name: "Mammals",
    t: 13.6,
    erd: 4,
    note: "Endothermic vertebrates burn ≈4×10⁴ erg/s through every gram of warm-blooded body.",
  },
  {
    name: "Human brain",
    t: 13.799,
    erd: 15,
    note: "≈20 W flowing through 1.4 kg of neurons — the densest biological energy flux known.",
  },
  {
    name: "Modern society",
    t: 13.7999,
    erd: 50,
    note: "Industrial + digital civilisation — per-capita power-to-mass of the technosphere.",
  },
  {
    name: "Jet engine",
    t: 13.79999,
    erd: 8200,
    note: "Modern turbofan — the highest sustained energy rate density humans have ever built.",
  },
];

export function EnergyRateDensityPanel() {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = 380;
  const PAD_L = 78;
  const PAD_R = 110;
  const PAD_T = 40;
  const PAD_B = 70;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  /* x: time in Gyr (linear, 0 → 14)
     y: log10(erd in W/kg), (−5 → 4) */
  const X_MIN = 0;
  const X_MAX = 14;
  const Y_MIN = -5;
  const Y_MAX = 4;
  const toX = (t: number) =>
    PAD_L + ((t - X_MIN) / (X_MAX - X_MIN)) * plotW;
  const toY = (logE: number) =>
    PAD_T + plotH - ((logE - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

  /* Per-point screen coords + label placement.
     Bunched right-edge points fan their labels left/right alternately. */
  const LABEL_OFFSETS: { dx: number; dy: number; anchor: "start" | "end" | "middle" }[] = [
    { dx: 14, dy: -10, anchor: "start" },    // First galaxies
    { dx: 0, dy: 20, anchor: "middle" },     // Sun ignites
    { dx: 10, dy: -12, anchor: "start" },    // Earth forms
    { dx: 14, dy: -14, anchor: "start" },    // First life
    { dx: -14, dy: 4, anchor: "end" },       // Land plants
    { dx: 14, dy: 5, anchor: "start" },      // Mammals
    { dx: -14, dy: -2, anchor: "end" },      // Human brain
    { dx: 14, dy: 5, anchor: "start" },      // Modern society
    { dx: -14, dy: -2, anchor: "end" },      // Jet engine
  ];
  const points = ERD_POINTS.map((p, i) => ({
    ...p,
    x: toX(p.t),
    y: toY(Math.log10(p.erd)),
    lo: LABEL_OFFSETS[i],
  }));

  /* Smooth Catmull-Rom curve through the data (tension 0.5) */
  const curveD = (() => {
    const parts: string[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      if (i === 0) parts.push(`M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`);
      parts.push(
        `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
      );
    }
    return parts.join(" ");
  })();

  const X_TICKS = [0, 2, 4, 6, 8, 10, 12, 14];
  const Y_TICKS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
  const supDigit: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
  };
  const sup = (n: number) =>
    String(n).split("").map((c) => supDigit[c] ?? c).join("");

  return (
    <FigurePanel
      idx="0.2.c"
      kicker="Energy Rate Density · Cosmic History"
      caption="Eric Chaisson's complexity metric: free energy flowing through every kilogram of a system, every second. Across 13.8 billion years the value climbs nine orders of magnitude — from the first proto-galaxies to a modern jet engine."
    >
      <div className="fig-viz relative w-full overflow-hidden rounded-md">
        {/* Hover description — absolute overlay inside fig-viz so it never
            competes with the SVG for vertical space. Without this, growing
            the description sibling would shrink fig-viz, relocate the data
            points under the cursor, and trigger an endless hover-flip
            (visible as screen "shake" in fullscreen). */}
        <div
          className="absolute left-3 right-3 bottom-3 md:left-5 md:right-auto md:bottom-5 md:max-w-md p-3 rounded-md text-[13px] leading-[1.6] pointer-events-none z-10"
          style={{
            background: "rgb(var(--c-bg-rgb) / 0.86)",
            border: "1px solid rgb(var(--c-text-rgb) / 0.1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            minHeight: "5.4em",
          }}
        >
          {hover !== null ? (
            <>
              <span className="text-plasma font-mono tracking-[0.14em]">
                {ERD_POINTS[hover].name.toUpperCase()}
              </span>
              <span className="mx-2 text-white/35">/</span>
              <span className="text-white/85">{ERD_POINTS[hover].note}</span>
              <div className="font-mono text-[11px] text-white/55 mt-1">
                t ≈ {ERD_POINTS[hover].t} Gyr · Φₘ ≈{" "}
                {ERD_POINTS[hover].erd.toExponential(1)} W/kg
              </div>
            </>
          ) : (
            <span className="text-white/55 italic">
              Hover a point to read what each rung of complexity represents.
            </span>
          )}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Y-axis gridlines */}
          {Y_TICKS.map((e) => (
            <line
              key={`yg-${e}`}
              x1={PAD_L}
              x2={W - PAD_R}
              y1={toY(e)}
              y2={toY(e)}
              stroke="rgb(var(--c-text-rgb) / 0.06)"
              strokeWidth="0.6"
              strokeDasharray="2 4"
            />
          ))}
          {/* X-axis gridlines */}
          {X_TICKS.map((t) => (
            <line
              key={`xg-${t}`}
              x1={toX(t)}
              x2={toX(t)}
              y1={PAD_T}
              y2={H - PAD_B}
              stroke="rgb(var(--c-text-rgb) / 0.06)"
              strokeWidth="0.6"
              strokeDasharray="2 4"
            />
          ))}

          {/* Axis frame */}
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={H - PAD_B}
            stroke="rgb(var(--c-text-rgb) / 0.22)"
            strokeWidth="0.9"
          />
          <line
            x1={PAD_L}
            y1={H - PAD_B}
            x2={W - PAD_R}
            y2={H - PAD_B}
            stroke="rgb(var(--c-text-rgb) / 0.22)"
            strokeWidth="0.9"
          />

          {/* X ticks + labels */}
          {X_TICKS.map((t) => {
            const x = toX(t);
            return (
              <g key={`xt-${t}`}>
                <line
                  x1={x}
                  x2={x}
                  y1={H - PAD_B}
                  y2={H - PAD_B + 4}
                  stroke="rgb(var(--c-text-rgb) / 0.4)"
                  strokeWidth="0.8"
                />
                <text
                  x={x}
                  y={H - PAD_B + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fill="rgb(var(--c-text-rgb) / 0.6)"
                >
                  {t}
                </text>
              </g>
            );
          })}
          <text
            x={(PAD_L + W - PAD_R) / 2}
            y={H - PAD_B + 42}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.55)"
          >
            TIME AFTER BIG BANG · Gyr
          </text>

          {/* Y ticks + labels */}
          {Y_TICKS.map((e) => {
            const y = toY(e);
            return (
              <g key={`yt-${e}`}>
                <line
                  x1={PAD_L - 4}
                  x2={PAD_L}
                  y1={y}
                  y2={y}
                  stroke="rgb(var(--c-text-rgb) / 0.4)"
                  strokeWidth="0.8"
                />
                <text
                  x={PAD_L - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fill="rgb(var(--c-text-rgb) / 0.6)"
                >
                  10{sup(e)}
                </text>
              </g>
            );
          })}
          <text
            transform={`translate(${PAD_L - 56}, ${PAD_T + plotH / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.55)"
          >
            ENERGY RATE DENSITY · W/kg
          </text>

          {/* Endpoint annotations */}
          <text
            x={PAD_L + 6}
            y={PAD_T + 14}
            fontSize="9"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-accent-rgb) / 0.8)"
          >
            BIG BANG →
          </text>
          <line
            x1={toX(13.8)}
            x2={toX(13.8)}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke="rgb(var(--c-accent-rgb) / 0.3)"
            strokeWidth="0.8"
            strokeDasharray="2 3"
          />
          <text
            x={toX(13.8) - 6}
            y={PAD_T + 14}
            textAnchor="end"
            fontSize="9"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-accent-rgb) / 0.8)"
          >
            ← NOW
          </text>

          {/* Rising curve */}
          <path
            d={curveD}
            fill="none"
            stroke="rgb(var(--c-accent-rgb) / 0.6)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 5px rgb(var(--c-accent-rgb) / 0.4))",
            }}
          />

          {/* Data points + leaders + labels */}
          {points.map((p, i) => {
            const isHover = hover === i;
            const lx = p.x + p.lo.dx;
            const ly = p.y + p.lo.dy;
            return (
              <g
                key={p.name}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "default" }}
              >
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={lx}
                  y2={ly - 3}
                  stroke={
                    isHover
                      ? "rgb(var(--c-accent-rgb) / 0.75)"
                      : "rgb(var(--c-accent-rgb) / 0.3)"
                  }
                  strokeWidth="0.7"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHover ? 6.5 : 4}
                  fill="rgb(var(--c-accent-rgb))"
                  style={{
                    filter: isHover
                      ? "drop-shadow(0 0 12px rgb(var(--c-accent-rgb) / 0.9))"
                      : "drop-shadow(0 0 4px rgb(var(--c-accent-rgb) / 0.45))",
                    transition:
                      "r 200ms var(--ease), filter 200ms var(--ease)",
                  }}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={p.lo.anchor}
                  fontSize={isHover ? "12" : "11"}
                  fontFamily="var(--font-sans)"
                  fontWeight={isHover ? 500 : 400}
                  fill={
                    isHover
                      ? "rgb(var(--c-accent-rgb))"
                      : "rgb(var(--c-text-rgb) / 0.85)"
                  }
                  style={{
                    transition:
                      "fill 200ms var(--ease), font-size 200ms var(--ease)",
                  }}
                >
                  {p.name}
                </text>
                {/* Invisible hover catcher */}
                <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

    </FigurePanel>
  );
}
