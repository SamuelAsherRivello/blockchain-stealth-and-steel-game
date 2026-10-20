import test from "node:test";
import assert from "node:assert/strict";
import { createSharedCharacterVisual } from "../../runtime/characters/shared-character-visual.js";

test("shared character visuals retain the configured pivot during transform updates", () => {
  const layers = [];
  const updates = [];
  const api = {
    createSprite2DLayer: (_atlas, options) => { const layer = { ...options }; layers.push(layer); return layer; },
    addSprite2D: (layer, options) => ({ layer, ...options }),
    updateSprite2D: (sprite, patch) => { updates.push({ sprite, patch }); Object.assign(sprite, patch); },
    playSprite2DAnimation: () => ({ current: 0 }),
    stopSpriteAnimation: () => {},
    removeSprite2D: () => {},
  };
  const visual = createSharedCharacterVisual({
    definition: {
      id: "test",
      frame: { width: 192, height: 192 },
      displaySize: { width: 192, height: 192 },
      artPivot: { x: 0.5, y: 136 / 192 },
      artOffset: { x: 0, y: -55 },
      movementCollider: { radius: 24 },
      animations: { idle: { frameCount: 1, loop: true, frameDurationMs: 100 } },
    },
    atlases: { idle: {} },
    initialPosition: { x: 128, y: 256 },
    bounds: { width: 576, height: 1024 },
    api,
  });

  assert.deepEqual(visual.getRotationCenter(), { x: 128, y: 311 });
  visual.setVisualTransform({ rotation: Math.PI / 2, sizePx: [96, 96] });
  assert.equal(layers[0].pivot[0], 0.5);
  assert.ok(Math.abs(layers[0].pivot[1] - 136 / 192) < 1e-12);
  const latest = updates.at(-1).patch;
  assert.equal(latest.pivot[0], 0.5);
  assert.ok(Math.abs(latest.pivot[1] - 136 / 192) < 1e-12);
  assert.deepEqual(latest.positionPx, [128, 1024 - 256 - 55]);
  assert.equal(latest.rotation, Math.PI / 2);
  assert.deepEqual(latest.sizePx, [96, 96]);
});
