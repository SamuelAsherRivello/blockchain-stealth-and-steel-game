import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the Tiny Swords close control uses the supplied centered PNG artwork", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(
    styles,
    /\.ui-layer \.game-window \.game-window-close\s*\{[^}]*position:\s*static;[^}]*transform:\s*translate\(-25px, -15px\);[^}]*background:\s*url\('\/ui\/tiny-swords\/Icon_09\.png'\) center \/ 19\.2px 19\.2px no-repeat;[^}]*image-rendering:\s*pixelated;/s,
  );
  assert.match(
    styles,
    /\.ui-layer \.game-window \.game-window-close::before,\s*\.ui-layer \.game-window \.game-window-close::after\s*\{[^}]*display:\s*none;/s,
  );
});
