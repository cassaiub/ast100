/* Course navigation map — used by the global SiteNav, mobile menu,
   chapter overview topic-card grids, and prev/next footer helpers.
   Subpage `live` flag determines whether the link is clickable or
   marked "coming soon" in the dropdown UI. */

/* Prepend the configured Astro `base:` to a logical path so the URL
   resolves correctly under a subpath deploy (e.g. cassa.bd/courses/ast100).
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
    overviewLive: true,
    subs: [
      {
        id: "2.1",
        title: "The Milky Way",
        live: true,
        tease:
          "Our home galaxy, mapped from two angles. Face-on it is a barred spiral 100,000 light-years wide; edge-on, a paper-thin disk wrapped in a halo of ancient stars, with the Sun riding two-thirds of the way out. Yet trapped inside it, we know its shape only from the hazy band of light that crosses a dark night sky.",
      },
      {
        id: "2.2",
        title: "Types of Galaxies",
        live: true,
        tease:
          "Every galaxy fits onto Hubble's tuning fork — smooth ellipticals, hinge-point lenticulars, and spiral prongs both plain and barred — shapes forged over eleven billion years of mergers. A rare few turn 'active', outshining all their stars from a black-hole engine whose name (Seyfert, quasar, blazar) depends only on the angle we view it from.",
      },
      {
        id: "2.3",
        title: "Formation and Evolution of Galaxies",
        live: true,
        tease:
          "Gravity worked on the faint ripples left by the Big Bang for billions of years, drawing matter into a cosmic web of glowing filaments and clusters strung around dark voids. Galaxies lit up where the threads ran densest — then grew from the bottom up, by collision and merger, building today's spirals and ellipticals one crash at a time.",
      },
      {
        id: "2.4",
        title: "Hubble's Law",
        live: true,
        tease:
          "Edwin Hubble measured how far galaxies lie, using pulsating Cepheid stars, and how fast they recede, from the redshift of their light — and found a stunningly simple rule: the farther a galaxy, the faster it flees. Its slope dates the Universe at 14 billion years; its meaning is that space itself is expanding.",
      },
    ],
  },
  {
    num: 3,
    age: "Stellar Age",
    title: "Stellar Age",
    telescope: "Gaia",
    weeks: "5–6",
    overviewLive: true,
    description:
      "From roughly four to nine billion years after the Big Bang, the galaxies built in Chapter 2 fill with stars. Across four lessons and seven milestones, Chapter 3 follows the Sun and its furnace, the family of stars sorted by birth mass, the births and deaths that forge the carbon, oxygen, and iron of planets and people, and the white dwarfs, neutron stars, and black holes left behind — closing close to home with the cloud that collapsed to make our own Sun.",
    overviewTease:
      "The Galactic Age built the galaxies; the Stellar Age fills them with stars. From four to nine billion years in, generation after generation ignites, forges the elements the Big Bang never made, and scatters them back — ending with the cloud that became our own Sun.",
    subs: [
      {
        id: "3.1",
        title: "The Sun",
        live: true,
        tease:
          "The Sun is nothing special — an ordinary yellow star that happens to be ours, 150 million km away. But cut it open and it is a layered furnace: a 15-million-degree core fusing hydrogen into helium, wrapped in zones that ferry the heat to a 5,800-degree surface. Each second, four million tonnes become light.",
      },
      {
        id: "3.2",
        title: "Types of Stars",
        live: true,
        tease:
          "No two stars are alike — they range from blue-white to deep red, and from a billion times the Sun's light down to a fraction of it. Yet sort them by colour and brightness and they fall into a few clean families on one chart. Behind it all lies a single quiet rule: birth weight is destiny.",
      },
      {
        id: "3.3",
        title: "Formation and Evolution of Stars",
        live: true,
        tease:
          "A star is just a cold cloud of hydrogen until gravity squeezes its core to ten million degrees and it catches fire. From there, one number — its mass — decides everything: a quiet fade to a white dwarf, or a supernova that forges the carbon, oxygen, and iron of every planet and person.",
      },
      {
        id: "3.4",
        title: "Stellar Remnants",
        live: true,
        tease:
          "Every star dies, but not the same death. What it leaves behind — a cooling Earth-sized cinder, a city-sized ball of neutrons, or a black hole — is set by one number: its birth mass. Follow that fork to its strangest end, where gravity wins so completely not even light escapes.",
      },
    ],
  },
  {
    num: 4,
    age: "Planetary Age",
    title: "Planetary Age",
    telescope: "Kepler",
    weeks: "8–9",
    overviewLive: true,
    description:
      "Around 4.6 billion years ago, in our corner of the Galaxy, the heavy elements forged by the Stellar Age began to gather into worlds. Chapter 4 starts at home: the architecture of the solar system from the rocky inner disk out to the spherical Oort cloud; the families of planets and what their densities reveal; and the disk of gas and dust that assembled eight worlds in a hundred and fifty million years. It ends by leaving home — the three great methods that have found more than 6,300 planets around other stars.",
    overviewTease:
      "The Stellar Age forged the ingredients; the Planetary Age builds the worlds. Around a young yellow star, a spinning disk of gas and dust condenses, collides, and settles into eight planets — a story now confirmed around thousands of other stars by Kepler and its successors.",
    subs: [
      {
        id: "4.1",
        title: "The Solar System",
        live: true,
        tease:
          "Our home system from the inside out: four rocky worlds and a belt of rubble, four giants and a belt of ice — all riding one flat disk — then the vast bubble blown by the solar wind, and finally the Oort cloud, a sphere of comets reaching a third of the way to the next star.",
      },
      {
        id: "4.2",
        title: "Types of Planets",
        live: true,
        tease:
          "More than 6,300 planets are now known, and they sort into families on two simple charts — size against orbit, mass against radius — from hot Jupiters and lava worlds to the rare Earth-likes. Then two case studies up close: ringed, moon-rich Saturn and the living machine of Earth.",
      },
      {
        id: "4.3",
        title: "Formation and Evolution of Planets",
        live: true,
        tease:
          "A star is born inside a spinning disk of gas and dust, and its planets are the leftovers. Temperature wrote the recipe: rock condensed near the fire, ices beyond the snow line — so the giants grew first, the rocky worlds followed, and one last great collision made our Moon.",
      },
      {
        id: "4.4",
        title: "Discovering Exoplanets",
        live: true,
        tease:
          "No telescope can outstare a star's glare, yet 6,300 worlds have been found around other suns: by catching the dip when a planet's shadow crosses its star, reading the wobble in the colour of starlight, and — for a lucky few — masking the star and photographing the planets themselves.",
      },
    ],
  },
  {
    num: 5,
    age: "Chemical Age",
    title: "Chemical Age",
    telescope: "ALMA",
    weeks: "10",
    overviewLive: true,
    description:
      "Between roughly ten and a half and twelve and a half billion years after the Big Bang, atoms learn to combine. Chapter 5 begins with the periodic table read as a map of cosmic history — every element stamped with the event that forged it — then follows those atoms onto a young Earth: outgassed into an atmosphere, rained down as an ocean, assembled in vents on the sea floor into the first cell, and finally exhaled back into the sky as oxygen. It closes by turning the question outward: could the same chemistry have run anywhere else?",
    overviewTease:
      "The Planetary Age built the worlds; the Chemical Age fills them with molecules — and, on at least one, with life. Atoms become water and air, chemistry becomes a cell, and that cell rebuilds the whole atmosphere. Then the sharpest question in science: has it happened anywhere else?",
    subs: [
      {
        id: "5.1",
        title: "The Periodic Table",
        live: true,
        tease:
          "The periodic table is usually taught as chemistry. It is also a map of cosmic history — colour each element by where its atoms were forged and you get a receipt for the whole course: hydrogen from the Big Bang, carbon from dying stars, iron from exploding white dwarfs, gold from colliding neutron stars.",
      },
      {
        id: "5.2",
        title: "Formation of Oceans and Atmospheres",
        live: true,
        tease:
          "A newborn Earth had no air worth breathing and no ocean at all. Volcanoes exhaled steam that fell as rain for centuries; then life invented photosynthesis and began pumping out a gas so reactive it rusted the seas, poisoned nearly everything alive, and became a fifth of the air you breathe.",
      },
      {
        id: "5.3",
        title: "Origin of Life on Earth",
        live: true,
        tease:
          "Somewhere around four billion years ago, chemistry began copying itself. The leading account starts in a crack in the sea floor, where alkaline water seeping through rock builds a natural battery of protons — the very same trick every living cell on Earth still runs on today.",
      },
      {
        id: "5.4",
        title: "Life on Other Planets",
        live: true,
        tease:
          "The band around a star where water stays liquid, the few dozen rocky worlds we have found inside one, and the way starlight filtered through a distant atmosphere could betray life: oxygen and methane together, two gases that destroy each other. So far, no confirmed detection anywhere.",
      },
    ],
  },
  {
    num: 6,
    age: "Biological Age",
    title: "Biological Age",
    telescope: "JWST",
    weeks: "11",
    overviewLive: true,
    description:
      "The Chemical Age made a cell; the Biological Age makes everything else. Chapter 6 draws the family tree of all living things — and finds that bacteria hold nearly all of life's diversity while every animal and plant is one thin twig. It follows the accidental swallowing that produced the complex cell, the long pause and then the explosion of bodies, eyes, and limbs, and the five catastrophes that nearly ended it all. It closes with the Drake equation, and an honest accounting of the silence.",
    overviewTease:
      "One microbe swallows another and complex life becomes possible. Cells learn to live in bodies; bodies grow eyes and crawl ashore; and five times, most of it dies. Seven milestones, four lessons, and a tree whose proportions put us firmly in our place.",
    subs: [
      {
        id: "6.1",
        title: "Tree of Life",
        live: true,
        tease:
          "Everything alive is related by descent from a single cell — and we can prove it, because every organism still uses the same four-letter alphabet and the same genetic dictionary. Draw the tree honestly, though, and it is humbling: the entire visible living world is one thin twig on a bush of microbes.",
      },
      {
        id: "6.2",
        title: "Rise of the Eukaryotes",
        live: true,
        tease:
          "Two billion years ago one microbe swallowed another and failed to digest it. The passenger could burn food with oxygen, and it started paying rent in energy. It is still inside you, in every cell, still carrying its own bacterial DNA — and every animal, plant, and fungus descends from that single undigested meal.",
      },
      {
        id: "6.3",
        title: "Mass Extinctions",
        live: true,
        tease:
          "Five times, most species on Earth died in a geological instant. Four were the planet's own doing — volcanoes rewriting the atmosphere; one came from space and ended the dinosaurs. What kills is not the size of the change but its speed, and that is not a historical lesson.",
      },
      {
        id: "6.4",
        title: "Life in the Universe",
        live: true,
        tease:
          "The Drake equation breaks 'are we alone?' into seven numbers — and this course has now measured the first three. The other four are guesses that swing the answer from millions to less than one. Meanwhile the Galaxy is silent, which is exactly what a Galaxy with distant neighbours would sound like.",
      },
    ],
  },
  {
    num: 7,
    age: "Cultural Age",
    title: "Cultural Age",
    telescope: "Allen Array",
    weeks: "12",
    overviewLive: true,
    description:
      "The final age, and the shortest by far. In the last million years — a rounding error on this course's clock — one branch of one primate lineage learned to control fire, to farm, to write, and to burn buried sunlight. Chapter 7 follows that curve, then the two-thousand-year argument about what the universe is and where we sit in it, then the sky as humanity's first calendar, clock, and compass. It ends by pointing the instruments outward and listening — so far, to silence.",
    overviewTease:
      "Fire, farming, cities, industry — and a species that reconstructed the entire fourteen-billion-year story of which it is the latest sentence, then began listening for anyone else who managed the same. Seven milestones, four lessons, and one question left open.",
    subs: [
      {
        id: "7.1",
        title: "History of the World",
        live: true,
        tease:
          "For 95% of our history there were never more than a few hundred thousand of us. Then farming, writing, and buried sunlight bent the curve nearly vertical. Everything you would call history happens in that final stroke — including the walk that carried one African primate to every habitable place on Earth.",
      },
      {
        id: "7.2",
        title: "History of Mapping the Worlds",
        live: true,
        tease:
          "Every age draws the universe and puts itself somewhere in the picture. We began at the exact centre of creation and ended as one planet, of one star, at one moment in a history with no centre at all. Four maps, two thousand years, and a series of demotions that all turned out to be right.",
      },
      {
        id: "7.3",
        title: "Role of the Sky in Culture",
        live: true,
        tease:
          "The year comes from the tilt, the month from the Moon, and the names of the days from seven wandering lights — Thursday is Jupiter's day, and so is Brihaspatibar. The sky was humanity's first calendar, first clock, first compass, and first library.",
      },
      {
        id: "7.4",
        title: "Search for Extraterrestrial Intelligence",
        live: true,
        tease:
          "Measured in energy per gram, a modern society runs hotter than a brain, a plant, or a star — the most intense thing we know of. And it is now listening for anyone else who managed the same climb. Sixty years of listening have produced silence; we have also searched only a hot tub's worth of a cosmic ocean.",
      },
    ],
  },
];

/* Top-level menu order — matches what students will see.
   `href` values are stored as logical paths (no base) so they can be
   compared against an unprefixed `current` prop; consumers wrap with
   withBase() when emitting the actual <a href>. */
export const TOP_MENU_ORDER: Array<
  | { kind: "link"; href: string; label: string; external?: boolean }
  | { kind: "chapters" }
> = [
  { kind: "link", href: "/", label: "Home" },
  { kind: "link", href: "/outline", label: "Outline" },
  /* External sibling site — `href` is an absolute URL, so it bypasses
     withBase() and opens in a new tab (flagged `external`). */
  {
    kind: "link",
    href: "https://kriterion.cassa.bd",
    label: "Kriterion",
    external: true,
  },
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
  "1.0": [
    { id: "first-instant", label: "The First Instant" },
    { id: "four-forces", label: "One Force → Four" },
    { id: "particles", label: "Matter from Energy" },
    { id: "nucleosynthesis", label: "First Nuclei" },
    { id: "matter-domination", label: "Matter Takes Over" },
    { id: "recombination", label: "The Fog Lifts" },
  ],
  "1.1": [
    { id: "superforce", label: "One Superforce to Four" },
    { id: "hierarchy", label: "The Four Forces" },
  ],
  "1.2": [
    { id: "standard-model", label: "The Standard Model" },
    { id: "origin", label: "Origin of the Particles" },
  ],
  "1.3": [
    { id: "ingredients", label: "The Ingredients" },
    { id: "furnace", label: "The Fifteen-Minute Furnace" },
  ],
  "1.4": [
    { id: "fog", label: "The Fog Lifts" },
    { id: "map", label: "The Baby Picture" },
  ],
  /* Chapter 2 */
  "2.0": [
    { id: "out-of-dark", label: "Out of the Dark" },
    { id: "shapes", label: "A Family of Shapes" },
    { id: "web", label: "The Cosmic Web" },
    { id: "expanding", label: "The Expanding Stage" },
  ],
  "2.1": [
    { id: "anatomy", label: "Galaxy Anatomy" },
    { id: "inside", label: "View from Inside" },
  ],
  "2.2": [
    { id: "tuning-fork", label: "Tuning Fork" },
    { id: "active", label: "Active Galaxies" },
  ],
  "2.3": [
    { id: "cosmic-web", label: "The Cosmic Web" },
    { id: "evolution", label: "How Galaxies Grow" },
  ],
  "2.4": [
    { id: "rulers", label: "Distance & Speed" },
    { id: "law", label: "Hubble's Law" },
  ],
  /* Chapter 3 */
  "3.0": [
    { id: "our-star", label: "Our Star" },
    { id: "the-family", label: "Star Families" },
    { id: "forge", label: "Cosmic Forge" },
    { id: "endings", label: "Endings" },
  ],
  "3.1": [
    { id: "anatomy", label: "Anatomy" },
    { id: "furnace", label: "The Furnace" },
  ],
  "3.2": [
    { id: "classification", label: "Reading Starlight" },
    { id: "mass", label: "Mass Is Destiny" },
  ],
  "3.3": [
    { id: "birth", label: "Birth" },
    { id: "life", label: "Life & Death" },
  ],
  "3.4": [
    { id: "remnants", label: "The Fork" },
    { id: "black-holes", label: "Black Holes" },
  ],
  /* Chapter 4 */
  "4.0": [
    { id: "home", label: "The View from Home" },
    { id: "families", label: "Families of Worlds" },
    { id: "assembly", label: "Building Worlds" },
    { id: "other-suns", label: "Other Suns" },
  ],
  "4.1": [
    { id: "architecture", label: "Four Scales" },
    { id: "worlds", label: "Eight Worlds" },
  ],
  "4.2": [
    { id: "classification", label: "Sorting Worlds" },
    { id: "worlds", label: "Two Up Close" },
  ],
  "4.3": [
    { id: "disk", label: "The Disk" },
    { id: "assembly", label: "The Assembly" },
  ],
  "4.4": [
    { id: "shadows", label: "Planet Shadows" },
    { id: "wobbles", label: "Wobbles & Portraits" },
  ],
  /* Chapter 5 */
  "5.0": [
    { id: "atoms", label: "Atoms & Addresses" },
    { id: "molecules", label: "Air and Sea" },
    { id: "life", label: "Chemistry → Life" },
    { id: "elsewhere", label: "Anywhere Else?" },
  ],
  "5.1": [
    { id: "table", label: "Where Atoms Come From" },
    { id: "furnace", label: "The Onion Furnace" },
  ],
  "5.2": [
    { id: "origins", label: "Air and Sea" },
    { id: "oxygen", label: "The Great Poisoning" },
  ],
  "5.3": [
    { id: "vents", label: "A Battery in the Rock" },
    { id: "steps", label: "Chemistry → Cell" },
  ],
  "5.4": [
    { id: "zone", label: "The Water Zone" },
    { id: "biosignatures", label: "Reading the Air" },
  ],
  /* Chapter 6 */
  "6.0": [
    { id: "tree", label: "One Tree" },
    { id: "complex", label: "The Accident" },
    { id: "crises", label: "Five Catastrophes" },
    { id: "alone", label: "Are We Alone?" },
  ],
  "6.1": [
    { id: "tree", label: "One Ancestor" },
    { id: "domains", label: "Three Domains" },
  ],
  "6.2": [
    { id: "symbiosis", label: "The Swallowing" },
    { id: "dna", label: "Inside the Nucleus" },
  ],
  "6.3": [
    { id: "bigfive", label: "The Big Five" },
    { id: "neos", label: "Rocks That Cross" },
  ],
  "6.4": [
    { id: "drake", label: "Seven Numbers" },
    { id: "silence", label: "The Great Silence" },
  ],
  /* Chapter 7 */
  "7.0": [
    { id: "fire", label: "Fire and Farms" },
    { id: "maps", label: "Redrawing It All" },
    { id: "sky", label: "The Sky We Live By" },
    { id: "listening", label: "And Now We Listen" },
  ],
  "7.1": [
    { id: "curve", label: "The Shape of Us" },
    { id: "migration", label: "Out of Africa" },
  ],
  "7.2": [
    { id: "maps", label: "Four Maps" },
    { id: "demotions", label: "The Demotions" },
  ],
  "7.3": [
    { id: "year", label: "The Sky as Calendar" },
    { id: "month", label: "Month, Week, Zodiac" },
  ],
  "7.4": [
    { id: "complexity", label: "The Cost of Us" },
    { id: "silence", label: "Is Anybody There?" },
    { id: "end", label: "The End" },
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
