import { useEffect, useMemo, useState, type ReactNode } from "react";

/* ── Shared figure frame (same pattern as 0.2/figures.tsx) ────────── */
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

/* ── Cosmic Scale: log-scale ladder of distances ─────────────────────
   Each celestial object is positioned on a logarithmic horizontal axis
   spanning 1 second to ~14 billion years of light-travel time. Click
   any object to see how long ago its light left for us. */
type ScaleObject = {
  id: string;
  name: string;
  /** light-travel time in years */
  yearsAgo: number;
  blurb: string;
};
const SCALE_OBJECTS: ScaleObject[] = [
  { id: "moon",      name: "Moon",            yearsAgo: 1.3 / (365.25 * 24 * 3600),     blurb: "1.3 seconds. The light from the Moon left moments before you looked up." },
  { id: "sun",       name: "Sun",             yearsAgo: 500 / (365.25 * 24 * 3600),     blurb: "8 minutes, 20 seconds. The Sun could already be gone — we wouldn't know yet." },
  { id: "jupiter",   name: "Jupiter",         yearsAgo: 2580 / (365.25 * 24 * 3600),    blurb: "≈43 minutes. Voyager 1's photographs are timestamped by light-distance." },
  { id: "pluto",     name: "Pluto",           yearsAgo: 19800 / (365.25 * 24 * 3600),   blurb: "≈5.5 hours. New Horizons signals from Pluto take a working day to reach Earth." },
  { id: "alphacen",  name: "α Centauri",      yearsAgo: 4.37,                            blurb: "4.37 years. The nearest star system — you see it as it was when you started a different chapter of life." },
  { id: "galcentre", name: "Galactic Centre", yearsAgo: 26000,                           blurb: "26,000 years. The supermassive black hole at the heart of our Milky Way — its light left in the Stone Age." },
  { id: "andromeda", name: "Andromeda",       yearsAgo: 2.5e6,                           blurb: "2.5 million years. The Andromeda Galaxy as it looked before our species existed." },
  { id: "virgo",     name: "Virgo Cluster",   yearsAgo: 5.4e7,                           blurb: "54 million years. Dinosaurs were still around when this cluster's light set out." },
  { id: "coma",      name: "Coma Cluster",    yearsAgo: 3.3e8,                           blurb: "330 million years. A thousand galaxies bound by gravity — light that set out while the first reptiles crawled onto land." },
  { id: "sloan",     name: "Sloan Great Wall", yearsAgo: 1.0e9,                          blurb: "1 billion years. A filament of galaxies 1.4 billion light-years long — one of the largest structures we have mapped in the Universe." },
  { id: "quasar",    name: "Quasar 3C 273",   yearsAgo: 2.4e9,                           blurb: "2.4 billion years. The first quasar ever identified — a supermassive black hole outshining its entire host galaxy." },
  { id: "cmb",       name: "CMB",             yearsAgo: 1.378e10,                        blurb: "13.78 billion years. The Cosmic Microwave Background — the wall of light from when the Universe cooled enough to become transparent. We cannot see past this." },
];

/* ── Label row layout ────────────────────────────────────────────────
   Four staggered rows above/below the axis.  Sorted-by-x greedy fit
   guarantees no horizontal overlap between any two label boxes. */
type LabelRow = 0 | 1 | 2 | 3;
const ROW_LAYOUT: Record<
  LabelRow,
  { labelY: number; dotY: number; lineEnd: number; axisOffset: number }
> = {
  0: { labelY: -56, dotY: -32, lineEnd: -12, axisOffset: -6 },
  1: { labelY: +56, dotY: +32, lineEnd: +12, axisOffset: +6 },
  2: { labelY: -100, dotY: -66, lineEnd: -36, axisOffset: -6 },
  3: { labelY: +100, dotY: +66, lineEnd: +36, axisOffset: +6 },
};
const ROW_ORDER: LabelRow[] = [0, 1, 2, 3];

function approxLabelWidth(name: string): number {
  /* sans-serif 11px with letter-spacing≈1, ~6.3 px/char + padding */
  return name.length * 6.3 + 6;
}

function fmtYearsAgo(y: number): string {
  if (y < 1 / 365.25 / 24) return `${(y * 365.25 * 24 * 3600).toFixed(1)} s`;
  if (y < 1 / 365.25) return `${(y * 365.25 * 24 * 60).toFixed(1)} min`;
  if (y < 1) return `${(y * 365.25 * 24).toFixed(1)} hr`;
  if (y < 1e3) return `${y.toFixed(1)} yr`;
  if (y < 1e6) return `${(y / 1e3).toFixed(1)} k yr`;
  if (y < 1e9) return `${(y / 1e6).toFixed(1)} M yr`;
  return `${(y / 1e9).toFixed(2)} G yr`;
}

/* ── Cosmic-Scale geometry (module-level so assignRows can precompute) */
const COSMIC_W = 720;
const COSMIC_H = 280;
const COSMIC_PAD = 56;
const COSMIC_AXIS_Y = COSMIC_H / 2;
const COSMIC_LOG_MIN = -8;
const COSMIC_LOG_MAX = 10.5;
/* Power warp on the log axis: the value is still log₁₀(years), but the
   normalised position is raised to a power > 1 before being placed on the
   axis.  This squeezes the sub-second / sub-day end (where every decade
   still maps to a 10× jump, just to a smaller pixel width) and gives the
   cosmic end more breathing room. */
const COSMIC_AXIS_POWER = 1.45;
function cosmicX(years: number): number {
  const v = Math.log10(years);
  const norm = (v - COSMIC_LOG_MIN) / (COSMIC_LOG_MAX - COSMIC_LOG_MIN);
  const warped = Math.pow(Math.max(0, Math.min(1, norm)), COSMIC_AXIS_POWER);
  return COSMIC_PAD + warped * (COSMIC_W - 2 * COSMIC_PAD);
}

/* Sorted-by-x greedy row assignment: each label picks the lowest-index
   row in {0,1,2,3} that has no horizontal overlap with anything already
   placed there.  Guarantees no two label boxes touch. */
const COSMIC_ROW: Record<string, LabelRow> = (() => {
  const PAD = 6;
  const items = SCALE_OBJECTS.map((o) => ({
    id: o.id,
    x: cosmicX(o.yearsAgo),
    w: approxLabelWidth(o.name),
  })).sort((a, b) => a.x - b.x);
  const placed: Record<LabelRow, { x: number; w: number }[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
  };
  const map: Record<string, LabelRow> = {};
  for (const it of items) {
    let chosen: LabelRow = 0;
    for (const r of ROW_ORDER) {
      const hit = placed[r].some(
        (p) => Math.abs(p.x - it.x) < (p.w + it.w) / 2 + PAD,
      );
      if (!hit) {
        chosen = r;
        break;
      }
    }
    placed[chosen].push({ x: it.x, w: it.w });
    map[it.id] = chosen;
  }
  return map;
})();

export function CosmicScalePanel() {
  const [selected, setSelected] = useState<string>("andromeda");
  const W = COSMIC_W;
  const H = COSMIC_H;
  const PAD = COSMIC_PAD;
  const AXIS_Y = COSMIC_AXIS_Y;
  const logMin = COSMIC_LOG_MIN;
  const logMax = COSMIC_LOG_MAX;
  const xOf = cosmicX;

  const sel = SCALE_OBJECTS.find((o) => o.id === selected)!;

  return (
    <FigurePanel
      idx="0.3.1"
      kicker="Cosmic Scale · Distance is Time"
      caption="Click any object to see how long ago its light started its journey to your eyes. The horizontal axis is logarithmic — every tick still marks a 10× jump in light-travel time, but the small-distance end is compressed so the deep cosmos has room to spread out. Nothing you ever see is happening 'now'."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Base axis line */}
          <line
            x1={PAD}
            x2={W - PAD}
            y1={AXIS_Y}
            y2={AXIS_Y}
            stroke="rgb(var(--c-text-rgb) / 0.18)"
            strokeWidth="1"
          />
          {/* Decade ticks (faint) — placed on the warped axis so each
             10× step has a visible (but non-uniform) width. */}
          {Array.from({ length: Math.floor(logMax - logMin) + 1 }, (_, i) => logMin + i).map((v) => {
            const x = xOf(Math.pow(10, v));
            return (
              <line
                key={v}
                x1={x}
                x2={x}
                y1={AXIS_Y - 3}
                y2={AXIS_Y + 3}
                stroke="rgb(var(--c-text-rgb) / 0.15)"
                strokeWidth="0.6"
              />
            );
          })}
          {/* "Earth" anchor at far left */}
          <g>
            <circle cx={PAD - 8} cy={AXIS_Y} r="3.5" fill="rgb(var(--c-text-rgb) / 0.55)" />
            <text
              x={PAD - 8}
              y={AXIS_Y + 22}
              textAnchor="middle"
              fontSize="11"
              letterSpacing="3"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-text-rgb) / 0.55)"
            >
              EARTH
            </text>
            <text
              x={PAD - 8}
              y={AXIS_Y + 36}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="2"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-text-rgb) / 0.35)"
            >
              now
            </text>
          </g>
          {/* Horizon anchor at far right */}
          <g>
            <circle
              cx={W - PAD + 8}
              cy={AXIS_Y}
              r="3.5"
              fill="rgb(var(--c-accent-rgb))"
              style={{
                filter: "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.7))",
              }}
            />
            <text
              x={W - PAD + 8}
              y={AXIS_Y + 22}
              textAnchor="middle"
              fontSize="11"
              letterSpacing="3"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-accent-rgb))"
            >
              HORIZON
            </text>
            <text
              x={W - PAD + 8}
              y={AXIS_Y + 36}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="2"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-accent-rgb) / 0.7)"
            >
              13.8 Gyr
            </text>
          </g>

          {/* Objects — each label sits on one of four rows assigned by
             a greedy collision-free packer (see COSMIC_ROW). */}
          {SCALE_OBJECTS.map((o) => {
            const x = xOf(o.yearsAgo);
            const isSel = o.id === selected;
            const row = COSMIC_ROW[o.id];
            const geom = ROW_LAYOUT[row];
            const labelY = AXIS_Y + geom.labelY;
            const dotY = AXIS_Y + geom.dotY;
            const lineEnd = AXIS_Y + geom.lineEnd;
            return (
              <g
                key={o.id}
                onClick={() => setSelected(o.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Leader line from axis to dot */}
                <line
                  x1={x}
                  x2={x}
                  y1={AXIS_Y + geom.axisOffset}
                  y2={lineEnd}
                  stroke={
                    isSel
                      ? "rgb(var(--c-accent-rgb) / 0.7)"
                      : "rgb(var(--c-text-rgb) / 0.25)"
                  }
                  strokeWidth={isSel ? 1.2 : 0.7}
                  strokeDasharray={isSel ? "0" : "1 2"}
                />
                {/* Tick on axis */}
                <line
                  x1={x}
                  x2={x}
                  y1={AXIS_Y - 6}
                  y2={AXIS_Y + 6}
                  stroke={
                    isSel
                      ? "rgb(var(--c-accent-rgb))"
                      : "rgb(var(--c-text-rgb) / 0.4)"
                  }
                  strokeWidth={isSel ? 1.6 : 0.8}
                />
                {/* Dot */}
                <circle
                  cx={x}
                  cy={dotY}
                  r={isSel ? 5.5 : 4}
                  fill={
                    isSel
                      ? "rgb(var(--c-accent-rgb))"
                      : "rgb(var(--c-text-rgb) / 0.55)"
                  }
                  style={{
                    filter: isSel
                      ? "drop-shadow(0 0 10px rgb(var(--c-accent-rgb) / 0.7))"
                      : "none",
                  }}
                />
                {/* Label */}
                <text
                  x={x}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={isSel ? 13 : 11}
                  letterSpacing={isSel ? "0.6" : "1"}
                  fontFamily={isSel ? "var(--font-serif)" : "var(--font-sans)"}
                  fontStyle={isSel ? "italic" : "normal"}
                  fontWeight={isSel ? 500 : 400}
                  fill={
                    isSel
                      ? "rgb(var(--c-accent-rgb))"
                      : "rgb(var(--c-text-rgb) / 0.75)"
                  }
                >
                  {o.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className="mt-4 grid grid-cols-[180px_1fr] gap-4 items-start p-3 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
            lookback
          </div>
          <div
            className="font-serif font-medium"
            style={{
              fontSize: "1.6rem",
              color: "var(--c-accent)",
              lineHeight: 1.1,
            }}
          >
            {fmtYearsAgo(sel.yearsAgo)}
          </div>
          <div className="font-mono text-[10px] text-white/45 mt-1">
            {sel.name.toUpperCase()}
          </div>
        </div>
        <div className="text-[13px] text-white/80 leading-[1.55] font-sans">
          {sel.blurb}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Balloon Analogy: cosmological principle ─────────────────────────
   Five "galaxies" sit on a flat 2D plane. The user inflates the field
   (scale slider) — every galaxy moves apart from every other. Then they
   can SELECT a galaxy to "be" — that one becomes the centre, and the
   others recede from it. Same pattern from every observer. */
const GALAXIES = [
  { id: "a", base: [0.18, 0.32], name: "α" },
  { id: "b", base: [0.5, 0.18], name: "β" },
  { id: "c", base: [0.8, 0.35], name: "γ" },
  { id: "d", base: [0.32, 0.7], name: "δ" },
  { id: "e", base: [0.7, 0.72], name: "ε" },
] as const;

export function BalloonAnalogyPanel() {
  const [scale, setScale] = useState(1);
  const [observer, setObserver] = useState<string>("c");
  const W = 720;
  const H = 360;
  /* Field shows the 5 galaxies on a unit square. We pick the observer's
     base coordinate as the "centre" — render everything relative to it
     so the observer always appears in the middle. */
  const obs = GALAXIES.find((g) => g.id === observer)!;
  const [ox, oy] = obs.base;

  /* Scaled position relative to observer at the centre of the SVG */
  function transform(base: readonly [number, number]) {
    const dx = (base[0] - ox) * scale;
    const dy = (base[1] - oy) * scale;
    return [W / 2 + dx * (W * 0.7), H / 2 + dy * (H * 0.7)] as const;
  }

  return (
    <FigurePanel
      idx="0.3.3"
      kicker="Balloon Analogy · The Cosmological Principle"
      caption="Pick any galaxy to be 'you'. Inflate the field — every other galaxy recedes from you, exactly as Hubble's Law predicts. Pick a different galaxy. Same picture. No observer sits at the centre; everyone does."
    >
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55 mr-1 self-center">
          you are :
        </span>
        {GALAXIES.map((g) => {
          const isObs = g.id === observer;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setObserver(g.id)}
              className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${isObs ? "is-active" : ""}`}
            >
              galaxy {g.name}
            </button>
          );
        })}
      </div>

      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Recession rays from observer to each other galaxy */}
          {GALAXIES.filter((g) => g.id !== observer).map((g) => {
            const [x, y] = transform(g.base);
            return (
              <line
                key={`r-${g.id}`}
                x1={W / 2}
                y1={H / 2}
                x2={x}
                y2={y}
                stroke="rgb(var(--c-accent-rgb) / 0.18)"
                strokeWidth="0.8"
                strokeDasharray="2 4"
              />
            );
          })}
          {/* Other galaxies */}
          {GALAXIES.filter((g) => g.id !== observer).map((g) => {
            const [x, y] = transform(g.base);
            return (
              <g key={g.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="rgb(var(--c-text-rgb) / 0.55)"
                  style={{ transition: "cx 500ms var(--ease), cy 500ms var(--ease)" }}
                />
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                  fill="rgb(var(--c-text-rgb) / 0.7)"
                  style={{ transition: "x 500ms var(--ease), y 500ms var(--ease)" }}
                >
                  {g.name}
                </text>
              </g>
            );
          })}
          {/* Observer at centre */}
          <g>
            <circle
              cx={W / 2}
              cy={H / 2}
              r="9"
              fill="rgb(var(--c-accent-rgb))"
              style={{
                filter: "drop-shadow(0 0 12px rgb(var(--c-accent-rgb) / 0.8))",
              }}
            />
            <circle
              cx={W / 2}
              cy={H / 2}
              r="22"
              fill="none"
              stroke="rgb(var(--c-accent-rgb) / 0.35)"
              strokeWidth="0.6"
              strokeDasharray="2 4"
            />
            <text
              x={W / 2}
              y={H / 2 + 32}
              textAnchor="middle"
              fontSize="10"
              letterSpacing="2"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-accent-rgb))"
            >
              {obs.name.toUpperCase()} · YOU
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            inflate the Universe
          </label>
          <span className="font-mono text-[10px] text-plasma">
            scale × {scale.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2.5}
          step={0.01}
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>past · contracted</span>
          <span>today · 1×</span>
          <span>future · expanded</span>
        </div>
      </div>
    </FigurePanel>
  );
}
