import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";

function FigurePanel({ idx, kicker, caption, fitFs, children }: { idx: string; kicker: string; caption: ReactNode; fitFs?: boolean; children: ReactNode }) {
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

/* SVG superscripts — <tspan> with a baseline shift, so powers of ten typeset
   cleanly inside SVG <text> (mono-font Unicode superscripts are tiny and
   unevenly aligned). Mirrors 1.1's helper. */
type Seg = { t: string; sup?: boolean };
function SegTspans({ segs, fontSize }: { segs: Seg[]; fontSize: number }): JSX.Element {
  const out: JSX.Element[] = [];
  let level = 0;
  segs.forEach((s, i) => {
    const want = s.sup ? 1 : 0;
    const dy = (level - want) * 0.38 * fontSize;
    level = want;
    out.push(
      <tspan key={i} dy={dy === 0 ? undefined : dy} fontSize={s.sup ? fontSize * 0.66 : fontSize}>
        {s.t}
      </tspan>,
    );
  });
  return <>{out}</>;
}

/* Tracks whether the enclosing FigureFrame is fullscreen (`.is-fs`) so the
   HTML detail panels scale their text with the figure. */
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

/* Off-screen but real <button>s for FigureFrame's keyboard navigator — it
   drives shortcuts via `.click()`, which SVG elements don't implement. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ── FIG 3.2.a — Interactive Hertzsprung–Russell diagram ────────────────
   A wide scatter of real stars: surface temperature on the x-axis (HOT on
   the LEFT, the H–R convention) versus luminosity in Suns on a log y-axis.
   Stepping the marker (← / →) walks a named tour of stars; its spectral
   class, colour, temperature and luminosity update, and the region it
   belongs to (main sequence, giants/supergiants, white dwarfs) lights up.
   All values are standard textbook figures. */

type Region = "ms" | "giant" | "wd";
type Star = {
  id: string;
  name: string;
  cls: string;       // spectral class letter
  region: Region;
  tempK: number;     // surface temperature, K
  lum: number;       // luminosity in Suns (L☉)
  color: string;     // approximate true colour
  note: string;      // one-line takeaway
};

/* x: temperature (HOT left). Plotted log10(T) reversed.
   y: luminosity in Suns, log scale. */
const STARS: Star[] = [
  { id: "spica",  name: "Spica",            cls: "B", region: "ms",    tempK: 22000, lum: 20000,  color: "#9db4ff", note: "A hot blue main-sequence star ~22,000 K, blazing 20,000 Suns bright." },
  { id: "sirius", name: "Sirius A",         cls: "A", region: "ms",    tempK: 9940,  lum: 25,     color: "#cdd8ff", note: "The brightest star in our night sky: white-hot, ~10,000 K, 25 Suns." },
  { id: "procyon",name: "Procyon A",        cls: "F", region: "ms",    tempK: 6530,  lum: 7,      color: "#f6f4ee", note: "A yellow-white F star, a little hotter and brighter than the Sun." },
  { id: "sun",    name: "The Sun",          cls: "G", region: "ms",    tempK: 5772,  lum: 1,      color: "#fff2c2", note: "Our own yellow G star: 5,772 K, defined as luminosity 1 (one Sun)." },
  { id: "alphacen", name: "Alpha Centauri B", cls: "K", region: "ms", tempK: 5260,  lum: 0.5,    color: "#ffd9a0", note: "A cooler orange K dwarf, half as bright as the Sun." },
  { id: "proxima",name: "Proxima Centauri", cls: "M", region: "ms",    tempK: 3040,  lum: 0.0017, color: "#ff9d6e", note: "The nearest star: a faint red M dwarf, just 1/600th the Sun's light." },
  { id: "aldebaran", name: "Aldebaran",     cls: "K", region: "giant", tempK: 3900,  lum: 440,    color: "#ffb27a", note: "A red giant: cool but huge, so 440 Suns bright — far above the main sequence." },
  { id: "betelgeuse", name: "Betelgeuse",   cls: "M", region: "giant", tempK: 3500,  lum: 90000,  color: "#ff7a52", note: "A red supergiant ~700× the Sun's width — cool-surfaced yet ~90,000 Suns bright." },
  { id: "rigel",  name: "Rigel",            cls: "B", region: "giant", tempK: 12100, lum: 120000, color: "#a8c0ff", note: "A blue supergiant: both hot AND enormous, over 100,000 Suns bright." },
  { id: "siriusb",name: "Sirius B",         cls: "—", region: "wd",    tempK: 25200, lum: 0.026,  color: "#dfe7ff", note: "A white dwarf: a dead star's hot core, Earth-sized — very hot but tiny, so dim." },
];

/* Region labels for the lit-up zones. */
const REGION_LABEL: Record<Region, string> = {
  ms: "MAIN SEQUENCE",
  giant: "GIANTS & SUPERGIANTS",
  wd: "WHITE DWARFS",
};
const REGION_DESC: Record<Region, string> = {
  ms: "The diagonal band where stars steadily fuse hydrogen for most of their lives — hot blue stars top-left, cool red dwarfs bottom-right, the Sun between.",
  giant: "Cool but vast stars, upper right: low surface temperature, yet so large they outshine the main sequence — the swelling of dying stars (see 3.3).",
  wd: "Dead, Earth-sized cores left when modest stars die (see 3.4): often very hot, but so tiny they shine only feebly — lower-left.",
};

/* Plot geometry. Temperature axis is reversed (hot left). */
const A_W = 960, A_H = 540;
const PLOT_L = 92, PLOT_R = 820, PLOT_T = 56, PLOT_B = 452;
const T_HI = 45000, T_LO = 2500;          // temperature axis ends (hot→cool)
const L_HI = 1e6, L_LO = 1e-4;            // luminosity axis (Suns)
function xForT(t: number) {
  // log temperature, reversed so hot is on the left
  const f = (Math.log10(T_HI) - Math.log10(t)) / (Math.log10(T_HI) - Math.log10(T_LO));
  return PLOT_L + f * (PLOT_R - PLOT_L);
}
function yForL(l: number) {
  const f = (Math.log10(L_HI) - Math.log10(l)) / (Math.log10(L_HI) - Math.log10(L_LO));
  return PLOT_T + f * (PLOT_B - PLOT_T);
}

/* Spectral-class tick marks along the top of the temperature axis. */
const CLASS_TICKS: { cls: string; t: number; color: string }[] = [
  { cls: "O", t: 38000, color: "#9bb0ff" },
  { cls: "B", t: 20000, color: "#a8c0ff" },
  { cls: "A", t: 9000,  color: "#cdd8ff" },
  { cls: "F", t: 6800,  color: "#f6f4ee" },
  { cls: "G", t: 5500,  color: "#fff2c2" },
  { cls: "K", t: 4300,  color: "#ffce8a" },
  { cls: "M", t: 3200,  color: "#ff8a5c" },
];

/* Luminosity gridlines (powers of ten, Suns). */
const LUM_TICKS: { l: number; seg: Seg[] }[] = [
  { l: 1e6,  seg: [{ t: "10" }, { t: "6", sup: true }] },
  { l: 1e4,  seg: [{ t: "10" }, { t: "4", sup: true }] },
  { l: 1e2,  seg: [{ t: "10" }, { t: "2", sup: true }] },
  { l: 1,    seg: [{ t: "1" }] },
  { l: 1e-2, seg: [{ t: "10" }, { t: "−2", sup: true }] },
  { l: 1e-4, seg: [{ t: "10" }, { t: "−4", sup: true }] },
];

function fmtLum(l: number): string {
  if (l >= 1000) return `${Math.round(l).toLocaleString()} Suns`;
  if (l >= 10) return `${Math.round(l)} Suns`;
  if (l >= 1) return `${l} Sun${l === 1 ? "" : "s"}`;
  if (l >= 0.01) return `${l.toFixed(2)} Suns`;
  return `${l.toFixed(4)} Suns`;
}

export function HRDiagramPanel(): JSX.Element {
  const [sel, setSel] = useState(3); // start on the Sun
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(15px, 2vh, 25px) * ${r})` : undefined);

  const cur = STARS[sel];
  const step = (d: -1 | 1) => setSel((s) => Math.max(0, Math.min(STARS.length - 1, s + d)));

  return (
    <FigurePanel
      idx="3.2.a"
      kicker="The Hertzsprung–Russell diagram"
      caption="Every star plotted by surface temperature (hot blue LEFT, cool red right) against brightness in Suns. Step through the marked stars with ← / → — each star's class, colour, temperature and luminosity update, and its home region lights up. Most stars lie on the diagonal main sequence; giants sit upper-right, white dwarfs lower-left."
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full"
        style={{ background: "rgb(var(--c-text-rgb) / 0.02)", borderRadius: 8, border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}
      >
        <svg viewBox={`0 0 ${A_W} ${A_H}`} preserveAspectRatio="xMidYMid meet" className="block w-full h-auto" role="img"
          aria-label="Hertzsprung-Russell diagram: surface temperature (hot left) versus luminosity in Suns, with the main sequence, giants, and white dwarfs marked.">

          {/* Region highlights — light up the selected star's zone */}
          {/* Main sequence: diagonal band */}
          <path
            d={`M ${xForT(40000)} ${yForL(3e5)} L ${xForT(40000)} ${yForL(8e4)} L ${xForT(2800)} ${yForL(2e-3)} L ${xForT(2800)} ${yForL(8e-5)} Z`}
            fill={cur.region === "ms" ? "rgb(var(--c-accent-rgb) / 0.16)" : "rgb(var(--c-text-rgb) / 0.04)"}
            stroke={cur.region === "ms" ? "rgb(var(--c-accent-rgb) / 0.6)" : "rgb(var(--c-text-rgb) / 0.12)"}
            strokeWidth={1.2}
            style={{ transition: "fill 220ms var(--ease), stroke 220ms var(--ease)" }}
          />
          {/* Giants: upper right ellipse */}
          <ellipse cx={(xForT(5000) + xForT(3300)) / 2} cy={(yForL(200) + yForL(1e5)) / 2}
            rx={(xForT(3300) - xForT(13000)) / 2} ry={(yForL(80) - yForL(2e5)) / 2}
            fill={cur.region === "giant" ? "rgb(245 158 11 / 0.16)" : "rgb(var(--c-text-rgb) / 0.04)"}
            stroke={cur.region === "giant" ? "rgb(245 158 11 / 0.6)" : "rgb(var(--c-text-rgb) / 0.12)"}
            strokeWidth={1.2}
            style={{ transition: "fill 220ms var(--ease), stroke 220ms var(--ease)" }}
          />
          {/* White dwarfs: lower left ellipse */}
          <ellipse cx={(xForT(35000) + xForT(8000)) / 2} cy={yForL(0.02)}
            rx={(xForT(8000) - xForT(35000)) / 2} ry={(yForL(0.003) - yForL(0.1)) / 2}
            fill={cur.region === "wd" ? "rgb(99 102 241 / 0.2)" : "rgb(var(--c-text-rgb) / 0.04)"}
            stroke={cur.region === "wd" ? "rgb(99 102 241 / 0.7)" : "rgb(var(--c-text-rgb) / 0.12)"}
            strokeWidth={1.2}
            style={{ transition: "fill 220ms var(--ease), stroke 220ms var(--ease)" }}
          />

          {/* Region labels */}
          <text x={xForT(7000)} y={yForL(30) + 4} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13"
            fontWeight="600" letterSpacing="0.1em" transform={`rotate(-32 ${xForT(7000)} ${yForL(30)})`}
            fill={cur.region === "ms" ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.4)"}>MAIN SEQUENCE</text>
          <text x={xForT(4200)} y={yForL(3500)} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13"
            fontWeight="600" letterSpacing="0.06em"
            fill={cur.region === "giant" ? "#f59e0b" : "rgb(var(--c-text-rgb) / 0.4)"}>GIANTS</text>
          <text x={xForT(17000)} y={yForL(0.012)} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12.5"
            fontWeight="600" letterSpacing="0.06em"
            fill={cur.region === "wd" ? "#818cf8" : "rgb(var(--c-text-rgb) / 0.4)"}>WHITE DWARFS</text>

          {/* Axes box */}
          <rect x={PLOT_L} y={PLOT_T} width={PLOT_R - PLOT_L} height={PLOT_B - PLOT_T} fill="none"
            stroke="rgb(var(--c-text-rgb) / 0.18)" strokeWidth={1} />

          {/* Spectral-class ticks + temperature on top axis */}
          {CLASS_TICKS.map((c) => (
            <g key={c.cls}>
              <circle cx={xForT(c.t)} cy={PLOT_T - 22} r={9} fill={c.color} opacity={0.92} />
              <text x={xForT(c.t)} y={PLOT_T - 18} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12"
                fontWeight="700" fill="#101018">{c.cls}</text>
            </g>
          ))}
          <text x={(PLOT_L + PLOT_R) / 2} y={28} textAnchor="middle" fontFamily="JetBrains Mono, monospace"
            fontSize="11" letterSpacing="0.16em" fill="rgb(var(--c-text-rgb) / 0.55)">SPECTRAL CLASS · HOTTER ←  → COOLER</text>

          {/* Temperature value ticks on the bottom axis */}
          {[40000, 20000, 10000, 6000, 3000].map((t) => (
            <g key={t}>
              <line x1={xForT(t)} y1={PLOT_B} x2={xForT(t)} y2={PLOT_B + 6} stroke="rgb(var(--c-text-rgb) / 0.3)" />
              <text x={xForT(t)} y={PLOT_B + 20} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11"
                fill="rgb(var(--c-text-rgb) / 0.55)">{t.toLocaleString()}</text>
            </g>
          ))}
          <text x={(PLOT_L + PLOT_R) / 2} y={PLOT_B + 38} textAnchor="middle" fontFamily="JetBrains Mono, monospace"
            fontSize="11" letterSpacing="0.12em" fill="rgb(var(--c-text-rgb) / 0.5)">surface temperature (K)</text>

          {/* Luminosity gridlines + labels */}
          {LUM_TICKS.map((g) => (
            <g key={g.l}>
              <line x1={PLOT_L} y1={yForL(g.l)} x2={PLOT_R} y2={yForL(g.l)} stroke="rgb(var(--c-text-rgb) / 0.08)" strokeDasharray="2 5" />
              <text x={PLOT_L - 10} y={yForL(g.l) + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11"
                fill="rgb(var(--c-text-rgb) / 0.55)"><SegTspans segs={g.seg} fontSize={11} /></text>
            </g>
          ))}
          <text transform={`rotate(-90 26 ${(PLOT_T + PLOT_B) / 2})`} x={26} y={(PLOT_T + PLOT_B) / 2}
            textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="0.12em"
            fill="rgb(var(--c-text-rgb) / 0.5)">luminosity (in Suns) · brighter ↑</text>

          {/* Star dots */}
          {STARS.map((s, i) => {
            const isSel = i === sel;
            const r = Math.max(4, Math.min(11, 4 + Math.log10(Math.max(s.lum, 1e-4)) * 0.9 + 6));
            return (
              <g key={s.id} onClick={() => setSel(i)} style={{ cursor: "pointer" }} role="button" aria-label={`Select ${s.name}`} aria-pressed={isSel}>
                <circle cx={xForT(s.tempK)} cy={yForL(s.lum)} r={isSel ? r + 4 : r}
                  fill={s.color} opacity={isSel ? 1 : 0.85}
                  stroke={isSel ? "#fff" : "rgb(var(--c-text-rgb) / 0.4)"} strokeWidth={isSel ? 2.5 : 0.8}
                  style={{ filter: isSel ? `drop-shadow(0 0 12px ${s.color})` : "none", transition: "r 180ms var(--ease)" }} />
                {isSel && (
                  <text x={xForT(s.tempK)} y={yForL(s.lum) - r - 9} textAnchor="middle" fontFamily="Inter, sans-serif"
                    fontSize="13" fontWeight="600" fill="rgb(var(--c-text-rgb) / 0.95)">{s.name}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Off-screen keyboard hooks: ← / → step through the marked stars. */}
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly}>previous star</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly}>next star</button>

      {/* Readout — compact horizontal strip: inline LABEL value pairs, then
          the region label + a short description. Sibling of .fig-viz. */}
      <div
        className="mt-4 rounded-md p-3"
        style={{ background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)", flexShrink: 0 }}
      >
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-sans">
          <div className="flex items-baseline gap-2">
            <span style={{ display: "inline-block", width: "0.7em", height: "0.7em", background: cur.color, borderRadius: "9999px", flexShrink: 0, boxShadow: `0 0 8px ${cur.color}`, alignSelf: "center" }} />
            <span className="font-serif" style={{ fontSize: sz(1) ?? "17px", fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.95)" }}>{cur.name}</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(var(--c-text-rgb) / 0.6)" }}>spectral class</span>{" "}
            <span style={{ fontSize: sz(1) ?? "17px", fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.9)" }}>{cur.cls === "—" ? "white dwarf" : cur.cls}</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(var(--c-text-rgb) / 0.6)" }}>temperature</span>{" "}
            <span style={{ fontSize: sz(1) ?? "17px", fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.9)" }}>{cur.tempK.toLocaleString()} K</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(var(--c-text-rgb) / 0.6)" }}>luminosity</span>{" "}
            <span style={{ fontSize: sz(1) ?? "17px", fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.9)" }}>{fmtLum(cur.lum)}</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: cur.region === "giant" ? "#f59e0b" : cur.region === "wd" ? "#818cf8" : "var(--c-accent)" }}>{REGION_LABEL[cur.region]}</span>
          </div>
        </div>
        <div className="mt-2 leading-[1.5] font-sans" style={{ fontSize: sz(0.82) ?? "13.5px", minHeight: "3em", color: "rgb(var(--c-text-rgb) / 0.85)" }}>
          {REGION_DESC[cur.region]} <span className="italic" style={{ color: "rgb(var(--c-text-rgb) / 0.7)" }}>{cur.note}</span>
        </div>
      </div>
      <div className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-center" style={{ fontSize: sz(0.62), flexShrink: 0, color: "rgb(var(--c-text-rgb) / 0.55)" }}>
        click a star · ← / → to step through them
      </div>
    </FigurePanel>
  );
}

/* ── FIG 3.2.b — Birth-mass slider: mass is destiny ─────────────────────
   Drag a star's birth mass (0.1 → 40 M☉, log slider) and read off its
   main-sequence lifetime, surface colour/temperature, and eventual fate.
   Lifetime uses the standard t ≈ 10 Gyr × M^(−2.5) scaling (the Sun = 10
   Gyr at 1 M☉). Fate thresholds: < 8 M☉ → white dwarf; 8–20 M☉ → neutron
   star (supernova); > 20 M☉ → black hole — standard textbook boundaries. */

const MASS_STOPS = 100; // slider granularity
const M_MIN = 0.1, M_MAX = 40;
function sliderToMass(v: number): number {
  // v in [0,100] → mass on a log scale
  const f = v / MASS_STOPS;
  return M_MIN * Math.pow(M_MAX / M_MIN, f);
}
/* Main-sequence lifetime in years: 10 Gyr × M^−2.5 (Sun anchor). */
function lifetimeYr(m: number): number {
  return 1e10 * Math.pow(m, -2.5);
}
function fmtTime(yr: number): string {
  if (yr >= 1e12) return `${(yr / 1e12).toFixed(yr < 1e13 ? 1 : 0)} trillion years`;
  if (yr >= 1e9) return `${(yr / 1e9).toFixed(yr < 1e10 ? 1 : 0)} billion years`;
  if (yr >= 1e6) return `${(yr / 1e6).toFixed(yr < 1e7 ? 0 : 0)} million years`;
  return `${Math.round(yr / 1e3)} thousand years`;
}
/* Rough surface temperature from main-sequence mass (K). */
function tempForMass(m: number): number {
  // crude T ∝ M^0.55 anchored to Sun (1 M☉ = 5800 K)
  return Math.round(5800 * Math.pow(m, 0.55) / 50) * 50;
}
function colorForTemp(t: number): string {
  if (t >= 25000) return "#9bb0ff";
  if (t >= 10000) return "#cdd8ff";
  if (t >= 7500) return "#f6f4ee";
  if (t >= 6000) return "#fff2c2";
  if (t >= 5000) return "#ffce8a";
  if (t >= 4000) return "#ffb27a";
  return "#ff8a5c";
}
function classForTemp(t: number): string {
  if (t >= 30000) return "O";
  if (t >= 10000) return "B";
  if (t >= 7500) return "A";
  if (t >= 6000) return "F";
  if (t >= 5200) return "G";
  if (t >= 3700) return "K";
  return "M";
}
type Fate = { label: string; color: string; body: string };
function fateForMass(m: number): Fate {
  if (m < 8) return { label: "WHITE DWARF", color: "#818cf8", body: "Below about 8 Suns, a star gently sheds its outer layers and leaves behind an Earth-sized cinder — a white dwarf (see 3.4)." };
  if (m <= 20) return { label: "NEUTRON STAR", color: "#22d3ee", body: "Between roughly 8 and 20 Suns, the star explodes as a supernova and its core collapses into a city-sized neutron star (see 3.4)." };
  return { label: "BLACK HOLE", color: "#e5536b", body: "Above about 20 Suns, the supernova leaves a core so heavy that nothing — not even light — escapes: a black hole (see 3.4)." };
}

export function MassDestinyPanel(): JSX.Element {
  const [v, setV] = useState(38); // ≈ 1 M☉
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(15px, 2vh, 25px) * ${r})` : undefined);

  const m = sliderToMass(v);
  const mDisp = m >= 10 ? Math.round(m) : m >= 1 ? m.toFixed(1) : m.toFixed(2);
  const t = tempForMass(m);
  const color = colorForTemp(t);
  const cls = classForTemp(t);
  const life = lifetimeYr(m);
  const fate = fateForMass(m);

  // Star glyph radius scales gently with mass (schematic).
  const W = 760, H = 230;
  const rad = 26 + 34 * (Math.log10(m) - Math.log10(M_MIN)) / (Math.log10(M_MAX) - Math.log10(M_MIN));

  return (
    <FigurePanel
      idx="3.2.b"
      kicker="Mass is destiny"
      caption="Drag the slider to set a star's birth mass (one-tenth of the Sun up to 40 Suns). A heavier star is hotter, bluer, burns far brighter, and so empties its fuel faster: a red dwarf lasts trillions of years, the Sun about ten billion, a 20-Sun giant only a few million. Birth mass alone fixes the lifetime — and the ending: white dwarf, neutron star, or black hole."
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full"
        style={{ background: "rgb(var(--c-text-rgb) / 0.02)", borderRadius: 8, border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="block w-full h-auto" role="img"
          aria-label={`A star of ${mDisp} solar masses, surface temperature ${t} kelvin, class ${cls}.`}>
          {/* The star glyph */}
          <defs>
            <radialGradient id="star32b" cx="42%" cy="40%" r="62%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <circle cx={W / 2} cy={H / 2} r={rad + 14} fill={color} opacity={0.18} />
          <circle cx={W / 2} cy={H / 2} r={rad} fill="url(#star32b)" style={{ filter: `drop-shadow(0 0 24px ${color})` }} />
          <text x={W / 2} y={H / 2 + rad + 34} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="600"
            fill="rgb(var(--c-text-rgb) / 0.9)">{mDisp} M☉ · class {cls}</text>
        </svg>
      </div>

      {/* Slider — FigureFrame's ←/→ drive the first range input. */}
      <div className="mt-4 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase" style={{ fontSize: sz(0.62), color: "rgb(var(--c-text-rgb) / 0.55)" }}>0.1 M☉</span>
        <input type="range" min={0} max={MASS_STOPS} step={1} value={v}
          onChange={(e) => setV(Number(e.target.value))}
          aria-label="Birth mass in solar masses"
          className="w-full" style={{ accentColor: color }} />
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase" style={{ fontSize: sz(0.62), color: "rgb(var(--c-text-rgb) / 0.55)" }}>40 M☉</span>
      </div>

      {/* Readout — compact horizontal strip: inline LABEL value pairs, then
          the eventual fate + a short description. Sibling of .fig-viz. */}
      <div className="mt-4 rounded-md p-3"
        style={{ background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)", flexShrink: 0 }}>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-sans">
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(var(--c-text-rgb) / 0.6)" }}>birth mass</span>{" "}
            <span style={{ fontSize: sz(1) ?? "17px", fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.9)" }}>{mDisp} M☉</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(var(--c-text-rgb) / 0.6)" }}>surface temperature</span>{" "}
            <span style={{ fontSize: sz(1) ?? "17px", fontWeight: 500, color }}>{t.toLocaleString()} K · class {cls}</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(var(--c-text-rgb) / 0.6)" }}>main-sequence lifetime</span>{" "}
            <span style={{ fontSize: sz(1) ?? "17px", fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.9)" }}>{fmtTime(life)}</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: fate.color }}>eventual fate · {fate.label}</span>
          </div>
        </div>
        <div className="mt-2 leading-[1.5] font-sans" style={{ fontSize: sz(0.82) ?? "13.5px", minHeight: "3em", color: "rgb(var(--c-text-rgb) / 0.85)" }}>{fate.body}</div>
      </div>
      <div className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-center" style={{ fontSize: sz(0.62), flexShrink: 0, color: "rgb(var(--c-text-rgb) / 0.55)" }}>
        drag the slider · ← / → to step the birth mass
      </div>
    </FigurePanel>
  );
}
