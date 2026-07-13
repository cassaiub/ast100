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

/* ── 7.3.a — The year: why there are seasons ───────────────────────
   Earth's tilted axis carried around the Sun. Drag through the year and
   watch which hemisphere leans sunward — and, in the inset, how steeply
   the light lands there. The slider is the only range input, so ←/→ and
   the fullscreen wheel drive it.

   The figure exists to kill the commonest misconception in all of
   astronomy: that seasons come from distance. They do not. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MARKS = [
  { f: 0.22, name: "March equinox", note: "day and night equal everywhere" },
  { f: 0.47, name: "June solstice", note: "north leans toward the Sun — northern summer" },
  { f: 0.72, name: "September equinox", note: "day and night equal again" },
  { f: 0.97, name: "December solstice", note: "north leans away — northern winter" },
];

export function SeasonsPanel(): JSX.Element {
  const [f, setF] = useState(0.47);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 904, H = 450;
  const cx = 330, cy = 230, R = 168;
  const ang = 2 * Math.PI * f - Math.PI / 2;
  const ex = cx + R * Math.cos(ang), ey = cy + R * Math.sin(ang) * 0.52;

  /* The axis always points the same way in space. How much the north pole
     leans toward the Sun depends only on where Earth is in the orbit — and
     it peaks at the June solstice (f = 0.47) by construction of MARKS. */
  const TILT = 23.44;
  const leanN = Math.cos(2 * Math.PI * (f - 0.47));   // +1 = north tipped sunward (June)
  const declination = TILT * leanN;                    // the Sun's declination, roughly
  const season =
    leanN > 0.5 ? "northern summer"
    : leanN < -0.5 ? "northern winter"
    : f > 0.47 && f < 0.97 ? "northern autumn"
    : "northern spring";
  const near = MARKS.reduce((a, b) => (Math.abs(b.f - f) < Math.abs(a.f - f) ? b : a));
  const atMark = Math.abs(near.f - f) < 0.03;

  /* the inset: how steeply sunlight lands at 40°N */
  const lat = 40;
  const alt = 90 - lat + declination;             // Sun's noon altitude at 40°N
  const intensity = Math.max(0, Math.sin((alt * Math.PI) / 180));

  return (
    <FigurePanel
      idx="7.3.a"
      kicker="The year: why there are seasons"
      caption={
        <>
          Drag through a year (or use the arrow keys) and watch Earth's tilted axis — which always points the same way
          in space — carry each hemisphere alternately toward and away from the Sun. The inset shows what actually
          matters: how <em>steeply</em> the sunlight lands. Seasons are not caused by distance from the Sun. Earth is
          in fact closest to the Sun in early January, in the middle of the northern winter.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 36% 52%, #1a1509 0%, #0b0a12 55%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Earth in its orbit: ${season}`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* the orbit */}
          <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.52} fill="none" stroke="rgb(var(--c-text-rgb) / 0.22)"
            strokeWidth={1.2} strokeDasharray="5 6" />

          {/* the Sun */}
          <circle cx={cx} cy={cy} r={26} fill="#fde68a" />
          <circle cx={cx} cy={cy} r={44} fill="#fde68a" opacity={0.16} />

          {/* the four station marks */}
          {MARKS.map((mk) => {
            const a = 2 * Math.PI * mk.f - Math.PI / 2;
            const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a) * 0.52;
            /* push the label radially outward, clear of the Earth globe drawn
               on the orbit itself */
            const lx = cx + (R + 46) * Math.cos(a);
            const ly = cy + (R * 0.52 + 40) * Math.sin(a);
            const on = Math.abs(mk.f - f) < 0.03;
            return (
              <g key={mk.name} style={{ cursor: "pointer" }} onClick={() => setF(mk.f)}>
                <circle cx={x} cy={y} r={on ? 5 : 3} fill={on ? "var(--c-solar)" : "rgb(var(--c-text-rgb) / 0.4)"} />
                <text x={lx} y={ly} textAnchor="middle" fontSize="10.5"
                  fontFamily="JetBrains Mono, monospace"
                  fill={on ? "var(--c-solar)" : "rgb(var(--c-text-rgb) / 0.45)"}>{mk.name}</text>
              </g>
            );
          })}

          {/* the Earth, with its fixed tilt */}
          <g transform={`translate(${ex} ${ey})`}>
            {/* day/night: the lit side always faces the Sun */}
            {(() => {
              const toSun = Math.atan2(cy - ey, cx - ex) * (180 / Math.PI);
              return (
                <g>
                  <circle cx={0} cy={0} r={30} fill="#1e3a5f" />
                  <path d={`M 0 -30 A 30 30 0 0 1 0 30 Z`} fill="#60a5fa"
                    transform={`rotate(${toSun + 90})`} />
                </g>
              );
            })()}
            {/* the axis — fixed in space, tilted 23.4° */}
            <g transform={`rotate(${TILT})`}>
              <line x1={0} y1={-46} x2={0} y2={46} stroke="#ffffff" strokeWidth={2.4} />
              <text x={0} y={-54} textAnchor="middle" fontSize="11" fontWeight={700}
                fontFamily="JetBrains Mono, monospace" fill="#ffffff">N</text>
              <ellipse cx={0} cy={0} rx={30} ry={7} fill="none" stroke="rgb(255 255 255 / 0.45)" strokeWidth={1.2} />
            </g>
          </g>
          <text x={ex} y={ey + 62} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
            {MONTHS[Math.min(11, Math.floor(((f + 0.03) % 1) * 12))]}
          </text>

          {/* the axis-stays-put annotation */}
          <line x1={620} y1={92} x2={620} y2={150} stroke="rgb(var(--c-text-rgb) / 0.3)" strokeWidth={1} strokeDasharray="3 4"
            transform={`rotate(${TILT} 620 120)`} />
          <text x={640} y={100} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            the axis never moves —
          </text>
          <text x={640} y={118} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            it always leans 23.4°, the same way.
          </text>
          <text x={640} y={136} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            Only our side of the orbit changes.
          </text>

          {/* the inset: sunlight angle at 40°N */}
          <rect x={620} y={176} width={252} height={172} rx={8} fill="rgb(var(--c-text-rgb) / 0.04)"
            stroke="rgb(var(--c-text-rgb) / 0.14)" strokeWidth={1} />
          <text x={634} y={198} fontSize="11.5" letterSpacing="1.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            NOON SUNLIGHT AT 40°N
          </text>
          <line x1={646} y1={316} x2={856} y2={316} stroke="rgb(var(--c-text-rgb) / 0.4)" strokeWidth={1.4} />
          {/* rays at the computed altitude */}
          {[0, 1, 2, 3].map((i) => {
            const x0 = 660 + i * 48;
            const a = (alt * Math.PI) / 180;
            const len = 92;
            return (
              <line key={i} x1={x0 - len * Math.cos(a)} y1={316 - len * Math.sin(a)} x2={x0} y2={316}
                stroke="var(--c-solar)" strokeWidth={2} markerEnd="url(#s-arr)" opacity={0.9} />
            );
          })}
          <text x={856} y={306} textAnchor="end" fontSize="13" fontWeight={650} fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            {alt.toFixed(0)}° above the horizon
          </text>
          <text x={634} y={338} fontSize="12" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.7)">
            heating power: {(intensity * 100).toFixed(0)}% of overhead
          </text>

          {/* the verdict */}
          <text x={620} y={382} fontSize="17" fontWeight={650} fontFamily="Inter, sans-serif" fill="var(--c-solar)">
            {season}
          </text>
          {(atMark ? near.note : "the tilt does all the work — not the distance")
            .split(" ")
            .reduce<string[][]>((lines, w) => {
              const last = lines[lines.length - 1];
              if (last.join(" ").length + w.length > 34) lines.push([w]);
              else last.push(w);
              return lines;
            }, [[]])
            .map((line, i) => (
              <text key={i} x={620} y={406 + i * 18} fontSize="12.5" fontFamily="JetBrains Mono, monospace"
                fill="rgb(var(--c-text-rgb) / 0.6)">
                {line.join(" ")}
              </text>
            ))}

          <defs>
            <marker id="s-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--c-solar)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          January
        </span>
        <input type="range" min={0} max={1000} step={5} value={Math.round(f * 1000)}
          onChange={(e) => setF(Number(e.currentTarget.value) / 1000)}
          aria-label="Position in the year" style={{ width: "100%" }} />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          December
        </span>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-accent-rgb) / 0.04)", border: "1px solid rgb(var(--c-accent-rgb) / 0.18)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono uppercase tracking-[0.2em]" style={{ color: "var(--c-solar)", fontSize: sz(0.66) ?? "11px" }}>
          the oldest calendar there is
        </div>
        <div className="font-sans leading-[1.6] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.85)", fontSize: sz(0.95) ?? "14px", minHeight: "3.6em" }}>
          Every farming society on Earth had to solve this problem: when do we plant? The answer is written in the sky —
          the Sun's noon height, and where it rises on the horizon, repeat with perfect reliability. Stonehenge, the
          Egyptian calendar, and the Bengali <em>Poush</em> and <em>Boishakh</em> are all instruments for reading this
          one diagram.
        </div>
      </div>
    </FigurePanel>
  );
}

/* ── 7.3.b — The month, the week, and the eclipse ───────────────────
   One figure, two panels: the Moon going round (which gives the month
   and the phases) and the 5° tilt of its orbit (which is why we do not
   get an eclipse every month). The slider runs the lunar month; ←/→
   drive it. */

const PHASES = [
  { f: 0.0, name: "New moon", note: "the Moon is between us and the Sun — its lit face is turned away" },
  { f: 0.25, name: "First quarter", note: "we see half of the lit side — about 7 days later" },
  { f: 0.5, name: "Full moon", note: "Earth is between the Sun and the Moon — the whole lit face shows" },
  { f: 0.75, name: "Last quarter", note: "half again, waning — another 7 days on" },
];

export function MoonPanel(): JSX.Element {
  const [f, setF] = useState(0.5);
  const vizRef = useRef<HTMLDivElement>(null);
  const fs = useFs(vizRef);
  const sz = (r: number) => (fs ? `calc(clamp(16px, 2.1vh, 27px) * ${r})` : undefined);

  const W = 904, H = 470;
  const ex = 300, ey = 250, R = 150;
  const ang = 2 * Math.PI * f - Math.PI;          // 0 = new moon (toward the Sun, on the left)
  const mx = ex + R * Math.cos(ang), my = ey + R * Math.sin(ang);

  const day = f * 29.53;
  const near = PHASES.reduce((a, b) => {
    const da = Math.min(Math.abs(a.f - f), 1 - Math.abs(a.f - f));
    const db = Math.min(Math.abs(b.f - f), 1 - Math.abs(b.f - f));
    return db < da ? b : a;
  });
  const atPhase = Math.min(Math.abs(near.f - f), 1 - Math.abs(near.f - f)) < 0.03;

  /* an eclipse is only possible at new/full AND when the Moon is at a node.
     We show the tilt explicitly so the student sees why it usually misses. */
  const atSyzygy = atPhase && (near.name === "New moon" || near.name === "Full moon");

  return (
    <FigurePanel
      idx="7.3.b"
      kicker="The month, the week, and the eclipse"
      caption={
        <>
          Run the Moon around Earth with the slider or arrow keys. The phases are pure geometry — we are seeing
          different fractions of its sunlit half — and a full cycle takes <strong>29.5 days</strong>: the month, a word
          that is simply "moon" worn down by use. The lower panel answers the obvious question: if the Moon passes
          between us and the Sun every month, why is there not an eclipse every month? Because its orbit is tilted five
          degrees, and it usually passes above or below.
        </>
      }
    >
      <div
        ref={vizRef}
        className="fig-viz relative w-full overflow-hidden rounded-md"
        data-theme="dark"
        style={{
          background: "radial-gradient(circle at 34% 45%, #12121e 0%, #0a0a12 62%, #07070c 100%)",
          border: "1px solid rgb(var(--c-text-rgb) / 0.06)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`Lunar phase: day ${day.toFixed(1)} of the month`}
          style={{ width: "100%", height: "auto", display: "block" }}>

          {/* sunlight from the left */}
          {[150, 210, 270, 330].map((y) => (
            <line key={y} x1={20} y1={y} x2={104} y2={y} stroke="var(--c-solar)" strokeWidth={2}
              markerEnd="url(#m-arr)" opacity={0.85} />
          ))}
          <text x={20} y={122} fontSize="12.5" fontFamily="JetBrains Mono, monospace" fill="var(--c-solar)">
            sunlight
          </text>

          {/* Earth */}
          <circle cx={ex} cy={ey} r={26} fill="#1e3a5f" />
          <path d="M 0 -26 A 26 26 0 0 1 0 26 Z" transform={`translate(${ex} ${ey}) rotate(-90)`} fill="#60a5fa" />
          <text x={ex} y={ey + 44} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace" fill="#60a5fa">Earth</text>

          {/* the Moon's orbit */}
          <circle cx={ex} cy={ey} r={R} fill="none" stroke="rgb(var(--c-text-rgb) / 0.2)" strokeWidth={1.2} strokeDasharray="4 6" />

          {/* the four named phases as click targets */}
          {PHASES.map((p) => {
            const a = 2 * Math.PI * p.f - Math.PI;
            const x = ex + R * Math.cos(a), y = ey + R * Math.sin(a);
            const on = near.name === p.name && atPhase;
            return (
              <g key={p.name} style={{ cursor: "pointer" }} onClick={() => setF(p.f)}>
                <circle cx={x} cy={y} r={16} fill="transparent" />
                <circle cx={x} cy={y} r={on ? 4.5 : 3} fill={on ? "var(--c-solar)" : "rgb(var(--c-text-rgb) / 0.4)"} />
              </g>
            );
          })}

          {/* the Moon, with its lit half always facing the Sun (the left) */}
          <g transform={`translate(${mx} ${my})`}>
            <circle cx={0} cy={0} r={13} fill="#3a3a44" />
            <path d="M 0 -13 A 13 13 0 0 1 0 13 Z" transform="rotate(-90)" fill="#e5e7eb" />
          </g>

          {/* what we see from Earth — the phase, drawn big */}
          {(() => {
            const px = 690, py = 190, pr = 52;
            /* illuminated fraction from the phase angle */
            const k = (1 - Math.cos(2 * Math.PI * f)) / 2;      // 0 = new, 1 = full
            const waxing = f < 0.5;
            return (
              <g>
                <circle cx={px} cy={py} r={pr + 8} fill="#0b0d14" />
                <circle cx={px} cy={py} r={pr} fill="#22222c" />
                {/* draw the lit crescent/gibbous with an ellipse terminator */}
                <path
                  d={`M ${px} ${py - pr} A ${pr} ${pr} 0 0 ${waxing ? 1 : 0} ${px} ${py + pr} A ${Math.abs(pr * (1 - 2 * k))} ${pr} 0 0 ${
                    (waxing && k > 0.5) || (!waxing && k > 0.5) ? (waxing ? 1 : 0) : waxing ? 0 : 1
                  } ${px} ${py - pr} Z`}
                  fill="#e5e7eb" />
                <text x={px} y={py + pr + 26} textAnchor="middle" fontSize="14" fontWeight={650}
                  fontFamily="Inter, sans-serif" fill="rgb(var(--c-text-rgb) / 0.92)">
                  {atPhase ? near.name : k > 0.5 ? (waxing ? "waxing gibbous" : "waning gibbous") : waxing ? "waxing crescent" : "waning crescent"}
                </text>
                <text x={px} y={py + pr + 46} textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono, monospace"
                  fill="rgb(var(--c-text-rgb) / 0.55)">
                  day {day.toFixed(1)} of 29.5
                </text>
                <text x={px} y={100} textAnchor="middle" fontSize="12" letterSpacing="2"
                  fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
                  WHAT YOU SEE
                </text>
              </g>
            );
          })()}

          {/* the tilt panel — why eclipses are rare */}
          <rect x={560} y={330} width={320} height={122} rx={8} fill="rgb(var(--c-text-rgb) / 0.04)"
            stroke={atSyzygy ? "var(--c-solar)" : "rgb(var(--c-text-rgb) / 0.14)"} strokeWidth={1} />
          <text x={574} y={352} fontSize="11.5" letterSpacing="1.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.55)">
            WHY NOT AN ECLIPSE EVERY MONTH?
          </text>
          <line x1={574} y1={400} x2={866} y2={400} stroke="#60a5fa" strokeWidth={1.6} strokeDasharray="4 4" />
          <text x={866} y={392} textAnchor="end" fontSize="10.5" fontFamily="JetBrains Mono, monospace" fill="#60a5fa">Earth&rsquo;s orbit plane</text>
          <line x1={574} y1={418} x2={866} y2={382} stroke="#e5e7eb" strokeWidth={1.8} />
          <text x={866} y={430} textAnchor="end" fontSize="10.5" fontFamily="JetBrains Mono, monospace" fill="#e5e7eb">the Moon&rsquo;s, tilted 5°</text>
          <text x={574} y={444} fontSize="11.5" fontFamily="JetBrains Mono, monospace" fill="rgb(var(--c-text-rgb) / 0.6)">
            {atSyzygy ? "aligned — but only an eclipse if it is also at a crossing point" : "usually the Moon passes above or below the shadow"}
          </text>

          <defs>
            <marker id="m-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--c-solar)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          new moon
        </span>
        <input type="range" min={0} max={1000} step={5} value={Math.round(f * 1000)}
          onChange={(e) => setF(Number(e.currentTarget.value) / 1000)}
          aria-label="Position in the lunar month" style={{ width: "100%" }} />
        <span className="font-mono" style={{ color: "rgb(var(--c-text-rgb) / 0.68)", fontSize: sz(0.62) ?? "11px", whiteSpace: "nowrap" }}>
          29.5 days
        </span>
      </div>

      <div className="mt-3 rounded-md" style={{
        background: "rgb(var(--c-text-rgb) / 0.03)", border: "1px solid rgb(var(--c-text-rgb) / 0.14)",
        padding: "12px 14px", flexShrink: 0,
      }}>
        <div className="font-mono tracking-[0.18em] uppercase" style={{ color: "var(--c-solar)", fontSize: sz(0.72) ?? "12px" }}>
          {atPhase ? near.name : `day ${day.toFixed(1)} of the lunar month`}
        </div>
        <div className="font-sans leading-[1.55] mt-2" style={{ color: "rgb(var(--c-text-rgb) / 0.9)", fontSize: sz(0.92) ?? "14px", minHeight: "3.6em" }}>
          {atPhase ? near.note : "The Moon keeps one face turned to us, and we see a changing slice of its sunlit half. Nothing is casting a shadow on it — the phases are simply a matter of viewing angle."}
        </div>
      </div>
    </FigurePanel>
  );
}
