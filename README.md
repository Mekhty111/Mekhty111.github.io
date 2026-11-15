# Mehdi Mehdiyev — resume site

Static resume / portfolio (HTML · CSS · vanilla JS), built for GitHub Pages. No build step.

## Edit content

All content lives in **`data.js`** — name, about, stats, skills, projects, experience, education, certificates, languages.

- **New project card:** add an object to `projects` (`id`, `title`, `kicker`, `description`, `tags`, `metrics`, `url`, `year`). Cards link to `url`.
- **Link a skill to a project:** add the project `id` to the skill's `projects` array — hovering the skill highlights the card.
- **Work experience:** add entries to `experience` — they appear in the timeline above education.
- **Certificates:** add to `certificates`, `status: "done"` + `url` to make the card a link.

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

The ⤓ button in the header prints a clean one-column version — choose “Save as PDF” to get a PDF resume.
"# Mekhty111.github.io" 
