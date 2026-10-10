import { addRibbonArt, createPanelArt } from "./tiny-swords-panel.js";
import { bindToGameFrame } from "./game-frame-bounds.js";
import "./menu-button-label.js";
import "./menu-title-label.js";

let nextMenuId = 0;
const DEFAULT_LOGO_SRC = `${import.meta.env?.BASE_URL ?? "/"}ui/tiny-swords/`
  + "stealth-and-steel-logo-transparent.png";

/**
 * @typedef {Object} MenuButtonProps
 * @property {string} displayText Text displayed inside the button.
 * @property {string | null} [icon] Optional leading icon text.
 * @property {"primary" | "secondary"} [variant] Shared menu-button color treatment.
 * @property {string} [className] Optional class hook for the caller.
 * @property {Document} [documentRef] DOM document used by tests and runtime.
 */

/**
 * @typedef {Object} MenuProps
 * @property {string} titleText Dialog title text.
 * @property {string} [bodyText] Plain body text when `content` is not supplied.
 * @property {Element | null} [content] Custom body content for richer windows.
 * @property {HTMLButtonElement | null} [closeButton] Header close control.
 * @property {(MenuButtonProps | HTMLButtonElement)[]} [buttons] Action
 * buttons rendered after the body.
 * @property {boolean} [showHeader] Whether to show the ribbon title header.
 * @property {boolean} [showLogo] Whether to show the game logo above the panel.
 * @property {string} [logoSrc] Logo image source used when `showLogo` is true.
 * @property {string} [logoAlt] Accessible logo text used when `showLogo` is true.
 * @property {boolean} [buttonClicksOnly] Blocks Enter/Space keyboard activation.
 * @property {string} [titleId] Stable accessible title id override.
 * @property {Element | null} [frameElement] Game frame whose bounds constrain the backdrop.
 * @property {Document} [documentRef] DOM document used by tests and runtime.
 */

/** A native menu action; callers own its event handlers and lifecycle. */
export function createMenuButton({ displayText, icon = null, variant = "primary", className = "", documentRef = globalThis.document }) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = `menu-button menu-button-${variant} menu-button-text tiny-swords-button ${className}`.trim();
  const label = documentRef.createElement("menu-button-label");
  label.textContent = displayText;
  button.menuLabel = label;
  if (icon) {
    const symbol = documentRef.createElement('span');
    symbol.className = `menu-button-icon ${icon === "github" ? "menu-button-icon-mark" : "menu-button-icon-glyph"}`;
    symbol.textContent = icon; symbol.setAttribute('aria-hidden','true');
    if (icon === "github") {
      symbol.textContent = "";
      const mark = documentRef.createElementNS?.("http://www.w3.org/2000/svg", "svg");
      if (mark) {
        mark.setAttribute("viewBox", "0 0 24 24");
        mark.setAttribute("role", "img");
        mark.setAttribute("aria-label", "GitHub");
        const path = documentRef.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12");
        mark.append(path);
        symbol.append(mark);
      }
    }
    button.className += ' has-menu-icon'; button.append(symbol);
  }
  button.append(label, createPanelArt(documentRef, "tiny-swords-button-art"));
  return button;
}

/**
 * Reusable presentation; callers own mounting, visibility, focus and actions.
 * @param {MenuProps} props
 */
export function createMenu({
  titleText,
  bodyText,
  content = null,
  closeButton = null,
  buttons = [],
  showHeader = true,
  showLogo = false,
  logoSrc = DEFAULT_LOGO_SRC,
  logoAlt = "",
  buttonClicksOnly = false,
  titleId = `menu-title-${++nextMenuId}`,
  frameElement = null,
  documentRef = globalThis.document,
}) {
  const backdrop = documentRef.createElement("div");
  backdrop.className = `menu-backdrop tiny-swords-menu-backdrop${showLogo ? " has-logo" : ""}`;
  const disposeFrameBounds = bindToGameFrame({ overlay: backdrop, frameElement });
  if (buttonClicksOnly) {
    // Focused native buttons otherwise activate on Enter or Space.
    const containKeyboard = event => {
      event.stopPropagation();
      if (event.key === "Enter" || event.key === " " || event.code === "Space") event.preventDefault();
    };
    backdrop.addEventListener("keydown", containKeyboard);
    backdrop.addEventListener("keyup", containKeyboard);
  }
  const composition = documentRef.createElement("div");
  composition.className = "tiny-swords-menu-composition";
  const panel = documentRef.createElement("section");
  panel.className = "menu-panel tiny-swords-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  if (showHeader) panel.setAttribute("aria-labelledby", titleId);
  else if (titleText) panel.setAttribute("aria-label", titleText);

  let title = null;
  let header = null;
  const headerContainer = documentRef.createElement("div");
  headerContainer.className = "title-container header-container game-window-header";
  if (showHeader) {
    title = documentRef.createElement("h2");
    title.className = "title-text menu-header-text menu-title-text tiny-swords-title-text";
    const label = documentRef.createElement("menu-title-label");
    label.textContent = titleText;
    title.menuTitleLabel = label;
    title.append(label);
    title.id = titleId;
    header = headerContainer;
    if (closeButton) {
      closeButton.className = `${closeButton.className ?? ""} close-button menu-header-button`.trim();
      headerContainer.append(title, closeButton);
    } else {
      headerContainer.append(title);
    }
    addRibbonArt(headerContainer, documentRef);
  }
  const bodyArea = documentRef.createElement("div");
  bodyArea.className = "menu-body game-window-body";
  const bodyContainer = documentRef.createElement("div");
  bodyContainer.className = "body-container";
  let body = null;
  if (bodyText != null) {
    body = documentRef.createElement("p");
    body.className = "menu-subtitle-text tiny-swords-body-text";
    body.textContent = bodyText;
    body.id = `${titleId}-body`;
    panel.setAttribute("aria-describedby", body.id);
    bodyArea.append(body);
  }
  if (content) bodyArea.append(content);
  bodyContainer.append(bodyArea);
  const actionButtons = buttons.map(options => (
    typeof options?.addEventListener === "function" && options.type === "button"
      ? options
      : createMenuButton({ ...options, documentRef })
  ));
  const actions = documentRef.createElement("div");
  actions.className = "menu-button-container menu-actions";
  actions.append(...actionButtons);
  const footerContainer = documentRef.createElement("div");
  footerContainer.className = "footer-container";
  footerContainer.append(actions);
  const contentStack = documentRef.createElement("div");
  contentStack.className = "menu-content-stack";
  contentStack.append(headerContainer, bodyContainer, footerContainer);
  panel.append(contentStack, createPanelArt(documentRef));

  let logoElement = null;
  if (showLogo) {
    logoElement = documentRef.createElement("img");
    logoElement.className = "tiny-swords-menu-logo";
    logoElement.src = logoSrc;
    logoElement.alt = logoAlt;
    composition.append(logoElement);
  }
  composition.append(panel);
  backdrop.append(composition);
  return {
    backdrop,
    composition,
    panel,
    header,
    headerContainer,
    title,
    body: body ?? bodyArea,
    bodyArea,
    bodyContainer,
    contentStack,
    actions,
    footerContainer,
    buttons: actionButtons,
    logo: logoElement,
    disposeFrameBounds,
  };
}
