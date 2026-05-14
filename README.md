# sardormurtazaev.github.io

Personal website of **Sardor Murtazaev** — MBA candidate in Finance & AI at Sejong University, Seoul.

🌐 **Live:** [sarriick.github.io/sardormurtazaev.github.io](https://sarriick.github.io/sardormurtazaev.github.io)

---

## About

Single-page personal site built with vanilla HTML, CSS, and JavaScript — no framework, no build step, no dependencies except Three.js loaded from CDN. All CSS and JS are inlined in `index.html` for reliable deployment via GitHub Pages.

Covers academic background, banking internship experience (4 banks), ongoing research on algorithmic fairness in AI credit scoring, active GitHub projects, and contact links.

---

## Visual Features

| Feature | Implementation |
|---------|---------------|
| 3D Solar System background | Three.js r128 — 8 planets with procedural textures, rings, asteroid belt, twinkling stars via GLSL shader |
| Scroll-driven camera | 4 keyframe positions interpolated smoothly on `window.scrollY` |
| Falling leaves canvas | Custom `<canvas>` particles (3 leaf shapes), mouse repulsion, connecting lines |
| Hero letter scramble | Characters cycle through random chars before resolving — split-letter animation |
| Multi-layer parallax | 7 depth layers move at different speeds on scroll (Jungle + Moon technique) |
| Mouse parallax on blobs | Hero background orbs follow cursor with lag via RAF |
| 3D card tilt | `perspective(700px)` on `.tc` elements, follows mouse XY |
| Magnetic buttons | CTA buttons drift toward cursor on hover |
| Click ripple | Ring expands from click point across the full page |
| Custom cursor | Ring (lagged) + dot (instant), `cursor:none` on body |
| Animated stat counters | `easeOutQuart` count-up, triggered by `IntersectionObserver` at `threshold:0` |
| Scroll reveal | Content starts visible, hidden by `.js-ready` pattern after JS loads, revealed with stagger |
| Nav progress bar | 1px line grows as page scrolls |
| Marquee strip | Infinite scrolling keyword band between hero and first section |
| Section dividers | Gradient lines with glowing center dot between every section |

---

## Tech Stack

- **HTML/CSS/JS** — vanilla, no framework
- **Three.js r128** — CDN (`cdnjs.cloudflare.com`)
- **Fonts** — DM Serif Display, Inter, DM Mono (Google Fonts)
- **Deployment** — GitHub Pages (branch: `main`, root `/`)

---

## File Structure

```
/
├── index.html                 ← Complete self-contained site (CSS + JS inlined)
├── llms.txt                   ← AI search engine metadata (ChatGPT Search, Perplexity, Gemini)
├── schema.json                ← Schema.org Person JSON-LD reference copy
├── README.md                  ← This file
├── github-profile-readme.md   ← Content for GitHub profile README repo
└── linkedin-about.txt         ← LinkedIn About section and headline options
```

> `style.css`, `main.js`, and `solar.js` are backup/reference copies.
> The live site reads everything from `index.html` only.
> Three.js requires an active internet connection to load from CDN.

---

## Local Preview

No build step required. Open `index.html` directly, or serve locally:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

---

## Deployment

Repository: `sardormurtazaev.github.io` under account `sarriick`
Pages serves from `main` branch root.

```bash
git add index.html
git commit -m "Update"
git push
```

After pushing: **`Ctrl + Shift + R`** (hard refresh) to bypass browser cache.

---

## Known Architecture Notes

- All JS/CSS is inlined — editing `style.css` or `main.js` has no effect on the live site unless copied into `index.html`
- `body.js-ready` class is added by JS before the scroll-reveal observer — ensures text is always visible even if JS fails
- Stat counters use `threshold: 0` and a `_done` guard to prevent double-firing when parent elements are shifted by reveal animations
- Custom cursor starts at `window.innerWidth/2, window.innerHeight/2` to avoid the top-left corner freeze before first mouse move

---

## Research

**Ongoing:** Algorithmic Discrimination in AI-Based Credit Scoring — Sejong University MBA research
**Publication:** *Безналичные платежи в Узбекистане* (Cashless Payments in Uzbekistan) — TSUE

---

## Contact

**Sardor Murtazaev** · Seoul, South Korea

- LinkedIn: [linkedin.com/in/sadomu](https://linkedin.com/in/sadomu)
- GitHub: [github.com/sardormurtazaev](https://github.com/sardormurtazaev)
- Email: murtazaev.sardor.2003@gmail.com
