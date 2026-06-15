import { useEffect, useRef, useState, type JSX, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { withBase } from "../../../data/course-nav";
import { HoverZoomImage } from "../../../components/shared/HoverZoomImage";

/* Shared figure shell — mirrors the chapter-0/1 pattern. */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  fitFs = false,
  imgZoom = false,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  fitFs?: boolean;
  imgZoom?: boolean;
}) {
  return (
    <figure data-fade className={`figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}${imgZoom ? " is-img-zoom" : ""}`}>
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

/* ════════════════════════════════════════════════════════════════════
   2.2.a · The Hubble tuning fork, across cosmic time.
   A bespoke rebuild of the NASA/ESA/M. Kornmesser three-epoch diagram
   (knowledgebase media galclass.webp): the present-day classification
   (ellipticals → lenticular → spiral / barred-spiral prongs), with a
   TIME slider that morphs every galaxy between its settled shape today
   and the small, clumpy, irregular progenitor it grew from. ══════════ */

type ForkNode = { id: string; kind: "E" | "S0" | "S" | "SB"; n: number; cx: number; cy: number; label: string };

const R_ICON = 34;
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

/* Deterministic clumpy-blob offsets (units of R) for the early progenitor. */
const CLUMPS: [number, number, number][] = [
  [-0.32, -0.22, 0.4], [0.28, -0.12, 0.5], [0.04, 0.34, 0.36], [0.42, 0.26, 0.28], [-0.36, 0.24, 0.32], [-0.05, -0.4, 0.3],
];

/* Two-arm log spiral scaled to an icon of radius R. */
function arm(cx: number, cy: number, R: number, startDeg: number, turns: number): string {
  const steps = 24, rs = R * 0.16, re = R * 0.98;
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

/* One galaxy icon, cross-fading from its clumpy progenitor (m→0) to its
   settled classic morphology (m→1), and growing as it matures. */
function GalaxyIcon({ node, m }: { node: ForkNode; m: number }): JSX.Element {
  const { cx, cy, kind, n } = node;
  const R = R_ICON * (0.62 + 0.38 * m); // galaxies build up mass over time
  const classic = m;
  const early = 1 - m;
  const SUB = ["a", "b", "c"]; void SUB;
  const bulge = [0.46, 0.3, 0.18][n] ?? 0.3;
  const turns = [0.95, 0.7, 0.5][n] ?? 0.7;

  return (
    <g>
      {/* progenitor: clumpy blue-white knots */}
      <g opacity={early} transform={`rotate(${node.cx % 90} ${cx} ${cy})`}>
        {CLUMPS.map(([dx, dy, r], i) => (
          <circle key={i} cx={cx + dx * R} cy={cy + dy * R} r={r * R * 0.7} fill={i % 2 ? "#cfe0ff" : "#8fb6ff"} opacity={0.85} />
        ))}
      </g>

      {/* settled morphology */}
      <g opacity={classic}>
        {kind === "E" && (
          <g transform={`rotate(-22 ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={R * 0.95} ry={R * 0.95 * (1 - n / 10)} fill="#e7c39a" opacity={0.85} />
            <ellipse cx={cx} cy={cy} rx={R * 0.5} ry={R * 0.5 * (1 - n / 10)} fill="#fff1d8" opacity={0.9} />
          </g>
        )}
        {kind === "S0" && (
          <g transform={`rotate(-20 ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.34} fill="#cdbf9c" opacity={0.55} />
            <ellipse cx={cx} cy={cy} rx={R * 0.42} ry={R * 0.42} fill="#fff0cf" opacity={0.95} />
          </g>
        )}
        {(kind === "S" || kind === "SB") && (
          <g>
            <circle cx={cx} cy={cy} r={R} fill="#5b78c8" opacity={0.16} />
            <path d={arm(cx, cy, R, 0, turns)} fill="none" stroke="#bcd4ff" strokeWidth={R * 0.13} strokeLinecap="round" opacity={0.92} />
            <path d={arm(cx, cy, R, 180, turns)} fill="none" stroke="#bcd4ff" strokeWidth={R * 0.13} strokeLinecap="round" opacity={0.92} />
            {kind === "SB" && (
              <rect x={cx - R * 0.62} y={cy - R * 0.1} width={R * 1.24} height={R * 0.2} rx={R * 0.1} fill="#ffd9a0" transform={`rotate(18 ${cx} ${cy})`} />
            )}
            <circle cx={cx} cy={cy} r={R * bulge} fill="#ffe6a8" />
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
          ← / →) to wind cosmic history back: every galaxy dissolves into the small, clumpy, star-forming fragment it
          grew from. The fork is a snapshot of shapes today, <em>not</em> a sequence of ageing — and not a ladder a
          galaxy climbs.
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
          {/* lookback epoch label */}
          <text x={970} y={44} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="22" fill="rgb(var(--c-text-rgb) / 0.85)">{epoch.lookback}</text>
          <text x={970} y={66} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="12" letterSpacing="2" fill="#7cc4ff">{epoch.name.toUpperCase()}</text>

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

export function AgnUnifiedPanel(): JSX.Element {
  const [incl, setIncl] = useState(32); // degrees from the jet axis
  const vizRef = useRef<HTMLDivElement>(null);
  const azRef = useRef(0.6);
  const dragRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const fs = useFs(vizRef);
  const reduced = useReduced();
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const type = typeFor(incl);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - lastRef.current.x, dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    azRef.current -= dx * 0.008;
    setIncl((v) => Math.max(0, Math.min(90, v + dy * 0.25)));
  };
  const endDrag = () => { dragRef.current = false; };

  return (
    <FigurePanel
      idx="2.2.b"
      kicker="The active-galaxy zoo, from one engine"
      caption={
        <>
          A single active galactic nucleus — a supermassive black hole, a blazing accretion disk, a dusty doughnut-shaped
          torus, fast and slow gas clouds, and twin jets — seen from a viewing angle you choose. Drag to spin the view, or
          use the slider (← / →) to swing from looking straight down the jet to edge-on. The angle alone decides which
          "type" of active galaxy we'd call it: the names are one object wearing different masks.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz w-full rounded-md overflow-hidden"
        style={{ height: 400, border: "1px solid rgb(255 255 255 / 0.07)", background: "radial-gradient(circle at 50% 40%, #0c1020 0%, #05060c 75%)", cursor: "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <Canvas dpr={[1, 1.75]} camera={{ position: [4, 3, 4], fov: 48, near: 0.05, far: 100 }} style={{ background: "transparent" }}>
          <AgnScene inclDeg={incl} azRef={azRef} dragRef={dragRef} reduced={reduced} />
        </Canvas>
      </div>

      {/* viewing-angle slider + presets */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>viewing angle from the jet axis</label>
          <span className="font-mono text-[10px] text-plasma" style={{ fontSize: sz(0.62) }}>{Math.round(incl)}°</span>
        </div>
        <input type="range" min={0} max={90} step={1} value={incl} onChange={(e) => setIncl(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Viewing angle from the jet axis — left/right arrows swing from pole-on to edge-on" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>0° · down the jet</span>
          <span>90° · edge-on</span>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {[{ a: 6, l: "Blazar" }, { a: 30, l: "Type 1" }, { a: 75, l: "Type 2" }].map((p) => (
            <button key={p.l} type="button" onClick={() => setIncl(p.a)}
              className="font-mono uppercase tracking-[0.16em]"
              style={{ fontSize: sz(0.58) ?? "10px", padding: "4px 11px", borderRadius: 9999, cursor: "pointer", color: typeFor(p.a).color, background: "rgb(255 255 255 / 0.05)", border: `1px solid ${typeFor(p.a).color}66` }}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* readout */}
      <div className="mt-4 rounded-md p-3" style={{ background: "rgb(255 255 255 / 0.035)", border: `1px solid ${type.color}66`, flexShrink: 0 }}>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: type.color, fontSize: sz(0.7) }}>
          {type.name}
          <span className="normal-case tracking-normal" style={{ color: "rgb(var(--c-text-rgb) / 0.55)" }}> — {type.sub} · you see {type.sees}</span>
        </div>
        <div className="mt-1 text-[14px] text-white/85 leading-[1.55] font-sans" style={{ fontSize: sz(0.9), minHeight: "4.4em" }}>{type.desc}</div>
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5" style={{ flexShrink: 0 }}>
        {LEGEND.map((it) => (
          <span key={it.label} className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.16em] text-white/60" style={{ fontSize: sz(0.56) ?? "9px" }}>
            <span style={{ width: "0.8em", height: "0.8em", borderRadius: "50%", background: it.c, border: it.c === "#000000" ? "1px solid rgb(255 255 255 / 0.5)" : "none", display: "inline-block" }} />
            {it.label}
          </span>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.2.c · A real active galaxy — Centaurus A. The nearest AGN, as a
   multiwavelength composite, with the shared hover-zoom. ════════════ */
const CENA_IMG = withBase("/images/media/centaurus-a.webp");

export function CenAImagePanel(): JSX.Element {
  return (
    <FigurePanel
      idx="2.2.c"
      kicker="A real active galaxy — Centaurus A"
      imgZoom
      caption={
        <>
          Centaurus A, the nearest active galaxy — about 12 million light-years away — built from three telescopes at
          once. In visible light (ESO) the dark band slashing the galaxy is a dust lane, debris of a past merger,
          shrouding a black hole of about 55 million Suns. Chandra's X-rays (blue) and APEX's submillimetre radio
          (orange) expose the twin jets and lobes that black hole drives — utterly invisible to the eye. Switch on Zoom
          (or press z) to explore. Credit: ESO/WFI (Optical); MPIfR/ESO/APEX/A. Weiss et al. (Submillimetre);
          NASA/CXC/CfA/R. Kraft et al. (X-ray).
        </>
      }
    >
      <HoverZoomImage
        src={CENA_IMG}
        zoom={2.8}
        initialFocus={{ x: 0.5, y: 0.5 }}
        hintOff="explore the jets and dust lane up close"
        alt="Centaurus A: a glowing elliptical galaxy crossed by a thick dark dust lane, with pale-blue X-ray jets and orange radio lobes streaming above and below it against a dense starfield."
      />
    </FigurePanel>
  );
}
