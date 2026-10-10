import test from "node:test";
import assert from "node:assert/strict";
import { createMenu, createMenuButton } from "../../runtime/ui/menu.js";

class Element extends EventTarget {
  _text = "";
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  children = [];
  attributes = new Map();
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes.set(name, value); }
}
const documentRef = { createElement: () => new Element() };

test("window title and close control share the ribbon layout", () => {
  const closeButton = documentRef.createElement("button");
  const menu = createMenu({ titleText: "Settings Menu", content: new Element(), closeButton, documentRef });
  const header = menu.headerContainer;
  assert.ok(header.className.includes("game-window-header"));
  assert.ok(menu.title.className.includes("menu-header-text"));
  assert.ok(closeButton.className.includes("menu-header-button"));
  assert.ok(header.children.includes(menu.title));
  assert.ok(header.children.includes(closeButton));
  assert.ok(!menu.panel.children.includes(closeButton));
});

test("menus accept independent content, unique accessible labels, and no logo by default", () => {
  const first = createMenu({ titleText: "Example", bodyText: "Instructions", buttons: [{displayText: "Proceed"}], documentRef });
  const second = createMenu({ titleText: "Another", bodyText: "Other instructions", documentRef });
  assert.equal(first.title.textContent, "Example");
  assert.equal(first.body.textContent, "Instructions");
  assert.equal(first.buttons[0].textContent, "Proceed");
  assert.equal(first.bodyArea.children[0], first.body);
  assert.equal(first.actions.children[0], first.buttons[0]);
  assert.ok(first.bodyArea.className.split(" ").includes("menu-body"));
  assert.ok(first.body.className.split(" ").includes("tiny-swords-body-text"));
  assert.ok(first.actions.className.split(" ").includes("menu-button-container"));
  assert.ok(first.actions.className.split(" ").includes("menu-actions"));
  assert.equal(first.logo, null);
  assert.equal(first.composition.children.length, 1);
  assert.notEqual(first.title.id, second.title.id);
  assert.equal(first.panel.attributes.get("aria-labelledby"), first.title.id);
  assert.equal(first.panel.attributes.get("aria-describedby"), first.body.id);
});

test("menus combine optional body text, custom content, and shared actions", () => {
  const content = new Element();
  content.textContent = "Controls";
  const menu = createMenu({
    titleText: "Example",
    bodyText: "Instructions",
    content,
    buttons: [{ displayText: "Accept" }, { displayText: "Cancel" }],
    documentRef,
  });

  assert.deepEqual(menu.bodyArea.children, [menu.body, content]);
  assert.deepEqual(menu.actions.children, menu.buttons);
  assert.ok(!menu.panel.children.includes(menu.buttons[0]));
  assert.equal(menu.bodyContainer.children[0], menu.bodyArea);
  assert.equal(menu.footerContainer.children[0], menu.actions);
});

test("menus can omit the visible header while retaining an accessible name", () => {
  const menu = createMenu({
    showHeader: false,
    titleText: "Hidden Title",
    bodyText: "Body",
    documentRef,
  });

  assert.equal(menu.header, null);
  assert.equal(menu.title, null);
  assert.equal(menu.panel.attributes.get("aria-label"), "Hidden Title");
  assert.equal(menu.panel.children[0], menu.contentStack);
});

test("a menu can explicitly opt into a logo without changing other instances", () => {
  const menu = createMenu({
    titleText: "Start Menu",
    bodyText: "Use bushes to hide.",
    showLogo: true,
    logoSrc: "/logo.png",
    logoAlt: "Game",
    documentRef,
  });
  assert.equal(menu.logo.src, "/logo.png");
  assert.equal(menu.logo.alt, "Game");
  assert.equal(menu.composition.children[0], menu.logo);
  assert.equal(menu.composition.children[1], menu.panel);
});

test("reusable buttons retain caller text and native action events", () => {
  const button = createMenuButton({ displayText: "Reset", documentRef });
  let clicks = 0;
  button.addEventListener("click", () => clicks++);
  button.dispatchEvent(new Event("click"));
  assert.equal(button.type, "button");
  assert.equal(button.textContent, "Reset");
  assert.equal(clicks, 1);
  assert.equal(button.children[1].attributes.get("aria-hidden"), "true");
});
