# sardormurtazaev.github.io

Personal website of **Sardor Murtazaev** — MBA candidate in Finance & AI at Sejong University, Seoul.

🌐 Live at: [sarriick.github.io/sardormurtazaev.github.io](https://sarriick.github.io/sardormurtazaev.github.io)

---

## About

Single-page personal site deployed via GitHub Pages. Covers academic background, banking internship experience, research on algorithmic fairness in AI credit scoring, and ongoing data/finance projects.

Built with vanilla HTML, CSS, and JavaScript — no framework, no build step.

---

## Features

- 3D solar system background (Three.js r128) with scroll-driven camera
- Falling leaves particle canvas with mouse repulsion
- Hero letter scramble animation
- Multi-layer parallax scroll (7 depth layers)
- Animated stat counters
- 3D card tilt on hover
- Magnetic buttons
- Click ripple effect
- Custom cursor with lag
- Twinkling stars (custom GLSL shader)
- Scroll reveal with stagger
- Nav progress bar

---

## File Structure

```
/
├── index.html      # Complete self-contained site (CSS + JS inlined)
├── llms.txt        # AI search engine metadata (ChatGPT, Perplexity, Gemini)
├── schema.json     # Schema.org Person JSON-LD (reference copy)
└── README.md       # This file
```

> All CSS and JavaScript is inlined in `index.html`.
> Three.js is loaded from cdnjs CDN — requires an internet connection.

---

## Local Preview

No build step or dependencies required.

```bash
# Option 1 — Python
python -m http.server 8000

# Option 2 — Node
npx serve .
```

Then open `http://localhost:8000` in your browser.

---

## Deployment

Repo is named `sardormurtazaev.github.io` under account `sarriick`.
GitHub Pages serves from the `main` branch root.

To update: upload `index.html` via GitHub UI or push via git.

```bash
git add index.html
git commit -m "Update site"
git push
```

After pushing, do a hard refresh in the browser:
**Windows/Linux:** `Ctrl + Shift + R`  
**Mac:** `Cmd + Shift + R`

---

## Research

Current focus: **Algorithmic Discrimination in AI-Based Credit Scoring**  
Undergraduate publication: *Безналичные платежи в Узбекистане* — TSUE

---

**Sardor Murtazaev** · Seoul, South Korea  
[LinkedIn](https://linkedin.com/in/sadomu) · [GitHub](https://github.com/sardormurtazaev) · murtazaev.sardor.2003@gmail.com
