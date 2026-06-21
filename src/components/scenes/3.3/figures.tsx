import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import katex from "katex";

function FigurePanel({ idx, kicker, caption, children, fitFs }: { idx: string; kicker: string; caption: ReactNode; children: ReactNode; fitFs?: boolean }) {
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

/* KaTeX inline snippet for HTML contexts (detail box, caption) — real
   typeset math instead of Unicode superscripts. KaTeX CSS is global. */
function M({ t }: { t: string }): JSX.Element {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(t, { throwOnError: false }) }} />;
}

/* Tracks whether the enclosing FigureFrame is fullscreen (`.is-fs`) so the
   HTML control/detail panels can scale their text with the figure. */
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

function useReduced() {
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

/* Off-screen real <button>s for FigureFrame's keyboard navigator — it drives
   shortcuts via `.click()`, which SVG elements don't implement. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ── 3.3.a · How a star is born — four collapse stages ──────────────────
   A cold cloud collapses, fragments, spins up a protostar in a disk, and
   ignites when the core hits ~10 million K. Step with ← / → or the pills.
   Each stage carries one real physical condition. Reduced-motion safe:
   the schematic is redrawn per stage with no continuous animation. */

type BirthStage = {
  badge: string;
  title: string;
  size: string;
  temp: string;
  body: string;
};
const BIRTH: BirthStage[] = [
  {
    badge: "1 · CLOUD",
    title: "Giant molecular cloud",
    size: "≈ 250 light-years across",
    temp: "≈ 10 K (−263 °C)",
    body: "A cold, dark cloud of hydrogen gas and dust drifts between the stars. Where its own gravity overpowers the gentle outward push of gas pressure, it begins to collapse.",
  },
  {
    badge: "2 · FRAGMENT",
    title: "Collapsing fragment",
    size: "≈ half a light-year across",
    temp: "warming as it falls inward",
    body: "The cloud breaks into denser clumps. One fragment keeps shrinking; as gas falls inward, gravitational energy turns into heat and the core warms up.",
  },
  {
    badge: "3 · PROTOSTAR",
    title: "Protostar in a spinning disk",
    size: "disk a few hundred AU wide",
    temp: "core ≈ 1 million K, not yet fusing",
    body: "Spin flattens the leftover gas into a disk feeding a hot central protostar. In this stormy T-Tauri phase it fires jets from its poles — but the core is still too cool to fuse.",
  },
  {
    badge: "4 · IGNITION",
    title: "A new main-sequence star",
    size: "Sun-sized",
    temp: "core ≈ 10 million K",
    body: "Once the core reaches about 10 million degrees, hydrogen fusion switches on. Its outward push finally balances gravity's inward pull — a stable star is born.",
  },
];

export function StarBirthPanel(): JSX.Element {
  const [stage, setStage] = useState(0); // 0..3
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const reduced = useReduced();
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const N = BIRTH.length;
  const step = (d: -1 | 1) => setStage((s) => Math.max(0, Math.min(N - 1, s + d)));
  const cur = BIRTH[stage];

  const W = 760;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const trans = reduced ? "none" : "all 500ms var(--ease)";

  /* A few scattered dust grains, deterministic so they don't reshuffle. */
  const grains = Array.from({ length: 46 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = 30 + (i % 11) * 11;
    return { x: cx + Math.cos(a) * r * (i % 2 ? 1.6 : 1), y: cy + Math.sin(a) * r };
  });

  return (
    <FigurePanel
      idx="3.3.a"
      kicker="How a star is born"
      caption="Step with ← / → (or the 1–4 buttons) through a star's birth: a cold hydrogen cloud collapses, fragments, spins up a hot protostar in a disk, and ignites at ~10 million K. Fusion's outward push then balances gravity — a stable star."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md" style={{ background: "rgb(var(--c-text-rgb) / 0.02)", border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <defs>
            <radialGradient id="cloudG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(var(--c-accent-rgb) / 0.30)" />
              <stop offset="100%" stopColor="rgb(var(--c-accent-rgb) / 0)" />
            </radialGradient>
            <radialGradient id="coreG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(var(--c-solar-rgb) / 0.95)" />
              <stop offset="60%" stopColor="rgb(var(--c-solar-rgb) / 0.45)" />
              <stop offset="100%" stopColor="rgb(var(--c-solar-rgb) / 0)" />
            </radialGradient>
          </defs>

          {/* Stage 1: diffuse cloud + scattered grains */}
          <g style={{ opacity: stage === 0 ? 1 : 0.18, transition: trans }}>
            <ellipse cx={cx} cy={cy} rx={300} ry={120} fill="url(#cloudG)" />
            {grains.map((g, i) => (
              <circle key={i} cx={g.x} cy={g.y} r={1.6} fill="rgb(var(--c-text-rgb) / 0.45)" />
            ))}
          </g>

          {/* Stage 2: a denser shrunken clump */}
          <circle cx={cx} cy={cy} r={stage >= 1 ? (stage === 1 ? 92 : 60) : 150}
            fill="rgb(var(--c-accent-rgb) / 0.16)" stroke="rgb(var(--c-accent-rgb) / 0.4)" strokeWidth={1.5}
            style={{ opacity: stage >= 1 ? 1 : 0, transition: trans }} />

          {/* Stage 3: accretion disk (ellipse seen at an angle) + bipolar jets */}
          <g style={{ opacity: stage >= 2 ? 1 : 0, transition: trans }}>
            <ellipse cx={cx} cy={cy} rx={150} ry={34} fill="none" stroke="rgb(var(--c-accent-rgb) / 0.55)" strokeWidth={2} />
            <ellipse cx={cx} cy={cy} rx={110} ry={24} fill="none" stroke="rgb(var(--c-accent-rgb) / 0.4)" strokeWidth={1.5} />
            {stage === 2 && (
              <g stroke="rgb(var(--c-plasma-rgb) / 0.7)" strokeWidth={3} strokeLinecap="round">
                <line x1={cx} y1={cy} x2={cx} y2={cy - 96} />
                <line x1={cx} y1={cy} x2={cx} y2={cy + 96} />
              </g>
            )}
          </g>

          {/* Central body — grows hot and bright at ignition */}
          <circle cx={cx} cy={cy} r={stage === 3 ? 120 : 56} fill="url(#coreG)"
            style={{ opacity: stage >= 2 ? 1 : 0, transition: trans }} />
          <circle cx={cx} cy={cy} r={stage === 3 ? 30 : 16}
            fill={stage === 3 ? "rgb(var(--c-solar-rgb))" : "rgb(var(--c-accent-rgb) / 0.85)"}
            style={{ transition: trans, filter: stage === 3 ? "drop-shadow(0 0 22px rgb(var(--c-solar-rgb) / 0.9))" : "none", opacity: stage >= 1 ? 1 : 0 }} />

          {/* Stage badge */}
          <text x={24} y={34} fontSize="14" letterSpacing="3" fontFamily="var(--font-mono)"
            fill={stage === 3 ? "var(--c-solar)" : "rgb(var(--c-accent-rgb))"}>{cur.badge}</text>
        </svg>
      </div>

      {/* Stage rail — name-only pills feeding the shared detail box below. */}
      <div className="mt-4 flex gap-2 flex-wrap" style={{ flexShrink: 0 }}>
        {BIRTH.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStage(i)}
            data-shortcut={String(i + 1)}
            aria-pressed={stage === i}
            className={`pill rounded-full px-3 py-1 font-mono uppercase tracking-[0.18em]${stage === i ? " is-active" : ""}`}
            style={{
              fontSize: sz(0.62) ?? "10px",
              color: stage === i ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.6)",
              background: stage === i ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
            }}
          >
            {s.badge}
          </button>
        ))}
      </div>

      {/* Compact horizontal detail strip — stat pairs in one row, short body. */}
      <div
        className="mt-4 rounded-md p-3"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.05)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.2)",
          flexShrink: 0,
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-sans">
          <div className="font-mono uppercase tracking-[0.16em]" style={{ color: stage === 3 ? "var(--c-solar)" : "rgb(var(--c-accent-rgb))", fontSize: sz(0.66) ?? "10px" }}>
            {cur.title}
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ color: "rgb(var(--c-text-rgb) / 0.55)", fontSize: sz(0.6) ?? "10px" }}>size</span>{" "}
            <span style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.9) ?? "13px", fontWeight: 500 }}>{cur.size}</span>
          </div>
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ color: "rgb(var(--c-text-rgb) / 0.55)", fontSize: sz(0.6) ?? "10px" }}>core temp</span>{" "}
            <span style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.9) ?? "13px", fontWeight: 500 }}>{cur.temp}</span>
          </div>
        </div>
        <div className="mt-2 leading-[1.5] font-sans" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.82) ?? "13px", minHeight: "3em" }}>{cur.body}</div>
      </div>

      {/* Off-screen keyboard hooks. */}
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly}>previous stage</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly}>next stage</button>
    </FigurePanel>
  );
}

/* ── 3.3.b · Star in a Box — a whole stellar life, set by its mass ───────
   Modelled on LCO's "Star in a Box" (starinabox.net). Pick a MASS; a
   marker traces that star's evolutionary track across the H–R diagram as
   it ages, while the star's own disk (size ∝ radius, colour ∝ temperature)
   and the live stats update. Drag or ← / → to scrub the AGE; ↑ / ↓ or the
   1–6 buttons pick the mass; Play auto-advances the life. Mass alone
   decides the path — and whether the star ends a white dwarf, a neutron
   star, or a black hole.

   Track values are real, verified against stellar-evolution references
   (RGB tip ≈ 2300 L☉ / 170 R☉, etc.); supernova-peak luminosities and
   remnant radii are order-of-magnitude teaching figures. The main
   sequence fills most of each life (ageFrac 0 → ~0.85+), so the marker
   dwells there then sprints through the late stages. Reduced-motion: no
   auto-play; scrub only. The viz is always-dark (solid bg + data-theme)
   so it reads in both themes; landscape → default fullscreen + a compact
   bottom strip, so the figure dominates fullscreen (see /figures). */

type EvoStage = { name: string; ageFrac: number; tempK: number; lum: number; radiusSun: number; note: string };
type StarTrack = {
  mass: number;
  pill: string;
  lifetimeYr: number;
  fate: string;
  fateColor: string;
  stages: EvoStage[];
};

const TRACKS: StarTrack[] = [
  {
    mass: 0.5, pill: "0.5 M☉", lifetimeYr: 8e10, fate: "white dwarf", fateColor: "#bcd2ff",
    stages: [
      { name: "Main sequence", ageFrac: 0, tempK: 3800, lum: 0.04, radiusSun: 0.5, note: "A cool, dim red dwarf, fusing hydrogen so slowly it will outlive the present Universe many times over." },
      { name: "Main sequence (still burning)", ageFrac: 0.7, tempK: 4000, lum: 0.06, radiusSun: 0.55, note: "It brightens only a sliver over billions of years. No red dwarf has ever died — the Universe is far too young." },
      { name: "Slow contraction (theory only)", ageFrac: 0.95, tempK: 6000, lum: 0.1, radiusSun: 0.3, note: "Far in the future, hydrogen nearly spent, it is predicted to warm and shrink — but it never becomes a red giant." },
      { name: "Helium white dwarf", ageFrac: 1, tempK: 30000, lum: 0.001, radiusSun: 0.02, note: "Finally an Earth-sized helium ember, left to cool forever. No star this small has reached this stage yet." },
    ],
  },
  {
    mass: 1, pill: "1 M☉ · Sun", lifetimeYr: 1e10, fate: "white dwarf", fateColor: "#bcd2ff",
    stages: [
      { name: "Main sequence", ageFrac: 0, tempK: 5772, lum: 1, radiusSun: 1, note: "Today's Sun: steadily fusing hydrogen into helium in its core, in perfect balance, for about ten billion years." },
      { name: "Subgiant", ageFrac: 0.9, tempK: 5300, lum: 3, radiusSun: 2, note: "Core hydrogen is spent. Fusion shifts to a shell around the core, and the star slowly begins to swell and cool." },
      { name: "Red giant", ageFrac: 0.97, tempK: 3500, lum: 2300, radiusSun: 170, note: "Bloated to ~170× its old size and glowing red — large enough to swallow Mercury, Venus, and perhaps the Earth." },
      { name: "Helium burning", ageFrac: 0.985, tempK: 4800, lum: 50, radiusSun: 10, note: "Helium ignites in the core; the star shrinks and steadies, fusing helium into carbon and oxygen for a calmer spell." },
      { name: "Red giant again (AGB)", ageFrac: 0.995, tempK: 3000, lum: 3000, radiusSun: 200, note: "It swells a final time, brighter than ever, and begins shedding its outer layers into space." },
      { name: "Planetary nebula", ageFrac: 0.999, tempK: 100000, lum: 1000, radiusSun: 0.3, note: "The exposed, blazing-hot core lights up the cast-off gas as a glowing shell about a light-year wide." },
      { name: "White dwarf", ageFrac: 1, tempK: 100000, lum: 0.01, radiusSun: 0.013, note: "Only the bare core remains: an Earth-sized carbon–oxygen ember near 100,000 K, cooling forever." },
    ],
  },
  {
    mass: 2, pill: "2 M☉", lifetimeYr: 1.2e9, fate: "white dwarf", fateColor: "#bcd2ff",
    stages: [
      { name: "Main sequence", ageFrac: 0, tempK: 8800, lum: 16, radiusSun: 1.6, note: "A hot white A-type star, burning hydrogen ~ten times faster than the Sun — so it lives only about a billion years." },
      { name: "Subgiant", ageFrac: 0.9, tempK: 6500, lum: 30, radiusSun: 5, note: "Core hydrogen spent, the star cools and expands toward the giant region of the diagram." },
      { name: "Red giant", ageFrac: 0.95, tempK: 4000, lum: 700, radiusSun: 50, note: "A cool, luminous giant fed by a hydrogen-burning shell around its contracting core." },
      { name: "Helium burning", ageFrac: 0.98, tempK: 4800, lum: 60, radiusSun: 11, note: "Helium fuses smoothly in the core (no sudden flash at this mass), steadying the star for a while." },
      { name: "Red giant again (AGB)", ageFrac: 0.995, tempK: 3200, lum: 4000, radiusSun: 200, note: "It pulses and swells, blowing its envelope away in a strong stellar wind." },
      { name: "Planetary nebula", ageFrac: 0.999, tempK: 120000, lum: 2000, radiusSun: 0.3, note: "The hot bare core lights up the ejected gas as a planetary nebula." },
      { name: "White dwarf", ageFrac: 1, tempK: 110000, lum: 0.02, radiusSun: 0.012, note: "A slightly heavier carbon–oxygen white dwarf, about 0.7 M☉, left to cool." },
    ],
  },
  {
    mass: 8, pill: "8 M☉", lifetimeYr: 4e7, fate: "neutron star *", fateColor: "#7fe0d0",
    stages: [
      { name: "Main sequence", ageFrac: 0, tempK: 22000, lum: 2000, radiusSun: 3.5, note: "A hot blue B-type star that burns through its fuel in only tens of millions of years." },
      { name: "Giant transition", ageFrac: 0.9, tempK: 9000, lum: 4000, radiusSun: 30, note: "Leaving the main sequence, it races rightward across the diagram as it swells and cools." },
      { name: "Red supergiant", ageFrac: 0.98, tempK: 3500, lum: 10000, radiusSun: 400, note: "A vast, cool supergiant fusing ever-heavier elements in onion-like shells around its core." },
      { name: "Supernova", ageFrac: 0.999, tempK: 3500, lum: 1e9, radiusSun: 400, note: "Right on the boundary: it most likely ends in a supernova — though a heavy white dwarf is just possible." },
      { name: "Neutron star *", ageFrac: 1, tempK: 1e6, lum: 0.001, radiusSun: 0.00002, note: "A city-sized ball heavier than the Sun. The * marks real uncertainty: ~8 M☉ sits right on the white-dwarf / supernova line." },
    ],
  },
  {
    mass: 15, pill: "15 M☉", lifetimeYr: 1.2e7, fate: "neutron star", fateColor: "#7fe0d0",
    stages: [
      { name: "Main sequence", ageFrac: 0, tempK: 28000, lum: 20000, radiusSun: 6, note: "A blazing blue star, living fast and bright for only about twelve million years." },
      { name: "Blue supergiant", ageFrac: 0.9, tempK: 20000, lum: 60000, radiusSun: 25, note: "After the main sequence it swells and brightens, still blue-hot." },
      { name: "Red supergiant", ageFrac: 0.98, tempK: 3600, lum: 100000, radiusSun: 700, note: "A Betelgeuse-like giant — cool-surfaced but enormously luminous, fusing all the way up to an iron core." },
      { name: "Supernova", ageFrac: 0.999, tempK: 3600, lum: 1e9, radiusSun: 700, note: "The iron core collapses and rebounds as a Type II supernova, briefly outshining its whole galaxy." },
      { name: "Neutron star", ageFrac: 1, tempK: 1e6, lum: 0.001, radiusSun: 0.00002, note: "A spinning ball only ~20 km across, so dense a sugar-cube of it would weigh about a billion tonnes." },
    ],
  },
  {
    mass: 30, pill: "30 M☉", lifetimeYr: 6e6, fate: "black hole", fateColor: "#b9a8ff",
    stages: [
      { name: "Main sequence", ageFrac: 0, tempK: 40000, lum: 150000, radiusSun: 9, note: "An extreme blue O-type star with fierce winds, living a mere few million years." },
      { name: "Blue supergiant", ageFrac: 0.85, tempK: 20000, lum: 300000, radiusSun: 40, note: "It expands after core hydrogen runs out, shedding huge amounts of mass in its winds." },
      { name: "Wolf–Rayet star", ageFrac: 0.97, tempK: 50000, lum: 250000, radiusSun: 5, note: "Its winds strip the hydrogen envelope entirely, exposing a hot, bare helium-burning core." },
      { name: "Supernova", ageFrac: 0.999, tempK: 50000, lum: 1e9, radiusSun: 5, note: "The core collapses — often with a supernova, sometimes a quiet direct collapse — and a black hole forms." },
      { name: "Black hole", ageFrac: 1, tempK: 0, lum: 0, radiusSun: 0.00004, note: "A stellar-mass black hole of roughly 10 M☉, only ~60 km across, from which not even light escapes." },
    ],
  },
];

/* surface temperature → approximate stellar colour, by log-T interpolation */
const TEMP_STOPS: [number, [number, number, number]][] = [
  [2500, [255, 96, 56]], [3500, [255, 138, 74]], [4800, [255, 198, 120]],
  [5800, [255, 244, 214]], [7500, [248, 250, 255]], [10000, [214, 226, 255]],
  [20000, [176, 198, 255]], [45000, [158, 178, 255]], [120000, [196, 206, 255]],
];
function tempColor(T: number): string {
  if (T <= 0) return "#05060c";
  const c = Math.max(2500, Math.min(120000, T));
  let a = TEMP_STOPS[0], b = TEMP_STOPS[TEMP_STOPS.length - 1];
  for (let i = 0; i < TEMP_STOPS.length - 1; i++) {
    if (c >= TEMP_STOPS[i][0] && c <= TEMP_STOPS[i + 1][0]) { a = TEMP_STOPS[i]; b = TEMP_STOPS[i + 1]; break; }
  }
  const f = (Math.log10(c) - Math.log10(a[0])) / (Math.log10(b[0]) - Math.log10(a[0]) || 1);
  const ch = (k: number) => Math.round(a[1][k] + (b[1][k] - a[1][k]) * f);
  return `rgb(${ch(0)} ${ch(1)} ${ch(2)})`;
}

/* ── H–R plot geometry (right) + star panel (left) in a wide viewBox ──── */
const SW = 980, SH = 470;
const STAR_CX = 176, STAR_CY = 214;
const HPL = 442, HPR = 930, HPT = 44, HPB = 372;
const HT_HI = 60000, HT_LO = 2600;   // temperature axis (hot LEFT)
const HL_HI = 2e6, HL_LO = 1e-3;     // luminosity axis (bright TOP)
const lg = Math.log10;
const hrx = (T: number) => HPL + (lg(HT_HI) - lg(Math.max(HT_LO, Math.min(HT_HI, T)))) / (lg(HT_HI) - lg(HT_LO)) * (HPR - HPL);
const hry = (L: number) => HPT + (lg(HL_HI) - lg(Math.max(HL_LO, Math.min(HL_HI, L)))) / (lg(HL_HI) - lg(HL_LO)) * (HPB - HPT);
/* radius → star-disk pixel radius (log-compressed so a white dwarf is a dot and a giant fills the panel) */
const diskPx = (R: number) => {
  const lr = lg(Math.max(0.005, Math.min(400, R)));   // −2.3 … 2.6
  return 7 + ((lr + 2.3) / (2.6 + 2.3)) * (152 - 7);
};

const HR_LUM_LINES = [1e6, 1e4, 1e2, 1, 1e-2];
const HR_CLASS = [
  { t: 38000, c: "O", col: "#9bb0ff" }, { t: 15000, c: "B", col: "#aec4ff" },
  { t: 9000, c: "A", col: "#dbe6ff" }, { t: 6800, c: "F", col: "#fff8ec" },
  { t: 5600, c: "G", col: "#fff2c2" }, { t: 4300, c: "K", col: "#ffce8a" },
  { t: 3200, c: "M", col: "#ff8a5c" },
];

function fmtAge(yr: number): string {
  if (yr >= 1e9) return `${(yr / 1e9).toFixed(1)} billion yr`;
  if (yr >= 1e6) return `${(yr / 1e6).toFixed(0)} million yr`;
  if (yr >= 1e3) return `${(yr / 1e3).toFixed(0)} thousand yr`;
  return `${Math.round(yr)} yr`;
}
function fmtLum(L: number): string {
  if (L <= 0) return "—";
  if (L >= 1e9) return `${Math.round(L / 1e9)} billion L☉`;
  if (L >= 1e6) return `${Math.round(L / 1e6)} million L☉`;
  if (L >= 1000) return `${Math.round(L).toLocaleString()} L☉`;
  if (L >= 10) return `${Math.round(L)} L☉`;
  if (L >= 1) return `${L.toFixed(1)} L☉`;
  if (L >= 0.001) return `${L.toFixed(3)} L☉`;
  return `${L.toExponential(0)} L☉`;
}
function fmtRadius(R: number): string {
  if (R <= 0) return "—";
  if (R >= 10) return `${Math.round(R).toLocaleString()} R☉`;
  if (R >= 1) return `${R.toFixed(1)} R☉`;
  if (R >= 0.05) return `${R.toFixed(2)} R☉`;
  return `${Math.round(R * 696000).toLocaleString()} km`;
}
function fmtTemp(T: number): string {
  if (T <= 0) return "—";
  if (T >= 1e6) return `${Math.round(T / 1e6)} million K`;
  return `${Math.round(T).toLocaleString()} K`;
}

/* sample the interpolated state (T, L, R) and the nearer named stage at age `frac`. */
function sampleTrack(t: StarTrack, frac: number) {
  const s = t.stages;
  let i = 0;
  for (let k = 0; k < s.length - 1; k++) if (frac >= s[k].ageFrac) i = k;
  const a = s[i], b = s[Math.min(i + 1, s.length - 1)];
  const span = (b.ageFrac - a.ageFrac) || 1;
  const u = a === b ? 1 : Math.max(0, Math.min(1, (frac - a.ageFrac) / span));
  const lerp = (x: number, y: number) => x + (y - x) * u;
  const glerp = (x: number, y: number) => (x <= 0 || y <= 0 ? lerp(x, y) : x * Math.pow(y / x, u));
  const near = u >= 0.5 ? b : a;
  return {
    tempK: lerp(a.tempK, b.tempK),
    lum: glerp(a.lum, b.lum),
    radiusSun: glerp(a.radiusSun, b.radiusSun),
    name: near.name,
    note: near.note,
  };
}

export function HrTracksPanel(): JSX.Element {
  const [massIdx, setMassIdx] = useState(1);   // start on the Sun
  const [frac, setFrac] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const reduced = useReduced();
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const track = TRACKS[massIdx];
  const cur = sampleTrack(track, frac);
  const ageYr = frac * track.lifetimeYr;
  const starColor = tempColor(cur.tempK);
  const isBH = cur.tempK <= 0;

  const pickMass = (i: number) => { setMassIdx((i + TRACKS.length) % TRACKS.length); setFrac(0); setPlaying(false); };
  const scrub = (v: number) => { setPlaying(false); setFrac(Math.max(0, Math.min(1, v))); };

  /* auto-play (disabled under reduced motion) — advances the age over ~8s. */
  useEffect(() => {
    if (!playing || reduced) return;
    let raf = 0, last = 0;
    const tick = (ts: number) => {
      if (last) setFrac((f) => Math.min(1, f + (ts - last) / 1000 / 8));
      last = ts;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);
  useEffect(() => { if (frac >= 1 && playing) setPlaying(false); }, [frac, playing]);

  const trans = reduced ? "none" : "all 180ms var(--ease)";
  const dR = diskPx(cur.radiusSun);
  const sunRefR = diskPx(1);

  /* H–R track geometry (exclude the off-diagram black-hole remnant) */
  const pts = track.stages.filter((s) => s.tempK > 0);
  const fullPath = pts.map((s, i) => `${i === 0 ? "M" : "L"} ${hrx(s.tempK).toFixed(1)} ${hry(s.lum).toFixed(1)}`).join(" ");
  const reached = track.stages.filter((s) => s.tempK > 0 && s.ageFrac <= frac);
  const tracePts = isBH ? reached : [...reached, { tempK: cur.tempK, lum: cur.lum }];
  const tracePath = tracePts.map((s, i) => `${i === 0 ? "M" : "L"} ${hrx(s.tempK).toFixed(1)} ${hry(s.lum).toFixed(1)}`).join(" ");
  const mx = hrx(cur.tempK), my = hry(cur.lum);

  return (
    <FigurePanel
      idx="3.3.b"
      kicker="Star in a Box — a life set by mass"
      caption="Pick a star's mass, then drag (or ← / →) to age it: the marker traces its path across the Hertzsprung–Russell diagram while the star's own disk — size and colour — and its temperature, brightness, and radius change with it. A small star ends as a white dwarf; a big one explodes as a supernova, leaving a neutron star or black hole. Mass alone decides the path."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md" data-theme="dark"
        style={{ background: "radial-gradient(circle at 30% 30%, #0c1020 0%, #06070e 78%)", border: "1px solid rgb(255 255 255 / 0.07)" }}>
        <svg viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="xMidYMid meet" className="block w-full h-auto" role="img"
          aria-label={`Star in a box: a ${track.pill} star at ${Math.round(frac * 100)} percent of its life — ${cur.name}, ${fmtTemp(cur.tempK)}, ${fmtLum(cur.lum)}, radius ${fmtRadius(cur.radiusSun)}. Marker on the Hertzsprung-Russell diagram traces its evolutionary track; the star ends as a ${track.fate}.`}>
        <defs>
          <radialGradient id="sib-hi" cx="38%" cy="34%" r="64%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 0.5)" />
            <stop offset="55%" stopColor="rgb(255 255 255 / 0)" />
          </radialGradient>
        </defs>

        {/* ── left: THE STAR ──────────────────────────────────────────── */}
        <text x={STAR_CX} y={36} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} letterSpacing="2.5" fill="rgb(255 255 255 / 0.5)">THE STAR</text>
        {/* Sun-size reference */}
        <circle cx={STAR_CX} cy={STAR_CY} r={sunRefR} fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth={1} strokeDasharray="3 5" />
        <text x={STAR_CX + sunRefR + 6} y={STAR_CY - sunRefR + 10} fontFamily="var(--font-mono)" fontSize={11} fill="rgb(255 255 255 / 0.4)">Sun</text>
        {isBH ? (
          <g>
            <circle cx={STAR_CX} cy={STAR_CY} r={26} fill="#f2a154" opacity={0.22} style={{ filter: "blur(7px)" }} />
            <circle cx={STAR_CX} cy={STAR_CY} r={15} fill="#000000" stroke="#f2a154" strokeWidth={2.5} />
            <circle cx={STAR_CX} cy={STAR_CY} r={2.5} fill="#ffffff" />
          </g>
        ) : (
          <g style={{ transition: trans }}>
            <circle cx={STAR_CX} cy={STAR_CY} r={dR} fill={starColor}
              style={{ filter: `drop-shadow(0 0 ${Math.max(10, dR * 0.45)}px ${starColor})`, transition: trans }} />
            <circle cx={STAR_CX} cy={STAR_CY} r={dR} fill="url(#sib-hi)" />
          </g>
        )}
        <text x={STAR_CX} y={SH - 36} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={16} fontWeight={700}
          fill={isBH ? "#c9bcff" : starColor}>{cur.name}</text>
        <text x={STAR_CX} y={SH - 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={12} fill="rgb(255 255 255 / 0.55)">
          radius {fmtRadius(cur.radiusSun)}
        </text>

        {/* divider */}
        <line x1={406} y1={36} x2={406} y2={SH - 24} stroke="rgb(255 255 255 / 0.08)" strokeWidth={1} />

        {/* ── right: THE H–R DIAGRAM ───────────────────────────────────── */}
        <rect x={HPL} y={HPT} width={HPR - HPL} height={HPB - HPT} fill="none" stroke="rgb(255 255 255 / 0.14)" />
        {/* luminosity gridlines + labels */}
        {HR_LUM_LINES.map((L) => (
          <g key={L}>
            <line x1={HPL} y1={hry(L)} x2={HPR} y2={hry(L)} stroke="rgb(255 255 255 / 0.06)" strokeWidth={1} />
            <text x={HPL - 8} y={hry(L) + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize={11} fill="rgb(255 255 255 / 0.45)">
              {L >= 1000 ? `${L / 1000}k` : L >= 1 ? `${L}` : L}
            </text>
          </g>
        ))}
        {/* spectral-class ticks along the top */}
        {HR_CLASS.map((k) => (
          <text key={k.c} x={hrx(k.t)} y={HPT - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={12} fontWeight={600} fill={k.col}>{k.c}</text>
        ))}
        {/* axis labels */}
        <text x={(HPL + HPR) / 2} y={HPB + 34} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={12} fill="rgb(255 255 255 / 0.55)">SURFACE TEMPERATURE — hot ◀ · ▶ cool</text>
        <text transform={`rotate(-90 ${HPL - 34} ${(HPT + HPB) / 2})`} x={HPL - 34} y={(HPT + HPB) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={12} fill="rgb(255 255 255 / 0.55)">BRIGHTNESS (Suns) ▶</text>
        {/* main-sequence band */}
        <line x1={hrx(42000)} y1={hry(2e5)} x2={hrx(2900)} y2={hry(2e-3)} stroke="rgb(255 255 255 / 0.13)" strokeWidth={20} strokeLinecap="round" />
        <text x={hrx(5200)} y={hry(0.4) - 10} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} fontStyle="italic" fill="rgb(255 255 255 / 0.5)" transform={`rotate(26 ${hrx(5200)} ${hry(0.4)})`}>main sequence</text>

        {/* full track (faint, dashed) + traced portion (bright) */}
        <path d={fullPath} fill="none" stroke={track.fateColor} strokeWidth={1.6} strokeDasharray="3 6" opacity={0.4} />
        <path d={tracePath} fill="none" stroke={track.fateColor} strokeWidth={3} style={{ filter: `drop-shadow(0 0 5px ${track.fateColor})`, transition: trans }} />
        {/* stage dots */}
        {pts.map((s, i) => (
          <circle key={i} cx={hrx(s.tempK)} cy={hry(s.lum)} r={3.5} fill={s.ageFrac <= frac ? track.fateColor : "rgb(255 255 255 / 0.3)"} />
        ))}
        {/* the live marker = the star's current position */}
        {!isBH && (
          <g style={{ transition: trans }}>
            <circle cx={mx} cy={my} r={11} fill={starColor} opacity={0.3} style={{ filter: "blur(5px)" }} />
            <circle cx={mx} cy={my} r={6.5} fill={starColor} stroke="#ffffff" strokeWidth={1.5} />
          </g>
        )}
        </svg>
      </div>

      {/* ── controls: mass pills · play · age slider ─────────────────────── */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-1.5">
          <span className="font-mono uppercase tracking-[0.18em]" style={{ color: "rgb(var(--c-text-rgb) / 0.55)", fontSize: sz(0.6) ?? "10px" }}>mass</span>
          {TRACKS.map((t, i) => (
            <button key={t.mass} type="button" onClick={() => pickMass(i)} data-shortcut={String(i + 1)} aria-pressed={massIdx === i}
              className={`rounded-full font-mono${massIdx === i ? " is-active" : ""}`}
              style={{
                padding: "4px 11px", fontSize: sz(0.6) ?? "10.5px",
                color: massIdx === i ? "rgb(5 6 12)" : "rgb(var(--c-text-rgb) / 0.7)",
                background: massIdx === i ? t.fateColor : "rgb(var(--c-text-rgb) / 0.06)",
                border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
              }}>{t.pill}</button>
          ))}
        </div>
        {!reduced && (
          <button type="button" onClick={() => setPlaying((p) => !p)} data-shortcut="p" aria-pressed={playing}
            className="rounded-full font-mono uppercase tracking-[0.16em]"
            style={{
              padding: "5px 14px", fontSize: sz(0.6) ?? "10px",
              color: playing ? "rgb(5 6 12)" : "rgb(var(--c-text-rgb) / 0.8)",
              background: playing ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.08)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.18)",
            }}>{playing ? "❚❚ pause" : "▶ play life"}</button>
        )}
        <div className="flex items-center gap-2" style={{ flex: "1 1 240px", minWidth: 200 }}>
          <span className="font-mono uppercase tracking-[0.16em]" style={{ color: "rgb(var(--c-text-rgb) / 0.45)", fontSize: sz(0.56) ?? "9px" }}>birth</span>
          <input type="range" min={0} max={1} step={0.004} value={frac} onChange={(e) => scrub(parseFloat(e.target.value))}
            className="cosmic-slider" style={{ flex: 1 }} aria-label="Star age — drag or use left and right arrows to age the star from birth to death" />
          <span className="font-mono uppercase tracking-[0.16em]" style={{ color: "rgb(var(--c-text-rgb) / 0.45)", fontSize: sz(0.56) ?? "9px" }}>death</span>
        </div>
      </div>

      {/* ── compact readout strip ────────────────────────────────────────── */}
      <div className="mt-4 rounded-md p-3" style={{ background: "rgb(var(--c-text-rgb) / 0.04)", border: `1px solid ${track.fateColor}44`, flexShrink: 0 }}>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-sans">
          <div className="font-mono uppercase tracking-[0.14em]" style={{ color: isBH ? "#c9bcff" : starColor, fontSize: sz(0.68) ?? "11px", fontWeight: 600 }}>{cur.name}</div>
          {([["age", fmtAge(ageYr)], ["temperature", fmtTemp(cur.tempK)], ["brightness", fmtLum(cur.lum)], ["radius", fmtRadius(cur.radiusSun)]] as const).map(([k, v]) => (
            <div key={k}>
              <span className="font-mono uppercase tracking-[0.16em]" style={{ color: "rgb(var(--c-text-rgb) / 0.55)", fontSize: sz(0.58) ?? "9.5px" }}>{k}</span>{" "}
              <span style={{ color: "rgb(var(--c-text-rgb) / 0.92)", fontSize: sz(0.88) ?? "13px", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div>
            <span className="font-mono uppercase tracking-[0.16em]" style={{ color: "rgb(var(--c-text-rgb) / 0.55)", fontSize: sz(0.58) ?? "9.5px" }}>ends as</span>{" "}
            <span style={{ color: track.fateColor, fontSize: sz(0.88) ?? "13px", fontWeight: 600 }}>{track.fate}</span>
          </div>
        </div>
        <div className="mt-2 leading-[1.5] font-sans" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.82) ?? "13px", minHeight: "3em" }}>{cur.note}</div>
      </div>

      {/* keyboard: ← / → scrub age (the slider); ↑ / ↓ and 1–6 pick the mass; p plays. */}
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => pickMass(massIdx - 1)} style={srOnly}>lighter star</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => pickMass(massIdx + 1)} style={srOnly}>heavier star</button>
    </FigurePanel>
  );
}
