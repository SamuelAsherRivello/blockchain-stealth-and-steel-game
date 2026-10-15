import test from "node:test";
import assert from "node:assert/strict";
import { createGoalExit } from "../../../runtime/systems/goals/goal-exit.js";

test("goal exit tweens position, 45 degree rotation and opacity over 0.25 seconds", () => {
  let position = { x: 10, y: 20 }, visual, input = true, completions = 0;
  const actor = {
    getPosition: () => ({ ...position }),
    setPosition: value => { position = value; },
    setVisualTransform: value => { visual = value; },
    setInputEnabled: value => { input = value; },
  };
  const exit = createGoalExit(actor, { x: 30, y: 40 }, () => completions++);
  assert.equal(input, false);
  assert.equal(visual.alpha, 1);
  assert.deepEqual(visual.pivot, [0.5, 0.5]);
  exit.update(0.125);
  assert.deepEqual(position, { x: 20, y: 30 });
  assert.deepEqual(visual, { rotation: Math.PI / 8, alpha: 0.5 });
  assert.equal(completions, 0);
  exit.update(0.125);
  assert.deepEqual(position, { x: 30, y: 40 });
  assert.deepEqual(visual, { rotation: Math.PI / 4, alpha: 0 });
  assert.equal(completions, 1);
  exit.update(1);
  assert.equal(completions, 1);
});
