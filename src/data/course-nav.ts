/* Course navigation map — used by the global SiteNav, mobile menu,
   chapter overview topic-card grids, and prev/next footer helpers.
   Subpage `live` flag determines whether the link is clickable or
   marked "coming soon" in the dropdown UI. */

/* Prepend the configured Astro `base:` to a logical path so the URL
   resolves correctly under a subpath deploy (e.g. cassa.site/courses/ast100).
   Empty string passes through so the `current=""` default stays a no-op.
   `withBase("/")` (the home link) returns the bare base — never
   `<base>/` — because the site is configured with trailingSlash:'never'. */
export function withBase(p: string): string {
  if (!p) return p;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (p === "/") return base || "/";
  return base + (p.startsWith("/") ? p : "/" + p);
}

export type SubPage = {
  id: string;
  title: string;
  live: boolean;
  /** Optional ~50-word card description shown on the chapter overview
      page ([num]/index.astro). Falls back to "" when not set. */
  tease?: string;
};

export type Chapter = {
  num: number;
  age: string;
  title: string;
  telescope: string;
  weeks: string;
  /** Whether the chapter overview (N.0) page is built and clickable. */
  overviewLive: boolean;
  /** Optional ~100-word chapter description shown under the title on
      the chapter overview page. Falls back to a generic teaser. */
  description?: string;
  /** Optional ~50-word card description for the N.0 chapter-overview
      card on the chapter overview page. Falls back to a generic line. */
  overviewTease?: string;
  subs: SubPage[];
};

export const CHAPTERS: Chapter[] = [
  {
    num: 0,
    age: "Overview",
    title: "Seven Ages of the Universe",
    telescope: "All",
    weeks: "1–2",
    overviewLive: true,
    description:
      "Chapter 0 is the panoramic view of the entire fourteen-billion-year story — the river before we walk to any particular bend. Across four lessons it sets up the conceptual instruments the rest of the course relies on: the language of spacetime and matter, the staircase of cosmic evolution from Big Bang to brain, the geometry of distance and lookback time in an expanding universe, and the telescopes that let us actually see across that geometry. Start with the cinematic Brahmaputra-as-time map below, then read the four lessons in any order — they build on each other but stand alone.",
    overviewTease:
      "The whole fourteen-billion-year story, traced along a river. The seven named segments of the international Brahmaputra — Angsi glacier in Tibet, Tsangpo plateau, Siang gorge, wide Brahmaputra, silt-rich Jamuna, joined Padma, and Meghna into the Bay of Bengal — map onto the seven cosmic ages, from the first hot moment to the present. Click any segment to enter its age. A forty-nine-event cosmic timeline lives one click away on its own page.",
    subs: [
      {
        id: "0.1",
        title: "Spacetime and Energy-Matter",
        live: true,
        tease:
          "Einstein's two revolutions, made interactive. Special relativity collapses space and time into a single fabric: a moving clock ticks slowly compared to a stationary one, and mass and energy turn out to be two forms of the same conserved quantity (E = mc²). General relativity then warps that fabric — gravity is no longer a force but the geometry of curved spacetime, and even massless light bends as it skims a star.",
      },
      {
        id: "0.2",
        title: "Cosmic Evolution",
        live: true,
        tease:
          "How does anything complex get built in a universe that only cools and expands? Cosmic evolution gives the answer: a long tug-of-war between expansion and gravity, with islands of local order forming inside an overall growth of entropy. Inflation, recombination, gravitational clumping, stellar nucleosynthesis, biological complexity — each step adds new structure. Walk a nine-point complexity ladder calibrated in erg per gram per second, from Big Bang to human brain.",
      },
      {
        id: "0.3",
        title: "Observable Universe",
        live: true,
        tease:
          "Looking out is looking back — every photon carries the date stamp of its emission, so a telescope is also a time machine. The observable universe is a sphere of light still in transit toward us. Drag through twenty-seven real cosmological objects sorted by light-travel time, from the Moon at 1.3 seconds to the cosmic microwave background at 13.8 billion years — the practical limit of what we can ever see.",
      },
      {
        id: "0.4",
        title: "Light and Telescopes",
        live: true,
        tease:
          "Astronomy's only signal is light. This lesson peels back what light actually is — coupled oscillating electric and magnetic fields propagating at the speed c — then walks the full electromagnetic spectrum from kilometre-wavelength radio waves through visible light to gamma rays at 10⁻²² metres. A bestiary of fourteen working telescopes across every band, plus a step-through of the Cassegrain reflector's optics, closes the chapter and prepares you to read the data.",
      },
    ],
  },
  {
    num: 1,
    age: "Particle Age",
    title: "Particle Age",
    telescope: "Planck",
    weeks: "3–4",
    overviewLive: true,
    subs: [
      { id: "1.1", title: "The Four Fundamental Forces", live: true },
      { id: "1.2", title: "Formation of Elementary Particles", live: true },
      { id: "1.3", title: "Synthesis of Elements", live: true },
      { id: "1.4", title: "Cosmic Microwave Background", live: true },
    ],
  },
  {
    num: 2,
    age: "Galactic Age",
    title: "Galactic Age",
    telescope: "Hubble",
    weeks: "4–5",
    overviewLive: false,
    subs: [
      { id: "2.1", title: "The Milky Way", live: false },
      { id: "2.2", title: "Types of Galaxies", live: false },
      { id: "2.3", title: "Formation and Evolution of Galaxies", live: false },
      { id: "2.4", title: "Hubble's Law", live: false },
    ],
  },
  {
    num: 3,
    age: "Stellar Age",
    title: "Stellar Age",
    telescope: "Gaia",
    weeks: "5–6",
    overviewLive: false,
    subs: [
      { id: "3.1", title: "The Sun", live: false },
      { id: "3.2", title: "Types of Stars", live: false },
      { id: "3.3", title: "Formation and Evolution of Stars", live: false },
      { id: "3.4", title: "Stellar Remnants", live: false },
    ],
  },
  {
    num: 4,
    age: "Planetary Age",
    title: "Planetary Age",
    telescope: "Kepler",
    weeks: "8–9",
    overviewLive: false,
    subs: [
      { id: "4.1", title: "The Solar System", live: false },
      { id: "4.2", title: "Types of Planets", live: false },
      { id: "4.3", title: "Formation and Evolution of Planets", live: false },
      { id: "4.4", title: "Discovering Exoplanets", live: false },
    ],
  },
  {
    num: 5,
    age: "Chemical Age",
    title: "Chemical Age",
    telescope: "ALMA",
    weeks: "10",
    overviewLive: false,
    subs: [
      { id: "5.1", title: "The Periodic Table", live: false },
      { id: "5.2", title: "Formation of Oceans and Atmospheres", live: false },
      { id: "5.3", title: "Origin of Life on Earth", live: false },
      { id: "5.4", title: "Life on Other Planets", live: false },
    ],
  },
  {
    num: 6,
    age: "Biological Age",
    title: "Biological Age",
    telescope: "JWST",
    weeks: "11",
    overviewLive: false,
    subs: [
      { id: "6.1", title: "Tree of Life", live: false },
      { id: "6.2", title: "Rise of the Eukaryotes", live: false },
      { id: "6.3", title: "Mass Extinctions", live: false },
      { id: "6.4", title: "Life in the Universe", live: false },
    ],
  },
  {
    num: 7,
    age: "Cultural Age",
    title: "Cultural Age",
    telescope: "Allen Array",
    weeks: "12–13",
    overviewLive: false,
    subs: [
      { id: "7.1", title: "History of the World", live: false },
      { id: "7.2", title: "History of Mapping the Worlds", live: false },
      { id: "7.3", title: "Role of the Sky in Culture", live: false },
      { id: "7.4", title: "Search for Extraterrestrial Intelligence", live: false },
    ],
  },
];

/* Top-level menu order — matches what students will see.
   `href` values are stored as logical paths (no base) so they can be
   compared against an unprefixed `current` prop; consumers wrap with
   withBase() when emitting the actual <a href>. */
export const TOP_MENU_ORDER: Array<
  | { kind: "link"; href: string; label: string }
  | { kind: "chapters" }
> = [
  { kind: "link", href: "/", label: "Home" },
  { kind: "chapters" },
  { kind: "link", href: "/timeline", label: "TL" },
  { kind: "link", href: "/mid", label: "MID" },
  { kind: "link", href: "/fin", label: "FIN" },
];

/* Helpers return with-base URLs ready to drop into href=. Use the matching
   *Path versions when comparing against the page's logical `current` prop. */
export function chapterPath(num: number): string {
  return withBase(`/chapter/${num}`);
}

export function subPath(id: string): string {
  const [n] = id.split(".");
  return withBase(`/chapter/${n}/${id}`);
}

export function overviewPath(num: number): string {
  return withBase(`/chapter/${num}/${num}.0`);
}

export function findChapter(num: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.num === num);
}

/* ── Rail anchors ─────────────────────────────────────────────────────
   Per-page section anchors driving the left-rail scroll-spy. Keys are
   sub-page IDs like "0.1" or "1.3"; values are the section heading
   ids inside the page paired with short labels. */
export type RailAnchor = { id: string; label: string };
export type RailItem = {
  id: string;
  title: string;
  href: string;
  live: boolean;
  anchors: RailAnchor[];
};

export const RAIL_ANCHORS: Record<string, RailAnchor[]> = {
  /* Chapter 0 */
  "0.0": [],
  "0.1": [
    { id: "special", label: "Special Theory" },
    { id: "general", label: "General Theory" },
  ],
  "0.2": [
    { id: "big-bang", label: "The First Instant" },
    { id: "tug-of-war", label: "Expansion vs Gravity" },
    { id: "entropy", label: "Islands of Order" },
    { id: "complexity", label: "Complexity Ladder" },
    { id: "freeze", label: "The Long Cold" },
  ],
  "0.3": [
    { id: "time-machine", label: "Looking Out = Back" },
    { id: "horizon", label: "Wall of Time" },
    { id: "curveball", label: "Everyone is Centre" },
    { id: "scale", label: "Trillion Galaxies" },
    { id: "beyond", label: "Beyond the Bubble" },
  ],
  "0.4": [
    { id: "time-machines", label: "Tuned Ears" },
    { id: "what-is-light", label: "What is Light?" },
    { id: "spectrum", label: "Whole Spectrum" },
    { id: "bestiary", label: "Telescopes Tuned" },
    { id: "anatomy", label: "Inside a Telescope" },
  ],
  /* Chapter 1 */
  "1.0": [],
  "1.1": [
    { id: "superforce", label: "The Superforce" },
    { id: "separation", label: "Forces Separate" },
    { id: "hierarchy", label: "Hierarchy of Strengths" },
    { id: "carriers", label: "Force Carriers" },
  ],
  "1.2": [
    { id: "standard-model", label: "The Standard Model" },
    { id: "bricks", label: "Bricks · Fermions" },
    { id: "mortar", label: "Mortar · Bosons" },
    { id: "antimatter", label: "Antimatter Mirror" },
    { id: "origin", label: "Origin of Particles" },
  ],
  "1.3": [
    { id: "quark-soup", label: "Quark Soup" },
    { id: "bottleneck", label: "Deuterium Bottleneck" },
    { id: "alchemy", label: "Cosmic Alchemy" },
    { id: "abundance", label: "75% & 25%" },
  ],
  "1.4": [
    { id: "fog-clears", label: "The Fog Lifts" },
    { id: "redshift", label: "Stretched to Microwaves" },
    { id: "penzias-wilson", label: "Penzias & Wilson" },
    { id: "satellites", label: "COBE → Planck" },
  ],
};

/* Compose the rail items for an entire chapter. The first entry is
   always the N.0 chapter overview; remaining entries come from the
   chapter's subs. Each entry pulls its section anchors out of
   RAIL_ANCHORS by sub-id. */
export function getRailItems(chapterNum: number): RailItem[] {
  const ch = findChapter(chapterNum);
  if (!ch) return [];
  return [
    {
      id: `${chapterNum}.0`,
      title: "Chapter Overview",
      href: overviewPath(chapterNum),
      live: ch.overviewLive,
      anchors: RAIL_ANCHORS[`${chapterNum}.0`] ?? [],
    },
    ...ch.subs.map((s) => ({
      id: s.id,
      title: s.title,
      href: subPath(s.id),
      live: s.live,
      anchors: RAIL_ANCHORS[s.id] ?? [],
    })),
  ];
}
