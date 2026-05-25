import { useCallback, useState } from "react";
import {
  RIVER_SEGMENTS,
  RIVER_WAYPOINTS,
  MAP_BOUNDS,
  BAY_POLYGON,
  CITIES,
  SOURCE_PEAK,
  LAKES,
  REGIONS,
  HIMALAYAS,
  GANGES_WAYPOINTS,
  SUBCONTINENT_POLYGON,
  TIBET_POLYGON,
  type RiverSegment,
} from "../../../data/chapter-0-river";

/* One narrative paragraph per age, indexed in lockstep with RIVER_SEGMENTS.
   Each blends the cosmic-age science with the river-segment metaphor.
   The first three ages are cosmic in scope; from the Planetary age
   onwards the focus narrows to our Solar System and Earth. */
const AGE_DESCRIPTIONS: string[] = [
  /* 0 · Angsi · Particle age (0 — 1 Myr) */
  "From the first hot instant of being, raw energy condenses into matter. Quarks coalesce into protons and neutrons, and within the first fifteen minutes the first hydrogen and helium nuclei are forged. The cosmos remains an opaque, white-hot plasma for nearly 380,000 years — until it cools enough for electrons to settle into orbit and the first neutral atoms drift through a cooling dark. The river begins here too: at the Angsi glacier near Mt Kailash, a thin, high-energy thread of meltwater carrying everything that will follow.",
  /* 1 · Tsangpo · Galactic age (1 Myr — 4 Gyr) */
  "Gravity does its slow work. In the cooling dark, hydrogen clouds collapse into the first massive stars; those stars assemble into the first protogalaxies; a billion years of mergers builds up the great galaxies, including the Milky Way. Supermassive black holes flare into quasars and quiet again, while filaments and voids weave the cosmic web. The Tsangpo runs east across the Tibetan plateau at 4,000 metres — slow, broad, patient — a long stretch of cosmic assembly.",
  /* 2 · Siang · Stellar age (4 — 9 Gyr) */
  "Star formation peaks. Inside stellar cores, hydrogen fuses to helium, then to carbon, oxygen, silicon, and iron; supernovae scatter these new elements across the galaxy and forge the metals heavier than iron in their dying flash. By the end of this stretch, a chemically enriched cloud in one corner of the Milky Way collapses — and the Sun ignites. The river plunges off the plateau through the world's deepest gorge as the Siang — a roaring, high-energy descent that mirrors the stellar fire above.",
  /* 3 · Brahmaputra · Planetary age (9 — 11 Gyr) */
  "From here on, the story narrows to a single planetary system — our own Solar System. Dust grains stick together into planetesimals, planetesimals into protoplanets. A Mars-sized body slams into the young Earth and the Moon condenses from the debris. Volcanoes outgas a primitive atmosphere, comets deliver water, and the first oceans rain down onto a slowly-cooling crust. The Late Heavy Bombardment scars every planetary surface. The river enters the Assam plains as a wide, braided Brahmaputra — the cosmic equivalent of finding stable ground.",
  /* 4 · Jamuna · Chemical age (11 — 13 Gyr) */
  "Inside Earth's young oceans, chemistry crosses into biology. Simple gases, lit by lightning and ultraviolet sunlight, synthesize amino acids and nucleotide bases; lipid droplets enclose them as primitive protocells; RNA learns to copy itself. By the end of this stretch the first true single-celled organisms appear — likely around hydrothermal vents on the deep ocean floor — quietly eating the organic soup of the early Earth. The Brahmaputra crosses into Bangladesh as the Jamuna, gathering tributaries and silt — a richening, thickening current right before life turns the corner.",
  /* 5 · Padma · Biological age (last ~1 Gyr) */
  "Life diversifies. In a single billion-year span, single cells learn to cooperate as multicellular bodies; the Cambrian Explosion seeds every major animal body plan; mosses, then ferns, then forests colonize the bare continents; reptiles spread across Pangaea, dinosaurs rise and fall, and small warm-blooded mammals fill the empty niches a sixty-five-million-year-old asteroid impact leaves behind. All of it on one planet. The Jamuna joins the Ganges and becomes the Padma — the world's most fertile delta, alive with paddies, fishermen, and silt-grey river dolphins.",
  /* 6 · Meghna · Cultural age (last ~1 Myr) */
  "Symbolic thought. In the last million years, hominids master fire, modern humans emerge in Africa, language and art flower, agriculture settles us into villages, and writing turns prehistory into history. In just the last two hundred and fifty years, industry has rewired the biosphere itself — and given a single species the power to leave the planet. The Padma joins the Meghna for the final reach and opens into the Bay of Bengal, dissolving into the boundless ocean — the past pouring into the limitless possibilities of the future.",
];

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

  /* Region label sizing — readable at both inline and fullscreen sizes. */
  const labelSize = { lg: 15, md: 12, sm: 10 };

  /* NOTE: this used to carry the `fig-viz` class, but the wrapper around
     this component (RiverFigure) now owns that role so the figure-stub
     has exactly one `.fig-viz` child for the FigureFrame fullscreen layout. */
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-md"
      style={{
        border: "1px solid rgb(var(--c-text-rgb) / 0.1)",
        background: "rgb(var(--c-bg-rgb) / 0.5)",
      }}
      aria-label="Brahmaputra river system mapped to the seven cosmic ages — click any numbered node to jump to that age"
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block w-full h-full" preserveAspectRatio="xMidYMid meet">
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
                    y={cy - h - 5}
                    textAnchor="middle"
                    fontSize="10"
                    letterSpacing="1.4"
                    fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                    fill="rgb(var(--c-text-rgb) / 0.6)"
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
          fontSize="13"
          letterSpacing="2"
          fontStyle="italic"
          fontFamily="var(--font-serif)"
          fill="rgb(var(--c-accent-rgb) / 0.6)"
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

        {/* Twin lakes west of the Angsi source — Manasarovar (east) and
           Rakshashtal (west), linked by the narrow Ganga-Chhu channel.
           Each label is placed on the outer side of its lake so the two
           labels can never overlap each other. */}
        {(() => {
          const projRX = (rxDeg: number) => rxDeg * DEG;
          const projRY = (ryDeg: number) => ryDeg * DEG;
          const lakes = LAKES.map((l) => ({
            ...l,
            cx: projX(l.lng),
            cy: projY(l.lat),
            rx: projRX(l.rxDeg),
            ry: projRY(l.ryDeg),
          }));
          /* Channel: a thin line from the east edge of the western
             lake to the west edge of the eastern lake. */
          const west = lakes.find((l) => l.id === "rakshashtal")!;
          const east = lakes.find((l) => l.id === "manasarovar")!;
          const channelX1 = west.cx + west.rx;
          const channelX2 = east.cx - east.rx;
          const channelY = (west.cy + east.cy) / 2;
          return (
            <g>
              <line
                x1={channelX1}
                y1={channelY}
                x2={channelX2}
                y2={channelY}
                stroke="rgb(var(--c-accent-rgb) / 0.7)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              {lakes.map((l) => {
                const onEast = l.labelSide === "east";
                const labelX = onEast ? l.cx + l.rx + 5 : l.cx - l.rx - 5;
                const labelY = l.cy + 3.5;
                return (
                  <g key={l.id}>
                    <ellipse
                      cx={l.cx}
                      cy={l.cy}
                      rx={l.rx}
                      ry={l.ry}
                      fill="rgb(var(--c-accent-rgb) / 0.32)"
                      stroke="rgb(var(--c-accent-rgb) / 0.7)"
                      strokeWidth="0.8"
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor={onEast ? "start" : "end"}
                      fontSize="10"
                      fontStyle="italic"
                      fontFamily="var(--font-serif)"
                      fill="rgb(var(--c-accent-rgb) / 0.9)"
                    >
                      {l.label}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}

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
                y={sy - 16}
                textAnchor="middle"
                fontSize="11"
                letterSpacing="2"
                fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                fill="rgb(var(--c-solar-rgb) / 0.9)"
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
              <circle cx={cx} cy={cy} r="3" fill="rgb(var(--c-text-rgb) / 0.85)" />
              <circle cx={cx} cy={cy} r="3" fill="none" stroke="rgb(var(--c-text-rgb) / 0.55)" strokeWidth="0.5" />
              <text
                x={cx + 6}
                y={cy + 4.5}
                fontSize="12"
                letterSpacing="0.8"
                fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                fill="rgb(var(--c-text-rgb) / 0.75)"
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
              {(() => {
                /* Node size grows downstream so Angsi reads as a small
                   source and Meghna as a wide delta-mouth. */
                const baseR = 7 + i * 0.7;
                const activeR = baseR + 2.8;
                const nodeR = isActive ? activeR : baseR;
                const pulseR = activeR + 7;
                const textSize = (isActive ? 11 : 9) + i * 0.4;
                const textDy = textSize * 0.34;
                return (
                  <>
                    {isActive && (
                      <circle cx={cx} cy={cy} r={pulseR} fill="rgb(var(--c-accent-rgb) / 0.22)" className="rivernode-pulse" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={nodeR}
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
                      y={cy + textDy}
                      textAnchor="middle"
                      fontSize={textSize}
                      fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                      fontWeight={700}
                      fill={visited ? "rgb(var(--c-bg-rgb))" : "rgb(var(--c-accent-rgb))"}
                      style={{ pointerEvents: "none" }}
                    >
                      {i + 1}
                    </text>
                  </>
                );
              })()}
              {/* Wider transparent hit target for tap-friendliness */}
              <circle cx={cx} cy={cy} r="22" fill="transparent" />
            </g>
          );
        })}

        {/* Compass + scale in the bottom-left */}
        <g transform={`translate(20, ${MAP_H - 56})`}>
          <text
            x={0}
            y={0}
            fontSize="10"
            letterSpacing="2"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            fill="rgb(var(--c-text-rgb) / 0.5)"
          >
            N ↑
          </text>
          <line x1={0} y1={22} x2={DEG * 2} y2={22} stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1" />
          <line x1={0} y1={17} x2={0} y2={27} stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1" />
          <line x1={DEG * 2} y1={17} x2={DEG * 2} y2={27} stroke="rgb(var(--c-text-rgb) / 0.45)" strokeWidth="1" />
          <text x={0} y={38} fontSize="10" letterSpacing="1" fontFamily="ui-monospace, monospace" fill="rgb(var(--c-text-rgb) / 0.5)">
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

function AgeDescription({
  seg,
  idx,
  description,
  onPrev,
  onNext,
}: {
  seg: RiverSegment;
  idx: number;
  description: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const atStart = idx === 0;
  const atEnd = idx === RIVER_SEGMENTS.length - 1;
  return (
    <div className="age-description rounded-md p-4 md:p-5 border border-plasma/25 bg-[rgb(var(--c-bg-rgb)/0.86)] backdrop-blur shadow-[0_18px_48px_-22px_rgb(0_0_0_/_0.6)]">
      <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-plasma/80 mb-3 flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-plasma shadow-[0_0_8px_#22d3ee]" />
        now flowing · {String(idx + 1).padStart(2, "0")} of 07
      </div>
      <div className="flex items-baseline gap-3 flex-wrap mb-1.5">
        <div
          className="font-serif text-white/95 leading-tight"
          style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.8rem)" }}
        >
          {seg.name}
        </div>
        <div className="font-sans text-[13px] text-white/70">{seg.age}</div>
      </div>
      <div className="flex items-center gap-3 flex-wrap font-mono text-[10px] tracking-[0.2em] uppercase text-white/45 pb-3 border-b border-white/[0.08]">
        <span>{seg.country}</span>
        <span className="text-white/25">·</span>
        <span className="text-plasma/85 tracking-[0.14em] normal-case">{seg.range}</span>
      </div>
      <p
        key={idx}
        className="mt-4 text-white/80 leading-[1.65] text-[14px] font-sans age-fade"
      >
        {description}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={atStart}
          data-shortcut="ArrowLeft"
          className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/85 hover:text-plasma disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous age"
        >
          ← prev
        </button>
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/35">
          map · ← → keys
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={atEnd}
          data-shortcut="ArrowRight"
          className="font-mono text-[10px] tracking-[0.22em] uppercase text-plasma/85 hover:text-plasma disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next age"
        >
          next →
        </button>
      </div>
    </div>
  );
}

/* The figure-shaped React export. Renders:
     <figure.figure-stub>
       <div.fig-viz>              ← the map + overlaid AgeDescription
       <figcaption>               ← Fig. 0.0.a — A river of time. …

   The surrounding page (0.0.astro) wraps this in <FigureFrame variant="wide">,
   which provides the unified ⛶/ESC fullscreen + scoped arrow-key shortcuts. */
export default function RiverFigure() {
  const [activeIdx, setActiveIdx] = useState(0);

  const activeSeg = RIVER_SEGMENTS[activeIdx];
  const progress = (activeIdx + 1) / RIVER_SEGMENTS.length;

  const onNodeClick = useCallback((i: number) => {
    setActiveIdx(i);
  }, []);

  const onPrev = useCallback(
    () => setActiveIdx((i) => Math.max(0, i - 1)),
    []
  );
  const onNext = useCallback(
    () => setActiveIdx((i) => Math.min(RIVER_SEGMENTS.length - 1, i + 1)),
    []
  );

  return (
    <figure
      data-fade
      className="figure-stub fig-river-figure my-12 rounded-md p-3 md:p-4 relative overflow-hidden"
    >
      <div
        className="fig-viz relative w-full"
        style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
      >
        <RiverMap activeIdx={activeIdx} progress={progress} onNodeClick={onNodeClick} />

        {/* AgeDescription overlay — lower-left of the map, present in both
            normal view and FigureFrame fullscreen (same DOM). */}
        <div
          className="absolute left-3 bottom-3 md:left-5 md:bottom-5 pointer-events-auto"
          style={{
            width: "min(420px, calc(100% - 24px))",
            maxHeight: "min(60%, 480px)",
            overflow: "auto",
          }}
        >
          <AgeDescription
            seg={activeSeg}
            idx={activeIdx}
            description={AGE_DESCRIPTIONS[activeIdx]}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>
      </div>
      <figcaption>
        <span className="figure-tag">Fig. 0.0.a</span>
        <span className="figure-title"> — A river of time.</span>{" "}
        The seven named segments of the international Brahmaputra map one-to-one
        onto the seven cosmic ages — from the Angsi glacier of the first quark
        soup to the Meghna delta dissolving into the open ocean of unwritten
        history. Click any numbered node to step into that age&rsquo;s story.
      </figcaption>
    </figure>
  );
}
