import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";

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

/* Off-screen but real <button>s for FigureFrame's keyboard navigator. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* shared detail-box style */
const detailBox = (color: string): CSSProperties => ({
  background: "rgb(var(--c-text-rgb) / 0.03)",
  border: `1px solid ${color}66`,
  boxShadow: `inset 0 0 0 1px ${color}22`,
  padding: "12px 14px",
  flexShrink: 0,
  transition: "border-color 220ms var(--ease)",
});

/* ── 4.2.a — The planet zoo, sorted by size and orbit ───────────────
   Radius (Earth = 1) against orbital period (days), both logarithmic —
   the classic classification plane. Seven class regions are selectable
   (click, or ←/→ / 1–7); real worlds are plotted as anchor dots.
   Region positions are schematic; the anchor dots are literature values. */

type PClass = {
  id: string;
  name: string;
  color: string;
  /** ellipse centre + radii in data units (period days, Earth radii), log-space */
  P: number; R: number; dP: number; dR: number;
  body: ReactNode;
};

const CLASSES: PClass[] = [
  { id: "lava", name: "Lava worlds", color: "#f87171", P: 1.0, R: 1.15, dP: 0.36, dR: 0.24,
    body: <>Rocky planets skimming so close to their stars that their day sides stay molten oceans of magma. Kepler-10b, the first confirmed rocky exoplanet (2011), completes an orbit in 20 hours.</> },
  { id: "hotjup", name: "Hot Jupiters", color: "#fb923c", P: 3.2, R: 14, dP: 0.42, dR: 0.2,
    body: <>Gas giants roasting in day-long orbits. 51 Pegasi b — the first planet found around a Sun-like star (1995) — is one. They cannot have formed so close to their stars; they migrated inward (§4.3).</> },
  { id: "superearth", name: "Super-Earths & mini-Neptunes", color: "#a78bfa", P: 20, R: 2.2, dP: 0.72, dR: 0.28,
    body: <>Worlds of 1–4 Earth radii — bigger than Earth, smaller than Neptune. The most common planets known in the Galaxy, yet our solar system has none. The larger ones keep a puffy hydrogen envelope.</> },
  { id: "ocean", name: "Ocean worlds", color: "#38bdf8", P: 45, R: 2.6, dP: 0.4, dR: 0.14,
    body: <>Volatile-rich planets whose bulk may be deep global water layers — K2-18 b is a famous candidate. Known only from their size and mass so far; none has been seen up close.</> },
  { id: "earthlike", name: "Earth-like", color: "#4ade80", P: 330, R: 1.05, dP: 0.36, dR: 0.16,
    body: <>Rocky, roughly Earth-sized, on temperate year-scale orbits — the hardest planets to find and the ultimate quarry. Kepler-452b (2015) orbits a Sun-like star once every 385 days.</> },
  { id: "coldgas", name: "Cold gas giants", color: "#d3a26a", P: 9000, R: 11, dP: 0.62, dR: 0.16,
    body: <>Jupiters and Saturns on distant, years-long orbits — the kind our own system carries. Far enough from their stars to stay cold and keep the hydrogen they were born with.</> },
  { id: "icegiant", name: "Ice giants", color: "#7dd3fc", P: 30000, R: 4.0, dP: 0.5, dR: 0.12,
    body: <>Uranus- and Neptune-like worlds: rock cores under deep mantles of water, ammonia, and methane, wrapped in thin hydrogen coats, orbiting far out in the cold.</> },
];

const ANCHORS_A: { name: string; P: number; R: number; color: string; dx?: number; dy?: number }[] = [
  { name: "Kepler-10b", P: 0.84, R: 1.47, color: "#f87171", dx: 0, dy: -12 },
  { name: "HD 209458 b", P: 3.5, R: 15.4, color: "#fb923c", dx: 0, dy: -12 },
  { name: "K2-18 b", P: 33, R: 2.61, color: "#38bdf8", dx: 0, dy: 20 },
  { name: "Kepler-452b", P: 385, R: 1.63, color: "#4ade80", dx: 78, dy: -2 },
  { name: "Earth", P: 365, R: 1.0, color: "#e5e7eb", dx: 0, dy: 20 },
  { name: "Jupiter", P: 4333, R: 11.2, color: "#e5e7eb", dx: 0, dy: -12 },
  { name: "Saturn", P: 10759, R: 9.45, color: "#e5e7eb", dx: 26, dy: 20 },
  { name: "Neptune", P: 60190, R: 3.88, color: "#e5e7eb", dx: 0, dy: -12 },
];

export function ClassMapPanel(): JSX.Element {
  const [idx, setIdx] = useState(1);
  const sel = CLASSES[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(CLASSES.length - 1, i + d)));

  const W = 904, H = 560;
  const L = 76, Rm = 26, T = 54, B = 66;
  const lgP = (p: number) => Math.log10(p);
  const lgR = (r: number) => Math.log10(r);
  const X0 = lgP(0.3), X1 = lgP(120000), Y0 = lgR(0.4), Y1 = lgR(30);
  const xp = (p: number) => L + ((lgP(p) - X0) / (X1 - X0)) * (W - L - Rm);
  const yp = (r: number) => H - B - ((lgR(r) - Y0) / (Y1 - Y0)) * (H - T - B);
  /* log-space ellipse: convert data-centre + log-half-widths to px */
  const exy = (c: PClass) => ({
    cx: xp(c.P), cy: yp(c.R),
    rx: (c.dP / (X1 - X0)) * (W - L - Rm),
    ry: (c.dR / (Y1 - Y0)) * (H - T - B),
  });

  const xticks = [1, 10, 100, 1000, 10000, 100000];
  const yticks = [0.5, 1, 2, 4, 10, 20];

  return (
    <FigurePanel
      idx="4.2.a"
      kicker="The planet zoo, sorted"
      caption={
        <>
          More than 6,300 known planets fall into families on one chart: size (in Earth radii) against orbital period
          (how long the planet&rsquo;s year lasts), both on logarithmic axes where each step is ×10. Click a coloured
          family — or walk them with the arrow keys — to read what it is. White dots are real anchor worlds from our
          system and beyond. Region outlines are schematic; the dots are measured values.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 40%, #101120 0%, #0a0a12 60%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label="Planet classes on a radius versus orbital period chart"
          style={{ width: "100%", height: "auto", display: "block" }}>
          {/* grid + axes */}
          {xticks.map((t) => (
            <g key={`x${t}`}>
              <line x1={xp(t)} y1={T} x2={xp(t)} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.08)" strokeWidth={1} />
              <text x={xp(t)} y={H - B + 22} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
                {t >= 10000 ? `10${t === 10000 ? "⁴" : "⁵"}` : t.toLocaleString("en-US")}
              </text>
            </g>
          ))}
          {yticks.map((t) => (
            <g key={`y${t}`}>
              <line x1={L} y1={yp(t)} x2={W - Rm} y2={yp(t)} stroke="rgb(var(--c-text-rgb) / 0.08)" strokeWidth={1} />
              <text x={L - 10} y={yp(t) + 4} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">{t}</text>
            </g>
          ))}
          <line x1={L} y1={H - B} x2={W - Rm} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <text x={(L + W - Rm) / 2} y={H - 14} textAnchor="middle" fontSize="13.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.72)">
            orbital period (days) →
          </text>
          <text x={22} y={(T + H - B) / 2} textAnchor="middle" fontSize="13.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.72)"
            transform={`rotate(-90 22 ${(T + H - B) / 2})`}>
            planet radius (Earths) →
          </text>

          {/* class regions */}
          {CLASSES.map((c, i) => {
            const e = exy(c);
            const isSel = i === idx;
            return (
              <g key={c.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <ellipse {...e} fill={c.color} opacity={isSel ? 0.34 : 0.13}
                  stroke={c.color} strokeWidth={isSel ? 2.2 : 1} strokeDasharray={isSel ? "none" : "4 4"}
                  style={{ transition: "opacity 220ms var(--ease)" }} />
                <text x={e.cx} y={c.id === "ocean" ? e.cy + e.ry + 30 : e.cy - e.ry - 8} textAnchor="middle"
                  fontSize="14" fontWeight={isSel ? 700 : 550}
                  fontFamily="Inter, sans-serif" fill={isSel ? c.color : "rgb(var(--c-text-rgb) / 0.75)"}>
                  {c.name}
                </text>
                {/* generous invisible hit area */}
                <ellipse cx={e.cx} cy={e.cy} rx={e.rx + 14} ry={e.ry + 14} fill="transparent" />
              </g>
            );
          })}

          {/* anchor dots */}
          {ANCHORS_A.map((a) => (
            <g key={a.name}>
              <circle cx={xp(a.P)} cy={yp(a.R)} r={4.4} fill={a.color} stroke="#0b0d14" strokeWidth={1.2} />
              <text x={xp(a.P) + (a.dx ?? 0)} y={yp(a.R) + (a.dy ?? -12)} textAnchor="middle" fontSize="12"
                fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.8)">{a.name}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* detail box — constant height */}
      <div className="mt-3 rounded-md" style={detailBox(sel.color)}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {CLASSES.map((c, i) => (
          <button key={c.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {c.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 4.2.b — Mass, radius, density ──────────────────────────────────
   Radius against mass (both log). Two reference density lines — Earth's
   5.5 g/cm³ and Saturn's 0.7 g/cm³ — split the plane into rocky,
   in-between, and gas-dominated worlds. ←/→ walk the eleven plotted
   worlds in mass order; densities are computed from the plotted M and R. */

type MRWorld = {
  id: string; name: string; M: number; R: number; rho: string; color: string;
  note: ReactNode; dx?: number; dy?: number;
};

/* listed in walking (mass) order */
const MR_WORLDS: MRWorld[] = [
  { id: "mercury", name: "Mercury", M: 0.055, R: 0.383, rho: "5.4", color: "#9ca3af", dy: 24,
    note: <>Small but dense — nearly Earth&rsquo;s density despite its size, thanks to the outsized iron core we met in §4.1.</> },
  { id: "mars", name: "Mars", M: 0.107, R: 0.532, rho: "3.9", color: "#ef4444", dy: -12,
    note: <>Half Earth&rsquo;s size and notably less dense — a smaller iron core and lighter rock. Still firmly on the rocky side of the chart.</> },
  { id: "venus", name: "Venus", M: 0.815, R: 0.949, rho: "5.2", color: "#fbbf24", dy: 20, dx: -20,
    note: <>Earth&rsquo;s near-twin in mass, radius, and density — it hugs the 5.5 g/cm³ rock-and-iron line almost exactly like Earth does.</> },
  { id: "earth", name: "Earth", M: 1, R: 1, rho: "5.51", color: "#60a5fa", dy: -12, dx: 10,
    note: <>The densest planet in the solar system, and the calibration point of the whole chart: 1 Earth mass, 1 Earth radius, 5.51 g/cm³.</> },
  { id: "kepler10b", name: "Kepler-10b", M: 3.3, R: 1.47, rho: "5.7", color: "#f87171", dy: -12,
    note: <>The first confirmed rocky exoplanet (2011): 3.3 Earth masses squeezed into 1.5 Earth radii — Earth-like density, lava-world orbit.</> },
  { id: "k218b", name: "K2-18 b", M: 8.6, R: 2.61, rho: "2.7", color: "#38bdf8", dy: -12,
    note: <>Too light for pure rock, too dense for pure gas — consistent with a water-rich interior or a rocky core under a hydrogen blanket. An ocean-world candidate.</> },
  { id: "uranus", name: "Uranus", M: 14.5, R: 4.01, rho: "1.27", color: "#7dd3fc", dy: -12,
    note: <>An ice giant: denser than Saturn but far lighter than rock — the signature of a deep water-ammonia-methane mantle.</> },
  { id: "neptune", name: "Neptune", M: 17.1, R: 3.88, rho: "1.64", color: "#3b82f6", dy: 20,
    note: <>Slightly smaller yet more massive than Uranus, making it the denser of the ice-giant twins — more rock and ice, less puff.</> },
  { id: "saturn", name: "Saturn", M: 95.2, R: 9.45, rho: "0.69", color: "#e8c987", dy: 20,
    note: <>The lightweight: 95 Earth masses of mostly hydrogen at a density below water&rsquo;s. Saturn defines the lower reference line of this chart.</> },
  { id: "wasp17b", name: "WASP-17b", M: 154, R: 22.3, rho: "0.08", color: "#fb923c", dy: -12,
    note: <>A &ldquo;puffed-up&rdquo; hot Jupiter: half Jupiter&rsquo;s mass swollen to nearly twice its size by stellar heat — one-tenth of Saturn&rsquo;s density.</> },
  { id: "jupiter", name: "Jupiter", M: 317.8, R: 11.21, rho: "1.33", color: "#d3a26a", dy: -12,
    note: <>318 Earth masses, 11 Earth radii. Add more mass to Jupiter and it would barely grow — gravity squeezes the extra hydrogen tighter instead.</> },
];

export function MassRadiusPanel(): JSX.Element {
  const [idx, setIdx] = useState(3);   // start on Earth
  const sel = MR_WORLDS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(MR_WORLDS.length - 1, i + d)));

  const W = 904, H = 560;
  const L = 76, Rm = 26, T = 44, B = 66;
  const X0 = Math.log10(0.03), X1 = Math.log10(3000);
  const Y0 = Math.log10(0.3), Y1 = Math.log10(30);
  const xp = (m: number) => L + ((Math.log10(m) - X0) / (X1 - X0)) * (W - L - Rm);
  const yp = (r: number) => H - B - ((Math.log10(r) - Y0) / (Y1 - Y0)) * (H - T - B);
  /* R(M) for a constant density ρ (g/cm³), Earth units */
  const rOf = (m: number, rho: number) => Math.cbrt((5.51 / rho) * m);
  const densityPath = (rho: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const lm = X0 + (i / 40) * (X1 - X0);
      const m = Math.pow(10, lm);
      const r = rOf(m, rho);
      if (r < 0.3 || r > 30) continue;
      pts.push(`${pts.length === 0 ? "M" : "L"} ${xp(m).toFixed(1)} ${yp(r).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const xticks = [0.1, 1, 10, 100, 1000];
  const yticks = [0.5, 1, 2, 4, 10, 20];

  return (
    <FigurePanel
      idx="4.2.b"
      kicker="Mass, radius, density"
      caption={
        <>
          Radius against mass for eleven worlds, with two reference lines of constant density: rock-and-iron worlds
          like Earth (5.5 g/cm³, lower dashed line) and gas-dominated worlds lighter than water like Saturn
          (0.7 g/cm³, upper dashed line). Where a planet sits between the lines reveals what it is made of. Step
          through the worlds with the arrow keys — the box shows each one&rsquo;s numbers.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 40%, #101120 0%, #0a0a12 60%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label="Planet radius versus mass with constant-density reference lines"
          style={{ width: "100%", height: "auto", display: "block" }}>
          {xticks.map((t) => (
            <g key={`x${t}`}>
              <line x1={xp(t)} y1={T} x2={xp(t)} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.08)" strokeWidth={1} />
              <text x={xp(t)} y={H - B + 22} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
                {t < 1 ? t : t.toLocaleString("en-US")}
              </text>
            </g>
          ))}
          {yticks.map((t) => (
            <g key={`y${t}`}>
              <line x1={L} y1={yp(t)} x2={W - Rm} y2={yp(t)} stroke="rgb(var(--c-text-rgb) / 0.08)" strokeWidth={1} />
              <text x={L - 10} y={yp(t) + 4} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">{t}</text>
            </g>
          ))}
          <line x1={L} y1={H - B} x2={W - Rm} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <text x={(L + W - Rm) / 2} y={H - 14} textAnchor="middle" fontSize="13.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.72)">
            planet mass (Earths) →
          </text>
          <text x={22} y={(T + H - B) / 2} textAnchor="middle" fontSize="13.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.72)"
            transform={`rotate(-90 22 ${(T + H - B) / 2})`}>
            planet radius (Earths) →
          </text>

          {/* density reference lines */}
          <path d={densityPath(5.51)} fill="none" stroke="#b45309" strokeWidth={1.8} strokeDasharray="8 6" opacity={0.9} />
          <text x={xp(30)} y={yp(rOf(30, 5.51)) + 26} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#d97706">
            5.5 g/cm³ — rock and iron (Earth)
          </text>
          <path d={densityPath(0.7)} fill="none" stroke="#8ab4f8" strokeWidth={1.8} strokeDasharray="8 6" opacity={0.9} />
          <text x={xp(0.05)} y={yp(rOf(0.05, 0.7)) - 80} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">
            0.7 g/cm³ — lighter than
          </text>
          <text x={xp(0.05)} y={yp(rOf(0.05, 0.7)) - 62} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">
            water (Saturn)
          </text>

          {/* worlds */}
          {MR_WORLDS.map((w, i) => {
            const isSel = i === idx;
            return (
              <g key={w.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <circle cx={xp(w.M)} cy={yp(w.R)} r={isSel ? 8 : 5} fill={w.color}
                  stroke={isSel ? "#ffffff" : "#0b0d14"} strokeWidth={isSel ? 2 : 1.2}
                  style={{ transition: "r 180ms var(--ease)" }} />
                <circle cx={xp(w.M)} cy={yp(w.R)} r={15} fill="transparent" />
                <text x={xp(w.M) + (w.dx ?? 0)} y={yp(w.R) + (w.dy ?? -12)} textAnchor="middle" fontSize="12"
                  fontWeight={isSel ? 700 : 450}
                  fontFamily="JetBrains Mono, monospace" fill={isSel ? w.color : "rgb(var(--c-text-rgb) / 0.72)"}>{w.name}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* detail box — constant height */}
      <div className="mt-3 rounded-md" style={detailBox(sel.color)}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name}
        </div>
        <div className="font-mono mt-1" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
          {sel.M} Earth masses · {sel.R} Earth radii · density ≈ {sel.rho} g/cm³
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "3.4em" }}>
          {sel.note}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {MR_WORLDS.map((w, i) => (
          <button key={w.id} type="button" onClick={() => setIdx(i)} data-shortcut={String((i + 1) % 10)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {w.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 4.2.c — The Saturn system ──────────────────────────────────────
   A half-view map like 4.1.a, but of Saturn's own miniature system.
   The radial axis is LOGARITHMIC in Saturn radii (noted on the scale),
   so the rings, the shepherd moons, Enceladus, and distant Titan all
   fit one frame. Five selectable features. */

type SatFeature = {
  id: string;
  name: string;
  color: string;
  stat: string;
  body: ReactNode;
};

const SAT_FEATURES: SatFeature[] = [
  { id: "rings", name: "The main rings", color: "#e8c987",
    stat: "1.24–2.27 Saturn radii · ~10 m to 1 km thick",
    body: <>Countless chunks of nearly pure water ice, from dust grains to house-sized boulders, each on its own orbit. Wider than the distance from Earth to the Moon, yet mostly thinner than a football field.</> },
  { id: "shepherds", name: "Shepherd moons", color: "#f0a35e",
    stat: "Pan · Daphnis · Prometheus · Pandora",
    body: <>Small moons whose gravity sculpts the rings: Pan and Daphnis sweep open the gaps they orbit inside, while Prometheus and Pandora flank the thin F ring and hold its icy strands in place.</> },
  { id: "enceladus", name: "Enceladus", color: "#bfdbfe",
    stat: "radius 252 km · 3.95 Saturn radii out",
    body: <>A small bright ice ball hiding a global ocean of liquid water. Geysers at its south pole jet water into space — sampled directly by the Cassini spacecraft (2005–2015) — making it a prime place to seek life.</> },
  { id: "titan", name: "Titan", color: "#d3a26a",
    stat: "radius 2,575 km · 20 Saturn radii out",
    body: <>Bigger than Mercury and the only moon with a dense atmosphere — 1.5 times Earth&rsquo;s surface pressure, mostly nitrogen — with methane rain, rivers, and lakes above a buried water ocean.</> },
  { id: "swarm", name: "The outer swarm", color: "#a78bfa",
    stat: "274 moons confirmed in 2025 — most of any planet",
    body: <>Beyond the frame, a vast halo of small captured moons on wild, tilted orbits. A single 2025 announcement added 128 at once, taking Saturn&rsquo;s count to 274 — a miniature solar system indeed.</> },
];

/* moon positions in Saturn radii (orbital distance / 60,268 km) */
const SAT_MOONS: { name: string; rs: number; ang: number; r: number; color: string; feature: string }[] = [
  { name: "Pan", rs: 2.22, ang: 64, r: 2.2, color: "#f0a35e", feature: "shepherds" },
  { name: "Daphnis", rs: 2.26, ang: 118, r: 2.0, color: "#f0a35e", feature: "shepherds" },
  { name: "Prometheus", rs: 2.31, ang: 44, r: 2.6, color: "#f0a35e", feature: "shepherds" },
  { name: "Pandora", rs: 2.35, ang: 138, r: 2.6, color: "#f0a35e", feature: "shepherds" },
  { name: "Mimas", rs: 3.08, ang: 95, r: 3.2, color: "#cbd5e1", feature: "" },
  { name: "Enceladus", rs: 3.95, ang: 62, r: 4, color: "#bfdbfe", feature: "enceladus" },
  { name: "Tethys", rs: 4.89, ang: 128, r: 3.6, color: "#cbd5e1", feature: "" },
  { name: "Dione", rs: 6.26, ang: 78, r: 3.6, color: "#cbd5e1", feature: "" },
  { name: "Rhea", rs: 8.74, ang: 108, r: 3.8, color: "#cbd5e1", feature: "" },
  { name: "Titan", rs: 20.25, ang: 52, r: 6.5, color: "#d3a26a", feature: "titan" },
];

export function SaturnSystemPanel(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const sel = SAT_FEATURES[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(SAT_FEATURES.length - 1, i + d)));

  const W = 904, H = 500;
  const cx = W / 2, cy = H - 52;
  const RMAX = 430;
  /* log radial scale: 1 R_S at the planet's edge (28 px), 26 R_S at RMAX */
  const RS_EDGE = 30;
  const px = (rs: number) => RS_EDGE + (Math.log10(Math.max(1, rs)) / Math.log10(26)) * (RMAX - RS_EDGE);
  const rad = (d: number) => (d * Math.PI) / 180;
  const pos = (rs: number, ang: number) => ({
    x: cx + px(rs) * Math.cos(rad(ang)),
    y: cy - px(rs) * Math.sin(rad(ang)),
  });
  const arc = (rs: number) => {
    const r = px(rs);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  };
  const bandPath = (rsIn: number, rsOut: number) => {
    const ro = px(rsOut), ri = px(rsIn);
    return `M ${cx - ro} ${cy} A ${ro} ${ro} 0 0 1 ${cx + ro} ${cy} L ${cx + ri} ${cy} A ${ri} ${ri} 0 0 0 ${cx - ri} ${cy} Z`;
  };

  const ringsSel = sel.id === "rings";
  const shepSel = sel.id === "shepherds";

  return (
    <FigurePanel
      idx="4.2.c"
      kicker="The Saturn system"
      caption={
        <>
          Saturn as a miniature solar system, viewed from above; distances are on a logarithmic scale (each equal step
          outward is a multiplied distance) so the tightly packed rings and far-flung Titan share one frame. Click a
          feature name — or use the arrow keys — to tour the rings, the shepherd moons that sculpt them, ocean-bearing
          Enceladus, hazy Titan, and the swarm of 274 confirmed moons.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 96%, #17130a 0%, #0b0a12 55%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Map of the Saturn system, highlighting ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          {/* feature selector row (top) */}
          {SAT_FEATURES.map((f, i) => {
            const isSel = i === idx;
            const bw = (W - 48) / SAT_FEATURES.length;
            const x = 24 + i * bw;
            return (
              <g key={f.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={x + 3} y={16} width={bw - 6} height={34} rx={7}
                  fill={isSel ? "rgb(var(--c-text-rgb) / 0.1)" : "rgb(var(--c-text-rgb) / 0.03)"}
                  stroke={isSel ? f.color : "rgb(var(--c-text-rgb) / 0.14)"} strokeWidth={isSel ? 1.8 : 1} />
                <text x={x + bw / 2} y={38} textAnchor="middle" fontSize="14.5" fontWeight={isSel ? 700 : 500}
                  fontFamily="Inter, sans-serif" fill={isSel ? f.color : "rgb(var(--c-text-rgb) / 0.78)"}>
                  {f.name}
                </text>
              </g>
            );
          })}

          {/* ring bands: C, B, (Cassini division), A, F */}
          <path d={bandPath(1.24, 1.53)} fill="#b8a988" opacity={ringsSel ? 0.5 : 0.3} />
          <path d={bandPath(1.53, 1.95)} fill="#e3d3ac" opacity={ringsSel ? 0.85 : 0.55} />
          <path d={bandPath(2.03, 2.27)} fill="#d5c39a" opacity={ringsSel ? 0.7 : 0.45} />
          <path d={arc(2.33)} fill="none" stroke="#efe2c0" strokeWidth={1.6} opacity={ringsSel || shepSel ? 0.95 : 0.55} />
          {ringsSel && (
            <g>
              <path d={arc(1.99)} fill="none" stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={1} strokeDasharray="2 5" />
              <text {...(() => { const p = pos(1.99, 148); return { x: p.x - 10, y: p.y - 2 }; })()} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">Cassini division</text>
            </g>
          )}
          {(() => { const p = pos(1.74, 32); return (
            <text x={p.x + 10} y={p.y} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill={ringsSel ? "#e3d3ac" : "rgb(var(--c-text-rgb) / 0.6)"}>B ring</text>
          ); })()}
          {(() => { const p = pos(2.45, 168); return (
            <text x={p.x - 6} y={p.y + 14} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill={ringsSel || shepSel ? "#efe2c0" : "rgb(var(--c-text-rgb) / 0.6)"}>F ring</text>
          ); })()}

          {/* moon orbits + moons */}
          {SAT_MOONS.map((m) => {
            const hi = m.feature !== "" && m.feature === sel.id;
            const p = pos(m.rs, m.ang);
            return (
              <g key={m.name}>
                <path d={arc(m.rs)} fill="none" stroke={`rgb(var(--c-text-rgb) / ${hi ? 0.35 : 0.12})`} strokeWidth={1} />
                <circle cx={p.x} cy={p.y} r={hi ? m.r + 1.5 : m.r} fill={m.color}
                  stroke={hi ? "#ffffff" : "#0b0d14"} strokeWidth={hi ? 1.6 : 0.8} opacity={hi ? 1 : 0.8} />
                {(m.r >= 3 || hi) && (
                  <text x={p.x} y={p.y - m.r - 7} textAnchor="middle" fontSize={hi ? 13.5 : 12}
                    fontWeight={hi ? 700 : 450}
                    fontFamily="Inter, sans-serif" fill={hi ? m.color : "rgb(var(--c-text-rgb) / 0.66)"}>{m.name}</text>
                )}
              </g>
            );
          })}

          {/* outer swarm hint */}
          {sel.id === "swarm" && (
            <g>
              {Array.from({ length: 40 }).map((_, i) => {
                const a = 8 + ((i * 61) % 165);
                const rr = 23 + ((i * 37) % 40) / 13;
                const p = pos(rr, a);
                return <circle key={i} cx={p.x} cy={p.y} r={1.3} fill="#c4b5fd" opacity={0.75} />;
              })}
            </g>
          )}
          <text x={W - 22} y={76} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill={sel.id === "swarm" ? "#c4b5fd" : "rgb(var(--c-text-rgb) / 0.55)"}>
            → 270+ small moons farther out
          </text>

          {/* Saturn */}
          <path d={`M ${cx - RS_EDGE} ${cy} A ${RS_EDGE} ${RS_EDGE} 0 0 1 ${cx + RS_EDGE} ${cy} Z`} fill="#e8c987" opacity={0.95} />
          <text x={cx} y={cy + 40} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="#e8c987">Saturn</text>
          {/* log-scale note */}
          <text x={26} y={cy + 24} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            distance scale: logarithmic, in Saturn radii (60,268 km)
          </text>
        </svg>
      </div>

      {/* detail box — constant height */}
      <div className="mt-3 rounded-md" style={detailBox(sel.color)}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name}
        </div>
        <div className="font-mono mt-1" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
          {sel.stat}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {SAT_FEATURES.map((f, i) => (
          <button key={f.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {f.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 4.2.d — Earth, the living machine ──────────────────────────────
   Three scenes in one figure — interior, atmosphere, magnetic shield —
   because on Earth they form one system: the liquid outer core powers
   the magnetic field that protects the atmosphere that the interior's
   volcanoes exhaled. ←/→ or the pills switch scenes; instant switches,
   no continuous animation (reduced-motion-safe). */

type EarthMode = {
  id: string;
  name: string;
  color: string;
  stat: string;
  body: ReactNode;
};

const EARTH_MODES: EarthMode[] = [
  { id: "interior", name: "Interior & plates", color: "#e8a33d",
    stat: "inner core r = 1,220 km · mantle to 2,890 km depth · plates drift cm per year",
    body: <>Radioactive decay and leftover formation heat keep the deep Earth hot. The mantle slowly churns, dragging the broken crust plates a few cm a year — recycling the seafloor, raising volcanoes, and marching supercontinents together (Rodinia ~1,000 Ma, Pangea ~335 Ma) and apart again.</> },
  { id: "atmosphere", name: "Atmosphere", color: "#60a5fa",
    stat: "troposphere → stratosphere (ozone) → mesosphere → thermosphere",
    body: <>Nearly all weather and water vapour live in the lowest ~12 km, the troposphere. Above it the stratosphere warms with height because its ozone layer absorbs the Sun&rsquo;s ultraviolet — life&rsquo;s sunscreen. The mesosphere above is the coldest region; beyond ~85 km the thin ionosphere fades into space.</> },
  { id: "magneto", name: "Magnetic shield", color: "#a78bfa",
    stat: "magnetopause ~10 Earth radii sunward · tail stretching millions of km",
    body: <>The churning liquid-iron outer core is a dynamo: it generates a magnetic bubble that deflects the solar wind. Trapped particles collect in the doughnut-shaped Van Allen belts; some leak down the polar field lines and light the auroras. Without this shield, the wind would slowly strip our air away.</> },
];

export function EarthPanel(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const sel = EARTH_MODES[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(EARTH_MODES.length - 1, i + d)));

  const W = 904, H = 520;

  /* scene 1: interior half-disc */
  const interiorScene = (() => {
    const cx = 300, cy = 268, R = 200;
    const layers = [
      { name: "crust · 5–70 km", rOut: 1.0, color: "#78716c" },
      { name: "rocky mantle · to 2,890 km deep", rOut: 0.985, color: "#b45309" },
      { name: "liquid outer core · iron, churning", rOut: 0.55, color: "#e8a33d" },
      { name: "solid inner core · r = 1,220 km", rOut: 0.19, color: "#fde68a" },
    ];
    const LEAD_X = 566, LABEL_X = 580, SLOT0 = 112, SLOTH = 82;
    return (
      <g>
        <text x={24} y={92} fontSize="16" fontFamily="Inter, sans-serif" fontWeight={600} fill="rgb(var(--c-text-rgb) / 0.85)">
          Cut to the centre
        </text>
        {layers.map((l) => (
          <path key={l.name} d={`M ${cx} ${cy - l.rOut * R} A ${l.rOut * R} ${l.rOut * R} 0 0 1 ${cx} ${cy + l.rOut * R} Z`}
            fill={l.color} stroke="rgb(0 0 0 / 0.3)" strokeWidth={1} />
        ))}
        <path d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} Z`} fill="#3b6fb0" opacity={0.5} />
        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
        {/* mantle convection arrows */}
        <path d={`M ${cx + 88} ${cy + 66} q 46 -40 24 -104`} fill="none" stroke="rgb(255 255 255 / 0.65)" strokeWidth={2} markerEnd="url(#earth-arr)" />
        <path d={`M ${cx + 152} ${cy - 60} q 30 76 -22 132`} fill="none" stroke="rgb(255 255 255 / 0.65)" strokeWidth={2} markerEnd="url(#earth-arr)" />
        {/* labels: inner first (top slot = inner core) for a clean fan */}
        {[...layers].reverse().map((l, i) => {
          const rMid = i === 0 ? 0.1 * R : ((layers[layers.length - i].rOut + l.rOut) / 2) * R;
          const ang = -50 + i * 30;
          const ax = cx + rMid * Math.cos((ang * Math.PI) / 180);
          const ay = cy + rMid * Math.sin((ang * Math.PI) / 180);
          const ly = SLOT0 + i * SLOTH;
          return (
            <g key={l.name}>
              <line x1={ax} y1={ay} x2={LEAD_X} y2={ly - 6} stroke="rgb(var(--c-text-rgb) / 0.38)" strokeWidth={1} />
              <circle cx={ax} cy={ay} r={4.5} fill={l.color} stroke="#0b0d14" strokeWidth={1} />
              <text x={LABEL_X} y={ly} fontFamily="Inter, sans-serif" fontSize={17.5} fontWeight={600} fill="rgb(var(--c-text-rgb) / 0.92)">
                {l.name}
              </text>
            </g>
          );
        })}
        <text x={LABEL_X} y={SLOT0 + 4 * SLOTH - 30} fontFamily="JetBrains Mono, monospace" fontSize={13.5} fill="rgb(var(--c-text-rgb) / 0.6)">
          the liquid outer core is the dynamo →
        </text>
        <text x={LABEL_X} y={SLOT0 + 4 * SLOTH - 10} fontFamily="JetBrains Mono, monospace" fontSize={13.5} fill="rgb(var(--c-text-rgb) / 0.6)">
          source of the magnetic shield (scene 3)
        </text>
      </g>
    );
  })();

  /* scene 2: atmosphere column with temperature curve */
  const atmosphereScene = (() => {
    const X0 = 150, X1 = 560;             // temperature axis: −100…+30 °C
    const YB = 452, YT = 92;              // altitude axis: 0…100 km
    const xT = (t: number) => X0 + ((t + 100) / 130) * (X1 - X0);
    const yA = (a: number) => YB - (a / 100) * (YB - YT);
    const bands = [
      { a0: 0, a1: 12, name: "troposphere — weather lives here", color: "#3b6fb0", op: 0.5 },
      { a0: 12, a1: 50, name: "stratosphere — warms with height", color: "#4b8ac9", op: 0.32 },
      { a0: 50, a1: 85, name: "mesosphere — coldest region", color: "#5b6bb0", op: 0.22 },
      { a0: 85, a1: 100, name: "thermosphere / ionosphere — fades to space", color: "#7a6bd8", op: 0.14 },
    ];
    /* simplified standard-atmosphere temperature profile */
    const prof: [number, number][] = [[15, 0], [-56, 12], [-56, 20], [-2, 50], [-90, 85], [-70, 100]];
    const path = prof.map(([t, a], i) => `${i === 0 ? "M" : "L"} ${xT(t).toFixed(1)} ${yA(a).toFixed(1)}`).join(" ");
    return (
      <g>
        {bands.map((b) => (
          <g key={b.name}>
            <rect x={X0 - 60} y={yA(b.a1)} width={X1 - X0 + 120} height={yA(b.a0) - yA(b.a1)} fill={b.color} opacity={b.op} />
            <text x={X1 + 70} y={(yA(b.a0) + yA(b.a1)) / 2 + 5} fontSize="14.5" fontFamily="Inter, sans-serif" fontWeight={550}
              fill="rgb(var(--c-text-rgb) / 0.88)">{b.name}</text>
            <text x={X0 - 68} y={yA(b.a0) + 4} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
              {b.a0} km
            </text>
          </g>
        ))}
        <text x={X0 - 68} y={yA(100) + 4} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">100 km</text>
        {/* ozone band */}
        <rect x={X0 - 60} y={yA(35)} width={X1 - X0 + 120} height={yA(15) - yA(35)} fill="#4ade80" opacity={0.16} />
        <text x={X0 - 46} y={(yA(15) + yA(35)) / 2 + 4} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#4ade80">
          ozone layer — absorbs UV
        </text>
        {/* temperature curve */}
        <path d={path} fill="none" stroke="#fbbf24" strokeWidth={2.6} />
        <text x={xT(15) + 10} y={yA(2) - 4} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#fbbf24">temperature</text>
        <text x={xT(-56) - 8} y={yA(12) + 16} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#fbbf24">−56 °C</text>
        <text x={xT(-90) - 8} y={yA(85) + 16} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#fbbf24">−90 °C</text>
        <text x={(X0 + X1) / 2} y={YB + 30} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">
          ← colder · temperature · warmer →
        </text>
      </g>
    );
  })();

  /* scene 3: magnetosphere side view */
  const magnetoScene = (() => {
    const ex = 320, ey = 272, er = 44;
    return (
      <g>
        {/* solar wind */}
        {[172, 232, 292, 352].map((y) => (
          <line key={y} x1={44} y1={y} x2={126} y2={y} stroke="#fbbf24" strokeWidth={2} markerEnd="url(#earth-arr-sun)" opacity={0.85} />
        ))}
        <text x={44} y={150} fontSize="13.5" fontFamily="JetBrains Mono, monospace" fill="#fbbf24">solar wind</text>
        {/* magnetopause */}
        <path d={`M ${ex - 150} ${ey} C ${ex - 150} ${ey - 190}, ${ex + 130} ${ey - 210}, ${W - 30} ${ey - 168}`}
          fill="none" stroke="#a78bfa" strokeWidth={1.8} strokeDasharray="7 6" />
        <path d={`M ${ex - 150} ${ey} C ${ex - 150} ${ey + 190}, ${ex + 130} ${ey + 210}, ${W - 30} ${ey + 168}`}
          fill="none" stroke="#a78bfa" strokeWidth={1.8} strokeDasharray="7 6" />
        <text x={ex - 160} y={ey - 168} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#a78bfa">magnetopause · ~10 R⊕</text>
        {/* field lines: compressed day side, stretched night side */}
        {[0.55, 0.8].map((k) => (
          <g key={k}>
            <path d={`M ${ex} ${ey - er} C ${ex - 150 * k} ${ey - 200 * k}, ${ex - 150 * k} ${ey + 200 * k}, ${ex} ${ey + er}`}
              fill="none" stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={1.4} />
            <path d={`M ${ex} ${ey - er} C ${ex + 320 * k} ${ey - 260 * k}, ${ex + 560 * k} ${ey - 130 * k}, ${W - 26} ${ey - 96 * k}`}
              fill="none" stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={1.4} />
            <path d={`M ${ex} ${ey + er} C ${ex + 320 * k} ${ey + 260 * k}, ${ex + 560 * k} ${ey + 130 * k}, ${W - 26} ${ey + 96 * k}`}
              fill="none" stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={1.4} />
          </g>
        ))}
        <text x={W - 30} y={ey + 10} textAnchor="end" fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
          magnetotail — millions of km →
        </text>
        {/* Van Allen belts */}
        <ellipse cx={ex} cy={ey} rx={er + 52} ry={er + 30} fill="none" stroke="#f87171" strokeWidth={11} opacity={0.3} />
        <ellipse cx={ex} cy={ey} rx={er + 96} ry={er + 60} fill="none" stroke="#f87171" strokeWidth={13} opacity={0.18} />
        <text x={ex + er + 108} y={ey + 78} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#f87171">Van Allen belts</text>
        {/* Earth */}
        <circle cx={ex} cy={ey} r={er} fill="#3b6fb0" stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={1} />
        <circle cx={ex} cy={ey} r={er * 0.45} fill="#e8a33d" opacity={0.9} />
        {/* auroral ovals */}
        <ellipse cx={ex} cy={ey - er * 0.86} rx={16} ry={6} fill="none" stroke="#4ade80" strokeWidth={3} opacity={0.9} />
        <ellipse cx={ex} cy={ey + er * 0.86} rx={16} ry={6} fill="none" stroke="#4ade80" strokeWidth={3} opacity={0.9} />
        <text x={ex - 60} y={ey - er - 22} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#4ade80">aurora</text>
        <text x={ex} y={ey + 6} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(255 255 255 / 0.85)">core dynamo</text>
      </g>
    );
  })();

  return (
    <FigurePanel
      idx="4.2.d"
      kicker="Earth, the living machine"
      caption={
        <>
          One planet, three linked systems — switch scenes with the arrow keys or the buttons. The hot interior churns
          and drives the drifting plates; its liquid-iron outer core is a dynamo whose magnetic bubble fends off the
          solar wind; and under that shield sits the layered atmosphere whose ozone filters the Sun&rsquo;s ultraviolet.
          Together they keep Earth&rsquo;s surface habitable over billions of years.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 40% 40%, #101423 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Earth systems: ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <marker id="earth-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(255 255 255 / 0.65)" />
            </marker>
            <marker id="earth-arr-sun" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
            </marker>
          </defs>
          {/* scene tabs */}
          {EARTH_MODES.map((m, i) => {
            const isSel = i === idx;
            const bw = (W - 48) / EARTH_MODES.length;
            const x = 24 + i * bw;
            return (
              <g key={m.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={x + 4} y={16} width={bw - 8} height={36} rx={7}
                  fill={isSel ? "rgb(var(--c-text-rgb) / 0.1)" : "rgb(var(--c-text-rgb) / 0.03)"}
                  stroke={isSel ? m.color : "rgb(var(--c-text-rgb) / 0.14)"} strokeWidth={isSel ? 1.8 : 1} />
                <text x={x + bw / 2} y={40} textAnchor="middle" fontSize="15.5" fontWeight={isSel ? 700 : 500}
                  fontFamily="Inter, sans-serif" fill={isSel ? m.color : "rgb(var(--c-text-rgb) / 0.78)"}>
                  {i + 1} · {m.name}
                </text>
              </g>
            );
          })}
          {idx === 0 && interiorScene}
          {idx === 1 && atmosphereScene}
          {idx === 2 && magnetoScene}
        </svg>
      </div>

      {/* detail box — constant height */}
      <div className="mt-3 rounded-md" style={detailBox(sel.color)}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name}
        </div>
        <div className="font-mono mt-1" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
          {sel.stat}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "6.2em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {EARTH_MODES.map((m, i) => (
          <button key={m.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {m.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
