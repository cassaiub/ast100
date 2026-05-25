import { useState, type JSX, type ReactNode } from "react";

function FigurePanel({ idx, kicker, caption, children }: { idx: string; kicker: string; caption: ReactNode; children: ReactNode }) {
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

/* ── FourForcesPanel — Sankey-style force tree, 10⁻⁴³ s → 10⁻¹² s ───
   Based on the canonical "force tree" image in
   knowledgebase/2026-spring/media/forces.jpg. The diagram spans only
   from the Planck epoch (10⁻⁴³ s) to the electroweak symmetry break
   (10⁻¹² s, "1 picosecond") — by 1 ps all four fundamental forces
   exist as separate entities, so there is nothing more to show.

   Layout: the time axis lives on the LEFT half of the viewBox; the
   four bands terminate around x≈540 and the RIGHT half is a label
   panel with [name | strength bar | value | carrier] per force.
   Selecting a force (click a band or label, or press 1–4) highlights
   it and reveals an info box below the SVG, directly above the
   figcaption. */

type Force = {
  id: "strong" | "em" | "weak" | "gravity";
  name: string;
  /** Relative-strength label, as written on the image. */
  rel: string;
  /** Numeric log10 of relative strength — used to size the bar. */
  relLog: number;
  carrier: string;
  /** Tailwind-safe hex (matches the image's palette). */
  color: string;
  /** Final y on the SVG (in viewBox units). */
  yFinal: number;
  /** x position at which this force's band begins to diverge. */
  xBranch: number;
  how: string;
  discovered: string;
  examples: string;
};

/* viewBox 0..1000 × 0..360.
   Time region: x = 60..480 (10⁻⁴³ s → 10⁻¹² s).
   Bands end at x = 540 (X_BAND_END), then labels live in 560..980. */
const X_LEFT = 60;
const X_TIME_RIGHT = 480;
const X_BAND_END = 540;
const X_NAME = 560;
const X_BAR_START = 760;
const X_BAR_END = 920;
const X_VALUE = 935;
const LOG_T_LEFT = -43;
const LOG_T_RIGHT = -12;
function xForLogT(logT: number): number {
  const t = (logT - LOG_T_LEFT) / (LOG_T_RIGHT - LOG_T_LEFT);
  return X_LEFT + t * (X_TIME_RIGHT - X_LEFT);
}
const X_PLANCK = xForLogT(-43);
const X_GUT = xForLogT(-35);
const X_INFL_END = xForLogT(-32);
const X_EW = xForLogT(-12);

const Y_TRUNK = 180;
const Y_STRONG = 80;
const Y_EM = 160;
const Y_WEAK = 220;
const Y_GRAVITY = 300;

const FORCES: Force[] = [
  {
    id: "strong",
    name: "Strong Nuclear",
    rel: "1",
    relLog: 0,
    carrier: "gluon",
    color: "#2dd4bf",
    yFinal: Y_STRONG,
    xBranch: X_GUT,
    how: "Binds quarks into protons and neutrons via gluons; a residual force then binds protons and neutrons into atomic nuclei.",
    discovered: "1935, Hideki Yukawa (meson exchange theory); confirmed experimentally 1947.",
    examples: "Stable atomic nuclei, hydrogen-to-helium fusion that powers stars.",
  },
  {
    id: "em",
    name: "Electromagnetic",
    rel: "10⁻²",
    relLog: -2,
    carrier: "photon",
    color: "#a78bda",
    yFinal: Y_EM,
    xBranch: X_EW,
    how: "Force between electrically charged particles, carried by photons; binds electrons to nuclei and underlies all chemistry.",
    discovered: "Unified 1864 by James Clerk Maxwell; built on Ørsted's 1820 observation of magnetic deflection.",
    examples: "Light, chemical bonds, magnetism, every signal in your nervous system.",
  },
  {
    id: "weak",
    name: "Weak Nuclear",
    rel: "10⁻⁶",
    relLog: -6,
    carrier: "W, Z boson",
    color: "#e5536b",
    yFinal: Y_WEAK,
    xBranch: X_EW,
    how: "Changes the flavor of quarks and leptons via massive W⁺, W⁻, and Z bosons; only acts over ~10⁻¹⁸ m.",
    discovered: "1934, Enrico Fermi (theory of beta decay).",
    examples: "Beta decay, radioactive isotopes, the first step of stellar fusion (proton → neutron).",
  },
  {
    id: "gravity",
    name: "Gravitational",
    rel: "10⁻³⁹",
    relLog: -39,
    carrier: "graviton",
    color: "#7fb682",
    yFinal: Y_GRAVITY,
    xBranch: X_PLANCK,
    how: "Massive objects attract each other proportional to 1/r²; general relativity recasts this as the curvature of spacetime.",
    discovered: "1687, Isaac Newton (Principia); reformulated 1915 by Einstein.",
    examples: "Planetary orbits, ocean tides, black holes, the structure of galaxies.",
  },
];

/* Bezier curl from (xBranch, Y_TRUNK) to (xBranch + curl, yFinal),
   then straight to X_BAND_END. */
function bandPath(xBranch: number, yFinal: number): string {
  const curlEnd = xBranch + 80;
  return `M ${xBranch} ${Y_TRUNK} C ${xBranch + 55} ${Y_TRUNK}, ${xBranch + 25} ${yFinal}, ${curlEnd} ${yFinal} L ${X_BAND_END} ${yFinal}`;
}

const BAND_WIDTH = 26;

/* Strength bar: log scale across about 8 orders of magnitude, with
   a floor of 6% so gravity is still visible as a sliver.
   strong (10⁰)  → 100%
   EM    (10⁻²) → 75%
   weak  (10⁻⁶) → 25%
   gravity(10⁻³⁹) → 6%   (clamped) */
function barWidthPct(relLog: number): number {
  const LOG_MIN = -8;
  const v = (relLog - LOG_MIN) / (0 - LOG_MIN);
  return Math.max(0.06, v) * 100;
}

export function FourForcesPanel(): JSX.Element {
  const [selId, setSelId] = useState<Force["id"]>("strong");
  const sel = FORCES.find((f) => f.id === selId)!;

  return (
    <FigurePanel
      idx="1.1.a"
      kicker="From one Superforce to four"
      caption="A Sankey-style tree of the four fundamental forces between the Planck epoch (10⁻⁴³ s) and one picosecond (10⁻¹² s). Each band shows when that force decoupled from the unified Superforce, with relative strength (log scale) and carrier particle. Click a band — or press 1–4 — to read how that force works, when we discovered it, and what it does."
    >
      {/* SVG-only wrapper — keep `.fig-viz` containing JUST the SVG so
          the fullscreen CSS (which makes `.fig-viz` a centered flex
          container claiming all remaining height) doesn't swallow the
          detail box. The detail box + hidden a11y buttons are siblings
          BELOW this `.fig-viz`. */}
      <div
        className="fig-viz relative w-full"
        style={{ background: "rgb(var(--c-text-rgb) / 0.02)", borderRadius: 8, padding: "12px 10px 14px", border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}
      >
        <svg
          viewBox="0 0 1000 360"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Tree of the four fundamental forces from the Planck epoch to one picosecond"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* ── Inflation gradient ──────────────────────────────── */}
          <defs>
            <linearGradient id="inflation" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgb(255 255 255 / 0)" />
              <stop offset="35%" stopColor="rgb(255 255 255 / 0.16)" />
              <stop offset="100%" stopColor="rgb(255 255 255 / 0)" />
            </linearGradient>
          </defs>
          <rect x={X_GUT - 20} y={26} width={X_INFL_END - X_GUT + 50} height={310} fill="url(#inflation)" />

          {/* ── Axes labels ─────────────────────────────────────── */}
          <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgb(var(--c-text-rgb) / 0.55)">
            <text x={X_LEFT - 18} y={20} textAnchor="end">Temp (K)</text>
            <text x={xForLogT(-43)} y={20} textAnchor="middle">10³²</text>
            <text x={xForLogT(-35)} y={20} textAnchor="middle">10²⁸</text>
            <text x={xForLogT(-12)} y={20} textAnchor="middle">10¹⁵</text>
          </g>
          <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgb(var(--c-text-rgb) / 0.55)">
            <text x={X_LEFT - 18} y={344} textAnchor="end">Time (s)</text>
            <text x={xForLogT(-43)} y={344} textAnchor="middle">10⁻⁴³</text>
            <text x={xForLogT(-35)} y={344} textAnchor="middle">10⁻³⁵</text>
            <text x={xForLogT(-12)} y={344} textAnchor="middle">10⁻¹²</text>
            <text x={xForLogT(-12)} y={356} textAnchor="middle" fontSize="9" fill="rgb(var(--c-text-rgb) / 0.4)">
              picosecond
            </text>
          </g>
          {/* Vertical ticks */}
          <g stroke="rgb(var(--c-text-rgb) / 0.10)" strokeDasharray="2 4">
            <line x1={xForLogT(-43)} y1={26} x2={xForLogT(-43)} y2={332} />
            <line x1={xForLogT(-35)} y1={26} x2={xForLogT(-35)} y2={332} />
            <line x1={xForLogT(-12)} y1={26} x2={xForLogT(-12)} y2={332} />
          </g>
          {/* Inflation label */}
          <text
            x={(X_GUT + X_INFL_END) / 2}
            y={324}
            fontFamily="Inter, sans-serif"
            fontSize="10"
            textAnchor="middle"
            fill="rgb(var(--c-text-rgb) / 0.6)"
            fontStyle="italic"
          >
            Inflation
          </text>

          {/* ── TOE / GUT / EW trunk ───────────────────────────── */}
          <line
            x1={X_LEFT}
            y1={Y_TRUNK}
            x2={X_EW}
            y2={Y_TRUNK}
            stroke="#3a2a4a"
            strokeWidth={BAND_WIDTH}
            strokeLinecap="round"
            opacity={0.95}
          />
          <text
            x={(X_LEFT + X_GUT) / 2}
            y={Y_TRUNK + 4}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="12"
            fontWeight="600"
            fill="#ffffff"
            letterSpacing="0.06em"
          >
            TOE
          </text>
          <text
            x={(X_GUT + X_EW) / 2}
            y={Y_TRUNK + 4}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="12"
            fontWeight="600"
            fill="#ffffff"
            letterSpacing="0.06em"
          >
            GUT &nbsp;→&nbsp; Electroweak
          </text>

          {/* EW-symmetry-break tag */}
          <g>
            <line x1={X_EW} y1={Y_TRUNK - 16} x2={X_EW} y2={Y_TRUNK + 16} stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="1" />
            <text
              x={X_EW - 6}
              y={Y_TRUNK - 24}
              fontFamily="Inter, sans-serif"
              fontSize="9.5"
              fontStyle="italic"
              fill="rgb(var(--c-text-rgb) / 0.75)"
              textAnchor="end"
            >
              Electroweak
            </text>
            <text
              x={X_EW - 6}
              y={Y_TRUNK - 12}
              fontFamily="Inter, sans-serif"
              fontSize="9.5"
              fontStyle="italic"
              fill="rgb(var(--c-text-rgb) / 0.75)"
              textAnchor="end"
            >
              symmetry broken
            </text>
          </g>

          {/* ── Four force bands (left half — the tree itself) ───── */}
          {FORCES.map((f) => {
            const isSel = selId === f.id;
            return (
              <path
                key={`band-${f.id}`}
                d={bandPath(f.xBranch, f.yFinal)}
                stroke={f.color}
                strokeWidth={BAND_WIDTH}
                fill="none"
                strokeLinecap="round"
                opacity={isSel ? 1 : 0.6}
                style={{ transition: "opacity 220ms var(--ease)", cursor: "pointer" }}
                onClick={() => setSelId(f.id)}
              />
            );
          })}

          {/* ── Right-half label panel: per-force row ──────────────
             Each row shows: connector line from band end → name,
             then a strength bar, then the strength value, then the
             carrier on a second line. Clicking the row also selects. */}
          {FORCES.map((f, i) => {
            const isSel = selId === f.id;
            return (
              <g
                key={`label-${f.id}`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelId(f.id)}
                opacity={isSel ? 1 : 0.7}
              >
                {/* Selection background block — full row, very subtle */}
                {isSel && (
                  <rect
                    x={X_NAME - 8}
                    y={f.yFinal - 28}
                    width={1000 - X_NAME - 4}
                    height={56}
                    rx={6}
                    fill={`${f.color}1f`}
                    stroke={`${f.color}66`}
                    strokeWidth={1}
                  />
                )}
                {/* Tiny connector dot */}
                <circle cx={X_BAND_END + 6} cy={f.yFinal} r={4} fill={f.color} />
                {/* Force name (above bar) */}
                <text
                  x={X_NAME}
                  y={f.yFinal - 6}
                  fontFamily="Inter, sans-serif"
                  fontSize="13"
                  fontWeight="600"
                  fill={isSel ? f.color : "rgb(var(--c-text-rgb) / 0.88)"}
                  letterSpacing="0.05em"
                  style={{ textTransform: "uppercase", transition: "fill 220ms var(--ease)" }}
                >
                  {f.name.toUpperCase()} {isSel ? "▸" : ""}
                </text>
                {/* Carrier (below bar) */}
                <text
                  x={X_NAME}
                  y={f.yFinal + 22}
                  fontFamily="Inter, sans-serif"
                  fontSize="10"
                  fontStyle="italic"
                  fill="rgb(var(--c-text-rgb) / 0.6)"
                >
                  carrier: {f.carrier}
                </text>
                {/* Strength bar — track */}
                <rect
                  x={X_BAR_START}
                  y={f.yFinal - 2}
                  width={X_BAR_END - X_BAR_START}
                  height={10}
                  rx={5}
                  fill="rgb(var(--c-text-rgb) / 0.08)"
                />
                {/* Strength bar — fill */}
                <rect
                  x={X_BAR_START}
                  y={f.yFinal - 2}
                  width={(barWidthPct(f.relLog) / 100) * (X_BAR_END - X_BAR_START)}
                  height={10}
                  rx={5}
                  fill={f.color}
                  opacity={isSel ? 1 : 0.7}
                  style={{ transition: "opacity 220ms var(--ease)" }}
                />
                {/* Strength value */}
                <text
                  x={X_VALUE}
                  y={f.yFinal + 7}
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="11"
                  fontWeight="500"
                  fill={isSel ? f.color : "rgb(var(--c-text-rgb) / 0.82)"}
                  textAnchor="start"
                >
                  {f.rel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Detail box below SVG, above the figcaption ─────────── */}
      <div
        className="mt-3 rounded-md grid gap-3 md:grid-cols-[1fr_1fr_1fr]"
        style={{
          background: "rgb(var(--c-text-rgb) / 0.03)",
          border: `1px solid ${sel.color}66`,
          boxShadow: `inset 0 0 0 1px ${sel.color}22`,
          padding: "12px 14px",
          transition: "border-color 220ms var(--ease)",
          flex: "0 0 auto",
        }}
      >
        <div className="md:col-span-3 font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: sel.color }}>
          {sel.name}
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-1">How it works</div>
          <div className="text-[13px] text-white/85 leading-[1.55] font-sans">{sel.how}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-1">Discovered</div>
          <div className="text-[13px] text-white/85 leading-[1.55] font-sans">{sel.discovered}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-1">Examples</div>
          <div className="text-[13px] text-white/85 leading-[1.55] font-sans">{sel.examples}</div>
        </div>
      </div>

      {/* Hidden buttons for FigureFrame's keyboard navigator
         (rule 3 — numeric pill set). ←/→ walks the pills in order;
         1–4 jumps direct. */}
      <div className="sr-only" aria-hidden="false">
        {FORCES.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelId(f.id)}
            data-shortcut={String(i + 1)}
            className={selId === f.id ? "is-active" : ""}
            aria-pressed={selId === f.id}
          >
            {f.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
