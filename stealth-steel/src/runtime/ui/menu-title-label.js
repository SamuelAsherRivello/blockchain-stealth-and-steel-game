// Keep every ribbon title on the shared menu title size.
if (globalThis.customElements && !customElements.get("menu-title-label")) {
  customElements.define("menu-title-label", class extends HTMLElement {
    connectedCallback() {
      this.fit = () => {
        if (!this.isConnected || !this.parentElement) return;
        // Sizing belongs to the shared CSS token. Do not write an inline
        // font-size here: that would override --menu-title-font-size.
        this.style.removeProperty("font-size");
      };
      if (globalThis.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(this.fit);
        this.resizeObserver.observe(this.parentElement);
      }
      this.textObserver = new MutationObserver(this.fit);
      this.textObserver.observe(this, { childList: true, characterData: true, subtree: true });
      window.addEventListener("resize", this.fit);
      this.ownerDocument.fonts?.ready.then(() => this.fit?.());
      this.fit();
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      this.textObserver?.disconnect();
      window.removeEventListener("resize", this.fit);
    }
  });
}
