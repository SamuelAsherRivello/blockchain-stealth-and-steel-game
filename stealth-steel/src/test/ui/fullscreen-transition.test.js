import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createFullscreenTransition } from "../../runtime/ui/fullscreen-transition.js";

function createFrameClock() {
  let now = 0;
  const frames = [];
  return {
    now: () => now,
    requestFrame(callback) { frames.push(callback); return frames.length; },
    cancelFrame() {},
    step(nextNow) {
      now = nextNow;
      frames.shift()?.(now);
    },
  };
}

test("fullscreen transition reveals from black and returns to black over 250ms", async () => {
  const clock = createFrameClock();
  const overlay = { hidden: false, style: {} };
  const circle = { attributes: new Map(), setAttribute(name, value) { this.attributes.set(name, String(value)); } };
  const blackout = { attributes: new Map(), setAttribute(name, value) { this.attributes.set(name, String(value)); } };
  const target = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 576, height: 1024 }) };
  const transition = createFullscreenTransition({
    target,
    overlay,
    circle,
    blackout,
    ...clock,
  });

  assert.equal(circle.attributes.get("r"), "0", "startup is fully black");
  assert.match(blackout.attributes.get("d"), /M0 0H576V1024H0Z/, "the blackout path spans the entire viewport");
  const opening = transition.reveal();
  clock.step(0);
  clock.step(125);
  assert.equal(circle.attributes.get("r"), "294", "opening is halfway through the radius");
  clock.step(250);
  await opening;
  assert.equal(overlay.hidden, true, "a fully open transition no longer intercepts input");

  const closing = transition.cover();
  clock.step(250);
  clock.step(375);
  assert.equal(circle.attributes.get("r"), "294", "closing is halfway through the radius");
  clock.step(500);
  await closing;
  assert.equal(overlay.hidden, false, "the covered screen remains black until the next reveal");
  assert.equal(circle.attributes.get("r"), "0");
});

test("fullscreen transition CSS leaves sizing and placement to its target div", async () => {
  const styles = await readFile(new URL("../../runtime/ui/style.css", import.meta.url), "utf8");
  const transition = styles.match(/\.fullscreen-transition\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(transition, /position:\s*fixed;/);
  assert.match(transition, /overflow:\s*hidden;/);
  assert.doesNotMatch(transition, /width:/);
  assert.doesNotMatch(transition, /height:/);
});

test("fullscreen transition crops itself to its supplied target div", () => {
  const target = { getBoundingClientRect: () => ({ left: 120, top: 32, width: 576, height: 1024 }) };
  const overlay = { hidden: false, style: {}, setAttribute() {} };
  const circle = { setAttribute() {} };
  const blackout = { setAttribute() {} };

  createFullscreenTransition({ target, overlay, circle, blackout });

  assert.equal(overlay.style.left, "120px");
  assert.equal(overlay.style.top, "32px");
  assert.equal(overlay.style.width, "576px");
  assert.equal(overlay.style.height, "1024px");
});
