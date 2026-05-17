import { useState, type ReactNode } from "react";

function FigurePanel({ idx, kicker, caption, children }: { idx: string; kicker: string; caption: ReactNode; children: ReactNode }) {
  return (
    <figure data-fade className="my-12">
      <div className="figure-stub rounded-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/70">
            <span className="inline-block w-2 h-2 rounded-full bg-plasma/70 shadow-[0_0_8px_var(--c-accent)] mr-2 align-middle"></span>
            figure {idx} · {kicker}
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60">interactive</div>
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

/* ── ForceSeparation: cosmic-tree of force decoupling ─────────────────
   A branching diagram showing one Superforce at the left, branching to
   four distinct forces at the right as the universe cools. The user's
   slider sweeps a "current time" cursor through three phase transitions;
   active branches glow. */
type Stage = { t: number; T: number; label: string; phase: string };
const STAGES: Stage[] = [
  { t: 0, T: Infinity, label: "Big Bang", phase: "Singularity" },
  { t: 1e-43, T: 1e32, label: "Planck Epoch", phase: "All forces unified" },
  { t: 1e-35, T: 1e28, label: "Inflation", phase: "Strong separates" },
  { t: 1e-12, T: 1e15, label: "Electroweak Split", phase: "EM + Weak separate" },
  { t: 1, T: 1e10, label: "Now (lepton era)", phase: "Four distinct forces" },
];
const SEP_GRAVITY = Math.log10(1e-43);
const SEP_STRONG = Math.log10(1e-35);
const SEP_EW = Math.log10(1e-12);

export function ForceSeparationPanel() {
  const [logT, setLogT] = useState(-30); // somewhere mid-inflation by default
  const W = 720;
  const H = 320;
  const PAD = 60;

  /* Branch line endpoints */
  const xMin = PAD;
  const xMax = W - PAD;
  const cyMid = H / 2;
  /* Phase transition x positions on a log scale −44 → 1 */
  const lMin = -44;
  const lMax = 1;
  function xOf(l: number) {
    return xMin + ((l - lMin) / (lMax - lMin)) * (xMax - xMin);
  }
  const xGravity = xOf(SEP_GRAVITY);
  const xStrong = xOf(SEP_STRONG);
  const xEw = xOf(SEP_EW);
  const xCur = xOf(logT);

  /* Four force y positions at the right */
  const yGravity = 40;
  const yStrong = 120;
  const yEm = 200;
  const yWeak = 280;

  const sep = {
    gravity: logT > SEP_GRAVITY,
    strong: logT > SEP_STRONG,
    ew: logT > SEP_EW,
  };

  function branchPath(yEnd: number, splitX: number, active: boolean) {
    /* Curved branch from splitX/cyMid to xMax/yEnd */
    return `M ${splitX} ${cyMid} C ${splitX + 60} ${cyMid}, ${xMax - 100} ${yEnd}, ${xMax} ${yEnd}`;
  }

  return (
    <FigurePanel
      idx="1.1.1"
      kicker="Force Separation · One Becomes Four"
      caption="Slide the cursor through cosmic time. Three phase transitions split the original Superforce: gravity decouples at the Planck epoch, the strong force at the inflation epoch, and electromagnetism + the weak force part ways at one trillionth of a second."
    >
      <div className="relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* Trunk: Superforce */}
          <path
            d={`M ${xMin} ${cyMid} L ${xGravity} ${cyMid}`}
            stroke={logT < SEP_GRAVITY ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.35)"}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <text
            x={xMin + 8}
            y={cyMid - 12}
            fontSize="11"
            letterSpacing="2"
            fontFamily="var(--font-mono)"
            fill={logT < SEP_GRAVITY ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.55)"}
          >
            SUPERFORCE
          </text>

          {/* Gravity branch up */}
          <path
            d={branchPath(yGravity, xGravity, sep.gravity)}
            stroke={sep.gravity ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.18)"}
            strokeWidth={sep.gravity ? 2.2 : 1.2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={sep.gravity ? "0" : "2 4"}
            style={{
              filter: sep.gravity ? "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.5))" : "none",
            }}
          />
          {/* Remaining trunk (strong+ew) from xGravity onward */}
          <path
            d={`M ${xGravity} ${cyMid + 60} L ${xStrong} ${cyMid + 60}`}
            stroke={sep.gravity && !sep.strong ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.35)"}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Connector from main trunk down to remaining trunk */}
          <path
            d={`M ${xGravity} ${cyMid} L ${xGravity} ${cyMid + 60}`}
            stroke="rgb(var(--c-text-rgb) / 0.25)"
            strokeWidth="0.8"
            fill="none"
          />
          {/* Strong branch */}
          <path
            d={branchPath(yStrong, xStrong, sep.strong)}
            stroke={sep.strong ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.18)"}
            strokeWidth={sep.strong ? 2.2 : 1.2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={sep.strong ? "0" : "2 4"}
            style={{
              filter: sep.strong ? "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.5))" : "none",
            }}
          />
          {/* Electroweak trunk */}
          <path
            d={`M ${xStrong} ${cyMid + 100} L ${xEw} ${cyMid + 100}`}
            stroke={sep.strong && !sep.ew ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.35)"}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${xStrong} ${cyMid + 60} L ${xStrong} ${cyMid + 100}`}
            stroke="rgb(var(--c-text-rgb) / 0.25)"
            strokeWidth="0.8"
            fill="none"
          />
          {/* EM + Weak branches */}
          <path
            d={branchPath(yEm, xEw, sep.ew)}
            stroke={sep.ew ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.18)"}
            strokeWidth={sep.ew ? 2.2 : 1.2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={sep.ew ? "0" : "2 4"}
            style={{
              filter: sep.ew ? "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.5))" : "none",
            }}
          />
          <path
            d={branchPath(yWeak, xEw, sep.ew)}
            stroke={sep.ew ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.18)"}
            strokeWidth={sep.ew ? 2.2 : 1.2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={sep.ew ? "0" : "2 4"}
            style={{
              filter: sep.ew ? "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.5))" : "none",
            }}
          />

          {/* Phase-transition tick markers */}
          {[
            { x: xGravity, label: "10⁻⁴³ s" },
            { x: xStrong, label: "10⁻³⁵ s" },
            { x: xEw, label: "10⁻¹² s" },
          ].map((m, i) => (
            <g key={i}>
              <line x1={m.x} y1={H - 36} x2={m.x} y2={H - 28} stroke="rgb(var(--c-text-rgb) / 0.3)" />
              <text
                x={m.x}
                y={H - 16}
                textAnchor="middle"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fill="rgb(var(--c-text-rgb) / 0.55)"
              >
                {m.label}
              </text>
            </g>
          ))}

          {/* End labels */}
          {[
            { y: yGravity, name: "Gravity", lit: sep.gravity },
            { y: yStrong, name: "Strong", lit: sep.strong },
            { y: yEm, name: "Electromagnetism", lit: sep.ew },
            { y: yWeak, name: "Weak", lit: sep.ew },
          ].map((f, i) => (
            <g key={i}>
              <circle
                cx={xMax}
                cy={f.y}
                r={f.lit ? 6 : 4}
                fill={f.lit ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.4)"}
                style={{
                  filter: f.lit ? "drop-shadow(0 0 10px rgb(var(--c-accent-rgb) / 0.7))" : "none",
                }}
              />
              <text
                x={xMax - 10}
                y={f.y + 4}
                textAnchor="end"
                fontSize="12"
                fontFamily="var(--font-serif)"
                fontStyle="italic"
                fill={f.lit ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}
              >
                {f.name}
              </text>
            </g>
          ))}

          {/* Current time cursor */}
          <line
            x1={xCur}
            x2={xCur}
            y1={20}
            y2={H - 36}
            stroke="rgb(var(--c-text-rgb) / 0.85)"
            strokeWidth="1.4"
          />
          <text
            x={xCur}
            y={14}
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-mono)"
            letterSpacing="2"
            fill="rgb(var(--c-text-rgb))"
          >
            t = 10^{logT.toFixed(0)} s
          </text>
        </svg>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">scrub time</label>
          <span className="font-mono text-[10px] text-plasma">
            log₁₀(t) = {logT.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min={-44}
          max={1}
          step={0.1}
          value={logT}
          onChange={(e) => setLogT(parseFloat(e.target.value))}
          className="cosmic-slider"
        />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1">
          <span>Planck epoch</span>
          <span>EW split</span>
          <span>1 s</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── ForceStrengthLadder ─────────────────────────────────────────────
   Four forces ranked by relative strength on a log scale. Click each
   to see its carrier particle, range, and what it does. */
type Force = {
  id: string;
  name: string;
  rel: number; // relative strength
  carrier: string;
  range: string;
  role: string;
};
const FORCES: Force[] = [
  { id: "strong", name: "Strong Nuclear", rel: 1, carrier: "gluon (g) · massless", range: "~10⁻¹⁵ m (atomic nucleus)", role: "Universal glue. Binds quarks into protons/neutrons and holds nuclei intact against electric repulsion. Without it, no element heavier than hydrogen could exist." },
  { id: "em", name: "Electromagnetism", rel: 1e-2, carrier: "photon (γ) · massless", range: "infinite (1/r² fall-off)", role: "Rules of chemistry. Binds electrons to nuclei, makes atoms and molecules, carries light. Without it, no atoms, no solids, no us." },
  { id: "weak", name: "Weak Nuclear", rel: 1e-5, carrier: "W⁺, W⁻, Z⁰ · massive bosons", range: "~10⁻¹⁸ m (sub-nucleus)", role: "Force of transmutation. Drives radioactive decay, neutrino interactions, and the proton-proton fusion that powers the Sun." },
  { id: "gravity", name: "Gravity", rel: 1e-39, carrier: "graviton (hypothetical)", range: "infinite", role: "The feeblest force — and the sculptor of cosmic structure. In Einstein's framework, gravity is the curvature of spacetime by mass-energy." },
];

export function ForceStrengthLadderPanel() {
  const [sel, setSel] = useState<string>("strong");
  const max = FORCES[0].rel;
  const logMax = Math.log10(max);
  const logMin = Math.log10(FORCES[3].rel);
  function widthOf(rel: number) {
    const v = Math.log10(rel);
    return Math.max(0.04, (v - logMin) / (logMax - logMin)) * 100;
  }
  const cur = FORCES.find((f) => f.id === sel)!;
  return (
    <FigurePanel
      idx="1.1.2"
      kicker="Hierarchy of Strengths · 39 Orders of Magnitude"
      caption="The four forces span an absurd range. Strong sets the scale at 1. EM is 100× weaker. Weak is 100,000× weaker than strong. Gravity is a billion-billion-billion-billion times weaker than EM — and yet it built the galaxies."
    >
      <ol className="flex flex-col gap-2 my-2">
        {FORCES.map((f) => {
          const isSel = sel === f.id;
          return (
            <li
              key={f.id}
              onClick={() => setSel(f.id)}
              className="grid grid-cols-[140px_1fr_120px] gap-3 items-center cursor-pointer"
            >
              <div
                className="font-serif text-[14px] leading-tight"
                style={{ color: isSel ? "var(--c-accent)" : "var(--c-text-strong)", transition: "color 200ms var(--ease)" }}
              >
                {f.name}
              </div>
              <div className="relative h-6 rounded-full overflow-hidden" style={{ background: "rgb(var(--c-text-rgb) / 0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${widthOf(f.rel)}%`,
                    background: isSel
                      ? "linear-gradient(90deg, rgb(var(--c-accent-rgb) / 0.85), rgb(var(--c-accent-rgb) / 0.55))"
                      : "linear-gradient(90deg, rgb(var(--c-accent-rgb) / 0.55), rgb(var(--c-accent-rgb) / 0.3))",
                    boxShadow: isSel ? "0 0 18px rgb(var(--c-accent-rgb) / 0.4)" : "none",
                    transition: "width 600ms var(--ease), background 200ms var(--ease)",
                  }}
                />
              </div>
              <div
                className="font-mono text-[11px] tracking-[0.1em] text-right"
                style={{ color: isSel ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.7)" }}
              >
                {f.rel === 1 ? "1" : `10^${Math.log10(f.rel).toFixed(0)}`}
              </div>
            </li>
          );
        })}
      </ol>
      <div
        className="mt-4 grid md:grid-cols-[160px_1fr] gap-4 p-3 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55">carrier</div>
          <div className="font-serif font-medium mt-1" style={{ fontSize: "1.1rem", color: "var(--c-accent)" }}>
            {cur.carrier}
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] mt-2 text-white/60">range · {cur.range}</div>
        </div>
        <div className="text-[13px] text-white/80 leading-[1.6] font-sans">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-plasma mb-2">{cur.name.toUpperCase()}</div>
          {cur.role}
        </div>
      </div>
    </FigurePanel>
  );
}
