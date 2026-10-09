import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { AUDIO_SETTING_KEYS, DEBUG_SETTING_KEYS, createSettingsStore } from "../../runtime/runtime-settings/runtime-settings-store.js";
import { applyUrlAudioMuteParameters } from "../../runtime/runtime-settings/runtime-audio-settings.js";
import { GameWindow } from "../../runtime/ui/game-window.js";
import {
  createDebugControl,
  createSettingsUi,
} from "../../runtime/ui/settings-ui.js";

class FakeClassList {
  values = new Set();
  add(value) { this.values.add(value); }
  toggle(value, force) {
    if (force === undefined) force = !this.values.has(value);
    if (force) this.values.add(value);
    else this.values.delete(value);
    return force;
  }
}

class FakeElement extends EventTarget {
  _text = "";
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  children = [];
  attributes = new Map();
  classList = new FakeClassList();
  parentNode = null;
  isConnected = false;
  focused = false;
  append(...children) {
    for (const child of children) {
      child.parentNode = this;
      child.isConnected = this.isConnected;
      this.children.push(child);
    }
  }
  prepend(...children) { this.append(...children); this.children = [...children, ...this.children.filter(child => !children.includes(child))]; }
  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    }
    this.parentNode = null;
    this.isConnected = false;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  focus() { this.focused = true; }
}

function createDocument() {
  return { createElement: () => new FakeElement() };
}

function click(target, eventTarget = target) {
  const event = new Event("click");
  Object.defineProperty(event, "target", { value: eventTarget });
  target.dispatchEvent(event);
}

function elementByClass(root, className) {
  const pending = [root];
  while (pending.length) {
    const element = pending.shift();
    if ((element.className ?? "").split(/\s+/).includes(className)) return element;
    pending.push(...element.children);
  }
  assert.fail(`Missing .${className}`);
}

test('Map Order promotes clicked maps and Clear All Settings restores order', () => {
  const store = createSettingsStore(null);
  const ui = createSettingsUi({ host: new FakeElement(), documentRef: createDocument(), store,
    catalog: [1, 2, 3].map(number => ({number, file: `Level0${number}.tmj`})),
    pauseController: { pause() {}, resume() {} } });
  ui.open();
  click(elementByClass(ui.activeWindow.panel, 'developer-settings-button'));
  assert.equal(elementByClass(ui.developerWindow.panel, 'map-order-heading').textContent, 'Map');
  const row = elementByClass(ui.developerWindow.panel, 'map-order-buttons');
  click(row.children[1]);
  click(row.children[2]);
  assert.deepEqual(row.children.map(button => button.textContent), ['Level3', 'Level2', 'Level1']);
  click(row.children[0]);
  assert.deepEqual(row.children.map(button => button.textContent), ['Level3', 'Level2', 'Level1']);
  click(elementByClass(ui.developerWindow.panel, 'settings-reset'));
  assert.deepEqual(row.children.map(button => button.textContent), ['Level1', 'Level2', 'Level3']);
});

test("Developer lists five independent visualizations and clears all their settings", () => {
  const store = createSettingsStore(null);
  const ui = createSettingsUi({ host: new FakeElement(), documentRef: createDocument(), store,
    pauseController: { pause() {}, resume() {} } });
  ui.open();
  click(elementByClass(ui.activeWindow.panel, "developer-settings-button"));
  const content = elementByClass(ui.developerWindow.panel, "developer-settings-controls");
  assert.equal(content.children[0].textContent, "Debug Draw");
  const rows = content.children.slice(1, 6);
  assert.deepEqual(rows.map(row => row.children[0].textContent), [
    "Coordinates", "Enemy Perceptions", "Enemy Tasks", "Physics Colliders", "Tile Map Info",
  ]);
  const keys = [DEBUG_SETTING_KEYS.showCoordinates, DEBUG_SETTING_KEYS.showEnemyPerceptions,
    DEBUG_SETTING_KEYS.showEnemyAiLabels, DEBUG_SETTING_KEYS.showColliders, DEBUG_SETTING_KEYS.showTileMapInfo];
  rows.forEach((row, index) => {
    row.children[1].checked = true;
    row.children[1].dispatchEvent(new Event("change"));
    keys.forEach((key, i) => assert.equal(store.get(key), i <= index));
  });
  click(elementByClass(ui.developerWindow.actions, "settings-reset"));
  keys.forEach(key => assert.equal(store.get(key), false));
  rows.forEach(row => assert.equal(row.children[1].checked, false));
});

test('map level selector can be hidden from Developer settings', () => {
  const store = createSettingsStore(null);
  const ui = createSettingsUi({ host: new FakeElement(), documentRef: createDocument(), store,
    catalog: [1, 2, 3].map(number => ({number, file: `Level0${number}.tmj`})),
    showMapLevelSelectorInSettings: false,
    pauseController: { pause() {}, resume() {} } });
  ui.open();
  click(elementByClass(ui.activeWindow.panel, 'developer-settings-button'));
  assert.equal(ui.developerWindow.panel.children.some(child => child.className === 'map-order-heading menu-label-text'), false);
  assert.equal(ui.developerWindow.panel.children.some(child => child.className === 'map-order-buttons'), false);
});

test("Space does not activate the settings gear", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const store = { get: () => 100 };
  const pauseController = { pause() {}, resume() {} };
  const settingsUi = createSettingsUi({
    host,
    pauseController,
    store,
    documentRef,
  });
  const event = new Event("keydown", { cancelable: true });
  Object.defineProperty(event, "code", { value: "Space" });

  settingsUi.gear.dispatchEvent(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(settingsUi.activeWindow, null);
});

test("settings gear is above only an open Start Menu", () => {
  const documentRef = createDocument();
  let startMenuVisible = true;
  const settingsUi = createSettingsUi({
    host: new FakeElement(),
    pauseController: { pause() {}, resume() {} },
    store: { get: () => 100 },
    documentRef,
    isStartMenuVisible: () => startMenuVisible,
  });

  settingsUi.syncGearStacking();
  assert.equal(settingsUi.gear.classList.values.has("settings-gear-over-start-menu"), true);
  settingsUi.open();
  assert.equal(settingsUi.gear.classList.values.has("settings-gear-over-start-menu"), false);
  settingsUi.close();
  assert.equal(settingsUi.gear.classList.values.has("settings-gear-over-start-menu"), true);
  startMenuVisible = false;
  settingsUi.syncGearStacking();
  assert.equal(settingsUi.gear.classList.values.has("settings-gear-over-start-menu"), false);
});

test("visualization controls use exact labels and write independent keys", () => {
  const documentRef = createDocument();
  const values = new Map([
    [DEBUG_SETTING_KEYS.showCoordinates, true],
    [DEBUG_SETTING_KEYS.showEnemyPerceptions, false],
  ]);
  const writes = [];
  const store = {
    get: (key) => values.get(key),
    set(key, value) {
      writes.push([key, value]);
      values.set(key, value);
    },
  };
  const particles = createDebugControl(
    documentRef,
    store,
    "Coordinates",
    DEBUG_SETTING_KEYS.showCoordinates,
  );
  const animatedTile = createDebugControl(
    documentRef,
    store,
    "Enemy Perceptions",
    DEBUG_SETTING_KEYS.showEnemyPerceptions,
  );

  assert.equal(particles.row.children[0].textContent, "Coordinates");
  assert.equal(animatedTile.row.children[0].textContent, "Enemy Perceptions");
  assert.equal(particles.checkbox.checked, true);
  assert.equal(animatedTile.checkbox.checked, false);
  particles.checkbox.checked = false;
  particles.checkbox.dispatchEvent(new Event("change"));
  animatedTile.checkbox.checked = true;
  animatedTile.checkbox.dispatchEvent(new Event("change"));
  assert.deepEqual(writes, [
    [DEBUG_SETTING_KEYS.showCoordinates, false],
    [DEBUG_SETTING_KEYS.showEnemyPerceptions, true],
  ]);


});

test("game window closes only when the backdrop itself is clicked", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const opener = new FakeElement();
  const content = new FakeElement();
  let closed = 0;
  const gameWindow = new GameWindow({
    host, title: "Settings Menu", content, documentRef, opener,
    onClose: () => { closed += 1; },
  });

  assert.equal(gameWindow.panel.attributes.get("role"), "dialog");
  assert.equal(gameWindow.panel.attributes.get("aria-modal"), "true");
  assert.match(gameWindow.panel.attributes.get("aria-labelledby"), /^game-window-title-/);
  assert.equal(gameWindow.closeButton.focused, true);

  click(gameWindow.backdrop, gameWindow.panel);
  assert.equal(closed, 0);
  assert.equal(gameWindow.backdrop.isConnected, true);
  click(gameWindow.backdrop, gameWindow.backdrop);
  assert.equal(closed, 1);
  assert.equal(opener.focused, true);
  gameWindow.close();
  assert.equal(closed, 1);
});

test("X closes the window once and returns focus", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const opener = new FakeElement();
  const gameWindow = new GameWindow({
    host, title: "Settings Menu", content: new FakeElement(), documentRef, opener,
  });
  click(gameWindow.closeButton);
  assert.equal(gameWindow.backdrop.isConnected, false);
  assert.equal(opener.focused, true);
});

test("game window places caller buttons in the shared action area", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const action = documentRef.createElement("button");
  action.type = "button";
  action.textContent = "Action";
  const gameWindow = new GameWindow({
    host,
    title: "Settings Menu",
    content: new FakeElement(),
    buttons: [action],
    documentRef,
  });

  assert.equal(gameWindow.actions.children[0], action);
  assert.ok(!gameWindow.panel.children.includes(action));
  gameWindow.close();
});

test("settings source composes required controls, persistence, and pause lifecycle", async () => {
  const [source, main] = await Promise.all([
    readFile(new URL("../../runtime/ui/settings-ui.js", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/main.js", import.meta.url), "utf8"),
  ]);
  assert.match(source, /gear\.setAttribute\("aria-label", "Open settings"\)/);
  assert.match(source, /icon\.src = `\$\{ASSET_BASE\}ui\/tiny-swords\/Icon_10\.png`/);
  assert.match(source, /title:\s*"Settings"/);
  assert.match(source, /createMenuButton\(\{ displayText: "Developer"/);
  assert.doesNotMatch(source, /settings-items-button|createItemsUi/);
  assert.match(source, /title: "Developer"/);
  assert.match(source, /"Music", RUNTIME_AUDIO_SETTING_KEYS\.music/);
  assert.match(source, /"SFX", RUNTIME_AUDIO_SETTING_KEYS\.sfx/);
  assert.match(source, /"Physics Colliders"/);
  assert.match(source, /"Coordinates"/);
  assert.match(source, /"Enemy Perceptions"/);
  assert.match(source, /createToggleControl\(\{ labelText: "FullScreen"/);
  assert.match(source, /checkbox\.checked = Boolean\(documentRef\.fullscreenElement\)/);
  assert.match(source, /applyFullscreen\(checked, documentRef\)/);
  assert.doesNotMatch(source, /DISPLAY_SETTING_KEYS/);
  assert.match(source, /createSliderControl\(\{ labelText, value: store\.get\(key\)/);
  assert.match(source, /createMenuButton\(\{ displayText: "Clear Local Storage"/);
  assert.match(source, /createMenuButton\(\{ displayText: "Stealth & Steel"/);
  assert.match(source, /createMenuButton\(\{ displayText: "BIS"/);
  assert.match(source, /PROJECT_GITHUB_URL = "https:\/\/github\.com\/SamuelAsherRivello\/stealth-and-steel-game"/);
  assert.match(source, /openExternal\(PROJECT_GITHUB_URL, "_blank", "noopener,noreferrer"\)/);
  assert.match(source, /store\.reset\(\)/);
  assert.match(source, /pauseController\.pause\('settings'\)/);
  assert.match(source, /pauseController\.resume\('settings'\)/);
  assert.doesNotMatch(source, /Skip Start Menu/);
  assert.match(main, /settingsUi = createSettingsUi\(\{/);
  assert.match(main, /openAccount: \(\) => accountHost\.open\(\)/);
  assert.match(main, /equipmentProvider: \(\) => bisPromise/);
  assert.match(main, /onBisReset: \(\) => \{ bisSessionActive=false; \}/);
  assert.match(main, /getActiveGameSessionId: \(\) => !disposed && bisSessionActive/);
  assert.match(main, /updateSpriteAnimationManager\(animationManager, activeDelta \* 1000\)/);
  assert.match(main, /playerRecord\.actor\.update\(activeDelta, dynamicColliders\)/);
  assert.match(main, /showColliders = runtimeSettingsStore\.get\(RUNTIME_DEBUG_SETTING_KEYS\.showColliders\)/);
  assert.match(main, /marker\.setVisible\(value\)/);
  const diagnostics = main.slice(main.indexOf("const diagnosticCharacters = ["), main.indexOf('window.addEventListener("beforeunload"'));
  for (const required of ["SpawnerType.SHEEP", "SpawnerType.ENEMY", "getCombatCollider()", "getMovementCollider()", "drawDiagnostics(", "projectiles.getColliders()", "showColliders"]) {
    assert.ok(diagnostics.includes(required), `missing ${required}`);
  }
  assert.match(main, /function drawGridLines\([^)]*\)[\s\S]*rgb\(80 86 92 \/ 48%\)[\s\S]*lineWidth = 1/);
  assert.match(main, /if \(tileMapInfo\) drawGridLines\(offset\)/);
  assert.doesNotMatch(main, /DISPLAY_SETTING_KEYS|applyFullscreenPreference/);
});

test("developer settings opens above the main settings window and closes back to it", () => {
  const documentRef = createDocument();
  const host = new FakeElement();
  host.isConnected = true;
  const values = new Map();
  const store = {
    get: (key) => values.get(key) ?? (key.includes("show") ? false : 100),
    set: (key, value) => values.set(key, value),
    reset: () => values.clear(),
  };
  const pauseCalls = [];
  const settingsUi = createSettingsUi({
    host,
    pauseController: { pause: () => pauseCalls.push("pause"), resume: () => pauseCalls.push("resume") },
    store,
    documentRef,
  });

  settingsUi.open();
  const developerButton = elementByClass(settingsUi.activeWindow.panel, "developer-settings-button");
  assert.equal(developerButton.textContent, "Developer");
  click(developerButton);
  assert.match(settingsUi.developerWindow.panel.textContent, /Developer/);
  assert.equal(settingsUi.developerWindow.backdrop.classList.values.has("developer-settings-backdrop"), true);
  assert.equal(pauseCalls.join(","), "pause");

  click(settingsUi.developerWindow.closeButton);
  assert.equal(settingsUi.developerWindow, null);
  assert.equal(settingsUi.activeWindow.backdrop.isConnected, true);
  assert.equal(pauseCalls.join(","), "pause");
  click(settingsUi.activeWindow.closeButton);
  assert.equal(pauseCalls.join(","), "pause,resume");
});

test("developer settings opens both related GitHub projects above local storage reset", () => {
  const documentRef = createDocument();
  const opened = [];
  const settingsUi = createSettingsUi({
    host: new FakeElement(),
    documentRef,
    store: { get: () => 100, reset() {} },
    pauseController: { pause() {}, resume() {} },
    openExternal: (...args) => opened.push(args),
  });

  settingsUi.open();
  click(elementByClass(settingsUi.activeWindow.panel, "developer-settings-button"));
  const developerContent = elementByClass(settingsUi.developerWindow.panel, "developer-settings-controls");
  const githubButtons = settingsUi.developerWindow.actions.children.slice(0, 2);
  const resetButton = elementByClass(settingsUi.developerWindow.actions, "settings-reset");

  assert.equal(githubButtons.length, 2);
  assert.equal(githubButtons[0].textContent, "Stealth & Steel");
  assert.equal(githubButtons[1].textContent, "BIS");
  assert.equal(resetButton.textContent, "Clear Local Storage");
  click(githubButtons[0]);
  click(githubButtons[1]);
  assert.deepEqual(opened, [
    ["https://github.com/SamuelAsherRivello/stealth-and-steel-game", "_blank", "noopener,noreferrer"],
    ["https://github.com/SamuelAsherRivello/blockchain-integration-service", "_blank", "noopener,noreferrer"],
  ]);
});

test("developer action grid keeps the two top buttons at equal row geometry", async () => {
  const styles = await readFile(new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url), "utf8");
  assert.match(styles, /\.developer-settings-actions\s*\{[^}]*padding-top:\s*30px;/s);
  assert.match(styles, /\.developer-settings-actions\s*>\s*\.tiny-swords-button \+ \.tiny-swords-button\s*\{[^}]*margin-top:\s*0;/s);
  assert.match(styles, /\.developer-settings-actions\s*>\s*\.settings-reset\s*\{[^}]*grid-column:\s*1 \/ -1;/s);
});

test("settings chrome follows inspiration frame-relative measurements", async () => {
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");
  for (const selector of [
    ".settings-gear", ".game-window-backdrop",
    ".game-window-title", ".game-window-close", ".settings-controls",
    ".volume-control", ".volume-scale", ".settings-reset", ".collider-control",
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const declarations = styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
    assert.ok(declarations, `missing ${selector}`);
    // The close button uses a deliberate three-pixel inset inside the panel.
    const scalableDeclarations = selector === ".game-window-close"
      ? declarations.replace(/(?:top|right):\s*3px;/g, "")
      : declarations;
    assert.doesNotMatch(scalableDeclarations, /(?:\d|\.)(?:px|vw|vh)\b/);
  }
  assert.match(styles, /--screen-margin:\s*20px/);
  assert.match(styles, /\.settings-gear\s*\{[^}]*top:\s*var\(--ui-safe-top\);[^}]*right:\s*var\(--ui-safe-right\);[^}]*width:\s*clamp\(1\.375rem, 4cqw, 2rem\);[^}]*height:\s*clamp\(1\.375rem, 4cqw, 2rem\);[^}]*padding:\s*0\.35cqw;[^}]*border:\s*0\.175cqw solid/s);
  assert.match(styles, /\.game-window-backdrop\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;[^}]*background:\s*rgb\(0 0 0 \/ 42%\)/s);
  assert.match(styles, /\.game-window-dimmer\s*\{[^}]*inset:\s*0;[^}]*rgb\(0 0 0 \/ 20%\)/s);
  assert.match(styles, /\.developer-settings-dimmer\s*\{[^}]*background:\s*rgb\(0 0 0 \/ 20%\)/s);
  assert.match(styles, /\.menu-panel\s*\{[^}]*box-shadow:\s*5px 5px 5px rgb\(0 0 0 \/ 32\.5%\);[^}]*max-height:\s*100%;[^}]*overflow:\s*auto;/s);
});

test("Clear All Settings uses red button artwork", async () => {
  const styles = await readFile(new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url), "utf8");
  assert.match(styles, /\.settings-reset \.tiny-swords-button-art i\s*\{[^}]*filter:\s*hue-rotate\(175deg\) saturate\(2\) brightness\(\.8\);/s);
});

test("gear icon is transparent vector artwork", async () => {
  const icon = await readFile(new URL("../../../public/assets/images/ui/gear.svg", import.meta.url), "utf8");
  assert.match(icon, /viewBox="0 0 64 64"/);
  assert.doesNotMatch(icon, /<rect[^>]+(?:fill|style)=/);
});


test("Account is styled and placed immediately before Developer", () => {
  const settings = createSettingsUi({ host: new FakeElement(), documentRef: createDocument(),
    store: {get: () => 100}, pauseController: {pause() {}, resume() {}}, openAccount() {} });
  settings.open();
  const content = elementByClass(settings.activeWindow.panel, "settings-controls");
  const accountButton = elementByClass(settings.activeWindow.actions, "settings-account-button");
  const developerButton = elementByClass(settings.activeWindow.actions, "developer-settings-button");
  assert.equal(content.children.length, 3);
  assert.equal(accountButton.textContent, '⚡ Account');
  assert.equal(developerButton.textContent, 'Developer');
  assert.ok(accountButton.className.split(' ').includes('tiny-swords-button'));
  assert.ok(content.children[0].className.split(' ').includes('slider-control'));
  settings.close();
});

test("URL-muted audio is displayed as muted in Settings", () => {
  const store = createSettingsStore(null);
  applyUrlAudioMuteParameters({ search: "?muteMusic=true&muteSFX=true", store });
  const settings = createSettingsUi({ host: new FakeElement(), documentRef: createDocument(), store,
    pauseController: { pause() {}, resume() {} } });

  settings.open();
  const controls = elementByClass(settings.activeWindow.panel, "settings-controls");
  assert.equal(controls.children[0].children[1].children[0].value, "0");
  assert.equal(controls.children[1].children[1].children[0].value, "0");
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 0);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 0);
  settings.close();
});


test("Enemy Tasks control writes independently and Clear All Settings clears the checkbox", () => {
  const documentRef = createDocument(), values = new Map();
  const store = { get: key => values.get(key) ?? false, set: (key,value) => values.set(key,value), reset: () => values.clear() };
  const ui = createSettingsUi({ host: new FakeElement(), documentRef, store, pauseController: { pause() {}, resume() {} } });
  ui.open();
  click(elementByClass(ui.activeWindow.panel, "developer-settings-button"));
  const content = elementByClass(ui.developerWindow.panel, "developer-settings-controls");
  const row = content.children.find(child => child.children[0]?.textContent === 'Enemy Tasks');
  const checkbox = row.children[1];
  assert.equal(checkbox.checked, false);
  checkbox.checked = true; checkbox.dispatchEvent(new Event('change'));
  assert.equal(store.get(DEBUG_SETTING_KEYS.showEnemyAiLabels), true);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  click(elementByClass(ui.developerWindow.actions, "settings-reset"));
  assert.equal(checkbox.checked, false);
});

test('BIS reset is awaited, blocks duplicate clicks, reports failure and permits retry',async()=>{
  const documentRef=createDocument(),store=createSettingsStore(null);let calls=0,invalidate=0,finish;
  const ui=createSettingsUi({host:new FakeElement(),documentRef,store,pauseController:{pause(){},resume(){}},onBisReset:()=>invalidate++,getBis:()=>({resetForGame:()=>{calls++;return new Promise(resolve=>finish=resolve);}})});
  ui.open();click(elementByClass(ui.activeWindow.panel,'developer-settings-button'));const button=elementByClass(ui.developerWindow.actions,'settings-reset');
  click(button);click(button);assert.equal(calls,1);assert.equal(button.disabled,true);assert.equal(invalidate,1);
  finish({status:'failed',error:{code:'cleanup-failed'}});await new Promise(resolve=>setImmediate(resolve));assert.equal(button.disabled,false);assert.match(ui.developerWindow.panel.textContent,/BIS cleanup failed/);
  click(button);assert.equal(calls,2);finish({status:'completed',resetId:'two'});await new Promise(resolve=>setImmediate(resolve));assert.match(ui.developerWindow.panel.textContent,/Remote transactions are not cancelled/);ui.close();
});

test('absent BIS wallet/package does not prevent local settings reset',async()=>{
  const documentRef=createDocument(),store=createSettingsStore(null);store.set(AUDIO_SETTING_KEYS.music,15);
  const ui=createSettingsUi({host:new FakeElement(),documentRef,store,pauseController:{pause(){},resume(){}}});ui.open();click(elementByClass(ui.activeWindow.panel,'developer-settings-button'));click(elementByClass(ui.developerWindow.actions,'settings-reset'));
  await new Promise(resolve=>setImmediate(resolve));assert.equal(store.get(AUDIO_SETTING_KEYS.music),20);assert.match(ui.developerWindow.panel.textContent,/Local settings cleared/);ui.close();
});
