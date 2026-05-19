import { useEffect, useRef, useState, type ReactNode } from "react";

/* ── Shared figure frame ────────────────────────────────────────────── */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure data-fade className="my-12">
      <div className="figure-stub rounded-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/70">
            <span className="inline-block w-2 h-2 rounded-full bg-plasma/70 shadow-[0_0_8px_var(--c-accent)] mr-2 align-middle"></span>
            figure {idx} · {kicker}
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60">
            interactive
          </div>
        </div>
        {children}
      </div>
      <figcaption className="mt-3 text-[14px] text-white/75 font-sans leading-[1.55]">
        <span className="text-plasma font-mono tracking-[0.14em]">Fig. {idx}</span>
        <span className="mx-2 text-white/35">/</span>
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── EM Wave Oscillator ──────────────────────────────────────────────
   Animated SVG: a single sinusoidal carrier moves left-to-right;
   E field on top (perpendicular to travel), B field on bottom (also
   perpendicular but to the other axis — shown as a phase-shifted
   second wave for 2D legibility). Slider sets wavelength; frequency
   and photon energy are computed and displayed live. */
const C = 2.99792458e8; // m/s
const H_PLANCK = 6.62607015e-34; // J·s

export function EmWaveOscillatorPanel() {
  /* wavelength slider works in log10(meters), spanning 1 mm to 1 km. */
  const [logLam, setLogLam] = useState(-3);
  const lam = Math.pow(10, logLam); // meters
  const freq = C / lam;
  const energy = H_PLANCK * freq;

  /* Animation phase, only when not reduced motion */
  const phaseRef = useRef(0);
  const [, setTick] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    function step() {
      phaseRef.current += 0.02;
      setTick((t) => (t + 1) % 1000);
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const W = 720;
  const H = 320;
  /* Drawing wavelength on screen — mapped logarithmically so the
     wave visibly shrinks as we crank the slider. */
  const screenLam = 280 / Math.max(1.0, Math.pow(10, logLam + 4) * 0.5);
  const cycles = (W - 80) / Math.max(20, screenLam);
  const amp = 46;

  /* 3D isometric perspective — axes:
       X = propagation (horizontal right)
       Y = E field (vertical, screen up)
       Z = B field (into page, drawn as upper-left diagonal)
     E oscillates only in Y. B oscillates only in Z.  This is the
     standard physics-textbook depiction of an EM wave, matching the
     light1.gif animation the supervisor referenced. */
  const startX = 60;
  const endX = W - 60;
  const baselineY = H / 2 + 20;
  /* Z-axis projection: 30° above the negative X direction (upper-left) */
  const zCosX = -Math.cos((30 * Math.PI) / 180); // ≈ -0.866
  const zSinY = -Math.sin((30 * Math.PI) / 180); // ≈ -0.5 (negative because SVG y is down)
  const zScale = 0.55;

  function pointAt(t: number, plane: "E" | "B") {
    const xWorld = startX + t * (endX - startX);
    const phase = t * cycles * Math.PI * 2 + phaseRef.current;
    const val = amp * Math.sin(phase);
    if (plane === "E") {
      return { x: xWorld, y: baselineY - val };
    }
    return {
      x: xWorld + val * zCosX * zScale,
      y: baselineY + val * zSinY * zScale,
    };
  }

  function wavePath(plane: "E" | "B") {
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const p = pointAt(i / N, plane);
      pts.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    }
    return pts.join(" ");
  }

  /* Vertical field-bars (small arrows) showing the field vector at
     sampled positions — like the spokes in the original light1.gif. */
  const fieldBars: Array<{ t: number; xAxis: number; eP: { x: number; y: number }; bP: { x: number; y: number } }> = [];
  const N_BARS = 28;
  for (let i = 1; i < N_BARS; i++) {
    const t = i / N_BARS;
    const xAxis = startX + t * (endX - startX);
    fieldBars.push({
      t,
      xAxis,
      eP: pointAt(t, "E"),
      bP: pointAt(t, "B"),
    });
  }

  function fmtSci(x: number, unit: string) {
    if (x === 0) return `0 ${unit}`;
    const exp = Math.floor(Math.log10(Math.abs(x)));
    const mant = x / Math.pow(10, exp);
    return `${mant.toFixed(2)} × 10${exp >= 0 ? "" : ""}^${exp} ${unit}`;
  }
  function fmtWave(m: number) {
    if (m < 1e-9) return `${(m * 1e12).toFixed(1)} pm`;
    if (m < 1e-6) return `${(m * 1e9).toFixed(1)} nm`;
    if (m < 1e-3) return `${(m * 1e6).toFixed(1)} µm`;
    if (m < 1) return `${(m * 1e3).toFixed(1)} mm`;
    return `${m.toFixed(2)} m`;
  }
  function bandOf(m: number) {
    if (m > 1e-1) return "RADIO";
    if (m > 1e-3) return "MICROWAVE";
    if (m > 7e-7) return "INFRARED";
    if (m > 4e-7) return "VISIBLE";
    if (m > 1e-8) return "ULTRAVIOLET";
    if (m > 1e-11) return "X-RAY";
    return "GAMMA";
  }

  return (
    <FigurePanel
      idx="0.4.1"
      kicker="Electromagnetic Wave · E and B in Step"
      caption="Light is two oscillating fields locked in perpendicular phase, racing at c. Change the wavelength — the frequency and photon energy snap into place via fλ = c and E = hf. Short wavelength means high energy."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Propagation axis (X) — direction of travel */}
          <line
            x1={startX}
            x2={endX}
            y1={baselineY}
            y2={baselineY}
            stroke="rgb(var(--c-text-rgb) / 0.55)"
            strokeWidth="1"
          />
          {/* Arrowhead at right end of propagation axis */}
          <polygon
            points={`${endX},${baselineY} ${endX - 10},${baselineY - 4} ${endX - 10},${baselineY + 4}`}
            fill="rgb(var(--c-text-rgb) / 0.55)"
          />
          <text
            x={endX + 4}
            y={baselineY + 4}
            fontSize="11"
            fontFamily="var(--font-mono)"
            letterSpacing="2"
            fill="rgb(var(--c-text-rgb) / 0.65)"
          >
            c →
          </text>
          <text
            x={endX - 40}
            y={baselineY + 18}
            textAnchor="end"
            fontSize="9"
            fontFamily="var(--font-mono)"
            letterSpacing="2"
            fill="rgb(var(--c-text-rgb) / 0.4)"
          >
            DIRECTION OF TRAVEL
          </text>

          {/* Vertical field bars — at each sampled point, draw a line
             from the propagation axis to the wave value. E bars go
             vertically, B bars go diagonally (Z perspective). */}
          {fieldBars.map((bar, i) => (
            <g key={i}>
              {/* E vertical bar */}
              <line
                x1={bar.xAxis}
                y1={baselineY}
                x2={bar.eP.x}
                y2={bar.eP.y}
                stroke="rgb(var(--c-accent-rgb) / 0.45)"
                strokeWidth="0.8"
              />
              {/* B diagonal bar (along Z axis) */}
              <line
                x1={bar.xAxis}
                y1={baselineY}
                x2={bar.bP.x}
                y2={bar.bP.y}
                stroke="rgb(var(--c-solar-rgb) / 0.45)"
                strokeWidth="0.8"
              />
            </g>
          ))}

          {/* B wave — drawn first so E appears in front */}
          <path
            d={wavePath("B")}
            fill="none"
            stroke="rgb(var(--c-solar-rgb))"
            strokeWidth="2"
          />
          {/* E wave — drawn second, on top */}
          <path
            d={wavePath("E")}
            fill="none"
            stroke="rgb(var(--c-accent-rgb))"
            strokeWidth="2"
          />

          {/* Axis labels */}
          <text
            x={startX - 16}
            y={baselineY - amp - 4}
            fontSize="14"
            fontFamily="var(--font-serif)"
            fontStyle="italic"
            fontWeight={600}
            fill="rgb(var(--c-accent-rgb))"
          >
            E
          </text>
          <line
            x1={startX - 12}
            y1={baselineY}
            x2={startX - 12}
            y2={baselineY - amp - 10}
            stroke="rgb(var(--c-accent-rgb) / 0.6)"
            strokeWidth="0.8"
          />
          <polygon
            points={`${startX - 12},${baselineY - amp - 10} ${startX - 16},${baselineY - amp - 4} ${startX - 8},${baselineY - amp - 4}`}
            fill="rgb(var(--c-accent-rgb) / 0.6)"
          />

          <text
            x={startX - 14 + amp * zCosX * zScale - 6}
            y={baselineY + amp * zSinY * zScale - 6}
            fontSize="14"
            fontFamily="var(--font-serif)"
            fontStyle="italic"
            fontWeight={600}
            fill="rgb(var(--c-solar-rgb))"
          >
            B
          </text>
          <line
            x1={startX - 12}
            y1={baselineY}
            x2={startX - 12 + amp * zCosX * zScale}
            y2={baselineY + amp * zSinY * zScale}
            stroke="rgb(var(--c-solar-rgb) / 0.6)"
            strokeWidth="0.8"
          />

          {/* Legend chips bottom-left */}
          <g transform={`translate(${startX}, ${H - 20})`}>
            <circle cx={4} cy={-4} r="4" fill="rgb(var(--c-accent-rgb))" />
            <text x={14} y={0} fontSize="10" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb))">
              E · ELECTRIC FIELD (VERTICAL)
            </text>
            <circle cx={250} cy={-4} r="4" fill="rgb(var(--c-solar-rgb))" />
            <text x={260} y={0} fontSize="10" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-solar-rgb))">
              B · MAGNETIC FIELD (PERPENDICULAR)
            </text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div
          className="p-3 rounded-md"
          style={{
            background: "rgb(var(--c-accent-rgb) / 0.05)",
            border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          }}
        >
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
            wavelength λ
          </div>
          <div
            className="font-serif font-medium mt-1"
            style={{ fontSize: "1.3rem", color: "var(--c-accent)" }}
          >
            {fmtWave(lam)}
          </div>
        </div>
        <div
          className="p-3 rounded-md"
          style={{
            background: "rgb(var(--c-accent-rgb) / 0.05)",
            border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          }}
        >
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
            frequency f
          </div>
          <div
            className="font-serif font-medium mt-1"
            style={{ fontSize: "1.3rem", color: "var(--c-accent)" }}
          >
            {fmtSci(freq, "Hz")}
          </div>
        </div>
        <div
          className="p-3 rounded-md"
          style={{
            background: "rgb(var(--c-accent-rgb) / 0.05)",
            border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          }}
        >
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
            photon E
          </div>
          <div
            className="font-serif font-medium mt-1"
            style={{ fontSize: "1.3rem", color: "var(--c-accent)" }}
          >
            {fmtSci(energy, "J")}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            tune wavelength · {bandOf(lam)}
          </label>
          <span className="font-mono text-[10px] text-plasma">
            log₁₀λ = {logLam.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={-12}
          max={4}
          step={0.05}
          value={logLam}
          onChange={(e) => setLogLam(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>γ-ray</span>
          <span>visible</span>
          <span>radio</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── EM Spectrum Scrubber ────────────────────────────────────────────
   A continuous strip from radio (left) to gamma (right). Slider
   selects a wavelength; the info panel describes that band's everyday
   use AND its astronomical use. Replaces the supervisor's ems.webp. */
type Band = {
  id: string;
  name: string;
  logMin: number;
  logMax: number;
  /** background colour for that strip */
  color: string;
  use: string;
  astro: string;
};
/* Bands tiled CONTIGUOUSLY: each band's logMax exactly equals the next
   band's logMin so the slider never falls into an undefined gap.
   Visible is widened slightly (−6.5 → −5.9) so the band remains
   visible on-screen rather than a hair-thin sliver. Real physics:
   visible light is 400–750 nm. */
const BANDS: Band[] = [
  { id: "gamma", name: "Gamma",       logMin: -14,   logMax: -11,   color: "#e0a02f", use: "Nuclear decay. Highest-energy radiation we know.", astro: "Gamma-ray bursts, neutron-star mergers (Fermi, CTAO)." },
  { id: "xray",  name: "X-ray",       logMin: -11,   logMax: -8,    color: "#d97757", use: "Medical imaging — passes through soft tissue.",   astro: "Black-hole accretion disks, supernova remnants (Chandra)." },
  { id: "uv",    name: "Ultraviolet", logMin: -8,    logMax: -6.5,  color: "#8a4dd9", use: "Sunburn. Sterilisation. Black-light posters.",   astro: "Hot young stars and quasars (GALEX, Hubble UV)." },
  { id: "vis",   name: "Visible",     logMin: -6.5,  logMax: -5.9,  color: "#22d3ee", use: "What our eyes see — drives photosynthesis.",     astro: "Galaxies, stars, planets — the workhorse band (Hubble, Keck, Rubin)." },
  { id: "ir",    name: "Infrared",    logMin: -5.9,  logMax: -3,    color: "#c0596d", use: "Heat. Remote controls, night-vision, thermal cameras.", astro: "Peer through dust to see star birth (JWST, Spitzer)." },
  { id: "micro", name: "Microwave",   logMin: -3,    logMax: -1,    color: "#7b5ab8", use: "Radar, Wi-Fi, cellular, your microwave oven.",   astro: "Cosmic Microwave Background mapping (Planck, SPT)." },
  { id: "radio", name: "Radio",       logMin: -1,    logMax: 4,     color: "#5b6da6", use: "AM/FM radio, TV broadcast — bounces off the atmosphere.", astro: "CMB afterglow, interstellar hydrogen, pulsars (LOFAR, FAST, SKA)." },
];

/* Atmospheric transmission %, sampled at log wavelength steps. 0 =
   completely blocked, 1 = fully transparent. Reflects the physics:
   - γ, X-ray, UV blocked by ozone & high atmosphere
   - Visible band — the optical window
   - Near-IR partially transparent, mid-IR blocked by H₂O/CO₂
   - Microwave mostly transparent, with absorption bands
   - Long radio waves blocked by ionosphere */
const ATMOSPHERE: { log: number; t: number; note?: string }[] = [
  { log: -14,  t: 0.0 },
  { log: -11,  t: 0.0,  note: "γ-rays blocked" },
  { log: -8,   t: 0.0,  note: "X-rays blocked" },
  { log: -7,   t: 0.0,  note: "UV blocked by ozone" },
  { log: -6.5, t: 0.05 },
  { log: -6.3, t: 0.95, note: "OPTICAL WINDOW" },
  { log: -6.0, t: 0.95 },
  { log: -5.7, t: 0.6,  note: "Near-IR partial" },
  { log: -5,   t: 0.15 },
  { log: -4,   t: 0.05, note: "Mid-IR blocked" },
  { log: -3,   t: 0.2 },
  { log: -2.5, t: 0.85, note: "Microwave windows" },
  { log: -2,   t: 0.9 },
  { log: -1.5, t: 0.95 },
  { log: -1,   t: 0.95, note: "RADIO WINDOW" },
  { log: 0,    t: 0.95 },
  { log: 1,    t: 0.4 },
  { log: 1.5,  t: 0.05, note: "Ionosphere blocks long radio" },
  { log: 4,    t: 0.0 },
];

export function EmSpectrumScrubberPanel() {
  const [logLam, setLogLam] = useState(-6.3); // visible
  const W = 720;
  const H = 180;
  const SP_MIN = -13;
  const SP_MAX = 4;
  function xOf(l: number) {
    return ((l - SP_MIN) / (SP_MAX - SP_MIN)) * W;
  }
  /* Find the band that contains this wavelength. Bands are now
     contiguous, so any logLam in [SP_MIN, SP_MAX] resolves to a real
     band rather than the gamma fallback that caused the misreport. */
  function bandAt(l: number): Band {
    for (const b of BANDS) {
      if (l >= b.logMin && l <= b.logMax) return b;
    }
    /* Clamp to endpoints if out of range */
    return l < BANDS[0].logMin ? BANDS[0] : BANDS[BANDS.length - 1];
  }
  const active = bandAt(logLam);

  /* Interpolate atmospheric transmission at the active wavelength */
  function transAt(l: number): number {
    if (l <= ATMOSPHERE[0].log) return ATMOSPHERE[0].t;
    if (l >= ATMOSPHERE[ATMOSPHERE.length - 1].log) return ATMOSPHERE[ATMOSPHERE.length - 1].t;
    for (let i = 1; i < ATMOSPHERE.length; i++) {
      if (l <= ATMOSPHERE[i].log) {
        const a = ATMOSPHERE[i - 1], b = ATMOSPHERE[i];
        const k = (l - a.log) / (b.log - a.log);
        return a.t + (b.t - a.t) * k;
      }
    }
    return 0;
  }
  const activeTrans = transAt(logLam);

  return (
    <FigurePanel
      idx="0.4.2"
      kicker="The Electromagnetic Spectrum · One Strip, Seven Voices"
      caption="A single phenomenon spanning sixteen orders of magnitude in wavelength. Slide across — each band has both an everyday use and an astronomical superpower."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Band strips */}
          {BANDS.map((b) => {
            const x1 = xOf(b.logMin);
            const x2 = xOf(b.logMax);
            return (
              <g key={b.id}>
                <rect
                  x={x1}
                  y={20}
                  width={x2 - x1}
                  height={30}
                  fill={b.color}
                  opacity={active.id === b.id ? 0.9 : 0.45}
                  style={{ transition: "opacity 240ms var(--ease)" }}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={14}
                  textAnchor="middle"
                  fontSize="9"
                  letterSpacing="2"
                  fontFamily="var(--font-mono)"
                  fill={
                    active.id === b.id
                      ? "rgb(var(--c-accent-rgb))"
                      : "rgb(var(--c-text-rgb) / 0.55)"
                  }
                >
                  {b.name.toUpperCase()}
                </text>
              </g>
            );
          })}
          {/* Decade ticks */}
          {Array.from({ length: SP_MAX - SP_MIN + 1 }, (_, i) => SP_MIN + i).map((l) => (
            <line
              key={l}
              x1={xOf(l)}
              x2={xOf(l)}
              y1={50}
              y2={54}
              stroke="rgb(var(--c-text-rgb) / 0.35)"
              strokeWidth="0.6"
            />
          ))}
          {/* Tick labels at sparse intervals */}
          {[-12, -8, -4, 0, 4].map((l) => (
            <text
              key={l}
              x={xOf(l)}
              y={64}
              textAnchor="middle"
              fontSize="8"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-text-rgb) / 0.45)"
            >
              10^{l}
            </text>
          ))}
          {/* Atmospheric opacity panel — what reaches Earth's surface vs
             what is blocked. Green where transparent, red where opaque.
             Curve is the transmission % at each wavelength. */}
          {(() => {
            const yTop = 90;
            const yBot = 150;
            const stripH = yBot - yTop;
            /* Build the filled transmission curve */
            const samples: { x: number; y: number; t: number }[] = [];
            for (let i = 0; i <= 100; i++) {
              const l = SP_MIN + (i / 100) * (SP_MAX - SP_MIN);
              const t = transAt(l);
              samples.push({ x: xOf(l), y: yBot - t * stripH, t });
            }
            const linePts = samples.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`).join(" ");
            const fillPts = `${linePts} L ${W} ${yBot} L 0 ${yBot} Z`;
            return (
              <g>
                {/* Background — opaque red zones */}
                <rect x={0} y={yTop} width={W} height={stripH} fill="rgba(220, 60, 60, 0.18)" />
                {/* Transmission-coloured cells per sample to show gradient */}
                {samples.slice(0, -1).map((s, i) => {
                  const sNext = samples[i + 1];
                  const avg = (s.t + sNext.t) / 2;
                  /* green when transparent, red when opaque */
                  const r = Math.round(220 - 160 * avg);
                  const g = Math.round(60 + 140 * avg);
                  const b = 60;
                  return (
                    <rect
                      key={i}
                      x={s.x}
                      y={yTop}
                      width={sNext.x - s.x + 0.5}
                      height={stripH}
                      fill={`rgb(${r}, ${g}, ${b})`}
                      opacity={0.25 + avg * 0.35}
                    />
                  );
                })}
                {/* Transmission curve */}
                <path d={fillPts} fill="rgb(60, 180, 80)" opacity="0.32" />
                <path d={linePts} stroke="rgb(120, 220, 130)" strokeWidth="1.6" fill="none" />
                {/* Frame */}
                <rect x={0} y={yTop} width={W} height={stripH} fill="none" stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth="0.8" />
                {/* Header label */}
                <text x={6} y={84} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.7)">
                  ATMOSPHERIC TRANSMISSION
                </text>
                <text x={W - 6} y={84} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
                  GREEN = REACHES GROUND
                </text>
                {/* Window labels */}
                <text x={xOf(-6.3)} y={yTop - 2} textAnchor="middle" fontSize="8" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
                  ↓ optical
                </text>
                <text x={xOf(-1)} y={yTop - 2} textAnchor="middle" fontSize="8" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
                  ↓ radio
                </text>
                {/* y-axis hints (0% / 100%) */}
                <text x={4} y={yBot - 2} fontSize="7" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.4)">
                  0%
                </text>
                <text x={4} y={yTop + 8} fontSize="7" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.4)">
                  100%
                </text>
              </g>
            );
          })()}
          {/* Scrubber cursor — extends down through atmosphere strip too */}
          <g>
            <line
              x1={xOf(logLam)}
              x2={xOf(logLam)}
              y1={6}
              y2={H - 8}
              stroke="rgb(var(--c-text-rgb) / 0.95)"
              strokeWidth="1.4"
            />
            <polygon
              points={`${xOf(logLam) - 5},6 ${xOf(logLam) + 5},6 ${xOf(logLam)},14`}
              fill="rgb(var(--c-text-rgb) / 0.95)"
            />
          </g>
        </svg>
      </div>

      <div className="mt-3">
        <input
          type="range"
          min={SP_MIN}
          max={SP_MAX}
          step={0.05}
          value={logLam}
          onChange={(e) => setLogLam(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
      </div>

      <div
        className="mt-4 grid md:grid-cols-[140px_1fr] gap-4 p-3 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
            band
          </div>
          <div
            className="font-serif font-medium"
            style={{ fontSize: "1.4rem", color: "var(--c-accent)" }}
          >
            {active.name}
          </div>
          <div className="font-mono text-[10px] mt-1 text-white/55">
            λ ≈ 10<sup>{logLam.toFixed(1)}</sup> m
          </div>
          <div
            className="font-mono text-[10px] tracking-[0.18em] mt-3"
            style={{ color: activeTrans > 0.6 ? "rgb(120, 220, 130)" : activeTrans > 0.2 ? "rgb(230, 180, 80)" : "rgb(230, 100, 100)" }}
          >
            atmosphere · {(activeTrans * 100).toFixed(0)}%
          </div>
          <div className="font-mono text-[9px] text-white/45 leading-[1.4] mt-1">
            {activeTrans > 0.7
              ? "reaches Earth's surface"
              : activeTrans > 0.3
                ? "partially absorbed"
                : "blocked · observe from space"}
          </div>
        </div>
        <div className="text-[13px] text-white/80 leading-[1.55] font-sans grid gap-2">
          <div>
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-plasma mr-1">
              everyday
            </span>{" "}
            {active.use}
          </div>
          <div>
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-solar mr-1">
              astronomy
            </span>{" "}
            {active.astro}
          </div>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Telescope Bestiary ─────────────────────────────────────────────
   Real telescopes mapped onto the EM spectrum. Hover any card to
   highlight its position on a small spectrum strip; click to open
   the official site in a new tab. Replaces telescopes.webp. */
type Telescope = {
  name: string;
  band: string;
  bandColor: string;
  use: string;
  href: string;
  /** approx wavelength log10 m for spectrum marker */
  logLam: number;
};
const TELESCOPES: Telescope[] = [
  { name: "LOFAR", band: "Radio", bandColor: "#5b6da6", use: "Maps interstellar gas and pulsars.", href: "https://www.astron.nl/telescopes/lofar/", logLam: 1 },
  { name: "FAST", band: "Radio", bandColor: "#5b6da6", use: "World's largest single-dish, 500 m.", href: "https://fast.bao.ac.cn/", logLam: 0 },
  { name: "SPT-3G", band: "Microwave", bandColor: "#7b5ab8", use: "Maps CMB polarization from the South Pole.", href: "https://pole.uchicago.edu/", logLam: -2.5 },
  { name: "Planck", band: "Microwave", bandColor: "#7b5ab8", use: "All-sky CMB temperature & polarization.", href: "https://www.cosmos.esa.int/web/planck", logLam: -3 },
  { name: "JWST", band: "Infrared", bandColor: "#c0596d", use: "Sees through dust to first galaxies + star birth.", href: "https://webb.nasa.gov/", logLam: -5 },
  { name: "Keck", band: "Visible / IR", bandColor: "#22d3ee", use: "10 m mirrors at Mauna Kea — exoplanets, AGN.", href: "https://www.keckobservatory.org/", logLam: -6.2 },
  { name: "Hubble", band: "Visible / UV", bandColor: "#22d3ee", use: "Deep fields, planetary atmospheres, supernovae.", href: "https://hubblesite.org/", logLam: -6.3 },
  { name: "Vera Rubin", band: "Visible", bandColor: "#22d3ee", use: "10-year wide-field sky survey (LSST).", href: "https://www.lsst.org/", logLam: -6.4 },
  { name: "GALEX", band: "Ultraviolet", bandColor: "#8a4dd9", use: "All-sky UV mapping of young stars.", href: "https://www.jpl.nasa.gov/missions/galaxy-evolution-explorer-galex", logLam: -7.2 },
  { name: "Chandra", band: "X-ray", bandColor: "#d97757", use: "Black-hole accretion disks, supernova remnants.", href: "https://chandra.harvard.edu/", logLam: -9 },
  { name: "Fermi", band: "Gamma", bandColor: "#e0a02f", use: "Highest-energy bursts and pulsars.", href: "https://fermi.gsfc.nasa.gov/", logLam: -12 },
  { name: "CTAO", band: "Gamma", bandColor: "#e0a02f", use: "Ground-array detecting Cherenkov showers.", href: "https://www.ctao.org/", logLam: -13 },
];

export function TelescopeBestiaryPanel() {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const SP_MIN = -13;
  const SP_MAX = 4;
  function xOf(l: number) {
    return ((l - SP_MIN) / (SP_MAX - SP_MIN)) * W;
  }
  return (
    <FigurePanel
      idx="0.4.3"
      kicker="Telescope Bestiary · One Instrument per Wavelength"
      caption="The real telescopes astronomers use, mapped onto the EM band each was tuned for. Hover any card to see where it sits on the spectrum strip — open the official site to dive deeper."
    >
      {/* Mini spectrum strip with marker */}
      <div className="relative w-full overflow-hidden rounded-md mb-5">
        <svg viewBox={`0 0 ${W} 50`} className="block w-full h-auto">
          {BANDS.map((b) => (
            <rect
              key={b.id}
              x={xOf(b.logMin)}
              y={14}
              width={xOf(b.logMax) - xOf(b.logMin)}
              height={20}
              fill={b.color}
              opacity={0.55}
            />
          ))}
          {hover !== null && (
            <g>
              <line
                x1={xOf(TELESCOPES[hover].logLam)}
                x2={xOf(TELESCOPES[hover].logLam)}
                y1={4}
                y2={38}
                stroke="rgb(var(--c-text-rgb) / 0.95)"
                strokeWidth="1.4"
              />
              <text
                x={xOf(TELESCOPES[hover].logLam)}
                y={48}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--font-mono)"
                letterSpacing="2"
                fill="rgb(var(--c-text-rgb))"
              >
                {TELESCOPES[hover].name.toUpperCase()}
              </text>
            </g>
          )}
          <text
            x={6}
            y={48}
            fontSize="8"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.45)"
          >
            γ
          </text>
          <text
            x={W - 6}
            y={48}
            textAnchor="end"
            fontSize="8"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.45)"
          >
            radio
          </text>
        </svg>
      </div>

      <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TELESCOPES.map((t, i) => (
          <li key={t.name}>
            <a
              href={t.href}
              target="_blank"
              rel="noopener"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="block p-3 rounded-md transition-colors duration-200"
              style={{
                background:
                  hover === i
                    ? "rgb(var(--c-accent-rgb) / 0.08)"
                    : "rgb(var(--c-bg-rgb) / 0.25)",
                border: `1px solid ${hover === i ? "rgb(var(--c-accent-rgb) / 0.45)" : "rgb(var(--c-text-rgb) / 0.08)"}`,
                textDecoration: "none",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: t.bandColor }}
                />
                <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">
                  {t.band}
                </span>
              </div>
              <div
                className="font-serif font-medium"
                style={{ fontSize: "1.15rem", color: "var(--c-text-strong)" }}
              >
                {t.name}
              </div>
              <div className="text-[12px] text-white/65 mt-1 leading-[1.45]">
                {t.use}
              </div>
              <div className="mt-2 font-mono text-[9px] tracking-[0.22em] uppercase text-plasma/85">
                ↗ open ↗
              </div>
            </a>
          </li>
        ))}
      </ol>
    </FigurePanel>
  );
}

/* ── Telescope Anatomy ───────────────────────────────────────────────
   Click each part of a reflecting telescope to learn its role.
   Replaces telescope.webp. */
type Part = {
  id: string;
  name: string;
  desc: string;
};
const PARTS: Part[] = [
  { id: "collector", name: "Collector (primary mirror)", desc: "A large curved mirror — the 'light bucket'. A wider mirror means more photons captured, so dimmer objects become visible. Mirror size sets the telescope's sensitivity." },
  { id: "focal", name: "Focal plane", desc: "The plane where the mirror focuses light. The longer the focal length, the larger the image — but the dimmer per square millimetre." },
  { id: "detector", name: "Detector (CCD chip)", desc: "A light-sensitive chip — the same idea as a phone camera, but cooled and tuned. It counts individual photons and converts each into an electron." },
  { id: "processor", name: "Processor", desc: "Computers clean digital noise and turn raw counts into images. This last step is called photometry — measuring brightness to make pictures." },
];

type TelescopeKind = "reflector" | "refractor";

export function TelescopeAnatomyPanel() {
  const [active, setActive] = useState<string>("collector");
  const [kind, setKind] = useState<TelescopeKind>("reflector");
  const W = 720;
  const H = 320;
  /* Shared layout — a horizontal telescope with the detector on the
     LEFT and the sky opening on the RIGHT. The optical assembly
     between them differs per design. */
  const tubeStartX = 180;          // left end of tube (closed end for reflector)
  const tubeEndX = W - 50;         // right end of tube (sky opening)
  const tubeTopY = 80;
  const tubeBotY = H - 80;
  const axisY = H / 2;
  const skyEntryX = W - 24;
  const focalPlaneX = 134;         // where rays converge — just inside detector
  const detectorX = 76;            // chip rectangle x
  const detectorY = axisY - 18;
  const detectorW = 40;
  const detectorH = 36;
  const processorX = 18;           // computer icon x
  const processorY = axisY - 14;

  /* Reflector geometry — Cassegrain layout */
  const primaryX = tubeStartX;     // primary mirror at left end of tube
  const holeUpperY = axisY - 14;   // hole in centre of primary
  const holeLowerY = axisY + 14;
  const primaryDepth = 36;         // how far the primary's apex bulges right of its edges
  const secondaryX = tubeStartX + 320;
  const secondaryHalf = 22;        // half-height of secondary
  const collectorActive = active === "collector";
  const focalActive = active === "focal";
  const detectorActive = active === "detector";
  const processorActive = active === "processor";

  /* Refractor geometry — simple objective lens */
  const lensX = tubeStartX + 320;  // same x as secondary for visual parity

  return (
    <FigurePanel
      idx="0.4.4"
      kicker={`Telescope Anatomy · ${kind === "reflector" ? "Reflector (Cassegrain Mirror)" : "Refractor (Lens)"}`}
      caption="Every modern telescope is a four-stage relay: a collector gathers photons, the focal plane brings them to a point, a chip turns photons into electrons, and a computer turns electrons into images. Toggle the design — most professional telescopes (Hubble, JWST, the Vera Rubin Observatory) are Cassegrain-style reflectors."
    >
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mr-1">
          design ·
        </span>
        <button
          type="button"
          onClick={() => setKind("reflector")}
          className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${kind === "reflector" ? "is-active" : ""}`}
        >
          Reflector · mirror
        </button>
        <button
          type="button"
          onClick={() => setKind("refractor")}
          className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${kind === "refractor" ? "is-active" : ""}`}
        >
          Refractor · lens
        </button>
      </div>

      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Tube walls — open at the right, closed at the left where the
             primary mirror sits (reflector) or just framing (refractor). */}
          <line x1={tubeStartX + 8} y1={tubeTopY} x2={tubeEndX} y2={tubeTopY} stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="1.2" />
          <line x1={tubeStartX + 8} y1={tubeBotY} x2={tubeEndX} y2={tubeBotY} stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="1.2" />
          {/* Sky-side opening — just visual */}
          <line x1={tubeEndX} y1={tubeTopY - 6} x2={tubeEndX} y2={tubeTopY + 6} stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="1.2" />
          <line x1={tubeEndX} y1={tubeBotY - 6} x2={tubeEndX} y2={tubeBotY + 6} stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="1.2" />

          {kind === "reflector" ? (
            <>
              {/* ── REFLECTOR: Cassegrain layout ─────────────────────── */}
              {/* Light rays — parallel from the sky travel left past the
                 secondary, hit the primary, converge back to the secondary,
                 then reflect back through the central hole to the focal
                 plane (and on to the detector). */}
              {[axisY - 50, axisY + 50].map((y) => (
                <g key={`reflector-rays-${y}`}>
                  {/* Leg 1: sky → primary edge */}
                  <line
                    x1={skyEntryX}
                    y1={y}
                    x2={primaryX + primaryDepth - 6}
                    y2={y}
                    stroke="rgb(var(--c-solar-rgb) / 0.65)"
                    strokeWidth="1.3"
                  />
                  {/* Leg 2: primary → secondary (converging) */}
                  <line
                    x1={primaryX + primaryDepth - 6}
                    y1={y}
                    x2={secondaryX}
                    y2={axisY}
                    stroke="rgb(var(--c-solar-rgb) / 0.45)"
                    strokeWidth="1"
                  />
                </g>
              ))}
              {/* Leg 3: secondary → focal plane through the hole */}
              <line
                x1={secondaryX}
                y1={axisY}
                x2={focalPlaneX}
                y2={axisY}
                stroke="rgb(var(--c-solar-rgb) / 0.65)"
                strokeWidth="1.3"
              />

              {/* PRIMARY MIRROR — concave, drawn as two segments with a
                  hole in the middle (the central hole that lets the
                  Cassegrain focal beam exit toward the detector). */}
              <g onClick={() => setActive("collector")} style={{ cursor: "pointer" }}>
                {/* Upper segment of primary — silvered surface highlight */}
                <path
                  d={`M ${primaryX} ${tubeTopY} Q ${primaryX + primaryDepth} ${(tubeTopY + holeUpperY) / 2} ${primaryX} ${holeUpperY}`}
                  fill="none"
                  stroke={collectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.92)"}
                  strokeWidth={collectorActive ? 3 : 2.4}
                  style={{
                    filter: collectorActive ? "drop-shadow(0 0 14px rgb(var(--c-accent-rgb) / 0.55))" : "none",
                  }}
                />
                {/* Lower segment of primary */}
                <path
                  d={`M ${primaryX} ${holeLowerY} Q ${primaryX + primaryDepth} ${(holeLowerY + tubeBotY) / 2} ${primaryX} ${tubeBotY}`}
                  fill="none"
                  stroke={collectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.92)"}
                  strokeWidth={collectorActive ? 3 : 2.4}
                  style={{
                    filter: collectorActive ? "drop-shadow(0 0 14px rgb(var(--c-accent-rgb) / 0.55))" : "none",
                  }}
                />
                {/* Glass body backing — thin shaded back of each segment */}
                <path
                  d={`M ${primaryX} ${tubeTopY} L ${primaryX - 14} ${tubeTopY} L ${primaryX - 14} ${holeUpperY} L ${primaryX} ${holeUpperY} Z`}
                  fill={collectorActive ? "rgb(var(--c-accent-rgb) / 0.12)" : "rgb(var(--c-text-rgb) / 0.08)"}
                  stroke={collectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.45)"}
                  strokeWidth="0.8"
                />
                <path
                  d={`M ${primaryX} ${holeLowerY} L ${primaryX - 14} ${holeLowerY} L ${primaryX - 14} ${tubeBotY} L ${primaryX} ${tubeBotY} Z`}
                  fill={collectorActive ? "rgb(var(--c-accent-rgb) / 0.12)" : "rgb(var(--c-text-rgb) / 0.08)"}
                  stroke={collectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.45)"}
                  strokeWidth="0.8"
                />
                {/* Labels */}
                <text x={primaryX - 18} y={tubeTopY - 8} fontSize="10" letterSpacing="2" fontFamily="var(--font-mono)" fill={collectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.7)"}>
                  PRIMARY MIRROR
                </text>
                <text x={primaryX - 12} y={axisY + 4} fontSize="8" letterSpacing="1.6" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
                  ← hole
                </text>
              </g>

              {/* SECONDARY MIRROR — small convex (curves toward primary)
                  suspended by spider arms across the tube. */}
              <g>
                {/* Spider arms */}
                <line x1={secondaryX} y1={axisY - secondaryHalf} x2={secondaryX} y2={tubeTopY} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth="0.7" />
                <line x1={secondaryX} y1={axisY + secondaryHalf} x2={secondaryX} y2={tubeBotY} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth="0.7" />
                {/* Convex secondary */}
                <path
                  d={`M ${secondaryX - 4} ${axisY - secondaryHalf} Q ${secondaryX + 14} ${axisY} ${secondaryX - 4} ${axisY + secondaryHalf} Z`}
                  fill="rgb(var(--c-text-rgb) / 0.15)"
                  stroke="rgb(var(--c-text-rgb) / 0.85)"
                  strokeWidth="1.5"
                />
                <text x={secondaryX - 8} y={axisY + secondaryHalf + 18} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.65)">
                  SECONDARY
                </text>
              </g>

              {/* TUBE label */}
              <text x={tubeStartX + 130} y={tubeTopY - 10} fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.4)">
                TUBE
              </text>
            </>
          ) : (
            <>
              {/* ── REFRACTOR: simple objective lens ─────────────────── */}
              {/* Light rays — parallel from sky travel left, pass through
                 the lens, refract to converge at the focal plane. */}
              {[axisY - 50, axisY + 50].map((y) => (
                <g key={`refractor-rays-${y}`}>
                  <line
                    x1={skyEntryX}
                    y1={y}
                    x2={lensX}
                    y2={y}
                    stroke="rgb(var(--c-solar-rgb) / 0.65)"
                    strokeWidth="1.3"
                  />
                  <line
                    x1={lensX}
                    y1={y}
                    x2={focalPlaneX}
                    y2={axisY}
                    stroke="rgb(var(--c-solar-rgb) / 0.6)"
                    strokeWidth="1.2"
                  />
                </g>
              ))}

              {/* BICONVEX LENS */}
              <g onClick={() => setActive("collector")} style={{ cursor: "pointer" }}>
                <path
                  d={`M ${lensX - 14} ${axisY - 56} Q ${lensX + 22} ${axisY} ${lensX - 14} ${axisY + 56} Q ${lensX - 50} ${axisY} ${lensX - 14} ${axisY - 56} Z`}
                  fill={collectorActive ? "rgb(var(--c-accent-rgb) / 0.12)" : "rgb(var(--c-text-rgb) / 0.04)"}
                  stroke={collectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.85)"}
                  strokeWidth={collectorActive ? 2.2 : 1.6}
                  style={{
                    filter: collectorActive ? "drop-shadow(0 0 14px rgb(var(--c-accent-rgb) / 0.45))" : "none",
                  }}
                />
                <text x={lensX + 30} y={axisY + 4} fontSize="10" letterSpacing="2" fontFamily="var(--font-mono)" fill={collectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.7)"}>
                  OBJECTIVE LENS
                </text>
              </g>

              {/* TUBE label */}
              <text x={tubeStartX + 80} y={tubeTopY - 10} fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.4)">
                TUBE
              </text>
            </>
          )}

          {/* ── FOCAL PLANE (clickable) ──────────────────────────────── */}
          <g onClick={() => setActive("focal")} style={{ cursor: "pointer" }}>
            <circle
              cx={focalPlaneX}
              cy={axisY}
              r={focalActive ? 6 : 4.5}
              fill={focalActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.85)"}
              style={{ filter: focalActive ? "drop-shadow(0 0 10px rgb(var(--c-accent-rgb) / 0.7))" : "none" }}
            />
            <text x={focalPlaneX} y={axisY - 14} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={focalActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}>
              FOCAL PLANE
            </text>
          </g>

          {/* ── DETECTOR (CCD chip) ──────────────────────────────────── */}
          <g onClick={() => setActive("detector")} style={{ cursor: "pointer" }}>
            <rect
              x={detectorX}
              y={detectorY}
              width={detectorW}
              height={detectorH}
              fill={detectorActive ? "rgb(var(--c-accent-rgb) / 0.18)" : "rgb(var(--c-text-rgb) / 0.08)"}
              stroke={detectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}
              strokeWidth={detectorActive ? 1.6 : 1.1}
            />
            {/* CCD grid texture */}
            {Array.from({ length: 4 }).map((_, i) => (
              <line key={`dg-${i}`} x1={detectorX + (i + 1) * (detectorW / 5)} y1={detectorY + 4} x2={detectorX + (i + 1) * (detectorW / 5)} y2={detectorY + detectorH - 4} stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth="0.5" />
            ))}
            <text x={detectorX + detectorW / 2} y={detectorY + detectorH + 14} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={detectorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}>
              DETECTOR
            </text>
          </g>

          {/* ── PROCESSOR (computer icon) ────────────────────────────── */}
          <g onClick={() => setActive("processor")} style={{ cursor: "pointer" }}>
            <line
              x1={detectorX}
              y1={axisY}
              x2={processorX + 32}
              y2={axisY}
              stroke={processorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.5)"}
              strokeWidth={processorActive ? 1.6 : 1}
            />
            <rect
              x={processorX}
              y={processorY}
              width={32}
              height={28}
              rx={3}
              fill={processorActive ? "rgb(var(--c-accent-rgb) / 0.18)" : "rgb(var(--c-text-rgb) / 0.08)"}
              stroke={processorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}
              strokeWidth={processorActive ? 1.6 : 1.1}
            />
            <rect
              x={processorX + 4}
              y={processorY + 4}
              width={24}
              height={16}
              fill={processorActive ? "rgb(var(--c-accent-rgb) / 0.35)" : "rgb(var(--c-text-rgb) / 0.18)"}
            />
            <text x={processorX + 16} y={processorY + 44} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill={processorActive ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}>
              PROCESSOR
            </text>
          </g>

          {/* "Light from sky" label */}
          <text x={skyEntryX + 4} y={tubeTopY - 18} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-solar-rgb) / 0.9)">
            ← LIGHT FROM SKY
          </text>
          <text x={skyEntryX + 4} y={tubeTopY - 6} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-solar-rgb) / 0.55)">
            (tube opens)
          </text>
        </svg>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        {PARTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p.id)}
            className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${active === p.id ? "is-active" : ""}`}
          >
            {p.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <div
        className="mt-4 p-3 rounded-md text-[13px] text-white/80 leading-[1.6] font-sans"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">
          {PARTS.find((p) => p.id === active)!.name}
        </span>
        {PARTS.find((p) => p.id === active)!.desc}
      </div>
    </FigurePanel>
  );
}
