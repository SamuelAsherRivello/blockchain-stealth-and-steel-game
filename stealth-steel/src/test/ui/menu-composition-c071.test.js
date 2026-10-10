import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMenu } from "../../runtime/ui/menu.js";

class Element extends EventTarget {
  _text = "";
  children = [];
  attributes = new Map();
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent ?? "").join(""); }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes.set(name, value); }
}

const documentRef = { createElement: () => new Element() };

test("C071 keeps header, body, and footer in one non-scrolling menu stack", () => {
  const menu = createMenu({
    titleText: "Developer",
    bodyText: "Shared body copy",
    buttons: [{ displayText: "Open GitHub" }],
    documentRef,
  });

  const contentStack = menu.contentStack;
  assert.ok(contentStack.className.split(" ").includes("menu-content-stack"));
  assert.deepEqual(contentStack.children, [menu.headerContainer, menu.bodyContainer, menu.footerContainer]);
  assert.equal(menu.bodyContainer.children[0], menu.bodyArea);
  assert.equal(menu.footerContainer.children[0], menu.actions);
  assert.equal(menu.scrollContent, undefined);
});

test("C071 reserves one toast footprint and anchors logo and ribbon variants from it", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /--menu-toast-bottom:\s*9dvh;/);
  assert.match(styles, /--menu-toast-offset:\s*15px;/);
  assert.match(styles, /--menu-first-visible-top:\s*calc\(var\(--menu-toast-bottom\) \+ var\(--menu-toast-offset\)\);/);
  assert.match(styles, /tiny-swords-menu-backdrop\.has-logo\s*\{[^}]*padding:\s*var\(--menu-first-visible-top\)/s);
  assert.match(styles, /tiny-swords-menu-backdrop:not\(\.has-logo\)\s*\{[^}]*padding:\s*calc\(var\(--menu-first-visible-top\) \+ var\(--menu-ribbon-overhang\)\)/s);
  assert.doesNotMatch(styles, /tiny-swords-menu-backdrop:not\(\.has-logo\) > \.tiny-swords-menu-composition\s*\{\s*margin:\s*auto;/s);
});

test("C071 uses one complete explicit prose style without outcome overrides", async () => {
  const [styles, outcomes] = await Promise.all([
    readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
    ),
    readFile(new URL("../../runtime/ui/level-complete-ui.js", import.meta.url), "utf8"),
  ]);
  const treasure = await readFile(
    new URL("../../runtime/ui/treasure-ui.js", import.meta.url),
    "utf8",
  );

  assert.match(styles, /\.ui-layer \.tiny-swords-body-text\s*\{/);
  assert.match(styles, /\.ui-layer \.tiny-swords-body-text\s*\{[^}]*font:\s*22px\/1\.6 Georgia, serif;[^}]*margin:\s*0 0 10px;[^}]*color:\s*#513d2a;[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;[^}]*text-align:\s*center;/s);
  assert.doesNotMatch(styles, /\.ui-layer \.menu-body p,/);
  assert.doesNotMatch(styles, /\.outcome-(?:loss|win) \.tiny-swords-body-text/);
  assert.match(treasure, /message\.className\s*=\s*['"]tiny-swords-body-text treasure-message['"]/);
  assert.match(treasure, /countdown\.className\s*=\s*['"]tiny-swords-body-text treasure-countdown['"]/);
  assert.match(outcomes, /bodyText:/);
});

test("C071 applies compact shared section, form, and action rhythm without changing Map sub-buttons", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /--menu-action-gap:\s*4\.8px;/);
  assert.match(styles, /--menu-section-following-gap:\s*2\.4px;/);
  assert.match(styles, /--menu-form-item-gap:\s*3\.6px;/);
  assert.match(styles, /--menu-final-action-bottom:\s*8px;/);
  assert.match(styles, /\.ui-layer \.menu-button-container\s*\{[^}]*gap:\s*var\(--menu-action-gap\);/s);
  assert.doesNotMatch(styles, /menu-action-visual-overlap/);
  assert.match(styles, /\.ui-layer \.menu-content-stack\s*\{[^}]*overflow:\s*clip;[^}]*padding-bottom:\s*var\(--menu-final-action-bottom\);/s);
  assert.match(styles, /\.ui-layer \.game-window \.settings-controls\s*\{[^}]*gap:\s*var\(--menu-form-item-gap\);/s);
  assert.match(styles, /\.ui-layer \.debug-visualizations-heading\s*\{[^}]*margin:\s*0 0 var\(--menu-section-following-gap\);/s);
  assert.match(styles, /\.ui-layer \.debug-visualizations-heading ~ \.toggle-control,\s*\.ui-layer \.map-order-heading \+ \.map-order-buttons\s*\{[^}]*margin-left:\s*20px;/s);
  assert.match(styles, /\.map-order-buttons\s*\{[^}]*gap:\s*8px;/s);
});

test("C071 title labels retain a shared one-line ribbon treatment", async () => {
  const [styles, menu, titleLabel] = await Promise.all([
    readFile(new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/menu.js", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/menu-title-label.js", import.meta.url), "utf8"),
  ]);

  assert.match(styles, /font:\s*bold clamp\(36px, 8cqw, 52px\)\/1\.1 Georgia, serif;/);
  assert.match(styles, /--menu-ribbon-title-safe-inset:\s*72px;/);
  assert.match(styles, /\.ui-layer \.tiny-swords-title-text\s*\{[^}]*display:\s*grid;[^}]*place-items:\s*center;/s);
  assert.match(styles, /tiny-swords-title-text[^}]*white-space:\s*nowrap;/s);
  assert.match(menu, /title\.menuTitleLabel\s*=\s*label/);
  assert.match(titleLabel, /this\.style\.removeProperty\("font-size"\)/);
  assert.match(titleLabel, /new ResizeObserver\(this\.fit\)/);
  assert.doesNotMatch(titleLabel, /this\.style\.fontSize/);
});

test("C071 removes every menu scrollbar at the shared layout boundary", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(styles, /menu-scroll-content/);
  assert.match(styles, /\.ui-layer \.tiny-swords-menu-backdrop\s*\{[^}]*overflow:\s*clip;/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-menu-backdrop\.has-logo\s*\{[^}]*overflow:\s*clip;/s);
});

test("C071 keeps the 44px close target with its supplied PNG", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /grid-template-columns:\s*44px minmax\(0, 1fr\) 44px;/);
  assert.match(styles, /\.ui-layer \.game-window \.game-window-close\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
  assert.match(styles, /background:\s*url\('\/ui\/tiny-swords\/Icon_09\.png'\) center \/ 19\.2px 19\.2px no-repeat;/);
  assert.match(styles, /image-rendering:\s*pixelated;/);
});

test("C084 gives closable menus explicit header text and button regions", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );
  const menu = createMenu({
    titleText: "Developer",
    closeButton: documentRef.createElement("button"),
    documentRef,
  });
  const closeButton = menu.header.children.find(child => child !== menu.title);

  assert.ok(menu.header.className.includes("game-window-header"));
  assert.ok(menu.title.className.includes("menu-header-text"));
  assert.ok(closeButton.className.includes("menu-header-button"));
  assert.match(styles, /\.ui-layer \.game-window \.title-container\s*\{[^}]*align-items:\s*center;/s);
  assert.match(styles, /\.ui-layer \.game-window \.title-container \.title-text\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*1;/s);
  assert.match(styles, /\.ui-layer \.game-window \.title-container \.close-button\s*\{[^}]*grid-column:\s*3;[^}]*grid-row:\s*1;[^}]*align-self:\s*center;/s);
});

test("C071 removes lightning only from BIS toast messaging", async () => {
  const [accountStyles, settings, outcomes] = await Promise.all([
    readFile(new URL("../../runtime/integration/bis-account.css", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/settings-ui.js", import.meta.url), "utf8"),
    readFile(new URL("../../runtime/ui/level-complete-ui.js", import.meta.url), "utf8"),
  ]);

  assert.match(accountStyles, /\.game-account-host \.bis-toast-lightning\s*\{\s*display:\s*none;\s*\}/);
  assert.match(settings, /displayText:\s*["']⚡ Account["']/);
  assert.match(outcomes, /icon:["']⚡["']/);
});
