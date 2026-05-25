import { useEffect, useRef, useState, type ReactNode } from "react";

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
  mass: string;
  charge: string;
  role: string;
};
const PARTICLES: Particle[] = [
  /* Generation I quarks (row 0–1, cols 0–2 generation labels) */
  { id: "u",   symbol: "u",   name: "Up quark",       family: "quark",  row: 0, col: 0, mass: "2.2 MeV/c²",   charge: "+2/3",   role: "Two ups + one down = proton. The lightest quark." },
  { id: "d",   symbol: "d",   name: "Down quark",     family: "quark",  row: 1, col: 0, mass: "4.7 MeV/c²",   charge: "−1/3",   role: "One up + two downs = neutron. Slightly heavier than up." },
  { id: "c",   symbol: "c",   name: "Charm quark",    family: "quark",  row: 0, col: 1, mass: "1.27 GeV/c²",  charge: "+2/3",   role: "Generation II up-type. Found in charmonium and D mesons." },
  { id: "s",   symbol: "s",   name: "Strange quark",  family: "quark",  row: 1, col: 1, mass: "95 MeV/c²",    charge: "−1/3",   role: "Generation II down-type. Component of kaons and strange hadrons." },
  { id: "t",   symbol: "t",   name: "Top quark",      family: "quark",  row: 0, col: 2, mass: "173 GeV/c²",   charge: "+2/3",   role: "Heaviest known particle — heavier than a gold atom. Decays before forming hadrons." },
  { id: "b",   symbol: "b",   name: "Bottom quark",   family: "quark",  row: 1, col: 2, mass: "4.18 GeV/c²",  charge: "−1/3",   role: "Generation III down-type. Important in B-meson studies of CP violation." },
  /* Leptons (rows 2–3) */
  { id: "e",   symbol: "e",   name: "Electron",       family: "lepton", row: 2, col: 0, mass: "0.511 MeV/c²", charge: "−1",     role: "The orbital electron — chemistry's workhorse. The first stable lepton." },
  { id: "ne",  symbol: "νₑ",  name: "Electron ν",    family: "lepton", row: 3, col: 0, mass: "< 1 eV/c²",     charge: "0",      role: "Ghostly, nearly massless. Pours out of stars by the trillion-per-second-per-cm²." },
  { id: "mu",  symbol: "µ",   name: "Muon",           family: "lepton", row: 2, col: 1, mass: "106 MeV/c²",   charge: "−1",     role: "A heavy cousin of the electron. Created in cosmic ray showers; lives 2.2 µs." },
  { id: "nm",  symbol: "νᵤ",  name: "Muon ν",        family: "lepton", row: 3, col: 1, mass: "< 0.2 MeV/c²",  charge: "0",      role: "Companion neutrino to the muon." },
  { id: "ta",  symbol: "τ",   name: "Tau",            family: "lepton", row: 2, col: 2, mass: "1.78 GeV/c²",  charge: "−1",     role: "Generation III heavy lepton. Lives 290 fs before decaying." },
  { id: "nt",  symbol: "νᵗ",  name: "Tau ν",         family: "lepton", row: 3, col: 2, mass: "< 18 MeV/c²",   charge: "0",      role: "Tau's neutrino partner." },
  /* Gauge bosons */
  { id: "g",   symbol: "g",   name: "Gluon",          family: "boson",  row: 0, col: 4, mass: "0 (massless)", charge: "0",      role: "Carrier of the Strong force. Glues quarks into hadrons." },
  { id: "ph",  symbol: "γ",   name: "Photon",         family: "boson",  row: 1, col: 4, mass: "0 (massless)", charge: "0",      role: "Carrier of Electromagnetism. The quantum of light." },
  { id: "z",   symbol: "Z⁰",  name: "Z boson",        family: "boson",  row: 2, col: 4, mass: "91.2 GeV/c²",  charge: "0",      role: "Neutral weak-force carrier. Mediates neutral-current weak interactions." },
  { id: "w",   symbol: "W±",  name: "W boson",        family: "boson",  row: 3, col: 4, mass: "80.4 GeV/c²",  charge: "±1",     role: "Charged weak-force carrier. Mediates radioactive decay; flips quark flavours." },
  /* Higgs */
  { id: "h",   symbol: "H",   name: "Higgs boson",    family: "higgs",  row: 1.5, col: 5.5, mass: "125 GeV/c²", charge: "0",   role: "The mass-giver. Particles gain mass by interacting with the Higgs field permeating space. Discovered at the LHC in 2012." },
];

const familyColor: Record<Particle["family"], string> = {
  quark: "rgb(var(--c-accent-rgb))",
  lepton: "rgb(140 100 220)",
  boson: "rgb(var(--c-solar-rgb))",
  higgs: "rgb(220 80 120)",
};
const familyLabel: Record<Particle["family"], string> = {
  quark: "quark · brick",
  lepton: "lepton · brick",
  boson: "gauge boson · mortar",
  higgs: "scalar · mass-giver",
};

export function StandardModelPanel() {
  const [sel, setSel] = useState<string>("h");
  const W = 760;
  const H = 380;
  const cellW = 96;
  const cellH = 76;
  const gridOriginX = 76;
  const gridOriginY = 60;

  const cur = PARTICLES.find((p) => p.id === sel)!;
  return (
    <FigurePanel
      idx="1.2.a"
      kicker="The Standard Model · Bricks & Mortar"
      caption="Seventeen particles that build the entire physical Universe. Click any one to inspect its mass, charge, and role. Quarks and leptons are the 'bricks'; gauge bosons are the 'mortar' that holds them together; the Higgs is what gives the bricks their weight."
    >
      <div className="fig-viz relative w-full overflow-hidden rounded-md">
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
            fill="rgb(var(--c-accent-rgb) / 0.85)"
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
            fill="rgb(140 100 220)"
          >
            LEPTONS
          </text>

          {/* Particle cells. Each cell carries `data-shortcut="N"` so the
             FigureFrame global navigator treats this as a pill set —
             ←/→ walks through the 17 particles in document order, and
             `aria-pressed` flags the selected one. */}
          {PARTICLES.map((p, i) => {
            const x = gridOriginX + p.col * cellW;
            const y = gridOriginY + p.row * cellH;
            const isSel = p.id === sel;
            return (
              <g
                key={p.id}
                onClick={() => setSel(p.id)}
                style={{ cursor: "pointer" }}
                data-shortcut={String(i + 1)}
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
                  fill={isSel ? "rgb(var(--c-accent-rgb) / 0.18)" : "rgb(var(--c-text-rgb) / 0.04)"}
                  stroke={isSel ? familyColor[p.family] : "rgb(var(--c-text-rgb) / 0.12)"}
                  strokeWidth={isSel ? 2 : 1}
                  style={{
                    filter: isSel ? `drop-shadow(0 0 12px ${familyColor[p.family]}55)` : "none",
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
                  fill={isSel ? familyColor[p.family] : "rgb(var(--c-text-rgb) / 0.95)"}
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
                  fill={isSel ? familyColor[p.family] : "rgb(var(--c-text-rgb) / 0.8)"}
                >
                  {p.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className="mt-4 grid md:grid-cols-[180px_1fr] gap-4 p-3 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">family</div>
          <div className="font-mono text-[11px] tracking-[0.18em] mt-1" style={{ color: familyColor[cur.family] }}>
            {familyLabel[cur.family]}
          </div>
          <div className="font-mono text-[10px] mt-3 text-white/70">m = {cur.mass}</div>
          <div className="font-mono text-[10px] text-white/70">q = {cur.charge}</div>
        </div>
        <div className="text-[13px] text-white/85 leading-[1.6] font-sans min-h-[6.8em]">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-plasma mb-2">{cur.name.toUpperCase()}</div>
          {cur.role}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Pair Annihilation & 1-in-a-billion ─────────────────────────────
   Two-act demo. Act 1: an electron and a positron approach and meet at
   the centre; on collision a flash → two gamma photons fly out.
   Act 2: a "billion-and-one" comparison showing matter–antimatter
   asymmetry — every visible particle today is the lone survivor of an
   otherwise perfect annihilation. */

export function AntiparticleAnnihilationPanel() {
  const [phase, setPhase] = useState<number>(0); // 0 idle, 1 approach, 2 flash, 3 photons
  const [playKey, setPlayKey] = useState(0);
  const W = 720;
  const H = 220;
  const cx = W / 2;
  const cy = H / 2;

  /* Animation phases */
  useEffect(() => {
    if (phase === 0) return;
    let raf = 0;
    const t0 = performance.now();
    function step(now: number) {
      const elapsed = (now - t0) / 1000;
      if (elapsed < 1.0) setPhase(1);
      else if (elapsed < 1.4) setPhase(2);
      else if (elapsed < 3.5) setPhase(3);
      else setPhase(0);
      if (elapsed < 3.5) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playKey]);

  /* Position of e- and e+ during approach */
  const dist = phase === 1 ? 60 : phase === 0 ? 200 : 0; // closer as phase increases
  const exitDist = phase === 3 ? 240 : 0;
  const flashAlpha = phase === 2 ? 1 : phase === 3 ? Math.max(0, 1 - exitDist / 200) : 0;

  return (
    <FigurePanel
      idx="1.2.b"
      kicker="Annihilation · One in a Billion Survived"
      caption="Matter and antimatter annihilate on contact — particle plus antiparticle = pure energy. Play the animation to watch an electron meet a positron and become two gamma photons. Then look at the cosmic asymmetry: a billion-and-one to a billion. The Universe you live in is built from the leftover survivors."
    >
      <div className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Centre marker */}
          <circle
            cx={cx}
            cy={cy}
            r={phase === 2 ? 28 : 0}
            fill="rgb(var(--c-text-rgb))"
            opacity={flashAlpha}
            style={{
              filter: `drop-shadow(0 0 ${24 * flashAlpha}px rgb(var(--c-accent-rgb) / 0.9))`,
              transition: "r 200ms var(--ease), opacity 400ms var(--ease)",
            }}
          />

          {/* Electron — left side */}
          {phase < 2 && (
            <g style={{ transition: "transform 1000ms var(--ease)", transform: phase === 1 ? `translate(${200 - dist}px, 0)` : "translate(0, 0)" }}>
              <circle cx={cx - 200} cy={cy} r="10" fill="rgb(var(--c-accent-rgb))" />
              <text x={cx - 200} y={cy + 4} textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-bg-rgb))">
                e⁻
              </text>
              <text x={cx - 200} y={cy + 30} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb) / 0.85)">
                electron
              </text>
            </g>
          )}
          {/* Positron — right side */}
          {phase < 2 && (
            <g style={{ transition: "transform 1000ms var(--ease)", transform: phase === 1 ? `translate(${-(200 - dist)}px, 0)` : "translate(0, 0)" }}>
              <circle cx={cx + 200} cy={cy} r="10" fill="rgb(var(--c-solar-rgb))" />
              <text x={cx + 200} y={cy + 4} textAnchor="middle" fontSize="11" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-bg-rgb))">
                e⁺
              </text>
              <text x={cx + 200} y={cy + 30} textAnchor="middle" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-solar-rgb) / 0.85)">
                positron
              </text>
            </g>
          )}

          {/* Two gamma photons fly out after the flash */}
          {phase === 3 && (
            <>
              <g style={{ transition: "transform 2000ms var(--ease)", transform: `translate(${-exitDist}px, ${-exitDist * 0.4}px)` }}>
                <path
                  d={`M ${cx} ${cy} q -20 -8 -40 0 q -20 8 -40 0 q -20 -8 -40 0`}
                  stroke="rgb(var(--c-accent-rgb))"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <text x={cx - 130} y={cy - 50} fontSize="14" fontFamily="var(--font-serif)" fontStyle="italic" fill="rgb(var(--c-accent-rgb))">γ</text>
              </g>
              <g style={{ transition: "transform 2000ms var(--ease)", transform: `translate(${exitDist}px, ${exitDist * 0.4}px)` }}>
                <path
                  d={`M ${cx} ${cy} q 20 8 40 0 q 20 -8 40 0 q 20 8 40 0`}
                  stroke="rgb(var(--c-accent-rgb))"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <text x={cx + 130} y={cy + 50} fontSize="14" fontFamily="var(--font-serif)" fontStyle="italic" fill="rgb(var(--c-accent-rgb))">γ</text>
              </g>
            </>
          )}
        </svg>
      </div>
      <div className="mt-4 flex gap-3 flex-wrap items-center">
        <button
          type="button"
          onClick={() => { setPhase(1); setPlayKey((k) => k + 1); }}
          className="pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.22em] uppercase"
        >
          {phase === 0 ? "▶ annihilate" : "■ replay"}
        </button>
        <div className="text-[12px] text-white/65 font-sans">
          <span className="font-mono text-plasma tracking-[0.14em]">e⁻ + e⁺ → γ + γ</span>{" "}
          · mass converted directly into two gamma photons of equal energy.{" "}
          <span className="font-mono text-white/45">← / → replays</span>
        </div>
        {/* Hidden keyboard hooks: ←/→ keys (and wheel in fullscreen)
           replay the annihilation. FigureFrame's global navigator
           routes ArrowLeft/ArrowRight to elements carrying these
           data-shortcuts before falling back to sliders or pills. */}
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          data-shortcut="ArrowLeft"
          onClick={() => { setPhase(1); setPlayKey((k) => k + 1); }}
          style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}
        >
          replay
        </button>
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          data-shortcut="ArrowRight"
          onClick={() => { setPhase(1); setPlayKey((k) => k + 1); }}
          style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}
        >
          replay
        </button>
      </div>

      <div
        className="mt-6 p-4 rounded-md grid sm:grid-cols-2 gap-4"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mb-2">cosmic asymmetry</div>
          <div className="text-[14px] text-white/85 leading-[1.6]">
            For every billion antimatter particles in the early Universe,
            there were about a <strong>billion-and-one</strong> matter particles.
            Everything you can see is the leftover <em>one</em>.
          </div>
        </div>
        <div className="flex flex-col items-end justify-center">
          <div className="font-mono text-[10px] tracking-[0.18em] text-white/55">matter / antimatter ratio</div>
          <div className="font-serif font-medium" style={{ fontSize: "2.2rem", color: "var(--c-accent)", lineHeight: 1 }}>
            10⁹ + 1 <span className="text-white/45 font-mono text-[1.4rem] ml-1">: 10⁹</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] mt-1 text-white/50">
            survivors = 1 in 10⁹
          </div>
        </div>
      </div>
    </FigurePanel>
  );
}
