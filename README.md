# mehdiyev.dev

Personal portfolio of Mehdi Mehdiyev, Data Scientist. A static site for GitHub Pages: content in TypeScript, rendered to plain HTML by a zero-dependency Node script. No framework, no `node_modules`.

```
src/data/portfolio.ts   ← all content (edit this)
src/data/types.ts       ← field documentation and types
src/render.ts           ← turns the data into HTML (sections, case studies, print CV)
scripts/build.ts        ← writes index.html + sitemap.xml (+ cv.pdf with --cv)
scripts/shoot.mjs       ← refreshes demo screenshots from the live apps
assets/css/site.css     ← design system, components, print stylesheet for cv.pdf
assets/js/site.js       ← nav, mobile menu, <project-demo> live demo component
index.html, sitemap.xml ← generated; do not edit by hand
```

Requires **Node 22.18+** (runs TypeScript natively) and, for `cv.pdf` and screenshots, Edge or Chrome.

## Edit content

1. Edit `src/data/portfolio.ts`. Your editor type-checks it against `src/data/types.ts`.
2. Run `npm run build` (or `npm run build:cv` to also re-print `cv.pdf`).
3. Commit `index.html`, `sitemap.xml` and, if rebuilt, `cv.pdf`.

The build stops with a message if a referenced file (poster, logo, CV, OG image) is missing.

**Placeholders to fill**
- `contact.email` is empty, so no email link is shown anywhere. Set it to publish one.
- Tax RAG's `repo` is commented out because `github.com/Mekhty111/Tax_RAG` returns 404. Make the repo public, then uncomment it.
- `about` and `person.intro` were drafted from your experience entries. Rewrite them in your own words.

## Add a project

Add an object to `projects`:

- `layout: "feature"` gets the full case study: live demo window, problem / approach / results, architecture pipeline, an expandable details panel and the stack.
- `layout: "secondary"` gets a compact two-column entry with a smaller pipeline.
- Small repos go in `archive` (one line each).

Fields: `summary`, `problem`, `approach[]`, `architecture[]` (ordered steps), `features[]`, `metrics[]` with `metricColumns`, `table` (e.g. a decision policy), `stack[]`, `repo`, `demo`. Only real numbers belong in `metrics`.

## Configure a live demo

```ts
demo: {
  kind: "fastapi",             // "fastapi" | "streamlit" | "gradio" | "custom" | "external"
  url: "https://credit.mehdiyev.dev",
  embed: true,                 // only after checking the host allows framing (see below)
  docs: "https://credit.mehdiyev.dev/docs",
  timeout: 25,                 // seconds before the error state with retry + new-tab link
  views: [
    { label: "Score an applicant", path: "/ui/score", poster: "assets/shots/credence-score.webp", posterAlt: "…" },
  ],
}
```

- **Streamlit**: `?embed=true` is added automatically.
- **Gradio / Hugging Face Spaces**: use the direct `https://<user>-<space>.hf.space` URL, not the huggingface.co page.
- **external**: never embedded; the window shows the poster and links out.

**Check that embedding is allowed** before setting `embed: true`:

```bash
curl -sI https://your-demo.example | grep -iE "x-frame-options|content-security-policy"
```

If the host sends `X-Frame-Options: DENY/SAMEORIGIN` or a CSP `frame-ancestors` that excludes mehdiyev.dev, set `embed: false`. The component never tries to work around these headers. With no JavaScript, every demo button is a normal link that opens the app in a new tab.

**Posters** are real screenshots of each view. To refresh them after the app changes, edit `scripts/shots.json` and run `npm run shots`.

## CV (PDF)

`cv.pdf` is the same content printed with the print stylesheet (plain, ATS-friendly, 2 pages A4). Run `npm run build:cv` after editing content. To use a hand-made PDF instead, put it in the repo root and point `site.cv` at it.

## Run locally

```bash
npm run dev
```

This builds the page and serves it at http://localhost:5517. Any static server works (`python -m http.server 5517`).

## Deploy

GitHub Pages serves the repository root of `main` (Settings → Pages → Deploy from a branch → `main` / root). The custom domain is set by `CNAME`. Build locally, commit the generated files, push. There is no CI build step, so a content edit is not live until `npm run build` has been run and its output committed.

## Fonts and licences

Archivo and Geist are self-hosted in `assets/fonts/` under the SIL Open Font License. Icons are inline SVG paths from Lucide (ISC).
