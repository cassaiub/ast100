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
  { id: "cmb",       name: "CMB",             yearsAgo: 1.378e10,                        blurb: "13.78 billion years. The Cosmic Microwave Background — the wall of light from when the universe cooled enough to become transparent. We cannot see past this." },
];

function fmtYearsAgo(y: number): string {
  if (y < 1 / 365.25 / 24) return `${(y * 365.25 * 24 * 3600).toFixed(1)} s`;
  if (y < 1 / 365.25) return `${(y * 365.25 * 24 * 60).toFixed(1)} min`;
  if (y < 1) return `${(y * 365.25 * 24).toFixed(1)} hr`;
  if (y < 1e3) return `${y.toFixed(1)} yr`;
  if (y < 1e6) return `${(y / 1e3).toFixed(1)} k yr`;
  if (y < 1e9) return `${(y / 1e6).toFixed(1)} M yr`;
  return `${(y / 1e9).toFixed(2)} G yr`;
}

export function CosmicScalePanel() {
  const [selected, setSelected] = useState<string>("andromeda");
  const W = 720;
  const H = 280;
  const PAD = 56;
  const AXIS_Y = H / 2;

  /* log10(years) range. Min ~ log10(1.3s in years) ≈ -7.4, max ~ 10.14.
     Padded slightly so the endpoints aren't crammed against the EARTH /
     HORIZON anchor labels. */
  const logMin = -8;
  const logMax = 10.5;
  function xOf(years: number) {
    const v = Math.log10(years);
    return PAD + ((v - logMin) / (logMax - logMin)) * (W - 2 * PAD);
  }

  const sel = SCALE_OBJECTS.find((o) => o.id === selected)!;

  return (
    <FigurePanel
      idx="0.3.1"
      kicker="Cosmic Scale · Distance is Time"
      caption="Click any object to see how long ago its light started its journey to your eyes. The horizontal axis is logarithmic — each step is ten times farther than the last. Nothing you ever see is happening 'now'."
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
          {/* Decade ticks (faint) */}
          {Array.from({ length: Math.floor(logMax - logMin) + 1 }, (_, i) => logMin + i).map((v) => {
            const x = PAD + ((v - logMin) / (logMax - logMin)) * (W - 2 * PAD);
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

          {/* Objects — labels alternate above (even idx) / below (odd idx)
             with leader lines so they never overlap. */}
          {SCALE_OBJECTS.map((o, i) => {
            const x = xOf(o.yearsAgo);
            const isSel = o.id === selected;
            const above = i % 2 === 0;
            const labelY = above ? AXIS_Y - 56 : AXIS_Y + 56;
            const dotY = above ? AXIS_Y - 32 : AXIS_Y + 32;
            const lineEnd = above ? AXIS_Y - 12 : AXIS_Y + 12;
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
                  y1={above ? AXIS_Y - 6 : AXIS_Y + 6}
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

/* ── Horizon Shells: concentric look-back rings around Earth ─────────
   Visualises the universe as nested time-shells, with the 13.8 Gyr
   decoupling wall (CMB) as the edge. Hover or tap each ring to see
   what we observe at that distance. */
type Shell = {
  id: string;
  yearsAgo: number;
  /** label appearing on the ring */
  label: string;
  desc: string;
};
const SHELLS: Shell[] = [
  { id: "stars", yearsAgo: 100, label: "Nearby stars", desc: "Sirius, α Centauri — light from human-recorded history." },
  { id: "mw", yearsAgo: 1e5, label: "Milky Way", desc: "100,000 light-years across — the disk we live in." },
  { id: "andromeda", yearsAgo: 2.5e6, label: "Local Group", desc: "Andromeda + dozens of dwarf galaxies." },
  { id: "supercluster", yearsAgo: 1e8, label: "Supercluster", desc: "Laniakea — our home supercluster, hundreds of millions of light-years across." },
  { id: "structure", yearsAgo: 1e9, label: "Large-scale", desc: "Filaments and voids — the cosmic web." },
  { id: "deepfield", yearsAgo: 1.34e10, label: "First galaxies", desc: "JWST deep fields — galaxies a few hundred million years after the Big Bang." },
  { id: "cmb", yearsAgo: 1.378e10, label: "CMB · opacity wall", desc: "The wall of last scattering. The universe was an opaque fog before 380,000 years. We cannot see past this." },
];

export function HorizonShellsPanel() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrub, setScrub] = useState(1);
  const W = 560;
  const H = 480;
  const cx = W / 2;
  const cy = H / 2;
  const maxR = 200;
  const logMin = 2; /* 10^2 yr — close enough to "stars" first ring */
  const logMax = Math.log10(SHELLS[SHELLS.length - 1].yearsAgo) + 0.05;

  function rOf(years: number) {
    const v = Math.log10(years);
    return ((v - logMin) / (logMax - logMin)) * maxR;
  }
  const scrubR = scrub * maxR;
  const scrubYears =
    Math.pow(10, logMin + (logMax - logMin) * scrub);

  const focus = hovered
    ? SHELLS.find((s) => s.id === hovered)!
    : SHELLS[SHELLS.length - 1];

  return (
    <FigurePanel
      idx="0.3.2"
      kicker="Horizon Shells · The Edge is a Wall of Time"
      caption="Concentric rings around Earth show what we see at each look-back distance. The outermost is the CMB — the universe was an opaque fog before that. We see no further, not because there is no further, but because no signal has had time to arrive."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* CMB outer fill */}
          <circle
            cx={cx}
            cy={cy}
            r={rOf(SHELLS[SHELLS.length - 1].yearsAgo)}
            fill="rgb(var(--c-accent-rgb) / 0.04)"
            stroke="rgb(var(--c-accent-rgb) / 0.35)"
            strokeWidth="1.4"
            strokeDasharray="2 3"
          />

          {/* Shells */}
          {SHELLS.slice(0, -1).map((s) => {
            const r = rOf(s.yearsAgo);
            const isHover = hovered === s.id;
            return (
              <g
                key={s.id}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="transparent"
                  stroke={
                    isHover
                      ? "rgb(var(--c-accent-rgb) / 0.9)"
                      : "rgb(var(--c-text-rgb) / 0.2)"
                  }
                  strokeWidth={isHover ? 1.4 : 0.6}
                />
                <text
                  x={cx + 4}
                  y={cy - r - 4}
                  fontSize={isHover ? 11 : 9}
                  letterSpacing={isHover ? "1" : "2"}
                  fontFamily="var(--font-mono)"
                  fill={
                    isHover
                      ? "rgb(var(--c-accent-rgb))"
                      : "rgb(var(--c-text-rgb) / 0.45)"
                  }
                >
                  {s.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* "Visible so far" disc — controlled by scrubber */}
          <circle
            cx={cx}
            cy={cy}
            r={scrubR}
            fill="rgb(var(--c-accent-rgb) / 0.07)"
            stroke="rgb(var(--c-accent-rgb) / 0.55)"
            strokeWidth="0.8"
          />

          {/* Earth marker */}
          <g>
            <circle cx={cx} cy={cy} r="4" fill="rgb(var(--c-accent-rgb))" />
            <circle
              cx={cx}
              cy={cy}
              r="10"
              fill="none"
              stroke="rgb(var(--c-accent-rgb) / 0.45)"
              strokeWidth="0.8"
            />
            <text
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="3"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-text-rgb) / 0.6)"
            >
              YOU
            </text>
          </g>

          {/* CMB label at top */}
          <text
            x={cx}
            y={cy - maxR - 16}
            textAnchor="middle"
            fontSize="10"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-accent-rgb) / 0.85)"
          >
            CMB · OPACITY WALL · 13.78 Gyr
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            look back …
          </label>
          <span className="font-mono text-[10px] text-plasma">
            {fmtYearsAgo(scrubYears)} ago
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={scrub}
          onChange={(e) => setScrub(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
      </div>

      <div
        className="mt-4 p-3 rounded-md text-[13px] text-white/80 leading-[1.55] font-sans"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">
          {focus.label}
        </span>
        {focus.desc}
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
            inflate the universe
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
