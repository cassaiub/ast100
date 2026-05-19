# AST 100 Website — Build Specification

## Overview

Build a complete static HTML/CSS/JS website for the course
AST 100: Our Cosmic History, to be hosted on a Bluehost
Apache server at cassa.site/minds/ast100. No frameworks, no
build pipeline — plain HTML, CSS, and JavaScript only.

---

## Source Content

All chapter and subpage content must be scraped directly from
the existing Abekta website. Do not rewrite or summarize the
text — take it exactly as it appears on each page, including
all figures. The source pages are:

### Chapter Overview Pages
- https://cassa.site/abekta/courses/ast100/0
- https://cassa.site/abekta/courses/ast100/1
- https://cassa.site/abekta/courses/ast100/2
- https://cassa.site/abekta/courses/ast100/3
- https://cassa.site/abekta/courses/ast100/4
- https://cassa.site/abekta/courses/ast100/5
- https://cassa.site/abekta/courses/ast100/6
- https://cassa.site/abekta/courses/ast100/7

### Chapter Subpages
- https://cassa.site/abekta/courses/ast100/0.1
- https://cassa.site/abekta/courses/ast100/0.2
- https://cassa.site/abekta/courses/ast100/0.3
- https://cassa.site/abekta/courses/ast100/0.4
- https://cassa.site/abekta/courses/ast100/1.1
- https://cassa.site/abekta/courses/ast100/1.2
- https://cassa.site/abekta/courses/ast100/1.3
- https://cassa.site/abekta/courses/ast100/1.4
- https://cassa.site/abekta/courses/ast100/2.1
- https://cassa.site/abekta/courses/ast100/2.2
- https://cassa.site/abekta/courses/ast100/2.3
- https://cassa.site/abekta/courses/ast100/2.4
- https://cassa.site/abekta/courses/ast100/3.1
- https://cassa.site/abekta/courses/ast100/3.2
- https://cassa.site/abekta/courses/ast100/3.3
- https://cassa.site/abekta/courses/ast100/3.4
- https://cassa.site/abekta/courses/ast100/4.1
- https://cassa.site/abekta/courses/ast100/4.2
- https://cassa.site/abekta/courses/ast100/4.3
- https://cassa.site/abekta/courses/ast100/4.4
- https://cassa.site/abekta/courses/ast100/5.1
- https://cassa.site/abekta/courses/ast100/5.2
- https://cassa.site/abekta/courses/ast100/5.3
- https://cassa.site/abekta/courses/ast100/5.4
- https://cassa.site/abekta/courses/ast100/6.1
- https://cassa.site/abekta/courses/ast100/6.2
- https://cassa.site/abekta/courses/ast100/6.3
- https://cassa.site/abekta/courses/ast100/6.4
- https://cassa.site/abekta/courses/ast100/7.1
- https://cassa.site/abekta/courses/ast100/7.2
- https://cassa.site/abekta/courses/ast100/7.3
- https://cassa.site/abekta/courses/ast100/7.4

### Content Extraction Rules
When scraping each page, extract only:
- The main content area (everything inside the DokuWiki
  content div, excluding sidebar, navigation, page tools,
  and DokuWiki branding)
- All headings and body text exactly as written
- All figures with their src attributes
- All internal section structure (h1, h2, h3, p, ul, ol)
- Math expressions (rendered as-is or via MathJax)

Discard:
- DokuWiki navigation bars
- Sidebar
- Page tools (show pagesource, old revisions, backlinks)
- DokuWiki footer buttons
- Login links
- Breadcrumbs

---

## Image Handling

### Abekta-hosted images
All images hosted on cassa.site/abekta/_media/ must be
downloaded and saved locally to the media/ folder,
preserving the filename. Update all src attributes in the
HTML to point to the local media/ path.

The complete list of Abekta-hosted images to download:

#### /courses/ast100/
Base URL: https://cassa.site/abekta/_media/courses/ast100/
- special.webp
- general.webp
- cosmos.webp
- complexity.webp
- observable.webp
- telescopes.webp
- telescope.webp
- forces.jpg
- forces_detailed.webp
- standard-model.webp
- elementary.webp
- synthesis.webp
- ig_cmb.webp
- cmb.webp
- ooa.webp
- specific-power.webp
- stars.webp

#### /bn/courses/ast100/
Base URL: https://cassa.site/abekta/_media/bn/courses/ast100/
- brahmaputra.webp
- ems.webp
- mw.webp
- galclass.webp
- agn.webp
- hubble.webp
- star-structure.webp
- sfr-bhar.webp
- star-formation.webp
- hr-tracks.webp
- evolution-small.webp
- evolution-big.webp
- white-dwarf.webp
- black-hole-anatomy.webp
- helios.webp
- planets-r-p.webp
- planets-r-m.webp
- earth.webp
- atmosphere-magnetosphere.webp
- planet-formation.webp
- transits.webp
- starfurnace.webp
- oxygen.webp
- life.webp
- habitable-zone.webp
- spectra.webp
- transmission-spectra.webp
- tol.webp
- life-history.webp
- dna.webp
- extinctions.webp
- gmst.webp
- nea.webp
- drake.webp
- population-growth.webp
- culture-distance.webp

#### /courses/ast201/
Base URL: https://cassa.site/abekta/_media/courses/ast201/
- geocentric.jpg

### External images
These must also be downloaded and saved to media/ using the
specified save-as filenames:

| Source URL | Save as |
|-----------|---------|
| https://resource.isvr.soton.ac.uk/spcg/tutorial/tutorial/Tutorial_files/light1.gif | light1.gif |
| https://upload.wikimedia.org/wikipedia/commons/f/f7/Horn_Antenna-in_Holmdel%2C_New_Jersey_-_restoration1.jpg | horn-antenna.jpg |
| https://apod.nasa.gov/apod/image/1608/ganab_mosaic1640x600.jpg | milkyway-namibia.jpg |
| https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/ESO_Centaurus_A_LABOCA.jpg/972px-ESO_Centaurus_A_LABOCA.jpg | centaurus-a.jpg |
| https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/NGC4038_Large_01.jpg/1280px-NGC4038_Large_01.jpg | antennae-galaxies.jpg |
| https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Messier51_sRGB.jpg/1280px-Messier51_sRGB.jpg | whirlpool-galaxy.jpg |
| https://upload.wikimedia.org/wikipedia/commons/4/4d/Lightsmall-optimised.gif | pulsar.gif |
| https://upload.wikimedia.org/wikipedia/commons/4/48/Hr8799_orbit_hd.gif | hr8799-orbit.gif |
| https://upload.wikimedia.org/wikipedia/commons/f/f2/Tectonic_plate_model_1Ga.webm | tectonic-plates.webm |
| https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Diagram_of_habitable_zone_rocky_exoplanets%2C_from_NASA_Exoplanet_Archive_and_Gaia_DR3_data.png/1280px-Diagram_of_habitable_zone_rocky_exoplanets%2C_from_NASA_Exoplanet_Archive_and_Gaia_DR3_data.png | habitable-zone-exoplanets.png |
| https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/ChangingSeasons_NH_01.png/1280px-ChangingSeasons_NH_01.png | seasons.png |
| https://upload.wikimedia.org/wikipedia/commons/6/6a/Moon_Phase_Diagram_for_Simple_English_Wikipedia.GIF | moon-phases.gif |
| https://upload.wikimedia.org/wikipedia/commons/b/b7/Eclipse_vs_new_or_full_moons%2C_detailed_annotations.svg | eclipses.svg |
| https://starwalk.space/gallery/images/zodiac-constellations/1140x641.jpg | zodiac.jpg |
| https://upload.wikimedia.org/wikipedia/commons/8/89/Constellations%2C_equirectangular_plot%2C_Menzel_families.svg | constellations.svg |
| https://live.staticflickr.com/65535/49174363033_bc2d3ef8cd_b.jpg | heliocentric-model.jpg |
| https://upload.wikimedia.org/wikipedia/commons/3/3e/ThomasDiggesmap.JPG | digges-map.jpg |
| https://cdn.eso.org/images/screen/eso1620a.jpg | topocentric-model.jpg |

---

## File Structure

```
ast100/
├── index.html
├── mid/
│   └── index.html
├── fin/
│   └── index.html
├── 0/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── 1/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── 2/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── 3/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── 4/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── 5/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── 6/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── 7/
│   ├── index.html
│   ├── 1.html
│   ├── 2.html
│   ├── 3.html
│   └── 4.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── media/
    └── (all downloaded figures)
```

Total: 38 HTML pages + 1 CSS + 1 JS + media folder.

---

## Navigation

### Top menu bar
Fixed, transparent over hero sections, solid dark on scroll.

```
Home | 0 | 1 | 2 | 3 | MID | 4 | 5 | 6 | 7 | FIN
```

### Chapter dropdowns (0–7)
Each chapter number opens a dropdown with 5 links:

**Chapter 0:**
- Seven Ages of the Universe → /minds/ast100/0/
- 0.1 SpaceTime and Energy-Matter → /minds/ast100/0/1.html
- 0.2 Cosmic Evolution → /minds/ast100/0/2.html
- 0.3 Observable Universe → /minds/ast100/0/3.html
- 0.4 Light and Telescopes → /minds/ast100/0/4.html

**Chapter 1:**
- Particle Age → /minds/ast100/1/
- 1.1 The Four Fundamental Forces → /minds/ast100/1/1.html
- 1.2 Formation of Elementary Particles → /minds/ast100/1/2.html
- 1.3 Synthesis of Elements → /minds/ast100/1/3.html
- 1.4 Cosmic Microwave Background → /minds/ast100/1/4.html

**Chapter 2:**
- Galactic Age → /minds/ast100/2/
- 2.1 The Milky Way → /minds/ast100/2/1.html
- 2.2 Types of Galaxies → /minds/ast100/2/2.html
- 2.3 Formation and Evolution of Galaxies → /minds/ast100/2/3.html
- 2.4 Hubble's Law → /minds/ast100/2/4.html

**Chapter 3:**
- Stellar Age → /minds/ast100/3/
- 3.1 The Sun → /minds/ast100/3/1.html
- 3.2 Types of Stars → /minds/ast100/3/2.html
- 3.3 Formation and Evolution of Stars → /minds/ast100/3/3.html
- 3.4 Stellar Remnants → /minds/ast100/3/4.html

**Chapter 4:**
- Planetary Age → /minds/ast100/4/
- 4.1 The Solar System → /minds/ast100/4/1.html
- 4.2 Types of Planets → /minds/ast100/4/2.html
- 4.3 Formation and Evolution of Planets → /minds/ast100/4/3.html
- 4.4 Discovering Exoplanets → /minds/ast100/4/4.html

**Chapter 5:**
- Chemical Age → /minds/ast100/5/
- 5.1 The Periodic Table → /minds/ast100/5/1.html
- 5.2 Formation of Oceans and Atmospheres → /minds/ast100/5/2.html
- 5.3 Origin of Life on Earth → /minds/ast100/5/3.html
- 5.4 Life on Other Planets → /minds/ast100/5/4.html

**Chapter 6:**
- Biological Age → /minds/ast100/6/
- 6.1 Tree of Life → /minds/ast100/6/1.html
- 6.2 Rise of the Eukaryotes → /minds/ast100/6/2.html
- 6.3 Mass Extinctions → /minds/ast100/6/3.html
- 6.4 Life in the Universe → /minds/ast100/6/4.html

**Chapter 7:**
- Cultural Age → /minds/ast100/7/
- 7.1 History of the World → /minds/ast100/7/1.html
- 7.2 History of Mapping the Worlds → /minds/ast100/7/2.html
- 7.3 Role of the Sky in Culture → /minds/ast100/7/3.html
- 7.4 Search for Extraterrestrial Intelligence → /minds/ast100/7/4.html

MID → /minds/ast100/mid/ (no dropdown)
FIN → /minds/ast100/fin/ (no dropdown)

### Subpage footer navigation
Every subpage has a three-link footer:
← Previous topic | ↑ Back to chapter | Next topic →

---

## Home Page — index.html

### Section 1: Hero
- Full-screen background: brahmaputra.webp
- Title: AST 100: Our Cosmic History
- Subtitle: A journey from the Big Bang to the emergence
  of life and culture
- Scroll-down indicator arrow

### Section 2: Course Introduction
AST 100 is co-offered with PHY 100: Physics for the Next
Generation. It explores the grand narrative of the universe
— from its origins to the emergence of life and our cosmic
future. Designed to be accessible, the curriculum avoids
complex mathematics, instead utilizing sight, sound,
telescopes, and imagery to help students discover their
place in the cosmos. To cultivate students as citizens of
the universe, the course integrates astrophotography as an
art form. Using archival data from the world's largest
telescopes across all wavelengths, students process and
present images to forge a personal connection with the cosmos.

### Section 3: Rationale
The universe has a history. That history is not just physics
— it is chemistry, biology, culture, and ultimately the story
of who we are and where we come from. AST 100 treats the
cosmos as one continuous narrative told across 14 billion
years and seven distinct ages, each building on the last.
A student who completes this course will never look at the
night sky the same way again.

### Section 4: Course Outline
Display as a visual timeline or styled table:

| Chapter | Title | Telescope | Weeks |
|---------|-------|-----------|-------|
| 0 | Seven Ages of the Universe | All | 1–2 |
| 1 | Particle Age | Planck | 3–4 |
| 2 | Galactic Age | HST | 4–5 |
| 3 | Stellar Age | Gaia | 5–6 |
| MIDTERM PROJECT | Astrophotography | — | 7 |
| 4 | Planetary Age | Kepler | 8 |
| 5 | Chemical Age | ALMA | 9 |
| 6 | Biological Age | JWST | 10 |
| 7 | Cultural Age | Allen Array | 11–12 |
| FINAL PROJECT | Mission Design | — | 13 |

### Section 5: Assessment Structure
Display as a single card (same for all sections):

- Attendance: 10%
- Quizzes: 15%
- Classwork: 15%
- Midterm Project: 30%
- Final Project: 30%

### Section 6: How to Do Well
Display as a styled list:

- Engage with the images. This course is visual — spend
  time with every figure on every page.
- Connect the ages. Each chapter builds on the previous
  one. The Chemical Age only makes sense if you understood
  the Stellar Age.
- Use the NotebookLM. A curated Google NotebookLM is
  available for self-paced learning and question answering.
  Link: https://notebooklm.google.com/notebook/00f567bd-531c-4844-b7c3-988166939c25
- For projects, prioritize storytelling over technical
  detail. Your strength is communication — use it.
- Attend every class. The quizzes are weekly and based
  directly on class discussions.
- Start projects early. Both projects require research and
  group coordination that cannot be done the night before.

---

## Midterm Project Page — mid/index.html

### Section 1: Hero
- Title: Midterm Project: Seeing the Seven Ages
- Subtitle: A visual journey through the first half of
  cosmic history using archival telescope data

### Section 2: Project Overview
The midterm project is a group astrophotography presentation
using archival data from the world's largest telescopes.
Each group of 5 students tells the story of the first three
ages of the universe — Particle, Galactic, and Stellar —
through real images taken across the full electromagnetic
spectrum. The primary exploration tool is Aladin Lite, a
browser-based sky atlas that allows students to view any
region of the sky across radio, infrared, visible, X-ray,
and microwave wavelengths.

### Section 3: The Five Roles
Display as 5 styled cards numbered 1–5:

**Card 1 — The Cosmic Camera: How Telescopes Read the
Universe**
This student is the group's narrator and visual guide. They
explain why we need different telescopes for different
wavelengths using the electromagnetic spectrum from Chapter
0.4, and introduce the specific telescopes — Planck, Hubble,
JWST, Chandra, ALMA — that the other four students will draw
from. The key message is that telescopes are time machines:
each image is a photograph of a different era of cosmic
history. No image processing required; the skill here is
curating a compelling visual introduction that frames the
entire group presentation.

**Card 2 — The Oldest Light: Images of the Particle Age**
This student works with CMB maps from the Planck satellite —
the earliest photograph of the universe at 380,000 years
old. They explain what the color variations mean (density
fluctuations, the seeds of future structure), compare the
COBE, WMAP, and Planck maps to show improving resolution
over decades, and connect the CMB to Big Bang theory. The
images are fully processed and publicly available from ESA —
no technical work needed beyond selection and interpretation.

**Card 3 — The First Galaxies: Images of the Galactic Age**
This student works with deep field images — the Hubble Ultra
Deep Field and JWST deep fields. They explain that looking
deeper into space means looking further back in time,
identify the difference between nearby and distant galaxies
in the same image, and connect chaotic early galaxies to the
ordered spirals we see today. The story of cosmic evolution
is literally visible in a single image.

**Card 4 — Stellar Nurseries and Graveyards: Images of the
Stellar Age**
This student works with two contrasting sets of images:
star-forming regions (the Pillars of Creation, Orion Nebula
in infrared from JWST) and stellar remnants (Crab Nebula
from Chandra in X-ray, Hubble planetary nebulae). The
narrative arc is the complete stellar lifecycle — from birth
to death — told through publicly available images across
infrared and X-ray wavelengths.

**Card 5 — One Object, Many Eyes: A Multi-Wavelength Story**
This student takes a single famous object — Centaurus A or
the Crab Nebula — and shows how it looks completely
different across radio, infrared, visible, X-ray, and
gamma-ray wavelengths, explaining what each wavelength
reveals. The multi-wavelength composites are publicly
available from NASA and ESA. This serves as the group's
conclusion, synthesizing the central message that the full
story of the universe requires the full spectrum of light.

### Section 4: Tools
Display as a styled link list:
- Aladin Lite — https://aladin.cds.unistra.fr/AladinLite/
- NASA HubbleSite — https://hubblesite.org
- JWST Image Gallery — https://webbtelescope.org
- ESA Image Archive — https://esahubble.org
- NASA APOD — https://apod.nasa.gov
- Chandra Photo Album — https://chandra.harvard.edu/photo

### Section 5: Rules
- Groups of 5, one file submitted via Google Classroom
- Each student presents their section for 3–4 minutes
- Total group time: 15–20 minutes
- Minimum 4 slides per student including a title slide
- Built in Canva using the provided template

### Section 6: Grading
Display as 4 cards:
- Content (15 marks): informativeness, visual selection,
  connection to course material
- Delivery (5 marks): preparedness, fluency, relevance
  to slides
- Interaction (5 marks): eye contact, movement, engagement
  with audience
- Visual Quality (5 marks): image selection, slide design,
  use of archival data across wavelengths

---

## Final Project Page — fin/index.html

### Section 1: Hero
- Title: Final Project: Settling the Solar System
- Subtitle: A near-future mission design from launch to
  civilization

### Section 2: Project Overview
The final project is a group mission design exercise. Each
group of 5 students designs a complete near-future mission
to one destination in the solar system — from the scientific
justification for choosing that world, through the chemistry
of survival, the biology of habitat design, and the culture
of building a society. Each student draws directly from one
of the four ages covered in the second half of the course.
One student serves as mission commander, providing either an
introduction or synthesis of the entire mission.

### Section 3: Choose Your Destination
Display as 5 styled destination cards:

- **The Moon** — Most near-future realistic, most reference
  material available
- **Mars** — Most studied destination, most realistic within
  50 years
- **Europa** — Subsurface ocean, strong chemistry and
  biology angle
- **Titan** — Dense atmosphere, organic chemistry, most
  exotic environment
- **Proxima Centauri b** — For ambitious groups willing to
  engage more speculatively

Note displayed prominently: No two groups may choose the
same destination. Selection is first come, first served.

### Section 4: The Five Roles
Display as 5 styled cards numbered 1–5:

**Card 1 — Mission Commander: Overview and Vision**
This student is the group's narrator. If presenting first,
they introduce the destination, explain why humanity needs
to become a multi-planetary species, outline the mission's
overall timeline from launch to settlement, and frame the
four challenges their teammates will address. If presenting
last, they synthesize all four sections into a unified
mission document showing how the planetary science,
chemistry, biology, and culture all depend on each other.
This student draws from the full arc of the second half of
the course and must demonstrate the broadest understanding
of the group's chosen world.

**Card 2 — Why Here? Target World and its Place in the
Solar System (Planetary Age, Chapter 4)**
This student makes the scientific case for the group's
chosen destination. Drawing directly from Chapter 4, they
analyze the target world's physical structure, orbital
position, axial tilt, geological activity, and relationship
to the habitable zone. They compare it to Earth using the
planetary classification frameworks from the course, and
explain what the solar system's formation history tells us
about why this world has the characteristics it does. Their
central argument is: given everything we know about this
planet from telescopes, orbiters, and landers, here is
precisely what awaits the first humans who arrive there.

**Card 3 — Can We Survive There? Chemistry and Life Support
(Chemical Age, Chapter 5)**
This student tackles the most fundamental question of the
mission: does the target world have the raw chemical
ingredients to keep humans alive, and if not, how do we
manufacture or import what is missing? Drawing from Chapter
5, they analyze the availability of water, oxygen, nitrogen,
and carbon on the surface or in the atmosphere, connect the
periodic table to the practical problem of resource
extraction, and design the life support systems that would
sustain the settlement. They also address the chemical
history of the world and what that history tells us about
the risks and opportunities waiting for the first settlers.

**Card 4 — Staying Alive: Habitat Design and Biology
(Biological Age, Chapter 6)**
This student designs the physical and biological environment
that settlers will actually live inside. Drawing from
Chapter 6, they reverse-engineer Earth's habitability —
identifying what the tree of life, billions of years of
evolution, and the conditions that allowed complex
multicellular life to flourish tell us about what humans
fundamentally need to survive. They use mass extinction
events as cautionary tales about what happens when those
conditions collapse, and apply those lessons to habitat
design: radiation shielding, closed-loop food production,
psychological wellbeing, and the minimum viable ecosystem
required to sustain a small isolated human community.

**Card 5 — Building a Society: Culture, Governance and
the Future (Cultural Age, Chapter 7)**
This student addresses the most human dimension of the
mission. Drawing from Chapter 7, they use the Out of Africa
migration as an analogy for leaving Earth, the Agricultural
and Urban Revolutions as models for how small settlements
scale into civilizations, and the Drake Equation and SETI
thinking as a framework for what makes a technological
society sustainable over the long term. They design the
governance structure, communication system with Earth,
cultural identity of the settlers, and the long-term vision
for the colony — asking not just whether humans can survive
on another world, but whether they can truly live there.

### Section 5: Deliverables

**Report:**
Each student writes their own section of 600–800 words
with relevant images and diagrams. The group assembles all
five sections into one document with a shared introduction
and conclusion. Submitted as a PDF via Google Classroom
before the final session.

**Presentation:**
Each student presents their section for 3–4 minutes,
building the mission story sequentially from Student 1
through Student 5. Total group time 15–20 minutes. Same
Canva template as midterm.

### Section 6: Grading

**Presentation:**
- Content (15 marks): depth of research, connection to
  course age, logical argument
- Delivery (5 marks): preparedness, fluency, clarity
- Interaction (5 marks): eye contact, movement, audience
  engagement
- Visual Quality (5 marks): slide design, use of images
  and diagrams

**Report:**
- Depth of research (10 marks)
- Connection to course content (10 marks)
- Clarity of writing (10 marks)
- Visual presentation (10 marks)

---

## Chapter Overview Pages — /N/index.html

Each of the 8 chapter overview pages (0–7) follows this
template:

### Hero
- Full-width background image (use the most visually
  striking figure from that chapter)
- Chapter number and title
- Associated telescope name
- Week numbers

### Introduction
Scraped verbatim from the corresponding Abekta chapter
overview page. For Chapter 0 this is the background text
and full timeline table. For Chapters 1–7 this is the
narrative table of events.

### Topic Cards
A grid of 4 cards linking to the 4 subpages, each showing:
- Topic number and title
- One-sentence description (first sentence of that subpage)
- Thumbnail image (first figure from that subpage)
- Link to the subpage

---

## Chapter Subpages — /N/M.html

Each of the 32 subpages follows this template:

### Hero
- Chapter and topic number
- Topic title
- Brief subtitle (first sentence of the content)

### Content
Scraped verbatim from the corresponding Abekta subpage:
- All headings preserved (h1, h2, h3)
- All body text preserved exactly
- All figures embedded with captions
- Math expressions rendered via MathJax
- External video embeds preserved where present
- Tables preserved with styling

### Footer Navigation
← Previous | ↑ Chapter | Next →

---

## Design Specification

### Color Palette
- Page background: #0a0a0f
- Primary text: #e8e8f0
- Secondary text: #9090a8
- Accent / links: #2dd4bf (nebula teal)
- Chapter number highlight: #f5a623 (warm gold)
- Card background: #12121a
- Card border: #1e1e2e
- Nav background (solid): #0d0d14
- Hero overlay: rgba(10, 10, 15, 0.55)

### Typography
Load from Google Fonts:
- Headings: Orbitron (weights 400, 700)
- Body: Inter (weights 400, 500, 600)

### Layout
- Max content width: 1100px, centered
- Section padding: 80px vertical
- Card grid: CSS Grid, 2 columns on desktop, 1 on mobile
- Images: max-width 100%, border-radius 8px, subtle
  drop shadow
- Figure captions: secondary text color, italic, centered

### Visual Effects
All effects must be implemented in plain CSS and vanilla
JS only — no external animation libraries.

- Hero sections: parallax scrolling on background image
  via CSS transform on scroll
- Sections: fade-in + slight translateY on scroll using
  IntersectionObserver API
- Navigation: transparent over hero, transitions to solid
  #0d0d14 with box-shadow on scroll
- Chapter number badges: #f5a623 with text-shadow glow
- Cards: translateY(-4px) and border-color highlight
  on hover, transition 0.3s ease
- Home hero: CSS-only animated star field using
  pseudo-elements and keyframe animations
- Figures: click to open lightbox (pure vanilla JS,
  no library) with dark overlay and close button
- Active nav item: color #2dd4bf
- Dropdown menus: appear on hover with fade + translateY
  animation

### Responsive Breakpoints
- Desktop: > 1024px — full layout
- Tablet: 768px–1024px — reduced padding, smaller fonts
- Mobile: < 768px — single column, hamburger menu

### MathJax
Load MathJax 3 from CDN on all pages to render LaTeX:
```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```
Pages confirmed to contain LaTeX expressions:
0.1, 1.1, 1.2, 1.3, 2.4, 3.2, 4.3, 5.4, 6.4, 7.4

---

## Build Instructions for Claude Code

Execute in this order:

1. Create the full folder structure as specified above.

2. Download all Abekta-hosted images to media/ using wget
   or curl. Base URL:
   https://cassa.site/abekta/_media/

3. Download all external images to media/ using the
   save-as filenames specified in the Image Handling
   section.

4. Build css/style.css implementing the full design
   specification above.

5. Build js/main.js implementing:
   - Navbar scroll behavior (transparent → solid)
   - Dropdown menu open/close
   - Hamburger menu for mobile
   - IntersectionObserver fade-in animations
   - Parallax effect on hero sections
   - CSS star field trigger on home hero
   - Lightbox for all figures (click to enlarge,
     click outside or press Escape to close)

6. Build index.html (Home) with all six sections.

7. Build mid/index.html with all six sections.

8. Build fin/index.html with all six sections.

9. For each chapter 0–7, scrape the Abekta overview page,
   extract the main content, and build /N/index.html
   using the chapter overview template.

10. For each subpage 0.1–7.4, scrape the corresponding
    Abekta page, extract the main content, and build
    /N/M.html using the subpage template.

11. Update all image src attributes throughout to point
    to local /minds/ast100/media/ paths.

12. Validate all internal navigation links. Every href
    in the navbar, dropdowns, topic cards, and footer
    navigation must resolve correctly when served from
    cassa.site/minds/ast100/.

13. Verify MathJax renders on all pages listed above.

14. Verify the lightbox works on all figures across all
    pages.

15. Verify responsive layout on all three breakpoints.

---

## Important Notes

- All paths must work when served from
  cassa.site/minds/ast100/. Use root-relative paths
  beginning with /minds/ast100/ or consistent relative
  paths throughout.

- The server is Bluehost Apache shared hosting. No Node.js,
  no server-side rendering, no .htaccess rewriting needed.
  All files are static HTML served directly from the
  /minds/ast100/ directory.

- Do not rewrite, summarize, or add to any content scraped
  from the Abekta source pages. Take it verbatim.

- Do not add AI-generated commentary, introductions, or
  summaries to chapter or subpage content.

- The only pages with original content are: index.html,
  mid/index.html, and fin/index.html.

- Chapter overview pages (/N/index.html) contain scraped
  Abekta content plus the 4 topic cards — nothing else.

- Subpages (/N/M.html) contain scraped Abekta content
  plus header and footer navigation — nothing else.
