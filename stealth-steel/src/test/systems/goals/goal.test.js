import test from "node:test";
import assert from "node:assert/strict";
import { createGoal } from "../../../runtime/systems/goals/goal.js";
import { collidersOverlap } from "../../../runtime/gameplay/game-logic.js";
import { GRID } from "../../../runtime/systems/environment/grid-contract.js";
import { createLevelCamera, getLevelWorld } from "../../../runtime/gameplay/level-camera.js";

test("goal completion requires overlap with the centered 10x10 pixel collider", () => {
  const documentRef = {
    createElement: () => ({ style: {}, setAttribute() {}, append() {}, remove() {} }),
  };
  const size = GRID.tileSizePx;
  const position = { x: size * 2.5, y: size * 3.5 };
  const goal = createGoal({ host: { append() {} }, position,
    screenWidth: GRID.widthPx, screenHeight: GRID.heightPx, documentRef });

  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const outerContact = { x: position.x + dx * 7 - 1,
      y: position.y + dy * 7 - 1, width: 2, height: 2 };
    assert.equal(collidersOverlap(outerContact, goal.movementCollider), false,
      `outer cell contact (${dx}, ${dy}) must not complete the level`);
  }
  assert.deepEqual(goal.movementCollider, {
    x: position.x - 5, y: position.y - 5,
    width: 10, height: 10,
  });
  assert.equal(collidersOverlap({ x: position.x - 1, y: position.y - 1,
    width: 2, height: 2 }, goal.movementCollider), true);
});

test("goal view projects its DOM marker without moving world collision geometry", () => {
  let marker;
  const documentRef = { createElement: () => ({ style: {}, setAttribute() {}, append() {}, remove() {} }) };
  const position = { x: 800, y: 1440 };
  const goal = createGoal({ host: { append(element) { marker = element; } }, position,
    screenWidth: GRID.widthPx, screenHeight: GRID.heightPx, documentRef });
  assert.equal(goal.combatCollider, undefined);
  assert.equal(goal.isReachedBy({ getMovementCollider: () => ({ x: 799, y: 1439, width: 2, height: 2 }) }), true);
  assert.equal(goal.isReachedBy({ getMovementCollider: () => ({ x: 820, y: 1460, width: 2, height: 2 }), getCombatCollider: () => goal.movementCollider }), false);
  const camera = createLevelCamera(getLevelWorld({ width: 32, height: 42, origin: { x: 1, y: 1 }, cameraMode: "follow-player" }));
  camera.initialize({ x: 672, y: 1312 });
  const collider = { ...goal.movementCollider };
  goal.updateView(camera);
  assert.equal(marker.style.top, "37.5%");
  assert.equal(marker.hidden, false);
  assert.deepEqual(goal.movementCollider, collider);
  camera.initialize({ x: 1800, y: 2400 });
  goal.updateView(camera);
  assert.equal(marker.hidden, true);
  assert.deepEqual(goal.movementCollider, collider);
});
