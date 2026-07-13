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

/* ── 5.2.a — Four billion years of air ──────────────────────────────
   A time slider (the figure's only <input type=range>, so ←/→ and the
   fullscreen wheel drive it for free) sweeps from 4.5 billion years ago
   to today. The chart shows atmospheric oxygen on a logarithmic axis —
   the famous two-step staircase — while the panel beneath reports the
   air, the ocean, and the life of the moment you are standing in.

   Oxygen curve values are the standard textbook reconstruction: a
   vanishing trace before 2.4 Ga, ~1% of today's level after the Great
   Oxidation Event, a long "boring billion" plateau, then a second rise
   after ~0.8 Ga to today's 21%. */

type Era = {
  id: string;
  /** era spans, in billions of years AGO (start > end) */
  from: number; to: number;
  name: string;
  color: string;
  air: string;
  ocean: string;
  life: string;
  body: ReactNode;
};

const ERAS: Era[] = [
  {
    id: "hadean", from: 4.5, to: 4.0, name: "The steam world", color: "#f87171",
    air: "water vapour, CO₂, nitrogen — no oxygen",
    ocean: "none at first, then the first rain",
    life: "none",
    body: <>Volcanoes exhale the second atmosphere: steam, carbon dioxide, nitrogen. As the surface cools below boiling, that steam falls as rain — for centuries — and fills the basins. Zircon crystals aged <strong>4.4 billion years</strong> hint that liquid water was already here.</>,
  },
  {
    id: "anoxic", from: 4.0, to: 2.5, name: "The iron ocean", color: "#fb923c",
    air: "nitrogen, CO₂, methane — still no oxygen",
    ocean: "iron-rich and clear of oxygen",
    life: "microbes living without oxygen; stromatolite mounds",
    body: <>An ocean of dissolved iron, which can only stay dissolved while there is no oxygen to rust it. Microbes live without oxygen, on chemistry from volcanic vents. Layered mounds called <strong>stromatolites</strong> appear by <strong>3.5 billion years ago</strong> — though we cannot tell whether their builders made oxygen. Oxygen-making photosynthesis is certainly running by 3 billion years ago.</>,
  },
  {
    id: "goe", from: 2.5, to: 2.0, name: "The Great Oxidation", color: "#4ade80",
    air: "oxygen appears — but only ~1% of today's",
    ocean: "the iron rusts out and sinks",
    life: "anaerobes retreat; oxygen-breathers rise",
    body: <>For hundreds of millions of years the ocean's iron soaked up every oxygen molecule as fast as it was made — that rust is the banded iron in the rock record. Then the sponge saturates and oxygen reaches the air: the <strong>Great Oxidation Event</strong>, roughly <strong>2.4 to 2.2 billion years ago</strong>. To the anaerobes it was a poison, and they were driven into the airless corners of the world.</>,
  },
  {
    id: "boring", from: 2.0, to: 0.8, name: "The long middle", color: "#38bdf8",
    air: "oxygen stalls at a few percent",
    ocean: "oxygen only near the surface; the deep stays airless",
    life: "the first complex (eukaryotic) cells",
    body: <>Then, strangely, nothing much — well over a billion years of near-stasis, sometimes called the boring billion. Yet in this quiet interval the most consequential thing in the history of life happens: cells with a nucleus, the <strong>eukaryotes</strong> that chapter 6 is about.</>,
  },
  {
    id: "modern", from: 0.8, to: 0, name: "The breathable world", color: "#8ab4f8",
    air: "oxygen climbs to 21% — today's air",
    ocean: "oxygenated top to bottom",
    life: "animals, then land, then everything",
    body: <>A second surge takes oxygen to modern levels. High-energy life becomes possible — animals need it — and the oxygen aloft becomes an <strong>ozone layer</strong>, blocking the Sun's ultraviolet so life can finally leave the water. Every breath you take was manufactured by microbes and plants.</>,
  },
];

/* oxygen fraction of the modern atmosphere (log-plotted), as a function of
   time in Ga ago — the standard two-step reconstruction. */
function o2Frac(ga: number): number {
  if (ga > 2.45) return 1e-5;                                   // vanishing trace
  if (ga > 2.3) {                                               // the Great Oxidation
    const t = (2.45 - ga) / 0.15;
    return Math.pow(10, -5 + t * 3);                            // 1e-5 → 1e-2
  }
  if (ga > 0.8) return 1e-2 * Math.pow(10, (2.3 - ga) * 0.12);  // the long plateau
  const t = (0.8 - ga) / 0.8;                                   // second rise → 1
  return Math.min(1, 0.02 * Math.pow(10, t * 1.7));
}

export function OxygenPanel(): JSX.Element {
  const [ga, setGa] = useState(3.0);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const era = ERAS.find((e) => ga <= e.from && ga > e.to) ?? ERAS[ERAS.length - 1];
  const frac = o2Frac(ga);
  const pct = frac * 21;
  const pctLabel =
    pct < 0.001 ? "less than 0.001%" : pct < 1 ? `${pct.toFixed(pct < 0.1 ? 3 : 2)}%` : `${pct.toFixed(1)}%`;

  const W = 904, H = 470;
  const L = 78, Rm = 30, T = 44, B = 76;
  const xOf = (g: number) => L + ((4.5 - g) / 4.5) * (W - L - Rm);
  const yOf = (f: number) => {
    const lo = Math.log10(1e-6), hi = Math.log10(1.2);
    return H - B - ((Math.log10(Math.max(1e-6, f)) - lo) / (hi - lo)) * (H - T - B);
  };
  const curve = Array.from({ length: 301 })
    .map((_, i) => {
      const g = 4.5 - (i / 300) * 4.5;
      return `${i === 0 ? "M" : "L"} ${xOf(g).toFixed(1)} ${yOf(o2Frac(g)).toFixed(1)}`;
    })
    .join(" ");

  const yticks: [number, string][] = [
    [1, "21% — today"], [0.1, "2%"], [0.01, "0.2%"], [1e-3, "0.02%"], [1e-5, "a trace"],
  ];

  return (
    <FigurePanel
      idx="5.2.a"
      kicker="Four billion years of air"
      caption={
        <>
          Oxygen in Earth's atmosphere across the whole of its history — drag the slider (or use the arrow keys) to
          stand at any moment and read the air, the ocean, and the life of that day. The vertical axis is logarithmic:
          each step is ten times more oxygen. Note the two great steps — the Great Oxidation Event 2.4 billion years
          ago, then a second rise after 800 million years ago that made animals possible. Oxygen is not a geological
          gift; it is exhaust from life.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 40%, #101520 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Atmospheric oxygen through time; standing at ${ga.toFixed(2)} billion years ago, oxygen ${pctLabel}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* era bands */}
          {ERAS.map((e) => {
            const x0 = xOf(e.from), x1 = xOf(e.to);
            const on = e.id === era.id;
            return (
              <g key={e.id} style={{ cursor: "pointer" }} onClick={() => setGa((e.from + e.to) / 2)}>
                <rect x={x0} y={T} width={x1 - x0} height={H - T - B} fill={e.color}
                  opacity={on ? 0.14 : 0.05} style={{ transition: "opacity 220ms var(--ease)" }} />
                <line x1={x1} y1={T} x2={x1} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.14)" strokeWidth={1} />
                <text x={(x0 + x1) / 2} y={T - 12} textAnchor="middle" fontSize="12.5"
                  fontWeight={on ? 700 : 500} fontFamily="Inter, sans-serif"
                  fill={on ? e.color : "rgb(var(--c-text-rgb) / 0.6)"}>{e.name}</text>
              </g>
            );
          })}

          {/* axes */}
          {yticks.map(([f, lab]) => (
            <g key={lab}>
              <line x1={L} y1={yOf(f)} x2={W - Rm} y2={yOf(f)} stroke="rgb(var(--c-text-rgb) / 0.08)" strokeWidth={1} />
              <text x={L - 8} y={yOf(f) + 4} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.6)">{lab}</text>
            </g>
          ))}
          <line x1={L} y1={H - B} x2={W - Rm} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          {[4, 3, 2, 1, 0].map((g) => (
            <g key={g}>
              <line x1={xOf(g)} y1={H - B} x2={xOf(g)} y2={H - B + 6} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
              <text x={xOf(g)} y={H - B + 24} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.6)">{g === 0 ? "today" : `${g} Ga`}</text>
            </g>
          ))}
          <text x={(L + W - Rm) / 2} y={H - 18} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)">
            billions of years ago →
          </text>
          <text x={22} y={(T + H - B) / 2} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)" transform={`rotate(-90 22 ${(T + H - B) / 2})`}>
            oxygen in the air (log scale) →
          </text>

          {/* the curve, and the moment you are standing in */}
          <path d={curve} fill="none" stroke="#4ade80" strokeWidth={2.6} />
          <line x1={xOf(ga)} y1={T} x2={xOf(ga)} y2={H - B} stroke="#ffffff" strokeWidth={1.6} />
          <circle cx={xOf(ga)} cy={yOf(frac)} r={7} fill="#ffffff" stroke="#0b0d14" strokeWidth={1.6} />
          <text x={xOf(ga)} y={T - 26} textAnchor="middle" fontSize="14" fontWeight={700}
            fontFamily="JetBrains Mono, monospace" fill="#ffffff">
            {ga < 0.05 ? "today" : `${ga.toFixed(2)} billion years ago`}
          </text>

          {/* GOE annotation */}
          <text x={xOf(2.4)} y={yOf(3e-3)} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#4ade80">
            ↑ Great Oxidation Event
          </text>
        </svg>
      </div>

      {/* time slider — the figure's keyboard target */}
      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          4.5 Ga
        </span>
        <input type="range" min={0} max={450} step={2} value={Math.round((4.5 - ga) * 100)}
          onChange={(e) => setGa(4.5 - Number(e.currentTarget.value) / 100)}
          aria-label="Time, in billions of years ago" style={{ width: "100%" }} />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          today
        </span>
      </div>

      {/* state of the world — constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${era.color}66`,
        boxShadow: `inset 0 0 0 1px ${era.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-4">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: era.color, fontSize: sz(0.72) ?? "12px" }}>
            {era.name}
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
            oxygen in the air: {pctLabel}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-1 mt-2 font-mono"
          style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
          <div><span style={{ color: era.color }}>air ·</span> {era.air}</div>
          <div><span style={{ color: era.color }}>ocean ·</span> {era.ocean}</div>
          <div><span style={{ color: era.color }}>life ·</span> {era.life}</div>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {era.body}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 5.2.b — Where the oxygen went ──────────────────────────────────
   Why did it take 300 million years for oxygen to show up in the air
   after life started making it? Because the ocean ate it. Three
   selectable states of the ocean, each a cross-section: ferruginous
   (iron sponge), euxinic (sulfide), oxic (today). ←/→ or 1–3. */

type OceanState = {
  id: string;
  name: string;
  when: string;
  color: string;
  water: string;
  seabed: string;
  body: ReactNode;
};

const OCEANS: OceanState[] = [
  {
    id: "iron", name: "The iron ocean", when: "before ~2.4 billion years ago", color: "#f0a35e",
    water: "#3a2a1c", seabed: "#7c4a1e",
    body: <>Without oxygen, iron dissolves in seawater and stays dissolved — the ocean was a vast solution of it. Every oxygen molecule the first cyanobacteria released was immediately grabbed by that iron and dropped to the seabed as rust. The ocean was an oxygen sponge, and it took <strong>300 million years</strong> to fill. Those rusted layers are the <strong>banded iron formations</strong> we mine today: the ore in your car is a fossil of the first breath.</>,
  },
  {
    id: "sulfide", name: "The sour margins", when: "~1.8 to 0.8 billion years ago", color: "#a78bfa",
    water: "#2a2440", seabed: "#4c3f6b",
    body: <>Once the iron was spent, oxygen touched the air — but the sea stayed hostile below a thin, breathable surface layer. Along the crowded coastal margins, bacteria turned sulfate into hydrogen sulfide, the rotten-egg gas, and those waters went sour; the deep ocean farther out stayed iron-rich and airless. This murky middle state persisted for about a billion years, and it is one reason complex life took so very long to get going.</>,
  },
  {
    id: "oxic", name: "The breathing ocean", when: "the last ~800 million years", color: "#38bdf8",
    water: "#12314f", seabed: "#4b5563",
    body: <>Finally oxygen reaches all the way down. A fully oxygenated ocean can support animals — bodies that burn food with oxygen release roughly <strong>ten times</strong> more energy than the airless chemistry that came before. Within a couple of hundred million years the seas fill with animals, and the story passes to the Biological Age.</>,
  },
];

export function OceanRedoxPanel(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const sel = OCEANS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(OCEANS.length - 1, i + d)));

  const W = 904, H = 430;
  const seaT = 96, seaB = 356;

  return (
    <FigurePanel
      idx="5.2.b"
      kicker="Where the oxygen went"
      caption={
        <>
          Life started making oxygen hundreds of millions of years before any appeared in the air — because the ocean
          swallowed it. Step through the three states of the sea with the arrow keys: the iron ocean that rusted every
          molecule and dropped it to the seabed, the sulfide ocean of the long middle, and today's ocean, breathing all
          the way down. The banded iron in the rocks is the receipt.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{ background: "#07070c", border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Cross-section of the ocean: ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* selector tabs */}
          {OCEANS.map((o, i) => {
            const on = i === idx;
            const bw = (W - 48) / OCEANS.length;
            const x = 24 + i * bw;
            return (
              <g key={o.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={x + 4} y={16} width={bw - 8} height={34} rx={7}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.1)" : "rgb(var(--c-text-rgb) / 0.03)"}
                  stroke={on ? o.color : "rgb(var(--c-text-rgb) / 0.14)"} strokeWidth={on ? 1.8 : 1} />
                <text x={x + bw / 2} y={38} textAnchor="middle" fontSize="14.5" fontWeight={on ? 700 : 500}
                  fontFamily="Inter, sans-serif" fill={on ? o.color : "rgb(var(--c-text-rgb) / 0.78)"}>
                  {i + 1} · {o.name}
                </text>
              </g>
            );
          })}

          {/* sky */}
          <rect x={0} y={56} width={W} height={seaT - 56} fill="#141a2b" />
          <text x={24} y={80} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
            {idx === 0 ? "air: no oxygen — every molecule is eaten below" :
             idx === 1 ? "air: oxygen at last, but only a few percent" :
             "air: 21% oxygen · an ozone layer above it"}
          </text>

          {/* sea */}
          <rect x={0} y={seaT} width={W} height={seaB - seaT} fill={sel.water} />
          <rect x={0} y={seaB} width={W} height={H - seaB} fill={sel.seabed} />

          {idx === 0 && (
            <g>
              {/* cyanobacteria at the surface releasing O2; iron below grabbing it */}
              {Array.from({ length: 14 }).map((_, i) => {
                const x = 70 + i * 58;
                return (
                  <g key={i}>
                    <circle cx={x} cy={seaT + 22} r={6} fill="#4ade80" opacity={0.9} />
                    <line x1={x} y1={seaT + 30} x2={x} y2={seaT + 74} stroke="#4ade80" strokeWidth={1.6}
                      strokeDasharray="3 4" opacity={0.7} markerEnd="url(#ox-arr)" />
                    <text x={x} y={seaT + 92} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#4ade80">O₂</text>
                  </g>
                );
              })}
              {Array.from({ length: 26 }).map((_, i) => {
                const x = 46 + ((i * 137) % (W - 80));
                const y = seaT + 130 + ((i * 53) % 150);
                return <circle key={`fe${i}`} cx={x} cy={y} r={4.5} fill="#f0a35e" opacity={0.85} />;
              })}
              <text x={W / 2} y={seaT + 128} textAnchor="middle" fontSize="14" fontFamily="Inter, sans-serif" fill="#f0a35e">
                dissolved iron grabs every oxygen molecule — and sinks as rust
              </text>
              {/* banded iron on the floor */}
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={0} y={seaB + 6 + i * 14} width={W} height={7} fill={i % 2 ? "#3f2411" : "#a1571f"} opacity={0.9} />
              ))}
              <text x={W - 24} y={H - 12} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(255 255 255 / 0.75)">
                banded iron formations — the rust we mine today
              </text>
            </g>
          )}

          {idx === 1 && (
            <g>
              <rect x={0} y={seaT} width={W} height={44} fill="#38bdf8" opacity={0.16} />
              <text x={24} y={seaT + 30} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">
                a thin oxygenated surface layer
              </text>
              {Array.from({ length: 30 }).map((_, i) => {
                const x = 40 + ((i * 149) % (W - 70));
                const y = seaT + 90 + ((i * 71) % 200);
                return <circle key={i} cx={x} cy={y} r={4} fill="#a78bfa" opacity={0.8} />;
              })}
              <text x={W / 2} y={seaT + 170} textAnchor="middle" fontSize="14" fontFamily="Inter, sans-serif" fill="#c4b5fd">
                below it, hydrogen sulfide along the margins and airless iron-rich water beyond
              </text>
              <text x={W / 2} y={seaT + 196} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
                this murky middle state lasts about a billion years
              </text>
            </g>
          )}

          {idx === 2 && (
            <g>
              {Array.from({ length: 40 }).map((_, i) => {
                const x = 34 + ((i * 113) % (W - 60));
                const y = seaT + 20 + ((i * 89) % (seaB - seaT - 30));
                return <circle key={i} cx={x} cy={y} r={3.2} fill="#8ab4f8" opacity={0.75} />;
              })}
              <text x={W / 2} y={seaT + 120} textAnchor="middle" fontSize="14" fontFamily="Inter, sans-serif" fill="#8ab4f8">
                oxygen reaches the seabed — and animals become possible
              </text>
              {/* a few animals */}
              {[180, 420, 660].map((x, i) => (
                <g key={i} transform={`translate(${x} ${seaB - 46})`}>
                  <ellipse cx={0} cy={0} rx={26} ry={11} fill="#e5e7eb" opacity={0.9} />
                  <path d="M 26 0 L 42 -10 L 42 10 Z" fill="#e5e7eb" opacity={0.9} />
                  <circle cx={-12} cy={-2} r={2.4} fill="#0b0d14" />
                </g>
              ))}
              <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(255 255 255 / 0.75)">
                burning food with oxygen releases about ten times more energy than the chemistry before it
              </text>
            </g>
          )}

          <defs>
            <marker id="ox-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
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
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "5.4em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {OCEANS.map((o, i) => (
          <button key={o.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {o.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
