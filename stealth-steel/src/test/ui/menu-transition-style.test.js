import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const stylePath = new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url);

test("the shared menu theme defines BIS-style enter, exit, and reduced-motion animation", async () => {
  const style = await readFile(stylePath, "utf8");
  assert.match(style, /--menu-transition-duration: 100ms/);
  assert.match(style, /--menu-transition-from-scale: 0\.8/);
  assert.match(style, /menu-transition-enter \{\s*animation: menu-backdrop-enter/);
  assert.match(style, /menu-transition-exit \{\s*pointer-events: none;\s*animation: menu-backdrop-exit/);
  assert.match(style, /@keyframes menu-enter \{[\s\S]*?opacity: 0; transform: scale\(var\(--menu-transition-from-scale\)\)/);
  assert.match(style, /@keyframes menu-exit \{[\s\S]*?opacity: 0; transform: scale\(var\(--menu-transition-from-scale\)\)/);
  assert.match(style, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation: none/);
});
