const DEFAULT_HEADERS = {
  "x-client-version": document.body.dataset.appversion,
  "fetch-it": "true",
  credentials: "same-origin",
};

export class FetchIt extends HTMLElement {
  static pop = false;

  constructor() {
    super();
    this.addEventListener("submit", this.onSubmit);
    this.addEventListener("click", this.onClick);

    if (!FetchIt.pop) {
      FetchIt.pop = true;
      window.addEventListener("popstate", () => this.restoreFromCache());
    }
  }

  async restoreFromCache() {
    const cached = localStorage.getItem(location.href);
    if (!cached) return location.reload();

    const { text } = JSON.parse(cached);
    const { html, title } = this.parse(text);
    this.inject(html, title);
  }

  async onSubmit(e) {
    const form = e.target;
    if (form.parentElement !== this) return;

    e.preventDefault();

    if (e.submitter) e.submitter.disabled = true;
    this.progress(true);
    try {
      const response = await fetch(form.action, {
        method: form.method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...DEFAULT_HEADERS,
        },
        body: new URLSearchParams(new FormData(form)),
      });

      if (!response.ok) return;

      const text = await response.text();
      const { html, title } = this.parse(text);
      this.inject(html, title);
    } finally {
      if (e.submitter) e.submitter.disabled = true;
      this.progress(false);
    }
  }

  async onClick(e) {
    const a = e.target.closest("a");
    if (!a || a.parentElement !== this) return;

    e.preventDefault();
    this.progress(true);
    try {
      const response = await fetch(a.href, { headers: { ...DEFAULT_HEADERS } });
      if (!response.ok) return;

      const text = await response.text();
      const { html, title } = this.parse(text);
      this.inject(html, title);

      if (!a.getAttribute("rel")?.includes("noindex")) {
        localStorage.setItem(a.href, JSON.stringify({ text }));
        history.pushState(null, "", a.href);
      }
    } finally {
      this.progress(false);
    }
  }

  inject(html, title) {
    queueMicrotask(() => {
      if (title) document.title = title;

      html.querySelectorAll("[id]").forEach((el) => {
        const target = document.getElementById(el.id);
        if (target) target.replaceWith(el);
      });

      this.rerunScripts();
    });
  }

  rerunScripts() {
    // To run scripts from dynamically injected HTML, we need to clone the script.
    document.body.querySelectorAll("script").forEach((script) => {
      const copy = document.createElement("script");
      if (!script.src) copy.textContent = script.textContent;
      for (const a of script.attributes) copy.setAttribute(a.name, a.value);
      script.replaceWith(copy);
    });
  }

  progress(show) {
    const progress = document.querySelector("progress");
    if (progress) progress.hidden = !show;
  }

  parse(text) {
    const tpl = document.createElement("div");
    tpl.innerHTML = text;
    const html = tpl;
    const title = html.querySelector("title")?.textContent;
    return { html, title };
  }
}

class PreloadIt extends HTMLElement {
  connectedCallback() {
    this.link = this.querySelector("a");
    if (!this.link) return;

    const PRELOAD_TTL = 5000;

    const preload = () => {
      const now = Date.now();
      const expired = now - this.preloaded > PRELOAD_TTL;
      if (!this.preloaded || expired) {
        fetch(this.link.href, {
          headers: {
            "Preload-It": `${PRELOAD_TTL / 1000}`,
            ...DEFAULT_HEADERS,
          },
        })
          .then(() => (this.preloaded = now))
          .catch((err) => console.warn(err));
      }
    };

    this.link.addEventListener("mouseenter", preload);
    this.link.addEventListener("touchstart", preload, { passive: true });
  }
}

customElements.define("fetch-it", FetchIt);
customElements.define("preload-it", PreloadIt);
