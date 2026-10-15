import assert from "node:assert/strict";
import test from "node:test";
import { createLevelCounterUi, formatLevelCounterText } from "../../runtime/ui/level-counter-ui.js";

test("level counter uses the requested level format", () => {
  assert.equal(formatLevelCounterText(1, 3), "Level: 1/3");
  const elements = [];
  const host = { append: element => elements.push(element) };
  createLevelCounterUi({ host, level: 1, total: 3, documentRef: { createElement: () => ({ className: "", textContent: "" }) } });
  assert.equal(elements[0].textContent, "Level: 1/3");
});
