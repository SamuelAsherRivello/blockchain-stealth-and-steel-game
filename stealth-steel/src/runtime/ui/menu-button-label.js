// A lifecycle-managed label keeps every menu action on one line as it resizes.
if (globalThis.customElements && !customElements.get("menu-button-label")) {
  customElements.define("menu-button-label", class extends HTMLElement {
    connectedCallback() {
      this.fit = () => {
        if (!this.isConnected || !this.parentElement) return;
        const button = this.parentElement;
        const style = getComputedStyle(button);
        const icon = button.querySelector('.menu-button-icon');
        const scale = button.getBoundingClientRect().width / button.offsetWidth || 1;
        const iconWidth = icon ? icon.getBoundingClientRect().width / scale + (parseFloat(style.columnGap) || 0) : 0;
        const available = button.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - iconWidth;
        if (available <= 0) return;
        const baseSize = parseFloat(style.fontSize);
        this.style.fontSize = `${baseSize}px`;
        const range = this.ownerDocument.createRange();
        range.selectNodeContents(this);
        const width = range.getBoundingClientRect().width / scale;
        if (width > available) this.style.fontSize = `${baseSize * Math.max(1, available - 1) / width}px`;
      };
      this.resizeObserver = new ResizeObserver(this.fit);
      this.resizeObserver.observe(this.parentElement);
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
