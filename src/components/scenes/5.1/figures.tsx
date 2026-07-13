import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";
import { ELEMENTS, ORIGINS, type Element, type ElementOrigin } from "../../../data/elements";

/* Shared figure shell — mirrors the chapter-0/1/2/3/4 pattern. */
function FigurePanel({
  idx, kicker, caption, children, fitFs = false, sidebar = false, rail,
}: {
  idx: string; kicker: string; caption: ReactNode; children: ReactNode;
  fitFs?: boolean; sidebar?: boolean; rail?: ReactNode;
}) {
  const cls = `figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}${sidebar ? " is-fs-sidebar" : ""}`;
  return (
    <figure data-fade className={cls}>
      <div className="figure-body">{children}</div>
      {rail && <div className="fig-rail">{rail}</div>}
      <figcaption>
        <span className="figure-tag">Fig. {idx}</span>
        <span className="figure-title"> — {kicker}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
}

function useFs(ref: { current: Element_ | null }) {
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
/* local alias so the DOM Element type isn't shadowed by the data type */
type Element_ = globalThis.Element;

const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* ── 5.1.a — The periodic table, colour-coded by cosmic forge ───────
   Every element is a tile placed on the standard 18-column grid; its
   colour is the DOMINANT place its atoms were made. Click a tile to read
   the element; click a forge in the legend to dim everything else.
   ←/→ walk the elements by atomic number; ↑/↓ walk the seven forges.

   Layout is a reserved-slot grid in viewBox units: the table block owns
   the top, the legend a fixed row beneath it, and the detail box lives
   outside the SVG as a sibling of .fig-viz (so fullscreen scales it). */

const COLS = 18;
const CELL = 46;
const GAP = 3;
const PADX = 26;
const PADY = 34;
const ROWGAP = 16;          // extra space above the detached f-block rows

function rowY(row: number): number {
  /* rows 1–7 stack normally; rows 9/10 (the f-block) sit below with a gap */
  const base = PADY + (row - 1) * (CELL + GAP);
  return row >= 9 ? base - (CELL + GAP) + ROWGAP : base;
}

export function PeriodicTablePanel(): JSX.Element {
  const [selZ, setSelZ] = useState(26);           // start on iron
  const [filter, setFilter] = useState<ElementOrigin | null>(null);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const sel = ELEMENTS.find((e) => e.z === selZ)!;
  const selOrigin = ORIGINS.find((o) => o.id === sel.origin)!;

  const stepZ = (d: -1 | 1) => setSelZ((z) => Math.max(1, Math.min(118, z + d)));
  const stepFilter = (d: -1 | 1) => {
    const i = filter ? ORIGINS.findIndex((o) => o.id === filter) : -1;
    const n = i + d;
    setFilter(n < 0 || n >= ORIGINS.length ? null : ORIGINS[n].id);
  };

  const W = PADX * 2 + COLS * (CELL + GAP);
  const H = rowY(10) + CELL + 122;                 // table + two legend rows

  const dim = (e: Element) => filter !== null && e.origin !== filter;
  const legendY = rowY(10) + CELL + 30;

  return (
    <FigurePanel
      idx="5.1.a"
      kicker="The periodic table, by cosmic forge"
      fitFs
      caption={
        <>
          Every element, coloured by <em>where its atoms were made</em>. Click a tile to read the element — or a forge in
          the legend to dim everything the others made. The arrow keys walk the elements by atomic number; ↑/↓ step
          through the forges. Most elements come from more than one place; the colour shows the dominant source of the
          atoms around us. The gold in a ring and the uranium in a reactor were made in a collision of neutron stars.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 30%, #121320 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Periodic table coloured by the cosmic origin of each element; ${sel.name} selected`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {ELEMENTS.map((e) => {
            const o = ORIGINS.find((x) => x.id === e.origin)!;
            const x = PADX + (e.col - 1) * (CELL + GAP);
            const y = rowY(e.row);
            const isSel = e.z === selZ;
            const d = dim(e);
            return (
              <g key={e.z} style={{ cursor: "pointer" }} onClick={() => setSelZ(e.z)}>
                <rect
                  x={x} y={y} width={CELL} height={CELL} rx={4}
                  fill={o.color}
                  opacity={d ? 0.1 : isSel ? 1 : 0.72}
                  stroke={isSel ? "#ffffff" : "rgb(0 0 0 / 0.35)"}
                  strokeWidth={isSel ? 2.4 : 0.8}
                  style={{ transition: "opacity 200ms var(--ease)" }}
                />
                <text x={x + 4} y={y + 12} fontSize="9" fontFamily="JetBrains Mono, monospace"
                  fill="#0b0d14" opacity={d ? 0.25 : 0.75}>{e.z}</text>
                <text x={x + CELL / 2} y={y + CELL / 2 + 8} textAnchor="middle" fontSize="17" fontWeight={700}
                  fontFamily="Inter, sans-serif" fill="#0b0d14" opacity={d ? 0.3 : 1}>{e.sym}</text>
              </g>
            );
          })}

          {/* f-block tether note — sits in the empty gutter left of the block */}
          <text x={PADX + 3 * (CELL + GAP) - 10} y={rowY(9) + CELL / 2 + 4} textAnchor="end" fontSize="11"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
            lanthanides
          </text>
          <text x={PADX + 3 * (CELL + GAP) - 10} y={rowY(10) + CELL / 2 + 4} textAnchor="end" fontSize="11"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
            actinides
          </text>

          {/* legend — two rows of four so the labels never collide */}
          {ORIGINS.map((o, i) => {
            const perRow = 4;
            const cols = Math.min(perRow, ORIGINS.length);
            const bw = (W - PADX * 2) / cols;
            const r = Math.floor(i / perRow);
            const c = i % perRow;
            const x = PADX + c * bw;
            const y = legendY + r * 30;
            const on = filter === o.id;
            return (
              <g key={o.id} style={{ cursor: "pointer" }}
                onClick={() => setFilter((f) => (f === o.id ? null : o.id))}>
                <rect x={x} y={y - 15} width={bw - 8} height={27} rx={5}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.1)" : "transparent"}
                  stroke={on ? o.color : "transparent"} strokeWidth={1.4} />
                <rect x={x + 8} y={y - 6} width={12} height={12} rx={2.5} fill={o.color} />
                <text x={x + 26} y={y + 4} fontSize="12" fontFamily="Inter, sans-serif"
                  fontWeight={on ? 700 : 500}
                  fill={on ? o.color : "rgb(var(--c-text-rgb) / 0.82)"}>{o.label}</text>
              </g>
            );
          })}
          <text x={W - PADX} y={legendY + 34} textAnchor="end" fontSize="11"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            {filter ? "click it again to show every element" : "click a forge to isolate what it made"}
          </text>
        </svg>
      </div>

      {/* detail box — sibling of .fig-viz, constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${selOrigin.color}66`,
        boxShadow: `inset 0 0 0 1px ${selOrigin.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-serif" style={{ color: selOrigin.color, fontSize: sz(1.5) ?? "1.5rem", fontWeight: 600 }}>
            {sel.sym}
          </span>
          <span className="font-sans" style={{ color: "rgb(var(--c-text-rgb) / 0.92)", fontSize: sz(1) ?? "15px" }}>
            {sel.name}
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.6)", fontSize: sz(0.62) ?? "11px" }}>
            element {sel.z} · {sel.z} proton{sel.z > 1 ? "s" : ""} in the nucleus
          </span>
        </div>
        <div className="font-mono mt-1 tracking-[0.14em] uppercase" style={{ color: selOrigin.color, fontSize: sz(0.66) ?? "11.5px" }}>
          made in: {selOrigin.label}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "3.2em" }}>
          {selOrigin.blurb}
        </div>
      </div>

      {/* keyboard: ←/→ walk elements, ↑/↓ walk the forges */}
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => stepZ(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => stepZ(1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => stepFilter(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => stepFilter(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {ORIGINS.map((o, i) => (
          <button key={o.id} type="button" onClick={() => setFilter(o.id)} data-shortcut={String(i + 1)}
            className={filter === o.id ? "is-active" : ""} aria-pressed={filter === o.id}>
            {o.label}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 5.1.b — The onion furnace ──────────────────────────────────────
   A massive star's final days: seven stages from hydrogen burning to the
   supernova, each with its real temperature and duration. The left panel
   is a cutaway of the layered "onion" that has been built so far; the
   right lists the burning stages in reserved slots. ←/→ or 1–7 step.

   reduced-motion: stages switch instantly; the only motion is a short
   opacity fade that is disabled when the user asks for less. */

type BurnStage = {
  id: string;
  fuel: string;
  makes: string;
  tempK: string;
  duration: string;
  /** shells present at this stage, outermost first: [label, colour] */
  shells: [string, string][];
  body: ReactNode;
};

const BURN: BurnStage[] = [
  {
    id: "h", fuel: "Hydrogen", makes: "helium", tempK: "40 million K", duration: "about 8 million years",
    shells: [["hydrogen", "#8ab4f8"], ["helium core", "#fde68a"]],
    body: <>The long, stable adulthood. The star fuses hydrogen into helium in its core, exactly as the Sun does (<em>§3.1</em>) — only far hotter and faster, because a heavy star must burn furiously to hold up its own weight.</>,
  },
  {
    id: "he", fuel: "Helium", makes: "carbon and oxygen", tempK: "200 million K", duration: "about 1 million years",
    shells: [["hydrogen", "#8ab4f8"], ["helium", "#fde68a"], ["carbon-oxygen core", "#a8a29e"]],
    body: <>Hydrogen runs out, the core shrinks and heats, and helium ignites — three helium nuclei fusing into carbon. The star swells into a red supergiant. Every carbon atom in you was born in this step.</>,
  },
  {
    id: "c", fuel: "Carbon", makes: "neon, sodium, magnesium", tempK: "800 million K", duration: "about 1,000 years",
    shells: [["hydrogen", "#8ab4f8"], ["helium", "#fde68a"], ["carbon", "#a8a29e"], ["neon-magnesium core", "#c084fc"]],
    body: <>Now the pattern repeats — and accelerates alarmingly. Each spent fuel leaves a denser, hotter core that ignites the next. Millions of years become a thousand. The old fuels keep burning in shells above, building an onion.</>,
  },
  {
    id: "ne", fuel: "Neon", makes: "oxygen and magnesium", tempK: "1.6 billion K", duration: "about 1 year",
    shells: [["hydrogen", "#8ab4f8"], ["helium", "#fde68a"], ["carbon", "#a8a29e"], ["neon", "#c084fc"], ["oxygen core", "#38bdf8"]],
    body: <>A single year to burn what took a thousand before. The furnace is now so hot that the energy pours out as neutrinos — ghost particles (<em>§1.2</em>) that stream straight out of the star, draining it faster still.</>,
  },
  {
    id: "o", fuel: "Oxygen", makes: "silicon and sulfur", tempK: "1.8 billion K", duration: "about 6 months",
    shells: [["hydrogen", "#8ab4f8"], ["helium", "#fde68a"], ["carbon", "#a8a29e"], ["neon", "#c084fc"], ["oxygen", "#38bdf8"], ["silicon core", "#fb923c"]],
    body: <>Months, now. The star looks utterly calm from outside — its surface has no idea what is happening below. The core is racing through the last of its fuel in the time it takes to grow a crop.</>,
  },
  {
    id: "si", fuel: "Silicon", makes: "iron and nickel", tempK: "3 billion K", duration: "about one day",
    shells: [["hydrogen", "#8ab4f8"], ["helium", "#fde68a"], ["carbon", "#a8a29e"], ["neon", "#c084fc"], ["oxygen", "#38bdf8"], ["silicon", "#fb923c"], ["iron core", "#e5e7eb"]],
    body: <>The last day of the star's life. Silicon fuses into iron and nickel — and there the road ends. Nuclei around iron are the most tightly bound in nature, so fusing them <em>consumes</em> energy instead of releasing it. The furnace has finally made its own ash.</>,
  },
  {
    id: "boom", fuel: "— nothing left —", makes: "scatters everything it built", tempK: "10 billion K", duration: "seconds",
    shells: [["blast wave", "#f87171"], ["ejected layers", "#fb923c"], ["neutron star", "#e5e7eb"]],
    body: <>With no fusion to hold it up, the iron core collapses in under a second and rebounds, blasting the star apart. Everything the onion made — the oxygen you breathe, the silicon in glass, the calcium in your bones — is thrown into space. Left at the centre: a <strong>neutron star</strong>. Ordinary supernovae make surprisingly little gold; for that we need two of these remnants to collide.</>,
  },
];

export function OnionFurnacePanel(): JSX.Element {
  const [stage, setStage] = useState(0);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const reduced = usePrefersReducedMotion();
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setStage((s) => Math.max(0, Math.min(BURN.length - 1, s + d)));
  const cur = BURN[stage];
  const isBoom = stage === BURN.length - 1;

  const W = 904, H = 520;
  const cx = 258, cy = 268, RMAX = 196;
  const LIST_X = 540;
  const SLOT0 = 92, SLOTH = 56;

  return (
    <FigurePanel
      idx="5.1.b"
      kicker="The onion furnace"
      caption={
        <>
          The last eight million years of a star twenty times the Sun's mass, in seven steps — walk them with the arrow
          keys. Each fuel runs out, the core shrinks and heats, and the next, heavier fuel ignites, while the old ones
          keep burning in shells above: an onion. Note the durations collapsing — millions of years, then a thousand, a
          year, a single day. Iron ends it: fusing iron takes energy instead of giving it, so the core collapses and the
          star explodes, scattering everything it built.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: isBoom
            ? "radial-gradient(circle at 28% 52%, #3a1206 0%, #140a12 55%, #07070c 100%)"
            : "radial-gradient(circle at 28% 52%, #1d1407 0%, #0c0a10 58%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
          transition: reduced ? "none" : "background 400ms var(--ease)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Massive star interior, stage: burning ${cur.fuel}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={36} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {isBoom ? "CORE COLLAPSE" : `BURNING ${cur.fuel.toUpperCase()}`}
          </text>
          <text x={W - 24} y={36} textAnchor="end" fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            step {stage + 1} of {BURN.length} · 20 solar masses
          </text>

          {/* the onion: nested circles, outermost shell first */}
          {cur.shells.map((s, i) => {
            const n = cur.shells.length;
            const r = RMAX * (1 - i / n) ** 1.0;
            return (
              <g key={s[0]}>
                <circle cx={cx} cy={cy} r={r} fill={s[1]} opacity={i === n - 1 ? 0.95 : 0.32 + i * 0.08}
                  stroke="rgb(0 0 0 / 0.35)" strokeWidth={1}
                  style={{ transition: reduced ? "none" : "opacity 300ms var(--ease)" }} />
              </g>
            );
          })}
          {/* shell leader labels, one reserved slot each */}
          {cur.shells.map((s, i) => {
            const n = cur.shells.length;
            const r = RMAX * (1 - i / n) ** 1.0;
            const rMid = i === n - 1 ? r * 0.45 : r - (RMAX / n) * 0.5;
            const ang = -62 + i * (110 / Math.max(1, n - 1));
            const ax = cx + rMid * Math.cos((ang * Math.PI) / 180);
            const ay = cy + rMid * Math.sin((ang * Math.PI) / 180);
            const ly = SLOT0 + i * SLOTH;
            return (
              <g key={`lab-${s[0]}`}>
                <line x1={ax} y1={ay} x2={LIST_X - 16} y2={ly - 5} stroke="rgb(var(--c-text-rgb) / 0.32)" strokeWidth={1} />
                <circle cx={ax} cy={ay} r={4} fill={s[1]} stroke="#0b0d14" strokeWidth={1} />
                <text x={LIST_X} y={ly} fontFamily="Inter, sans-serif" fontSize={17} fontWeight={550}
                  fill="rgb(var(--c-text-rgb) / 0.9)">{s[0]}</text>
              </g>
            );
          })}

          {/* the numbers that matter */}
          <text x={LIST_X} y={H - 96} fontSize="13" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            CORE TEMPERATURE
          </text>
          <text x={LIST_X} y={H - 68} fontSize="26" fontWeight={700} fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {cur.tempK}
          </text>
          <text x={LIST_X} y={H - 40} fontSize="13" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            THIS STAGE LASTS
          </text>
          <text x={LIST_X} y={H - 14} fontSize="20" fontWeight={650} fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.92)">
            {cur.duration}
          </text>

          {/* what it makes */}
          <text x={cx} y={cy + RMAX + 34} textAnchor="middle" fontSize="14" fontFamily="Inter, sans-serif"
            fill="rgb(var(--c-text-rgb) / 0.8)">
            {isBoom ? "→ makes gold, uranium — and scatters everything" : `${cur.fuel} → ${cur.makes}`}
          </text>
        </svg>
      </div>

      {/* narration — constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          step {stage + 1} · {isBoom ? "the supernova" : `${cur.fuel} burning`}
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "5.6em" }}>
          {cur.body}
        </div>
      </div>

      {/* stage pills */}
      <div className="mt-3 flex gap-1.5 items-center" style={{ flexShrink: 0 }}>
        {BURN.map((_, n) => (
          <button key={n} type="button" onClick={() => setStage(n)} aria-pressed={stage === n}
            className={`rounded-full font-mono${stage === n ? " is-active" : ""}`} data-shortcut={String(n + 1)} style={{
              width: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              height: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              fontSize: sz(0.56) ?? "10px",
              color: stage === n ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.6)",
              background: stage === n ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
            }}>{n + 1}</button>
        ))}
        <span className="font-mono ml-2" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>
          ← / → burn through the star's last eight million years
        </span>
      </div>

      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
    </FigurePanel>
  );
}
