import { useRef, useState, useEffect, type CSSProperties, type JSX, type ReactNode } from "react";
import katex from "katex";

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

function M({ t }: { t: string }): JSX.Element {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(t, { throwOnError: false }) }} />;
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

/* ── 6.4.a — The Drake equation, live ──────────────────────────────
   Seven sliders, one answer. Each factor is a log-scale slider (so it
   can span the enormous range the honest uncertainty demands), and the
   running product N is displayed as you go. The figure's real lesson is
   visual: the first three factors are now MEASURED and barely move the
   answer; the last four are guesses, and they swing it by twenty orders
   of magnitude.

   ←/→ nudge the selected factor; ↑/↓ select which factor. */

type Factor = {
  id: string;
  sym: string;
  name: string;
  /** log10 bounds */
  lo: number; hi: number;
  /** current default, log10 */
  def: number;
  known: "measured" | "guess";
  unit: string;
  body: ReactNode;
};

const FACTORS: Factor[] = [
  { id: "R", sym: "R\\ast", name: "New stars per year", lo: 0, hi: 1.3, def: Math.log10(6), known: "measured",
    unit: "stars formed per year in the Galaxy",
    body: <>Measured. Our galaxy forms roughly six new stars a year. This one is not controversial, and it barely matters to the final answer.</> },
  { id: "fp", sym: "f_p", name: "Fraction with planets", lo: -2, hi: 0, def: 0, known: "measured",
    unit: "of stars that have planets",
    body: <>Measured — and one of the great results of this course. Before 1995 this was a guess. Kepler (<em>§4.4</em>) settled it: essentially <strong>every star has planets</strong>. This factor is 1.</> },
  { id: "ne", sym: "n_e", name: "Habitable planets per star", lo: -2, hi: 0, def: Math.log10(0.2), known: "measured",
    unit: "roughly Earth-like worlds per star",
    body: <>Roughly measured, though it depends heavily on what you count as "Earth-like". Estimates run from a few percent to nearly one per star. Take 0.2 and you are in respectable company.</> },
  { id: "fl", sym: "f_l", name: "Fraction where life starts", lo: -10, hi: 0, def: -1, known: "guess",
    unit: "of habitable worlds that get life",
    body: <>A guess — and here the honest floor drops out. Life appeared on Earth almost instantly (<em>§5.3</em>), which some read as "life is easy, this is 1". Others note we have exactly one example, and one example tells you nothing about a probability. It could be one in ten. It could be one in ten billion.</> },
  { id: "fi", sym: "f_i", name: "Fraction that get intelligent", lo: -10, hi: 0, def: -2, known: "guess",
    unit: "of living worlds that evolve intelligence",
    body: <>A guess. Earth had life for four billion years and intelligence for a few million — for most of the history of life on this planet, nothing was thinking about anything. Is intelligence an inevitable destination, or a fluke of one branch of one lineage?</> },
  { id: "fc", sym: "f_c", name: "Fraction that broadcast", lo: -4, hi: 0, def: -1, known: "guess",
    unit: "of intelligences that build a technology we could detect",
    body: <>A guess. Intelligence is not the same as radio. Dolphins and crows are clever; neither is building a transmitter. And a civilisation might well decide, for reasons of its own, to stay quiet.</> },
  { id: "L", sym: "L", name: "How long they last", lo: 1, hi: 9, def: Math.log10(10000), known: "guess",
    unit: "years a broadcasting civilisation survives",
    body: <>The killer. We have been detectable for about a century. Do civilisations last a hundred years before destroying themselves, or a hundred million? Nobody knows — and this single number, more than any other, decides whether the Galaxy is crowded or empty.</> },
];

export function DrakePanel(): JSX.Element {
  const [vals, setVals] = useState<number[]>(FACTORS.map((f) => f.def));
  const [sel, setSel] = useState(6);              // start on L, the killer
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const cur = FACTORS[sel];
  const logN = vals.reduce((a, b) => a + b, 0);
  const N = Math.pow(10, logN);

  const nudge = (d: -1 | 1) =>
    setVals((v) => {
      const next = [...v];
      const f = FACTORS[sel];
      const stepSize = (f.hi - f.lo) / 40;
      next[sel] = Math.max(f.lo, Math.min(f.hi, next[sel] + d * stepSize));
      return next;
    });

  const fmt = (x: number) =>
    x >= 1e6 ? x.toExponential(1).replace("e+", " × 10^").replace("^", "") :
    x >= 1000 ? Math.round(x).toLocaleString("en-US") :
    x >= 1 ? x.toFixed(1) :
    x >= 0.001 ? x.toFixed(4) :
    x.toExponential(1);

  const verdict =
    N >= 1000 ? { t: "A CROWDED GALAXY — someone should be shouting", c: "#4ade80" } :
    N >= 1 ? { t: "A FEW NEIGHBOURS — but the Galaxy is very large", c: "#fbbf24" } :
    { t: "WE ARE ALONE — and the silence is exactly what we should expect", c: "#f87171" };

  const W = 904, H = 520;
  const rowY = (i: number) => 118 + i * 52;
  const barX = 366, barW = 330;

  return (
    <FigurePanel
      idx="6.4.a"
      kicker="The Drake equation, live"
      caption={
        <>
          Seven numbers multiplied together give <em>N</em>, the number of civilisations in our galaxy we could talk to
          right now. Use ↑/↓ to pick a factor and ←/→ to change it, and watch the answer swing. The lesson is in the
          colours: the first three factors (green) are now <strong>measured</strong> — that is this course's
          achievement — and they barely move the result. The last four (red) are honest guesses, and they swing the
          answer from millions to less than one.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 30%, #0f1522 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Drake equation calculator; N equals ${fmt(N)}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* the answer */}
          <text x={24} y={38} fontSize="13" letterSpacing="2.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            CIVILISATIONS WE COULD TALK TO, RIGHT NOW, IN THIS GALAXY
          </text>
          <text x={24} y={82} fontSize="38" fontWeight={700} fontFamily="JetBrains Mono, monospace" fill={verdict.c}>
            N = {fmt(N)}
          </text>
          <text x={W - 24} y={72} textAnchor="end" fontSize="13.5" letterSpacing="1.5"
            fontFamily="JetBrains Mono, monospace" fill={verdict.c}>
            {verdict.t}
          </text>

          {/* the seven factors */}
          {FACTORS.map((f, i) => {
            const on = i === sel;
            const v = vals[i];
            const frac = (v - f.lo) / (f.hi - f.lo);
            const y = rowY(i);
            const known = f.known === "measured";
            const col = known ? "#4ade80" : "#f87171";
            return (
              <g key={f.id} style={{ cursor: "pointer" }} onClick={() => setSel(i)}>
                <rect x={16} y={y - 20} width={W - 32} height={42} rx={7}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.07)" : "transparent"}
                  stroke={on ? col : "transparent"} strokeWidth={1.4} />
                <text x={34} y={y + 6} fontSize="17" fontWeight={700} fontFamily="JetBrains Mono, monospace" fill={col}>
                  {f.id === "R" ? "R★" : f.id === "fp" ? "fₚ" : f.id === "ne" ? "nₑ" : f.id === "fl" ? "f_l" : f.id === "fi" ? "f_i" : f.id === "fc" ? "f_c" : "L"}
                </text>
                <text x={78} y={y + 6} fontSize="14.5" fontWeight={on ? 650 : 500} fontFamily="Inter, sans-serif"
                  fill={on ? "rgb(var(--c-text-rgb) / 0.95)" : "rgb(var(--c-text-rgb) / 0.78)"}>
                  {f.name}
                </text>
                <text x={barX - 14} y={y + 6} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace"
                  fill={col} opacity={0.9}>
                  {known ? "measured" : "a guess"}
                </text>
                {/* the slider track */}
                <rect x={barX} y={y - 5} width={barW} height={11} rx={5.5} fill="rgb(var(--c-text-rgb) / 0.09)" />
                <rect x={barX} y={y - 5} width={barW * frac} height={11} rx={5.5} fill={col} opacity={0.75} />
                <circle cx={barX + barW * frac} cy={y + 0.5} r={on ? 9 : 6} fill="#ffffff" stroke="#0b0d14" strokeWidth={1.4} />
                <text x={barX + barW + 14} y={y + 6} fontSize="13.5" fontFamily="JetBrains Mono, monospace"
                  fill="rgb(var(--c-text-rgb) / 0.85)">
                  {f.id === "L"
                    ? `${fmt(Math.pow(10, v))} yr`
                    : f.id === "R"
                      ? `${Math.pow(10, v).toFixed(1)}/yr`
                      : fmt(Math.pow(10, v))}
                </text>
              </g>
            );
          })}

          <text x={24} y={H - 16} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            ↑ / ↓ choose a factor · ← / → change it · the sliders are logarithmic, because the honest uncertainty demands it
          </text>
        </svg>
      </div>

      {/* the selected factor, explained — constant height */}
      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${cur.known === "measured" ? "#4ade80" : "#f87171"}66`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span style={{ fontSize: sz(1) ?? "15px" }}><M t={cur.sym} /></span>
          <span className="font-mono tracking-[0.16em] uppercase"
            style={{ color: cur.known === "measured" ? "#4ade80" : "#f87171", fontSize: sz(0.7) ?? "12px" }}>
            {cur.name} — {cur.known === "measured" ? "measured" : "a guess"}
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.6)", fontSize: sz(0.58) ?? "10.5px" }}>
            {cur.unit}
          </span>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {cur.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => nudge(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => nudge(1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp"
        onClick={() => setSel((s) => Math.max(0, s - 1))} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown"
        onClick={() => setSel((s) => Math.min(FACTORS.length - 1, s + 1))} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {FACTORS.map((f, i) => (
          <button key={f.id} type="button" onClick={() => setSel(i)} data-shortcut={String(i + 1)}
            className={sel === i ? "is-active" : ""} aria-pressed={sel === i}>
            {f.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 6.4.b — The Great Silence ─────────────────────────────────────
   If there are N civilisations spread through the Galaxy's disk, how far
   apart are they? The figure packs N spheres into the Milky Way's volume
   and reports the spacing — and then, crucially, compares that distance
   with how far our own radio bubble has actually travelled since 1926.

   The slider (the only range input) sets N; ←/→ drive it. */

export function SilencePanel(): JSX.Element {
  const [logN, setLogN] = useState(3);          // N = 1,000
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const N = Math.pow(10, logN);
  /* Galaxy disk: radius 50,000 ly, thickness ~1,000 ly. Spacing = the
     cube root of the volume per civilisation. */
  const volume = Math.PI * 50000 ** 2 * 1000;          // cubic light-years
  const spacing = Math.cbrt(volume / N);
  const radioBubble = 100;                              // ly — first strong broadcasts, ~1926

  const reachable = spacing <= radioBubble;
  const roundTrip = 2 * spacing;

  const W = 904, H = 470;
  const cx = 300, cy = 250, GR = 190;                   // galaxy radius on screen

  /* draw up to 260 civilisation dots, spread over the disk */
  const dots = Math.min(260, Math.max(1, Math.round(N)));
  const pts = Array.from({ length: dots }).map((_, i) => {
    const a = (i * 137.508 * Math.PI) / 180;            // golden angle
    const r = GR * Math.sqrt((i + 0.5) / dots);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) * 0.42 };
  });

  return (
    <FigurePanel
      idx="6.4.b"
      kicker="The Great Silence"
      caption={
        <>
          Suppose there really are <em>N</em> civilisations out there. Spread them evenly through the Galaxy and ask a
          simple question: how far apart would they be? Drag the slider (or use the arrow keys). Even in a Galaxy with a
          <em>thousand</em> civilisations, the nearest is thousands of light-years away — and our radio broadcasts have
          only reached a hundred. The silence is not evidence that nobody is there. It is exactly what a Galaxy with
          neighbours would sound like.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(ellipse at 33% 53%, #171326 0%, #0a0a14 58%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`If there are ${Math.round(N)} civilisations, the nearest is about ${Math.round(spacing)} light-years away`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* the galaxy disk, seen at an angle */}
          <ellipse cx={cx} cy={cy} rx={GR} ry={GR * 0.42} fill="#8ab4f8" opacity={0.06} />
          <ellipse cx={cx} cy={cy} rx={GR} ry={GR * 0.42} fill="none" stroke="rgb(var(--c-text-rgb) / 0.16)" strokeWidth={1} />
          <ellipse cx={cx} cy={cy} rx={GR * 0.32} ry={GR * 0.14} fill="#fde68a" opacity={0.12} />
          <text x={cx} y={cy - GR * 0.42 - 16} textAnchor="middle" fontSize="12.5"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            the Milky Way — 100,000 light-years across
          </text>

          {/* the civilisations */}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.4} fill="#4ade80" opacity={0.85} />
          ))}
          {N > 260 && (
            <text x={cx} y={cy + GR * 0.42 + 22} textAnchor="middle" fontSize="11.5"
              fontFamily="JetBrains Mono, monospace" fill="#4ade80">
              (showing 260 of {Math.round(N).toLocaleString("en-US")})
            </text>
          )}

          {/* us, and our radio bubble — drawn to scale against the spacing */}
          {(() => {
            const us = { x: cx + GR * 0.6, y: cy + GR * 0.2 };
            const scale = GR / 50000;                        // px per light-year
            const bubbleR = Math.max(1.6, radioBubble * scale);
            const spacingR = Math.max(3, spacing * scale);
            return (
              <g>
                <circle cx={us.x} cy={us.y} r={spacingR} fill="none" stroke="#f87171" strokeWidth={1.6}
                  strokeDasharray="5 5" />
                <circle cx={us.x} cy={us.y} r={bubbleR} fill="#fbbf24" opacity={0.5} stroke="#fbbf24" strokeWidth={1.4} />
                <circle cx={us.x} cy={us.y} r={3.4} fill="#ffffff" />
                <line x1={us.x} y1={us.y} x2={W - 210} y2={112} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1} />
                <text x={W - 204} y={104} fontSize="13" fontFamily="Inter, sans-serif" fontWeight={600} fill="#ffffff">us</text>
                <text x={W - 204} y={124} fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#fbbf24">
                  our radio bubble: 100 ly
                </text>
                <text x={W - 204} y={142} fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#f87171">
                  distance to the nearest: {Math.round(spacing).toLocaleString("en-US")} ly
                </text>
              </g>
            );
          })()}

          {/* the numbers */}
          <text x={620} y={230} fontSize="13" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            IF N = {Math.round(N).toLocaleString("en-US")}
          </text>
          <text x={620} y={266} fontSize="26" fontWeight={700} fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {Math.round(spacing).toLocaleString("en-US")} ly apart
          </text>
          <text x={620} y={300} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
            a message and its reply:
          </text>
          <text x={620} y={326} fontSize="18" fontWeight={650} fontFamily="JetBrains Mono, monospace"
            fill={roundTrip > 4000 ? "#f87171" : "#fbbf24"}>
            {Math.round(roundTrip).toLocaleString("en-US")} years
          </text>
          <text x={620} y={356} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            {roundTrip > 10000
              ? "longer than all of human civilisation"
              : roundTrip > 2000
                ? "longer than the Roman Empire has been gone"
                : "within recorded history — barely"}
          </text>
          <text x={620} y={400} fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill={reachable ? "#4ade80" : "#f87171"}>
            {reachable
              ? "our signals could just have reached them"
              : "our signals have not reached anyone yet"}
          </text>
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          N = 1
        </span>
        <input type="range" min={0} max={70} step={1} value={Math.round(logN * 10)}
          onChange={(e) => setLogN(Number(e.currentTarget.value) / 10)}
          aria-label="Number of civilisations in the Galaxy" style={{ width: "100%" }} />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          10 million
        </span>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          the silence, explained
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "4.2em" }}>
          Our first strong radio broadcasts left Earth about a century ago, so our signals have washed over everything
          within <strong>a hundred light-years</strong> — a sphere containing a few thousand stars, out of four hundred
          billion. Even a galaxy generously stocked with a thousand civilisations would put the nearest one thousands of
          light-years away. We have not heard from anyone. We have also, so far, barely listened.
        </div>
      </div>
    </FigurePanel>
  );
}
