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

/* ── 4.1.a — The solar system, four frames out ──────────────────────
   A zoom-out stepper. Each stage is a top-down half-view: the Sun sits
   at the bottom centre and orbits are semicircular arcs above it, drawn
   to a per-stage linear scale (the frame's half-width in au is printed
   on the scale bar). Stage 1 → 4: rocky inner system → giant planets +
   Kuiper belt → heliosphere → Oort cloud. ←/→ step; 1–4 jump.
   reduced-motion: stages switch instantly (no tweening anywhere). */

type OrbitBody = { name: string; au: number; color: string; ang: number; dwarf?: boolean };
type Stage = {
  badge: string;
  title: string;
  /** frame radius in astronomical units */
  span: number;
  scaleLabel: string;
  planets: OrbitBody[];
  belts: { rIn: number; rOut: number; label: string; labAng: number }[];
  body: ReactNode;
};

const STAGES: Stage[] = [
  {
    badge: "FRAME 1",
    title: "The rocky inner system",
    span: 5.9,
    scaleLabel: "1 au",
    planets: [
      { name: "Mercury", au: 0.39, color: "#9ca3af", ang: 148 },
      { name: "Venus", au: 0.72, color: "#fbbf24", ang: 55 },
      { name: "Earth", au: 1.0, color: "#60a5fa", ang: 108 },
      { name: "Mars", au: 1.52, color: "#ef4444", ang: 38 },
      { name: "Jupiter", au: 5.2, color: "#d3a26a", ang: 76 },
    ],
    belts: [{ rIn: 2.1, rOut: 3.3, label: "asteroid belt", labAng: 135 }],
    body: (
      <>
        Four rocky planets huddle within 1.6 au of the Sun. The <strong>asteroid belt</strong> — rubble that never
        gathered into a planet — spans about 2.1–3.3 au, and two clumps of <strong>Trojan asteroids</strong> ride along
        Jupiter&rsquo;s own orbit, 60° ahead of and behind the planet.
      </>
    ),
  },
  {
    badge: "FRAME 2",
    title: "The realm of the giants",
    span: 56,
    scaleLabel: "10 au",
    planets: [
      { name: "Jupiter", au: 5.2, color: "#d3a26a", ang: 118 },
      { name: "Saturn", au: 9.6, color: "#e8c987", ang: 62 },
      { name: "Uranus", au: 19.2, color: "#7dd3fc", ang: 132 },
      { name: "Neptune", au: 30.1, color: "#3b82f6", ang: 48 },
      { name: "Pluto", au: 39.5, color: "#c4b5fd", ang: 95, dwarf: true },
    ],
    belts: [{ rIn: 30, rOut: 50, label: "Kuiper belt", labAng: 155 }],
    body: (
      <>
        Ten times wider: the gas giants <strong>Jupiter</strong> and <strong>Saturn</strong> and the ice giants{" "}
        <strong>Uranus</strong> and <strong>Neptune</strong> orbit far apart. Beyond Neptune lies the{" "}
        <strong>Kuiper belt</strong> (30–50 au), a flat ring of icy bodies — Pluto among them. The rocky worlds of
        frame 1 are now the small disk at the centre.
      </>
    ),
  },
  {
    badge: "FRAME 3",
    title: "The heliosphere",
    span: 190,
    scaleLabel: "50 au",
    planets: [{ name: "Neptune", au: 30.1, color: "#3b82f6", ang: 118 }],
    belts: [{ rIn: 30, rOut: 50, label: "Kuiper belt", labAng: 145 }],
    body: (
      <>
        The solar wind inflates a bubble around everything. It slows abruptly at the <strong>termination shock</strong>{" "}
        (~94 au) and gives way to interstellar gas at the <strong>heliopause</strong> (~122 au) — the boundary{" "}
        <strong>Voyager&nbsp;1</strong> crossed in August 2012, becoming our first interstellar spacecraft.
      </>
    ),
  },
  {
    badge: "FRAME 4",
    title: "The Oort cloud",
    span: 112000,
    scaleLabel: "20,000 au",
    planets: [],
    belts: [],
    body: (
      <>
        Six hundred times wider still: a spherical shell of billions of icy comet nuclei, reaching from roughly{" "}
        <strong>2,000–5,000 au</strong> out to <strong>~100,000 au</strong> — about 1.6 light-years, the edge of the
        Sun&rsquo;s gravitational reach. Unlike everything inside it, the Oort cloud is <em>not</em> a disk but a
        sphere.
      </>
    ),
  },
];

export function ArchitecturePanel(): JSX.Element {
  const [stage, setStage] = useState(0);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setStage((s) => Math.max(0, Math.min(STAGES.length - 1, s + d)));
  const cur = STAGES[stage];

  const W = 904, H = 540;
  const cx = W / 2, cy = H - 46;      // Sun position
  const RMAX = 452;                    // px radius of the widest drawable arc
  const px = (au: number) => (au / cur.span) * RMAX;
  const rad = (d: number) => (d * Math.PI) / 180;
  const pos = (au: number, ang: number) => ({
    x: cx + px(au) * Math.cos(rad(ang)),
    y: cy - px(au) * Math.sin(rad(ang)),
  });
  /* a half-annulus band between two radii (belt) */
  const bandPath = (rIn: number, rOut: number) => {
    const ro = px(rOut), ri = px(rIn);
    return `M ${cx - ro} ${cy} A ${ro} ${ro} 0 0 1 ${cx + ro} ${cy} L ${cx + ri} ${cy} A ${ri} ${ri} 0 0 0 ${cx - ri} ${cy} Z`;
  };
  const arc = (au: number) => {
    const r = px(au);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  };

  return (
    <FigurePanel
      idx="4.1.a"
      kicker="The solar system, four frames out"
      caption={
        <>
          Four views of the same system, each frame wider than the last — the Sun sits at the bottom centre and every
          arc is an orbit drawn to the frame&rsquo;s scale bar. Step outward with the arrow keys (or the 1–4 pills):
          rocky planets and asteroid belt, then the giants and the Kuiper belt, then the heliosphere blown by the solar
          wind, and finally the spherical Oort cloud, 100,000 au out.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 96%, #191307 0%, #0b0a12 55%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Top-down map of the solar system, ${cur.title}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          {/* frame badge */}
          <text x={24} y={38} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {cur.badge}
          </text>
          <text x={24} y={62} fontSize="19" fontFamily="Inter, sans-serif" fontWeight={650} fill="rgb(var(--c-text-rgb) / 0.92)">
            {cur.title}
          </text>
          <text x={W - 24} y={38} textAnchor="end" fontSize="13" letterSpacing="1.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            frame {stage + 1} of 4
          </text>

          {/* belts */}
          {cur.belts.map((b) => {
            const lp = pos((b.rIn + b.rOut) / 2, b.labAng);
            return (
              <g key={b.label}>
                <path d={bandPath(b.rIn, b.rOut)} fill="rgb(var(--c-text-rgb) / 0.08)" stroke="rgb(var(--c-text-rgb) / 0.18)" strokeDasharray="2 5" strokeWidth={1} />
                <text x={lp.x} y={lp.y + 4} textAnchor="middle" fontSize="13.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.72)">
                  {b.label}
                </text>
              </g>
            );
          })}

          {/* stage-specific chrome */}
          {stage === 0 && (() => {
            /* Trojan clumps ±60° along Jupiter's orbit from the planet at 76° */
            const t1 = pos(5.2, 76 + 60), t2 = pos(5.2, 76 - 60);
            return (
              <g>
                {[t1, t2].map((t, i) => (
                  <g key={i}>
                    {[[-8, -3], [6, -7], [0, 5], [12, 3], [-13, 6]].map(([dx, dy], j) => (
                      <circle key={j} cx={t.x + dx} cy={t.y + dy} r={2} fill="#a8a29e" opacity={0.8} />
                    ))}
                  </g>
                ))}
                <text x={t1.x} y={t1.y - 16} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">Trojans</text>
                <text x={t2.x} y={t2.y - 16} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">Trojans</text>
              </g>
            );
          })()}

          {stage === 1 && (
            <g>
              {/* the whole inner system of frame 1, now a small disk */}
              <circle cx={cx} cy={cy} r={px(1.6)} fill="rgb(var(--c-text-rgb) / 0.2)" />
              <text x={cx + 18} y={cy - 14} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">rocky worlds (frame 1)</text>
            </g>
          )}

          {stage === 2 && (() => {
            const v = pos(168, 122);
            return (
              <g>
                <path d={arc(94)} fill="none" stroke="#f0a35e" strokeWidth={1.6} strokeDasharray="7 6" opacity={0.85} />
                <text x={pos(94, 22).x} y={pos(94, 22).y - 8} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#f0a35e" textAnchor="middle">termination shock · ~94 au</text>
                <path d={arc(122)} fill="none" stroke="#8ab4f8" strokeWidth={2.4} opacity={0.95} />
                <text x={pos(122, 158).x + 8} y={pos(122, 158).y - 10} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">heliopause · ~122 au</text>
                <text x={cx} y={cy - px(178)} textAnchor="middle" fontSize="13" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">INTERSTELLAR SPACE</text>
                {/* Voyager 1 */}
                <circle cx={v.x} cy={v.y} r={4} fill="#fef3c7" stroke="#0b0d14" strokeWidth={1} />
                <text x={v.x - 10} y={v.y - 10} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="#fef3c7">Voyager 1 · ~168 au (2026)</text>
              </g>
            );
          })()}

          {stage === 3 && (() => {
            const ro = px(100000), ri = px(4000);
            const ly = px(63241);
            return (
              <g>
                <defs>
                  <radialGradient id="oort-shell" cx={cx} cy={cy} r={ro} gradientUnits="userSpaceOnUse">
                    <stop offset={ri / ro - 0.05} stopColor="#9db8d8" stopOpacity="0" />
                    <stop offset={(ri / ro + 1) / 2 - 0.15} stopColor="#9db8d8" stopOpacity="0.22" />
                    <stop offset="0.93" stopColor="#9db8d8" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#9db8d8" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path d={bandPath(4000, 100000)} fill="url(#oort-shell)" />
                {/* a sprinkle of comet nuclei */}
                {Array.from({ length: 90 }).map((_, i) => {
                  const a = (i * 137.5) % 180;                       // golden-angle spread
                  const rr = 5000 + ((i * 8117) % 95000);
                  const p = pos(rr, a);
                  return <circle key={i} cx={p.x} cy={p.y} r={1.1} fill="#cfe0f5" opacity={0.5} />;
                })}
                <path d={arc(63241)} fill="none" stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} strokeDasharray="3 7" />
                <text x={pos(63241, 90).x} y={pos(63241, 90).y - 8} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">1 light-year</text>
                <text x={cx + 14} y={cy - 12} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">planets + heliosphere (frame 3)</text>
                <text x={W - 24} y={cy - 8} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">→ Proxima Centauri · 268,000 au</text>
              </g>
            );
          })()}

          {/* orbits + planets */}
          {cur.planets.map((p) => {
            const pt = pos(p.au, p.ang);
            return (
              <g key={p.name}>
                <path d={arc(p.au)} fill="none" stroke="rgb(var(--c-text-rgb) / 0.22)" strokeWidth={1} />
                <circle cx={pt.x} cy={pt.y} r={p.dwarf ? 3.5 : 5.5} fill={p.color} stroke="#0b0d14" strokeWidth={1} />
                <text x={pt.x} y={pt.y - 11} textAnchor="middle" fontSize="13.5" fontFamily="Inter, sans-serif" fontWeight={600}
                  fill={p.color}>{p.name}{p.dwarf ? " (dwarf)" : ""}</text>
              </g>
            );
          })}

          {/* the Sun */}
          <circle cx={cx} cy={cy} r={7} fill="#fde68a" />
          <circle cx={cx} cy={cy} r={16} fill="#fde68a" opacity={0.18} />
          <text x={cx} y={cy + 26} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="#fde68a">Sun</text>

          {/* scale bar (bottom left) */}
          {(() => {
            const auOf: Record<string, number> = { "1 au": 1, "10 au": 10, "50 au": 50, "20,000 au": 20000 };
            const w = px(auOf[cur.scaleLabel]);
            return (
              <g>
                <line x1={26} y1={cy + 18} x2={26 + w} y2={cy + 18} stroke="rgb(var(--c-text-rgb) / 0.75)" strokeWidth={2} />
                <line x1={26} y1={cy + 13} x2={26} y2={cy + 23} stroke="rgb(var(--c-text-rgb) / 0.75)" strokeWidth={2} />
                <line x1={26 + w} y1={cy + 13} x2={26 + w} y2={cy + 23} stroke="rgb(var(--c-text-rgb) / 0.75)" strokeWidth={2} />
                <text x={26} y={cy + 38} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.75)">{cur.scaleLabel}</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* detail box — sibling of .fig-viz, constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          {cur.badge} · {cur.title}
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "5.6em" }}>
          {cur.body}
        </div>
      </div>

      {/* visible stage pills */}
      <div className="mt-3 flex gap-1.5 items-center" style={{ flexShrink: 0 }}>
        {STAGES.map((_, n) => (
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
        <span className="font-mono ml-2" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>← / → zoom out and back in</span>
      </div>

      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
    </FigurePanel>
  );
}

/* ── 4.1.b — Tilt and spin ──────────────────────────────────────────
   One planet at a time: a globe with its rotation axis tilted by its
   true obliquity against the shared orbital plane, its spin direction,
   and a right-hand selector list (reserved slots, 1.1.a standard).
   ←/→ and ↑/↓ walk the list; 1–9 jump. No continuous animation, so it
   is reduced-motion-safe by construction. */

type TiltWorld = {
  id: string;
  name: string;
  color: string;
  tilt: number;          // obliquity in degrees
  day: string;           // rotation period, human units
  retro: boolean;
  dwarf?: boolean;
  note: ReactNode;       // ≤ ~160 chars, constant line count
};

const TILT_WORLDS: TiltWorld[] = [
  { id: "mercury", name: "Mercury", color: "#9ca3af", tilt: 0.03, day: "59 Earth days", retro: false,
    note: <>Almost perfectly upright — essentially no seasons. It spins so slowly that a full sunrise-to-sunrise cycle lasts 176 Earth days: two of its 88-day years.</> },
  { id: "venus", name: "Venus", color: "#fbbf24", tilt: 177.4, day: "243 Earth days", retro: true,
    note: <>Flipped almost fully upside down, so its spin runs backwards — on Venus the Sun rises in the west. It turns so slowly that one spin outlasts its year.</> },
  { id: "earth", name: "Earth", color: "#60a5fa", tilt: 23.4, day: "23.9 hours", retro: false,
    note: <>The familiar tilt behind the seasons: each hemisphere leans toward the Sun for half the orbit and away for the other half, changing how directly sunlight lands.</> },
  { id: "mars", name: "Mars", color: "#ef4444", tilt: 25.2, day: "24.6 hours", retro: false,
    note: <>A tilt and day length almost identical to Earth&rsquo;s give Mars familiar seasons — each nearly twice as long, since its year is 1.9 of ours.</> },
  { id: "jupiter", name: "Jupiter", color: "#d3a26a", tilt: 3.1, day: "9.9 hours", retro: false,
    note: <>Nearly upright — hardly any seasons — and the fastest spinner of all the planets: a day under ten hours, fast enough to visibly bulge its equator outward.</> },
  { id: "saturn", name: "Saturn", color: "#e8c987", tilt: 26.7, day: "10.7 hours", retro: false,
    note: <>Tilted a little more than Earth, so its rings show us changing faces across its 29-year orbit — sometimes wide open, sometimes edge-on and nearly invisible.</> },
  { id: "uranus", name: "Uranus", color: "#7dd3fc", tilt: 97.8, day: "17.2 hours", retro: true,
    note: <>Knocked right onto its side, Uranus rolls around its orbit: each pole gets about 42 years of unbroken sunlight while the other waits in frozen darkness.</> },
  { id: "neptune", name: "Neptune", color: "#3b82f6", tilt: 28.3, day: "16.1 hours", retro: false,
    note: <>An Earth-like tilt gives Neptune proper seasons — but each one lasts about 41 years, because the planet needs 165 years to circle the Sun once.</> },
  { id: "pluto", name: "Pluto", color: "#c4b5fd", tilt: 122.5, day: "6.4 Earth days", retro: true, dwarf: true,
    note: <>The dwarf planet spins backwards on a heavily flipped axis — like Venus and Uranus, a fossil of the violent collisions that shaped the young solar system.</> },
];

export function TiltSpinPanel(): JSX.Element {
  const [idx, setIdx] = useState(2);           // start on Earth
  const sel = TILT_WORLDS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(TILT_WORLDS.length - 1, i + d)));

  /* ── reserved-slot layout (viewBox units) ──────────────────────────
     Globe on the left; selector list owns the right column, nine slots. */
  const W = 904, H = 560;
  const gx = 270, gy = 268, R = 168;           // globe centre + radius
  const LIST_X = 596;
  const SLOT0 = 64, SLOTH = 52;
  const slotY = (i: number) => SLOT0 + i * SLOTH;

  const axisLen = R + 62;

  return (
    <FigurePanel
      idx="4.1.b"
      kicker="Tilt and spin"
      caption={
        <>
          Every planet orbits in nearly the same flat plane (the dashed line), but each spins on its own tilted axis.
          Pick a world from the list — or step through with the arrow keys — to see its true axial tilt, measured from
          upright, and its rotation. Venus (177°), Uranus (98°), and Pluto (122.5°) spin backwards or sideways: scars
          of the young system&rsquo;s collisions.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 32% 40%, #12131f 0%, #0a0a12 60%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Axial tilt of ${sel.name}: ${sel.tilt} degrees`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <radialGradient id="tilt-globe" cx="0.35" cy="0.3" r="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
              <stop offset="0.55" stopColor={sel.color} stopOpacity="0.9" />
              <stop offset="1" stopColor="#0b0d14" stopOpacity="0.9" />
            </radialGradient>
            <clipPath id="tilt-clip"><circle cx={0} cy={0} r={R} /></clipPath>
          </defs>

          {/* orbital plane + upright reference */}
          <line x1={26} y1={gy} x2={530} y2={gy} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1.2} strokeDasharray="8 7" />
          <text x={30} y={gy + 22} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">orbital plane (ecliptic)</text>
          <line x1={gx} y1={gy - axisLen} x2={gx} y2={gy + axisLen} stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth={1} strokeDasharray="2 6" />
          <text x={gx - 12} y={gy - axisLen + 4} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">upright (0°)</text>

          {/* tilt arc from upright to the axis */}
          {(() => {
            const a = (sel.tilt * Math.PI) / 180;
            const rArc = R + 34;
            const ex = gx + rArc * Math.sin(a), ey = gy - rArc * Math.cos(a);
            const large = sel.tilt > 180 ? 1 : 0;
            const mid = a / 2;
            return (
              <g>
                <path d={`M ${gx} ${gy - rArc} A ${rArc} ${rArc} 0 ${large} 1 ${ex} ${ey}`} fill="none" stroke="var(--c-solar)" strokeWidth={2} />
                <text x={gx + (rArc + 26) * Math.sin(mid)} y={gy - (rArc + 26) * Math.cos(mid) + 5}
                  textAnchor="middle" fontSize="17" fontWeight={700} fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
                  {sel.tilt}°
                </text>
              </g>
            );
          })()}

          {/* globe + axis, rotated by the obliquity */}
          <g transform={`translate(${gx} ${gy}) rotate(${sel.tilt})`}>
            {/* rotation axis */}
            <line x1={0} y1={-axisLen} x2={0} y2={axisLen} stroke="rgb(var(--c-text-rgb) / 0.9)" strokeWidth={2.4} />
            <circle cx={0} cy={0} r={R} fill="url(#tilt-globe)" stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1} />
            {/* latitude bands, clipped to the globe */}
            <g clipPath="url(#tilt-clip)">
              {[-0.62, -0.31, 0, 0.31, 0.62].map((f, i) => (
                <ellipse key={i} cx={0} cy={f * R} rx={Math.sqrt(Math.max(0.05, 1 - f * f)) * R} ry={R * 0.075}
                  fill="none" stroke="rgb(0 0 0 / 0.25)" strokeWidth={i === 2 ? 2.4 : 1.2} />
              ))}
            </g>
            {/* N pole marker */}
            <text x={0} y={-axisLen - 8} textAnchor="middle" fontSize="14" fontWeight={700} fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.9)">N</text>
            {/* spin direction: arrow along the equator's front edge */}
            {(() => {
              const dir = sel.retro ? -1 : 1;
              const y = 0, x0 = -R * 0.52, x1 = R * 0.52;
              const from = dir === 1 ? x0 : x1, to = dir === 1 ? x1 : x0;
              return (
                <g>
                  <line x1={from} y1={y + R * 0.075 + 12} x2={to} y2={y + R * 0.075 + 12} stroke="#fff" strokeWidth={2.2} opacity={0.9}
                    markerEnd="url(#tilt-arrow)" />
                </g>
              );
            })()}
          </g>
          <defs>
            <marker id="tilt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
            </marker>
          </defs>

          {/* spin readout under the globe */}
          <text x={gx} y={gy + R + 64} textAnchor="middle" fontSize="14.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.8)">
            one rotation: {sel.day}{sel.retro ? " · spins backwards" : ""}
          </text>

          {/* reserved-slot selector list, right column */}
          {TILT_WORLDS.map((w, i) => {
            const isSel = i === idx;
            const y = slotY(i);
            return (
              <g key={w.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={LIST_X - 14} y={y - 22} width={W - LIST_X - 6} height={SLOTH - 8} rx={6}
                  fill={isSel ? "rgb(var(--c-text-rgb) / 0.09)" : "transparent"}
                  stroke={isSel ? w.color : "transparent"} strokeWidth={1.4} />
                <circle cx={LIST_X + 8} cy={y - 5} r={6.5} fill={w.color} opacity={isSel ? 1 : 0.65} />
                <text x={LIST_X + 26} y={y} fontFamily="Inter, sans-serif" fontSize={19}
                  fontWeight={isSel ? 700 : 500}
                  fill={isSel ? w.color : "rgb(var(--c-text-rgb) / 0.88)"}>
                  {w.name}{w.dwarf ? " · dwarf" : ""}
                </text>
                <text x={W - 22} y={y} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={15}
                  fill={isSel ? "var(--c-solar)" : "rgb(var(--c-text-rgb) / 0.55)"}>
                  {w.tilt}°
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* detail box — constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name}{sel.dwarf ? " (dwarf planet)" : ""}
        </div>
        <div className="font-mono mt-1" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
          axial tilt {sel.tilt}° · one rotation {sel.day} · {sel.retro ? "retrograde (backwards)" : "prograde (forwards)"}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.note}
        </div>
      </div>

      {/* keyboard: ←/→ + ↑/↓ walk the list; 1–9 jump */}
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {TILT_WORLDS.map((w, i) => (
          <button key={w.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {w.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 4.1.c — Inside the eight worlds ────────────────────────────────
   Interior cutaways. The big half-disc shows the selected planet's
   layers at a common drawing size, labelled into reserved slots on the
   right; the strip along the bottom shows all eight planets at TRUE
   relative size and doubles as the selector. */

type Layer = { name: string; rFrac: number; color: string };
type World = {
  id: string;
  name: string;
  family: "Terrestrial" | "Gas giant" | "Ice giant";
  color: string;
  rKm: number;
  layers: Layer[];        // inner → outer, rFrac of planet radius
  body: ReactNode;        // ≤ ~170 chars
};

const WORLDS: World[] = [
  { id: "mercury", name: "Mercury", family: "Terrestrial", color: "#9ca3af", rKm: 2440,
    layers: [
      { name: "iron-nickel core", rFrac: 0.83, color: "#c9c3ba" },
      { name: "rocky mantle", rFrac: 0.97, color: "#8a7968" },
      { name: "crust", rFrac: 1.0, color: "#6b6257" },
    ],
    body: <>A metal world: the iron-nickel core fills about 83% of the radius — hugely out of proportion. A violent early impact likely stripped away much of its rocky outer layers.</> },
  { id: "venus", name: "Venus", family: "Terrestrial", color: "#fbbf24", rKm: 6052,
    layers: [
      { name: "iron-nickel core", rFrac: 0.51, color: "#c9c3ba" },
      { name: "rocky mantle", rFrac: 0.99, color: "#a16207" },
      { name: "crust", rFrac: 1.0, color: "#78716c" },
    ],
    body: <>Earth&rsquo;s near-twin in size and build: a metal core of about half the radius under a deep silicate-rock mantle and a thin crust, all beneath a crushing CO₂ atmosphere.</> },
  { id: "earth", name: "Earth", family: "Terrestrial", color: "#60a5fa", rKm: 6371,
    layers: [
      { name: "solid inner core", rFrac: 0.19, color: "#fde68a" },
      { name: "liquid outer core", rFrac: 0.55, color: "#e8a33d" },
      { name: "rocky mantle", rFrac: 0.99, color: "#b45309" },
      { name: "crust", rFrac: 1.0, color: "#78716c" },
    ],
    body: <>The reference world: a solid iron-nickel inner core inside a liquid outer core (which powers our magnetic field), a 2,900-km rocky mantle, and a crust thinner than an eggshell in proportion.</> },
  { id: "mars", name: "Mars", family: "Terrestrial", color: "#ef4444", rKm: 3390,
    layers: [
      { name: "iron-sulfur core", rFrac: 0.54, color: "#d6bfa8" },
      { name: "rocky mantle", rFrac: 0.98, color: "#9a3412" },
      { name: "crust", rFrac: 1.0, color: "#7c2d12" },
    ],
    body: <>Half Earth&rsquo;s size with the same basic recipe: metal core, rock mantle, crust. Small worlds cool fast — Mars&rsquo;s geological engine has largely shut down.</> },
  { id: "jupiter", name: "Jupiter", family: "Gas giant", color: "#d3a26a", rKm: 69911,
    layers: [
      { name: "rock-ice core", rFrac: 0.1, color: "#a3876b" },
      { name: "metallic hydrogen", rFrac: 0.8, color: "#7f9cc4" },
      { name: "molecular hydrogen", rFrac: 1.0, color: "#d3a26a" },
    ],
    body: <>No surface at all: a deep envelope of hydrogen gas that pressure squeezes into a liquid-metal state, wrapped around a comparatively small dense core. Eleven Earths across.</> },
  { id: "saturn", name: "Saturn", family: "Gas giant", color: "#e8c987", rKm: 58232,
    layers: [
      { name: "rock-ice core", rFrac: 0.15, color: "#a3876b" },
      { name: "metallic hydrogen", rFrac: 0.47, color: "#7f9cc4" },
      { name: "molecular hydrogen", rFrac: 1.0, color: "#e8c987" },
    ],
    body: <>Jupiter&rsquo;s lighter sibling — the same hydrogen-dominated build with a thinner metallic-hydrogen shell. Its average density is below that of water (§4.2 returns to Saturn).</> },
  { id: "uranus", name: "Uranus", family: "Ice giant", color: "#7dd3fc", rKm: 25362,
    layers: [
      { name: "rock-iron core", rFrac: 0.2, color: "#a3876b" },
      { name: "water-ammonia-methane “ice” mantle", rFrac: 0.8, color: "#67c3d8" },
      { name: "hydrogen-helium atmosphere", rFrac: 1.0, color: "#7dd3fc" },
    ],
    body: <>An ice giant: most of its bulk is a hot, dense fluid mantle of water, ammonia, and methane — “ices” to astronomers — under a hydrogen-helium atmosphere.</> },
  { id: "neptune", name: "Neptune", family: "Ice giant", color: "#3b82f6", rKm: 24622,
    layers: [
      { name: "rock-iron core", rFrac: 0.2, color: "#a3876b" },
      { name: "water-ammonia-methane “ice” mantle", rFrac: 0.85, color: "#4aa8c9" },
      { name: "hydrogen-helium atmosphere", rFrac: 1.0, color: "#3b82f6" },
    ],
    body: <>Uranus&rsquo;s near-twin: rock-iron core, a deep “ice” mantle of water, ammonia, and methane, and a hydrogen-helium envelope — four Earths across, farthest planet out.</> },
];

export function InteriorsPanel(): JSX.Element {
  const [idx, setIdx] = useState(2);          // start on Earth
  const sel = WORLDS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(WORLDS.length - 1, i + d)));

  /* ── reserved-slot layout ───────────────────────────────────────────
     Cutaway half-disc left; up to four layer-label slots on the right;
     true-scale selector strip along the bottom. */
  const W = 904, H = 648;
  const cxP = 300, cyP = 262, R = 190;
  const LEAD_X = 560, LABEL_X = 574;
  const SLOT0 = 108, SLOTH = 86;
  const slotY = (i: number) => SLOT0 + i * SLOTH;
  const STRIP_Y = 562;
  const JUP_PX = 52;
  const rPx = (km: number) => Math.max(3.2, (km / 69911) * JUP_PX);

  /* strip x-positions: spread planets with padding proportional to size */
  const stripXs: number[] = (() => {
    const xs: number[] = [];
    let x = 78;
    for (const w of WORLDS) {
      const r = rPx(w.rKm);
      x += r;
      xs.push(x);
      x += r + 46;
    }
    /* centre the row */
    const total = x - 46 + 30;
    const off = (W - total) / 2;
    return xs.map((v) => v + off);
  })();

  /* label anchor: midpoint radius of each layer along a fan of angles */
  const layersOuterFirst = [...sel.layers].reverse();

  return (
    <FigurePanel
      idx="4.1.c"
      kicker="Inside the eight worlds"
      caption={
        <>
          Cutaways of all eight planets, one at a time — click a planet in the true-to-scale strip below the cutaway,
          or step with the arrow keys. Every terrestrial world repeats the metal-core / rock-mantle / crust recipe; the
          gas giants are hydrogen nearly all the way down; the ice giants wrap a rock core in a deep water-ammonia-methane
          mantle. The cutaway is drawn at a fixed size — the strip shows true relative sizes.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 30% 38%, #131118 0%, #0a0a12 58%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Interior structure of ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>
          {/* header */}
          <text x={24} y={40} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {sel.family.toUpperCase()}
          </text>
          <text x={24} y={68} fontSize="21" fontFamily="Inter, sans-serif" fontWeight={650} fill="rgb(var(--c-text-rgb) / 0.92)">
            {sel.name} — radius {sel.rKm.toLocaleString("en-US")} km
          </text>

          {/* cutaway: left half = smooth surface, right half = layers */}
          <g>
            <path d={`M ${cxP} ${cyP - R} A ${R} ${R} 0 0 0 ${cxP} ${cyP + R} Z`} fill={sel.color} opacity={0.32} />
            {layersOuterFirst.map((l) => {
              const r = l.rFrac * R;
              return (
                <path key={l.name} d={`M ${cxP} ${cyP - r} A ${r} ${r} 0 0 1 ${cxP} ${cyP + r} Z`}
                  fill={l.color} stroke="rgb(0 0 0 / 0.3)" strokeWidth={1} />
              );
            })}
            <line x1={cxP} y1={cyP - R} x2={cxP} y2={cyP + R} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
          </g>

          {/* leaders + reserved-slot layer labels (inner layer first, top slot) */}
          {sel.layers.map((l, i) => {
            const rMid = ((i === 0 ? 0 : sel.layers[i - 1].rFrac) + l.rFrac) / 2 * R;
            /* fan the anchors: inner layers anchor higher, outer lower */
            const ang = -52 + i * 34;                     // degrees from +x axis
            const ax = cxP + rMid * Math.cos((ang * Math.PI) / 180);
            const ay = cyP + rMid * Math.sin((ang * Math.PI) / 180);
            const ly = slotY(i);
            return (
              <g key={l.name}>
                <line x1={ax} y1={ay} x2={LEAD_X} y2={ly - 6} stroke="rgb(var(--c-text-rgb) / 0.38)" strokeWidth={1} />
                <circle cx={ax} cy={ay} r={4.5} fill={l.color} stroke="#0b0d14" strokeWidth={1} />
                <text x={LABEL_X} y={ly} fontFamily="Inter, sans-serif" fontSize={19} fontWeight={600} fill="rgb(var(--c-text-rgb) / 0.92)">
                  {l.name}
                </text>
                <text x={LABEL_X} y={ly + 22} fontFamily="JetBrains Mono, monospace" fontSize={14} fill="rgb(var(--c-text-rgb) / 0.58)">
                  out to {Math.round(l.rFrac * 100)}% of the radius
                </text>
              </g>
            );
          })}

          {/* true-scale selector strip */}
          <text x={W / 2} y={STRIP_Y - rPx(69911) - 18} textAnchor="middle" fontSize="12.5" letterSpacing="2"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            TRUE RELATIVE SIZES — CLICK A PLANET
          </text>
          {WORLDS.map((w, i) => {
            const isSel = i === idx;
            const x = stripXs[i], r = rPx(w.rKm);
            return (
              <g key={w.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <circle cx={x} cy={STRIP_Y} r={Math.max(r + 9, 15)} fill="transparent"
                  stroke={isSel ? w.color : "transparent"} strokeWidth={1.6} strokeDasharray="3 4" />
                <circle cx={x} cy={STRIP_Y} r={r} fill={w.color} opacity={isSel ? 1 : 0.55} />
                <text x={x} y={STRIP_Y + Math.max(r + 9, 15) + 17} textAnchor="middle"
                  fontFamily="Inter, sans-serif" fontSize={13.5} fontWeight={isSel ? 700 : 450}
                  fill={isSel ? w.color : "rgb(var(--c-text-rgb) / 0.66)"}>
                  {w.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* detail box — constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name} · {sel.family}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      {/* keyboard: ←/→ walk the strip; 1–8 jump */}
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {WORLDS.map((w, i) => (
          <button key={w.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {w.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
