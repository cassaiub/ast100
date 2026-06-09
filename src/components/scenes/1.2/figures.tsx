import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

function FigurePanel({ idx, kicker, caption, children }: { idx: string; kicker: string; caption: ReactNode; children: ReactNode }) {
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

/* ── Standard Model — clickable particle inventory ──────────────────
   Quarks + leptons in three generations, gauge bosons, Higgs.
   Hover/click to inspect mass, charge, spin, and role. */
type Particle = {
  id: string;
  symbol: string;
  name: string;
  family: "quark" | "lepton" | "boson" | "higgs";
  /** display row & col for the grid */
  row: number;
  col: number;
  /** mass in units of the electron's mass (0 = massless) — drives colour. */
  massE: number;
  mass: string;
  charge: string;
  role: string;
};
const PARTICLES: Particle[] = [
  /* Generation I quarks (row 0–1, cols 0–2 generation labels) */
  { id: "u",   symbol: "u",   name: "Up quark",       family: "quark",  row: 0, col: 0, massE: 4.3,      mass: "≈ 4 electrons",        charge: "+2/3",   role: "Two ups and one down make a proton. The lightest quark." },
  { id: "d",   symbol: "d",   name: "Down quark",     family: "quark",  row: 1, col: 0, massE: 9.2,      mass: "≈ 9 electrons",        charge: "−1/3",   role: "One up and two downs make a neutron. Just heavier than the up quark." },
  { id: "c",   symbol: "c",   name: "Charm quark",    family: "quark",  row: 0, col: 1, massE: 2485,     mass: "≈ 2,500 electrons",    charge: "+2/3",   role: "A heavier copy of the up quark, seen only in high-energy collisions." },
  { id: "s",   symbol: "s",   name: "Strange quark",  family: "quark",  row: 1, col: 1, massE: 186,      mass: "≈ 190 electrons",      charge: "−1/3",   role: "A heavier copy of the down quark, made only in collisions." },
  { id: "t",   symbol: "t",   name: "Top quark",      family: "quark",  row: 0, col: 2, massE: 338600,   mass: "≈ 340,000 electrons",  charge: "+2/3",   role: "The heaviest particle of all — as heavy as a gold atom. It decays instantly." },
  { id: "b",   symbol: "b",   name: "Bottom quark",   family: "quark",  row: 1, col: 2, massE: 8180,     mass: "≈ 8,200 electrons",    charge: "−1/3",   role: "The heaviest down-type quark. Used to probe why matter beat antimatter." },
  /* Leptons (rows 2–3) */
  { id: "e",   symbol: "e",   name: "Electron",       family: "lepton", row: 2, col: 0, massE: 1,        mass: "1 electron — the benchmark", charge: "−1", role: "Swarms around every atom; its flow through wires is electricity." },
  { id: "ne",  symbol: "νₑ",  name: "Electron ν",    family: "lepton", row: 3, col: 0, massE: 0.000002, mass: "almost weightless",   charge: "0",      role: "A ghostly, near-weightless neutrino. Trillions pass through you each second." },
  { id: "mu",  symbol: "µ",   name: "Muon",           family: "lepton", row: 2, col: 1, massE: 207,      mass: "≈ 207 electrons",      charge: "−1",     role: "A heavy, short-lived cousin of the electron, made when space particles hit the air." },
  { id: "nm",  symbol: "νᵤ",  name: "Muon ν",        family: "lepton", row: 3, col: 1, massE: 0.000002, mass: "almost weightless",   charge: "0",      role: "The neutrino that partners the muon." },
  { id: "ta",  symbol: "τ",   name: "Tau",            family: "lepton", row: 2, col: 2, massE: 3478,     mass: "≈ 3,500 electrons",    charge: "−1",     role: "The heaviest cousin of the electron. It vanishes almost instantly." },
  { id: "nt",  symbol: "νᵗ",  name: "Tau ν",         family: "lepton", row: 3, col: 2, massE: 0.000002, mass: "almost weightless",   charge: "0",      role: "The neutrino that partners the tau." },
  /* Gauge bosons */
  { id: "g",   symbol: "g",   name: "Gluon",          family: "boson",  row: 0, col: 4, massE: 0,        mass: "none — pure energy",   charge: "0",      role: "Carries the strong force — the glue binding quarks into protons and neutrons." },
  { id: "ph",  symbol: "γ",   name: "Photon",         family: "boson",  row: 1, col: 4, massE: 0,        mass: "none — pure energy",   charge: "0",      role: "Carries electricity and magnetism. A single packet of light." },
  { id: "z",   symbol: "Z⁰",  name: "Z boson",        family: "boson",  row: 2, col: 4, massE: 178500,   mass: "≈ 178,000 electrons",  charge: "0",      role: "Carries the weak force, behind some radioactive decay." },
  { id: "w",   symbol: "W±",  name: "W boson",        family: "boson",  row: 3, col: 4, massE: 157300,   mass: "≈ 157,000 electrons",  charge: "±1",     role: "Carries the weak force; lets one particle turn into another." },
  /* Higgs */
  { id: "h",   symbol: "H",   name: "Higgs boson",    family: "higgs",  row: 1.5, col: 5.5, massE: 244600, mass: "≈ 245,000 electrons", charge: "0",   role: "Gives particles their mass via the field that fills all space. Found in 2012." },
];

/* ── Mass → colour ────────────────────────────────────────────────────
   Each block is tinted by its mass on a LOG scale (mass spans ~6 orders of
   magnitude). The ramp runs cool→warm — cyan (lightest) through indigo and
   violet to amber (heaviest) — built from the site's plasma/nebula/solar
   hues. The domain runs from ~0.1 electron up to the top quark (~340,000
   electrons); anything lighter (neutrinos, the massless photon & gluon)
   pins to the cool end. The SAME ramp paints the colour-bar legend. */
const MASS_STOPS: { t: number; rgb: [number, number, number] }[] = [
  { t: 0.0, rgb: [34, 211, 238] },  // cyan — plasma
  { t: 0.35, rgb: [99, 102, 241] }, // indigo
  { t: 0.62, rgb: [168, 85, 247] }, // violet — nebula
  { t: 0.82, rgb: [232, 72, 140] }, // pink
  { t: 1.0, rgb: [245, 158, 11] },  // amber — solar
];
const MASS_GRADIENT =
  "linear-gradient(90deg, rgb(34 211 238) 0%, rgb(99 102 241) 35%, rgb(168 85 247) 62%, rgb(232 72 140) 82%, rgb(245 158 11) 100%)";
/* electrons → position on the ramp. log10, electron(1) ≈ 0.15, top ≈ 0.99. */
function massT(massE: number): number {
  if (massE <= 0) return 0;
  return Math.max(0, Math.min(1, (Math.log10(massE) + 1) / 6.6));
}
function massRGB(massE: number): [number, number, number] {
  const t = massT(massE);
  let a = MASS_STOPS[0];
  let b = MASS_STOPS[MASS_STOPS.length - 1];
  for (let i = 0; i < MASS_STOPS.length - 1; i++) {
    if (t >= MASS_STOPS[i].t && t <= MASS_STOPS[i + 1].t) {
      a = MASS_STOPS[i];
      b = MASS_STOPS[i + 1];
      break;
    }
  }
  const f = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
  return [0, 1, 2].map((k) => Math.round(a.rgb[k] + (b.rgb[k] - a.rgb[k]) * f)) as [number, number, number];
}
function massCss(rgb: [number, number, number], alpha?: number): string {
  return alpha == null ? `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})` : `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${alpha})`;
}

const familyLabel: Record<Particle["family"], string> = {
  quark: "quark · matter brick",
  lepton: "lepton · matter brick",
  boson: "boson · force carrier",
  higgs: "Higgs · gives mass",
};

/* Tracks whether the enclosing FigureFrame is in fullscreen (`.is-fs`) so a
   panel can scale its HTML text up — the SVG scales with its viewBox, but the
   fixed-px detail/control panels would otherwise stay tiny in fullscreen.
   Mirrors the MutationObserver pattern used by 0.4's EM-wave panel. */
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

/* Off-screen but real <button> used for keyboard/wheel hooks. FigureFrame's
   navigator drives shortcuts by calling `.click()`, which SVG elements do not
   implement — so particle stepping must go through real buttons, not the SVG
   tiles. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

export function StandardModelPanel() {
  const [sel, setSel] = useState<string>("h");
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const W = 760;
  const H = 380;
  const cellW = 96;
  const cellH = 76;
  const gridOriginX = 76;
  const gridOriginY = 60;

  const cur = PARTICLES.find((p) => p.id === sel)!;
  const curIdx = PARTICLES.findIndex((p) => p.id === sel);
  const stepSel = (dir: -1 | 1) => {
    const n = (curIdx + dir + PARTICLES.length) % PARTICLES.length;
    setSel(PARTICLES[n].id);
  };

  /* Uniform fullscreen scaling: ONE responsive base, and every label a fixed
     fraction of it, so the whole detail panel grows together (proportional to
     the enlarged figure) instead of a mix of mismatched sizes. `undefined` in
     normal flow keeps the compact in-page sizes from the utility classes. */
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  return (
    <FigurePanel
      idx="1.2.a"
      kicker="The Standard Model · Bricks & Mortar"
      caption="Seventeen particles that build the entire physical Universe. Click any one to inspect its mass, charge, and role. Quarks and leptons are the 'bricks'; gauge bosons are the 'mortar' that holds them together; the Higgs is what gives the bricks their weight."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Column headers — generation labels */}
          {[0, 1, 2].map((c) => (
            <text
              key={c}
              x={gridOriginX + c * cellW + cellW / 2}
              y={gridOriginY - 18}
              textAnchor="middle"
              fontSize="9"
              letterSpacing="3"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-text-rgb) / 0.4)"
            >
              GEN {["I", "II", "III"][c]}
            </text>
          ))}
          <text
            x={gridOriginX + 4 * cellW + cellW / 2}
            y={gridOriginY - 18}
            textAnchor="middle"
            fontSize="9"
            letterSpacing="3"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.4)"
          >
            FORCES
          </text>

          {/* Row labels — rotated 90° so they sit cleanly to the LEFT of
             the cell columns, spanning their two-row groups. */}
          <text
            transform={`rotate(-90 28 ${gridOriginY + cellH})`}
            x={28}
            y={gridOriginY + cellH}
            textAnchor="middle"
            fontSize="11"
            letterSpacing="4"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.45)"
          >
            QUARKS
          </text>
          <text
            transform={`rotate(-90 28 ${gridOriginY + 3 * cellH})`}
            x={28}
            y={gridOriginY + 3 * cellH}
            textAnchor="middle"
            fontSize="11"
            letterSpacing="4"
            fontFamily="var(--font-mono)"
            fill="rgb(var(--c-text-rgb) / 0.45)"
          >
            LEPTONS
          </text>

          {/* Particle cells. Click selects (mouse); keyboard ←/→ steps via
             the off-screen buttons below — SVG <g> elements don't implement
             `.click()`, so the FigureFrame navigator can't drive them
             directly. `aria-pressed` flags the selected one for a11y. */}
          {PARTICLES.map((p) => {
            const x = gridOriginX + p.col * cellW;
            const y = gridOriginY + p.row * cellH;
            const isSel = p.id === sel;
            const c = massRGB(p.massE);
            return (
              <g
                key={p.id}
                onClick={() => setSel(p.id)}
                style={{ cursor: "pointer" }}
                aria-pressed={isSel}
                role="button"
                aria-label={`Inspect ${p.name}`}
              >
                <rect
                  x={x}
                  y={y}
                  width={cellW - 8}
                  height={cellH - 8}
                  rx={6}
                  fill={massCss(c, isSel ? 0.34 : 0.16)}
                  stroke={massCss(c, isSel ? 1 : 0.55)}
                  strokeWidth={isSel ? 2.5 : 1.2}
                  style={{
                    filter: isSel ? `drop-shadow(0 0 12px ${massCss(c, 0.6)})` : "none",
                    transition: "stroke 200ms var(--ease), fill 200ms var(--ease)",
                  }}
                />
                <text
                  x={x + (cellW - 8) / 2}
                  y={y + 32}
                  textAnchor="middle"
                  fontSize="26"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                  fill={isSel ? massCss(c, 1) : "rgb(var(--c-text-rgb) / 0.95)"}
                >
                  {p.symbol}
                </text>
                <text
                  x={x + (cellW - 8) / 2}
                  y={y + 54}
                  textAnchor="middle"
                  fontSize="10"
                  letterSpacing="1"
                  fontFamily="var(--font-mono)"
                  fill={isSel ? massCss(c, 1) : "rgb(var(--c-text-rgb) / 0.8)"}
                >
                  {p.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Colour-bar legend — every block above is tinted by its mass on this
         log scale (lightest = cyan, heaviest = amber). Reference points are
         positioned at their true log-scale spots. */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div
          className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-1.5"
          style={{ fontSize: sz(0.62) }}
        >
          block colour = mass
        </div>
        <div
          className="w-full rounded-full"
          style={{
            height: fs ? "clamp(10px, 1.4vh, 20px)" : "9px",
            background: MASS_GRADIENT,
            border: "1px solid rgb(var(--c-text-rgb) / 0.12)",
          }}
        />
        <div
          className="relative font-mono tracking-[0.12em] uppercase text-white/55 mt-1"
          style={{ fontSize: sz(0.56) ?? "9px", height: fs ? "calc(clamp(16px, 2.1vh, 27px) * 0.9)" : "13px" }}
        >
          <span className="absolute left-0 whitespace-nowrap">massless</span>
          <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: "15%" }}>electron</span>
          <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: "65%" }}>proton</span>
          <span className="absolute right-0 whitespace-nowrap">top quark</span>
        </div>
      </div>

      {/* Off-screen keyboard hooks: ←/→ step through the 17 particles.
         Real <button>s so FigureFrame's navigator (which calls .click())
         can drive them — and they take precedence over the SVG tiles. */}
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => stepSel(-1)} style={srOnly}>previous particle</button>
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowRight" onClick={() => stepSel(1)} style={srOnly}>next particle</button>

      <div
        className="mt-4 grid md:grid-cols-[200px_1fr] gap-4 p-3 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          // In fullscreen this panel must NOT shrink — the greedy .fig-viz
          // would otherwise squeeze it and global overflow:hidden would clip
          // the lower rows. Keep full height; let the grid (viz) give space.
          flexShrink: 0,
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>family</div>
          <div className="font-mono text-[11px] tracking-[0.18em] mt-1" style={{ color: massCss(massRGB(cur.massE)), fontSize: sz(0.82) }}>
            {familyLabel[cur.family]}
          </div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mt-3" style={{ fontSize: sz(0.62) }}>mass</div>
          <div className="font-sans text-[12px] text-white/80 mt-0.5 leading-snug" style={{ fontSize: sz(0.82) }}>{cur.mass}</div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mt-2" style={{ fontSize: sz(0.62) }}>electric charge</div>
          <div className="font-mono text-[10px] text-white/80 mt-0.5" style={{ fontSize: sz(0.74) }}>{cur.charge}</div>
        </div>
        <div className="text-[13px] text-white/85 leading-[1.6] font-sans min-h-[6.8em]" style={{ fontSize: sz(1) }}>
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: massCss(massRGB(cur.massE)), fontSize: sz(0.72) }}>{cur.name.toUpperCase()}</div>
          {cur.role}
        </div>
      </div>
      <div
        className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-white/45 text-center"
        style={{ fontSize: sz(0.62), flexShrink: 0 }}
      >
        click a tile · ← / → to step through the particles
      </div>
    </FigurePanel>
  );
}

/* ── Annihilation & the one-in-a-billion survivor ───────────────────
   A four-stage story the reader plays or steps through with ← / →:
     1 HOT        — light ⇌ matter+antimatter pairs, in balance.
     2 COOLING    — expansion cools the cosmos; light can't make pairs.
     3 ANNIHILATE — every pair finds its partner and cancels into light.
     4 SURVIVOR   — matter slightly outnumbered antimatter, so one
                    unmatched particle is left — and that is everything.
   A 7-pair "+1 matter" layout is schematic; the real surplus was ~1 in a
   billion (stated on-figure). Respects prefers-reduced-motion (no tween). */

const ANN_CAPTION: Record<number, string> = {
  1: "Hot early Universe: light keeps turning into matter–antimatter pairs, and the pairs keep annihilating back into light — created and destroyed in perfect balance (e⁻ + e⁺ ⇌ γ + γ).",
  2: "But the books don't quite balance. Matter slightly outnumbers antimatter — here, 8 matter to 7 antimatter — so one matter particle has no partner (circled).",
  3: "Space expands and cools. Light can no longer make new pairs, so creation switches off. From now on there is only annihilation.",
  4: "Each particle drifts toward its antiparticle, about to meet…",
  5: "…they touch and annihilate, flashing into two photons of light. Pair by pair the crowd empties out (e⁻ + e⁺ → γ + γ).",
  6: "Every pair is gone — but the one unmatched particle had nothing left to annihilate against. That lone survivor is everything solid in the Universe today.",
};
const ANN_BADGE: Record<number, string> = { 1: "HOT", 2: "HOT", 3: "COOLING", 4: "COOLING", 5: "COOLING", 6: "COLD" };

export function AntiparticleAnnihilationPanel() {
  const [stage, setStage] = useState(1); // 1 hot · 2 cooling · 3 annihilate · 4 survivor
  const [playKey, setPlayKey] = useState(0);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  /* Auto-play timeline (skipped on first mount; only when ▶ is pressed). */
  useEffect(() => {
    if (playKey === 0) return;
    setStage(1);
    const ts = [
      window.setTimeout(() => setStage(2), 1500),
      window.setTimeout(() => setStage(3), 3000),
      window.setTimeout(() => setStage(4), 4300),
      window.setTimeout(() => setStage(5), 5300),
      window.setTimeout(() => setStage(6), 7100),
    ];
    return () => ts.forEach((t) => clearTimeout(t));
  }, [playKey]);

  const STAGES = 6;
  const step = (d: -1 | 1) => setStage((s) => Math.max(1, Math.min(STAGES, s + d)));

  /* Uniform fullscreen scaling from one base — see StandardModelPanel. */
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 760;
  const H = 300;
  const PAIRS = 7;
  const colX = (i: number) => 96 + i * 84; // columns 0..7
  const mY = 116; // matter row
  const aY = 202; // antimatter row
  const midY = (mY + aY) / 2; // where a pair meets and annihilates
  const approach = stage === 4; // pairs drift together
  const annihilated = stage >= 5; // pairs gone (turned to light) from stage 5
  const done = stage === 6;
  const mCount = annihilated ? 1 : PAIRS + 1; // 8 → 1
  const aCount = annihilated ? 0 : PAIRS; // 7 → 0
  const tokenTrans = (i: number) =>
    reduced ? "none" : `opacity 360ms var(--ease) ${i * 0.12}s, transform 440ms var(--ease) ${i * 0.12}s`;
  // ambient light while pairs exist; brightens into the released light after annihilation
  const gammaOpacity = annihilated ? 0.55 : 0.2;

  return (
    <FigurePanel
      idx="1.2.b"
      kicker="Annihilation & the One-in-a-Billion Survivor"
      caption="Press ▶ (or step with ← / →) through the story that left a Universe of matter behind. When it was hot, light freely turned into matter–antimatter pairs and those pairs annihilated back into light, in balance. As space cooled, creation switched off, and every pair annihilated into light. Because matter outnumbered antimatter by about one part in a billion, that tiny unmatched surplus had no partner left to destroy it — and it is everything solid that exists. (The 7 pairs + 1 here are schematic; the real edge was 1 in a billion.)"
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Stage / temperature badge */}
          <text x={24} y={34} fontSize="13" letterSpacing="3" fontFamily="var(--font-mono)"
            fill={stage === 1 ? "var(--c-solar)" : done ? "var(--c-accent)" : "rgb(var(--c-solar-rgb) / 0.7)"}>
            {ANN_BADGE[stage]}
          </text>
          {/* Running tally */}
          <text x={W - 24} y={34} textAnchor="end" fontSize="12" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.6)">
            matter {mCount} · antimatter {aCount}
          </text>

          {/* Released light (γ) at each pair midpoint — faint while hot, bright after annihilation */}
          {Array.from({ length: PAIRS }).map((_, i) => (
            <text
              key={`g${i}`}
              x={colX(i)}
              y={(mY + aY) / 2 + 6}
              textAnchor="middle"
              fontSize="22"
              fontStyle="italic"
              fontFamily="var(--font-serif)"
              fill="rgb(var(--c-text-rgb) / 0.85)"
              style={{ opacity: gammaOpacity, transition: reduced ? "none" : `opacity 360ms var(--ease) ${i * 0.13 + 0.18}s` }}
            >
              γ
            </text>
          ))}

          {/* Matter row — filled cyan tokens (8: seven paired + one surplus).
             Paired tokens drift down toward the midline on APPROACH, meet on
             ANNIHILATE, then vanish; the surplus never moves and survives. */}
          {Array.from({ length: PAIRS + 1 }).map((_, i) => {
            const isSurplus = i === PAIRS; // the unmatched survivor
            const gone = annihilated && !isSurplus;
            const dy = isSurplus ? 0 : approach ? midY - mY - 16 : annihilated ? midY - mY : 0;
            const scale = gone ? 0 : isSurplus && done ? 1.18 : 1;
            return (
              <g key={`m${i}`} style={{ transformBox: "fill-box", transformOrigin: "center", opacity: gone ? 0 : 1, transform: `translate(0px, ${dy}px) scale(${scale})`, transition: tokenTrans(i) }}>
                <circle cx={colX(i)} cy={mY} r="15" fill="rgb(var(--c-accent-rgb))"
                  style={isSurplus && done ? { filter: "drop-shadow(0 0 10px rgb(var(--c-accent-rgb) / 0.9))" } : undefined} />
                <text x={colX(i)} y={mY + 5} textAnchor="middle" fontSize="13" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-bg-rgb))">e⁻</text>
              </g>
            );
          })}

          {/* Antimatter row — hollow amber rings (7). Drift UP to meet matter. */}
          {Array.from({ length: PAIRS }).map((_, i) => {
            const dy = approach ? midY - aY + 16 : annihilated ? midY - aY : 0;
            return (
              <g key={`a${i}`} style={{ transformBox: "fill-box", transformOrigin: "center", opacity: annihilated ? 0 : 1, transform: `translate(0px, ${dy}px) scale(${annihilated ? 0 : 1})`, transition: tokenTrans(i) }}>
                <circle cx={colX(i)} cy={aY} r="15" fill="none" stroke="rgb(var(--c-solar-rgb))" strokeWidth="2.5" />
                <text x={colX(i)} y={aY + 5} textAnchor="middle" fontSize="13" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-solar-rgb))">e⁺</text>
              </g>
            );
          })}

          {/* Annihilation flash at each meeting point — pops on stage 5. */}
          {Array.from({ length: PAIRS }).map((_, i) => (
            <circle key={`f${i}`} cx={colX(i)} cy={midY} r="16" fill="rgb(var(--c-text-rgb))"
              opacity={stage === 5 ? 0.85 : 0}
              style={{ filter: "drop-shadow(0 0 16px rgb(var(--c-accent-rgb) / 0.9))", transition: reduced ? "none" : `opacity 320ms var(--ease) ${i * 0.12}s` }} />
          ))}

          {/* "no partner" callout on the surplus matter — stage 2 only. */}
          <g style={{ opacity: stage === 2 ? 1 : 0, transition: reduced ? "none" : "opacity 300ms var(--ease)" }}>
            <circle cx={colX(PAIRS)} cy={mY} r="26" fill="none" stroke="var(--c-accent)" strokeWidth="1.5" strokeDasharray="3 4" />
            <text x={colX(PAIRS)} y={mY + 48} textAnchor="middle" fontSize="10" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="var(--c-accent)">no partner</text>
          </g>

          {/* Survivor flag */}
          <text x={colX(PAIRS)} y={mY - 28} textAnchor="middle" fontSize="11" letterSpacing="2.5" fontFamily="var(--font-mono)"
            fill="var(--c-accent)" style={{ opacity: done ? 1 : 0, transition: reduced ? "none" : "opacity 360ms var(--ease) 0.9s" }}>
            SURVIVOR
          </text>
        </svg>
      </div>

      {/* Controls: play + visible stage steps. ← / → step via the hidden
         buttons below (FigureFrame drives them by .click()). */}
      <div className="mt-4 flex gap-3 flex-wrap items-center" style={{ flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setPlayKey((k) => k + 1)}
          className="pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.22em] uppercase"
          style={{ fontSize: sz(0.62) }}
        >
          ▶ play
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStage(n)}
              aria-pressed={stage === n}
              className="rounded-full font-mono"
              style={{
                width: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "20px",
                height: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "20px",
                fontSize: sz(0.56) ?? "9px",
                color: stage === n ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.6)",
                background: stage === n ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
                border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="font-mono text-plasma tracking-[0.14em] text-[12px]" style={{ fontSize: sz(0.7) }}>
          {stage <= 2 ? "e⁻ + e⁺ ⇌ γ + γ" : "e⁻ + e⁺ → γ + γ"}
          <span className="text-white/45 ml-2">← / → step</span>
        </div>
      </div>

      {/* Stage narration — changes with the stage; the text is self-sufficient. */}
      <div
        className="mt-4 p-4 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
          flexShrink: 0,
        }}
      >
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-2" style={{ fontSize: sz(0.6) }}>
          stage {stage} of {STAGES}
        </div>
        <div className="text-[14px] text-white/85 leading-[1.6] min-h-[4.6em]" style={{ fontSize: sz(1) }}>
          {ANN_CAPTION[stage]}
        </div>
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/45 mt-2 flex flex-wrap gap-x-4 gap-y-1" style={{ fontSize: sz(0.6) }}>
          <span><span style={{ color: "var(--c-accent)" }}>●</span> matter (e⁻)</span>
          <span><span style={{ color: "var(--c-solar)" }}>○</span> antimatter (e⁺)</span>
          <span><span className="font-serif italic" style={{ color: "rgb(var(--c-text-rgb) / 0.7)" }}>γ</span> light</span>
          <span className="text-white/35">real surplus ≈ 1 in 1,000,000,000</span>
        </div>
      </div>

      {/* Off-screen keyboard hooks: ← / → step through the four stages. */}
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly}>previous stage</button>
      <button type="button" aria-hidden="true" tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly}>next stage</button>
    </FigurePanel>
  );
}
