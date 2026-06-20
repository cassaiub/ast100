import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";

/* Shared figure shell — mirrors the chapter-0/1/2 pattern. */
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
  /** Figure-left / caption-right fullscreen layout (see global.css). */
  sidebar?: boolean;
  /** Controls/detail boxes for sidebar Tier 2 — rendered as a sibling
      `.fig-rail` (a direct child of the figure-stub) so fullscreen can
      lift them into the right column above the caption. In normal flow it
      is just a block that stacks below the figure body. */
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
const fmtN = (n: number) => Math.round(n).toLocaleString("en-US");

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* small arrow (line + filled head) for SVG diagrams */
function Arrow({ x1, y1, x2, y2, color, w = 2.5, head = 9, opacity = 1 }: {
  x1: number; y1: number; x2: number; y2: number; color: string; w?: number; head?: number; opacity?: number;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - Math.cos(a) * head, hy = y2 - Math.sin(a) * head;
  const lx = x2 - Math.cos(a - 0.42) * head, ly = y2 - Math.sin(a - 0.42) * head;
  const rx = x2 - Math.cos(a + 0.42) * head, ry = y2 - Math.sin(a + 0.42) * head;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M ${x2} ${y2} L ${lx} ${ly} L ${rx} ${ry} Z`} fill={color} />
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.4.a · The Cepheid standard candle. A pulsing Cepheid's period sets
   its TRUE luminosity (Leavitt's 1912 period–luminosity law); comparing
   that true brightness to how faint it looks gives its distance. The
   slider sets the pulsation period; the marker rides the Leavitt line and
   the star's blink slows; the readout chains period → luminosity →
   distance, lighting up Andromeda's Cepheid near 31 days. ═══════════════ */

const CEP_W = 1000, CEP_H = 560;
const CEP_LUM = (P: number) => 250 * Math.pow(P, 1.3); // L in L☉ ≈ 250·P^1.3
const CEP_P0 = 31.4;                                   // M31 V1 — Hubble's Cepheid
const CEP_L0 = CEP_LUM(CEP_P0);                         // ≈ 22,000 L☉
const CEP_DIST = (P: number) => 2.5 * Math.sqrt(CEP_LUM(P) / CEP_L0); // Mly, fixed apparent brightness
/* Leavitt plot frame */
const PLX0 = 500, PLX1 = 968, PLY0 = 70, PLY1 = 466;
const L_PMIN = Math.log10(2), L_PMAX = Math.log10(60);
const L_LMIN = Math.log10(500), L_LMAX = Math.log10(56000);
const cepX = (P: number) => PLX0 + (Math.log10(P) - L_PMIN) / (L_PMAX - L_PMIN) * (PLX1 - PLX0);
const cepY = (L: number) => PLY1 - (Math.log10(L) - L_LMIN) / (L_LMAX - L_LMIN) * (PLY1 - PLY0);
const CEP_LINE = Array.from({ length: 33 }, (_, i) => {
  const P = 2 * Math.pow(30, i / 32);
  return `${i ? "L" : "M"} ${cepX(P).toFixed(1)} ${cepY(CEP_LUM(P)).toFixed(1)}`;
}).join(" ");
/* Cepheid light-curve shape: fast rise, slow decline (range 0..1) */
const cepLC = (ph: number) => {
  const u = ((ph % 1) + 1) % 1;
  return u < 0.24 ? u / 0.24 : 1 - (u - 0.24) / 0.76;
};

export function CepheidPanel(): JSX.Element {
  const [P, setP] = useState(31.4);
  const vizRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const starRef = useRef<SVGCircleElement>(null);
  const coreRef = useRef<SVGCircleElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  /* Pulse the star imperatively (ref attributes, NOT React state) so the
     controlled period slider re-renders only on user input — a per-frame
     setState here races FigureFrame's keyboard value-update and swallows it.
     Blink cycle slows for longer periods; static if reduced-motion. */
  useEffect(() => {
    const apply = (b: number) => {
      const sr = 30 + 16 * b;
      starRef.current?.setAttribute("r", String(sr));
      coreRef.current?.setAttribute("r", String(sr * 0.62));
      coreRef.current?.setAttribute("opacity", String(0.5 + 0.4 * b));
      glowRef.current?.setAttribute("r", String(sr + 46));
      glowRef.current?.setAttribute("opacity", String(0.1 + 0.16 * b));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(0.55); return; }
    let raf = 0, last = 0, phase = 0.15;
    const cycleSec = 0.7 + (P - 2) / 58 * 2.2;
    const loop = (t: number) => {
      if (last) { phase = (phase + (t - last) / 1000 / cycleSec) % 1; apply(cepLC(phase)); }
      last = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [P]);

  const L = CEP_LUM(P);
  const dist = CEP_DIST(P);
  const starR0 = 38;                           // initial (mid-pulse) radius
  const isM31 = P >= 28 && P <= 35;
  /* light-curve path: 2.5 cycles across the box */
  const LCX0 = 70, LCX1 = 360, LCY0 = 360, LCY1 = 470;
  const lcPath = Array.from({ length: 80 }, (_, i) => {
    const u = i / 79;
    const x = LCX0 + u * (LCX1 - LCX0);
    const y = LCY1 - cepLC(u * 2.5) * (LCY1 - LCY0 - 6) - 3;
    return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  return (
    <FigurePanel
      idx="2.4.a"
      kicker="A Cepheid is a cosmic yardstick"
      caption={
        <>
          Drag the slider (or use ← / →) to pick a Cepheid&rsquo;s pulsation period. Henrietta Leavitt&rsquo;s 1912 law
          turns that period into the star&rsquo;s <em>true</em> luminosity; comparing that to how faint it looks gives its
          distance. Near 31 days you land on the Cepheid Edwin Hubble found in Andromeda — 2.5 million light-years off,
          proof it is a galaxy all its own.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ background: "radial-gradient(circle at 22% 38%, #11101f 0%, #05060c 80%)", border: "1px solid rgb(255 255 255 / 0.07)" }}
      >
        <svg viewBox={`0 0 ${CEP_W} ${CEP_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="A pulsing Cepheid variable star on the left with its light curve, and on the right Leavitt's period-luminosity diagram with a marker showing how a longer pulsation period means a brighter, more distant star." style={{ width: "100%", height: "auto", display: "block" }}>
          {/* ── left: the pulsing star + light curve ── */}
          <text x={70} y={48} fontFamily="JetBrains Mono, monospace" fontSize={15} letterSpacing="2" fill="rgb(255 255 255 / 0.55)">A PULSING CEPHEID</text>
          <radialGradient id="cep-star" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff6e0" />
            <stop offset="45%" stopColor="#ffd27f" />
            <stop offset="100%" stopColor="#ff9b3d" stopOpacity={0} />
          </radialGradient>
          <circle ref={glowRef} cx={195} cy={210} r={starR0 + 46} fill="#ffd27f" opacity={0.18} />
          <circle ref={starRef} cx={195} cy={210} r={starR0} fill="url(#cep-star)" />
          <circle ref={coreRef} cx={195} cy={210} r={starR0 * 0.62} fill="#fff8ec" opacity={0.7} />
          {/* light-curve box */}
          <text x={LCX0} y={345} fontFamily="JetBrains Mono, monospace" fontSize={12} letterSpacing="1.5" fill="rgb(255 255 255 / 0.42)">BRIGHTNESS OVER TIME</text>
          <rect x={LCX0} y={LCY0} width={LCX1 - LCX0} height={LCY1 - LCY0} fill="rgb(255 255 255 / 0.03)" stroke="rgb(255 255 255 / 0.12)" />
          <path d={lcPath} fill="none" stroke="#ffd27f" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
          {/* one-period bracket */}
          <g stroke="rgb(255 255 255 / 0.45)" strokeWidth={1.4}>
            <line x1={LCX0 + 4} y1={LCY1 + 16} x2={LCX0 + 4 + (LCX1 - LCX0) / 2.5} y2={LCY1 + 16} />
            <line x1={LCX0 + 4} y1={LCY1 + 11} x2={LCX0 + 4} y2={LCY1 + 21} />
            <line x1={LCX0 + 4 + (LCX1 - LCX0) / 2.5} y1={LCY1 + 11} x2={LCX0 + 4 + (LCX1 - LCX0) / 2.5} y2={LCY1 + 21} />
          </g>
          <text x={LCX0 + 4 + (LCX1 - LCX0) / 5} y={LCY1 + 40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={13} fill="#ffd27f">{P.toFixed(0)} days</text>

          {/* ── right: Leavitt period–luminosity diagram ── */}
          <text x={PLX0} y={48} fontFamily="JetBrains Mono, monospace" fontSize={15} letterSpacing="2" fill="rgb(255 255 255 / 0.55)">LEAVITT&rsquo;S LAW · 1912</text>
          {/* axes */}
          <line x1={PLX0} y1={PLY1} x2={PLX1} y2={PLY1} stroke="rgb(255 255 255 / 0.3)" strokeWidth={1.4} />
          <line x1={PLX0} y1={PLY0} x2={PLX0} y2={PLY1} stroke="rgb(255 255 255 / 0.3)" strokeWidth={1.4} />
          {[2, 5, 10, 20, 40, 60].map((p) => (
            <g key={p}>
              <line x1={cepX(p)} y1={PLY1} x2={cepX(p)} y2={PLY1 + 6} stroke="rgb(255 255 255 / 0.3)" />
              <text x={cepX(p)} y={PLY1 + 24} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12} fill="rgb(255 255 255 / 0.5)">{p}</text>
            </g>
          ))}
          {[1000, 10000, 50000].map((l) => (
            <g key={l}>
              <line x1={PLX0 - 6} y1={cepY(l)} x2={PLX0} y2={cepY(l)} stroke="rgb(255 255 255 / 0.3)" />
              <text x={PLX0 - 10} y={cepY(l) + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={11} fill="rgb(255 255 255 / 0.5)">{l >= 1000 ? `${l / 1000}k` : l}</text>
            </g>
          ))}
          <text x={(PLX0 + PLX1) / 2} y={PLY1 + 46} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12.5} letterSpacing="1" fill="rgb(255 255 255 / 0.55)">PULSATION PERIOD (days)</text>
          <text x={PLX0 - 40} y={(PLY0 + PLY1) / 2} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12.5} letterSpacing="1" fill="rgb(255 255 255 / 0.55)" transform={`rotate(-90 ${PLX0 - 40} ${(PLY0 + PLY1) / 2})`}>TRUE BRIGHTNESS (× Sun)</text>
          {/* Andromeda reference */}
          <line x1={cepX(CEP_P0)} y1={PLY0} x2={cepX(CEP_P0)} y2={PLY1} stroke="#8fb6f5" strokeWidth={1.2} strokeDasharray="4 5" opacity={0.6} />
          <text x={cepX(CEP_P0)} y={PLY0 - 6} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12} fill="#8fb6f5">Andromeda&rsquo;s Cepheid</text>
          {/* the relation */}
          <path d={CEP_LINE} fill="none" stroke="#ffd27f" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
          {/* current marker */}
          <line x1={cepX(P)} y1={cepY(L)} x2={cepX(P)} y2={PLY1} stroke="rgb(255 210 127 / 0.4)" strokeWidth={1} strokeDasharray="3 4" />
          <line x1={PLX0} y1={cepY(L)} x2={cepX(P)} y2={cepY(L)} stroke="rgb(255 210 127 / 0.4)" strokeWidth={1} strokeDasharray="3 4" />
          <circle cx={cepX(P)} cy={cepY(L)} r={9} fill="#fff6e0" stroke="#ff9b3d" strokeWidth={2.5} />
        </svg>
      </div>

      {/* period slider */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>pulsation period — drag to pick a Cepheid →</label>
          <span className="font-mono text-[10px]" style={{ color: "#ffd27f", fontSize: sz(0.62) }}>{P.toFixed(0)} days</span>
        </div>
        <input type="range" min={2} max={60} step={0.5} value={P} onChange={(e) => setP(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Cepheid pulsation period — left and right arrows pick a shorter or longer period" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>2 days · faint &amp; near</span>
          <span>60 days · brilliant &amp; far</span>
        </div>
      </div>

      {/* readout chain */}
      <div className="mt-4 rounded-md p-3" style={{ background: "rgb(255 210 127 / 0.06)", border: "1px solid rgb(255 210 127 / 0.24)", flexShrink: 0 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
          {[
            { k: "Pulsation period", v: `${P.toFixed(0)} days`, s: "what we time" },
            { k: "True brightness", v: `${fmtN(Math.round(L / 100) * 100)}× the Sun`, s: "from Leavitt's law" },
            { k: "Distance", v: `${dist.toFixed(1)} Mly`, s: "from how faint it looks" },
          ].map((c, i) => (
            <div key={c.k}>
              <div className="font-mono uppercase tracking-[0.16em]" style={{ color: "#ffd27f", fontSize: sz(0.62) ?? "10px" }}>{i + 1} · {c.k}</div>
              <div className="text-white/90 leading-tight mt-1" style={{ fontSize: sz(1.05) ?? "18px", fontWeight: 500 }}>{c.v}</div>
              <div className="text-white/45 font-mono" style={{ fontSize: sz(0.55) ?? "9px" }}>{c.s}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 text-white/80 leading-[1.5] font-sans" style={{ borderTop: "1px solid rgb(255 255 255 / 0.1)", fontSize: sz(0.82) ?? "13.5px", minHeight: "3em" }}>
          {isM31
            ? <><strong style={{ color: "#9cc4ff" }}>Andromeda&rsquo;s Cepheid.</strong> Near 31 days you reach the kind of star Hubble timed in Andromeda in 1925. It lies 2.5 million light-years off — far beyond the Milky Way&rsquo;s 100,000-light-year span — so Andromeda is a galaxy all its own.</>
            : <>A slower-pulsing Cepheid is <em>intrinsically</em> brighter. So if two stars look equally faint, the slower one must be farther away — that single rule turns a blink rate into a distance.</>}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.4.b · Cosmic redshift. As a galaxy recedes, every line in its
   spectrum slides toward the red and the light wave is physically
   stretched. The slider sets the redshift z (the directly measured
   stretch); the recession speed is derived relativistically. The
   train-whistle Doppler effect is the intuition — but here it is space
   itself that stretches the light in transit. ═══════════════════════════ */

const RS_W = 1000, RS_H = 560;
const C_LIGHT = 299792; // km/s
const RS_LINES = [
  { lam: 393.4, label: "K" }, { lam: 396.8, label: "H" },
  { lam: 486.1, label: "Hβ" }, { lam: 517.3, label: "Mg" },
  { lam: 589.3, label: "Na" }, { lam: 656.3, label: "Hα" },
];
const RS_X0 = 70, RS_X1 = 948;
const rsX = (lam: number) => RS_X0 + (lam - 380) / (700 - 380) * (RS_X1 - RS_X0);
/* relativistic speed from redshift: v = c·((1+z)²−1)/((1+z)²+1) */
const rsVel = (z: number) => {
  const u = (1 + z) * (1 + z);
  return C_LIGHT * (u - 1) / (u + 1);
};

function SpectrumBand({ y, h }: { y: number; h: number }) {
  return <rect x={RS_X0} y={y} width={RS_X1 - RS_X0} height={h} fill="url(#rs-grad)" rx={3} />;
}

export function RedshiftPanel(): JSX.Element {
  const [z, setZ] = useState(0.04);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const v = rsVel(z);
  const restY = 132, obsY = 268, bandH = 46;
  const haObs = 656.3 * (1 + z);

  /* two waves: rest vs stretched (true 1+z scale) */
  const WX0 = 70, WX1 = 948, WMID = 452, WAMP = 20, baseWL = (WX1 - WX0) / 10;
  const wave = (wl: number, yc: number) => Array.from({ length: 120 }, (_, i) => {
    const x = WX0 + (i / 119) * (WX1 - WX0);
    const yv = yc - Math.sin(((x - WX0) / wl) * 2 * Math.PI) * WAMP;
    return `${i ? "L" : "M"} ${x.toFixed(1)} ${yv.toFixed(1)}`;
  }).join(" ");

  return (
    <FigurePanel
      idx="2.4.b"
      kicker="Receding galaxies turn red"
      caption={
        <>
          Drag (or use ← / →) to send the galaxy racing away. Every dark line in its spectrum slides toward the red end,
          and the light wave is stretched longer — the <em>cosmological redshift</em>. The bigger the shift, the faster
          the galaxy recedes; measuring it gives the speed. A passing train&rsquo;s whistle is the intuition, but here it
          is space <em>itself</em> stretching the light as it travels.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ background: "radial-gradient(circle at 50% 30%, #0c0c18 0%, #05060c 82%)", border: "1px solid rgb(255 255 255 / 0.07)" }}
      >
        <svg viewBox={`0 0 ${RS_W} ${RS_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="A galaxy's spectrum shown at rest and as we receive it: the dark absorption lines slide toward the red end of the band as the galaxy's redshift increases, and a light wave below is stretched longer." style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="rs-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8a2be2" /><stop offset="0.19" stopColor="#2a4bff" />
              <stop offset="0.34" stopColor="#00c8d8" /><stop offset="0.47" stopColor="#34d000" />
              <stop offset="0.63" stopColor="#ffe000" /><stop offset="0.78" stopColor="#ff7a00" />
              <stop offset="1" stopColor="#ff1a1a" />
            </linearGradient>
          </defs>

          {/* rest frame */}
          <text x={RS_X0} y={restY - 22} fontFamily="JetBrains Mono, monospace" fontSize={14} letterSpacing="2" fill="rgb(255 255 255 / 0.55)">AT REST · IN THE LABORATORY</text>
          <SpectrumBand y={restY} h={bandH} />
          {RS_LINES.map((ln) => (
            <line key={ln.label} x1={rsX(ln.lam)} y1={restY} x2={rsX(ln.lam)} y2={restY + bandH} stroke="#05060c" strokeWidth={3.4} opacity={0.85} />
          ))}

          {/* observed frame */}
          <text x={RS_X0} y={obsY - 22} fontFamily="JetBrains Mono, monospace" fontSize={14} letterSpacing="2" fill="rgb(255 255 255 / 0.55)">AS WE RECEIVE IT · REDSHIFTED</text>
          <SpectrumBand y={obsY} h={bandH} />
          {RS_LINES.map((ln) => {
            const lo = ln.lam * (1 + z);
            if (lo > 700) return null;
            return <line key={ln.label} x1={rsX(lo)} y1={obsY} x2={rsX(lo)} y2={obsY + bandH} stroke="#05060c" strokeWidth={3.4} opacity={0.85} />;
          })}
          {/* shift arrows linking rest → observed for each line */}
          {RS_LINES.map((ln) => {
            const lo = ln.lam * (1 + z);
            const x2 = lo > 700 ? RS_X1 + 4 : rsX(lo);
            return <Arrow key={ln.label} x1={rsX(ln.lam)} y1={restY + bandH + 8} x2={x2} y2={obsY - 8} color="rgb(255 255 255 / 0.45)" w={1.6} head={7} opacity={z > 0.002 ? 1 : 0} />;
          })}
          {/* Hα callout */}
          <text x={rsX(656.3)} y={restY + bandH + 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12} fill="rgb(255 255 255 / 0.7)" dy={-bandH - 4}> </text>

          {/* stretching wave: rest (faint) vs observed (stretched) */}
          <text x={WX0} y={WMID - 78} fontFamily="JetBrains Mono, monospace" fontSize={13} letterSpacing="1.5" fill="rgb(255 255 255 / 0.45)">THE LIGHT WAVE, STRETCHED</text>
          <text x={WX0} y={WMID - 36} fontFamily="JetBrains Mono, monospace" fontSize={11} fill="rgb(255 255 255 / 0.4)">emitted</text>
          <path d={wave(baseWL, WMID - 30)} fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth={2} />
          <text x={WX0} y={WMID + 60} fontFamily="JetBrains Mono, monospace" fontSize={11} fill="#ff6b6b">received</text>
          <path d={wave(baseWL * (1 + z), WMID + 54)} fill="none" stroke="#ff6b6b" strokeWidth={2.6} />

          {/* axis nm ticks under observed band */}
          {[400, 500, 600, 700].map((nm) => (
            <text key={nm} x={rsX(nm)} y={obsY + bandH + 20} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={11} fill="rgb(255 255 255 / 0.45)">{nm} nm</text>
          ))}
        </svg>
      </div>

      {/* redshift slider */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>redshift — drag the galaxy away →</label>
          <span className="font-mono text-[10px]" style={{ color: "#ff6b6b", fontSize: sz(0.62) }}>z = {z.toFixed(3)}</span>
        </div>
        <input type="range" min={0} max={0.2} step={0.002} value={z} onChange={(e) => setZ(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Redshift z — left and right arrows move the galaxy slower or faster away, sliding its spectral lines toward red" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>at rest · no shift</span>
          <span>racing away · strongly redshifted</span>
        </div>
      </div>

      {/* readout */}
      <div className="mt-4 rounded-md p-3" style={{ background: "rgb(255 107 107 / 0.06)", border: "1px solid rgb(255 107 107 / 0.24)", flexShrink: 0 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
          {[
            { k: "Redshift z", v: z.toFixed(3), s: "the measured stretch" },
            { k: "Recession speed", v: `${fmtN(v)} km/s`, s: `≈ ${(v / C_LIGHT * 100).toFixed(1)}% of light` },
            { k: "The Hα line", v: `656 → ${haObs.toFixed(0)} nm`, s: haObs > 700 ? "shifted into the infrared" : "shifted toward red" },
          ].map((c) => (
            <div key={c.k}>
              <div className="font-mono uppercase tracking-[0.16em]" style={{ color: "#ff6b6b", fontSize: sz(0.62) ?? "10px" }}>{c.k}</div>
              <div className="text-white/90 leading-tight mt-1" style={{ fontSize: sz(1.05) ?? "18px", fontWeight: 500 }}>{c.v}</div>
              <div className="text-white/45 font-mono" style={{ fontSize: sz(0.55) ?? "9px" }}>{c.s}</div>
            </div>
          ))}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.4.c · The Hubble diagram. Plot each galaxy's distance against its
   recession speed and the points fall on a straight line through the
   origin — Hubble's law. The slider tilts the fit line (its slope is the
   Hubble constant); the readout turns that slope into an age, 1/H₀. The
   pills swap Hubble's sparse, short-reach 1929 data for a modern survey,
   showing how a bold guess became undeniable. ═════════════════════════ */

const HD_W = 1000, HD_H = 560;
const HD_X0 = 92, HD_X1 = 952, HD_Y0 = 56, HD_Y1 = 470;
type HDSet = { dMax: number; vMax: number; pts: [number, number][]; label: string; note: string };
const hdGen = (n: number, dMax: number, slope: number, noise: number, seed: number): [number, number][] => {
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const d = (0.05 + 0.95 * rnd()) * dMax;
    const v = slope * d + (rnd() - 0.5) * 2 * noise;
    return [d, Math.max(0, v)] as [number, number];
  });
};
const HD_DATA: Record<"modern" | "h1929", HDSet> = {
  modern: { dMax: 600, vMax: 14000, label: "Modern surveys", note: "Out to hundreds of millions of light-years, the straight line is unmistakable.", pts: hdGen(42, 600, 21, 900, 3) },
  h1929: { dMax: 16, vMax: 460, label: "Hubble, 1929", note: "With only nearby, scattered galaxies, the trend was a bold call — but Hubble saw it.", pts: hdGen(20, 16, 21, 150, 9) },
};

export function HubbleDiagramPanel(): JSX.Element {
  const [H0, setH0] = useState(21);            // km/s/Mly
  const [set, setSet] = useState<"modern" | "h1929">("modern");
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const D = HD_DATA[set];
  const hx = (d: number) => HD_X0 + d / D.dMax * (HD_X1 - HD_X0);
  const hy = (v: number) => HD_Y1 - Math.min(v, D.vMax) / D.vMax * (HD_Y1 - HD_Y0);
  const ageGyr = 300 / H0;                      // 1/H₀ in Gyr (H₀ in km/s/Mly)
  const best = H0 >= 19 && H0 <= 23;
  /* fit line: v = H0·d, clipped to the frame */
  const lineDmax = Math.min(D.dMax, D.vMax / H0);
  const accent = "#8fb6f5";

  const xTicks = set === "modern" ? [0, 150, 300, 450, 600] : [0, 4, 8, 12, 16];
  const yTicks = set === "modern" ? [0, 3500, 7000, 10500, 14000] : [0, 115, 230, 345, 460];

  return (
    <FigurePanel
      idx="2.4.c"
      kicker="Distance against speed — a straight line"
      caption={
        <>
          Each dot is a galaxy: its distance across, its recession speed up. Drag the line&rsquo;s slope (← / →) to fit the
          cloud — that slope is the <strong>Hubble constant</strong>, and its inverse, 1 / H₀, is a rough age for the
          Universe. Near 21 km/s per million light-years the line threads the data and the age lands at about 14 billion
          years. Press <strong>1</strong> / <strong>2</strong> to compare Hubble&rsquo;s sparse 1929 data with a modern survey.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ background: "radial-gradient(circle at 30% 20%, #0b0e1d 0%, #05060c 82%)", border: "1px solid rgb(255 255 255 / 0.07)" }}
      >
        <svg viewBox={`0 0 ${HD_W} ${HD_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="A scatter plot of galaxy distance versus recession speed. The points follow a straight line through the origin whose slope is the Hubble constant; a draggable fit line and a readout of the implied age of the universe accompany it." style={{ width: "100%", height: "auto", display: "block" }}>
          {/* axes */}
          <line x1={HD_X0} y1={HD_Y1} x2={HD_X1} y2={HD_Y1} stroke="rgb(255 255 255 / 0.32)" strokeWidth={1.4} />
          <line x1={HD_X0} y1={HD_Y0} x2={HD_X0} y2={HD_Y1} stroke="rgb(255 255 255 / 0.32)" strokeWidth={1.4} />
          {xTicks.map((d) => (
            <g key={d}>
              <line x1={hx(d)} y1={HD_Y1} x2={hx(d)} y2={HD_Y1 + 6} stroke="rgb(255 255 255 / 0.3)" />
              <text x={hx(d)} y={HD_Y1 + 24} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12} fill="rgb(255 255 255 / 0.5)">{fmtN(d)}</text>
            </g>
          ))}
          {yTicks.map((vv) => (
            <g key={vv}>
              <line x1={HD_X0 - 6} y1={hy(vv)} x2={HD_X0} y2={hy(vv)} stroke="rgb(255 255 255 / 0.3)" />
              <text x={HD_X0 - 10} y={hy(vv) + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={11} fill="rgb(255 255 255 / 0.5)">{fmtN(vv)}</text>
            </g>
          ))}
          <text x={(HD_X0 + HD_X1) / 2} y={HD_Y1 + 46} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12.5} letterSpacing="1" fill="rgb(255 255 255 / 0.55)">DISTANCE (million light-years)</text>
          <text x={30} y={(HD_Y0 + HD_Y1) / 2} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={12.5} letterSpacing="1" fill="rgb(255 255 255 / 0.55)" transform={`rotate(-90 30 ${(HD_Y0 + HD_Y1) / 2})`}>RECESSION SPEED (km/s)</text>

          {/* fit line */}
          <line x1={hx(0)} y1={hy(0)} x2={hx(lineDmax)} y2={hy(H0 * lineDmax)} stroke={best ? "#ffd27f" : accent} strokeWidth={3} strokeLinecap="round" opacity={0.92} />
          {/* data points */}
          {D.pts.map(([d, v], i) => (
            <circle key={i} cx={hx(d)} cy={hy(v)} r={set === "modern" ? 5.5 : 7} fill={accent} opacity={0.82} stroke="#05060c" strokeWidth={1} />
          ))}
          {/* slope label near the line */}
          <text x={hx(lineDmax) - 8} y={hy(H0 * lineDmax) - 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={13} fill={best ? "#ffd27f" : accent}>slope = H₀</text>
        </svg>
      </div>

      {/* slope slider */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>tilt the line — fit the galaxies →</label>
          <span className="font-mono text-[10px]" style={{ color: best ? "#ffd27f" : accent, fontSize: sz(0.62) }}>H₀ = {H0.toFixed(0)} km/s/Mly</span>
        </div>
        <input type="range" min={5} max={40} step={1} value={H0} onChange={(e) => setH0(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Hubble constant — left and right arrows tilt the fit line to a shallower or steeper slope" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>shallow · old universe</span>
          <span>steep · young universe</span>
        </div>
        <div className="flex gap-2 mt-3">
          {(["h1929", "modern"] as const).map((s, i) => (
            <button key={s} type="button" onClick={() => setSet(s)} data-shortcut={String(i + 1)}
              className="font-mono uppercase tracking-[0.16em]"
              style={{ fontSize: sz(0.58) ?? "10px", padding: "4px 13px", borderRadius: 9999, cursor: "pointer", color: set === s ? "rgb(5 6 12)" : accent, background: set === s ? accent : "rgb(255 255 255 / 0.05)", border: `1px solid ${accent}88` }}>
              {HD_DATA[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* readout */}
      <div className="mt-4 rounded-md p-3" style={{ background: best ? "rgb(255 210 127 / 0.07)" : "rgb(143 182 245 / 0.06)", border: `1px solid ${best ? "rgb(255 210 127 / 0.3)" : "rgb(143 182 245 / 0.22)"}`, flexShrink: 0 }}>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-sans">
          <div>
            <span className="font-mono uppercase tracking-[0.16em] text-white/55" style={{ fontSize: sz(0.6) ?? "10px" }}>Hubble constant</span>{" "}
            <span className="text-white/90" style={{ fontSize: sz(1) ?? "17px", fontWeight: 500 }}>{H0.toFixed(0)} km/s/Mly</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em] text-white/55" style={{ fontSize: sz(0.6) ?? "10px" }}>implied age (1 / H₀)</span>{" "}
            <span style={{ color: best ? "#ffd27f" : "#9cc4ff", fontSize: sz(1) ?? "17px", fontWeight: 500 }}>{ageGyr.toFixed(1)} billion years</span>
          </div>
        </div>
        <div className="mt-2 text-white/80 leading-[1.5] font-sans" style={{ fontSize: sz(0.82) ?? "13.5px", minHeight: "3em" }}>
          {best
            ? <><strong style={{ color: "#ffd27f" }}>Best fit.</strong> {D.note} The slope, about 21 km/s for every million light-years, gives an age near 14 billion years — close to the true 13.8 billion. {set === "h1929" ? "" : "Switch to Hubble's 1929 data (press 1) to see how little he had to go on."}</>
            : <>{D.note} Tilt the line until it threads the dots: a steeper slope means faster expansion and a <em>younger</em> universe; a shallower one, an older universe.</>}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.4.d · The expanding Universe — no centre. Galaxies sit at fixed
   places on a grid that is space itself; the slider inflates that space,
   and every galaxy recedes from every other, the far ones fastest
   (v ∝ distance). Pick any galaxy as "home" (click, or ↑/↓) and the
   view is identical — there is no centre, and the galaxies themselves
   keep their size while only the space between them grows. ═════════════ */

const EX_W = 1000, EX_H = 540;
const EX_CX = EX_W / 2, EX_CY = EX_H / 2, EX_S = 300;
type EGal = { x: number; y: number; r: number };
const EX_GAL: EGal[] = (() => {
  const rnd = mulberry32(5);
  const out: EGal[] = [];
  for (let cx = 0; cx < 5; cx++) {
    for (let cy = 0; cy < 4; cy++) {
      out.push({
        x: 0.12 + cx / 4 * 0.76 + (rnd() - 0.5) * 0.06,
        y: 0.28 + cy / 3 * 0.44 + (rnd() - 0.5) * 0.05,
        r: rnd() < 0.22 ? 11 : 7,
      });
    }
  }
  return out;
})();
const EX_GRID = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 0.96];

export function ExpandingUniversePanel(): JSX.Element {
  const [a, setA] = useState(1);
  const [home, setHome] = useState(9);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const h = EX_GAL[home];
  const mapX = (gx: number) => EX_CX + EX_S * a * (gx - h.x);
  const mapY = (gy: number) => EX_CY + EX_S * a * (gy - h.y);
  const N = EX_GAL.length;
  const cycle = (d: number) => setHome((p) => (p + d + N) % N);

  /* farthest on-screen distance, for colour + arrow scaling */
  const maxD = Math.max(...EX_GAL.map((g) => Math.hypot(mapX(g.x) - EX_CX, mapY(g.y) - EX_CY)), 1);

  return (
    <FigurePanel
      idx="2.4.d"
      kicker="Expansion has no centre"
      caption={
        <>
          Drag (or use ← / →) to inflate the Universe — each arrow is a galaxy&rsquo;s recession speed. Watch the lengths:
          a galaxy twice as far from <em>home</em> grows an arrow twice as long — speed in exact proportion to distance,
          Hubble&rsquo;s law made visible. Click any galaxy (or press ↑ / ↓) to move <em>home</em> onto it; every arrow
          redraws, yet that proportion never breaks — so no galaxy is the centre.
        </>
      }
      sidebar
      rail={
        <>
          {/* inflation slider */}
          <div className="mt-4" style={{ flexShrink: 0 }}>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>inflate the universe — drag forward →</label>
              <span className="font-mono text-[10px]" style={{ color: "#9cc4ff", fontSize: sz(0.62) }}>space ×{a.toFixed(2)}</span>
            </div>
            <input type="range" min={0.7} max={2} step={0.01} value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Expansion of space — left and right arrows shrink or inflate the universe; every galaxy recedes from the home galaxy" />
            <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
              <span>younger · denser</span>
              <span>older · more spread out</span>
            </div>
          </div>

          {/* readout */}
          <div className="mt-4 rounded-md p-3" style={{ background: "rgb(143 182 245 / 0.06)", border: "1px solid rgb(143 182 245 / 0.22)", flexShrink: 0 }}>
            <div className="font-mono uppercase tracking-[0.16em]" style={{ color: "#9cc4ff", fontSize: sz(0.7) ?? "11px" }}>Home — galaxy {home + 1} of {N}</div>
            <div className="mt-1 text-white/85 leading-[1.55] font-sans" style={{ fontSize: sz(0.9) ?? "14px", minHeight: "4.4em" }}>
              From <em>home</em>, the arrows fan out and lengthen with distance: the galaxy twice as far recedes twice as
              fast — Hubble&rsquo;s law, read straight off the picture. Move home to any other galaxy and the same law holds,
              so none is the centre. Run the slider back and every galaxy piles onto every other — the hot, dense
              <strong> Big Bang</strong>.
            </div>
          </div>

          {/* keyboard: ←/→ inflate (native slider); ↑/↓ cycle the home galaxy */}
          <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => cycle(-1)} style={srOnly} />
          <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => cycle(1)} style={srOnly} />
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ background: "radial-gradient(circle at 50% 50%, #0a0c1a 0%, #04050b 82%)", border: "1px solid rgb(255 255 255 / 0.07)" }}
      >
        <svg viewBox={`0 0 ${EX_W} ${EX_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="A grid of galaxies in expanding space. As the universe inflates, every galaxy moves away from the chosen home galaxy, the more distant ones faster, with arrows whose length grows with distance. The grid stretches but the galaxy dots stay the same size." style={{ width: "100%", height: "auto", display: "block" }}>
          {/* stretching space grid */}
          <g stroke="rgb(143 182 245 / 0.16)" strokeWidth={1}>
            {EX_GRID.map((g) => (
              <line key={`v${g}`} x1={mapX(g)} y1={mapY(EX_GRID[0])} x2={mapX(g)} y2={mapY(EX_GRID[EX_GRID.length - 1])} />
            ))}
            {EX_GRID.map((g) => (
              <line key={`h${g}`} x1={mapX(EX_GRID[0])} y1={mapY(g)} x2={mapX(EX_GRID[EX_GRID.length - 1])} y2={mapY(g)} />
            ))}
          </g>

          {/* recession arrows + galaxies */}
          {EX_GAL.map((g, i) => {
            const x = mapX(g.x), y = mapY(g.y);
            const dx = x - EX_CX, dy = y - EX_CY, d = Math.hypot(dx, dy);
            const isHome = i === home;
            const t = d / maxD;
            const col = isHome ? "#fff2cc" : `rgb(${Math.round(150 + 105 * t)}, ${Math.round(200 - 110 * t)}, ${Math.round(255 - 150 * t)})`;
            const aLen = Math.min(d * 0.22, 78);
            return (
              <g key={i}>
                {!isHome && d > 6 && (
                  <Arrow x1={x} y1={y} x2={x + (dx / d) * aLen} y2={y + (dy / d) * aLen} color={col} w={2.2} head={8} opacity={0.85} />
                )}
                {isHome && <circle cx={x} cy={y} r={g.r + 9} fill="none" stroke="#ffd27f" strokeWidth={2.2} opacity={0.9} />}
                {/* fat invisible hit target */}
                <circle cx={x} cy={y} r={22} fill="transparent" style={{ cursor: "pointer" }} onClick={() => setHome(i)} />
                <circle cx={x} cy={y} r={g.r} fill={col} stroke="#05060c" strokeWidth={1} style={{ cursor: "pointer" }} onClick={() => setHome(i)} />
              </g>
            );
          })}
          {/* home label */}
          <text x={mapX(h.x)} y={mapY(h.y) - h.r - 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={13} letterSpacing="1.5" fill="#ffd27f">HOME</text>
        </svg>
      </div>
    </FigurePanel>
  );
}
