import test from "node:test";
import assert from "node:assert/strict";
import { createSpriteAnimationManager, updateSpriteAnimationManager } from "@babylonjs/lite";
import { createArcher } from "../../runtime/characters/enemies/archer/archer.js";

function makeArcher() {
  const atlas = { frames: Array.from({ length: 6 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  return createArcher({ atlases: { idle: atlas, walking: atlas, shooting: atlas }, initialPosition: { x: 320, y: 320 }, bounds: { width: 1024, height: 1024 } });
}

test("archer depth updates during movement above the original screen height", () => {
  const atlas = { frames: Array.from({ length: 6 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const actor = createArcher({ atlases: { idle: atlas, walking: atlas, shooting: atlas },
    initialPosition: { x: 800, y: 1600 }, bounds: { width: 1920, height: 2560, renderHeight: 1024 }, autonomous: false });
  const before = actor.layers[0].order;
  actor.setMovementIntent({ x: 0, y: 1 });
  for (let i = 0; i < 30; i++) actor.update(1 / 60);
  assert.ok(actor.getPosition().y > 1600);
  assert.ok(actor.layers[0].order < before);
  actor.dispose();
});

function assertFacing(actor, heading) {
  assert.equal(actor.getHeading(), heading);
  for (const layer of actor.layers) {
    assert.equal(layer._instanceData[4] > layer._instanceData[6], heading === "left");
  }
}

test("archer locks perception to shot facing despite changing movement requests, including recovery", () => {
  const actor = makeArcher();
  const manager = createSpriteAnimationManager();
  actor.playAnimation(manager);
  actor.shootAt({ x: 192, y: 320 });
  assert.equal(actor.state, "shooting");
  assertFacing(actor, "left");
  for (const movement of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }]) {
    actor.setMovementIntent(movement);
    actor.update(0.05);
    assertFacing(actor, "left");
  }
  for (let frame = 0; frame < 6; frame += 1) updateSpriteAnimationManager(manager, 101);
  assert.equal(actor.state, "recovering");
  actor.setMovementIntent({ x: 1, y: 0 });
  actor.update(0.1);
  assertFacing(actor, "left");
  actor.dispose();
});

test("archer vertical perception changes independently of horizontal artwork and persists while idle", () => {
  const actor = makeArcher();
  actor.setMovementIntent({ x: -1, y: 0 });
  actor.update(0.016);
  assertFacing(actor, "left");
  for (const [movement, heading] of [[{ x: 0, y: -1 }, 'up'], [{ x: 0, y: 1 }, 'down'], [{ x: 0, y: 0 }, 'down']]) {
    actor.setMovementIntent(movement);
    actor.update(0.016);
    assert.equal(actor.getHeading(), heading);
    for (const layer of actor.layers) assert.equal(layer._instanceData[4] > layer._instanceData[6], true);
  }
  actor.setMovementIntent({ x: 1, y: 0 });
  actor.update(0.016);
  assertFacing(actor, "right");
  actor.dispose();
});
