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

/* ── 7.4.a — The rising cost of complexity ─────────────────────────
   Chaisson's energy rate density (specific power) — the same ladder the
   course climbed in §0.2, now completed with the last rung: a society.
   Units are erg per gram per second, exactly as in chapter 0, so the
   two figures can be read against each other.

   ←/→ walk the rungs; the bar chart is log-scaled because the range is
   six orders of magnitude. */

type Rung = {
  id: string;
  name: string;
  /** erg per gram per second */
  power: number;
  when: string;
  color: string;
  body: ReactNode;
};

const RUNGS: Rung[] = [
  { id: "galaxy", name: "A galaxy", power: 0.5, when: "13 billion years ago", color: "#8ab4f8",
    body: <>Vast, luminous — and, per gram, remarkably feeble. A galaxy is mostly empty space with a few stars in it. Size is not complexity.</> },
  { id: "star", name: "A star", power: 2, when: "the Stellar Age", color: "#fde68a",
    body: <>The Sun pours out a staggering amount of energy in total, but it is also staggeringly massive. Spread over every gram, its output is about four times a galaxy's — and a thousandth of a plant's.</> },
  { id: "planet", name: "A planet", power: 75, when: "the Planetary Age", color: "#d3a26a",
    body: <>Earth, taken as a whole system — its churning interior, its weather, its oceans (<em>§4.2</em>). More energy flows through each gram of this planet than through each gram of the Sun that lights it.</> },
  { id: "plant", name: "A plant", power: 900, when: "the Chemical Age", color: "#4ade80",
    body: <>Photosynthesis, the invention that rebuilt the atmosphere (<em>§5.2</em>). A leaf running sunlight into sugar processes energy far more intensely, gram for gram, than any star.</> },
  { id: "animal", name: "An animal", power: 20000, when: "the Biological Age", color: "#f0a35e",
    body: <>Bodies that move, hunt, and burn food with oxygen — the payoff from the swallowed bacterium of <em>§6.2</em>. Twenty thousand: four orders of magnitude above the Sun.</> },
  { id: "brain", name: "The human brain", power: 150000, when: "the last few million years", color: "#f472b6",
    body: <>Two percent of your body's mass, twenty percent of its energy budget. Thinking is metabolically outrageous — which is exactly why it had to pay for itself.</> },
  { id: "society", name: "A modern society", power: 500000, when: "the last 250 years", color: "#c4b5fd",
    body: <>The top rung, and a strange one: it is not a body at all. Add the machines, the power stations, the cars and the servers to the people, and the energy flowing through each gram of the whole system is the highest we know of anywhere in the Universe. That is what the Cultural Age <em>is</em>, in physical terms.</> },
];

export function ComplexityPanel(): JSX.Element {
  /* Start at the bottom of the ladder and climb — the figure is a climb. */
  const [idx, setIdx] = useState(0);
  const sel = RUNGS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(RUNGS.length - 1, i + d)));

  const W = 904, H = 450;
  const L = 190, Rm = 110, T = 70, B = 62;
  const lg = Math.log10;
  const xOf = (p: number) => L + ((lg(p) - lg(0.2)) / (lg(1e6) - lg(0.2))) * (W - L - Rm);
  const rowY = (i: number) => T + 12 + i * ((H - T - B) / RUNGS.length);

  return (
    <FigurePanel
      idx="7.4.a"
      kicker="The rising cost of complexity"
      caption={
        <>
          The same ladder we climbed in <em>§0.2</em>, now finished. Each rung is the energy flowing through one gram of
          a thing, every second — Chaisson's measure of how hard a system works to stay organised. Walk it with the
          arrow keys. The scale is logarithmic, and the punchline is at the top: a modern society processes energy more
          intensely, per gram, than a star, a planet, a plant, or a brain. Complexity is not free, and we are the most
          expensive thing we know of.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 45%, #131320 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Energy rate density of ${sel.name}: ${sel.power} erg per gram per second`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={34} fontSize="13" letterSpacing="2.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            ENERGY FLOWING THROUGH ONE GRAM, EVERY SECOND
          </text>

          {/* log grid */}
          {[1, 10, 100, 1000, 1e4, 1e5, 1e6].map((p) => (
            <g key={p}>
              <line x1={xOf(p)} y1={T} x2={xOf(p)} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.07)" strokeWidth={1} />
              <text x={xOf(p)} y={H - B + 20} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.5)">
                {p >= 1000 ? `10${p === 1000 ? "³" : p === 1e4 ? "⁴" : p === 1e5 ? "⁵" : "⁶"}` : p}
              </text>
            </g>
          ))}
          <text x={(L + W - Rm) / 2} y={H - 16} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.6)">
            erg per gram per second (log scale) →
          </text>

          {/* the rungs */}
          {RUNGS.map((r, i) => {
            const on = i === idx;
            const y = rowY(i);
            const bw = xOf(r.power) - L;
            return (
              <g key={r.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={12} y={y - 14} width={W - 24} height={30} rx={6}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.07)" : "transparent"} />
                <text x={L - 14} y={y + 6} textAnchor="end" fontSize="14.5" fontWeight={on ? 700 : 500}
                  fontFamily="Inter, sans-serif" fill={on ? r.color : "rgb(var(--c-text-rgb) / 0.78)"}>
                  {r.name}
                </text>
                <rect x={L} y={y - 8} width={Math.max(2, bw)} height={17} rx={3.5} fill={r.color}
                  opacity={on ? 0.95 : 0.5} style={{ transition: "opacity 200ms var(--ease)" }} />
                <text x={xOf(r.power) + 10} y={y + 6} fontSize="12.5" fontFamily="JetBrains Mono, monospace"
                  fill={on ? r.color : "rgb(var(--c-text-rgb) / 0.6)"}>
                  {r.power.toLocaleString("en-US")}
                </text>
              </g>
            );
          })}

          {/* the arrow of the whole course */}
          <text x={W - 24} y={T - 18} textAnchor="end" fontSize="11.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.45)">
            ↓ fourteen billion years of climbing
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
            {sel.name}
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
            {sel.power.toLocaleString("en-US")} erg per gram per second · {sel.when}
          </span>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.2em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {RUNGS.map((r, i) => (
          <button key={r.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {r.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 7.4.b — How hard have we actually looked? ─────────────────────
   Five explanations for the silence, each selectable — and, underneath,
   the honest scale of the search: a hot tub out of all Earth's oceans.
   ←/→ or 1–5. */

type Answer = {
  id: string;
  name: string;
  kind: "science" | "fiction";
  color: string;
  body: ReactNode;
};

const ANSWERS: Answer[] = [
  { id: "search", name: "We have barely looked", kind: "science", color: "#4ade80",
    body: <>The dullest answer, and the most defensible. Radio SETI has searched a vanishing fraction of the possible combinations of star, frequency, time, and signal type. One careful accounting compares it to sampling <strong>a hot tub's worth of water out of all the Earth's oceans</strong>. You cannot conclude the ocean is empty of fish from that.</> },
  { id: "distance", name: "They are simply too far", kind: "science", color: "#38bdf8",
    body: <>Even a Galaxy with thousands of civilisations (<em>§6.4</em>) spaces them thousands of light-years apart. Our own broadcasts have travelled a hundred light-years. A conversation would take longer than our species has had writing.</> },
  { id: "filter", name: "The Great Filter", kind: "science", color: "#f87171",
    body: <>Some step on the road is fantastically unlikely. If that filter lies <em>behind</em> us — the origin of life (<em>§5.3</em>), or the swallowed bacterium (<em>§6.2</em>) — we are simply the winners of an absurd lottery. If it lies <em>ahead</em>, the silence is a warning, and the last term of the Drake equation is the most important number in the world.</> },
  { id: "rare", name: "Rare Earth", kind: "science", color: "#fbbf24",
    body: <>Perhaps simple life is common and complex life is not. It took Earth two billion years to get past the single cell, and it needed an accident to do it. Microbes may be everywhere while anything that can build a radio is essentially nowhere.</> },
  { id: "darkforest", name: "The Dark Forest", kind: "fiction", color: "#a78bfa",
    body: <>The chilling one — and it belongs in a different category, so it is flagged differently here. In Liu Cixin's novel, every civilisation stays silent because announcing yourself to an unknown neighbour is suicidal. It is a <strong>work of fiction</strong>, not a scientific hypothesis: it makes no testable prediction. It is worth knowing precisely so you can tell the difference between a good story and a result.</> },
];

export function SearchPanel(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const sel = ANSWERS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(ANSWERS.length - 1, i + d)));

  const W = 904, H = 430;

  return (
    <FigurePanel
      idx="7.4.b"
      kicker="Why is it so quiet?"
      caption={
        <>
          Five answers to the Great Silence — step through them with the arrow keys. Four are scientific hypotheses; the
          fifth, flagged in the figure, is a novel. The bar at the bottom is the honest scale of the search so far: of
          all the combinations of star, frequency, and time we could examine, we have examined roughly a hot tub's worth
          of an ocean. The most likely reason we have not heard anything is that we have not really listened yet.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 40%, #0f1420 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Explanation for the Great Silence: ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={34} fontSize="13" letterSpacing="2.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            WHY IS THE GALAXY SILENT?
          </text>

          {/* the five answers */}
          {ANSWERS.map((a, i) => {
            const on = i === idx;
            const y = 76 + i * 44;
            return (
              <g key={a.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={24} y={y - 20} width={W - 48} height={36} rx={7}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.08)" : "rgb(var(--c-text-rgb) / 0.02)"}
                  stroke={on ? a.color : "rgb(var(--c-text-rgb) / 0.1)"} strokeWidth={on ? 1.8 : 1} />
                <circle cx={46} cy={y - 2} r={6} fill={a.color} />
                <text x={64} y={y + 3} fontSize="16" fontWeight={on ? 700 : 500} fontFamily="Inter, sans-serif"
                  fill={on ? a.color : "rgb(var(--c-text-rgb) / 0.82)"}>{a.name}</text>
                <text x={W - 40} y={y + 3} textAnchor="end" fontSize="11" fontFamily="JetBrains Mono, monospace"
                  fill={a.kind === "fiction" ? "#f87171" : "rgb(var(--c-text-rgb) / 0.4)"}>
                  {a.kind === "fiction" ? "⚠ a novel, not a hypothesis" : "a scientific hypothesis"}
                </text>
              </g>
            );
          })}

          {/* the search-so-far bar */}
          <text x={24} y={330} fontSize="12.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            HOW MUCH OF THE SEARCH SPACE WE HAVE ACTUALLY EXAMINED
          </text>
          <rect x={24} y={344} width={W - 48} height={26} rx={6} fill="rgb(var(--c-text-rgb) / 0.07)"
            stroke="rgb(var(--c-text-rgb) / 0.16)" strokeWidth={1} />
          {/* the searched fraction is far too small to draw honestly — so say so */}
          <rect x={24} y={344} width={2} height={26} rx={1} fill="#4ade80" />
          <text x={34} y={362} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#4ade80">
            ← everything we have ever searched (not to scale — it is far too small to draw)
          </text>
          <text x={24} y={398} fontSize="13.5" fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.8)">
            Equivalent to sampling <tspan fontWeight={700} fill="var(--c-solar)">a hot tub of water</tspan> out of all the oceans on Earth — and concluding there are no fish.
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
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
            {sel.name}
          </span>
          <span className="font-mono" style={{ color: sel.kind === "fiction" ? "#f87171" : "rgb(var(--c-text-rgb) / 0.55)", fontSize: sz(0.58) ?? "10.5px" }}>
            {sel.kind === "fiction" ? "⚠ a work of fiction — not a testable hypothesis" : "a scientific hypothesis"}
          </span>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "5.4em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {ANSWERS.map((a, i) => (
          <button key={a.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {a.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
