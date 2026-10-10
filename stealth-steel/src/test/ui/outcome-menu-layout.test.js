import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("outcome menus give the paper and action stack their own readable footprint", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /\.ui-layer \.level-complete-panel \.menu-content-stack\s*\{[^}]*padding-bottom:\s*28px;[^}]*min-height:\s*0;/s);
  assert.match(styles, /\.ui-layer \.level-complete-panel \.menu-button-container\s*\{[^}]*margin-top:\s*18px;/s);
  assert.doesNotMatch(styles, /level-complete-panel \.menu-actions > \.tiny-swords-button/);
});
