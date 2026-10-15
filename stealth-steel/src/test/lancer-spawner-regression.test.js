import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createLancer } from "../runtime/characters/enemies/lancer/lancer.js";

test("Lancer uses the 320 by 320 frame geometry from the supplied Aseprite", async () => {
  const source = await readFile(new URL("../runtime/characters/enemies/lancer/lancer-animation-catalog.js", import.meta.url), "utf8");
  assert.match(source, /const FRAME_SIZE = 320/);
  assert.match(source, /gridSize: Object\.freeze\(\[FRAME_SIZE, FRAME_HEIGHT\]\)/);
});

test("Tiled runtime accepts the authored Lancer enemy type", async () => {
  const source = await readFile(new URL("../../plugins/tiled-babylon-lite/index.js", import.meta.url), "utf8");
  assert.match(source, /supportedTypes = new Set\(\[[^\]]*"LANCER"/s);
});

test("Lancer keeps the lowercase code-facing character identity", async () => {
  const source = await readFile(new URL("../runtime/systems/spawners/spawner-catalog.js", import.meta.url), "utf8");
  assert.match(source, /LANCER:\s*"lancer"/);
});

test("Lancer keeps a looping idle animation and participates in enemy patrol", async () => {
  const [catalog, main] = await Promise.all([
    readFile(new URL("../runtime/characters/enemies/lancer/lancer-animation-catalog.js", import.meta.url), "utf8"),
    readFile(new URL("../runtime/main.js", import.meta.url), "utf8"),
  ]);
  assert.match(catalog, /idle: createDescriptor\("Lancer Idle", "Lancer_Idle\.png", 12, true\)/);
  assert.match(main, /lancerProfile/);
  assert.match(main, /record\.brain = createEnemyBrain/);
  assert.match(main, /character: SpawnerCharacter\.LANCER, actor, combat, controller: null/);
});

test("Lancer artwork and death rotation share the movement-collider center", () => {
  const layers = [];
  const sprites = [];
  const actor = createLancer({
    atlases: {},
    initialPosition: { x: 320, y: 320 },
    bounds: { width: 1024, height: 1024 },
    obstacles: [],
    api: {
      createSprite2DLayer: (_atlas, options) => {
        const layer = { ...options };
        layers.push(layer);
        return layer;
      },
      addSprite2D: (_layer, options) => {
        const sprite = { ...options };
        sprites.push(sprite);
        return sprite;
      },
      updateSprite2D: (sprite, patch) => Object.assign(sprite, patch),
      playSprite2DAnimation: () => ({}),
      stopSpriteAnimation() {},
      removeSprite2D() {},
    },
  });

  // The painted Lancer artwork ends at y=197 in the 320px PNG frame. Its
  // bottom center must coincide with the logical physics/perception center.
  assert.ok(layers.every((layer) => layer.pivot[0] === 0.5));
  assert.ok(layers.every((layer) => layer.pivot[1] === 197 / 320));
  const originalPositions = sprites.map((sprite) => [...sprite.positionPx]);
  const collider = actor.getMovementCollider();
  assert.deepEqual(
    originalPositions,
    sprites.map(() => [collider.x, 1024 - collider.y]),
    "the painted artwork bottom is at the physics/perception center",
  );
  actor.setVisualTransform({ sizePx: [160, 160], anchor: "artwork-bottom" });
  assert.deepEqual(
    sprites.map((sprite) => sprite.positionPx),
    originalPositions,
    "shrinking for death keeps the artwork bottom at the physics center",
  );
  actor.dispose();
});
