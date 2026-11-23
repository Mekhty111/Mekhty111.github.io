/* Renders the portfolio data into the static page. Pure functions: data in, HTML string out.
   Used only at build time by scripts/build.ts. The browser gets plain HTML plus assets/js/site.js. */
import type {
  Portfolio, Project, Demo, Experience, Education, Certificate, ArchiveItem,
} from "./data/types.ts";

/* ---------------------------------------------------------------- helpers */
const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const host = (u: string): string => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const ext = 'target="_blank" rel="noopener"';
const join = (parts: (string | false | undefined | null)[]): string => parts.filter(Boolean).join("");

/** Lucide icons (ISC licence), inlined so there is no icon dependency. */
const ICONS: Record<string, string> = {
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  maximize: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
  minimize: '<path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>',
  play: '<path d="M6 3.5v17a.5.5 0 0 0 .76.43l14-8.5a.5.5 0 0 0 0-.86l-14-8.5A.5.5 0 0 0 6 3.5z"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  menu: '<path d="M4 8h16"/><path d="M4 16h16"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  docs: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
};
export const icon = (name: string, cls = "icon"): string =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

/* ------------------------------------------------------------------ dates */
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/** "Feb 2026" → "2026-02"; "Now" → "now"; anything else → "" */
const isoMonth = (s: string): string => {
  const t = s.trim().toLowerCase();
  if (/^(now|present|today)$/.test(t)) return "now";
  const m = t.match(/^([a-z]{3})[a-z]*\.?\s+(\d{4})$/);
  return m && MONTHS.includes(m[1]) ? `${m[2]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, "0")}` : "";
};
const monthIndex = (iso: string, now: Date): number => {
  if (iso === "now") return now.getFullYear() * 12 + now.getMonth();
  const [y, m] = iso.split("-").map(Number);
  return y * 12 + m - 1;
};
export const fmtMonths = (n: number): string => {
  const y = Math.floor(n / 12), mo = n % 12, out: string[] = [];
  if (y) out.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (mo || !y) out.push(`${mo || 1} mo${(mo || 1) > 1 ? "s" : ""}`);
  return out.join(" ");
};
/** Duration for "Mon YYYY — Mon YYYY" periods, as a <span> the client script keeps current. */
const duration = (period: string, now: Date): string => {
  const [a, b] = period.split(/\s*[—–-]\s*/);
  if (!a || !b) return "";
  const from = isoMonth(a), to = isoMonth(b);
  if (!from || !to) return "";
  const n = monthIndex(to, now) - monthIndex(from, now) + 1;
  return n > 0 ? `<span class="duration" data-from="${from}" data-to="${to}">${fmtMonths(n)}</span>` : "";
};
/** "Feb 2026 — Now" → "Feb 2026 – Now" with an en dash, kept on one line per side. */
const fmtPeriod = (p: string): string =>
  esc(p).replace(/\s*[—–]\s*/, '<span class="dash"> – </span>');

/** Splits "Lead — rest" into a bold lead. */
const point = (t: string): string => {
  const i = t.indexOf(" — ");
  return i > 0 && i < 60
    ? `<li><strong class="lead">${esc(t.slice(0, i))}</strong> ${esc(t.slice(i + 3, i + 4).toUpperCase() + t.slice(i + 4))}</li>`
    : `<li>${esc(t)}</li>`;
};
const initials = (s: string) => s.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("");
const logo = (file: string | undefined, org: string, size = 28): string =>
  file
    ? `<img class="logo" src="assets/logos/${esc(file)}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">`
    : `<span class="logo logo--initials" aria-hidden="true">${esc(initials(org))}</span>`;
const stackLine = (items: string[] | undefined, label = "Stack"): string =>
  items && items.length
    ? `<p class="stack"><span class="visually-hidden">${label}: </span>${items.map((s) => `<span>${esc(s)}</span>`).join("")}</p>`
    : "";

/* -------------------------------------------------------------- sections */
const NAV = [
  ["work", "Work"],
  ["experience", "Experience"],
  ["about", "About"],
  ["education", "Education"],
  ["contact", "Contact"],
] as const;

function header(d: Portfolio): string {
  const links = NAV.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("");
  return `<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <div class="wrap nav__inner">
    <a class="nav__name" href="#top" translate="no">${esc(d.person.name)}</a>
    <nav class="nav__links" aria-label="Sections"><ul>${links}</ul></nav>
    <a class="btn btn--quiet btn--sm nav__cv" href="${esc(d.site.cv)}" download>${icon("download")}<span>Download CV</span></a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="nav__toggle-label">Menu</span>${icon("menu", "icon icon--open")}${icon("close", "icon icon--close")}
    </button>
  </div>
  <div class="menu" id="menu" data-menu hidden>
    <nav aria-label="Sections"><ul>${links}</ul></nav>
    <a class="btn btn--primary" href="${esc(d.site.cv)}" download>${icon("download")}<span>Download CV</span></a>
  </div>
</header>`;
}

function contactLinks(d: Portfolio, opts: { cv?: boolean; large?: boolean } = {}): string {
  const c = d.contact;
  const cls = opts.large ? "contact-link contact-link--lg" : "contact-link";
  // In the closing section the first channel (email if set, else LinkedIn) is the primary action.
  const primary = opts.large ? " contact-link--primary" : "";
  return join([
    c.email && `<a class="${cls}${primary}" href="mailto:${esc(c.email)}">${icon("mail")}<span>${esc(c.email)}</span></a>`,
    c.linkedin && `<a class="${cls}${c.email ? "" : primary}" href="${esc(c.linkedin)}" ${ext}>${icon("linkedin")}<span>${opts.large ? "Message on LinkedIn" : "LinkedIn"}</span></a>`,
    c.github && `<a class="${cls}" href="${esc(c.github)}" ${ext}>${icon("github")}<span>GitHub</span></a>`,
    c.telegram && `<a class="${cls}" href="https://t.me/${esc(c.telegram.replace(/^@/, ""))}" ${ext}><span>Telegram</span></a>`,
    opts.cv && `<a class="${cls}" href="${esc(d.site.cv)}" download>${icon("download")}<span>CV (PDF)</span></a>`,
  ]);
}

function hero(d: Portfolio): string {
  const p = d.person;
  const [first, ...rest] = p.name.split(" ");
  return `<section class="hero" id="top" aria-labelledby="hero-name">
  <div class="wrap">
    <h1 class="hero__name" id="hero-name" translate="no"><span class="line"><span data-enter="2">${esc(first)}</span></span> <span class="line"><span data-enter="3">${esc(rest.join(" "))}</span></span></h1>
    <div class="hero__grid">
      <div class="hero__side">
        <p class="hero__role" data-enter="4">
          ${p.photo ? `<img class="hero__photo" src="${esc(p.photo)}" alt="Portrait of ${esc(p.name)}" width="56" height="56" decoding="async">` : ""}
          <span><strong>${esc(p.role)}${p.company ? ` at ${esc(p.company)}` : ""}</strong><span class="hero__place">${icon("pin")}${esc(p.location)}</span></span>
        </p>
        ${p.availability ? `<p class="status" data-enter="4"><span class="status__dot" aria-hidden="true"></span>${esc(p.availability)}</p>` : ""}
        <div class="actions" data-enter="5">
          <a class="btn btn--primary" href="#work">View projects</a>
          <a class="btn btn--quiet" href="${esc(d.site.cv)}" download>${icon("download")}<span>Download CV</span></a>
        </div>
        <p class="actions__links" data-enter="5">${contactLinks(d)}</p>
      </div>
      <div class="hero__text" data-enter="4">
        <p class="hero__statement">${esc(p.statement)}</p>
        <p class="hero__intro">${esc(p.intro)}</p>
        ${d.proof.length ? `<p class="proof">${d.proof.map((x) => `<strong class="num">${esc(x.value)}</strong> ${esc(x.text)}.`).join(" ")}</p>` : ""}
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------- project demo */
/** Applies per-platform URL rules (see Demo docs in types.ts). */
export function demoSrc(demo: Demo, path: string): string {
  const u = new URL(path || "/", demo.url);
  if (demo.kind === "streamlit") u.searchParams.set("embed", "true");
  return u.toString();
}

function projectDemo(p: Project): string {
  const demo = p.demo!;
  const views = demo.views;
  const first = views[0];
  const firstUrl = demoSrc(demo, first.path);
  const canEmbed = demo.embed && demo.kind !== "external";
  const tabs = views.length > 1
    ? `<div class="demo__views" role="group" aria-label="${esc(p.product || p.title)} pages">${views
        .map((v, i) => `<button type="button" class="demo__view" aria-pressed="${i === 0}" data-src="${esc(demoSrc(demo, v.path))}" data-poster="${esc(v.poster)}" data-alt="${esc(v.posterAlt)}">${esc(v.label)}</button>`)
        .join("")}</div>`
    : "";
  return `<project-demo class="demo" data-embed="${canEmbed}" data-timeout="${demo.timeout ?? 25}" data-title="${esc(p.product || p.title)} live demo">
  <div class="demo__bar">
    ${tabs}
    <a class="demo__url" href="${esc(firstUrl)}" ${ext} data-open><span class="demo__live" aria-hidden="true"></span><span data-url>${esc(host(firstUrl))}</span></a>
    <span class="demo__tools">
      <button type="button" class="icon-btn" data-fullscreen hidden aria-label="Full screen">${icon("maximize", "icon icon--max")}${icon("minimize", "icon icon--min")}</button>
      <a class="icon-btn" href="${esc(firstUrl)}" ${ext} data-open aria-label="Open the demo in a new tab">${icon("external")}</a>
    </span>
  </div>
  <div class="demo__stage">
    <img class="demo__poster" src="${esc(first.poster)}" alt="${esc(first.posterAlt)}" width="1440" height="900" loading="lazy" decoding="async">
    <div class="demo__cover">
      <p class="demo__hint"><strong>${canEmbed ? "This is a screenshot. The app itself is running." : "This is a screenshot of the running app."}</strong> <span class="demo__sub">${canEmbed ? `Score an application without leaving the page; it loads from <span translate="no">${esc(host(demo.url))}</span>.` : `It opens <span translate="no">${esc(host(demo.url))}</span> in a new tab.`}</span></p>
      <a class="btn btn--primary demo__run" href="${esc(firstUrl)}" ${ext} data-run>${icon("play")}<span>${canEmbed ? "Run it here" : "Open the live demo"}</span></a>
    </div>
    <div class="demo__status" role="status" aria-live="polite" data-status></div>
  </div>
</project-demo>`;
}

function architecture(p: Project, compact = false): string {
  if (!p.architecture?.length) return "";
  return `<figure class="flow${compact ? " flow--compact" : ""}">
    <figcaption class="sub">${compact ? "How it works" : "Architecture"}</figcaption>
    <ol class="flow__steps">${p.architecture.map((s) => `<li class="flow__step"><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></li>`).join("")}</ol>
  </figure>`;
}

function metricsTable(p: Project): string {
  if (!p.metrics?.length) return "";
  const c = p.metricColumns ?? { value: "Value" };
  const cols = [c.value, c.benchmark, c.threshold].filter(Boolean) as string[];
  return `<div class="results">
    <h4 class="sub">Results</h4>
    <table class="table table--metrics">
      <caption class="visually-hidden">${esc(p.metricsSource || "Results")}</caption>
      <thead><tr><th scope="col">Metric</th>${cols.map((h) => `<th scope="col" class="num">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${p.metrics.map((m) => `<tr><th scope="row">${esc(m.label)}</th><td class="num strong">${esc(m.value)}</td>${c.benchmark ? `<td class="num">${esc(m.benchmark ?? "")}</td>` : ""}${c.threshold ? `<td class="num muted">${esc(m.threshold ?? "")}</td>` : ""}</tr>`).join("")}</tbody>
    </table>
    ${p.metricsSource ? `<p class="note">${esc(p.metricsSource)}</p>` : ""}
  </div>`;
}

function dataTable(t: NonNullable<Project["table"]>): string {
  const [head, ...rows] = t.rows;
  const numeric = head.map((_, i) => rows.every((r) => /^[<≥>≤\d.,%–\s-]+$/.test(r[i])));
  return `<div class="table-wrap"><table class="table">
    <caption>${esc(t.caption)}</caption>
    <thead><tr>${head.map((h, i) => `<th scope="col"${numeric[i] ? ' class="num"' : ""}>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((cell, i) => (i === 0 ? `<th scope="row" class="num">${esc(cell)}</th>` : `<td${numeric[i] ? ' class="num"' : ""}>${esc(cell)}</td>`)).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function projectLinks(p: Project): string {
  return join([
    p.demo && `<a class="text-link" href="${esc(demoSrc(p.demo, p.demo.views[0]?.path ?? "/"))}" ${ext}>${icon("external")}<span>Live demo</span></a>`,
    p.repo && `<a class="text-link" href="${esc(p.repo)}" ${ext}>${icon("github")}<span>Code</span></a>`,
    p.demo?.docs && `<a class="text-link" href="${esc(p.demo.docs)}" ${ext}>${icon("docs")}<span>API docs</span></a>`,
  ]);
}

function featureProject(p: Project): string {
  const id = `project-${p.id}`;
  return `<article class="case" id="${id}" aria-labelledby="${id}-title">
  <header class="case__head">
    <h3 class="case__title" id="${id}-title"><span translate="no">${esc(p.product || p.title)}</span>${p.product ? `<span class="case__alias">${esc(p.title)}</span>` : ""}</h3>
    <p class="case__summary">${esc(p.summary)}</p>
    <p class="case__links">${projectLinks(p)}</p>
  </header>
  ${p.demo ? projectDemo(p) : ""}
  <div class="case__body">
    <section class="case__col" aria-label="Problem"><h4 class="sub">Problem</h4><p>${esc(p.problem)}</p></section>
    <section class="case__col" aria-label="Approach"><h4 class="sub">Approach</h4><ul class="list">${p.approach.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></section>
    <section class="case__col">${metricsTable(p)}</section>
  </div>
  ${architecture(p)}
  ${p.features?.length || p.table ? `<details class="more">
    <summary><span>Product details and decision policy</span>${icon("chevron")}</summary>
    <div class="more__body">
      ${p.features?.length ? `<div><h4 class="sub">What the app does</h4><ul class="list">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>` : ""}
      ${p.table ? `<div>${dataTable(p.table)}</div>` : ""}
    </div>
  </details>` : ""}
  ${stackLine(p.stack)}
</article>`;
}

function secondaryProject(p: Project): string {
  const id = `project-${p.id}`;
  const links = projectLinks(p);
  return `<article class="side-project" id="${id}" aria-labelledby="${id}-title">
  <header class="side-project__head">
    <h3 class="case__title case__title--sm" id="${id}-title" translate="no">${esc(p.title)}</h3>
    <p class="case__summary">${esc(p.summary)}</p>
    ${links ? `<p class="case__links">${links}</p>` : ""}
    ${stackLine(p.stack)}
  </header>
  <div class="side-project__body">
    <p>${esc(p.problem)}</p>
    ${architecture(p, true)}
  </div>
</article>`;
}

function archive(items: ArchiveItem[], github?: string): string {
  if (!items.length) return "";
  return `<div class="archive">
  <h3 class="sub sub--lg">More on GitHub</h3>
  <ul class="archive__list">${items.map((a) => `<li><a class="archive__row" href="${esc(a.repo)}" ${ext}>
      <strong translate="no">${esc(a.title)}</strong><span class="archive__desc">${esc(a.description)}</span><span class="archive__stack">${esc(a.stack.join(", "))}</span>${icon("external", "icon archive__icon")}
    </a></li>`).join("")}</ul>
  ${github ? `<p class="archive__all"><a class="text-link" href="${esc(github)}?tab=repositories" ${ext}>${icon("github")}<span>All repositories</span></a></p>` : ""}
</div>`;
}

function work(d: Portfolio): string {
  const feature = d.projects.filter((p) => p.layout === "feature");
  const secondary = d.projects.filter((p) => p.layout === "secondary");
  return `<section class="section section--work" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <header class="section__head"><h2 id="work-title">Selected work</h2></header>
    ${feature.map(featureProject).join("")}
    ${secondary.map(secondaryProject).join("")}
    ${archive(d.archive, d.contact.github)}
  </div>
</section>`;
}

function job(e: Experience, now: Date): string {
  return `<li class="job">
    <p class="job__when"><span class="num">${fmtPeriod(e.period)}</span>${duration(e.period, now)}</p>
    <div class="job__body">
      <h3 class="job__title">${esc(e.title)}</h3>
      <p class="job__org">${logo(e.logo, e.org)}<span><span translate="no">${esc(e.org)}</span>${e.place ? `<span class="job__place">, ${esc(e.place)}</span>` : ""}</span></p>
      ${e.points.length ? `<ul class="list">${e.points.map(point).join("")}</ul>` : ""}
      ${stackLine(e.stack)}
    </div>
  </li>`;
}

function split(id: string, title: string, body: string, extraClass = ""): string {
  return `<section class="section ${extraClass}" id="${id}" aria-labelledby="${id}-title">
  <div class="wrap split">
    <header class="split__head"><h2 id="${id}-title">${title}</h2></header>
    <div class="split__body">${body}</div>
  </div>
</section>`;
}

function experience(d: Portfolio, now: Date): string {
  return split("experience", "Experience", `<ol class="jobs">${d.experience.map((e) => job(e, now)).join("")}</ol>`);
}

function about(d: Portfolio): string {
  const skills = `<dl class="skills">${d.skills.map((g) => `<div class="skills__row"><dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(", ")}</dd></div>`).join("")}</dl>`;
  const langs = d.languages.length
    ? `<dl class="skills skills--langs"><div class="skills__row"><dt>Languages</dt><dd>${d.languages.map((l) => `${esc(l.name)} <span class="muted">(${esc(l.level.toLowerCase())})</span>`).join(", ")}</dd></div></dl>`
    : "";
  return split("about", "About", `<div class="prose">${d.about.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    <h3 class="sub sub--lg" id="skills">Skills</h3>${skills}${langs}`);
}

function edu(e: Education, now: Date): string {
  return `<li class="job">
    <p class="job__when"><span class="num">${fmtPeriod(e.period)}</span></p>
    <div class="job__body">
      <h3 class="job__title">${esc(e.title)}</h3>
      <p class="job__org">${logo(e.logo, e.org)}<span>${esc(e.org)}</span></p>
      ${e.points?.length ? `<ul class="list">${e.points.map(point).join("")}</ul>` : ""}
    </div>
  </li>`;
}

const VISIBLE_CERTS = 6;
function cert(c: Certificate, i: number): string {
  const title = c.url ? `<a href="${esc(c.url)}" ${ext}>${esc(c.title)}${icon("external", "icon icon--inline")}</a>` : esc(c.title);
  return `<tr${i >= VISIBLE_CERTS ? " data-extra" : ""}><th scope="row">${title}</th><td>${esc(c.issuer)}</td><td class="num">${c.status === "done" ? esc(c.date || "") : "In progress"}</td></tr>`;
}

function education(d: Portfolio, now: Date): string {
  const certs = d.certificates;
  const more = certs.length - VISIBLE_CERTS;
  return split("education", "Education", `<ol class="jobs">${d.education.map((e) => edu(e, now)).join("")}</ol>
    <h3 class="sub sub--lg" id="certificates">Certificates</h3>
    <div class="table-wrap"><table class="table table--certs" data-certs>
      <caption class="visually-hidden">Certificates, with issuer and date</caption>
      <thead><tr><th scope="col">Certificate</th><th scope="col">Issuer</th><th scope="col" class="num">Date</th></tr></thead>
      <tbody>${certs.map(cert).join("")}</tbody>
    </table></div>
    ${more > 0 ? `<button class="btn btn--quiet btn--sm certs__toggle" type="button" data-certs-toggle hidden aria-expanded="false" data-more="Show all ${certs.length}" data-less="Show fewer">Show all ${certs.length}</button>` : ""}`);
}

function closing(d: Portfolio): string {
  return `<section class="section closing" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <h2 class="closing__title" id="contact-title">${esc(d.closing.heading)}</h2>
    <p class="closing__text">${esc(d.closing.text)}</p>
    <div class="closing__links">${contactLinks(d, { cv: true, large: true })}</div>
    <p class="closing__place">${icon("pin")}${esc(d.person.location)}</p>
  </div>
</section>`;
}

function footer(d: Portfolio, now: Date): string {
  return `<footer class="footer">
  <div class="wrap footer__inner">
    <p>© <span data-year>${now.getFullYear()}</span> <span translate="no">${esc(d.person.name)}</span></p>
    <p><a class="text-link" href="#top">Back to top</a></p>
  </div>
</footer>`;
}

/* ------------------------------------------------- print-only CV (cv.pdf) */
function printCv(d: Portfolio, now: Date): string {
  const c = d.contact;
  const plainDuration = (p: string) => duration(p, now).replace(/<[^>]+>/g, "");
  const item = (e: Experience | Education, bullets = true) => `<div class="cv__item">
      <div class="cv__when">${esc(e.period)}${plainDuration(e.period) ? `<br>${plainDuration(e.period)}` : ""}</div>
      <div><h3>${esc(e.title)}</h3><p class="cv__org">${esc(e.org)}${"place" in e && e.place ? `, ${esc(e.place)}` : ""}</p>
        ${bullets && e.points?.length ? `<ul>${e.points.map(point).join("")}</ul>` : ""}
        ${"stack" in e && e.stack?.length ? `<p class="cv__tools">Tools: ${e.stack.map(esc).join(", ")}</p>` : ""}</div></div>`;
  return `<article class="cv" aria-hidden="true">
    <p class="cv__name">${esc(d.person.name)}</p>
    <p class="cv__role">${esc(d.person.role)}${d.person.company ? `, ${esc(d.person.company)}` : ""}</p>
    <p class="cv__lede">${esc(d.person.statement)}</p>
    <p class="cv__contacts">${[
      esc(d.person.location),
      c.email && `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`,
      c.phone && esc(c.phone),
      ...[c.linkedin, c.github, d.site.url].filter(Boolean).map((u) => `<a href="${esc(u)}">${esc(host(u!))}</a>`),
    ].filter(Boolean).join("&nbsp;&nbsp;|&nbsp;&nbsp;")}</p>
    <h2>Projects</h2>${d.projects.map((p) => `<div class="cv__item"><div class="cv__when">${esc(p.year)}</div><div>
      <h3>${esc(p.product ? `${p.product}: ${p.title}` : p.title)}</h3><p class="cv__org">${esc(p.summary)}</p>
      <ul>${p.approach.slice(0, 3).map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
      ${p.metrics?.length ? `<p class="cv__tools">${p.metrics.map((m) => `${esc(m.label)} ${esc(m.value)}`).join(", ")}</p>` : ""}
      <p class="cv__tools">${join([
        p.demo && `Demo: <a href="${esc(demoSrc(p.demo, p.demo.views[0]?.path ?? "/"))}">${esc(host(demoSrc(p.demo, p.demo.views[0]?.path ?? "/")))}</a>`,
        p.demo && p.repo && "&nbsp;&nbsp;|&nbsp;&nbsp;",
        p.repo && `Code: <a href="${esc(p.repo)}">${esc(host(p.repo))}</a>`,
      ])}</p>
    </div></div>`).join("")}
    <h2>Experience</h2>${d.experience.map((e) => item(e)).join("")}
    <h2>Skills</h2><dl class="cv__skills">${d.skills.map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(", ")}</dd></div>`).join("")}</dl>
    <h2>Education</h2>${d.education.map((e) => item(e, false)).join("")}
    <h2>Certificates</h2><ul class="cv__certs">${d.certificates.map((x) => `<li>${esc(x.title)}, <em>${esc(x.issuer)}${x.status === "done" ? (x.date ? ", " + esc(x.date) : "") : ", in progress"}</em></li>`).join("")}</ul>
    <h2>Languages</h2><p>${d.languages.map((l) => `${esc(l.name)} (${esc(l.level.toLowerCase())})`).join(", ")}</p>
  </article>`;
}

/* ------------------------------------------------------------------ head */
function head(d: Portfolio): string {
  const s = d.site;
  const og = `${s.url}/${s.ogImage}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: d.person.name,
    jobTitle: d.person.role,
    ...(d.person.company ? { worksFor: { "@type": "Organization", name: d.person.company } } : {}),
    address: { "@type": "PostalAddress", addressLocality: d.person.location.split(",")[0], addressCountry: "AZ" },
    url: s.url,
    image: d.person.photo,
    sameAs: [d.contact.linkedin, d.contact.github].filter(Boolean),
    knowsAbout: ["Credit risk modelling", "Probability of default", "Machine learning", "MLOps", "Retrieval-augmented generation"],
  };
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(s.title)}</title>
<meta name="description" content="${esc(s.description)}">
<link rel="canonical" href="${esc(s.url)}/">
<meta name="author" content="${esc(d.person.name)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0d0f0c">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="${esc(d.person.name)}">
<meta property="og:url" content="${esc(s.url)}/">
<meta property="og:title" content="${esc(s.title)}">
<meta property="og:description" content="${esc(s.description)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(d.person.name)}, ${esc(d.person.role)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(s.title)}">
<meta name="twitter:description" content="${esc(s.description)}">
<meta name="twitter:image" content="${esc(og)}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<script src="assets/js/site.js" defer></script>`;
}

/* ------------------------------------------------------------------ page */
export function renderPage(d: Portfolio, now = new Date()): string {
  return `<!doctype html>
<!-- Generated by scripts/build.ts from src/data/portfolio.ts. Do not edit by hand: run "npm run build". -->
<html lang="en">
<head>
${head(d)}
</head>
<body>
${header(d)}
<main id="main">
${hero(d)}
${work(d)}
${experience(d, now)}
${about(d)}
${education(d, now)}
${closing(d)}
</main>
${footer(d, now)}
${printCv(d, now)}
</body>
</html>
`;
}

export function renderSitemap(d: Portfolio, now = new Date()): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(d.site.url)}/</loc><lastmod>${now.toISOString().slice(0, 10)}</lastmod></url>
</urlset>
`;
}
