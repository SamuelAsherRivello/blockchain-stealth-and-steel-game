import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeTiledMap} from '../../../plugins/tiled-babylon-lite/index.js';
test('authored treasure has one palette item, a sensor and a stable origin-relative cell',async()=>{
  const root=new URL('../../../public/assets/levels/tiled/',import.meta.url);
  const map=JSON.parse(await readFile(new URL('maps/Level01.tmj',root),'utf8'));
  const external=new Map(await Promise.all(map.tilesets.map(async t=>[t.source,JSON.parse(await readFile(new URL(t.source,new URL('maps/',root)),'utf8'))])));
  const palette=external.get('../tilesets/TreasureChestSpawner.tsj');assert.equal(palette.tiles.length,1);
  assert.equal(palette.tiles[0].objectgroup.objects[0].class,'Sensor');
  const level=normalizeTiledMap(map,external);assert.equal(level.treasureSpawners.length,1);
  assert.deepEqual(level.treasureSpawners[0].tiledCell,{x:1,y:5});
  assert.deepEqual(level.treasureSpawners[0].sensor,{x:-24,y:-20,width:48,height:40});
});
