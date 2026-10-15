import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizeTiledMap } from "../../../plugins/tiled-babylon-lite/index.js";
import { createLevelCamera, getLevelWorld } from "../../runtime/gameplay/level-camera.js";

test("authored focus replaces the origin marker and follows on the first update", async () => {
  const url = new URL("../../../public/assets/levels/tiled/maps/Level01.tmj", import.meta.url);
  const map = JSON.parse(await readFile(url, "utf8"));
  const tilesets = new Map(await Promise.all(map.tilesets.map(async ({ source }) =>
    [source, JSON.parse(await readFile(new URL(source, url), "utf8"))])));
  assert.ok(map.layers.every(layer => layer.name !== "World Origin"));
  const objects = map.layers.flatMap(layer => layer.objects ?? []);
  assert.ok(objects.every(object => object.name !== "World Origin"));
  const focus = objects.filter(object => object.name === "Camera Focus");
  assert.equal(focus.length, 1);
  assert.equal(focus[0].x, 289);
  assert.equal(focus[0].y, 810);
  const level = normalizeTiledMap(map, tilesets);
  assert.deepEqual(level.origin, { x: 1, y: 1 });
  const camera = createLevelCamera(getLevelWorld(level));
  assert.deepEqual(level.cameraFocus, { x: 225, y: 278 });
  // Exercise camera centering away from the world-edge clamp.
  const center = { x: 352, y: 512 };
  camera.initialize(center);
  assert.deepEqual(camera.worldToScreen(center), { x: 288, y: 512 });
  const before = camera.getOffset();
  camera.update({ x: 32, y: 512 }, 1 / 60);
  assert.ok(camera.getOffset().x < before.x);
});
