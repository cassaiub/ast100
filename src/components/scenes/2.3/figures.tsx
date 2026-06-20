import { useEffect, useRef, useState, type CSSProperties, type JSX, type ReactNode } from "react";
import { withBase } from "../../../data/course-nav";
import { HoverZoomImage } from "../../../components/shared/HoverZoomImage";

/* Shared figure shell — mirrors the chapter-0/1/2 pattern. */
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

const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};
const smooth = (x: number) => x * x * (3 - 2 * x);

/* ════════════════════════════════════════════════════════════════════
   2.3.a · The Cosmic Web — structure grows from a near-uniform field of
   density seeds into a network of filaments and clusters around voids.
   Each point of matter migrates from its early near-uniform position to
   its place on the web as the time slider is dragged forward. ════════ */

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WB_W = 1000, WB_H = 600;
/* Nodes (future clusters) + filaments connecting them — a network with
   loops, so the gaps between threads read as voids. */
const WB_NODES: [number, number][] = [
  [175, 135], [490, 95], [825, 155], [300, 330], [640, 320],
  [880, 440], [150, 500], [500, 545], [770, 540],
];
const WB_FIL: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5],
  [3, 6], [4, 7], [5, 8], [6, 7], [7, 8], [1, 3], [2, 4],
];
type WPt = { sx: number; sy: number; tx: number; ty: number; r: number; warm: boolean };
const WB_PTS: WPt[] = (() => {
  const rnd = mulberry32(7);
  const pts: WPt[] = [];
  for (let i = 0; i < 230; i++) {
    const sx = rnd() * WB_W, sy = rnd() * WB_H; // early near-uniform position
    let tx: number, ty: number, warm = false, r = 1.3;
    const k = rnd();
    if (k < 0.34) {
      const nd = WB_NODES[(rnd() * WB_NODES.length) | 0];
      const a = rnd() * 6.283, rad = rnd() * rnd() * 28;
      tx = nd[0] + Math.cos(a) * rad; ty = nd[1] + Math.sin(a) * rad;
      warm = rnd() < 0.5; r = warm ? 2.5 : 1.6;
    } else if (k < 0.93) {
      const e = WB_FIL[(rnd() * WB_FIL.length) | 0];
      const A = WB_NODES[e[0]], B = WB_NODES[e[1]];
      const s = rnd(); const px = A[0] + (B[0] - A[0]) * s, py = A[1] + (B[1] - A[1]) * s;
      const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
      const perp = (rnd() - 0.5) * 24;
      tx = px + (-dy / len) * perp; ty = py + (dx / len) * perp; r = 1.4;
    } else {
      tx = rnd() * WB_W; ty = rnd() * WB_H; r = 1.1; // sparse field galaxies in the voids
    }
    pts.push({ sx, sy, tx, ty, r, warm });
  }
  return pts;
})();
/* annotations that fade in once the web has formed */
const WB_NOTES = [
  { x: 490, y: 95, label: "cluster", dx: 0, dy: -26 },
  { x: 560, y: 207, label: "filament", dx: 70, dy: -6 },
  { x: 700, y: 200, label: "void", dx: 0, dy: 0 },
];

function webEpoch(t: number): { z: string; age: string; name: string; desc: string } {
  if (t < 0.16) return { z: "z ≈ 20", age: "≈ 180 million years", name: "The first seeds", desc: "A near-uniform gas with only the faintest ripples — the density seeds left on the cosmic microwave background." };
  if (t < 0.45) return { z: "z ≈ 6", age: "≈ 1 billion years", name: "Cosmic dawn", desc: "Gravity drags matter along the densest threads; the first galaxies light up and the web begins to take shape." };
  if (t < 0.82) return { z: "z ≈ 1", age: "≈ 6 billion years", name: "The web tightens", desc: "Filaments thicken and clusters grow where threads cross, while the spaces between them empty into voids." };
  return { z: "z = 0", age: "13.8 billion years", name: "Today", desc: "The cosmic web in full — galaxies strung along filaments and piled into clusters at the nodes, around vast, near-empty voids." };
}

export function CosmicWebPanel(): JSX.Element {
  const [t, setT] = useState(1);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const s = smooth(t);
  const ep = webEpoch(t);
  const at = (p: WPt) => [p.sx + (p.tx - p.sx) * s, p.sy + (p.ty - p.sy) * s] as const;

  return (
    <FigurePanel
      idx="2.3.a"
      kicker="The Cosmic Web grows from the seeds"
      caption={
        <>
          Every point is matter pulled by gravity. Drag the time slider (or use ← / →) to run the universe forward from
          a near-uniform haze of density seeds into the <em>cosmic web</em> — galaxies strung along bright filaments,
          piled into clusters where filaments meet, around enormous empty voids. The same gravitational growth the
          Millennium Simulation traced from 180 million years to today.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ background: "radial-gradient(circle at 50% 45%, #0a0c1a 0%, #04050b 80%)", border: "1px solid rgb(255 255 255 / 0.07)" }}
      >
        <svg viewBox={`0 0 ${WB_W} ${WB_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="A field of matter collapsing under gravity from a near-uniform early universe into the cosmic web of filaments, clusters, and voids" style={{ width: "100%", height: "auto", display: "block" }}>
          {/* faint filament threads — appear as structure forms */}
          <g stroke="#8fb6f5" strokeWidth={1} fill="none" opacity={s * 0.28}>
            {WB_FIL.map((e, i) => (
              <line key={i} x1={WB_NODES[e[0]][0]} y1={WB_NODES[e[0]][1]} x2={WB_NODES[e[1]][0]} y2={WB_NODES[e[1]][1]} />
            ))}
          </g>
          {/* node glows (clusters) — brighten as the web tightens */}
          <g opacity={s}>
            {WB_NODES.map((n, i) => (
              <circle key={i} cx={n[0]} cy={n[1]} r={26} fill="#ffd9a0" opacity={0.12} />
            ))}
          </g>
          {/* matter points */}
          {WB_PTS.map((p, i) => {
            const [x, y] = at(p);
            return <circle key={i} cx={x} cy={y} r={p.r} fill={p.warm ? "#ffe6b8" : "#cfe0ff"} opacity={p.warm ? 0.95 : 0.8} />;
          })}
          {/* feature labels fade in at the end */}
          <g opacity={Math.max(0, s - 0.55) / 0.45} fontFamily="JetBrains Mono, monospace" fontSize={13} letterSpacing="1.5" fill="rgb(255 255 255 / 0.7)">
            {WB_NOTES.map((nt) => (
              <text key={nt.label} x={nt.x + nt.dx} y={nt.y + nt.dy} textAnchor="middle">{nt.label.toUpperCase()}</text>
            ))}
          </g>
        </svg>
      </div>

      {/* time slider */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>cosmic time — drag the universe forward →</label>
          <span className="font-mono text-[10px] text-plasma" style={{ fontSize: sz(0.62) }}>{ep.z} · {ep.age}</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Cosmic time — left/right arrows run structure formation forward from the early universe to today" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>early universe · smooth</span>
          <span>today · the cosmic web</span>
        </div>
      </div>

      {/* readout */}
      <div className="mt-4 rounded-md p-3" style={{ background: "rgb(143 182 245 / 0.06)", border: "1px solid rgb(143 182 245 / 0.22)", flexShrink: 0 }}>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: "#8fb6f5", fontSize: sz(0.7) }}>{ep.name}</div>
        <div className="mt-1 text-[14px] text-white/85 leading-[1.55] font-sans" style={{ fontSize: sz(0.9), minHeight: "4.6em" }}>{ep.desc}</div>
      </div>
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.3.b · Galaxy mergers — the same collision, two outcomes. A scrub runs
   the encounter from approach → collision (tidal tails + starburst) →
   remnant; the toggle sets the mass ratio. A MAJOR merger of comparable
   spirals destroys the disks → an elliptical; a MINOR merger lets the big
   disk survive while it swallows a dwarf. ══════════════════════════════ */

const MG_W = 1000, MG_H = 520;
const C_DISK = "#9cc4ff", C_BULGE = "#ffe6a8", C_OLD = "#e0a06a", C_KNOT = "#ff8ad0";

function arm(cx: number, cy: number, R: number, startDeg: number, turns: number): string {
  const steps = 22, rs = R * 0.18, re = R * 0.98;
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
function Spiral({ cx, cy, R, rot = 0, disturbed = 0 }: { cx: number; cy: number; R: number; rot?: number; disturbed?: number }) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={R} fill={C_DISK} opacity={0.12} />
      {[0, 180].map((a) => (
        <path key={a} d={arm(cx, cy, R, a + disturbed * 40, 0.62 + disturbed * 0.2)} fill="none" stroke={C_DISK} strokeWidth={R * 0.13} strokeLinecap="round" opacity={0.9} />
      ))}
      <circle cx={cx} cy={cy} r={R * 0.28} fill={C_BULGE} />
    </g>
  );
}
function Dwarf({ cx, cy, R }: { cx: number; cy: number; R: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill={C_DISK} opacity={0.22} />
      <circle cx={cx} cy={cy} r={R * 0.5} fill="#dfe8ff" opacity={0.9} />
    </g>
  );
}
function Elliptical({ cx, cy, R }: { cx: number; cy: number; R: number }) {
  return (
    <g transform={`rotate(-18 ${cx} ${cy})`}>
      <radialGradient id="mg-ell" cx="48%" cy="44%" r="60%">
        <stop offset="0%" stopColor="#fff4e3" stopOpacity={1} />
        <stop offset="26%" stopColor="#f3ca97" stopOpacity={0.98} />
        <stop offset="60%" stopColor={C_OLD} stopOpacity={0.85} />
        <stop offset="100%" stopColor="#bf7740" stopOpacity={0} />
      </radialGradient>
      <ellipse cx={cx} cy={cy} rx={R * 1.15} ry={R * 0.8} fill="url(#mg-ell)" />
    </g>
  );
}
/* a curved tidal tail trailing from (x,y) */
function tail(x: number, y: number, dir: number, len: number): string {
  const a = (dir * Math.PI) / 180;
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const cx = x + Math.cos(a + 0.9) * len * 0.55, cy = y + Math.sin(a + 0.9) * len * 0.55;
  return `M ${x} ${y} Q ${cx} ${cy} ${ex} ${ey}`;
}
const MG_KNOTS: [number, number][] = [[-30, -10], [22, 18], [-8, 28], [34, -22], [4, -2], [-40, 14], [46, 6]];

type MergeType = "major" | "minor";
const MG_INFO: Record<MergeType, Record<"approach" | "collide" | "remnant", { name: string; desc: string }>> = {
  major: {
    approach: { name: "Two equals approach", desc: "Two spiral galaxies of comparable size fall toward each other — gravity will not let comparable masses simply pass by." },
    collide: { name: "Disks shattered", desc: "The violent encounter scrambles both disks, flinging out long tidal tails of stars and gas and compressing clouds into a galaxy-wide starburst of new clusters." },
    remnant: { name: "→ an elliptical", desc: "The spiral arms are gone for good. The scrambled stars settle into a smooth, featureless elliptical — a major merger climbs the tuning fork in reverse." },
  },
  minor: {
    approach: { name: "A dwarf falls in", desc: "A large spiral meets a much smaller companion — the kind of lopsided encounter that is far more common than a meeting of equals." },
    collide: { name: "Swallowed whole", desc: "The dwarf is torn apart and stretched into a thin stream, peppering the big galaxy with fresh stars — but the massive disk barely flinches." },
    remnant: { name: "→ still a spiral", desc: "The disk survives — a little thicker and more ruffled, its bulge a touch bigger. This is how the Milky Way has grown, swallowing dwarf after dwarf." },
  },
};

export function MergerPanel(): JSX.Element {
  const [type, setType] = useState<MergeType>("major");
  const [stage, setStage] = useState(0.5); // 0 approach · 0.5 collide · 1 remnant
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  /* three keyframes at 0 / 0.5 / 1 — triangular cross-fade */
  const op = (k: number) => Math.max(0, 1 - Math.abs(stage - k) / 0.5);
  const phase = stage < 0.25 ? "approach" : stage < 0.75 ? "collide" : "remnant";
  const info = MG_INFO[type][phase as "approach" | "collide" | "remnant"];
  const accent = type === "major" ? C_OLD : C_DISK;
  const cxC = MG_W / 2, cyC = MG_H / 2 - 6;

  return (
    <FigurePanel
      idx="2.3.b"
      kicker="One collision, two fates"
      caption={
        <>
          The same crash, two outcomes — set by who is bigger. Scrub the encounter (or use ← / →) from approach, through
          the collision that draws out tidal tails and ignites a starburst, to the remnant. A <strong>major</strong>
          {" "}merger of equals destroys the disks and leaves an elliptical; a <strong>minor</strong> merger lets the big
          disk survive as it swallows a dwarf — how the Milky Way has grown. Toggle the mass ratio to compare.
        </>
      }
    >
      <div
        ref={vizRef}
        data-theme="dark"
        className="fig-viz relative w-full rounded-md overflow-hidden"
        style={{ background: "radial-gradient(circle at 50% 45%, #0b0d1c 0%, #05060c 80%)", border: "1px solid rgb(255 255 255 / 0.07)" }}
      >
        <svg viewBox={`0 0 ${MG_W} ${MG_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Two galaxies colliding: approach, then a collision with tidal tails and a starburst, then a remnant that is an elliptical for a major merger or a surviving spiral for a minor merger" style={{ width: "100%", height: "auto", display: "block" }}>
          {/* ── approach ── */}
          <g opacity={op(0)}>
            <Spiral cx={cxC - 180} cy={cyC} R={66} rot={10} />
            {type === "major"
              ? <Spiral cx={cxC + 180} cy={cyC} R={62} rot={200} />
              : <Dwarf cx={cxC + 190} cy={cyC - 30} R={26} />}
            <g stroke="rgb(255 255 255 / 0.35)" strokeWidth={2} markerEnd="">
              <path d={`M ${cxC - 92} ${cyC} L ${cxC - 56} ${cyC}`} />
              <path d={`M ${cxC - 56} ${cyC} l -10 -6 m 10 6 l -10 6`} fill="none" />
              <path d={`M ${cxC + (type === "major" ? 96 : 110)} ${cyC - (type === "major" ? 0 : 30)} L ${cxC + 60} ${cyC - (type === "major" ? 0 : 18)}`} />
            </g>
          </g>

          {/* ── collision: overlap + tidal tails + starburst ── */}
          <g opacity={op(0.5)}>
            <path d={tail(cxC - 40, cyC - 14, 200, 300)} fill="none" stroke={C_DISK} strokeWidth={4} opacity={0.55} strokeLinecap="round" />
            <path d={tail(cxC + 40, cyC + 14, 20, type === "major" ? 300 : 150)} fill="none" stroke={C_DISK} strokeWidth={4} opacity={0.55} strokeLinecap="round" />
            <Spiral cx={cxC - 34} cy={cyC - 8} R={58} rot={30} disturbed={1} />
            {type === "major"
              ? <Spiral cx={cxC + 34} cy={cyC + 8} R={54} rot={210} disturbed={1} />
              : <Dwarf cx={cxC + 40} cy={cyC + 6} R={18} />}
            {MG_KNOTS.map(([dx, dy], i) => (
              <circle key={i} cx={cxC + dx} cy={cyC + dy} r={4.5} fill={i % 2 ? C_KNOT : "#bcd9ff"} opacity={0.95} style={{ filter: `drop-shadow(0 0 4px ${i % 2 ? C_KNOT : "#bcd9ff"})` }} />
            ))}
          </g>

          {/* ── remnant ── */}
          <g opacity={op(1)}>
            {type === "major"
              ? <Elliptical cx={cxC} cy={cyC} R={86} />
              : <Spiral cx={cxC} cy={cyC} R={74} rot={0} disturbed={0.4} />}
            {/* faint relic tail */}
            <path d={tail(cxC - 30, cyC, 205, 150)} fill="none" stroke={C_DISK} strokeWidth={2.5} opacity={0.2} strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* scrub + type toggle */}
      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>scrub the encounter →</label>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: accent, fontSize: sz(0.62) }}>{phase}</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={stage} onChange={(e) => setStage(parseFloat(e.target.value))} className="cosmic-slider" aria-label="Scrub the merger from approach through collision to remnant" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>approach</span><span>collision</span><span>remnant</span>
        </div>
        <div className="flex gap-2 mt-3">
          {(["major", "minor"] as MergeType[]).map((mt, i) => (
            <button key={mt} type="button" onClick={() => setType(mt)} data-shortcut={String(i + 1)}
              className="font-mono uppercase tracking-[0.16em]"
              style={{ fontSize: sz(0.58) ?? "10px", padding: "4px 13px", borderRadius: 9999, cursor: "pointer", color: type === mt ? "rgb(5 6 12)" : (mt === "major" ? C_OLD : C_DISK), background: type === mt ? (mt === "major" ? C_OLD : C_DISK) : "rgb(255 255 255 / 0.05)", border: `1px solid ${(mt === "major" ? C_OLD : C_DISK)}88` }}>
              {mt === "major" ? "Major merger" : "Minor merger"}
            </button>
          ))}
        </div>
      </div>

      {/* readout */}
      <div className="mt-4 rounded-md p-3" style={{ background: "rgb(255 255 255 / 0.035)", border: `1px solid ${accent}66`, flexShrink: 0 }}>
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: accent, fontSize: sz(0.7) }}>{info.name}</div>
        <div className="mt-1 text-[14px] text-white/85 leading-[1.55] font-sans" style={{ fontSize: sz(0.9), minHeight: "4.4em" }}>{info.desc}</div>
      </div>

      {/* keyboard: ←/→ scrub the slider (native); 1/2 toggle type via the chips */}
      <span style={srOnly} aria-hidden />
    </FigurePanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2.3.c · The Antennae — a real major merger caught in the act. A Hubble
   close-up of NGC 4038/4039: the two disrupted cores and the thousands of
   blue "super star clusters" born in the collision-driven starburst, with
   pink hydrogen marking where stars are forming right now. The schematic
   in 2.3.b is the mechanism; this is the real thing. Uses the shared
   opt-in hover-zoom (HoverZoomImage). ════════════════════════════════ */
const ANTENNAE_IMG = withBase("/images/media/antennae.webp");

export function AntennaeImagePanel(): JSX.Element {
  return (
    <FigurePanel
      idx="2.3.c"
      kicker="The Antennae — a major merger caught in the act"
      imgZoom
      caption={
        <>
          Two spiral galaxies, NGC 4038 and 4039, roughly 70 million light-years away, midway through a
          collision. The two bright cores are the original galactic centres, still falling together; the
          knots of blue light strewn between them are <em>super star clusters</em> — thousands of them, each
          a fresh batch of millions of stars triggered by the crash — and the pink glow marks hydrogen lit up
          where stars are being born now. The two faint tidal tails that give the pair its name sweep far
          beyond this frame. Switch on <em>Zoom</em> (or press <strong>z</strong>) and hover to explore the
          clusters. Credit: NASA, ESA, Hubble.
        </>
      }
    >
      <HoverZoomImage
        src={ANTENNAE_IMG}
        zoom={2.8}
        initialFocus={{ x: 0.5, y: 0.46 }}
        hintOff="explore the starburst up close"
        alt="A Hubble close-up of the Antennae galaxies: two merging spiral galaxies whose bright golden cores are surrounded by a turbulent field of blue super star clusters and pink clouds of glowing hydrogen, where the collision has triggered an explosion of new star formation."
      />
    </FigurePanel>
  );
}
