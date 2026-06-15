import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { withBase } from "../../../data/course-nav";
import { HoverZoomImage } from "../../../components/shared/HoverZoomImage";

/* Shared figure shell — mirrors the 1.1 / 1.4 pattern. */
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

/* Tracks `.is-fs` on the enclosing FigureFrame so fixed-px HTML text can scale
   up in fullscreen (the SVG scales with its viewBox). 1.1 / 1.4 pattern. */
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

/* Off-screen real <button>s for FigureFrame's navigator (it fires shortcuts via
   .click(), which SVG elements don't implement). */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ════════════════════════════════════════════════════════════════════
   2.1.a · Anatomy of the Milky Way — face-on + edge-on, every region
   selectable. A bespoke rebuild of the ESA structure diagram
   (knowledgebase/2026-spring/media/mw.webp), with the central black-hole
   mass corrected to ≈4 million Suns (the ESA graphic's "40M" is wrong).

   FIVE selectables (disk, bulge & bar, spiral arms, stellar halo, the Sun);
   each highlights its shape in BOTH views and opens the constant-height
   detail box below. Select by click, keys 1–5, or ←/→ (story order; the
   fullscreen wheel follows). viewBox 1000×470: FACE-ON centred (250,250),
   EDGE-ON centred (750,250); titles y≈26, scale note y≈462. ════════════ */

type RegionId = "disk" | "bulge" | "arms" | "halo" | "sun";
type Field = { label: string; body: ReactNode };
type Region = {
  id: RegionId;
  title: string;
  color: string;
  stat: ReactNode;
  fields: [Field, Field];
};

const REGIONS: Record<RegionId, Region> = {
  disk: {
    id: "disk",
    title: "The Disk",
    color: "#2dd4bf",
    stat: <>≈100,000 ly across · a bright layer ≈1,000 ly thick inside an older layer roughly 3× thicker</>,
    fields: [
      { label: "What it is", body: <>The flattened pancake of stars, gas, and dust — about 100,000 light-years wide but only ~1,000 thick, proportionally thinner than a sheet of paper.</> },
      { label: "Two layers", body: <>A young, bright <em>thin disk</em> (new stars, gas, dust, and the spiral arms) sits inside an older, fainter <em>thick disk</em> a few times thicker, stirred up over billions of years.</> },
    ],
  },
  bulge: {
    id: "bulge",
    title: "Bulge & Bar",
    color: "#fbbf24",
    stat: <>central bar ≈25,000 ly long · the oldest, densest stars · black hole Sgr A* ≈ 4 million Suns</>,
    fields: [
      { label: "What it is", body: <>A dense, football-shaped swarm of mostly old stars at the centre, drawn out into an elongated bar — which is why ours counts as a <em>barred</em> spiral.</> },
      { label: "At its heart", body: <>A supermassive black hole, Sagittarius A*, of about 4 million Suns. Tracking the stars whipping around it won the 2020 Nobel Prize in Physics.</> },
    ],
  },
  arms: {
    id: "arms",
    title: "Spiral Arms",
    color: "#a78bda",
    stat: <>two major arms + minor gas arms and spurs · gas, dust, and young blue stars</>,
    fields: [
      { label: "What it is", body: <>Bright lanes winding out from the bar's ends, lit by short-lived blue stars — so they mark where stars are being born right now, not fixed strings of stars.</> },
      { label: "Ours", body: <>Counting old stars, two major arms stand out — Scutum–Centaurus and Perseus; tracing gas shows more. The Sun lies on a minor spur, the Orion Spur.</> },
    ],
  },
  halo: {
    id: "halo",
    title: "Stellar Halo",
    color: "#7fb682",
    stat: <>a vast spherical cloud · ~150 globular clusters · the Galaxy's oldest stars</>,
    fields: [
      { label: "What it is", body: <>A faint, roughly spherical cloud wrapping the whole disk — sparse, ancient stars on randomly tilted orbits, reaching far above and below the plane.</> },
      { label: "Globular clusters", body: <>It holds about 150 globular clusters: tight balls of up to a million of the oldest stars known, survivors from when the Galaxy first formed.</> },
    ],
  },
  sun: {
    id: "sun",
    title: "The Sun",
    color: "#e5536b",
    stat: <>≈27,000 ly from the centre · orbiting at ≈230 km/s · one lap ≈ 220 million years</>,
    fields: [
      { label: "Where we are", body: <>About two-thirds of the way out toward the disk's edge — a quiet suburb, not the centre, as Harlow Shapley first showed in 1918.</> },
      { label: "Our orbit", body: <>We circle the centre at roughly 230 km/s, completing one "galactic year" every ~220 million years — only about 20 laps since the Sun was born.</> },
    ],
  },
};

const ORDER: RegionId[] = ["disk", "bulge", "arms", "halo", "sun"];

/* ── Geometry constants ── */
const FX = 250, FY = 250; // face-on centre
const EX = 750, EY = 250; // edge-on centre
const R_HALO = 202;
const R_DISK = 176;
const SUN_R = 116; // Sun's orbital radius in the face-on view (≈0.66 of disk)
const SUN_ANG = -108; // degrees, places the Sun upper-left

/* Log-spiral arm path in the face-on view. */
function armPath(startDeg: number, turns: number, rStart: number, rEnd: number): string {
  const steps = 64;
  const b = Math.log(rEnd / rStart) / (turns * 2 * Math.PI);
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * turns * 2 * Math.PI;
    const r = rStart * Math.exp(b * theta);
    const ang = (startDeg * Math.PI) / 180 + theta;
    const x = FX + r * Math.cos(ang);
    const y = FY + r * Math.sin(ang);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}
const MAIN_ARMS = [armPath(20, 0.62, 52, R_DISK - 6), armPath(200, 0.62, 52, R_DISK - 6)];
const MINOR_ARMS = [armPath(110, 0.5, 50, R_DISK - 28), armPath(290, 0.5, 50, R_DISK - 28)];

/* Deterministic globular-cluster dots (no RNG). Face-on: scattered in the
   halo ring; edge-on: above & below the disk plane. */
const GC_FACE: [number, number][] = [
  [70, 90], [430, 110], [120, 410], [400, 400], [60, 280], [445, 250], [250, 55], [250, 448], [160, 150], [350, 360],
];
const GC_EDGE: [number, number][] = [
  [600, 130], [700, 100], [820, 120], [900, 170], [640, 360], [760, 390], [870, 350], [690, 175], [810, 330], [930, 250],
];

const sunXY = {
  x: FX + SUN_R * Math.cos((SUN_ANG * Math.PI) / 180),
  y: FY + SUN_R * Math.sin((SUN_ANG * Math.PI) / 180),
};

export function MilkyWayAnatomyPanel(): JSX.Element {
  const [selId, setSelId] = useState<RegionId>("disk");
  const sel = REGIONS[selId];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const step = (dir: -1 | 1) => {
    const i = ORDER.indexOf(selId);
    setSelId(ORDER[Math.max(0, Math.min(ORDER.length - 1, i + dir))]);
  };

  /* opacity of a region's shapes given the current selection */
  const op = (id: RegionId, base = 0.5, hi = 1) => (selId === id ? hi : base);
  const FAINT = "rgb(var(--c-text-rgb) / 0.5)";
  const GHOST = "rgb(var(--c-text-rgb) / 0.32)";

  return (
    <FigurePanel
      idx="2.1.a"
      kicker="Anatomy of the Milky Way"
      caption={
        <>
          Our Galaxy seen two ways — face-on (the spiral) and edge-on (the disk) — drawn to the same scale.
          Click any part, or press 1–5 or the arrow keys, to open its details. One rule for reading it: the
          dashed ring is the Sun's orbit, and the dots scattered beyond the disk are globular clusters in the halo.
        </>
      }
    >
      {/* `.fig-viz` holds JUST the SVG; the detail box + a11y buttons are
          siblings below, so the fullscreen flex-centring can't swallow them. */}
      <div
        ref={vizRef}
        className="fig-viz relative w-full"
        style={{ background: "rgb(var(--c-text-rgb) / 0.02)", borderRadius: 8, padding: "12px 10px 14px", border: "1px solid rgb(var(--c-text-rgb) / 0.06)" }}
      >
        <svg
          viewBox="0 0 1000 470"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="The Milky Way drawn face-on (a barred spiral with two main arms, the Sun on a minor spur about two-thirds out) and edge-on (a thin disk inside a thick disk, a central bulge and bar, wrapped in a spherical halo of globular clusters)"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            <radialGradient id="mw-disk" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(var(--c-text-rgb) / 0.16)" />
              <stop offset="60%" stopColor="rgb(var(--c-text-rgb) / 0.08)" />
              <stop offset="100%" stopColor="rgb(var(--c-text-rgb) / 0)" />
            </radialGradient>
          </defs>

          {/* view titles */}
          <g fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)" fontSize="13" letterSpacing="2" textAnchor="middle">
            <text x={FX} y={24}>FACE-ON</text>
            <text x={EX} y={24}>EDGE-ON</text>
          </g>

          {/* ───────────────── HALO (both views) ───────────────── */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("halo")}>
            <circle cx={FX} cy={FY} r={R_HALO} fill="none" stroke={selId === "halo" ? REGIONS.halo.color : GHOST} strokeWidth={selId === "halo" ? 2 : 1} strokeDasharray="1 7" opacity={op("halo", 0.55)} />
            <circle cx={EX} cy={EY} r={R_HALO} fill="none" stroke={selId === "halo" ? REGIONS.halo.color : GHOST} strokeWidth={selId === "halo" ? 2 : 1} strokeDasharray="1 7" opacity={op("halo", 0.55)} />
            {GC_FACE.map(([x, y], i) => (
              <circle key={`gcf${i}`} cx={x} cy={y} r={selId === "halo" ? 3.4 : 2.6} fill={selId === "halo" ? REGIONS.halo.color : FAINT} opacity={op("halo", 0.6)} />
            ))}
            {GC_EDGE.map(([x, y], i) => (
              <circle key={`gce${i}`} cx={x} cy={y} r={selId === "halo" ? 3.4 : 2.6} fill={selId === "halo" ? REGIONS.halo.color : FAINT} opacity={op("halo", 0.6)} />
            ))}
          </g>

          {/* ───────────────── FACE-ON ───────────────── */}
          {/* disk wash */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("disk")}>
            <circle cx={FX} cy={FY} r={R_DISK} fill="url(#mw-disk)" opacity={op("disk", 0.7)} />
            {selId === "disk" && <circle cx={FX} cy={FY} r={R_DISK} fill="none" stroke={REGIONS.disk.color} strokeWidth={1.5} opacity={0.8} />}
          </g>

          {/* spiral arms */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("arms")} fill="none" strokeLinecap="round">
            {MAIN_ARMS.map((d, i) => (
              <path key={`ma${i}`} d={d} stroke={selId === "arms" ? REGIONS.arms.color : FAINT} strokeWidth={selId === "arms" ? 9 : 7} opacity={op("arms", 0.5)} style={{ filter: selId === "arms" ? `drop-shadow(0 0 5px ${REGIONS.arms.color})` : undefined }} />
            ))}
            {MINOR_ARMS.map((d, i) => (
              <path key={`mi${i}`} d={d} stroke={selId === "arms" ? REGIONS.arms.color : FAINT} strokeWidth={selId === "arms" ? 5 : 3.5} opacity={op("arms", 0.4)} />
            ))}
          </g>

          {/* bar + bulge (face-on): rotated ellipse */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("bulge")}>
            <ellipse cx={FX} cy={FY} rx={72} ry={26} transform={`rotate(28 ${FX} ${FY})`} fill={REGIONS.bulge.color} opacity={op("bulge", 0.45)} stroke={selId === "bulge" ? REGIONS.bulge.color : "none"} strokeWidth={selId === "bulge" ? 2 : 0} style={{ filter: selId === "bulge" ? `drop-shadow(0 0 8px ${REGIONS.bulge.color})` : undefined }} />
          </g>

          {/* Sun + orbit (face-on) */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("sun")}>
            <circle cx={FX} cy={FY} r={SUN_R} fill="none" stroke={selId === "sun" ? REGIONS.sun.color : GHOST} strokeWidth={selId === "sun" ? 1.6 : 1} strokeDasharray="5 5" opacity={op("sun", 0.5)} />
            <circle cx={sunXY.x} cy={sunXY.y} r={selId === "sun" ? 6 : 4.5} fill={REGIONS.sun.color} stroke="#fff" strokeWidth={1.4} style={{ filter: selId === "sun" ? `drop-shadow(0 0 7px ${REGIONS.sun.color})` : undefined }} />
            <text x={sunXY.x + 11} y={sunXY.y + 4} fontFamily="Inter, sans-serif" fontSize="12" fontWeight={600} fill={selId === "sun" ? REGIONS.sun.color : "rgb(var(--c-text-rgb) / 0.7)"}>Sun</text>
          </g>

          {/* ───────────────── EDGE-ON ───────────────── */}
          {/* thick disk */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("disk")}>
            <ellipse cx={EX} cy={EY} rx={188} ry={38} fill={REGIONS.disk.color} opacity={op("disk", 0.14, 0.28)} />
            {/* thin disk */}
            <ellipse cx={EX} cy={EY} rx={188} ry={11} fill={REGIONS.disk.color} opacity={op("disk", 0.55)} />
            {selId === "disk" && <ellipse cx={EX} cy={EY} rx={188} ry={38} fill="none" stroke={REGIONS.disk.color} strokeWidth={1.5} opacity={0.8} />}
          </g>
          {/* bulge (edge-on): football */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("bulge")}>
            <ellipse cx={EX} cy={EY} rx={50} ry={32} fill={REGIONS.bulge.color} opacity={op("bulge", 0.5)} stroke={selId === "bulge" ? REGIONS.bulge.color : "none"} strokeWidth={selId === "bulge" ? 2 : 0} style={{ filter: selId === "bulge" ? `drop-shadow(0 0 8px ${REGIONS.bulge.color})` : undefined }} />
          </g>
          {/* Sun (edge-on) */}
          <g style={{ cursor: "pointer" }} onClick={() => setSelId("sun")}>
            <circle cx={EX - 116} cy={EY} r={selId === "sun" ? 6 : 4.5} fill={REGIONS.sun.color} stroke="#fff" strokeWidth={1.4} style={{ filter: selId === "sun" ? `drop-shadow(0 0 7px ${REGIONS.sun.color})` : undefined }} />
          </g>

          {/* scale note under the face-on view */}
          <g fontFamily="Inter, sans-serif" fontSize="11" fontStyle="italic" fill="rgb(var(--c-text-rgb) / 0.45)" textAnchor="middle">
            <line x1={FX - R_DISK} y1={462} x2={FX + R_DISK} y2={462} stroke="rgb(var(--c-text-rgb) / 0.28)" strokeWidth={1} />
            <line x1={FX - R_DISK} y1={458} x2={FX - R_DISK} y2={466} stroke="rgb(var(--c-text-rgb) / 0.28)" strokeWidth={1} />
            <line x1={FX + R_DISK} y1={458} x2={FX + R_DISK} y2={466} stroke="rgb(var(--c-text-rgb) / 0.28)" strokeWidth={1} />
            <text x={FX} y={452}>≈ 100,000 light-years</text>
            <text x={EX} y={462}>the same disk, seen from the side</text>
          </g>
        </svg>
      </div>

      {/* ── Detail box — sibling of .fig-viz, constant height ── */}
      <div
        className="mt-3 rounded-md grid gap-3 md:grid-cols-2"
        style={{
          background: "rgb(var(--c-text-rgb) / 0.03)",
          border: `1px solid ${sel.color}66`,
          boxShadow: `inset 0 0 0 1px ${sel.color}22`,
          padding: "12px 14px",
          transition: "border-color 220ms var(--ease)",
          flex: "0 0 auto",
          flexShrink: 0,
        }}
      >
        <div className="md:col-span-2 font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.7) }}>
          {sel.title}
          <span className="normal-case tracking-normal" style={{ color: "rgb(var(--c-text-rgb) / 0.55)" }}>
            {" "}— {sel.stat}
          </span>
        </div>
        {sel.fields.map((field) => (
          <div key={field.label}>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55 mb-1" style={{ fontSize: sz(0.62) }}>
              {field.label}
            </div>
            <div className="text-[14px] text-white/85 leading-[1.55] font-sans" style={{ fontSize: sz(0.88), minHeight: "5.6em" }}>
              {field.body}
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard wiring — ←/→ step the five regions in story order (and the
          fullscreen wheel follows); 1–5 jump straight to one. */}
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelId(id)}
            data-shortcut={String(i + 1)}
            className={selId === id ? "is-active" : ""}
            aria-pressed={selId === id}
          >
            {REGIONS[id].title}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.1.b · The Milky Way from inside — a real all-sky panorama. The band
   IS our own disk seen edge-on from a seat within it. Uses the shared
   opt-in cone-and-inset zoom (HoverZoomImage). ════════════════════════ */
const MW_IMG = withBase("/images/media/milkyway-namibia.webp");

export function MilkyWayBandPanel(): JSX.Element {
  return (
    <FigurePanel
      idx="2.1.b"
      kicker="The View from Inside — the Milky Way over Namibia"
      imgZoom
      caption={
        <>
          The whole arch of light is our own disk, seen edge-on from a seat within it: the merged glow of
          billions of stars, split by dark lanes of dust. The bright, bulging knot near the top is the
          direction of the Galactic centre, in the constellation Sagittarius. Switch on <em>Zoom</em> (the
          button below, or press <strong>z</strong>) and hover to magnify the star clouds and dust lanes.
          Photographed in the Namibian desert. Credit: © Juan Carlos Casado (TWAN / starryearth.com).
        </>
      }
    >
      <HoverZoomImage
        src={MW_IMG}
        zoom={2.8}
        initialFocus={{ x: 0.5, y: 0.4 }}
        hintOff="explore the band up close"
        alt="A 180° panorama of the Milky Way arching over the dark Namibian desert: a hazy band of countless stars, brightest and most bulging toward the Galactic centre, crossed by dark dust lanes, with the faint glow of distant towns on the horizon."
      />
    </FigurePanel>
  );
}
