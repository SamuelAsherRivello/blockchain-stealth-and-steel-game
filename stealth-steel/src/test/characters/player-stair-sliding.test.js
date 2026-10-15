import test from 'node:test';
import assert from 'node:assert/strict';
import { createGridAlignedMovementController, moveWithCollisions, collidersOverlap } from '../../runtime/gameplay/game-logic.js';

// Level01's left-hand stair: diagonal tile followed by a four-pixel ledge.
const obstacles = [
  { x: 64, y: 704, width: 4, height: 64 },
  { x: 64, y: 704, width: 64, height: 4 },
  { x: 64, y: 640, width: 64, height: 64 },
  { type: 'polygon', points: [{ x: 128, y: 704 }, { x: 192, y: 640 }, { x: 128, y: 640 }] },
  { type: 'polygon', points: [{ x: 128, y: 768 }, { x: 192, y: 768 }, { x: 192, y: 704 }] },
];
const character = { frame: { width: 0, height: 0 }, pivot: { x: 0, y: 0 },
  collider: { type: 'circle', x: 0, y: 0, radius: 18.2 } };

for (const fps of [30, 60, 120]) {
 for (const aligned of [false, true]) {
  test(`holding only left clears the stair ledge at ${fps} fps (alignment ${aligned})`, () => {
    const controller = createGridAlignedMovementController(character, 64);
    let position = { x: 225, y: 660 };
    for (let frame = 0; frame < fps * 2; frame++) {
      position = aligned
        ? controller.move(position, { x: -1, y: 0 }, 210 / fps, 1 / fps, {}, obstacles)
        : moveWithCollisions(position, { x: -1, y: 0 }, 210 / fps, {}, character, obstacles);
      for (const obstacle of obstacles) {
        assert.equal(collidersOverlap({ ...character.collider, ...position }, obstacle), false);
      }
    }
    assert.ok(position.x < 110, `stuck at ${JSON.stringify(position)}`);
    assert.ok(position.y > 726, 'player must climb above the ledge');
  });
 }
}

test('flat wall faces and occupied enemy cells still block circles', () => {
  for (const obstacle of [{ x: 64, y: 0, width: 64, height: 128 },
    { type: 'enemy-grid-occupancy', x: 64, y: 0, width: 64, height: 64 }]) {
    const position = { x: 150, y: 32 };
    assert.deepEqual(moveWithCollisions(position, { x: -1, y: 0 }, 25, {}, character, [obstacle]), position);
  }
});
