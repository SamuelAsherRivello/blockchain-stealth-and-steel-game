import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("portrait frame always fills the visible viewport height first", async () => {
  const html = await readFile(new URL("../../../index.html", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");
  const stage = styles.match(/\.stage\s*\{([^}]*)\}/s)?.[1] ?? "";
  const frame = styles.match(/\.game-frame\s*\{([^}]*)\}/s)?.[1] ?? "";
  const page = styles.match(/html,\s*body\s*\{([^}]*)\}/s)?.[1] ?? "";
  const uiLayer = styles.match(/\.ui-layer\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(page, /width:\s*100%;/);
  assert.match(page, /min-width:\s*0;/);
  assert.match(stage, /min-height:\s*100dvh;/);
  assert.match(stage, /min-width:\s*0;/);
  assert.match(stage, /grid-template-columns:\s*minmax\(0,\s*1fr\);/);
  assert.match(frame, /width:\s*56\.25dvh;/);
  assert.match(frame, /min-width:\s*0;/);
  assert.match(uiLayer, /min-width:\s*0;/);
  assert.match(styles, /#renderCanvas,\s*\n#debugCanvas\s*\{[^}]*min-width:\s*0;/s);
  assert.match(frame, /height:\s*100dvh;/);
  assert.doesNotMatch(frame, /width:\s*min\(/);
  assert.doesNotMatch(frame, /height:\s*min\(/);
  assert.match(frame, /aspect-ratio:\s*9\s*\/\s*16;/);
  assert.match(html, /content="width=device-width, initial-scale=1\.0, viewport-fit=cover"/);
});

test("world crop and viewport-safe UI use independent sibling layers", async () => {
  const html = await readFile(new URL("../../../index.html", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");
  const uiLayer = styles.match(/\.ui-layer\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(html, /<div class="game-frame">[\s\S]*?<\/div>\s*<div id="uiLayer" class="ui-layer">/);
  assert.match(uiLayer, /position:\s*fixed;/);
  assert.match(uiLayer, /container-type:\s*inline-size;/);
  assert.match(uiLayer, /pointer-events:\s*none;/);
  assert.match(styles, /--ui-safe-top:\s*calc\(env\(safe-area-inset-top, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /--ui-safe-right:\s*calc\(env\(safe-area-inset-right, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /--ui-safe-bottom:\s*calc\(env\(safe-area-inset-bottom, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /--ui-safe-left:\s*calc\(env\(safe-area-inset-left, 0px\) \+ var\(--screen-margin\)\);/);
  assert.match(styles, /\.ui-layer:not\(\.is-viewport-ready\)\s*\{[^}]*visibility:\s*hidden;/s);
  assert.match(styles, /\.ui-layer\.is-viewport-ready\s*\{[^}]*visibility:\s*visible;/s);
});

test("menu backdrops stay inside the portrait game frame instead of covering desktop gutters", async () => {
  const styles = await readFile(new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url), "utf8");
  const backdrop = styles.match(/\.ui-layer \.menu-backdrop-surface\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(backdrop, /position:\s*fixed;/);
  assert.doesNotMatch(backdrop, /inset:\s*0;/);
});

test("every modal receives the game frame used for its fixed backdrop bounds", async () => {
  const main = await readFile(new URL("../../runtime/main.js", import.meta.url), "utf8");

  assert.match(main, /createTreasureUi\(\{host:domBody,screenLayer:domScreen,frameElement:gameFrame/);
  assert.match(main, /host: gameUi, modalHost: domBody, screenLayer: domScreen, frameElement: gameFrame/);
  assert.match(main, /createItemsUi\(\{\s*host: domBody,[\s\S]*?frameElement: gameFrame,/);
  assert.match(main, /createLevelCompleteUi\(\{host:domBody,[\s\S]*?frameElement:gameFrame/);
  assert.match(main, /createLevelLostUi\(\{host:domBody,[\s\S]*?frameElement:gameFrame/);
  assert.match(main, /createStartGamePrompt\(\{\s*host: domBody,[\s\S]*?frameElement: gameFrame,/);
});

test("desktop letterbox presentation stays outside the game and mobile UI", async () => {
  const html = await readFile(new URL("../../../index.html", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");
  const frame = styles.match(/\.game-frame\s*\{([^}]*)\}/s)?.[1] ?? "";
  const presentation = styles.match(/\.letterbox-presentation\s*\{([^}]*)\}/s)?.[1] ?? "";
  const rail = styles.match(/\.letterbox-presentation__rail\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(html, /<div class="letterbox-presentation" aria-hidden="true">/);
  assert.match(html, /letterbox-presentation[\s\S]*?<\/div>\s*<div class="game-frame">/);
  assert.match(presentation, /position:\s*absolute;/);
  assert.match(presentation, /inset:\s*0;/);
  assert.match(presentation, /pointer-events:\s*none;/);
  assert.match(presentation, /z-index:\s*0;/);
  assert.match(frame, /z-index:\s*1;/);
  assert.match(rail, /position:\s*absolute;/);
  assert.match(rail, /top:\s*0;/);
  assert.match(rail, /bottom:\s*0;/);
  assert.match(styles, /forest-gate-backdrop-v2\.png/);
  assert.match(styles, /\.letterbox-presentation__rail::before\s*\{[^}]*forest-gate-rail\.png/s);
  assert.match(styles, /\.letterbox-presentation__rail--left::before\s*\{[^}]*transform:\s*scaleX\(-1\);/s);
  assert.match(styles, /\.letterbox-presentation__rail--left\s*\{[^}]*-30px\s+0\s+30px/s);
  assert.match(styles, /\.letterbox-presentation__rail--right\s*\{[^}]*30px\s+0\s+30px/s);
  assert.match(styles, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
  assert.match(styles, /@media[\s\S]*?\.letterbox-presentation\s*\{[^}]*display:\s*block;/);
});

test("collider diagnostics stay above the game render canvas", async () => {
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");

  assert.match(styles, /#debugCanvas\s*\{[^}]*z-index:\s*2;/s);
});
