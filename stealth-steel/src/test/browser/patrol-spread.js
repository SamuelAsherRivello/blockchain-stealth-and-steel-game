import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine,
  createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../runtime/characters/enemies/monk/monk.js';
import { createEnemyBrain } from "../../runtime/ai/enemy-brain.js";
import { createEnemyProfile } from "../../runtime/ai/enemy-profile.js";
import { createPlanningScheduler } from "../../runtime/ai/planning-scheduler.js";
import { goblinProfile } from "../../runtime/characters/enemies/goblin/goblin-goap.js";
import { warriorProfile } from "../../runtime/characters/enemies/warrior/warrior-goap.js";
import { lancerProfile } from "../../runtime/characters/enemies/lancer/lancer-goap.js";
import { archerProfile } from "../../runtime/characters/enemies/archer/archer-goap.js";
import { monkProfile } from "../../runtime/characters/enemies/monk/monk-goap.js";

import { seededRandom } from '../fixtures/patrol-comparison.js';
import { snapshotPatrolPeers } from '../../runtime/ai/patrol-selection.js';
const corridor = new URLSearchParams(location.search).has('corridor');
const grid = { columns: 18, rows: corridor ? 5 : 16, tileSizePx: 64 };
const bounds = { width: grid.columns*64, height: grid.rows*64 };
const canvas = document.querySelector('#game'), labels = document.querySelector('#labels'), output = document.querySelector('#result');
for (const element of [canvas,labels]) { element.width=bounds.width;element.height=bounds.height; }
const engine = await createEngine(canvas, {maxDevicePixelRatio:1});engine._w=bounds.width;engine._h=bounds.height;
const manager=createSpriteAnimationManager(),scheduler=createPlanningScheduler();
const atlases=await Promise.all([loadGoblinAtlases,loadWarriorAtlases,loadLancerAtlases,loadArcherAtlases,loadMonkAtlases].map(load=>load(engine)));
const profiles=[goblinProfile,warriorProfile,lancerProfile,archerProfile,monkProfile],factories=[createGoblin,createWarrior,createLancer,createArcher,createMonk];
const records=[];let selections=0,nearChoices=0,interruptions=0,alignmentCorrections=0,diagonalIntents=0,teleports=0,elapsed=0;
for(let i=0;i<(corridor?5:10);i++) {
  const position={x:(corridor?i*3+2:6+i%5)*64+32,y:(corridor?2:6+Math.floor(i/5)*2)*64+32};
  const record={id:String(i),character:profiles[i%5].id,combat:{isAlive:true,label:String(i)},lastDestination:null,moved:0};
  const actor=factories[i%5]({atlases:atlases[i%5],initialPosition:position,bounds,obstacles:[]});actor.playAnimation(manager);
  record.actor=actor;
  record.brain=createEnemyBrain({id:record.id,actor,grid,scheduler,random:seededRandom(i+100),
    profile:createEnemyProfile({...profiles[i%5],bushChance:0}),
    getPatrolPeers:()=>snapshotPatrolPeers(records,64),
    isWalkable:cell=>(!corridor||cell.y===2)&&!records.some(other=>other!==record&&other.actor.getGridPosition(64).x===cell.x&&other.actor.getGridPosition(64).y===cell.y),
  });records.push(record);
}
const distance=()=>records.reduce((sum,r)=>sum+Math.min(...records.filter(o=>o!==r).map(o=>{
  const a=r.actor.getGridPosition(64),b=o.actor.getGridPosition(64);return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
})),0)/records.length;
const initialSeparation=distance();let patrolSeparation=0,patrolSamples=0;
registerSpriteRenderer(createSpriteRenderer(engine,{layers:records.flatMap(r=>r.actor.layers),clearValue:{r:.10,g:.20,b:.13,a:1}}));
await startEngine(engine);
function step() {
  scheduler.beginFrame();
  for(const r of records) {
    const before=r.actor.getPosition();r.brain.reaction.update(.025);r.brain.update(.025);r.actor.update(.025,[],[],null);
    const after=r.actor.getPosition(),dx=Math.abs(after.x-before.x),dy=Math.abs(after.y-before.y);
    if(dx>.01&&dy>.01)alignmentCorrections++;
    const intent=r.brain.getNavigationSnapshot().intent;if(intent.x&&intent.y)diagonalIntents++;if(Math.hypot(dx,dy)>8)teleports++;if(dx+dy>.01)r.moved++;
    const dest=r.brain.getPatrolDestination(),key=JSON.stringify(dest);
    if(dest&&key!==r.lastDestination) {
      selections++;
      const nearest=Math.min(...records.filter(o=>o!==r).map(o=>{const p=o.actor.getGridPosition(64);return Math.abs(dest.x-p.x)+Math.abs(dest.y-p.y);}));
      if(nearest<=2)nearChoices++;
    }
    r.lastDestination=key;
  }
  elapsed+=.025;
  if(elapsed>20&&elapsed<50) {patrolSeparation+=distance();patrolSamples++;}
  if(elapsed>=50&&interruptions===0) {
    for(const r of records) {r.brain.reaction.forceState('SUSPICIOUS');if(r.brain.getPatrolDestination()===null)interruptions++;}
  }
  updateSpriteAnimationManager(manager,25);
}
function frame() {
  for(let i=0;i<4&&elapsed<60;i++)step();
  const ctx=labels.getContext('2d');ctx.clearRect(0,0,bounds.width,bounds.height);ctx.strokeStyle='#ffffff15';
  for(let x=0;x<=bounds.width;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,bounds.height);ctx.stroke();}
  for(let y=0;y<=bounds.height;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(bounds.width,y);ctx.stroke();}
  ctx.font='14px sans-serif';
  for(const r of records) {
    const p=r.actor.getPosition(),dest=r.brain.getPatrolDestination();ctx.fillStyle='#fff';ctx.fillText(r.character,p.x-25,bounds.height-p.y-42);
    if(dest){ctx.strokeStyle='#ffc76b';ctx.beginPath();ctx.moveTo(p.x,bounds.height-p.y);ctx.lineTo(dest.x*64+32,bounds.height-dest.y*64-32);ctx.stroke();ctx.strokeRect(dest.x*64+22,bounds.height-dest.y*64-42,20,20);}
  }
  const result={complete:elapsed>=60,corridor,elapsed,initialSeparation,meanSeparation:patrolSeparation/Math.max(1,patrolSamples),selections,nearChoices,interruptions,alignmentCorrections,diagonalIntents,teleports,
    rows:records.map(r=>({character:r.character,moved:r.moved,position:r.actor.getPosition(),snapshot:r.brain.getNavigationSnapshot()}))};
  if(result.complete){records.forEach(r=>r.brain.dispose());result.cleanup=records.every(r=>r.brain.getPatrolDestination()===null);}
  output.dataset.result=JSON.stringify(result);output.textContent=JSON.stringify({...result,rows:result.rows.map(r=>({character:r.character,moved:r.moved}))},null,2);
  if(!result.complete)requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
