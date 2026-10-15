import test from 'node:test';
import assert from 'node:assert/strict';
import {createCombatActorState} from '../../runtime/gameplay/combat-actor.js';
import {createGameStateMachine,GameState} from '../../runtime/gameplay/game-state.js';
import {revivePaidPlayer} from '../../runtime/gameplay/paid-revival.js';
import {createSpawner} from '../../runtime/systems/spawners/spawner.js';

test('paid Continue replaces the dead player through the initial spawn factory before resuming',()=>{
 const machine=createGameStateMachine();machine.assetsLoaded();
 const calls=[],disposed=[];
 function spawnPlayer(row,column,{position={x:(column+.5)*64,y:(row+.5)*64},loadout={weapon:null,item:null}}={}) {
   calls.push({row,column,position,loadout});
   return {type:'player',actor:{getGridPosition:()=>({x:column,y:row}),getPosition:()=>({...position}),getLoadout:()=>({...loadout})},
     combat:createCombatActorState({label:`player-${calls.length}`,getCombatCollider:()=>({}),setVisualTransform:()=>{},onDeathStart:()=>machine.playerDefeated(),onDeathComplete:()=>machine.deathCompleted()})};
 }
 const spawner=createSpawner({type:'player',position:{x:291.5,y:355.75},minimumCount:1,maximumCount:1,guaranteeInitialPopulation:true,
   createActor:position=>spawnPlayer(5,4,{position,loadout:{weapon:'knife',item:'gold'}}),disposeActor:record=>disposed.push(record)});
 spawner.initialize();const old=spawner.actors[0];old.combat.applyDamage(100,null);old.combat.updateDeath(.25);
 let resumed=false;
 assert.equal(revivePaidPlayer({machine,player:old,spawners:[spawner],enemyType:'enemy',tileSize:64,spawnPlayer,resume:()=>{
   assert.notEqual(spawner.actors[0],old,'dead render/input record must be replaced');
   assert.equal(spawner.actors[0].combat.health,100);resumed=true;
 }}),true);
 assert.deepEqual(disposed,[old]);assert.equal(calls.length,2);assert.deepEqual(calls[1],calls[0]);
 assert.equal(old.combat.isDead,true);assert.equal(resumed,true);
});

test('paid respawn preserves world state and clears exactly the nine cells before resume',()=>{
 const machine=createGameStateMachine();machine.assetsLoaded();
 const transforms=[];const player={inventory:{gold:8},actor:{getGridPosition:()=>({x:4,y:5}),getPosition:()=>({x:291.5,y:355.75}),getLoadout:()=>({weapon:'knife',item:'gold'})},
   combat:createCombatActorState({label:'player',getCombatCollider:()=>({}),setVisualTransform:t=>transforms.push(t),onDeathStart:()=>machine.playerDefeated(),onDeathComplete:()=>machine.deathCompleted()})};
 player.combat.applyDamage(100,null);player.combat.updateDeath(.25);
 const actors=[];
 for(let x=2;x<=6;x++)for(let y=3;y<=7;y++)actors.push({type:'enemy',actor:{getGridPosition:()=>({x,y})}});
 const sheep={type:'sheep',actor:{getGridPosition:()=>({x:4,y:5})}};actors.push(sheep);
 const removed=[];const spawner={get actors(){return [...actors];},remove:r=>{removed.push(r);actors.splice(actors.indexOf(r),1);}};
 const before=player.actor.getPosition();let resumes=0;
 const owner={actors:[player],replace(old,create){assert.equal(old,player);this.actors=[create()];}};
 const spawnPlayer=(row,column,{position,loadout})=>{
   assert.deepEqual({row,column},{row:5,column:4});assert.deepEqual(position,before);assert.deepEqual(loadout,{weapon:'knife',item:'gold'});
   return {actor:player.actor,combat:createCombatActorState({label:'replacement',getCombatCollider:()=>({}),setVisualTransform:()=>{}})};
 };
 const args={machine,player,spawners:[spawner,owner],enemyType:'enemy',tileSize:64,spawnPlayer,resume:()=>{assert.equal(removed.length,9);assert.equal(owner.actors[0].combat.health,100);resumes++;}};
 assert.equal(revivePaidPlayer(args),true);assert.equal(machine.state,GameState.LEVEL_PLAYING);
 assert.deepEqual(player.actor.getPosition(),before);assert.deepEqual(player.inventory,{gold:8});assert.equal(actors.includes(sheep),true);assert.equal(actors.length,17);
 assert.equal(owner.actors[0].combat.isAlive,true);assert.equal(player.combat.isDead,true);
 assert.equal(revivePaidPlayer(args),false);assert.equal(resumes,1);
});
test('paid transition cannot revive playing, dying or completed runs',()=>{
 const m=createGameStateMachine();m.continueAfterPayment();assert.equal(m.state,GameState.LEVEL_START);
 m.assetsLoaded();m.playerDefeated();m.continueAfterPayment();assert.equal(m.state,GameState.LEVEL_DYING);
 m.deathCompleted();m.continueAfterPayment();m.goalReached();m.continueAfterPayment();assert.equal(m.state,GameState.LEVEL_COMPLETE);
});
