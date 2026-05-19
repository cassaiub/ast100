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
  { age: 0, marker: "t = 0",                title: "The Big Bang",                              body: 'The singularity event marking the origin of space, time, energy and matter (STEM). The Universe emerges as an unimaginably hot and dense "primeval fireball".', pct: 0.0001 },
  { age: 0, marker: "10⁻³⁵ — 10⁻³² s",      title: "Cosmic Inflation",                          body: "A brief, exponential expansion where the Universe swells in size by a factor of roughly 10⁵⁰. This process smoothed out initial irregularities.", pct: 0.0001 },
  { age: 0, marker: "10⁻⁴³ — 10⁻¹⁰ s",      title: "Separation of Forces",                      body: 'As the Universe cooled, the single unified "superforce" separated into the four fundamental forces of nature: gravity, the strong nuclear force, the weak nuclear force, and electromagnetism.', pct: 0.0001 },
  { age: 0, marker: "10⁻³⁵ — 1 s",          title: "Particle Creation & Annihilation",          body: 'Energy converted into matter via "pair production". Quarks and leptons (e.g., electrons) emerged. Matter and antimatter collided and annihilated, leaving a slight excess of ordinary matter.', pct: 0.0002 },
  { age: 0, marker: "3 — 15 min",           title: "Primordial Nucleosynthesis",                body: 'The Universe cooled sufficiently (below 10⁹ K) for protons and neutrons to fuse. This "Nuclear Epoch" produced the first atomic nuclei: heavy hydrogen (deuterium), helium, and trace amounts of lithium.', pct: 0.0003 },
  { age: 0, marker: "50,000 yrs",           title: "Matter Domination",                         body: 'The "crossover point" where the energy density of matter finally exceeded that of radiation. This marked the end of the Radiation Era and the beginning of the Matter Era, setting the stage for structure formation.', pct: 0.0004 },
  { age: 0, marker: "380,000 yrs",          title: "Recombination & Decoupling",                body: "Electrons combined with nuclei to form neutral atoms. This neutralized the charged fog, allowing photons to travel freely — observable today as the Cosmic Microwave Background (CMB).", pct: 0.0005 },

  // GALACTIC
  { age: 1, marker: "1 Myr — 200 Myr",      title: "The Cosmic Dark Ages",                      body: "Following recombination, the Universe was filled with neutral hydrogen and helium but lacked luminous objects. Gravity slowly pulled matter into denser clumps within a dark, expanding cosmos.", pct: 0.014 },
  { age: 1, marker: "200 Myr",              title: "Cosmic Dawn · Reionization",                body: "The first massive stars and protogalaxies ignited. Their intense ultraviolet radiation re-ionized the surrounding neutral hydrogen, ending the Dark Ages and making the Universe transparent to UV light.", pct: 0.015 },
  { age: 1, marker: "500 Myr — 1 Gyr",      title: "Hierarchical Merging",                      body: "Small \"pregalactic blobs\" and dwarf galaxies collided and merged to build up larger galactic structures. This bottom-up process created the massive galaxies we see today, including the Milky Way's halo.", pct: 0.06 },
  { age: 1, marker: "1 — 2 Gyr",            title: "Rise of Supermassive Black Holes",          body: "Massive concentrations of matter collapsed in the centers of young galaxies to form black holes. The accretion of matter into these holes powered the first quasars, which shone with the brightness of a trillion suns.", pct: 0.11 },
  { age: 1, marker: "2 — 3 Gyr",            title: "Peak Quasar Epoch",                         body: "The era of maximum activity for Active Galactic Nuclei. As galactic cores consumed their fuel supplies, this violent activity eventually subsided, leaving dormant supermassive black holes at the centers of most normal galaxies.", pct: 0.18 },
  { age: 1, marker: "3 Gyr",                title: "Large-Scale Structure Formation",           body: 'Galaxies organized themselves into vast sheets, filaments, and clusters, separated by immense voids, creating the "frothy" bubble-like architecture of the cosmic web.', pct: 0.22 },
  { age: 1, marker: "4 Gyr",                title: "Birth of Population I Stars",               body: "Enrichment of the interstellar medium by earlier supernovae allowed the formation of metal-rich stars (Population I) in galactic disks. This marked the transition toward the Stellar Age and set the conditions for future planetary systems.", pct: 0.29 },

  // STELLAR
  { age: 2, marker: "4 Gyr",                title: "Formation of the Milky Way's Thin Disk",    body: "Following the earlier formation of the galactic halo, the Milky Way flattened into a thin disk. This structural change coincided with the birth of metal-rich Population I stars, which contained heavy elements produced by earlier generations.", pct: 0.30 },
  { age: 2, marker: "4 — 5 Gyr",            title: "Peak Star Formation Rate",                  body: "The Universe experienced its maximum rate of star formation. Massive stars fused hydrogen and helium into heavier elements like carbon, oxygen, and iron, acting as nuclear forges for the building blocks of future complexity.", pct: 0.33 },
  { age: 2, marker: "6 Gyr",                title: "Galactic Habitable Zone",                   body: "A region within the galaxy emerged where conditions favored complex life. Metallicity had spread outward, and the frequency of sterilizing supernovae in the inner galaxy had decreased sufficiently to allow safe orbits for planets.", pct: 0.43 },
  { age: 2, marker: "4 — 9 Gyr",            title: "Stellar Nucleosynthesis",                   body: "Main-sequence stars fused hydrogen into helium, while massive evolved stars fused helium into carbon, neon, oxygen, silicon, and finally iron in their cores. This created the chemical complexity required for planetary bodies.", pct: 0.47 },
  { age: 2, marker: "4 — 9 Gyr",            title: "Supernova Enrichment",                      body: "Massive stars died in core-collapse explosions, scattering chemically enriched material into the interstellar medium. These explosions also synthesized elements heavier than iron (such as gold and uranium) via rapid neutron capture.", pct: 0.52 },
  { age: 2, marker: "7 Gyr",                title: "Acceleration of Cosmic Expansion",          body: 'The expansion of the Universe began to accelerate due to repulsive "dark energy". This marked the transition from a matter-dominated era to a dark-energy-dominated era, influencing the formation of large-scale structures.', pct: 0.51 },
  { age: 2, marker: "9 Gyr",                title: "Solar Nebula Collapse",                     body: "The Stellar Age concluded with the gravitational collapse of a chemically enriched interstellar cloud in our region of the Milky Way. Triggered perhaps by a nearby supernova, this initiated the formation of the Sun and the Solar System about 4.6 billion years ago.", pct: 0.65 },

  // PLANETARY
  { age: 3, marker: "9.1 Gyr",              title: "Accretion of Planetesimals",                body: "Following the solar nebula collapse, dust grains collided and stuck together via electrostatic forces and gravity to form planetesimals. These kilometer-sized objects further coalesced into the protoplanets of the inner and outer Solar System.", pct: 0.66 },
  { age: 3, marker: "9.1 Gyr",              title: "The T-Tauri Solar Wind",                    body: "The young Sun entered a highly active T-Tauri phase, generating intense solar winds. This stream of charged particles swept away the remaining nebular gas and dust, halting the growth of the Jovian planets and stripping primordial atmospheres from inner planets.", pct: 0.67 },
  { age: 3, marker: "9.2 Gyr",              title: "Planetary Differentiation",                 body: "Intense heat from accretion and radioactive decay caused the early Earth to melt. Heavy elements like iron and nickel sank to the center to form the metallic core, while lighter silicates rose to form the mantle and crust.", pct: 0.67 },
  { age: 3, marker: "9.2 Gyr",              title: "Formation of the Moon",                     body: "A Mars-sized protoplanet collided with the newly differentiated Earth. The debris from this cataclysmic impact formed a ring around Earth, which rapidly accreted to form the Moon.", pct: 0.67 },
  { age: 3, marker: "9.4 Gyr",              title: "Atmosphere & Oceans",                       body: "As Earth cooled, volcanic activity outgassed water vapor and carbon dioxide from the interior to form a secondary atmosphere. As temperatures dropped further, this water vapor condensed to form the first oceans, augmented by water delivered by comets.", pct: 0.68 },
  { age: 3, marker: "9.6 — 10 Gyr",         title: "Late Heavy Bombardment",                    body: "A period of intense asteroid and comet impacts scarred planetary surfaces and pulverized the early crust. This \"cleaning up\" of leftover solar-system debris kept Earth's surface molten and hostile for millions of years.", pct: 0.71 },
  { age: 3, marker: "10 — 11 Gyr",          title: "Stabilization of the Lithosphere",          body: "The Planetary Age concluded with the stabilization of Earth's solid crust and the formation of the first continents. This transformed Earth from a chaotic, molten battlefield into a stable environment capable of sustaining complex chemical evolution.", pct: 0.78 },

  // CHEMICAL
  { age: 4, marker: "10.5 — 11 Gyr",        title: "Prebiotic Synthesis",                       body: "In the energy-rich environment of the early Earth, simple atmospheric gases (like methane and ammonia) interacted with lightning and UV radiation to synthesize the building blocks of life: amino acids and nucleotide bases.", pct: 0.80 },
  { age: 4, marker: "11 Gyr",               title: "Formation of Protocells",                   body: "Organic molecules concentrated in water to form proteinoid microspheres — droplets with semi-permeable membranes. These prebiotic structures displayed primitive metabolism and growth but lacked true hereditary mechanisms.", pct: 0.80 },
  { age: 4, marker: "11 Gyr",               title: 'The "RNA World"',                           body: "Before the dominance of DNA and proteins, RNA likely served a dual role as both the carrier of genetic information and the catalyst for chemical reactions (ribozymes), bridging the gap between non-living chemistry and true biology.", pct: 0.80 },
  { age: 4, marker: "11.5 Gyr",             title: "Emergence of Prokaryotes",                  body: "The first true living cells appeared, likely as heterotrophic bacteria in hydrothermal vents. These simple, single-celled organisms (lacking a nucleus) fed on the organic \"soup\" of the early oceans.", pct: 0.83 },
  { age: 4, marker: "12 Gyr",               title: "Invention of Photosynthesis",               body: "Cyanobacteria evolved the ability to use sunlight to convert carbon dioxide and water into food. This reduced life's dependence on scarce organic molecules and allowed life to spread globally.", pct: 0.87 },
  { age: 4, marker: "12.2 Gyr",             title: "The Oxygen Crisis",                         body: 'As a byproduct of photosynthesis, free oxygen accumulated in the atmosphere. This "Oxygen Holocaust" was toxic to many early anaerobic organisms but paved the way for more efficient energy production via respiration.', pct: 0.88 },
  { age: 4, marker: "12.5 Gyr",             title: "Eukaryotic Symbiosis",                      body: "Large cells ingested smaller specialized bacteria (which became mitochondria and chloroplasts) without digesting them. This symbiosis led to the first eukaryotes: complex cells with distinct nuclei and organelles, ancestors of all plants and animals.", pct: 0.90 },

  // BIOLOGICAL
  { age: 5, marker: "1 Gyr ago",            title: "Rise of Multicellularity",                  body: "Single-celled eukaryotes began to cluster and cooperate, leading to the first true multicellular organisms. This transition involved a division of labor among cells, allowing for specialization and increased complexity.", pct: 0.93 },
  { age: 5, marker: "540 — 600 Myr",        title: "The Cambrian Explosion",                    body: "A rapid burst of biological diversification often called \"biology's big bang.\" This period saw the emergence of most modern animal body plans, the development of hard shells and skeletons, and a sophisticated predator-prey arms race.", pct: 0.957 },
  { age: 5, marker: "400 — 475 Myr",        title: "Colonization of Land",                      body: "Life migrated from the oceans to the barren continents. Simple plants like mosses were the first to adapt to the harsh terrestrial environment, followed by arthropods and early amphibians, which required major adaptations to survive gravity and desiccation.", pct: 0.968 },
  { age: 5, marker: "300 Myr",              title: "Dominance of Reptiles",                     body: "Reptiles evolved watertight skin and amniotic eggs with hard shells, allowing them to reproduce on dry land without returning to water. This adaptation enabled them to spread across the supercontinent Pangea and dominate the planet.", pct: 0.978 },
  { age: 5, marker: "200 Myr",              title: "Emergence of Mammals",                      body: "The first small, warm-blooded (endothermic) mammals appeared during the Triassic period. While overshadowed by dinosaurs for millions of years, they developed key traits like fur, milk production, and larger brains relative to body size.", pct: 0.985 },
  { age: 5, marker: "65 Myr",               title: "K-T Mass Extinction",                       body: "A massive asteroid impact (likely at Chicxulub, Mexico) caused global climatic upheaval, wiping out the dinosaurs and roughly half of all plant species. This catastrophic event cleared ecological niches, allowing mammals to radiate and dominate the Cenozoic era.", pct: 0.995 },
  { age: 5, marker: "5 — 7 Myr",            title: "Divergence of Hominids",                    body: "In response to changing climates and shrinking forests in Africa, the ancestors of humans separated from the lineage of great apes. This period marked the beginning of bipedalism, setting the stage for the Cultural Age.", pct: 0.9996 },

  // CULTURAL
  { age: 6, marker: "1 Myr — 500 ky",       title: "Control of Fire",                           body: "Humans mastered the use of fire for warmth, protection, and cooking. This technological advance predated modern brain size and acted as an external digestive system, allowing for higher energy intake and brain growth.", pct: 0.99996 },
  { age: 6, marker: "200 — 300 ky",         title: "Emergence of Humans",                       body: "Modern humans appeared in Africa. While genetically similar to ancestors, they possessed superior potential for communication and technological adaptation, marking the biological start of the Cultural Age.", pct: 0.99998 },
  { age: 6, marker: "50 ky",                title: 'The "Cultural Explosion"',                  body: 'A sudden flowering of behavioral modernity characterized by sophisticated tool kits, cave art (e.g., Lascaux), and the full development of symbolic language. This period is often called "culture\'s big bang."', pct: 0.999996 },
  { age: 6, marker: "10 ky",                title: "The Agricultural Revolution",               body: "Following the last ice age, humans shifted from hunter-gatherer lifestyles to farming and animal domestication. This ability to harvest increased solar energy led to population surges and settled village life.", pct: 0.9999993 },
  { age: 6, marker: "5 ky",                 title: "Rise of Civilization",                      body: "The emergence of dense populations, complex social hierarchies, and the invention of writing (e.g., Sumerian cuneiform). This marked the transition from prehistory to recorded history and the formation of the first city-states.", pct: 0.9999996 },
  { age: 6, marker: "250 yrs",              title: "The Industrial Revolution",                 body: "Humanity learned to exploit energy stored in fossil fuels (coal and oil), increasing per-capita energy use by nearly a factor of 100. This transition powered machines, mechanizing production and globalizing human society.", pct: 0.99999998 },
  { age: 6, marker: "present · future",     title: 'The "Life Era"',                            body: "A potential new phase of cosmic evolution where technological life begins to manipulate matter and genetic evolution itself. Humans have become agents of change, capable of leaving Earth and potentially dominating matter on a cosmic scale.", pct: 1.0 },
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
