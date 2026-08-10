import { useRef, useState, useEffect, useLayoutEffect, type CSSProperties, type FormEvent, type JSX, type ReactNode } from "react";
import katex from "katex";
import { RINGS } from "./worldmap";

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

const EQ_EARLY = "P=\\dfrac{2.3\\times10^{9}}{\\ln\\!\\left[34{,}000+e^{(100-t)/25.5}\\right]}";
const EQ_LATE = "P=\\dfrac{3.82\\times10^{9}}{\\ln\\!\\left[1.25+e^{(1980-t)/25.5}\\right]^{0.716}}";

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
                  the slow millennia (before 400 CE) — dashed
                </div>
                <div dangerouslySetInnerHTML={{ __html: katex.renderToString(EQ_EARLY, { throwOnError: false }) }} />
              </div>
              <div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: ink(0.55), marginBottom: 4 }}>
                  the modern surge (after 400 CE) — solid
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
   The peopling of the world as a timelapse over a real coastline map
   (Natural Earth land-110m, Pacific-centred like the classic National
   Geographic spread this redraws). Nine dated dispersals drawn as
   curved routes; a log-time clock running 300,000 → 500 years ago
   drives the reveal. Play/pause + speed pills + a scrubber (the
   scrubber is the keyboard target: ←/→ always, wheel in fullscreen).
   Clicking a route jumps the clock to that dispersal. */

const MAP_W = 960, MAP_H = 347;          /* 360° × 130° equirectangular crop */
const LON0 = -30, LAT_TOP = 74;          /* lon domain [-30°, 330°], lat [-56°, 74°] */
const mx = (lon: number) => ((lon - LON0) / 360) * MAP_W;
const my = (lat: number) => ((LAT_TOP - lat) / 130) * MAP_H;

/* Pacific-centred land outline: each ring drawn at lon and lon+360,
   clipped to the frame, so seam-crossing shapes (Greenland) stay whole */
const LAND_D = (() => {
  /* unwrap antimeridian-crossing rings (Fiji, Wrangel) so no ring jumps
     360° between consecutive points, else the fill streaks across the map */
  const unwrapped = RINGS.map((ring) => {
    let prev = ring[0][0];
    return ring.map(([lon, lat]) => {
      let l = lon;
      while (l - prev > 180) l -= 360;
      while (l - prev < -180) l += 360;
      prev = l;
      return [l, lat] as [number, number];
    });
  });
  let d = "";
  for (const off of [-360, 0, 360]) {
    for (const ring of unwrapped) {
      let minx = 1e9, maxx = -1e9;
      for (const [lon] of ring) { const x = mx(lon + off); if (x < minx) minx = x; if (x > maxx) maxx = x; }
      if (maxx < 0 || minx > MAP_W) continue;
      d += ring.map(([lon, lat], i) => `${i ? "L" : "M"}${mx(lon + off).toFixed(1)} ${my(lat).toFixed(1)}`).join("") + "Z";
    }
  }
  return d;
})();

/* tiny Pacific islands below the 110m resolution, as honest dots */
const ISLES: [number, number][] = [
  [160.2, -9.5], [166.9, -15.4], [178, -17.8], [184.8, -21.2], [187.9, -13.8],
  [210.4, -17.5], [220.6, -9.5], [204.5, 20.7], [250.6, -27.1],
];

const T_START = 300, T_END = 0.5;        /* ka; log clock like the 7.1.a axis */
const LOG_SPAN = Math.log(T_START / T_END);
const tOf = (u: number) => T_START * Math.exp(-u * LOG_SPAN);
const uOf = (t: number) => Math.log(T_START / t) / LOG_SPAN;
const BASE_DUR = 28;                      /* seconds for a full run at 1× */

const fmtT = (T: number) => {
  const yr = T >= 10 ? Math.round(T) * 1000 : Math.round(T * 10) * 100;
  return `${yr.toLocaleString("en-US")} years ago`;
};

type Leg = {
  id: string;
  name: string;
  when: string;
  /** dispersal window, ka before present */
  t0: number; t1: number;
  color: string;
  /** one or more waypoint chains [lon, lat] in the shifted domain */
  routes: [number, number][][];
  label: { lon: number; lat: number; text: string; anchor?: "start" | "middle" | "end" };
  body: ReactNode;
};

const LEGS: Leg[] = [
  { id: "africa", name: "Within Africa", when: "from about 200,000 years ago", t0: 220, t1: 100, color: "#2dd4bf",
    routes: [
      [[36, 8], [30, -2], [28, -14], [24, -29]],
      [[36, 8], [20, 10], [4, 10], [-8, 13]],
      [[36, 8], [28, 18], [19, 27]],
    ],
    label: { lon: 6, lat: -8, text: "~200,000 ya", anchor: "middle" },
    body: <>Our species arises in Africa and spreads across it — south to the Cape, west to the Atlantic, north into the Maghreb. For two hundred thousand years, this is the whole human world: small bands, stone tools, fire, and an increasingly sophisticated toolkit of ochre, beads, and buried dead.</> },
  { id: "ooa", name: "Out of Africa", when: "70,000–50,000 years ago", t0: 70, t1: 55, color: "#38bdf8",
    routes: [[[38, 12], [44, 15], [51, 20], [59, 24], [66, 25], [72, 24]]],
    label: { lon: 55, lat: 8, text: "70,000–50,000 ya", anchor: "middle" },
    body: <>The dispersal that stuck. A group crosses from the Horn of Africa through Arabia — small enough that every non-African alive today carries the genetic signature of that bottleneck. (Earlier excursions happened, but left few descendants.)</> },
  { id: "australia", name: "To Australia", when: "by about 50,000 years ago", t0: 55, t1: 48, color: "#818cf8",
    routes: [
      [[72, 24], [80, 15], [88, 21], [97, 14], [102, 4], [110, -4], [120, -7], [132, -4], [141, -9], [137, -17], [133, -25]],
      [[141, -9], [150, -7], [160, -9.5]],
    ],
    label: { lon: 107, lat: -24, text: "50,000 ya", anchor: "middle" },
    body: <>A rapid coastal expansion east through South Asia — the Bengal delta among the richest stretches of it — and on through the islands of Southeast Asia. Reaching Australia required <em>crossing open sea</em>, which means boats: the first seafaring in human history.</> },
  { id: "europe", name: "Into Europe", when: "45,000–35,000 years ago", t0: 45, t1: 35, color: "#60a5fa",
    routes: [[[40, 33], [33, 39], [24, 43], [14, 45], [3, 46], [-6, 41]]],
    label: { lon: -24, lat: 55, text: "45,000–35,000 ya", anchor: "start" },
    body: <>Other groups head north-west into colder country, which demands tailored clothing, shelters, and cooperation. In Europe they meet the Neanderthals — and interbreed with them; if you have non-African ancestry, a percent or two of your DNA is Neanderthal.</> },
  { id: "nasia", name: "Across northern Asia", when: "45,000–35,000 years ago", t0: 45, t1: 35, color: "#a78bfa",
    routes: [[[75, 28], [88, 36], [100, 44], [112, 50], [124, 55], [138, 60], [150, 63]]],
    label: { lon: 84, lat: 52, text: "45,000–35,000 ya", anchor: "end" },
    body: <>Other bands push north and east across the mammoth steppe — country that demands sewn clothing, sturdy shelter, and planning for winter. In Siberia and the Altai they meet the Denisovans, cousins known mostly from DNA; traces of that mixing survive today from the Himalayas to Oceania.</> },
  { id: "beringia", name: "Across Beringia", when: "20,000–15,000 years ago", t0: 20, t1: 15, color: "#c084fc",
    routes: [[[150, 63], [163, 65], [175, 66], [188, 65], [200, 63], [210, 60], [222, 55], [232, 47], [238, 38], [244, 27], [252, 17], [262, 11], [271, 8], [278, 5]]],
    label: { lon: 197, lat: 69.5, text: "20,000–15,000 ya", anchor: "middle" },
    body: <>With the ice age locking up sea water, the shallow floor between Siberia and Alaska becomes dry land — Beringia. People live on it for millennia, then move through as the ice relents, on foot and likely by boat along the kelp-rich coast. Footprints at White Sands, New Mexico, may push the first arrivals back to 21,000 years ago.</> },
  { id: "patagonia", name: "To Patagonia", when: "15,000–12,000 years ago", t0: 15, t1: 12, color: "#f472b6",
    routes: [[[278, 5], [283, -5], [285, -14], [289, -24], [288, -34], [291, -44], [293, -52]]],
    label: { lon: 283, lat: -40, text: "15,000–12,000 ya", anchor: "end" },
    body: <>Once past the ice, the Americas open like a funnel: people sweep from Alaska to the southern tip of South America in a few thousand years — the fastest sustained expansion in our history, two continents of new plants, animals, and landscapes learned generation by generation.</> },
  { id: "austronesia", name: "The Austronesian expansion", when: "about 3,500 years ago", t0: 3.5, t1: 3.0, color: "#fb923c",
    routes: [[[121, 24], [122, 17], [124, 10], [128, 3], [134, -2], [142, -4], [150, -5.5]]],
    label: { lon: 111, lat: 13, text: "3,500 ya", anchor: "end" },
    body: <>A new expansion begins — not on foot but under sail. Farmers from Taiwan, speaking early Austronesian languages, work down through the Philippines to the coasts of New Guinea, carrying pigs, pottery, and the outrigger canoe: the technology that will crack open the Pacific.</> },
  { id: "pacific", name: "Across the open Pacific", when: "3,000–700 years ago", t0: 3.0, t1: 0.7, color: "#f87171",
    routes: [
      [[152, -6], [162, -10], [169, -15.5], [178, -17.5], [185, -20], [189, -14.5], [199, -16.5], [210.4, -17.5], [220.6, -9.5]],
      [[210.4, -17.5], [207, -5], [204.8, 8], [204.5, 20]],
      [[220.6, -9.5], [235, -18], [250.6, -27.1]],
      [[185, -20], [180, -29], [176, -38.5]],
    ],
    label: { lon: 214, lat: -32, text: "3,000–700 ya", anchor: "middle" },
    body: <>The last and most astonishing leg. Austronesian navigators sail thousands of kilometres across empty ocean — steering by stars, swells, and birds (<em>§7.3</em>) — to find islands the size of a village. Hawai&rsquo;i, Rapa Nui, and New Zealand are settled only a few centuries before Europeans arrived there.</> },
];

/* uniform Catmull–Rom through the projected waypoints → smooth bends */
function smoothChain(raw: [number, number][], seg = 16): [number, number][] {
  const P = raw;
  const out: [number, number][] = [P[0]];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 1; j <= seg; j++) {
      const t = j / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  return out;
}

type RouteGeo = { leg: number; d: string; pts: [number, number][]; cum: number[]; len: number };

const ROUTES: RouteGeo[] = LEGS.flatMap((leg, li) =>
  leg.routes.map((wps) => {
    const pts = smoothChain(wps.map(([lon, lat]) => [mx(lon), my(lat)] as [number, number]));
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
    return { leg: li, d, pts, cum, len: cum[cum.length - 1] };
  })
);

function tipAt(rt: RouteGeo, p: number): [number, number, number] {
  const target = p * rt.len;
  let lo = 0, hi = rt.cum.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (rt.cum[mid] < target) lo = mid + 1; else hi = mid; }
  const i = Math.max(1, lo);
  const [x0, y0] = rt.pts[i - 1], [x1, y1] = rt.pts[i];
  const span = rt.cum[i] - rt.cum[i - 1] || 1;
  const f = (target - rt.cum[i - 1]) / span;
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return [x0 + f * (x1 - x0), y0 + f * (y1 - y0), ang];
}

export function MigrationPanel(): JSX.Element {
  const [selIdx, setSelIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const sel = LEGS[selIdx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const ink = (a: number) => `rgb(var(--c-text-rgb) / ${a})`;

  const uRef = useRef(1);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const activeRef = useRef(-1);
  const autoSelRef = useRef(false);
  const routeRefs = useRef<(SVGPathElement | null)[]>([]);
  const tipRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);
  const sliderRef = useRef<HTMLInputElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  /* imperative repaint — never a per-frame setState (FigureFrame rule) */
  const paint = (u: number) => {
    uRef.current = u;
    const T = tOf(u);
    let active = -1;
    LEGS.forEach((leg, li) => {
      const p = Math.max(0, Math.min(1, (Math.log(leg.t0) - Math.log(T)) / (Math.log(leg.t0) - Math.log(leg.t1))));
      if (p > 0) active = li;
      labelRefs.current[li]?.setAttribute("opacity", p > 0 ? "1" : "0");
      ROUTES.forEach((rt, ri) => {
        if (rt.leg !== li) return;
        const el = routeRefs.current[ri];
        if (el) el.style.strokeDashoffset = String(1 - p);
        const tip = tipRefs.current[ri];
        if (!tip) return;
        if (p <= 0.002) tip.setAttribute("opacity", "0");
        else {
          const [x, y, ang] = tipAt(rt, p);
          tip.setAttribute("opacity", "1");
          tip.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
        }
      });
    });
    if (sliderRef.current) sliderRef.current.value = String(u);
    if (readoutRef.current) readoutRef.current.textContent = fmtT(T);
    if (autoSelRef.current && active !== -1 && active !== activeRef.current) setSelIdx(active);
    activeRef.current = active;
  };

  const stop = () => {
    playingRef.current = false;
    autoSelRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
  };

  const tick = (ts: number) => {
    if (!playingRef.current) return;
    const dt = Math.min(0.06, (ts - lastRef.current) / 1000);
    lastRef.current = ts;
    let u = uRef.current + (dt * speedRef.current) / BASE_DUR;
    if (u >= 1) { u = 1; stop(); }
    paint(u);
    if (playingRef.current) rafRef.current = requestAnimationFrame(tick);
  };

  const togglePlay = () => {
    if (playingRef.current) { stop(); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* reduced motion: each press reveals the next dispersal instantly */
      const cps = LEGS.map((l) => uOf(l.t1));
      const target = cps.find((c) => c > uRef.current + 1e-4) ?? cps[0];
      autoSelRef.current = true;
      paint(target);
      autoSelRef.current = false;
      return;
    }
    if (uRef.current >= 0.999) uRef.current = 0;
    playingRef.current = true;
    autoSelRef.current = true;
    setPlaying(true);
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const onScrub = (e: FormEvent<HTMLInputElement>) => {
    if (playingRef.current) stop();
    autoSelRef.current = true;
    paint(parseFloat((e.target as HTMLInputElement).value));
    autoSelRef.current = false;
  };

  const jumpToLeg = (li: number) => {
    if (playingRef.current) stop();
    paint(uOf(LEGS[li].t1));
    setSelIdx(li);
  };

  useLayoutEffect(() => { paint(uRef.current); }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <FigurePanel
      idx="7.1.b"
      kicker="Out of Africa"
      caption={
        <>
          The peopling of the world as a timelapse over real coastlines (routes are schematic reconstructions; the
          dates are approximate and debated). Press play — or scrub the clock with the slider, ←/→, or the wheel in
          fullscreen — and watch nine dispersals unfold from 300,000 years ago to the settling of the last Pacific
          islands. Click any route to jump to its story.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        style={{ background: "rgb(var(--c-bg-rgb) / 0.55)", border: `1px solid ${ink(0.1)}` }}
      >
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Timelapse map of human migration; selected: ${sel.name}, ${sel.when}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <clipPath id="ooa-clip"><rect x={0} y={0} width={MAP_W} height={MAP_H} /></clipPath>
          </defs>
          <g clipPath="url(#ooa-clip)">
            {/* real land, label-less */}
            <path d={LAND_D} fill={ink(0.12)} stroke={ink(0.26)} strokeWidth={0.6} fillRule="evenodd" />
            {ISLES.map(([lon, lat], i) => (
              <circle key={i} cx={mx(lon)} cy={my(lat)} r={1.7} fill={ink(0.4)} />
            ))}

            {/* origin */}
            <circle cx={mx(36)} cy={my(8)} r={3.4} fill="var(--color-solar)" stroke="rgb(var(--c-bg-rgb))" strokeWidth={1} />

            {/* ghost routes (the road ahead) + fat click targets */}
            {ROUTES.map((rt, ri) => (
              <g key={`g${ri}`}>
                <path d={rt.d} fill="none" stroke={LEGS[rt.leg].color} strokeWidth={1.3}
                  strokeDasharray="3 5" opacity={0.22} />
                <path d={rt.d} fill="none" stroke="transparent" strokeWidth={14}
                  style={{ cursor: "pointer" }} onClick={() => jumpToLeg(rt.leg)} />
              </g>
            ))}

            {/* revealed routes — dash-offset driven by the clock */}
            {ROUTES.map((rt, ri) => (
              <path key={`r${ri}`} ref={(el) => { routeRefs.current[ri] = el; }} d={rt.d} fill="none"
                stroke={LEGS[rt.leg].color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray="1 1" style={{ pointerEvents: "none" }} />
            ))}

            {/* advancing arrowheads */}
            {ROUTES.map((rt, ri) => (
              <g key={`t${ri}`} ref={(el) => { tipRefs.current[ri] = el; }} opacity={0} style={{ pointerEvents: "none" }}>
                <path d="M2.5 0 L-7 4 L-7 -4 Z" fill={LEGS[rt.leg].color} />
              </g>
            ))}

            {/* date stamps, appearing as each dispersal begins */}
            {LEGS.map((leg, li) => (
              <text key={leg.id} ref={(el) => { labelRefs.current[li] = el; }} opacity={0}
                x={mx(leg.label.lon)} y={my(leg.label.lat)} textAnchor={leg.label.anchor ?? "middle"}
                fontSize="10.5" fontFamily="JetBrains Mono, monospace" fill={ink(0.65)}
                style={{ cursor: "pointer" }} onClick={() => jumpToLeg(li)}>
                {leg.label.text}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* transport: play · speed · clock scrubber · readout */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2" style={{ flexShrink: 0 }}>
        <button type="button" onClick={togglePlay} data-shortcut="p"
          className="rounded-md font-mono uppercase tracking-[0.14em]"
          style={{
            fontSize: sz(0.6) ?? "11px", padding: "6px 14px",
            border: `1px solid ${playing ? "var(--color-solar)" : ink(0.25)}`,
            color: playing ? "var(--color-solar)" : ink(0.8),
            background: ink(0.04), cursor: "pointer",
          }}>
          {playing ? "❚❚ pause" : "▶ play"}
        </button>
        <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
          {[1, 2, 4].map((s) => (
            <button key={s} type="button" onClick={() => { setSpeed(s); speedRef.current = s; }}
              className="rounded font-mono"
              style={{
                fontSize: sz(0.55) ?? "10.5px", padding: "4px 9px", cursor: "pointer",
                border: `1px solid ${ink(speed === s ? 0.5 : 0.15)}`,
                color: ink(speed === s ? 0.9 : 0.55),
                background: ink(speed === s ? 0.07 : 0.02),
              }}>
              {s}×
            </button>
          ))}
        </div>
        <input ref={sliderRef} type="range" min={0} max={1} step={0.002} defaultValue={1} onInput={onScrub}
          aria-label="Timelapse clock" className="grow" style={{ minWidth: 140, accentColor: "var(--color-solar)" }} />
        <span ref={readoutRef} className="font-mono"
          style={{ fontSize: sz(0.58) ?? "11.5px", color: ink(0.7), minWidth: "15ch", textAlign: "right" }} />
      </div>

      {/* the selected dispersal's story */}
      <div className="mt-3 rounded-md" style={{
        background: ink(0.03),
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-4">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.66) ?? "12px" }}>
            {sel.name}
          </span>
          <span className="font-mono" style={{ color: ink(0.66), fontSize: sz(0.58) ?? "11px" }}>
            {sel.when}
          </span>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: ink(0.9), fontSize: sz(0.85) ?? "14px", minHeight: "6em" }}>
          {sel.body}
        </div>
      </div>

      <div className="sr-only" aria-hidden="false">
        {LEGS.map((leg, i) => (
          <button key={leg.id} type="button" onClick={() => jumpToLeg(i)} data-shortcut={String(i + 1)}
            className={selIdx === i ? "is-active" : ""} aria-pressed={selIdx === i}>
            {leg.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
