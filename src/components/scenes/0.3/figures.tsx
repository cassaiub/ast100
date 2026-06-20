import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

/* ── Shared figure frame (same pattern as 0.2/figures.tsx) ────────── */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  sidebar = false,
  rail,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  /** Figure-left / caption-right fullscreen layout (see global.css). */
  sidebar?: boolean;
  /** Controls/detail for sidebar Tier 2 — a sibling `.fig-rail` lifted into
      the right column in fullscreen; a plain block in normal flow. */
  rail?: ReactNode;
}) {
  const cls = `figure-stub my-12 rounded-md p-4 md:p-6${sidebar ? " is-fs-sidebar" : ""}`;
  return (
    <figure data-fade className={cls}>
      {children}
      {rail && <div className="fig-rail">{rail}</div>}
      <figcaption>
        <span className="figure-tag">Fig. {idx}</span>
        <span className="figure-title"> — {kicker}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
}

/* Tracks `.is-fs` on the enclosing FigureFrame so HTML control text scales up
   and the balloon canvas can fill the left column in fullscreen. Same
   MutationObserver pattern as 1.3 / 2.4 figures.tsx. */
function useFs(ref: { current: Element | null }) {
  const [fs, setFs] = useState(false);
  useEffect(() => {
    const frame = ref.current?.closest("[data-figure-frame]");
    if (!frame) return;
    const sync = () => setFs(frame.classList.contains("is-fs"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(frame, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return fs;
}

/* ── Cosmic Scale: 27-object distance ladder ─────────────────────────
   Objects from knowledgebase/claudemds/cosmic_distances.md, sorted by
   light-travel time, from the Moon (1.28 s) to the Cosmic Microwave
   Background (13.8 Gyr).

   The axis uses RANK position (i / (N-1)) rather than log10(time).
   Reason: lookback saturates near the age of the universe, so a pure
   log10 axis crushes every z > 6 object (TON 618 → CMB, ~12.1–13.8
   Gyr) into the last 1 % of the line — unreadable. Rank spacing
   gives all 27 objects equal axis room while preserving sort order;
   the inset always shows the precise distance + light-travel of the
   selected object, so the underlying metric is never hidden. */
type ScaleObject = {
  id: string;
  /** Long-form name shown as the inset header. */
  name: string;
  /** Short name shown on the axis (must fit ~12 chars to row-pack). */
  short: string;
  /** Compact distance label rendered as the axis tick label. */
  tick: string;
  /** Comoving distance, formatted (e.g. "2.54 Mly"). */
  distance: string;
  /** Light-travel (lookback) time, formatted (e.g. "2.54 million years"). */
  lookback: string;
  /** One-sentence description shown in the inset. */
  description: string;
};
const SCALE_OBJECTS: ScaleObject[] = [
  { id: "moon",      short: "Moon",        tick: "1.3 ls",  name: "Moon",                                distance: "384,400 km", lookback: "1.28 seconds",        description: "Earth's only natural satellite; the largest and brightest object in the night sky." },
  { id: "sun",       short: "Sun",         tick: "1 AU",    name: "Sun",                                 distance: "1 AU",       lookback: "8.3 minutes",         description: "Our host star; contains 99.86 % of the solar system's total mass." },
  { id: "neptune",   short: "Neptune",     tick: "30 AU",   name: "Neptune",                             distance: "30 AU",      lookback: "4.2 hours",           description: "Outermost planet; an ice giant with the fastest winds in the solar system." },
  { id: "proxima",   short: "Proxima",     tick: "4 ly",    name: "Proxima Centauri",                    distance: "4.24 ly",    lookback: "4.24 years",          description: "Nearest star to the Sun; a dim red dwarf with at least one rocky planet." },
  { id: "pleiades",  short: "Pleiades",    tick: "444 ly",  name: "Pleiades",                            distance: "444 ly",     lookback: "444 years",           description: "Iconic open star cluster of hot blue stars; visible to the naked eye." },
  { id: "sgra",      short: "Sgr A*",      tick: "26 kly",  name: "Galactic Center (Sgr A*)",            distance: "26,000 ly",  lookback: "26,000 years",        description: "Core of the Milky Way, home to a 4 million solar-mass black hole." },
  { id: "lmc",       short: "LMC",         tick: "160 kly", name: "Large Magellanic Cloud",              distance: "160,000 ly", lookback: "160,000 years",       description: "Largest satellite galaxy of the Milky Way; visible from the southern hemisphere." },
  { id: "andromeda", short: "Andromeda",   tick: "2.5 Mly", name: "Andromeda Galaxy (M31)",              distance: "2.54 Mly",   lookback: "2.54 million years",  description: "Nearest major galaxy; on a collision course with the Milky Way in ~4.5 Gyr." },
  { id: "cena",      short: "Cen A",       tick: "13 Mly",  name: "Centaurus A",                         distance: "13 Mly",     lookback: "13 million years",    description: "Giant elliptical with a prominent dust lane and an active jet-producing nucleus." },
  { id: "m87",       short: "M87",         tick: "54 Mly",  name: "M87 (Virgo Cluster)",                 distance: "54 Mly",     lookback: "54 million years",    description: "Massive elliptical whose 6.5-billion-M☉ black hole was the first ever imaged." },
  { id: "norma",     short: "Norma C.",    tick: "220 Mly", name: "Great Attractor (Norma Cluster)",     distance: "220 Mly",    lookback: "220 million years",   description: "Gravitational anomaly pulling millions of galaxies — including our own — toward it." },
  { id: "coma",      short: "Coma",        tick: "321 Mly", name: "Coma Cluster",                        distance: "321 Mly",    lookback: "320 million years",   description: "One of the densest known galaxy clusters; historically key to discovering dark matter." },
  { id: "shapley",   short: "Shapley",     tick: "650 Mly", name: "Shapley Supercluster",                distance: "650 Mly",    lookback: "630 million years",   description: "Largest concentration of galaxies in the nearby universe; about 8,000 galaxies." },
  { id: "sloan",     short: "Sloan Wall",  tick: "1 Gly",   name: "Sloan Great Wall",                    distance: "~1 Gly",     lookback: "~980 million years",  description: "Vast filament of galaxy clusters stretching ~1.4 billion light-years." },
  { id: "q3c273",    short: "3C 273",      tick: "2.4 Gly", name: "3C 273 (brightest quasar)",           distance: "2.4 Gly",    lookback: "2.1 billion years",   description: "Brightest quasar in Earth's sky; its jet alone outshines most galaxies." },
  { id: "bullet",    short: "Bullet",      tick: "3.7 Gly", name: "Bullet Cluster",                      distance: "3.7 Gly",    lookback: "3.3 billion years",   description: "Two colliding galaxy clusters; the strongest direct evidence for dark matter." },
  { id: "elgordo",   short: "El Gordo",    tick: "7.2 Gly", name: "El Gordo Cluster",                    distance: "7.2 Gly",    lookback: "6.0 billion years",   description: "Largest known galaxy-cluster collision in the observable universe." },
  { id: "hcbgw",     short: "Hercules W.", tick: "10 Gly",  name: "Hercules–Corona Borealis Great Wall", distance: "~10 Gly",    lookback: "~9.0 billion years",  description: "Largest known structure in the universe; ~10 billion ly across, a gamma-ray-burst hotspot." },
  { id: "ton618",    short: "TON 618",     tick: "17 Gly",  name: "TON 618",                             distance: "17.1 Gly",   lookback: "10.4 billion years",  description: "One of the most massive black holes known; 66 billion solar masses." },
  { id: "apm08279",  short: "APM 08279",   tick: "24 Gly",  name: "APM 08279+5255",                      distance: "24.3 Gly",   lookback: "12.1 billion years",  description: "Hyperluminous quasar; one of the most intrinsically bright objects ever observed." },
  { id: "sdss1030",  short: "SDSS J1030",  tick: "28 Gly",  name: "SDSS J1030+0524",                     distance: "27.8 Gly",   lookback: "12.85 billion years", description: "High-redshift quasar (z = 6.28); seen when the universe was less than 1 Gyr old." },
  { id: "ulas1120",  short: "ULAS J1120",  tick: "29 Gly",  name: "ULAS J1120+0641",                     distance: "28.8 Gly",   lookback: "12.97 billion years", description: "Quasar (z = 7.09) powered by a 2-billion-M☉ black hole; puzzlingly massive for its age." },
  { id: "j0313",     short: "J0313",       tick: "29 Gly",  name: "J0313−1806",                          distance: "29.3 Gly",   lookback: "13.03 billion years", description: "Most distant known quasar (z = 7.64); a 1.6-billion-M☉ black hole at 670 Myr after the Big Bang." },
  { id: "grb090423", short: "GRB 090423",  tick: "30 Gly",  name: "GRB 090423",                          distance: "29.8 Gly",   lookback: "13.1 billion years",  description: "Gamma-ray burst (z = 8.2); one of the most distant individual events ever detected." },
  { id: "gnz11",     short: "GN-z11",      tick: "32 Gly",  name: "GN-z11",                              distance: "32.1 Gly",   lookback: "13.4 billion years",  description: "Exceptionally luminous galaxy (z = 11.1); seen by Hubble just 430 Myr after the Big Bang." },
  { id: "jades",     short: "JADES",       tick: "34 Gly",  name: "JADES-GS-z14-0",                      distance: "33.6 Gly",   lookback: "13.5 billion years",  description: "Most distant confirmed galaxy (z = 14.3); seen 290 million years after the Big Bang." },
  { id: "cmb",       short: "CMB",         tick: "46 Gly",  name: "Cosmic Microwave Background",         distance: "45.7 Gly",   lookback: "13.8 billion years",  description: "Afterglow of the Big Bang; the oldest light we can observe, from 380,000 years after t = 0." },
];

/* ── Label row layout — four staggered rows above/below the axis. The
   greedy packer (COSMIC_ROW below) picks the lowest-index row with no
   horizontal overlap. With 27 objects on a 900-px viewBox the long
   names ("Hercules W.", "SDSS J1030", "APM 08279") still find a row at
   a comfortable distance from their neighbours. */
type LabelRow = 0 | 1 | 2 | 3;
const ROW_LAYOUT: Record<
  LabelRow,
  { labelY: number; dotY: number; lineEnd: number; axisOffset: number }
> = {
  0: { labelY: -52, dotY: -32, lineEnd: -12, axisOffset: -6 },
  1: { labelY: +52, dotY: +32, lineEnd: +12, axisOffset: +6 },
  2: { labelY: -112, dotY: -74, lineEnd: -40, axisOffset: -6 },
  3: { labelY: +112, dotY: +74, lineEnd: +40, axisOffset: +6 },
};
const ROW_ORDER: LabelRow[] = [0, 1, 2, 3];

function approxLabelWidth(name: string): number {
  /* sans-serif 11px with letter-spacing≈1, ~6.3 px/char + padding */
  return name.length * 6.3 + 8;
}

/* ── Cosmic-Scale geometry. The axis is rank-based: position(i) =
   PAD + (i / (N-1)) · (W − 2·PAD); see the SCALE_OBJECTS comment for
   why we don't use log10(time). Wider viewBox (1100) gives the tick
   labels and longer main labels room to breathe. */
const COSMIC_W = 1100;
const COSMIC_H = 380;
const COSMIC_PAD = 64;
const COSMIC_AXIS_Y = COSMIC_H / 2;
function cosmicX(rank: number): number {
  const n = SCALE_OBJECTS.length;
  if (n <= 1) return COSMIC_W / 2;
  const frac = rank / (n - 1);
  return COSMIC_PAD + frac * (COSMIC_W - 2 * COSMIC_PAD);
}

/* Sorted-by-x greedy row assignment. SCALE_OBJECTS is already in
   distance order, so iterating in index order matches axis order. */
const COSMIC_ROW: Record<string, LabelRow> = (() => {
  const PAD = 6;
  const items = SCALE_OBJECTS.map((o, i) => ({
    id: o.id,
    x: cosmicX(i),
    w: approxLabelWidth(o.short),
  }));
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
  const [selectedIdx, setSelectedIdx] = useState<number>(7); // default: Andromeda
  const W = COSMIC_W;
  const H = COSMIC_H;
  const PAD = COSMIC_PAD;
  const AXIS_Y = COSMIC_AXIS_Y;

  const sel = SCALE_OBJECTS[selectedIdx];
  const total = SCALE_OBJECTS.length;

  return (
    <FigurePanel
      idx="0.3.a"
      kicker="Cosmic Scale · From the Moon to the Horizon"
      caption={
        <>
          27 real objects lined up by how long their light has been
          travelling to us, from the <em>Moon</em> (1.28 seconds ago) to
          the <em>Cosmic Microwave Background</em> (13.8 billion years ago —
          the oldest light there is). <strong>Drag the line, click any dot,
          or press the ← / →</strong> arrow keys (hold <em>Shift</em> to jump
          10 at a time) to read how far each object sits and how far back in
          time you are looking. The dots are spaced evenly rather than to
          true scale — otherwise the most distant objects would all pile up
          at the far right — but the panel below always shows the exact
          distance and travel time. The lesson in one line: nothing you ever
          see in the sky is happening &ldquo;now.&rdquo;
        </>
      }
    >
      {/* Single wrapper so figure-stub has just one non-figcaption
         child. The global fullscreen CSS gives every direct child
         `flex: 1 1 auto` — with two children (SVG + inset) they used
         to split the height 50/50 and the SVG was crushed. With one
         wrapper this child claims the whole grow and we apportion
         inside: SVG flex-1, inset flex-none. */}
      <div className="flex flex-col gap-3">
        {/* Hidden range input — the keyboard-navigation backbone.
           FigureFrame's `frameKey` queries `input[type=range]` and
           nudges it on ←/→ (Shift = ×10). querySelector finds
           display:none elements, and dispatched input/change events
           still bubble through React's delegation, so onChange fires
           even though the input is non-visual. We use display:none
           (not position:absolute) so it can't perturb the fullscreen
           layout, which was the most likely cause of the earlier FS
           bug where things rendered side-by-side. */}
        <input
          type="range"
          min={0}
          max={total - 1}
          step={1}
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(parseInt(e.target.value, 10))}
          aria-label={`Select cosmic object: currently ${sel.name}`}
          style={{ display: "none" }}
        />

        {/* Visualisation — fixed pixel height in normal flow,
           flex-grows in fullscreen via the parent wrapper's flex
           layout. The SVG carries an inline `width:100%; height:100%`
           so it overrides the global FS rule that sets `width:auto;
           height:auto` on every figure-stub SVG (that rule was making
           the SVG fall back to its intrinsic 300×150 default in
           fullscreen, leaving a small figure floating in a big empty
           container). */}
        <div
          className="fig-viz relative w-full overflow-hidden rounded-md flex-1 min-h-[320px]"
          style={{ height: 400 }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            {/* Base axis line */}
            <line
              x1={PAD}
              x2={W - PAD}
              y1={AXIS_Y}
              y2={AXIS_Y}
              stroke="rgb(var(--c-text-rgb) / 0.22)"
              strokeWidth="1"
            />

            {/* The 27 cosmic objects. Each group has a transparent
               hit area, axis tick, leader stub, dot, name label, and
               a small distance tick label placed OPPOSITE the name
               (so it never crosses the leader). */}
            {SCALE_OBJECTS.map((o, i) => {
              const x = cosmicX(i);
              const isSel = i === selectedIdx;
              const row = COSMIC_ROW[o.id];
              const geom = ROW_LAYOUT[row];
              const labelY = AXIS_Y + geom.labelY;
              const dotY = AXIS_Y + geom.dotY;
              const lineEnd = AXIS_Y + geom.lineEnd;
              const labelAbove = geom.labelY < 0;
              const tickLabelY = labelAbove ? AXIS_Y + 18 : AXIS_Y - 12;
              return (
                <g
                  key={o.id}
                  onClick={() => setSelectedIdx(i)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Generous transparent hit area covering the
                     axis-tick → leader → dot → label column. Goes
                     first so it sits beneath the visible glyphs. */}
                  <rect
                    x={x - 16}
                    y={labelAbove ? labelY - 12 : AXIS_Y - 18}
                    width={32}
                    height={
                      labelAbove
                        ? AXIS_Y - labelY + 30
                        : labelY - AXIS_Y + 30
                    }
                    fill="transparent"
                  />
                  {/* Leader from axis to dot region (short stub) */}
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
                    y1={AXIS_Y - 5}
                    y2={AXIS_Y + 5}
                    stroke={
                      isSel
                        ? "rgb(var(--c-accent-rgb))"
                        : "rgb(var(--c-text-rgb) / 0.4)"
                    }
                    strokeWidth={isSel ? 1.6 : 0.8}
                  />
                  {/* Distance tick label, placed on the opposite
                     side of the axis from the main name label. */}
                  <text
                    x={x}
                    y={tickLabelY}
                    textAnchor="middle"
                    fontSize={isSel ? 9 : 8}
                    letterSpacing="0.3"
                    fontFamily="var(--font-mono)"
                    fontWeight={isSel ? 500 : 400}
                    fill={
                      isSel
                        ? "rgb(var(--c-accent-rgb))"
                        : "rgb(var(--c-text-rgb) / 0.5)"
                    }
                  >
                    {o.tick}
                  </text>
                  {/* Dot */}
                  <circle
                    cx={x}
                    cy={dotY}
                    r={isSel ? 5.5 : 4}
                    fill={
                      isSel
                        ? "rgb(var(--c-accent-rgb))"
                        : "rgb(var(--c-text-rgb) / 0.6)"
                    }
                    style={{
                      filter: isSel
                        ? "drop-shadow(0 0 10px rgb(var(--c-accent-rgb) / 0.75))"
                        : "none",
                    }}
                  />
                  {/* Name label */}
                  <text
                    x={x}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={isSel ? 13 : 11}
                    letterSpacing={isSel ? "0.6" : "1"}
                    fontFamily={
                      isSel ? "var(--font-serif)" : "var(--font-sans)"
                    }
                    fontStyle={isSel ? "italic" : "normal"}
                    fontWeight={isSel ? 500 : 400}
                    fill={
                      isSel
                        ? "rgb(var(--c-accent-rgb))"
                        : "rgb(var(--c-text-rgb) / 0.82)"
                    }
                  >
                    {o.short}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected-object inset — three rows distribute the text
           evenly: (1) counter + name + prev/next, (2) distance and
           light-travel as inline stat pairs, (3) description across
           the full width. No fixed min-heights, so short descriptions
           don't leave empty vertical gaps. */}
        <div
          className="rounded-md p-4 flex-none"
          style={{
            background: "rgb(var(--c-accent-rgb) / 0.04)",
            border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          }}
        >
          <div className="flex items-baseline justify-between gap-4 mb-2.5 flex-wrap">
            <div className="flex items-baseline gap-3 min-w-0 flex-1">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/45 shrink-0">
                {selectedIdx + 1} / {total}
              </span>
              <span
                className="font-serif font-medium"
                style={{
                  fontSize: "1.4rem",
                  color: "var(--c-accent)",
                  lineHeight: 1.15,
                }}
              >
                {sel.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedIdx((i) => Math.max(0, i - 1))}
                disabled={selectedIdx === 0}
                className="pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous object"
                title="Previous · ←"
              >
                ← prev
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedIdx((i) => Math.min(total - 1, i + 1))
                }
                disabled={selectedIdx === total - 1}
                className="pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next object"
                title="Next · →"
              >
                next →
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-1 mb-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
                distance
              </span>
              <span
                className="font-serif text-white/90"
                style={{ fontSize: "15px" }}
              >
                {sel.distance}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
                light-travel
              </span>
              <span
                className="font-serif text-white/90"
                style={{ fontSize: "15px" }}
              >
                {sel.lookback}
              </span>
            </div>
          </div>
          <div className="text-[13.5px] text-white/85 leading-[1.6] font-sans">
            {sel.description}
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] text-[10.5px] text-white/45 leading-[1.5] font-sans">
            <span className="font-mono uppercase tracking-[0.14em] text-white/55">key:</span>{" "}
            <em>light-travel</em> = how long the light has been on its way (so how
            far back in time you are seeing). <span className="font-mono">ly</span> = light-year
            (the distance light covers in a year); <span className="font-mono">Mly</span>/<span className="font-mono">Gly</span> = million / billion light-years;
            {" "}<span className="font-mono">AU</span> = Earth–Sun distance;
            {" "}<span className="font-mono">M☉</span> = mass of one Sun;
            {" "}<span className="font-mono">z</span> = redshift, how much a galaxy&apos;s light is
            stretched by cosmic expansion (bigger <span className="font-mono">z</span> = older, more distant).
          </div>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Balloon Analogy (3D) ─────────────────────────────────────────────
   Eddington's expanding-balloon picture, rendered in three.  Galaxies
   are dots glued to the surface of a sphere; the slider scales the
   radius (the Friedmann–Lemaître scale factor a(t)).  As the balloon
   inflates, every surface distance grows in proportion — galaxy meshes
   keep a constant size while their world positions spread apart.

   Pick any galaxy to be 'you' (accent highlight + great-circle arcs from
   you to every other galaxy); pick a different one and the picture from
   that observer is exactly the same.  No centre on the surface — that
   is the cosmological principle. */
const BALLOON_BASE_R = 1.0;
const BALLOON_GALAXY_R = 0.06;
const BALLOON_OBS_R = 0.095;
const BALLOON_GALAXY_COUNT = 6;
const BALLOON_NAMES = ["α", "β", "γ", "δ", "ε", "ζ"] as const;
const BALLOON_COLOR_OBS = "#f59e0b";
const BALLOON_COLOR_OTHER = "#e2e8f0";
const BALLOON_COLOR_SKIN = "#22d3ee";
const BALLOON_COLOR_ARC = "#f59e0b";

/* Flat-ΛCDM cosmology, Planck 2018 best fit. Used to map slider's a(t)
   to the age of the universe via the closed-form
       t(a) = 2/(3·H₀·√Ω_Λ) · arcsinh(√(Ω_Λ/Ω_m) · a^(3/2))
   which assumes matter + dark energy only (radiation-dominated era
   is shorter than the slider's resolution, so safe to ignore). */
const COSMO_OMEGA_M = 0.315;
const COSMO_OMEGA_L = 0.685;
const COSMO_HUBBLE_TIME_GYR = 14.51; // 1 / H₀ in Gyr
function balloonAgeGyr(a: number): number {
  if (a <= 0) return 0;
  const arg = Math.sqrt(COSMO_OMEGA_L / COSMO_OMEGA_M) * Math.pow(a, 1.5);
  return (
    ((2 / (3 * Math.sqrt(COSMO_OMEGA_L))) * Math.asinh(arg)) *
    COSMO_HUBBLE_TIME_GYR
  );
}
function balloonFmtAge(gyr: number): string {
  if (gyr <= 0) return "0 yr";
  if (gyr < 0.001) return `${Math.round(gyr * 1e6)} kyr`;
  if (gyr < 1) return `${Math.round(gyr * 1000)} Myr`;
  return `${gyr.toFixed(1)} Gyr`;
}

/* Fibonacci-spiral N points on the unit sphere.  Clamped to |y| ≤ 0.78
   so no galaxy sits exactly at a pole (cleaner labels, no degenerate
   arcs). */
function fibonacciSphere(n: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = (1 - (i / Math.max(1, n - 1)) * 2) * 0.78;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return pts;
}
const BALLOON_UNIT = fibonacciSphere(BALLOON_GALAXY_COUNT);

/* Great-circle arc between two unit-sphere points, scaled to radius R.
   Uses spherical linear interpolation; the buffer is rebuilt whenever
   observer, target, or scale changes. */
function BalloonArc({
  obsIdx,
  tgtIdx,
  R,
  color,
}: {
  obsIdx: number;
  tgtIdx: number;
  R: number;
  color: string;
}) {
  const SEGMENTS = 32;
  const positions = useMemo(
    () => new Float32Array((SEGMENTS + 1) * 3),
    [],
  );
  const geomRef = useRef<THREE.BufferGeometry>(null!);

  useEffect(() => {
    const p1 = BALLOON_UNIT[obsIdx];
    const p2 = BALLOON_UNIT[tgtIdx];
    const v1 = new THREE.Vector3(p1[0], p1[1], p1[2]);
    const v2 = new THREE.Vector3(p2[0], p2[1], p2[2]);
    const omega = v1.angleTo(v2);
    const sinOmega = Math.sin(omega) || 1e-6;
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const a = Math.sin((1 - t) * omega) / sinOmega;
      const b = Math.sin(t * omega) / sinOmega;
      positions[i * 3 + 0] = (v1.x * a + v2.x * b) * R;
      positions[i * 3 + 1] = (v1.y * a + v2.y * b) * R;
      positions[i * 3 + 2] = (v1.z * a + v2.z * b) * R;
    }
    if (geomRef.current?.attributes?.position) {
      geomRef.current.attributes.position.needsUpdate = true;
      geomRef.current.computeBoundingSphere();
    }
  }, [obsIdx, tgtIdx, R, positions]);

  return (
    <line>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.6} />
    </line>
  );
}

function BalloonScene({
  scale,
  observer,
  setObserver,
  reduced,
}: {
  scale: number;
  observer: number;
  setObserver: (i: number) => void;
  reduced: boolean;
}) {
  /* Slider value is the true cosmic scale factor a(t) ∈ [0, 20]. The
     visual radius is √a so a=20 (20× expansion) still fits the fixed
     camera frame — galaxies (constant world size) become tiny dots on
     the growing surface, which is the actual pedagogical signal. */
  const R = BALLOON_BASE_R * Math.sqrt(Math.max(0, scale));
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={0.5} />
      <hemisphereLight args={["#1a1a2e", "#0a0a1a", 0.35]} />

      {/* Semi-translucent balloon skin — front face dims the rear
         galaxies enough to give a clear depth cue, while still letting
         them show through faintly. Earlier 0.07 was too clear (far-side
         dots looked identical to near-side, so rotation looked like
         galaxies sliding across the surface). */}
      <mesh>
        <sphereGeometry args={[R, 64, 48]} />
        <meshStandardMaterial
          color={BALLOON_COLOR_SKIN}
          transparent
          opacity={0.22}
          roughness={0.45}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wireframe overlay (slightly larger to avoid z-fighting). */}
      <mesh>
        <sphereGeometry args={[R * 1.002, 28, 18]} />
        <meshBasicMaterial
          color={BALLOON_COLOR_SKIN}
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>

      {/* Great-circle arcs from observer to every other galaxy. */}
      {BALLOON_UNIT.map((_, i) =>
        i === observer ? null : (
          <BalloonArc
            key={`arc-${i}`}
            obsIdx={observer}
            tgtIdx={i}
            R={R * 1.006}
            color={BALLOON_COLOR_ARC}
          />
        ),
      )}

      {/* Galaxies — meshes stay a constant world size; only positions
         scale with R, so as the balloon inflates the dots spread apart.
         Each galaxy sits at a fixed (lat, lon) on the surface: pos =
         unit[i] · R. Click any dot to make that galaxy the observer.
         The label is positioned in the parent group's local frame along
         the radial direction (unit · labelOff) — that keeps it fixed in
         world space relative to the galaxy, so rotating the camera no
         longer makes labels appear to orbit their galaxy. The Billboard
         only re-orients the text to face the viewer, it does not move
         the label. */}
      {BALLOON_UNIT.map((unit, i) => {
        const isObs = i === observer;
        const pos: [number, number, number] = [
          unit[0] * R,
          unit[1] * R,
          unit[2] * R,
        ];
        const labelOff = isObs ? 0.22 : 0.18;
        const labelPos: [number, number, number] = [
          unit[0] * labelOff,
          unit[1] * labelOff,
          unit[2] * labelOff,
        ];
        return (
          <group key={`gal-${i}`} position={pos}>
            <mesh
              onPointerDown={(e) => {
                e.stopPropagation();
                setObserver(i);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >
              <sphereGeometry
                args={[isObs ? BALLOON_OBS_R : BALLOON_GALAXY_R, 24, 16]}
              />
              <meshStandardMaterial
                color={isObs ? BALLOON_COLOR_OBS : BALLOON_COLOR_OTHER}
                emissive={isObs ? BALLOON_COLOR_OBS : "#94a3b8"}
                emissiveIntensity={isObs ? 0.85 : 0.45}
                roughness={0.3}
              />
            </mesh>
            <Billboard position={labelPos}>
              <Text
                fontSize={isObs ? 0.17 : 0.14}
                color={isObs ? BALLOON_COLOR_OBS : "#cbd5e1"}
                anchorX="center"
                anchorY="middle"
                fontStyle="italic"
              >
                {BALLOON_NAMES[i]}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* OrbitControls handles rotation only — wheel drives the slider
         instead of the camera (see the outer wheel listener). */}
      <OrbitControls
        makeDefault
        enableDamping={!reduced}
        dampingFactor={0.08}
        enablePan={false}
        enableZoom={false}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function BalloonAnalogyPanel() {
  const [scale, setScale] = useState(1);
  const [observer, setObserver] = useState(0);
  const [reduced, setReduced] = useState(false);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const fs = useFs(canvasWrapRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);

  /* Wheel over the canvas drives the slider instead of the camera dolly —
     but ONLY in fullscreen, so in the normal in-page view the wheel keeps
     scrolling the page (matching the FigureFrame contract: no wheel
     hijacking in normal flow). Step is proportional to current a so one
     wheel-tick feels right at both a≈0.5 and a≈15. Scroll-up (deltaY < 0,
     the usual "zoom in" direction) → balloon expands → a increases. */
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      const frame = el?.closest("[data-figure-frame]");
      if (!frame || !frame.classList.contains("is-fs")) return; // page scroll in normal flow
      e.preventDefault();
      setScale((prev) => {
        const base = Math.max(prev, 0.3);
        const next = prev - e.deltaY * 0.003 * base;
        return Math.max(0, Math.min(20, next));
      });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const epoch =
    scale < 0.001
      ? "big bang"
      : scale < 0.5
        ? "early cosmos"
        : scale < 1.5
          ? "near today"
          : scale < 5
            ? "near future"
            : scale < 15
              ? "deep future"
              : "far future";
  const ageGyr = balloonAgeGyr(scale);
  const ageLabel = balloonFmtAge(ageGyr);

  return (
    <FigurePanel
      idx="0.3.b"
      sidebar
      kicker="Balloon Analogy · The Cosmological Principle"
      caption={
        <>
          Galaxies are dots on an inflating balloon: as space stretches, every
          dot drifts from every other and none is the centre — Eddington&apos;s
          1933 picture of the <em>cosmological principle</em>.{" "}
          <strong>Drag the slider (← / →) to inflate; click a galaxy (1–6) to
          stand on it</strong> — the view is the same from every one.
          <span className="block mt-1 text-white/40">
            Slider = scale factor a(t); age assumes standard ΛCDM. Drag to
            rotate.
          </span>
        </>
      }
      rail={
        <>
          {/* scale-factor slider + age readout — right rail in fullscreen,
             below the balloon in normal flow. */}
          <div className="mt-4" style={{ flexShrink: 0 }}>
            <div className="flex items-baseline justify-between gap-2">
              <label className="font-mono tracking-[0.22em] uppercase text-white/55 shrink-0" style={{ fontSize: sz(0.6) ?? "9px" }}>
                a(t)
              </label>
              <span className="font-mono text-plasma text-right tabular-nums" style={{ fontSize: sz(0.72) ?? "11px" }}>
                {scale.toFixed(2)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <label className="font-mono tracking-[0.22em] uppercase text-white/55 shrink-0" style={{ fontSize: sz(0.6) ?? "9px" }}>
                age
              </label>
              <span className="font-mono text-white/85 text-right tabular-nums" style={{ fontSize: sz(0.72) ?? "11px" }}>
                {ageLabel} <span className="text-white/45">· {epoch}</span>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="cosmic-slider w-full"
              aria-label={`cosmic scale factor a(t) = ${scale.toFixed(2)}, universe age ${ageLabel}`}
            />
            <div className="flex items-center justify-between font-mono tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.5) ?? "8px" }}>
              <span>0 · big bang</span>
              <span>20 · far future</span>
            </div>
          </div>

          {/* Hidden hooks for FigureFrame's data-shortcut handler — click a
             dot on the balloon or press 1–6 to switch which galaxy is you. */}
          <div style={{ display: "none" }} aria-hidden="true">
            {BALLOON_NAMES.map((name, i) => (
              <button
                key={`sc-${name}`}
                type="button"
                tabIndex={-1}
                onClick={() => setObserver(i)}
                data-shortcut={String(i + 1)}
              >
                galaxy {name}
              </button>
            ))}
          </div>
        </>
      }
    >
      <div
        ref={canvasWrapRef}
        className="fig-viz relative w-full"
        style={{ height: fs ? "100%" : 520 }}
      >
        <Canvas
          dpr={[1, 1.75]}
          camera={{
            position: [4.0, 2.8, 4.0],
            fov: 50,
            near: 0.05,
            far: 100,
          }}
          style={{ background: "transparent" }}
        >
          <BalloonScene
            scale={scale}
            observer={observer}
            setObserver={setObserver}
            reduced={reduced}
          />
        </Canvas>
      </div>
    </FigurePanel>
  );
}
