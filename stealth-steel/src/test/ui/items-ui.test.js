import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createItemsUi } from "../../runtime/ui/items-ui.js";

class Element extends EventTarget {
  _text = "";
  children = [];
  attributes = new Map();
  dataset = {};
  parentNode = null;
  isConnected = false;
  className = "";
  hidden = false;
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  append(...children) { for (const child of children) { child.parentNode = this; child.isConnected = this.isConnected; this.children.push(child); } }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  focus() {}
  remove() { this.parentNode?.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
}

const find = (root, predicate) => {
  const pending = [root];
  while (pending.length) {
    const current = pending.shift();
    if (predicate(current)) return current;
    pending.push(...current.children);
  }
  assert.fail("Expected matching element");
};
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const item = (assetId, family, name, priceSats, effectPercent) => ({ assetId, family, name, priceSats, attributeDeltas: [{ bisAttribute: family === "Shoes" ? "movementSpeed" : family === "Dagger" ? "playerDamage" : "damageTaken", bisAttributeDelta: effectPercent }], iconUrl: `https://chain.example/${assetId}.png` });

test("Items renders a non-scrolling square nine-card grid with the required instruction and unmistakable selected state", async () => {
  const ownedItems = [
    item("shoes-1", "Shoes", "Shoes I", 1000, 10),
    item("shoes-2", "Shoes", "Shoes II", 2000, 20),
    item("shoes-3", "Shoes", "Shoes III", 3000, 30),
    item("dagger-1", "Dagger", "Dagger I", 1100, 10),
    item("dagger-2", "Dagger", "Dagger II", 2100, 20),
    item("dagger-3", "Dagger", "Dagger III", 3100, 30),
    item("shield-1", "Shield", "Shield I", 1200, 10),
    item("shield-2", "Shield", "Shield II", 2200, 20),
    item("shield-3", "Shield", "Shield III", 3200, 30),
  ];
  let state = { status: "ready", profileId: "player", ownedItems, effective: { Shoes: ownedItems[0] } };
  const changes = [];
  const loadingCalls = [];
  const equipmentCalls = [];
  const equipment = {
    showLoadingUI() { loadingCalls.push("show"); },
    hideLoadingUI() { loadingCalls.push("hide"); },
    async refreshEquipmentAsync() { return state; },
    async selectEquipmentAsync(assetId, options) { equipmentCalls.push(["select", assetId, options]); const selected = ownedItems.find(candidate => candidate.assetId === assetId); state = { ...state, effective: { ...state.effective, [selected.family]: selected } }; return state; },
    async clearEquipmentAsync(family, options) { equipmentCalls.push(["clear", family, options]); const effective = { ...state.effective }; delete effective[family]; state = { ...state, effective }; return state; },
  };
  const documentRef = { createElement: () => new Element() };
  const ui = createItemsUi({ host: new Element(), opener: new Element(), equipmentProvider: async () => equipment,
    onState: next => changes.push(next), documentRef });
  assert.equal(ui.window.backdrop.hidden, true);
  assert.equal(ui.content.children[0].textContent, "");
  await flush();

  assert.deepEqual(loadingCalls, ["show", "hide"]);
  assert.equal(ui.window.backdrop.hidden, false);
  assert.match(ui.window.panel.className, /tiny-swords-panel/);
  assert.match(ui.window.panel.className, /game-window/);
  assert.doesNotMatch(ui.window.panel.className, /items-window/);
  assert.equal(ui.content.children[0].textContent, "Click item to toggle activation.");
  assert.equal(ui.content.children[1].dataset.layout, "3x3");
  assert.equal(ui.content.children[1].children.length, 9);
  const initialShoes = find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-1");
  assert.equal(initialShoes.type, "button");
  assert.equal(initialShoes.getAttribute("aria-pressed"), "true");
  assert.match(initialShoes.className, /is-selected/);
  assert.equal(initialShoes.children[0].children[0].src, "https://chain.example/shoes-1.png");
  assert.equal(initialShoes.children[1].children[0].textContent, "Shoes I");
  assert.equal(initialShoes.children[1].children[1].textContent, "1,000 sats");
  assert.deepEqual(initialShoes.children[2].children.map(stat => stat.textContent), ["Speed+10%", "Offense0%", "Defense0%"]);

  const shoesTwo = find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-2");
  shoesTwo.dispatchEvent(new Event("click"));
  await flush();
  const selectedShoes = find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-2");
  assert.equal(selectedShoes.getAttribute("aria-pressed"), "true");

  selectedShoes.dispatchEvent(new Event("click"));
  await flush();
  assert.equal(find(ui.content, node => node.getAttribute?.("data-asset-id") === "shoes-2").getAttribute("aria-pressed"), "false");
  assert.deepEqual(equipmentCalls, [
    ["select", "shoes-2", { skipOwnershipCheck: true }],
    ["clear", "Shoes", { skipOwnershipCheck: true }],
  ]);
  assert.equal(changes.length, 3);
});

test("Items gives a two-item inventory two large portrait cards instead of reserving empty columns", async () => {
  const ownedItems = [
    item("dagger-2", "Dagger", "Dagger II", 1100, 10),
    item("shield-3", "Shield", "Shield III", 3200, 30),
  ];
  const state = { status: "ready", profileId: "player", ownedItems, effective: {} };
  const equipment = { refreshEquipmentAsync: async () => state };
  const documentRef = { createElement: () => new Element() };
  const ui = createItemsUi({ host: new Element(), opener: new Element(), equipmentProvider: async () => equipment,
    documentRef });
  await flush();

  assert.equal(ui.content.children[1].dataset.layout, "1x2");
  assert.equal(ui.content.children[1].children.length, 2);
});

test("Items explains when BIS is ready and the player owns no items", async () => {
  const equipment = { refreshEquipmentAsync: async () => ({ status: "ready", profileId: "player", ownedItems: [], effective: {} }) };
  const documentRef = { createElement: () => new Element() };
  const ui = createItemsUi({ host: new Element(), opener: new Element(), equipmentProvider: async () => equipment,
    documentRef });
  await flush();

  assert.equal(ui.content.children[0].textContent, "You have no items.");
});

test("Items does not override the shared menu with desktop viewport dimensions", async () => {
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");
  const itemsWindowRules = styles.match(/\.ui-layer \.menu-panel\.items-window\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.doesNotMatch(itemsWindowRules, /(?:100vw|100dvh|70rem|dvh|vw)/);
});

test("Items plays the activation sound for every successful selection but remains silent when deactivating", async () => {
  const ownedItems = [item("dagger-2", "Dagger", "Dagger II", 1100, 10)];
  let state = { status: "ready", profileId: "player", ownedItems, effective: {} };
  const plays = [];
  const equipment = {
    async refreshEquipmentAsync() { return state; },
    async selectEquipmentAsync(assetId) { state = { ...state, effective: { Dagger: ownedItems.find(item => item.assetId === assetId) } }; return state; },
    async clearEquipmentAsync() { state = { ...state, effective: {} }; return state; },
  };
  const documentRef = { createElement: () => new Element() };
  const ui = createItemsUi({ host: new Element(), opener: new Element(), equipmentProvider: async () => equipment,
    play: name => plays.push(name), documentRef });
  await flush();

  let dagger = find(ui.content, node => node.getAttribute?.("data-asset-id") === "dagger-2");
  dagger.dispatchEvent(new Event("click"));
  await flush();
  dagger = find(ui.content, node => node.getAttribute?.("data-asset-id") === "dagger-2");
  dagger.dispatchEvent(new Event("click"));
  await flush();

  assert.deepEqual(plays, ["activate"]);
});

test("Items keeps the BIS loading overlay hidden while activation is pending", async () => {
  const ownedItems = [item("dagger-2", "Dagger", "Dagger II", 1100, 10)];
  let resolveSelection;
  const selection = new Promise(resolve => { resolveSelection = resolve; });
  const loadingCalls = [];
  const equipment = {
    async refreshEquipmentAsync() { return { status: "ready", profileId: "player", ownedItems, effective: {} }; },
    selectEquipmentAsync(assetId, options) { assert.equal(assetId, "dagger-2"); assert.deepEqual(options, { skipOwnershipCheck: true }); return selection; },
    showLoadingUI() { loadingCalls.push("show"); },
    hideLoadingUI() { loadingCalls.push("hide"); },
  };
  const documentRef = { createElement: () => new Element() };
  const ui = createItemsUi({ host: new Element(), opener: new Element(), equipmentProvider: async () => equipment, documentRef });
  await flush();

  const dagger = find(ui.content, node => node.getAttribute?.("data-asset-id") === "dagger-2");
  dagger.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(loadingCalls, ["show", "hide"]);

  resolveSelection({ status: "ready", profileId: "player", ownedItems, effective: { Dagger: ownedItems[0] } });
  await flush();
  assert.deepEqual(loadingCalls, ["show", "hide"]);
});
