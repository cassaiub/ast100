import { useEffect, useRef, useState } from "react";

/* PrimordialTimeline — log-scale scrubber through the first 380,000
   years of the universe. Each event marker is placed at its log(t)
   position; selecting one swaps the snapshot panel below. The slider
   lets students "scrub" continuously, watching the universe cool. */

type Event = {
  id: string;
  /** seconds since Big Bang */
  t: number;
  /** temperature in Kelvin at that moment */
  T: number;
  name: string;
  /** terse label rendered on the timeline (kept narrow to avoid overlap) */
  shortLabel: string;
  phase: string;
  blurb: string;
  /** chip color for the marker */
  hue: string;
};

const EVENTS: Event[] = [
  {
    id: "planck",
    t: 1e-43,
    T: 1e32,
    name: "Planck Epoch · Gravity Decouples",
    shortLabel: "Planck / Gravity",
    phase: "Superforce → Three forces",
    blurb:
      "All four forces unified in a single Superforce. The universe is 10⁻³⁵ m across — the Planck length. At 10⁻⁴³ seconds gravity becomes the first force to separate, leaving the strong, weak, and electromagnetic forces still combined.",
    hue: "#a78bfa",
  },
  {
    id: "inflation",
    t: 1e-35,
    T: 1e28,
    name: "Inflation · Strong Separates",
    shortLabel: "Inflation",
    phase: "Exponential Growth",
    blurb:
      "Strong nuclear force splits off. The release of energy drives a sudden exponential expansion — space itself grows by ≥10²⁶ in a fraction of a second.",
    hue: "#22d3ee",
  },
  {
    id: "electroweak",
    t: 1e-12,
    T: 1e15,
    name: "Electroweak Split",
    shortLabel: "EW Split",
    phase: "Four Forces",
    blurb:
      "The electroweak force breaks into electromagnetism and the weak nuclear force. Now all four forces of nature exist as we know them.",
    hue: "#67e8f9",
  },
  {
    id: "quarkhad",
    t: 1e-6,
    T: 1e13,
    name: "Quark-Hadron Transition",
    shortLabel: "Quarks Confine",
    phase: "Hadron Era",
    blurb:
      "Quarks become confined inside protons and neutrons. The chaotic quark-gluon plasma cools enough for the strong force to bind nucleons.",
    hue: "#fde68a",
  },
  {
    id: "leptons",
    t: 1,
    T: 1e10,
    name: "Neutrino Decoupling",
    shortLabel: "ν Decouple",
    phase: "Lepton Era",
    blurb:
      "After 1 second, neutrinos stop interacting with matter and stream freely. They still pass through the universe today as the Cosmic Neutrino Background.",
    hue: "#fbbf24",
  },
  {
    id: "nucleo",
    t: 180,
    T: 1e9,
    name: "Nucleosynthesis",
    shortLabel: "Nucleosynthesis",
    phase: "Forging Light Nuclei",
    blurb:
      "From 3 to 20 minutes after the Big Bang: protons and neutrons fuse into deuterium, then Helium-4, plus traces of lithium. Locks in the 75% / 25% hydrogen-to-helium ratio of the cosmos forever.",
    hue: "#f59e0b",
  },
  {
    id: "recomb",
    t: 1.2e13,
    T: 3000,
    name: "Recombination · Light Streams Free",
    shortLabel: "Recombination",
    phase: "End of Particle Age",
    blurb:
      "380,000 years in. The universe cools enough for electrons to bind to nuclei, forming neutral atoms. Light decouples from matter. The fog lifts. The cosmic microwave background is created.",
    hue: "#fb923c",
  },
];

function fmtTime(t: number): string {
  if (t < 1e-30) return `10^${Math.floor(Math.log10(t))} s`;
  if (t < 1e-18) {
    const exp = Math.floor(Math.log10(t));
    return `10^${exp} s`;
  }
  if (t < 1e-6) return `${(t * 1e9).toFixed(t * 1e9 < 10 ? 1 : 0)} ns`;
  if (t < 1) return `${(t * 1e6).toFixed(t * 1e6 < 10 ? 1 : 0)} µs`;
  if (t < 60) return `${t.toFixed(2)} s`;
  if (t < 3600) return `${(t / 60).toFixed(1)} min`;
  if (t < 86400) return `${(t / 3600).toFixed(1)} hr`;
  if (t < 31557600) return `${(t / 86400).toFixed(1)} days`;
  return `${(t / 31557600).toExponential(2)} yr`;
}

function fmtTemp(K: number): string {
  if (K < 1e4) return `${K.toFixed(0)} K`;
  return `${K.toExponential(1)} K`;
}

/* Interpolate the "current state" between events when the user
   scrubs the slider to an arbitrary log-time position. */
function interpolate(logT: number): Event {
  /* Find the nearest event by log-time */
  let best = EVENTS[0];
  let bestDist = Infinity;
  for (const ev of EVENTS) {
    const evLog = Math.log10(ev.t);
    const d = Math.abs(evLog - logT);
    if (d < bestDist) {
      bestDist = d;
      best = ev;
    }
  }
  return best;
}

export default function PrimordialTimeline() {
  const [selId, setSelId] = useState<string>("inflation");
  const [scrubLog, setScrubLog] = useState<number>(Math.log10(EVENTS[2].t));
  const [scrubbing, setScrubbing] = useState(false);

  const W = 760;
  const H = 300;
  const PAD = 56;

  /* log range: log10(t) from Planck epoch (-43) to recombination (~13.1) */
  const logMin = -44;
  const logMax = 13.5;
  function xOf(t: number) {
    const v = Math.log10(t);
    return PAD + ((v - logMin) / (logMax - logMin)) * (W - 2 * PAD);
  }
  const xCurrent = PAD + ((scrubLog - logMin) / (logMax - logMin)) * (W - 2 * PAD);

  /* Currently-displayed event: selected by click, or nearest if scrubbing */
  const currentEv = scrubbing
    ? interpolate(scrubLog)
    : EVENTS.find((e) => e.id === selId)!;

  return (
    <figure data-fade className="my-12">
      <div className="figure-stub rounded-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/70">
            <span className="inline-block w-2 h-2 rounded-full bg-plasma/70 shadow-[0_0_8px_var(--c-accent)] mr-2 align-middle"></span>
            figure 1.0.1 · The First 380,000 Years
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60">
            interactive
          </div>
        </div>

        <div className="relative w-full overflow-hidden rounded-md">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
            {/* Axis */}
            <line
              x1={PAD}
              x2={W - PAD}
              y1={H / 2}
              y2={H / 2}
              stroke="rgb(var(--c-text-rgb) / 0.18)"
              strokeWidth="1"
            />
            {/* Decade ticks (sparse) */}
            {[-40, -30, -20, -10, 0, 10].map((v) => {
              const x = PAD + ((v - logMin) / (logMax - logMin)) * (W - 2 * PAD);
              return (
                <g key={v}>
                  <line
                    x1={x}
                    x2={x}
                    y1={H / 2 - 4}
                    y2={H / 2 + 4}
                    stroke="rgb(var(--c-text-rgb) / 0.18)"
                    strokeWidth="0.6"
                  />
                  <text
                    x={x}
                    y={H / 2 + 18}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fill="rgb(var(--c-text-rgb) / 0.4)"
                  >
                    10^{v} s
                  </text>
                </g>
              );
            })}

            {/* Events — alternate above and below to avoid label collisions */}
            {EVENTS.map((ev, i) => {
              const x = xOf(ev.t);
              const isSel = !scrubbing && ev.id === selId;
              const above = i % 2 === 0;
              const labelY = above ? H / 2 - 76 : H / 2 + 88;
              const dotY = above ? H / 2 - 42 : H / 2 + 42;
              const lineEndY = above ? H / 2 - 12 : H / 2 + 12;
              return (
                <g
                  key={ev.id}
                  onClick={() => {
                    setSelId(ev.id);
                    setScrubLog(Math.log10(ev.t));
                    setScrubbing(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <line
                    x1={x}
                    x2={x}
                    y1={above ? H / 2 - 6 : H / 2 + 6}
                    y2={lineEndY}
                    stroke={
                      isSel
                        ? "rgb(var(--c-accent-rgb) / 0.8)"
                        : "rgb(var(--c-text-rgb) / 0.3)"
                    }
                    strokeWidth={isSel ? 1.4 : 0.8}
                    strokeDasharray={isSel ? "0" : "1 2"}
                  />
                  <circle
                    cx={x}
                    cy={dotY}
                    r={isSel ? 6 : 4.5}
                    fill={isSel ? "rgb(var(--c-accent-rgb))" : ev.hue}
                    opacity={isSel ? 1 : 0.9}
                    style={{
                      filter: isSel
                        ? "drop-shadow(0 0 10px rgb(var(--c-accent-rgb) / 0.75))"
                        : `drop-shadow(0 0 6px ${ev.hue}88)`,
                    }}
                  />
                  <text
                    x={x}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={isSel ? 14 : 12}
                    letterSpacing={isSel ? "0.4" : "0.6"}
                    fontFamily={isSel ? "var(--font-serif)" : "var(--font-sans)"}
                    fontStyle={isSel ? "italic" : "normal"}
                    fontWeight={isSel ? 500 : 400}
                    fill={
                      isSel
                        ? "rgb(var(--c-accent-rgb))"
                        : "rgb(var(--c-text-rgb) / 0.85)"
                    }
                  >
                    {ev.shortLabel}
                  </text>
                </g>
              );
            })}

            {/* Scrub cursor (visible while scrubbing) */}
            {scrubbing && (
              <g>
                <line
                  x1={xCurrent}
                  x2={xCurrent}
                  y1={H / 2 - 80}
                  y2={H / 2 + 80}
                  stroke="rgb(var(--c-text-rgb) / 0.95)"
                  strokeWidth="1.4"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Snapshot panel */}
        <div
          className="mt-4 grid md:grid-cols-[200px_1fr] gap-4 p-4 rounded-md"
          style={{
            background: "rgb(var(--c-accent-rgb) / 0.05)",
            border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          }}
        >
          <div>
            <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-1">
              t = {fmtTime(currentEv.t)}
            </div>
            <div
              className="font-serif font-medium leading-tight"
              style={{ fontSize: "1.4rem", color: "var(--c-accent)" }}
            >
              {currentEv.phase}
            </div>
            <div className="font-mono text-[10px] tracking-[0.18em] mt-2 text-white/60">
              T ≈ {fmtTemp(currentEv.T)}
            </div>
          </div>
          <div className="text-[14px] text-white/85 leading-[1.6] font-sans">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-plasma mb-2">
              {currentEv.name}
            </div>
            {currentEv.blurb}
          </div>
        </div>

        {/* Scrubber */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
              scrub log₁₀(t)
            </label>
            <span className="font-mono text-[10px] text-plasma">
              {scrubLog.toFixed(1)} → {fmtTime(Math.pow(10, scrubLog))}
            </span>
          </div>
          <input
            type="range"
            min={logMin}
            max={logMax}
            step={0.1}
            value={scrubLog}
            onChange={(e) => {
              setScrubLog(parseFloat(e.target.value));
              setScrubbing(true);
            }}
            className="cosmic-slider"
          />
          <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
            <span>Planck</span>
            <span>1 second</span>
            <span>380,000 yr</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-[14px] text-white/75 font-sans leading-[1.55]">
        <span className="text-plasma font-mono tracking-[0.14em]">Fig. 1.0.1</span>
        <span className="mx-2 text-white/35">/</span>
        The Particle Age is a fifteen-orders-of-magnitude story compressed into 380,000 years.
        Click any event to read what's happening; or drag the scrubber to feel the universe cool.
      </figcaption>
    </figure>
  );
}
