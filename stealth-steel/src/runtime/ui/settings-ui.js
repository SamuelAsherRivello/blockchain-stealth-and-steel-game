import {
  RUNTIME_AUDIO_SETTING_KEYS,
  RUNTIME_DEBUG_SETTING_KEYS,
  runtimeSettingsStore,
  MAP_ORDER_SETTING_KEY,
} from "../runtime-settings/runtime-settings-store.js";
import { normalizeMapOrder } from "../gameplay/level-progress.js";
import { applyFullscreenPreference } from "./fullscreen-settings.js";
import { GameWindow } from "./game-window.js";
import { createMenuButton } from "./menu.js";
import { createSliderControl, createToggleControl } from "./menu-controls.js";

const ASSET_BASE = import.meta.env?.BASE_URL ?? "/";
const PROJECT_GITHUB_URL = "https://github.com/SamuelAsherRivello/stealth-and-steel-game";
const BIS_GITHUB_URL = "https://github.com/SamuelAsherRivello/blockchain-integration-service";

function createVolumeControl(documentRef, store, labelText, key) {
  const control = createSliderControl({ labelText, value: store.get(key),
    onChange: value => store.set(key, value), documentRef });
  control.slider.setAttribute("aria-label", `${labelText} volume`);
  return control;
}

export function createDebugControl(documentRef, store, labelText, key) {
  const control = createToggleControl({ labelText, checked: store.get(key),
    onChange: checked => store.set(key, checked), documentRef });
  control.row.className += " collider-control";
  return control;
}
function createFullscreenControl(documentRef, applyFullscreen) {
  const control = createToggleControl({ labelText: "FullScreen", documentRef,
    onChange: async checked => {
      await applyFullscreen(checked, documentRef);
      syncWithDocument();
    },
  });
  const { row, checkbox } = control;
  row.className += " fullscreen-control";
  const syncWithDocument = () => {
    checkbox.checked = Boolean(documentRef.fullscreenElement);
  };
  syncWithDocument();
  documentRef.addEventListener?.("fullscreenchange", syncWithDocument);
  return {
    row,
    checkbox,
    dispose() {
      control.dispose();
      documentRef.removeEventListener?.("fullscreenchange", syncWithDocument);
    },
  };
}

export function createSettingsUi({
  host,
  modalHost = host,
  screenLayer = modalHost,
  frameElement = null,
  pauseController,
  openAccount,
  getBis = () => undefined,
  onBisReset = () => {},
  catalog = [],
  showMapLevelSelectorInSettings = true,
  store = runtimeSettingsStore,
  isStartMenuVisible = () => false,
  documentRef = globalThis.document,
  applyFullscreen = applyFullscreenPreference,
  openExternal = (url, target, features) => globalThis.open?.(url, target, features),
}) {
  const gear = documentRef.createElement("button");
  gear.className = "settings-gear";
  gear.type = "button";
  gear.setAttribute("aria-label", "Open settings");
  const icon = documentRef.createElement("img");
  icon.src = `${ASSET_BASE}ui/tiny-swords/Icon_10.png`;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  gear.append(icon);
  screenLayer.append(gear);

  let activeWindow = null;
  let developerWindow = null;
  let accountButton = null;
  let accountActive = false;
  const syncGearStacking = () => {
    gear.classList.toggle("settings-gear-over-start-menu", !activeWindow && isStartMenuVisible());
  };
  const close = () => { if (!accountActive) activeWindow?.close(); };
  const open = () => {
    if (accountActive) return;
    if (activeWindow) {
      close();
      return;
    }
    gear.classList.toggle("settings-gear-over-start-menu", false);
    const content = documentRef.createElement("div");
    content.className = "settings-controls";
    const musicControl = createVolumeControl(
      documentRef, store, "Music", RUNTIME_AUDIO_SETTING_KEYS.music,
    );
    const sfxControl = createVolumeControl(
      documentRef, store, "SFX", RUNTIME_AUDIO_SETTING_KEYS.sfx,
    );
    const fullscreenControl = createFullscreenControl(documentRef, applyFullscreen);
    const musicSlider = musicControl.slider;
    const sfxSlider = sfxControl.slider;
    const developerButton = createMenuButton({ displayText: "Developer", className: "developer-settings-button", documentRef });
    const settingsButtons = [];

    const developerContent = documentRef.createElement("div");
    developerContent.className = "settings-controls developer-settings-controls";
    const debugHeading = documentRef.createElement("h3");
    debugHeading.className = "debug-visualizations-heading menu-label-text";
    debugHeading.textContent = "Debug Draw";
    const debugControls = [
      ["Coordinates", RUNTIME_DEBUG_SETTING_KEYS.showCoordinates],
      ["Enemy Perceptions", RUNTIME_DEBUG_SETTING_KEYS.showEnemyPerceptions],
      ["Enemy Tasks", RUNTIME_DEBUG_SETTING_KEYS.showEnemyAiLabels],
      ["Physics Colliders", RUNTIME_DEBUG_SETTING_KEYS.showColliders],
      ["Tile Map Info", RUNTIME_DEBUG_SETTING_KEYS.showTileMapInfo],
    ].map(([label, key]) => ({ key, ...createDebugControl(documentRef, store, label, key) }));
    const githubButton = createMenuButton({ displayText: "Stealth & Steel", icon: "github", className: "settings-github-button", documentRef });
    githubButton.addEventListener("click", () => {
      openExternal(PROJECT_GITHUB_URL, "_blank", "noopener,noreferrer");
    });
    const bisGithubButton = createMenuButton({ displayText: "BIS", icon: "github", className: "settings-github-button settings-bis-button", documentRef });
    bisGithubButton.addEventListener("click", () => {
      openExternal(BIS_GITHUB_URL, "_blank", "noopener,noreferrer");
    });
    const resetButton = createMenuButton({ displayText: "Clear Local Storage", variant: "secondary", className: "settings-reset", documentRef });
    const mapHeading = documentRef.createElement("h3");
    mapHeading.className = "map-order-heading menu-label-text";
    mapHeading.textContent = "Map";
    const mapButtons = documentRef.createElement("div");
    mapButtons.className = "map-order-buttons";
    mapButtons.setAttribute("role", "group");
    mapButtons.setAttribute("aria-label", "Map Order");
    const renderMapOrder = () => {
      mapButtons.textContent = "";
      for (const number of normalizeMapOrder(catalog, store.get(MAP_ORDER_SETTING_KEY))) {
        const button = createMenuButton({ displayText: `Level${number}`, className: "map-order-button", documentRef });
        button.setAttribute("data-map-number", String(number));
        button.addEventListener("click", () => {
          const order = normalizeMapOrder(catalog, store.get(MAP_ORDER_SETTING_KEY));
          store.set(MAP_ORDER_SETTING_KEY, [number, ...order.filter(value => value !== number)]);
          renderMapOrder();
          mapButtons.querySelector?.(`[data-map-number="${number}"]`)?.focus();
        });
        mapButtons.append(button);
      }
    };
    renderMapOrder();
    developerContent.append(debugHeading, ...debugControls.map(control => control.row));
    if (showMapLevelSelectorInSettings && catalog.length) developerContent.append(mapHeading, mapButtons);
    const resetStatus=documentRef.createElement('p');resetStatus.setAttribute('role','status');
    developerContent.append(resetStatus);
    resetButton.addEventListener("click", async () => {
      if(resetButton.disabled)return;
      resetButton.disabled=true;resetStatus.textContent='Clearing local settings…';
      try {
      onBisReset();
      store.reset();
      renderMapOrder();
      musicSlider.value = String(store.get(RUNTIME_AUDIO_SETTING_KEYS.music));
      sfxSlider.value = String(store.get(RUNTIME_AUDIO_SETTING_KEYS.sfx));
      for (const control of debugControls) control.checkbox.checked = store.get(control.key);
        const bis=getBis();
        const result=bis?await bis.resetForGameAsync():undefined;
        resetStatus.textContent=result?.status==='failed'
          ? 'Game settings cleared, but BIS cleanup failed. Try Clear Local Storage again.'
          : 'Local settings cleared. Remote transactions are not cancelled.';
      } catch {resetStatus.textContent='Local cleanup failed. Try Clear Local Storage again.';}
      finally {resetButton.disabled=false;}
    });

    const openDeveloperSettings = () => {
      if (developerWindow) return;
      activeWindow?.setVisible(false);
      developerWindow = new GameWindow({
        host: modalHost,
        title: "Developer",
        content: developerContent,
        buttons: [githubButton, bisGithubButton, resetButton],
        documentRef,
        opener: developerButton,
        closeLabel: "Close developer settings",
        screenLayer,
        frameElement,
        onClose: () => {
          developerWindow = null;
          activeWindow?.setVisible(true);
        },
      });
      developerWindow.actions.classList.add("developer-settings-actions");
      developerWindow.actions.textContent = "";
      developerWindow.actions.append(githubButton, bisGithubButton, resetButton);
      developerWindow.backdrop.classList.add("developer-settings-backdrop");
      developerWindow.dimmer?.classList.add("developer-settings-dimmer");
    };
    developerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openDeveloperSettings();
    });
    content.append(
      musicControl.row,
      sfxControl.row,
      fullscreenControl.row,
    );
    if (openAccount) {
      accountButton = createMenuButton({ displayText: "⚡ Account", className: "settings-account-button", documentRef });
      accountButton.addEventListener("click", event => {
        event.stopPropagation();
        if (accountActive) return;
        accountActive = true;
        activeWindow?.setVisible(false);
        void openAccount();
      });
      settingsButtons.push(accountButton);
    }
    settingsButtons.push(developerButton);
    pauseController.pause('settings');
    gear.setAttribute("aria-label", "Close settings");
    activeWindow = new GameWindow({
      host: modalHost,
      title: "Settings",
      content,
      buttons: settingsButtons,
      documentRef,
      opener: gear,
      closeLabel: "Close settings",
      screenLayer,
      frameElement,
      onClose: () => {
        developerWindow?.close();
        fullscreenControl.dispose();
        activeWindow = null;
        gear.setAttribute("aria-label", "Open settings");
        syncGearStacking();
        pauseController.resume('settings');
      },
    });
  };
  gear.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.key === " ") {
      event.preventDefault();
    }
  });
  gear.addEventListener("click", open);

  return {
    gear,
    returnFromAccount() {
      accountActive = false;
      activeWindow?.setVisible(true);
      accountButton?.focus();
    },
    open,
    close,
    syncGearStacking,
    get activeWindow() { return activeWindow; },
    get developerWindow() { return developerWindow; },
  };
}
