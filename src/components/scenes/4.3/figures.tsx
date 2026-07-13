import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";

/* Shared figure shell — mirrors the chapter-0/1/2/3 pattern. */
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

/* Tracks whether the enclosing FigureFrame is fullscreen (`.is-fs`). */
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

/* Off-screen but real <button>s for FigureFrame's keyboard navigator. */
const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ── 4.3.a — A disk with a thermostat ───────────────────────────────
   The young solar nebula in cross-section, distance on a log axis from
   0.05 to 50 au. Drag the probe (a range slider — so ←/→ drive it) to
   any distance and read what can exist as a solid there. Condensation
   fronts (sublimation, soot, snow lines) are drawn where they stood in
   the planet-forming era; they migrated over time (noted in caption).

   The slider is the figure's first <input type=range>, so FigureFrame
   routes ←/→ (and the fullscreen wheel) to it automatically. */

/* condensation fronts, era-of-formation anchors */
const FRONTS = [
  { r: 0.08, label: "silicate line", sub: "rock vapour inside", color: "#f87171" },
  { r: 0.8, label: "soot line", sub: "organics burn inside", color: "#fb923c" },
  { r: 2.7, label: "water snow line", sub: "H₂O freezes beyond", color: "#7dd3fc" },
  { r: 10, label: "CO₂ snow line", sub: "CO₂ freezes beyond", color: "#a5b4fc" },
  { r: 27, label: "CO snow line", sub: "CO freezes beyond", color: "#c4b5fd" },
];

type DiskZone = {
  name: string;
  color: string;
  solids: string;
  body: ReactNode;
};

const ZONES: { upTo: number; z: DiskZone }[] = [
  { upTo: 0.08, z: { name: "The furnace", color: "#f87171", solids: "nothing — even rock is vapour",
    body: <>Hotter than ~1,400 kelvin: no solid grain of any kind survives. Nothing can grow here — worlds found this close to a star today must have formed farther out and moved in.</> } },
  { upTo: 0.8, z: { name: "Dry rock country", color: "#fbbf24", solids: "rock + metal grains",
    body: <>Cool enough for rock and iron to condense, but inside the soot line carbon-rich organic material is destroyed. The building blocks here are dry, carbon-poor rock — the recipe of Mercury, Venus, and Earth.</> } },
  { upTo: 2.7, z: { name: "Sooty rock country", color: "#fb923c", solids: "rock + carbon-rich organics",
    body: <>Beyond the soot line, dark carbon-rich coatings survive on the grains. Still too warm for ice: solids remain scarce, so worlds born here stay modest in size — Mars and the asteroids.</> } },
  { upTo: 10, z: { name: "Beyond the snow line", color: "#7dd3fc", solids: "rock + organics + water ice",
    body: <>Past ~2.7 au water freezes onto every grain, roughly doubling the solid material. Big cores grow fast here — fast enough to capture gas and become giants. Jupiter sits just beyond this line.</> } },
  { upTo: 51, z: { name: "The deep freeze", color: "#c4b5fd", solids: "rock + all the ices (H₂O, CO₂, CO)",
    body: <>Far out, almost every gas freezes solid. Growth is slow and the leftovers never join a planet — the primitive icy bodies of the Kuiper belt and the comets, unchanged since the beginning.</> } },
];

const RMIN = 0.05, RMAX = 50;

export function DiskThermostatPanel(): JSX.Element {
  const [frac, setFrac] = useState(0.43);     // ~1 au
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const r = RMIN * Math.pow(RMAX / RMIN, frac);
  const zone = ZONES.find((z) => r < z.upTo)!.z;
  /* rough optically-thin midplane temperature, T ≈ 280 K / √(r/au) */
  const T = 280 / Math.sqrt(r);
  const tLabel = T >= 1400 ? "≳ 1,400 K" : `≈ ${Math.round(T).toLocaleString("en-US")} K`;
  const rLabel = r < 0.1 ? r.toFixed(3) : r < 1 ? r.toFixed(2) : r.toFixed(1);

  const W = 904, H = 470;
  const L = 64, Rm = 30;
  const midY = 240;
  const lg = (x: number) => Math.log10(x);
  const xp = (au: number) => L + ((lg(au) - lg(RMIN)) / (lg(RMAX) - lg(RMIN))) * (W - L - Rm);

  /* flaring disk outline: half-height grows with radius */
  const diskPath = (() => {
    const pts: string[] = [];
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const au = RMIN * Math.pow(RMAX / RMIN, i / N);
      const h = 12 + 92 * Math.pow(i / N, 1.35);
      pts.push(`${i === 0 ? "M" : "L"} ${xp(au).toFixed(1)} ${(midY - h).toFixed(1)}`);
    }
    for (let i = N; i >= 0; i--) {
      const au = RMIN * Math.pow(RMAX / RMIN, i / N);
      const h = 12 + 92 * Math.pow(i / N, 1.35);
      pts.push(`L ${xp(au).toFixed(1)} ${(midY + h).toFixed(1)}`);
    }
    return pts.join(" ") + " Z";
  })();

  const xticks = [0.1, 0.3, 1, 3, 10, 30];
  const solidsChips = [
    { name: "rock + metal", on: r >= 0.08 },
    { name: "organics", on: r >= 0.8 },
    { name: "H₂O ice", on: r >= 2.7 },
    { name: "CO₂ ice", on: r >= 10 },
    { name: "CO ice", on: r >= 27 },
  ];

  return (
    <FigurePanel
      idx="4.3.a"
      kicker="A disk with a thermostat"
      caption={
        <>
          The young solar nebula in cross-section, with distance from the newborn Sun on a logarithmic axis. Drag the
          probe — or use the arrow keys — to any distance and read the rough temperature and which building materials
          existed as solids there. The condensation fronts are drawn where they stood during the planet-forming era
          (the water snow line near 2.7 au, the divide preserved today inside the asteroid belt); all of them drifted
          as the disk cooled.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 8% 50%, #251507 0%, #0d0b13 45%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Protoplanetary disk cross-section; probe at ${rLabel} astronomical units`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="disk-heat" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fde68a" stopOpacity="0.95" />
              <stop offset="0.18" stopColor="#fb923c" stopOpacity="0.7" />
              <stop offset="0.45" stopColor="#7f5a3c" stopOpacity="0.55" />
              <stop offset="0.72" stopColor="#3b5a8a" stopOpacity="0.5" />
              <stop offset="1" stopColor="#2c3b6e" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* the protosun */}
          <circle cx={L - 18} cy={midY} r={26} fill="#fde68a" />
          <circle cx={L - 18} cy={midY} r={44} fill="#fde68a" opacity={0.16} />
          <text x={L - 18} y={midY + 62} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="#fde68a">protosun</text>

          {/* flaring disk */}
          <path d={diskPath} fill="url(#disk-heat)" stroke="rgb(var(--c-text-rgb) / 0.14)" strokeWidth={1} />

          {/* condensation fronts, labels alternating two slot rows */}
          {FRONTS.map((f, i) => {
            const x = xp(f.r);
            const up = i % 2 === 0;
            const ly = up ? 56 : 96;
            return (
              <g key={f.label}>
                <line x1={x} y1={ly + 10} x2={x} y2={midY + 118} stroke={f.color} strokeWidth={1.4} strokeDasharray="5 5" opacity={0.85} />
                <text x={x} y={ly} textAnchor="middle" fontSize="13.5" fontWeight={650} fontFamily="Inter, sans-serif" fill={f.color}>
                  {f.label}
                </text>
                <text x={x} y={ly + 17} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.62)">
                  {f.sub} · {f.r} au
                </text>
              </g>
            );
          })}

          {/* probe */}
          <g>
            <line x1={xp(r)} y1={120} x2={xp(r)} y2={midY + 132} stroke="#ffffff" strokeWidth={2} />
            <circle cx={xp(r)} cy={midY} r={7} fill="#ffffff" stroke="#0b0d14" strokeWidth={1.6} />
            <text x={xp(r)} y={midY + 152} textAnchor="middle" fontSize="14.5" fontWeight={700} fontFamily="JetBrains Mono, monospace" fill="#ffffff">
              {rLabel} au
            </text>
          </g>

          {/* axis */}
          <line x1={L} y1={midY + 118} x2={W - Rm} y2={midY + 118} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          {xticks.map((t) => (
            <g key={t}>
              <line x1={xp(t)} y1={midY + 113} x2={xp(t)} y2={midY + 123} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
              <text x={xp(t)} y={midY + 140} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">{t}</text>
            </g>
          ))}
          <text x={W - Rm} y={midY + 168} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">
            distance from the protosun (au, log scale) →
          </text>

        </svg>
      </div>

      {/* probe slider — the figure's keyboard target */}
      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          0.05 au
        </span>
        <input
          type="range" min={0} max={1000} step={10} value={Math.round(frac * 1000)}
          onChange={(e) => setFrac(Number(e.currentTarget.value) / 1000)}
          aria-label="Probe distance from the protosun"
          style={{ width: "100%" }}
        />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          50 au
        </span>
      </div>

      {/* zone detail — constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${zone.color}66`,
        boxShadow: `inset 0 0 0 1px ${zone.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: zone.color, fontSize: sz(0.72) ?? "12px" }}>
            {zone.name}
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
            rough temperature {tLabel} · solids here: {zone.solids}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {solidsChips.map((c) => (
            <span key={c.name} className="font-mono rounded-full" style={{
              padding: "2px 10px",
              fontSize: sz(0.58) ?? "10.5px",
              color: c.on ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.45)",
              background: c.on ? zone.color : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.14)",
            }}>{c.name}</span>
          ))}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {zone.body}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 4.3.b — One hundred and fifty million years ────────────────────
   Five-stage stepper through the assembly of the solar system, from
   the first solids (CAIs, 4,567 Myr ago = t = 0) to the settled
   architecture at t ≈ 150 Myr. ←/→ advance; 1–5 jump. Stage switches
   are instant (reduced-motion-safe). */

type BuildStage = {
  badge: string;
  title: string;
  t: number;             // representative time, Myr (for the top timeline)
  tLabel: string;
  body: ReactNode;
};

const BUILD: BuildStage[] = [
  {
    badge: "STAGE 1", title: "A disk with a thermostat", t: 0.1, tLabel: "t < 0.1 Myr",
    body: <>A collapsing cloud (<em>§3.3</em>) leaves a newborn star inside a spinning disk of gas and dust. The first solid flecks condense — their radioactive clocks read <strong>4,567 million years</strong>, the age of the solar system and this story&rsquo;s time zero. The disk&rsquo;s temperature zones (fig. 4.3.a) set the local recipe.</>,
  },
  {
    badge: "STAGE 2", title: "Two reservoirs, kept apart", t: 0.7, tLabel: "t ≈ 0.5–1 Myr",
    body: <>The disk splits into an inner reservoir of dry, carbon-poor dust and an outer one rich in carbon and water ice — chemically distinct families still readable today in meteorites (the NC and CC types). A growing Jupiter&rsquo;s gravity plausibly opened the gap that kept the two from mixing.</>,
  },
  {
    badge: "STAGE 3", title: "Giants first", t: 2, tLabel: "t ≈ 1–3 Myr",
    body: <>Beyond the snow line, ice-rich cores grow huge within a couple of million years — quickly enough to capture the disk&rsquo;s hydrogen and helium before the young Sun&rsquo;s radiation clears the gas away (by ~3–10 Myr). Jupiter and Saturn win this race; Uranus and Neptune, slower and farther, catch mostly ice.</>,
  },
  {
    badge: "STAGE 4", title: "Rocky worlds, the slow way", t: 40, tLabel: "t ≈ 10–100 Myr",
    body: <>Inside the snow line, Moon-to-Mars-sized embryos collide and merge for tens of millions of years. One last giant impact on the young Earth splashes out the debris that becomes <strong>the Moon</strong>. Stirred-up icy material from the outer reservoir rains inward — delivering the water and organics a dry-born Earth needed.</>,
  },
  {
    badge: "STAGE 5", title: "The system settles", t: 150, tLabel: "t ≈ 150 Myr",
    body: <>The gas is gone, the giant collisions taper off, and eight planets ride stable orbits: rock inside, giants outside, rubble in between (the asteroid belt, 2.1–3.3 au) and ice beyond (the Kuiper belt). The architecture of <em>§4.1</em> is the fossil of everything that happened here.</>,
  },
];

export function AssemblyPanel(): JSX.Element {
  const [stage, setStage] = useState(0);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setStage((s) => Math.max(0, Math.min(BUILD.length - 1, s + d)));
  const cur = BUILD[stage];

  const W = 904, H = 430;
  const L = 60, Rm = 30;
  const midY = 250;
  /* radial axis for the scene: log 0.2–50 au */
  const lg = Math.log10;
  const xp = (au: number) => L + ((lg(au) - lg(0.2)) / (lg(50) - lg(0.2))) * (W - L - Rm);
  /* top timeline: log 0.05–200 Myr */
  const tx = (t: number) => 120 + ((lg(t) - lg(0.05)) / (lg(200) - lg(0.05))) * (W - 150);

  const snowX = xp(2.7);

  /* deterministic pseudo-random helper for scatter dots */
  const dots = (n: number, x0: number, x1: number, seed: number, spread = 44) =>
    Array.from({ length: n }).map((_, i) => {
      const fr = ((i * 73 + seed * 131) % 199) / 199;
      const fy = ((i * 149 + seed * 61) % 97) / 97;
      return { x: x0 + fr * (x1 - x0), y: midY - spread / 2 + fy * spread };
    });

  const scene = (s: number): JSX.Element => {
    if (s === 0) return (
      <g>
        {/* smooth gradient disk */}
        <rect x={L} y={midY - 34} width={W - L - Rm} height={68} rx={30} fill="url(#asm-heat)" opacity={0.85} />
        {dots(70, L + 10, W - Rm - 10, 1, 52).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.4} fill="#e7e0d0" opacity={0.7} />
        ))}
        <text x={(L + W - Rm) / 2} y={midY - 60} textAnchor="middle" fontSize="14" fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.8)">
          gas + microscopic dust — the raw material of everything
        </text>
        <text x={xp(1)} y={midY + 66} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
          first solids condense · the clock starts
        </text>
      </g>
    );
    if (s === 1) return (
      <g>
        <rect x={L} y={midY - 30} width={xp(2) - L} height={60} rx={22} fill="#b45309" opacity={0.55} />
        <rect x={xp(4)} y={midY - 34} width={W - Rm - xp(4)} height={68} rx={24} fill="#3b5a8a" opacity={0.6} />
        <text x={(L + xp(2)) / 2} y={midY - 46} textAnchor="middle" fontSize="13.5" fontFamily="Inter, sans-serif" fill="#fbbf24">
          inner reservoir — dry rock (NC)
        </text>
        <text x={(xp(4) + W - Rm) / 2} y={midY - 52} textAnchor="middle" fontSize="13.5" fontFamily="Inter, sans-serif" fill="#7dd3fc">
          outer reservoir — carbon + ice (CC)
        </text>
        {/* the gap and proto-Jupiter */}
        <circle cx={xp(3)} cy={midY} r={9} fill="#d3a26a" />
        <text x={xp(3)} y={midY + 34} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#d3a26a">Jupiter&rsquo;s core opens a gap</text>
      </g>
    );
    if (s === 2) return (
      <g>
        <rect x={L} y={midY - 26} width={W - L - Rm} height={52} rx={22} fill="url(#asm-heat)" opacity={0.4} />
        {/* giants beyond the snow line */}
        {[{ au: 5.2, r: 15, c: "#d3a26a", n: "Jupiter" }, { au: 9.6, r: 12, c: "#e8c987", n: "Saturn" },
          { au: 19, r: 8, c: "#7dd3fc", n: "Uranus" }, { au: 30, r: 8, c: "#3b82f6", n: "Neptune" }].map((g) => (
          <g key={g.n}>
            <circle cx={xp(g.au)} cy={midY} r={g.r} fill={g.c} />
            <text x={xp(g.au)} y={midY - g.r - 10} textAnchor="middle" fontSize="12.5" fontFamily="Inter, sans-serif" fill={g.c}>{g.n}</text>
            {/* gas capture arrows */}
            <path d={`M ${xp(g.au) - g.r - 26} ${midY - 24} q 14 14 20 18`} fill="none" stroke="rgb(var(--c-text-rgb) / 0.55)" strokeWidth={1.6} markerEnd="url(#asm-arr)" />
            <path d={`M ${xp(g.au) + g.r + 26} ${midY + 24} q -14 -14 -20 -18`} fill="none" stroke="rgb(var(--c-text-rgb) / 0.55)" strokeWidth={1.6} markerEnd="url(#asm-arr)" />
          </g>
        ))}
        {/* small inner embryos */}
        {dots(16, L + 16, xp(1.8), 3, 26).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={2.4} fill="#e5a76a" opacity={0.85} />
        ))}
        <text x={xp(0.6)} y={midY - 44} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">
          embryos, still small
        </text>
      </g>
    );
    if (s === 3) return (
      <g>
        {/* colliding embryos inside; a flash */}
        {dots(9, L + 20, xp(1.7), 5, 30).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={4.2} fill="#e5a76a" />
        ))}
        {(() => { const x = xp(1); return (
          <g>
            <circle cx={x} cy={midY} r={11} fill="#60a5fa" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1={x + 15 * Math.cos((a * Math.PI) / 180)} y1={midY + 15 * Math.sin((a * Math.PI) / 180)}
                x2={x + 26 * Math.cos((a * Math.PI) / 180)} y2={midY + 26 * Math.sin((a * Math.PI) / 180)}
                stroke="#fde68a" strokeWidth={2.4} />
            ))}
            <text x={x} y={midY - 36} textAnchor="middle" fontSize="12.5" fontFamily="Inter, sans-serif" fill="#fde68a">
              giant impact → the Moon
            </text>
          </g>
        ); })()}
        {/* giants settled; water delivery arrows inward */}
        {[{ au: 5.2, r: 13, c: "#d3a26a" }, { au: 9.6, r: 10, c: "#e8c987" }].map((g, i) => (
          <circle key={i} cx={xp(g.au)} cy={midY} r={g.r} fill={g.c} />
        ))}
        <path d={`M ${xp(7)} ${midY - 52} C ${xp(4)} ${midY - 84}, ${xp(2)} ${midY - 70}, ${xp(1.15)} ${midY - 20}`}
          fill="none" stroke="#7dd3fc" strokeWidth={2} strokeDasharray="6 5" markerEnd="url(#asm-arr-b)" />
        <text x={xp(3.4)} y={midY - 86} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="#7dd3fc">
          water + organics delivered inward
        </text>
      </g>
    );
    return (
      <g>
        {/* the finished architecture */}
        {[{ au: 0.39, r: 3, c: "#9ca3af", n: "Mercury" }, { au: 0.72, r: 4.4, c: "#fbbf24", n: "Venus" },
          { au: 1, r: 4.6, c: "#60a5fa", n: "Earth" }, { au: 1.52, r: 3.6, c: "#ef4444", n: "Mars" },
          { au: 5.2, r: 14, c: "#d3a26a", n: "Jupiter" }, { au: 9.6, r: 11.5, c: "#e8c987", n: "Saturn" },
          { au: 19.2, r: 7.5, c: "#7dd3fc", n: "Uranus" }, { au: 30.1, r: 7.2, c: "#3b82f6", n: "Neptune" }].map((p, i) => (
          <g key={p.n}>
            <circle cx={xp(p.au)} cy={midY} r={p.r} fill={p.c} />
            <text x={xp(p.au)} y={i % 2 === 0 ? midY - p.r - 10 : midY + p.r + 20} textAnchor="middle" fontSize="12" fontFamily="Inter, sans-serif" fill={p.c}>{p.n}</text>
          </g>
        ))}
        {/* belts */}
        {dots(22, xp(2.1), xp(3.3), 7, 18).map((d, i) => (
          <circle key={`a${i}`} cx={d.x} cy={d.y} r={1.4} fill="#a8a29e" opacity={0.8} />
        ))}
        <text x={xp(2.6)} y={midY + 44} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">asteroid belt</text>
        {dots(26, xp(31), xp(49), 9, 22).map((d, i) => (
          <circle key={`k${i}`} cx={d.x} cy={d.y} r={1.4} fill="#cfe0f5" opacity={0.75} />
        ))}
        <text x={xp(39)} y={midY + 46} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">Kuiper belt</text>
      </g>
    );
  };

  return (
    <FigurePanel
      idx="4.3.b"
      kicker="One hundred and fifty million years"
      caption={
        <>
          The assembly of the solar system in five stages, from the first condensed solids (4,567 million years ago,
          t = 0) to the settled architecture at t ≈ 150 million years — step through with the arrow keys or the 1–5
          pills. The timeline across the top is logarithmic; the snow line splits every scene into the dry inner disk
          and the icy outer disk where the giants grew first.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 6% 55%, #221305 0%, #0d0b13 48%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Solar system assembly, ${cur.title}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id="asm-heat" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fb923c" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#7f5a3c" stopOpacity="0.55" />
              <stop offset="1" stopColor="#3b5a8a" stopOpacity="0.5" />
            </linearGradient>
            <marker id="asm-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(var(--c-text-rgb) / 0.6)" />
            </marker>
            <marker id="asm-arr-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7dd3fc" />
            </marker>
          </defs>

          {/* top timeline */}
          <line x1={120} y1={40} x2={W - 30} y2={40} stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth={1.2} />
          <text x={30} y={44} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">time →</text>
          {BUILD.map((b, i) => (
            <g key={b.badge} style={{ cursor: "pointer" }} onClick={() => setStage(i)}>
              <circle cx={tx(b.t)} cy={40} r={i === stage ? 8 : 5}
                fill={i === stage ? "var(--c-solar)" : "rgb(var(--c-text-rgb) / 0.35)"}
                stroke="#0b0d14" strokeWidth={1.4} />
              <text x={tx(b.t)} y={i % 2 === 0 ? 22 : 66} textAnchor="middle" fontSize="11.5"
                fontFamily="JetBrains Mono, monospace"
                fill={i === stage ? "var(--c-solar)" : "rgb(var(--c-text-rgb) / 0.55)"}>
                {b.tLabel}
              </text>
              <circle cx={tx(b.t)} cy={40} r={16} fill="transparent" />
            </g>
          ))}

          {/* protosun + snow line, shared by all scenes */}
          <circle cx={L - 16} cy={midY} r={20} fill="#fde68a" />
          <line x1={snowX} y1={midY - 108} x2={snowX} y2={midY + 84} stroke="#7dd3fc" strokeWidth={1.3} strokeDasharray="5 6" opacity={0.7} />
          <text x={snowX} y={midY - 118} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#7dd3fc">
            snow line · 2.7 au
          </text>

          {scene(stage)}

          {/* radial axis */}
          <line x1={L} y1={midY + 96} x2={W - Rm} y2={midY + 96} stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth={1} />
          {[0.5, 1, 2, 5, 10, 20, 50].map((t) => (
            <g key={t}>
              <line x1={xp(t)} y1={midY + 92} x2={xp(t)} y2={midY + 100} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
              <text x={xp(t)} y={midY + 116} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">{t}</text>
            </g>
          ))}
          <text x={W - Rm} y={midY + 140} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            distance (au, log scale) →
          </text>
        </svg>
      </div>

      {/* stage narration — sibling of .fig-viz, constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          {cur.badge} · {cur.tLabel} · {cur.title}
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "6.4em" }}>
          {cur.body}
        </div>
      </div>

      {/* visible stage pills */}
      <div className="mt-3 flex gap-1.5 items-center" style={{ flexShrink: 0 }}>
        {BUILD.map((_, n) => (
          <button key={n} type="button" onClick={() => setStage(n)} aria-pressed={stage === n}
            className={`rounded-full font-mono${stage === n ? " is-active" : ""}`} data-shortcut={String(n + 1)} style={{
              width: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              height: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              fontSize: sz(0.56) ?? "10px",
              color: stage === n ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.6)",
              background: stage === n ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
            }}>{n + 1}</button>
        ))}
        <span className="font-mono ml-2" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>← / → step through 150 million years</span>
      </div>

      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
    </FigurePanel>
  );
}
