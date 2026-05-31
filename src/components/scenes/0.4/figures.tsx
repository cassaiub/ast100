import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import katex from "katex";

/* ── Shared figure frame ────────────────────────────────────────────── */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  fitFs = false,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  /** content-heavy panels (e.g. the bestiary) shrink the viz in fullscreen
      so the whole figure fits in the viewport with no scrollbars. */
  fitFs?: boolean;
}) {
  return (
    <figure
      data-fade
      className={`figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}`}
    >
      <div className="figure-body">{children}</div>
      <figcaption>
        <span className="figure-tag">Fig. {idx}</span>
        <span className="figure-title"> — {kicker}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── EM Wave Oscillator (3D) ─────────────────────────────────────────
   Pannable three.js scene: an oscillating point charge at z = 0 drives
   an electromagnetic wave that propagates along +z.  The E field is
   plotted along the y-axis, the B field along the x-axis.  The user
   can orbit, pan, and zoom with the mouse.

   World units:
     wavelength λ = 1
     amplitude  = 0.4
     total wave length along z = 3.5 (≈3.5 wavelengths visible) */
const W3D_AMP = 0.4;
const W3D_LAMBDA = 1.0;
const W3D_LENGTH = 3.5;
const W3D_K = (2 * Math.PI) / W3D_LAMBDA;
const W3D_OMEGA = Math.PI * 0.8; // rad/s — full period ≈ 2.5 s
const COLOR_E = "#22d3ee";
const COLOR_B = "#f59e0b";
const COLOR_Z = "#cbd5e1";

function FieldArrow({
  z,
  axis,
  color,
}: {
  z: number;
  axis: "x" | "y";
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const shaftRef = useRef<THREE.Mesh>(null!);
  const coneRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const mag = W3D_AMP * Math.sin(W3D_K * z - W3D_OMEGA * t);
    const len = Math.abs(mag);
    const sign = mag >= 0 ? 1 : -1;
    const shaftLen = Math.max(0.001, len - 0.06);
    if (axis === "y") {
      groupRef.current.rotation.set(sign > 0 ? 0 : Math.PI, 0, 0);
    } else {
      groupRef.current.rotation.set(0, 0, sign > 0 ? -Math.PI / 2 : Math.PI / 2);
    }
    shaftRef.current.scale.y = shaftLen;
    shaftRef.current.position.y = shaftLen / 2;
    coneRef.current.position.y = shaftLen + 0.03;
    groupRef.current.visible = Math.abs(mag) > 0.05;
  });

  return (
    <group ref={groupRef} position={[0, 0, z]}>
      <mesh ref={shaftRef}>
        <cylinderGeometry args={[0.012, 0.012, 1, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.4}
        />
      </mesh>
      <mesh ref={coneRef}>
        <coneGeometry args={[0.03, 0.06, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function WavePath({ axis, color }: { axis: "x" | "y"; color: string }) {
  const SAMPLES = 96;
  const positions = useMemo(() => new Float32Array(SAMPLES * 3), []);
  const geomRef = useRef<THREE.BufferGeometry>(null!);

  /* Seed z-coordinates once. */
  useMemo(() => {
    for (let i = 0; i < SAMPLES; i++) {
      const z = (i / (SAMPLES - 1)) * W3D_LENGTH;
      positions[i * 3 + 2] = z;
    }
  }, [positions]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < SAMPLES; i++) {
      const z = positions[i * 3 + 2];
      const mag = W3D_AMP * Math.sin(W3D_K * z - W3D_OMEGA * t);
      positions[i * 3 + 0] = axis === "x" ? mag : 0;
      positions[i * 3 + 1] = axis === "y" ? mag : 0;
    }
    if (geomRef.current && geomRef.current.attributes.position) {
      geomRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <line>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.85} />
    </line>
  );
}

function SourceCharge() {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const aGroupRef = useRef<THREE.Group>(null!);
  const aShaftRef = useRef<THREE.Mesh>(null!);
  const aConeRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    /* Charge displacement equals E(z=0,t) — wave at the source. */
    const disp = W3D_AMP * Math.sin(-W3D_OMEGA * t);
    /* Acceleration antiparallel to displacement, magnitude ∝ |disp|. */
    const accelMag = 0.85 * Math.abs(disp);
    const accelSign = disp >= 0 ? -1 : 1;
    sphereRef.current.position.y = disp;
    aGroupRef.current.position.y = disp;
    aGroupRef.current.rotation.set(accelSign > 0 ? 0 : Math.PI, 0, 0);
    const shaftLen = Math.max(0.001, accelMag - 0.06);
    aShaftRef.current.scale.y = shaftLen;
    aShaftRef.current.position.y = shaftLen / 2;
    aConeRef.current.position.y = shaftLen + 0.03;
    aGroupRef.current.visible = accelMag > 0.06;
  });

  return (
    <>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial
          color={COLOR_E}
          emissive={COLOR_E}
          emissiveIntensity={0.95}
          roughness={0.25}
        />
      </mesh>
      <group ref={aGroupRef}>
        <mesh ref={aShaftRef}>
          <cylinderGeometry args={[0.015, 0.015, 1, 10]} />
          <meshStandardMaterial
            color={COLOR_E}
            emissive={COLOR_E}
            emissiveIntensity={0.55}
            roughness={0.3}
          />
        </mesh>
        <mesh ref={aConeRef}>
          <coneGeometry args={[0.04, 0.06, 14]} />
          <meshStandardMaterial
            color={COLOR_E}
            emissive={COLOR_E}
            emissiveIntensity={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
      <Text
        position={[0, W3D_AMP + 0.22, 0]}
        fontSize={0.18}
        color={COLOR_E}
        anchorX="center"
        anchorY="middle"
      >
        +q
      </Text>
    </>
  );
}

function AxisArrow({
  direction,
  color,
  length,
  label,
}: {
  direction: "x" | "y" | "z";
  color: string;
  length: number;
  label: string;
}) {
  const rot: [number, number, number] =
    direction === "x"
      ? [0, 0, -Math.PI / 2]
      : direction === "z"
        ? [Math.PI / 2, 0, 0]
        : [0, 0, 0];
  const labelPos: [number, number, number] =
    direction === "x"
      ? [length + 0.14, 0, 0]
      : direction === "y"
        ? [0, length + 0.14, 0]
        : [0, 0, length + 0.14];
  return (
    <>
      <group rotation={rot}>
        <mesh position={[0, length / 2, 0]}>
          <cylinderGeometry args={[0.007, 0.007, length, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, length, 0]}>
          <coneGeometry args={[0.025, 0.07, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
      <Text
        position={labelPos}
        fontSize={0.16}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontStyle="italic"
      >
        {label}
      </Text>
    </>
  );
}

/* λ bracket: a static dimension marker spanning one wavelength along z,
   floating above the E wave envelope.  Doubles as a "you've crossed one
   full wiggle when you reach the other tick" reference. */
function WavelengthBracket() {
  const y0 = W3D_AMP + 0.55;
  const len = W3D_LAMBDA;
  return (
    <group>
      {/* Horizontal bar from z=0 to z=λ */}
      <mesh
        position={[0, y0, len / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.006, 0.006, len, 6]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.85} />
      </mesh>
      {/* Tick at z=0 */}
      <mesh position={[0, y0 - 0.05, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.1, 6]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.85} />
      </mesh>
      {/* Tick at z=λ */}
      <mesh position={[0, y0 - 0.05, len]}>
        <cylinderGeometry args={[0.006, 0.006, 0.1, 6]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.85} />
      </mesh>
      {/* λ label (italic serif via drei Text) */}
      <Text
        position={[0, y0 + 0.14, len / 2]}
        fontSize={0.2}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        fontStyle="italic"
      >
        λ
      </Text>
      <Text
        position={[0, y0 - 0.16, len / 2]}
        fontSize={0.09}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        ONE WAVELENGTH
      </Text>
    </group>
  );
}

/* Period dot: a small pulsing marker at z = 0 that brightens once per
   oscillation cycle, giving the user a visual "tick" of the wave's
   frequency.  Sits just to the left of the source so it reads as
   "this is the clock". */
function PeriodPulse() {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    /* Pulse on each peak of the source charge (twice per period — when
       displacement is at its extreme).  Use sin² so the brightness
       always lands in [0, 1] and peaks at both turning points. */
    const s = Math.sin(W3D_OMEGA * t);
    const brightness = 0.25 + 0.75 * s * s;
    if (matRef.current) matRef.current.opacity = brightness;
    if (ref.current) ref.current.scale.setScalar(0.6 + 0.4 * s * s);
  });
  return (
    <group position={[-0.5, W3D_AMP + 0.55, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          ref={matRef}
          color="#f8fafc"
          transparent
          opacity={1}
        />
      </mesh>
      <Text
        position={[0, 0.18, 0]}
        fontSize={0.16}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        fontStyle="italic"
      >
        f
      </Text>
      <Text
        position={[0, -0.16, 0]}
        fontSize={0.09}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        FREQUENCY
      </Text>
    </group>
  );
}

function EmWaveScene({ fs }: { fs: boolean }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 2]} intensity={0.45} />
      <hemisphereLight args={["#1a1a2e", "#0a0a1a", 0.3]} />

      {/* Coordinate gnomon at the origin */}
      <AxisArrow direction="z" color={COLOR_Z} length={W3D_LENGTH + 0.25} label="z" />
      <AxisArrow direction="y" color={COLOR_E} length={W3D_AMP + 0.45} label="y" />
      <AxisArrow direction="x" color={COLOR_B} length={W3D_AMP + 0.45} label="x" />

      {/* Source charge + acceleration vector at z = 0 */}
      <SourceCharge />

      {/* Continuous wave paths */}
      <WavePath axis="y" color={COLOR_E} />
      <WavePath axis="x" color={COLOR_B} />

      {/* Wavelength bracket (spatial period) + frequency pulse (temporal) */}
      <WavelengthBracket />
      <PeriodPulse />

      {/* Sampled E and B field arrows along the wave */}
      {Array.from({ length: 14 }, (_, i) => {
        const z = ((i + 1) / 15) * W3D_LENGTH;
        return (
          <FieldArrow
            key={`e-${i}`}
            z={z}
            axis="y"
            color={COLOR_E}
          />
        );
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const z = ((i + 1) / 15) * W3D_LENGTH;
        return (
          <FieldArrow
            key={`b-${i}`}
            z={z}
            axis="x"
            color={COLOR_B}
          />
        );
      })}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={fs}
        enableZoom={fs}
        target={[W3D_LENGTH / 2, 0, 0]}
        minDistance={2}
        maxDistance={14}
      />
    </>
  );
}

export function EmWaveOscillatorPanel() {
  /* Gate the 3D camera's wheel-zoom + pan to fullscreen only, matching the
     FigureFrame contract (and the 0.3 balloon): in normal flow the wheel
     must scroll the PAGE, not the figure. We watch the enclosing
     [data-figure-frame] for the `.is-fs` class and only enable zoom/pan then. */
  const vizRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);
  useEffect(() => {
    const frame = vizRef.current?.closest("[data-figure-frame]");
    if (!frame) return;
    const sync = () => setFs(frame.classList.contains("is-fs"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(frame, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return (
    <FigurePanel
      idx="0.4.a"
      kicker="Electromagnetic Wave · E and B in Step"
      caption="Light is what an accelerating charge radiates. +q bobs up and down along y; the radiated electric field E parallels its motion, the magnetic field B is perpendicular (along x), and the whole pattern races down z at c. The wavelength λ — bracketed above the wave — is the distance from one peak to the next, i.e. the length of one full wiggle frozen in space. The frequency f is how many of those wiggles the source pumps out per second; watch the white pulse at the left blink in time with +q to feel it. Drag to spin the view; go fullscreen to scroll-zoom and right-click-drag to pan."
    >
      {/* Always-dark 3D scene: the axis labels, λ bracket and field lines
          are drawn in hard-coded near-white colours, so the panel must
          keep a dark backdrop in BOTH site themes or they vanish on the
          light page background. data-theme="dark" pins the dark tokens
          for any theme-token text inside this subtree. */}
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz w-full rounded-md overflow-hidden border border-white/[0.06] bg-black/40"
        style={{ height: 380 }}
      >
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [3.4, 1.6, 3.4], fov: 50, near: 0.05, far: 100 }}
          style={{ background: "transparent" }}
        >
          <EmWaveScene fs={fs} />
        </Canvas>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] font-mono tracking-[0.22em] uppercase text-white/60">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: COLOR_E, boxShadow: `0 0 8px ${COLOR_E}` }}
          />
          E · electric field (along y)
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: COLOR_B, boxShadow: `0 0 8px ${COLOR_B}` }}
          />
          B · magnetic field (along x)
        </span>
      </div>
    </FigurePanel>
  );
}

/* ── EM Spectrum Scrubber ────────────────────────────────────────────
   A continuous strip from radio (left) to gamma (right). Slider
   selects a wavelength; the info panel describes that band's everyday
   use AND its astronomical use. Replaces the supervisor's ems.webp. */
type Band = {
  id: string;
  name: string;
  /** Compact name used in the on-figure strip; full `name` is used in
      the readout below.  Short enough to fit narrow strips like Visible. */
  shortName: string;
  logMin: number;
  logMax: number;
  /** background colour for that strip */
  color: string;
  use: string;
  astro: string;
};
/* Bands tiled CONTIGUOUSLY: each band's logMax exactly equals the next
   band's logMin so the slider never falls into an undefined gap.
   Visible is widened slightly (−6.5 → −5.9) so the band remains
   visible on-screen rather than a hair-thin sliver. Real physics:
   visible light is 400–750 nm. */
const BANDS: Band[] = [
  { id: "gamma", name: "Gamma",       shortName: "GAMMA", logMin: -21,   logMax: -11,   color: "#e0a02f", use: "Nuclear decay. Highest-energy radiation we know.", astro: "Gamma-ray bursts, neutron-star mergers (Fermi, CTAO)." },
  { id: "xray",  name: "X-ray",       shortName: "X-RAY", logMin: -11,   logMax: -8,    color: "#d97757", use: "Medical imaging — passes through soft tissue.",   astro: "Black-hole accretion disks, supernova remnants (Chandra)." },
  { id: "uv",    name: "Ultraviolet", shortName: "UV",    logMin: -8,    logMax: -6.5,  color: "#8a4dd9", use: "Sunburn. Sterilisation. Black-light posters.",   astro: "Hot young stars and quasars (GALEX, Hubble UV)." },
  { id: "vis",   name: "Visible",     shortName: "VIS",   logMin: -6.5,  logMax: -5.9,  color: "#22d3ee", use: "What our eyes see — drives photosynthesis.",     astro: "Galaxies, stars, planets — the workhorse band (Hubble, Keck, Rubin)." },
  { id: "ir",    name: "Infrared",    shortName: "IR",    logMin: -5.9,  logMax: -3,    color: "#c0596d", use: "Heat. Remote controls, night-vision, thermal cameras.", astro: "Peer through dust to see star birth (JWST, Spitzer)." },
  { id: "micro", name: "Microwave",   shortName: "MICROWAVE", logMin: -3,    logMax: -1,    color: "#7b5ab8", use: "Radar, Wi-Fi, cellular, your microwave oven.",   astro: "Cosmic Microwave Background mapping (Planck, SPT)." },
  { id: "radio", name: "Radio",       shortName: "RADIO", logMin: -1,    logMax: 4,     color: "#5b6da6", use: "AM/FM radio, TV broadcast — bounces off the atmosphere.", astro: "CMB afterglow, interstellar hydrogen, pulsars (LOFAR, FAST, SKA)." },
];

/* Atmospheric transmission %, sampled at log wavelength steps. 0 =
   completely blocked, 1 = fully transparent. Reflects the physics:
   - γ, X-ray, UV blocked by ozone & high atmosphere
   - Visible band — the optical window
   - Near-IR partially transparent, mid-IR blocked by H₂O/CO₂
   - Microwave mostly transparent, with absorption bands
   - Long radio waves blocked by ionosphere */
const ATMOSPHERE: { log: number; t: number; note?: string }[] = [
  { log: -14,  t: 0.0 },
  { log: -11,  t: 0.0,  note: "γ-rays blocked" },
  { log: -8,   t: 0.0,  note: "X-rays blocked" },
  { log: -7,   t: 0.0,  note: "UV blocked by ozone" },
  { log: -6.5, t: 0.05 },
  { log: -6.3, t: 0.95, note: "OPTICAL WINDOW" },
  { log: -6.0, t: 0.95 },
  { log: -5.7, t: 0.6,  note: "Near-IR partial" },
  { log: -5,   t: 0.15 },
  { log: -4,   t: 0.05, note: "Mid-IR blocked" },
  { log: -3,   t: 0.2 },
  { log: -2.5, t: 0.85, note: "Microwave windows" },
  { log: -2,   t: 0.9 },
  { log: -1.5, t: 0.95 },
  { log: -1,   t: 0.95, note: "RADIO WINDOW" },
  { log: 0,    t: 0.95 },
  { log: 1,    t: 0.4 },
  { log: 1.5,  t: 0.05, note: "Ionosphere blocks long radio" },
  { log: 4,    t: 0.0 },
];

export function EmSpectrumScrubberPanel() {
  const [logLam, setLogLam] = useState(-6.3); // visible
  const W = 720;
  const H = 220;
  const SP_MIN = -21;
  const SP_MAX = 4;
  /* Flipped axis: radio (large λ) lives on the LEFT, gamma (small λ)
     on the RIGHT — matches every textbook EM-spectrum diagram. */
  function xOf(l: number) {
    return ((SP_MAX - l) / (SP_MAX - SP_MIN)) * W;
  }
  const C_LIGHT = 2.998e8; // m/s
  /* Decompose a log10(λ) value into mantissa + exponent for sci-notation. */
  function sciFromLogLam(ll: number): { m: string; e: number } {
    const e = Math.floor(ll);
    const m = Math.pow(10, ll - e);
    return { m: m.toFixed(2), e };
  }
  function sciFromLogF(ll: number): { m: string; e: number } {
    const logF = Math.log10(C_LIGHT) - ll;
    const e = Math.floor(logF);
    const m = Math.pow(10, logF - e);
    return { m: m.toFixed(2), e };
  }
  const lamSci = sciFromLogLam(logLam);
  const freqSci = sciFromLogF(logLam);
  /* Find the band that contains this wavelength. Bands are now
     contiguous, so any logLam in [SP_MIN, SP_MAX] resolves to a real
     band rather than the gamma fallback that caused the misreport. */
  function bandAt(l: number): Band {
    for (const b of BANDS) {
      if (l >= b.logMin && l <= b.logMax) return b;
    }
    /* Clamp to endpoints if out of range */
    return l < BANDS[0].logMin ? BANDS[0] : BANDS[BANDS.length - 1];
  }
  const active = bandAt(logLam);

  /* Interpolate atmospheric transmission at the active wavelength */
  function transAt(l: number): number {
    if (l <= ATMOSPHERE[0].log) return ATMOSPHERE[0].t;
    if (l >= ATMOSPHERE[ATMOSPHERE.length - 1].log) return ATMOSPHERE[ATMOSPHERE.length - 1].t;
    for (let i = 1; i < ATMOSPHERE.length; i++) {
      if (l <= ATMOSPHERE[i].log) {
        const a = ATMOSPHERE[i - 1], b = ATMOSPHERE[i];
        const k = (l - a.log) / (b.log - a.log);
        return a.t + (b.t - a.t) * k;
      }
    }
    return 0;
  }
  const activeTrans = transAt(logLam);

  const lamTex = `\\lambda = ${lamSci.m} \\times 10^{${lamSci.e}}\\,\\text{m}`;
  const freqTex = `f = ${freqSci.m} \\times 10^{${freqSci.e}}\\,\\text{Hz}`;
  const lamHtml = useMemo(
    () => katex.renderToString(lamTex, { throwOnError: false }),
    [lamTex],
  );
  const freqHtml = useMemo(
    () => katex.renderToString(freqTex, { throwOnError: false }),
    [freqTex],
  );

  return (
    <FigurePanel
      idx="0.4.b"
      kicker="The Electromagnetic Spectrum · One Strip, Seven Voices"
      caption="A single phenomenon spanning seventeen orders of magnitude in wavelength. Slide (or use ← / → keys) across — each band has both an everyday use and an astronomical superpower."
    >
      {/* Drop the inner overflow-hidden + rounded-md wrapper that was
          clipping text near corners; the outer figure-stub already
          provides rounded chrome and padding. The slider thumb position
          maps directly to xOf(logLam) only when the SVG occupies the
          full container width with no extra padding, which we preserve. */}
      <div className="fig-viz relative w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <defs>
            <linearGradient id="visibleSpectrumGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff2030" />
              <stop offset="18%" stopColor="#ff7a20" />
              <stop offset="32%" stopColor="#ffd320" />
              <stop offset="50%" stopColor="#3fc940" />
              <stop offset="68%" stopColor="#2070ff" />
              <stop offset="85%" stopColor="#5828d2" />
              <stop offset="100%" stopColor="#a020f0" />
            </linearGradient>
          </defs>

          {/* ── Visible-light zoom inset ────────────────────────────
             A magnified rainbow strip floating above the visible
             band on the main bar.  The trapezoid joins the inset to
             the (narrow) visible band, communicating the zoom.  */}
          {(() => {
            const insetW = 240;
            const insetH = 24;
            const visMidX = (xOf(-6.5) + xOf(-5.9)) / 2;
            const insetLeft = visMidX - insetW / 2;
            const insetRight = visMidX + insetW / 2;
            const insetTop = 6;
            const insetBot = insetTop + insetH;
            const bandTop = 60;
            const bandLeft = Math.min(xOf(-6.5), xOf(-5.9));
            const bandRight = Math.max(xOf(-6.5), xOf(-5.9));
            return (
              <g>
                <polygon
                  points={`${insetLeft},${insetBot} ${insetRight},${insetBot} ${bandRight},${bandTop} ${bandLeft},${bandTop}`}
                  fill="rgb(var(--c-text-rgb) / 0.04)"
                  stroke="rgb(var(--c-text-rgb) / 0.28)"
                  strokeWidth="0.6"
                  strokeDasharray="2 3"
                />
                <rect
                  x={insetLeft}
                  y={insetTop}
                  width={insetW}
                  height={insetH}
                  fill="url(#visibleSpectrumGrad)"
                  stroke="rgb(var(--c-text-rgb) / 0.55)"
                  strokeWidth="0.8"
                />
                <text
                  x={insetLeft + 6}
                  y={insetTop + insetH / 2 + 3}
                  fontSize="9"
                  letterSpacing="1"
                  fontFamily="var(--font-mono)"
                  fill="#ffffff"
                  style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 2 }}
                >
                  700 nm
                </text>
                <text
                  x={insetRight - 6}
                  y={insetTop + insetH / 2 + 3}
                  textAnchor="end"
                  fontSize="9"
                  letterSpacing="1"
                  fontFamily="var(--font-mono)"
                  fill="#ffffff"
                  style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 2 }}
                >
                  400 nm
                </text>
              </g>
            );
          })()}

          {/* ── Wavelength tick labels (ABOVE the main bar) ──────── */}
          {[
            { l: 3, t: "km" },
            { l: 0, t: "m" },
            { l: -2, t: "cm" },
            { l: -3, t: "mm" },
            { l: -6, t: "μm" },
            { l: -9, t: "nm" },
            { l: -12, t: "pm" },
            { l: -15, t: "fm" },
            { l: -18, t: "am" },
          ].map(({ l, t }) => (
            <text
              key={`lam-${l}`}
              x={xOf(l)}
              y={54}
              textAnchor="middle"
              fontSize="11"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-text-rgb) / 0.8)"
            >
              {t}
            </text>
          ))}

          {/* ── Band strips (with short names inside) ──────────────── */}
          {BANDS.map((b) => {
            const x1 = Math.min(xOf(b.logMin), xOf(b.logMax));
            const x2 = Math.max(xOf(b.logMin), xOf(b.logMax));
            const stripW = x2 - x1;
            const estLabelW = b.shortName.length * 6.2 + 4;
            const showLabel = estLabelW < stripW - 2;
            return (
              <g key={b.id}>
                <rect
                  x={x1}
                  y={60}
                  width={stripW}
                  height={28}
                  fill={b.color}
                  opacity={active.id === b.id ? 0.92 : 0.45}
                  style={{ transition: "opacity 240ms var(--ease)" }}
                />
                {showLabel && (
                  <text
                    x={(x1 + x2) / 2}
                    y={77}
                    textAnchor="middle"
                    fontSize="9"
                    letterSpacing="1.5"
                    fontFamily="var(--font-mono)"
                    fill="#ffffff"
                    style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.55)", strokeWidth: 2 }}
                  >
                    {b.shortName}
                  </text>
                )}
              </g>
            );
          })}

          {/* Decade tick marks below the main bar */}
          {Array.from({ length: SP_MAX - SP_MIN + 1 }, (_, i) => SP_MIN + i).map((l) => (
            <line
              key={`tick-${l}`}
              x1={xOf(l)}
              x2={xOf(l)}
              y1={88}
              y2={92}
              stroke="rgb(var(--c-text-rgb) / 0.35)"
              strokeWidth="0.6"
            />
          ))}

          {/* ── Frequency tick labels (BELOW the main bar) ─────────
             Natural units at λ = c / f.  Spans MHz at the radio end
             through ZHz deep in the gamma region. */}
          {[
            { l: Math.log10(C_LIGHT) - 6, t: "MHz" },
            { l: Math.log10(C_LIGHT) - 9, t: "GHz" },
            { l: Math.log10(C_LIGHT) - 12, t: "THz" },
            { l: Math.log10(C_LIGHT) - 15, t: "PHz" },
            { l: Math.log10(C_LIGHT) - 18, t: "EHz" },
            { l: Math.log10(C_LIGHT) - 21, t: "ZHz" },
            { l: Math.log10(C_LIGHT) - 24, t: "YHz" },
            { l: Math.log10(C_LIGHT) - 27, t: "RHz" },
          ].map(({ l, t }) => (
            <text
              key={`freq-${t}`}
              x={xOf(l)}
              y={104}
              textAnchor="middle"
              fontSize="11"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--c-text-rgb) / 0.8)"
            >
              {t}
            </text>
          ))}
          {/* Atmospheric opacity panel */}
          {(() => {
            const yTop = 124;
            const yBot = 190;
            const stripH = yBot - yTop;
            /* Build the filled transmission curve */
            const samples: { x: number; y: number; t: number }[] = [];
            for (let i = 0; i <= 100; i++) {
              const l = SP_MIN + (i / 100) * (SP_MAX - SP_MIN);
              const t = transAt(l);
              samples.push({ x: xOf(l), y: yBot - t * stripH, t });
            }
            const linePts = samples.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`).join(" ");
            const firstX = samples[0].x;
            const lastX = samples[samples.length - 1].x;
            const fillPts = `${linePts} L ${lastX.toFixed(1)} ${yBot} L ${firstX.toFixed(1)} ${yBot} Z`;
            return (
              <g>
                {/* Background — opaque red zones */}
                <rect x={0} y={yTop} width={W} height={stripH} fill="rgba(220, 60, 60, 0.18)" />
                {/* Transmission-coloured cells per sample to show gradient.
                   Use min/max so the rect width stays positive after the
                   flipped axis swap. */}
                {samples.slice(0, -1).map((s, i) => {
                  const sNext = samples[i + 1];
                  const avg = (s.t + sNext.t) / 2;
                  const r = Math.round(220 - 160 * avg);
                  const g = Math.round(60 + 140 * avg);
                  const b = 60;
                  const xL = Math.min(s.x, sNext.x);
                  const xR = Math.max(s.x, sNext.x);
                  return (
                    <rect
                      key={i}
                      x={xL}
                      y={yTop}
                      width={xR - xL + 0.5}
                      height={stripH}
                      fill={`rgb(${r}, ${g}, ${b})`}
                      opacity={0.25 + avg * 0.35}
                    />
                  );
                })}
                {/* Transmission curve */}
                <path d={fillPts} fill="rgb(60, 180, 80)" opacity="0.32" />
                <path d={linePts} stroke="rgb(120, 220, 130)" strokeWidth="1.6" fill="none" />
                {/* Frame */}
                <rect x={0} y={yTop} width={W} height={stripH} fill="none" stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth="0.8" />
                {/* Header label */}
                <text x={10} y={yTop - 6} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.7)">
                  ATMOSPHERIC TRANSMISSION
                </text>
                <text x={W - 10} y={yTop - 6} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
                  GREEN = REACHES GROUND
                </text>
                {/* Window labels */}
                <text x={xOf(-6.3)} y={yTop - 2} textAnchor="middle" fontSize="8" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
                  ↓ optical
                </text>
                <text x={xOf(-1)} y={yTop - 2} textAnchor="middle" fontSize="8" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
                  ↓ radio
                </text>
                {/* y-axis hints (0% / 100%) */}
                <text x={10} y={yBot - 4} fontSize="8" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.45)">
                  0%
                </text>
                <text x={10} y={yTop + 10} fontSize="8" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.45)">
                  100%
                </text>
              </g>
            );
          })()}
          {/* Scrubber cursor — extends down through atmosphere strip too */}
          <g>
            <line
              x1={xOf(logLam)}
              x2={xOf(logLam)}
              y1={6}
              y2={H - 8}
              stroke="rgb(var(--c-text-rgb) / 0.95)"
              strokeWidth="1.4"
            />
            <polygon
              points={`${xOf(logLam) - 5},6 ${xOf(logLam) + 5},6 ${xOf(logLam)},14`}
              fill="rgb(var(--c-text-rgb) / 0.95)"
            />
          </g>
        </svg>
      </div>

      <div className="mt-3">
        {/* Slider direction is reversed so the thumb sits at the same
            x-position as the on-figure cursor: thumb at the LEFT means
            radio (large λ), thumb at the RIGHT means gamma (small λ).
            We store logLam unchanged; the input value is the mirrored
            position SP_MIN + SP_MAX − logLam. */}
        <input
          type="range"
          min={SP_MIN}
          max={SP_MAX}
          step={0.05}
          value={SP_MIN + SP_MAX - logLam}
          onChange={(e) =>
            setLogLam(SP_MIN + SP_MAX - parseFloat(e.target.value))
          }
          className="cosmic-slider"
          aria-label="Wavelength — use left/right arrow keys to scan from radio toward gamma"
          aria-valuemin={SP_MIN}
          aria-valuemax={SP_MAX}
          aria-valuenow={SP_MIN + SP_MAX - logLam}
          aria-valuetext={`${lamSci.m} × 10^${lamSci.e} metres, ${freqSci.m} × 10^${freqSci.e} hertz, ${active.name} band`}
        />
        <div className="mt-1 flex justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40">
          <span>radio</span>
          <span>visible</span>
          <span>gamma</span>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        {/* Band identity */}
        <div
          className="font-serif font-medium leading-none shrink-0"
          style={{ fontSize: "1.75rem", color: "var(--c-accent)" }}
        >
          {active.name}
        </div>

        {/* Live λ + f in sci-notation (KaTeX) — driven by the slider. */}
        <div className="flex flex-col leading-tight shrink-0 border-l border-white/10 pl-4 text-[15px] tabular-nums">
          <span
            className="text-white/90"
            dangerouslySetInnerHTML={{ __html: lamHtml }}
          />
          <span
            className="text-white/90"
            dangerouslySetInnerHTML={{ __html: freqHtml }}
          />
        </div>

        {/* Atmosphere meter */}
        <div className="flex flex-col leading-tight shrink-0 border-l border-white/10 pl-4">
          <div
            className="font-mono text-[14px] tracking-[0.12em] tabular-nums"
            style={{
              color:
                activeTrans > 0.6
                  ? "rgb(120, 220, 130)"
                  : activeTrans > 0.2
                    ? "rgb(230, 180, 80)"
                    : "rgb(230, 100, 100)",
            }}
          >
            {(activeTrans * 100).toFixed(0)}% atm
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/45">
            {activeTrans > 0.7
              ? "reaches ground"
              : activeTrans > 0.3
                ? "partial"
                : "space only"}
          </div>
        </div>

        {/* Uses (fills remaining width) */}
        <div className="flex-1 min-w-[260px] grid gap-1.5 text-[15px] text-white/85 leading-snug font-sans">
          <div>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">
              everyday
            </span>
            {active.use}
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-solar mr-2">
              astronomy
            </span>
            {active.astro}
          </div>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── Shared EM-spectrum bar ──────────────────────────────────────────
   The full strip from 0.4.b — visible-zoom inset, wavelength scale on
   top, colour bands, frequency scale below, atmospheric-transmission
   panel — rendered identically here. Pass `cursorLogLam` for a scrubber
   cursor (0.4.b style) OR `range` to shade a telescope's wavelength
   coverage (0.4.c). Self-contained so the bar reads the same in both. */
function SpectrumBar({
  cursorLogLam,
  activeBandId,
  range,
}: {
  cursorLogLam?: number;
  activeBandId?: string;
  range?: { logMin: number; logMax: number; color: string };
}) {
  const W = 720;
  const H = 220;
  const SP_MIN = -21;
  const SP_MAX = 4;
  const C_LIGHT = 2.998e8;
  const xOf = (l: number) => ((SP_MAX - l) / (SP_MAX - SP_MIN)) * W;
  const transAt = (l: number): number => {
    if (l <= ATMOSPHERE[0].log) return ATMOSPHERE[0].t;
    if (l >= ATMOSPHERE[ATMOSPHERE.length - 1].log)
      return ATMOSPHERE[ATMOSPHERE.length - 1].t;
    for (let i = 1; i < ATMOSPHERE.length; i++) {
      if (l <= ATMOSPHERE[i].log) {
        const a = ATMOSPHERE[i - 1], b = ATMOSPHERE[i];
        const k = (l - a.log) / (b.log - a.log);
        return a.t + (b.t - a.t) * k;
      }
    }
    return 0;
  };
  const bandOpacity = (id: string) =>
    activeBandId ? (activeBandId === id ? 0.92 : 0.45) : range ? 0.62 : 0.55;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
      <defs>
        <linearGradient id="visibleSpectrumGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff2030" />
          <stop offset="18%" stopColor="#ff7a20" />
          <stop offset="32%" stopColor="#ffd320" />
          <stop offset="50%" stopColor="#3fc940" />
          <stop offset="68%" stopColor="#2070ff" />
          <stop offset="85%" stopColor="#5828d2" />
          <stop offset="100%" stopColor="#a020f0" />
        </linearGradient>
      </defs>

      {/* Visible-light zoom inset */}
      {(() => {
        const insetW = 240;
        const insetH = 24;
        const visMidX = (xOf(-6.5) + xOf(-5.9)) / 2;
        const insetLeft = visMidX - insetW / 2;
        const insetRight = visMidX + insetW / 2;
        const insetTop = 6;
        const insetBot = insetTop + insetH;
        const bandTop = 60;
        const bandLeft = Math.min(xOf(-6.5), xOf(-5.9));
        const bandRight = Math.max(xOf(-6.5), xOf(-5.9));
        return (
          <g>
            <polygon
              points={`${insetLeft},${insetBot} ${insetRight},${insetBot} ${bandRight},${bandTop} ${bandLeft},${bandTop}`}
              fill="rgb(var(--c-text-rgb) / 0.04)"
              stroke="rgb(var(--c-text-rgb) / 0.28)"
              strokeWidth="0.6"
              strokeDasharray="2 3"
            />
            <rect
              x={insetLeft}
              y={insetTop}
              width={insetW}
              height={insetH}
              fill="url(#visibleSpectrumGrad)"
              stroke="rgb(var(--c-text-rgb) / 0.55)"
              strokeWidth="0.8"
            />
            <text
              x={insetLeft + 6}
              y={insetTop + insetH / 2 + 3}
              fontSize="9"
              letterSpacing="1"
              fontFamily="var(--font-mono)"
              fill="#ffffff"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 2 }}
            >
              700 nm
            </text>
            <text
              x={insetRight - 6}
              y={insetTop + insetH / 2 + 3}
              textAnchor="end"
              fontSize="9"
              letterSpacing="1"
              fontFamily="var(--font-mono)"
              fill="#ffffff"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 2 }}
            >
              400 nm
            </text>
          </g>
        );
      })()}

      {/* Wavelength tick labels (ABOVE the main bar) */}
      {[
        { l: 3, t: "km" },
        { l: 0, t: "m" },
        { l: -2, t: "cm" },
        { l: -3, t: "mm" },
        { l: -6, t: "μm" },
        { l: -9, t: "nm" },
        { l: -12, t: "pm" },
        { l: -15, t: "fm" },
        { l: -18, t: "am" },
      ].map(({ l, t }) => (
        <text
          key={`lam-${l}`}
          x={xOf(l)}
          y={54}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-mono)"
          fill="rgb(var(--c-text-rgb) / 0.8)"
        >
          {t}
        </text>
      ))}

      {/* Band strips (with short names inside) */}
      {BANDS.map((b) => {
        const x1 = Math.min(xOf(b.logMin), xOf(b.logMax));
        const x2 = Math.max(xOf(b.logMin), xOf(b.logMax));
        const stripW = x2 - x1;
        const estLabelW = b.shortName.length * 6.2 + 4;
        const showLabel = estLabelW < stripW - 2;
        return (
          <g key={b.id}>
            <rect
              x={x1}
              y={60}
              width={stripW}
              height={28}
              fill={b.color}
              opacity={bandOpacity(b.id)}
              style={{ transition: "opacity 240ms var(--ease)" }}
            />
            {showLabel && (
              <text
                x={(x1 + x2) / 2}
                y={77}
                textAnchor="middle"
                fontSize="9"
                letterSpacing="1.5"
                fontFamily="var(--font-mono)"
                fill="#ffffff"
                style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.55)", strokeWidth: 2 }}
              >
                {b.shortName}
              </text>
            )}
          </g>
        );
      })}

      {/* Telescope wavelength-range highlight (0.4.c).  Clamped to the
          strip; ranges that run past the gamma edge get a → "beyond"
          arrow (Fermi, CTAO live at shorter λ than this strip shows). */}
      {range && (() => {
        const beyondRight = range.logMin < SP_MIN;
        const hiL = Math.min(range.logMax, SP_MAX); // longer-λ end → left
        const loL = Math.max(range.logMin, SP_MIN); // shorter-λ end → right
        let x1 = xOf(hiL);
        let x2 = xOf(loL);
        if (range.logMax < SP_MIN) {
          // entirely past the gamma edge — pin a sliver to the right edge
          x2 = xOf(SP_MIN);
          x1 = x2 - 20;
        } else if (x2 - x1 < 10) {
          const c = (x1 + x2) / 2;
          x1 = c - 6;
          x2 = c + 6;
        }
        return (
          <g style={{ transition: "all 200ms var(--ease)" }}>
            <rect x={x1} y={57} width={x2 - x1} height={34} fill={range.color} opacity={0.55} />
            <rect x={x1} y={57} width={x2 - x1} height={34} fill="none" stroke={range.color} strokeWidth={1.6} />
            <rect x={x1 + 0.8} y={57.8} width={Math.max(0, x2 - x1 - 1.6)} height={32.4} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={0.7} />
            {beyondRight && (
              <text x={xOf(SP_MIN) + 3} y={78} fontSize="13" fontFamily="var(--font-mono)" fill={range.color}>
                →
              </text>
            )}
          </g>
        );
      })()}

      {/* Decade tick marks below the main bar */}
      {Array.from({ length: SP_MAX - SP_MIN + 1 }, (_, i) => SP_MIN + i).map((l) => (
        <line
          key={`tick-${l}`}
          x1={xOf(l)}
          x2={xOf(l)}
          y1={88}
          y2={92}
          stroke="rgb(var(--c-text-rgb) / 0.35)"
          strokeWidth="0.6"
        />
      ))}

      {/* Frequency tick labels (BELOW the main bar) */}
      {[
        { l: Math.log10(C_LIGHT) - 6, t: "MHz" },
        { l: Math.log10(C_LIGHT) - 9, t: "GHz" },
        { l: Math.log10(C_LIGHT) - 12, t: "THz" },
        { l: Math.log10(C_LIGHT) - 15, t: "PHz" },
        { l: Math.log10(C_LIGHT) - 18, t: "EHz" },
        { l: Math.log10(C_LIGHT) - 21, t: "ZHz" },
        { l: Math.log10(C_LIGHT) - 24, t: "YHz" },
        { l: Math.log10(C_LIGHT) - 27, t: "RHz" },
      ].map(({ l, t }) => (
        <text
          key={`freq-${t}`}
          x={xOf(l)}
          y={104}
          textAnchor="middle"
          fontSize="11"
          fontFamily="var(--font-mono)"
          fill="rgb(var(--c-text-rgb) / 0.8)"
        >
          {t}
        </text>
      ))}

      {/* Atmospheric opacity panel */}
      {(() => {
        const yTop = 124;
        const yBot = 190;
        const stripH = yBot - yTop;
        const samples: { x: number; y: number; t: number }[] = [];
        for (let i = 0; i <= 100; i++) {
          const l = SP_MIN + (i / 100) * (SP_MAX - SP_MIN);
          const t = transAt(l);
          samples.push({ x: xOf(l), y: yBot - t * stripH, t });
        }
        const linePts = samples.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`).join(" ");
        const firstX = samples[0].x;
        const lastX = samples[samples.length - 1].x;
        const fillPts = `${linePts} L ${lastX.toFixed(1)} ${yBot} L ${firstX.toFixed(1)} ${yBot} Z`;
        return (
          <g>
            <rect x={0} y={yTop} width={W} height={stripH} fill="rgba(220, 60, 60, 0.18)" />
            {samples.slice(0, -1).map((s, i) => {
              const sNext = samples[i + 1];
              const avg = (s.t + sNext.t) / 2;
              const r = Math.round(220 - 160 * avg);
              const g = Math.round(60 + 140 * avg);
              const b = 60;
              const xL = Math.min(s.x, sNext.x);
              const xR = Math.max(s.x, sNext.x);
              return (
                <rect
                  key={i}
                  x={xL}
                  y={yTop}
                  width={xR - xL + 0.5}
                  height={stripH}
                  fill={`rgb(${r}, ${g}, ${b})`}
                  opacity={0.25 + avg * 0.35}
                />
              );
            })}
            <path d={fillPts} fill="rgb(60, 180, 80)" opacity="0.32" />
            <path d={linePts} stroke="rgb(120, 220, 130)" strokeWidth="1.6" fill="none" />
            <rect x={0} y={yTop} width={W} height={stripH} fill="none" stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth="0.8" />
            <text x={10} y={yTop - 6} fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.7)">
              ATMOSPHERIC TRANSMISSION
            </text>
            <text x={W - 10} y={yTop - 6} textAnchor="end" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
              GREEN = REACHES GROUND
            </text>
            <text x={xOf(-6.3)} y={yTop - 2} textAnchor="middle" fontSize="8" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
              ↓ optical
            </text>
            <text x={xOf(-1)} y={yTop - 2} textAnchor="middle" fontSize="8" letterSpacing="1.5" fontFamily="var(--font-mono)" fill="rgb(120, 220, 130)">
              ↓ radio
            </text>
            <text x={10} y={yBot - 4} fontSize="8" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.45)">
              0%
            </text>
            <text x={10} y={yTop + 10} fontSize="8" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.45)">
              100%
            </text>
          </g>
        );
      })()}

      {/* Scrubber cursor (0.4.b) */}
      {cursorLogLam !== undefined && (
        <g>
          <line
            x1={xOf(cursorLogLam)}
            x2={xOf(cursorLogLam)}
            y1={6}
            y2={H - 8}
            stroke="rgb(var(--c-text-rgb) / 0.95)"
            strokeWidth="1.4"
          />
          <polygon
            points={`${xOf(cursorLogLam) - 5},6 ${xOf(cursorLogLam) + 5},6 ${xOf(cursorLogLam)},14`}
            fill="rgb(var(--c-text-rgb) / 0.95)"
          />
        </g>
      )}
    </svg>
  );
}

/* ── Telescope Bestiary ─────────────────────────────────────────────
   Real telescopes mapped onto the shared EM-spectrum bar. Hover a card
   to shade that telescope's wavelength coverage on the bar; click to
   open an in-figure detail panel (no external navigation). */
type Telescope = {
  name: string;
  band: string;
  bandColor: string;
  /** wavelength coverage, log10(λ/m): logMin = shortest λ, logMax = longest λ */
  logMin: number;
  logMax: number;
  /** human-readable working range */
  freqs: string;
  science: string;
  location: string;
  owners: string;
  cost: string;
  year: string;
};
const TELESCOPES: Telescope[] = [
  { name: "LOFAR", band: "Radio", bandColor: "#5b6da6", logMin: 0.08, logMax: 1.48, freqs: "10–240 MHz", science: "Maps the low-frequency radio sky — primordial hydrogen, cosmic magnetism, pulsars.", location: "Core in the Netherlands; stations across Europe", owners: "ASTRON / LOFAR ERIC (European consortium)", cost: "≈ €150 million (construction, est.)", year: "2010" },
  { name: "FAST", band: "Radio", bandColor: "#5b6da6", logMin: -1.0, logMax: 0.63, freqs: "70 MHz – 3 GHz", science: "Surveys hydrogen gas, times pulsars, hunts fast radio bursts — the largest filled dish.", location: "Karst valley, Guizhou, China", owners: "National Astronomical Observatories, Chinese Academy of Sciences", cost: "≈ US$180 million (2016)", year: "2016" },
  { name: "SPT-3G", band: "Microwave", bandColor: "#7b5ab8", logMin: -2.85, logMax: -2.48, freqs: "95–220 GHz", science: "Maps the cosmic microwave background's polarization — inflation and neutrino mass.", location: "Amundsen–Scott South Pole Station, Antarctica", owners: "Univ. of Chicago–led; NSF + US DOE funded", cost: "≈ US$19 million base telescope (2007); 3G camera not publicly disclosed", year: "2017" },
  { name: "Planck", band: "Microwave", bandColor: "#7b5ab8", logMin: -3.46, logMax: -2.0, freqs: "30–857 GHz", science: "Mapped the whole-sky CMB to fix the Universe's age and composition.", location: "Sun–Earth L2 orbit", owners: "ESA (with NASA/JPL hardware)", cost: "≈ €700 million (total)", year: "2009–2013" },
  { name: "JWST", band: "Infrared", bandColor: "#c0596d", logMin: -6.22, logMax: -4.55, freqs: "0.6–28 µm", science: "Peers through dust in infrared to the first galaxies, star birth, exoplanet air.", location: "Sun–Earth L2 orbit (~1.5 million km)", owners: "NASA + ESA + CSA", cost: "≈ US$10 billion (total, 2021)", year: "2021" },
  { name: "Keck", band: "Visible / IR", bandColor: "#22d3ee", logMin: -6.52, logMax: -5.30, freqs: "0.3–5 µm", science: "Twin 10 m mirrors for optical/infrared — galaxies, exoplanets, the Galactic-Centre black hole.", location: "Maunakea, Hawai‘i (~4,200 m)", owners: "Caltech + University of California", cost: "≈ US$140 million (both telescopes, 1990s)", year: "1993" },
  { name: "Hubble", band: "Visible / UV", bandColor: "#22d3ee", logMin: -6.94, logMax: -5.60, freqs: "115 nm – 2.5 µm", science: "Sharp UV–optical–near-IR imaging and spectroscopy; rewrote the cosmic distance scale.", location: "Low Earth Orbit (~540 km)", owners: "NASA + ESA", cost: "≈ US$11–16 billion (incl. servicing)", year: "1990" },
  { name: "Vera Rubin", band: "Visible", bandColor: "#22d3ee", logMin: -6.49, logMax: -5.98, freqs: "320–1050 nm", science: "A 10-year wide-and-fast survey of the southern sky — dark energy, transients, Solar-System bodies.", location: "Cerro Pachón, Chile (~2,680 m)", owners: "NSF + US DOE (NOIRLab + SLAC)", cost: "≈ US$680 million (construction)", year: "2025" },
  { name: "GALEX", band: "Ultraviolet", bandColor: "#8a4dd9", logMin: -6.87, logMax: -6.55, freqs: "135–280 nm", science: "Mapped the ultraviolet sky to trace star formation across cosmic time.", location: "Low Earth Orbit (~690 km)", owners: "NASA (Caltech / JPL)", cost: "≈ US$150 million (life-cycle)", year: "2003–2013" },
  { name: "Chandra", band: "X-ray", bandColor: "#d97757", logMin: -9.92, logMax: -7.92, freqs: "0.1–12 nm", science: "Resolves the hot, violent X-ray Universe — black-hole disks, supernova remnants, galaxy clusters.", location: "Elliptical Earth orbit (out to ~140,000 km)", owners: "NASA (operated by SAO / MIT)", cost: "≈ US$1.65 billion (construction, 1999)", year: "1999" },
  { name: "Fermi", band: "Gamma", bandColor: "#e0a02f", logMin: -17.39, logMax: -13.21, freqs: "≈ 10²² – 10²⁶ Hz", science: "Surveys the highest-energy gamma sky — feeding black holes, pulsars, gamma-ray bursts.", location: "Low Earth Orbit (~550 km)", owners: "NASA + US DOE + international partners", cost: "≈ US$690 million (total)", year: "2008" },
  { name: "CTAO", band: "Gamma", bandColor: "#e0a02f", logMin: -20.39, logMax: -16.21, freqs: "≈ 10²⁵ – 10²⁹ Hz", science: "Ground arrays catching gamma-ray air-flashes — cosmic-ray origins, active galaxies.", location: "La Palma, Spain + Paranal, Chile", owners: "CTAO ERIC (international consortium)", cost: "≈ €300 million (construction, est.)", year: "2018" },
];

export function TelescopeBestiaryPanel() {
  const [hover, setHover] = useState<number | null>(null);
  /* `sel` is the keyboard-/arrow-driven selection; `hover` (mouse) wins
     while the pointer is over a card.  The spectrum marker follows
     whichever is live, so ← / → keys and the fullscreen wheel scrub the
     bestiary even with no pointer (FigureFrame drives the numeric
     data-shortcut pill set on the cards below). */
  const [sel, setSel] = useState(0);
  const marked = hover ?? sel;
  const tel = TELESCOPES[marked];
  return (
    <FigurePanel
      idx="0.4.c"
      kicker="Telescope Bestiary · One Instrument per Wavelength"
      fitFs
      caption="The real telescopes astronomers use, on the same spectrum bar as above. Hover a card (or step with the ← / → keys) to shade the slice of light that telescope was built to catch; click it for a full rundown — where it sits, what it studies, who built it, and what it cost."
    >
      {/* The shared 0.4.b spectrum bar; the marked telescope's wavelength
          coverage is shaded in its band colour. */}
      <div className="fig-viz relative w-full mb-5">
        <SpectrumBar
          range={{ logMin: tel.logMin, logMax: tel.logMax, color: tel.bandColor }}
        />
      </div>

      {/* In-figure detail panel for the marked telescope (mirrors the
          readout box on 0.4.b — no external navigation). */}
      <div
        className="mb-5 px-4 py-3 rounded-md"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.04)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span
            className="font-serif font-medium leading-none"
            style={{ fontSize: "1.75rem", color: "var(--c-accent)" }}
          >
            {tel.name}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: tel.bandColor }} />
            {tel.band}
          </span>
          <span className="font-mono text-[12px] tracking-[0.06em] text-white/90 tabular-nums">
            {tel.freqs}
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/40">
            first light {tel.year}
          </span>
        </div>
        <div className="mt-2.5 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[14px] text-white/85 leading-snug font-sans">
          <div className="sm:col-span-2">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-solar mr-2">science</span>
            {tel.science}
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">location</span>
            {tel.location}
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">built &amp; run by</span>
            {tel.owners}
          </div>
          <div className="sm:col-span-2">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">cost</span>
            {tel.cost}
          </div>
        </div>
      </div>

      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {TELESCOPES.map((t, i) => {
          const isActive = marked === i;
          return (
            <li key={t.name}>
              {/* The CARD is both the selector and the detail trigger: it
                  carries the numeric data-shortcut FigureFrame steps
                  through, so click / arrow / focus selects it — shading its
                  range on the bar and filling the detail panel above. No
                  external navigation. */}
              <button
                type="button"
                data-shortcut={String(i + 1)}
                aria-pressed={isActive}
                aria-label={`${t.name} — ${t.band} telescope; show details`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setSel(i)}
                onClick={() => setSel(i)}
                title={`${t.name} — ${t.band}`}
                className={`flex w-full items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer${isActive ? " is-active" : ""}`}
                style={{
                  background: isActive
                    ? "rgb(var(--c-accent-rgb) / 0.12)"
                    : "rgb(var(--c-bg-rgb) / 0.25)",
                  border: `1px solid ${isActive ? "rgb(var(--c-accent-rgb) / 0.5)" : "rgb(var(--c-text-rgb) / 0.08)"}`,
                }}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: t.bandColor }}
                />
                <span
                  className="font-serif font-medium truncate"
                  style={{ fontSize: "1rem", color: "var(--c-text-strong)" }}
                >
                  {t.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </FigurePanel>
  );
}

/* ── Telescope Anatomy (Cassegrain, with photometer + spectrometer) ───
   Interactive trace: a slider walks the user through the optical chain
   sky → M₁ → M₂ → Cassegrain focus → {photometer | spectrometer} → CPU →
   final image / spectrum.  Toggle below picks which detector is in the
   trace.  Replaces the previous reflector/refractor split. */
type AnatomyStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const ANATOMY_STAGES: { label: string; blurb: string }[] = [
  { label: "Sky",                  blurb: "Photons from a distant source stream toward the telescope as parallel rays.  Real source: a star, galaxy, or supernova — pick your photon." },
  { label: "Primary mirror (M₁)",  blurb: "A large concave mirror catches the parallel light and reflects it back toward a focus.  Aperture size sets the telescope's sensitivity." },
  { label: "Secondary mirror (M₂)", blurb: "A small convex mirror intercepts the converging beam BEFORE it reaches the primary focus F₁, and bounces it back through a hole in the centre of M₁." },
  { label: "Cassegrain focus",     blurb: "The doubled-up light converges to a sharp focal point behind M₁ — the Cassegrain focus.  The focal plane is the natural home of detectors." },
  { label: "Detector instrument",  blurb: "A flip mirror at the focus selects which detector reads the light.  An imaging photometer records colour-filtered brightness; a spectrometer disperses the light by wavelength." },
  { label: "Computer",             blurb: "Each detector converts photons into electrons, the electronics digitise the counts, and a computer pipelines the raw frames into science-ready data." },
  { label: "Final output",         blurb: "Out comes either a calibrated image (photometer) or a 1-D spectrum (spectrometer).  Same telescope, two different ways of looking at the sky." },
];

export function TelescopeAnatomyPanel() {
  const [stage, setStage] = useState<AnatomyStage>(0);
  const [mode, setMode] = useState<"photo" | "spec">("photo");

  const W = 720;
  const H = 360;
  const axisY = 180;
  const tubeTopY = 70;
  const tubeBotY = 290;
  const tubeStartX = 180;
  const tubeEndX = 670;

  /* ── Primary M₁: a single SPHERICAL concave mirror ──────────────
     Sagitta s = 30 px, half-aperture r = 110 px ⇒ radius of curvature
        R = (r² + s²) / (2s) = (12100 + 900) / 60 ≈ 216.67 px.
     Centre of curvature sits on the optical axis to the RIGHT of the
     mirror (i.e. inside the tube), at C = (apex_x + R).
     Surface equation: (x − C_x)² + (y − axisY)² = R²  ⇒
        x = C_x − √(R² − (y − axisY)²)   on the leftward (concave) side. */
  const m1X = tubeStartX;            // rim plane (where mirror meets tube)
  const m1ApexX = m1X - 30;          // deepest point of cup, on axis
  const m1HoleTopY = 170;
  const m1HoleBotY = 190;
  const m1HalfAp = (tubeBotY - tubeTopY) / 2; // 110 px
  const m1Sagitta = m1X - m1ApexX;            // 30 px
  const m1SphR =
    (m1HalfAp * m1HalfAp + m1Sagitta * m1Sagitta) / (2 * m1Sagitta);
  const m1CenterX = m1ApexX + m1SphR; // ≈ 366.67
  function m1SurfaceX(y: number): number {
    const off = y - axisY;
    return m1CenterX - Math.sqrt(m1SphR * m1SphR - off * off);
  }
  const m1HoleEdgeX = m1SurfaceX(m1HoleTopY); // ≈ 150.15

  const m2X = 500;
  const m2HalfH = 22;
  const m2TopY = axisY - m2HalfH;
  const m2BotY = axisY + m2HalfH;

  /* Foci */
  const f1X = 560;
  const cassX = 140;

  /* Two-ray construction — rays land on the actual parabolic
     surface (not the rim), so the reflected geometry closes
     properly through the central hole. */
  const rayUpY = 140;
  const rayDnY = 220;
  const rayHitUpX = m1SurfaceX(rayUpY);
  const rayHitDnX = m1SurfaceX(rayDnY);
  const m2InterceptUpY =
    rayUpY +
    ((m2X - rayHitUpX) / (f1X - rayHitUpX)) * (axisY - rayUpY);
  const m2InterceptDnY =
    rayDnY +
    ((m2X - rayHitDnX) / (f1X - rayHitDnX)) * (axisY - rayDnY);

  /* Instruments */
  const photoX = 70, photoY = 80, photoW = 100, photoH = 60;
  const photoEntryX = photoX + photoW * 0.75;
  const photoEntryY = photoY + photoH;
  const specX = 70, specY = 220, specW = 100, specH = 60;
  const specEntryX = specX + specW * 0.75;
  const specEntryY = specY;

  /* Processor */
  const procX = 10, procY = 160, procW = 55, procH = 40;
  /* Output */
  const outX = 10, outY = 305, outW = 220, outH = 50;

  const photoOn = mode === "photo";
  const specOn = mode === "spec";

  /* Opacity helpers tied to the trace stage. */
  const rayOp = (threshold: AnatomyStage) => (stage >= threshold ? 0.95 : 0.18);
  const compOp = (threshold: AnatomyStage) => (stage >= threshold ? 1 : 0.32);
  const glow = (threshold: AnatomyStage) =>
    stage === threshold
      ? "drop-shadow(0 0 8px rgb(var(--c-accent-rgb) / 0.85))"
      : "none";

  return (
    <FigurePanel
      idx="0.4.d"
      kicker="Telescope Anatomy · Cassegrain Reflector"
      caption={
        <>
          A modern reflecting telescope is a four-stage relay.  Scrub the
          slider to trace one photon from the sky through the mirrors to
          its final pixel.  Toggle the detector to see the same light
          analysed as a brightness image or as a wavelength spectrum.
        </>
      }
    >
      {/* Stage slider + instrument toggle */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex-1 min-w-[260px]">
          <div className="flex items-center justify-between mb-1">
            <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55">
              trace · step {stage} / 6
            </label>
            <span className="font-mono text-[10px] text-plasma uppercase tracking-[0.18em]">
              {ANATOMY_STAGES[stage].label}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={stage}
            onChange={(e) =>
              setStage(parseInt(e.target.value, 10) as AnatomyStage)
            }
            className="cosmic-slider"
            aria-label="Trace stage — sky to final image"
          />
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55 mr-1">
            detector ·
          </span>
          <button
            type="button"
            onClick={() => setMode("photo")}
            className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${photoOn ? "is-active" : ""}`}
          >
            Photometer
          </button>
          <button
            type="button"
            onClick={() => setMode("spec")}
            className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${specOn ? "is-active" : ""}`}
          >
            Spectrometer
          </button>
        </div>
      </div>

      <div className="fig-viz relative w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <defs>
            <marker
              id="anatomyArrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(var(--c-accent-rgb))" />
            </marker>
          </defs>

          {/* Tube walls */}
          <line x1={tubeStartX} y1={tubeTopY} x2={tubeEndX} y2={tubeTopY}
            stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1.2" />
          <line x1={tubeStartX} y1={tubeBotY} x2={tubeEndX} y2={tubeBotY}
            stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1.2" />
          <line x1={tubeEndX} y1={tubeTopY - 6} x2={tubeEndX} y2={tubeTopY + 6}
            stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1.2" />
          <line x1={tubeEndX} y1={tubeBotY - 6} x2={tubeEndX} y2={tubeBotY + 6}
            stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1.2" />

          {/* Optical axis (faint dashed across the figure) */}
          <line x1={procX + procW + 8} y1={axisY} x2={tubeEndX + 20} y2={axisY}
            stroke="rgb(var(--c-text-rgb) / 0.22)" strokeWidth="0.7" strokeDasharray="4 3" />

          {/* SKY marker */}
          <g style={{ opacity: compOp(0), filter: glow(0) }}>
            <text x={tubeEndX + 28} y={axisY + 4} fontSize="11" letterSpacing="2"
              fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.8)">
              SKY ←
            </text>
            <text x={tubeEndX + 28} y={axisY + 18} fontSize="9"
              fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
              photons in
            </text>
          </g>

          {/* RAY 1: sky → M1 surface (parallel rays land on the
             parabolic curve at their off-axis radius, not on the rim) */}
          <line x1={tubeEndX} y1={rayUpY} x2={rayHitUpX} y2={rayUpY}
            stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.5" opacity={rayOp(1)} />
          <line x1={tubeEndX} y1={rayDnY} x2={rayHitDnX} y2={rayDnY}
            stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.5" opacity={rayOp(1)} />

          {/* M₁ PRIMARY — a single spherical concave mirror with a
             hole at its apex.  Drawn as ONE <path> with two circular
             arcs (SVG "A" command) sharing the same radius R≈216.67
             and centre of curvature on the optical axis at x≈366.67.
             The two halves are visibly part of one continuous sphere,
             interrupted only by the central hole. */}
          <g style={{ opacity: compOp(1), filter: glow(1) }}>
            <path
              d={
                `M ${m1X} ${tubeTopY} ` +
                `A ${m1SphR.toFixed(2)} ${m1SphR.toFixed(2)} 0 0 0 ` +
                  `${m1HoleEdgeX.toFixed(2)} ${m1HoleTopY} ` +
                `M ${m1HoleEdgeX.toFixed(2)} ${m1HoleBotY} ` +
                `A ${m1SphR.toFixed(2)} ${m1SphR.toFixed(2)} 0 0 0 ` +
                  `${m1X} ${tubeBotY}`
              }
              fill="none"
              stroke="rgb(var(--c-accent-rgb))"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Hole-wall ticks at the hole edges hint at the
               cylindrical bore drilled through the mirror. */}
            <line
              x1={m1HoleEdgeX}
              y1={m1HoleTopY}
              x2={m1ApexX - 6}
              y2={m1HoleTopY}
              stroke="rgb(var(--c-accent-rgb) / 0.55)"
              strokeWidth="1"
            />
            <line
              x1={m1HoleEdgeX}
              y1={m1HoleBotY}
              x2={m1ApexX - 6}
              y2={m1HoleBotY}
              stroke="rgb(var(--c-accent-rgb) / 0.55)"
              strokeWidth="1"
            />
            <text x={m1X + 6} y={tubeTopY - 8} fontSize="10" letterSpacing="1.5"
              fontFamily="var(--font-mono)" fill="rgb(var(--c-accent-rgb))">
              M₁ · primary (spherical)
            </text>
          </g>

          {/* RAY 2: M₁ surface → M₂ (converging toward F₁) */}
          <line x1={rayHitUpX} y1={rayUpY} x2={m2X} y2={m2InterceptUpY}
            stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.5" opacity={rayOp(2)} />
          <line x1={rayHitDnX} y1={rayDnY} x2={m2X} y2={m2InterceptDnY}
            stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.5" opacity={rayOp(2)} />

          {/* F1 phantom — where the beam WOULD converge if M2 weren't there */}
          <g opacity={rayOp(2) * 0.6}>
            <line x1={m2X} y1={m2InterceptUpY} x2={f1X} y2={axisY}
              stroke="rgb(var(--c-solar-rgb) / 0.45)" strokeWidth="0.8" strokeDasharray="2 3" />
            <line x1={m2X} y1={m2InterceptDnY} x2={f1X} y2={axisY}
              stroke="rgb(var(--c-solar-rgb) / 0.45)" strokeWidth="0.8" strokeDasharray="2 3" />
            <line x1={f1X - 5} y1={axisY - 5} x2={f1X + 5} y2={axisY + 5}
              stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="0.8" />
            <line x1={f1X - 5} y1={axisY + 5} x2={f1X + 5} y2={axisY - 5}
              stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="0.8" />
            <text x={f1X} y={axisY - 12} textAnchor="middle" fontSize="9"
              fontFamily="var(--font-mono)" letterSpacing="1.5"
              fill="rgb(var(--c-text-rgb) / 0.55)">
              F₁ (intercepted)
            </text>
          </g>

          {/* M2 SECONDARY — convex (opening leftward) */}
          <g style={{ opacity: compOp(2), filter: glow(2) }}>
            <path
              d={`M ${m2X} ${m2TopY} Q ${m2X + 12} ${axisY} ${m2X} ${m2BotY}`}
              fill="none" stroke="rgb(var(--c-accent-rgb))" strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Spider supports */}
            <line x1={m2X} y1={m2TopY} x2={m2X + 80} y2={tubeTopY}
              stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth="0.6" />
            <line x1={m2X} y1={m2BotY} x2={m2X + 80} y2={tubeBotY}
              stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth="0.6" />
            <text x={m2X} y={m2TopY - 8} textAnchor="middle" fontSize="10"
              letterSpacing="1.5" fontFamily="var(--font-mono)"
              fill="rgb(var(--c-accent-rgb))">
              M₂ · secondary
            </text>
          </g>

          {/* RAY 3: M2 → Cassegrain focus (through the primary hole) */}
          <line x1={m2X} y1={m2InterceptUpY} x2={cassX} y2={axisY}
            stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.5" opacity={rayOp(3)} />
          <line x1={m2X} y1={m2InterceptDnY} x2={cassX} y2={axisY}
            stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.5" opacity={rayOp(3)} />

          {/* Cassegrain focus marker */}
          <g style={{ opacity: compOp(3), filter: glow(3) }}>
            <circle cx={cassX} cy={axisY} r="3.2" fill="rgb(var(--c-accent-rgb))" />
            <text x={cassX} y={axisY + 26} textAnchor="middle" fontSize="9"
              fontFamily="var(--font-mono)" letterSpacing="1.5"
              fill="rgb(var(--c-accent-rgb))">
              Cassegrain focus
            </text>
          </g>

          {/* Flip mirror at the focus — orientation depends on which detector
             is active (45° up to photometer or 45° down to spectrometer). */}
          <g style={{ opacity: compOp(4) * 0.95, filter: glow(4) }}>
            <line
              x1={cassX - 7}
              y1={photoOn ? axisY + 7 : axisY - 7}
              x2={cassX + 7}
              y2={photoOn ? axisY - 7 : axisY + 7}
              stroke="rgb(var(--c-text-rgb) / 0.85)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>

          {/* RAY 4: focus → instrument */}
          {photoOn ? (
            <line x1={cassX} y1={axisY} x2={photoEntryX} y2={photoEntryY}
              stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.6" opacity={rayOp(4)} />
          ) : (
            <line x1={cassX} y1={axisY} x2={specEntryX} y2={specEntryY}
              stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.6" opacity={rayOp(4)} />
          )}

          {/* ── PHOTOMETER ──────────────────────────────────────── */}
          <g
            style={{
              opacity: photoOn ? compOp(4) : 0.28,
              filter: photoOn ? glow(4) : "none",
            }}
          >
            <rect x={photoX} y={photoY} width={photoW} height={photoH}
              rx="3"
              fill="rgb(var(--c-text-rgb) / 0.04)"
              stroke={photoOn ? "rgb(var(--c-accent-rgb) / 0.7)" : "rgb(var(--c-text-rgb) / 0.3)"}
              strokeWidth="1" />
            {/* Filter wheel — pie slices */}
            <g transform={`translate(${photoX + 75}, ${photoY + 30})`}>
              <circle r="14"
                fill="rgb(var(--c-text-rgb) / 0.05)"
                stroke="rgb(var(--c-text-rgb) / 0.4)"
                strokeWidth="0.6" />
              {[
                { from: 0, to: 60, color: "#9c6cff" },
                { from: 60, to: 120, color: "#5f88ff" },
                { from: 120, to: 180, color: "#5fc36f" },
                { from: 180, to: 240, color: "#ff8a4d" },
                { from: 240, to: 300, color: "#d04040" },
                { from: 300, to: 360, color: "#888888" },
              ].map((sl, i) => {
                const a0 = ((sl.from - 90) * Math.PI) / 180;
                const a1 = ((sl.to - 90) * Math.PI) / 180;
                const x0 = Math.cos(a0) * 14;
                const y0 = Math.sin(a0) * 14;
                const x1 = Math.cos(a1) * 14;
                const y1 = Math.sin(a1) * 14;
                return (
                  <path
                    key={i}
                    d={`M 0 0 L ${x0.toFixed(1)} ${y0.toFixed(1)} A 14 14 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`}
                    fill={sl.color}
                    opacity="0.55"
                  />
                );
              })}
            </g>
            {/* CCD chip */}
            <g transform={`translate(${photoX + 12}, ${photoY + 22})`}>
              <rect x="0" y="0" width="22" height="16"
                fill="rgb(var(--c-text-rgb) / 0.12)"
                stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="0.6" />
              {Array.from({ length: 3 }, (_, i) => (
                <line key={`v${i}`} x1={(i + 1) * 5.5} y1="0" x2={(i + 1) * 5.5} y2="16"
                  stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth="0.3" />
              ))}
              {Array.from({ length: 2 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={(i + 1) * 5.5} x2="22" y2={(i + 1) * 5.5}
                  stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth="0.3" />
              ))}
            </g>
            <text x={photoX + photoW / 2} y={photoY - 6} textAnchor="middle"
              fontSize="10" letterSpacing="1.5" fontFamily="var(--font-mono)"
              fill={photoOn ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}>
              IMAGING PHOTOMETER
            </text>
            <text x={photoX + 23} y={photoY + 50} textAnchor="middle"
              fontSize="7" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
              CCD
            </text>
            <text x={photoX + 75} y={photoY + 52} textAnchor="middle"
              fontSize="7" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
              filters
            </text>
          </g>

          {/* ── SPECTROMETER ───────────────────────────────────── */}
          <g
            style={{
              opacity: specOn ? compOp(4) : 0.28,
              filter: specOn ? glow(4) : "none",
            }}
          >
            <rect x={specX} y={specY} width={specW} height={specH}
              rx="3"
              fill="rgb(var(--c-text-rgb) / 0.04)"
              stroke={specOn ? "rgb(var(--c-accent-rgb) / 0.7)" : "rgb(var(--c-text-rgb) / 0.3)"}
              strokeWidth="1" />
            {/* Entrance slit */}
            <g transform={`translate(${specX + 90}, ${specY + 18})`}>
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgb(var(--c-text-rgb) / 0.85)" strokeWidth="1" />
              <line x1="0" y1="14" x2="0" y2="20" stroke="rgb(var(--c-text-rgb) / 0.85)" strokeWidth="1" />
            </g>
            {/* Grating with rulings */}
            <g transform={`translate(${specX + 60}, ${specY + 16}) rotate(-30)`}>
              <line x1="0" y1="0" x2="0" y2="24" stroke="rgb(var(--c-text-rgb) / 0.75)" strokeWidth="1.4" />
              {[2, 7, 12, 17, 22].map((d) => (
                <line key={d} x1="-3" y1={d} x2="3" y2={d}
                  stroke="rgb(var(--c-text-rgb) / 0.75)" strokeWidth="0.5" />
              ))}
            </g>
            {/* Dispersed colour rays — grating to linear CCD */}
            {[
              { color: "#9c6cff", x: 12 },
              { color: "#5f88ff", x: 19 },
              { color: "#5fc36f", x: 26 },
              { color: "#ddcc40", x: 33 },
              { color: "#ff8a4d", x: 40 },
              { color: "#d04040", x: 47 },
            ].map((s, i) => (
              <line key={i}
                x1={specX + 60} y1={specY + 30}
                x2={specX + s.x} y2={specY + 48}
                stroke={s.color} strokeWidth="0.9" opacity="0.85" />
            ))}
            {/* Linear CCD */}
            <g transform={`translate(${specX + 8}, ${specY + 47})`}>
              <rect x="0" y="0" width="48" height="6"
                fill="rgb(var(--c-text-rgb) / 0.12)"
                stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="0.5" />
              {Array.from({ length: 7 }, (_, i) => (
                <line key={i} x1={(i + 1) * 6} y1="0" x2={(i + 1) * 6} y2="6"
                  stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth="0.3" />
              ))}
            </g>
            <text x={specX + specW / 2} y={specY + specH + 14} textAnchor="middle"
              fontSize="10" letterSpacing="1.5" fontFamily="var(--font-mono)"
              fill={specOn ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-text-rgb) / 0.6)"}>
              SPECTROMETER
            </text>
            <text x={specX + 92} y={specY + 12} textAnchor="end" fontSize="7"
              fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
              slit
            </text>
            <text x={specX + 58} y={specY + 12} textAnchor="end" fontSize="7"
              fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">
              grating
            </text>
          </g>

          {/* SIGNAL lines (electronic, dashed copper) instrument → processor */}
          <line
            x1={photoX + 6} y1={photoY + photoH / 2}
            x2={procX + procW} y2={procY + 8}
            stroke="#d4a23a" strokeWidth="1.2" strokeDasharray="3 3"
            opacity={photoOn ? rayOp(5) : 0.14}
          />
          <line
            x1={specX + 6} y1={specY + specH / 2}
            x2={procX + procW} y2={procY + procH - 8}
            stroke="#d4a23a" strokeWidth="1.2" strokeDasharray="3 3"
            opacity={specOn ? rayOp(5) : 0.14}
          />

          {/* PROCESSOR / COMPUTER */}
          <g style={{ opacity: compOp(5), filter: glow(5) }}>
            <rect x={procX} y={procY} width={procW} height={procH} rx="4"
              fill="rgb(var(--c-text-rgb) / 0.08)"
              stroke="rgb(var(--c-accent-rgb) / 0.7)" strokeWidth="1.2" />
            {Array.from({ length: 3 }, (_, i) => (
              <line key={i}
                x1={procX + 12 + i * 10} y1={procY + 10}
                x2={procX + 12 + i * 10} y2={procY + procH - 10}
                stroke="rgb(var(--c-accent-rgb) / 0.55)" strokeWidth="0.6" />
            ))}
            <text x={procX + procW / 2} y={procY - 6} textAnchor="middle"
              fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)"
              fill="rgb(var(--c-accent-rgb))">
              COMPUTER
            </text>
          </g>

          {/* Output arrow processor → output panel */}
          <line
            x1={procX + procW / 2} y1={procY + procH + 2}
            x2={procX + procW / 2} y2={outY - 4}
            stroke="rgb(var(--c-accent-rgb))" strokeWidth="1.4"
            opacity={rayOp(6)} markerEnd="url(#anatomyArrow)"
          />

          {/* OUTPUT PANEL — image (photometer) OR spectrum (spectrometer) */}
          <g style={{ opacity: compOp(6), filter: glow(6) }}>
            <rect x={outX} y={outY} width={outW} height={outH} rx="3"
              fill="rgba(0,0,0,0.4)"
              stroke="rgb(var(--c-accent-rgb) / 0.55)" strokeWidth="1" />
            <text x={outX + outW / 2} y={outY - 5} textAnchor="middle"
              fontSize="9" letterSpacing="2" fontFamily="var(--font-mono)"
              fill="rgb(var(--c-accent-rgb) / 0.85)">
              {photoOn ? "IMAGE" : "SPECTRUM"}
            </text>
            {photoOn ? (
              <g transform={`translate(${outX + 10}, ${outY + 6})`}>
                {[
                  { x: 18, y: 22, r: 2.6 },
                  { x: 48, y: 12, r: 1.6 },
                  { x: 80, y: 18, r: 3.1 },
                  { x: 118, y: 28, r: 1.8 },
                  { x: 150, y: 16, r: 2.1 },
                  { x: 38, y: 34, r: 1.5 },
                  { x: 100, y: 35, r: 2.3 },
                  { x: 175, y: 30, r: 1.4 },
                  { x: 192, y: 14, r: 1.2 },
                ].map((s, i) => (
                  <circle key={i} cx={s.x} cy={s.y} r={s.r}
                    fill="white" opacity="0.9" />
                ))}
                <text x={198} y={42} textAnchor="end" fontSize="7"
                  fontFamily="var(--font-mono)" fill="rgba(255,255,255,0.5)">
                  brightness map
                </text>
              </g>
            ) : (
              <g transform={`translate(${outX + 10}, ${outY + 6})`}>
                {/* baseline axis */}
                <line x1="0" y1="32" x2="200" y2="32"
                  stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
                {/* continuum */}
                <line x1="0" y1="22" x2="200" y2="22"
                  stroke="rgb(var(--c-solar-rgb))" strokeWidth="1.2" opacity="0.5" />
                {/* emission spikes */}
                {[
                  { x: 25, h: 14 },
                  { x: 65, h: 19 },
                  { x: 110, h: 11 },
                  { x: 160, h: 9 },
                ].map((p, i) => (
                  <line key={i}
                    x1={p.x} y1={22} x2={p.x} y2={22 - p.h}
                    stroke="rgb(var(--c-accent-rgb))" strokeWidth="1.5" />
                ))}
                <text x="0" y="40" fontSize="6"
                  fontFamily="var(--font-mono)"
                  fill="rgba(255,255,255,0.5)">
                  λ →
                </text>
                <text x={198} y={42} textAnchor="end" fontSize="7"
                  fontFamily="var(--font-mono)" fill="rgba(255,255,255,0.5)">
                  intensity vs λ
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Stage description */}
      <div
        className="mt-4 px-4 py-2.5 rounded-md text-[14px] leading-snug text-white/85 min-h-[5.5em]"
        style={{
          background: "rgb(var(--c-accent-rgb) / 0.05)",
          border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        }}
      >
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma mr-2">
          {ANATOMY_STAGES[stage].label}
        </span>
        {ANATOMY_STAGES[stage].blurb}
      </div>
    </FigurePanel>
  );
}
