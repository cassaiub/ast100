import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

const REDUCED = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── LingerReveal ──────────────────────────────────────────────────── */
function useLinger(threshold = 0.7, lingerMs = 4000): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (revealed) return;
    const el = ref.current;
    if (!el) return;
    if (REDUCED()) {
      setRevealed(true);
      return;
    }
    let timer = 0;
    const setup = () => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.intersectionRatio >= threshold) {
              if (!timer) {
                timer = window.setTimeout(() => {
                  setRevealed(true);
                  io.disconnect();
                }, lingerMs);
              }
            } else if (timer) {
              clearTimeout(timer);
              timer = 0;
            }
          });
        },
        { threshold: [0, threshold, 1] },
      );
      io.observe(el);
      return () => {
        io.disconnect();
        if (timer) clearTimeout(timer);
      };
    };
    let cleanup: () => void = () => {};
    if ("requestIdleCallback" in window) {
      const idle = requestIdleCallback(() => {
        cleanup = setup() || (() => {});
      }, { timeout: 1500 });
      return () => {
        cancelIdleCallback(idle);
        cleanup();
      };
    }
    const t = window.setTimeout(() => {
      cleanup = setup() || (() => {});
    }, 400);
    return () => {
      clearTimeout(t);
      cleanup();
    };
  }, [revealed, threshold, lingerMs]);
  return [ref, revealed];
}

function LingerCaption({
  targetRef,
  revealed,
  children,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  revealed: boolean;
  children: ReactNode;
}) {
  return (
    <div
      ref={targetRef}
      className={[
        "linger",
        "border-l-2 border-plasma/55 pl-3 italic text-[14px] text-white/85 leading-relaxed max-w-[60ch]",
        revealed ? "is-revealed" : "",
      ].join(" ")}
      aria-hidden={!revealed}
    >
      {children}
    </div>
  );
}

/* ── Common figure frame ─────────────────────────────────────────────── */
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

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  formatValue,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
          {label}
        </label>
        <span className="font-mono text-[11px] tracking-[0.06em] text-plasma">
          {formatValue ? formatValue(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="cosmic-slider"
      />
    </div>
  );
}

/* ====================================================================
   SPECIAL RELATIVITY PANEL
   ==================================================================== */

function TimeDilation() {
  const reduced = REDUCED();
  /* Slider position s ∈ [0,1] is logarithmic in the gap to c:
       v/c = 1 − 10^(−4·s)
     so s=0 → 0c (γ=1), s=0.25 → 0.9c (γ≈2.3), s=0.5 → 0.99c (γ≈7),
     s=0.75 → 0.999c (γ≈22), s=1 → 0.9999c (γ≈71). The relativistic
     regime spreads across the whole travel instead of crowding the
     last 10%. */
  const [s, setS] = useState(reduced ? 0.5 : 0);
  const [lingerRef, lingerOn] = useLinger();

  const v = 1 - Math.pow(10, -4 * s);
  const v2 = Math.min(v * v, 0.999999);
  const gamma = 1 / Math.sqrt(1 - v2);

  const stationaryRef = useRef<SVGLineElement | null>(null);
  const stationaryMinRef = useRef<SVGLineElement | null>(null);
  const rocketRef = useRef<SVGLineElement | null>(null);
  const rocketMinRef = useRef<SVGLineElement | null>(null);
  const stationaryAngle = useRef(0);
  const rocketAngle = useRef(0);

  useEffect(() => {
    if (reduced) {
      stationaryRef.current?.setAttribute("transform", "rotate(120 60 60)");
      rocketRef.current?.setAttribute("transform", "rotate(45 60 60)");
      stationaryMinRef.current?.setAttribute("transform", "rotate(58 60 60)");
      rocketMinRef.current?.setAttribute("transform", "rotate(20 60 60)");
      return;
    }
    /* Stationary second-hand rate, °/sec. Fast enough that a clearly slowed
       moving hand (γ up to ~20) is still visibly ticking, not frozen. */
    const STATIONARY_RATE = 360;
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      stationaryAngle.current = (stationaryAngle.current + dt * STATIONARY_RATE) % 360;
      rocketAngle.current = (rocketAngle.current + (dt * STATIONARY_RATE) / gamma) % 360;
      stationaryRef.current?.setAttribute("transform", `rotate(${stationaryAngle.current} 60 60)`);
      rocketRef.current?.setAttribute("transform", `rotate(${rocketAngle.current} 60 60)`);
      stationaryMinRef.current?.setAttribute(
        "transform",
        `rotate(${stationaryAngle.current / 60} 60 60)`,
      );
      rocketMinRef.current?.setAttribute(
        "transform",
        `rotate(${rocketAngle.current / 60} 60 60)`,
      );
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gamma, reduced]);

  return (
    <div className="flex flex-col gap-6">
      <div className="fig-viz grid grid-cols-2 gap-6 md:gap-10 place-items-center">
        <Clock
          label="stationary observer"
          handRef={stationaryRef}
          minRef={stationaryMinRef}
          tint="white"
        />
        <Clock
          label="moving rocket"
          handRef={rocketRef}
          minRef={rocketMinRef}
          tint="plasma"
          subline={
            <span className="font-mono text-[10px] tracking-[0.06em] text-plasma/90">
              γ = {gamma.toFixed(2)}
            </span>
          }
        />
      </div>
      <Slider
        label="rocket speed"
        value={s}
        onChange={setS}
        min={0}
        max={1}
        step={0.005}
        disabled={reduced}
        formatValue={() => {
          const gap = 1 - v;
          const digits = gap >= 0.01 ? 2 : gap >= 0.001 ? 3 : gap >= 0.0001 ? 4 : 5;
          return `${v.toFixed(digits)} c`;
        }}
      />
      <div className="text-[13px] text-white/75 leading-[1.6] max-w-[58ch]">
        Drag the slider to push the rocket toward the speed of light. The faster it travels,
        the slower its own clock runs compared to the one standing still. The factor{" "}
        <span className="font-mono text-plasma/90">γ</span> ("gamma") is simply the slow-down:
        at γ = 2 the moving clock ticks half as fast; at γ = 10, ten times slower.
      </div>
      <LingerCaption targetRef={lingerRef} revealed={lingerOn}>
        At v = 0.999c, 1 year for the rocket equals 22 years on Earth. A round-trip to Alpha
        Centauri (4.4 light-years) would feel like about 3 months to the traveler — but
        roughly 9 years would pass back on Earth.
      </LingerCaption>
    </div>
  );
}

function Clock({
  label,
  handRef,
  minRef,
  tint = "white",
  subline,
}: {
  label: string;
  handRef: RefObject<SVGLineElement | null>;
  minRef: RefObject<SVGLineElement | null>;
  tint?: "white" | "plasma";
  subline?: ReactNode;
}) {
  const tintHex = tint === "plasma" ? "#22d3ee" : "#ffffff";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 120" className="clock-svg w-[110px] h-[110px] md:w-[130px] md:h-[130px]">
        <defs>
          <radialGradient id={`clock-face-${tint}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#0b1224" />
            <stop offset="100%" stopColor="#05060c" />
          </radialGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="56"
          fill={`url(#clock-face-${tint})`}
          stroke={tintHex}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x1 = 60 + Math.cos(a) * 50;
          const y1 = 60 + Math.sin(a) * 50;
          const x2 = 60 + Math.cos(a) * (i % 3 === 0 ? 44 : 47);
          const y2 = 60 + Math.sin(a) * (i % 3 === 0 ? 44 : 47);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={tintHex}
              strokeOpacity={i % 3 === 0 ? 0.55 : 0.25}
              strokeWidth={i % 3 === 0 ? 1.2 : 0.8}
            />
          );
        })}
        <line
          ref={minRef}
          x1="60"
          y1="60"
          x2="60"
          y2="28"
          stroke={tintHex}
          strokeOpacity="0.75"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          ref={handRef}
          x1="60"
          y1="62"
          x2="60"
          y2="20"
          stroke={tint === "plasma" ? "#22d3ee" : "#f59e0b"}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="2.4" fill={tintHex} />
        <circle cx="60" cy="60" r="0.8" fill="#05060c" />
      </svg>
      <div className="flex flex-col items-center gap-0.5">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/55">
          {label}
        </div>
        {subline}
      </div>
    </div>
  );
}

const PHASES = [
  {
    id: "ice",
    label: "ice",
    path: "M 30 80 L 30 30 L 90 30 L 90 80 L 60 96 L 30 80 Z",
    facets: ["M 30 30 L 60 46 L 90 30", "M 60 46 L 60 96"],
    fill: "url(#phase-ice)",
    glow: "#a5d8ff",
  },
  {
    id: "water",
    label: "water",
    path:
      "M 60 18 C 78 38 96 56 96 76 C 96 92 80 100 60 100 C 40 100 24 92 24 76 C 24 56 42 38 60 18 Z",
    facets: [] as string[],
    fill: "url(#phase-water)",
    glow: "#22d3ee",
  },
  {
    id: "steam",
    label: "steam",
    path:
      "M 22 76 C 14 76 10 66 16 60 C 14 50 24 42 34 46 C 36 32 56 28 62 42 C 72 30 92 38 90 54 C 102 56 104 70 96 78 C 96 90 80 92 72 86 C 64 96 44 96 36 86 C 28 92 22 88 22 76 Z",
    facets: [] as string[],
    fill: "url(#phase-steam)",
    glow: "#c4b5fd",
  },
];

function IceWaterSteam() {
  const reduced = REDUCED();
  const [phase, setPhase] = useState<string>(reduced ? "water" : "ice");
  const [lingerRef, lingerOn] = useLinger();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {PHASES.map((p, i) => {
          const active = p.id === phase;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => !reduced && setPhase(p.id)}
              disabled={reduced && p.id !== "water"}
              data-shortcut={String(i + 1)}
              className={[
                "pill rounded-full px-4 py-1.5 text-[11px] font-mono tracking-[0.18em] uppercase transition-all duration-300",
                active ? "is-active" : "",
              ].join(" ")}
              aria-pressed={active}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="fig-viz relative h-[140px] md:h-[160px] flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="phase-svg h-full w-auto">
          <defs>
            <linearGradient id="phase-ice" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="phase-water" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="phase-steam" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#c4b5fd" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
            </radialGradient>
            <filter id="phase-glow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {PHASES.map((p) => (
            <circle
              key={`halo-${p.id}`}
              cx="60"
              cy="62"
              r="40"
              fill={p.glow}
              opacity={phase === p.id ? 0.18 : 0}
              filter="url(#phase-glow)"
              style={{ transition: "opacity 480ms var(--ease)" }}
            />
          ))}

          {PHASES.map((p) => (
            <g
              key={p.id}
              style={{
                transition: "opacity 420ms var(--ease), transform 520ms var(--ease)",
                opacity: phase === p.id ? 1 : 0,
                transform: phase === p.id ? "scale(1)" : "scale(0.94)",
                transformOrigin: "60px 60px",
                transformBox: "fill-box",
              }}
            >
              <path
                d={p.path}
                fill={p.fill}
                stroke={p.glow}
                strokeOpacity="0.55"
                strokeWidth="1"
              />
              {p.facets.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke={p.glow}
                  strokeOpacity="0.6"
                  strokeWidth="0.8"
                  fill="none"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <div className="text-[13px] text-white/75 leading-[1.6] max-w-[58ch]">
        Tap each state. Ice, water, and steam are all the same water wearing different forms —
        and in just the same way, matter and energy are one thing in two guises. E = mc² is the
        exchange rate that turns one into the other.
      </div>
      <LingerCaption targetRef={lingerRef} revealed={lingerOn}>
        1 gram of mass = 9×10¹³ joules ≈ 21 kilotons of TNT — the yield of the Hiroshima bomb.
        The matter in your fingertip carries enough latent energy to level a small city.
      </LingerCaption>
    </div>
  );
}

export function SpecialRelativityPanel() {
  return (
    <FigurePanel
      idx="0.1.a"
      kicker="special relativity · two intuitions"
      caption="Time dilation makes clocks tick at different rates; mass-energy equivalence makes matter and energy interchangeable forms of the same thing."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="flex flex-col gap-4">
          <TimeDilation />
        </div>
        <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-white/[0.06] md:pl-10 pt-8 md:pt-0">
          <IceWaterSteam />
        </div>
      </div>
    </FigurePanel>
  );
}

/* ====================================================================
   GENERAL RELATIVITY PANEL
   ==================================================================== */

function LbLabel({
  x,
  y,
  text,
  color,
}: {
  x: number;
  y: number;
  text: string;
  color: string;
}) {
  const w = 22;
  const h = 20;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
        fill="rgb(var(--c-bg-rgb) / 0.55)"
        stroke={color}
        strokeWidth="0.9"
      />
      <text
        x={x + w / 2}
        y={y + 14}
        fontSize="12"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        textAnchor="middle"
        fill={color}
      >
        {text}
      </text>
    </g>
  );
}

/* Mass-dependent star palette — interpolates a red-dwarf → Sun → blue-giant
   gradient in RGB, with discrete spectral-type labels for the readout. */
function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
function lerpHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const h = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(A[0] + (B[0] - A[0]) * t)}${h(A[1] + (B[1] - A[1]) * t)}${h(
    A[2] + (B[2] - A[2]) * t,
  )}`;
}
const COOL_PAL = { core: "#ffe7c2", mid: "#ef6635", edge: "#5b1f0e" };
const SUN_PAL = { core: "#fffbeb", mid: "#f59e0b", edge: "#7c2d12" };
const HOT_PAL = { core: "#f0f5ff", mid: "#93b8ff", edge: "#1e3a8a" };

function starPalette(m: number) {
  if (m <= 1) {
    const t = (m - 0.25) / 0.75;
    return {
      core: lerpHex(COOL_PAL.core, SUN_PAL.core, t),
      mid: lerpHex(COOL_PAL.mid, SUN_PAL.mid, t),
      edge: lerpHex(COOL_PAL.edge, SUN_PAL.edge, t),
    };
  }
  const t = (m - 1) / 3;
  return {
    core: lerpHex(SUN_PAL.core, HOT_PAL.core, t),
    mid: lerpHex(SUN_PAL.mid, HOT_PAL.mid, t),
    edge: lerpHex(SUN_PAL.edge, HOT_PAL.edge, t),
  };
}
function stellarType(m: number): string {
  if (m < 0.45) return "Red dwarf";
  if (m < 0.8) return "Orange dwarf";
  if (m <= 1.1) return "Sun-like";
  if (m < 1.5) return "Yellow-white";
  if (m < 2.1) return "White star";
  return "Blue-white";
}

function LightBending() {
  const reduced = REDUCED();
  const [lingerRef, lingerOn] = useLinger();

  /* Mass slider s ∈ [0,1]; M/M☉ = 4^(2s−1) so the range is [¼, 4] and the
     midpoint (and default) is exactly the Sun. Einstein's deflection
     α = 4GM/(c²b) is linear in M at fixed impact parameter, so α(M) =
     1.75″ × (M/M☉) — the slider walks this single equation. */
  const [s, setS] = useState(0.5);
  const M = Math.pow(4, 2 * s - 1);
  const alphaArcsec = 1.75 * M;
  const pal = starPalette(M);
  const sType = stellarType(M);

  /* viewBox coords (y grows downward). Source A on the left, observer D on
     the right at the same y. Mass centre below the A–D line so light
     passing OVER it is bent DOWN toward it.

     Thin-lens approximation: the kink happens at the lens plane x = Mc.x.
     Bend point P sits δ pixels ABOVE A–D, so the ray tilts up from A to P,
     kinks DOWN at P (toward the mass), then tilts down to reach D. δ
     scales linearly with M — the same scaling as the deflection angle. */
  const W = 1000;
  const H = 340;
  const A = { x: 110, y: 210 };
  const D = { x: 910, y: 210 };
  const Mc = { x: 500, y: 260 };

  const DELTA_SUN = 22;
  const delta = DELTA_SUN * M;
  const P = { x: Mc.x, y: A.y - delta };

  /* B is where the back-extrapolation of the P→D segment crosses x = A.x.
     y_B = A.y − ((D.x − A.x) / (D.x − P.x)) · δ. */
  const tBack = (D.x - A.x) / (D.x - P.x);
  const B = { x: A.x, y: A.y - tBack * delta };

  const bentRayD = `M ${A.x} ${A.y} L ${P.x} ${P.y.toFixed(2)} L ${D.x} ${D.y}`;

  /* Star disc — scale gently with mass (R ∝ M^0.3 to keep it visible at
     both ends without dwarfing the rest of the figure). */
  const starR = 16 * Math.pow(M, 0.3);
  const auraR = Math.max(78, starR * 4.8);
  const chipY = Mc.y + starR + 14;

  const massStr = M.toFixed(2);
  const isSun = massStr === "1.00";

  return (
    <div className="flex flex-col gap-5">
      <div data-theme="dark" className="fig-viz relative rounded-md overflow-hidden border border-white/[0.06] bg-black/40">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <defs>
            <radialGradient id="lb-star-disc" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor={pal.core} />
              <stop offset="60%" stopColor={pal.mid} />
              <stop offset="100%" stopColor={pal.edge} />
            </radialGradient>
            <radialGradient id="lb-star-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={pal.mid} stopOpacity="0.45" />
              <stop offset="55%" stopColor={pal.mid} stopOpacity="0.08" />
              <stop offset="100%" stopColor={pal.mid} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lb-earth-disc" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="55%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>
            <radialGradient id="lb-source-disc" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="60%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
            <filter id="lb-glow">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>

          <rect width={W} height={H} fill="#05060c" />

          {/* Star aura — grows with mass */}
          <circle cx={Mc.x} cy={Mc.y} r={auraR} fill="url(#lb-star-aura)" />

          {/* No-mass reference: faint dotted A→D line (the path the light
              would have taken if C weren't there) */}
          <line
            x1={A.x}
            y1={A.y}
            x2={D.x}
            y2={D.y}
            stroke="rgb(var(--c-text-rgb) / 0.22)"
            strokeWidth="0.8"
            strokeDasharray="2 6"
          />

          {/* Apparent ray — dashed B→D (what the observer at D infers) */}
          <line
            x1={B.x}
            y1={B.y.toFixed(2)}
            x2={D.x}
            y2={D.y}
            stroke="rgb(var(--c-text-rgb) / 0.7)"
            strokeWidth="1.4"
            strokeDasharray="1.5 3.5"
            strokeLinecap="round"
          />

          {/* Real (bent) ray — glow halo */}
          <path
            d={bentRayD}
            stroke="#22d3ee"
            strokeOpacity="0.32"
            strokeWidth="7"
            fill="none"
            filter="url(#lb-glow)"
            strokeLinejoin="round"
          />
          {/* Real ray — sharp line */}
          <path
            d={bentRayD}
            stroke="#67e8f9"
            strokeOpacity="0.95"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Photon — animateMotion picks up the new path on each render */}
          {!reduced && (
            <circle
              key={bentRayD}
              r="3.5"
              fill="#bef0ff"
              style={{ filter: "drop-shadow(0 0 8px #22d3ee)" }}
            >
              <animateMotion dur="5s" repeatCount="indefinite" path={bentRayD} />
            </circle>
          )}

          {/* Star (C) disc */}
          <circle
            cx={Mc.x}
            cy={Mc.y}
            r={starR}
            fill="url(#lb-star-disc)"
            stroke={pal.mid}
            strokeWidth="0.6"
          />

          {/* Earth (D) disc */}
          <circle
            cx={D.x}
            cy={D.y}
            r="7"
            fill="url(#lb-earth-disc)"
            stroke="#7dd3fc"
            strokeWidth="0.5"
          />

          {/* True source (A) — solid */}
          <circle
            cx={A.x}
            cy={A.y}
            r="5"
            fill="url(#lb-source-disc)"
            stroke="#f59e0b"
            strokeWidth="0.6"
          />

          {/* Apparent source (B) — ghost outline */}
          <circle
            cx={B.x}
            cy={B.y.toFixed(2)}
            r="5"
            fill="none"
            stroke="rgb(var(--c-text-rgb) / 0.7)"
            strokeWidth="1"
            strokeDasharray="1.8 1.8"
          />

          {/* Deflection arrow — vertical double-arrow between A and B */}
          <g fill="rgb(var(--c-accent-rgb))" stroke="rgb(var(--c-accent-rgb))" strokeWidth="1">
            <line x1={A.x + 18} y1={A.y - 7} x2={A.x + 18} y2={B.y + 7} />
            <path
              d={`M ${A.x + 14} ${B.y + 11} L ${A.x + 18} ${B.y + 4} L ${A.x + 22} ${B.y + 11} Z`}
              stroke="none"
            />
            <path
              d={`M ${A.x + 14} ${A.y - 11} L ${A.x + 18} ${A.y - 4} L ${A.x + 22} ${A.y - 11} Z`}
              stroke="none"
            />
          </g>
          <text
            x={A.x + 28}
            y={(A.y + B.y) / 2 + 4}
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="0.5"
            fill="rgb(var(--c-accent-rgb))"
          >
            α ≈ {alphaArcsec.toFixed(2)}″
          </text>

          {/* Letter labels */}
          <LbLabel x={A.x - 38} y={A.y - 10} text="A" color="rgb(var(--c-text-rgb) / 0.85)" />
          <LbLabel x={B.x - 38} y={B.y - 10} text="B" color="rgb(var(--c-text-rgb) / 0.85)" />
          <LbLabel x={Mc.x - 11} y={chipY} text="C" color={pal.mid} />
          <LbLabel x={D.x + 14} y={D.y - 10} text="D" color="rgb(var(--c-accent-rgb))" />

          {/* Descriptive sub-captions */}
          <text
            x={A.x + 28}
            y={A.y + 26}
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1"
            fill="rgb(var(--c-text-rgb) / 0.55)"
          >
            STAR · TRUE POSITION
          </text>
          <text
            x={B.x + 28}
            y={B.y - 8}
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1"
            fill="rgb(var(--c-text-rgb) / 0.55)"
          >
            STAR · APPARENT POSITION
          </text>
          <text
            x={Mc.x + 22}
            y={chipY + 16}
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1"
            fill={pal.mid}
          >
            {sType.toUpperCase()} · {massStr} M☉
          </text>
          <text
            x={D.x + 14}
            y={D.y + 28}
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1"
            fill="rgb(var(--c-accent-rgb))"
          >
            EARTH
          </text>

          {/* Scale note */}
          <text
            x={W - 14}
            y={H - 12}
            fontSize="9"
            textAnchor="end"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="2"
            fill="rgb(var(--c-text-rgb) / 0.32)"
          >
            DEFLECTION ANGLE EXAGGERATED FOR CLARITY
          </text>
        </svg>
      </div>

      <Slider
        label="deflector mass"
        value={s}
        onChange={setS}
        min={0}
        max={1}
        step={0.005}
        disabled={reduced}
        formatValue={() =>
          `${massStr} M☉${isSun ? " · Sun" : ""} · α = ${alphaArcsec.toFixed(2)}″`
        }
      />
      <div className="-mt-2 flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">
        <span>red dwarf · ¼ M☉</span>
        <span>Sun · 1 M☉</span>
        <span>blue giant · 4 M☉</span>
      </div>

      <div className="grid md:grid-cols-2 gap-5 md:gap-7">
        <div className="text-[13px] text-white/75 leading-[1.6]">
          Light leaves the star at{" "}
          <span className="font-mono text-white/90">A</span> and travels toward
          Earth at{" "}
          <span className="font-mono text-plasma">D</span>. Passing close to the
          heavy body at{" "}
          <span className="font-mono" style={{ color: pal.mid }}>
            C
          </span>
          , the beam bends <em>toward</em> it — so when we trace the light back,
          the star looks shifted to the ghostly apparent position{" "}
          <span className="font-mono text-white/90">B</span>. Drag the slider to
          make C heavier: the heavier the deflector, the bigger the bend. (The
          angle α is measured in <em>arcseconds</em> — one arcsecond is 1/3600 of
          a degree, about a coin seen from two miles away.)
        </div>
        <LingerCaption targetRef={lingerRef} revealed={lingerOn}>
          Arthur Eddington&rsquo;s 1919 solar-eclipse expedition measured this
          very shift for starlight grazing the Sun and found it consistent with
          Einstein&rsquo;s predicted 1.75″ for one solar mass — the result that
          made Einstein world-famous overnight. The slider walks the same law
          across a stellar cast: at 4 M☉ the bend grows to ≈ 7″; at ¼ M☉ it
          drops to about 0.4″, just under half an arcsecond.
        </LingerCaption>
      </div>
    </div>
  );
}

export function GeneralRelativityPanel() {
  return (
    <FigurePanel
      idx="0.1.d"
      kicker="general relativity · gravity as geometry"
      caption="Mass bends the very paths that light follows. Slide the deflector across a stellar cast: at one solar mass you land on Eddington's 1919 eclipse measurement (≈ 1.75″); double the mass and the bend doubles with it."
    >
      <LightBending />
    </FigurePanel>
  );
}

/* ── GravitationalTimeDilation ───────────────────────────────────────
   Two clocks — one in deep space, one near a massive object.  As the
   user pulls the near-clock deeper into the gravity well, its hand
   ticks visibly slower than the distant clock.  Bottom panel: the
   gravity well itself (a 2D embedding) with a draggable position. */
function GravitationalTimeDilation() {
  /* depth in [0, 1] — 0 = deep space (no dilation), 1 = at event horizon
     We use the Schwarzschild factor sqrt(1 − rs/r) with rs/r = depth² so
     the curve has nice readable behaviour: dilation factor stays close
     to 1 until depth ~0.7, then drops fast as we approach the horizon. */
  const [depth, setDepth] = useState(0.4);
  const dilation = Math.sqrt(Math.max(0.001, 1 - depth * depth)); // < 1
  const tickRatio = dilation; // near-clock per distant-clock second

  /* Animation phase — distant clock advances at constant rate; near
     clock at tickRatio×. Mounted-ref pattern to avoid React state
     churn while animating. */
  const phaseRef = useRef(0);
  const [, force] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      phaseRef.current += dt;
      force((x) => (x + 1) % 1000);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const distAngle = (phaseRef.current * 60) % 360; // 60°/sec
  const nearAngle = (phaseRef.current * 60 * tickRatio) % 360;
  /* Counter readout — how many seconds the near clock has counted
     while the distant clock counted 60 (one minute). */
  const nearSeconds = (60 * tickRatio).toFixed(2);

  const W = 720;
  const H = 320;

  /* Gravity well embedding — a 1D curve y = -1/(1 + 20*(1 - depth_x)²) */
  function wellPath() {
    const pts: string[] = [];
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = 40 + t * (W - 80);
      /* depth grows from edge (t=0,1) to centre (t=0.5) */
      const r = Math.abs(t - 0.5) * 2; // 0 at centre, 1 at edge
      const y = 220 - 60 * (1 / (1 + r * r * 10));
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }
  const wellX = 40 + (W - 80) * (0.5 + depth * 0.42); // position along the curve
  const wellY = 220 - 60 * (1 / (1 + (depth - 0) * (depth - 0) * 10 * 0));
  /* The above computation is approximate; for visual placement, use the
     same formula as the path. Let me redo: at depth=0, position at edge
     (t=0); at depth=1, position at centre (t=0.5). Smooth interpolate. */
  const tPos = 0.5 - 0.42 * (1 - depth); // depth=0 → 0.08, depth=1 → 0.5
  const wellXC = 40 + tPos * (W - 80);
  const rPos = Math.abs(tPos - 0.5) * 2;
  const wellYC = 220 - 60 * (1 / (1 + rPos * rPos * 10));

  function ClockFace({ cx, cy, r, angle, color, label, sublabel }: { cx: number; cy: number; r: number; angle: number; color: string; label: string; sublabel: string }) {
    const handAngle = (angle - 90) * (Math.PI / 180);
    const hx = cx + Math.cos(handAngle) * (r - 8);
    const hy = cy + Math.sin(handAngle) * (r - 8);
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="rgb(var(--c-bg-rgb) / 0.5)" stroke={color} strokeWidth="1.6" />
        {/* Tick marks at 12/3/6/9 */}
        {[0, 90, 180, 270].map((deg) => {
          const a = (deg - 90) * (Math.PI / 180);
          const x1 = cx + Math.cos(a) * (r - 4);
          const y1 = cy + Math.sin(a) * (r - 4);
          const x2 = cx + Math.cos(a) * (r - 10);
          const y2 = cy + Math.sin(a) * (r - 10);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.8" opacity="0.7" />;
        })}
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="2.2" fill={color} />
        <text x={cx} y={cy + r + 18} textAnchor="middle" fontSize="11" letterSpacing="2" fontFamily="var(--font-mono)" fill={color}>
          {label}
        </text>
        <text x={cx} y={cy + r + 32} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
          {sublabel}
        </text>
      </g>
    );
  }

  return (
    <div>
      <div className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Two clocks side by side */}
          <ClockFace cx={W * 0.28} cy={70} r={48} angle={distAngle} color="rgb(var(--c-text-rgb) / 0.85)" label="DISTANT" sublabel="far from gravity" />
          <ClockFace cx={W * 0.72} cy={70} r={48} angle={nearAngle} color="rgb(var(--c-accent-rgb))" label="NEAR" sublabel={`× ${dilation.toFixed(3)} of distant rate`} />

          {/* Connecting note */}
          <text x={W / 2} y={70} textAnchor="middle" fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.4)">
            same physical seconds
          </text>
          <text x={W / 2} y={84} textAnchor="middle" fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.4)">
            different rates of time
          </text>

          {/* Gravity well — 2D embedding */}
          <path
            d={wellPath()}
            stroke="rgb(var(--c-text-rgb) / 0.18)"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Massive object marker at the bottom of the well */}
          <circle cx={W / 2} cy={220} r="14" fill="rgb(var(--c-solar-rgb))" opacity="0.85" style={{ filter: "drop-shadow(0 0 16px rgb(var(--c-solar-rgb) / 0.6))" }} />
          <text x={W / 2} y={224} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="1" fill="rgb(var(--c-bg-rgb))">
            M
          </text>
          {/* Draggable clock-position dot on the well */}
          <circle cx={wellXC} cy={wellYC} r="6" fill="rgb(var(--c-accent-rgb))" style={{ filter: "drop-shadow(0 0 10px rgb(var(--c-accent-rgb) / 0.7))" }} />
          <line x1={W * 0.72} y1={70 + 48} x2={wellXC} y2={wellYC - 6} stroke="rgb(var(--c-accent-rgb) / 0.5)" strokeWidth="0.8" strokeDasharray="2 3" />

          {/* Axis hints */}
          <text x={40} y={280} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.45)">
            FLAT SPACETIME · NO MASS
          </text>
          <text x={W - 40} y={280} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.45)">
            EDGE OF A BLACK HOLE ←
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            depth into gravity well
          </label>
          <span className="font-mono text-[10px] text-plasma">
            clock runs at {dilation.toFixed(3)}× the distant rate
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={0.99}
          step={0.01}
          value={depth}
          onChange={(e) => setDepth(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>deep space</span>
          <span>near star</span>
          <span>black-hole edge</span>
        </div>
      </div>

      <div
        className="mt-4 p-3 rounded-md text-[13px] text-white/85 leading-[1.55] font-sans"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.05)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-plasma mr-2">
          one minute distant ↔ {nearSeconds} seconds near
        </span>
        Near a massive object, time literally moves more slowly. GPS satellites
        — in weaker Earth gravity than us at the surface — actually tick a
        little <em>faster</em> than ground clocks; the difference is real, and
        the satellites would be useless if engineers didn't correct for it.
      </div>
    </div>
  );
}

/* Export the panel that wraps GravitationalTimeDilation in FigurePanel
   chrome so it can be dropped into the page like the other figures. */
export function GravitationalTimeDilationPanel() {
  return (
    <FigurePanel
      idx="0.1.c"
      kicker="gravitational time dilation · clocks in a well"
      caption="One of general relativity's quietest predictions: deeper into a gravity well, time itself ticks more slowly. Drag the slider — the near clock visibly slows as it descends toward the massive object. Not metaphor; literal physics that engineers correct for every day in your phone."
    >
      <GravitationalTimeDilation />
    </FigurePanel>
  );
}

