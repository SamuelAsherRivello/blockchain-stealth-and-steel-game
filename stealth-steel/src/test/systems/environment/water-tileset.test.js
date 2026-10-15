import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {normalizeTiledMap,collectTiledLayerTiles} from '../../../../plugins/tiled-babylon-lite/index.js';
import {createLevelTerrainTiles} from '../../../../plugins/tiled-babylon-lite/terrain-runtime.js';
const base=new URL('../../../../public/assets/levels/tiled/',import.meta.url);
const json=url=>JSON.parse(readFileSync(url,'utf8'));
test('Water has three tiles and runtime-only animation across the authored Underground layer',()=>{
 const url=new URL('maps/Level01.tmj',base),map=json(url);
 const sets=new Map(map.tilesets.map(r=>[r.source,json(new URL(r.source,url))]));
 const water=sets.get('../tilesets/Water.tsj');
 assert.equal(water.name,'Water');assert.equal(water.tilecount,3);
 assert.deepEqual(water.tiles.map(t=>t.type),['Water (Static)','Water (Animated)','Water (Walkable)']);
 assert.notEqual(water.tiles[0].image,water.tiles[1].image);
 assert.ok(water.tiles.every(t=>!t.animation));
 const tiles=collectTiledLayerTiles(normalizeTiledMap(map,sets)).filter(t=>t.source==='../tilesets/Water.tsj');
 const waterRef = map.tilesets.find(t => t.source === '../tilesets/Water.tsj');
 const authored = map.layers.filter(l => l.type === 'tilelayer').flatMap(l => l.data);
 assert.equal(tiles.length, authored.filter(gid => gid === waterRef.firstgid || gid === waterRef.firstgid + 1).length);
 assert.ok(tiles.every(t=>t.layerName==='Underground'));
 const staticTiles=tiles.filter(t=>t.gid===160),animatedTiles=tiles.filter(t=>t.gid===161);
 assert.equal(staticTiles.length, authored.filter(gid => gid === waterRef.firstgid).length);
 assert.equal(animatedTiles.length, authored.filter(gid => gid === waterRef.firstgid + 1).length);
 const samples=[staticTiles[0],animatedTiles[0]];
 assert.equal(samples[0].animation.length,0);assert.equal(samples[1].animation.length,16);
 assert.deepEqual(samples[1].frameSize,[192,192]);assert.equal(samples[1].frame,0);
 const png=readFileSync(new URL(samples[1].image,new URL('../tilesets/Water.tsj',url)));
 assert.equal(png.readUInt32BE(16),192*16);assert.equal(png.readUInt32BE(20),192);
 assert.ok(createLevelTerrainTiles(tiles,64,1024,new Set()).every(t=>t.valid && t.blocked === (t.animation.length === 0)));
});

test('walkable water uses the solid blue image without producing a runtime collider in every map', () => {
 for (const name of ['Level01', 'Level02', 'Level03']) {
  const url = new URL(`maps/${name}.tmj`, base), map = json(url);
  const sets = new Map(map.tilesets.map(r => [r.source, json(new URL(r.source, url))]));
  const ref = map.tilesets.find(r => r.source.endsWith('/Water.tsj'));
  const water = sets.get(ref.source);
  const next = map.tilesets.filter(r => r.firstgid > ref.firstgid).sort((a,b) => a.firstgid-b.firstgid)[0];
  assert.ok(!next || next.firstgid >= ref.firstgid + 3, `${name}: Water IDs must not overlap`);
  const layer = map.layers.find(l => l.type === 'tilelayer');
  layer.data[0] = ref.firstgid;
  layer.data[1] = ref.firstgid + 2;
  const placements = collectTiledLayerTiles(normalizeTiledMap(map, sets)).filter(t => t.layerName === layer.name);
  const solid = placements.find(t => t.gid === ref.firstgid);
  const walkable = placements.find(t => t.gid === ref.firstgid + 2);
  assert.ok(walkable);
  assert.equal(walkable.image, solid.image);
  assert.deepEqual(walkable.frameSize, solid.frameSize);
  assert.equal(walkable.animation.length, 0);
  const [blockedTile, walkableTile] = createLevelTerrainTiles([solid, walkable], 64, 1024, new Set());
  assert.equal(blockedTile.blocked, true);
  assert.equal(walkableTile.valid, true);
  assert.equal(walkableTile.blocked, false);
  assert.deepEqual(walkableTile.colliders, []);
 }
});

test('animated water displays ten percent smaller without changing atlas sampling or its cell center', () => {
 const url = new URL('maps/Level01.tmj', base), map = json(url);
 const sets = new Map(map.tilesets.map(r => [r.source, json(new URL(r.source, url))]));
 const placement = collectTiledLayerTiles(normalizeTiledMap(map, sets))
   .find(t => t.source.endsWith('/Water.tsj') && t.animation.length);
 const [tile] = createLevelTerrainTiles([placement], 64, 1024, new Set());
 assert.deepEqual(tile.frameSize, [192, 192]);
 assert.deepEqual(tile.displaySize, [172.8, 172.8]);
 assert.equal(tile.spritePosition.x + tile.displaySize[0] / 2, tile.screenPosition.x + 32);
 assert.equal(tile.spritePosition.y + tile.displaySize[1] / 2, tile.screenPosition.y + 32);
});


test('wide animated water is centered on its authored cell in both axes', () => {
 const placements = [64, 192].map(width => ({frame:0,gameCell:{x:5,y:7},frameSize:[width,width]}));
 const [staticTile, animatedTile] = createLevelTerrainTiles(placements,64,1024,new Set());
 assert.deepEqual(staticTile.spritePosition,{x:320,y:512});
 assert.deepEqual(animatedTile.spritePosition,{x:256,y:448});
 assert.equal(animatedTile.spritePosition.x+192/2,staticTile.spritePosition.x+64/2);
 assert.deepEqual(animatedTile.screenPosition,{x:320,y:512});
});
