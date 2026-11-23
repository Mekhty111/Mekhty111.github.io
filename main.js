(() => {
  "use strict";
  const R = window.RESUME;
  const P = R.paper || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = (s) => esc(s).replace(/==(.+?)==/g, "<mark>$1</mark>"); // ==text== → highlighter
  const plain = (s) => String(s ?? "").replace(/==/g, "");
  const host = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const now = new Date();

  /* ---------------------------------------------------------------- binds */
  $$("[data-bind]").forEach((el) => (el.textContent = R[el.dataset.bind] ?? el.textContent));
  $$("[data-href]").forEach((el) => (R.links[el.dataset.href] ? (el.href = R.links[el.dataset.href]) : el.remove()));
  $$("[data-cv]").forEach((el) => (R.cv ? (el.href = R.cv) : el.remove()));
  $$("[data-paper-title]").forEach((el) => (el.textContent = P.title || el.textContent));
  $$("[data-paper-motto]").forEach((el) => (el.textContent = P.motto || ""));
  $("#avatar").src = R.avatar;
  $("#year").textContent = now.getFullYear();

  // dateline: Vol. = years on GitHub, No. = day of the year
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
  $("#volNo").textContent = `Vol. ${ROMAN[Math.min(10, now.getFullYear() - 2021)] || "I"} · No. ${dayOfYear}`;
  const dateline = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("#today").textContent = dateline;

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
  const splitPeriod = (p) => String(p || "").split(/\s*[—–]\s*/);
  const duration = (p) => { const [a, b] = splitPeriod(p); return b ? span(a, b) : ""; };
  const fill = (s) => String(s).replace("{experienceSince}", span(R.experienceSince, "now") || R.experienceSince || "");

  /* ---------------------------------------------------------------- logos */
  const initials = (n) => (n || "?").split(/[\s·×—-]+/).filter((w) => /^[A-ZА-ЯЁ0-9]/.test(w)).slice(0, 2).map((w) => w[0]).join("") || (n || "?")[0];
  const logo = (files, name) => {
    const list = [].concat(files || []).filter(Boolean);
    const inner = list.length
      ? list.map((f) => `<img src="assets/logos/${esc(f)}" alt="" width="40" height="40" loading="lazy" decoding="async"
          onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'logo__initials',textContent:this.dataset.f}))" data-f="${esc(initials(name))}" />`).join("")
      : `<span class="logo__initials">${esc(initials(name))}</span>`;
    return `<span class="logo ${list.length > 1 ? "logo--pair" : ""}" aria-hidden="true">${inner}</span>`;
  };

  /* ================================================================ FRONT */
  $("#glance").innerHTML = (R.glance || []).map((g) => `<div><dt>${esc(g.label)}</dt><dd>${esc(fill(g.value))}</dd></div>`).join("");

  const L = P.lead || {};
  $("#leadKicker").textContent = L.kicker || "";
  $("#leadHead").textContent = L.headline || R.headline;
  $("#leadDeck").textContent = L.deck || "";
  $("#leadBy").textContent = L.byline || "";
  $("#leadDate").textContent = dateline;
  $("#leadBody").innerHTML = (L.body || R.about).map((p) => `<p>${rich(p)}</p>`).join("");
  $("#pullQuote").textContent = L.quote || "";
  $("#pullBy").textContent = L.quoteBy ? "— " + L.quoteBy : "";
  if (!L.quote) $(".pull").remove();

  $("#stats").innerHTML = (R.stats || [])
    .map((s) => `<div><dd>${(+s.value).toFixed(s.decimals || 0)}${esc(s.suffix || "")}</dd><dt>${esc(s.label)}</dt></div>`)
    .join("");
  $("#about").innerHTML = R.about.map((p) => `<p>${rich(p)}</p>`).join("");
  $("#langs").innerHTML = (R.languages || []).map((l) => `<li>${esc(l.name)}<span>${esc(l.level)}</span></li>`).join("");

  // index of the inside pages
  const pages = [
    ["Technology", "#technology", "A2"],
    ["Business", "#business", "A3"],
    ["Public record", "#record", "A4"],
    ["Markets", "#markets", "A5"],
    ["Classifieds", "#classifieds", "A6"],
  ];
  $("#inside").innerHTML = pages.map(([t, h, p]) => `<li><a href="${h}">${t}<b>${p}</b></a></li>`).join("");

  // stamp
  const stamp = $("#stamp");
  const hit = () => { stamp.classList.remove("is-hit", "is-waiting"); void stamp.offsetWidth; stamp.classList.add("is-hit"); };
  stamp.addEventListener("click", hit);
  if (!reduceMotion) {
    stamp.classList.add("is-waiting");
    new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { setTimeout(hit, 250); ob.disconnect(); } }, { threshold: 0.8 }).observe(stamp);
  }

  /* --------------------------------------------------------------- ticker */
  const flat = R.skills.flatMap((g) => g.items);
  const tape = flat.map((s) => `<span><b>${esc(s.name.toUpperCase())}</b>${s.projects && s.projects.length ? `<i>▲ ${s.projects.length}</i>` : ""}</span>`).join("");
  $("#ticker").innerHTML = tape + tape.replace(/<span>/g, '<span aria-hidden="true">'); // doubled for a seamless loop

  /* =========================================================== TECHNOLOGY */
  // chapters with a live demo lead the section
  const projects = [...R.projects].sort((a, b) => (b.demo ? 1 : 0) - (a.demo ? 1 : 0));
  const NUM = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  function artRag() {
    // ink drawing: documents → embeddings → retrieval → LLM, with a halftone-shaded stack of pages
    return `<svg viewBox="0 0 400 300" role="img" aria-label="Drawing of the RAG pipeline: tax documents, embeddings, retrieval, LLM">
      <defs><pattern id="halftone" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.2" fill="currentColor" fill-opacity=".55"/></pattern></defs>
      ${[0, 1, 2].map((i) => `<rect class="ink" x="${30 + i * 8}" y="${40 + i * 8}" width="96" height="124" fill="var(--paper)"/>`).join("")}
      <rect x="46" y="56" width="96" height="124" class="ink-dots"/>
      <rect class="ink" x="46" y="56" width="96" height="124"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line class="ink" x1="58" x2="${128 - (i % 3) * 14}" y1="${76 + i * 13}" y2="${76 + i * 13}"/>`).join("")}
      <text class="ink-cap" x="94" y="200" text-anchor="middle">Tax code</text>
      <path class="ink flow" d="M150 118 H196"/>
      <g>${Array.from({ length: 16 }, (_, i) => `<circle cx="${214 + (i % 4) * 14}" cy="${96 + Math.floor(i / 4) * 14}" r="${2 + ((i * 7) % 5) / 2}" fill="currentColor" fill-opacity="${0.3 + ((i * 3) % 7) / 10}"/>`).join("")}</g>
      <text class="ink-cap" x="235" y="168" text-anchor="middle">Embeddings</text>
      <path class="ink-spot flow" d="M270 118 H316"/>
      <circle class="ink-spot" cx="346" cy="118" r="28"/>
      <text class="ink-txt" x="346" y="122" text-anchor="middle">LLM</text>
      <path class="ink" d="M346 146 V214"/>
      <rect class="ink" x="250" y="214" width="140" height="56"/>
      <text class="ink-txt" x="262" y="236">“Per article … :”</text>
      <text class="ink-cap" x="262" y="256">answer + source</text>
      <path class="ink-spot flow" d="M235 70 C 260 20, 330 20, 346 88"/>
      <text class="ink-cap" x="292" y="30" text-anchor="middle">question</text>
    </svg>`;
  }

  $("#chapters").innerHTML = projects
    .map((p, i) => {
      const target = p.demo || p.url;
      const isDemo = !!p.demo;
      const body = (p.body && p.body.length ? p.body : [p.description]).map((t) => `<p>${rich(t)}</p>`).join("");
      const table = p.metrics && p.metrics.length
        ? `<table class="datatable"><caption>The numbers</caption><thead><tr>${p.metrics.map((m) => `<th scope="col">${esc(m.label)}</th>`).join("")}</tr></thead>
           <tbody><tr>${p.metrics.map((m) => `<td>${esc(m.value)}</td>`).join("")}</tr></tbody></table>`
        : "";
      const picture = p.image
        ? `<span class="photo__frame"><img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy" width="1280" height="860" /></span>`
        : `<span class="plate__art">${p.id === "tax-rag" ? artRag() : ""}</span>`;
      return `<article class="chapter ${i % 2 ? "chapter--flip" : ""}" data-id="${esc(p.id)}" aria-labelledby="ch-${esc(p.id)}">
        <div>
          <p class="chapter__no"><b>Chapter ${NUM[i] || i + 1}</b><span>${esc(p.kicker)} · ${esc(p.year)}</span></p>
          <h3 class="chapter__headline" id="ch-${esc(p.id)}">${esc(p.headline || p.title)}</h3>
          ${p.deck ? `<p class="deck">${esc(p.deck)}</p>` : ""}
          <div class="columns">${body}</div>
          ${table}
          <p class="filed">Filed under: ${p.tags.map(esc).join(" · ")} — <a href="${esc(p.url)}" target="_blank" rel="noopener">source on GitHub</a></p>
        </div>
        <a class="plate" href="${esc(target)}" target="_blank" rel="noopener" aria-label="${esc(p.title)} — ${isDemo ? "open the live demo" : "open the repository"}">
          <figure>
            <span class="plate__card">
              ${picture}
              <span class="plate__label"><span class="${isDemo ? "plate__live" : ""}">${isDemo ? "Live demo — open" : "Read the source"}</span><span>${esc(host(target))}</span></span>
            </span>
            <figcaption><b>${esc(p.title.replace(/_/g, " "))}.</b> ${isDemo ? "The running service. Click the picture to try it." : "How it works, in ink. Click to read the code."}</figcaption>
          </figure>
        </a>
      </article>`;
    })
    .join("");
  $("#moreWork").href = R.links.github + "?tab=repositories";

  /* ============================================================= BUSINESS */
  const para = (t) => {
    const i = t.indexOf(" — ");
    return i > 0 && i < 60 ? `<p><b>${rich(t.slice(0, i))}.</b> ${rich(t.slice(i + 3))}</p>` : `<p>${rich(t)}</p>`;
  };
  const story = (e, feature) => {
    const [from, to] = splitPeriod(e.period);
    const d = duration(e.period);
    return `<article class="story ${feature ? "story--feature" : ""}">
      <p class="story__when">${esc(from)} — ${esc(to || "")}<span>${d}</span></p>
      <div class="story__head">${logo(e.logo, e.org)}<div><h3 class="story__title">${esc(e.title)}</h3><p class="story__org">${esc(e.org)}${e.place ? `, ${esc(e.place)}` : ""}</p></div></div>
      <div class="story__body">${(e.points || []).map(para).join("")}</div>
      ${e.stack && e.stack.length ? `<p class="filed">Tools: ${e.stack.map(esc).join(" · ")}</p>` : ""}
    </article>`;
  };
  // the story with the most to say gets the wide middle column
  const exp = R.experience || [];
  const longest = exp.reduce((best, e, i) => ((e.points || []).join("").length > (exp[best].points || []).join("").length ? i : best), 0);
  const order = exp.map((_, i) => i).filter((i) => i !== longest);
  const arranged = [order[0], longest, ...order.slice(1)].filter((i) => i !== undefined);
  $("#experience").innerHTML = arranged.map((i) => story(exp[i], i === longest)).join("");

  /* ========================================================= PUBLIC RECORD */
  $("#education").innerHTML = (R.education || [])
    .map((e) => `<div class="edu"><p class="story__when">${esc(e.period)}</p><h4>${esc(e.title)}</h4><p><i>${esc(e.org)}</i></p>${(e.points || []).map((p) => `<p>${rich(p)}</p>`).join("")}</div>`)
    .join("");
  const certs = R.certificates || [];
  $("#certCount").textContent = `— ${certs.filter((c) => c.status === "done").length} issued`;
  $("#certs").innerHTML = certs
    .map((c) => {
      const pending = c.status !== "done";
      const title = c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.title)}</a>` : `<strong>${esc(c.title)}</strong>`;
      return `<li class="${pending ? "pending" : ""}"><time>${pending ? "Pending" : esc(c.date || "—")}</time>${title}<em>${esc(c.issuer)}</em></li>`;
    })
    .join("");

  /* =============================================================== MARKETS */
  const chapterNo = Object.fromEntries(projects.map((p, i) => [p.id, NUM[i] || String(i + 1)]));
  $("#stack").innerHTML = R.skills
    .map((g) => `<table class="listing"><caption>${esc(g.group)}</caption><tbody>${g.items
      .map((s) => {
        const ids = s.projects || [];
        return ids.length
          ? `<tr class="is-up" tabindex="0" data-projects="${ids.join(",")}" title="Used in chapter ${ids.map((id) => chapterNo[id]).join(" and ")}"><th scope="row">${esc(s.name)}</th><td>▲ ${ids.map((id) => chapterNo[id]).filter(Boolean).join(", ")}</td></tr>`
          : `<tr><th scope="row">${esc(s.name)}</th><td>—</td></tr>`;
      })
      .join("")}</tbody></table>`)
    .join("");
  const light = (ids) =>
    $$(".chapter[data-id]").forEach((c) => {
      c.classList.toggle("is-lit", !!ids && ids.includes(c.dataset.id));
      c.classList.toggle("is-dim", !!ids && !ids.includes(c.dataset.id));
    });
  const mk = $("#stack");
  const onRow = (e) => { const tr = e.target.closest("tr[data-projects]"); light(tr ? tr.dataset.projects.split(",") : null); };
  mk.addEventListener("mouseover", onRow);
  mk.addEventListener("focusin", onRow);
  mk.addEventListener("mouseleave", () => light(null));
  mk.addEventListener("focusout", () => light(null));

  /* =========================================================== CLASSIFIEDS */
  const tg = R.links.telegram && R.links.telegram.replace(/^@/, "");
  const demoProject = R.projects.find((p) => p.demo);
  const ads = [
    { head: "Talk shop", text: "Credit risk, production ML, scorecards or RAG — always glad to compare notes.", reply: R.links.linkedin && host(R.links.linkedin), href: R.links.linkedin, bold: true },
    R.links.email && { head: "By post (electronic)", text: "For anything that needs a paper trail.", reply: R.links.email, href: "mailto:" + R.links.email },
    R.links.phone && { head: "By telephone", text: "Baku business hours.", reply: R.links.phone, href: "tel:" + R.links.phone.replace(/[^+\d]/g, "") },
    tg && { head: "By Telegram", text: "Quick questions welcome.", reply: "@" + tg, href: "https://t.me/" + tg },
    R.cv && { head: "Resume, printed", text: "The whole file on two A4 pages — plain, no newsprint.", reply: "Download cv.pdf ↓", href: R.cv, download: true },
    R.links.github && { head: "Archive open to public", text: "Notebooks, pipelines and experiments, from Kaggle to production.", reply: host(R.links.github), href: R.links.github },
    demoProject && { head: "Demonstration daily", text: "A credit scoring engine, open around the clock. Bring your own applicant.", reply: host(demoProject.demo), href: demoProject.demo },
  ].filter(Boolean);
  $("#contact").innerHTML = ads
    .map((a) => `<a class="ad ${a.bold ? "ad--bold" : ""}" href="${esc(a.href)}" ${/^https?:/.test(a.href) ? 'target="_blank" rel="noopener"' : ""}${a.download ? " download" : ""}>
      <span class="ad__head">${esc(a.head)}</span><p>${esc(a.text)}</p><p class="ad__reply">${esc(a.reply)}</p></a>`)
    .join("");

  /* ================================================== PRINT-ONLY RESUME (cv.pdf) */
  const li = (t) => {
    const i = t.indexOf(" — ");
    return i > 0 && i < 60 ? `<li><b>${esc(plain(t.slice(0, i)))}</b> — ${esc(plain(t.slice(i + 3)))}</li>` : `<li>${esc(plain(t))}</li>`;
  };
  const cvItem = (e) => {
    const [from, to] = splitPeriod(e.period);
    return `<div class="cv__item"><div class="cv__when"><b>${esc(to || "")}</b>${esc(from)}${duration(e.period) ? `<br>${duration(e.period)}` : ""}</div>
      <div><h3>${esc(e.title)}</h3><p class="cv__org">${esc(e.org)}${e.place ? `, ${esc(e.place)}` : ""}</p>
      ${e.points && e.points.length ? `<ul>${e.points.map(li).join("")}</ul>` : ""}
      ${e.stack && e.stack.length ? `<p class="cv__tools">Tools: ${e.stack.map(esc).join(" / ")}</p>` : ""}</div></div>`;
  };
  $("#cv").innerHTML = `
    <h1>${esc(R.name)}</h1>
    <p class="cv__role">${esc(R.role)}</p>
    <p class="cv__lede">${esc(R.headline)}</p>
    <p class="cv__contacts">${[
      esc(R.location),
      R.links.email && `<a href="mailto:${esc(R.links.email)}">${esc(R.links.email)}</a>`,
      R.links.phone && esc(R.links.phone),
      ...[R.links.linkedin, R.links.github, R.site].filter(Boolean).map((u) => `<a href="${esc(u)}">${esc(host(u))}</a>`),
    ].filter(Boolean).join("  ·  ")}</p>
    <dl class="cv__glance">${(R.glance || []).map((g) => `<div><dt>${esc(g.label)}</dt><dd>${esc(fill(g.value))}</dd></div>`).join("")}</dl>
    <h2>Summary</h2><div class="cv__summary">${R.about.map((p) => `<p>${esc(plain(p))}</p>`).join("")}</div>
    <h2>Experience</h2>${(R.experience || []).map(cvItem).join("")}
    <h2>Education</h2>${(R.education || []).map(cvItem).join("")}
    <h2>Projects</h2><div class="cv__projects">${R.projects.map((p) => `<div><h3>${esc(p.title.replace(/_/g, " "))}</h3><p>${esc(p.description)}</p>
      ${p.metrics && p.metrics.length ? `<p class="cv__tools">${p.metrics.map((m) => `${esc(m.label)} ${esc(m.value)}`).join(" · ")}</p>` : ""}
      <p class="cv__tools">${p.demo ? `<a href="${esc(p.demo)}">${esc(host(p.demo))}</a> · ` : ""}<a href="${esc(p.url)}">${esc(host(p.url))}</a></p></div>`).join("")}</div>
    <h2>Skills</h2><div class="cv__skills">${R.skills.map((g) => `<div><b>${esc(g.group)}</b>${g.items.map((s) => esc(s.name)).join(", ")}</div>`).join("")}</div>
    <h2>Certificates</h2><ul class="cv__certs">${certs.map((c) => `<li><time>${c.status === "done" ? esc(c.date || "—") : "In progress"}</time>${esc(c.title)} — <em>${esc(c.issuer)}</em></li>`).join("")}</ul>`;

  /* ================================================ folio + current section */
  const folio = $("#folio");
  const masthead = $(".masthead");
  const navLinks = $$(".folio__nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href")));
  function onScroll() {
    folio.classList.toggle("is-on", masthead.getBoundingClientRect().bottom < 0);
    let idx = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.3) idx = i; });
    navLinks.forEach((a, i) => a.setAttribute("aria-current", i === idx ? "true" : "false"));
  }
  let raf = 0;
  addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();

  /* ================================================================= theme */
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
})();
