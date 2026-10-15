import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("outcome menus give the paper and action stack their own readable footprint", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /\.ui-layer \.menu-content-stack\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*padding:\s*var\(--menu-paper-content-inset\);/s);
  assert.match(styles, /\.ui-layer \.level-complete-panel\.outcome-loss \.menu-button-container\s*\{[^}]*width:\s*100%;/s);
  assert.doesNotMatch(styles, /level-complete-panel \.menu-actions > \.menu-action-button/);
});
