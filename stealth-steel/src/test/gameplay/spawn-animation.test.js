import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCombatActorState } from "../../runtime/gameplay/combat-actor.js";
import { createCharacterOverhead } from "../../runtime/ui/character-overhead.js";

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
    ["stealth-steel/src/runtime/characters/enemies/archer/archer.js", "ARCHER"],
    ["stealth-steel/src/runtime/characters/enemies/warrior/warrior.js", "WARRIOR"],
  ];

  for (const [file, prefix] of files) {
    const source = await readFile(new URL(`../../../../${file}`, import.meta.url), "utf8");
    assert.match(source, new RegExp(`screenPosition\\.x \\+ \\(0\\.5 - ${prefix}_PIVOT\\.x\\) \\* \\(${prefix}_FRAME\\.width - (?:sizePx|transform\\.sizePx)\\[0\\]\\)`));
    assert.match(source, new RegExp(`screenPosition\\.y \\+ [^\\n]*\\(0\\.5 - ${prefix}_PIVOT\\.y\\) \\* \\(${prefix}_FRAME\\.height - (?:sizePx|transform\\.sizePx)\\[1\\]\\)`));
  }
});
