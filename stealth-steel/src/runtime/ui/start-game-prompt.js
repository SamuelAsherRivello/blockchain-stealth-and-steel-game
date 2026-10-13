import { createMenu } from "./menu.js";

const START_PROMPT_BODY = "Collect the gold. Reach the dungeon steps to win.\nAvoid the enemies. Use the bushes to hide.";

export function shouldShowStartGamePrompt({ showStartPrompt = true } = {}) {
  return showStartPrompt !== false;
}

export function shouldSkipIntro({ isDevelopment = false, search = "" } = {}) {
  return isDevelopment && new URLSearchParams(search).get("skipIntro") === "true";
}

export function createStartGamePrompt({ host, onStart, onItems, itemsVisible = false, itemsEnabled = false, frameElement = null, documentRef = globalThis.document }) {
  const itemButtonOptions = itemsVisible
    ? [{ displayText: "View Items", icon: "⚡", className: "start-game-prompt-items" }]
    : [];
  const menu = createMenu({
    titleText: "Welcome",
    bodyText: START_PROMPT_BODY,
    buttonClicksOnly: true,
    titleId: "start-game-prompt-title",
    showLogo: true,
    logoAlt: "Stealth & Steel",
    buttons: [
      { displayText: "Start Game", variant: "primary", className: "start-game-prompt-start" },
      ...itemButtonOptions,
    ],
    frameElement,
    documentRef,
  });
  const { backdrop, panel } = menu;
  const [startButton, itemsButton = null] = menu.buttons;
  if (itemsButton) itemsButton.disabled = !itemsEnabled;
  backdrop.className += " start-game-prompt-backdrop";
  backdrop.setAttribute("data-start-game-prompt", "true");
  panel.className += " start-game-prompt-panel";
  menu.body.className += " start-game-prompt-body";
  menu.body.style.whiteSpace = "pre-line";
  menu.composition.className += " start-game-prompt-composition";
  menu.logo.className += " start-game-prompt-logo";
  const handleStart = () => {
    onStart?.();
    prompt.close();
  };
  startButton.addEventListener("click", handleStart);
  const handleItems = () => { if (itemsButton && !itemsButton.disabled) onItems?.(); };
  itemsButton?.addEventListener("click", handleItems);

  host.append(backdrop);
  startButton.focus();

  const prompt = {
    backdrop,
    panel,
    startButton,
    itemsButton,
    setItemsEnabled(enabled) { if (itemsButton) itemsButton.disabled = !enabled; },
    setItemsSupported() {},
    close() {
      startButton.removeEventListener("click", handleStart);
      itemsButton?.removeEventListener("click", handleItems);
      menu.disposeFrameBounds();
      backdrop.remove();
    },
  };
  return prompt;
}

export { START_PROMPT_BODY };
