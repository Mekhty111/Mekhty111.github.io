(() => {
  "use strict";
  const R = window.RESUME;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clean = (s) => String(s ?? "").replace(/==/g, ""); // drop highlighter marks from older data
  const host = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const now = new Date();
  const ext = 'target="_blank" rel="noopener"';

  /* ---------------------------------------------------------------- dates */
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const parseMonth = (str) => {
    const t = String(str || "").trim().toLowerCase();
    if (/^(now|present|today)$/.test(t)) return now.getFullYear() * 12 + now.getMonth();
    const m = t.match(/^([a-z]{3})[a-z]*\.?\s+(\d{4})$/);
    return m && MONTHS.includes(m[1]) ? +m[2] * 12 + MONTHS.indexOf(m[1]) : null;
  };
  const fmtMonths = (n) => {
    const y = Math.floor(n / 12), mo = n % 12, out = [];
    if (y) out.push(`${y} yr${y > 1 ? "s" : ""}`);
    if (mo || !y) out.push(`${mo || 1} mo${(mo || 1) > 1 ? "s" : ""}`);
    return out.join(" ");
  };
  const span = (a, b) => { const x = parseMonth(a), y = parseMonth(b); return x == null || y == null || y < x ? "" : fmtMonths(y - x + 1); };
  const duration = (p) => { const [a, b] = String(p || "").split(/\s*[—–]\s*/); return b ? span(a, b) : ""; };
  const fill = (s) => String(s).replace("{experienceSince}", span(R.experienceSince, "now") || R.experienceSince || "");

  /* ------------------------------------------------------------- contacts */
  const L = R.links;
  const contactLinks = [
    R.cv && { label: "Download CV", href: R.cv, solid: true, download: true },
    L.email && { label: L.email, href: "mailto:" + L.email },
    L.phone && { label: L.phone, href: "tel:" + L.phone.replace(/[^+\d]/g, "") },
    L.telegram && { label: "Telegram", href: "https://t.me/" + L.telegram.replace(/^@/, "") },
    L.linkedin && { label: "LinkedIn", href: L.linkedin },
    L.github && { label: "GitHub", href: L.github },
  ].filter(Boolean);
  const linksHtml = contactLinks
    .map((c) => `<a class="btn ${c.solid ? "btn--solid" : "btn--line"}" href="${esc(c.href)}" ${/^https?:/.test(c.href) ? ext : ""}${c.download ? " download" : ""}>${esc(c.label)}</a>`)
    .join("");

  /* ---------------------------------------------------------------- intro */
  $$("[data-bind]").forEach((el) => (el.textContent = R[el.dataset.bind] ?? ""));
  $$("[data-cv]").forEach((el) => (R.cv ? (el.href = R.cv) : el.remove()));
  $("#roleLine").textContent = [R.role + (R.company ? ` at ${R.company}` : ""), R.location].filter(Boolean).join(" · ");
  $("#avatar").src = R.avatar;
  $("#links").innerHTML = linksHtml;
  $("#footerLinks").innerHTML = linksHtml;
  $("#facts").innerHTML = (R.facts || []).map((f) => `<div><dd>${esc(fill(f.value))}</dd><dt>${esc(f.label)}</dt></div>`).join("");
  $("#year").textContent = now.getFullYear();

  /* ------------------------------------------------------------- projects */
  $("#projectList").innerHTML = R.projects
    .map((p) => {
      const target = p.demo || p.url;
      const shot = p.image
        ? `<a class="shot project__shot" href="${esc(target)}" ${ext} aria-label="${esc(p.title)} — ${p.demo ? "open the live demo" : "open the code"}">
            <img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" width="1280" height="860" loading="lazy" />
            <span class="shot__bar"><span>${p.demo ? "Open live demo ↗" : "View code ↗"}</span><span>${esc(host(target))}</span></span>
          </a>`
        : "";
      return `<article class="project ${shot ? "" : "project--text"}">
        <div class="project__body">
          <p class="project__meta label">${p.demo ? `<span class="live">Live</span>` : ""}<span>${esc(p.year)}</span></p>
          <h3>${esc(p.title)}</h3>
          <p class="project__summary">${esc(p.summary || p.description)}</p>
          ${p.highlights && p.highlights.length ? `<ul class="project__points">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
          ${p.metrics && p.metrics.length ? `<dl class="metrics">${p.metrics.map((m) => `<div><dd>${esc(m.value)}</dd><dt>${esc(m.label)}</dt></div>`).join("")}</dl>` : ""}
          <p class="tags">${p.tags.map(esc).join(" · ")}</p>
          <p class="project__actions">
            ${p.demo ? `<a class="btn btn--solid" href="${esc(p.demo)}" ${ext}>Live demo ↗</a>` : ""}
            <a class="btn btn--line" href="${esc(p.url)}" ${ext}>Code on GitHub ↗</a>
          </p>
        </div>
        ${shot}
      </article>`;
    })
    .join("");
  $("#moreWork").href = L.github + "?tab=repositories";

  /* ----------------------------------------------------------- experience */
  const bullet = (t) => {
    t = clean(t);
    const i = t.indexOf(" — ");
    return i > 0 && i < 60 ? `<li><b>${esc(t.slice(0, i))}</b> — ${esc(t.slice(i + 3))}</li>` : `<li>${esc(t)}</li>`;
  };
  const job = (e) => `<article class="job">
      <p class="job__when">${esc(e.period)}${duration(e.period) ? `<span>${duration(e.period)}</span>` : ""}</p>
      <div>
        <h3>${esc(e.title)}</h3>
        <p class="job__org">${esc(e.org)}${e.place ? ` · ${esc(e.place)}` : ""}</p>
        ${e.points && e.points.length ? `<ul>${e.points.map(bullet).join("")}</ul>` : ""}
        ${e.stack && e.stack.length ? `<p class="tags">${e.stack.map(esc).join(" · ")}</p>` : ""}
      </div>
    </article>`;
  $("#experienceList").innerHTML = (R.experience || []).map(job).join("");

  /* ------------------------------------------------------------- skills */
  $("#skillList").innerHTML = R.skills.map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map((s) => esc(s.name || s)).join(" · ")}</dd></div>`).join("");

  /* ---------------------------------------------- education + certificates */
  $("#educationList").innerHTML = (R.education || [])
    .map((e) => `<div class="edu"><h3>${esc(e.title)}</h3><p>${esc(e.org)} · ${esc(e.period)}</p></div>`)
    .join("") +
    ((R.languages || []).length ? `<div class="edu"><h3>Languages</h3><p>${R.languages.map((l) => `${esc(l.name)} (${esc(l.level.toLowerCase())})`).join(" · ")}</p></div>` : "");
  const certs = R.certificates || [];
  $("#certList").innerHTML = certs
    .map((c) => {
      const t = c.url ? `<a href="${esc(c.url)}" ${ext}>${esc(c.title)}</a>` : esc(c.title);
      return `<li><span>${t}</span><time>${c.status === "done" ? esc(c.date || "") : "in progress"}</time><small>${esc(c.issuer)}</small></li>`;
    })
    .join("");

  /* ------------------------------------------------ active section in bar */
  const navLinks = $$(".bar__nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href")));
  const onScroll = () => {
    let idx = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.3) idx = i; });
    navLinks.forEach((a, i) => a.setAttribute("aria-current", i === idx ? "true" : "false"));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------- print-only resume (cv.pdf) */
  const cvItem = (e, withBullets = true) => `<div class="cv__item">
      <div class="cv__when">${esc(e.period)}${duration(e.period) ? `<br>${duration(e.period)}` : ""}</div>
      <div><h3>${esc(e.title)}</h3><p class="cv__org">${esc(e.org)}${e.place ? `, ${esc(e.place)}` : ""}</p>
        ${withBullets && e.points && e.points.length ? `<ul>${e.points.map(bullet).join("")}</ul>` : ""}
        ${e.stack && e.stack.length ? `<p class="cv__tools">Tools: ${e.stack.map(esc).join(", ")}</p>` : ""}</div></div>`;
  $("#cv").innerHTML = `
    <h1>${esc(R.name)}</h1>
    <p class="cv__role">${esc(R.role)}${R.company ? ` · ${esc(R.company)}` : ""}</p>
    <p class="cv__lede">${esc(R.headline)}</p>
    <p class="cv__contacts">${[
      esc(R.location),
      L.email && `<a href="mailto:${esc(L.email)}">${esc(L.email)}</a>`,
      L.phone && esc(L.phone),
      ...[L.linkedin, L.github, R.site].filter(Boolean).map((u) => `<a href="${esc(u)}">${esc(host(u))}</a>`),
    ].filter(Boolean).join("  ·  ")}</p>
    <h2>Projects</h2>${R.projects.map((p) => `<div class="cv__item"><div class="cv__when">${esc(p.year)}</div><div>
      <h3>${esc(p.title)}</h3><p class="cv__org">${esc(p.summary || p.description)}</p>
      ${p.highlights ? `<ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      ${p.metrics && p.metrics.length ? `<p class="cv__tools">${p.metrics.map((m) => `${esc(m.label)} ${esc(m.value)}`).join(" · ")}</p>` : ""}
      <p class="cv__tools">${p.demo ? `Demo: <a href="${esc(p.demo)}">${esc(host(p.demo))}</a> · ` : ""}Code: <a href="${esc(p.url)}">${esc(host(p.url))}</a></p>
    </div></div>`).join("")}
    <h2>Experience</h2>${(R.experience || []).map((e) => cvItem(e)).join("")}
    <h2>Skills</h2><dl class="cv__skills">${R.skills.map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map((s) => esc(s.name || s)).join(", ")}</dd></div>`).join("")}</dl>
    <h2>Education</h2>${(R.education || []).map((e) => cvItem(e, false)).join("")}
    <h2>Certificates</h2><ul class="cv__certs">${certs.map((c) => `<li>${esc(c.title)} — <em>${esc(c.issuer)}${c.status === "done" ? (c.date ? ", " + esc(c.date) : "") : ", in progress"}</em></li>`).join("")}</ul>
    <h2>Languages</h2><p>${(R.languages || []).map((l) => `${esc(l.name)} — ${esc(l.level.toLowerCase())}`).join(" · ")}</p>`;
})();
