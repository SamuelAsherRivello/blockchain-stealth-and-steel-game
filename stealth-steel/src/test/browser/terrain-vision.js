import { createLevelTerrainTiles } from '../../../plugins/tiled-babylon-lite/index.js';
import { createTerrainVision } from '../../runtime/systems/perception/terrain-vision.js';
import { createCharacterPerception } from '../../runtime/systems/perception/character-perception.js';
import { createEnemyVisionShadowDrawCommands, createPerceptionDrawCommands } from '../../runtime/ui/collider-diagnostics.js';

const load = async path => { const image = new Image(); image.src = path; await image.decode(); return image; };
const [atlas, shadow] = await Promise.all([
  load('/assets/images/terrain/tilesets/Tilemap_color1.png'),
  load('/assets/images/terrain/tile-shadow.png'),
]);
const cases = [
  ['Full cliff', {frame:42,collisionShapes:[{type:'rectangle',x:0,y:0,width:1,height:1}]}],
  ['Triangle slope', {frame:48,collisionShapes:[{type:'polygon',points:[{x:0,y:0},{x:1,y:0},{x:0,y:1}]}]}],
  ['Thin edge', {frame:15,collisionShapes:[{type:'rectangle',x:0,y:0,width:0.0625,height:1}]}],
  ['Cliff without collider', {frame:42}],
  ['Explicit grass blocker', {frame:15,blocksVision:true}],
  ['Clear grass', {frame:15}],
];
const ctx=document.querySelector('canvas').getContext('2d');
ctx.imageSmoothingEnabled=false;
const results=[];
for (const [row,[name,config]] of cases.entries()) {
  const tiles=createLevelTerrainTiles([{source:'Tilemap_color1.tsj',...config,gameCell:{x:2,y:row}}],64,576,new Set());
  const isWalkable=createTerrainVision(tiles);
  const perception=createCharacterPerception({isWalkable});
  perception.register({id:'enemy',type:'enemy',cell:{x:0,y:row},heading:'right'});
  perception.register({id:'player',type:'player',isMoving:true,cell:{x:3,y:row}});
  const detected=perception.update().some(d=>d.type==='visual');
  const commands=createEnemyVisionShadowDrawCommands(perception.getSnapshot(),64,{isWalkable,screenHeight:576});
  const visual=createPerceptionDrawCommands(perception.getSnapshot(),64,0,{isWalkable}).filter(command=>command.channel==='visual');
  const clear=name==='Clear grass';
  const pass=detected===clear && commands.length===(clear?4:1) && visual.length===commands.length;
  results.push(`${pass?'PASS':'FAIL'} ${name}: visual=${detected}, shadow cells=${commands.length}, purple cells=${visual.length}`);
  const y=row*96;
  ctx.fillStyle='#e5eee8'; ctx.fillText(name,0,y+24);
  for(let x=0;x<5;x++) {
    const frame=x===2?config.frame:15;
    ctx.drawImage(atlas,(frame%9)*64,Math.floor(frame/9)*64,64,64,225+x*64,y,64,64);
  }
  for(const command of commands) {
    ctx.globalAlpha=command.opacity;
    ctx.drawImage(shadow,225+command.cell.x*64,y,64,64);
  }
  ctx.globalAlpha=1;
  for (const command of visual) {
    ctx.fillStyle=command.style.fillStyle;
    ctx.fillRect(225+command.points[0].x,y+16,32,32);
  }
  ctx.fillStyle='#ff6464';ctx.fillText('ENEMY →',230,y+36);
  ctx.fillStyle='#fff';ctx.fillText('PLAYER',420,y+36);
  ctx.fillStyle=pass?'#7ef5a3':'#ff6464';ctx.fillText(`${pass?'PASS':'FAIL'} • ${detected?'detected':'blocked'}`,580,y+36);
}
document.querySelector('#result').textContent=results.join('\n');
