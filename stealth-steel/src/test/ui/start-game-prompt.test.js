import test from "node:test";
import assert from "node:assert/strict";
import { createStartGamePrompt, shouldShowStartGamePrompt, shouldSkipIntro, START_PROMPT_BODY } from "../../runtime/ui/start-game-prompt.js";

class FakeElement extends EventTarget {
  style = {};
  _text = "";
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  children = [];
  attributes = new Map();
  parentNode = null;
  focused = false;
  append(...children) { for (const child of children) { child.parentNode = this; this.children.push(child); } }
  remove() { this.parentNode?.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  focus() { this.focused = true; }
}

const documentRef = { createElement: () => new FakeElement() };
const click = (element, eventTarget = element) => {
  const event = new Event("click", { bubbles: true });
  Object.defineProperty(event, "target", { value: eventTarget });
  element.dispatchEvent(event);
};

test("start prompt is enabled by default and can be suppressed", () => {
  assert.equal(shouldShowStartGamePrompt(), true);
  assert.equal(shouldShowStartGamePrompt({ showStartPrompt: true }), true);
  assert.equal(shouldShowStartGamePrompt({ showStartPrompt: false }), false);
});

test("skipIntro is enabled only for the exact development query flag", () => {
  assert.equal(shouldSkipIntro({ isDevelopment: true, search: "?skipIntro=true" }), true);
  assert.equal(shouldSkipIntro({ isDevelopment: true, search: "?skipIntro=false" }), false);
  assert.equal(shouldSkipIntro({ isDevelopment: false, search: "?skipIntro=true" }), false);
});

test("start prompt requires its Start button and ignores background clicks", () => {
  const host = new FakeElement();
  let starts = 0;
  const prompt = createStartGamePrompt({ host, onStart: () => { starts += 1; }, documentRef });
  assert.match(prompt.panel.textContent, new RegExp(`Welcome${START_PROMPT_BODY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.equal(prompt.startButton.textContent, "Start Game");
  assert.ok(prompt.panel.children.length >= 1);
  assert.equal(prompt.backdrop.children[0].children[0].alt, "Stealth & Steel");
  assert.equal(prompt.startButton.focused, true);
  click(prompt.backdrop, prompt.panel);
  assert.equal(host.children.length, 1);
  assert.equal(starts, 0);
  click(prompt.startButton);
  click(prompt.backdrop);
  assert.equal(starts, 1);
  assert.equal(host.children.length, 0);
  const secondPrompt = createStartGamePrompt({ host, onStart: () => {}, documentRef });
  click(secondPrompt.backdrop, secondPrompt.panel);
  assert.equal(host.children.length, 1);
  click(secondPrompt.backdrop);
  assert.equal(host.children.length, 1);
  secondPrompt.close();
});

test("supported start prompt places bolt Items below Start and enables it only for an active player", () => {
  const host = new FakeElement();
  let opens = 0;
  const prompt = createStartGamePrompt({ host, onStart: () => {}, onItems: () => opens++, itemsVisible: true, itemsEnabled: false, documentRef });
  assert.equal(prompt.startButton.textContent, "Start Game");
  assert.equal(prompt.itemsButton.textContent, "⚡View Items");
  assert.equal(prompt.itemsButton.disabled, true);
  prompt.setItemsEnabled(true);
  assert.equal(prompt.itemsButton.disabled, false);
  click(prompt.itemsButton);
  assert.equal(opens, 1);
  assert.equal(host.children.length, 1);
  prompt.close();
});

test("unsupported start prompt contains only Start and does not create a deferred Items action", () => {
  const host = new FakeElement();
  const prompt = createStartGamePrompt({ host, onStart: () => {}, itemsVisible: false, itemsEnabled: false, documentRef });
  assert.equal(prompt.itemsButton, null);
  prompt.setItemsSupported(true);
  prompt.setItemsEnabled(true);
  assert.equal(prompt.itemsButton, null);
  prompt.setItemsSupported(false);
  prompt.close();
});

test("start prompt blocks keyboard button activation", () => {
  const host = new FakeElement();
  let starts = 0;
  const prompt = createStartGamePrompt({ host, onStart: () => starts++, documentRef });
  for (const type of ["keydown", "keyup"]) {
    for (const key of ["Enter", " "]) {
      const event = new Event(type, { cancelable: true, bubbles: true });
      Object.defineProperty(event, "key", { value: key });
      prompt.backdrop.dispatchEvent(event);
      assert.equal(event.defaultPrevented, true, `${type} ${key} must not activate Start`);
    }
  }
  assert.equal(starts, 0);
  assert.equal(host.children.length, 1);
  click(prompt.startButton);
  assert.equal(starts, 1);
  assert.equal(host.children.length, 0);
});
