import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../../../../", import.meta.url);

test("archer shares the renderer animation lifecycle", async () => {
  const source = await readFile(new URL("stealth-steel/src/runtime/characters/shared-character-visual.js", ROOT), "utf8");

  assert.match(source, /stopSpriteAnimation\(activeAnimation\)/);
  assert.match(source, /playSprite2DAnimation\(/);
});
