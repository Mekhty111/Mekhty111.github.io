/* Builds the static site from src/data/portfolio.ts.
     npm run build        → index.html, sitemap.xml
     npm run build:cv     → the same, then prints cv.pdf with headless Edge or Chrome
   Needs Node 22.18+ (runs TypeScript natively). No dependencies. */
import { writeFileSync, existsSync, statSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import portfolio from "../src/data/portfolio.ts";
import { renderPage, renderSitemap } from "../src/render.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const problems: string[] = [];
const need = (path: string | undefined, what: string) => {
  if (path && !/^https?:/.test(path) && !existsSync(join(root, path))) problems.push(`${what}: missing file ${path}`);
};

/* ------------------------------------------------------------ checks */
need(portfolio.site.cv, "site.cv");
need(portfolio.site.ogImage, "site.ogImage");
for (const p of portfolio.projects) {
  if (p.demo) {
    if (!p.demo.views.length) problems.push(`project ${p.id}: demo.views needs at least one view`);
    p.demo.views.forEach((v) => need(v.poster, `project ${p.id} poster`));
  }
}
for (const e of [...portfolio.experience, ...portfolio.education]) if (e.logo) need(`assets/logos/${e.logo}`, `${e.org} logo`);
if (!portfolio.contact.email) console.warn("note: contact.email is empty, so no email link is shown (set it in src/data/portfolio.ts).");
if (problems.length) {
  console.error("Build stopped:\n  " + problems.join("\n  "));
  process.exit(1);
}

/* ------------------------------------------------------------- write */
const now = new Date();
writeFileSync(join(root, "index.html"), renderPage(portfolio, now));
writeFileSync(join(root, "sitemap.xml"), renderSitemap(portfolio, now));
console.log("built index.html, sitemap.xml");

/* --------------------------------------------------------- cv.pdf */
if (process.argv.includes("--cv")) {
  const browsers = [
    process.env.CHROME_PATH,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean) as string[];
  const browser = browsers.find((b) => existsSync(b));
  if (!browser) {
    console.error("cv.pdf: Edge or Chrome not found. Set CHROME_PATH, or print the page to PDF from a browser.");
    process.exit(1);
  }
  const out = join(root, portfolio.site.cv);
  const before = existsSync(out) ? statSync(out).mtimeMs : 0;
  spawnSync(browser, [
    "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000",
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "cv-build-"))}`,
    `--print-to-pdf=${out}`, pathToFileURL(join(root, "index.html")).href,
  ], { stdio: "ignore", timeout: 60_000 });
  if (!existsSync(out) || statSync(out).mtimeMs === before) {
    console.error("cv.pdf was not created.");
    process.exit(1);
  }
  console.log(`built ${portfolio.site.cv}`);
}
