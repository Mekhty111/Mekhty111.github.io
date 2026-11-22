(() => {
  "use strict";
  const R = window.RESUME;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------------------------------------------------------------
     Bind simple fields
     --------------------------------------------------------------------- */
  $$("[data-bind]").forEach((el) => (el.textContent = R[el.dataset.bind] ?? ""));
  $$("[data-href]").forEach((el) => {
    const url = R.links[el.dataset.href];
    if (url) el.href = url;
    else el.remove();
  });
  $$("[data-cv]").forEach((el) => {
    if (R.cv) el.href = R.cv;
    else el.remove();
  });
  $("#avatar").src = R.avatar;

  /* ---------------------------------------------------------------------
     Dates — "Jul 2025 — Feb 2026" / "— Now" → "8 mos", "1 yr 4 mos"
     --------------------------------------------------------------------- */
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const parseMonth = (str) => {
    const t = String(str || "").trim().toLowerCase();
    if (/^(now|present|today)$/.test(t)) {
      const d = new Date();
      return d.getFullYear() * 12 + d.getMonth();
    }
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
  // inclusive, like LinkedIn: Jul–Feb = 8 months
  const span = (from, to) => {
    const a = parseMonth(from), b = parseMonth(to);
    return a == null || b == null || b < a ? "" : fmtMonths(b - a + 1);
  };
  const duration = (period) => {
    const parts = String(period || "").split(/\s*[—–-]\s*/);
    return parts.length === 2 ? span(parts[0], parts[1]) : "";
  };
  $("#year").textContent = new Date().getFullYear();

  /* At a glance */
  const fill = (str) => str.replace("{experienceSince}", span(R.experienceSince, "now") || R.experienceSince || "");
  $("#glance").innerHTML = (R.glance || [])
    .map((g) => `<div><dt>${esc(g.label)}</dt><dd>${esc(fill(g.value))}</dd></div>`)
    .join("");

  /* Contact line that only shows in the printed / PDF version */
  const host = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  $("#printContacts").innerHTML = [
    R.location && esc(R.location),
    R.links.email && `<a href="mailto:${esc(R.links.email)}">${esc(R.links.email)}</a>`,
    R.links.phone && esc(R.links.phone),
    ...[R.links.linkedin, R.links.github, R.site].filter(Boolean).map((u) => `<a href="${esc(u)}">${esc(host(u))}</a>`),
  ]
    .filter(Boolean)
    .join("  ·  ");

  /* About */
  $("#aboutParagraphs").innerHTML = R.about.map((p) => `<p>${esc(p)}</p>`).join("");
  $("#stats").innerHTML = R.stats
    .map(
      (s) => `<div class="reveal"><dt>${esc(s.label)}</dt><dd data-count="${s.value}" data-decimals="${s.decimals || 0}" data-plain="${s.plain ? 1 : 0}" data-suffix="${esc(s.suffix || "")}">${(+s.value).toFixed(s.decimals || 0)}${esc(s.suffix || "")}</dd></div>`
    )
    .join("");
  $("#langs").innerHTML = (R.languages || []).map((l) => `<li><b>${esc(l.name)}</b>${esc(l.level)}</li>`).join("");

  /* ---------------------------------------------------------------------
     Stack — tabs + skills, hover highlights projects
     --------------------------------------------------------------------- */
  const groups = [{ group: "All", items: R.skills.flatMap((g) => g.items.map((i) => ({ ...i, g: g.group }))) }].concat(
    R.skills.map((g) => ({ group: g.group, items: g.items.map((i) => ({ ...i, g: g.group })) }))
  );
  const tabsEl = $("#skillTabs");
  const skillsEl = $("#skills");

  tabsEl.innerHTML = groups
    .map(
      (g, i) =>
        `<button class="tab" role="tab" type="button" aria-selected="${i === 0}" data-i="${i}">${esc(g.group)}<span class="count">${g.items.length}</span></button>`
    )
    .join("");

  function renderSkills(i) {
    const g = groups[i];
    skillsEl.innerHTML = g.items
      .map((s, k) => {
        const used = (s.projects || []).length;
        return `<li class="skill" tabindex="0" style="animation-delay:${Math.min(k * 25, 400)}ms" data-projects="${(s.projects || []).join(",")}">
          <span class="skill__dot" style="background:var(--c${(R.skills.findIndex((x) => x.group === s.g) % 3) + 1})" title="${esc(s.g)}"></span>
          <span>${esc(s.name)}</span>
          ${used ? `<span class="skill__used" title="Used in ${used} featured project${used > 1 ? "s" : ""}">${used}</span>` : ""}
        </li>`;
      })
      .join("");
  }
  renderSkills(0);

  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    $$(".tab", tabsEl).forEach((t) => t.setAttribute("aria-selected", t === b));
    renderSkills(+b.dataset.i);
  });
  tabsEl.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const tabs = $$(".tab", tabsEl);
    const cur = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const next = tabs[(cur + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    next.click();
  });

  function highlight(ids) {
    $$(".card[data-id]").forEach((c) => {
      c.classList.toggle("is-lit", !!ids && ids.includes(c.dataset.id));
      c.classList.toggle("is-dim", !!ids && ids.length > 0 && !ids.includes(c.dataset.id));
    });
  }
  const onSkill = (e) => {
    const s = e.target.closest(".skill");
    if (!s) return;
    const ids = s.dataset.projects ? s.dataset.projects.split(",") : [];
    highlight(ids);
  };
  skillsEl.addEventListener("mouseover", onSkill);
  skillsEl.addEventListener("focusin", onSkill);
  skillsEl.addEventListener("mouseleave", () => highlight(null));
  skillsEl.addEventListener("focusout", () => highlight(null));

  /* ---------------------------------------------------------------------
     Projects
     --------------------------------------------------------------------- */
  const cardColors = ["var(--c3)", "var(--c1)", "var(--c2)"];

  function vizRoc() {
    // ROC curve shaped to AUC ≈ 0.762: y = 1 - (1 - x)^k, k = AUC/(1-AUC)
    const k = 0.762 / (1 - 0.762);
    const W = 400, H = 130, pts = [];
    for (let i = 0; i <= 60; i++) {
      const x = i / 60, y = 1 - Math.pow(1 - x, k);
      pts.push(`${(x * W).toFixed(1)},${(H - y * H).toFixed(1)}`);
    }
    const line = "M" + pts.join(" L");
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="ROC curve, AUC 0.762">
      ${[0.25, 0.5, 0.75].map((g) => `<line class="viz-grid" x1="0" x2="${W}" y1="${H * g}" y2="${H * g}"/>`).join("")}
      <path class="viz-fill" d="${line} L${W},${H} L0,${H} Z"/>
      <line class="viz-ref" x1="0" y1="${H}" x2="${W}" y2="0"/>
      <path class="viz-line draw" style="--len:700" d="${line}"/>
      <text class="viz-label" x="${W - 4}" y="${H - 6}" text-anchor="end">FPR →</text>
      <text class="viz-label" x="4" y="12">TPR · ROC OOT</text>
    </svg>`;
  }

  function vizRag() {
    const nodes = [
      { x: 8, label: "docs" },
      { x: 108, label: "chunk·embed" },
      { x: 208, label: "retrieve" },
      { x: 308, label: "LLM" },
    ];
    const w = 84, h = 34, y = 48;
    return `<svg viewBox="0 0 400 130" role="img" aria-label="RAG pipeline: documents, embeddings, retrieval, LLM answer">
      ${nodes
        .slice(0, -1)
        .map((n, i) => `<path class="viz-edge ${i === 1 ? "viz-edge--hot" : ""}" d="M${n.x + w},${y + h / 2} L${nodes[i + 1].x},${y + h / 2}"/>`)
        .join("")}
      <path class="viz-edge viz-edge--hot" d="M${308 + w / 2},${y} C${350},${8} ${250},${8} ${208 + w / 2},${y}"/>
      <text class="viz-label" x="290" y="12" text-anchor="middle">query</text>
      ${nodes
        .map(
          (n, i) => `<rect class="viz-node ${i >= 2 ? "viz-node--hot" : ""}" x="${n.x}" y="${y}" width="${w}" height="${h}" rx="9"/>
          <text class="viz-text" x="${n.x + w / 2}" y="${y + h / 2 + 3.5}" text-anchor="middle">${n.label}</text>`
        )
        .join("")}
      <text class="viz-label" x="${308 + w / 2}" y="${y + h + 26}" text-anchor="middle">grounded answer</text>
      <path class="viz-edge" d="M${308 + w / 2},${y + h} L${308 + w / 2},${y + h + 14}"/>
    </svg>`;
  }

  function vizGeneric(seed) {
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const pts = Array.from({ length: 24 }, (_, i) => `${(i / 23) * 400},${100 - rnd() * 60 - i * 1.5}`);
    const d = "M" + pts.join(" L");
    return `<svg viewBox="0 0 400 130" preserveAspectRatio="none" aria-hidden="true"><path class="viz-fill" d="${d} L400,130 L0,130 Z"/><path class="viz-line draw" d="${d}"/></svg>`;
  }

  const vizFor = (p, i) => (p.id === "home-credit" ? vizRoc() : p.id === "tax-rag" ? vizRag() : vizGeneric(i + 1));

  const arrow = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>`;

  $("#projectGrid").innerHTML =
    R.projects
      .map(
        (p, i) => {
          // Links can't nest, so a card with a demo is an <article> whose GitHub
          // link is stretched over the whole card, with the demo button above it.
          const ghLabel = `${esc(p.title)} — open on GitHub`;
          const open = p.demo
            ? `<article class="card reveal" style="--d:${i * 0.08}s;--card-color:${cardColors[i % cardColors.length]}" data-id="${esc(p.id)}">
        <a class="card__cover" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${ghLabel}"></a>`
            : `<a class="card reveal" style="--d:${i * 0.08}s;--card-color:${cardColors[i % cardColors.length]}" data-id="${esc(p.id)}"
         href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${ghLabel}">`;
          return `
      ${open}
        <div class="card__top">
          <span class="card__kicker mono">${esc(p.year)} · ${esc(p.kicker)}</span>
          <span class="card__arrow" aria-hidden="true">${arrow}</span>
        </div>
        <div class="card__visual">${vizFor(p, i)}</div>
        <h3 class="card__title">${esc(p.title)}</h3>
        <p class="card__desc">${esc(p.description)}</p>
        ${
          p.metrics && p.metrics.length
            ? `<div class="metrics">${p.metrics.map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>`
            : ""
        }
        <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${
          p.demo
            ? `<a class="card__demo mono" href="${esc(p.demo)}" target="_blank" rel="noopener"><span class="card__live" aria-hidden="true"></span>Live demo<span class="card__demo-host">${esc(new URL(p.demo).host)}</span></a>`
            : ""
        }
      ${p.demo ? "</article>" : "</a>"}`;
        }
      )
      .join("") +
    `<a class="card card--more reveal" href="${esc(R.links.github)}?tab=repositories" target="_blank" rel="noopener">
      <div><h3>More work on GitHub</h3><p>Credit scoring, NLP on reviews, SQL analytics, time-series and more.</p></div>
      <span class="card__arrow" aria-hidden="true">${arrow}</span>
    </a>`;

  // spotlight + subtle tilt
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    $$(".card:not(.card--more)").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        const rx = ((y / r.height) - 0.5) * -4, ry = ((x / r.width) - 0.5) * 5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  /* ---------------------------------------------------------------------
     Logos — image from assets/logos/, initials as a fallback
     --------------------------------------------------------------------- */
  const initials = (name) =>
    (name || "?")
      .split(/[\s·×—-]+/)
      .filter((w) => /^[A-ZА-ЯЁ0-9]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join("") || (name || "?")[0];
  const logoImg = (file, alt) =>
    `<img src="assets/logos/${esc(file)}" alt="${esc(alt)}" width="44" height="44" loading="lazy" decoding="async"
      onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'logo__initials',textContent:this.dataset.fallback}))"
      data-fallback="${esc(initials(alt))}" />`;
  const logo = (files, name, cls = "") => {
    const list = [].concat(files || []).filter(Boolean);
    const inner = list.length
      ? list.map((f) => logoImg(f, name)).join("")
      : `<span class="logo__initials">${esc(initials(name))}</span>`;
    return `<span class="logo ${list.length > 1 ? "logo--pair" : ""} ${cls}" aria-hidden="true">${inner}</span>`;
  };

  /* ---------------------------------------------------------------------
     Experience & Education — two separate timelines
     --------------------------------------------------------------------- */
  // "Project — details" → bold project name, then details
  const point = (p) => {
    const i = p.indexOf(" — ");
    return i > 0 && i < 60 ? `<li><b>${esc(p.slice(0, i))}</b> — ${esc(p.slice(i + 3))}</li>` : `<li>${esc(p)}</li>`;
  };
  const timeline = (items) =>
    (items || [])
      .map(
        (t, i) => `<li class="tl reveal" style="--d:${i * 0.06}s">
        <div class="tl__period mono">${esc(t.period)}${duration(t.period) ? `<span class="tl__dur">${duration(t.period)}</span>` : ""}</div>
        <div class="tl__body">
          <div class="tl__head">
            ${logo(t.logo, t.org, "tl__logo")}
            <div>
              <h3 class="tl__title">${esc(t.title)}</h3>
              <div class="tl__org">${esc(t.org)}${t.place ? ` · <span class="muted">${esc(t.place)}</span>` : ""}</div>
            </div>
          </div>
          ${t.points && t.points.length ? `<ul class="tl__points">${t.points.map(point).join("")}</ul>` : ""}
          ${t.stack && t.stack.length ? `<ul class="tags tl__stack" aria-label="Tools">${t.stack.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        </div>
      </li>`
      )
      .join("");
  $("#experienceList").innerHTML = timeline(R.experience);
  $("#educationList").innerHTML = timeline(R.education);

  /* ---------------------------------------------------------------------
     Certificates
     --------------------------------------------------------------------- */
  const CERTS_SHOWN = 6;
  const certCount = (R.certificates || []).length;
  $("#certs").innerHTML = (R.certificates || [])
    .map((c, i) => {
      const tag = c.url ? "a" : "div";
      const attrs = c.url ? ` href="${esc(c.url)}" target="_blank" rel="noopener"` : "";
      const done = c.status === "done";
      return `<${tag} class="cert reveal${i >= CERTS_SHOWN ? " cert--extra" : ""}" style="--d:${(i % CERTS_SHOWN) * 0.06}s"${attrs}>
        ${logo(c.logo, c.issuer, "cert__badge")}
        <span class="cert__title">${esc(c.title)}</span>
        <span class="cert__issuer">${esc(c.issuer)}</span>
        <span class="cert__meta mono"><span class="status ${done ? "status--done" : ""}">${done ? "Issued" : "In progress"}</span>${esc(c.date)}${c.url ? `<span class="cert__verify">verify ↗</span>` : ""}</span>
        ${done ? "" : `<span class="progressbar" aria-hidden="true"><span style="--p:${c.progress || 80}%"></span></span>`}
      </${tag}>`;
    })
    .join("");

  const certsEl = $("#certs"), moreBtn = $("#certsMore");
  if (certCount > CERTS_SHOWN) {
    certsEl.classList.add("is-collapsed");
    moreBtn.hidden = false;
    const label = () =>
      (moreBtn.textContent = certsEl.classList.contains("is-collapsed") ? `Show all ${certCount} certificates` : "Show fewer");
    label();
    moreBtn.addEventListener("click", () => {
      const opening = certsEl.classList.toggle("is-collapsed") === false;
      label();
      if (opening) $$(".cert--extra", certsEl).forEach((el) => el.classList.add("is-visible"));
      else $("#certificates").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     Contact
     --------------------------------------------------------------------- */
  const iconOf = (name) => {
    const src = document.querySelector(`[data-href="${name}"] .btn__icon`);
    return src ? src.outerHTML.replace("btn__icon", "contact__icon") : "";
  };
  const contacts = [
    R.links.email && { label: "Email", sub: R.links.email, href: "mailto:" + R.links.email, icon: "" },
    R.links.phone && { label: "Phone", sub: R.links.phone, href: "tel:" + R.links.phone.replace(/[^+\d]/g, ""), icon: "" },
    R.links.telegram && { label: "Telegram", sub: "@" + R.links.telegram.replace(/^@/, ""), href: "https://t.me/" + R.links.telegram.replace(/^@/, ""), icon: "" },
    R.links.linkedin && { label: "LinkedIn", sub: "in/mekhty-mekhtyev", href: R.links.linkedin, icon: iconOf("linkedin") },
    R.links.github && { label: "GitHub", sub: "@Mekhty111", href: R.links.github, icon: iconOf("github") },
  ].filter(Boolean);
  $("#contactLinks").innerHTML = contacts
    .map(
      (c) => `<a class="contact__link" href="${esc(c.href)}" ${c.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
        <span class="contact__label">${c.icon}<span>${esc(c.label)}<small>${esc(c.sub)}</small></span></span><span aria-hidden="true">↗</span></a>`
    )
    .join("");

  /* ---------------------------------------------------------------------
     Reveal on scroll + counters
     --------------------------------------------------------------------- */
  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    const dec = +el.dataset.decimals;
    const suf = el.dataset.suffix || "";
    if (el.dataset.plain === "1" || reduceMotion) {
      el.textContent = end.toFixed(dec) + suf;
      return;
    }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        $$("[data-count]", en.target).forEach(countUp);
        io.unobserve(en.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------------------------------------------------------------------
     Nav: scrolled state, active section, progress bar
     --------------------------------------------------------------------- */
  const nav = $(".nav");
  const bar = $(".progress span");
  const links = $$(".nav__links a");
  const sections = links.map((a) => $(a.getAttribute("href")));
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    let current = -1;
    sections.forEach((s, i) => {
      if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i;
    });
    links.forEach((a, i) => a.classList.toggle("is-active", i === current));
    ticking = false;
  }
  addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     Theme + print
     --------------------------------------------------------------------- */
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const isLight =
      root.dataset.theme === "light" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: light)").matches);
    const next = isLight ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    readColors();
  });
  // Ctrl+P / "Save as PDF" — make sure nothing is still hidden by scroll reveals
  addEventListener("beforeprint", () => $$(".reveal").forEach((el) => el.classList.add("is-visible")));

  /* ---------------------------------------------------------------------
     Hero canvas — live clustering: three centroids, one follows the cursor;
     every point takes the colour of its nearest centroid and drifts toward it.
     --------------------------------------------------------------------- */
  const canvas = $("#clusters");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1, points = [], colors = [], lineColor = "";
  const mouse = { x: null, y: null };

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    colors = ["--c1", "--c2", "--c3"].map((v) => hexToRgb(cs.getPropertyValue(v).trim()));
    lineColor = cs.getPropertyValue("--line-strong").trim();
  }
  function hexToRgb(h) {
    const m = h.replace("#", "");
    const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const centroids = [
    { x: 0, y: 0, tx: 0, ty: 0, phase: 0 },
    { x: 0, y: 0, tx: 0, ty: 0, phase: 2.1 },
    { x: 0, y: 0, tx: 0, ty: 0, phase: 4.2 },
  ];

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(Math.min(220, Math.max(70, (W * H) / 7000)));
    points = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0, vy: 0,
      ox: (Math.random() - 0.5) * 2, oy: (Math.random() - 0.5) * 2,
      k: -1, mix: [0, 0, 0],
      r: 1.2 + Math.random() * 1.8,
    }));
    centroids.forEach((c, i) => { c.x = c.tx = W * (0.55 + 0.15 * i); c.y = c.ty = H * (0.3 + 0.15 * i); });
  }

  function step(t) {
    const time = t / 1000;
    // centroid targets: orbit the right side of the hero; c0 follows cursor when present
    centroids.forEach((c, i) => {
      if (i === 0 && mouse.x !== null) { c.tx = mouse.x; c.ty = mouse.y; }
      else {
        const cx = W * (W < 700 ? 0.5 : 0.68), cy = H * 0.42;
        c.tx = cx + Math.cos(time * 0.18 + c.phase) * W * (W < 700 ? 0.32 : 0.22);
        c.ty = cy + Math.sin(time * 0.23 + c.phase * 1.3) * H * 0.26;
      }
      c.x += (c.tx - c.x) * (i === 0 && mouse.x !== null ? 0.08 : 0.02);
      c.y += (c.ty - c.y) * (i === 0 && mouse.x !== null ? 0.08 : 0.02);
    });

    ctx.clearRect(0, 0, W, H);
    const spread = Math.min(W, H) * 0.2;

    // assign + move
    for (const p of points) {
      let best = 0, bd = Infinity;
      for (let i = 0; i < 3; i++) {
        const dx = p.x - centroids[i].x, dy = p.y - centroids[i].y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = i; }
      }
      p.k = best;
      for (let i = 0; i < 3; i++) p.mix[i] += ((i === best ? 1 : 0) - p.mix[i]) * 0.06;
      const c = centroids[best];
      const tx = c.x + p.ox * spread, ty = c.y + p.oy * spread;
      p.vx = (p.vx + (tx - p.x) * 0.0009) * 0.96 + (Math.random() - 0.5) * 0.05;
      p.vy = (p.vy + (ty - p.y) * 0.0009) * 0.96 + (Math.random() - 0.5) * 0.05;
      p.x += p.vx; p.y += p.vy;
    }

    // links to centroid (faint)
    ctx.lineWidth = 1;
    for (const p of points) {
      const c = centroids[p.k];
      const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy);
      if (d > spread * 0.9) continue;
      const col = colors[p.k];
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.12 * (1 - d / (spread * 0.9))})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(c.x, c.y); ctx.stroke();
    }
    // points
    for (const p of points) {
      const m = p.mix;
      const r = colors[0][0] * m[0] + colors[1][0] * m[1] + colors[2][0] * m[2];
      const g = colors[0][1] * m[0] + colors[1][1] * m[1] + colors[2][1] * m[2];
      const b = colors[0][2] * m[0] + colors[1][2] * m[1] + colors[2][2] * m[2];
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},0.85)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    // centroids as crosshairs
    centroids.forEach((c, i) => {
      const col = colors[i];
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},0.9)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(c.x - 7, c.y); ctx.lineTo(c.x + 7, c.y);
      ctx.moveTo(c.x, c.y - 7); ctx.lineTo(c.x, c.y + 7);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},0.25)`; ctx.stroke();
    });
  }

  let raf = 0, running = false;
  function loop(t) { step(t); raf = requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  readColors();
  resize();
  addEventListener("resize", () => { resize(); if (reduceMotion) step(0); });
  const hero = $(".hero");
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = null; });

  if (reduceMotion) {
    for (let i = 0; i < 400; i++) step(i * 16); // settle once, then hold still
  } else {
    // pause when hero is off-screen or the tab is hidden
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(hero);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  }

  // hero reveals immediately
  requestAnimationFrame(() => $$(".hero .reveal").forEach((el, i) => { el.style.setProperty("--d", i * 0.08 + "s"); el.classList.add("is-visible"); }));
})();
