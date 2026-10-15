import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

// Exercise the real canvas compositor without booting WebGPU or the game loop.
const main = await readFile(new URL("../../runtime/main.js", import.meta.url), "utf8");
const source = main.slice(main.indexOf("function drawDiagnostics("), main.indexOf("function drawCharacterCenterMarker("));

test("debug canvas switches coordinates, perceptions, colliders, tiles and tasks independently", () => {
  for (let mask = 0; mask < 32; mask++) {
    const calls = new Set();
    const record = name => () => { calls.add(name); return []; };
    const ctx = new Proxy({}, { get: (_, key) => key === "measureText" ? () => ({width: 10}) : () => {} });
    const draw = runInNewContext(`${source}\ndrawDiagnostics`, {
      debugContext: ctx, SCREEN_WIDTH: 576, SCREEN_HEIGHT: 1024, TILE_SIZE: 64, performance: { now: () => 0 },
      drawCharacterOverheads: record("overheads"), statusBadgeArt: null,
      drawEnemyAiLabels: (_, labels) => { if (labels.length) calls.add("tasks"); },
      drawGridLines: record("tiles"), formatLevelCellLabel: () => "00,00",
      drawTerrainCollider: record("colliders"), drawCharacterCollider: record("colliders"),
      createCharacterColliderDrawCommands: record("colliders"),
      createPlayerCenterMarkerCommands: record("coordinates"), createGridSpotMarkerCommands: record("coordinates"),
      drawPerceptionDiagnostics: (_context, _snapshot, _size, _height, _now, { enabled }) => { if (enabled) calls.add("perceptions"); return []; },
      createActivePerceptionMarkerCommands: record("perceptions"),
      drawAabb: record("colliders"),
    });
    draw([{colliders: [{}], gameCell: {x: 0, y: 0}, screenPosition: {x: 0, y: 0}, valid: true}], [], [], Boolean(mask & 4), [], [], null, null,
      mask & 16 ? [{}] : [], {coordinates: Boolean(mask & 1), perceptions: Boolean(mask & 2), tileMapInfo: Boolean(mask & 8)});
    ["coordinates", "perceptions", "colliders", "tiles", "tasks"].forEach((name, bit) => {
      assert.equal(calls.has(name), Boolean(mask & (1 << bit)), `${name} at mask ${mask}`);
    });
    assert.ok(calls.has("overheads"), `overheads remain visible at debug mask ${mask}`);
  }
});
