import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import katex from "katex";

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

/* KaTeX inline snippet for HTML contexts (detail box, caption) — real
   typeset math instead of Unicode superscripts, which render unevenly
   in some fonts. The KaTeX CSS is loaded globally by BaseHead. */
function M({ t }: { t: string }): JSX.Element {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(t, { throwOnError: false }) }} />;
}

/* SVG superscripts — <tspan> with a baseline shift, so powers of ten
   typeset cleanly inside SVG <text> (the mono font's Unicode
   superscript glyphs are tiny and unevenly aligned). A "segment" is
   either normal text or a superscript run; dy shifts are cumulative,
   so each level change is emitted relative to the previous one. */
type Seg = { t: string; sup?: boolean };
function SegTspans({ segs, fontSize }: { segs: Seg[]; fontSize: number }): JSX.Element {
  const out: JSX.Element[] = [];
  let level = 0;
  segs.forEach((s, i) => {
    const want = s.sup ? 1 : 0;
    const dy = (level - want) * 0.38 * fontSize; // entering sup → negative dy (up)
    level = want;
    out.push(
      <tspan key={i} dy={dy === 0 ? undefined : dy} fontSize={s.sup ? fontSize * 0.66 : fontSize}>
        {s.t}
      </tspan>,
    );
  });
  return <>{out}</>;
}
/** segs for `10^exp` followed by normal text (e.g. p10("−43", " s")). */
function p10(exp: string, post = ""): Seg[] {
  return [{ t: "10" }, { t: exp, sup: true }, ...(post ? [{ t: post }] : [])];
}

/* Tracks whether the enclosing FigureFrame is fullscreen (`.is-fs`) — the
   MutationObserver pattern shared with 1.2/1.3 — so the HTML detail panel
   can scale its text with the figure. */
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

/* Off-screen but real <button>s for FigureFrame's keyboard navigator —
   it drives shortcuts via `.click()`, which SVG elements don't implement. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ── FourForcesPanel — annotated force tree, Superforce → four ───────
   Based on the canonical "force tree" image in
   knowledgebase/2026-spring/media/forces.jpg, with the epoch labels
   corrected: the trunk is whichever forces are STILL UNITED, so it
   reads Superforce (all four, before the Planck time) → GUT force
   (gravity has left) → electroweak force (the strong force has left)
   → nothing (all four separate by one picosecond).

   SEVEN selectables: the three trunk eras AND the four forces — each
   opens the detail box below the SVG. Selection via click, number
   keys 1–7, ←/→ (story order across all seven), or ↑/↓ (vertically
   through the four force rows).

   Layout grid (viewBox 1000 × 480) — every text element has a
   reserved slot so nothing can overlap at any size:
     y  26  temperature axis · y 58 bar header · y 226 trunk sub-labels
     y 248  trunk · y 96/200/296/408 force rows · y 456/471 time axis
   Time runs x 150→490 (10⁻⁴³ → 10⁻¹² s, log); bands end at x 560;
   label panel x 585→985. */

type ItemId = "superforce" | "gut" | "electroweak" | "strong" | "em" | "weak" | "gravity";
type Field = { label: string; body: ReactNode };
type Item = {
  id: ItemId;
  title: string;
  color: string;
  /** One-line stat strip after the title in the detail box. */
  stat: ReactNode;
  fields: [Field, Field, Field];
};

type Force = {
  id: ItemId;
  name: string;
  /** Relative-strength segments (strong = 1), standard textbook values. */
  rel: Seg[];
  relLog: number;
  /** Second row line: carrier + range. */
  carrierLine: Seg[];
  color: string;
  yFinal: number;
  xBranch: number;
};

type Epoch = {
  id: ItemId;
  label: string;
  sub: string;
  color: string;
  x0: number;
  x1: number;
};

/* ── Layout constants ── */
const X_TRUNK_START = 36;
const X_PLANCK = 150; // 10⁻⁴³ s
const X_EW = 490; // 10⁻¹² s
const LOG_T_LEFT = -43;
const LOG_T_RIGHT = -12;
function xForLogT(logT: number): number {
  const t = (logT - LOG_T_LEFT) / (LOG_T_RIGHT - LOG_T_LEFT);
  return X_PLANCK + t * (X_EW - X_PLANCK);
}
const X_GUT = xForLogT(-35); // ≈ 238
const X_INFL_END = xForLogT(-32); // ≈ 271 — inflation ends
const X_BAND_END = 560;
const X_DOT = 568;
const X_ROW = 585;
const X_BAR_END = 860;
const X_VALUE = 872;

const Y_TRUNK = 248;
const Y_STRONG = 96;
const Y_EM = 200;
const Y_WEAK = 296;
const Y_GRAVITY = 408;
const BAND_WIDTH = 26;

const FORCES: Force[] = [
  { id: "strong", name: "Strong Nuclear", rel: [{ t: "1" }], relLog: 0, carrierLine: [{ t: "carrier: gluon · range " }, ...p10("−15", " m")], color: "#2dd4bf", yFinal: Y_STRONG, xBranch: X_GUT },
  { id: "em", name: "Electromagnetic", rel: p10("−2"), relLog: -2, carrierLine: [{ t: "carrier: photon · range infinite" }], color: "#a78bda", yFinal: Y_EM, xBranch: X_EW },
  { id: "weak", name: "Weak Nuclear", rel: p10("−6"), relLog: -6, carrierLine: [{ t: "carrier: W & Z bosons · range " }, ...p10("−18", " m")], color: "#e5536b", yFinal: Y_WEAK, xBranch: X_EW },
  { id: "gravity", name: "Gravitational", rel: p10("−39"), relLog: -39, carrierLine: [{ t: "carrier: graviton (hypothetical) · range infinite" }], color: "#7fb682", yFinal: Y_GRAVITY, xBranch: X_PLANCK },
];

const EPOCHS: Epoch[] = [
  { id: "superforce", label: "SUPERFORCE", sub: "all four united", color: "#fbbf24", x0: X_TRUNK_START - 13, x1: X_PLANCK },
  { id: "gut", label: "GUT", sub: "three still united", color: "#fb923c", x0: X_PLANCK, x1: X_GUT },
  { id: "electroweak", label: "ELECTROWEAK", sub: "two still united", color: "#60a5fa", x0: X_GUT, x1: X_EW },
];

/* Detail-box content — every body is ≤ ~140 characters so all seven
   selections fill the SAME number of lines: the panel never changes
   size when the reader switches selection (each field body also
   carries an em-based minHeight as a guarantee). */
const ITEMS: Record<ItemId, Item> = {
  superforce: {
    id: "superforce",
    title: "Superforce",
    color: "#fbbf24",
    stat: (
      <>before <M t="10^{-43}\,\mathrm{s}" /> · all four forces united · theory: TOE (Theory of Everything)</>
    ),
    fields: [
      { label: "What it is", body: <>All four forces acting as one in the Planck epoch, above <M t="10^{32}" /> K — conditions no laboratory can ever recreate.</> },
      { label: "The theory", body: <>A <strong>Theory of Everything (TOE)</strong> would describe this single force. We do not yet have one — it remains physics' biggest open quest.</> },
      { label: "What happened", body: <>At <M t="10^{-43}\,\mathrm{s}" /> gravity froze out of the union, ending the Superforce era and leaving the GUT force.</> },
    ],
  },
  gut: {
    id: "gut",
    title: "GUT force",
    color: "#fb923c",
    stat: (
      <><M t="10^{-43}" />–<M t="10^{-35}\,\mathrm{s}" /> · strong + EM + weak united · theory: GUT (Grand Unified Theory)</>
    ),
    fields: [
      { label: "What it is", body: <>The grand unified force: strong, electromagnetic, and weak still acting as one, with gravity already separate.</> },
      { label: "The theory", body: <><strong>Grand Unified Theories (GUTs)</strong> describe it — still unconfirmed: the proton decay they predict has never been observed.</> },
      { label: "What happened", body: <>At <M t="10^{-35}\,\mathrm{s}" /> the strong force froze out — the break widely linked to the trigger for inflation.</> },
    ],
  },
  electroweak: {
    id: "electroweak",
    title: "Electroweak force",
    color: "#60a5fa",
    stat: (
      <><M t="10^{-35}" />–<M t="10^{-12}\,\mathrm{s}" /> · EM + weak united · electroweak theory (proven)</>
    ),
    fields: [
      { label: "What it is", body: <>Electromagnetism and the weak force acting as one — gravity and the strong force have already gone their own ways.</> },
      { label: "The theory", body: <>Unlike TOE and GUT, <strong>electroweak theory is proven</strong>: its predicted W and Z bosons were found at CERN in 1983, the Higgs in 2012.</> },
      { label: "What happened", body: <>At <M t="10^{-12}\,\mathrm{s}" /> (one picosecond) it split into electromagnetism and the weak force — the final break.</> },
    ],
  },
  strong: {
    id: "strong",
    title: "Strong Nuclear",
    color: "#2dd4bf",
    stat: (
      <>froze out at <M t="10^{-35}\,\mathrm{s}" /> · strength 1 (the benchmark) · carrier: gluon</>
    ),
    fields: [
      { label: "How it works", body: <>Glues quarks into protons and neutrons; its residue glues those into nuclei. Strongest of all, but reaches only across a nucleus (<M t="10^{-15}" /> m).</> },
      { label: "Discovered", body: <>1935 — Hideki Yukawa predicts a particle-carried nuclear force; the predicted particle (the pion) is found in 1947.</> },
      { label: "Where you meet it", body: <>Every stable atomic nucleus in your body; the hydrogen-to-helium fusion furnace that lights the Sun.</> },
    ],
  },
  em: {
    id: "em",
    title: "Electromagnetic",
    color: "#a78bda",
    stat: (
      <>froze out at <M t="10^{-12}\,\mathrm{s}" /> · strength <M t="10^{-2}" /> · carrier: photon</>
    ),
    fields: [
      { label: "How it works", body: <>Pushes and pulls electric charges via photons; binds electrons to nuclei — making atoms, molecules, and all of chemistry.</> },
      { label: "Discovered", body: <>1864 — James Clerk Maxwell unifies electricity and magnetism, building on Ørsted's 1820 compass-needle surprise.</> },
      { label: "Where you meet it", body: <>Light, Wi-Fi, friction, nerve signals — and a fridge magnet beating the gravity of the entire Earth.</> },
    ],
  },
  weak: {
    id: "weak",
    title: "Weak Nuclear",
    color: "#e5536b",
    stat: (
      <>froze out at <M t="10^{-12}\,\mathrm{s}" /> · strength <M t="10^{-6}" /> · carrier: W & Z bosons</>
    ),
    fields: [
      { label: "How it works", body: <>Transforms particles — e.g. a proton into a neutron. Its heavy W and Z carriers limit its reach to ~<M t="10^{-18}" /> m.</> },
      { label: "Discovered", body: <>1934 — Enrico Fermi's theory of beta decay; the W and Z bosons are finally seen at CERN in 1983.</> },
      { label: "Where you meet it", body: <>Radioactive decay, carbon dating, and the proton-to-neutron first step of the Sun's fusion chain.</> },
    ],
  },
  gravity: {
    id: "gravity",
    title: "Gravitational",
    color: "#7fb682",
    stat: (
      <>froze out at <M t="10^{-43}\,\mathrm{s}" /> · strength <M t="10^{-39}" /> (between two protons) · carrier: graviton</>
    ),
    fields: [
      { label: "How it works", body: <>Mass attracts mass — weakest by far (its bar is hugely exaggerated), but infinite-range, always attractive, never cancelling: over galaxies it wins.</> },
      { label: "Discovered", body: <>1687 — Newton's Principia; recast by Einstein in 1915 as curved spacetime. Its carrier, the graviton, has never been detected.</> },
      { label: "Where you meet it", body: <>Your weight, ocean tides, planetary orbits, black holes, and the shape of every galaxy.</> },
    ],
  },
};

/** Selection order for ←/→ and the number keys 1–7: the story order. */
const ORDER: ItemId[] = ["superforce", "gut", "electroweak", "strong", "em", "weak", "gravity"];
/** Vertical order of the force rows for ↑/↓. */
const FORCE_COLUMN: ItemId[] = ["strong", "em", "weak", "gravity"];

function bandPath(xBranch: number, yFinal: number): string {
  const curl = xBranch === X_EW ? 70 : 80;
  return `M ${xBranch} ${Y_TRUNK} C ${xBranch + curl * 0.7} ${Y_TRUNK}, ${xBranch + curl * 0.3} ${yFinal}, ${xBranch + curl} ${yFinal} L ${X_BAND_END} ${yFinal}`;
}

/* Strength bar: log scale across 8 orders of magnitude —
   strong (10⁰) → 100%, EM (10⁻²) → 75%, weak (10⁻⁶) → 25%. Gravity
   (10⁻³⁹) is clamped to a sliver; the detail box says so explicitly. */
function barFrac(relLog: number): number {
  const LOG_MIN = -8;
  return Math.max(0.018, (relLog - LOG_MIN) / (0 - LOG_MIN));
}

const TICKS: { x: number; temp: Seg[]; time: Seg[]; event: string }[] = [
  { x: X_PLANCK, temp: p10("32", " K"), time: p10("−43", " s"), event: "Planck time" },
  { x: X_GUT, temp: p10("28", " K"), time: p10("−35", " s"), event: "inflation begins" },
  { x: X_EW, temp: p10("15", " K"), time: p10("−12", " s"), event: "picosecond" },
];

export function FourForcesPanel(): JSX.Element {
  const [selId, setSelId] = useState<ItemId>("superforce");
  const sel = ITEMS[selId];
  const selForce = FORCES.find((f) => f.id === selId);
  const selEpoch = EPOCHS.find((ep) => ep.id === selId);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  /* Uniform fullscreen scaling — ONE responsive base, each text role a
     fixed fraction of it (ratios match the normal-flow 11/10/14 px). */
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const stepAll = (dir: -1 | 1) => {
    const i = ORDER.indexOf(selId);
    setSelId(ORDER[Math.max(0, Math.min(ORDER.length - 1, i + dir))]);
  };
  const stepForce = (dir: -1 | 1) => {
    const i = FORCE_COLUMN.indexOf(selId);
    if (i < 0) {
      // From a trunk era, ↓ enters the force column at the top, ↑ at the bottom.
      setSelId(dir === 1 ? "strong" : "gravity");
      return;
    }
    setSelId(FORCE_COLUMN[Math.max(0, Math.min(FORCE_COLUMN.length - 1, i + dir))]);
  };

  return (
    <FigurePanel
      idx="1.1.a"
      kicker="From one Superforce to four"
      caption={
        <>
          The family tree of the four fundamental forces, from a single <em>Superforce</em> at the Planck time
          (<M t="10^{-43}\,\mathrm{s}" />) to four separate forces at one picosecond (<M t="10^{-12}\,\mathrm{s}" />).
          The dark trunk is whichever forces are still united — Superforce, then GUT force, then electroweak force.
          Click any trunk era or branch — or use 1–7 and the arrow keys — to open its details below.
        </>
      }
    >
      {/* SVG-only wrapper — `.fig-viz` holds JUST the SVG so the
          fullscreen CSS (which makes `.fig-viz` a centered flex box
          claiming the remaining height) can't swallow the detail box.
          The detail box + hidden a11y buttons are siblings BELOW. */}
      <div
        ref={vizRef}
        className="fig-viz relative w-full"
        style={{ background: "rgb(var(--c-text-rgb) / 0.02)", borderRadius: 8, padding: "12px 10px 14px", border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}
      >
        <svg
          viewBox="0 0 1000 480"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Family tree of the four fundamental forces: the unified trunk (Superforce, then GUT force, then electroweak force) and the four branches that freeze out of it between the Planck time and one picosecond"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* ── Inflation band (10⁻³⁵ → 10⁻³² s) ─────────────────── */}
          <defs>
            {/* Theme-aware: text-token tint so the band shows in BOTH themes. */}
            <linearGradient id="inflation" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" style={{ stopColor: "rgb(var(--c-text-rgb) / 0)" }} />
              <stop offset="35%" style={{ stopColor: "rgb(var(--c-text-rgb) / 0.12)" }} />
              <stop offset="100%" style={{ stopColor: "rgb(var(--c-text-rgb) / 0)" }} />
            </linearGradient>
          </defs>
          <rect x={X_GUT - 14} y={34} width={X_INFL_END - X_GUT + 28} height={406} fill="url(#inflation)" />
          <text
            transform={`rotate(-90 ${(X_GUT + X_INFL_END) / 2} 330)`}
            x={(X_GUT + X_INFL_END) / 2}
            y={330}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="11"
            fontStyle="italic"
            letterSpacing="0.18em"
            fill="rgb(var(--c-text-rgb) / 0.55)"
          >
            INFLATION
          </text>

          {/* ── Gridlines at the three thresholds ─────────────────── */}
          <g stroke="rgb(var(--c-text-rgb) / 0.10)" strokeDasharray="2 4">
            {TICKS.map((t) => (
              <line key={t.x} x1={t.x} y1={34} x2={t.x} y2={440} />
            ))}
          </g>

          {/* ── Temperature axis (top) ────────────────────────────── */}
          <g fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            <text x={X_TRUNK_START} y={26} fontSize="12">Temperature</text>
            {TICKS.map((t) => (
              <text key={t.x} x={t.x} y={26} textAnchor="middle" fontSize="13">
                <SegTspans segs={t.temp} fontSize={13} />
              </text>
            ))}
          </g>

          {/* ── Time axis (bottom) + event sub-labels ─────────────── */}
          <g fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            <text x={X_TRUNK_START} y={456} fontSize="12">Time</text>
            {TICKS.map((t) => (
              <text key={t.x} x={t.x} y={456} textAnchor="middle" fontSize="13">
                <SegTspans segs={t.time} fontSize={13} />
              </text>
            ))}
          </g>
          <g fontFamily="Inter, sans-serif" fontSize="10.5" fontStyle="italic" fill="rgb(var(--c-text-rgb) / 0.42)">
            {TICKS.map((t) => (
              <text key={t.x} x={t.x} y={471} textAnchor="middle">{t.event}</text>
            ))}
          </g>

          {/* ── The trunk — whichever forces are still united ─────── */}
          <line
            x1={X_TRUNK_START}
            y1={Y_TRUNK}
            x2={X_EW}
            y2={Y_TRUNK}
            stroke="#3a2a4a"
            strokeWidth={BAND_WIDTH}
            strokeLinecap="round"
            opacity={0.95}
          />
          {/* ── The four force bands (under the era labels/outlines) ── */}
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
                opacity={isSel ? 1 : 0.55}
                style={{ transition: "opacity 220ms var(--ease)", cursor: "pointer" }}
                onClick={() => setSelId(f.id)}
              />
            );
          })}

          {/* ── Trunk eras — drawn AFTER the bands so era labels and
                selection outlines stay legible over the band starts ── */}
          {EPOCHS.map((ep) => {
            const isSel = selId === ep.id;
            const cx = (ep.x0 + ep.x1) / 2;
            return (
              <g key={ep.id} style={{ cursor: "pointer" }} onClick={() => setSelId(ep.id)}>
                {/* Selection outline around this trunk era */}
                {isSel && (
                  <rect
                    x={ep.x0 + 2}
                    y={Y_TRUNK - 19}
                    width={ep.x1 - ep.x0 - 4}
                    height={38}
                    rx={11}
                    fill={`${ep.color}1a`}
                    stroke={`${ep.color}aa`}
                    strokeWidth={1.5}
                  />
                )}
                {/* Fat invisible hit area so the era is easy to click */}
                <rect x={ep.x0} y={Y_TRUNK - 22} width={ep.x1 - ep.x0} height={44} fill="transparent" />
                <text
                  x={cx}
                  y={Y_TRUNK + 4.5}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="13.5"
                  fontWeight="600"
                  fill="#ffffff"
                  letterSpacing="0.06em"
                >
                  {ep.label}
                </text>
                <text
                  x={cx}
                  y={Y_TRUNK - 26}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="11"
                  fontStyle="italic"
                  fill={isSel ? ep.color : "rgb(var(--c-text-rgb) / 0.55)"}
                  style={{ transition: "fill 220ms var(--ease)" }}
                >
                  {ep.sub}
                </text>
              </g>
            );
          })}

          {/* Freeze-out marker — where the selected FORCE left the trunk
              (trunk-era selections highlight the era outline instead) */}
          {selForce && (
            <circle
              cx={selForce.xBranch}
              cy={Y_TRUNK}
              r={8}
              fill={selForce.color}
              stroke="#ffffff"
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 8px ${selForce.color})` }}
            />
          )}

          {/* ── Right label panel — one row per force ─────────────── */}
          <text
            x={X_ROW}
            y={58}
            fontFamily="JetBrains Mono, monospace"
            fontSize="10"
            letterSpacing="0.14em"
            fill="rgb(var(--c-text-rgb) / 0.45)"
          >
            RELATIVE STRENGTH · LOG BAR (STRONG = 1)
          </text>
          {FORCES.map((f) => {
            const isSel = selId === f.id;
            return (
              <g
                key={`label-${f.id}`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelId(f.id)}
                opacity={isSel ? 1 : 0.7}
              >
                {isSel && (
                  <rect
                    x={X_ROW - 7}
                    y={f.yFinal - 30}
                    width={1000 - X_ROW - 3}
                    height={64}
                    rx={6}
                    fill={`${f.color}1f`}
                    stroke={`${f.color}66`}
                    strokeWidth={1}
                  />
                )}
                <circle cx={X_DOT} cy={f.yFinal} r={4} fill={f.color} />
                {/* Row line 1 — force name */}
                <text
                  x={X_ROW}
                  y={f.yFinal - 12}
                  fontFamily="Inter, sans-serif"
                  fontSize="15"
                  fontWeight="600"
                  fill={isSel ? f.color : "rgb(var(--c-text-rgb) / 0.88)"}
                  letterSpacing="0.05em"
                  style={{ transition: "fill 220ms var(--ease)" }}
                >
                  {f.name.toUpperCase()} {isSel ? "▸" : ""}
                </text>
                {/* Row line 2 — strength bar + value */}
                <rect x={X_ROW} y={f.yFinal - 1} width={X_BAR_END - X_ROW} height={10} rx={5} fill="rgb(var(--c-text-rgb) / 0.08)" />
                <rect
                  x={X_ROW}
                  y={f.yFinal - 1}
                  width={barFrac(f.relLog) * (X_BAR_END - X_ROW)}
                  height={10}
                  rx={5}
                  fill={f.color}
                  opacity={isSel ? 1 : 0.7}
                  style={{ transition: "opacity 220ms var(--ease)" }}
                />
                <text
                  x={X_VALUE}
                  y={f.yFinal + 8}
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="13"
                  fontWeight="500"
                  fill={isSel ? f.color : "rgb(var(--c-text-rgb) / 0.82)"}
                >
                  <SegTspans segs={f.rel} fontSize={13} />
                </text>
                {/* Row line 3 — carrier + range */}
                <text
                  x={X_ROW}
                  y={f.yFinal + 27}
                  fontFamily="Inter, sans-serif"
                  fontSize="11.5"
                  fontStyle="italic"
                  fill="rgb(var(--c-text-rgb) / 0.6)"
                >
                  <SegTspans segs={f.carrierLine} fontSize={11.5} />
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Detail box — sibling of .fig-viz, above the figcaption.
            Constant height: concise bodies + an em-based minHeight per
            field, so switching selection never resizes the figure. ── */}
      <div
        className="mt-3 rounded-md grid gap-3 md:grid-cols-[1fr_1fr_1fr]"
        style={{
          background: "rgb(var(--c-text-rgb) / 0.03)",
          border: `1px solid ${sel.color}66`,
          boxShadow: `inset 0 0 0 1px ${sel.color}22`,
          padding: "12px 14px",
          transition: "border-color 220ms var(--ease)",
          flex: "0 0 auto",
          flexShrink: 0,
        }}
      >
        <div className="md:col-span-3 font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.7) }}>
          {sel.title}
          <span className="normal-case tracking-normal" style={{ color: "rgb(var(--c-text-rgb) / 0.55)" }}>
            {" "}— {sel.stat}
          </span>
        </div>
        {sel.fields.map((field) => (
          <div key={field.label}>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55 mb-1" style={{ fontSize: sz(0.62) }}>
              {field.label}
            </div>
            <div
              className="text-[14px] text-white/85 leading-[1.55] font-sans"
              style={{ fontSize: sz(0.88), minHeight: "6.3em" }}
            >
              {field.body}
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard wiring for FigureFrame's navigator (real <button>s —
         it drives shortcuts via .click(), which SVG can't receive):
         ←/→ step the seven selectables in story order (also the wheel
         in fullscreen), ↑/↓ move vertically through the force rows,
         and 1–7 jump straight to one. */}
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => stepAll(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => stepAll(1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => stepForce(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => stepForce(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelId(id)}
            data-shortcut={String(i + 1)}
            className={selId === id ? "is-active" : ""}
            aria-pressed={selId === id}
          >
            {ITEMS[id].title}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
