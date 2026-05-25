import { useMemo, useState, type ReactNode } from "react";
import { mulberry32 } from "../../../data/chapter-0-events";

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

/* ── Recombination & Redshift ───────────────────────────────────────
   Slider scrubs cosmic scale factor a from 1 (at recombination) to
   1100 (today). Visualises:
   - Top: a patch of Universe transitioning from opaque plasma fog
     (free electrons + photons trapped) to clear Universe with neutral
     atoms and freely streaming photons.
   - Bottom: a sinusoidal wave that stretches with scale, showing
     wavelength growing from ~visible (380 nm-ish in scale terms)
     to microwave-band. */
export function RecombinationRedshiftPanel() {
  const [scale, setScale] = useState(50); // 1 to 1100
  const T_today = 2.73; // K
  const T = T_today * scale; // approximate
  const lambda0 = 800; // nm at emission (visible/IR rest-frame band)
  const lambda = lambda0 * (scale); // stretched wavelength in nm
  function fmtWave(nm: number) {
    if (nm < 1000) return `${nm.toFixed(0)} nm (visible / IR)`;
    if (nm < 1e6) return `${(nm / 1000).toFixed(0)} µm (infrared)`;
    return `${(nm / 1e6).toFixed(2)} mm (microwave)`;
  }
  function band(nm: number) {
    if (nm < 750) return "VISIBLE";
    if (nm < 1e6) return "INFRARED";
    return "MICROWAVE";
  }

  const W = 720;
  const H = 180;

  /* Free electron / plasma dots — visibility fades as we approach today */
  const plasmaOpacity = Math.max(0, 1 - (scale - 1) / 30); // fades fast
  const motes = useMemo(() => {
    const rng = mulberry32(91);
    return Array.from({ length: 28 }, () => ({
      x: rng() * W,
      y: rng() * H,
      r: 1.2 + rng() * 1.8,
    }));
  }, []);

  /* Wave path stretching with scale. We always show at least ~1.2 cycles
     so the user sees the wave shape; the wavelength bracket below the
     wave is what conveys the *actual* stretch factor numerically. */
  const refCycles = 10; // reference wave at scale=1
  const cycles = Math.max(1.2, refCycles / Math.sqrt(scale));
  const waveAmp = 32;
  const refAmp = 18;
  const xStart = 40;
  const xEnd = W - 40;
  const waveLen = xEnd - xStart;
  const wavePts: string[] = [];
  const refPts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const x = xStart + t * waveLen;
    const y = 80 + waveAmp * Math.sin(t * cycles * Math.PI * 2);
    const yRef = 80 + refAmp * Math.sin(t * refCycles * Math.PI * 2);
    wavePts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    refPts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${yRef.toFixed(1)}`);
  }
  /* Position of the bracket showing one full wavelength of the active wave */
  const cycleWidth = waveLen / cycles;
  const bracketX1 = xStart + cycleWidth * 0.2;
  const bracketX2 = bracketX1 + cycleWidth;

  return (
    <FigurePanel
      idx="1.4.a"
      kicker="Recombination · The Fog Lifts, Photons Stretch"
      caption="At 380,000 years, the Universe cooled enough for electrons to bind to nuclei. Light decoupled from matter and streamed free. As space has expanded by a factor of 1100 since, those primordial photons have stretched from visible/IR light into microwaves — the CMB we see today at 2.73 K."
    >
      {/* Plasma → clear panel */}
      <div className="fig-viz relative w-full overflow-hidden rounded-md mb-3" style={{ background: "rgb(var(--c-bg-rgb) / 0.5)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* free electron dots — fade out as scale grows past 1 */}
          {motes.map((m, i) => (
            <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={`rgba(255, 200, 120, ${plasmaOpacity * 0.7})`} />
          ))}
          {/* "neutral atoms" appear as scale grows */}
          {motes.slice(0, 12).map((m, i) => (
            <circle
              key={`a-${i}`}
              cx={m.x + 4}
              cy={m.y + 2}
              r={m.r + 0.5}
              fill="none"
              stroke="rgb(var(--c-accent-rgb))"
              strokeWidth="0.6"
              opacity={Math.max(0, 1 - plasmaOpacity)}
            />
          ))}
          {/* "streaming photon" — a horizontal arrow once the fog clears */}
          {scale > 5 && (
            <g opacity={Math.min(1, (scale - 5) / 10)}>
              <line x1={40} y1={H / 2 - 50} x2={W - 40} y2={H / 2 - 50} stroke="rgb(var(--c-accent-rgb) / 0.7)" strokeWidth="1.2" strokeDasharray="3 4" />
              <text x={50} y={H / 2 - 56} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb))">
                STREAMING PHOTON →
              </text>
            </g>
          )}
          {/* state label */}
          <text x={W - 14} y={20} textAnchor="end" fontSize="10" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb) / 0.85)">
            {scale < 1.5 ? "PLASMA FOG · OPAQUE" : scale < 8 ? "RECOMBINATION · CLEARING" : "TRANSPARENT · LIGHT FREE"}
          </text>
        </svg>
      </div>

      {/* Wave stretching panel — taller so the wave breathes and a
         reference wave at scale=1 sits behind for comparison */}
      <div className="fig-viz relative w-full overflow-hidden rounded-md" style={{ background: "rgb(var(--c-bg-rgb) / 0.45)" }}>
        <svg viewBox={`0 0 ${W} 170`} className="block w-full h-auto">
          {/* Centre axis */}
          <line x1={40} x2={W - 40} y1={80} y2={80} stroke="rgb(var(--c-text-rgb) / 0.15)" strokeWidth="0.6" strokeDasharray="2 4" />

          {/* Reference wave at scale=1 (dim, dashed) */}
          <path
            d={refPts.join(" ")}
            stroke="rgb(var(--c-text-rgb) / 0.3)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="2 3"
          />
          <text x={50} y={150} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.4)">
            REFERENCE · WAVELENGTH AT RECOMBINATION
          </text>

          {/* Active stretched wave */}
          <path
            d={wavePts.join(" ")}
            stroke="rgb(var(--c-accent-rgb))"
            strokeWidth="2.4"
            fill="none"
            style={{ filter: "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.7))" }}
          />

          {/* Wavelength bracket showing one full λ of the active wave */}
          <g>
            <line x1={bracketX1} y1={32} x2={bracketX2} y2={32} stroke="rgb(var(--c-accent-rgb))" strokeWidth="1.2" />
            <line x1={bracketX1} y1={26} x2={bracketX1} y2={38} stroke="rgb(var(--c-accent-rgb))" strokeWidth="1.2" />
            <line x1={bracketX2} y1={26} x2={bracketX2} y2={38} stroke="rgb(var(--c-accent-rgb))" strokeWidth="1.2" />
            <text
              x={(bracketX1 + bracketX2) / 2}
              y={22}
              textAnchor="middle"
              fontSize="11"
              letterSpacing="2"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-accent-rgb))"
            >
              λ = {fmtWave(lambda)}
            </text>
          </g>

          <text x={50} y={18} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">
            PHOTON WAVELENGTH
          </text>
          <text x={W - 50} y={18} textAnchor="end" fontSize="11" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb))">
            {band(lambda)}
          </text>
        </svg>
      </div>

      <div
        className="mt-4 grid grid-cols-3 gap-3 p-3 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">scale factor</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: "1.3rem", color: "var(--c-accent)" }}>
            × {scale.toFixed(0)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">CMB temperature</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: "1.3rem", color: "var(--c-accent)" }}>
            {T < 1000 ? T.toFixed(0) : (T / 1000).toFixed(1) + "k"} K
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">wavelength</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: "1.1rem", color: "var(--c-accent)" }}>
            {fmtWave(lambda)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">stretch space (a)</label>
          <span className="font-mono text-[10px] text-plasma">
            from 1 (recombination) to {scale.toFixed(0)} of 1100 (today)
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={1100}
          step={1}
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>recombination · 3000 K</span>
          <span>halfway · 1500 K</span>
          <span>today · 2.73 K</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Penzias-Wilson Story · 1964 Discovery ──────────────────────────
   A six-step interactive walkthrough of the accidental discovery of the
   CMB. Each step reveals a narrative beat with a small SVG vignette
   (horn antenna, hiss signal, pigeons, Princeton link, blackbody match,
   Nobel). */
type Beat = {
  id: string;
  year: string;
  title: string;
  body: string;
  icon: "antenna" | "hiss" | "pigeon" | "letter" | "spectrum" | "nobel";
};
const BEATS: Beat[] = [
  {
    id: "antenna",
    year: "1964",
    title: "A 20-foot horn at Bell Labs",
    body: "Arno Penzias and Robert Wilson, two radio engineers in Holmdel, New Jersey, are calibrating a giant horn-shaped radio antenna for satellite communications. The instrument was designed to bounce signals off the Echo balloon satellite.",
    icon: "antenna",
  },
  {
    id: "hiss",
    year: "1964",
    title: "The persistent hiss",
    body: "They detect a faint, steady background noise — a low-level microwave 'hiss' that arrives uniformly from every direction in the sky. It does not change with time of day, season, or which direction the antenna points.",
    icon: "hiss",
  },
  {
    id: "pigeons",
    year: "1964",
    title: "Pigeons & droppings",
    body: "They rule out every source they can think of: radio stations, atmospheric effects, the Sun, and most famously, pigeons that had nested inside the antenna leaving behind 'a white dielectric material'. Even after the antenna is cleaned the hiss persists.",
    icon: "pigeon",
  },
  {
    id: "princeton",
    year: "1964",
    title: "Princeton's prediction",
    body: "A colleague mentions a paper from Robert Dicke's team at Princeton, who were independently *predicting* a faint microwave background as the fossil radiation of the Big Bang — and were building an antenna to look for it. Penzias and Wilson had accidentally beaten them to the discovery.",
    icon: "letter",
  },
  {
    id: "confirm",
    year: "1965",
    title: "Big Bang confirmed",
    body: "The 'static' matches the predicted blackbody spectrum of the Universe's hot, dense origin — redshifted to about 3 Kelvin today. The competing Steady State theory of cosmology has no way to explain it. The Big Bang becomes the accepted model.",
    icon: "spectrum",
  },
  {
    id: "nobel",
    year: "1978",
    title: "Nobel Prize in Physics",
    body: "Penzias and Wilson share the 1978 Nobel Prize in Physics for the discovery. The signal they couldn't explain turns out to be the oldest light in the Universe — the fossil afterglow of the Big Bang.",
    icon: "nobel",
  },
];

function BeatIcon({ icon, color }: { icon: Beat["icon"]; color: string }) {
  const W = 220, H = 110;
  switch (icon) {
    case "antenna":
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <path d={`M 40 90 L 120 50 L 200 65 L 200 90 Z`} fill="none" stroke={color} strokeWidth="1.4" />
          <line x1={40} y1={90} x2={200} y2={90} stroke={color} strokeWidth="1.4" />
          <line x1={120} y1={50} x2={140} y2={20} stroke={color} strokeWidth="1.2" strokeDasharray="2 3" />
          <text x={20} y={104} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={color} opacity="0.7">HORN · 20 FT</text>
        </svg>
      );
    case "hiss":
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {Array.from({ length: 5 }).map((_, i) => {
            const pts: string[] = [];
            for (let j = 0; j <= 80; j++) {
              const t = j / 80;
              const x = 20 + t * 180;
              const y = 20 + i * 18 + 5 * Math.sin(t * Math.PI * (3 + i)) + (Math.random() - 0.5) * 2;
              pts.push(`${j === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
            }
            return <path key={i} d={pts.join(" ")} stroke={color} strokeWidth="1" fill="none" opacity={0.4 + i * 0.1} />;
          })}
          <text x={10} y={104} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={color} opacity="0.7">UNIFORM · ALL SKY</text>
        </svg>
      );
    case "pigeon":
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <ellipse cx={70} cy={55} rx={28} ry={18} fill="none" stroke={color} strokeWidth="1.3" />
          <circle cx={92} cy={42} r={9} fill="none" stroke={color} strokeWidth="1.3" />
          <line x1={100} y1={42} x2={108} y2={40} stroke={color} strokeWidth="1.3" />
          <line x1={56} y1={70} x2={56} y2={86} stroke={color} strokeWidth="1.2" />
          <line x1={84} y1={70} x2={84} y2={86} stroke={color} strokeWidth="1.2" />
          <path d="M 130 80 L 200 80" stroke={color} strokeWidth="1.4" strokeDasharray="4 3" />
          <text x={134} y={94} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={color} opacity="0.7">CLEAN ANTENNA</text>
        </svg>
      );
    case "letter":
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <rect x={30} y={30} width={70} height={50} fill="none" stroke={color} strokeWidth="1.3" rx="2" />
          <path d="M 30 30 L 65 60 L 100 30" fill="none" stroke={color} strokeWidth="1.2" />
          <line x1={110} y1={55} x2={150} y2={55} stroke={color} strokeWidth="1.3" />
          <polygon points={`150,50 158,55 150,60`} fill={color} />
          <rect x={160} y={30} width={36} height={50} fill="none" stroke={color} strokeWidth="1.3" rx="2" />
          <text x={166} y={102} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={color} opacity="0.7">PRINCETON</text>
        </svg>
      );
    case "spectrum":
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Blackbody-ish curve */}
          {(() => {
            const pts: string[] = [];
            for (let i = 0; i <= 100; i++) {
              const t = i / 100;
              const x = 20 + t * 180;
              const y = 90 - 60 * t * t * (1 - t) * 5;
              pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
            }
            return <path d={pts.join(" ")} stroke={color} strokeWidth="1.6" fill="none" />;
          })()}
          {/* Data points overlaying — perfect match */}
          {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, i) => {
            const x = 20 + t * 180;
            const y = 90 - 60 * t * t * (1 - t) * 5;
            return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
          })}
          <text x={10} y={104} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={color} opacity="0.7">BLACKBODY · 2.73 K</text>
        </svg>
      );
    case "nobel":
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Medal */}
          <circle cx={110} cy={50} r={28} fill="none" stroke={color} strokeWidth="1.6" />
          <circle cx={110} cy={50} r={20} fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
          <text x={110} y={56} textAnchor="middle" fontSize="14" fontFamily="var(--font-serif)" fontStyle="italic" fill={color}>N</text>
          {/* Ribbon */}
          <polygon points={`92,72 110,86 128,72 128,98 110,90 92,98`} fill="none" stroke={color} strokeWidth="1.4" />
          <text x={110} y={108} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={color} opacity="0.7">1978</text>
        </svg>
      );
  }
}

export function PenziasWilsonStoryPanel() {
  const [sel, setSel] = useState(0);
  const cur = BEATS[sel];
  return (
    <FigurePanel
      idx="1.4.b"
      kicker="The 1964 Accident · Penzias & Wilson"
      caption="The Cosmic Microwave Background was discovered by two engineers who were trying to do something else entirely. Walk through the six steps of the most accidental Nobel Prize in cosmology."
    >
      <ol className="flex gap-1 mb-4 flex-wrap">
        {BEATS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setSel(i)}
            data-shortcut={i < 9 ? String(i + 1) : undefined}
            className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${sel === i ? "is-active" : ""}`}
          >
            {String(i + 1).padStart(2, "0")} · {b.year}
          </button>
        ))}
      </ol>

      <div
        className="fig-stretch grid md:grid-cols-[240px_1fr] gap-5 p-4 rounded-md items-start"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.05)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div
          className="fig-viz rounded-md p-3"
          style={{
            background: "rgb(var(--c-bg-rgb) / 0.45)",
            border: "1px solid rgb(var(--c-text-rgb) / 0.08)",
          }}
        >
          <BeatIcon icon={cur.icon} color="rgb(var(--c-accent-rgb))" />
        </div>
        <div className="min-h-[12em]">
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-1">
            step {sel + 1} · {cur.year}
          </div>
          <div className="font-serif font-medium leading-tight" style={{ fontSize: "1.5rem", color: "var(--c-accent)" }}>
            {cur.title}
          </div>
          <p className="mt-3 text-[14px] text-white/85 leading-[1.65] font-sans min-h-[6.6em]">{cur.body}</p>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── CMB Satellites · Resolution Progression ─────────────────────────
   Same simulated CMB patch rendered at three resolutions (COBE coarse,
   WMAP medium, Planck fine). Hover or click to see specs for each. */
type Mission = {
  id: string;
  name: string;
  year: number;
  grid: number; // grid resolution for the swatch
  res: string;
  blurb: string;
};
const MISSIONS: Mission[] = [
  { id: "cobe",  name: "COBE",  year: 1989, grid: 8,  res: "≈7° resolution", blurb: "NASA's pioneer. First full-sky CMB map; confirmed the blackbody spectrum and detected the first tiny anisotropies that would seed structure." },
  { id: "wmap",  name: "WMAP",  year: 2001, grid: 24, res: "≈14′ resolution (30× COBE)", blurb: "Nailed the Universe's age, composition, and curvature. The 'precision cosmology' era starts here." },
  { id: "planck",name: "Planck",year: 2009, grid: 64, res: "≈5′ resolution (3× WMAP)", blurb: "ESA's most exquisite all-sky CMB map. From the L2 Lagrange point, Planck scanned the sky every 6 months at 9 frequencies (3 mm to 13 mm) to subtract Milky Way foregrounds." },
];

/* Generate a stable pseudo-random CMB-like patch sampled on a grid.
   Each cell colour interpolates between deep-blue (cold) and warm
   orange (hot), with most cells near the neutral midpoint. */
function cmbColor(v: number): string {
  /* v in [0,1]; 0 = cold (blue), 0.5 = neutral, 1 = hot (orange) */
  const r = Math.round(255 * Math.max(0, (v - 0.4) * 2.2));
  const g = Math.round(Math.max(60, 180 - Math.abs(v - 0.5) * 200));
  const b = Math.round(255 * Math.max(0, (0.6 - v) * 2.2));
  return `rgb(${r}, ${g}, ${b})`;
}

export function CmbSatellitesPanel() {
  const [sel, setSel] = useState<string>("planck");
  /* Pre-generate a smooth-ish noise field then sample at each grid res */
  const field = useMemo(() => {
    const rng = mulberry32(101);
    const N = 64;
    const f: number[][] = [];
    for (let y = 0; y < N; y++) {
      const row: number[] = [];
      for (let x = 0; x < N; x++) {
        /* coarse perlin-ish: average of a few sinusoids */
        const a = Math.sin(x * 0.3) + Math.cos(y * 0.25);
        const b = Math.sin((x + y) * 0.18 + 1.3);
        const c = (rng() - 0.5) * 0.4;
        row.push(0.5 + (a + b) * 0.12 + c);
      }
      f.push(row);
    }
    return f;
  }, []);

  function downsample(grid: number) {
    const N = 64;
    const step = N / grid;
    const out: number[][] = [];
    for (let y = 0; y < grid; y++) {
      const row: number[] = [];
      for (let x = 0; x < grid; x++) {
        /* Box-average source field */
        let sum = 0, count = 0;
        for (let dy = 0; dy < step; dy++) {
          for (let dx = 0; dx < step; dx++) {
            sum += field[Math.floor(y * step + dy)][Math.floor(x * step + dx)];
            count++;
          }
        }
        row.push(sum / count);
      }
      out.push(row);
    }
    return out;
  }

  const sm = downsample(MISSIONS[0].grid);
  const md = downsample(MISSIONS[1].grid);
  const lg = downsample(MISSIONS[2].grid);
  const samples = [
    { mission: MISSIONS[0], grid: sm },
    { mission: MISSIONS[1], grid: md },
    { mission: MISSIONS[2], grid: lg },
  ];
  const cur = MISSIONS.find((m) => m.id === sel)!;

  function Swatch({ data, gridN, active }: { data: number[][]; gridN: number; active: boolean }) {
    const cell = 100 / gridN;
    return (
      <svg viewBox="0 0 100 100" className="block w-full h-auto rounded-md" style={{ border: active ? "2px solid var(--c-accent)" : "1px solid rgb(var(--c-text-rgb) / 0.15)", transition: "border-color 220ms" }}>
        {data.map((row, y) =>
          row.map((v, x) => (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.4} height={cell + 0.4} fill={cmbColor(Math.max(0, Math.min(1, v)))} />
          ))
        )}
      </svg>
    );
  }

  return (
    <FigurePanel
      idx="1.4.c"
      kicker="Maps of the Baby Universe · COBE → WMAP → Planck"
      caption="The same patch of CMB, sampled at three telescope resolutions across three decades. Each colder (blue) or hotter (red) speck is a primordial density fluctuation — a future galaxy cluster or void, seen at the age of 380,000 years."
    >
      <ol className="fig-stretch grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {samples.map(({ mission, grid }, i) => (
          <li
            key={mission.id}
            onClick={() => setSel(mission.id)}
            data-shortcut={String(i + 1)}
            aria-selected={sel === mission.id}
            className="cursor-pointer"
          >
            <Swatch data={grid} gridN={mission.grid} active={sel === mission.id} />
            <div className="flex items-baseline justify-between mt-2">
              <span
                className="font-serif font-medium"
                style={{ fontSize: "1.1rem", color: sel === mission.id ? "var(--c-accent)" : "var(--c-text-strong)" }}
              >
                {mission.name}
              </span>
              <span className="font-mono text-[10px] text-white/55">{mission.year}</span>
            </div>
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase mt-1" style={{ color: sel === mission.id ? "var(--c-accent)" : "var(--c-text-faint)" }}>
              {mission.res}
            </div>
          </li>
        ))}
      </ol>
      <div
        className="p-3 rounded-md text-[13px] text-white/85 leading-[1.6] font-sans min-h-[5.5em]"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">
          {cur.name.toUpperCase()} · {cur.year}
        </span>
        {cur.blurb}
      </div>
    </FigurePanel>
  );
}
