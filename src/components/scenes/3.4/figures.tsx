import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import katex from "katex";

function FigurePanel({
  idx,
  kicker,
  caption,
  fitFs = false,
  sidebar = false,
  rail,
  children,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  fitFs?: boolean;
  /** Figure-left / caption-right fullscreen layout (see global.css). */
  sidebar?: boolean;
  /** Controls/detail boxes for sidebar Tier 2 — rendered as a sibling
      `.fig-rail` (a direct child of the figure-stub) placed between the
      figure body and the caption, so fullscreen can lift them into the
      right column above the caption. In normal flow it just stacks below. */
  rail?: ReactNode;
  children: ReactNode;
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

/* KaTeX inline snippet for HTML contexts (detail box, caption) — real
   typeset math instead of Unicode superscripts, which render unevenly in
   some fonts. The KaTeX CSS is loaded globally by BaseHead. */
function M({ t }: { t: string }): JSX.Element {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(t, { throwOnError: false }) }} />;
}

/* Tracks whether the enclosing FigureFrame is fullscreen (`.is-fs`) so the
   HTML detail/control panels can scale their text up with the figure. */
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

/* Off-screen real <button>s for FigureFrame's keyboard navigator — it drives
   shortcuts via `.click()`, which SVG elements don't implement. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

function usePrefersReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* ── Fig 3.4.a — the fork in the road ─────────────────────────────────
   Slide the star's BIRTH mass (in solar masses). The same furnace ends
   three different ways, set only by how much the star weighed:
     < 8 M☉   → white dwarf (core below the 1.4 M☉ Chandrasekhar limit)
     8–20 M☉  → neutron star (core ~1.4–2 M☉, packed to nuclear density)
     > ~20 M☉ → black hole (even neutron pressure fails)
   The slider drives selection (FigureFrame's rule-2 range input), and the
   detail box is constant-height so switching outcome never resizes it. */

type RemnantId = "wd" | "ns" | "bh";
type Remnant = {
  id: RemnantId;
  /** progenitor (birth) mass range, lower inclusive, that yields this end. */
  lo: number;
  hi: number;
  name: string;
  color: string;
  /** compact inline stat pairs shown in the bottom strip. */
  stats: { label: string; value: ReactNode }[];
  /** short (<= 2 line) summary body for the bottom strip. */
  summary: ReactNode;
};

const MASS_MIN = 0.5;
const MASS_MAX = 60;
/* Outcome boundaries (solar masses), standard textbook values:
   white dwarf below ~8, neutron star ~8–20, black hole above ~20. */
const WD_MAX = 8;
const NS_MAX = 20;

const REMNANTS: Record<RemnantId, Remnant> = {
  wd: {
    id: "wd",
    lo: MASS_MIN,
    hi: WD_MAX,
    name: "White Dwarf",
    color: "#7cc7ff",
    stats: [
      { label: "born", value: <>under 8 M☉</> },
      { label: "remnant mass", value: <>under 1.4 M☉</> },
      { label: "size", value: <>Earth-sized (~6,000 km)</> },
      { label: "held up by", value: <>electron degeneracy</> },
    ],
    summary: (
      <>
        The bare, glowing carbon-oxygen core left when the dying star sheds its outer layers. A teaspoon weighs a tonne;
        electron degeneracy pressure caps it at the 1.4 M☉ Chandrasekhar limit. It just cools and fades — our Sun&rsquo;s fate (Chapter 4).
      </>
    ),
  },
  ns: {
    id: "ns",
    lo: WD_MAX,
    hi: NS_MAX,
    name: "Neutron Star",
    color: "#c9a6ff",
    stats: [
      { label: "born", value: <>~8–20 M☉</> },
      { label: "remnant mass", value: <>~1.4–2 M☉</> },
      { label: "size", value: <>~20 km ball</> },
      { label: "held up by", value: <>neutron degeneracy</> },
    ],
    summary: (
      <>
        The collapsed core left after a supernova, with gravity crushing protons and electrons into neutrons at nuclear
        density (near <M t="10^{17}" /> kg/m³). A sugar-cube would weigh a mountain. Fast-spinning ones beam radio pulses — pulsars (§3.3).
      </>
    ),
  },
  bh: {
    id: "bh",
    lo: NS_MAX,
    hi: MASS_MAX,
    name: "Black Hole",
    color: "#f2a154",
    stats: [
      { label: "born", value: <>above ~20 M☉</> },
      { label: "remnant mass", value: <>no upper limit</> },
      { label: "size", value: <>collapses to a point</> },
      { label: "held up by", value: <>nothing — gravity wins</> },
    ],
    summary: (
      <>
        From the most massive stars: when the core is too heavy for even neutron pressure, nothing stops the collapse. The
        mass falls toward a singularity, ringed by the event horizon — the boundary of no return (Part 2). Its giant cousins power active galaxies (§2.2).
      </>
    ),
  },
};

function remnantFor(mass: number): RemnantId {
  if (mass < WD_MAX) return "wd";
  if (mass < NS_MAX) return "ns";
  return "bh";
}

export function StellarForkPanel(): JSX.Element {
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const reduced = usePrefersReduced();
  const [mass, setMass] = useState(1.5); // a Sun-like star → white dwarf
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const selId = remnantFor(mass);
  const sel = REMNANTS[selId];

  /* Layout: a horizontal mass axis (log) with three labelled zones; a marker
     rides along it at the chosen mass, and the active zone lights up. */
  const W = 760;
  const H = 230;
  const axisY = 150;
  const x0 = 70;
  const x1 = W - 40;
  const logMin = Math.log10(MASS_MIN);
  const logMax = Math.log10(MASS_MAX);
  const xFor = (m: number) => x0 + ((Math.log10(m) - logMin) / (logMax - logMin)) * (x1 - x0);
  const markerX = xFor(mass);

  const zones: { id: RemnantId; from: number; to: number }[] = [
    { id: "wd", from: MASS_MIN, to: WD_MAX },
    { id: "ns", from: WD_MAX, to: NS_MAX },
    { id: "bh", from: NS_MAX, to: MASS_MAX },
  ];
  const ticks = [0.5, 1, 8, 20, 60];

  return (
    <FigurePanel
      idx="3.4.a"
      kicker="The fork in the road"
      caption={
        <>
          Drag the slider to set a star&rsquo;s birth mass and watch which dead core it leaves behind: below 8 M☉ a white
          dwarf, ~8–20 a neutron star, above ~20 a black hole. One furnace, three endings — fixed only by birth mass.
        </>
      }
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md" style={{ background: "rgb(var(--c-text-rgb) / 0.02)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* zone bands */}
          {zones.map((z) => {
            const zx0 = xFor(z.from);
            const zx1 = xFor(z.to);
            const r = REMNANTS[z.id];
            const isSel = z.id === selId;
            return (
              <g key={z.id}>
                <rect
                  x={zx0}
                  y={axisY - 26}
                  width={zx1 - zx0}
                  height={52}
                  rx={8}
                  fill={`${r.color}${isSel ? "33" : "12"}`}
                  stroke={`${r.color}${isSel ? "cc" : "44"}`}
                  strokeWidth={isSel ? 2 : 1}
                  style={{ transition: reduced ? "none" : "fill 220ms var(--ease), stroke 220ms var(--ease)" }}
                />
                <text
                  x={(zx0 + zx1) / 2}
                  y={axisY + 5}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="14"
                  fontWeight="600"
                  fill={isSel ? r.color : "rgb(var(--c-text-rgb) / 0.7)"}
                  style={{ transition: reduced ? "none" : "fill 220ms var(--ease)" }}
                >
                  {r.name}
                </text>
              </g>
            );
          })}

          {/* axis line + ticks */}
          <line x1={x0} y1={axisY + 44} x2={x1} y2={axisY + 44} stroke="rgb(var(--c-text-rgb) / 0.25)" strokeWidth={1} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={xFor(t)} y1={axisY + 40} x2={xFor(t)} y2={axisY + 48} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1} />
              <text x={xFor(t)} y={axisY + 64} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="rgb(var(--c-text-rgb) / 0.6)">
                {t}
              </text>
            </g>
          ))}
          <text x={x0} y={axisY - 44} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="rgb(var(--c-text-rgb) / 0.5)">
            birth mass (solar masses, M☉)
          </text>

          {/* moving star marker */}
          <g style={{ transition: reduced ? "none" : "transform 160ms var(--ease)", transform: `translateX(${markerX - W / 2}px)` }}>
            <circle cx={W / 2} cy={axisY - 70} r={13} fill={sel.color} style={{ filter: `drop-shadow(0 0 10px ${sel.color})` }} />
            <line x1={W / 2} y1={axisY - 57} x2={W / 2} y2={axisY + 26} stroke={sel.color} strokeWidth={2} strokeDasharray="3 3" />
            <text x={W / 2} y={axisY - 86} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="600" fill={sel.color}>
              {mass.toFixed(1)} M☉
            </text>
          </g>
        </svg>
      </div>

      {/* slider — FigureFrame's rule-2 keyboard target (←/→ scrub it) */}
      <div className="mt-4 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono uppercase tracking-[0.18em] text-[10px]" style={{ fontSize: sz(0.62), color: "rgb(var(--c-text-rgb) / 0.6)" }}>
          birth mass
        </span>
        <input
          type="range"
          min={MASS_MIN}
          max={MASS_MAX}
          step={0.1}
          value={mass}
          onChange={(e) => setMass(parseFloat(e.target.value))}
          className="flex-1 accent-plasma"
          aria-label="Star birth mass in solar masses"
        />
        <span className="font-mono text-plasma text-[12px] tabular-nums" style={{ fontSize: sz(0.74) }}>
          {mass.toFixed(1)} M☉
        </span>
      </div>

      {/* compact bottom strip — inline stat pairs + a short summary, so the
          mass-axis viz dominates and this stays a thin band in fullscreen */}
      <div
        className="mt-4 rounded-md p-3"
        style={{
          background: "rgb(var(--c-text-rgb) / 0.03)",
          border: `1px solid ${sel.color}66`,
          flexShrink: 0,
          transition: reduced ? "none" : "border-color 220ms var(--ease)",
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-sans">
          <div className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.7) ?? "11px", fontWeight: 600, color: sel.color }}>
            {sel.name}
          </div>
          {sel.stats.map((s) => (
            <div key={s.label}>
              <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(var(--c-text-rgb) / 0.6)" }}>
                {s.label}
              </span>{" "}
              <span style={{ fontSize: sz(0.92) ?? "14px", fontWeight: 500, color: "rgb(var(--c-text-rgb) / 0.9)" }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 leading-[1.5] font-sans" style={{ fontSize: sz(0.86) ?? "13.5px", minHeight: "3em", color: "rgb(var(--c-text-rgb) / 0.85)" }}>
          {sel.summary}
        </div>
      </div>
      <div className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-center" style={{ fontSize: sz(0.62), flexShrink: 0, color: "rgb(var(--c-text-rgb) / 0.55)" }}>
        drag the slider · ← / → to change the birth mass
      </div>
    </FigurePanel>
  );
}

/* ── Fig 3.4.b — black-hole anatomy & the Schwarzschild radius ─────────
   Scale the black hole's mass (in solar masses) and watch the event
   horizon grow. The horizon radius is the Schwarzschild radius,
   R_s = 2GM/c² ≈ 2.95 km per solar mass — so the Sun's would be ~3 km.
   The photon sphere (where light can orbit) sits at 1.5 R_s. Labels mark
   the singularity, horizon, and photon sphere. */

const KM_PER_MSUN = 2.95; // Schwarzschild radius per solar mass, km

export function BlackHolePanel(): JSX.Element {
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const reduced = usePrefersReduced();
  const [mass, setMass] = useState(10); // a typical stellar-mass black hole
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const rs = mass * KM_PER_MSUN; // event-horizon radius, km
  const photon = rs * 1.5; // photon sphere radius, km

  /* Drawing: the horizon is drawn at a FIXED on-screen radius (the diagram is
     schematic — every black hole looks the same shape, only the scale label
     changes), with the singularity at centre and the photon sphere outside.
     The viewBox is sized closer to square (less letterboxing) so the disc
     fills the tall left column of the fullscreen sidebar layout. */
  const W = 640;
  const H = 470;
  const cx = 250;
  const cy = H / 2;
  const rHorizon = 96;
  const rPhoton = rHorizon * 1.5;

  /* human-readable size string */
  const sizeStr =
    rs >= 1000 ? `${(rs / 1000).toFixed(1)} thousand km` : `${rs.toFixed(0)} km`;

  return (
    <FigurePanel
      idx="3.4.b"
      kicker="Anatomy of a black hole"
      caption={
        <>
          Drag the slider to scale a black hole&rsquo;s mass. Its event horizon — past which not even light escapes — has a
          radius (the Schwarzschild radius) of about 3 km per solar mass, so a Sun-mass hole would be just 3 km across. The
          photon sphere, where light can circle, sits at 1.5 times that radius.
        </>
      }
      sidebar
      rail={
        <>
          {/* slider — FigureFrame's rule-2 keyboard target */}
          <div className="mt-4 flex items-center gap-3" style={{ flexShrink: 0 }}>
            <span className="font-mono uppercase tracking-[0.18em] text-[10px]" style={{ fontSize: sz(0.62), color: "rgb(var(--c-text-rgb) / 0.6)" }}>
              mass
            </span>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={mass}
              onChange={(e) => setMass(parseFloat(e.target.value))}
              className="flex-1 accent-plasma"
              aria-label="Black hole mass in solar masses"
            />
            <span className="font-mono text-plasma text-[12px] tabular-nums" style={{ fontSize: sz(0.74) }}>
              {mass} M☉
            </span>
          </div>

          {/* readout — stacks vertically in the narrow right column */}
          <div
            className="mt-4 grid gap-3 rounded-md"
            style={{
              background: "rgb(var(--c-text-rgb) / 0.03)",
              border: "1px solid #f2a15466",
              padding: "14px 16px",
              flexShrink: 0,
            }}
          >
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ fontSize: sz(0.62), color: "rgb(var(--c-text-rgb) / 0.6)" }}>mass</div>
              <div className="font-mono text-[15px]" style={{ fontSize: sz(0.92), color: "rgb(var(--c-text-rgb) / 0.9)" }}>{mass} M☉</div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ fontSize: sz(0.62), color: "rgb(var(--c-text-rgb) / 0.6)" }}>horizon radius</div>
              <div className="font-mono text-[15px]" style={{ color: "#f2a154", fontSize: sz(0.92) }}>{sizeStr}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ fontSize: sz(0.62), color: "rgb(var(--c-text-rgb) / 0.6)" }}>the rule</div>
              <div className="font-sans text-[13px] leading-snug" style={{ fontSize: sz(0.82), color: "rgb(var(--c-text-rgb) / 0.85)" }}>
                <M t="R_s \approx 3\ \mathrm{km} \times M" /> &nbsp;(M in solar masses)
              </div>
            </div>
          </div>
          <div className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase" style={{ fontSize: sz(0.62), flexShrink: 0, color: "rgb(var(--c-text-rgb) / 0.55)" }}>
            drag the slider · ← / → to change the mass
          </div>
        </>
      }
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md" data-theme="dark" style={{ background: "#05060c" }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="block w-full h-full" style={{ width: "100%", height: "100%" }}>
          <defs>
            <radialGradient id="bh-glow" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="#000000" />
              <stop offset="78%" stopColor="#1a1024" />
              <stop offset="100%" stopColor="#3a1d0e" />
            </radialGradient>
          </defs>

          {/* photon sphere ring */}
          <circle cx={cx} cy={cy} r={rPhoton} fill="none" stroke="#f2a154" strokeWidth={1.5} strokeDasharray="4 5" opacity={0.8} />
          {/* faint glow just outside the horizon */}
          <circle cx={cx} cy={cy} r={rHorizon + 14} fill="url(#bh-glow)" opacity={0.9} />
          {/* event horizon — the black disk */}
          <circle cx={cx} cy={cy} r={rHorizon} fill="#000000" stroke="#f2a154" strokeWidth={2} />
          {/* singularity at the centre */}
          <circle cx={cx} cy={cy} r={3} fill="#ffffff" style={{ filter: "drop-shadow(0 0 6px #ffffff)" }} />

          {/* labels with leader lines */}
          {/* singularity */}
          <line x1={cx} y1={cy} x2={cx + 150} y2={cy} stroke="#ffffff" strokeWidth={1} opacity={0.4} />
          <text x={cx + 156} y={cy + 4} fontFamily="Inter, sans-serif" fontSize="14" fill="#ffffff">
            singularity
          </text>
          <text x={cx + 156} y={cy + 22} fontFamily="Inter, sans-serif" fontSize="11" fontStyle="italic" fill="#ffffff" opacity={0.6}>
            all the mass, a single point
          </text>

          {/* event horizon */}
          <line x1={cx} y1={cy - rHorizon} x2={cx + 150} y2={cy - rHorizon - 40} stroke="#f2a154" strokeWidth={1} opacity={0.6} />
          <text x={cx + 156} y={cy - rHorizon - 40} fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="#f2a154">
            event horizon
          </text>
          <text x={cx + 156} y={cy - rHorizon - 22} fontFamily="Inter, sans-serif" fontSize="11" fontStyle="italic" fill="#f2a154" opacity={0.85}>
            point of no return
          </text>

          {/* photon sphere */}
          <line x1={cx} y1={cy + rPhoton} x2={cx + 150} y2={cy + rPhoton + 30} stroke="#f2a154" strokeWidth={1} opacity={0.5} strokeDasharray="3 3" />
          <text x={cx + 156} y={cy + rPhoton + 34} fontFamily="Inter, sans-serif" fontSize="14" fill="#f2a154" opacity={0.9}>
            photon sphere
          </text>
          <text x={cx + 156} y={cy + rPhoton + 52} fontFamily="Inter, sans-serif" fontSize="11" fontStyle="italic" fill="#f2a154" opacity={0.6}>
            where light can orbit · 1.5 × R
          </text>
        </svg>
      </div>

      {/* off-screen keyboard hooks are unnecessary — the native range input
          (now in the rail) is FigureFrame's rule-2 target, so ←/→ already
          scrub it in both modes. */}
      <span style={srOnly} aria-hidden="true" />
    </FigurePanel>
  );
}
