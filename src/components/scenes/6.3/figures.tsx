import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";

function FigurePanel({
  idx, kicker, caption, children, fitFs = false, sidebar = false, rail,
}: {
  idx: string; kicker: string; caption: ReactNode; children: ReactNode;
  fitFs?: boolean; sidebar?: boolean; rail?: ReactNode;
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

/* ── 6.3.a — The Big Five ───────────────────────────────────────────
   Extinction severity against time, with the five great die-offs as
   bars. Selecting one tells you when, how much died, what did it, and —
   the point of the figure — how fast the climate moved. ←/→ or 1–5.

   Percentages are species-level estimates from the standard literature;
   the End-Permian figure is quoted as a range because it is genuinely
   contested. */

type Extinction = {
  id: string;
  name: string;
  ma: number;
  /** percent of species lost (label) and the bar height fraction */
  loss: string;
  frac: number;
  color: string;
  cause: string;
  speed: "fast" | "very fast" | "instant";
  body: ReactNode;
};

const BIG5: Extinction[] = [
  { id: "ord", name: "Late Ordovician", ma: 444, loss: "~85% of species", frac: 0.85, color: "#8ab4f8",
    cause: "a sudden ice age; sea levels crashed",
    speed: "fast",
    body: <>The planet plunged into a deep freeze. Ice locked up the water, sea levels fell, and the shallow coastal seas — where almost all life lived — simply drained away. Life at this point was still entirely in the water.</> },
  { id: "dev", name: "Late Devonian", ma: 372, loss: "~70–75% of species", frac: 0.75, color: "#38bdf8",
    cause: "oxygen-starved oceans and long cooling",
    speed: "fast",
    body: <>Not one blow but two, millions of years apart — a drawn-out crisis rather than a single catastrophe. The oceans lost their oxygen and the great reefs collapsed. Reef ecosystems would not recover their former glory for a hundred million years.</> },
  { id: "perm", name: "End-Permian", ma: 252, loss: "~90% of species", frac: 0.92, color: "#f87171",
    cause: "vast volcanic eruptions in Siberia → runaway warming",
    speed: "very fast",
    body: <>"The Great Dying" — the closest life has come to being switched off. Volcanic eruptions in Siberia burned through coal beds and pumped carbon into the air, cooking the planet and suffocating the seas. Estimates of the toll range from 81% to 96% of species; either way, it took ten million years for life to recover.</> },
  { id: "tri", name: "End-Triassic", ma: 201, loss: "~80% of species", frac: 0.8, color: "#fb923c",
    cause: "volcanism as Pangea tore apart",
    speed: "very fast",
    body: <>As the supercontinent Pangea began to split (<em>§4.2</em>), the rift erupted on a colossal scale. The carbon released warmed the world, and the survivors inherited an emptied planet — among them a modest group of reptiles called the dinosaurs.</> },
  { id: "cret", name: "End-Cretaceous", ma: 66, loss: "~76% of species", frac: 0.76, color: "#fbbf24",
    cause: "a 10-kilometre asteroid struck what is now Mexico",
    speed: "instant",
    body: <>The famous one — and the only one of the five caused from space. An asteroid about ten kilometres across hit the Yucatán. Rock vaporised, the sky filled with debris, and the darkness shut down photosynthesis worldwide — the base of every food chain. (Volcanoes were erupting in India at the time, but the modern verdict is that the impact alone was enough.) The non-avian dinosaurs never recovered; birds and mammals did.</> },
];

const SPEED_LABEL: Record<string, string> = {
  fast: "fast — thousands of years",
  "very fast": "very fast — centuries to millennia",
  instant: "instant — an afternoon, then a decade of darkness",
};

export function BigFivePanel(): JSX.Element {
  /* Start on the End-Permian, the worst of the five — and mid-list, so both
     arrows do something from the first keypress. */
  const [idx, setIdx] = useState(2);
  const sel = BIG5[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(BIG5.length - 1, i + d)));

  const W = 904, H = 458;
  const L = 74, Rm = 40, T = 70, B = 96;
  const xOf = (ma: number) => L + ((540 - ma) / (540 - 0)) * (W - L - Rm);
  const yOf = (f: number) => H - B - f * (H - T - B);

  return (
    <FigurePanel
      idx="6.3.a"
      kicker="The Big Five"
      caption={
        <>
          The five times life nearly ended, plotted across the last 540 million years — the whole span in which animals
          have existed. Click a bar or use the arrow keys. The heights are the fraction of <em>species</em> lost. Two
          patterns matter: four of the five were driven by <strong>volcanism and climate</strong>, not asteroids; and
          what killed was less the size of the climate change than its <strong>speed</strong> — a world that changes
          faster than life can adapt is a world that empties.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 40%, #1a1016 0%, #0b0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`The five mass extinctions; ${sel.name} selected`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={34} fontSize="13.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            FIVE TIMES THE WORLD NEARLY ENDED
          </text>

          {/* axes */}
          <line x1={L} y1={H - B} x2={W - Rm} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line x1={L} y1={yOf(f)} x2={W - Rm} y2={yOf(f)} stroke="rgb(var(--c-text-rgb) / 0.07)" strokeWidth={1} />
              <text x={L - 8} y={yOf(f) + 4} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.55)">{Math.round(f * 100)}%</text>
            </g>
          ))}
          {[500, 400, 300, 200, 100, 0].map((t) => (
            <text key={t} x={xOf(t)} y={H - B + 22} textAnchor="middle" fontSize="11.5"
              fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
              {t === 0 ? "today" : `${t} Ma`}
            </text>
          ))}
          <text x={22} y={(T + H - B) / 2} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)" transform={`rotate(-90 22 ${(T + H - B) / 2})`}>
            species lost →
          </text>
          <text x={(L + W - Rm) / 2} y={H - 16} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)">
            millions of years ago →
          </text>

          {/* the five bars */}
          {BIG5.map((e, i) => {
            const on = i === idx;
            const x = xOf(e.ma);
            return (
              <g key={e.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={x - 26} y={T - 20} width={52} height={H - B - T + 20} fill="transparent" />
                <rect x={x - 17} y={yOf(e.frac)} width={34} height={(H - B) - yOf(e.frac)} rx={3}
                  fill={e.color} opacity={on ? 0.95 : 0.42}
                  stroke={on ? "#ffffff" : "transparent"} strokeWidth={2}
                  style={{ transition: "opacity 200ms var(--ease)" }} />
                <text x={x} y={yOf(e.frac) - 10} textAnchor="middle" fontSize="12" fontWeight={on ? 700 : 500}
                  fontFamily="JetBrains Mono, monospace" fill={on ? e.color : "rgb(var(--c-text-rgb) / 0.6)"}>
                  {e.loss.replace("~", "").replace(" of species", "")}
                </text>
                {/* stagger adjacent labels so the closely-spaced End-Permian and
                    End-Triassic never touch */}
                <text x={x} y={H - B + (i % 2 ? 60 : 42)} textAnchor="middle" fontSize="12" fontWeight={on ? 700 : 500}
                  fontFamily="Inter, sans-serif" fill={on ? e.color : "rgb(var(--c-text-rgb) / 0.7)"}>
                  {e.name.split(" ")[0]}
                </text>
                <text x={x} y={H - B + (i % 2 ? 76 : 58)} textAnchor="middle" fontSize="10.5"
                  fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
                  {e.name.split(" ")[1] ?? ""}
                </text>
              </g>
            );
          })}

          {/* the "us" marker at the right edge — sober, unlabelled as a sixth */}
          <line x1={xOf(0)} y1={T} x2={xOf(0)} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={1.4} strokeDasharray="4 5" />
          <text x={xOf(0) - 8} y={T + 4} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.6)">you are here</text>
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-4">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
            {sel.name} · {sel.ma} million years ago
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.7)", fontSize: sz(0.6) ?? "10.5px" }}>
            {sel.loss} · {sel.cause}
          </span>
        </div>
        <div className="font-mono mt-1" style={{ color: "var(--c-solar)", fontSize: sz(0.62) ?? "11px" }}>
          how fast the climate moved: {SPEED_LABEL[sel.speed]}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {BIG5.map((e, i) => (
          <button key={e.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {e.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 6.3.b — The rocks that cross our path ─────────────────────────
   The four families of near-Earth asteroid, drawn as real orbits around
   the Sun against Earth's. Selecting a class draws its orbit and says
   what makes it dangerous — or not. ←/→ or 1–4.

   Orbits are ellipses with the class's characteristic semi-major axis
   and perihelion, drawn to scale in au. */

type NeoClass = {
  id: string;
  name: string;
  color: string;
  /** semi-major axis and eccentricity of a representative member */
  a: number; e: number;
  crosses: boolean;
  count: string;
  body: ReactNode;
};

const NEOS: NeoClass[] = [
  { id: "amor", name: "Amor", color: "#4ade80", a: 1.7, e: 0.35, crosses: false,
    count: "roughly a third of near-Earth asteroids",
    body: <>Amors approach Earth's orbit from outside but never cross it — they come close and swing away. They are the neighbours who drive past, not the ones who cut across your lane. (Mars, on the other hand, should be nervous.)</> },
  { id: "apollo", name: "Apollo", color: "#f87171", a: 1.5, e: 0.45, crosses: true,
    count: "the largest group — and the most dangerous",
    body: <>Apollos cross Earth's orbit from outside. Most of the objects that have hit us, and most of the ones we watch nervously, are Apollos. Their orbit and ours intersect; the only question is whether both of us are at the crossing at the same moment.</> },
  { id: "aten", name: "Aten", color: "#fb923c", a: 0.85, e: 0.3, crosses: true,
    count: "a smaller but genuinely hazardous group",
    body: <>Atens also cross our orbit, but they spend most of their time <em>inside</em> it, closer to the Sun. That makes them harder to see — they lurk in the daylight sky, and a telescope on the ground cannot look at the Sun.</> },
  { id: "atira", name: "Atira", color: "#a78bfa", a: 0.7, e: 0.25, crosses: false,
    count: "the rarest class — only a few dozen known",
    body: <>Atiras orbit entirely inside Earth's orbit. They cannot hit us, but they are almost impossible to find for exactly the reason above: they are always near the Sun in our sky. Their real interest is as a reminder of how blind we are in that direction.</> },
];

export function NeoPanel(): JSX.Element {
  const [idx, setIdx] = useState(1);
  const sel = NEOS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(NEOS.length - 1, i + d)));

  const W = 904, H = 470;
  const cx = 330, cy = 235;
  const AU = 88;                                  // px per au

  /* an ellipse with the Sun at one focus */
  const orbit = (a: number, e: number) => {
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e;                              // focus offset
    return { rx: a * AU, ry: b * AU, cx: cx - c * AU, cy };
  };
  const o = orbit(sel.a, sel.e);
  const earth = orbit(1, 0.017);

  return (
    <FigurePanel
      idx="6.3.b"
      kicker="The rocks that cross our path"
      caption={
        <>
          The four families of near-Earth asteroid, drawn as real orbits (to scale, in astronomical units) against
          Earth's. Step through them with the arrow keys. Only two families — <strong>Apollos</strong> and
          <strong> Atens</strong> — actually cross our path, and those are the ones planetary defence watches. The good
          news: we now find them years ahead. The better news: in 2022, NASA's DART mission proved we can nudge one.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 36% 50%, #17120a 0%, #0b0a12 55%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Near-Earth asteroid class: ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* class selector */}
          {NEOS.map((n, i) => {
            const on = i === idx;
            const y = 40 + i * 44;
            return (
              <g key={n.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={640} y={y - 22} width={240} height={36} rx={7}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.1)" : "rgb(var(--c-text-rgb) / 0.03)"}
                  stroke={on ? n.color : "rgb(var(--c-text-rgb) / 0.14)"} strokeWidth={on ? 1.8 : 1} />
                <circle cx={660} cy={y - 4} r={6} fill={n.color} />
                <text x={676} y={y + 1} fontSize="15" fontWeight={on ? 700 : 500} fontFamily="Inter, sans-serif"
                  fill={on ? n.color : "rgb(var(--c-text-rgb) / 0.8)"}>{n.name}</text>
                <text x={870} y={y + 1} textAnchor="end" fontSize="11" fontFamily="JetBrains Mono, monospace"
                  fill={n.crosses ? "#f87171" : "rgb(var(--c-text-rgb) / 0.45)"}>
                  {n.crosses ? "crosses us" : "never crosses"}
                </text>
              </g>
            );
          })}

          {/* Mars and Venus for context */}
          <ellipse cx={cx} cy={cy} rx={1.52 * AU} ry={1.52 * AU} fill="none"
            stroke="rgb(var(--c-text-rgb) / 0.14)" strokeWidth={1} strokeDasharray="3 6" />
          <text x={cx} y={cy - 1.52 * AU - 8} textAnchor="middle" fontSize="11"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.4)">Mars</text>
          <ellipse cx={cx} cy={cy} rx={0.72 * AU} ry={0.72 * AU} fill="none"
            stroke="rgb(var(--c-text-rgb) / 0.14)" strokeWidth={1} strokeDasharray="3 6" />

          {/* Earth's orbit */}
          <ellipse cx={earth.cx} cy={earth.cy} rx={earth.rx} ry={earth.ry} fill="none"
            stroke="#60a5fa" strokeWidth={2} />
          <circle cx={cx + AU} cy={cy} r={7} fill="#60a5fa" stroke="#0b0d14" strokeWidth={1.2} />
          <text x={cx + AU + 14} y={cy + 4} fontSize="13" fontFamily="Inter, sans-serif" fill="#60a5fa">Earth</text>

          {/* the selected class's orbit */}
          <ellipse cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} fill="none" stroke={sel.color} strokeWidth={2.4}
            style={{ transition: "all 260ms var(--ease)" }} />
          {/* the asteroid itself, and the crossing points if it crosses */}
          <circle cx={o.cx + o.rx * Math.cos(-0.7)} cy={o.cy + o.ry * Math.sin(-0.7)} r={5} fill={sel.color} />
          {sel.crosses && (
            <g>
              {[0.62, -0.62].map((t, i) => {
                const x = cx + AU * Math.cos(t * Math.PI);
                const y = cy + AU * Math.sin(t * Math.PI);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={9} fill="none" stroke="#f87171" strokeWidth={2} />
                    <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke="#f87171" strokeWidth={1.6} />
                    <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} stroke="#f87171" strokeWidth={1.6} />
                  </g>
                );
              })}
              <text x={cx} y={cy + 1.52 * AU + 26} textAnchor="middle" fontSize="12.5"
                fontFamily="JetBrains Mono, monospace" fill="#f87171">
                ✕ where the two orbits cross
              </text>
            </g>
          )}

          {/* the Sun */}
          <circle cx={cx} cy={cy} r={10} fill="#fde68a" />
          <circle cx={cx} cy={cy} r={20} fill="#fde68a" opacity={0.18} />

          {/* DART footnote */}
          <text x={640} y={H - 54} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            2022 · NASA&rsquo;s DART spacecraft
          </text>
          <text x={640} y={H - 34} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            struck a harmless asteroid and
          </text>
          <text x={640} y={H - 14} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            measurably changed its orbit.
          </text>
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-4">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
            {sel.name} asteroids
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.7)", fontSize: sz(0.6) ?? "10.5px" }}>
            {sel.count} · {sel.crosses ? "crosses Earth's orbit" : "never crosses Earth's orbit"}
          </span>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {NEOS.map((n, i) => (
          <button key={n.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {n.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
