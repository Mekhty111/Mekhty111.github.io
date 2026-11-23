(() => {
  "use strict";
  const R = window.RESUME;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // ==text== in data.js becomes a highlighter mark
  const rich = (s) => esc(s).replace(/==(.+?)==/g, "<mark>$1</mark>");
  const host = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  /* ------------------------------------------------------------------ binds */
  $$("[data-bind]").forEach((el) => (el.textContent = R[el.dataset.bind] ?? el.textContent));
  $$("[data-href]").forEach((el) => (R.links[el.dataset.href] ? (el.href = R.links[el.dataset.href]) : el.remove()));
  $$("[data-cv]").forEach((el) => (R.cv ? (el.href = R.cv) : el.remove()));
  $("#avatar").src = R.avatar;
  const now = new Date();
  $("#year").textContent = now.getFullYear();
  $("#fileNo").textContent = `MM-${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;

  /* ------------------------------------------------------------------ dates
     "Jul 2025 — Feb 2026" / "— Now" → "8 mos", "1 yr 4 mos" (inclusive, like LinkedIn) */
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const parseMonth = (str) => {
    const t = String(str || "").trim().toLowerCase();
    if (/^(now|present|today)$/.test(t)) return now.getFullYear() * 12 + now.getMonth();
    const m = t.match(/^([a-z]{3})[a-z]*\.?\s+(\d{4})$/);
    if (!m || MONTHS.indexOf(m[1]) < 0) return null;
    return +m[2] * 12 + MONTHS.indexOf(m[1]);
  };
  const fmtMonths = (n) => {
    const y = Math.floor(n / 12), mo = n % 12, out = [];
    if (y) out.push(`${y} yr${y > 1 ? "s" : ""}`);
    if (mo || !y) out.push(`${mo || 1} mo${(mo || 1) > 1 ? "s" : ""}`);
    return out.join(" ");
  };
  const span = (from, to) => {
    const a = parseMonth(from), b = parseMonth(to);
    return a == null || b == null || b < a ? "" : fmtMonths(b - a + 1);
  };
  const splitPeriod = (p) => String(p || "").split(/\s*[—–]\s*/);
  const duration = (p) => { const [a, b] = splitPeriod(p); return b ? span(a, b) : ""; };

  /* -------------------------------------------------- cover: at a glance */
  const fill = (str) => str.replace("{experienceSince}", span(R.experienceSince, "now") || R.experienceSince || "");
  $("#glance").innerHTML = (R.glance || [])
    .map((g) => `<tr><th scope="row">${esc(g.label)}</th><td>${esc(fill(g.value))}</td></tr>`)
    .join("");

  $("#printContacts").innerHTML = [
    R.location && esc(R.location),
    R.links.email && `<a href="mailto:${esc(R.links.email)}">${esc(R.links.email)}</a>`,
    R.links.phone && esc(R.links.phone),
    ...[R.links.linkedin, R.links.github, R.site].filter(Boolean).map((u) => `<a href="${esc(u)}">${esc(host(u))}</a>`),
  ].filter(Boolean).join("  ·  ");

  const stamp = $("#stamp");
  const hit = () => {
    stamp.classList.remove("is-hit", "is-waiting");
    void stamp.offsetWidth; // restart the animation
    stamp.classList.add("is-hit");
  };
  stamp.addEventListener("click", hit);
  if (!reduceMotion) {
    stamp.classList.add("is-waiting");
    setTimeout(hit, 700);
  }

  /* ---------------------------------------------------------- §1 subject */
  $("#about").innerHTML = R.about.map((p) => `<p>${rich(p)}</p>`).join("");
  $("#stats").innerHTML = (R.stats || [])
    .map((s) => `<div><dt>${esc(s.label)}</dt><dd>${(+s.value).toFixed(s.decimals || 0)}${esc(s.suffix || "")}</dd></div>`)
    .join("");
  const facts = [
    ["Location", R.location],
    ["Languages", (R.languages || []).map((l) => `${l.name} — ${l.level.toLowerCase()}`).join(" · ")],
    R.site && ["Site", host(R.site)],
  ].filter(Boolean);
  $("#facts").innerHTML = facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");

  /* --------------------------------------------------------------- logos
     image from assets/logos/, initials as a fallback */
  const initials = (name) =>
    (name || "?").split(/[\s·×—-]+/).filter((w) => /^[A-ZА-ЯЁ0-9]/.test(w)).slice(0, 2).map((w) => w[0]).join("") || (name || "?")[0];
  const logoImg = (file, alt) =>
    `<img src="assets/logos/${esc(file)}" alt="" width="44" height="44" loading="lazy" decoding="async"
      onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'logo__initials',textContent:this.dataset.fallback}))"
      data-fallback="${esc(initials(alt))}" />`;
  const logo = (files, name) => {
    const list = [].concat(files || []).filter(Boolean);
    const inner = list.length ? list.map((f) => logoImg(f, name)).join("") : `<span class="logo__initials">${esc(initials(name))}</span>`;
    return `<span class="logo ${list.length > 1 ? "logo--pair" : ""}" aria-hidden="true">${inner}</span>`;
  };

  /* ------------------------------------------- §2–3 experience / education */
  // "Project — details" → bold project name, then details
  const point = (p) => {
    const i = p.indexOf(" — ");
    return i > 0 && i < 60 ? `<li><b>${rich(p.slice(0, i))}</b> — ${rich(p.slice(i + 3))}</li>` : `<li>${rich(p)}</li>`;
  };
  const ledger = (items) =>
    (items || [])
      .map((e) => {
        const [from, to] = splitPeriod(e.period);
        const dur = duration(e.period);
        return `<li class="entry">
          <div class="entry__when"><b>${esc(to || "")}</b>${esc(from)}${dur ? `<span>${dur}</span>` : ""}</div>
          <div>
            <div class="entry__head">
              ${logo(e.logo, e.org)}
              <div>
                <h3 class="entry__role">${esc(e.title)}</h3>
                <p class="entry__org">${esc(e.org)}${e.place ? `, ${esc(e.place)}` : ""}</p>
              </div>
            </div>
            ${e.points && e.points.length ? `<ol class="entry__points">${e.points.map(point).join("")}</ol>` : ""}
            ${e.stack && e.stack.length ? `<p class="entry__stack"><b>Tools</b>${e.stack.map(esc).join(" / ")}</p>` : ""}
          </div>
        </li>`;
      })
      .join("");
  $("#experienceList").innerHTML = ledger(R.experience);
  $("#educationList").innerHTML = ledger(R.education);

  /* ----------------------------------------------------------- §4 exhibits */
  function figRoc(auc) {
    const k = auc / (1 - auc), W = 400, H = 140, pts = [];
    const tpr = (x) => 1 - Math.pow(1 - x, k);
    for (let i = 0; i <= 60; i++) pts.push(`${((i / 60) * W).toFixed(1)},${(H - tpr(i / 60) * H).toFixed(1)}`);
    const d = "M" + pts.join(" L");
    let bx = 0, best = 0; // operating point at max KS = max(TPR - FPR)
    for (let i = 1; i < 120; i++) { const x = i / 120, ks = tpr(x) - x; if (ks > best) { best = ks; bx = x; } }
    const X = bx * W, Y = H - tpr(bx) * H;
    return {
      svg: `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="ROC curve of the scorecard, AUC ${auc}">
        <defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-opacity=".32" stroke-width="1"/></pattern></defs>
        ${[0.25, 0.5, 0.75].map((g) => `<line class="ink-grid" x1="0" x2="${W}" y1="${H * g}" y2="${H * g}"/><line class="ink-grid" y1="0" y2="${H}" x1="${W * g}" x2="${W * g}"/>`).join("")}
        <path fill="url(#hatch)" d="${d} L${W},${H} L0,${H} Z"/>
        <line class="ink-ref" x1="0" y1="${H}" x2="${W}" y2="0"/>
        <path class="ink-line" d="${d}"/>
        <line class="ink-red" x1="${X}" x2="${X}" y1="${H - bx * H}" y2="${Y}"/>
        <circle class="ink-dot" cx="${X}" cy="${Y}" r="3.5"/>
        <text class="ink-txt" x="${X + 8}" y="${Y + 24}">max KS</text>
      </svg>`,
      cap: `ROC, out-of-time sample — hatched area = AUC ${auc}`,
    };
  }
  function figRag() {
    const y = 58, h = 34, w = 78, xs = [0, 106, 212, 318], labels = ["Tax docs", "Embed", "Retrieve", "LLM"];
    return {
      svg: `<svg viewBox="0 0 400 140" role="img" aria-label="Pipeline: tax documents, embeddings, retrieval, LLM">
        ${xs.slice(0, -1).map((x, i) => `<path class="ink-line ${i === 1 ? "flow" : ""}" d="M${x + w},${y + h / 2} H${xs[i + 1]}"/>`).join("")}
        <path class="ink-red flow" d="M${318 + w / 2},${y} C330,10 262,10 ${212 + w / 2},${y}"/>
        <text class="ink-txt" x="265" y="16" text-anchor="middle">question</text>
        ${xs.map((x, i) => `<rect class="ink-box ${i >= 2 ? "ink-box--red" : ""}" x="${x + 0.5}" y="${y}" width="${w}" height="${h}"/>
          <text class="ink-txt" x="${x + w / 2}" y="${y + h / 2 + 3.5}" text-anchor="middle">${labels[i]}</text>`).join("")}
        <path class="ink-line" d="M${318 + w / 2},${y + h} V${y + h + 16}"/>
        <text class="ink-txt" x="${318 + w / 2}" y="${y + h + 30}" text-anchor="middle">cited answer</text>
      </svg>`,
      cap: "Retrieval-augmented generation, schematic",
    };
  }
  const figFor = (p) => {
    if (p.id === "tax-rag") return figRag();
    const auc = (p.metrics || []).find((m) => /auc/i.test(m.label));
    return auc ? figRoc(+auc.value) : null;
  };
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  $("#exhibitList").innerHTML =
    R.projects
      .map((p, i) => {
        const fig = figFor(p);
        // links can't nest: the repo link is stretched over the whole sheet, the demo link sits above it
        return `<article class="exhibit" data-id="${esc(p.id)}">
          <a class="exhibit__cover" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${esc(p.title)} — open repository on GitHub"></a>
          <div class="exhibit__tag mono"><b>Exhibit ${LETTERS[i]}</b><span>${esc(p.year)} · ${esc(p.kicker)}</span></div>
          <h3 class="exhibit__title">${esc(p.title.replace(/_/g, " "))}</h3>
          ${fig ? `<figure class="exhibit__fig">${fig.svg}<figcaption class="mono">Fig. ${i + 2} — ${esc(fig.cap)}</figcaption></figure>` : ""}
          <p class="exhibit__desc">${esc(p.description)}</p>
          ${p.metrics && p.metrics.length ? `<div class="exhibit__metrics">${p.metrics.map((m) => `<div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>` : ""}
          <div class="exhibit__foot">
            <span class="exhibit__tags">${p.tags.map(esc).join(" / ")}</span>
            <span class="exhibit__actions">
              ${p.demo ? `<a class="exhibit__demo" href="${esc(p.demo)}" target="_blank" rel="noopener">Live demo · ${esc(new URL(p.demo).host)}</a>` : ""}
              <span class="exhibit__open" aria-hidden="true">Repo →</span>
            </span>
          </div>
        </article>`;
      })
      .join("") +
    `<a class="exhibit exhibit--more" href="${esc(R.links.github)}?tab=repositories" target="_blank" rel="noopener">
      <h3 class="exhibit__title">Further exhibits on GitHub</h3>
      <span class="exhibit__open">${esc(host(R.links.github))} →</span>
    </a>`;

  /* --------------------------------------------------------------- §5 stack */
  const exhibitOf = Object.fromEntries(R.projects.map((p, i) => [p.id, "Exh. " + LETTERS[i]]));
  $("#featureList").innerHTML = R.skills
    .map((g) => `<div class="fgroup"><h3>${esc(g.group)}</h3><ul>${g.items
      .map((s) => {
        const ids = s.projects || [];
        return `<li ${ids.length ? `class="is-linked" tabindex="0" data-projects="${ids.join(",")}"` : ""}><span>${esc(s.name)}</span><span>${ids.map((id) => exhibitOf[id]).filter(Boolean).join(", ")}</span></li>`;
      })
      .join("")}</ul></div>`)
    .join("");

  const light = (ids) =>
    $$(".exhibit[data-id]").forEach((c) => {
      c.classList.toggle("is-lit", !!ids && ids.includes(c.dataset.id));
      c.classList.toggle("is-dim", !!ids && !ids.includes(c.dataset.id));
    });
  const feat = $("#featureList");
  const onFeat = (e) => { const li = e.target.closest("li[data-projects]"); light(li ? li.dataset.projects.split(",") : null); };
  feat.addEventListener("mouseover", onFeat);
  feat.addEventListener("focusin", onFeat);
  feat.addEventListener("mouseleave", () => light(null));
  feat.addEventListener("focusout", () => light(null));

  /* --------------------------------------------------------- §6 credentials */
  const dateKey = (c) => {
    if (c.status === "progress") return 1e9; // in-progress sorts as newest
    const m = /([A-Za-z]{3})?\s*(\d{4})/.exec(c.date || "");
    return m ? +m[2] * 12 + (m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : 0) : -1;
  };
  const refOf = (c) => c.ref || (c.url ? c.url.split(/[/=]/).pop().slice(0, 14) : "—");
  let sort = { key: "date", dir: -1 };

  function renderCerts() {
    const rows = [...(R.certificates || [])].sort((a, b) => {
      const va = sort.key === "date" ? dateKey(a) : String(a[sort.key]).toLowerCase();
      const vb = sort.key === "date" ? dateKey(b) : String(b[sort.key]).toLowerCase();
      return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
    });
    $("#certRows").innerHTML = rows
      .map((c) => {
        const pending = c.status !== "done";
        return `<tr class="${pending ? "pending" : ""}" ${c.url ? `data-url="${esc(c.url)}"` : ""}>
          <td>${pending ? "In progress" : esc(c.date || "—")}</td>
          <td>${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.title)}</a>` : esc(c.title)}</td>
          <td><span class="cert__issuer">${logo(c.logo, c.issuer)}${esc(c.issuer)}</span></td>
          <td>${esc(refOf(c))}</td>
        </tr>`;
      })
      .join("");
    $$(".certs th button").forEach((b) =>
      b.setAttribute("aria-sort", b.dataset.sort === sort.key ? (sort.dir === 1 ? "ascending" : "descending") : "none")
    );
  }
  renderCerts();
  $(".certs thead").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-sort]");
    if (!b) return;
    const k = b.dataset.sort;
    sort = sort.key === k ? { key: k, dir: -sort.dir } : { key: k, dir: k === "date" ? -1 : 1 };
    renderCerts();
  });
  $("#certRows").addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const tr = e.target.closest("tr[data-url]");
    if (tr) window.open(tr.dataset.url, "_blank", "noopener");
  });

  /* ------------------------------------------------------------ §7 contact */
  const tg = R.links.telegram && R.links.telegram.replace(/^@/, "");
  const contacts = [
    R.links.email && ["Email", R.links.email, "mailto:" + R.links.email],
    R.links.phone && ["Phone", R.links.phone, "tel:" + R.links.phone.replace(/[^+\d]/g, "")],
    tg && ["Telegram", "@" + tg, "https://t.me/" + tg],
    R.links.linkedin && ["LinkedIn", host(R.links.linkedin), R.links.linkedin],
    R.links.github && ["GitHub", host(R.links.github), R.links.github],
    R.cv && ["Resume", "cv.pdf — 2 pages, A4", R.cv],
  ].filter(Boolean);
  $("#contactList").innerHTML = contacts
    .map(([k, label, href]) => `<dt>${k}</dt><dd><a href="${esc(href)}" ${/^https?:/.test(href) ? 'target="_blank" rel="noopener"' : ""}${k === "Resume" ? " download" : ""}>${esc(label)}</a></dd>`)
    .join("");

  /* ------------------------------------------------- running header state */
  const navLinks = $$(".runhead__nav a");
  const sections = navLinks.map((a) => $(a.getAttribute("href")));
  const where = $("#where");
  function onScroll() {
    let idx = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) idx = i; });
    navLinks.forEach((a, i) => a.setAttribute("aria-current", i === idx ? "true" : "false"));
    where.textContent = idx < 0 ? "Cover" : `§${idx + 1} of ${sections.length}`;
  }
  let raf = 0;
  addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- theme */
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
})();
