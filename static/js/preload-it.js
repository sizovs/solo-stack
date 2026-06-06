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

customElements.define("preload-it", PreloadIt);
