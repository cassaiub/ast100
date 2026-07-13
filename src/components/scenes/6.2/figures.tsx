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

/* ── 6.2.a — The cell that swallowed a cell ─────────────────────────
   Endosymbiosis in five stages: an archaeal host engulfs a bacterium,
   fails to digest it, and keeps it — and the result is every complex
   cell on Earth. ←/→ or 1–5. Stage switches are instant, so the figure
   is reduced-motion-safe by construction. */

type SymStage = {
  n: number;
  title: string;
  color: string;
  when: string;
  body: ReactNode;
};

const SYM: SymStage[] = [
  { n: 1, title: "Two cells, side by side", color: "#fbbf24", when: "roughly 2 billion years ago",
    body: <>An <strong>archaeon</strong> — a simple cell, no nucleus — living alongside a <strong>bacterium</strong> that has a skill the archaeon lacks: it can burn food using the new oxygen in the water (<em>§5.2</em>), which releases about ten times more energy than the old airless chemistry.</> },
  { n: 2, title: "One swallows the other", color: "#f0a35e", when: "the single most important accident in biology",
    body: <>The archaeon engulfs the bacterium — and, crucially, fails to digest it. This has surely happened countless times with no consequence. Once, it stuck.</> },
  { n: 3, title: "The passenger stays — and pays rent", color: "#4ade80", when: "a partnership, not a meal",
    body: <>The trapped bacterium keeps doing what it did before: burning food with oxygen and handing the energy to its host. The host feeds it and shelters it. Both do better together than apart, so natural selection keeps the arrangement.</> },
  { n: 4, title: "It becomes an organ", color: "#38bdf8", when: "over many generations",
    body: <>The passenger surrenders most of its genes to the host's DNA and gives up living independently. It is no longer a bacterium; it is a <strong>mitochondrion</strong> — the power plant inside your cells. You have hundreds of them in almost every cell of your body, and they still carry their own little loop of bacterial DNA.</> },
  { n: 5, title: "The complex cell", color: "#f472b6", when: "and everything you can see",
    body: <>An energy-rich cell can afford a much bigger genome, a nucleus to keep it in, and a vastly more complicated body plan. Every animal, plant, and fungus is built from this hybrid. And in plants, it happened <em>again</em>: a swallowed cyanobacterium became the <strong>chloroplast</strong>. Every leaf is running captured bacteria.</> },
];

export function EndosymbiosisPanel(): JSX.Element {
  const [stage, setStage] = useState(0);
  const cur = SYM[stage];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setStage((s) => Math.max(0, Math.min(SYM.length - 1, s + d)));

  const W = 904, H = 400;
  const cx = 400, cy = 214;

  /* host size and passenger position by stage */
  const hostR = stage === 4 ? 130 : 92;
  const pass = [
    { x: cx + 210, y: cy, r: 34, inside: false },
    { x: cx + 96, y: cy - 12, r: 32, inside: false },
    { x: cx + 34, y: cy + 6, r: 30, inside: true },
    { x: cx + 40, y: cy + 24, r: 26, inside: true },
    { x: cx + 62, y: cy + 40, r: 24, inside: true },
  ][stage];

  return (
    <FigurePanel
      idx="6.2.a"
      kicker="The cell that swallowed a cell"
      caption={
        <>
          How the complex cell was made — step through it with the arrow keys. Around two billion years ago one simple
          cell engulfed another and failed to digest it. The passenger could burn food with oxygen; the host could not.
          They stayed together. That swallowed bacterium is the <strong>mitochondrion</strong> in every cell of your
          body — it still carries its own bacterial DNA. Every animal, plant, and fungus descends from this one
          accident.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 45% 50%, #12131f 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Endosymbiosis, stage ${cur.n}: ${cur.title}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={34} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            STAGE {cur.n} OF 5
          </text>
          <text x={24} y={60} fontSize="19" fontWeight={650} fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.92)">
            {cur.title}
          </text>
          <text x={W - 24} y={34} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            {cur.when}
          </text>

          {/* the host cell */}
          <circle cx={cx} cy={cy} r={hostR} fill="#fbbf24" opacity={0.1}
            stroke="#fbbf24" strokeWidth={2} style={{ transition: "r 260ms var(--ease)" }} />
          {/* the nucleus appears at stage 5 */}
          {stage === 4 && (
            <g>
              <circle cx={cx - 22} cy={cy - 18} r={44} fill="#f472b6" opacity={0.2} stroke="#f472b6" strokeWidth={1.6} />
              <text x={cx - 22} y={cy - 14} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.8)">nucleus</text>
              <text x={cx - 22} y={cy + 2} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.5)">the DNA, kept safe</text>
            </g>
          )}
          <text x={cx - hostR + 8} y={cy - hostR - 12} fontSize="13.5" fontFamily="Inter, sans-serif"
            fill="#fbbf24">{stage === 4 ? "a complex (eukaryotic) cell" : "archaeon — the host"}</text>

          {/* the passenger */}
          <g style={{ transition: "all 300ms var(--ease)" }}>
            <ellipse cx={pass.x} cy={pass.y} rx={pass.r * 1.25} ry={pass.r * 0.78}
              fill={stage >= 3 ? "#38bdf8" : "#4ade80"} opacity={0.85}
              stroke="#0b0d14" strokeWidth={1.2} />
            {/* inner cristae once it is a mitochondrion */}
            {stage >= 3 && [-0.5, 0, 0.5].map((f, i) => (
              <line key={i} x1={pass.x - pass.r * 0.9} y1={pass.y + f * pass.r * 0.5}
                x2={pass.x + pass.r * 0.9} y2={pass.y + f * pass.r * 0.5}
                stroke="#0b0d14" strokeWidth={1.6} opacity={0.55} />
            ))}
            <text x={pass.x} y={pass.y - pass.r - 10} textAnchor="middle" fontSize="12.5"
              fontFamily="Inter, sans-serif" fill={stage >= 3 ? "#38bdf8" : "#4ade80"}>
              {stage >= 3 ? "mitochondrion" : "bacterium — burns food with oxygen"}
            </text>
          </g>

          {/* engulfment arrow at stage 2 */}
          {stage === 1 && (
            <path d={`M ${cx + 150} ${cy - 6} L ${cx + 108} ${cy - 10}`} stroke="#ffffff" strokeWidth={2}
              markerEnd="url(#sym-arr)" />
          )}
          {/* energy handed over at stages 3+ */}
          {stage >= 2 && (
            <g>
              {[0, 1, 2].map((i) => (
                <line key={i} x1={pass.x - pass.r - 6} y1={pass.y - 12 + i * 12}
                  x2={pass.x - pass.r - 44} y2={pass.y - 16 + i * 12}
                  stroke="var(--c-solar)" strokeWidth={1.8} markerEnd="url(#sym-arr-y)" opacity={0.9} />
              ))}
              <text x={pass.x - pass.r - 56} y={pass.y + 34} textAnchor="end" fontSize="12"
                fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">energy →</text>
            </g>
          )}

          {/* the chloroplast footnote at the last stage */}
          {stage === 4 && (
            <g>
              <ellipse cx={cx + 250} cy={cy + 60} rx={30} ry={18} fill="#4ade80" opacity={0.8} />
              <text x={cx + 250} y={cy + 100} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#4ade80">
                in plants it happened again:
              </text>
              <text x={cx + 250} y={cy + 118} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#4ade80">
                a cyanobacterium → the chloroplast
              </text>
            </g>
          )}

          <defs>
            <marker id="sym-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
            </marker>
            <marker id="sym-arr-y" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--c-solar)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          stage {cur.n} · {cur.title}
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "5.4em" }}>
          {cur.body}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 items-center" style={{ flexShrink: 0 }}>
        {SYM.map((_, n) => (
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
        <span className="font-mono ml-2" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>
          ← / → the accident that built you
        </span>
      </div>

      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
    </FigurePanel>
  );
}

/* ── 6.2.b — Zooming into a chromosome ─────────────────────────────
   Six powers-of-ten steps from a whole cell down to the DNA double
   helix — a scale ladder, like the observable-universe scrubber of §0.3
   but pointed inward. The slider is the figure's only range input, so
   ←/→ and the fullscreen wheel drive it. */

type ZoomLevel = {
  name: string;
  size: string;
  color: string;
  body: ReactNode;
};

const ZOOM: ZoomLevel[] = [
  { name: "The cell", size: "about 20 micrometres — a fifth of a hair's width", color: "#f472b6",
    body: <>A single one of your cells. Everything that follows is packed inside the dark blob at its centre: the <strong>nucleus</strong>, the vault where the genetic library is kept.</> },
  { name: "A chromosome", size: "a few micrometres long", color: "#c4b5fd",
    body: <>When a cell is about to divide, its DNA winds up into these compact X-shaped bundles. You have 46 of them. Each is one immensely long molecule of DNA, wound up for transport.</> },
  { name: "Chromatin loops", size: "about 300 nanometres across", color: "#a78bfa",
    body: <>Unwind the bundle and it becomes a thick fibre thrown into loops. This is the packing problem being solved: your body must fit <strong>two metres</strong> of DNA into a nucleus a few millionths of a metre wide.</> },
  { name: "Beads on a string", size: "about 11 nanometres", color: "#8ab4f8",
    body: <>Unwind further and you find the trick: the DNA is wrapped around protein spools called <strong>histones</strong>, about one and two-thirds turns per spool. Each bead is a <strong>nucleosome</strong>.</> },
  { name: "The double helix", size: "2 nanometres wide", color: "#38bdf8",
    body: <>And here it is at last — the twisted ladder itself. Two strands winding around each other, held together by rungs. The width of this molecule is about one twenty-thousandth the width of a hair.</> },
  { name: "The letters", size: "the rungs of the ladder", color: "#4ade80",
    body: <>Each rung is a pair of chemical letters — <strong>A always pairs with T</strong>, and <strong>C always with G</strong>. That strict pairing is why the molecule can be copied: split it down the middle and each half specifies its own replacement. Heredity, in one geometric fact.</> },
];

export function DnaZoomPanel(): JSX.Element {
  const [level, setLevel] = useState(0);
  const cur = ZOOM[level];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 904, H = 400;
  const cx = 380, cy = 210;

  const scene = (l: number): JSX.Element => {
    if (l === 0) return (
      <g>
        <circle cx={cx} cy={cy} r={130} fill="#f472b6" opacity={0.09} stroke="#f472b6" strokeWidth={1.8} />
        <circle cx={cx - 10} cy={cy - 8} r={54} fill="#c4b5fd" opacity={0.35} stroke="#c4b5fd" strokeWidth={1.4} />
        <ellipse cx={cx + 76} cy={cy + 62} rx={22} ry={12} fill="#38bdf8" opacity={0.5} />
        <text x={cx - 10} y={cy - 4} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono, monospace" fill="#0b0d14">nucleus</text>
        <text x={cx + 76} y={cy + 90} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#38bdf8">mitochondrion</text>
      </g>
    );
    if (l === 1) return (
      <g>
        {[0, 1].map((s) => (
          <g key={s} transform={`translate(${cx + (s ? 26 : -26)} ${cy}) rotate(${s ? 14 : -14})`}>
            <rect x={-13} y={-108} width={26} height={216} rx={13} fill="#c4b5fd" opacity={0.85} />
          </g>
        ))}
        <circle cx={cx} cy={cy - 8} r={15} fill="#0b0d14" opacity={0.6} />
        <text x={cx + 130} y={cy - 60} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">two identical copies,</text>
        <text x={cx + 130} y={cy - 42} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">joined at the waist</text>
      </g>
    );
    if (l === 2) return (
      <g>
        <path d={`M ${cx - 150} ${cy} q 40 -80 80 0 q 40 80 80 0 q 40 -80 80 0`}
          fill="none" stroke="#a78bfa" strokeWidth={26} strokeLinecap="round" opacity={0.85} />
        <path d={`M ${cx - 150} ${cy} q 40 -80 80 0 q 40 80 80 0 q 40 -80 80 0`}
          fill="none" stroke="#0b0d14" strokeWidth={2} opacity={0.3} />
        <text x={cx} y={cy + 108} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
          two metres of DNA, folded into a few millionths of a metre
        </text>
      </g>
    );
    if (l === 3) return (
      <g>
        <path d={`M ${cx - 170} ${cy} h 340`} stroke="#8ab4f8" strokeWidth={3} opacity={0.6} />
        {[-140, -70, 0, 70, 140].map((dx) => (
          <g key={dx}>
            <circle cx={cx + dx} cy={cy} r={26} fill="#8ab4f8" opacity={0.9} />
            <ellipse cx={cx + dx} cy={cy} rx={30} ry={13} fill="none" stroke="#0b0d14" strokeWidth={2.4} opacity={0.6} />
          </g>
        ))}
        <text x={cx} y={cy + 76} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
          each bead: DNA wound around a protein spool (a histone)
        </text>
      </g>
    );
    if (l === 4) return (
      <g>
        {Array.from({ length: 2 }).map((_, s) => (
          <path key={s}
            d={Array.from({ length: 61 })
              .map((_, i) => {
                const t = i / 60;
                const x = cx - 170 + t * 340;
                const y = cy + 46 * Math.sin(t * Math.PI * 4 + (s ? Math.PI : 0));
                return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(" ")}
            fill="none" stroke="#38bdf8" strokeWidth={4} opacity={0.9} />
        ))}
        {Array.from({ length: 16 }).map((_, i) => {
          const t = (i + 0.5) / 16;
          const x = cx - 170 + t * 340;
          const y1 = cy + 46 * Math.sin(t * Math.PI * 4);
          const y2 = cy + 46 * Math.sin(t * Math.PI * 4 + Math.PI);
          return <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke="#e5e7eb" strokeWidth={1.6} opacity={0.55} />;
        })}
        <text x={cx} y={cy + 96} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
          the twisted ladder — 2 nanometres wide
        </text>
      </g>
    );
    return (
      <g>
        {[["A", "T", "#4ade80", 2], ["C", "G", "#f472b6", 3], ["T", "A", "#4ade80", 2], ["G", "C", "#f472b6", 3]].map(
          ([l1, l2, col, bonds], i) => {
            const y = cy - 90 + i * 62;
            return (
              <g key={i}>
                <rect x={cx - 172} y={y - 16} width={40} height={32} rx={5} fill={col as string} opacity={0.85} />
                <text x={cx - 152} y={y + 6} textAnchor="middle" fontSize="17" fontWeight={700}
                  fontFamily="JetBrains Mono, monospace" fill="#0b0d14">{l1 as string}</text>
                {Array.from({ length: bonds as number }).map((_, b) => (
                  <line key={b} x1={cx - 128} y1={y - 8 + b * 8} x2={cx + 128} y2={y - 8 + b * 8}
                    stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth={1.4} strokeDasharray="4 4" />
                ))}
                <rect x={cx + 132} y={y - 16} width={40} height={32} rx={5} fill={col as string} opacity={0.85} />
                <text x={cx + 152} y={y + 6} textAnchor="middle" fontSize="17" fontWeight={700}
                  fontFamily="JetBrains Mono, monospace" fill="#0b0d14">{l2 as string}</text>
                <text x={cx} y={y - 22} textAnchor="middle" fontSize="10.5" fontFamily="JetBrains Mono, monospace"
                  fill="rgb(var(--c-text-rgb) / 0.5)">{bonds} bonds</text>
              </g>
            );
          }
        )}
      </g>
    );
  };

  return (
    <FigurePanel
      idx="6.2.b"
      kicker="Zooming into a chromosome"
      caption={
        <>
          Six steps inward, from a whole cell to the chemical letters themselves — drag the slider or use the arrow
          keys. The problem being solved on the way down is packing: two metres of DNA must fit inside a nucleus a few
          millionths of a metre across, and still be readable. At the bottom is the fact that makes heredity possible —
          A only ever pairs with T, and C only ever with G.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 42% 52%, #16121f 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Zoom level ${level + 1}: ${cur.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={34} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill={cur.color}>
            ZOOM {level + 1} / 6
          </text>
          <text x={24} y={60} fontSize="19" fontWeight={650} fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.92)">
            {cur.name}
          </text>
          <text x={24} y={82} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            {cur.size}
          </text>

          {scene(level)}

          {/* scale ladder on the right */}
          {ZOOM.map((z, i) => (
            <g key={z.name} style={{ cursor: "pointer" }} onClick={() => setLevel(i)}>
              <rect x={700} y={110 + i * 34} width={180} height={26} rx={5}
                fill={i === level ? z.color : "rgb(var(--c-text-rgb) / 0.05)"}
                opacity={i === level ? 0.9 : 1}
                stroke={i === level ? "#ffffff" : "rgb(var(--c-text-rgb) / 0.12)"} strokeWidth={i === level ? 1.6 : 1} />
              <text x={712} y={128 + i * 34} fontSize="12" fontFamily="Inter, sans-serif" fontWeight={i === level ? 700 : 500}
                fill={i === level ? "#0b0d14" : "rgb(var(--c-text-rgb) / 0.75)"}>{z.name}</text>
            </g>
          ))}
          <text x={790} y={100} textAnchor="middle" fontSize="11.5" letterSpacing="1.5"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            ZOOMING IN ↓
          </text>
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          the cell
        </span>
        <input type="range" min={0} max={5} step={1} value={level}
          onChange={(e) => setLevel(Number(e.currentTarget.value))}
          aria-label="Zoom level" style={{ width: "100%" }} />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          the letters
        </span>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${cur.color}66`,
        boxShadow: `inset 0 0 0 1px ${cur.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: cur.color, fontSize: sz(0.72) ?? "12px" }}>
          {cur.name} · {cur.size}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.2em" }}>
          {cur.body}
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 6.2.c — Two billion years in seven acts ───────────────────────
   From the first complex cell to us. Each act is selectable (←/→ or
   1–7); the strip shows where you are in deep time, and the stage
   fills with the life of that moment. Dates are the standard ones from
   the geological time scale. */

type Act = {
  id: string;
  name: string;
  when: string;
  /** midpoint in millions of years ago, for the timeline dot */
  ma: number;
  color: string;
  cast: string[];
  body: ReactNode;
};

const ACTS: Act[] = [
  { id: "euk", name: "The complex cell", when: "about 1.8 billion years ago", ma: 1800, color: "#c4b5fd",
    cast: ["complex cells"],
    body: <>The first cells with a nucleus — the eukaryotes of the previous figure. And then… almost nothing, for a billion years. This is the great pause in the history of life, and the oxygen record of <em>§5.2</em> shows the same flat stretch. Complexity had arrived, but the world was not yet rich enough to spend it.</> },
  { id: "multi", name: "Many cells, one body", when: "about 1 billion years ago", ma: 1000, color: "#a78bfa",
    cast: ["algae", "colonies"],
    body: <>Cells begin sticking together and specialising — some feed, some anchor, some reproduce. Multicellular life is not one invention but many: it has evolved independently dozens of times, in algae, plants, fungi, and animals.</> },
  { id: "cambrian", name: "The Cambrian explosion", when: "about 539 million years ago", ma: 530, color: "#38bdf8",
    cast: ["trilobites", "shells", "eyes"],
    body: <>Suddenly — in perhaps twenty million years, an eyeblink in this story — the fossil record fills with animals: shells, legs, jaws, and the first <strong>eyes</strong>. Almost every basic body plan alive today appears in this window. The rising oxygen of <em>§5.2</em> is the leading suspect: animals are expensive, and the world could finally afford them.</> },
  { id: "land", name: "Life crawls out of the sea", when: "about 470 to 400 million years ago", ma: 440, color: "#4ade80",
    cast: ["plants", "arthropods"],
    body: <>Plants colonise the bare rock, followed by arthropods — the ancestors of insects and spiders. None of this is possible without the <strong>ozone layer</strong>, built from the oxygen life had been exhaling for two billion years. Life made the shield that let it leave the water.</> },
  { id: "vert", name: "Backbones on land", when: "about 390 to 300 million years ago", ma: 350, color: "#fbbf24",
    cast: ["amphibians", "reptiles", "forests"],
    body: <>Fish with sturdy fins haul themselves ashore and become amphibians; amphibians become reptiles, which lay eggs that need no pond and so break free of the water entirely. Vast forests grow — and their buried remains become the coal we burn today.</> },
  { id: "meso", name: "The age of dinosaurs", when: "252 to 66 million years ago", ma: 160, color: "#f0a35e",
    cast: ["dinosaurs", "mammals", "birds", "flowers"],
    body: <>After the worst extinction in Earth's history (<em>§6.3</em>) empties the world, the dinosaurs inherit it and rule for 180 million years. In their shadow, two quiet innovations: the first small <strong>mammals</strong>, and the first <strong>flowers</strong>. Birds are dinosaurs, and are still with us.</> },
  { id: "ceno", name: "The age of mammals", when: "the last 66 million years", ma: 30, color: "#f472b6",
    cast: ["mammals", "primates", "humans"],
    body: <>An asteroid ends the dinosaurs, and the mammals — small, unpromising, and lucky — inherit the wreckage. Sixty-six million years later, one branch of one lineage of primates is reading a sentence about it. Our whole story is the last hundredth of this figure.</> },
];

export function ActsPanel(): JSX.Element {
  const [idx, setIdx] = useState(2);
  const cur = ACTS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(ACTS.length - 1, i + d)));

  const W = 904, H = 420;
  const L = 60, Rm = 40, tY = 92;
  /* log time axis: 2,000 Ma → 10 Ma */
  const lg = Math.log10;
  const xOf = (ma: number) => L + ((lg(2200) - lg(Math.max(10, ma))) / (lg(2200) - lg(10))) * (W - L - Rm);

  return (
    <FigurePanel
      idx="6.2.c"
      kicker="Two billion years in seven acts"
      caption={
        <>
          From the first complex cell to us — step through with the arrow keys. The timeline across the top is
          logarithmic, which is the only honest way to draw this: the first act lasts a billion years and the last one
          is a rounding error. Notice how late everything you would recognise as "life" arrives — animals, land, and
          us all crowd into the final tenth of the story.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 60%, #0f1a17 0%, #0a0d12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Act ${idx + 1} of 7: ${cur.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={34} fontSize="14" letterSpacing="3" fontFamily="JetBrains Mono, monospace" fill={cur.color}>
            ACT {idx + 1} OF 7
          </text>
          <text x={24} y={60} fontSize="20" fontWeight={650} fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.92)">
            {cur.name}
          </text>
          <text x={W - 24} y={34} textAnchor="end" fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            {cur.when}
          </text>

          {/* the timeline */}
          <line x1={L} y1={tY} x2={W - Rm} y2={tY} stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth={1.4} />
          {[2000, 1000, 500, 250, 100, 50, 10].map((t) => (
            <g key={t}>
              <line x1={xOf(t)} y1={tY - 5} x2={xOf(t)} y2={tY + 5} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1} />
              <text x={xOf(t)} y={tY + 22} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.5)">{t >= 1000 ? `${t / 1000} Ga` : `${t} Ma`}</text>
            </g>
          ))}
          {ACTS.map((a, i) => (
            <g key={a.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
              <circle cx={xOf(a.ma)} cy={tY} r={i === idx ? 9 : 5}
                fill={i === idx ? a.color : "rgb(var(--c-text-rgb) / 0.35)"}
                stroke="#0b0d14" strokeWidth={1.4} />
              <circle cx={xOf(a.ma)} cy={tY} r={16} fill="transparent" />
            </g>
          ))}

          {/* the stage: silhouettes of the cast, drawn simply */}
          <line x1={40} y1={352} x2={W - 40} y2={352} stroke="rgb(var(--c-text-rgb) / 0.25)" strokeWidth={1.4} />
          {cur.cast.map((c, i) => {
            const n = cur.cast.length;
            const x = W / 2 - ((n - 1) * 150) / 2 + i * 150;
            const y = 352;
            return (
              <g key={c}>
                {/* a simple, honest schematic per cast member */}
                {c === "complex cells" && <><circle cx={x} cy={y - 40} r={30} fill={cur.color} opacity={0.35} stroke={cur.color} strokeWidth={1.6} /><circle cx={x - 6} cy={y - 44} r={12} fill={cur.color} opacity={0.8} /></>}
                {c === "algae" && <><path d={`M ${x} ${y} q -14 -40 0 -70 q 14 30 0 70`} fill={cur.color} opacity={0.7} /><path d={`M ${x - 18} ${y} q -6 -30 4 -52`} fill="none" stroke={cur.color} strokeWidth={4} /></>}
                {c === "colonies" && [0, 1, 2, 3].map((k) => <circle key={k} cx={x - 18 + (k % 2) * 26} cy={y - 30 - Math.floor(k / 2) * 26} r={12} fill={cur.color} opacity={0.7} />)}
                {c === "trilobites" && <><ellipse cx={x} cy={y - 24} rx={30} ry={18} fill={cur.color} opacity={0.85} /><path d={`M ${x - 30} ${y - 24} h 60`} stroke="#0b0d14" strokeWidth={2} /><circle cx={x - 12} cy={y - 30} r={3} fill="#0b0d14" /><circle cx={x + 12} cy={y - 30} r={3} fill="#0b0d14" /></>}
                {c === "shells" && <path d={`M ${x - 26} ${y} q 26 -54 52 0 z`} fill={cur.color} opacity={0.8} />}
                {c === "eyes" && <><circle cx={x} cy={y - 30} r={20} fill="#e5e7eb" opacity={0.9} /><circle cx={x} cy={y - 30} r={9} fill="#0b0d14" /></>}
                {c === "plants" && <><rect x={x - 3} y={y - 60} width={6} height={60} fill={cur.color} /><path d={`M ${x} ${y - 46} q -26 -6 -30 -26 q 26 2 30 26`} fill={cur.color} opacity={0.8} /><path d={`M ${x} ${y - 32} q 26 -6 30 -26 q -26 2 -30 26`} fill={cur.color} opacity={0.8} /></>}
                {c === "arthropods" && <><ellipse cx={x} cy={y - 22} rx={22} ry={11} fill={cur.color} opacity={0.85} />{[-14, -4, 6, 16].map((dx) => <line key={dx} x1={x + dx} y1={y - 14} x2={x + dx - 6} y2={y} stroke={cur.color} strokeWidth={2.4} />)}</>}
                {c === "amphibians" && <><ellipse cx={x} cy={y - 20} rx={26} ry={13} fill={cur.color} opacity={0.85} /><circle cx={x + 24} cy={y - 26} r={9} fill={cur.color} opacity={0.9} /><line x1={x - 14} y1={y - 10} x2={x - 20} y2={y} stroke={cur.color} strokeWidth={3} /><line x1={x + 10} y1={y - 10} x2={x + 16} y2={y} stroke={cur.color} strokeWidth={3} /></>}
                {c === "reptiles" && <><ellipse cx={x} cy={y - 22} rx={30} ry={11} fill={cur.color} opacity={0.85} /><path d={`M ${x - 30} ${y - 22} q -18 -2 -26 6`} stroke={cur.color} strokeWidth={3} fill="none" /><circle cx={x + 30} cy={y - 26} r={8} fill={cur.color} /></>}
                {c === "forests" && <><rect x={x - 4} y={y - 66} width={8} height={66} fill={cur.color} opacity={0.9} /><circle cx={x} cy={y - 72} r={22} fill={cur.color} opacity={0.6} /></>}
                {c === "dinosaurs" && <><path d={`M ${x - 34} ${y} q 6 -30 22 -34 q 10 -26 26 -16 q 16 8 6 26 q 14 10 8 24 z`} fill={cur.color} opacity={0.9} /><circle cx={x + 16} cy={y - 44} r={3} fill="#0b0d14" /></>}
                {c === "mammals" && <><ellipse cx={x} cy={y - 22} rx={24} ry={14} fill={cur.color} opacity={0.85} /><circle cx={x + 22} cy={y - 32} r={10} fill={cur.color} /><path d={`M ${x + 16} ${y - 42} l 4 -8 l 5 8`} fill={cur.color} /><line x1={x - 24} y1={y - 22} x2={x - 36} y2={y - 32} stroke={cur.color} strokeWidth={3} /></>}
                {c === "birds" && <><ellipse cx={x} cy={y - 30} rx={18} ry={11} fill={cur.color} opacity={0.85} /><path d={`M ${x - 16} ${y - 34} q 16 -22 34 -6`} fill="none" stroke={cur.color} strokeWidth={3} /><path d={`M ${x + 18} ${y - 32} l 12 -3 l -12 -3 z`} fill={cur.color} /></>}
                {c === "flowers" && <><rect x={x - 2} y={y - 44} width={4} height={44} fill="#4ade80" /><circle cx={x} cy={y - 50} r={8} fill="#fde68a" />{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={x + 13 * Math.cos((a * Math.PI) / 180)} cy={y - 50 + 13 * Math.sin((a * Math.PI) / 180)} rx={7} ry={5} fill={cur.color} opacity={0.9} transform={`rotate(${a} ${x + 13 * Math.cos((a * Math.PI) / 180)} ${y - 50 + 13 * Math.sin((a * Math.PI) / 180)})`} />)}</>}
                {c === "primates" && <><circle cx={x} cy={y - 46} r={14} fill={cur.color} opacity={0.9} /><ellipse cx={x} cy={y - 18} rx={13} ry={18} fill={cur.color} opacity={0.85} /><line x1={x - 12} y1={y - 24} x2={x - 24} y2={y - 6} stroke={cur.color} strokeWidth={4} /><line x1={x + 12} y1={y - 24} x2={x + 24} y2={y - 6} stroke={cur.color} strokeWidth={4} /></>}
                {c === "humans" && <><circle cx={x} cy={y - 52} r={10} fill="#e5e7eb" /><line x1={x} y1={y - 42} x2={x} y2={y - 16} stroke="#e5e7eb" strokeWidth={4} /><line x1={x - 12} y1={y - 34} x2={x + 12} y2={y - 34} stroke="#e5e7eb" strokeWidth={3.4} /><line x1={x} y1={y - 16} x2={x - 9} y2={y} stroke="#e5e7eb" strokeWidth={3.4} /><line x1={x} y1={y - 16} x2={x + 9} y2={y} stroke="#e5e7eb" strokeWidth={3.4} /></>}
                <text x={x} y={y + 22} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
                  fill="rgb(var(--c-text-rgb) / 0.72)">{c}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)",
        border: `1px solid ${cur.color}66`,
        boxShadow: `inset 0 0 0 1px ${cur.color}22`,
        padding: "12px 14px", flexShrink: 0,
        transition: "border-color 220ms var(--ease)",
      }}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: cur.color, fontSize: sz(0.72) ?? "12px" }}>
          {cur.name} · {cur.when}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "5.4em" }}>
          {cur.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {ACTS.map((a, i) => (
          <button key={a.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {a.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
