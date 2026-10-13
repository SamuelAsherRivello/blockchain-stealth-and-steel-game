import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("shared menus make the parchment stack a padded flex column", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /--menu-content-min-height:\s*min\(325px, 25dvh\);/);
  assert.match(styles, /--menu-paper-edge-inline:\s*5%;/);
  assert.match(styles, /--menu-paper-content-inset:\s*12px;/);
  assert.match(styles, /\.ui-layer \.tiny-swords-panel\s*\{[^}]*height:\s*auto;[^}]*flex:\s*0 0 auto;/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-panel\s*\{[^}]*padding:\s*var\(--menu-paper-top\) var\(--menu-paper-edge-inline\) 0;/s);
  assert.match(styles, /\.ui-layer \.menu-content-stack\s*\{[^}]*min-height:\s*var\(--menu-content-min-height\);[^}]*flex:\s*1 1 auto;[^}]*padding:\s*var\(--menu-paper-content-inset\);/s);
  assert.match(styles, /\.ui-layer \.body-container\s*\{[^}]*flex:\s*1 1 auto;/s);
  assert.match(styles, /\.ui-layer \.footer-container\s*\{[^}]*flex:\s*0 0 auto;/s);
  assert.match(styles, /\.ui-layer \.menu-button-container:empty\s*\{\s*display:\s*none;/);
  assert.match(styles, /\.ui-layer \.footer-container:has\(\.menu-button-container:empty\)\s*\{[^}]*height:\s*0;/s);
  assert.doesNotMatch(styles, /\.tiny-swords-menu-composition\s*\{[^}]*height:/s);
});
