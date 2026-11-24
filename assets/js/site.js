/* Progressive enhancement for the static page. Everything works without this file:
   links open demos in a new tab, all content is in the HTML. */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Loaded inside one of this site's own demo windows (e.g. a demo's "Back to resume" link)?
     Tell the parent page to close that window instead of nesting the resume in itself.
     The inline script in <head> already hid this copy before first paint. */
  if (window.self !== window.top) {
    let nested = false;
    try { nested = window.parent.location.origin === location.origin; } catch {}
    if (nested) {
      window.parent.postMessage({ type: "portfolio:framed" }, location.origin);
      return;
    }
  }

  /* ------------------------------------------------ nav: scrolled + active section */
  const nav = $("[data-nav]");
  const onScroll = () => nav && nav.toggleAttribute("data-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav a[href^="#"]').filter((a) => a.getAttribute("href").length > 1);
  const sections = [...new Set(navLinks.map((a) => a.getAttribute("href")))]
    .map((h) => document.getElementById(h.slice(1)))
    .filter(Boolean);
  const setActive = (id) =>
    navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + id)));
  if ("IntersectionObserver" in window && sections.length) {
    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const current = sections.find((s) => visible.get(s.id));
        setActive(current ? current.id : "");
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ----------------------------------------------------------- mobile menu */
  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-menu]");
  if (toggle && menu) {
    const setOpen = (open, { focus = false } = {}) => {
      toggle.setAttribute("aria-expanded", String(open));
      $(".nav__toggle-label", toggle).textContent = open ? "Close" : "Menu";
      menu.hidden = !open;
      menu.classList.toggle("is-open", open);
      if (open && focus) $("a", menu)?.focus();
      if (!open && focus) toggle.focus();
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) setOpen(false, { focus: true });
    });
    matchMedia("(min-width: 861px)").addEventListener("change", (m) => m.matches && setOpen(false));
  }

  /* ------------------------------------------- keep durations and year current */
  const MONTHS_FMT = (n) => {
    const y = Math.floor(n / 12), mo = n % 12, out = [];
    if (y) out.push(`${y} yr${y > 1 ? "s" : ""}`);
    if (mo || !y) out.push(`${mo || 1} mo${(mo || 1) > 1 ? "s" : ""}`);
    return out.join(" ");
  };
  const now = new Date();
  const idx = (s) => (s === "now" ? now.getFullYear() * 12 + now.getMonth() : +s.slice(0, 4) * 12 + +s.slice(5, 7) - 1);
  $$(".duration[data-from]").forEach((el) => {
    const n = idx(el.dataset.to) - idx(el.dataset.from) + 1;
    if (n > 0) el.textContent = MONTHS_FMT(n);
  });
  $$("[data-year]").forEach((el) => (el.textContent = now.getFullYear()));

  /* ------------------------------------------------------- certificates toggle */
  const certs = $("[data-certs]");
  const certsToggle = $("[data-certs-toggle]");
  if (certs && certsToggle) {
    certs.classList.add("is-collapsed");
    certsToggle.hidden = false;
    certsToggle.addEventListener("click", () => {
      const collapsed = certs.classList.toggle("is-collapsed");
      certsToggle.setAttribute("aria-expanded", String(!collapsed));
      certsToggle.textContent = collapsed ? certsToggle.dataset.more : certsToggle.dataset.less;
    });
  }

  /* =================================================================
     <project-demo>: poster → live iframe, view switching, fullscreen,
     loading / error states. Configured from src/data/portfolio.ts.
     It never tries to work around X-Frame-Options or CSP: if a host
     forbids framing, set `embed: false` and the window links out instead.
     ================================================================= */
  /* The page's theme, handed to every demo so it opens in the same scheme.
     The site is dark-only today; set <html data-theme="light"> and demos follow. */
  const pageTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
  const withTheme = (url) => {
    try {
      const u = new URL(url);
      u.searchParams.set("theme", pageTheme());
      return u.toString();
    } catch {
      return url;
    }
  };
  const demos = new Set();

  /* Messages from embedded demos:
     - "credence:back": the demo's "Back to resume" button was pressed.
     - "portfolio:framed": this site was loaded inside a demo window (nested resume). */
  addEventListener("message", (e) => {
    const type = e.data && e.data.type;
    if (type !== "credence:back" && type !== "portfolio:framed") return;
    demos.forEach((d) => d.frame && e.source === d.frame.contentWindow && d.close());
  });
  new MutationObserver(() => demos.forEach((d) => d.syncTheme())).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  class ProjectDemo extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      demos.add(this);
      this.embed = this.dataset.embed === "true";
      this.timeoutMs = (Number(this.dataset.timeout) || 25) * 1000;
      this.stage = $(".demo__stage", this);
      this.poster = $(".demo__poster", this);
      this.status = $("[data-status]", this);
      this.runLink = $("[data-run]", this);
      this.views = $$(".demo__view", this);
      this.opens = $$("[data-open]", this);
      this.urlLabel = $("[data-url]", this);
      this.fsButton = $("[data-fullscreen]", this);
      this.src = this.runLink.href;
      this.syncLinks();

      if (this.embed) {
        this.runLink.addEventListener("click", (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // let "open in new tab" work
          e.preventDefault();
          this.start();
        });
      }
      this.views.forEach((b) => b.addEventListener("click", () => this.select(b)));

      if (this.fsButton && document.fullscreenEnabled && this.embed) {
        this.fsButton.hidden = false;
        this.fsButton.addEventListener("click", () => this.toggleFullscreen());
        document.addEventListener("fullscreenchange", () => {
          const on = document.fullscreenElement === this;
          this.fsButton.setAttribute("aria-label", on ? "Exit full screen" : "Full screen");
        });
      }
    }

    get state() { return this.dataset.state || "idle"; }
    set state(v) { if (v === "idle") delete this.dataset.state; else this.dataset.state = v; }

    select(button) {
      this.views.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      this.src = button.dataset.src;
      this.syncLinks();
      const img = new Image();
      img.src = button.dataset.poster;
      const swap = () => { this.poster.src = img.src; this.poster.alt = button.dataset.alt; };
      img.decode ? img.decode().then(swap, swap) : swap();
      if (this.state !== "idle") this.start();
    }

    start() {
      clearTimeout(this.timer);
      const token = (this.token = (this.token || 0) + 1);
      this.state = "loading";
      this.setStatus(`<div class="demo__msg"><span class="spinner" aria-hidden="true"></span><span>Starting the live app…</span></div>`);

      if (!this.frame) {
        this.frame = document.createElement("iframe");
        this.frame.title = this.dataset.title || "Live demo";
        this.frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads");
        this.frame.setAttribute("allow", "fullscreen; clipboard-write");
        this.frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        this.stage.append(this.frame);
      }
      this.frame.style.colorScheme = pageTheme();
      this.frame.onload = () => {
        if (token !== this.token) return;
        // A link inside the demo led back to this site: close the window instead of
        // showing the resume inside the resume. Reading location only works same-origin,
        // so for the demo's own pages this throws and is ignored.
        try {
          if (this.frame.contentWindow.location.origin === location.origin) return this.close();
        } catch {}
        clearTimeout(this.timer);
        this.state = "live";
        this.setStatus(`<span class="visually-hidden">The live demo is ready.</span>`);
        this.syncTheme();
      };
      this.frame.src = withTheme(this.src);
      this.timer = setTimeout(() => token === this.token && this.fail(), this.timeoutMs);
    }

    /** Stops the demo and returns the window to its screenshot. */
    close() {
      clearTimeout(this.timer);
      this.token = (this.token || 0) + 1;
      if (this.frame) {
        this.frame.onload = null;
        this.frame.remove();
        this.frame = null;
      }
      this.state = "idle";
      this.setStatus(`<span class="visually-hidden">Demo closed. You are back on the resume.</span>`);
      if (document.fullscreenElement === this) document.exitFullscreen().catch(() => {});
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      this.runLink.focus({ preventScroll: true });
    }

    /** Keeps "open in new tab" links and the address label in step with the selected view and theme. */
    syncLinks() {
      const themed = withTheme(this.src);
      this.opens.forEach((a) => (a.href = themed));
      this.runLink.href = themed;
      this.urlLabel.textContent = this.src.replace(/^https?:\/\//, "").replace(/\/$/, "");
    }

    /** Tells a running demo the page theme (apps that support it switch live). */
    syncTheme() {
      this.syncLinks();
      if (!this.frame) return;
      this.frame.style.colorScheme = pageTheme();
      try {
        this.frame.contentWindow.postMessage({ type: "credence:theme", theme: pageTheme() }, new URL(this.src).origin);
      } catch {}
    }

    fail() {
      this.state = "error";
      const host = this.src.replace(/^https?:\/\//, "").split("/")[0];
      this.setStatus(`<div class="demo__msg" role="alert">
        <strong>The demo didn't respond.</strong>
        <span>The server at ${host} may be starting up. Try again, or open it in a new tab.</span>
        <span class="row">
          <button class="btn btn--quiet btn--sm" type="button" data-retry>Try again</button>
          <a class="btn btn--primary btn--sm" href="${withTheme(this.src)}" target="_blank" rel="noopener">Open in new tab</a>
        </span>
      </div>`);
      $("[data-retry]", this).addEventListener("click", () => this.start());
    }

    setStatus(html) { this.status.innerHTML = html; }

    async toggleFullscreen() {
      try {
        if (document.fullscreenElement === this) await document.exitFullscreen();
        else {
          if (this.state === "idle") this.start();
          await this.requestFullscreen();
        }
      } catch {
        window.open(withTheme(this.src), "_blank", "noopener");
      }
    }
  }
  if ("customElements" in window) customElements.define("project-demo", ProjectDemo);
})();
