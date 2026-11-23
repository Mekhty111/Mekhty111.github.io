/**
 * Types for the portfolio content in `portfolio.ts`.
 * Every field the page shows comes from there; components never hard-code personal facts.
 *
 * Conventions
 * - Optional fields can be left out; the section or line that uses them is simply not rendered.
 * - Periods are "Mon YYYY — Mon YYYY" or "Mon YYYY — Now"; durations are computed at build time.
 * - In experience points, text before " — " is set in bold as the lead.
 * - Image paths are relative to the site root (e.g. "assets/shots/credence-score.webp").
 */

export interface Link {
  label: string;
  href: string;
}

export interface Person {
  name: string;
  /** Short role line, e.g. "Data Scientist". */
  role: string;
  company?: string;
  location: string;
  /** One sentence: what you build. Shown under the name and in the PDF. */
  statement: string;
  /** Two or three sentences for the hero; plain, specific. */
  intro: string;
  /** Status next to the green dot in the hero. Leave empty to hide it. */
  availability?: string;
  /** Square photo or avatar URL. Optional. */
  photo?: string;
}

export interface Contact {
  /** Leave empty until you want it published: the email link only renders when set. */
  email?: string;
  phone?: string;
  telegram?: string;
  linkedin?: string;
  github?: string;
}

/** A short proof sentence in the hero. `value` is highlighted with tabular figures. */
export interface Proof {
  value: string;
  text: string;
}

/** One row of a project's results table. */
export interface Metric {
  label: string;
  /** The shipped model's value. */
  value: string;
  /** Benchmark model's value on the same data ("—" if not applicable). */
  benchmark?: string;
  /** Accepted threshold, e.g. "≥ 0.65". */
  threshold?: string;
}

/** Column names for the results table. */
export interface MetricColumns {
  value: string;
  benchmark?: string;
  threshold?: string;
}

/**
 * Live demo for a project. The `ProjectDemo` component (assets/js/site.js) renders it.
 *
 * - kind "fastapi" | "custom": the URL is embedded as is.
 * - kind "streamlit": `?embed=true` is added so Streamlit hides its chrome.
 * - kind "gradio": use the app's direct URL (e.g. https://user-space.hf.space), not the huggingface.co page.
 * - kind "external": never embedded; the window shows the poster and an "Open" link.
 *
 * `embed` must be true only after checking the host allows framing: no `X-Frame-Options: DENY/SAMEORIGIN`
 * and no CSP `frame-ancestors` that excludes mehdiyev.dev. The browser blocks those silently; the component
 * cannot detect it, so a wrong `embed: true` shows a blank or error frame (with the fallback link still visible).
 */
export interface Demo {
  kind: "fastapi" | "streamlit" | "gradio" | "custom" | "external";
  /** Base URL of the running app. */
  url: string;
  embed: boolean;
  /** Pages of the app to switch between. The first is the default. Paths are appended to `url`'s origin. */
  views: DemoView[];
  /** Seconds before the loading state turns into an error with retry and fallback link. Default 25. */
  timeout?: number;
  /** Optional API docs URL (FastAPI /docs, etc.). */
  docs?: string;
}

export interface DemoView {
  label: string;
  /** Path on the demo host, e.g. "/ui/score". */
  path: string;
  /** Real screenshot of this view, used as the poster before the live app loads. */
  poster: string;
  posterAlt: string;
}

export interface ArchitectureStep {
  title: string;
  detail: string;
}

export interface Project {
  id: string;
  title: string;
  /** What the product is called in its own UI, if different from the repo title. */
  product?: string;
  year: string;
  summary: string;
  problem: string;
  approach: string[];
  /** Ordered pipeline, rendered as the architecture diagram. */
  architecture?: ArchitectureStep[];
  features?: string[];
  metrics?: Metric[];
  metricColumns?: MetricColumns;
  /** Caption for the metrics table: where the numbers come from. */
  metricsSource?: string;
  /** Optional table, e.g. a decision policy. First row is the header. */
  table?: { caption: string; rows: string[][] };
  stack: string[];
  repo?: string;
  demo?: Demo;
  /** "feature" gets the large case study with the live window; "secondary" gets a compact layout. */
  layout: "feature" | "secondary";
}

/** Smaller projects listed as one line each. */
export interface ArchiveItem {
  title: string;
  description: string;
  stack: string[];
  repo: string;
  year?: string;
}

export interface Experience {
  period: string;
  title: string;
  org: string;
  /** File in assets/logos/. Without it the initials are shown. */
  logo?: string;
  place?: string;
  points: string[];
  stack?: string[];
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface Education {
  period: string;
  title: string;
  org: string;
  logo?: string;
  points?: string[];
}

export interface Certificate {
  title: string;
  issuer: string;
  date?: string;
  status: "done" | "progress";
  url?: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Site {
  /** Canonical URL, no trailing slash. */
  url: string;
  title: string;
  description: string;
  /** 1200×630 social preview image path. */
  ogImage: string;
  /** PDF resume path, linked from every "Download CV". */
  cv: string;
}

export interface Portfolio {
  site: Site;
  person: Person;
  contact: Contact;
  proof: Proof[];
  about: string[];
  projects: Project[];
  archive: ArchiveItem[];
  experience: Experience[];
  skills: SkillGroup[];
  education: Education[];
  certificates: Certificate[];
  languages: Language[];
  /** Closing section. */
  closing: { heading: string; text: string };
}
