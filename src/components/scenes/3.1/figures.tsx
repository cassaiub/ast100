import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import katex from "katex";

/* Shared figure shell — mirrors the chapter-0/1/2 pattern.
   `sidebar` opts a square/radial viz into the figure-left / caption-right
   fullscreen layout; `rail` (a sibling .fig-rail) lifts the controls/detail
   box into the right column above the caption (Tier 2 — see global.css). */
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

/* KaTeX inline snippet for HTML contexts (detail box, caption). The KaTeX
   CSS is loaded globally by BaseHead. */
function M({ t }: { t: string }): JSX.Element {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(t, { throwOnError: false }) }} />;
}

/* Tracks whether the enclosing FigureFrame is fullscreen (`.is-fs`) — the
   shared MutationObserver pattern — so the HTML detail panel can scale its
   text with the figure. */
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

/* Off-screen but real <button>s for FigureFrame's keyboard navigator —
   it drives shortcuts via `.click()`, which SVG elements don't implement. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

function usePrefersReducedMotion() {
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

/* ── 3.1.a — Annotated cutaway of the Sun ───────────────────────────
   A 90° quarter cross-section, centre at the bottom-left corner, six
   nested layers from the fusion core out to the corona.

   Labelling follows the annotated-diagram standard (1.1.a): every layer
   name lives in its OWN reserved slot down the right side, joined to its
   band by a single leader. The slots are ordered outer→inner (corona at
   the top, core at the bottom) to MATCH the order of the leader anchors
   along the wedge — so the leaders fan out monotonically and can never
   cross, at any size.

   The viz panel is always dark (`data-theme="dark"`) with a SOLID dark
   background so the light label text reads in BOTH page themes. Click a
   band or its name — or use the arrow keys. In fullscreen the figure
   takes the full-height LEFT column and the detail box + caption sit in
   the RIGHT sidebar (FigurePanel `sidebar` + `rail`). */

type LayerId = "core" | "radiative" | "convective" | "photosphere" | "chromosphere" | "corona";
type Layer = {
  id: LayerId;
  name: string;
  /** outer / inner radius as a fraction of the photospheric radius (=1) */
  rOut: number;
  rIn: number;
  /** ray angle (deg, from the +x axis) at which the leader anchors on the band */
  ang: number;
  color: string;
  temp: string;
  thickness: string;
  /** ≤ ~150 chars, constant line count → the detail box never resizes */
  what: ReactNode;
};

/* radii as fractions of the photospheric radius (696,000 km). The three
   thin atmosphere layers are drawn thicker than scale so they stay
   clickable (noted in the caption). Anchor angles climb core→corona so
   the leader dots fan up the wedge in step with the label slots. */
const LAYERS: Layer[] = [
  { id: "core",         name: "Core",            rIn: 0,    rOut: 0.25, ang: 18, color: "#fcd34d",
    temp: "≈ 15 million K", thickness: "inner 25% of the radius (~174,000 km)",
    what: <>The fusion furnace. Hydrogen nuclei fuse into helium here, releasing the energy that powers the whole star. Half the Sun's mass is packed into this small ball.</> },
  { id: "radiative",    name: "Radiative zone",  rIn: 0.25, rOut: 0.70, ang: 30, color: "#fb923c",
    temp: "7 million → 2 million K", thickness: "~313,000 km thick",
    what: <>So dense that energy crawls outward as light, bouncing between tightly packed particles. A single packet can take tens of thousands of years to cross it.</> },
  { id: "convective",   name: "Convective zone", rIn: 0.70, rOut: 1.0,  ang: 43, color: "#f97316",
    temp: "2 million → 5,800 K", thickness: "~209,000 km thick",
    what: <>Cooler plasma that physically churns: hot gas rises, sheds heat at the surface, cools and sinks — a rolling boil that carries energy the last stretch out.</> },
  { id: "photosphere",  name: "Photosphere",     rIn: 1.0,  rOut: 1.07, ang: 56, color: "#fde68a",
    temp: "≈ 5,800 K", thickness: "~500 km — a thin skin",
    what: <>The visible surface, where light finally escapes into space. This is the glowing disk we see and the layer that warms the Earth, 150 million km away.</> },
  { id: "chromosphere", name: "Chromosphere",    rIn: 1.07, rOut: 1.15, ang: 67, color: "#f87171",
    temp: "5,800 → 20,000 K", thickness: "~2,000 km thick",
    what: <>A thin reddish layer of the lower atmosphere. Hidden by the photosphere's glare except for a brief flash at the start of a total solar eclipse.</> },
  { id: "corona",       name: "Corona",          rIn: 1.15, rOut: 1.34, ang: 78, color: "#bfdbfe",
    temp: "1–3 million K", thickness: "extends millions of km outward",
    what: <>The faint, blisteringly hot outer atmosphere — far hotter than the surface below it, a puzzle still studied. Its streamers appear during a total eclipse.</> },
];

const LAYER_ORDER: LayerId[] = ["core", "radiative", "convective", "photosphere", "chromosphere", "corona"];

export function SunStructurePanel(): JSX.Element {
  const [selId, setSelId] = useState<LayerId>("core");
  const sel = LAYERS.find((l) => l.id === selId)!;
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const step = (dir: -1 | 1) => {
    const i = LAYER_ORDER.indexOf(selId);
    setSelId(LAYER_ORDER[Math.max(0, Math.min(LAYER_ORDER.length - 1, i + dir))]);
  };

  /* ── reserved-slot layout grid (viewBox units) ─────────────────────
     Wedge centre at (cx, cyB) bottom-left; radius 1.0 = R px. The wedge
     box (≤ 1.34 R) lives in the left ~58%; the label column owns the
     right. Six label slots, evenly spaced, ordered outer→inner. */
  const cx = 58;
  const cyB = 662;
  const R = 360;
  const VBW = 904;
  const VBH = 724;
  const LEAD_X = 538;          // leaders terminate here, just left of the labels
  const LABEL_X = 552;
  const SLOT0 = 96, SLOTH = 108;             // first slot Y, slot pitch
  const slotY = (i: number) => SLOT0 + i * SLOTH;
  /* labels run top→bottom outermost→innermost */
  const LABELS = [...LAYERS].reverse();

  const rad = (d: number) => (d * Math.PI) / 180;
  /* a quarter-annulus path from angle 0 (right) to 90 (up). */
  const arcPath = (rIn: number, rOut: number) => {
    const ro = rOut * R;
    const ri = rIn * R;
    const p2 = `${cx} ${cyB - ro}`;
    if (ri === 0) {
      return `M ${cx} ${cyB} L ${cx + ro} ${cyB} A ${ro} ${ro} 0 0 0 ${p2} Z`;
    }
    return `M ${cx + ro} ${cyB} A ${ro} ${ro} 0 0 0 ${p2} L ${cx} ${cyB - ri} A ${ri} ${ri} 0 0 1 ${cx + ri} ${cyB} Z`;
  };

  const railDetail = (
    <div
      className="rounded-md mt-3"
      style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "13px 15px",
        transition: "border-color 220ms var(--ease)",
        flexShrink: 0,
      }}
    >
      <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.74) ?? "12.5px" }}>
        {sel.name}
      </div>
      <div className="font-mono mt-1" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
        {sel.temp} · {sel.thickness}
      </div>
      <div
        className="font-sans leading-[1.55] mt-2"
        style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "6.2em" }}
      >
        {sel.what}
      </div>
    </div>
  );

  return (
    <FigurePanel
      idx="3.1.a"
      kicker="A cutaway of the Sun"
      sidebar
      rail={railDetail}
      caption={
        <>
          A 90° cutaway of the Sun, from the fusion <em>core</em> out to the wispy <em>corona</em>. Click a layer — or use
          the arrow keys — to read its temperature, thickness, and how it ferries energy outward. Temperature plunges from
          15 million K in the core to 5,800 K at the surface (then the corona flares hot again). The three thin outer
          layers are drawn thicker than scale so they stay clickable.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full"
        style={{
          background: "radial-gradient(circle at 26% 84%, #1d1407 0%, #0c0a10 58%, #08070b 100%)",
          borderRadius: 8,
          padding: "10px",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
        data-theme="dark"
      >
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Cutaway wedge of the Sun showing six layers from core to corona, each labelled down the right side"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            <radialGradient id="sun-core-glow" cx="0" cy="1" r="1" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="#fff7e0" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#fcd34d" stopOpacity="0.35" />
              <stop offset="1" stopColor="#fcd34d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* layer bands — outermost first so inner ones paint on top */}
          {[...LAYERS].reverse().map((l) => {
            const isSel = selId === l.id;
            return (
              <path
                key={l.id}
                d={arcPath(l.rIn, l.rOut)}
                fill={l.color}
                opacity={isSel ? 1 : 0.5}
                stroke={isSel ? "#ffffff" : "rgb(0 0 0 / 0.28)"}
                strokeWidth={isSel ? 2.5 : 1}
                style={{ cursor: "pointer", transition: "opacity 220ms var(--ease)" }}
                onClick={() => setSelId(l.id)}
              />
            );
          })}
          {/* soft furnace glow at the centre (decorative, low opacity) */}
          <path d={arcPath(0, 0.55)} fill="url(#sun-core-glow)" pointerEvents="none" />

          {/* leaders + reserved-slot labels (drawn on top of the bands) */}
          {LABELS.map((l, i) => {
            const isSel = selId === l.id;
            const rMid = ((l.rIn + l.rOut) / 2) * R;
            const ax = cx + rMid * Math.cos(rad(l.ang));
            const ay = cyB - rMid * Math.sin(rad(l.ang));
            const ly = slotY(i);
            return (
              <g key={`lab-${l.id}`} style={{ cursor: "pointer" }} onClick={() => setSelId(l.id)}>
                {/* generous transparent hit target over the whole slot */}
                <rect x={LEAD_X - 6} y={ly - 30} width={VBW - LEAD_X - 4} height={SLOTH - 8} fill="transparent" />
                <line
                  x1={ax} y1={ay} x2={LEAD_X} y2={ly - 7}
                  stroke={isSel ? l.color : "rgb(var(--c-text-rgb) / 0.34)"}
                  strokeWidth={isSel ? 2 : 1}
                />
                <circle
                  cx={ax} cy={ay} r={isSel ? 6 : 4}
                  fill={l.color} stroke="#0b0d14" strokeWidth={isSel ? 1.6 : 1}
                />
                <text
                  x={LABEL_X} y={ly} fontFamily="Inter, sans-serif" fontSize={23}
                  fontWeight={isSel ? 700 : 500}
                  fill={isSel ? l.color : "rgb(var(--c-text-rgb) / 0.9)"}
                >
                  {l.name}
                </text>
                <text
                  x={LABEL_X} y={ly + 26} fontFamily="JetBrains Mono, monospace" fontSize={15}
                  fill="rgb(var(--c-text-rgb) / 0.6)"
                >
                  {l.temp}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* keyboard: ←/→ + ↑/↓ both walk core↔corona; 1–6 jump direct */}
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {LAYER_ORDER.map((id, i) => (
          <button
            key={id} type="button" onClick={() => setSelId(id)} data-shortcut={String(i + 1)}
            className={selId === id ? "is-active" : ""} aria-pressed={selId === id}
          >
            {LAYERS.find((l) => l.id === id)!.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 3.1.b — The proton–proton chain stepper ────────────────────────
   Four reading-order stages of the dominant fusion chain in the Sun.
   ←/→ advance. Net result: 4 protons → 1 helium-4 + 2 positrons +
   2 neutrinos + energy. Honest about the intermediate steps. Each
   stage shows a tidy schematic of the nuclei involved.

   reduced-motion: stages switch instantly, no continuous animation. */

type ChainStage = {
  badge: string;
  title: string;
  eq: string;        // KaTeX
  body: ReactNode;
};

const CHAIN: ChainStage[] = [
  {
    badge: "STEP 1",
    title: "Two protons meet",
    eq: "p + p \\rightarrow {}^{2}\\mathrm{H} + e^{+} + \\nu",
    body: <>Two protons (hydrogen nuclei) collide hard enough to stick. One turns into a neutron, releasing a <strong>positron</strong> (the electron's antimatter twin) and a <strong>neutrino</strong> (a near-weightless ghost particle). The pair becomes <strong>deuterium</strong>, a heavy form of hydrogen.</>,
  },
  {
    badge: "STEP 2",
    title: "Deuterium grabs a proton",
    eq: "{}^{2}\\mathrm{H} + p \\rightarrow {}^{3}\\mathrm{He} + \\gamma",
    body: <>The deuterium quickly captures another proton to form <strong>helium-3</strong> (a light helium nucleus with two protons and one neutron). The collision releases a burst of light, a high-energy photon (γ).</>,
  },
  {
    badge: "STEP 3",
    title: "Two helium-3 nuclei fuse",
    eq: "{}^{3}\\mathrm{He} + {}^{3}\\mathrm{He} \\rightarrow {}^{4}\\mathrm{He} + p + p",
    body: <>Two helium-3 nuclei (each built by steps 1–2) meet and fuse into <strong>helium-4</strong>, the stable, common form of helium. Two protons are spat back out, free to start the chain over again.</>,
  },
  {
    badge: "NET",
    title: "4 hydrogen → 1 helium + energy",
    eq: "4\\,p \\rightarrow {}^{4}\\mathrm{He} + 2e^{+} + 2\\nu + \\text{energy}",
    body: <>Tally it up: four protons have become one helium-4 nucleus. The helium weighs slightly <em>less</em> than the four protons did — and that missing 0.7% of mass left as pure energy, via E = mc². This is why the Sun shines.</>,
  },
];

/* small schematic of the nuclei at each stage (purely illustrative). */
function nucleus(cx: number, cy: number, label: string, color: string, r = 18): JSX.Element {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.9} stroke="#ffffff" strokeWidth={1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight={700}
        fontFamily="Inter, sans-serif" fill="#0b0d14">{label}</text>
    </g>
  );
}

export function FusionChainPanel(): JSX.Element {
  const [stage, setStage] = useState(0);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const reduced = usePrefersReducedMotion();
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setStage((s) => Math.max(0, Math.min(CHAIN.length - 1, s + d)));
  const cur = CHAIN[stage];

  const W = 760;
  const H = 240;
  const P = "#e5536b";   // proton — red
  const N = "#60a5fa";   // neutron-bearing / deuterium — blue
  const HE = "#fbbf24";  // helium — amber
  const trans = reduced ? "none" : "opacity 300ms var(--ease)";

  /* per-stage schematic */
  const scene = (s: number): JSX.Element => {
    const midY = 80;
    if (s === 0) return (
      <g>
        {nucleus(180, midY, "p", P)}{nucleus(250, midY, "p", P)}
        <text x={310} y={midY + 5} textAnchor="middle" fontSize="26" fill="rgb(var(--c-text-rgb) / 0.6)">→</text>
        {nucleus(400, midY, "²H", N, 22)}
        <text x={500} y={midY - 6} textAnchor="middle" fontSize="14" fill={P} fontFamily="JetBrains Mono, monospace">+ e⁺</text>
        <text x={500} y={midY + 18} textAnchor="middle" fontSize="14" fill="#a78bda" fontFamily="JetBrains Mono, monospace">+ ν</text>
      </g>
    );
    if (s === 1) return (
      <g>
        {nucleus(190, midY, "²H", N, 22)}{nucleus(260, midY, "p", P)}
        <text x={320} y={midY + 5} textAnchor="middle" fontSize="26" fill="rgb(var(--c-text-rgb) / 0.6)">→</text>
        {nucleus(420, midY, "³He", HE, 24)}
        <text x={520} y={midY + 5} textAnchor="middle" fontSize="16" fill="rgb(var(--c-text-rgb) / 0.85)" fontStyle="italic" fontFamily="var(--font-serif)">+ γ</text>
      </g>
    );
    if (s === 2) return (
      <g>
        {nucleus(170, midY, "³He", HE, 24)}{nucleus(250, midY, "³He", HE, 24)}
        <text x={320} y={midY + 5} textAnchor="middle" fontSize="26" fill="rgb(var(--c-text-rgb) / 0.6)">→</text>
        {nucleus(430, midY, "⁴He", HE, 28)}
        <text x={540} y={midY - 6} textAnchor="middle" fontSize="14" fill={P} fontFamily="JetBrains Mono, monospace">+ p</text>
        <text x={540} y={midY + 18} textAnchor="middle" fontSize="14" fill={P} fontFamily="JetBrains Mono, monospace">+ p</text>
      </g>
    );
    return (
      <g>
        {[0, 1, 2, 3].map((i) => nucleus(140 + i * 56, midY, "p", P, 16))}
        <text x={400} y={midY + 5} textAnchor="middle" fontSize="26" fill="rgb(var(--c-text-rgb) / 0.6)">→</text>
        {nucleus(490, midY, "⁴He", HE, 30)}
        <text x={600} y={midY + 5} textAnchor="middle" fontSize="18" fill="var(--c-solar)" fontFamily="JetBrains Mono, monospace">+ energy</text>
      </g>
    );
  };

  return (
    <FigurePanel
      idx="3.1.b"
      kicker="The proton–proton chain"
      caption={
        <>
          The fusion chain that lights the Sun, one step at a time — step through it with the arrow keys. Four hydrogen
          nuclei (protons) are welded into one helium-4 nucleus, shedding two positrons, two neutrinos, and a flood of
          light. The helium weighs about 0.7% less than the four protons did; that lost mass became energy via{" "}
          <M t="E = mc^2" />.
        </>
      }
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md" data-theme="dark"
        style={{ background: "radial-gradient(circle at 50% 42%, #14131e 0%, #0a0910 70%, #08070d 100%)", border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img"
          aria-label={`Proton-proton chain, ${cur.title}`}>
          <text x={24} y={36} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {cur.badge}
          </text>
          <text x={W - 24} y={36} textAnchor="end" fontSize="13" letterSpacing="1.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            step {stage + 1} of {CHAIN.length}
          </text>
          <g style={{ opacity: 1, transition: trans }} key={stage}>{scene(stage)}</g>
          {/* legend */}
          <g fontFamily="JetBrains Mono, monospace" fontSize="12" fill="rgb(var(--c-text-rgb) / 0.6)">
            <circle cx={40} cy={200} r={7} fill={P} /><text x={54} y={205}>proton (hydrogen)</text>
            <circle cx={230} cy={200} r={7} fill={N} /><text x={244} y={205}>deuterium (heavy H)</text>
            <circle cx={470} cy={200} r={7} fill={HE} /><text x={484} y={205}>helium</text>
          </g>
        </svg>
      </div>

      {/* equation + narration — sibling of .fig-viz, constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          {cur.badge} · {cur.title}
        </div>
        <div className="mt-2" style={{ fontSize: sz(1.05) ?? "1.05rem" }}>
          <M t={cur.eq} />
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "5.4em" }}>
          {cur.body}
        </div>
      </div>

      {/* visible stage pills */}
      <div className="mt-3 flex gap-1.5 items-center" style={{ flexShrink: 0 }}>
        {CHAIN.map((c, n) => (
          <button key={n} type="button" onClick={() => setStage(n)} aria-pressed={stage === n}
            className="rounded-full font-mono" style={{
              width: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              height: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              fontSize: sz(0.56) ?? "10px",
              color: stage === n ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.6)",
              background: stage === n ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
            }}>{n + 1}</button>
        ))}
        <span className="font-mono ml-2" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>← / → step through the chain</span>
      </div>

      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
    </FigurePanel>
  );
}
