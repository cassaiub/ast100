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
    <figure data-fade className="my-12">
      <div className="figure-stub rounded-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/70">
            <span className="inline-block w-2 h-2 rounded-full bg-plasma/70 shadow-[0_0_8px_#22d3ee] mr-2 align-middle"></span>
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
  const [v, setV] = useState(reduced ? 0.5 : 0);
  const [lingerRef, lingerOn] = useLinger();

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
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      stationaryAngle.current = (stationaryAngle.current + dt * 6) % 360;
      rocketAngle.current = (rocketAngle.current + (dt * 6) / gamma) % 360;
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
      <div className="grid grid-cols-2 gap-6 md:gap-10 place-items-center">
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
        value={v}
        onChange={setV}
        min={0}
        max={0.99}
        step={0.01}
        disabled={reduced}
        formatValue={(val) => `${val.toFixed(2)} c`}
      />
      <div className="text-[13px] text-white/75 leading-[1.6] max-w-[58ch]">
        Move very fast through space → time slows down for you compared to someone standing
        still.
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
      <svg viewBox="0 0 120 120" className="w-[110px] h-[110px] md:w-[130px] md:h-[130px]">
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
        {PHASES.map((p) => {
          const active = p.id === phase;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => !reduced && setPhase(p.id)}
              disabled={reduced && p.id !== "water"}
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
      <div className="relative h-[140px] md:h-[160px] flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-full w-auto">
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
        Matter and energy are essentially the same thing in different forms — like ice, water,
        and steam.
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

function LightBending() {
  const reduced = REDUCED();
  const [mass, setMass] = useState(reduced ? 0.5 : 0);
  const [lingerRef, lingerOn] = useLinger();
  const W = 880;
  const H = 260;
  const star = { x: 630, y: 150 };
  const beamY = 90;
  const bend = mass * 70;
  const c1 = { x: 320, y: beamY + bend * 0.55 };
  const c2 = { x: 560, y: beamY + bend * 1.05 };
  const end = { x: 880, y: beamY + bend * 0.4 };
  const beamD = `M 0 ${beamY} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative rounded-md overflow-hidden border border-white/[0.06] bg-black/40">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <defs>
            <radialGradient id="lb-star" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>
            <radialGradient id="lb-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <filter id="lb-glow">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>
          <rect width={W} height={H} fill="#05060c" />
          <g stroke="#22d3ee" strokeOpacity="0.06" strokeWidth="0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * (H / 8)} x2={W} y2={i * (H / 8)} />
            ))}
            {Array.from({ length: 13 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * (W / 12)} y1="0" x2={i * (W / 12)} y2={H} />
            ))}
          </g>
          <circle cx={star.x} cy={star.y} r="120" fill="url(#lb-aura)" />
          <path
            d={beamD}
            stroke="#22d3ee"
            strokeOpacity="0.4"
            strokeWidth="10"
            fill="none"
            filter="url(#lb-glow)"
            strokeLinecap="round"
          />
          <path
            d={beamD}
            stroke="#67e8f9"
            strokeOpacity="0.95"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="0" cy={beamY} r="4" fill="#22d3ee" />
          <circle
            cx={star.x}
            cy={star.y}
            r="22"
            fill="url(#lb-star)"
            stroke="#f59e0b"
            strokeWidth="0.8"
          />
          <g
            transform={`translate(${end.x - 130} ${end.y + (bend > 8 ? 28 : -22)})`}
            opacity={mass > 0.04 ? 1 : 0}
            style={{ transition: "opacity 320ms var(--ease)" }}
          >
            <line
              x1="0"
              y1="0"
              x2="100"
              y2={bend > 8 ? -bend * 0.4 : 0}
              stroke="#f59e0b"
              strokeOpacity="0.6"
              strokeWidth="0.8"
            />
            <text
              x="0"
              y={bend > 8 ? -bend * 0.4 - 8 : -10}
              fill="#f59e0b"
              fillOpacity="0.85"
              fontSize="10"
              fontFamily="ui-monospace, 'JetBrains Mono', monospace"
              letterSpacing="1"
            >
              deflection: {(mass * 1.75).toFixed(2)}″
            </text>
          </g>
          <text
            x="14"
            y={beamY - 12}
            fill="#22d3ee"
            fillOpacity="0.7"
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1.4"
          >
            LIGHT
          </text>
          <text
            x={star.x + 30}
            y={star.y + 4}
            fill="#f59e0b"
            fillOpacity="0.8"
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1.4"
          >
            STAR
          </text>
        </svg>
      </div>
      <Slider
        label="star mass"
        value={mass}
        onChange={setMass}
        min={0}
        max={1}
        step={0.01}
        disabled={reduced}
        formatValue={(val) => val.toFixed(2)}
      />
      <div className="text-[13px] text-white/75 leading-[1.6] max-w-[58ch]">
        Even light, which has no mass, follows these curves.
      </div>
      <LingerCaption targetRef={lingerRef} revealed={lingerOn}>
        Arthur Eddington&rsquo;s 1919 solar-eclipse expedition measured starlight bending by 1.61
        arcseconds as it grazed the Sun — within 5% of Einstein&rsquo;s predicted 1.75″. It was
        the first experimental confirmation of General Relativity.
      </LingerCaption>
    </div>
  );
}

function BigBangRewinder() {
  const reduced = REDUCED();
  const [t, setT] = useState(reduced ? 0.5 : 1);
  const [playing, setPlaying] = useState(false);
  const [lingerRef, lingerOn] = useLinger();
  const W = 880;
  const H = 260;
  const cx = 110;
  const cy = H / 2;

  const homesRef = useRef<{ x: number; y: number; r: number; tint: number }[] | null>(null);
  if (!homesRef.current) {
    const rng = mulberry32(20240514);
    const homes: { x: number; y: number; r: number; tint: number }[] = [];
    for (let i = 0; i < 44; i++) {
      const x = 220 + rng() * (W - 260);
      const y = 24 + rng() * (H - 48);
      const r = 0.8 + rng() * 1.6;
      const tint = rng();
      homes.push({ x, y, r, tint });
    }
    homesRef.current = homes;
  }

  useEffect(() => {
    if (!playing || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const start = 1;
    const end = 0;
    const dur = 6000;
    function tick(now: number) {
      const k = Math.min((now - t0) / dur, 1);
      const value = start + (end - start) * easeInOutCubic(k);
      setT(value);
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setT(1);
          setPlaying(false);
        }, 600);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  const homes = homesRef.current!;
  const ageGyr = (1 - t) * 13.8;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative rounded-md overflow-hidden border border-white/[0.06] bg-black/40">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <defs>
            <radialGradient id="bb-sing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="35%" stopColor="#fde68a" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bb-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="#05060c" />
          <line
            x1={cx}
            y1={H - 26}
            x2={W - 22}
            y2={H - 26}
            stroke="#22d3ee"
            strokeOpacity="0.25"
            strokeWidth="0.7"
            strokeDasharray="3 4"
          />
          <text
            x={cx}
            y={H - 10}
            fill="#22d3ee"
            fillOpacity="0.7"
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1.4"
            textAnchor="middle"
          >
            BIG BANG
          </text>
          <text
            x={W - 22}
            y={H - 10}
            fill="#ffffff"
            fillOpacity="0.55"
            fontSize="10"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            letterSpacing="1.4"
            textAnchor="end"
          >
            TODAY
          </text>

          <circle
            cx={cx}
            cy={cy}
            r={26 + (1 - t) * 30}
            fill="url(#bb-aura)"
            opacity={1 - t * 0.9}
          />

          {homes.map((g, i) => {
            const px = cx + (g.x - cx) * t;
            const py = cy + (g.y - cy) * t;
            const fill = g.tint < 0.15 ? "#fde68a" : g.tint < 0.35 ? "#a5f3fc" : "#ffffff";
            const r = g.r * (0.6 + 0.6 * t);
            const alpha = 0.45 + 0.55 * t;
            return <circle key={i} cx={px} cy={py} r={r} fill={fill} opacity={alpha} />;
          })}

          <circle cx={cx} cy={cy} r={Math.max(2, (1 - t) * 14)} fill="url(#bb-sing)" />
        </svg>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => {
            if (reduced) return;
            if (playing) {
              setPlaying(false);
            } else {
              setT(1);
              setPlaying(true);
            }
          }}
          disabled={reduced}
          className="pill rounded-full px-3.5 py-1.5 text-[11px] font-mono tracking-[0.18em] uppercase shrink-0"
        >
          {playing ? "■ stop" : "▶ rewind"}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
              cosmic time
            </label>
            <span className="font-mono text-[11px] text-plasma">
              {t > 0.001 ? `${ageGyr.toFixed(2)} Gyr ago` : "singularity"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={t}
            disabled={reduced}
            onChange={(e) => {
              setPlaying(false);
              setT(parseFloat(e.target.value));
            }}
            className="cosmic-slider"
          />
        </div>
      </div>

      <div className="text-[13px] text-white/75 leading-[1.6] max-w-[68ch]">
        Rewind the motion of the expanding universe — it points to a single moment when all
        space, time, matter, and energy were compressed into one point.
      </div>
      <LingerCaption targetRef={lingerRef} revealed={lingerOn}>
        We cannot see the first 380,000 years — the universe was opaque to light. The Cosmic
        Microwave Background is the photosphere of the Big Bang itself, the oldest image
        obtainable.
      </LingerCaption>
    </div>
  );
}

export function GeneralRelativityPanel() {
  return (
    <FigurePanel
      idx="0.1.b"
      kicker="general relativity · gravity as geometry"
      caption="Mass bends the very paths that light follows. Wind that motion all the way back, and you arrive at a single, infinitely dense beginning."
    >
      <div className="flex flex-col gap-8">
        <LightBending />
        <div className="border-t border-white/[0.06] pt-8">
          <BigBangRewinder />
        </div>
      </div>
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
      <div className="relative w-full overflow-hidden rounded-md">
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
            EVENT HORIZON ←
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            depth into gravity well
          </label>
          <span className="font-mono text-[10px] text-plasma">
            r<sub>s</sub>/r = {(depth * depth).toFixed(3)} · γ = {dilation.toFixed(3)}
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
          <span>at horizon</span>
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

/* ── utilities ──────────────────────────────────────────────────────── */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
