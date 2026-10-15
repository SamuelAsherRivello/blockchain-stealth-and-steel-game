import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {
  collectTiledLayerTiles,
  createLevelTerrainTiles,
  normalizeTiledMap,
  validateTiledMap,
} from "../../../../plugins/tiled-babylon-lite/index.js";
import {createGridWalkability} from "../../../runtime/characters/npc/sheep/sheep-navigation.js";
import {PLAYER_FRAME, PLAYER_MOVEMENT_COLLIDER, PLAYER_PIVOT} from "../../../runtime/characters/player/player.js";
import {getLevelWorld} from "../../../runtime/gameplay/level-camera.js";

const HORIZONTAL_FLIP_FLAG = 0x80000000;
const FLIP_FLAGS = 0xe0000000;
const mapUrl = name => new URL(`../../../../public/assets/levels/tiled/maps/${name}.tmj`, import.meta.url);

async function readMap(name) {
  const url = mapUrl(name);
  const map = JSON.parse(await readFile(url, "utf8"));
  const tilesets = new Map(await Promise.all(map.tilesets.map(async ({source}) => [
    source,
    JSON.parse(await readFile(new URL(source, url), "utf8")),
  ])));
  return {map, tilesets};
}

test("Level02 is a fully rendered horizontal mirror of Level01", async () => {
  const [{map: levelOne}, {map: levelTwo, tilesets}] = await Promise.all([
    readMap("Level01"),
    readMap("Level02"),
  ]);

  assert.deepEqual(validateTiledMap(levelTwo), []);
  const normalized = normalizeTiledMap(levelTwo, tilesets);
  assert.equal(normalized.layers.length, levelOne.layers.filter(layer => layer.type === "tilelayer").length);
  const player = normalized.spawners.find(spawner => spawner.type === "PLAYER");
  const world = getLevelWorld(normalized);
  const terrainTiles = createLevelTerrainTiles(collectTiledLayerTiles(normalized), 64, 1024, new Set());
  const isPlayerCellWalkable = createGridWalkability({
    bounds: world.bounds,
    character: {frame: PLAYER_FRAME, pivot: PLAYER_PIVOT, collider: PLAYER_MOVEMENT_COLLIDER},
    grid: world.grid,
    obstacles: terrainTiles.flatMap(tile => tile.colliders),
  });
  assert.deepEqual(player.gameCell, {x: 5, y: 3});
  assert.equal(isPlayerCellWalkable(player.gameCell), true);

  assert.equal(levelTwo.width, levelOne.width);
  assert.equal(levelTwo.height, levelOne.height);
  assert.deepEqual(
    levelTwo.layers.map(({name, type}) => ({name, type})),
    levelOne.layers.map(({name, type}) => ({name, type})),
  );

  for (let layerIndex = 0; layerIndex < levelOne.layers.length; layerIndex += 1) {
    const source = levelOne.layers[layerIndex];
    const mirrored = levelTwo.layers[layerIndex];
    if (source.type === "tilelayer") {
      for (let row = 0; row < levelOne.height; row += 1) {
        for (let column = 0; column < levelOne.width; column += 1) {
          const sourceGid = source.data[row * levelOne.width + (levelOne.width - 1 - column)];
          const expectedGid = sourceGid
            ? (sourceGid & ~FLIP_FLAGS) + ((sourceGid & HORIZONTAL_FLIP_FLAG) ? 0 : HORIZONTAL_FLIP_FLAG)
            : 0;
          assert.equal(
            mirrored.data[row * levelOne.width + column],
            expectedGid,
            `${source.name} tile ${column},${row} should be horizontally flipped`,
          );
        }
      }
    } else if (source.type === "objectgroup") {
      assert.equal(mirrored.objects.length, source.objects.length, `${source.name} object count`);
      for (let objectIndex = 0; objectIndex < source.objects.length; objectIndex += 1) {
        const object = source.objects[objectIndex];
        const counterpart = mirrored.objects[objectIndex];
        assert.ok(counterpart, `${source.name} object ${object.id} should be preserved`);
        if (object.name === "Player Spawner") {
          assert.equal(counterpart.x, 384);
          assert.equal(counterpart.y, object.y);
          continue;
        }
        assert.equal(counterpart.x, levelOne.width * levelOne.tilewidth - object.x - (object.width ?? 0));
        assert.equal(counterpart.y, object.y);
        assert.equal(counterpart.name, object.name);
        assert.equal(counterpart.type, object.type);
        assert.equal(counterpart.gid, object.gid);
      }
    }
  }

  assert.ok(normalized.layers.every(layer => layer.tiles.every(tile => tile.flipX === true)));
});
