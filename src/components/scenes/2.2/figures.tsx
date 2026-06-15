import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { withBase } from "../../../data/course-nav";

/* Shared figure shell — mirrors the chapter-0/1 pattern. */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  fitFs = false,
  imgZoom = false,
  vizFill = false,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  fitFs?: boolean;
  imgZoom?: boolean;
  vizFill?: boolean;
}) {
  return (
    <figure data-fade className={`figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}${imgZoom ? " is-img-zoom" : ""}${vizFill ? " is-fs-fill" : ""}`}>
      <div className="figure-body">{children}</div>
      <figcaption>
        <span className="figure-tag">Fig. {idx}</span>
        <span className="figure-title"> — {kicker}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
}

/* Tracks `.is-fs` on the enclosing FigureFrame so HTML controls/readouts can
   scale up in fullscreen (the SVG/canvas scale on their own). */
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
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setR(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return r;
}

/* Off-screen real <button>s for FigureFrame's keyboard navigator (it fires
   shortcuts via .click(), which SVG/canvas can't receive). */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ════════════════════════════════════════════════════════════════════
   2.2.a · The Hubble tuning fork, across cosmic time.
   A bespoke rebuild of the NASA/ESA/M. Kornmesser three-epoch diagram
   (knowledgebase media galclass.webp): the present-day classification
   (ellipticals → lenticular → spiral / barred-spiral prongs), with a
   TIME slider that morphs every galaxy between its settled shape today
   and the small, clumpy, irregular progenitor it grew from. ══════════ */

type ForkNode = { id: string; kind: "E" | "S0" | "S" | "SB"; n: number; cx: number; cy: number; label: string };

const R_ICON = 36;
/* Reserved x/y slots on the fork (viewBox 1000×540), mid-line y = 250. */
const NODES: ForkNode[] = [
  { id: "E0", kind: "E", n: 0, cx: 95, cy: 250, label: "E0" },
  { id: "E4", kind: "E", n: 4, cx: 200, cy: 250, label: "E4" },
  { id: "E7", kind: "E", n: 7, cx: 305, cy: 250, label: "E7" },
  { id: "S0", kind: "S0", n: 0, cx: 405, cy: 250, label: "S0" },
  { id: "Sa", kind: "S", n: 0, cx: 560, cy: 150, label: "Sa" },
  { id: "Sb", kind: "S", n: 1, cx: 700, cy: 120, label: "Sb" },
  { id: "Sc", kind: "S", n: 2, cx: 840, cy: 120, label: "Sc" },
  { id: "SBa", kind: "SB", n: 0, cx: 560, cy: 350, label: "SBa" },
  { id: "SBb", kind: "SB", n: 1, cx: 700, cy: 380, label: "SBb" },
  { id: "SBc", kind: "SB", n: 2, cx: 840, cy: 380, label: "SBc" },
];

/* Colour carries the physics: BLUE = young, gas-rich, actively star-forming;
   RED/GOLD = old, quenched stars. So the morph is meaningful, not decorative —
   ellipticals quench (blue→red, "red and dead"), while spirals keep blue,
   star-forming arms around an ageing golden bulge. */
const C_YOUNG = "#6c9ff0";       // blue, star-forming
const C_KNOT = "#dbe8ff";        // bright HII knot
const C_OLD = "#d98a52";         // old / quenched red-gold
const C_OLD_BRIGHT = "#f3ca97";
const C_BULGE = "#ecbb6a";       // ageing golden bulge of a spiral
const C_ARM = "#8fb6f5";         // blue spiral arm

/* Deterministic clump offsets (units of R) for the early, fragmentary galaxy. */
const CLUMPS: [number, number, number][] = [
  [-0.34, -0.2, 0.46], [0.3, -0.1, 0.54], [0.05, 0.36, 0.4], [0.4, 0.28, 0.32], [-0.38, 0.26, 0.36], [-0.04, -0.42, 0.32],
];

/* Two-arm log spiral scaled to an icon of radius R. */
function arm(cx: number, cy: number, R: number, startDeg: number, turns: number): string {
  const steps = 26, rs = R * 0.16, re = R * 0.98;
  const b = Math.log(re / rs) / (turns * 2 * Math.PI);
  const out: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * turns * 2 * Math.PI;
    const r = rs * Math.exp(b * th);
    const a = (startDeg * Math.PI) / 180 + th;
    out.push(`${i ? "L" : "M"} ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return out.join(" ");
}

/* One galaxy, cross-fading from its early state — a small, clumpy, BLUE
   star-forming fragment whose clumps drift inward as it assembles — into its
   settled present-day shape AND colour. The colour shift (ellipticals quench to
   red; spirals keep blue arms) and the structural ordering are the meaning. */
function GalaxyIcon({ node, m }: { node: ForkNode; m: number }): JSX.Element {
  const { cx, cy, kind, n } = node;
  const R = R_ICON * (0.5 + 0.5 * m); // mass and size build up over time
  const bulge = [0.46, 0.32, 0.2][n] ?? 0.3; // Sa big bulge → Sc small
  const turns = [0.95, 0.7, 0.5][n] ?? 0.7;  // Sa tight → Sc loose arms
  const conv = 1 - 0.55 * m; // clumps converge toward centre as the galaxy assembles
  const b = Math.log(0.98 / 0.16) / (turns * 2 * Math.PI);

  return (
    <g>
      {/* early: clumpy blue star-forming fragment */}
      <g opacity={1 - m}>
        <circle cx={cx} cy={cy} r={R * 0.95} fill={C_YOUNG} opacity={0.13} />
        {CLUMPS.map(([dx, dy, r], i) => (
          <circle key={i} cx={cx + dx * R * conv} cy={cy + dy * R * conv} r={r * R * 0.62} fill={i % 2 ? C_KNOT : C_YOUNG} opacity={0.9} />
        ))}
      </g>

      {/* settled present-day morphology */}
      <g opacity={m}>
        {kind === "E" && (
          <g transform={`rotate(-25 ${cx} ${cy})`}>
            {/* one gradient-filled oval → a luminous 3-D ellipsoid (bright,
                centrally-concentrated core fading softly at the rim) */}
            <ellipse cx={cx} cy={cy} rx={R * 1.08} ry={R * 1.08 * (1 - n / 11)} fill="url(#ell-grad)" />
          </g>
        )}
        {kind === "S0" && (
          <g transform={`rotate(-20 ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.32} fill={C_OLD} opacity={0.5} />
            <ellipse cx={cx} cy={cy} rx={R * 0.46} ry={R * 0.42} fill={C_OLD_BRIGHT} opacity={0.95} />
          </g>
        )}
        {(kind === "S" || kind === "SB") && (
          <g>
            <circle cx={cx} cy={cy} r={R} fill={C_ARM} opacity={0.12} />
            {[0, 180].map((a) => (
              <path key={a} d={arm(cx, cy, R, a, turns)} fill="none" stroke={C_ARM} strokeWidth={R * 0.14} strokeLinecap="round" opacity={0.95} />
            ))}
            {/* blue HII knots strung along the arms — ongoing star formation */}
            {[0, 180].flatMap((a) => [0.4, 0.72].map((f) => {
              const th = f * turns * 2 * Math.PI;
              const rr = R * 0.16 * Math.exp(b * th);
              const ang = (a * Math.PI) / 180 + th;
              return <circle key={`${a}-${f}`} cx={cx + rr * Math.cos(ang)} cy={cy + rr * Math.sin(ang)} r={R * 0.07} fill={C_KNOT} opacity={0.95} />;
            }))}
            {kind === "SB" && (
              <rect x={cx - R * 0.6} y={cy - R * 0.09} width={R * 1.2} height={R * 0.18} rx={R * 0.09} fill={C_BULGE} transform={`rotate(18 ${cx} ${cy})`} />
            )}
            <circle cx={cx} cy={cy} r={R * bulge} fill={C_BULGE} />
          </g>
        )}
      </g>
    </g>
  );
}

/* Cosmic-time epochs keyed off the slider fraction t (0 = early, 1 = today). */
function epochFor(t: number): { lookback: string; name: string; desc: string } {
  if (t < 0.22) return { lookback: "≈ 11 billion years ago", name: "Cosmic dawn of galaxies", desc: "Small, gas-rich, furiously star-forming fragments — clumpy and irregular, colliding constantly. Few have yet settled into the spiral or elliptical shapes we know." };
  if (t < 0.5) return { lookback: "≈ 8 billion years ago", name: "Cosmic noon", desc: "Star formation peaks. Thick, turbulent disks are rotating, and big ellipticals are being built up as galaxies merge and pile their stars together." };
  if (t < 0.82) return { lookback: "≈ 4 billion years ago", name: "Settling down", desc: "Mergers grow rarer as the universe expands and spreads galaxies apart. Grand spiral arms and smooth ellipticals take on the forms we recognise." };
  return { lookback: "today", name: "The local universe", desc: "The settled morphologies Hubble's fork classifies. Most galaxies now drift in calm isolation, their shapes the fossil record of 11 billion years of growth." };
}

export function TuningForkPanel(): JSX.Element {
  const [t, setT] = useState(1); // 0 = early universe, 1 = today
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const m = t * t * (3 - 2 * t); // smoothstep maturity
  const epoch = epochFor(t);

  /* fork connector polylines */
  const handle = "M 60 250 L 460 250";
  const topArm = "M 460 250 L 525 150 L 700 120 L 840 120";
  const botArm = "M 460 250 L 525 350 L 700 380 L 840 380";

  return (
    <FigurePanel
      idx="2.2.a"
      kicker="The Hubble Tuning Fork, across cosmic time"
      caption={
        <>
          Edwin Hubble's 1936 classification: the elliptical handle (round E0 to cigar-shaped E7), the lenticular
          hinge (S0), and two prongs of spirals — ordinary (Sa–Sc) and barred (SBa–SBc). Drag the time slider (or use
          ← / →) to wind cosmic history back: every galaxy shrinks into the small, clumpy, blue star-forming fragment
          it grew from. Watch the colours — ellipticals quench from blue to red ("red and dead"), while spirals keep
          blue, star-forming arms around an ageing golden bulge. The fork is a snapshot of shapes today, <em>not</em> a
          sequence of ageing, and not a ladder a galaxy climbs.
        </>
      }
    >
      {/* Always-dark "cosmic porthole": galaxy colours are fixed light tones,
          so pin the dark theme tokens in BOTH site themes. */}
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ background: "#06070e", border: "1px solid rgb(255 255 255 / 0.07)", padding: "6px 8px" }}
      >
        <svg viewBox="0 0 1000 540" preserveAspectRatio="xMidYMid meet" role="img" aria-label="The Hubble tuning fork of galaxy types, morphing between settled shapes today and clumpy progenitors in the early universe" style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Soft radial fill so the ellipticals read as glowing 3-D ellipsoids
              (bright core fading to a soft edge), not flat disks. */}
          <defs>
            <radialGradient id="ell-grad" cx="48%" cy="44%" r="60%">
              <stop offset="0%" stopColor="#fff4e3" stopOpacity={1} />
              <stop offset="24%" stopColor="#f3ca97" stopOpacity={0.98} />
              <stop offset="58%" stopColor="#d98a52" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#bf7740" stopOpacity={0} />
            </radialGradient>
          </defs>
          {/* lookback epoch label */}
          <text x={970} y={44} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="22" fill="rgb(var(--c-text-rgb) / 0.85)">{epoch.lookback}</text>
          <text x={970} y={66} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" letterSpacing="2" fill="#7cc4ff">{epoch.name.toUpperCase()}</text>

          {/* colour legend — what the tints mean */}
          <g fontFamily="Inter, sans-serif" fontSize="12.5" fill="rgb(var(--c-text-rgb) / 0.7)">
            <circle cx={36} cy={28} r={6.5} fill={C_YOUNG} />
            <text x={49} y={32}>young, forming stars</text>
            <circle cx={36} cy={52} r={6.5} fill={C_OLD} />
            <text x={49} y={56}>old, quenched</text>
          </g>

          {/* fork skeleton — fades in as morphologies settle */}
          <g stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={2} fill="none" opacity={0.35 + 0.5 * m}>
            <path d={handle} />
            <path d={topArm} />
            <path d={botArm} />
          </g>

          {/* section labels */}
          <g fontFamily="Inter, sans-serif" fontSize="13" fill="rgb(var(--c-text-rgb) / 0.55)" letterSpacing="0.12em">
            <text x={200} y={330} textAnchor="middle">ELLIPTICAL</text>
            <text x={405} y={330} textAnchor="middle">LENTICULAR</text>
            <text x={700} y={70} textAnchor="middle">SPIRAL</text>
            <text x={700} y={445} textAnchor="middle">BARRED SPIRAL</text>
          </g>

          {/* galaxies + their type labels */}
          {NODES.map((node) => (
            <g key={node.id}>
              <GalaxyIcon node={node} m={m} />
              <text x={node.cx} y={node.cy + R_ICON + 22} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fill="rgb(var(--c-text-rgb) / 0.8)">{node.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* time slider */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>cosmic time — drag from the early universe to today →</label>
          <span className="font-mono text-[10px] text-plasma" style={{ fontSize: sz(0.62) }}>{epoch.lookback}</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Cosmic time — left/right arrows wind from the early universe to today" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>early universe · clumpy fragments</span>
          <span>today · settled shapes</span>
        </div>
      </div>

      {/* readout */}
      <div className="mt-4 rounded-md p-3" style={{ background: "rgb(124 196 255 / 0.06)", border: "1px solid rgb(124 196 255 / 0.2)", flexShrink: 0 }}>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: "#7cc4ff", fontSize: sz(0.7) }}>{epoch.name}</div>
        <div className="mt-1 text-[14px] text-white/85 leading-[1.55] font-sans" style={{ fontSize: sz(0.9), minHeight: "4.6em" }}>{epoch.desc}</div>
      </div>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.2.b · The AGN unified model in 3D.
   One object — a supermassive black hole, its accretion disk, a dusty
   torus, broad/narrow-line clouds and bipolar jets — seen from a viewing
   angle the reader controls. The angle decides which "type" we'd call it.
   A bespoke rebuild of the unified-model schematic (media agn.webp).
   Jet axis = +y; disk + torus lie in the equatorial (x-z) plane. ══════ */

const JET_C = "#38d6f0";
const DISK_C = "#ff9a3c";
const BLR_C = "#cfe6ff";
const NLR_C = "#d98cff";

/* Deterministic cloud positions (no RNG). */
const BLR_CLOUDS: [number, number, number][] = [
  [0.7, 0.08, 0.2], [-0.55, -0.06, 0.5], [0.3, 0.05, -0.7], [-0.4, 0.04, 0.6], [0.6, -0.05, -0.35], [-0.7, 0.02, -0.2],
];
function nlrCloud(i: number, sign: number): [number, number, number] {
  const az = i * 1.3; const rad = 0.5 + 0.42 * i;
  return [rad * Math.cos(az), sign * (1.0 + 0.42 * i), rad * Math.sin(az)];
}

function AgnCamera({ inclDeg, azRef, dragRef, reduced }: { inclDeg: number; azRef: { current: number }; dragRef: { current: boolean }; reduced: boolean }) {
  useFrame((state, delta) => {
    if (!dragRef.current && !reduced) azRef.current += delta * 0.32;
    const polar = THREE.MathUtils.degToRad(Math.max(3, Math.min(89, inclDeg)));
    const r = 6.4, sp = Math.sin(polar), az = azRef.current;
    state.camera.position.set(r * sp * Math.sin(az), r * Math.cos(polar), r * sp * Math.cos(az));
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function AgnScene({ inclDeg, azRef, dragRef, reduced }: { inclDeg: number; azRef: { current: number }; dragRef: { current: boolean }; reduced: boolean }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 3]} intensity={0.5} />
      <hemisphereLight args={["#2a2440", "#05060c", 0.4]} />
      <AgnCamera inclDeg={inclDeg} azRef={azRef} dragRef={dragRef} reduced={reduced} />

      {/* black hole + bright inner ring */}
      <mesh><sphereGeometry args={[0.17, 32, 32]} /><meshBasicMaterial color="#000000" /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.18, 0.27, 48]} /><meshBasicMaterial color="#fff2d0" side={THREE.DoubleSide} transparent opacity={0.95} /></mesh>

      {/* accretion disk (equatorial, hot) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.27, 0.95, 64]} /><meshBasicMaterial color={DISK_C} side={THREE.DoubleSide} transparent opacity={0.85} blending={THREE.AdditiveBlending} /></mesh>

      {/* dusty torus (opaque — this is what hides the core edge-on) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.7, 0.72, 28, 80]} /><meshStandardMaterial color="#6b4a32" roughness={0.95} metalness={0} /></mesh>

      {/* bipolar jets along ±y (narrow at the core, flaring outward) */}
      <mesh position={[0, 1.55, 0]}><cylinderGeometry args={[0.3, 0.05, 2.7, 22, 1, true]} /><meshBasicMaterial color={JET_C} side={THREE.DoubleSide} transparent opacity={0.5} blending={THREE.AdditiveBlending} /></mesh>
      <mesh position={[0, -1.55, 0]}><cylinderGeometry args={[0.05, 0.3, 2.7, 22, 1, true]} /><meshBasicMaterial color={JET_C} side={THREE.DoubleSide} transparent opacity={0.5} blending={THREE.AdditiveBlending} /></mesh>

      {/* broad-line region — fast clouds close in, inside the torus opening */}
      {BLR_CLOUDS.map((p, i) => (
        <mesh key={`blr${i}`} position={p}><sphereGeometry args={[0.085, 16, 16]} /><meshBasicMaterial color={BLR_C} /></mesh>
      ))}

      {/* narrow-line region — slower clouds up in the polar cones */}
      {Array.from({ length: 6 }, (_, i) => i).flatMap((i) => [1, -1].map((s) => (
        <mesh key={`nlr${i}${s}`} position={nlrCloud(i, s)}><sphereGeometry args={[0.075, 14, 14]} /><meshBasicMaterial color={NLR_C} /></mesh>
      )))}
    </>
  );
}

type AgnType = { id: string; name: string; sub: string; color: string; sees: string; desc: string };
const AGN_TYPES: { max: number; t: AgnType }[] = [
  { max: 13, t: { id: "blazar", name: "Blazar", sub: "looking down the jet", color: JET_C, sees: "the jet, beamed almost straight at us", desc: "A relativistic jet is aimed within about ten degrees of our line of sight. Its beamed glare swamps everything else — the most violently variable objects in the sky." } },
  { max: 48, t: { id: "type1", name: "Type 1", sub: "Seyfert 1 / quasar", color: DISK_C, sees: "the accretion disk + broad and narrow emission lines", desc: "We look over the rim of the torus straight at the hot disk and the fast broad-line clouds. Lower-luminosity versions are Seyfert 1 galaxies; the most luminous are quasars." } },
  { max: 91, t: { id: "type2", name: "Type 2", sub: "Seyfert 2", color: NLR_C, sees: "only the narrow emission lines", desc: "Now the dusty torus is edge-on and hides the disk and broad-line region. Only the narrow-line clouds, high above the torus, still show — so the same engine looks far tamer." } },
];
function typeFor(incl: number): AgnType {
  return (AGN_TYPES.find((x) => incl < x.max) ?? AGN_TYPES[2]).t;
}

const LEGEND: { c: string; label: string }[] = [
  { c: "#000000", label: "black hole" },
  { c: DISK_C, label: "accretion disk" },
  { c: "#6b4a32", label: "dusty torus" },
  { c: BLR_C, label: "broad-line clouds" },
  { c: NLR_C, label: "narrow-line clouds" },
  { c: JET_C, label: "jet" },
];

/* Tilt dial — the line-of-sight needle against the jet axis, with the three
   type zones, so the reader can read their orientation without a slider. */
function TiltDial({ incl, color, w }: { incl: number; color: string; w: number | string }): JSX.Element {
  const pt = (d: number, r: number): [number, number] => [64 + r * Math.sin((d * Math.PI) / 180), 74 - r * Math.cos((d * Math.PI) / 180)];
  const arc = (d1: number, d2: number, r: number) => { const a = pt(d1, r), b = pt(d2, r); return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} A ${r} ${r} 0 0 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)}`; };
  const tip = pt(incl, 56);
  return (
    <svg viewBox="0 0 128 86" style={{ width: w, height: "auto", display: "block", marginTop: 8 }} aria-hidden="true">
      <line x1={64} y1={74} x2={64} y2={15} stroke="rgb(255 255 255 / 0.3)" strokeWidth={1} strokeDasharray="2 3" />
      <path d={arc(0, 13, 46)} stroke={JET_C} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={arc(13, 48, 46)} stroke={DISK_C} strokeWidth={5} fill="none" />
      <path d={arc(48, 90, 46)} stroke={NLR_C} strokeWidth={5} fill="none" strokeLinecap="round" />
      <line x1={64} y1={74} x2={tip[0]} y2={tip[1]} stroke="#ffffff" strokeWidth={2.4} />
      <circle cx={tip[0]} cy={tip[1]} r={4} fill={color} stroke="#fff" strokeWidth={1.2} />
      <circle cx={64} cy={74} r={3} fill="#fff" />
      <text x={64} y={11} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="rgb(255 255 255 / 0.6)">JET</text>
      <text x={120} y={80} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="rgb(255 255 255 / 0.6)">EDGE-ON</text>
    </svg>
  );
}

export function AgnUnifiedPanel(): JSX.Element {
  const [incl, setIncl] = useState(34); // degrees of the line of sight from the jet axis
  const vizRef = useRef<HTMLDivElement>(null);
  const azRef = useRef(0.6);
  const dragRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const fs = useFs(vizRef);
  const reduced = useReduced();
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const type = typeFor(incl);
  const tilt = (d: number) => setIncl((v) => Math.max(0, Math.min(90, v + d)));

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - lastRef.current.x, dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    azRef.current -= dx * 0.008;                              // horizontal: spin (azimuth — doesn't change the type)
    setIncl((v) => Math.max(0, Math.min(90, v + dy * 0.25))); // vertical: tilt the line of sight
  };
  const endDrag = () => { dragRef.current = false; };

  return (
    <FigurePanel
      idx="2.2.b"
      kicker="The active-galaxy zoo, from one engine"
      vizFill
      caption={
        <>
          One active galactic nucleus — a supermassive black hole, a blazing accretion disk, a dusty doughnut-shaped
          torus, fast and slow gas clouds, and twin jets. <strong>Drag to rotate it into any orientation</strong> (or
          use the arrow keys and chips); the inset names what we'd call it from your line of sight. Only the
          <em> tilt toward the jet</em> changes the type — spinning it sideways does nothing, because the AGN looks the
          same all the way around. The "types" are one object wearing different masks.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ height: 400, border: "1px solid rgb(255 255 255 / 0.07)", background: "radial-gradient(circle at 50% 40%, #0c1020 0%, #05060c 75%)", cursor: "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <Canvas dpr={[1, 1.75]} camera={{ position: [4, 3, 4], fov: 48, near: 0.05, far: 100 }} style={{ background: "transparent" }}>
          <AgnScene inclDeg={incl} azRef={azRef} dragRef={dragRef} reduced={reduced} />
        </Canvas>

        {/* live classification inset — keyed off the current line-of-sight tilt */}
        <div
          style={{
            position: "absolute", top: fs ? 18 : 12, left: fs ? 18 : 12, pointerEvents: "none",
            width: fs ? "clamp(216px, 25vw, 340px)" : 206,
            background: "rgb(6 8 16 / 0.72)", border: `1px solid ${type.color}99`, borderRadius: 10,
            padding: fs ? "12px 15px" : "9px 12px", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            transition: "border-color 220ms var(--ease)",
          }}
        >
          <div className="font-serif font-medium leading-none" style={{ fontSize: sz(1.55) ?? "1.5rem", color: type.color }}>{type.name}</div>
          <div className="font-mono uppercase tracking-[0.16em] mt-1.5" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(255 255 255 / 0.55)" }}>
            {Math.round(incl)}° from the jet axis · {type.sub}
          </div>
          <div className="font-sans mt-1.5" style={{ fontSize: sz(0.82) ?? "12.5px", color: "rgb(255 255 255 / 0.85)", lineHeight: 1.4 }}>
            You see {type.sees}.
          </div>
          <TiltDial incl={incl} color={type.color} w={fs ? "clamp(150px, 17vw, 230px)" : 152} />
        </div>
      </div>

      {/* controls — presets (also keyboard 1/2/3) + how-to */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2" style={{ flexShrink: 0 }}>
        <div className="flex gap-2 flex-wrap">
          {[{ a: 6, l: "Blazar", k: "1" }, { a: 30, l: "Type 1", k: "2" }, { a: 75, l: "Type 2", k: "3" }].map((p) => (
            <button key={p.l} type="button" onClick={() => setIncl(p.a)} data-shortcut={p.k}
              className="font-mono uppercase tracking-[0.16em]"
              style={{ fontSize: sz(0.58) ?? "10px", padding: "4px 11px", borderRadius: 9999, cursor: "pointer", color: typeFor(p.a).color, background: "rgb(255 255 255 / 0.05)", border: `1px solid ${typeFor(p.a).color}66` }}>
              {p.l}
            </button>
          ))}
        </div>
        <span className="font-mono uppercase tracking-[0.16em]" style={{ fontSize: sz(0.56) ?? "9px", color: "rgb(var(--c-text-rgb) / 0.45)" }}>
          drag to rotate · ← → tilt · ↑ ↓ spin
        </span>
      </div>

      {/* legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5" style={{ flexShrink: 0 }}>
        {LEGEND.map((it) => (
          <span key={it.label} className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.16em] text-white/60" style={{ fontSize: sz(0.56) ?? "9px" }}>
            <span style={{ width: "0.8em", height: "0.8em", borderRadius: "50%", background: it.c, border: it.c === "#000000" ? "1px solid rgb(255 255 255 / 0.5)" : "none", display: "inline-block" }} />
            {it.label}
          </span>
        ))}
      </div>

      {/* keyboard hooks — ←/→ tilt the line of sight; ↑/↓ spin (azimuth). */}
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => tilt(-7)} style={srOnly}>tilt toward jet</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => tilt(7)} style={srOnly}>tilt toward edge-on</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => { azRef.current -= 0.3; }} style={srOnly}>spin</button>
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => { azRef.current += 0.3; }} style={srOnly}>spin</button>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.2.c · Centaurus A across the spectrum. Four co-registered single-band
   images (VLA radio, Spitzer infrared, Hubble visible, Chandra X-ray),
   cropped to the SAME field of view from the STScI multiwavelength
   graphic, cross-faded by a wavelength slider — one object, a completely
   different sky at each wavelength. ══════════════════════════════════ */
type WaveBand = { id: string; name: string; scope: string; lam: string; reveals: string; color: string };
/* Ordered by wavelength: long (radio) → short (X-ray), like the §0.4 spectrum. */
const CENA_BANDS: WaveBand[] = [
  { id: "radio", name: "Radio", scope: "VLA", lam: "centimetres", reveals: "The giant jets and lobes — plasma the black hole has flung far beyond the galaxy.", color: "#ff6b6b" },
  { id: "infrared", name: "Infrared", scope: "Spitzer", lam: "microns", reveals: "Warm dust — piercing the haze to reveal the warped disk left by an ancient galaxy merger.", color: "#ff9a4d" },
  { id: "visible", name: "Visible", scope: "Hubble", lam: "~500 nm", reveals: "The galaxy's billions of stars, crossed by the dark dust lane we see by eye.", color: "#bcd6ff" },
  { id: "xray", name: "X-ray", scope: "Chandra", lam: "fractions of a nm", reveals: "The super-hot inner jet, blasting from the black hole at near light-speed.", color: "#b78cff" },
];

/* The 5th frame: all four registered bands stacked into one composite. */
const ALL_BAND = { name: "All wavelengths", scope: "VLA · Spitzer · Hubble · Chandra", lam: "radio → X-ray", reveals: "The famous portrait — all four bands at once: red radio lobes, warm dust, the starry galaxy, and the blue X-ray jet, from one black-hole engine.", color: "#ffffff" };

export function CenAImagePanel(): JSX.Element {
  const [w, setW] = useState(0.5); // 0 = radio (long λ) → 1 = X-ray (short λ)
  const [combined, setCombined] = useState(false); // show all bands stacked
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const N = CENA_BANDS.length;
  const STEP = 1 / (N - 1);
  const op = (i: number) => Math.max(0, 1 - Math.abs(w - i * STEP) / STEP);
  const active = Math.round(w / STEP);
  const info = combined ? ALL_BAND : CENA_BANDS[active];
  const scan = (v: number) => { setW(v); setCombined(false); }; // touching the slider/bands leaves "combined"

  return (
    <FigurePanel
      idx="2.2.c"
      kicker="Centaurus A across the spectrum"
      vizFill
      caption={
        <>
          The nearest active galaxy, about 12 million light-years away, seen by four telescopes — all framed on the same
          patch of sky. Slide from long wavelengths to short (or use ← / →): the giant radio lobes give way to warm dust,
          then the starry galaxy and its dust lane, then the searing X-ray jet — or hit “All wavelengths” to stack them
          into the famous composite. One black-hole engine, a completely different sky in each band. Credit: NASA, CXC,
          SAO, R. Olsen; NASA-JPL/Caltech; NRAO/AUI/NSF; UOH/M. Hardcastle.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden flex items-center justify-center"
        style={{ height: 430, border: "1px solid rgb(255 255 255 / 0.07)", background: "#04050a" }}
      >
        {CENA_BANDS.map((b, i) => (
          <img
            key={b.id}
            src={withBase(`/images/media/cena/${b.id}.webp`)}
            alt={`Centaurus A in ${b.name.toLowerCase()} light (${b.scope}): ${b.reveals}`}
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: combined ? 0 : op(i), transition: "opacity 90ms linear" }}
          />
        ))}
        <img
          src={withBase("/images/media/cena/all.webp")}
          alt="Centaurus A with all four wavelengths combined: the optical galaxy and dust lane, the blue X-ray jet, and the red radio lobes, all on the same field of view."
          decoding="async"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: combined ? 1 : 0, transition: "opacity 120ms linear" }}
        />
        {/* identity inset — current band, or the combined view */}
        <div style={{ position: "absolute", top: fs ? 16 : 11, left: fs ? 16 : 11, pointerEvents: "none", background: "rgb(4 6 14 / 0.72)", border: `1px solid ${info.color}99`, borderRadius: 10, padding: fs ? "11px 14px" : "8px 11px", maxWidth: fs ? "clamp(220px, 26vw, 360px)" : 224, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", transition: "border-color 200ms var(--ease)" }}>
          <div className="font-serif font-medium leading-none" style={{ fontSize: sz(1.5) ?? "1.45rem", color: info.color }}>{info.name}</div>
          <div className="font-mono uppercase tracking-[0.16em] mt-1.5" style={{ fontSize: sz(0.6) ?? "10px", color: "rgb(255 255 255 / 0.55)" }}>{info.scope} · λ {info.lam}</div>
          <div className="font-sans mt-1.5" style={{ fontSize: sz(0.82) ?? "12.5px", color: "rgb(255 255 255 / 0.85)", lineHeight: 1.4 }}>{info.reveals}</div>
        </div>
      </div>

      {/* wavelength slider + clickable band scale (keyboard 1–4) + combine (5) */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <input type="range" min={0} max={1} step={0.01} value={w} onChange={(e) => scan(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Wavelength — left/right arrows scan from radio (long) toward X-ray (short)" />
        <div className="flex items-center justify-between mt-1.5">
          {CENA_BANDS.map((b, i) => (
            <button key={b.id} type="button" onClick={() => scan(i * STEP)} data-shortcut={String(i + 1)}
              className="font-mono uppercase tracking-[0.14em]"
              style={{ fontSize: sz(0.58) ?? "9.5px", padding: "2px 4px", background: "none", border: "none", cursor: "pointer", color: !combined && active === i ? b.color : "rgb(var(--c-text-rgb) / 0.42)", transition: "color 150ms" }}>
              {b.name}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-mono uppercase tracking-[0.2em]" style={{ fontSize: sz(0.52) ?? "8px", color: "rgb(var(--c-text-rgb) / 0.32)" }}>long wavelength ← → short</span>
          <button type="button" onClick={() => setCombined((c) => !c)} data-shortcut="5" aria-pressed={combined}
            className="font-mono uppercase tracking-[0.16em]"
            style={{ fontSize: sz(0.58) ?? "9.5px", padding: "3px 12px", borderRadius: 9999, cursor: "pointer", color: combined ? "rgb(4 6 14)" : "rgb(255 255 255 / 0.85)", background: combined ? "#fff" : "rgb(255 255 255 / 0.06)", border: "1px solid rgb(255 255 255 / 0.5)", transition: "background 160ms, color 160ms" }}>
            ⊕ All wavelengths
          </button>
        </div>
      </div>
    </FigurePanel>
  );
}
