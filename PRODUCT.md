# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Static site on GitHub Pages (custom domain mehdiyev.dev). Content lives in TypeScript (`src/data/portfolio.ts`) and is rendered to static HTML by a zero-dependency Node script (`npm run build`, Node 22.18+ for native TypeScript). Vanilla CSS and a small progressive-enhancement script. No framework, no runtime dependencies.

## Users
Technical recruiters, hiring managers and ML/engineering leads at banks, fintechs and AI teams, mostly international. They arrive from LinkedIn, GitHub or a CV link, usually on a laptop during working hours, sometimes on a phone. They give a portfolio under a minute before deciding whether to read further.

## Product Purpose
Get Mehdi Mehdiyev, a Data Scientist at Yelo Bank (Baku), shortlisted for data science and ML engineering roles, with credit risk and production ML as the strongest signal.

## Positioning
A data scientist who ships: models that run inside a bank's systems and a scoring service anyone can try. Proof over claims: a live, working credit-decision engine and real numbers from real systems.

## Operating Context
First impression within seconds: who, what role, what proof. Second pass: a project you can use, then the experience that backs it. Exit actions: download CV, open LinkedIn or GitHub, email.

## Capabilities and Constraints
- Live demo: Credence (credit.mehdiyev.dev) is a FastAPI app with no frame restrictions, so it can be embedded.
- Tax RAG has no public repo (GitHub returns 404) and no deployed demo.
- `cv.pdf` is printed from the same page with a print stylesheet and must stay a plain, ATS-friendly 2-page A4 resume.
- No email is published yet.

## Brand Commitments
None beyond the name, the domain mehdiyev.dev and the existing project names (Credence).

## Evidence on Hand
Real metrics from the Home Credit README (AUC OOT 0.762, Gini 0.524, KS 0.399, PSI 0.0001, LightGBM AUC 0.772, risk-band default rates), real Yelo Bank outcomes (5,000 clients from 14.5 h to 45 min), real screenshots of the live Credence app, certificate URLs, institution logos.

## Product Principles
- Never invent employers, dates, metrics, demos or claims. Missing facts stay as clearly marked placeholders in the config.
- Show the working thing before describing it.
- Readable in one minute, deep for whoever stays for ten.

## Accessibility & Inclusion
WCAG 2.2 AA: contrast, keyboard access, visible focus, reduced motion, semantic headings, usable at 320px wide.
