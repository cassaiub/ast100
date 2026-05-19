#!/usr/bin/env python3
"""Generate chapter overview and subpage HTML from scraped Abekta DokuWiki content."""

import os
import re
import html as html_mod
from urllib.parse import unquote, urlparse

RAW_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(RAW_DIR)
MEDIA_DIR = os.path.join(ROOT, "media")

# Map full external image URL -> local filename (per spec, plus 2 extras we added)
EXTERNAL_MAP = {
    "https://resource.isvr.soton.ac.uk/spcg/tutorial/tutorial/Tutorial_files/light1.gif": "light1.gif",
    "https://upload.wikimedia.org/wikipedia/commons/f/f7/Horn_Antenna-in_Holmdel%2C_New_Jersey_-_restoration1.jpg": "horn-antenna.jpg",
    "https://apod.nasa.gov/apod/image/1608/ganab_mosaic1640x600.jpg": "milkyway-namibia.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/ESO_Centaurus_A_LABOCA.jpg/972px-ESO_Centaurus_A_LABOCA.jpg": "centaurus-a.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/NGC4038_Large_01.jpg/1280px-NGC4038_Large_01.jpg": "antennae-galaxies.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Messier51_sRGB.jpg/1280px-Messier51_sRGB.jpg": "whirlpool-galaxy.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lightsmall-optimised.gif": "pulsar.gif",
    "https://upload.wikimedia.org/wikipedia/commons/4/48/Hr8799_orbit_hd.gif": "hr8799-orbit.gif",
    "https://upload.wikimedia.org/wikipedia/commons/f/f2/Tectonic_plate_model_1Ga.webm": "tectonic-plates.webm",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Diagram_of_habitable_zone_rocky_exoplanets%2C_from_NASA_Exoplanet_Archive_and_Gaia_DR3_data.png/1280px-Diagram_of_habitable_zone_rocky_exoplanets%2C_from_NASA_Exoplanet_Archive_and_Gaia_DR3_data.png": "habitable-zone-exoplanets.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/ChangingSeasons_NH_01.png/1280px-ChangingSeasons_NH_01.png": "seasons.png",
    "https://upload.wikimedia.org/wikipedia/commons/6/6a/Moon_Phase_Diagram_for_Simple_English_Wikipedia.GIF": "moon-phases.gif",
    "https://upload.wikimedia.org/wikipedia/commons/b/b7/Eclipse_vs_new_or_full_moons%2C_detailed_annotations.svg": "eclipses.svg",
    "https://starwalk.space/gallery/images/zodiac-constellations/1140x641.jpg": "zodiac.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Constellations%2C_equirectangular_plot%2C_Menzel_families.svg": "constellations.svg",
    "https://live.staticflickr.com/65535/49174363033_bc2d3ef8cd_b.jpg": "heliocentric-model.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/3e/ThomasDiggesmap.JPG": "digges-map.jpg",
    "https://cdn.eso.org/images/screen/eso1620a.jpg": "topocentric-model.jpg",
    # Extras referenced in scraped content but not in spec table:
    "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2023/05/the_allen_telescope_array_is_searching_for_extraterrestrial_intelligence/24896239-1-eng-GB/The_Allen_Telescope_Array_is_searching_for_extraterrestrial_intelligence_pillars.jpg": "allen-array.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_Moon_and_the_Arc_of_the_Milky_Way01.jpg/1280px-The_Moon_and_the_Arc_of_the_Milky_Way01.jpg": "moon-milky-way.jpg",
    # The webm appears via direct src too
}

CHAPTERS = {
    0: ("Seven Ages of the Universe", "All Telescopes", "Weeks 1–2", "cosmos.webp", [
        ("0.1", "SpaceTime and Energy-Matter"),
        ("0.2", "Cosmic Evolution"),
        ("0.3", "Observable Universe"),
        ("0.4", "Light and Telescopes"),
    ]),
    1: ("Particle Age", "Planck", "Weeks 3–4", "cmb.webp", [
        ("1.1", "The Four Fundamental Forces"),
        ("1.2", "Formation of Elementary Particles"),
        ("1.3", "Synthesis of Elements"),
        ("1.4", "Cosmic Microwave Background"),
    ]),
    2: ("Galactic Age", "Hubble Space Telescope", "Weeks 4–5", "hubble.webp", [
        ("2.1", "The Milky Way"),
        ("2.2", "Types of Galaxies"),
        ("2.3", "Formation and Evolution of Galaxies"),
        ("2.4", "Hubble's Law"),
    ]),
    3: ("Stellar Age", "Gaia", "Weeks 5–6", "stars.webp", [
        ("3.1", "The Sun"),
        ("3.2", "Types of Stars"),
        ("3.3", "Formation and Evolution of Stars"),
        ("3.4", "Stellar Remnants"),
    ]),
    4: ("Planetary Age", "Kepler", "Week 8", "planet-formation.webp", [
        ("4.1", "The Solar System"),
        ("4.2", "Types of Planets"),
        ("4.3", "Formation and Evolution of Planets"),
        ("4.4", "Discovering Exoplanets"),
    ]),
    5: ("Chemical Age", "ALMA", "Week 9", "oxygen.webp", [
        ("5.1", "The Periodic Table"),
        ("5.2", "Formation of Oceans and Atmospheres"),
        ("5.3", "Origin of Life on Earth"),
        ("5.4", "Life on Other Planets"),
    ]),
    6: ("Biological Age", "JWST", "Week 10", "tol.webp", [
        ("6.1", "Tree of Life"),
        ("6.2", "Rise of the Eukaryotes"),
        ("6.3", "Mass Extinctions"),
        ("6.4", "Life in the Universe"),
    ]),
    7: ("Cultural Age", "Allen Telescope Array", "Weeks 11–12", "ooa.webp", [
        ("7.1", "History of the World"),
        ("7.2", "History of Mapping the Worlds"),
        ("7.3", "Role of the Sky in Culture"),
        ("7.4", "Search for Extraterrestrial Intelligence"),
    ]),
}


def navbar_html(active=None):
    """active: None | 'home' | 'mid' | 'fin' | int 0-7"""
    def cls(key):
        return ' class="active"' if active == key else ''
    parts = ['<nav class="navbar">',
             '  <div class="nav-inner">',
             '    <a href="/minds/ast100/" class="nav-brand">AST 100</a>',
             '    <button class="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>',
             '    <ul class="nav-links">',
             f'      <li><a href="/minds/ast100/"{cls("home")}>Home</a></li>']
    chapter_titles = {
        0: ("Seven Ages of the Universe", [
            ("0.1 SpaceTime and Energy-Matter", "1.html"),
            ("0.2 Cosmic Evolution", "2.html"),
            ("0.3 Observable Universe", "3.html"),
            ("0.4 Light and Telescopes", "4.html"),
        ]),
        1: ("Particle Age", [
            ("1.1 The Four Fundamental Forces", "1.html"),
            ("1.2 Formation of Elementary Particles", "2.html"),
            ("1.3 Synthesis of Elements", "3.html"),
            ("1.4 Cosmic Microwave Background", "4.html"),
        ]),
        2: ("Galactic Age", [
            ("2.1 The Milky Way", "1.html"),
            ("2.2 Types of Galaxies", "2.html"),
            ("2.3 Formation and Evolution of Galaxies", "3.html"),
            ("2.4 Hubble's Law", "4.html"),
        ]),
        3: ("Stellar Age", [
            ("3.1 The Sun", "1.html"),
            ("3.2 Types of Stars", "2.html"),
            ("3.3 Formation and Evolution of Stars", "3.html"),
            ("3.4 Stellar Remnants", "4.html"),
        ]),
        4: ("Planetary Age", [
            ("4.1 The Solar System", "1.html"),
            ("4.2 Types of Planets", "2.html"),
            ("4.3 Formation and Evolution of Planets", "3.html"),
            ("4.4 Discovering Exoplanets", "4.html"),
        ]),
        5: ("Chemical Age", [
            ("5.1 The Periodic Table", "1.html"),
            ("5.2 Formation of Oceans and Atmospheres", "2.html"),
            ("5.3 Origin of Life on Earth", "3.html"),
            ("5.4 Life on Other Planets", "4.html"),
        ]),
        6: ("Biological Age", [
            ("6.1 Tree of Life", "1.html"),
            ("6.2 Rise of the Eukaryotes", "2.html"),
            ("6.3 Mass Extinctions", "3.html"),
            ("6.4 Life in the Universe", "4.html"),
        ]),
        7: ("Cultural Age", [
            ("7.1 History of the World", "1.html"),
            ("7.2 History of Mapping the Worlds", "2.html"),
            ("7.3 Role of the Sky in Culture", "3.html"),
            ("7.4 Search for Extraterrestrial Intelligence", "4.html"),
        ]),
    }

    def render_dropdown(n):
        title, subs = chapter_titles[n]
        a_class = ' active-num' if active == n else ''
        items = [f'      <li{" class=\"active-dropdown\"" if active == n else ""}>',
                 f'        <button class="nav-toggle-link{a_class}" aria-haspopup="true">{n}</button>',
                 f'        <ul class="nav-dropdown">',
                 f'          <li><a class="dropdown-header-link" href="/minds/ast100/{n}/">{title}</a></li>']
        for label, fname in subs:
            items.append(f'          <li><a href="/minds/ast100/{n}/{fname}">{label}</a></li>')
        items.append('        </ul>')
        items.append('      </li>')
        return '\n'.join(items)

    for n in (0, 1, 2, 3):
        parts.append(render_dropdown(n))
    parts.append(f'      <li><a href="/minds/ast100/mid/"{cls("mid")}>MID</a></li>')
    for n in (4, 5, 6, 7):
        parts.append(render_dropdown(n))
    parts.append(f'      <li><a href="/minds/ast100/fin/"{cls("fin")}>FIN</a></li>')
    parts.append('    </ul>')
    parts.append('  </div>')
    parts.append('</nav>')
    return '\n'.join(parts)


def rewrite_media_url(src):
    """Map any image src to a local /minds/ast100/media/ path."""
    src = html_mod.unescape(src)  # &amp; -> &
    # Strip query string (DokuWiki adds ?w=... or ?tok=...)
    base = src.split('?', 1)[0]

    # 1) Abekta-hosted: /abekta/_media/... -> just the filename
    if base.startswith('/abekta/_media/'):
        filename = base.rsplit('/', 1)[-1]
        return '/minds/ast100/media/' + filename

    # 2) Abekta fetch proxy: /abekta/lib/exe/fetch.php?...media=URL
    if base.startswith('/abekta/lib/exe/fetch.php'):
        # Extract media= param from full src (already unescaped)
        m = re.search(r'[?&]media=([^&]+)', src)
        if m:
            url = unquote(m.group(1))
            if url in EXTERNAL_MAP:
                return '/minds/ast100/media/' + EXTERNAL_MAP[url]
            # Try with single-decoded URL too
            return url  # fallback: leave as external
        return src

    # 3) Full external URL
    if src.startswith('http://') or src.startswith('https://'):
        if src in EXTERNAL_MAP:
            return '/minds/ast100/media/' + EXTERNAL_MAP[src]
        return src  # leave external

    # 4) Protocol-relative (//www.youtube-nocookie.com/...)
    if src.startswith('//'):
        return 'https:' + src

    return src


def extract_wiki_content(raw_html):
    """Pull text between <!-- wikipage start --> and <!-- wikipage stop -->."""
    m = re.search(r'<!-- wikipage start -->(.*?)<!-- wikipage stop -->',
                  raw_html, re.DOTALL)
    if not m:
        raise ValueError("No wikipage markers found")
    return m.group(1)


def clean_content(content):
    """Strip TOC, trailing scripts, normalize image refs."""
    # Remove TOC
    content = re.sub(r'<!-- TOC START -->.*?<!-- TOC END -->', '', content, flags=re.DOTALL)
    content = re.sub(r'<div id="dw__toc".*?</div>\s*</div>', '', content, flags=re.DOTALL)
    # Remove plugin_translation (if any)
    content = re.sub(r'<div class="plugin_translation\s*">.*?</div>', '', content, flags=re.DOTALL)
    # Remove script blocks (hljs configure, etc)
    content = re.sub(r'<script\b[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    # Remove edit section links
    content = re.sub(r'<a\b[^>]*class="[^"]*\bsecedit\b[^"]*"[^>]*>.*?</a>', '', content, flags=re.DOTALL)
    # Remove form_secedit wrappers
    content = re.sub(r'<form[^>]*class="[^"]*btn_secedit[^"]*"[^>]*>.*?</form>', '', content, flags=re.DOTALL)
    # Strip "section edit" placeholder divs that may remain
    content = re.sub(r'<div\s+class="secedit\s+editbutton[^"]*">.*?</div>', '', content, flags=re.DOTALL)

    # Remove the Abekta cosmic-light timeline widget and its wrappers.
    # The widget body is balanced (nested divs/scripts), so iteratively eat
    # nested <div>...</div> pairs starting from <div id="doku-cosmic-light">.
    while True:
        start = content.find('<div id="doku-cosmic-light"')
        if start < 0:
            break
        depth = 0
        i = start
        end = -1
        while i < len(content):
            open_match = content.find('<div', i)
            close_match = content.find('</div>', i)
            if close_match < 0:
                break
            if 0 <= open_match < close_match:
                depth += 1
                i = open_match + 4
            else:
                depth -= 1
                i = close_match + 6
                if depth == 0:
                    end = i
                    break
        if end < 0:
            break
        content = content[:start] + content[end:]

    # Drop the "Timeline" / "Timelines" heading that introduces the (now removed) widget.
    content = re.sub(
        r'<h[1-6][^>]*\bid="timelines?"[^>]*>.*?</h[1-6]>\s*'
        r'(?:<div class="level\d">\s*</div>\s*)?',
        '', content, flags=re.DOTALL)

    # Some pages wrap the widget inside <head>...<body>...</body> stubs from
    # the original author. Strip those stray tags that aren't valid in body.
    content = re.sub(r'<head\b[^>]*>.*?</head>', '', content, flags=re.DOTALL)
    content = re.sub(r'</?body\b[^>]*>', '', content)
    content = re.sub(r'<meta\b[^>]*/?>', '', content)
    content = re.sub(r'<title\b[^>]*>.*?</title>', '', content, flags=re.DOTALL)

    # Clean up any now-empty <p></p> or <p>(whitespace)</p> blocks left behind.
    content = re.sub(r'<p>\s*</p>', '', content)
    # Clean up empty level1/level2 wrapper divs left behind.
    content = re.sub(r'<div class="level\d">\s*</div>', '', content)

    # Rewrite img srcs
    def img_repl(m):
        attrs = m.group(0)
        # Replace src attribute
        def src_sub(sm):
            new_src = rewrite_media_url(sm.group(1))
            return f'src="{html_mod.escape(new_src, quote=True)}"'
        return re.sub(r'src="([^"]+)"', src_sub, attrs, count=1)
    content = re.sub(r'<img\b[^>]*>', img_repl, content)

    # Rewrite iframe/video srcs (for embeds)
    def iframe_repl(m):
        attrs = m.group(0)
        def src_sub(sm):
            new_src = rewrite_media_url(sm.group(1))
            return f'src="{html_mod.escape(new_src, quote=True)}"'
        return re.sub(r'src="([^"]+)"', src_sub, attrs, count=1)
    content = re.sub(r'<iframe\b[^>]*>', iframe_repl, content)
    content = re.sub(r'<video\b[^>]*>', iframe_repl, content)
    content = re.sub(r'<source\b[^>]*>', iframe_repl, content)
    # source within video element
    content = re.sub(r'<source\b([^>]*)\bsrc="([^"]+)"',
                     lambda m: f'<source{m.group(1)}src="{html_mod.escape(rewrite_media_url(m.group(2)), quote=True)}"',
                     content)

    # Make internal links to other Abekta pages absolute (so they still work)
    # Internal wiki links: <a href="/abekta/...">
    def link_repl(m):
        href = m.group(1)
        # Skip if already absolute or anchor
        if href.startswith('#') or href.startswith('http'):
            return m.group(0)
        if href.startswith('/abekta/'):
            return m.group(0).replace(f'href="{href}"', f'href="https://cassa.site{href}"', 1)
        return m.group(0)
    content = re.sub(r'<a\b[^>]*\bhref="([^"]+)"[^>]*>', link_repl, content)

    return content


def first_paragraph_text(content):
    """Return the first paragraph plain text (for subtitle / card description)."""
    # Find first <p>...</p> with substantive text
    for m in re.finditer(r'<p>(.*?)</p>', content, re.DOTALL):
        text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        text = html_mod.unescape(text)
        # Skip if it's just a figure/image-only paragraph
        if len(text) > 30:
            return text
    return ""


def first_image_src(content):
    """Return src of the first <img> in content (already rewritten to local path)."""
    m = re.search(r'<img\b[^>]*\bsrc="([^"]+)"', content)
    return m.group(1) if m else ''


def page_head(title, desc=""):
    desc_esc = html_mod.escape(desc, quote=True)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html_mod.escape(title)} — AST 100</title>
<meta name="description" content="{desc_esc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/minds/ast100/css/style.css">
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>"""


PAGE_FOOT = """<footer class="site-footer">
  <p>AST 100: Our Cosmic History &middot; <a href="https://cassa.site/abekta/">Abekta</a></p>
</footer>

<script src="/minds/ast100/js/main.js"></script>
</body>
</html>
"""


def build_chapter_overview(n):
    title, telescope, weeks, hero_img, subs = CHAPTERS[n]
    raw_path = os.path.join(RAW_DIR, f"ch{n}.html")
    with open(raw_path, encoding='utf-8') as f:
        raw = f.read()
    content = clean_content(extract_wiki_content(raw))

    # Remove the leading <h1> from scraped content since we have a hero
    content = re.sub(r'<h1\b[^>]*>.*?</h1>\s*<div class="level1">\s*</div>\s*',
                     '', content, count=1)
    # Also remove a standalone first <h1> if pattern differs
    content = re.sub(r'^\s*<h1\b[^>]*>.*?</h1>\s*', '', content, count=1)

    # Build topic cards
    cards_html = []
    for sub_num, sub_title in subs:
        # Read corresponding subpage to get first sentence + first image
        n_, m_ = sub_num.split('.')
        sub_path = os.path.join(RAW_DIR, f"p{n_}_{m_}.html")
        with open(sub_path, encoding='utf-8') as f:
            sub_raw = f.read()
        sub_content = clean_content(extract_wiki_content(sub_raw))
        # Remove first h1
        sub_content_no_h1 = re.sub(r'<h1\b[^>]*>.*?</h1>\s*<div class="level1">\s*</div>\s*',
                                    '', sub_content, count=1)
        desc = first_paragraph_text(sub_content_no_h1)
        # Truncate at first sentence
        sentence_match = re.search(r'^(.+?[.!?])(\s|$)', desc)
        if sentence_match:
            desc = sentence_match.group(1)
        thumb = first_image_src(sub_content_no_h1)
        thumb_style = ''
        if thumb:
            thumb_style = f' style="background-image: url(\'{html_mod.escape(thumb, quote=True)}\');"'
        cards_html.append(f"""      <a href="/minds/ast100/{n_}/{m_}.html" class="card-link">
        <article class="card">
          <div class="card-thumb"{thumb_style}></div>
          <span class="card-number">{sub_num}</span>
          <h3>{html_mod.escape(sub_title)}</h3>
          <p>{html_mod.escape(desc)}</p>
        </article>
      </a>""")
    cards_block = '\n'.join(cards_html)

    head = page_head(f"{n}. {title}", f"AST 100 Chapter {n}: {title}")
    nav = navbar_html(active=n)

    # If scraped content is just whitespace (e.g. chapters whose only
    # section was the now-removed timeline widget), drop the intro section
    # so we don't render an empty 80px-padded block.
    has_content = bool(re.search(r'<(?:h[1-6]|p|table|ul|ol|figure|img|iframe|video)\b',
                                 content))
    intro_section = (f"""
<section class="section">
  <div class="section-inner reveal">
    <div class="content">
{content}
    </div>
  </div>
</section>
""" if has_content else "")
    cards_section_class = "section section-alt" if has_content else "section"

    body = f"""

{nav}

<header class="hero compact">
  <div class="hero-bg" style="background-image: url('/minds/ast100/media/{hero_img}');"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1>{html_mod.escape(title)}</h1>
    <p class="hero-subtitle">Chapter {n} &middot; {html_mod.escape(weeks)}</p>
    <div class="hero-meta">
      <span class="accent">Chapter {n}</span>
      <span>{html_mod.escape(telescope)}</span>
      <span>{html_mod.escape(weeks)}</span>
    </div>
  </div>
</header>
{intro_section}
<section class="{cards_section_class}">
  <div class="section-inner reveal">
    <h2>Topics in this chapter</h2>
    <div class="grid grid-2">
{cards_block}
    </div>
  </div>
</section>

{PAGE_FOOT}"""

    out_path = os.path.join(ROOT, str(n), "index.html")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(head + body)
    print(f"Wrote {out_path}")


def build_subpage(n, m, sub_title, prev_link, next_link):
    raw_path = os.path.join(RAW_DIR, f"p{n}_{m}.html")
    with open(raw_path, encoding='utf-8') as f:
        raw = f.read()
    content = clean_content(extract_wiki_content(raw))

    # Pull subtitle (first sentence) before removing h1
    content_no_h1 = re.sub(r'<h1\b[^>]*>.*?</h1>\s*<div class="level1">\s*</div>\s*',
                            '', content, count=1)
    subtitle = first_paragraph_text(content_no_h1)
    sentence_match = re.search(r'^(.+?[.!?])(\s|$)', subtitle)
    if sentence_match:
        subtitle = sentence_match.group(1)

    head = page_head(f"{n}.{m} {sub_title}", subtitle[:160])
    nav = navbar_html(active=n)

    prev_html = ''
    if prev_link:
        prev_label, prev_url = prev_link
        prev_html = f'<a href="{prev_url}" class="nav-prev"><span class="nav-label">&larr; Previous topic</span>{html_mod.escape(prev_label)}</a>'
    else:
        prev_html = '<span></span>'

    next_html = ''
    if next_link:
        next_label, next_url = next_link
        next_html = f'<a href="{next_url}" class="nav-next"><span class="nav-label">Next topic &rarr;</span>{html_mod.escape(next_label)}</a>'
    else:
        next_html = '<span></span>'

    chapter_title = CHAPTERS[n][0]
    up_html = f'<a href="/minds/ast100/{n}/" class="nav-up"><span class="nav-label">&uarr; Back to chapter</span>{html_mod.escape(chapter_title)}</a>'

    body = f"""

{nav}

<header class="hero compact">
  <div class="hero-bg" style="background-image: url('/minds/ast100/media/{CHAPTERS[n][3]}');"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <span class="card-number">Topic {n}.{m}</span>
    <h1>{html_mod.escape(sub_title)}</h1>
    <p class="hero-subtitle">{html_mod.escape(subtitle)}</p>
  </div>
</header>

<section class="section">
  <div class="section-inner reveal">
    <div class="content">
{content_no_h1}
    </div>
  </div>
</section>

<nav class="subpage-nav">
  {prev_html}
  {up_html}
  {next_html}
</nav>

{PAGE_FOOT}"""

    out_path = os.path.join(ROOT, str(n), f"{m}.html")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(head + body)
    print(f"Wrote {out_path}")


def main():
    # Chapter overviews
    for n in range(8):
        build_chapter_overview(n)

    # Subpages with footer navigation
    for n in range(8):
        subs = CHAPTERS[n][4]  # list of (num, title)
        for i, (sub_num, sub_title) in enumerate(subs):
            m = int(sub_num.split('.')[1])
            prev_link = None
            next_link = None
            if i > 0:
                prev_num, prev_title = subs[i-1]
                pm = int(prev_num.split('.')[1])
                prev_link = (f"{prev_num} {prev_title}", f"/minds/ast100/{n}/{pm}.html")
            elif n > 0:
                # last subpage of previous chapter
                prev_chap_subs = CHAPTERS[n-1][4]
                prev_num, prev_title = prev_chap_subs[-1]
                pm = int(prev_num.split('.')[1])
                prev_link = (f"{prev_num} {prev_title}", f"/minds/ast100/{n-1}/{pm}.html")

            if i < len(subs) - 1:
                next_num, next_title = subs[i+1]
                nm = int(next_num.split('.')[1])
                next_link = (f"{next_num} {next_title}", f"/minds/ast100/{n}/{nm}.html")
            elif n < 7:
                next_chap_subs = CHAPTERS[n+1][4]
                next_num, next_title = next_chap_subs[0]
                nm = int(next_num.split('.')[1])
                next_link = (f"{next_num} {next_title}", f"/minds/ast100/{n+1}/{nm}.html")

            build_subpage(n, m, sub_title, prev_link, next_link)


if __name__ == "__main__":
    main()
