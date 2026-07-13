import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";
import { withBase } from "../../../data/course-nav";

/* Shared figure shell — mirrors the chapter-0/1/2/3 pattern. */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  fitFs = false,
  sidebar = false,
  rail,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  fitFs?: boolean;
  sidebar?: boolean;
  rail?: ReactNode;
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

/* Tracks whether the enclosing FigureFrame is fullscreen (`.is-fs`). */
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

/* ── 4.4.a — The transit method ─────────────────────────────────────
   A live simulator: drag the phase slider (←/→ drive it too) to carry
   the planet around one full edge-on orbit and watch the light curve
   respond — deep primary transit in front, shallow secondary eclipse
   behind. Two planet sizes show that depth = (Rp/R★)².
   No continuous animation: the slider is the clock (reduced-motion-safe). */

type TransitSize = { id: string; name: string; ratio: number; selfLight: number; shortcut: string };
const SIZES: TransitSize[] = [
  { id: "jup", name: "Jupiter-size", ratio: 0.1, selfLight: 0.0012, shortcut: "j" },
  { id: "nep", name: "Neptune-size", ratio: 0.035, selfLight: 0.0002, shortcut: "n" },
];

export function TransitPanel(): JSX.Element {
  const [frac, setFrac] = useState(0.25);     // phase; primary transit at 0.25
  const [sizeId, setSizeId] = useState("jup");
  const size = SIZES.find((s) => s.id === sizeId)!;
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 904, H = 540;
  /* star scene (top) */
  const cx = 452, cy = 148, RS = 86;
  const A = 330;                               // orbital semi-amplitude, px
  const RP = RS * size.ratio;

  /* orbit geometry: θ = 0 at mid-primary-transit (phase 0.25) */
  const theta = (p: number) => 2 * Math.PI * (p - 0.25);
  const xOf = (p: number) => cx + A * Math.sin(theta(p));
  const inFront = (p: number) => Math.cos(theta(p)) > 0;

  /* relative flux (1 = undimmed). Partial overlaps use a linear ramp —
     good enough for a classroom light curve. */
  const flux = (p: number) => {
    const d = Math.abs(xOf(p) - cx);
    const depth = size.ratio * size.ratio;
    if (inFront(p)) {
      if (d >= RS + RP) return 1;
      if (d <= RS - RP) return 1 - depth;
      const t = (RS + RP - d) / (2 * RP);
      return 1 - depth * Math.min(1, Math.max(0, t));
    }
    /* behind: lose the planet's own (reflected + thermal) light */
    if (d >= RS + RP) return 1;
    if (d <= RS - RP) return 1 - size.selfLight;
    const t = (RS + RP - d) / (2 * RP);
    return 1 - size.selfLight * Math.min(1, Math.max(0, t));
  };

  /* light-curve axes (bottom) */
  const L = 90, Rm = 40, CT = 300, CB = 470;
  const yMin = sizeId === "jup" ? 0.9885 : 0.99845;
  const yMax = sizeId === "jup" ? 1.0022 : 1.0003;
  const px = (p: number) => L + p * (W - L - Rm);
  const py = (f: number) => CB - ((f - yMin) / (yMax - yMin)) * (CB - CT);
  const curve = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 360; i++) {
      const p = i / 360;
      pts.push(`${i === 0 ? "M" : "L"} ${px(p).toFixed(1)} ${py(flux(p)).toFixed(1)}`);
    }
    return pts.join(" ");
  })();

  const curFlux = flux(frac);
  const status = inFront(frac) && curFlux < 1 - size.selfLight - 1e-9
    ? "PRIMARY TRANSIT — planet in front, starlight dips"
    : !inFront(frac) && curFlux < 1
      ? "SECONDARY ECLIPSE — planet hides behind the star"
      : inFront(frac)
        ? "planet in front of the orbit, off the star's disk"
        : "planet on the far side of its orbit";

  const planetVisible = !( !inFront(frac) && Math.abs(xOf(frac) - cx) < RS - RP );

  return (
    <FigurePanel
      idx="4.4.a"
      kicker="The transit method"
      caption={
        <>
          An edge-on planetary system as a telescope sees it: pure brightness over time. Drag the slider (or use the
          arrow keys) to carry the planet around one orbit. In front of the star it blocks a fraction of light equal
          to (planet radius ÷ star radius)² — about 1% for a Jupiter, 0.008% for an Earth — and hiding behind the star
          it takes its own faint glow with it (the shallow secondary eclipse). Note the vertical axis rescales between
          the two planet sizes.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 24%, #17130a 0%, #0b0a12 55%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Transit simulator: ${status}, brightness ${(curFlux * 100).toFixed(2)} percent`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <radialGradient id="tr-star" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff7e0" />
              <stop offset="0.7" stopColor="#fde68a" />
              <stop offset="1" stopColor="#f59e0b" />
            </radialGradient>
          </defs>

          {/* orbit line (edge-on) */}
          <line x1={cx - A} y1={cy} x2={cx + A} y2={cy} stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth={1} strokeDasharray="3 6" />

          {/* planet behind: draw before the star so the star occults it */}
          {!inFront(frac) && planetVisible && (
            <circle cx={xOf(frac)} cy={cy} r={RP} fill="#3b4c66" stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
          )}

          {/* the star */}
          <circle cx={cx} cy={cy} r={RS} fill="url(#tr-star)" />

          {/* planet in front */}
          {inFront(frac) && (
            <circle cx={xOf(frac)} cy={cy} r={RP} fill="#0b0d14" stroke="#3b4c66" strokeWidth={1.4} />
          )}

          <text x={24} y={36} fontSize="13.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {status}
          </text>
          <text x={W - 24} y={36} textAnchor="end" fontSize="14" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.8)">
            brightness: {(curFlux * 100).toFixed(3)}%
          </text>
          <text x={W - 24} y={cy + RS + 26} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            view from Earth — system edge-on
          </text>

          {/* light curve */}
          <line x1={L} y1={CB} x2={W - Rm} y2={CB} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <line x1={L} y1={CT} x2={L} y2={CB} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          {[1, 1 - size.ratio * size.ratio].map((f, i) => (
            <g key={i}>
              <line x1={L} y1={py(f)} x2={W - Rm} y2={py(f)} stroke="rgb(var(--c-text-rgb) / 0.1)" strokeWidth={1} />
              <text x={L - 8} y={py(f) + 4} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
                {(f * 100).toFixed(f === 1 ? 0 : 2)}%
              </text>
            </g>
          ))}
          <path d={curve} fill="none" stroke="#8ab4f8" strokeWidth={2.2} />
          <circle cx={px(frac)} cy={py(curFlux)} r={6} fill="#ffffff" stroke="#0b0d14" strokeWidth={1.5} />
          <text x={px(0.25)} y={CB + 22} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">
            primary transit
          </text>
          <text x={px(0.75)} y={CB + 22} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">
            secondary eclipse
          </text>
          <text x={W - Rm} y={CT - 10} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            brightness over one orbit →
          </text>
        </svg>
      </div>

      {/* controls — siblings of .fig-viz */}
      <div className="mt-3 flex items-center gap-3 flex-wrap" style={{ flexShrink: 0 }}>
        {SIZES.map((s) => (
          <button key={s.id} type="button" onClick={() => setSizeId(s.id)} data-shortcut={s.shortcut}
            aria-pressed={sizeId === s.id}
            className={`rounded-full font-mono${sizeId === s.id ? " is-active" : ""}`}
            style={{
              padding: "3px 14px",
              fontSize: sz(0.62) ?? "11px",
              color: sizeId === s.id ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.7)",
              background: sizeId === s.id ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
            }}>
            {s.name} <span style={{ opacity: 0.7 }}>[{s.shortcut}]</span>
          </button>
        ))}
        <div className="flex items-center gap-2 grow" style={{ minWidth: "220px" }}>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>orbit</span>
          <input type="range" min={0} max={1000} step={5} value={Math.round(frac * 1000)}
            onChange={(e) => setFrac(Number(e.currentTarget.value) / 1000)}
            aria-label="Orbital phase" style={{ width: "100%" }} />
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 4.4.b — The radial-velocity method ─────────────────────────────
   Face-on view of a star and planet swinging around their shared
   barycenter (sizes and the star's orbit exaggerated to be visible),
   the star's line-of-sight velocity curve, and the Doppler-shifting
   absorption lines a spectrograph actually records. The slider is the
   clock; ←/→ drive it. Sun–Jupiter numbers: ±12.5 m/s over 12 years. */

const V_AMP = 12.5;   // m/s, Sun due to Jupiter

export function RVPanel(): JSX.Element {
  const [frac, setFrac] = useState(0.13);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 904, H = 560;
  /* orbit scene (left) — observer at the bottom */
  const cx = 240, cy = 210, rStar = 30, rPlanet = 160;
  const th = 2 * Math.PI * frac;
  const sx = cx + rStar * Math.cos(th), sy = cy + rStar * Math.sin(th);
  const pxl = cx - rPlanet * Math.cos(th), pyl = cy - rPlanet * Math.sin(th);
  /* line of sight = +y (down). v > 0 means receding (moving up, away). */
  const v = -V_AMP * Math.cos(th);
  const receding = v > 0;
  const vLabel = `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} m/s`;

  /* velocity curve (right) */
  const L = 470, Rm = 34, CT = 84, CB = 300;
  const pxc = (p: number) => L + p * (W - L - Rm);
  const pyc = (vv: number) => (CT + CB) / 2 - (vv / V_AMP) * ((CB - CT) / 2 - 8);
  const curve = Array.from({ length: 241 })
    .map((_, i) => {
      const p = i / 240;
      return `${i === 0 ? "M" : "L"} ${pxc(p).toFixed(1)} ${pyc(-V_AMP * Math.cos(2 * Math.PI * p)).toFixed(1)}`;
    })
    .join(" ");

  /* spectrum strip (bottom) */
  const SL = 90, SR = W - 60, ST = 396, SB = 470;
  const lineShift = (v / V_AMP) * 26;
  const lines = [0.3, 0.52, 0.71];

  return (
    <FigurePanel
      idx="4.4.b"
      kicker="The radial-velocity method"
      caption={
        <>
          Star and planet both circle their shared balance point — the barycenter (＋) — like a heavy and a light child
          on a seesaw. Drag the slider (or arrow keys) to run the orbit: when the star swings away from us its
          absorption lines shift toward the red; swinging toward us, toward the blue. The numbers are the real
          Sun–Jupiter values — a wobble of just 12.5 metres per second, repeating every 12 years. Sizes and the
          star&rsquo;s orbit are exaggerated to stay visible.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 26% 36%, #16120c 0%, #0b0a12 55%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Radial velocity simulator: star velocity ${vLabel}, ${receding ? "receding, redshifted" : "approaching, blueshifted"}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="rv-spec" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4c5fd8" />
              <stop offset="0.28" stopColor="#3fb3a2" />
              <stop offset="0.55" stopColor="#e8d34b" />
              <stop offset="0.8" stopColor="#e08a3c" />
              <stop offset="1" stopColor="#d84c3f" />
            </linearGradient>
          </defs>

          {/* orbits */}
          <circle cx={cx} cy={cy} r={rPlanet} fill="none" stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth={1} strokeDasharray="3 6" />
          <circle cx={cx} cy={cy} r={rStar} fill="none" stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth={1} strokeDasharray="2 5" />
          {/* barycenter */}
          <path d={`M ${cx - 8} ${cy} H ${cx + 8} M ${cx} ${cy - 8} V ${cy + 8}`} stroke="rgb(var(--c-text-rgb) / 0.85)" strokeWidth={1.8} />
          <text x={cx + 13} y={cy - 8} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">barycenter</text>
          {/* star + planet, opposite sides */}
          <circle cx={sx} cy={sy} r={26} fill="#fde68a" stroke="#f59e0b" strokeWidth={2} />
          <circle cx={pxl} cy={pyl} r={9} fill="#8ab4f8" stroke="#0b0d14" strokeWidth={1} />
          <text x={pxl} y={pyl - 15} textAnchor="middle" fontSize="12" fontFamily="Inter, sans-serif" fill="#8ab4f8">planet</text>
          {/* observer — line of sight is straight down */}
          <line x1={54} y1={252} x2={54} y2={346} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1.4} markerEnd="url(#rv-arr)" />
          <text x={54} y={368} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">to Earth</text>
          <defs>
            <marker id="rv-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(var(--c-text-rgb) / 0.5)" />
            </marker>
          </defs>

          {/* velocity readout */}
          <text x={24} y={38} fontSize="13.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill={receding ? "#f87171" : "#8ab4f8"}>
            STAR: {vLabel} — {receding ? "RECEDING → REDSHIFT" : "APPROACHING → BLUESHIFT"}
          </text>

          {/* velocity curve */}
          <line x1={L} y1={(CT + CB) / 2} x2={W - Rm} y2={(CT + CB) / 2} stroke="rgb(var(--c-text-rgb) / 0.25)" strokeWidth={1} strokeDasharray="4 5" />
          <line x1={L} y1={CT} x2={L} y2={CB} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <text x={L - 8} y={pyc(V_AMP) + 4} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#f87171">+12.5</text>
          <text x={L - 8} y={pyc(-V_AMP) + 4} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">−12.5</text>
          <text x={L - 8} y={(CT + CB) / 2 + 4} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">0 m/s</text>
          <path d={curve} fill="none" stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={2} />
          <circle cx={pxc(frac)} cy={pyc(v)} r={6} fill={receding ? "#f87171" : "#8ab4f8"} stroke="#0b0d14" strokeWidth={1.5} />
          <text x={(L + W - Rm) / 2} y={CB + 24} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            star&rsquo;s velocity over one orbit (12 years) →
          </text>

          {/* spectrum with shifting absorption lines */}
          <rect x={SL} y={ST} width={SR - SL} height={SB - ST} rx={6} fill="url(#rv-spec)" opacity={0.9} />
          {lines.map((f) => {
            const x = SL + f * (SR - SL) + lineShift;
            return <rect key={f} x={x - 2.4} y={ST} width={4.8} height={SB - ST} fill="#0b0d14" opacity={0.92} />;
          })}
          {/* rest-position ticks */}
          {lines.map((f) => {
            const x = SL + f * (SR - SL);
            return <line key={`t${f}`} x1={x} y1={SB + 4} x2={x} y2={SB + 14} stroke="rgb(var(--c-text-rgb) / 0.6)" strokeWidth={1.4} />;
          })}
          <text x={SL} y={SB + 30} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">
            the spectrograph&rsquo;s view: dark absorption lines swing about their rest positions (ticks)
          </text>
          <text x={SL} y={ST - 10} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">← blue</text>
          <text x={SR} y={ST - 10} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#f87171">red →</text>
        </svg>
      </div>

      {/* phase slider — the keyboard target */}
      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          orbit phase
        </span>
        <input type="range" min={0} max={1000} step={5} value={Math.round(frac * 1000)}
          onChange={(e) => setFrac(Number(e.currentTarget.value) / 1000)}
          aria-label="Orbital phase" style={{ width: "100%" }} />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          12 yr
        </span>
      </div>
    </FigurePanel>
  );
}

/* ── 4.4.c — Direct imaging & the coronagraph ───────────────────────
   The HR 8799 system, face-on: four giant planets whose glare-drowned
   light only appears when the coronagraph mask blocks the star. The
   year slider advances the orbits (schematic positions, real orbital
   periods); the [m] button toggles the mask. Below the simulator sits
   the real thing — the famous Keck timelapse. */

const HR_PLANETS = [
  { id: "e", au: 16, period: 45, base: 160, color: "#f0a35e" },
  { id: "d", au: 27, period: 100, base: 210, color: "#e5a76a" },
  { id: "c", au: 43, period: 190, base: 320, color: "#d3a26a" },
  { id: "b", au: 71, period: 460, base: 70, color: "#c9995f" },
];

export function ImagingPanel(): JSX.Element {
  const [year, setYear] = useState(2008);
  const [mask, setMask] = useState(true);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 904, H = 470;
  const cx = 452, cy = 236;
  const pxPerAu = 2.7;

  return (
    <FigurePanel
      idx="4.4.c"
      kicker="Direct imaging and the coronagraph"
      fitFs
      caption={
        <>
          Top: a simulator of the HR 8799 system seen face-on. With the coronagraph off, the star&rsquo;s glare —
          millions to billions of times brighter than its planets — swallows everything; press [m] or the button to
          blot the star out and the four giants appear. Drag the year slider and they crawl along their orbits (real
          periods, schematic positions). Bottom: the real thing — Keck telescope images of HR 8799, whose first three
          planets (2008) were the first planetary system ever photographed; timelapse by Jason Wang.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "#07070c",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Direct imaging simulator, coronagraph ${mask ? "on: four planets visible" : "off: glare hides the planets"}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <radialGradient id="di-glare" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.12" stopColor="#fff3c4" stopOpacity="0.96" />
              <stop offset="0.34" stopColor="#fde68a" stopOpacity="0.7" />
              <stop offset="0.62" stopColor="#f59e0b" stopOpacity="0.34" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="di-residual" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.4" stopColor="#fde68a" stopOpacity="0" />
              <stop offset="0.75" stopColor="#fde68a" stopOpacity="0.12" />
              <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* orbits + planets (visible when the mask is on) */}
          {HR_PLANETS.map((p) => {
            const r = p.au * pxPerAu;
            const ang = ((p.base + (360 * (year - 2008)) / p.period) * Math.PI) / 180;
            const x = cx + r * Math.cos(ang), y = cy - r * Math.sin(ang) * 0.92;
            return (
              <g key={p.id} opacity={mask ? 1 : 0.06}>
                <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.92} fill="none" stroke="rgb(var(--c-text-rgb) / 0.16)" strokeWidth={1} />
                <circle cx={x} cy={y} r={5.5} fill={p.color} />
                <text x={x + 12} y={y + 4} fontSize="14" fontFamily="JetBrains Mono, monospace" fill={p.color}>{p.id}</text>
              </g>
            );
          })}

          {/* the star / the mask */}
          {mask ? (
            <g>
              <circle cx={cx} cy={cy} r={46} fill="url(#di-residual)" />
              <circle cx={cx} cy={cy} r={26} fill="#0b0d14" stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1.6} />
              <line x1={cx - 12} y1={cy - 12} x2={cx + 12} y2={cy + 12} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1.2} />
              <line x1={cx - 12} y1={cy + 12} x2={cx + 12} y2={cy - 12} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1.2} />
              <text x={cx} y={cy - 70} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
                coronagraph mask — artificial eclipse
              </text>
            </g>
          ) : (
            <circle cx={cx} cy={cy} r={330} fill="url(#di-glare)" />
          )}

          <text x={24} y={38} fontSize="13.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            HR 8799 · {year} · CORONAGRAPH {mask ? "ON" : "OFF"}
          </text>
          <text x={W - 24} y={38} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            face-on view · b, c, d imaged 2008 · e added 2010
          </text>
          <text x={W - 24} y={H - 18} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            orbits 16–71 au — wider than our whole planetary system
          </text>
        </svg>
      </div>

      {/* controls */}
      <div className="mt-3 flex items-center gap-3 flex-wrap" style={{ flexShrink: 0 }}>
        <button type="button" onClick={() => setMask((m) => !m)} data-shortcut="m" aria-pressed={mask}
          className="rounded-full font-mono"
          style={{
            padding: "3px 14px",
            fontSize: sz(0.62) ?? "11px",
            color: mask ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.7)",
            background: mask ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
            border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
          }}>
          coronagraph {mask ? "on" : "off"} <span style={{ opacity: 0.7 }}>[m]</span>
        </button>
        <div className="flex items-center gap-2 grow" style={{ minWidth: "220px" }}>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>2008</span>
          <input type="range" min={2008} max={2026} step={1} value={year}
            onChange={(e) => setYear(Number(e.currentTarget.value))}
            aria-label="Observation year" style={{ width: "100%" }} />
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>2026</span>
        </div>
      </div>

      {/* the real observation — sibling strip below the simulator */}
      <div className="mt-3 flex items-center gap-4 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: "1px solid rgb(var(--c-text-rgb) / 0.14)",
        padding: "10px 12px", flexShrink: 0,
      }}>
        <img
          src={withBase("/images/media/hr8799-orbit.gif")}
          alt="Real infrared timelapse of the four HR 8799 planets orbiting their masked star, from Keck Observatory data"
          loading="lazy"
          style={{ height: fs ? "clamp(90px, 17vh, 200px)" : "132px", width: "auto", borderRadius: 6 }}
        />
        <div className="font-sans leading-[1.5]" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.85) ?? "13px" }}>
          <strong>The real thing.</strong> Seven years of Keck Observatory infrared images of HR 8799, star blocked by
          the coronagraph (centre), its four giant planets actually moving along their orbits — the simulator above,
          photographed. Animation: Jason Wang (Northwestern) &amp; Christian Marois (NRC-HIA).
        </div>
      </div>
    </FigurePanel>
  );
}
