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

/* ── 5.3.a — Inside an alkaline vent ────────────────────────────────
   The leading hypothesis for where life's chemistry started: a porous
   rock chimney on the Hadean sea floor, whose mineral walls separate
   alkaline vent fluid from acidic seawater. That difference is a natural
   battery — a proton gradient — and it is the same trick every living
   cell still uses today.

   Annotated-diagram standard: every named part is clickable (with a fat
   invisible hit-rect); labels live in reserved slots down the right;
   the detail box is constant height. ←/→ and ↑/↓ walk the parts. */

type VentPart = {
  id: string;
  name: string;
  color: string;
  /** label slot index (0 = top) */
  slot: number;
  /** leader anchor in viewBox units */
  ax: number; ay: number;
  stat: string;
  body: ReactNode;
};

const PARTS: VentPart[] = [
  { id: "seawater", name: "Acidic seawater", color: "#f0a35e", slot: 0, ax: 118, ay: 108,
    stat: "mildly acidic · rich in dissolved CO₂",
    body: <>The Hadean ocean was loaded with carbon dioxide from a volcanic atmosphere, which made it mildly acidic — meaning it was full of loose <strong>protons</strong> (hydrogen nuclei, positively charged). Acid simply means proton-rich.</> },
  { id: "fluid", name: "Alkaline vent fluid", color: "#4ade80", slot: 1, ax: 236, ay: 322,
    stat: "alkaline · warm · rich in hydrogen gas",
    body: <>Seawater percolating through the rock below reacts with it and comes back up warm, alkaline (proton-<em>poor</em>), and carrying hydrogen gas. Vents like this exist today — the Lost City field in the mid-Atlantic is the living example.</> },
  { id: "wall", name: "The mineral wall", color: "#94a3b8", slot: 2, ax: 300, ay: 214,
    stat: "thin · porous · studded with iron-sulfur minerals",
    body: <>A honeycomb of paper-thin rock walls separates the two fluids. Iron and sulfur minerals in those walls conduct electrons — they are, in effect, tiny natural catalysts, chemically similar to ones still buried inside your own cells.</> },
  { id: "gradient", name: "The proton gradient", color: "#fbbf24", slot: 3, ax: 372, ay: 250,
    stat: "protons crowded on one side, scarce on the other",
    body: <>Here is the whole point. Protons crowd on the acidic side and are scarce on the alkaline side, so they push through the wall — a natural <strong>battery</strong>, built by geology, running for free, continuously, for tens of thousands of years.</> },
  { id: "pore", name: "A pore — the first cell?", color: "#8ab4f8", slot: 4, ax: 470, ay: 196,
    stat: "micrometre-sized · concentrates molecules",
    body: <>Inside each tiny pore, molecules are trapped and concentrated instead of drifting away into the ocean. Hydrogen meets carbon dioxide across a catalytic wall, powered by the proton gradient — and organic molecules begin to accumulate.</> },
  { id: "chemistry", name: "Carbon fixed into molecules", color: "#c4b5fd", slot: 5, ax: 546, ay: 268,
    stat: "CO₂ + H₂ → the building blocks of life",
    body: <>Carbon dioxide plus hydrogen, over a catalyst, driven by a proton gradient. That reaction makes the small carbon molecules everything else is built from — and it is, remarkably, still the way some living microbes eat today.</> },
];

export function VentPanel(): JSX.Element {
  const [idx, setIdx] = useState(3);
  const sel = PARTS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(PARTS.length - 1, i + d)));

  /* reserved-slot layout */
  const W = 904, H = 560;
  const LEAD_X = 618, LABEL_X = 632;
  const SLOT0 = 76, SLOTH = 82;
  const slotY = (i: number) => SLOT0 + i * SLOTH;

  const on = (id: string) => sel.id === id;

  return (
    <FigurePanel
      idx="5.3.a"
      kicker="Inside an alkaline vent"
      caption={
        <>
          The leading idea for where life's chemistry began: a porous rock chimney on the sea floor, whose thin mineral
          walls hold acidic seawater on one side and alkaline vent fluid on the other. Click any labelled part — or walk
          them with the arrow keys. The key is the middle one: that difference across the wall is a natural battery of
          protons, and every living cell on Earth still runs on exactly the same trick.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "linear-gradient(180deg, #0d1830 0%, #0a1122 45%, #0b0a10 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Cross-section of an alkaline hydrothermal vent; ${sel.name} selected`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* seawater */}
          <rect x={0} y={0} width={618} height={H} fill="#0f2036" opacity={on("seawater") ? 0.95 : 0.7} />
          <rect x={0} y={0} width={618} height={H} fill="#f0a35e" opacity={on("seawater") ? 0.1 : 0} />
          <g style={{ cursor: "pointer" }} onClick={() => setIdx(0)}>
            <rect x={0} y={40} width={220} height={200} fill="transparent" />
            {Array.from({ length: 22 }).map((_, i) => {
              /* golden-angle scatter so the protons fill the water instead of streaking */
              const gx = 26 + ((i * 79) % 9) * 21;
              const gy = 60 + Math.floor(((i * 79) % 63) / 9) * 26;
              return <text key={i} x={gx} y={gy} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#f0a35e" opacity={0.85}>H⁺</text>;
            })}
          </g>

          {/* the chimney: a porous mound rising from the sea floor */}
          <g style={{ cursor: "pointer" }} onClick={() => setIdx(2)}>
            <path d="M 150 540 L 210 300 Q 250 190 330 150 Q 420 108 470 150 Q 540 200 520 300 L 560 540 Z"
              fill="#3f3a4a" stroke={on("wall") ? "#e5e7eb" : "rgb(var(--c-text-rgb) / 0.35)"} strokeWidth={on("wall") ? 2.6 : 1.2} />
            {/* honeycomb of pores */}
            {[[262, 250], [310, 210], [360, 186], [416, 196], [300, 300], [356, 268], [412, 262], [462, 226],
              [280, 360], [340, 340], [400, 330], [458, 300], [318, 420], [386, 400], [452, 372]].map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={17} fill="#0f2036" opacity={0.9}
                stroke={on("pore") ? "#8ab4f8" : "rgb(var(--c-text-rgb) / 0.25)"} strokeWidth={on("pore") ? 2 : 1} />
            ))}
          </g>

          {/* alkaline fluid welling up the middle */}
          <g style={{ cursor: "pointer" }} onClick={() => setIdx(1)}>
            <path d="M 236 540 Q 250 380 300 300 Q 340 240 370 170"
              fill="none" stroke="#4ade80" strokeWidth={on("fluid") ? 9 : 6} opacity={on("fluid") ? 0.85 : 0.45}
              strokeLinecap="round" />
            <path d="M 236 540 Q 250 380 300 300 Q 340 240 370 170"
              fill="none" stroke="transparent" strokeWidth={26} />
            {[[250, 470], [268, 400], [300, 330], [336, 260]].map(([px, py], i) => (
              <text key={i} x={px + 14} y={py} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="#4ade80" opacity={0.9}>H₂</text>
            ))}
          </g>

          {/* the gradient: protons pushing through a wall, drawn as a zoom callout */}
          <g style={{ cursor: "pointer" }} onClick={() => setIdx(3)}>
            <rect x={330} y={196} width={110} height={110} fill="transparent" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={352} y1={214 + i * 24} x2={402} y2={214 + i * 24}
                stroke="#fbbf24" strokeWidth={on("gradient") ? 2.4 : 1.4} opacity={on("gradient") ? 1 : 0.55}
                markerEnd="url(#v-arr)" />
            ))}
            <text x={377} y={198} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
              fill="#fbbf24" opacity={on("gradient") ? 1 : 0.7}>protons flow →</text>
          </g>

          {/* the chemistry happening in a pore */}
          <g style={{ cursor: "pointer" }} onClick={() => setIdx(5)}>
            <rect x={466} y={236} width={130} height={70} fill="transparent" />
            <text x={478} y={264} fontSize="14" fontFamily="JetBrains Mono, monospace"
              fill={on("chemistry") ? "#c4b5fd" : "rgb(var(--c-text-rgb) / 0.6)"}>CO₂ + H₂</text>
            <text x={478} y={288} fontSize="14" fontFamily="JetBrains Mono, monospace"
              fill={on("chemistry") ? "#c4b5fd" : "rgb(var(--c-text-rgb) / 0.6)"}>→ organics</text>
          </g>

          {/* sea floor */}
          <rect x={0} y={520} width={618} height={H - 520} fill="#141019" />

          {/* reserved-slot labels */}
          {PARTS.map((p, i) => {
            const isSel = i === idx;
            const ly = slotY(p.slot);
            return (
              <g key={p.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={LEAD_X - 8} y={ly - 26} width={W - LEAD_X} height={SLOTH - 12} rx={6}
                  fill={isSel ? "rgb(var(--c-text-rgb) / 0.08)" : "transparent"}
                  stroke={isSel ? p.color : "transparent"} strokeWidth={1.4} />
                <line x1={p.ax} y1={p.ay} x2={LEAD_X - 10} y2={ly - 6}
                  stroke={isSel ? p.color : "rgb(var(--c-text-rgb) / 0.3)"} strokeWidth={isSel ? 1.8 : 1} />
                <circle cx={p.ax} cy={p.ay} r={isSel ? 6 : 4} fill={p.color} stroke="#0b0d14" strokeWidth={1.2} />
                <text x={LABEL_X} y={ly} fontFamily="Inter, sans-serif" fontSize={17}
                  fontWeight={isSel ? 700 : 550} fill={isSel ? p.color : "rgb(var(--c-text-rgb) / 0.88)"}>
                  {p.name}
                </text>
                <text x={LABEL_X} y={ly + 20} fontFamily="JetBrains Mono, monospace" fontSize={12}
                  fill="rgb(var(--c-text-rgb) / 0.55)">
                  {p.stat.length > 34 ? p.stat.slice(0, 33) + "…" : p.stat}
                </text>
              </g>
            );
          })}

          <defs>
            <marker id="v-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${sel.color}66`,
        boxShadow: `inset 0 0 0 1px ${sel.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.name}
        </div>
        <div className="font-mono mt-1" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
          {sel.stat}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowUp" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowDown" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {PARTS.map((p, i) => (
          <button key={p.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {p.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 5.3.b — Seven steps from rock to cell ─────────────────────────
   The road from vent chemistry to the last universal common ancestor,
   in seven stages. Each stage draws a schematic of what now exists, and
   a "how sure are we?" bar — because the honest answer changes a lot
   between step 1 (solid chemistry) and step 5 (real guesswork).
   ←/→ or 1–7 step. No continuous animation. */

type LifeStep = {
  n: number;
  name: string;
  color: string;
  /** confidence, 0–1, drawn as a bar and stated in words */
  conf: number;
  confWord: string;
  body: ReactNode;
};

const STEPS: LifeStep[] = [
  { n: 1, name: "Chemistry from rock", color: "#4ade80", conf: 0.85, confWord: "well tested in the lab",
    body: <>Carbon dioxide and hydrogen, pushed together by the vent's proton battery over iron-sulfur catalysts, make small organic molecules. This step has been reproduced in laboratories: it needs no life, only rock, water, and a gradient.</> },
  { n: 2, name: "Protocells", color: "#38bdf8", conf: 0.75, confWord: "demonstrated in the lab",
    body: <>Fatty acids — soap-like molecules with a water-loving head and a water-fearing tail — spontaneously close into hollow bubbles when they are concentrated. These <strong>protocells</strong> grow, split, and leak protons. They are not alive, but they are a container.</> },
  { n: 3, name: "A metabolism", color: "#8ab4f8", conf: 0.5, confWord: "plausible, partly shown",
    body: <>Inside the bubbles, chemical reactions start feeding one another: the product of one becomes the fuel of the next, in loops that sustain themselves as long as energy flows. This is <strong>metabolism</strong> before there is any genetic code to run it.</> },
  { n: 4, name: "RNA appears", color: "#c4b5fd", conf: 0.45, confWord: "leading idea, unproven",
    body: <>Small units link into chains of <strong>RNA</strong>, a molecule with a remarkable double talent: it can carry information <em>and</em> act as a catalyst. That is why many think it came first — the famous <strong>RNA world</strong>. But nobody has yet built an RNA that copies itself.</> },
  { n: 5, name: "The genetic code", color: "#f472b6", conf: 0.3, confWord: "genuinely unsolved",
    body: <>Somehow, sequences of RNA come to <em>stand for</em> particular amino acids — the code that every living thing still uses, three letters per amino acid. How this mapping arose is one of the deepest open questions in all of biology.</> },
  { n: 6, name: "Proteins and machines", color: "#fbbf24", conf: 0.4, confWord: "inferred from what survives",
    body: <>With a code, the cell can build <strong>proteins</strong> to order — and proteins are far better catalysts than rock or RNA. The <strong>ribosome</strong>, the machine that reads the code and assembles proteins, is itself so ancient that it is nearly identical in every organism alive.</> },
  { n: 7, name: "LUCA", color: "#e5e7eb", conf: 0.6, confWord: "reconstructed from living genomes",
    body: <>A cell that makes its own membrane, its own gradient, its own proteins — and leaves the vent. We call it the <strong>last universal common ancestor</strong>: not the first life, but the one ancestor every living thing shares. Genome comparisons place it around <strong>4.2 billion years ago</strong>.</> },
];

export function StepsPanel(): JSX.Element {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const walk = (d: -1 | 1) => setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + d)));

  const W = 904, H = 400;
  const cx = 300, cy = 210;

  /* cumulative schematic: each step adds a feature to the same protocell */
  const has = (n: number) => step + 1 >= n;

  return (
    <FigurePanel
      idx="5.3.b"
      kicker="Seven steps from rock to cell"
      caption={
        <>
          The road from vent chemistry to the last common ancestor of everything alive — step through it with the arrow
          keys. The cell in the middle gains one feature at each step. Watch the honesty bar on the right: the early
          steps have been reproduced in laboratories, but the middle ones — especially how the genetic code arose — are
          still genuinely unsolved. This is the frontier, not a finished story.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 33% 50%, #101a24 0%, #0a0d14 60%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Step ${cur.n} of 7: ${cur.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={36} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            STEP {cur.n} OF 7
          </text>
          <text x={24} y={64} fontSize="21" fontWeight={650} fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.92)">
            {cur.name}
          </text>

          {/* the accumulating cell */}
          {/* 1 — organic molecules */}
          {has(1) && [[-46, -30], [30, -44], [56, 18], [-20, 44], [-62, 12], [12, 8]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={cy + dy} r={5} fill="#4ade80" opacity={0.9} />
          ))}
          {/* 2 — membrane */}
          {has(2) && (
            <>
              <circle cx={cx} cy={cy} r={94} fill="none" stroke="#38bdf8" strokeWidth={5} opacity={0.75} />
              <circle cx={cx} cy={cy} r={94} fill="#38bdf8" opacity={0.05} />
            </>
          )}
          {/* 3 — metabolic loop */}
          {has(3) && (
            <g>
              <path d={`M ${cx - 48} ${cy + 10} a 48 32 0 1 1 96 0 a 48 32 0 1 1 -96 0`}
                fill="none" stroke="#8ab4f8" strokeWidth={2.2} strokeDasharray="6 5" opacity={0.9} />
              <text x={cx} y={cy + 62} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">
                self-feeding loop
              </text>
            </g>
          )}
          {/* 4 — RNA strand */}
          {has(4) && (
            <path d={`M ${cx - 60} ${cy - 52} q 20 14 40 0 q 20 -14 40 0 q 20 14 36 0`}
              fill="none" stroke="#c4b5fd" strokeWidth={3} opacity={0.95} />
          )}
          {/* 5 — code: letters pairing to beads */}
          {has(5) && (
            <g>
              {["A", "U", "G", "C"].map((l, i) => (
                <text key={l} x={cx - 52 + i * 30} y={cy - 68} textAnchor="middle" fontSize="12.5"
                  fontFamily="JetBrains Mono, monospace" fill="#f472b6">{l}</text>
              ))}
              <text x={cx + 76} y={cy - 68} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#f472b6">= code</text>
            </g>
          )}
          {/* 6 — ribosome + proteins */}
          {has(6) && (
            <g>
              <circle cx={cx + 36} cy={cy + 34} r={13} fill="#fbbf24" opacity={0.9} />
              <circle cx={cx + 36} cy={cy + 34} r={7} fill="#0b0d14" opacity={0.5} />
              <text x={cx + 36} y={cy + 62} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#fbbf24">ribosome</text>
              {[[-30, 30], [-6, 52], [-52, 46]].map(([dx, dy], i) => (
                <rect key={i} x={cx + dx} y={cy + dy} width={11} height={7} rx={2} fill="#fbbf24" opacity={0.85} />
              ))}
            </g>
          )}
          {/* 7 — free-living cell with its own gradient */}
          {has(7) && (
            <g>
              <circle cx={cx} cy={cy} r={104} fill="none" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="4 6" opacity={0.8} />
              {[0, 60, 120, 180, 240, 300].map((a) => {
                const r0 = 94, r1 = 108;
                const rad = (a * Math.PI) / 180;
                return (
                  <line key={a} x1={cx + r0 * Math.cos(rad)} y1={cy + r0 * Math.sin(rad)}
                    x2={cx + r1 * Math.cos(rad)} y2={cy + r1 * Math.sin(rad)}
                    stroke="#fbbf24" strokeWidth={2.4} />
                );
              })}
              <text x={cx} y={cy + 132} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="#e5e7eb">
                makes its own gradient — and leaves the vent
              </text>
            </g>
          )}

          {/* the honesty bar */}
          <text x={620} y={110} fontSize="13" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            HOW SURE ARE WE?
          </text>
          <rect x={620} y={126} width={250} height={16} rx={8} fill="rgb(var(--c-text-rgb) / 0.08)" />
          <rect x={620} y={126} width={250 * cur.conf} height={16} rx={8} fill={cur.color} opacity={0.9}
            style={{ transition: "width 260ms var(--ease)" }} />
          <text x={620} y={166} fontSize="15" fontFamily="Inter, sans-serif" fontWeight={600} fill={cur.color}>
            {cur.confWord}
          </text>
          <text x={620} y={200} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            steps 1–2 have been done in a beaker;
          </text>
          <text x={620} y={220} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            step 5 nobody can yet explain.
          </text>

          {/* step ladder */}
          {STEPS.map((s, i) => (
            <g key={s.n} style={{ cursor: "pointer" }} onClick={() => setStep(i)}>
              <rect x={620} y={250 + i * 20} width={250} height={16} rx={4}
                fill={i <= step ? s.color : "rgb(var(--c-text-rgb) / 0.06)"}
                opacity={i === step ? 0.95 : i < step ? 0.35 : 1} />
              <text x={628} y={262 + i * 20} fontSize="11" fontFamily="JetBrains Mono, monospace"
                fill={i <= step ? "#0b0d14" : "rgb(var(--c-text-rgb) / 0.6)"}>
                {s.n}. {s.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          step {cur.n} · {cur.name} · {cur.confWord}
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "5.4em" }}>
          {cur.body}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 items-center" style={{ flexShrink: 0 }}>
        {STEPS.map((_, n) => (
          <button key={n} type="button" onClick={() => setStep(n)} aria-pressed={step === n}
            className={`rounded-full font-mono${step === n ? " is-active" : ""}`} data-shortcut={String(n + 1)} style={{
              width: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              height: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              fontSize: sz(0.56) ?? "10px",
              color: step === n ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.6)",
              background: step === n ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
            }}>{n + 1}</button>
        ))}
        <span className="font-mono ml-2" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>
          ← / → build a cell, one step at a time
        </span>
      </div>

      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => walk(-1)} style={srOnly} />
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => walk(1)} style={srOnly} />
    </FigurePanel>
  );
}
