import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { withBase } from "../../../data/course-nav";

/* Shared figure shell — mirrors the 0.4 / 1.2 / 1.3 pattern. */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  fitFs = false,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  fitFs?: boolean;
}) {
  return (
    <figure data-fade className={`figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}`}>
      <div className="figure-body">{children}</div>
      <figcaption>
        <span className="figure-tag">Fig. {idx}</span>
        <span className="figure-title"> — {kicker}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
}

/* Tracks `.is-fs` on the enclosing FigureFrame so HTML control/detail text can
   scale up in fullscreen (the SVG scales with its viewBox; fixed-px HTML would
   stay tiny). MutationObserver pattern from 1.2 / 1.3 / 0.4. */
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

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/* Off-screen real <button> for keyboard hooks FigureFrame drives via .click(). */
const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

const PHOTON = "rgb(var(--c-accent-rgb))";
const HOT = "rgb(var(--c-solar-rgb))";

/* ── 1.4.a · Recombination — the fog lifts ──────────────────────────── */
/* A dozen fixed particle positions across the field (deterministic, no RNG). */
const MOTES: [number, number][] = [
  [90, 60], [180, 120], [250, 50], [330, 95], [410, 140], [470, 55],
  [540, 110], [610, 70], [150, 150], [300, 150], [560, 150], [650, 130],
];

export function RecombinationPanel() {
  const [cool, setCool] = useState(0.2); // 0 = hot/earliest, 1 = cool/latest
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const T = Math.round((4500 - 3000 * cool) / 50) * 50; // 4500 K → 1500 K
  const bound = T < 3000; // electrons captured → transparent
  const Ttext = `${T.toLocaleString()} K`;
  const era = T > 3050 ? "before ≈380,000 yr" : T < 2950 ? "after ≈380,000 yr" : "≈380,000 yr — recombination";

  const W = 720;
  const H = 210;
  const trans = "opacity 240ms var(--ease)";

  return (
    <FigurePanel
      idx="1.4.a"
      kicker="Recombination — The Fog Lifts"
      caption="For its first ~380,000 years the Universe was an opaque fog: free electrons (charged) batted every photon around, so light could not travel in a straight line. Drag the slider to cool it. Below about 3,000 K, electrons are captured by nuclei into neutral atoms — they stop scattering light, and photons stream free for the first time. That escaping light is the CMB; the moment is called the 'last scattering'."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md" style={{ background: "rgb(var(--c-bg-rgb) / 0.5)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* state label */}
          <text x={W - 14} y={22} textAnchor="end" fontSize="12" letterSpacing="2" fontFamily="var(--font-mono)" fill={bound ? PHOTON : HOT}>
            {bound ? "TRANSPARENT — LIGHT FREE" : "OPAQUE — PHOTONS TRAPPED"}
          </text>

          {/* free electrons (hot) — fade out as we cool */}
          <g style={{ opacity: bound ? 0 : 1, transition: trans }}>
            {MOTES.map(([x, y], i) => (
              <g key={`e${i}`}>
                <circle cx={x} cy={y} r="7" fill={HOT} opacity="0.85" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-bg-rgb))">e⁻</text>
              </g>
            ))}
          </g>

          {/* neutral atoms (cool) — fade in: nucleus + electron shell */}
          <g style={{ opacity: bound ? 1 : 0, transition: trans }}>
            {MOTES.map(([x, y], i) => (
              <g key={`a${i}`}>
                <circle cx={x} cy={y} r="11" fill="none" stroke={PHOTON} strokeWidth="1.4" opacity="0.7" />
                <circle cx={x} cy={y} r="4" fill={PHOTON} opacity="0.85" />
              </g>
            ))}
          </g>

          {/* trapped photon — zig-zag scattering path (hot) */}
          <g style={{ opacity: bound ? 0 : 1, transition: trans }}>
            <path
              d="M 40 175 L 110 70 L 175 150 L 250 60 L 320 150 L 400 80 L 470 160 L 540 70"
              stroke={PHOTON}
              strokeWidth="2.2"
              fill="none"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 5px rgb(var(--c-accent-rgb) / 0.6))" }}
            />
            <text x={44} y={192} fontSize="11" letterSpacing="1.5" fontFamily="var(--font-mono)" fill={PHOTON}>photon trapped — bounces off every free electron</text>
          </g>

          {/* free-streaming photon — straight arrow exits right (cool) */}
          <g style={{ opacity: bound ? 1 : 0, transition: trans }}>
            <line x1={40} y1={H / 2} x2={W - 54} y2={H / 2} stroke={PHOTON} strokeWidth="2.4" style={{ filter: "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.7))" }} />
            <path d={`M ${W - 54} ${H / 2 - 7} L ${W - 40} ${H / 2} L ${W - 54} ${H / 2 + 7} Z`} fill={PHOTON} />
            <text x={44} y={H / 2 - 12} fontSize="11" letterSpacing="1.5" fontFamily="var(--font-mono)" fill={PHOTON}>photon streams free → becomes the CMB</text>
          </g>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 p-3 rounded-md" style={{ background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)", flexShrink: 0 }}>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>temperature</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: sz(1.5) ?? "1.4rem", color: bound ? PHOTON : HOT, lineHeight: 1.1 }}>{Ttext}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>matter is…</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: sz(1.1) ?? "1.05rem", color: bound ? PHOTON : HOT, lineHeight: 1.15 }}>
            {bound ? "neutral atoms" : "a charged plasma"}
          </div>
          <div className="font-mono text-white/55 mt-1" style={{ fontSize: sz(0.6) }}>{era}</div>
        </div>
      </div>

      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>temperature — drag to cool the Universe →</label>
          <span className="font-mono text-[10px] text-plasma" style={{ fontSize: sz(0.62) }}>T ≈ {Ttext}</span>
        </div>
        <input type="range" min={0} max={1} step={0.02} value={cool} onChange={(e) => setCool(parseFloat(e.target.value))} className="cosmic-slider" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>hotter · earlier</span>
          <span>≈ 3,000 K · last scattering</span>
          <span>cooler · later</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 1.4.b · Stretched to microwaves (cosmological redshift) ─────────── */
export function RedshiftPanel() {
  // The slider is the fraction of the way from last scattering (frac 0 → a=1)
  // to today (frac 1 → a=1100), spaced LOGARITHMICALLY in the scale factor so
  // the wave keeps visibly stretching across the whole 1→1100 range.
  const [frac, setFrac] = useState(0.4);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const A_MAX = 1100;
  const a = Math.round(Math.pow(A_MAX, frac)); // 1 → 1100, log-spaced
  const T = 3000 / a; // K — falls as 1/a
  const lambdaMM = 2.898 / T; // Wien peak wavelength in mm
  const fmtLambda = (mm: number) =>
    mm < 0.001 ? `${Math.round(mm * 1e6)} nm` : mm < 1 ? `${(mm * 1000).toFixed(0)} μm` : `${mm.toFixed(2)} mm`;
  const fmtT = (k: number) => (k >= 100 ? `${Math.round(k).toLocaleString()} K` : `${k.toFixed(2)} K`);
  const band = lambdaMM < 0.00075 ? "VISIBLE" : lambdaMM < 1 ? "INFRARED" : "MICROWAVE";
  // What the eye would see: a ~3,000 K glow is a dim orange ember; as it cools
  // it reddens, then leaves the visible band entirely.
  const visible = T > 1000;
  const eye = T > 1800 ? "a dim orange glow" : T > 1000 ? "a faint red glow" : T > 60 ? "invisible — infrared heat" : "invisible — microwaves";

  const W = 720;
  const H = 150;
  const xs = 40;
  const xe = W - 40;
  const span = xe - xs;
  /* Cycles shrink LINEARLY in `frac`, so the wave keeps stretching evenly all
     the way to today: ~12 short waves at last scattering down to ~0.6 of a wave
     (a single long crest) at full redshift. */
  const CYCLES_MAX = 12;
  const CYCLES_MIN = 0.6;
  const cycles = CYCLES_MAX * Math.pow(CYCLES_MIN / CYCLES_MAX, frac);
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const t = i / 240;
    const x = xs + t * span;
    const y = 78 + 34 * Math.sin(t * cycles * Math.PI * 2);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  /* One-wavelength bracket; clamp to the frame when a single λ is wider than it. */
  const cycleW = span / cycles;
  const bX1 = xs + Math.min(cycleW * 0.12, span * 0.1);
  const bX2 = Math.min(bX1 + cycleW, xe);

  return (
    <FigurePanel
      idx="1.4.b"
      kicker="Stretched to Microwaves — Cosmological Redshift"
      caption="The light set free at last scattering started as a hot ~3,000 K glow (just past visible red). But space has stretched about 1,100-fold since, and it stretched the light's waves with it — lengthening them ~1,100× and cooling the glow to just 2.725 K. Drag to expand space: watch the wave stretch, the colour leave the visible band, and the temperature fall to the faint microwave hiss we detect today."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md" style={{ background: "rgb(var(--c-bg-rgb) / 0.45)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <line x1={xs} x2={xe} y1={78} y2={78} stroke="rgb(var(--c-text-rgb) / 0.15)" strokeWidth="0.6" strokeDasharray="2 4" />
          <path d={pts.join(" ")} stroke={PHOTON} strokeWidth="2.4" fill="none" style={{ filter: "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.6))" }} />
          {/* one-wavelength bracket */}
          <line x1={bX1} y1={28} x2={bX2} y2={28} stroke={PHOTON} strokeWidth="1.2" />
          <line x1={bX1} y1={22} x2={bX1} y2={34} stroke={PHOTON} strokeWidth="1.2" />
          <line x1={bX2} y1={22} x2={bX2} y2={34} stroke={PHOTON} strokeWidth="1.2" />
          <text x={(bX1 + bX2) / 2} y={18} textAnchor="middle" fontSize="12" letterSpacing="1.5" fontFamily="var(--font-mono)" fill={PHOTON}>λ = {fmtLambda(lambdaMM)}</text>
          <text x={W - 44} y={H - 14} textAnchor="end" fontSize="12" letterSpacing="2" fontFamily="var(--font-mono)" fill={PHOTON}>{band}</text>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-md" style={{ background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)", flexShrink: 0 }}>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>space stretched</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: sz(1.4) ?? "1.3rem", color: PHOTON, lineHeight: 1.1 }}>× {Math.round(a).toLocaleString()}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>temperature</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: sz(1.4) ?? "1.3rem", color: PHOTON, lineHeight: 1.1 }}>{fmtT(T)}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>wavelength</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: sz(1.2) ?? "1.1rem", color: PHOTON, lineHeight: 1.1 }}>{fmtLambda(lambdaMM)}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>to the eye</div>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ display: "inline-block", width: "0.9em", height: "0.9em", borderRadius: "9999px", background: visible ? HOT : "rgb(var(--c-text-rgb) / 0.25)", boxShadow: visible ? "0 0 8px rgb(var(--c-solar-rgb) / 0.7)" : "none" }} />
            <span className="font-sans text-white/80" style={{ fontSize: sz(0.72) ?? "0.78rem", lineHeight: 1.2 }}>{eye}</span>
          </div>
        </div>
      </div>

      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>expand space — drag toward today →</label>
          <span className="font-mono text-[10px] text-plasma" style={{ fontSize: sz(0.62) }}>× {Math.round(a).toLocaleString()} of 1,100</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={frac} onChange={(e) => setFrac(parseFloat(e.target.value))} className="cosmic-slider" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>last scattering · 3,000 K</span>
          <span>today · 2.73 K</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 1.4.c · The Planck CMB map, with a hover magnifier ──────────────── */
const CMB_IMG = withBase("/images/media/planck-cmb.webp");
/* Diverging colour scale matching the Planck map: blue = slightly cooler
   (denser), red = slightly hotter (thinner), 2.725 K average in the middle. */
const CMB_SCALE =
  "linear-gradient(90deg, rgb(40 90 200) 0%, rgb(90 160 230) 24%, rgb(228 231 235) 50%, rgb(236 150 70) 76%, rgb(200 55 40) 100%)";

export function CmbMapPanel() {
  const [hover, setHover] = useState<{ fx: number; fy: number } | null>(null);
  const [pan, setPan] = useState({ x: 0.5, y: 0.5 }); // keyboard lens position; mouse hover overrides
  const [box, setBox] = useState({ w: 0, h: 0, ox: 0, oy: 0 }); // rendered image box within the wrapper
  const vizRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  /* Measure the IMAGE's rendered box (and its offset inside the wrapper) so the
     lens stays aligned whether the image is width- or height-limited — which is
     what lets the whole map fit, uncropped, in fullscreen. */
  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    const measure = () => setBox({ w: img.clientWidth, h: img.clientHeight, ox: img.offsetLeft, oy: img.offsetTop });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(img);
    if (!img.complete) img.addEventListener("load", measure, { once: true });
    return () => ro.disconnect();
  }, []);

  const step = (dx: -1 | 0 | 1, dy: -1 | 0 | 1) =>
    setPan((p) => ({ x: clamp01(p.x + dx * 0.08), y: clamp01(p.y + dy * 0.08) }));
  const pt = hover ?? { fx: pan.x, fy: pan.y };
  const { w, h, ox, oy } = box;
  const zoom = 3;
  const D = Math.max(120, Math.min(fs ? 360 : 210, Math.round((fs ? 0.46 : 0.4) * h)));
  const cxpx = pt.fx * w;
  const cypx = pt.fy * h;

  const onMove = (e: ReactMouseEvent) => {
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    setHover({ fx: clamp01((e.clientX - r.left) / r.width), fy: clamp01((e.clientY - r.top) / r.height) });
  };

  const lensStyle: CSSProperties = {
    position: "absolute",
    width: D,
    height: D,
    left: ox + cxpx - D / 2,
    top: oy + cypx - D / 2,
    borderRadius: "9999px",
    backgroundImage: `url(${CMB_IMG})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${w * zoom}px ${h * zoom}px`,
    backgroundPosition: `${-(cxpx * zoom - D / 2)}px ${-(cypx * zoom - D / 2)}px`,
    boxShadow: "0 0 0 2px rgb(var(--c-accent-rgb)), 0 8px 28px rgb(0 0 0 / 0.55)",
    pointerEvents: "none",
    transition: hover ? "none" : "left 200ms var(--ease), top 200ms var(--ease)",
  };

  return (
    <FigurePanel
      idx="1.4.c"
      kicker="The Baby Picture — Planck's All-Sky CMB Map"
      caption="The oldest light in the Universe, mapped by ESA's Planck satellite: every point is a photon released ~380,000 years after the Big Bang and stretched a thousand-fold on its 13.8-billion-year journey. Hover anywhere to magnify the faint ripples; the arrow keys pan the magnifier. On the colour scale the deepest blues are about a few hundred millionths of a degree (a few hundred μK) cooler and denser than the 2.725 K average — the seeds of galaxies — and the deepest reds are that much hotter and thinner. Credit: ESA / Planck Collaboration."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md flex items-center justify-center">
        <div
          ref={wrapRef}
          className="relative flex items-center justify-center"
          style={{ width: "100%", height: fs ? "100%" : "auto", lineHeight: 0, cursor: "crosshair" }}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <img
            ref={imgRef}
            src={CMB_IMG}
            alt="ESA Planck satellite all-sky map of the Cosmic Microwave Background: a mottled oval of blue and red specks on a 2.725 K background. Blue patches are slightly cooler and denser, red patches slightly hotter and thinner — the seeds of every galaxy."
            decoding="async"
            style={{
              display: "block",
              width: fs ? "auto" : "100%",
              height: "auto",
              maxWidth: "100%",
              maxHeight: fs ? "100%" : undefined,
              objectFit: "contain",
              borderRadius: "6px",
              border: "1px solid var(--c-border)",
            }}
          />
          {w > 0 && <div style={lensStyle} aria-hidden="true" />}
        </div>
      </div>

      {/* Colour scale — blue (cooler/denser) ↔ red (hotter/thinner), with the
         magnitude at each end — plus the hover/keyboard hint. */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div
          className="w-full rounded-full"
          style={{ height: fs ? "clamp(12px, 1.6vh, 22px)" : "11px", background: CMB_SCALE, border: "1px solid rgb(var(--c-text-rgb) / 0.12)" }}
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.16em] uppercase text-white/55 mt-1.5" style={{ fontSize: sz(0.58) }}>
          <span>a few hundred <span style={{ textTransform: "none" }}>μK</span> cooler</span>
          <span className="text-white/45">2.725 K</span>
          <span>a few hundred <span style={{ textTransform: "none" }}>μK</span> hotter</span>
        </div>
        <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-white/40 text-center mt-2" style={{ fontSize: sz(0.56) }}>
          hover to magnify · arrow keys pan the lens
        </div>
      </div>

      {/* Hidden keyboard hooks: all four arrows pan the magnifier across the sky.
         FigureFrame routes ←/→ (via stepFrame) and ↑/↓ (its vertical branch) to
         these buttons; mouse hover overrides. */}
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1, 0)} style={srOnly}>pan left</button>
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1, 0)} style={srOnly}>pan right</button>
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowUp" onClick={() => step(0, -1)} style={srOnly}>pan up</button>
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowDown" onClick={() => step(0, 1)} style={srOnly}>pan down</button>
    </FigurePanel>
  );
}
