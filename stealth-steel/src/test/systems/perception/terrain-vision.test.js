import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { normalizeTiledMap, collectTiledLayerTiles, createLevelTerrainTiles } from '../../../../plugins/tiled-babylon-lite/index.js';
import { createTerrainVision } from '../../../runtime/systems/perception/terrain-vision.js';
import { createCharacterPerception } from '../../../runtime/systems/perception/character-perception.js';
import { createEnemyVisionShadowDrawCommands } from '../../../runtime/ui/collider-diagnostics.js';

const shapes = [
  { type: 'rectangle', x: 0, y: 0, width: 1, height: 1 },
  { type: 'rectangle', x: 0, y: 0, width: 0.0625, height: 1 },
  { type: 'polygon', points: [{x:0,y:0},{x:1,y:0},{x:0,y:1}] },
];
const runtime = (placements) => createLevelTerrainTiles(placements, 64, 1024, new Set());
test('all collider portions block their logical cell without blocking adjacent cells', () => {
  for (const shape of shapes) {
    const vision = createTerrainVision(runtime([{frame: 15, gameCell:{x:3,y:4}, collisionShapes:[shape]}]));
    assert.equal(vision({x:3,y:4}), false);
    assert.equal(vision({x:4,y:4}), true);
  }
});
test('palette cliffs and elevation sides block without colliders; flat tops do not', () => {
  for (let palette=1; palette<=5; palette++) {
    for (const frame of [36,39,41,42,43,44,45,48,50,51,52,53]) {
      assert.equal(createTerrainVision(runtime([{source:`../tilesets/Tilemap_color${palette}.tsj`,frame,gameCell:{x:0,y:0}}]))({x:0,y:0}), false);
    }
  }
  for (const frame of [12,13,14,15,20,21,22,23]) {
    assert.equal(createTerrainVision(runtime([{source:'../tilesets/Tilemap_Elevation.tsj',frame,gameCell:{x:0,y:0}}]))({x:0,y:0}),false);
  }
  for (const [source,frame] of [['Tilemap_color1',15],['Tilemap_Elevation',5],['Tilemap_Elevation',29]]) {
    assert.equal(createTerrainVision(runtime([{source:`../tilesets/${source}.tsj`,frame,gameCell:{x:0,y:0}}]))({x:0,y:0}),true);
  }
});
test('explicit metadata survives normalization and duplicate transparent layers do not clear blockers', () => {
  const map={type:'map',orientation:'orthogonal',width:1,height:1,tilewidth:64,tileheight:64,tilesets:[{firstgid:1,source:'grass.tsj'}],layers:[{name:'ground',type:'tilelayer',data:[1]}]};
  map.layers.push({type:'objectgroup',objects:[{id:2,type:'GoalSpawner',x:0,y:0},{id:1,type:'Spawner',x:0,y:0,properties:[{name:'type',value:'PLAYER'}]}]});
  const tilesets=new Map([['grass.tsj',{image:'grass.png',tilewidth:64,tileheight:64,tiles:[{id:0,properties:[{name:'blocksVision',type:'bool',value:true}]}]}]]);
  const tiles=runtime(collectTiledLayerTiles(normalizeTiledMap(map,tilesets)));
  assert.equal(tiles[0].blocked,false);
  assert.equal(createTerrainVision([...tiles,{gameCell:{x:0,y:0},blocked:false}])({x:0,y:0}),false);
});
test('detection and shadows agree for every heading and terrain category; audio still crosses terrain', () => {
  for (const heading of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]) {
    for (const terrain of [...shapes.map(shape=>({collisionShapes:[shape]})),{source:'Tilemap_color1.tsj',frame:42},{source:'Tilemap_Elevation.tsj',frame:13},{blocksVision:true}]) {
      const at=n=>({x:heading.x*n,y:heading.y*n});
      const isWalkable=createTerrainVision(runtime([{frame:15,...terrain,gameCell:at(2)}]));
      const perception=createCharacterPerception({isWalkable});
      perception.register({id:'enemy',type:'enemy',cell:at(0),heading});
      perception.register({id:'player',type:'player',isMoving:true,cell:at(3)});
      assert.deepEqual(perception.update(),[]);
      assert.deepEqual(createEnemyVisionShadowDrawCommands(perception.getSnapshot(),64,{isWalkable}).map(c=>c.cell),[at(1)]);
      perception.updateActor('player',{cell:at(2)});
      assert.deepEqual(perception.update(),[]);
      perception.updateActor('player',{cell:at(1)});
      assert.deepEqual(perception.update().map(d=>d.type),['visual','audio']);
      const adjacent=createCharacterPerception({isWalkable:()=>false});
      adjacent.register({id:'enemy',type:'enemy',cell:at(0),heading});
      adjacent.register({id:'player',type:'player',isMoving:true,cell:at(1)});
      assert.deepEqual(adjacent.update().map(d=>d.type),['audio']);
    }
  }
});
test('Level01 marked cliff cells, including the upper central pair, block using actual layered terrain', async () => {
  const url=new URL('../../../../public/assets/levels/tiled/maps/Level01.tmj',import.meta.url);
  const map=JSON.parse(await readFile(url,'utf8'));
  const sets=new Map(await Promise.all(map.tilesets.map(async({source})=>[source,JSON.parse(await readFile(new URL(source,url),'utf8'))])));
  const level=normalizeTiledMap(map,sets);
  const placements=collectTiledLayerTiles(level);
  const vision=createTerrainVision(runtime(placements));
  for (const [x,y] of [[4,2],[5,2],[1,4],[3,4],[6,5],[7,5],[2,6]]) {
    const tiles=placements.filter(t=>t.tiledCell.x===x&&t.tiledCell.y===y);
    assert.ok(tiles.length);
    assert.equal(vision(tiles[0].gameCell),false,`map cell ${x},${y}`);
  }
});


