import test from "node:test";
import assert from "node:assert/strict";
import { createLevelCamera, getLevelWorld } from "../../runtime/gameplay/level-camera.js";

const level = (overrides = {}) => ({ width: 32, height: 42, tileWidth: 64, tileHeight: 64, origin: { x: 1, y: 1 }, cameraMode: "follow-player", ...overrides });
const make = (overrides) => createLevelCamera(getLevelWorld(level(overrides)));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test("backing-density changes preserve world projection and camera input coordinates", () => {
  let backingScale = 1;
  const camera = createLevelCamera(getLevelWorld(level()), { getRenderScale: () => backingScale });
  camera.initialize({ x: 960, y: 1280 });
  const point = { x: 1000, y: 1300 };
  const screen = camera.worldToScreen(point);
  const layer = camera.attachLayer({});
  for (const density of [0.5, 1, 1.25, 2]) {
    backingScale = density;
    // The sprite shader applies view.zoom before dividing by backing size.
    near((point.x - layer.view.positionPx[0]) * layer.view.zoom / (576 * density), screen.x / 576);
    assert.deepEqual(camera.screenToWorld(screen), point);
    assert.deepEqual(camera.worldToScreen(point), screen);
  }
});

test("fixed defaults preserve the 576x1024 view regardless of player", () => {
  const world = getLevelWorld(level({ cameraMode: undefined }));
  const camera = createLevelCamera(world);
  camera.initialize({ x: 1500, y: 2000 });
  camera.update({ x: 1700, y: 2300 }, 1);
  assert.deepEqual(camera.getOffset(), { x: 0, y: 0 });
  assert.equal(world.grid.columns, 9);
  assert.equal(world.grid.rows, 16);
});

test("interior bounds honor shifted origins", () => {
  const world = getLevelWorld(level({ origin: { x: 4, y: 5 } }));
  assert.equal(world.bounds.x, -192);
  assert.equal(world.bounds.y, -256);
  assert.equal(world.bounds.width, 1920);
  assert.equal(world.grid.minColumn, -3);
  assert.equal(world.grid.minRow, -4);
});

test("short wide maps scroll horizontally and lock the vertical camera", () => {
  const world = getLevelWorld(level({width: 32, height: 16, origin: {x: 0, y: 0}}));
  const camera = createLevelCamera(world);
  camera.initialize({x: 256, y: 256});
  const start = camera.getOffset();
  camera.update({x: 1800, y: 900}, 1);
  assert.ok(camera.getOffset().x > start.x);
  assert.equal(camera.getOffset().y, 0);
  assert.equal(world.bounds.height, 1024);
});

test("small maps never produce reversed camera limits", () => {
  const camera = make({width: 5, height: 8, origin: {x: 0, y: 0}});
  for (const point of [{x: -999, y: -999}, {x: 9999, y: 9999}]) {
    camera.initialize(point);
    camera.update(point, 1);
    assert.deepEqual(camera.getOffset(), {x: 0, y: 0});
  }
});

test("initial camera centers immediately and clamps at all corners", () => {
  const c = make();
  c.initialize({ x: 960, y: 1280 });
  assert.deepEqual(c.worldToScreen({ x: 960, y: 1280 }), { x: 288, y: 512 });
  for (const x of [-999, 9999]) for (const y of [-999, 9999]) {
    c.initialize({ x, y });
    assert.deepEqual(c.getOffset(), { x: x < 0 ? 0 : 1344, y: y < 0 ? 0 : 1536 });
  }
});

test("shared dead zone is three columns wide and four rows tall", () => {
  const c = make();
  c.initialize({ x: 960, y: 1280 });
  const before = c.getOffset();
  for (const x of [-96, 0, 96]) for (const y of [-128, 0, 128]) {
    c.update({ x: 960 + x, y: 1280 + y }, 0.1);
    assert.deepEqual(c.getOffset(), before);
  }
  c.update({ x: 1156, y: 1508 }, 0.15);
  near(c.getOffset().x, before.x + 100 * (1 - Math.exp(-1)));
  near(c.getOffset().y, before.y + 100 * (1 - Math.exp(-1)));
});

test("pause freezes, reversal inside stops correction, and stopped target settles on edge", () => {
  const c = make();
  c.initialize({ x: 960, y: 1280 });
  c.update({ x: 1200, y: 1600 }, 0);
  assert.deepEqual(c.getOffset(), { x: 672, y: 768 });
  c.update({ x: 1200, y: 1600 }, 0.1);
  const at = c.getOffset();
  c.update({ x: at.x + 288, y: at.y + 512 }, 1);
  assert.deepEqual(c.getOffset(), at);
  for (let i = 0; i < 150; i++) c.update({ x: 1200, y: 1600 }, 1 / 60);
  near(c.worldToScreen({ x: 1200, y: 1600 }).x, 384);
  near(c.worldToScreen({ x: 1200, y: 1600 }).y, 384);
});

test("damping agrees across frame rates and never exposes borders", () => {
  const results = [30, 60, 120].map(fps => {
    const c = make();
    c.initialize({ x: 960, y: 1280 });
    for (let i = 0; i < fps / 2; i++) c.update({ x: 1250, y: 1700 }, 1 / fps);
    return c.getOffset();
  });
  results.forEach(p => { near(p.x, results[0].x); near(p.y, results[0].y); });
  const c = make();
  for (const x of [-9999, 9999]) for (const y of [-9999, 9999]) {
    for (let i = 0; i < 100; i++) {
      c.update({ x, y }, 0.05);
      const p = c.getOffset();
      assert.ok(p.x >= 0 && p.x <= 1344 && p.y >= 0 && p.y <= 1536);
    }
  }
});

test("minimum maps lock axes and projection round trips match sprite layer view", () => {
  const c = make({ width: 11, height: 18 });
  c.initialize({ x: 900, y: 900 });
  c.update({ x: 5000, y: 5000 }, 1);
  assert.deepEqual(c.getOffset(), { x: 0, y: 0 });
  const scrolling = make();
  scrolling.initialize({ x: 1100, y: 1700 });
  const p = { x: 1200, y: 1850 };
  assert.deepEqual(scrolling.screenToWorld(scrolling.worldToScreen(p)), p);
  const layer = {};
  scrolling.attachLayer(layer);
  const screen = scrolling.worldToScreen(p);
  near(screen.x, p.x - layer.view.positionPx[0]);
  near(screen.y, 1024 - p.y - layer.view.positionPx[1]);
  assert.equal(layer.view, scrolling.view);
});
