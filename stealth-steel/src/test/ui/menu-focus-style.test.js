import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("menu controls never draw a focus outline", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(
    styles,
    /\.ui-layer \.menu-surface input:focus-visible,[\s\S]*?\.game-window-close:focus-visible\s*\{[^}]*outline:\s*none;/,
  );
  assert.match(
    styles,
    /\.ui-layer \.menu-action-button:focus-visible\s*\{[^}]*outline:\s*none;/,
  );
});
