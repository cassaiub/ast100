import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* Shared figure shell — mirrors the 0.4 / 1.2 pattern. `fitFs` caps the viz in
   fullscreen for content-heavy panels so the whole figure fits with no crop. */
function FigurePanel({
  idx,
  kicker,
  caption,
  children,
  fitFs = false,
}: {
  idx: string;
  kicker: string;
  caption: ReactNode;
  children: ReactNode;
  fitFs?: boolean;
}) {
  return (
    <figure data-fade className={`figure-stub my-12 rounded-md p-4 md:p-6${fitFs ? " is-fs-fit" : ""}`}>
      <div className="figure-body">{children}</div>
      <figcaption>
        <span className="figure-tag">Fig. {idx}</span>
        <span className="figure-title"> — {kicker}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
}

/* Tracks `.is-fs` on the enclosing FigureFrame so HTML control/detail text can
   scale up in fullscreen (the SVG scales with its viewBox; fixed-px HTML would
   stay tiny). Same MutationObserver pattern as 1.2 / 0.4. */
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

/* Off-screen real <button> for keyboard hooks FigureFrame drives via .click(). */
const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

/* Particle colours — up quark teal, down quark violet (both theme-aware);
   protons teal, neutrons a neutral grey, helium-4 amber. */
const UP = "rgb(var(--c-accent-rgb))";
const DOWN = "rgb(var(--c-nebula-rgb))";
const PROTON = "rgb(var(--c-accent-rgb))";
const NEUTRON_FILL = "rgb(var(--c-text-rgb) / 0.12)";
const NEUTRON_STROKE = "rgb(var(--c-text-rgb) / 0.5)";
const HE = "rgb(var(--c-solar-rgb))";

/* A single nucleon disc (proton or neutron). */
function nucleon(x: number, y: number, kind: "p" | "n", r: number, key: string) {
  return (
    <g key={key}>
      <circle cx={x} cy={y} r={r} fill={kind === "p" ? PROTON : NEUTRON_FILL} stroke={kind === "p" ? "none" : NEUTRON_STROKE} strokeWidth={kind === "p" ? 0 : 2.5} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontStyle="italic" fontFamily="var(--font-serif)" fill={kind === "p" ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.85)"}>
        {kind}
      </text>
    </g>
  );
}

/* Packed positions for a cluster of n nucleons around (cx, cy). */
function clusterPos(n: number, cx: number, cy: number, d = 24): [number, number][] {
  if (n <= 1) return [[cx, cy]];
  if (n === 2) return [[cx - d, cy], [cx + d, cy]];
  if (n === 3) return [[cx, cy - d], [cx - d, cy + d * 0.72], [cx + d, cy + d * 0.72]];
  return [[cx - d, cy - d], [cx + d, cy - d], [cx - d, cy + d], [cx + d, cy + d]];
}

/* ── 1.3.a · Protons & neutrons are trios of quarks ─────────────────── */
type PN = "p" | "n" | "decay";
const PN_DATA: Record<PN, { name: string; quarks: ("u" | "d")[]; charge: string; note: string }> = {
  p: {
    name: "Proton",
    quarks: ["u", "u", "d"],
    charge: "+1",
    note: "Two up quarks and one down, glued together by the strong force (§1.1). Their charges add to +1 — and a lone proton is simply the nucleus of a hydrogen atom, the lightest element.",
  },
  n: {
    name: "Neutron",
    quarks: ["u", "d", "d"],
    charge: "0",
    note: "One up quark and two downs. The charges cancel exactly, so a neutron is electrically neutral — and it is a whisker heavier than a proton, which turns out to matter enormously.",
  },
  decay: {
    name: "A lone neutron decays",
    quarks: ["u", "d", "d"],
    charge: "0 → +1",
    note: "Left on its own, a neutron lasts only about ten minutes. Through the weak force (§1.1) it turns into a proton, flinging out an electron and a neutrino. This slow leak is why the early Universe ends up with roughly seven protons for every neutron.",
  },
};

export function ProtonNeutronPanel() {
  const [sel, setSel] = useState<PN>("p");
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const cur = PN_DATA[sel];
  const order: PN[] = ["p", "n", "decay"];
  const W = 720;
  const H = 250;

  /* A quark trio inside a faint nucleon "bag". */
  const trio = (cx: number, cy: number, kinds: ("u" | "d")[], rq: number, spread: number) => {
    const pos: [number, number][] = [
      [cx, cy - spread],
      [cx - spread * 0.92, cy + spread * 0.62],
      [cx + spread * 0.92, cy + spread * 0.62],
    ];
    return (
      <>
        <circle cx={cx} cy={cy + 4} r={spread + rq + 4} fill="rgb(var(--c-text-rgb) / 0.04)" stroke="rgb(var(--c-text-rgb) / 0.16)" strokeWidth="1.5" />
        {kinds.map((k, i) => (
          <g key={i}>
            <circle cx={pos[i][0]} cy={pos[i][1]} r={rq} fill={k === "u" ? UP : DOWN} />
            <text x={pos[i][0]} y={pos[i][1] + 6} textAnchor="middle" fontSize="19" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-bg-rgb))">
              {k}
            </text>
          </g>
        ))}
      </>
    );
  };

  return (
    <FigurePanel
      idx="1.3.a"
      kicker="Protons & Neutrons — Three Quarks Apiece"
      caption="The building blocks of every atomic nucleus. A proton is two up quarks and one down (charges add to +1); a neutron is one up and two downs (they cancel to 0). The third card shows why a free neutron doesn't last — it decays into a proton — which leaves the early Universe with about seven protons for every neutron. Up quarks are teal, down quarks violet."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {sel !== "decay" && (
            <>
              {trio(W / 2, 112, cur.quarks, 27, 36)}
              <text x={W / 2} y={H - 24} textAnchor="middle" fontSize="14" letterSpacing="2" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.6)">
                {sel === "p" ? "PROTON" : "NEUTRON"} · charge {cur.charge}
              </text>
            </>
          )}
          {sel === "decay" && (
            <>
              {trio(150, 108, ["u", "d", "d"], 19, 25)}
              <text x={150} y={196} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">
                neutron
              </text>
              <text x={300} y={118} textAnchor="middle" fontSize="32" fill="rgb(var(--c-text-rgb) / 0.45)">→</text>
              {trio(450, 108, ["u", "u", "d"], 19, 25)}
              <text x={450} y={196} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="var(--c-accent)">
                proton
              </text>
              <circle cx={580} cy={96} r="15" fill="rgb(var(--c-text-rgb) / 0.85)" />
              <text x={580} y={101} textAnchor="middle" fontSize="13" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-bg-rgb))">e⁻</text>
              <text x={580} y={196} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">electron</text>
              <circle cx={662} cy={128} r="11" fill="none" stroke="rgb(var(--c-text-rgb) / 0.5)" strokeWidth="2" />
              <text x={662} y={196} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.5)">neutrino</text>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap" style={{ flexShrink: 0 }}>
        {order.map((k, i) => (
          <button
            key={k}
            type="button"
            onClick={() => setSel(k)}
            data-shortcut={String(i + 1)}
            aria-pressed={sel === k}
            className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${sel === k ? "is-active" : ""}`}
            style={{ fontSize: sz(0.62) }}
          >
            {k === "p" ? "proton" : k === "n" ? "neutron" : "neutron decay"}
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-md" style={{ background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)", flexShrink: 0 }}>
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: "var(--c-accent)", fontSize: sz(0.7) }}>
          {cur.name} · {cur.quarks.join(" ")} · charge {cur.charge}
        </div>
        <div className="text-[13px] text-white/85 leading-[1.6] font-sans min-h-[5.4em]" style={{ fontSize: sz(1) }}>
          {cur.note}
        </div>
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/45 mt-2 flex flex-wrap gap-x-4 gap-y-1" style={{ fontSize: sz(0.6) }}>
          <span><span style={{ color: UP }}>●</span> up quark</span>
          <span><span style={{ color: DOWN }}>●</span> down quark</span>
          <span className="text-white/35">click a card · ← / → to step</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 1.3.b · The deuterium bottleneck ───────────────────────────────── */
export function DeuteriumBottleneckPanel() {
  const [cool, setCool] = useState(0.18); // 0 = hottest, 1 = coolest
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const T = Math.pow(10, 10 - 2 * cool); // 10^10 K (hot) → 10^8 K (cool)
  const survives = T < 1e9;
  const Ttext = T >= 1e9 ? `${(T / 1e9).toFixed(T < 2e9 ? 1 : 0)} billion K` : `${Math.round(T / 1e6 / 10) * 10} million K`;
  const timeText = T >= 1e9 ? "first minute or two" : "about 3 minutes in";

  const W = 720;
  const H = 230;
  const cx = W / 2;
  const cy = 104;
  const gap = survives ? 23 : 80; // bound vs blown apart

  return (
    <FigurePanel
      idx="1.3.b"
      kicker="The Deuterium Bottleneck — Why Fusion Had to Wait"
      caption="Building any nucleus starts by sticking one proton to one neutron to make deuterium (heavy hydrogen, ²H). The catch: photons outnumber atoms about a billion to one, so even while most light is feeble, the rare high-energy photons (γ) in that vast crowd keep smashing each deuterium apart the instant it forms. Drag the slider to cool the Universe — only once it falls below about a billion degrees, roughly three minutes after the Big Bang, does deuterium finally survive and the chain of fusion begin."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          {/* binding ring shown only when deuterium holds together */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={gap + 28}
            ry={36}
            fill={survives ? "rgb(var(--c-accent-rgb) / 0.10)" : "none"}
            stroke={survives ? "rgb(var(--c-accent-rgb) / 0.5)" : "none"}
            strokeWidth="2"
            style={{ transition: "all 220ms var(--ease)" }}
          />
          {/* proton */}
          <g style={{ transition: "transform 220ms var(--ease)", transform: `translateX(${-gap}px)` }}>
            <circle cx={cx} cy={cy} r="23" fill={PROTON} />
            <text x={cx} y={cy + 6} textAnchor="middle" fontSize="16" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-bg-rgb))">p</text>
          </g>
          {/* neutron */}
          <g style={{ transition: "transform 220ms var(--ease)", transform: `translateX(${gap}px)` }}>
            <circle cx={cx} cy={cy} r="23" fill={NEUTRON_FILL} stroke={NEUTRON_STROKE} strokeWidth="2.5" />
            <text x={cx} y={cy + 6} textAnchor="middle" fontSize="16" fontStyle="italic" fontFamily="var(--font-serif)" fill="rgb(var(--c-text-rgb) / 0.8)">n</text>
          </g>
          {/* the shattering photon, only while too hot */}
          {!survives && (
            <>
              <path d={`M ${cx} ${cy - 70} q 11 8 0 16 q -11 8 0 16 q 11 8 0 14`} stroke={HE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <text x={cx + 22} y={cy - 58} fontSize="17" fontStyle="italic" fontFamily="var(--font-serif)" fill={HE}>γ</text>
            </>
          )}
          {/* label for the bound nucleus */}
          {survives && (
            <text x={cx} y={cy - 48} textAnchor="middle" fontSize="14" fontStyle="italic" fontFamily="var(--font-serif)" fill="var(--c-accent)">
              ²H (deuterium)
            </text>
          )}
          {/* verdict */}
          <text x={cx} y={H - 24} textAnchor="middle" fontSize="14" letterSpacing="0.5" fontFamily="var(--font-mono)" fill={survives ? "var(--c-accent)" : HE}>
            {survives ? "deuterium SURVIVES — fusion can begin" : "photon SHATTERS it — back to a loose proton + neutron"}
          </text>
        </svg>
      </div>

      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>
            temperature — drag to cool the Universe →
          </label>
          <span className="font-mono text-[10px] text-plasma" style={{ fontSize: sz(0.62) }}>
            T ≈ {Ttext} · {timeText}
          </span>
        </div>
        <input type="range" min={0} max={1} step={0.02} value={cool} onChange={(e) => setCool(parseFloat(e.target.value))} className="cosmic-slider" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>hotter · earlier</span>
          <span>threshold ≈ 1 billion K</span>
          <span>cooler · later</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 1.3.c · The fusion chain to helium-4 ───────────────────────────── */
type ChainStep = { eq: string; label: string; parts: "split" | ("p" | "n")[]; released?: "p" | "n"; he4?: boolean; note: string };
const CHAIN: ChainStep[] = [
  {
    eq: "free  p  +  n",
    label: "",
    parts: "split",
    note: "We begin with the leftover protons and neutrons. The strong force (§1.1) is ready to bind them — but only once it is cool enough for deuterium to survive (previous figure).",
  },
  {
    eq: "p + n → ²H",
    label: "²H · deuterium",
    parts: ["p", "n"],
    note: "A proton and a neutron stick together into deuterium (heavy hydrogen) — the first rung of the ladder, and exactly the step the bottleneck held shut.",
  },
  {
    eq: "²H + ²H → ³He + n",
    label: "³He · helium-3",
    parts: ["p", "p", "n"],
    released: "n",
    note: "Two deuteriums collide and merge into helium-3 (2 protons, 1 neutron), kicking a spare neutron back out. The fierce heat gives them enough speed to overcome their electric repulsion (§1.1) and touch.",
  },
  {
    eq: "³He + ²H → ⁴He + p",
    label: "⁴He · helium-4",
    parts: ["p", "p", "n", "n"],
    released: "p",
    he4: true,
    note: "Helium-3 grabs one more deuterium to finish helium-4 — two protons and two neutrons — releasing a spare proton. Helium-4 is so rock-solid that almost every neutron the Universe has left ends up trapped inside one. This is where the chain stops.",
  },
];

export function FusionChainPanel() {
  const [step, setStep] = useState(0);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const cur = CHAIN[step];
  const W = 720;
  const H = 240;
  const cx = W / 2;
  const cy = 116;

  return (
    <FigurePanel
      idx="1.3.c"
      kicker="Cosmic Alchemy — Building Helium Step by Step"
      caption="Once the bottleneck opens, fusion races through a short chain: a proton and neutron make deuterium; two deuteriums merge into helium-3; and helium-3 grabs another deuterium to finish helium-4, kicking out a spare nucleon at each of the last two steps. Helium-4 is so stable that nearly every leftover neutron ends up trapped inside one. Protons are teal discs, neutrons grey rings. Step through with the cards or the arrow keys."
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
          <text x={cx} y={32} textAnchor="middle" fontSize="17" letterSpacing="0.5" fontFamily="var(--font-mono)" fill="var(--c-accent)">
            {cur.eq}
          </text>

          {cur.parts === "split" ? (
            <>
              {nucleon(cx - 110, cy, "p", 24, "p")}
              <text x={cx - 110} y={cy + 50} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">proton</text>
              {nucleon(cx + 110, cy, "n", 24, "n")}
              <text x={cx + 110} y={cy + 50} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">neutron</text>
            </>
          ) : (
            <>
              <circle
                cx={cx}
                cy={cy}
                r={cur.parts.length <= 2 ? 54 : 66}
                fill={cur.he4 ? "rgb(var(--c-solar-rgb) / 0.12)" : "rgb(var(--c-accent-rgb) / 0.08)"}
                stroke={cur.he4 ? "rgb(var(--c-solar-rgb) / 0.55)" : "rgb(var(--c-accent-rgb) / 0.4)"}
                strokeWidth="2"
              />
              {clusterPos(cur.parts.length, cx, cy).map((p, i) => nucleon(p[0], p[1], (cur.parts as ("p" | "n")[])[i], 22, "c" + i))}
              <text x={cx} y={cy + (cur.parts.length <= 2 ? 84 : 96)} textAnchor="middle" fontSize="14" fontStyle="italic" fontFamily="var(--font-serif)" fill={cur.he4 ? HE : "var(--c-accent)"}>
                {cur.label}
              </text>
              {cur.released && (
                <g>
                  <text x={cx + 122} y={cy - 80} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">
                    + spare {cur.released === "n" ? "neutron" : "proton"}
                  </text>
                  {nucleon(cx + 122, cy - 58, cur.released, 16, "rel")}
                </g>
              )}
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap" style={{ flexShrink: 0 }}>
        {CHAIN.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            data-shortcut={String(i + 1)}
            aria-pressed={step === i}
            className={`pill rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] uppercase ${step === i ? "is-active" : ""}`}
            style={{ fontSize: sz(0.62) }}
          >
            step {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-md" style={{ background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)", flexShrink: 0 }}>
        <div className="font-mono text-[11px] tracking-[0.14em] mb-2" style={{ color: cur.he4 ? "var(--c-solar)" : "var(--c-accent)", fontSize: sz(0.78) }}>
          {cur.eq}
        </div>
        <div className="text-[13px] text-white/85 leading-[1.6] font-sans min-h-[5em]" style={{ fontSize: sz(1) }}>
          {cur.note}
        </div>
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-white/45 mt-2 flex flex-wrap gap-x-4 gap-y-1" style={{ fontSize: sz(0.6) }}>
          <span><span style={{ color: PROTON }}>●</span> proton</span>
          <span><span style={{ color: NEUTRON_STROKE }}>○</span> neutron</span>
          <span className="text-white/35">← / → step the chain</span>
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 1.3.d · The frozen recipe: why ≈25% helium ─────────────────────── */
export function HeliumRecipePanel() {
  const [pPerN, setPPerN] = useState(7); // surviving protons per neutron
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  /* Helium-4 mass fraction Yp = 2(n/p)/(1 + n/p) with n/p = 1/pPerN → 2/(pPerN+1). */
  const He = (2 / (pPerN + 1)) * 100;
  const Hh = 100 - He;
  const isReal = pPerN === 7;

  const W = 320;
  const H2 = 220;
  const cx = W / 2;
  const cy = H2 / 2 + 4;
  const r = 82;
  const ir = 52;
  function arcPath(startPct: number, endPct: number) {
    const a0 = (startPct / 100) * Math.PI * 2 - Math.PI / 2;
    const a1 = (endPct / 100) * Math.PI * 2 - Math.PI / 2;
    const large = endPct - startPct > 50 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi1 = cx + ir * Math.cos(a1), yi1 = cy + ir * Math.sin(a1);
    const xi0 = cx + ir * Math.cos(a0), yi0 = cy + ir * Math.sin(a0);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z`;
  }

  return (
    <FigurePanel
      idx="1.3.d"
      kicker="The Frozen Recipe — Why ≈25% Helium"
      caption="Helium needs neutrons, and neutrons are the scarce ingredient. Fusion pairs every 2 neutrons with 2 protons into one helium-4 (mass 4); the leftover protons stay as hydrogen. With about 7 protons per neutron, that works out to roughly three-quarters hydrogen and one-quarter helium by mass — and expansion then froze it there for good. Slide the proton-to-neutron ratio to see how it sets the mix; 7-to-1 is our Universe."
      fitFs
    >
      <div ref={vizRef} className="fig-viz relative w-full overflow-hidden rounded-md flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H2}`} className="block w-full h-auto" style={{ maxWidth: "360px" }}>
          <path d={arcPath(0, Hh)} fill={PROTON} opacity="0.85" />
          <path d={arcPath(Hh, 100)} fill={HE} opacity="0.9" />
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="30" fontFamily="var(--font-serif)" fontWeight="500" fill={HE}>
            {He.toFixed(0)}%
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="10" letterSpacing="3" fontFamily="var(--font-mono)" fill="rgb(var(--c-text-rgb) / 0.55)">
            HELIUM
          </text>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4" style={{ flexShrink: 0 }}>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>hydrogen · by mass</div>
          <div className="font-serif font-medium" style={{ fontSize: sz(1.7) ?? "1.7rem", color: PROTON, lineHeight: 1.1 }}>{Hh.toFixed(0)}%</div>
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.6) }}>helium · by mass</div>
          <div className="font-serif font-medium" style={{ fontSize: sz(1.7) ?? "1.7rem", color: HE, lineHeight: 1.1 }}>{He.toFixed(0)}%</div>
        </div>
      </div>

      <div className="mt-4" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-1">
          <label className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/55" style={{ fontSize: sz(0.62) }}>
            surviving protons per neutron
          </label>
          <span className="font-mono text-[10px]" style={{ color: isReal ? "var(--c-accent)" : "var(--c-text-soft)", fontSize: sz(0.62) }}>
            {pPerN} : 1{isReal ? " · our Universe" : ""}
          </span>
        </div>
        <input type="range" min={1} max={12} step={1} value={pPerN} onChange={(e) => setPPerN(parseInt(e.target.value))} className="cosmic-slider" />
        <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-white/40 mt-1" style={{ fontSize: sz(0.56) }}>
          <span>1 : 1 · all helium</span>
          <span>7 : 1</span>
          <span>12 : 1 · little helium</span>
        </div>
      </div>
    </FigurePanel>
  );
}
