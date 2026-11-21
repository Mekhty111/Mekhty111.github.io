# Mehdi Mehdiyev — resume site

Static resume / portfolio (HTML · CSS · vanilla JS), built for GitHub Pages. No build step.

## Edit content

All content lives in **`data.js`** — name, about, stats, skills, projects, experience, education, certificates, languages.

- **At a glance:** the `glance` strip under the hero is the 10-second summary. `{experienceSince}` turns into the length of experience counted from `experienceSince`.
- **Contacts:** set `links.email`, `links.phone` or `links.telegram` to show them in the contact section and in the PDF header.
- **New project card:** add an object to `projects` (`id`, `title`, `kicker`, `description`, `tags`, `metrics`, `url`, `year`). Cards link to `url`.
- **Link a skill to a project:** add the project `id` to the skill's `projects` array — hovering the skill highlights the card.
- **Work experience / education:** add entries to `experience` or `education` — each has its own section. Use periods like `"Jul 2025 — Feb 2026"` or `"Feb 2026 — Now"`; the duration (`8 mos`) is computed automatically. Text before ` — ` in a point is shown in bold, and `stack` lists the tools used in that role.
- **Certificates:** add to `certificates`, `status: "done"` + `url` to make the card a link. The first 6 show by default, the rest behind “Show all”.
- **Logos:** put the image in `assets/logos/` and set `logo: "file.png"` on an experience, education or certificate entry (an array for co-issued certificates). Without a logo the initials are shown.

## PDF resume (`cv.pdf`)

The “Download CV” buttons link to `cv.pdf`, a 2-page A4 resume printed from the same page with the print stylesheet. **After editing `data.js`, rebuild it:**

```bash
powershell -ExecutionPolicy Bypass -File scripts/build-cv.ps1
```

(It uses headless Edge or Chrome. Ctrl+P → “Save as PDF” in the browser gives the same result.)

## Run locally

```bash
python -m http.server 5517
```

Open http://localhost:5517.

## Deploy to GitHub Pages

1. Create a public repo named **`Mekhty111.github.io`**.
2. Push the contents of this folder to its `main` branch.
3. Repo → Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
4. The site goes live at https://mekhty111.github.io.
