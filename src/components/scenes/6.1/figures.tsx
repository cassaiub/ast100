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

/* ── 6.1.a — The tree of life ───────────────────────────────────────
   A radial tree rooted at LUCA, with the three domains as sectors.
   Branch counts follow Hug et al. 2016 ("A new view of the tree of
   life"): bacteria overwhelmingly dominate the diversity, and the
   animals-plants-fungi we think of as "life" are one thin twig.

   Every named group is clickable (fat invisible hit-wedges); labels sit
   in reserved slots around the rim so they can never collide. ←/→ walk
   the groups; 1–8 jump. No continuous animation. */

type Clade = {
  id: string;
  name: string;
  domain: "Bacteria" | "Archaea" | "Eukarya";
  color: string;
  /** angular span on the radial tree, degrees */
  a0: number; a1: number;
  /** how many phyla / groups this wedge stands for */
  size: string;
  body: ReactNode;
};

/* Angles: bacteria own the largest sector (they dominate the real tree),
   archaea a moderate one, eukaryotes a genuinely tiny one. */
const CLADES: Clade[] = [
  { id: "cpr", name: "Candidate Phyla Radiation", domain: "Bacteria", color: "#a78bfa", a0: 182, a1: 250,
    size: "dozens of phyla — almost none ever grown in a lab",
    body: <>The biggest surprise in modern biology. An enormous branch of tiny bacteria with stripped-down genomes, most of them living attached to other microbes. We know they exist only because we can now read DNA straight out of mud and water — nobody has ever cultivated most of them.</> },
  { id: "proteo", name: "Proteobacteria", domain: "Bacteria", color: "#38bdf8", a0: 250, a1: 292,
    size: "one of the largest bacterial groups",
    body: <>The group that includes <em>E. coli</em>, and — crucially for this chapter — the free-living ancestor that was swallowed by another cell and became the <strong>mitochondrion</strong>, the power plant inside every one of your cells.</> },
  { id: "cyano", name: "Cyanobacteria", domain: "Bacteria", color: "#4ade80", a0: 292, a1: 316,
    size: "one phylum — with an outsized legacy",
    body: <>The microbes that invented oxygen-releasing photosynthesis and rebuilt the atmosphere (<em>§5.2</em>). Swallowed by another cell, one of them became the <strong>chloroplast</strong> — which is why every plant on Earth is running captured bacteria.</> },
  { id: "otherbact", name: "All other bacteria", domain: "Bacteria", color: "#22d3ee", a0: 316, a1: 360,
    size: "dozens more phyla",
    body: <>Bacteria dominate the tree of life so completely that everything you can see with your eyes is a rounding error beside them. They fill the soil, the sea, the rock kilometres beneath your feet, and the inside of your body.</> },
  { id: "tack", name: "TACK archaea", domain: "Archaea", color: "#fbbf24", a0: 96, a1: 140,
    size: "several phyla",
    body: <>Archaea look like bacteria under a microscope but are chemically a different world — different membranes, different machinery. Many live in extreme places: boiling springs, salt lakes, acid.</> },
  { id: "asgard", name: "Asgard archaea", domain: "Archaea", color: "#f0a35e", a0: 140, a1: 182,
    size: "a handful of groups — and our closest microbial relatives",
    body: <>The branch that changed the shape of the tree. These archaea carry genes previously thought to be uniquely eukaryotic — and the best current evidence says <strong>we grew out of this branch</strong>. You are, in a deep sense, a kind of archaeon that swallowed a bacterium.</> },
  { id: "othereuk", name: "Other eukaryotes", domain: "Eukarya", color: "#c4b5fd", a0: 60, a1: 96,
    size: "most of eukaryotic diversity",
    body: <>Amoebae, algae, ciliates, slime moulds — the vast majority of complex-celled life, all of it microscopic, all of it ignored by everyone but biologists. Eukaryotic diversity is mostly <em>not</em> animals.</> },
  { id: "apf", name: "Animals, plants, fungi", domain: "Eukarya", color: "#f472b6", a0: 40, a1: 60,
    size: "three groups — everything you have ever seen",
    body: <>Here is the humbling part. Every animal, every plant, every mushroom — the entire visible living world, including you — occupies this one thin sliver of the tree. Life on Earth is overwhelmingly microbial, and always has been.</> },
];

const DOMAIN_COLORS: Record<string, string> = { Bacteria: "#38bdf8", Archaea: "#fbbf24", Eukarya: "#f472b6" };

export function TreePanel(): JSX.Element {
  /* Start on the Asgard archaea — the branch we grew out of. (Deliberately
     not the last item, so the very first ArrowRight has somewhere to go.) */
  const [idx, setIdx] = useState(5);
  const sel = CLADES[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(CLADES.length - 1, i + d)));

  const W = 904, H = 620;
  const cx = 452, cy = 330;
  const R0 = 34, R1 = 210;           // root radius → tip radius
  const rad = (d: number) => (d * Math.PI) / 180;
  const pt = (r: number, a: number) => ({ x: cx + r * Math.cos(rad(a)), y: cy + r * Math.sin(rad(a)) });

  /* a wedge path between two radii and two angles */
  const wedge = (r0: number, r1: number, a0: number, a1: number) => {
    const p1 = pt(r0, a0), p2 = pt(r1, a0), p3 = pt(r1, a1), p4 = pt(r0, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r1} ${r1} 0 ${large} 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r0} ${r0} 0 ${large} 0 ${p1.x} ${p1.y} Z`;
  };

  return (
    <FigurePanel
      idx="6.1.a"
      kicker="The tree of life"
      fitFs
      caption={
        <>
          Every living thing, on one tree, rooted at the common ancestor in the centre. Click a branch — or walk them
          with the arrow keys. The proportions are the point: <strong>bacteria</strong> (blue) dominate the diversity of
          life, <strong>archaea</strong> (gold) hold their own, and everything you have ever <em>seen</em> — every
          animal, plant, and fungus — is the thin pink sliver. Note also where the eukaryotes attach: not as a third
          trunk, but growing out from among the archaea.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 53%, #0f1a17 0%, #0a0d12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Radial tree of life; ${sel.name} selected`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* domain arcs (outermost ring) */}
          {(["Bacteria", "Archaea", "Eukarya"] as const).map((d) => {
            const ws = CLADES.filter((c) => c.domain === d);
            const a0 = Math.min(...ws.map((c) => c.a0));
            const a1 = Math.max(...ws.map((c) => c.a1));
            const mid = (a0 + a1) / 2;
            const lp = pt(R1 + 58, mid);
            return (
              <g key={d}>
                <path d={wedge(R1 + 12, R1 + 26, a0 + 1, a1 - 1)} fill={DOMAIN_COLORS[d]} opacity={0.55} />
                <text x={lp.x} y={lp.y} textAnchor="middle" fontSize="17" fontWeight={700}
                  fontFamily="Inter, sans-serif" fill={DOMAIN_COLORS[d]}>{d}</text>
                <text x={lp.x} y={lp.y + 19} textAnchor="middle" fontSize="11.5"
                  fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
                  {d === "Bacteria" ? "most of life's diversity" : d === "Archaea" ? "and our own ancestry" : "including us"}
                </text>
              </g>
            );
          })}

          {/* clade wedges */}
          {CLADES.map((c, i) => {
            const on = i === idx;
            const mid = (c.a0 + c.a1) / 2;
            const lp = pt(R1 - 46, mid);
            return (
              <g key={c.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <path d={wedge(R0, R1, c.a0 + 0.8, c.a1 - 0.8)} fill={c.color}
                  opacity={on ? 0.9 : 0.32}
                  stroke={on ? "#ffffff" : "rgb(0 0 0 / 0.3)"} strokeWidth={on ? 2.2 : 0.8}
                  style={{ transition: "opacity 200ms var(--ease)" }} />
                {/* branch ticks — a hint of the many lineages inside each wedge */}
                {Array.from({ length: Math.max(3, Math.round((c.a1 - c.a0) / 6)) }).map((_, k, arr) => {
                  const a = c.a0 + ((k + 0.5) / arr.length) * (c.a1 - c.a0);
                  const p0 = pt(R0 + 6, a), p1 = pt(R1 - 4, a);
                  return <line key={k} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
                    stroke="rgb(0 0 0 / 0.35)" strokeWidth={0.8} />;
                })}
                <text x={lp.x} y={lp.y} textAnchor="middle" fontSize={on ? 13.5 : 12}
                  fontWeight={on ? 700 : 500} fontFamily="Inter, sans-serif"
                  fill={on ? "#0b0d14" : "rgb(0 0 0 / 0.75)"}
                  style={{ pointerEvents: "none" }}>
                  {c.name.length > 22 ? c.name.split(" ")[0] : c.name}
                </text>
              </g>
            );
          })}

          {/* the root */}
          <circle cx={cx} cy={cy} r={R0} fill="#0b0d14" stroke="#e5e7eb" strokeWidth={2} />
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="15" fontWeight={700}
            fontFamily="Inter, sans-serif" fill="#e5e7eb">LUCA</text>
          <text x={cx} y={cy + 15} textAnchor="middle" fontSize="9.5"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">~4.2 Ga</text>

          {/* the endosymbiosis arrows — where our cell came from */}
          {(() => {
            const from1 = pt(R1 - 20, 304);         // cyanobacteria
            const from2 = pt(R1 - 20, 270);         // proteobacteria
            const to = pt(R1 - 20, 52);             // animals/plants/fungi
            return (
              <g opacity={0.85}>
                <path d={`M ${from2.x} ${from2.y} Q ${cx + 300} ${cy - 250} ${to.x + 10} ${to.y + 12}`}
                  fill="none" stroke="#38bdf8" strokeWidth={1.6} strokeDasharray="6 5" markerEnd="url(#tree-arr-b)" />
                <path d={`M ${from1.x} ${from1.y} Q ${cx + 340} ${cy - 180} ${to.x + 22} ${to.y + 26}`}
                  fill="none" stroke="#4ade80" strokeWidth={1.6} strokeDasharray="6 5" markerEnd="url(#tree-arr-g)" />
                <text x={22} y={H - 42} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#38bdf8">
                  → a swallowed bacterium became the mitochondrion
                </text>
                <text x={22} y={H - 22} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#4ade80">
                  → a swallowed cyanobacterium became the chloroplast
                </text>
              </g>
            );
          })()}

          <defs>
            <marker id="tree-arr-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
            <marker id="tree-arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
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
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
            {sel.name}
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.6)", fontSize: sz(0.6) ?? "10.5px" }}>
            domain {sel.domain} · {sel.size}
          </span>
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
        {CLADES.map((c, i) => (
          <button key={c.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {c.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 6.1.b — What every living thing shares ────────────────────────
   Four universal features, shown side by side across a bacterium, an
   archaeon, and a human cell. The point of the figure is that the three
   columns are identical in the ways that matter — which is the evidence
   for common descent. ←/→ walk the features. */

type Universal = {
  id: string;
  name: string;
  color: string;
  detail: string;
  body: ReactNode;
};

const UNIVERSALS: Universal[] = [
  { id: "dna", name: "The same four letters", color: "#38bdf8",
    detail: "A · T · C · G — in bacteria, in oak trees, in you",
    body: <>All genetic information on Earth is written in the same four-letter chemical alphabet. Not a similar one — the <em>same</em> one. There is no chemical reason it had to be these four; it is a frozen accident, inherited.</> },
  { id: "code", name: "The same genetic code", color: "#c4b5fd",
    detail: "the same three letters mean the same thing everywhere",
    body: <>Three letters of DNA spell one amino acid — and the dictionary is (very nearly) identical in every organism ever sequenced. This is why a human gene can be pasted into a bacterium and still work. A shared dictionary means a shared ancestor.</> },
  { id: "ribosome", name: "The same protein factory", color: "#fbbf24",
    detail: "the ribosome — so alike across life it can be used as a clock",
    body: <>Every cell builds its proteins on a ribosome, and ribosomes are so similar across all of life that comparing them is how the tree in the previous figure was built in the first place.</> },
  { id: "atp", name: "The same energy currency", color: "#4ade80",
    detail: "protons pumped across a membrane — the vent's trick, still running",
    body: <>Every living thing powers itself by pumping protons across a membrane and letting them flow back through a molecular turbine — the very trick the rock was doing for free at the alkaline vents of <em>§5.3</em>. Life never stopped using it.</> },
];

const CELLS = [
  { id: "bact", name: "Bacterium", color: "#38bdf8" },
  { id: "arch", name: "Archaeon", color: "#fbbf24" },
  { id: "euk", name: "Your cell", color: "#f472b6" },
];

export function UniversalPanel(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const sel = UNIVERSALS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(UNIVERSALS.length - 1, i + d)));

  const W = 904, H = 400;
  const colX = [180, 452, 724];

  return (
    <FigurePanel
      idx="6.1.b"
      kicker="What every living thing shares"
      caption={
        <>
          Three cells that could hardly look more different — a bacterium, an archaeon, and one of yours — compared on
          the things that actually matter. Step through the four universal features with the arrow keys. Every one of
          them is <em>identical</em> across all three, and there is no chemical necessity that it should be. That is the
          evidence that everything alive is descended from one cell.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 45%, #121320 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Universal feature of all life: ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={W / 2} y={34} textAnchor="middle" fontSize="15" letterSpacing="2"
            fontFamily="JetBrains Mono, monospace" fill={sel.color}>
            {sel.name.toUpperCase()}
          </text>
          <text x={W / 2} y={56} textAnchor="middle" fontSize="12.5"
            fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            {sel.detail}
          </text>

          {CELLS.map((c, ci) => {
            const x = colX[ci];
            return (
              <g key={c.id}>
                {/* the cell */}
                {ci === 2 ? (
                  <g>
                    <circle cx={x} cy={200} r={72} fill={c.color} opacity={0.1} stroke={c.color} strokeWidth={1.6} />
                    <circle cx={x} cy={200} r={30} fill={c.color} opacity={0.25} stroke={c.color} strokeWidth={1.2} />
                    <ellipse cx={x + 44} cy={232} rx={17} ry={9} fill="#38bdf8" opacity={0.55} />
                    <text x={x} y={204} textAnchor="middle" fontSize="10.5" fontFamily="JetBrains Mono, monospace"
                      fill="rgb(var(--c-text-rgb) / 0.75)">nucleus</text>
                  </g>
                ) : (
                  <ellipse cx={x} cy={200} rx={62} ry={44} fill={c.color} opacity={0.12}
                    stroke={c.color} strokeWidth={1.6} />
                )}
                <text x={x} y={296} textAnchor="middle" fontSize="15" fontWeight={650}
                  fontFamily="Inter, sans-serif" fill={c.color}>{c.name}</text>

                {/* the shared feature, drawn identically in all three */}
                {sel.id === "dna" && (
                  <g>
                    {["A", "T", "C", "G"].map((l, i) => (
                      <text key={l} x={x - 34 + i * 23} y={196} textAnchor="middle" fontSize="16" fontWeight={700}
                        fontFamily="JetBrains Mono, monospace" fill={sel.color}>{l}</text>
                    ))}
                  </g>
                )}
                {sel.id === "code" && (
                  <g>
                    <text x={x} y={188} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono, monospace" fill={sel.color}>AUG → Met</text>
                    <text x={x} y={208} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono, monospace" fill={sel.color}>GGA → Gly</text>
                    <text x={x} y={228} textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono, monospace" fill={sel.color}>UUU → Phe</text>
                  </g>
                )}
                {sel.id === "ribosome" && (
                  <g>
                    <circle cx={x} cy={196} r={15} fill={sel.color} opacity={0.9} />
                    <circle cx={x} cy={186} r={9} fill="#0b0d14" opacity={0.5} />
                    <line x1={x - 40} y1={210} x2={x + 40} y2={210} stroke={sel.color} strokeWidth={2} />
                    <text x={x} y={236} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace"
                      fill="rgb(var(--c-text-rgb) / 0.6)">ribosome</text>
                  </g>
                )}
                {sel.id === "atp" && (
                  <g>
                    {[0, 1, 2].map((i) => (
                      <line key={i} x1={x - 30} y1={182 + i * 18} x2={x + 24} y2={182 + i * 18}
                        stroke={sel.color} strokeWidth={2} markerEnd="url(#u-arr)" />
                    ))}
                    <text x={x} y={248} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace"
                      fill="rgb(var(--c-text-rgb) / 0.6)">H⁺ across a membrane</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* equals signs between the columns — the whole argument in two glyphs */}
          <text x={(colX[0] + colX[1]) / 2} y={208} textAnchor="middle" fontSize="30" fontWeight={300}
            fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.55)">=</text>
          <text x={(colX[1] + colX[2]) / 2} y={208} textAnchor="middle" fontSize="30" fontWeight={300}
            fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.55)">=</text>

          <text x={W / 2} y={352} textAnchor="middle" fontSize="13.5" fontFamily="Inter, sans-serif"
            fill="rgb(var(--c-text-rgb) / 0.75)">
            identical in all three — and there is no chemical reason it had to be
          </text>

          <defs>
            <marker id="u-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
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
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.2em" }}>
          {sel.body}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {UNIVERSALS.map((u, i) => (
          <button key={u.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {u.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
