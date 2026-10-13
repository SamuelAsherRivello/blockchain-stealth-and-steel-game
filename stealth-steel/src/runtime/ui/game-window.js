import { createMenu } from "./menu.js";

let windowSequence = 0;

export class GameWindow {
  constructor({
    host,
    title,
    content,
    className = "",
    buttons = [],
    onClose,
    opener = null,
    closeLabel = "Close window",
    screenLayer = null,
    frameElement = null,
    documentRef = globalThis.document,
  }) {
    this.onClose = onClose;
    this.opener = opener;
    this.dimmer = screenLayer ? documentRef.createElement("div") : null;
    if (this.dimmer) {
      this.dimmer.className = "game-window-dimmer";
      this.dimmer.addEventListener("click", this.handleDimmer = () => this.close());
      screenLayer.append(this.dimmer);
    }

    const titleId = `game-window-title-${windowSequence += 1}`;
    this.closeButton = documentRef.createElement("button");
    this.closeButton.className = "game-window-close";
    this.closeButton.type = "button";
    this.closeButton.setAttribute("aria-label", closeLabel);
    this.closeButton.textContent = "";

    const menu = createMenu({
      titleText: title,
      titleId,
      content,
      buttons,
      closeButton: this.closeButton,
      frameElement,
      documentRef,
    });
    this.panel = menu.panel;
    this.panel.className += ` game-window ${className}`;
    this.bodyArea = menu.bodyArea;
    this.actions = menu.actions;
    this.buttons = menu.buttons;
    this.backdrop = menu.backdrop;
    this.disposeFrameBounds = menu.disposeFrameBounds;
    this.backdrop.className += " game-window-backdrop";

    this.handleBackdrop = (event) => {
      if (event.target === this.backdrop) this.close();
    };
    this.handleClose = () => this.close();
    this.backdrop.addEventListener("click", this.handleBackdrop);
    this.closeButton.addEventListener("click", this.handleClose);
    host.append(this.backdrop);
    this.closeButton.focus();
  }

  close() {
    if (!this.backdrop.isConnected && !this.backdrop.parentNode) {
      return;
    }
    this.backdrop.removeEventListener("click", this.handleBackdrop);
    this.disposeFrameBounds?.();
    this.closeButton.removeEventListener("click", this.handleClose);
    this.dimmer?.removeEventListener("click", this.handleDimmer);
    this.dimmer?.remove();
    this.backdrop.remove();
    this.onClose?.();
    this.opener?.focus?.();
  }

  setVisible(visible) {
    this.backdrop.hidden = !visible;
    if (this.dimmer) this.dimmer.hidden = !visible;
  }
}
