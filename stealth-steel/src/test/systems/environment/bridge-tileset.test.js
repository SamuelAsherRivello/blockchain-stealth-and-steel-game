import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { normalizeTiledMap } from '../../../../plugins/tiled-babylon-lite/index.js';
const base = new URL('../../../../public/assets/levels/tiled/', import.meta.url);
const json = url => JSON.parse(readFileSync(url, 'utf8'));
for (const name of ['Level01', 'Level02']) test(`${name} resolves Bridge frames and live collision metadata`, () => {
 const url = new URL(`maps/${name}.tmj`, base);
 const map = json(url);
 const sets = new Map(map.tilesets.map(ref => [ref.source, json(new URL(ref.source, url))]));
 const ref = map.tilesets.find(ref => ref.source.endsWith('/Bridge.tsj'));
 assert.ok(ref);
 const sheet = sets.get(ref.source);
 const png = readFileSync(new URL(sheet.image, new URL(ref.source, url)));
 assert.equal(png.readUInt32BE(16), sheet.columns * sheet.tilewidth);
 assert.equal(png.readUInt32BE(20), sheet.tilecount / sheet.columns * sheet.tileheight);
 for (let i=1;i<map.tilesets.length;i++) {
  const prior=map.tilesets[i-1];
  assert.ok(map.tilesets[i].firstgid >= prior.firstgid + sets.get(prior.source).tilecount);
 }
 // Level02 is an unfinished map without required spawners; check its palette only.
 if (name === 'Level02') return;
 const layer = map.layers.find(layer => layer.type === 'tilelayer' && layer.name !== 'World Origin');
 layer.data[0] = ref.firstgid + 11;
 const resolve = () => normalizeTiledMap(map, sets).layers.find(l => l.name === layer.name).tiles.find(t => t.gid === ref.firstgid + 11);
 assert.equal(resolve().frame, 11);
 assert.equal(resolve().image, sheet.image);
 assert.deepEqual(resolve().collisionShapes, []);
 sheet.tiles = [{id:11, objectgroup:{objects:[{x:0,y:0,width:16,height:64},{x:48,y:0,width:16,height:64}]}}];
 assert.equal(resolve().collisionShapes.length, 2);
});
