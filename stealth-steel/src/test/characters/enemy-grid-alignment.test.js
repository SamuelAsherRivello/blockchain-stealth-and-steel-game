import test from 'node:test';
import assert from 'node:assert/strict';
import { createGoblin } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk } from '../../runtime/characters/enemies/monk/monk.js';
import { getYSortedLayerOrder } from '../../runtime/systems/environment/render-depth.js';

const factories = { goblin: createGoblin, warrior: createWarrior, lancer: createLancer, archer: createArcher, monk: createMonk };
const bounds = { width: 1024, height: 1024 };
const atlas = { frames: Array.from({ length: 20 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
function create(factory, obstacles = []) {
  return factory({ atlases: new Proxy({}, { get: () => atlas }), initialPosition: { x: 212, y: 214 }, bounds, obstacles });
}
function coherent(actor) {
  const c = actor.getMovementCollider();
  const cell = actor.getGridPosition(64);
  for (const axis of ['x', 'y']) {
    // Exact midpoints retain the prior cell; either neighboring center is
    // equally near there. Away from the boundary the nearest cell is unique.
    assert.ok(Math.abs(c[axis] - (cell[axis] * 64 + 32)) <= 32 + 1e-8);
    if (Math.abs(c[axis] / 64 - Math.round(c[axis] / 64)) > 1e-8) {
      assert.equal(cell[axis], Math.floor(c[axis] / 64));
    }
  }
  for (const layer of actor.layers) assert.equal(layer.order, getYSortedLayerOrder(c.y, bounds));
}
for (const [name, factory] of Object.entries(factories)) {
  for (const intent of [{ x: 1, y: 0 }, { x: 0, y: 1 }]) test(`${name} aligns smoothly while occupancy and depth follow ${intent.x ? 'horizontal' : 'vertical'} travel`, () => {
    const actor = create(factory);
    try {
      actor.setMovementIntent(intent);
      const initial = actor.getMovementCollider();
      for (let frame = 0; frame < 60; frame++) {
        const before = actor.getMovementCollider();
        actor.update(1 / 60, [], [], null);
        const after = actor.getMovementCollider();
        coherent(actor);
        assert.ok(Math.hypot(after.x - before.x, after.y - before.y) < 8, 'no teleport');
        if (frame >= 12) assert.ok(Math.abs((intent.x ? after.y : after.x) - 224) < 1e-8, 'orthogonal centerline');
      }
      const end = actor.getMovementCollider();
      assert.ok((intent.x ? end.x - initial.x : end.y - initial.y) > 64, 'crosses a cell boundary');
    } finally { actor.dispose(); }
  });
  test(`${name} stops, changes axis and respects a dynamic wall`, () => {
    const actor = create(factory);
    try {
      actor.setMovementIntent({ x: 1, y: 0 }); actor.update(.05, [], [], null);
      actor.setMovementIntent({ x: 0, y: 0 }); const stopped = actor.getPosition();
      actor.update(.3, [], [], null); assert.deepEqual(actor.getPosition(), stopped);
      actor.setMovementIntent({ x: 0, y: 1 });
      const targetX = Math.floor(actor.getMovementCollider().x / 64) * 64 + 32;
      const wall = { collider: { x: 0, y: 320, width: 1024, height: 64 } };
      for (let frame = 0; frame < 120; frame++) {
        actor.update(1 / 60, [wall], [], null); coherent(actor);
        const c = actor.getMovementCollider();
        assert.ok(c.y + c.radius <= 320 + 1e-6, 'does not penetrate wall');
      }
      assert.ok(Math.abs(actor.getMovementCollider().x - targetX) < 1e-8);
      assert.ok(actor.getMovementCollider().y > stopped.y, 'valid forward travel preserved');
    } finally { actor.dispose(); }
  });
}
