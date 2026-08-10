import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";
import katex from "katex";

function FigurePanel({
  idx, kicker, caption, children, fitFs = false, sidebar = false, vizFill = false, rail,
}: {
  idx: string; kicker: string; caption: ReactNode; children: ReactNode;
  fitFs?: boolean; sidebar?: boolean; vizFill?: boolean; rail?: ReactNode;
}) {
  const cls = `figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}${sidebar ? " is-fs-sidebar" : ""}${vizFill ? " is-fs-fill" : ""}`;
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
   Redrawn after Taagepera & Nemčok (2024), "World population over
   millennia": calendar year on a log(2150 − t) axis (so the last two
   millennia spread out while the deep past compresses), population in
   millions on a log axis, historical estimates with uncertainty bars,
   and their published two-regime model curve with both equations shown
   as insets. Nine labelled revolutions on the right are selectable
   (←/→ or 1–9); in fullscreen the commentary becomes an in-plot inset
   so the chart keeps the whole screen. */

/* Taagepera & Nemčok 2024 two-regime model, population in MILLIONS.
   Early:  P = 2.3×10⁹ / ln[34,000 + e^((100−t)/25.5)]        (t < +400)
   Late:   P = 3.82×10⁹ / ln[1.25 + e^((1980−t)/25.5)]^0.716  (t > +400) */
const lnBig = (A: number, x: number) => (x > 30 ? x : Math.log(A + Math.exp(x)));
function popModel(t: number): number {
  const early = 2300 / lnBig(34000, (100 - t) / 25.5);
  const late = 3820 / Math.pow(lnBig(1.25, (1980 - t) / 25.5), 0.716);
  if (t <= 300) return early;
  if (t >= 500) return late;
  const u = (t - 300) / 200, s = u * u * (3 - 2 * u);
  return Math.pow(10, (1 - s) * Math.log10(early) + s * Math.log10(late));
}

/* Historical estimates [year, millions, low, high] — deep past from
   genetic/archaeological reconstructions (order-of-magnitude bars),
   recent millennia McEvedy–Jones/HYDE ranges, modern values UN. */
const POP_DATA: [number, number, number?, number?][] = [
  [-1000000, 0.055, 0.028, 0.1],
  [-700000, 0.09, 0.04, 0.4],
  [-500000, 0.17, 0.05, 1.0],
  [-400000, 0.28, 0.06, 1.4],
  [-100000, 1.7, 0.4, 8],
  [-70000, 0.028, 0.005, 0.6],
  [-30000, 2.2, 0.8, 6],
  [-10000, 3.6, 1, 10],
  [-7000, 6, 3.5, 11],
  [-5000, 7, 4, 14],
  [-4000, 12, 7, 22],
  [-3000, 27, 14, 45],
  [-2000, 45, 27, 72],
  [-1000, 72, 50, 115],
  [-500, 100, 70, 150],
  [-200, 150, 105, 230],
  [1, 200, 150, 300],
  [400, 190, 160, 250],
  [800, 220, 180, 270],
  [1000, 265, 230, 345],
  [1200, 360, 300, 450],
  [1400, 350, 300, 440],
  [1500, 461, 420, 540],
  [1600, 554, 500, 620],
  [1700, 603, 560, 680],
  [1750, 770, 700, 850],
  [1800, 990, 900, 1050],
  [1850, 1260],
  [1900, 1650],
  [1930, 2070],
  [1950, 2530],
  [1960, 3030],
  [1970, 3700],
  [1980, 4440],
  [1990, 5320],
  [2000, 6140],
  [2010, 6960],
  [2020, 7790],
  [2025, 8200],
];

type PopEvent = { id: string; label: string; name: string; when: string; t: number; body: ReactNode };

const EVENTS: PopEvent[] = [
  { id: "pleistocene", label: "Mid-Pleistocene transition (1 Ma)", name: "Mid-Pleistocene transition",
    when: "1 million years ago", t: -1000000,
    body: <>The ice-age cycles settle into their slow 100,000-year rhythm. The humans of this time are <em>Homo erectus</em> and kin — already walking three continents with fire and hand-axes, but numbering only tens of thousands. Estimates this deep in time come from genetics and sparse archaeology, which is why the uncertainty bars span a factor of ten.</> },
  { id: "sapiens", label: "Homo sapiens in Africa (300 ka)", name: "Homo sapiens appears",
    when: "300,000 years ago", t: -300000,
    body: <>Our species emerges in Africa. For the next quarter of a million years there are never more than a few hundred thousand of us — fewer than fill a modern stadium. We are, by any measure, a rare and unremarkable large mammal.</> },
  { id: "ooa", label: "Expansion out of Africa (100 ka)", name: "Expansion out of Africa",
    when: "100,000 years ago", t: -100000,
    body: <>Modern humans reach the Levant by about 100,000 years ago, but those early excursions left few descendants. The dispersal that stuck came around 60,000 years ago — a group so small that every non-African alive today carries the genetic mark of that bottleneck. Note the low outlier near 70,000 years ago: the whole species may briefly have numbered only tens of thousands.</> },
  { id: "paleolithic", label: "Upper Paleolithic revolution (50 ka)", name: "Upper Paleolithic revolution",
    when: "50,000 years ago", t: -50000,
    body: <>Beads, ochre, buried dead, figurative art, projectile weapons — and the first open-sea crossings, to Australia. Nothing about our anatomy changed; something about our culture did. The curve barely notices yet: about a million people, but now armed with symbols.</> },
  { id: "farming", label: "Agricultural revolution (10 ka)", name: "Agricultural revolution",
    when: "10,000 years ago", t: -8000,
    body: <>The first great kink in the curve. Domesticate a plant and a hectare of land feeds a hundred times more people than it does by foraging. Food can be stored, so people stay put; staying put means more children. Population begins to climb — and never really stops.</> },
  { id: "cities", label: "Urban revolution (5 ka)", name: "Urban revolution",
    when: "5,000 years ago", t: -3000,
    body: <>Surplus food frees people from growing it, and specialists appear: priests, soldiers, potters, scribes. With <strong>writing</strong>, information escapes the human skull for the first time — knowledge can now outlive the person who had it, and accumulate.</> },
  { id: "industry", label: "Industrial revolution (c. 1800)", name: "Industrial revolution",
    when: "around 1800 CE", t: 1800,
    body: <>We learn to burn the buried forests of §6.2 — coal, then oil — and a single human commands the energy of dozens of servants. Machines, medicine, and sanitation follow. The first billion people arrive around 1800, after 300,000 years of trying.</> },
  { id: "digital", label: "Digital globalization", name: "Digital globalization",
    when: "around 2000 CE", t: 2000,
    body: <>The steepest stretch of the curve — and, hidden inside it, the turn. The growth <em>rate</em> peaked around 1968 at about 2.1% per year and has fallen ever since, even as the internet stitched eight billion people into one information network. We passed 8 billion around 2022.</> },
  { id: "warming", label: "Global warming risk", name: "Global warming risk",
    when: "toward 2100 (projection)", t: 2090,
    body: <>Both this model and UN projections level off near 10–11 billion late this century — the first plateau in our history chosen by falling birth rates rather than famine or plague. The label is Taagepera &amp; Nemčok's own caution: whether the plateau is a gentle landing depends on what a planet warmed by that final stroke does next.</> },
];

const EQ_EARLY = "P=\\dfrac{2.3\\times10^{9}}{\\ln\\!\\left[34{,}000+e^{(100-t)/25.5}\\right]},\\quad t<+400";
const EQ_LATE = "P=\\dfrac{3.82\\times10^{9}}{\\ln\\!\\left[1.25+e^{(1980-t)/25.5}\\right]^{0.716}},\\quad t>+400";

export function PopulationPanel(): JSX.Element {
  const [idx, setIdx] = useState(4);
  const sel = EVENTS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(EVENTS.length - 1, i + d)));

  const W = 960, H = 560;
  const L = 64, R = 240, T = 26, B = 58;
  const PW = W - L - R, PH = H - T - B;
  const lg = Math.log10;

  /* x: calendar year on a log(2150 − t) axis, reversed so time runs → */
  const TS = 2150;
  const XL0 = lg(TS + 1000000), XL1 = lg(TS - 2100);
  const xOf = (t: number) => L + ((XL0 - lg(TS - t)) / (XL0 - XL1)) * PW;
  /* y: population in millions, log 0.01 → 10,000 (headroom to ~14,000) */
  const YT = 4.15, YB = -2.1;
  const yOf = (m: number) => T + ((YT - lg(m)) / (YT - YB)) * PH;

  const X_TICKS: [number, string][] = [
    [-1000000, "-1M"], [-100000, "-100k"], [-10000, "-10k"], [-2000, "-2k"],
    [0, "0"], [1000, "1k"], [1500, "1500"], [2000, "2000"], [2100, "2100"],
  ];
  const Y_TICKS: [number, string][] = [
    [0.01, "0.01"], [0.1, "0.1"], [1, "1"], [10, "10"], [100, "100"], [1000, "1,000"], [10000, "10,000"],
  ];

  /* model curve, sampled uniformly in x; dashed before year 0, solid after */
  const path = (t0: number, t1: number) => {
    const n = 220, x0 = lg(TS - t0), x1 = lg(TS - t1);
    return Array.from({ length: n })
      .map((_, i) => {
        const t = TS - Math.pow(10, x0 + (i / (n - 1)) * (x1 - x0));
        return `${i === 0 ? "M" : "L"} ${xOf(t).toFixed(1)} ${yOf(popModel(t)).toFixed(1)}`;
      })
      .join(" ");
  };
  const dashedCurve = path(-1000000, 0);
  const solidCurve = path(0, 2100);

  /* right-hand label rows: at the model height of each event. Later events
     sit higher (smaller y), so relax collisions upward from the top. */
  const labelY = (() => {
    const ys = EVENTS.map((e) => yOf(popModel(e.t)) + 4);
    for (let i = ys.length - 2; i >= 0; i--) if (ys[i] < ys[i + 1] + 21) ys[i] = ys[i + 1] + 21;
    return ys;
  })();

  const fmtPop = (m: number) =>
    m >= 9000 ? "10–11 billion" :
    m >= 950 ? `${(m / 1000).toFixed(1)} billion` :
    m >= 1 ? `${Math.round(m)} million` :
    `${Math.round(m * 1000)} thousand`;

  const ink = (a: number) => `rgb(var(--c-text-rgb) / ${a})`;
  const accent = "var(--color-solar)";
  const selX = xOf(sel.t), selY = yOf(popModel(sel.t));

  const detail = (
    <>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono tracking-[0.16em] uppercase" style={{ color: accent, fontSize: sz(0.66) ?? "12px" }}>
          {sel.name}
        </span>
        <span className="font-mono" style={{ color: ink(0.66), fontSize: sz(0.58) ?? "11px" }}>
          {sel.when} · about {fmtPop(popModel(sel.t))} people
        </span>
      </div>
      <div className="font-sans leading-[1.5] mt-2" style={{ color: ink(0.9), fontSize: sz(0.78) ?? "14px", minHeight: fs ? undefined : "6.2em" }}>
        {sel.body}
      </div>
    </>
  );

  return (
    <FigurePanel
      idx="7.1.a"
      kicker="A million years of us"
      vizFill
      caption={
        <>
          The human population over a million years, redrawn from Taagepera &amp; Nemčok (2024). Both axes are
          logarithmic — time is plotted as distance from the mid-2100s, which spreads the crowded last two millennia
          while compressing the deep past — with historical estimates (bars mark the uncertainty) and the published
          two-regime model curve. Step through the labelled revolutions with ←/→ or 1–9.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        style={{
          background: "rgb(var(--c-bg-rgb) / 0.55)",
          border: `1px solid ${ink(0.1)}`,
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Human population over one million years; selected: ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* grid */}
          {Y_TICKS.map(([m, lab]) => (
            <g key={lab}>
              <line x1={L} y1={yOf(m)} x2={L + PW} y2={yOf(m)} stroke={ink(0.1)} strokeWidth={1} />
              <text x={L - 8} y={yOf(m) + 4} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace"
                fill={ink(0.6)}>{lab}</text>
            </g>
          ))}
          {X_TICKS.map(([t, lab]) => (
            <g key={lab}>
              <line x1={xOf(t)} y1={T} x2={xOf(t)} y2={T + PH} stroke={ink(0.1)} strokeWidth={1} />
              <line x1={xOf(t)} y1={T + PH} x2={xOf(t)} y2={T + PH + 5} stroke={ink(0.4)} strokeWidth={1} />
              <text x={xOf(t)} y={T + PH + 20} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace"
                fill={ink(0.6)}>{lab}</text>
            </g>
          ))}
          {/* frame + axis titles */}
          <rect x={L} y={T} width={PW} height={PH} fill="none" stroke={ink(0.35)} strokeWidth={1.2} />
          <text x={L + PW / 2} y={H - 14} textAnchor="middle" fontSize="13" fontFamily="Inter, sans-serif"
            fill={ink(0.7)}>Year (logarithmic)</text>
          <text x={18} y={T + PH / 2} textAnchor="middle" fontSize="13" fontFamily="Inter, sans-serif"
            fill={ink(0.7)} transform={`rotate(-90 18 ${T + PH / 2})`}>
            Human population [million; logarithmic]
          </text>

          {/* credit, bottom-left inside the plot */}
          <text x={L + 12} y={T + PH - 12} fontSize="11.5" fontFamily="Inter, sans-serif" fill={ink(0.45)}>
            Data &amp; model: Taagepera &amp; Nemčok, 2024
          </text>

          {/* model curve: dashed reconstruction, solid where records firm up */}
          <path d={dashedCurve} fill="none" stroke={ink(0.5)} strokeWidth={2.4} strokeDasharray="7 6" />
          <path d={solidCurve} fill="none" stroke={ink(0.55)} strokeWidth={2.6} />

          {/* estimates with uncertainty bars */}
          {POP_DATA.map(([t, m, lo, hi], i) => (
            <g key={i}>
              {lo != null && hi != null && (
                <>
                  <line x1={xOf(t)} y1={yOf(lo)} x2={xOf(t)} y2={yOf(hi)} stroke={ink(0.5)} strokeWidth={1.2} />
                  <line x1={xOf(t) - 3.5} y1={yOf(lo)} x2={xOf(t) + 3.5} y2={yOf(lo)} stroke={ink(0.5)} strokeWidth={1.2} />
                  <line x1={xOf(t) - 3.5} y1={yOf(hi)} x2={xOf(t) + 3.5} y2={yOf(hi)} stroke={ink(0.5)} strokeWidth={1.2} />
                </>
              )}
              <circle cx={xOf(t)} cy={yOf(m)} r={3} fill={ink(0.85)} />
            </g>
          ))}

          {/* selected event: guide + ring on the model curve */}
          <line x1={selX} y1={selY} x2={selX} y2={T + PH} stroke={accent} strokeWidth={1} strokeDasharray="3 4" opacity={0.5} />
          <circle cx={selX} cy={selY} r={7.5} fill="none" stroke={accent} strokeWidth={2.4} />
          <circle cx={selX} cy={selY} r={3} fill={accent} />

          {/* right-hand event labels (clickable) */}
          {EVENTS.map((e, i) => {
            const on = i === idx;
            return (
              <g key={e.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={L + PW + 4} y={labelY[i] - 14} width={R - 10} height={20} fill="transparent" />
                <text x={L + PW + 10} y={labelY[i]} fontSize="12" fontFamily="Inter, sans-serif"
                  fontWeight={on ? 700 : 450} fill={on ? accent : ink(0.75)}>
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* the two published regimes, bare in the empty bottom-right */}
          <foreignObject x={L + PW - 342} y={T + PH - 208} width={336} height={200}>
            <div style={{
              width: "100%", height: "100%", display: "flex", flexDirection: "column",
              justifyContent: "flex-end", alignItems: "flex-end", gap: 16,
              color: ink(0.85), fontSize: 13, textAlign: "right",
            }}>
              <div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: ink(0.55), marginBottom: 4 }}>
                  the slow millennia — dashed curve
                </div>
                <div dangerouslySetInnerHTML={{ __html: katex.renderToString(EQ_EARLY, { throwOnError: false }) }} />
              </div>
              <div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: ink(0.55), marginBottom: 4 }}>
                  the modern surge — solid curve
                </div>
                <div dangerouslySetInnerHTML={{ __html: katex.renderToString(EQ_LATE, { throwOnError: false }) }} />
              </div>
            </div>
          </foreignObject>

          {/* fullscreen only: commentary as a legend-style inset over the
              empty upper-left grid, in plot coordinates so it scales with
              the chart and never collides with axes or equations */}
          {fs && (
            <foreignObject x={78} y={38} width={252} height={212}>
              <div style={{
                width: "100%", height: "100%", overflow: "hidden",
                background: "rgb(var(--c-bg-rgb) / 0.9)", border: `1px solid ${ink(0.25)}`,
                borderRadius: 8, padding: "10px 12px",
              }}>
                <div style={{ color: accent, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase",
                  letterSpacing: "0.14em", fontSize: 10.5 }}>{sel.name}</div>
                <div style={{ color: ink(0.65), fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, marginTop: 2 }}>
                  {sel.when} · about {fmtPop(popModel(sel.t))} people
                </div>
                <div style={{ color: ink(0.9), fontFamily: "Inter, sans-serif", fontSize: 11, lineHeight: 1.45, marginTop: 6 }}>
                  {sel.body}
                </div>
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {/* normal flow: commentary as a compact strip under the plot */}
      {!fs && (
        <div className="mt-3 rounded-md" style={{
          background: ink(0.03), border: `1px solid ${ink(0.12)}`,
          padding: "12px 14px", flexShrink: 0,
        }}>
          {detail}
        </div>
      )}

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {EVENTS.map((e, i) => (
          <button key={e.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {e.name}
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
