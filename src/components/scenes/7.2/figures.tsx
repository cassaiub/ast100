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

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return reduced;
}

const srOnly: CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};

/* ── 7.2.a — Four maps of everything ───────────────────────────────
   The same sky, drawn four ways across two thousand years: Earth at the
   centre, then the Sun, then no centre at all, then a map of time
   itself. Each model is a real diagram, drawn from its own logic, with
   the observation that broke it. ←/→ or 1–4. */

type Model = {
  id: string;
  name: string;
  who: string;
  when: string;
  color: string;
  claim: string;
  broke: string;
  body: ReactNode;
};

const MODELS: Model[] = [
  {
    id: "geo", name: "Earth at the centre", who: "Aristotle · Ptolemy", when: "4th century BCE – 1543",
    color: "#f0a35e",
    claim: "Everything circles a motionless Earth on nested spheres.",
    broke: "Planets sometimes appear to move backwards.",
    body: <>It fits what you see. The ground does not feel like it is moving; the sky plainly turns overhead. The trouble was <strong>retrograde motion</strong> — the way Mars occasionally stops, reverses for a few weeks, then goes on. Ptolemy patched it with <strong>epicycles</strong>: little circles riding on the big ones. It worked, in the sense that it predicted where the planets would be — for fourteen centuries.</>,
  },
  {
    id: "helio", name: "The Sun at the centre", who: "Copernicus · Kepler · Galileo", when: "1543 – 1610",
    color: "#fde68a",
    claim: "The planets, Earth among them, orbit the Sun.",
    broke: "Perfect circles still didn't fit the data.",
    body: <>Copernicus moved the Sun to the middle and retrograde motion stopped being a mystery: it is simply what you see when a faster inner planet <em>overtakes</em> a slower outer one. He kept the perfect circles, so he still needed epicycles. <strong>Kepler</strong> threw out the circles for ellipses and the model finally worked exactly. <strong>Galileo</strong> then pointed a telescope at Jupiter and found four moons circling something that was not Earth.</>,
  },
  {
    id: "acentric", name: "No centre at all", who: "Thomas Digges · Giordano Bruno", when: "from 1576",
    color: "#8ab4f8",
    claim: "The stars are other suns, scattered without end.",
    broke: "Nothing — it was simply too big to imagine.",
    body: <>The quietest revolution. In 1576 the English astronomer Thomas Digges redrew the Copernican system and then did something nobody had dared: he let the stars keep going, off the edge of the diagram, "infinitely up". If the stars are suns, then the Sun is a star, and the centre of the universe is nowhere in particular. Everything in this course — <em>§2.1</em>, <em>§3.2</em>, <em>§4.4</em> — is a footnote to that thought.</>,
  },
  {
    id: "topo", name: "A map of time", who: "Einstein · Friedmann · Lemaître · Hubble", when: "1915 – today",
    color: "#c4b5fd",
    claim: "Space itself expands; looking out is looking back.",
    broke: "— this is the one we are still using.",
    body: <>The modern map is not a map of <em>where</em> but of <em>when</em>. Because light takes time to arrive, every direction we look is a direction into the past (<em>§0.3</em>), and the universe is expanding (<em>§2.4</em>), so the map runs from the Big Bang on one edge to us on the other. There is still no centre — but now there is an <em>edge</em>, and it is made of time, not space.</>,
  },
];

export function ModelsPanel(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const sel = MODELS[idx];
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const reduced = usePrefersReducedMotion();
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);
  const step = (d: -1 | 1) => setIdx((i) => Math.max(0, Math.min(MODELS.length - 1, i + d)));

  const W = 904, H = 470;
  const cx = 300, cy = 246;

  const scene = (): JSX.Element => {
    if (idx === 0) {
      /* geocentric: nested spheres + an epicycle on Mars */
      const radii = [46, 74, 102, 132, 166, 196, 222];
      const names = ["Moon", "Mercury", "Venus", "Sun", "Mars", "Jupiter", "Saturn"];
      return (
        <g>
          {radii.map((r, i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth={1} />
              <circle cx={cx + r * Math.cos((-40 + i * 34) * Math.PI / 180)}
                cy={cy + r * Math.sin((-40 + i * 34) * Math.PI / 180)}
                r={i === 3 ? 8 : 5} fill={i === 3 ? "#fde68a" : "#e5e7eb"} />
              <text x={cx + (r + 12) * Math.cos((-40 + i * 34) * Math.PI / 180)}
                y={cy + (r + 12) * Math.sin((-40 + i * 34) * Math.PI / 180)}
                fontSize="10.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
                {names[i]}
              </text>
            </g>
          ))}
          {/* the epicycle, the model's famous patch */}
          {(() => {
            const a = (-40 + 4 * 34) * Math.PI / 180;
            const px = cx + 166 * Math.cos(a), py = cy + 166 * Math.sin(a);
            return (
              <g>
                <circle cx={px} cy={py} r={26} fill="none" stroke="#f87171" strokeWidth={1.8} strokeDasharray="4 4" />
                <circle cx={px + 26} cy={py} r={4} fill="#f87171" />
                <text x={px + 34} y={py - 18} fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#f87171">
                  epicycle — the patch
                </text>
              </g>
            );
          })()}
          <circle cx={cx} cy={cy} r={14} fill="#4ade80" />
          <text x={cx} y={cy + 30} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#4ade80">Earth</text>
        </g>
      );
    }
    if (idx === 1) {
      const radii = [40, 62, 88, 118, 158, 200];
      const names = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn"];
      return (
        <g>
          {radii.map((r, i) => (
            <g key={i}>
              <ellipse cx={cx - r * 0.06} cy={cy} rx={r} ry={r * 0.97} fill="none"
                stroke="rgb(var(--c-text-rgb) / 0.22)" strokeWidth={1} />
              <circle cx={cx + r * Math.cos((-30 + i * 42) * Math.PI / 180)}
                cy={cy + r * Math.sin((-30 + i * 42) * Math.PI / 180)}
                r={i === 2 ? 7 : 5} fill={i === 2 ? "#60a5fa" : "#e5e7eb"} />
              <text x={cx + (r + 12) * Math.cos((-30 + i * 42) * Math.PI / 180)}
                y={cy + (r + 12) * Math.sin((-30 + i * 42) * Math.PI / 180)}
                fontSize="10.5" fontFamily="JetBrains Mono, monospace"
                fill={i === 2 ? "#60a5fa" : "rgb(var(--c-text-rgb) / 0.6)"}>{names[i]}</text>
            </g>
          ))}
          <circle cx={cx} cy={cy} r={15} fill="#fde68a" />
          <circle cx={cx} cy={cy} r={26} fill="#fde68a" opacity={0.2} />
          <text x={cx} y={cy + 40} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#fde68a">Sun</text>
          <text x={cx} y={cy + 232} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            ellipses, not circles — Kepler, 1609
          </text>
        </g>
      );
    }
    if (idx === 2) {
      /* acentric: our system shrinks to a dot in a field of suns */
      return (
        <g>
          {Array.from({ length: 120 }).map((_, i) => {
            const a = (i * 137.508 * Math.PI) / 180;
            const r = 40 + 200 * Math.sqrt((i + 1) / 120);
            const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) * 0.82;
            if (x < 20 || x > 560) return null;
            return <circle key={i} cx={x} cy={y} r={1.6 + (i % 3) * 0.7} fill="#e5e7eb" opacity={0.75} />;
          })}
          <circle cx={cx} cy={cy} r={26} fill="none" stroke="#8ab4f8" strokeWidth={1.6} />
          <circle cx={cx} cy={cy} r={5} fill="#fde68a" />
          <text x={cx} y={cy + 44} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#8ab4f8">
            our whole solar system
          </text>
          <text x={cx} y={cy - 200} textAnchor="middle" fontSize="13" fontFamily="Inter, sans-serif" fill="#e5e7eb">
            “this orbe of starres… extendeth infinitely up”
          </text>
        </g>
      );
    }
    /* modern: a horizontal history of the universe */
    return (
      <g>
        <defs>
          <linearGradient id="cos-time" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="0.12" stopColor="#fb923c" />
            <stop offset="0.3" stopColor="#3b2a5a" />
            <stop offset="0.55" stopColor="#1e2a5a" />
            <stop offset="1" stopColor="#0f2036" />
          </linearGradient>
        </defs>
        <rect x={60} y={150} width={520} height={190} rx={6} fill="url(#cos-time)" opacity={0.9} />
        {[["Big Bang", 0.0], ["first light", 0.14], ["dark ages", 0.3], ["first stars", 0.46], ["galaxies", 0.66], ["today", 0.98]].map(
          ([l, f], i) => {
            const x = 60 + (f as number) * 520;
            return (
              <g key={i}>
                <line x1={x} y1={150} x2={x} y2={340} stroke="rgb(255 255 255 / 0.3)" strokeWidth={1} strokeDasharray="3 4" />
                <text x={x} y={140} textAnchor={i === 0 ? "start" : i === 5 ? "end" : "middle"} fontSize="11.5"
                  fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.75)">{l as string}</text>
              </g>
            );
          }
        )}
        <text x={320} y={366} textAnchor="middle" fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.66)">
          13.8 billion years — and every telescope looks leftward
        </text>
        <circle cx={572} cy={245} r={7} fill="#ffffff" />
        <text x={572} y={228} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#ffffff">us</text>
      </g>
    );
  };

  return (
    <FigurePanel
      idx="7.2.a"
      kicker="Four maps of everything"
      caption={
        <>
          Two thousand years of trying to draw the universe — step through with the arrow keys. Each map is the honest
          best effort of its age, and each was broken by one stubborn observation. Watch what happens to our own
          position: from the exact centre of creation, to one planet of one star, to a dot in a scatter of suns, to a
          point in a history that has no centre at all — only a beginning.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 33% 52%, #12111d 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
          transition: reduced ? "none" : "background 400ms var(--ease)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Cosmological model: ${sel.name}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {scene()}

          {/* the model card, right column */}
          <text x={620} y={54} fontSize="13" letterSpacing="2.5" fontFamily="JetBrains Mono, monospace" fill={sel.color}>
            MODEL {idx + 1} OF 4
          </text>
          <text x={620} y={88} fontSize="21" fontWeight={650} fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.95)">
            {sel.name}
          </text>
          <text x={620} y={114} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            {sel.who}
          </text>
          <text x={620} y={134} fontSize="13" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
            {sel.when}
          </text>

          <text x={620} y={180} fontSize="11.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
            THE CLAIM
          </text>
          {sel.claim.split(" ").reduce<string[][]>((lines, w) => {
            const last = lines[lines.length - 1];
            if (last.join(" ").length + w.length > 30) lines.push([w]);
            else last.push(w);
            return lines;
          }, [[]]).map((line, i) => (
            <text key={i} x={620} y={202 + i * 20} fontSize="14" fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.9)">
              {line.join(" ")}
            </text>
          ))}

          <text x={620} y={296} fontSize="11.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="#f87171">
            WHAT BROKE IT
          </text>
          {sel.broke.split(" ").reduce<string[][]>((lines, w) => {
            const last = lines[lines.length - 1];
            if (last.join(" ").length + w.length > 30) lines.push([w]);
            else last.push(w);
            return lines;
          }, [[]]).map((line, i) => (
            <text key={i} x={620} y={318 + i * 20} fontSize="14" fontFamily="Inter, sans-serif"
              fill={idx === 3 ? "#4ade80" : "rgb(var(--c-text-rgb) / 0.85)"}>
              {line.join(" ")}
            </text>
          ))}

          {/* where we are in the model */}
          <text x={620} y={410} fontSize="11.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
            OUR POSITION
          </text>
          <text x={620} y={432} fontSize="15" fontWeight={650} fontFamily="Inter, sans-serif" fill={sel.color}>
            {["the exact centre", "the third planet", "nowhere special", "13.8 billion years in"][idx]}
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
          {sel.name} · {sel.who}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "5.4em" }}>
          {sel.body}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 items-center" style={{ flexShrink: 0 }}>
        {MODELS.map((_, n) => (
          <button key={n} type="button" onClick={() => setIdx(n)} aria-pressed={idx === n}
            className={`rounded-full font-mono${idx === n ? " is-active" : ""}`} data-shortcut={String(n + 1)} style={{
              width: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              height: fs ? "calc(clamp(16px, 2.1vh, 27px) * 1.05)" : "22px",
              fontSize: sz(0.56) ?? "10px",
              color: idx === n ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-text-rgb) / 0.6)",
              background: idx === n ? "var(--c-accent)" : "rgb(var(--c-text-rgb) / 0.06)",
              border: "1px solid rgb(var(--c-text-rgb) / 0.15)",
            }}>{n + 1}</button>
        ))}
        <span className="font-mono ml-2" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px" }}>
          ← / → two thousand years of redrawing the sky
        </span>
      </div>

      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowLeft" onClick={() => step(-1)} style={srOnly} />
      <button type="button" aria-hidden tabIndex={-1} data-shortcut="ArrowRight" onClick={() => step(1)} style={srOnly} />
    </FigurePanel>
  );
}

/* ── 7.2.b — Why Mars goes backwards ───────────────────────────────
   The single observation that broke the geocentric model, shown as it
   actually works: drag time and watch Earth overtake Mars on the inside
   lane, while the line of sight to Mars traces a loop against the fixed
   stars. The slider is the only range input, so ←/→ drive it. */

export function RetrogradePanel(): JSX.Element {
  const [t, setT] = useState(0.5);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 904, H = 440;
  const cx = 250, cy = 240;
  const rE = 74, rM = 118;                         // orbit radii (schematic)
  /* Earth's year = 1, Mars's = 1.88. t runs over ~1.2 Earth years, centred on
     an opposition (both planets lined up on the same side of the Sun) — which
     is exactly when the retrograde loop happens, so it lands mid-track. */
  const span = 1.2;
  const angE = (tt: number) => -Math.PI / 2 + 2 * Math.PI * ((tt - 0.5) * span);
  const angM = (tt: number) => -Math.PI / 2 + 2 * Math.PI * (((tt - 0.5) * span) / 1.88);
  const posE = (tt: number) => ({ x: cx + rE * Math.cos(angE(tt)), y: cy + rE * Math.sin(angE(tt)) });
  const posM = (tt: number) => ({ x: cx + rM * Math.cos(angM(tt)), y: cy + rM * Math.sin(angM(tt)) });

  /* where Mars appears against the background sky (the strip on the right):
     the apparent direction from Earth to Mars, mapped to a screen x. */
  const skyX = (tt: number) => {
    const e = posE(tt), m = posM(tt);
    const a = Math.atan2(m.y - e.y, m.x - e.x);
    return 560 + ((a + Math.PI) / (2 * Math.PI)) * 320;
  };
  const skyTrack = Array.from({ length: 120 }).map((_, i) => {
    const tt = i / 119;
    return { x: skyX(tt), y: 150 + tt * 200 };
  });

  const e = posE(t), m = posM(t);

  return (
    <FigurePanel
      idx="7.2.b"
      kicker="Why Mars goes backwards"
      caption={
        <>
          The observation that tortured astronomers for 1,400 years — and dissolves the moment you move the Earth. Drag
          the slider (or use the arrow keys) to run time forward. On the left, Earth on the inside lane overtakes the
          slower Mars. On the right is what you actually <em>see</em> from Earth: Mars sliding along the stars, pausing,
          looping <em>backwards</em>, and going on. Ptolemy needed an extra circle to explain that loop. Copernicus
          needed only to admit that we move.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 28% 55%, #17130b 0%, #0b0a12 55%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label="Retrograde motion of Mars explained by Earth overtaking it"
          style={{ width: "100%", height: "auto", display: "block" }}>

          <text x={24} y={34} fontSize="12.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            WHAT IS ACTUALLY HAPPENING
          </text>
          <text x={560} y={34} fontSize="12.5" letterSpacing="2" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            WHAT YOU SEE FROM EARTH
          </text>

          {/* orbits */}
          <circle cx={cx} cy={cy} r={rE} fill="none" stroke="#60a5fa" strokeWidth={1.4} strokeDasharray="4 5" />
          <circle cx={cx} cy={cy} r={rM} fill="none" stroke="#ef4444" strokeWidth={1.4} strokeDasharray="4 5" />
          <circle cx={cx} cy={cy} r={12} fill="#fde68a" />
          <circle cx={cx} cy={cy} r={22} fill="#fde68a" opacity={0.18} />
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="#fde68a">Sun</text>

          {/* the two planets */}
          <circle cx={e.x} cy={e.y} r={7} fill="#60a5fa" />
          <text x={e.x} y={e.y - 13} textAnchor="middle" fontSize="11.5" fontFamily="Inter, sans-serif" fill="#60a5fa">Earth</text>
          <circle cx={m.x} cy={m.y} r={6} fill="#ef4444" />
          <text x={m.x} y={m.y - 12} textAnchor="middle" fontSize="11.5" fontFamily="Inter, sans-serif" fill="#ef4444">Mars</text>

          {/* the line of sight, extended to the sky strip */}
          {(() => {
            const dx = m.x - e.x, dy = m.y - e.y;
            const len = Math.hypot(dx, dy);
            const ex = e.x + (dx / len) * 300, ey = e.y + (dy / len) * 300;
            return <line x1={e.x} y1={e.y} x2={ex} y2={ey} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1.2} strokeDasharray="3 4" />;
          })()}

          {/* the sky strip: background stars + Mars's apparent track */}
          <rect x={560} y={140} width={320} height={220} rx={6} fill="#0b0f1c" stroke="rgb(var(--c-text-rgb) / 0.12)" strokeWidth={1} />
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={572 + ((i * 97) % 296)} cy={152 + ((i * 61) % 196)} r={1.2} fill="#e5e7eb" opacity={0.5} />
          ))}
          <path d={skyTrack.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")}
            fill="none" stroke="#ef4444" strokeWidth={1.8} opacity={0.55} />
          <circle cx={skyX(t)} cy={150 + t * 200} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth={1.4} />
          <text x={720} y={382} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#ef4444">
            Mars&rsquo;s path against the stars — note the loop
          </text>
          <text x={720} y={402} textAnchor="middle" fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
            (time runs downward)
          </text>

          <text x={24} y={H - 16} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            Earth laps Mars on the inside — and Mars appears to slide backwards for a few weeks.
          </text>
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          time
        </span>
        <input type="range" min={0} max={1000} step={5} value={Math.round(t * 1000)}
          onChange={(ev) => setT(Number(ev.currentTarget.value) / 1000)}
          aria-label="Time, in fractions of an Earth year" style={{ width: "100%" }} />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          14 months
        </span>
      </div>
    </FigurePanel>
  );
}
