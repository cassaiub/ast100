/* Periodic table data for the AST 100 lesson 5.1 figure.

   `col`/`row` are grid coordinates in the standard 18-column layout;
   rows 9 and 10 hold the lanthanides and actinides, drawn detached below
   the main block (as on every printed periodic table).

   `origin` is the DOMINANT cosmic source of each element, following the
   modern nucleosynthesis attribution popularised by Jennifer Johnson's
   origin-coded table. Many elements are made in more than one place — the
   colour shows where most of the atoms in the Solar System came from, and
   the figure's caption says so.

     bigbang    — forged in the first ~20 minutes (H, He, some Li)
     cosmicray  — chipped off heavier nuclei by cosmic rays (Li, Be, B)
     dying      — dying low-mass stars, the slow neutron-capture s-process
     massive    — exploding massive stars (core-collapse supernovae)
     whitedwarf — exploding white dwarfs (Type Ia supernovae; most iron)
     merger     — merging neutron stars, the rapid r-process (gold, uranium)
     synthetic  — made only in laboratories and reactors; not naturally abundant
*/

export type ElementOrigin =
  | "bigbang"
  | "cosmicray"
  | "dying"
  | "massive"
  | "whitedwarf"
  | "merger"
  | "synthetic";

export type Element = {
  z: number;
  sym: string;
  name: string;
  col: number;
  row: number;
  origin: ElementOrigin;
};

export type OriginInfo = {
  id: ElementOrigin;
  label: string;
  color: string;
  /** one-line plain-language description used by the figure's detail box */
  blurb: string;
};

export const ORIGINS: OriginInfo[] = [
  { id: "bigbang", label: "The Big Bang", color: "#8ab4f8",
    blurb: "Forged in the first twenty minutes of the Universe, when it was hot enough to fuse nuclei everywhere at once (§1.3)." },
  { id: "cosmicray", label: "Cosmic rays", color: "#c4b5fd",
    blurb: "Chipped off heavier nuclei by cosmic rays — high-speed particles smashing into atoms in interstellar space." },
  { id: "dying", label: "Dying low-mass stars", color: "#7dd3fc",
    blurb: "Built slowly inside aging Sun-like stars, then puffed gently into space as they shed their outer layers (§3.3)." },
  { id: "massive", label: "Exploding massive stars", color: "#fb923c",
    blurb: "Fused in the onion-shell furnace of a heavy star and blasted out when its iron core collapsed (§3.4)." },
  { id: "whitedwarf", label: "Exploding white dwarfs", color: "#fbbf24",
    blurb: "Made when a white dwarf is pushed past its limit in a binary and detonates — a Type Ia supernova, source of about half the iron in the Galaxy." },
  { id: "merger", label: "Merging neutron stars", color: "#f472b6",
    blurb: "Created in seconds when two neutron stars collide — the best-established source of gold, platinum, and uranium, seen directly in 2017." },
  { id: "synthetic", label: "Made by humans", color: "#94a3b8",
    blurb: "Not naturally abundant on Earth: assembled atom by atom in reactors and accelerators, and mostly gone in moments." },
];

export const ELEMENTS: Element[] = [
  { z: 1, sym: "H", name: "Hydrogen", col: 1, row: 1, origin: "bigbang" },
  { z: 2, sym: "He", name: "Helium", col: 18, row: 1, origin: "bigbang" },
  { z: 3, sym: "Li", name: "Lithium", col: 1, row: 2, origin: "bigbang" },
  { z: 4, sym: "Be", name: "Beryllium", col: 2, row: 2, origin: "cosmicray" },
  { z: 5, sym: "B", name: "Boron", col: 13, row: 2, origin: "cosmicray" },
  { z: 6, sym: "C", name: "Carbon", col: 14, row: 2, origin: "dying" },
  { z: 7, sym: "N", name: "Nitrogen", col: 15, row: 2, origin: "dying" },
  { z: 8, sym: "O", name: "Oxygen", col: 16, row: 2, origin: "massive" },
  { z: 9, sym: "F", name: "Fluorine", col: 17, row: 2, origin: "massive" },
  { z: 10, sym: "Ne", name: "Neon", col: 18, row: 2, origin: "massive" },
  { z: 11, sym: "Na", name: "Sodium", col: 1, row: 3, origin: "massive" },
  { z: 12, sym: "Mg", name: "Magnesium", col: 2, row: 3, origin: "massive" },
  { z: 13, sym: "Al", name: "Aluminium", col: 13, row: 3, origin: "massive" },
  { z: 14, sym: "Si", name: "Silicon", col: 14, row: 3, origin: "massive" },
  { z: 15, sym: "P", name: "Phosphorus", col: 15, row: 3, origin: "massive" },
  { z: 16, sym: "S", name: "Sulfur", col: 16, row: 3, origin: "massive" },
  { z: 17, sym: "Cl", name: "Chlorine", col: 17, row: 3, origin: "massive" },
  { z: 18, sym: "Ar", name: "Argon", col: 18, row: 3, origin: "massive" },
  { z: 19, sym: "K", name: "Potassium", col: 1, row: 4, origin: "massive" },
  { z: 20, sym: "Ca", name: "Calcium", col: 2, row: 4, origin: "massive" },
  { z: 21, sym: "Sc", name: "Scandium", col: 3, row: 4, origin: "massive" },
  { z: 22, sym: "Ti", name: "Titanium", col: 4, row: 4, origin: "massive" },
  { z: 23, sym: "V", name: "Vanadium", col: 5, row: 4, origin: "massive" },
  { z: 24, sym: "Cr", name: "Chromium", col: 6, row: 4, origin: "whitedwarf" },
  { z: 25, sym: "Mn", name: "Manganese", col: 7, row: 4, origin: "whitedwarf" },
  { z: 26, sym: "Fe", name: "Iron", col: 8, row: 4, origin: "whitedwarf" },
  { z: 27, sym: "Co", name: "Cobalt", col: 9, row: 4, origin: "massive" },
  { z: 28, sym: "Ni", name: "Nickel", col: 10, row: 4, origin: "whitedwarf" },
  { z: 29, sym: "Cu", name: "Copper", col: 11, row: 4, origin: "massive" },
  { z: 30, sym: "Zn", name: "Zinc", col: 12, row: 4, origin: "massive" },
  { z: 31, sym: "Ga", name: "Gallium", col: 13, row: 4, origin: "dying" },
  { z: 32, sym: "Ge", name: "Germanium", col: 14, row: 4, origin: "dying" },
  { z: 33, sym: "As", name: "Arsenic", col: 15, row: 4, origin: "dying" },
  { z: 34, sym: "Se", name: "Selenium", col: 16, row: 4, origin: "dying" },
  { z: 35, sym: "Br", name: "Bromine", col: 17, row: 4, origin: "dying" },
  { z: 36, sym: "Kr", name: "Krypton", col: 18, row: 4, origin: "dying" },
  { z: 37, sym: "Rb", name: "Rubidium", col: 1, row: 5, origin: "dying" },
  { z: 38, sym: "Sr", name: "Strontium", col: 2, row: 5, origin: "dying" },
  { z: 39, sym: "Y", name: "Yttrium", col: 3, row: 5, origin: "dying" },
  { z: 40, sym: "Zr", name: "Zirconium", col: 4, row: 5, origin: "dying" },
  { z: 41, sym: "Nb", name: "Niobium", col: 5, row: 5, origin: "dying" },
  { z: 42, sym: "Mo", name: "Molybdenum", col: 6, row: 5, origin: "dying" },
  { z: 43, sym: "Tc", name: "Technetium", col: 7, row: 5, origin: "synthetic" },
  { z: 44, sym: "Ru", name: "Ruthenium", col: 8, row: 5, origin: "merger" },
  { z: 45, sym: "Rh", name: "Rhodium", col: 9, row: 5, origin: "merger" },
  { z: 46, sym: "Pd", name: "Palladium", col: 10, row: 5, origin: "merger" },
  { z: 47, sym: "Ag", name: "Silver", col: 11, row: 5, origin: "merger" },
  { z: 48, sym: "Cd", name: "Cadmium", col: 12, row: 5, origin: "dying" },
  { z: 49, sym: "In", name: "Indium", col: 13, row: 5, origin: "dying" },
  { z: 50, sym: "Sn", name: "Tin", col: 14, row: 5, origin: "dying" },
  { z: 51, sym: "Sb", name: "Antimony", col: 15, row: 5, origin: "dying" },
  { z: 52, sym: "Te", name: "Tellurium", col: 16, row: 5, origin: "merger" },
  { z: 53, sym: "I", name: "Iodine", col: 17, row: 5, origin: "merger" },
  { z: 54, sym: "Xe", name: "Xenon", col: 18, row: 5, origin: "merger" },
  { z: 55, sym: "Cs", name: "Caesium", col: 1, row: 6, origin: "dying" },
  { z: 56, sym: "Ba", name: "Barium", col: 2, row: 6, origin: "dying" },
  { z: 57, sym: "La", name: "Lanthanum", col: 4, row: 9, origin: "dying" },
  { z: 58, sym: "Ce", name: "Cerium", col: 5, row: 9, origin: "dying" },
  { z: 59, sym: "Pr", name: "Praseodymium", col: 6, row: 9, origin: "dying" },
  { z: 60, sym: "Nd", name: "Neodymium", col: 7, row: 9, origin: "dying" },
  { z: 61, sym: "Pm", name: "Promethium", col: 8, row: 9, origin: "synthetic" },
  { z: 62, sym: "Sm", name: "Samarium", col: 9, row: 9, origin: "dying" },
  { z: 63, sym: "Eu", name: "Europium", col: 10, row: 9, origin: "merger" },
  { z: 64, sym: "Gd", name: "Gadolinium", col: 11, row: 9, origin: "merger" },
  { z: 65, sym: "Tb", name: "Terbium", col: 12, row: 9, origin: "merger" },
  { z: 66, sym: "Dy", name: "Dysprosium", col: 13, row: 9, origin: "merger" },
  { z: 67, sym: "Ho", name: "Holmium", col: 14, row: 9, origin: "merger" },
  { z: 68, sym: "Er", name: "Erbium", col: 15, row: 9, origin: "merger" },
  { z: 69, sym: "Tm", name: "Thulium", col: 16, row: 9, origin: "merger" },
  { z: 70, sym: "Yb", name: "Ytterbium", col: 17, row: 9, origin: "merger" },
  { z: 71, sym: "Lu", name: "Lutetium", col: 18, row: 9, origin: "merger" },
  { z: 72, sym: "Hf", name: "Hafnium", col: 4, row: 6, origin: "dying" },
  { z: 73, sym: "Ta", name: "Tantalum", col: 5, row: 6, origin: "dying" },
  { z: 74, sym: "W", name: "Tungsten", col: 6, row: 6, origin: "dying" },
  { z: 75, sym: "Re", name: "Rhenium", col: 7, row: 6, origin: "merger" },
  { z: 76, sym: "Os", name: "Osmium", col: 8, row: 6, origin: "merger" },
  { z: 77, sym: "Ir", name: "Iridium", col: 9, row: 6, origin: "merger" },
  { z: 78, sym: "Pt", name: "Platinum", col: 10, row: 6, origin: "merger" },
  { z: 79, sym: "Au", name: "Gold", col: 11, row: 6, origin: "merger" },
  { z: 80, sym: "Hg", name: "Mercury", col: 12, row: 6, origin: "dying" },
  { z: 81, sym: "Tl", name: "Thallium", col: 13, row: 6, origin: "dying" },
  { z: 82, sym: "Pb", name: "Lead", col: 14, row: 6, origin: "dying" },
  { z: 83, sym: "Bi", name: "Bismuth", col: 15, row: 6, origin: "dying" },
  { z: 84, sym: "Po", name: "Polonium", col: 16, row: 6, origin: "merger" },
  { z: 85, sym: "At", name: "Astatine", col: 17, row: 6, origin: "merger" },
  { z: 86, sym: "Rn", name: "Radon", col: 18, row: 6, origin: "merger" },
  { z: 87, sym: "Fr", name: "Francium", col: 1, row: 7, origin: "merger" },
  { z: 88, sym: "Ra", name: "Radium", col: 2, row: 7, origin: "merger" },
  { z: 89, sym: "Ac", name: "Actinium", col: 4, row: 10, origin: "merger" },
  { z: 90, sym: "Th", name: "Thorium", col: 5, row: 10, origin: "merger" },
  { z: 91, sym: "Pa", name: "Protactinium", col: 6, row: 10, origin: "merger" },
  { z: 92, sym: "U", name: "Uranium", col: 7, row: 10, origin: "merger" },
  { z: 93, sym: "Np", name: "Neptunium", col: 8, row: 10, origin: "synthetic" },
  { z: 94, sym: "Pu", name: "Plutonium", col: 9, row: 10, origin: "synthetic" },
  { z: 95, sym: "Am", name: "Americium", col: 10, row: 10, origin: "synthetic" },
  { z: 96, sym: "Cm", name: "Curium", col: 11, row: 10, origin: "synthetic" },
  { z: 97, sym: "Bk", name: "Berkelium", col: 12, row: 10, origin: "synthetic" },
  { z: 98, sym: "Cf", name: "Californium", col: 13, row: 10, origin: "synthetic" },
  { z: 99, sym: "Es", name: "Einsteinium", col: 14, row: 10, origin: "synthetic" },
  { z: 100, sym: "Fm", name: "Fermium", col: 15, row: 10, origin: "synthetic" },
  { z: 101, sym: "Md", name: "Mendelevium", col: 16, row: 10, origin: "synthetic" },
  { z: 102, sym: "No", name: "Nobelium", col: 17, row: 10, origin: "synthetic" },
  { z: 103, sym: "Lr", name: "Lawrencium", col: 18, row: 10, origin: "synthetic" },
  { z: 104, sym: "Rf", name: "Rutherfordium", col: 4, row: 7, origin: "synthetic" },
  { z: 105, sym: "Db", name: "Dubnium", col: 5, row: 7, origin: "synthetic" },
  { z: 106, sym: "Sg", name: "Seaborgium", col: 6, row: 7, origin: "synthetic" },
  { z: 107, sym: "Bh", name: "Bohrium", col: 7, row: 7, origin: "synthetic" },
  { z: 108, sym: "Hs", name: "Hassium", col: 8, row: 7, origin: "synthetic" },
  { z: 109, sym: "Mt", name: "Meitnerium", col: 9, row: 7, origin: "synthetic" },
  { z: 110, sym: "Ds", name: "Darmstadtium", col: 10, row: 7, origin: "synthetic" },
  { z: 111, sym: "Rg", name: "Roentgenium", col: 11, row: 7, origin: "synthetic" },
  { z: 112, sym: "Cn", name: "Copernicium", col: 12, row: 7, origin: "synthetic" },
  { z: 113, sym: "Nh", name: "Nihonium", col: 13, row: 7, origin: "synthetic" },
  { z: 114, sym: "Fl", name: "Flerovium", col: 14, row: 7, origin: "synthetic" },
  { z: 115, sym: "Mc", name: "Moscovium", col: 15, row: 7, origin: "synthetic" },
  { z: 116, sym: "Lv", name: "Livermorium", col: 16, row: 7, origin: "synthetic" },
  { z: 117, sym: "Ts", name: "Tennessine", col: 17, row: 7, origin: "synthetic" },
  { z: 118, sym: "Og", name: "Oganesson", col: 18, row: 7, origin: "synthetic" },
];
