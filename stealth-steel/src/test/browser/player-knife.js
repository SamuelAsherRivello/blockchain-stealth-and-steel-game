import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine, createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createPlayer, loadPlayerAtlases } from '../../runtime/characters/player/player.js';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../runtime/characters/enemies/monk/monk.js';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';
import { resolvePlayerKnifeImpact } from '../../runtime/gameplay/player-melee.js';

const source = new URLSearchParams(location.search).get('enemy') ?? 'goblin';
const factories = {goblin:createGoblin,warrior:createWarrior,lancer:createLancer,archer:createArcher,monk:createMonk};
const loaders = {goblin:loadGoblinAtlases,warrior:loadWarriorAtlases,lancer:loadLancerAtlases,archer:loadArcherAtlases,monk:loadMonkAtlases};
const canvas = document.querySelector('#game');
const engine = await createEngine(canvas, {maxDevicePixelRatio:1}); engine._w=768; engine._h=576;
const manager = createSpriteAnimationManager();
const [playerAtlases, enemyAtlases] = await Promise.all([loadPlayerAtlases(engine),loaders[source](engine)]);
const bounds = {width:768,height:576};
let impacts=0, moves=[], paused=false;
const playerActor = createPlayer({atlases:playerAtlases,bounds,obstacles:[],initialPosition:{x:352,y:288},
  onAttackStart: move => moves.push(move.id),
  onAttackImpact: (move = {}, eligibleTargetIds) => {
    impacts++;
    const resolved = resolvePlayerKnifeImpact(player,enemies,{multiplier:move.multiplier ?? 1,eligibleTargetIds,collectImpacts:true});
    return {confirmedTargetIds:resolved.map(hit=>hit.targetId),advancedTargetIds:(move.multiplier ?? 1)>1?resolved.filter(hit=>hit.upgraded).map(hit=>hit.targetId):resolved.map(hit=>hit.targetId)};
  }});
const player = {actor:playerActor,combat:createCombatActorState({label:'player',getCombatCollider:()=>playerActor.getCombatCollider(),
  setVisualTransform:t=>playerActor.setVisualTransform(t),onDeathStart:()=>playerActor.setInputEnabled(false)})};
playerActor.playAnimation(manager);
const enemies = Array.from({length:2},(_,i)=>{
  const actor = factories[source]({atlases:enemyAtlases,bounds,obstacles:[],initialPosition:{x:392+i*120,y:288}});
  actor.playAnimation(manager);
  const combat = createCombatActorState({label:`${source}-${i}`,getCombatCollider:()=>actor.getCombatCollider(),
    setVisualTransform:t=>actor.setVisualTransform(t),onHitFlashStart:()=>actor.setVisualTransform({color:[1.6,1.6,1.6,1]})});
  return {type:'enemy',character:source,actor,combat};
});
registerSpriteRenderer(createSpriteRenderer(engine,{layers:[...playerActor.layers,...enemies.flatMap(e=>e.actor.layers)],clearValue:{r:.12,g:.25,b:.18,a:1}}));
await startEngine(engine);
function place(index, dx, dy=0) {
  const p=playerActor.getCombatCollider(), e=enemies[index].actor.getCombatCollider(), pos=enemies[index].actor.getPosition();
  enemies[index].actor.setPosition({x:pos.x+p.x-e.x+dx,y:pos.y+p.y-e.y+dy});
}
place(0,40); place(1,180);
function snapshot() {
  const layer=playerActor.layers.find(l=>l.visible);
  return {source,impacts,moves,health:enemies.map(e=>e.combat.health),dying:enemies.map(e=>e.combat.isDying),dead:enemies.map(e=>e.combat.isDead),
    state:playerActor.state,cooldown:playerActor.daggerComboCooldown,position:playerActor.getPosition(),loadout:playerActor.getLoadout(),
    animation:Object.keys(playerAtlases).find(key=>playerAtlases[key]===layer?.atlas),
    uv:layer ? Array.from(layer._instanceData.slice(4,8)) : [], playerCollider:playerActor.getCombatCollider(),enemyColliders:enemies.map(e=>e.combat.getCombatCollider())};
}
function draw() {document.querySelector('#result').textContent=JSON.stringify(snapshot(),null,2);}
function step(dt) {
  if(paused)return snapshot();
  updateSpriteAnimationManager(manager,dt*1000); playerActor.update(dt);
  for(const e of enemies)e.combat.updateDeath(dt);
  draw();return snapshot();
}
function advance(dt){for(let left=dt;left>1e-9;left-=.01)step(Math.min(.01,left));return snapshot();}
function requestAttack(){window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyV'}));}
function runCombo(gaps, settle=2){requestAttack();for(const gap of gaps){advance(gap);requestAttack();}return advance(settle);}
window.knifeQA = {snapshot,step,place,advance,runCombo,
  pause(value){paused=value;playerActor.setInputEnabled(!value,{preserveAttack:true});},
  cancel(){playerActor.setInputEnabled(false);},resume(){playerActor.setInputEnabled(true);},kill(){player.combat.applyDamage(100);},
  dispose(){playerActor.dispose();},setPlayer(p){playerActor.setPosition(p);},
};
document.querySelector('#rapid-combo').addEventListener('click',()=>runCombo([.5,.5]));
document.querySelector('#over-fast-combo').addEventListener('click',()=>runCombo([.05,.05],1.21));
draw();
