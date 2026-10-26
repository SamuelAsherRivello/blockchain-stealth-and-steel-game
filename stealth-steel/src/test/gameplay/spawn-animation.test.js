import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCombatActorState } from "../../runtime/gameplay/combat-actor.js";
import { createCharacterOverhead } from "../../runtime/ui/character-overhead.js";
import { createSharedCharacterVisual } from "../../runtime/characters/shared-character-visual.js";

test("characters use a quarter-second scale and opacity spawn animation", async () => {
  const source = await readFile(new URL("../../runtime/main.js", import.meta.url), "utf8") + await readFile(new URL("../../runtime/gameplay/combat-actor.js", import.meta.url), "utf8");

  assert.match(source, /const SPAWN_ANIMATION_DURATION_SECONDS = 0\.25;/);
  assert.match(source, /spawnElapsedSeconds/);
  assert.match(source, /onSpawnProgress/);
  assert.match(source, /beginSpawn\(\)/);
  assert.match(source, /record\.combat\.beginSpawn\(\)/);
  assert.match(source, /let spawnElapsedSeconds = SPAWN_ANIMATION_DURATION_SECONDS;/);
  assert.match(source, /onSpawnProgress\(1\);/);
  assert.match(source, /sizePx: \[size \* Math\.max\(progress, 0\.001\),/);
  assert.match(source, /layer\.opacity = progress/);
  assert.match(source, /Math\.max\(progress, 0\.001\)/);
});

test("spawn animation begins even when actors attach before renderer creation", async () => {
  const source = await readFile(new URL("../../runtime/main.js", import.meta.url), "utf8");
  const attachActor = source.match(/function attachActor\(record\) \{[\s\S]*?\n  \}/)?.[0];

  assert.ok(attachActor);
  let spawnCount = 0;
  const attach = new Function("renderer", "SpawnerType", "getEnemyExpression", "createCharacterOverhead",
    `return (${attachActor});`)(null, { ENEMY: "enemy" }, () => ({}), createCharacterOverhead);
  const combat = createCombatActorState({ onSpawnProgress: progress => { if (progress === 0) spawnCount++; } });
  const record = { type: "player", actor: {}, combat };
  assert.equal(attach(record), record);
  assert.equal(spawnCount, 1);
  assert.equal(record.overhead.snapshot.opacity, 0);
});

test("all character renderers keep spawn scaling centered on the sprite", async () => {
  const files = [
    "stealth-steel/src/runtime/characters/enemies/archer/archer.js",
    "stealth-steel/src/runtime/characters/enemies/goblin/goblin.js",
    "stealth-steel/src/runtime/characters/enemies/warrior/warrior.js",
    "stealth-steel/src/runtime/characters/enemies/lancer/lancer.js",
    "stealth-steel/src/runtime/characters/enemies/monk/monk.js",
  ];
  for (const file of files) {
    const source = await readFile(new URL(`../../../../${file}`, import.meta.url), "utf8");
    assert.match(source, /artPivot/);
    assert.match(source, /artOffset/);
    assert.match(source, /createSharedCharacterVisual|createSharedCharacterActor/);
  }
  const sprites = [];
  const visual = createSharedCharacterVisual({
    definition: {
      id: "lancer", frame: { width: 320, height: 320 },
      displaySize: { width: 320, height: 320 }, artPivot: { x: 0.5, y: 0.5 },
      artOffset: { x: 0, y: 0 }, movementCollider: { radius: 24 },
      animations: { idle: { frameCount: 1, loop: true, frameDurationMs: 100 } },
    },
    atlases: {}, initialPosition: { x: 100, y: 200 },
    bounds: { width: 1024, height: 1024 },
    api: {
      createSprite2DLayer: (_atlas, options) => ({ ...options }),
      addSprite2D: (_layer, options) => { const sprite = { ...options }; sprites.push(sprite); return sprite; },
      updateSprite2D: (sprite, patch) => Object.assign(sprite, patch),
      removeSprite2D() {},
    },
  });
  const originalPosition = [...sprites[0].positionPx];
  const originalPivot = [...sprites[0].pivot];
  for (const scale of [0.001, 0.5, 1]) {
    visual.setVisualTransform({ scaleX: scale, scaleY: scale });
    assert.deepEqual(sprites[0].positionPx, originalPosition);
    assert.deepEqual(sprites[0].pivot, originalPivot);
    assert.deepEqual(sprites[0].sizePx, [320 * scale, 320 * scale]);
  }
  visual.dispose();
});
