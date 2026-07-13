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

/* ── 5.4.a — The habitable zone ─────────────────────────────────────
   Slide from a hot F star down to a dim red M dwarf and watch the ring
   where liquid water can survive slide inward and shrink. The slider is
   the figure's only <input type=range>, so ←/→ and the fullscreen wheel
   drive it automatically.

   Physics: the zone's boundaries scale as √(L/L☉) applied to the Sun's
   conservative limits, 0.95 and 1.67 au (Kopparapu et al. 2013). Real
   worlds are plotted at their true separations. */

type StarType = {
  id: string;
  cls: string;
  tempK: number;
  /** luminosity in solar units */
  lum: number;
  color: string;
  lifetime: string;
  abundance: string;
  worlds: { name: string; au: number }[];
  note: ReactNode;
};

const STARS: StarType[] = [
  {
    id: "f", cls: "F star", tempK: 6600, lum: 3.0, color: "#dbeafe",
    lifetime: "about 3 billion years", abundance: "3 in every 100 stars",
    worlds: [],
    note: <>Hotter and brighter than the Sun, so its habitable zone is wide and far out. The catch is time: a star this bright burns through its fuel in about three billion years — barely enough for a planet to get from first cell to anything interesting.</>,
  },
  {
    id: "g", cls: "G star — like the Sun", tempK: 5800, lum: 1.0, color: "#fde68a",
    lifetime: "about 10 billion years", abundance: "7 in every 100 stars",
    worlds: [{ name: "Venus", au: 0.72 }, { name: "Earth", au: 1.0 }, { name: "Mars", au: 1.52 }],
    note: <>Our own case, and the benchmark for everything else. Earth sits comfortably inside the zone; Venus is just inside its hot edge and ran away into a greenhouse; Mars sits near the cold edge and froze. The zone is real — and its edges are unforgiving.</>,
  },
  {
    id: "k", cls: "K star — orange dwarf", tempK: 4600, lum: 0.25, color: "#fdba74",
    lifetime: "tens of billions of years", abundance: "12 in every 100 stars",
    worlds: [],
    note: <>Many astronomers' favourite. Dimmer than the Sun, so the zone is closer in and narrower — but a K star is calmer than a red dwarf and lives for tens of billions of years, giving life an enormous, quiet run at it.</>,
  },
  {
    id: "m", cls: "M star — red dwarf", tempK: 3200, lum: 0.02, color: "#f87171",
    lifetime: "hundreds of billions of years",
    abundance: "about 70 in every 100 stars",
    worlds: [{ name: "Proxima b", au: 0.049 }, { name: "TRAPPIST-1e", au: 0.029 }],
    note: <>The most common star by far, and the longest-lived: no red dwarf anywhere has ever died of old age, because the Universe is not old enough. But its habitable zone is squeezed right up against the star, where planets are blasted by flares — Proxima b takes a few hundred times Earth's X-ray dose — and are probably locked with one face in permanent day.</>,
  },
];

export function HabitableZonePanel(): JSX.Element {
  const [idx, setIdx] = useState(1);              // start on the Sun
  const sel = STARS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  /* conservative HZ, scaled from the Sun's 0.95–1.67 au by √L */
  const hzIn = 0.95 * Math.sqrt(sel.lum);
  const hzOut = 1.67 * Math.sqrt(sel.lum);

  const W = 904, H = 430;
  const cy = 258;
  const L = 76, Rm = 40;
  /* log distance axis, 0.01 → 6 au */
  const lg = Math.log10;
  const xOf = (au: number) => L + ((lg(Math.max(0.01, au)) - lg(0.01)) / (lg(6) - lg(0.01))) * (W - L - Rm);
  const ticks = [0.01, 0.03, 0.1, 0.3, 1, 3];

  const starR = 10 + 16 * Math.pow(sel.lum, 0.18);

  return (
    <FigurePanel
      idx="5.4.a"
      kicker="The habitable zone"
      caption={
        <>
          The band around a star where a planet can hold <em>liquid water</em> — not too hot, not too cold. Step
          through the star types with the arrow keys (the distance axis is logarithmic). As the star dims, the zone
          slides inward and narrows: around a red dwarf it is a thin ring hugging the star, where planets get flared
          and tidally locked. Around a Sun-like star it is wide and safe — but Sun-like stars are rare, and short-lived.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 8% 60%, #1a1408 0%, #0b0a12 52%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Habitable zone of a ${sel.cls}: ${hzIn.toFixed(2)} to ${hzOut.toFixed(2)} astronomical units`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* star-type selector */}
          {STARS.map((s, i) => {
            const on = i === idx;
            const bw = (W - 48) / STARS.length;
            const x = 24 + i * bw;
            return (
              <g key={s.id} style={{ cursor: "pointer" }} onClick={() => setIdx(i)}>
                <rect x={x + 4} y={14} width={bw - 8} height={34} rx={7}
                  fill={on ? "rgb(var(--c-text-rgb) / 0.1)" : "rgb(var(--c-text-rgb) / 0.03)"}
                  stroke={on ? s.color : "rgb(var(--c-text-rgb) / 0.14)"} strokeWidth={on ? 1.8 : 1} />
                <circle cx={x + 18} cy={31} r={6} fill={s.color} />
                <text x={x + 32} y={36} fontSize="13.5" fontWeight={on ? 700 : 500} fontFamily="Inter, sans-serif"
                  fill={on ? s.color : "rgb(var(--c-text-rgb) / 0.78)"}>{s.cls}</text>
              </g>
            );
          })}

          {/* too-hot / too-cold shading */}
          <rect x={L} y={cy - 74} width={xOf(hzIn) - L} height={148} fill="#f87171" opacity={0.1} />
          <rect x={xOf(hzOut)} y={cy - 74} width={W - Rm - xOf(hzOut)} height={148} fill="#60a5fa" opacity={0.1} />
          <text x={(L + xOf(hzIn)) / 2} y={cy - 86} textAnchor="middle" fontSize="12.5"
            fontFamily="JetBrains Mono, monospace" fill="#f87171">too hot — water boils away</text>
          <text x={(xOf(hzOut) + W - Rm) / 2} y={cy - 86} textAnchor="middle" fontSize="12.5"
            fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">too cold — water freezes</text>

          {/* the zone */}
          <rect x={xOf(hzIn)} y={cy - 74} width={xOf(hzOut) - xOf(hzIn)} height={148} fill="#4ade80" opacity={0.24}
            style={{ transition: "all 260ms var(--ease)" }} />
          <text x={(xOf(hzIn) + xOf(hzOut)) / 2} y={cy - 86} textAnchor="middle" fontSize="13.5" fontWeight={700}
            fontFamily="Inter, sans-serif" fill="#4ade80">liquid water possible</text>
          <text x={(xOf(hzIn) + xOf(hzOut)) / 2} y={cy + 100} textAnchor="middle" fontSize="12.5"
            fontFamily="JetBrains Mono, monospace" fill="#4ade80">
            {hzIn < 0.1 ? hzIn.toFixed(3) : hzIn.toFixed(2)} – {hzOut < 0.1 ? hzOut.toFixed(3) : hzOut.toFixed(2)} au
          </text>

          {/* distance axis */}
          <line x1={L} y1={cy + 74} x2={W - Rm} y2={cy + 74} stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth={1} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={xOf(t)} y1={cy + 70} x2={xOf(t)} y2={cy + 78} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
              <text x={xOf(t)} y={cy + 130} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.55)">{t}</text>
            </g>
          ))}
          <text x={W - Rm} y={cy + 154} textAnchor="end" fontSize="12" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.6)">distance from the star (au, log scale) →</text>

          {/* the star */}
          <circle cx={L} cy={cy} r={starR + 16} fill={sel.color} opacity={0.16} />
          <circle cx={L} cy={cy} r={starR} fill={sel.color} style={{ transition: "r 260ms var(--ease)" }} />
          <text x={L} y={cy + starR + 26} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill={sel.color}>
            {sel.tempK.toLocaleString("en-US")} K
          </text>

          {/* real worlds */}
          {sel.worlds.map((w) => (
            <g key={w.name}>
              <circle cx={xOf(w.au)} cy={cy} r={6} fill="#ffffff" stroke="#0b0d14" strokeWidth={1.2} />
              <text x={xOf(w.au)} y={cy - 16} textAnchor="middle" fontSize="12.5" fontFamily="Inter, sans-serif"
                fontWeight={600} fill="#ffffff">{w.name}</text>
              <text x={xOf(w.au)} y={cy + 30} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace"
                fill="rgb(255 255 255 / 0.6)">{w.au} au</text>
            </g>
          ))}

          {/* the two numbers that decide everything */}
          <text x={W - Rm} y={80} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            lives for {sel.lifetime}
          </text>
          <text x={W - Rm} y={102} textAnchor="end" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            {sel.abundance}
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
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
          {sel.cls}
        </div>
        <div className="font-mono mt-1" style={{ color: "rgb(var(--c-text-rgb) / 0.72)", fontSize: sz(0.62) ?? "11px" }}>
          surface {sel.tempK.toLocaleString("en-US")} K · habitable zone {hzIn < 0.1 ? hzIn.toFixed(3) : hzIn.toFixed(2)}–{hzOut < 0.1 ? hzOut.toFixed(3) : hzOut.toFixed(2)} au · {sel.lifetime}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "5.4em" }}>
          {sel.note}
        </div>
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => setIdx((i) => Math.max(0, i - 1))} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => setIdx((i) => Math.min(STARS.length - 1, i + 1))} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {STARS.map((s, i) => (
          <button key={s.id} type="button" onClick={() => setIdx(i)} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {s.cls}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}

/* ── 5.4.b — Reading an atmosphere ─────────────────────────────────
   Starlight filtered through a planet's air during a transit (§4.4)
   comes out with bites taken from it — each molecule eats its own
   wavelengths. Toggle molecules in and out of the atmosphere and watch
   the spectrum change; ←/→ walk the molecule list, and the pill for
   each says whether it is a biosignature.

   The dips are drawn as Gaussians at each molecule's real absorption
   bands, in micrometres, over the JWST range (0.6–14 μm). */

type Molecule = {
  id: string;
  name: string;
  formula: string;
  color: string;
  /** absorption bands: [centre μm, width μm, depth] */
  bands: [number, number, number][];
  bio: "no" | "hint" | "strong";
  note: ReactNode;
};

const MOLS: Molecule[] = [
  { id: "h2o", name: "Water vapour", formula: "H₂O", color: "#38bdf8",
    bands: [[1.4, 0.09, 0.55], [1.9, 0.12, 0.7], [2.7, 0.2, 0.8], [6.3, 0.5, 0.9]],
    bio: "no",
    note: <>Found almost everywhere, and no evidence of life on its own — but it is the first thing anyone looks for, because liquid water is our only worked example of a solvent that life can use.</> },
  { id: "co2", name: "Carbon dioxide", formula: "CO₂", color: "#fb923c",
    bands: [[2.0, 0.06, 0.35], [4.3, 0.15, 0.95], [15, 0.9, 0.9]],
    bio: "no",
    note: <>Volcanic, abundant, and utterly ordinary — Venus and Mars are drowning in it. JWST's first unmistakable detection of carbon dioxide in an exoplanet's air (WASP-39b, 2022) proved the technique works.</> },
  { id: "ch4", name: "Methane", formula: "CH₄", color: "#a78bfa",
    bands: [[1.7, 0.08, 0.4], [2.3, 0.1, 0.5], [3.3, 0.15, 0.85], [7.7, 0.5, 0.8]],
    bio: "hint",
    note: <>Interesting but ambiguous. On Earth, most methane comes from life — but volcanoes and water-rock chemistry make it too. Methane <em>alone</em> proves nothing.</> },
  { id: "o2", name: "Oxygen", formula: "O₂", color: "#4ade80",
    bands: [[0.76, 0.02, 0.6], [1.27, 0.03, 0.3]],
    bio: "strong",
    note: <>The big one. Oxygen is so reactive that it disappears from an atmosphere in geological moments unless something keeps making it. On Earth, that something is life. Oxygen <em>and</em> methane together is the classic pair — they destroy each other, so both being present means both are being replenished.</> },
  { id: "o3", name: "Ozone", formula: "O₃", color: "#22d3ee",
    bands: [[9.6, 0.4, 0.85]],
    bio: "strong",
    note: <>Ozone is made of oxygen, and its infrared fingerprint is far easier to spot than oxygen's own — so it is the practical way to detect an oxygen-rich atmosphere from light-years away. It is also, of course, the shield that lets life leave the water.</> },
];

export function SpectrumPanel(): JSX.Element {
  const [on, setOn] = useState<Record<string, boolean>>({ h2o: true, co2: true, ch4: false, o2: false, o3: false });
  const [idx, setIdx] = useState(0);
  const sel = MOLS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const toggle = (id: string) => setOn((o) => ({ ...o, [id]: !o[id] }));

  const W = 904, H = 460;
  const L = 74, Rm = 30, T = 96, B = 74;
  const lg = Math.log10;
  const xOf = (um: number) => L + ((lg(um) - lg(0.6)) / (lg(16) - lg(0.6))) * (W - L - Rm);
  const yOf = (d: number) => T + d * (H - T - B);        // d = 0 (no absorption) → 1 (deep)

  /* total absorption depth at a wavelength: sum of the active molecules' bands */
  const depth = (um: number) => {
    let d = 0;
    for (const m of MOLS) {
      if (!on[m.id]) continue;
      for (const [c, w, a] of m.bands) {
        d += a * Math.exp(-((um - c) ** 2) / (2 * w * w));
      }
    }
    return Math.min(1, d);
  };
  const curve = Array.from({ length: 420 })
    .map((_, i) => {
      const um = 0.6 * Math.pow(16 / 0.6, i / 419);
      return `${i === 0 ? "M" : "L"} ${xOf(um).toFixed(1)} ${yOf(depth(um)).toFixed(1)}`;
    })
    .join(" ");

  const anyBio = on.o2 || on.o3;
  const disequilibrium = (on.o2 || on.o3) && on.ch4;
  const ticks = [0.6, 1, 2, 3, 5, 8, 12, 16];

  return (
    <FigurePanel
      idx="5.4.b"
      kicker="Reading an atmosphere"
      caption={
        <>
          When a planet crosses its star (§4.4), a sliver of starlight filters through its air — and every molecule
          bites out its own wavelengths. Toggle gases in and out (arrow keys walk the list, the highlighted pill
          toggles) and watch the fingerprint change. Water and carbon dioxide prove nothing. Oxygen <em>plus</em>
          methane, which destroy each other, would mean something is busily making both — the classic biosignature.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 50% 30%, #101520 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label="Transmission spectrum with selectable molecules"
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* verdict banner */}
          <text x={24} y={34} fontSize="13.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace"
            fill={disequilibrium ? "#4ade80" : anyBio ? "#fbbf24" : "rgb(var(--c-text-rgb) / 0.6)"}>
            {disequilibrium
              ? "OXYGEN + METHANE TOGETHER — CHEMICAL DISEQUILIBRIUM · THE CLASSIC BIOSIGNATURE"
              : anyBio
                ? "OXYGEN PRESENT — SUGGESTIVE, BUT NOT PROOF ON ITS OWN"
                : "NO BIOSIGNATURE GASES SELECTED — AN ORDINARY, LIFELESS-LOOKING WORLD"}
          </text>
          <text x={24} y={58} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            starlight after passing through the planet&rsquo;s atmosphere — deeper dip = more of that colour absorbed
          </text>

          {/* molecule toggles */}
          {MOLS.map((m, i) => {
            const active = on[m.id];
            const cur = i === idx;
            const bw = (W - 48) / MOLS.length;
            const x = 24 + i * bw;
            return (
              <g key={m.id} style={{ cursor: "pointer" }} onClick={() => { setIdx(i); toggle(m.id); }}>
                <rect x={x + 3} y={T - 28} width={bw - 6} height={26} rx={6}
                  fill={active ? m.color : "rgb(var(--c-text-rgb) / 0.04)"}
                  opacity={active ? 0.9 : 1}
                  stroke={cur ? "#ffffff" : active ? m.color : "rgb(var(--c-text-rgb) / 0.16)"}
                  strokeWidth={cur ? 2 : 1} />
                <text x={x + bw / 2} y={T - 10} textAnchor="middle" fontSize="13" fontWeight={600}
                  fontFamily="Inter, sans-serif" fill={active ? "#0b0d14" : "rgb(var(--c-text-rgb) / 0.7)"}>
                  {m.formula} {m.bio === "strong" ? "★" : ""}
                </text>
              </g>
            );
          })}

          {/* axes */}
          <line x1={L} y1={H - B} x2={W - Rm} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          <line x1={L} y1={T} x2={L} y2={H - B} stroke="rgb(var(--c-text-rgb) / 0.35)" strokeWidth={1.2} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={xOf(t)} y1={H - B} x2={xOf(t)} y2={H - B + 6} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1} />
              <text x={xOf(t)} y={H - B + 22} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.55)">{t}</text>
            </g>
          ))}
          <text x={(L + W - Rm) / 2} y={H - 16} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)">
            wavelength in micrometres — visible red at the left, deep infrared at the right →
          </text>
          <text x={24} y={(T + H - B) / 2} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace"
            fill="rgb(var(--c-text-rgb) / 0.66)" transform={`rotate(-90 24 ${(T + H - B) / 2})`}>
            ← more light absorbed
          </text>

          {/* band shading per active molecule */}
          {MOLS.filter((m) => on[m.id]).map((m) =>
            m.bands.filter(([c]) => c <= 16).map(([c, w], i) => (
              <rect key={`${m.id}-${i}`} x={xOf(Math.max(0.6, c - w))} y={T}
                width={Math.max(2, xOf(Math.min(16, c + w)) - xOf(Math.max(0.6, c - w)))}
                height={H - T - B} fill={m.color} opacity={0.08} />
            ))
          )}

          {/* the spectrum */}
          <path d={curve} fill="none" stroke="#e5e7eb" strokeWidth={2.4} />

          {/* label the deepest band of each active molecule */}
          {MOLS.filter((m) => on[m.id]).map((m) => {
            const [c, , ] = m.bands.reduce((a, b) => (b[2] > a[2] ? b : a));
            if (c > 16) return null;
            return (
              <text key={`lab-${m.id}`} x={xOf(c)} y={yOf(depth(c)) + 20} textAnchor="middle" fontSize="12.5"
                fontWeight={700} fontFamily="JetBrains Mono, monospace" fill={m.color}>{m.formula}</text>
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
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono tracking-[0.18em] uppercase" style={{ color: sel.color, fontSize: sz(0.72) ?? "12px" }}>
            {sel.name} ({sel.formula})
          </span>
          <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.62)", fontSize: sz(0.6) ?? "10.5px" }}>
            {sel.bio === "strong" ? "★ a biosignature gas" : sel.bio === "hint" ? "suggestive, but made without life too" : "not a sign of life"}
            {" · "}{on[sel.id] ? "in this atmosphere" : "absent — press the pill to add it"}
          </span>
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "4.7em" }}>
          {sel.note}
        </div>
      </div>

      <div className="mt-2 font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.55)", fontSize: sz(0.58) ?? "10.5px", flexShrink: 0 }}>
        ← / → choose a gas · the same key adds or removes it from the atmosphere
      </div>

      <button aria-hidden tabIndex={-1} data-shortcut="ArrowLeft"
        onClick={() => setIdx((i) => Math.max(0, i - 1))} style={srOnly} />
      <button aria-hidden tabIndex={-1} data-shortcut="ArrowRight"
        onClick={() => setIdx((i) => Math.min(MOLS.length - 1, i + 1))} style={srOnly} />
      <div className="sr-only" aria-hidden="false">
        {MOLS.map((m, i) => (
          <button key={m.id} type="button" onClick={() => { setIdx(i); toggle(m.id); }} data-shortcut={String(i + 1)}
            className={idx === i ? "is-active" : ""} aria-pressed={idx === i}>
            {m.name}
          </button>
        ))}
      </div>
    </FigurePanel>
  );
}
