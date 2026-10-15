import test from "node:test";
import assert from "node:assert/strict";
import { getLevelWorld, createLevelCamera } from "../../runtime/gameplay/level-camera.js";
import { createSelectionSystem, gridSpotFromWorldPoint } from "../../runtime/systems/selection/selection-system.js";
import { createGridWalkability } from "../../runtime/characters/npc/sheep/sheep-navigation.js";
import { reachableRoutes } from "../../runtime/characters/movement-recovery.js";
import { moveWithCollisions } from "../../runtime/gameplay/game-logic.js";
import { createProjectile, advanceProjectile } from "../../runtime/systems/objects/projectile.js";
import { getYSortedLayerOrder } from "../../runtime/systems/environment/render-depth.js";

const world = getLevelWorld({ width: 32, height: 42, origin: { x: 4, y: 5 }, cameraMode: "follow-player" });
const character = { frame: { width: 64, height: 64 }, pivot: { x: 0.5, y: 0.5 }, collider: { x: 0, y: 0, width: 64, height: 64 } };

test("selection uses inverse camera projection and shifted world grid", () => {
  const camera = createLevelCamera(world);
  camera.initialize({ x: 1250, y: 1800 });
  const p = { x: 1248, y: 1824 };
  const cell = gridSpotFromWorldPoint(camera.screenToWorld(camera.worldToScreen(p)), world.grid);
  assert.deepEqual(cell, { x: 19, y: 28 });
  const selection = createSelectionSystem(world.grid);
  assert.deepEqual(selection.toggleGridSpot(cell), cell);
  assert.deepEqual(selection.toggleGridSpot({ x: -3, y: -4 }), { x: -3, y: -4 });
  assert.equal(selection.toggleGridSpot({ x: -4, y: -4 }), null);
});

test("navigation traverses beyond the old viewport and within negative-origin interiors", () => {
  const walkable = createGridWalkability({ ...world, character, obstacles: [] });
  assert.equal(walkable({ x: 19, y: 28 }), true);
  assert.equal(walkable({ x: -3, y: -4 }), true);
  assert.equal(walkable({ x: -4, y: -4 }), false);
  const routes = reachableRoutes({ x: -2, y: -3 }, world.grid, walkable, 1);
  assert.ok(routes.some(route => route[0].x === -3));
  const atEdge = { x: world.bounds.x + 32, y: world.bounds.y + 32 };
  assert.deepEqual(moveWithCollisions(atEdge, { x: -1, y: 0 }, 10, world.bounds, character, []), atEdge);
  assert.equal(moveWithCollisions({ x: 1200, y: 1800 }, { x: 1, y: 0 }, 10, world.bounds, character, []).x, 1210);
});

test("projectiles survive outside the old screen and expire beyond shifted world bounds", () => {
  const p = createProjectile({ x: 1200, y: 1800 }, { x: 1, y: 0 });
  assert.equal(advanceProjectile(p, 0.01, world.bounds, []).alive, true);
  const left = createProjectile({ x: world.bounds.x - 100, y: 100 }, { x: -1, y: 0 });
  assert.equal(advanceProjectile(left, 0.01, world.bounds, []).alive, false);
  const arc = createProjectile({ x: 1600, y: 1800 }, { x: 1, y: 0 }, {
    target: { x: 2000, y: 1800 }, landingCenterY: 1800,
  });
  assert.equal(advanceProjectile(arc, 10, world.bounds, []).reason, "offscreen");
});

test("depth ordering remains distinct above the old screen and at shifted world bottom", () => {
  assert.ok(getYSortedLayerOrder(1600, world.bounds) > getYSortedLayerOrder(1700, world.bounds));
  assert.ok(getYSortedLayerOrder(-200, world.bounds) > getYSortedLayerOrder(-100, world.bounds));
});
