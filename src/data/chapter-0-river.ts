/* Brahmaputra river map — true geographic coordinates.
   The river starts at the Angsi glacier in Tibet (≈31°N 82°E), runs
   ≈1700 km EAST across the Tibetan plateau as the Tsangpo, makes the
   Great Bend at ≈95.3°E (a near-U-turn through the world's deepest
   gorge), then heads WEST across Assam as the Brahmaputra for another
   ≈720 km. From there it turns SOUTH through Bangladesh as the
   Jamuna, joins the Ganges to form the Padma, then meets the Meghna
   in the delta and finally reaches the Bay of Bengal in the SE.

   All coordinates here are real (lat/lng). The component projects
   them onto SVG via simple equirectangular mapping — the distortion
   at these latitudes is negligible. */

export type RiverSegment = {
  id: string;
  name: string;
  age: string;
  range: string;
  /** Stroke weight (grows downstream — wider river towards delta). */
  w: number;
  country: string;
  /** Lat/lng of the segment's representative numbered node. */
  lat: number;
  lng: number;
  /** Indices into RIVER_WAYPOINTS marking this segment's slice of path. */
  fromIdx: number;
  toIdx: number;
};

/* Geographic bounding box of the map viewport. */
export const MAP_BOUNDS = {
  north: 33.0,
  south: 20.4,
  west: 79.0,
  east: 96.8,
};

/* Real waypoints along the Brahmaputra system from source to bay. */
export const RIVER_WAYPOINTS: Array<[number, number]> = [
  [31.0, 82.0],     //  0 — Angsi source (near Mt Kailash)
  [30.9, 82.5],     //  1
  [30.75, 83.5],    //  2 — end of Angsi
  [30.5, 84.5],     //  3 — Tsangpo begins
  [30.2, 86.0],     //  4
  [29.95, 87.5],    //  5
  [29.75, 89.0],    //  6
  [29.5, 91.1],     //  7 — near Lhasa
  [29.4, 92.5],     //  8
  [29.45, 93.8],    //  9
  [29.55, 94.8],    // 10 — approaching Great Bend
  [29.75, 95.30],   // 11 — peak of Great Bend (Tsangpo / Siang break)
  [29.35, 95.45],   // 12
  [28.75, 95.40],   // 13
  [28.10, 95.25],   // 14 — through Tsangpo Gorge
  [27.70, 95.40],   // 15 — Pasighat, Brahmaputra begins (Assam entry)
  [27.40, 94.70],   // 16 — Dibrugarh area
  [27.10, 93.80],   // 17
  [26.75, 92.70],   // 18
  [26.45, 91.90],   // 19
  [26.20, 91.50],   // 20 — Guwahati area
  [25.95, 90.70],   // 21
  [25.75, 89.80],   // 22 — Bangladesh entry, Jamuna begins
  [25.20, 89.70],   // 23
  [24.50, 89.70],   // 24
  [24.00, 89.70],   // 25 — Aricha, joins Ganges → Padma
  [23.70, 89.80],   // 26 — Padma begins
  [23.50, 90.10],   // 27
  [23.30, 90.40],   // 28 — Chandpur, joins Meghna
  [23.05, 90.65],   // 29 — Meghna begins
  [22.75, 90.80],   // 30
  [22.40, 90.95],   // 31
  [22.00, 91.10],   // 32 — Bay of Bengal terminus
];

export const RIVER_SEGMENTS: RiverSegment[] = [
  { id: "angsi",       name: "Angsi",       age: "Particle age",   range: "0 — 380,000 yrs", w: 1.6, country: "Tibet · source",   lat: 30.92, lng: 82.50, fromIdx: 0,  toIdx: 3  },
  { id: "tsangpo",     name: "Tsangpo",     age: "Galactic age",   range: "300 ky — 4 Gyr",  w: 2.1, country: "Tibetan plateau",  lat: 29.85, lng: 88.00, fromIdx: 3,  toIdx: 11 },
  { id: "siang",       name: "Siang",       age: "Stellar age",    range: "4 — 9 Gyr",       w: 2.6, country: "Himalayan gorge",  lat: 28.85, lng: 95.40, fromIdx: 11, toIdx: 15 },
  { id: "brahmaputra", name: "Brahmaputra", age: "Planetary age",  range: "9 — 11 Gyr",      w: 3.1, country: "Assam plains",     lat: 26.55, lng: 92.10, fromIdx: 15, toIdx: 22 },
  { id: "jamuna",      name: "Jamuna",      age: "Chemical age",   range: "11 — 13 Gyr",     w: 3.6, country: "Bangladesh north", lat: 24.55, lng: 89.70, fromIdx: 22, toIdx: 25 },
  { id: "padma",       name: "Padma",       age: "Biological age", range: "13 — 14 Gyr",     w: 4.1, country: "Bengal mid-delta", lat: 23.50, lng: 90.10, fromIdx: 25, toIdx: 28 },
  { id: "meghna",      name: "Meghna",      age: "Cultural age",   range: "last ~300 ky",    w: 4.6, country: "Bay of Bengal",    lat: 22.55, lng: 90.85, fromIdx: 28, toIdx: 32 },
];

/* Major cities as map landmarks. */
export const CITIES: Array<{ name: string; lat: number; lng: number }> = [
  { name: "Lhasa",     lat: 29.65, lng: 91.13 },
  { name: "Kathmandu", lat: 27.71, lng: 85.32 },
  { name: "Thimphu",   lat: 27.47, lng: 89.64 },
  { name: "Guwahati",  lat: 26.14, lng: 91.74 },
  { name: "Patna",     lat: 25.61, lng: 85.13 },
  { name: "Dhaka",     lat: 23.81, lng: 90.41 },
  { name: "Kolkata",   lat: 22.57, lng: 88.36 },
  { name: "Chittagong",lat: 22.36, lng: 91.78 },
];

/* The Ganges — a major tributary that joins the Brahmaputra system at
   Aricha (~24°N, 89.7°E), where the combined waters become the Padma.
   Rendered as a faded path to provide geographic context. */
export const GANGES_WAYPOINTS: Array<[number, number]> = [
  [29.95, 79.00],   // Haridwar area — entering viewport from west
  [29.10, 79.40],
  [27.80, 79.90],
  [26.50, 81.00],   // Kanpur / Lucknow region
  [25.45, 81.85],   // Allahabad
  [25.30, 83.00],   // Varanasi
  [25.40, 85.13],   // Patna
  [25.00, 87.00],
  [24.50, 88.40],   // Farakka
  [24.10, 89.10],
  [24.00, 89.70],   // joins Brahmaputra at Aricha
];

/* Mt Kailash — source reference. */
export const SOURCE_PEAK = { name: "Mt Kailash", lat: 31.07, lng: 81.32 };

/* Country / region labels. */
export const REGIONS: Array<{ name: string; lat: number; lng: number; size: "lg" | "md" | "sm" }> = [
  { name: "TIBET · CHINA", lat: 31.7, lng: 88.0, size: "lg" },
  { name: "INDIA",         lat: 25.5, lng: 83.5, size: "lg" },
  { name: "BANGLADESH",    lat: 24.2, lng: 90.4, size: "md" },
  { name: "NEPAL",         lat: 28.4, lng: 84.0, size: "sm" },
  { name: "BHUTAN",        lat: 27.3, lng: 90.4, size: "sm" },
  { name: "MYANMAR",       lat: 24.0, lng: 95.6, size: "sm" },
  { name: "BAY OF BENGAL", lat: 21.0, lng: 89.5, size: "md" },
];

/* Approximate Bay of Bengal coastline curving through the Sundarbans. */
export const BAY_POLYGON: Array<[number, number]> = [
  [21.0, 86.5],
  [21.5, 87.1],
  [21.75, 88.0],
  [22.0, 88.6],
  [22.05, 89.4],
  [22.20, 89.85],
  [22.00, 90.55],
  [22.40, 91.0],
  [22.15, 91.50],
  [21.50, 91.95],
  [20.95, 92.2],
];

/* Faint Himalayan range crest — denser row of small peaks marking
   the highest line of mountains through the region. Some peaks
   carry named labels for major summits. */
export const HIMALAYAS: Array<{ lat: number; lng: number; h?: number; label?: string }> = [
  { lat: 28.4, lng: 80.0 },
  { lat: 28.3, lng: 81.2 },
  { lat: 28.2, lng: 82.5 },
  { lat: 28.0, lng: 83.7 },
  { lat: 27.95, lng: 85.0, label: "Annapurna", h: 1.1 },
  { lat: 27.90, lng: 86.0 },
  { lat: 27.99, lng: 86.93, h: 1.5, label: "Everest" },
  { lat: 27.8, lng: 87.7 },
  { lat: 27.7, lng: 88.15, h: 1.3, label: "Kanchenjunga" },
  { lat: 27.85, lng: 89.0 },
  { lat: 28.0, lng: 90.2 },
  { lat: 28.1, lng: 91.3 },
  { lat: 28.3, lng: 92.4 },
  { lat: 28.6, lng: 93.5 },
  { lat: 28.8, lng: 94.7 },
  { lat: 28.9, lng: 95.9 },
];

/* Approximate Indian-subcontinent land outline within the viewport —
   used as a subtle tint distinct from the Tibetan plateau (north) and
   the Bay (south). Coarse polygon, pedagogical rather than precise. */
export const SUBCONTINENT_POLYGON: Array<[number, number]> = [
  // northern edge — runs along the southern foot of the Himalayas
  [28.6, 79.0],
  [28.4, 81.0],
  [28.3, 83.5],
  [28.0, 85.5],
  [27.4, 87.5],
  [26.8, 88.5],   // dips around Sikkim
  [26.8, 89.5],
  [26.8, 90.5],   // northern Bangladesh
  [27.0, 91.5],
  [26.9, 92.5],
  [27.4, 93.5],
  [27.7, 95.0],   // Pasighat
  [27.3, 95.4],
  [26.5, 95.0],
  [25.4, 94.5],   // Nagaland / Myanmar border
  [24.5, 94.0],
  [24.0, 94.0],
  [23.5, 93.5],
  [22.8, 93.0],
  [22.4, 92.3],   // bottom-right
  [22.2, 91.5],
  [22.0, 91.0],   // mouth of Meghna at Bay
  [22.0, 90.5],
  [22.1, 89.85],
  [22.2, 89.4],
  [22.05, 88.6],  // Sundarbans
  [21.95, 88.0],
  [22.0, 87.0],
  [22.5, 86.0],
  [23.5, 84.0],
  [24.5, 82.5],
  [25.5, 80.0],
  [27.0, 79.0],
];

/* Tibetan plateau polygon — north of the Himalayan crest. */
export const TIBET_POLYGON: Array<[number, number]> = [
  [33.0, 79.0],
  [33.0, 96.8],
  [29.0, 96.8],
  [28.8, 95.5],
  [28.4, 92.5],
  [28.3, 90.5],
  [27.9, 88.0],   // dips south at the Sikkim border with India
  [28.0, 86.0],
  [28.3, 83.0],
  [28.6, 80.5],
  [29.0, 79.0],
];
