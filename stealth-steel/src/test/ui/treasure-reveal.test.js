import test from 'node:test';
import assert from 'node:assert/strict';
import { createTreasureReveal, TREASURE_REVEAL_SECONDS } from '../../runtime/systems/objects/treasure-reveal.js';

test('confirmed treasure reveal grows and fades from zero to full over 0.25 seconds', () => {
  const updates = [];
  const reveal = createTreasureReveal({ sprite: 'treasure', api: { updateSprite2D: (_sprite, patch) => updates.push(patch) } });

  assert.equal(TREASURE_REVEAL_SECONDS, 0.25);
  assert.deepEqual(updates.at(-1), { alpha: 0, scaleX: 0, scaleY: 0 });
  assert.equal(reveal.update(0.125), false);
  assert.deepEqual(updates.at(-1), { alpha: 0.5, scaleX: 0.5, scaleY: 0.5 });
  assert.equal(reveal.update(0.125), true);
  assert.deepEqual(updates.at(-1), { alpha: 1, scaleX: 1, scaleY: 1 });
  assert.equal(reveal.update(1), true);
  assert.equal(updates.length, 3);
});
