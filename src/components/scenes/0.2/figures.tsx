import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { mulberry32 } from "../../../data/chapter-0-events";

/* ── Shared figure frame ─────────────────────────────────────────────── */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  fitFs = false,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  /** content-heavy panels (viz + detail panel + controls) shrink the viz in
      fullscreen so the whole figure fits the viewport with no scrollbars. */
  fitFs?: boolean;
}) {
  return (
    <figure
      data-fade
      className={`figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}`}
    >
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
              ← GRAVITY PULLS IN
            </text>
            <text
              x={W - 28}
              y={32}
              textAnchor="end"
              fontSize="9"
              letterSpacing="2"
              fill="rgb(var(--c-accent-rgb) / 0.7)"
            >
              EXPANSION PUSHES OUT →
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
            gravity ↔ expansion
          </label>
          <span className="font-mono text-[10px] text-plasma/85">
            gravity {(1 - balance).toFixed(2)} · expansion {balance.toFixed(2)}
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
          <span>scatter</span>
        </div>
      </div>

      <div className="mt-4 text-[13px] text-white/75 leading-[1.6] max-w-[62ch]">
        Drag the slider between the two forces. Pull it left and gravity wins:
        all the matter falls together into one bright clump. Push it right and
        expansion wins: the matter flies apart before it can gather. Only in the
        narrow middle do the dots settle into a lasting pattern — that balanced
        window is where galaxies, stars, and planets actually get to form.
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
            disorder · all space{" "}
            <span style={{ color: "rgb(var(--c-accent-rgb) / 0.9)" }}>
              ↑ {(t * 100).toFixed(0)}%
            </span>
          </div>
          <div
            className="font-mono text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "rgb(var(--c-text-rgb) / 0.5)" }}
          >
            disorder · island{" "}
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

      <div className="mt-4 text-[13px] text-white/75 leading-[1.6] max-w-[62ch]">
        Press play (or drag the slider) to run time forward. Inside the dashed
        circle, scattered dots gather into a neat spiral — a galaxy, a star, a
        living cell: an "island" growing more ordered. But watch the dots
        <em> outside</em> the circle drift ever farther apart. The order inside
        is paid for by extra disorder dumped outside. Disorder — what physicists
        call <strong>entropy</strong> — still rises for the Universe as a whole;
        local order is only ever borrowed against it.
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
    note: "An ordinary star like our Sun — only a trickle of energy when you average its huge mass over its slow-burning core.",
  },
  {
    name: "Earth forms",
    t: 9.3,
    erd: 7.5e-3,
    note: "A rocky planet, warmed from within by its own radioactive rocks and from without by sunlight — a richer flow than the star that lights it.",
  },
  {
    name: "First life",
    t: 10.3,
    erd: 5e-2,
    note: "The first single cells — the moment plain chemistry became living metabolism, a self-sustaining flow of energy.",
  },
  {
    name: "Land plants",
    t: 13.3,
    erd: 0.7,
    note: "Plants on land, capturing sunlight directly — many times more energy per gram than the average living world.",
  },
  {
    name: "Mammals",
    t: 13.6,
    erd: 4,
    note: "Warm-blooded animals, which must burn fuel constantly just to hold their body heat — a steep step up in energy flow.",
  },
  {
    name: "Human brain",
    t: 13.799,
    erd: 15,
    note: "About 20 watts running through 1.4 kg of neurons — the richest energy flow of any living thing we know of.",
  },
  {
    name: "Modern society",
    t: 13.7999,
    erd: 50,
    note: "Industrial, electrified civilisation — the energy each person commands, spread over their share of the machines that serve them.",
  },
  {
    name: "Jet engine",
    t: 13.79999,
    erd: 8200,
    note: "A modern jet turbofan — the most concentrated, sustained energy flow humans have ever engineered.",
  },
];

export function EnergyRateDensityPanel() {
  /* `selected` is the stage currently described in the panel below the plot.
     It is driven three ways that all agree: hovering/clicking a data point,
     dragging the slider, and — because that native range slider is the
     figure's discrete control — the global FigureFrame navigator (← / →
     keys, and the mouse-wheel in fullscreen). Defaulting to 0 means a
     description is always visible, so the figure reads without a mouse. */
  const [selected, setSelected] = useState(0);

  const W = 720;
  const H = 360;
  const PAD_L = 64;
  const PAD_R = 34;
  const PAD_T = 30;
  const PAD_B = 48;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const N = ERD_POINTS.length;
  const Y_MIN = -5;
  const Y_MAX = 4;
  /* x is ORDINAL: the nine stages are spread evenly across the plot so none
     bunch up at "today" and the curve only ever climbs up and to the right.
     The real ages live in the detail panel + readout below the plot.
     y: log10(erd in W/kg), (−5 → 4). */
  const toX = (i: number) => PAD_L + (i / (N - 1)) * plotW;
  const toY = (logE: number) =>
    PAD_T + plotH - ((logE - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

  const points = ERD_POINTS.map((p, i) => ({
    ...p,
    x: toX(i),
    y: toY(Math.log10(p.erd)),
  }));

  /* Monotone cubic spline (Fritsch–Carlson tangents) through the points.
     Unlike Catmull-Rom it never overshoots, so the curve has no horizontal
     back-and-forth — it climbs continuously up and to the right. */
  const curveD = (() => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const n = xs.length;
    const dx: number[] = [];
    const slope: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      const h = xs[i + 1] - xs[i];
      dx.push(h);
      slope.push((ys[i + 1] - ys[i]) / h);
    }
    const m = new Array(n).fill(0);
    m[0] = slope[0];
    m[n - 1] = slope[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (slope[i - 1] * slope[i] <= 0) {
        m[i] = 0;
      } else {
        const w1 = 2 * dx[i] + dx[i - 1];
        const w2 = dx[i] + 2 * dx[i - 1];
        m[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
      }
    }
    const parts = [`M ${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`];
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i];
      const c1x = xs[i] + h / 3;
      const c1y = ys[i] + (m[i] * h) / 3;
      const c2x = xs[i + 1] - h / 3;
      const c2y = ys[i + 1] - (m[i + 1] * h) / 3;
      parts.push(
        `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${xs[i + 1].toFixed(1)} ${ys[i + 1].toFixed(1)}`,
      );
    }
    return parts.join(" ");
  })();

  const Y_TICKS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
  const supDigit: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
  };
  const sup = (n: number) =>
    String(n).split("").map((c) => supDigit[c] ?? c).join("");
  /* Human-readable W/kg — plain decimals, never machine exponential
     (e.g. 0.00001, 15, 8,200) so the readout stays jargon-free. */
  const fmtWkg = (v: number) =>
    v >= 1 ? Math.round(v).toLocaleString("en-US") : String(v);
  const sel = ERD_POINTS[selected];
  const selPt = points[selected];

  return (
    <FigurePanel
      idx="0.2.c"
      kicker="Energy Rate Density · Cosmic History"
      caption="Astrophysicist Eric Chaisson's measure of complexity: how much energy flows through every kilogram of a thing, each second. Across 13.8 billion years it climbs by a factor of a billion — from the first galaxies to a modern jet engine."
      fitFs
    >
      <div className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Y-axis gridlines — the meaningful decade lines */}
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

          {/* Faint guide from the selected stage down to the time axis */}
          <line
            x1={selPt.x}
            x2={selPt.x}
            y1={selPt.y}
            y2={H - PAD_B}
            stroke="rgb(var(--c-accent-rgb) / 0.28)"
            strokeWidth="0.8"
            strokeDasharray="2 3"
          />

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

          {/* X-axis label — ordinal cosmic time, earliest at left */}
          <text
            x={(PAD_L + W - PAD_R) / 2}
            y={H - PAD_B + 30}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.55)"
          >
            COSMIC TIME · BIG BANG → TODAY
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
            transform={`translate(${PAD_L - 48}, ${PAD_T + plotH / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.55)"
          >
            ENERGY RATE DENSITY · W/kg
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

          {/* Data points. Only the SELECTED point carries a name label, so
             the plot stays clean and labels can never overlap — every stage
             is named in the detail panel below as you step through them. */}
          {points.map((p, i) => {
            const isOn = selected === i;
            /* Place the single active label in clear space: above-left of the
               dot, tucked below for the top point and right for the first. */
            const topZone = p.y < PAD_T + plotH * 0.16;
            const leftZone = i === 0;
            const lx = leftZone ? p.x + 10 : p.x - 10;
            const ly = topZone ? p.y + 20 : p.y - 11;
            const anchor: "start" | "end" = leftZone ? "start" : "end";
            return (
              <g
                key={p.name}
                onMouseEnter={() => setSelected(i)}
                onClick={() => setSelected(i)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isOn ? 6.5 : 4}
                  fill="rgb(var(--c-accent-rgb))"
                  style={{
                    filter: isOn
                      ? "drop-shadow(0 0 12px rgb(var(--c-accent-rgb) / 0.9))"
                      : "drop-shadow(0 0 4px rgb(var(--c-accent-rgb) / 0.45))",
                    transition:
                      "r 200ms var(--ease), filter 200ms var(--ease)",
                  }}
                />
                {isOn && (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={anchor}
                    fontSize="13"
                    fontFamily="var(--font-sans)"
                    fontWeight={500}
                    fill="rgb(var(--c-accent-rgb))"
                  >
                    {p.name}
                  </text>
                )}
                {/* Invisible hover/click catcher */}
                <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail panel — full width BELOW the plot so it never covers the
          axes. Fixed min-height keeps the layout steady as you step through
          stages (no vertical shift = no fullscreen hover-flip). */}
      <div
        className="mt-4 p-3 md:p-4 rounded-md text-[13px] leading-[1.6]"
        style={{
          background: "rgb(var(--c-text-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.1)",
          minHeight: "5.2em",
        }}
      >
        <span className="text-plasma font-mono tracking-[0.14em]">
          {sel.name.toUpperCase()}
        </span>
        <span className="mx-2 text-white/35">/</span>
        <span className="text-white/85">{sel.note}</span>
        <div className="font-mono text-[11px] text-white/55 mt-1">
          ≈ {sel.t.toFixed(1)} Gyr after the Big Bang · energy flow ≈{" "}
          {fmtWkg(sel.erd)} W/kg
        </div>
      </div>

      {/* Slider — the figure's discrete control, so FigureFrame's global
          navigator (← / → keys, mouse-wheel in fullscreen) steps the
          stages. Stepping it also moves the highlight on the plot. */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            step through cosmic history
          </label>
          <span className="font-mono text-[10px] text-plasma/85">
            {selected + 1} / {N}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={N - 1}
          step={1}
          value={selected}
          onChange={(e) => setSelected(parseInt(e.target.value, 10))}
          className="cosmic-slider"
          aria-label="Cosmic-history stage"
        />
      </div>

      <div className="mt-4 text-[13px] text-white/75 leading-[1.6] max-w-[64ch]">
        Each step up the vertical axis is another factor of ten — the energy
        flowing through every gram of a thing, each second. A whole star sits
        near the bottom; a warm-blooded animal, a brain, and a city all sit far
        higher. Complexity isn't about being big — it's about how much energy
        you push through each gram of yourself.
      </div>
    </FigurePanel>
  );
}
