export type TimelineAge = {
  id: string;
  name: string;
  range: string;
  color: string;
};

export type CosmicEvent = {
  age: number;
  marker: string;
  title: string;
  body: string;
  pct: number;
};

export const TIMELINE_AGES: TimelineAge[] = [
  { id: "particle",   name: "Particle age",   range: "0 — 1 Myr",       color: "#fbbf24" },
  { id: "galactic",   name: "Galactic age",   range: "1 Myr — 4 Gyr",   color: "#22d3ee" },
  { id: "stellar",    name: "Stellar age",    range: "4 — 9 Gyr",       color: "#a5f3fc" },
  { id: "planetary",  name: "Planetary age",  range: "9 — 11 Gyr",      color: "#f59e0b" },
  { id: "chemical",   name: "Chemical age",   range: "11 — 13 Gyr",     color: "#c4b5fd" },
  { id: "biological", name: "Biological age", range: "last ~1 Gyr",     color: "#34d399" },
  { id: "cultural",   name: "Cultural age",   range: "last ~1 Myr",     color: "#fde68a" },
];

export const EVENTS: CosmicEvent[] = [
  // PARTICLE
  {
    age: 0,
    marker: "t = 0",
    title: "The Big Bang",
    body: `The event that created all space, time, energy, and matter itself. The Universe emerged as an unimaginably hot, incredibly dense point and instantly swelled outward — the "primeval fireball" we call the Big Bang.`,
    pct: 0.0001,
  },
  {
    age: 0,
    marker: "10⁻³⁵ — 10⁻³² s",
    title: "Cosmic Inflation",
    body: `In a tiny fraction of a second, the Universe ballooned in size by a factor of roughly 10⁵⁰. This ultra-fast growth ironed out the early wrinkles, leaving the cosmos almost perfectly smooth.`,
    pct: 0.0001,
  },
  {
    age: 0,
    marker: "10⁻⁴³ — 10⁻¹⁰ s",
    title: "Separation of Forces",
    body: `As the Universe cooled, a single "superforce" split into the four forces that run nature today: gravity (holds stars and planets together), the strong force (glues atomic nuclei), the weak force (drives radioactive decay), and electromagnetism (binds atoms into matter).`,
    pct: 0.0001,
  },
  {
    age: 0,
    marker: "10⁻³⁵ — 1 s",
    title: "Particle Creation & Annihilation",
    body: `Pure energy turned into particles — quarks and electrons, the tiny building blocks of matter — paired with antimatter, their mirror-image twins. When matter and antimatter met, they wiped each other out, leaving a slight excess of ordinary matter that built everything we see today.`,
    pct: 0.0002,
  },
  {
    age: 0,
    marker: "3 — 15 min",
    title: "Primordial Nucleosynthesis",
    body: `Once the Universe cooled below 10⁹ K, protons and neutrons (the particles inside atomic cores) could stick together. They fused into the first atomic nuclei: mostly helium and heavy hydrogen (deuterium), with a trace of lithium.`,
    pct: 0.0003,
  },
  {
    age: 0,
    marker: "50,000 yrs",
    title: "Matter Domination",
    body: `The Universe crossed a tipping point: the energy held in ordinary matter (particles like protons and atoms) finally overtook the energy in light and radiation. From here on, gravity could start gathering matter into the clumps that would become stars and galaxies.`,
    pct: 0.0004,
  },
  {
    age: 0,
    marker: "380,000 yrs",
    title: "Recombination & Decoupling",
    body: `Electrons finally settled around atomic nuclei to make the first complete, neutral atoms, clearing the hot, glowing "fog" of free particles. Light could now stream freely across space — and that ancient light still fills the sky today as the Cosmic Microwave Background (CMB).`,
    pct: 0.0005,
  },

  // GALACTIC
  {
    age: 1,
    marker: "1 Myr — 200 Myr",
    title: "The Cosmic Dark Ages",
    body: `After the first atoms formed, the Universe was full of hydrogen and helium gas but had no stars or galaxies yet — so it was dark. Gravity slowly tugged this gas into denser and denser clumps, seeding the galaxies to come.`,
    pct: 0.014,
  },
  {
    age: 1,
    marker: "200 Myr",
    title: "Cosmic Dawn · Reionization",
    body: `The first massive stars and baby galaxies switched on. Their fierce ultraviolet (UV) light tore the electrons back off the hydrogen filling space, ending the Dark Ages and making the Universe see-through to UV light.`,
    pct: 0.015,
  },
  {
    age: 1,
    marker: "500 Myr — 1 Gyr",
    title: "Hierarchical Merging",
    body: `Small "baby galaxies" and dwarf galaxies crashed together and merged into bigger ones. Driven by gravity, this build-it-up-from-pieces process assembled the large galaxies we see today, including the outer halo of our Milky Way.`,
    pct: 0.06,
  },
  {
    age: 1,
    marker: "1 — 2 Gyr",
    title: "Rise of Supermassive Black Holes",
    body: `Enormous amounts of matter collapsed at the centers of young galaxies to form black holes. Gas spiraling into them released staggering energy, powering the first quasars — galaxy cores that blazed as bright as a trillion suns.`,
    pct: 0.11,
  },
  {
    age: 1,
    marker: "2 — 3 Gyr",
    title: "Peak Quasar Epoch",
    body: `Galaxy centers shone at their brightest as their black holes feasted on surrounding gas. As the fuel ran low, the fireworks faded, leaving quiet, dormant black holes lurking at the heart of most normal galaxies.`,
    pct: 0.18,
  },
  {
    age: 1,
    marker: "3 Gyr",
    title: "Large-Scale Structure Formation",
    body: `Gravity drew galaxies into vast sheets, filaments, and clusters, separated by enormous empty voids. Together they form the frothy, bubble-like pattern astronomers call the "cosmic web."`,
    pct: 0.22,
  },
  {
    age: 1,
    marker: "4 Gyr",
    title: "Birth of Population I Stars",
    body: `Exploding stars from earlier generations had seeded the galaxies with heavy elements. A new wave of element-rich stars now formed in the galactic disks — the kind of stars that can hold planets — opening the way to the Stellar Age.`,
    pct: 0.29,
  },

  // STELLAR
  {
    age: 2,
    marker: "4 Gyr",
    title: "Formation of the Milky Way's Thin Disk",
    body: `The Milky Way settled into a flat, spinning disk. With it came a fresh generation of element-rich stars, carrying the carbon, oxygen, and other heavy elements forged inside the stars that had lived and died before them.`,
    pct: 0.30,
  },
  {
    age: 2,
    marker: "4 — 5 Gyr",
    title: "Peak Star Formation Rate",
    body: `The Universe built stars faster than at any time before or since. Deep in their cores, massive stars fused hydrogen and helium into heavier elements like carbon, oxygen, and iron — the raw material of future planets and life.`,
    pct: 0.33,
  },
  {
    age: 2,
    marker: "6 Gyr",
    title: "Galactic Habitable Zone",
    body: `A "comfortable" zone took shape within the galaxy where life had a chance. Enough heavy elements had spread there to build planets, while deadly nearby supernova blasts had grown rare enough to leave those planets in peace.`,
    pct: 0.43,
  },
  {
    age: 2,
    marker: "4 — 9 Gyr",
    title: "Stellar Nucleosynthesis",
    body: `Stars act as giant furnaces. Ordinary stars fuse hydrogen into helium; massive, aging stars keep going, building helium into carbon, neon, oxygen, silicon, and finally iron — forging the chemical variety that planets are made from.`,
    pct: 0.47,
  },
  {
    age: 2,
    marker: "4 — 9 Gyr",
    title: "Supernova Enrichment",
    body: `When massive stars died, they exploded as supernovae and flung their enriched material out into space. These blasts also created elements heavier than iron — such as gold and uranium — which cannot form in an ordinary, living star.`,
    pct: 0.52,
  },
  {
    age: 2,
    marker: "7 Gyr",
    title: "Acceleration of Cosmic Expansion",
    body: `The expansion of the Universe began to speed up, pushed by a mysterious force called "dark energy." This handed the cosmos from a matter-ruled era to a dark-energy-ruled one, gradually slowing the build-up of giant structures.`,
    pct: 0.51,
  },
  {
    age: 2,
    marker: "9 Gyr",
    title: "Solar Nebula Collapse",
    body: `The Stellar Age ended close to home: a chemically rich cloud of gas and dust in our part of the Milky Way collapsed under its own gravity — perhaps nudged by a nearby supernova — giving birth to the Sun and Solar System about 4.6 billion years ago.`,
    pct: 0.65,
  },

  // PLANETARY
  {
    age: 3,
    marker: "9.1 Gyr",
    title: "Accretion of Planetesimals",
    body: `Inside the young Solar System, dust grains bumped and stuck together, slowly growing into kilometer-sized lumps called planetesimals. Gravity then pulled these lumps together, collision after collision, to build the early planets.`,
    pct: 0.66,
  },
  {
    age: 3,
    marker: "9.1 Gyr",
    title: "The T-Tauri Solar Wind",
    body: `The newborn Sun went through a stormy youth (its "T-Tauri" phase), blasting out intense wind and radiation. This swept away the leftover gas and dust, halted the growth of the giant outer planets, and stripped the early atmospheres off the inner planets.`,
    pct: 0.67,
  },
  {
    age: 3,
    marker: "9.2 Gyr",
    title: "Planetary Differentiation",
    body: `Heat from constant impacts and radioactive decay melted the early Earth right through. Heavy metals like iron and nickel sank to the center to form the core, while lighter rock floated up to become the mantle and crust.`,
    pct: 0.67,
  },
  {
    age: 3,
    marker: "9.2 Gyr",
    title: "Formation of the Moon",
    body: `A Mars-sized world slammed into the newly layered Earth. The wreckage from this colossal crash spread into a ring around our planet, which quickly clumped back together to form the Moon.`,
    pct: 0.67,
  },
  {
    age: 3,
    marker: "9.4 Gyr",
    title: "Atmosphere & Oceans",
    body: `As Earth cooled, volcanoes belched out water vapor and carbon dioxide from deep inside, forming a new atmosphere. When temperatures fell far enough, the vapor condensed into the first oceans — topped up by water carried in by comets.`,
    pct: 0.68,
  },
  {
    age: 3,
    marker: "9.6 — 10 Gyr",
    title: "Late Heavy Bombardment",
    body: `Swarms of asteroids and comets pounded the young planets, smashing Earth's crust and keeping its surface molten and hostile. This violent "clean-up" of leftover Solar System debris dragged on for millions of years.`,
    pct: 0.71,
  },
  {
    age: 3,
    marker: "10 — 11 Gyr",
    title: "Stabilization of the Lithosphere",
    body: `Earth's crust finally cooled and hardened, and the first continents took shape. The Planetary Age closed as our once-molten, chaotic world became a steady, solid home where complex chemistry could begin.`,
    pct: 0.78,
  },

  // CHEMICAL
  {
    age: 4,
    marker: "10.5 — 11 Gyr",
    title: "Prebiotic Synthesis",
    body: `On the energy-rich early Earth, simple gases like methane and ammonia were zapped by lightning and ultraviolet sunlight. These jolts of energy assembled life's first chemical building blocks: amino acids and nucleotide bases (the chemical "letters" that spell out DNA and RNA).`,
    pct: 0.80,
  },
  {
    age: 4,
    marker: "11 Gyr",
    title: "Formation of Protocells",
    body: `Organic molecules gathered inside tiny water droplets wrapped in simple, leaky membranes. These pre-life bubbles could grow and run basic chemistry, but they still couldn't reliably pass their traits to offspring — the missing step between chemistry and life.`,
    pct: 0.80,
  },
  {
    age: 4,
    marker: "11 Gyr",
    title: 'The "RNA World"',
    body: `Long before DNA and proteins took over, the molecule RNA (a single-stranded cousin of DNA) may have done two jobs at once: storing genetic instructions and speeding up chemical reactions. That double role bridged the gap between lifeless chemistry and true biology.`,
    pct: 0.80,
  },
  {
    age: 4,
    marker: "11.5 Gyr",
    title: "Emergence of Prokaryotes",
    body: `The first true living cells appeared, probably as bacteria around hydrothermal vents — cracks on the sea floor that gush hot, mineral-rich water. These simple single cells (prokaryotes, cells with no nucleus) fed on the organic "soup" of the early oceans.`,
    pct: 0.83,
  },
  {
    age: 4,
    marker: "12 Gyr",
    title: "Invention of Photosynthesis",
    body: `Microbes called cyanobacteria evolved a game-changing trick: using sunlight to turn carbon dioxide and water into food. Life no longer had to scavenge scarce molecules from the water, so it could spread across the whole planet.`,
    pct: 0.87,
  },
  {
    age: 4,
    marker: "12.2 Gyr",
    title: "The Oxygen Crisis",
    body: `Photosynthesis released oxygen as a waste product, and it slowly built up in the air. This new oxygen was poison to many early microbes that lived without it — yet it also unlocked a far more powerful way to release energy (breathing), clearing the path for complex life.`,
    pct: 0.88,
  },
  {
    age: 4,
    marker: "12.5 Gyr",
    title: "Eukaryotic Symbiosis",
    body: `A large cell swallowed smaller bacteria but, instead of digesting them, let them live on inside as partners. Those captured bacteria became the cell's power plants (mitochondria) and food-makers (chloroplasts), creating the first complex cells with a nucleus — the ancestors of all plants and animals.`,
    pct: 0.90,
  },

  // BIOLOGICAL
  {
    age: 5,
    marker: "1 Gyr ago",
    title: "Rise of Multicellularity",
    body: `Single complex cells began clustering together and dividing up the work — some specializing in feeding, others in movement or reproduction. This teamwork let living things grow larger and far more sophisticated.`,
    pct: 0.93,
  },
  {
    age: 5,
    marker: "540 — 600 Myr",
    title: "The Cambrian Explosion",
    body: `A sudden burst of new life forms, often nicknamed "biology's big bang." In a short span, most of today's basic animal body plans appeared, along with the first hard shells and skeletons and a fierce predator-versus-prey arms race.`,
    pct: 0.957,
  },
  {
    age: 5,
    marker: "400 — 475 Myr",
    title: "Colonization of Land",
    body: `Life crept out of the oceans onto the bare continents. Simple plants like mosses adapted first, followed by arthropods (insects, spiders) and early amphibians — all of which needed major new body parts to cope with gravity and the danger of drying out.`,
    pct: 0.968,
  },
  {
    age: 5,
    marker: "300 Myr",
    title: "Dominance of Reptiles",
    body: `Reptiles evolved waterproof skin and tough, shelled eggs that could survive on dry land. No longer tied to water to breed, they spread across the giant supercontinent Pangea and came to rule the planet.`,
    pct: 0.978,
  },
  {
    age: 5,
    marker: "200 Myr",
    title: "Emergence of Mammals",
    body: `The first small, warm-blooded mammals appeared during the Triassic period. Overshadowed by the dinosaurs for ages, they quietly developed key traits — fur, milk for their young, and bigger brains for their body size.`,
    pct: 0.985,
  },
  {
    age: 5,
    marker: "65 Myr",
    title: "K-T Mass Extinction",
    body: `A giant asteroid struck near Chicxulub, Mexico, throwing the climate into chaos and wiping out the dinosaurs along with about half of all plant species. With the dinosaurs gone, mammals spread into the empty niches and took over the world.`,
    pct: 0.995,
  },
  {
    age: 5,
    marker: "5 — 7 Myr",
    title: "Divergence of Hominids",
    body: `As Africa's climate dried and its forests shrank, the ancestors of humans split away from the other great apes and began walking upright on two legs. This parting set the stage for the Cultural Age.`,
    pct: 0.9996,
  },

  // CULTURAL
  {
    age: 6,
    marker: "1 Myr — 500 ky",
    title: "Control of Fire",
    body: `Humans tamed fire for warmth, protection, and — crucially — cooking. Cooked food is easier to digest and releases more energy, working like an "extra stomach" that fueled the growth of the brain even before it reached its modern size.`,
    pct: 0.99996,
  },
  {
    age: 6,
    marker: "200 — 300 ky",
    title: "Emergence of Humans",
    body: `Modern humans appeared in Africa. Physically much like their ancestors, they had a far greater gift for communication and for inventing and adapting technology — the spark that marks the biological start of the Cultural Age.`,
    pct: 0.99998,
  },
  {
    age: 6,
    marker: "50 ky",
    title: 'The "Cultural Explosion"',
    body: `A sudden flowering of modern human behavior: refined tool kits, cave paintings (like those at Lascaux), and fully developed symbolic language. This creative leap is often called "culture's big bang."`,
    pct: 0.999996,
  },
  {
    age: 6,
    marker: "10 ky",
    title: "The Agricultural Revolution",
    body: `After the last ice age, people stopped roaming to hunt and gather and learned to farm crops and raise animals. Farming captured far more of the Sun's energy as food, so populations boomed and humans settled into permanent villages.`,
    pct: 0.9999993,
  },
  {
    age: 6,
    marker: "5 ky",
    title: "Rise of Civilization",
    body: `Dense cities rose, complete with rulers, social classes, and specialized jobs — and humans invented writing, such as Sumerian cuneiform. Recorded history begins here, with the world's first city-states.`,
    pct: 0.9999996,
  },
  {
    age: 6,
    marker: "250 yrs",
    title: "The Industrial Revolution",
    body: `Humanity learned to tap the energy locked in fossil fuels (coal and oil), boosting the work each person could do by nearly 100 times. This flood of power drove machines, mechanized production, and tied the world into a single global society.`,
    pct: 0.99999998,
  },
  {
    age: 6,
    marker: "present · future",
    title: 'The "Life Era"',
    body: `We may be entering a brand-new chapter of cosmic history — one where thinking, living beings begin to reshape matter and even life itself. Humans have grown from passengers on Earth into agents of change, able to leave the planet, edit genes, and perhaps one day reshape worlds.`,
    pct: 1.0,
  },
];

export function pctToAgo(p: number): string {
  const gyr = (1 - p) * 13.8;
  if (gyr > 1)     return `${gyr.toFixed(2)} Gyr ago`;
  if (gyr > 0.001) return `${(gyr * 1000).toFixed(1)} Myr ago`;
  if (gyr > 1e-6)  return `${(gyr * 1e6).toFixed(1)} kyr ago`;
  if (gyr > 1e-9)  return `${(gyr * 1e9).toFixed(0)} yr ago`;
  return "today";
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
