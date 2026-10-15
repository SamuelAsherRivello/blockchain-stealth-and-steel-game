import assert from "node:assert/strict";
import test from "node:test";
import { GrassDecorationsEnabled, GRASS_SET, validateDecorationSet, planDecorationSet, collectDecorationGroundCells } from "../../../runtime/systems/environment/decorations/decoration-object-sets.js";
import { createDecorationObjects } from "../../../runtime/systems/environment/decorations/decoration-objects.js";
import { collectDecorationOccupiedCells } from "../../../../plugins/tiled-babylon-lite/index.js";
import { createLevelCamera } from "../../../runtime/gameplay/level-camera.js";

const grid = { tileSizePx: 64, minColumn: -2, minRow: -1, columns: 22, rows: 22 };
const cells = [{ x: -2, y: -1 }, { x: 0, y: 0 }, { x: 18, y: 18 }];
const fullSet = { ...GRASS_SET, spawnFrequency: 1, spawnOffset: { x: 0, y: 0 }, angleOffset: 0, baseScale: 1, scaleOffset: 0 };
const plan = options => planDecorationSet({ set: fullSet, grid, groundCells: cells, isWalkable: () => true, random: () => 0, ...options });

test("global grass switch defaults off and disabled placement does no sampling", () => {
  assert.equal(GrassDecorationsEnabled, false);
  assert.deepEqual(plan({ enabled: GrassDecorationsEnabled, random: () => { throw new Error("must not sample"); } }), []);
});

test("grass defaults and invalid configuration identify the set and field", () => {
  assert.equal(validateDecorationSet(GRASS_SET), GRASS_SET);
  assert.equal(GRASS_SET.spawnFrequency, 0.1);
  assert.deepEqual(GRASS_SET.spawnOffset, { x: 20, y: 20 });
  assert.equal(GRASS_SET.angleOffset, 15);
  for (const patch of [{ images: [] }, { spawnRule: "water" }, { spawnFrequency: 1.01 }, { spawnFrequency: NaN },
    { spawnOffset: { x: -1, y: 0 } }, { angleOffset: Infinity }, { angleOffset: -1 }]) {
    assert.throws(() => validateDecorationSet({ ...GRASS_SET, ...patch }), /Decoration set grass: invalid/);
  }
});

test("100 percent covers unique empty walkable cells across the full grid", () => {
  const result = plan({ groundCells: [...cells, cells[0], { x: 100, y: 100 }], occupiedCells: [cells[1]] });
  assert.deepEqual(result.map(p => p.cell), [cells[0], cells[2]]);
  assert.deepEqual(result[0].position, { x: -96, y: -32 });
  assert.equal(result[0].rotation, 0);
  assert.equal(plan({ isWalkable: () => false }).length, 0);
  assert.equal(plan({ groundCells: [] }).length, 0);
  assert.equal(plan({ set: { ...fullSet, spawnFrequency: 0 } }).length, 0);
});

test("probability boundaries and both uniform variant choices", () => {
  assert.equal(plan({ random: () => .999 }).every(p => p.image === GRASS_SET.images[1]), true);
  assert.equal(plan({ random: () => 0 }).every(p => p.image === GRASS_SET.images[0]), true);
  assert.equal(plan({ set: { ...fullSet, spawnFrequency: .5 }, random: () => .5 }).length, 0);
  assert.equal(plan({ set: { ...fullSet, spawnFrequency: .5 }, random: () => .499 }).length, 3);
});

test("independent X/Y and angle samples stay within their signed bounds", () => {
  const sequence = [.75, 0, .75, .25];
  const [placement] = plan({ groundCells: [{ x: 0, y: 0 }],
    set: { ...fullSet, spawnOffset: { x: 10, y: 20 }, angleOffset: 30 }, random: () => sequence.shift() });
  assert.equal(placement.image, GRASS_SET.images[1]);
  assert.deepEqual(placement.position, { x: 22, y: 42 });
  assert.equal(placement.rotation, -15 * Math.PI / 180);
  assert.equal(sequence.length, 0);
});

test("10 percent threshold, half-size relative scale variation and bottom-center rotation", () => {
  assert.equal(plan({ set: GRASS_SET, random: () => .1 }).length, 0);
  const low = plan({ set: GRASS_SET, random: () => 0 });
  assert.equal(low.length, 3);
  assert.equal(low[0].scale, .425);
  const sequence = [0, .75, .999, .999, .999, .999];
  const [high] = plan({ set: GRASS_SET, groundCells: [cells[0]], random: () => sequence.shift() });
  assert.ok(high.scale > .574 && high.scale < .575);
  assert.ok(high.rotation > 14.9 * Math.PI / 180 && high.rotation < 15 * Math.PI / 180);
  const rendered = [];
  createDecorationObjects({ placements: [high], atlases: new Map([[high.image, {}]]), screenHeight: 1024, tileSize: 64,
    api: { createSprite2DLayer: (_, props) => props, addSprite2D: (layer, props) => { rendered.push({ layer, ...props }); }, removeSprite2D() {} } });
  assert.deepEqual(rendered[0].layer.pivot, [.5, 1]);
  assert.equal(rendered[0].sizePx[0], 64 * high.scale);
  assert.equal(rendered[0].sizePx[0], rendered[0].sizePx[1]);
  assert.equal(rendered[0].positionPx[1], 1024 - high.position.y + 32 * high.scale);
  assert.equal(rendered[0].rotation, high.rotation);
  for (const patch of [{ baseScale: 0 }, { baseScale: NaN }, { scaleOffset: -1 }, { scaleOffset: 1 }]) {
    assert.throws(() => validateDecorationSet({ ...GRASS_SET, ...patch }), /invalid/);
  }
});

test("authored occupancy includes noncolliding props, all spawn kinds and multicell footprints, excluding metadata", () => {
  const objects = ["ReactiveDecoration", "GoldObject", "GoldPickupSpawner", "Spawner", "GoalSpawner", "OtherProp"]
    .map((type, i) => ({ type, x: (i + 1) * 64, y: 128, width: 64, height: 64, gid: 1 }));
  objects.push({ name: "World Origin", x: 0, y: 0 }, { name: "Camera Focus", x: 0, y: 64 },
    { type: "WideProp", x: 640, y: 0, width: 128, height: 64 });
  const occupied = collectDecorationOccupiedCells({ tilewidth: 64, tileheight: 64, layers: [{ type: "objectgroup", objects }] }, 1, 5);
  for (let x = 0; x < 6; x++) assert.ok(occupied.some(cell => cell.x === x && cell.y === 4));
  assert.ok(occupied.some(cell => cell.x === 9 && cell.y === 5));
  assert.ok(occupied.some(cell => cell.x === 10 && cell.y === 5));
  assert.equal(occupied.length, 8);
  assert.equal(plan({ groundCells: occupied, occupiedCells: occupied }).length, 0);
});

test("ground excludes water, effects and invalid tiles", () => {
  const tile = { valid: true, gameCell: cells[0] };
  assert.deepEqual(collectDecorationGroundCells([
    { ...tile, source: "../tilesets/Water.tsj" }, { ...tile, source: "foam.tsj" },
    { ...tile, source: "../tilesets/Tilemap_color1.tsj", valid: false },
    { ...tile, source: "../tilesets/Bridge.tsj" },
  ]), [cells[0]]);
});

test("static instances preserve PNG center, rotation, camera projection and setup choices; disposal is idempotent", () => {
  const removed = [], rendered = [];
  const api = { createSprite2DLayer: (atlas, props) => ({ atlas, ...props }),
    addSprite2D: (layer, props) => { const sprite = { layer, ...props }; rendered.push(sprite); return sprite; },
    removeSprite2D: sprite => removed.push(sprite) };
  const placements = plan();
  const atlases = new Map(GRASS_SET.images.map(image => [image, {}]));
  const decorations = createDecorationObjects({ placements, atlases, screenHeight: 1024, tileSize: 64, api });
  assert.equal(decorations.instances.length, 3);
  assert.deepEqual(rendered[0].layer.pivot, [.5, 1]);
  assert.deepEqual(rendered[0].positionPx, [-96, 1088]);
  assert.deepEqual(rendered[0].sizePx, [64, 64]);
  assert.ok(rendered[0].layer.order > 20 && rendered[0].layer.order < 100);
  const camera = createLevelCamera({ mode: "follow-player", bounds: { x: 0, y: 0, width: 2048, height: 2048 } });
  decorations.layers.forEach(layer => camera.attachLayer(layer));
  camera.initialize({ x: 800, y: 800 }); camera.update({ x: 1000, y: 1000 }, 1);
  assert.deepEqual(rendered[0].positionPx, [-96, 1088]);
  assert.deepEqual(decorations.instances.map(p => p.cell), placements.map(p => p.cell));
  decorations.dispose(); decorations.dispose();
  assert.equal(removed.length, 3); assert.equal(decorations.instances.length, 0);
  const rebuilt = createDecorationObjects({ placements: plan(), atlases, screenHeight: 1024, tileSize: 64, api });
  assert.equal(rebuilt.instances.length, 3);
});
