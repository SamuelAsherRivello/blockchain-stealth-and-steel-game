import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("start menu actions and labels stay centered in their visual containers", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /\.ui-layer \.menu-button-container\s*\{[^}]*margin:\s*auto auto 0;/s);
  assert.match(styles, /\.ui-layer \.start-game-prompt-panel \.tiny-swords-title-text\s*\{\s*transform:\s*none;/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-button\s*\{[^}]*display:\s*grid;\s*place-items:\s*center;[^}]*padding:\s*0;/s);
  assert.match(styles, /menu-button-label\s*\{[^}]*line-height:\s*1;/s);
  assert.doesNotMatch(styles, /menu-button-label\s*\{[^}]*transform:/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-panel \.menu-content-stack\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*visible;/s);
  assert.match(styles, /\.ui-layer \.start-game-prompt-panel \.menu-button-container\s*\{[^}]*margin-top:\s*10px;/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-button\s*\{[^}]*height:\s*56px;[^}]*min-height:\s*56px;[^}]*padding:\s*0;/s);
  assert.match(styles, /\.ui-layer \.menu-button-primary,\s*\.ui-layer \.menu-button-secondary\s*\{[^}]*height:\s*56px;[^}]*min-height:\s*56px;/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-button\.has-menu-icon\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto minmax\(0, 1fr\);/s);
});
