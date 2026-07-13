import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";

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

const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ── 7.1.a — A million years of us ─────────────────────────────────
   Human population on a log-log plot: time before present (log) against
   population (log). Six turning points are selectable. The curve is the
   standard reconstruction — a near-flat line for hundreds of millennia,
   then three kinks (farming, cities, industry) and a near-vertical
   final stroke. ←/→ or 1–6. */

type Milestone = {
  id: string;
  name: string;
  /** years before present */
  ybp: number;
  pop: number;
  color: string;
  body: ReactNode;
};

const MILES: Milestone[] = [
  { id: "sapiens", name: "Homo sapiens appears", ybp: 300000, pop: 100000, color: "#8ab4f8",
    body: <>Our species emerges in Africa. For the next two hundred thousand years there are never more than a few hundred thousand of us — fewer than fill a modern stadium. We are, by any measure, a rare and unremarkable large mammal.</> },
  { id: "ooa", name: "Out of Africa", ybp: 60000, pop: 500000, color: "#38bdf8",
    body: <>A group leaves Africa — small enough that every non-African alive today carries the genetic signature of that bottleneck. Within forty thousand years their descendants reach Australia, Europe, and eventually the Americas. Still fewer than a million people, spread over three continents.</> },
  { id: "farming", name: "Farming", ybp: 11000, pop: 5000000, color: "#4ade80",
    body: <>The first great kink in the curve. Domesticate a plant and a hectare of land feeds a hundred times more people than it does by foraging. Food can be stored, so people stay put; staying put means more children. Population begins to climb — and never really stops.</> },
  { id: "cities", name: "Cities and writing", ybp: 5000, pop: 50000000, color: "#fbbf24",
    body: <>Surplus food frees people from growing it, and specialists appear: priests, soldiers, potters, scribes. With <strong>writing</strong>, information escapes the human skull for the first time — knowledge can now outlive the person who had it, and accumulate.</> },
  { id: "industry", name: "The Industrial Revolution", ybp: 220, pop: 1000000000, color: "#fb923c",
    body: <>We learn to burn the buried forests of §6.2 — coal, then oil — and a single human commands the energy of dozens of servants. Machines, medicine, and sanitation follow. The first billion people arrive around 1800, after 300,000 years of trying.</> },
  { id: "now", name: "Today", ybp: 0, pop: 8300000000, color: "#f87171",
    body: <>Eight billion, and counting. It took our species three hundred thousand years to reach one billion, and about two hundred more to reach eight. The line on this chart is very nearly vertical — and demographers expect it to level off near ten billion later this century.</> },
];

/* the population curve: log-log interpolation through the milestones */
function popAt(ybp: number): number {
  const pts = [...MILES].sort((a, b) => b.ybp - a.ybp);
  const x = Math.log10(Math.max(1, ybp));
  for (let i = 0; i < pts.length - 1; i++) {
    const x0 = Math.log10(Math.max(1, pts[i].ybp));
    const x1 = Math.log10(Math.max(1, pts[i + 1].ybp));
    if (x <= x0 && x >= x1) {
      const t = (x0 - x) / (x0 - x1 || 1);
      const y0 = Math.log10(pts[i].pop), y1 = Math.log10(pts[i + 1].pop);
      return Math.pow(10, y0 + t * (y1 - y0));
    }
  }
  return ybp > 300000 ? 50000 : 8.3e9;
}

export function PopulationPanel(): JSX.Element {
  const [idx, setIdx] = useState(2);
  const sel = MILES[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(MILES.length - 1, i + d)));

  const W = 904, H = 470;
  const L = 84, Rm = 40, T = 54, B = 76;
  /* x: log years before present, 1,000,000 → 1 (left to right = forwards in time) */
  const lg = Math.log10;
  const xOf = (ybp: number) => L + ((lg(1e6) - lg(Math.max(1, ybp))) / (lg(1e6) - lg(1))) * (W - L - Rm);
  const yOf = (p: number) => H - B - ((lg(p) - lg(1e4)) / (lg(1e10) - lg(1e4))) * (H - T - B);

  const curve = Array.from({ length: 300 })
    .map((_, i) => {
      const ybp = Math.pow(10, 6 - (i / 299) * 6);
      return `${i === 0 ? "M" : "L"} ${xOf(ybp).toFixed(1)} ${yOf(popAt(ybp)).toFixed(1)}`;
    })
    .join(" ");

  const fmtPop = (p: number) =>
    p >= 1e9 ? `${(p / 1e9).toFixed(1)} billion` :
    p >= 1e6 ? `${(p / 1e6).toFixed(0)} million` :
    `${(p / 1e3).toFixed(0)} thousand`;
  const fmtYbp = (y: number) =>
    y === 0 ? "today" :
    y >= 1000 ? `${(y / 1000).toFixed(0)},000 years ago` :
    `${y} years ago`;

  return (
    <FigurePanel
      idx="7.1.a"
      kicker="A million years of us"
      caption={
        <>
          The human population, from before our species existed to today. Both axes are logarithmic — the only way to
          fit a million years and eight billion people on one chart. Step through the turning points with the arrow
          keys. Notice what the shape says: for 95% of our history the line is flat. Everything you would call
          history — farming, cities, writing, industry — is crammed into the final stroke.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 40%, #14121c 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Human population curve; ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* axes */}
          {[1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10].map((p) => (
            <g key={p}>
              <line x1={L} y1={yOf(p)} x2={W - Rm} y2={yOf(p)} stroke="rgb(var(--c-text-rgb) / 0.07)" strokeWidth={1} />
              <text x={L - 8} y={yOf(p) + 4} textAnchor="end" fontSize="11" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.55)">
                {p >= 1e9 ? `${p / 1e9}bn` : p >= 1e6 ? `${p / 1e6}m` : `${p / 1e3}k`}
              </text>
            </g>
          ))}
          {[1e6, 1e5, 1e4, 1e3, 100, 10, 1].map((y) => (
            <g key={y}>
              <line x1={xOf(y)} y1={H - B} x2={xOf(y)} y2={H - B + 6} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1} />
              <text x={xOf(y)} y={H - B + 22} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.55)">
                {y >= 1e6 ? "1 Myr" : y >= 1000 ? `${y / 1000}k` : y === 1 ? "now" : `${y}`}
              </text>
            </g>
          ))}
          <line x1={L} y1={H - B} x2={W - Rm} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <text x={(L + W - Rm) / 2} y={H - 16} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)">years before present (log scale) — time runs left to right →</text>
          <text x={24} y={(T + H - B) / 2} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)" transform={`rotate(-90 24 ${(T + H - B) / 2})`}>
            people alive (log scale) →
          </text>

          {/* the curve */}
          <path d={curve} fill="none" stroke="#f87171" strokeWidth={2.8} />

          {/* milestones */}
          {MILES.map((m, i) => {
            const on = i === idx;
            const x = xOf(m.ybp), y = yOf(m.pop);
            return (
              <g key={m.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <circle cx={x} cy={y} r={18} fill="transparent" />
                <circle cx={x} cy={y} r={on ? 9 : 5.5} fill={m.color} stroke={on ? "#ffffff" : "#0b0d14"}
                  strokeWidth={on ? 2 : 1.2} />
                <text x={x} y={y - (on ? 20 : 14)} textAnchor={i >= 4 ? "end" : "middle"} fontSize={on ? 13 : 11.5}
                  fontWeight={on ? 700 : 500} fontFamily="Inter, sans-serif"
                  fill={on ? m.color : "rgb(var(--c-text-rgb) / 0.7)"}>
                  {m.name}
                </text>
              </g>
            );
          })}

          {/* the flat stretch, called out */}
          <text x={xOf(200000)} y={yOf(3e5) + 34} textAnchor="middle" fontSize="12"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            ← 95% of our history is this flat line →
          </text>
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-4">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
            {sel.name}
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
            {fmtYbp(sel.ybp)} · about {fmtPop(sel.pop)} people alive
          </span>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {MILES.map((m, i) => (
          <button key={m.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {m.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 7.1.b — Out of Africa ─────────────────────────────────────────
   The peopling of the world, as a schematic world map with dated
   migration arrows. Each leg is selectable; the map is a simplified
   equirectangular outline (drawn as blocks — honest schematic, not a
   fake-precise coastline). ←/→ walk the legs in chronological order. */

type Leg = {
  id: string;
  name: string;
  when: string;
  color: string;
  /** path in viewBox coords */
  d: string;
  body: ReactNode;
};

const LEGS: Leg[] = [
  { id: "africa", name: "Within Africa", when: "300,000 years ago", color: "#fbbf24",
    d: "M 470 300 C 460 270, 466 250, 476 232",
    body: <>Our species arises in Africa and spreads across it. For two hundred thousand years, this is the whole human world — small bands, stone tools, fire, and an increasingly sophisticated toolkit of ochre, beads, and buried dead.</> },
  { id: "levant", name: "Into the Middle East", when: "about 60,000 years ago", color: "#f0a35e",
    d: "M 476 232 C 500 214, 528 206, 552 202",
    body: <>The dispersal that stuck. Genetics shows the founding group was small — every person alive outside Africa today descends from it. (Earlier excursions happened, but left few descendants.)</> },
  { id: "asia", name: "Along the coast to Australia", when: "by 50,000 years ago", color: "#f87171",
    d: "M 552 202 C 606 226, 660 252, 700 268 C 726 280, 744 300, 752 330",
    body: <>A rapid coastal expansion east through South Asia — the Bengal delta among the richest stretches of it — and on through the islands of Southeast Asia. Reaching Australia required <em>crossing open sea</em>, which means boats: the first seafaring in human history.</> },
  { id: "europe", name: "Into Europe and North Asia", when: "45,000 to 35,000 years ago", color: "#a78bfa",
    d: "M 552 202 C 540 168, 520 148, 496 136 M 552 202 C 610 176, 672 156, 726 150",
    body: <>Other groups head north into colder country, which demands tailored clothing, shelters, and cooperation. In Europe they meet the Neanderthals — and interbreed with them; if you have non-African ancestry, a percent or two of your DNA is Neanderthal.</> },
  { id: "americas", name: "Into the Americas", when: "by 15,000 years ago (perhaps earlier)", color: "#4ade80",
    d: "M 726 150 C 780 132, 830 138, 866 168 M 150 150 C 170 210, 200 250, 226 300 C 244 340, 254 380, 250 410",
    body: <>With the ice age locking up sea water, a land bridge opens between Siberia and Alaska. People cross it — or coast around it — and within a few thousand years have walked to the southern tip of South America. Footprints in New Mexico may push the arrival back to 21,000 years ago.</> },
  { id: "pacific", name: "Across the open Pacific", when: "3,000 years ago to about 1300 CE", color: "#38bdf8",
    d: "M 752 330 C 800 320, 850 330, 884 350",
    body: <>The last and most astonishing leg. Austronesian navigators sail thousands of kilometres across empty ocean — steering by stars, swells, and birds (<em>§7.3</em>) — to find islands the size of a village. Hawai&rsquo;i, Rapa Nui, and New Zealand are settled only a few centuries before Europeans arrived there.</> },
];

export function MigrationPanel(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const sel = LEGS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(LEGS.length - 1, i + d)));

  const W = 904, H = 470;

  /* A deliberately schematic world: blocky landmasses, no false precision. */
  const LAND = [
    { name: "N. America", d: "M 96 96 L 250 92 L 268 160 L 236 214 L 176 214 L 120 168 Z" },
    { name: "S. America", d: "M 218 240 L 262 250 L 268 330 L 236 424 L 208 396 L 216 306 Z" },
    { name: "Europe", d: "M 452 118 L 546 106 L 556 156 L 490 170 L 452 152 Z" },
    { name: "Africa", d: "M 452 186 L 540 178 L 548 258 L 502 348 L 458 306 L 442 236 Z" },
    { name: "Asia", d: "M 558 104 L 760 96 L 800 150 L 742 208 L 640 214 L 566 176 Z" },
    { name: "S. Asia", d: "M 620 216 L 682 214 L 676 266 L 636 268 Z" },
    { name: "SE Asia", d: "M 700 232 L 758 244 L 748 292 L 706 282 Z" },
    { name: "Australia", d: "M 726 320 L 800 316 L 806 380 L 736 384 Z" },
  ];

  return (
    <FigurePanel
      idx="7.1.b"
      kicker="Out of Africa"
      caption={
        <>
          How one African primate came to occupy every habitable place on Earth — step through the legs with the arrow
          keys. The map is a deliberate schematic, not a coastline: what matters is the order and the dates. Two things
          to notice — reaching Australia meant crossing open sea (so, boats, 50,000 years ago), and the last islands of
          the Pacific were found by navigators steering with nothing but stars, swells, and birds.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "linear-gradient(180deg, #0b1526 0%, #0a1020 60%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Human migration: ${sel.name}, ${sel.when}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* land */}
          {LAND.map((l) => (
            <path key={l.name} d={l.d} fill="#1e2a3a" stroke="rgb(var(--c-text-rgb) / 0.18)" strokeWidth={1} />
          ))}

          {/* all legs, faint; the selected one bright */}
          {LEGS.map((l, i) => (
            <g key={l.id}>
              <path d={l.d} fill="none" stroke={l.color}
                strokeWidth={i === idx ? 3.4 : 1.6}
                opacity={i === idx ? 1 : 0.28}
                strokeDasharray={i === idx ? "none" : "5 6"}
                markerEnd={i === idx ? "url(#mig-arr)" : undefined}
                style={{ transition: "opacity 200ms var(--ease)" }} />
            </g>
          ))}

          {/* origin marker */}
          <circle cx={470} cy={300} r={6} fill="#fbbf24" />
          <text x={470} y={322} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#fbbf24">
            we start here
          </text>

          {/* leg selector strip */}
          {LEGS.map((l, i) => {
            const on = i === idx;
            const bw = (W - 40) / LEGS.length;
            const x = 20 + i * bw;
            return (
              <g key={`sel-${l.id}`} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={x + 3} y={H - 44} width={bw - 6} height={30} rx={6}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.1)" : "rgb(var(--c-text-rgb) / 0.03)"}
                  stroke={on ? l.color : "rgb(var(--c-text-rgb) / 0.14)"} strokeWidth={on ? 1.6 : 1} />
                <text x={x + bw / 2} y={H - 30} textAnchor="middle" fontSize="11.5" fontWeight={on ? 700 : 500}
                  fontFamily="Inter, sans-serif" fill={on ? l.color : "rgb(var(--c-text-rgb) / 0.7)"}>
                  {l.name.length > 18 ? l.name.slice(0, 17) + "…" : l.name}
                </text>
                <text x={x + bw / 2} y={H - 18} textAnchor="middle" fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
                  {l.when.replace("about ", "").replace(" years ago", " ya")}
                </text>
              </g>
            );
          })}

          <defs>
            <marker id="mig-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={sel.color} />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name} · {sel.when}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {LEGS.map((l, i) => (
          <button key={l.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {l.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
