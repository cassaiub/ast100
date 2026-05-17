import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  RIVER_SEGMENTS,
  RIVER_WAYPOINTS,
  MAP_BOUNDS,
  BAY_POLYGON,
  CITIES,
  SOURCE_PEAK,
  REGIONS,
  HIMALAYAS,
  GANGES_WAYPOINTS,
  SUBCONTINENT_POLYGON,
  TIBET_POLYGON,
  type RiverSegment,
} from "../../../data/chapter-0-river";

/* Equirectangular projection — at these latitudes the cosine distortion
   is small enough to ignore for a pedagogical map. 1° ≈ 50 SVG units. */
const DEG = 50;
const MAP_W = (MAP_BOUNDS.east - MAP_BOUNDS.west) * DEG;
const MAP_H = (MAP_BOUNDS.north - MAP_BOUNDS.south) * DEG;
const projX = (lng: number) => (lng - MAP_BOUNDS.west) * DEG;
const projY = (lat: number) => (MAP_BOUNDS.north - lat) * DEG;

function RiverMap({
  activeIdx,
  progress,
  onNodeClick,
}: {
  activeIdx: number;
  progress: number;
  onNodeClick: (i: number) => void;
}) {
  /* One path string per segment, built from its slice of waypoints. */
  const segmentPaths = RIVER_SEGMENTS.map((seg) => {
    const slice = RIVER_WAYPOINTS.slice(seg.fromIdx, seg.toIdx + 1);
    return slice
      .map(([lat, lng], i) => `${i === 0 ? "M" : "L"} ${projX(lng).toFixed(1)} ${projY(lat).toFixed(1)}`)
      .join(" ");
  });

  /* Bay of Bengal as a closed polygon — coastline plus the south
     boundary of the map. */
  const bayPath =
    "M " +
    BAY_POLYGON.map(([lat, lng]) => `${projX(lng).toFixed(1)} ${projY(lat).toFixed(1)}`).join(" L ") +
    ` L ${MAP_W.toFixed(1)} ${MAP_H.toFixed(1)} L 0 ${MAP_H.toFixed(1)} Z`;

  /* Subcontinent + Tibet land masses as closed polygons. */
  const subcontinentPath =
    "M " +
    SUBCONTINENT_POLYGON.map(([lat, lng]) => `${projX(lng).toFixed(1)} ${projY(lat).toFixed(1)}`).join(" L ") +
    " Z";
  const tibetPath =
    "M " +
    TIBET_POLYGON.map(([lat, lng]) => `${projX(lng).toFixed(1)} ${projY(lat).toFixed(1)}`).join(" L ") +
    " Z";

  /* Ganges tributary path. */
  const gangesPath = GANGES_WAYPOINTS.map(([lat, lng], i) =>
    `${i === 0 ? "M" : "L"} ${projX(lng).toFixed(1)} ${projY(lat).toFixed(1)}`
  ).join(" ");

  /* Region label sizing — kept tiny on screen but readable. */
  const labelSize = { lg: 11, md: 9, sm: 7.5 };

  return (
    <div
      className="relative w-full overflow-hidden rounded-md"
      style={{
        aspectRatio: `${MAP_W} / ${MAP_H}`,
        border: "1px solid rgb(var(--c-text-rgb) / 0.1)",
        background: "rgb(var(--c-bg-rgb) / 0.5)",
      }}
      aria-label="Brahmaputra river system mapped to the seven cosmic ages — click any numbered node to jump to that age"
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block w-full h-auto">
        <defs>
          {/* Land gradient — slightly warmer/yellow tint to suggest dry plains */}
          <linearGradient id="land-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgb(var(--c-solar-rgb) / 0.05)" />
            <stop offset="100%" stopColor="rgb(var(--c-solar-rgb) / 0.10)" />
          </linearGradient>
          {/* Tibet gradient — slightly cooler, suggesting high arid plateau */}
          <linearGradient id="tibet-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgb(var(--c-text-rgb) / 0.10)" />
            <stop offset="100%" stopColor="rgb(var(--c-text-rgb) / 0.06)" />
          </linearGradient>
          {/* Bay gradient — deep water blue */}
          <radialGradient id="bay-grad" cx="50%" cy="100%" r="80%">
            <stop offset="0%"   stopColor="rgb(var(--c-accent-rgb) / 0.32)" />
            <stop offset="100%" stopColor="rgb(var(--c-accent-rgb) / 0.10)" />
          </radialGradient>
        </defs>

        {/* Tibetan plateau land */}
        <path d={tibetPath} fill="url(#tibet-grad)" stroke="rgb(var(--c-text-rgb) / 0.10)" strokeWidth="0.4" />
        {/* Indian subcontinent land */}
        <path d={subcontinentPath} fill="url(#land-grad)" stroke="rgb(var(--c-text-rgb) / 0.18)" strokeWidth="0.6" />

        {/* Faint graticule — a few latitude reference lines */}
        <g stroke="rgb(var(--c-text-rgb) / 0.05)" strokeWidth="0.5" strokeDasharray="2 6">
          {[24, 26, 28, 30].map((lat) => (
            <line key={`g-${lat}`} x1={0} y1={projY(lat)} x2={MAP_W} y2={projY(lat)} />
          ))}
        </g>

        {/* Himalayan range — small triangular peaks along the crest */}
        <g>
          {HIMALAYAS.map((p, i) => {
            const cx = projX(p.lng);
            const cy = projY(p.lat);
            const h = 10 * (p.h ?? 1);
            const w = 8 * (p.h ?? 1);
            const isMajor = !!p.label;
            return (
              <g key={`peak-${i}`}>
                <polygon
                  points={`${cx - w},${cy} ${cx},${cy - h} ${cx + w},${cy}`}
                  fill={isMajor ? "rgb(var(--c-text-rgb) / 0.42)" : "rgb(var(--c-text-rgb) / 0.26)"}
                  stroke="rgb(var(--c-text-rgb) / 0.42)"
                  strokeWidth="0.4"
                  strokeLinejoin="miter"
                />
                {/* tiny snowcap on major peaks */}
                {isMajor && (
                  <polygon
                    points={`${cx - w * 0.4},${cy - h * 0.55} ${cx},${cy - h} ${cx + w * 0.4},${cy - h * 0.55}`}
                    fill="rgb(var(--c-text-rgb) / 0.65)"
                  />
                )}
                {p.label && (
                  <text
                    x={cx}
                    y={cy - h - 4}
                    textAnchor="middle"
                    fontSize="6.5"
                    letterSpacing="1.2"
                    fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                    fill="rgb(var(--c-text-rgb) / 0.55)"
                  >
                    {p.label.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Ganges tributary — faded, joins the Brahmaputra system at the Padma */}
        <path
          d={gangesPath}
          fill="none"
          stroke="rgb(var(--c-accent-rgb) / 0.4)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0"
        />
        <text
          x={projX(83.0)}
          y={projY(25.0)}
          fontSize="8"
          letterSpacing="2"
          fontStyle="italic"
          fontFamily="var(--font-serif)"
          fill="rgb(var(--c-accent-rgb) / 0.55)"
        >
          Ganges
        </text>

        {/* Bay of Bengal */}
        <path d={bayPath} fill="url(#bay-grad)" />
        <path
          d={bayPath}
          fill="none"
          stroke="rgb(var(--c-accent-rgb) / 0.55)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Region / country labels */}
        {REGIONS.map((r) => (
          <text
            key={r.name}
            x={projX(r.lng)}
            y={projY(r.lat)}
            textAnchor="middle"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            fontSize={labelSize[r.size]}
            letterSpacing="3"
            fill={r.name === "BAY OF BENGAL" ? "rgb(var(--c-accent-rgb) / 0.75)" : "rgb(var(--c-text-rgb) / 0.42)"}
            style={{ pointerEvents: "none" }}
          >
            {r.name}
          </text>
        ))}

        {/* Source peak — small triangle + label */}
        {(() => {
          const sx = projX(SOURCE_PEAK.lng);
          const sy = projY(SOURCE_PEAK.lat);
          return (
            <g>
              <polygon
                points={`${sx - 6},${sy + 2} ${sx},${sy - 10} ${sx + 6},${sy + 2}`}
                fill="rgb(var(--c-solar-rgb) / 0.85)"
                stroke="rgb(var(--c-solar-rgb))"
                strokeWidth="0.5"
                style={{ filter: "drop-shadow(0 0 4px rgb(var(--c-solar-rgb) / 0.5))" }}
              />
              <text
                x={sx}
                y={sy - 14}
                textAnchor="middle"
                fontSize="7"
                letterSpacing="2"
                fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                fill="rgb(var(--c-solar-rgb) / 0.85)"
              >
                MT KAILASH
              </text>
            </g>
          );
        })()}

        {/* Major cities */}
        {CITIES.map((c) => {
          const cx = projX(c.lng);
          const cy = projY(c.lat);
          return (
            <g key={c.name}>
              <circle cx={cx} cy={cy} r="2.4" fill="rgb(var(--c-text-rgb) / 0.85)" />
              <circle cx={cx} cy={cy} r="2.4" fill="none" stroke="rgb(var(--c-text-rgb) / 0.55)" strokeWidth="0.5" />
              <text
                x={cx + 5}
                y={cy + 3.5}
                fontSize="8"
                letterSpacing="0.8"
                fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                fill="rgb(var(--c-text-rgb) / 0.7)"
              >
                {c.name}
              </text>
            </g>
          );
        })}

        {/* River segments — one path per segment so each can light up
           independently as the user scrolls through cosmic time. */}
        {RIVER_SEGMENTS.map((seg, i) => {
          const isActive = i === activeIdx;
          const visited = i <= activeIdx;
          return (
            <path
              key={seg.id}
              d={segmentPaths[i]}
              fill="none"
              stroke={
                visited
                  ? "rgb(var(--c-accent-rgb))"
                  : "rgb(var(--c-accent-rgb) / 0.28)"
              }
              strokeWidth={seg.w + (isActive ? 1.4 : 0)}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={visited ? "0" : "3 3"}
              style={{
                filter: isActive
                  ? "drop-shadow(0 0 6px rgb(var(--c-accent-rgb) / 0.85))"
                  : visited
                    ? "drop-shadow(0 0 2px rgb(var(--c-accent-rgb) / 0.5))"
                    : "none",
                transition:
                  "stroke 600ms var(--ease), stroke-width 600ms var(--ease), filter 600ms var(--ease)",
              }}
            />
          );
        })}

        {/* Interactive numbered nodes */}
        {RIVER_SEGMENTS.map((seg, i) => {
          const isActive = i === activeIdx;
          const visited = i <= activeIdx;
          const cx = projX(seg.lng);
          const cy = projY(seg.lat);
          return (
            <g
              key={seg.id}
              onClick={() => onNodeClick(i)}
              style={{ cursor: "pointer" }}
            >
              {isActive && (
                <circle cx={cx} cy={cy} r="16" fill="rgb(var(--c-accent-rgb) / 0.22)" className="rivernode-pulse" />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 10 : 7.5}
                fill={visited ? "rgb(var(--c-accent-rgb))" : "rgb(var(--c-bg-rgb) / 0.95)"}
                stroke="rgb(var(--c-accent-rgb))"
                strokeWidth={isActive ? 2 : 1.4}
                style={{
                  filter: isActive ? "drop-shadow(0 0 8px rgb(var(--c-accent-rgb)))" : "none",
                  transition: "r 240ms var(--ease), fill 240ms var(--ease)",
                }}
              />
              <text
                x={cx}
                y={cy + 3.5}
                textAnchor="middle"
                fontSize={isActive ? 11 : 9}
                fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                fontWeight={700}
                fill={visited ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-accent-rgb))"}
                style={{ pointerEvents: "none" }}
              >
                {i + 1}
              </text>
              {/* Wider transparent hit target for tap-friendliness */}
              <circle cx={cx} cy={cy} r="18" fill="transparent" />
            </g>
          );
        })}

        {/* Compass + scale in the bottom-left */}
        <g transform={`translate(20, ${MAP_H - 50})`}>
          <text
            x={0}
            y={0}
            fontSize="7"
            letterSpacing="2"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            fill="rgb(var(--c-text-rgb) / 0.45)"
          >
            N ↑
          </text>
          <line x1={0} y1={20} x2={DEG * 2} y2={20} stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1" />
          <line x1={0} y1={16} x2={0} y2={24} stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1" />
          <line x1={DEG * 2} y1={16} x2={DEG * 2} y2={24} stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1" />
          <text x={0} y={34} fontSize="7" letterSpacing="1" fontFamily="ui-monospace, monospace" fill="rgb(var(--c-text-rgb) / 0.45)">
            ≈220 km
          </text>
        </g>
      </svg>

      {/* Vertical progress rail along the left edge */}
      <div
        className="absolute top-2 bottom-2 left-2 pointer-events-none"
        style={{
          width: "2px",
          background: "rgb(var(--c-text-rgb) / 0.12)",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `${Math.max(0.5, Math.min(100, progress * 100))}%`,
            background:
              "linear-gradient(180deg, rgb(var(--c-accent-rgb) / 0.95) 0%, rgb(var(--c-accent-rgb) / 0.5) 100%)",
            boxShadow: "0 0 6px rgb(var(--c-accent-rgb) / 0.7)",
            transition: "height 220ms linear",
          }}
        />
      </div>
    </div>
  );
}

function RiverFloatTag({ seg, idx }: { seg: RiverSegment; idx: number }) {
  return (
    <div
      className="figure-stub rounded-md px-4 py-3 mb-3"
      style={{ transition: "opacity 480ms var(--ease)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-plasma/80 mb-1.5 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-plasma shadow-[0_0_8px_#22d3ee]" />
            now flowing · {String(idx + 1).padStart(2, "0")} of 07
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <div className="font-serif text-white/95 leading-tight" style={{ fontSize: "1.4rem" }}>
              {seg.name}
            </div>
            <div className="font-sans text-[12px] text-white/65">{seg.age}</div>
          </div>
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40 mt-1">
            {seg.country}
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.14em] text-plasma/85 whitespace-nowrap pt-1">
          {seg.range}
        </div>
      </div>
    </div>
  );
}

function RiverChip({
  seg,
  onOpen,
}: {
  seg: RiverSegment;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="river-chip items-center gap-2.5 pointer-events-auto pl-3 pr-3.5 py-2 rounded-full border border-plasma/35 bg-[rgb(var(--c-bg-rgb)/0.78)] backdrop-blur shadow-[0_8px_24px_-12px_rgb(var(--c-accent-rgb)/0.4)] active:scale-[0.98] transition-transform"
      aria-label={`Open river map. Now flowing: ${seg.name}, ${seg.age}.`}
    >
      <span className="relative flex w-2 h-2">
        <span
          className="absolute inset-0 rounded-full bg-plasma/60 animate-ping"
          style={{ animationDuration: "2.4s" }}
        />
        <span className="relative w-2 h-2 rounded-full bg-plasma shadow-[0_0_8px_#22d3ee]" />
      </span>
      <span className="flex flex-col items-start leading-tight text-left">
        <span className="font-mono text-[8.5px] tracking-[0.28em] uppercase text-plasma/85">
          now flowing
        </span>
        <span className="font-sans text-[11px] text-white/85">
          <span className="text-white">{seg.name}</span>
          <span className="text-white/35 mx-1.5">·</span>
          <span className="text-white/55">{seg.age}</span>
        </span>
      </span>
      <span className="ml-1 font-mono text-[9px] tracking-[0.22em] uppercase text-plasma/70">
        map ↗
      </span>
    </button>
  );
}

/* Inline modal (mobile river map) — owned by RiverScene so polish layer can stay simple. */
function RiverModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={`river-modal ${open ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="max-w-[460px] mx-auto relative">
        <button
          type="button"
          className="absolute right-0 -top-9 font-mono text-[10px] tracking-[0.22em] uppercase text-white/55 hover:text-plasma pointer-events-auto"
          onClick={onClose}
          aria-label="Close river map"
        >
          ✕ close
        </button>
        {children}
      </div>
    </div>
  );
}

export default function RiverScene() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const colRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const el = colRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.5;
      const passed = -rect.top + window.innerHeight * 0.25;
      const p = Math.max(0, Math.min(1, passed / Math.max(total, 1)));
      setProgress(p);
      const idx = Math.min(6, Math.max(0, Math.floor(p * 7 - 0.001)));
      setActiveIdx(idx);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const activeSeg = RIVER_SEGMENTS[activeIdx];

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  /* Click a node on the map → smooth-scroll the article column to the
     point that activates that segment via the existing scroll formula.
     Keeps click-driven and scroll-driven activation perfectly aligned. */
  const onNodeClick = useCallback((i: number) => {
    const el = colRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const colTop = rect.top + window.scrollY;
    const colHeight = rect.height;
    const total = colHeight - window.innerHeight * 0.5;
    const targetP = (i + 0.5) / 7;
    const targetPassed = targetP * total;
    const targetY = colTop + targetPassed - window.innerHeight * 0.25;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, []);

  return (
    <section ref={sectionRef} className="relative" data-screen-label="02 River">
      <div className="lg:hidden sticky top-16 z-20 px-4 md:px-6 flex justify-end pointer-events-none mb-[-44px]">
        <RiverChip seg={activeSeg} onOpen={openModal} />
      </div>

      <RiverModal open={modalOpen} onClose={closeModal}>
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-plasma/85">
            Brahmaputra · seven ages
          </div>
          <div className="figure-stub rounded-md p-3.5">
            <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-plasma/80 mb-1.5 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-plasma shadow-[0_0_8px_#22d3ee]" />
              now flowing
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="font-serif text-white/95 leading-tight" style={{ fontSize: "1.4rem" }}>
                {activeSeg.name}
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] text-plasma/85">
                {activeSeg.range}
              </div>
            </div>
            <div className="font-sans text-[13px] text-white/65 mt-1">{activeSeg.age}</div>
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/35 mt-2 border-t border-white/[0.07] pt-2">
              {activeSeg.country}
            </div>
          </div>
          <RiverMap activeIdx={activeIdx} progress={progress} onNodeClick={onNodeClick} />
        </div>
      </RiverModal>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <header className="pt-24 md:pt-32 mb-12">
          <div
            data-fade
            className="font-mono text-[11px] tracking-[0.28em] uppercase text-plasma/80 mb-3 flex items-center gap-3"
          >
            <span className="block w-6 h-px bg-plasma/50" /> Section One · Background
          </div>
          <h2
            data-fade
            style={{ ["--delay" as string]: "80ms" }}
            className="font-serif font-medium text-white tracking-tight leading-[1.05]"
          >
            <span
              className="font-mono text-plasma/55 mr-4 align-baseline"
              style={{ fontSize: "0.42em", letterSpacing: "0.16em" }}
            >
              1.
            </span>
            <span style={{ fontSize: "clamp(2rem, 4.4vw, 3.6rem)" }}>A river of time</span>
          </h2>
          <p
            data-fade
            style={{ ["--delay" as string]: "160ms" }}
            className="mt-5 max-w-[64ch] text-white/65 text-[16px]"
          >
            The chapter&rsquo;s organizing metaphor maps the seven cosmic ages onto seven
            named segments of the Brahmaputra as it flows from Tibet, through India, to the
            Bay of Bengal.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,640px)] gap-10 lg:gap-12">
          <div ref={colRef} className="prose-cosmic max-w-[68ch]">
            <p data-fade className="dropcap">
              The history of the universe is divided into seven distinct ages based on the
              increasing complexity of matter and life. It begins with the{" "}
              <strong>Particle age</strong>, spanning the first 300,000 years, where
              fundamental particles and the first atoms formed. This was followed by the{" "}
              <strong>Galactic age</strong>, lasting from 300,000 years to 4 billion years,
              during which the first large-scale structures and galaxies assembled. The{" "}
              <strong>Stellar age</strong> ensued from 4 billion to 9 billion years, marked
              by the peak of star formation and the creation of heavier elements. Following
              this, the <strong>Planetary age</strong> occurred between 9 billion and 11
              billion years, seeing the birth of solar systems and solid worlds. The
              timeline then transitions into the <strong>Chemical age</strong> (11 to 13
              billion years), where complex organic molecules began to synthesize, paving
              the way for the <strong>Biological age</strong> (13 to 14 billion years),
              representing the rise of complex life on water and land. Finally, the{" "}
              <strong>Cultural age</strong> occupies the most recent 300,000 years, defined
              by the emergence of humanity, technology, and complex culture.
            </p>

            <p data-fade>
              This figure creates a symbolic geography by linking these cosmic milestones to
              specific segments of the international Brahmaputra river&rsquo;s flow through
              China, India, and Bangladesh. The <strong>Angsi</strong> river at the source
              represents the primordial Particle age, which transitions into the{" "}
              <strong>Tsangpo</strong> river across the Tibetan plateau, mirroring the
              expansive Galactic age. As the river carves through the Himalayas as the{" "}
              <strong>Siang</strong> river, it corresponds to the high-energy Stellar age.
              Upon entering the plains of India, it becomes the <strong>Brahmaputra</strong>{" "}
              river, symbolizing the formation of stable ground in the Planetary age. As it
              moves toward the Bengal delta, the <strong>Jamuna</strong> river section
              represents the Chemical age, while its transformation into the{" "}
              <strong>Padma</strong> river aligns with the Biological age of life&rsquo;s
              complexity. The journey concludes with the <strong>Meghna</strong> river
              meeting the Bay of Bengal, representing the Cultural age — the most recent and
              complex stage of development near the river&rsquo;s end and the modern human
              era.
            </p>

            <p data-fade>
              The analogy between time and a river suggests that history is a directional
              flow that gains complexity and volume as it moves toward its destination. Just
              as a river begins at a narrow, high-energy mountain source and carves a single
              path through the landscape, the past is a defined sequence of events that
              becomes more &ldquo;solid&rdquo; as we move away from the origin. However, as
              the river reaches the delta and meets the Bay of Bengal, it dissolves into a
              vast, boundless horizon.
            </p>
          </div>

          <aside className="relative hidden lg:block">
            <div className="sticky top-20">
              <div className="relative w-full">
                <RiverFloatTag seg={activeSeg} idx={activeIdx} />
                <RiverMap activeIdx={activeIdx} progress={progress} onNodeClick={onNodeClick} />
              </div>
            </div>
          </aside>
        </div>

        <aside data-fade className="my-24 pullquote relative">
          <div className="rule mb-10" />
          <div className="max-w-[64ch] mx-auto text-center">
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-plasma/70 mb-6">
              river-as-time
            </div>
            <blockquote
              className="font-serif italic text-white leading-[1.2] tracking-tight"
              style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)" }}
            >
              <span className="text-solar/90 mr-1">&ldquo;</span>
              The ocean represents the many possibilities of the future; while the past is a
              singular track we can look back upon, the future is an expansive, unwritten
              space where all paths merge.
              <span className="text-solar/90 ml-1">&rdquo;</span>
            </blockquote>
          </div>
          <div className="rule mt-10" />
        </aside>
      </div>
    </section>
  );
}
