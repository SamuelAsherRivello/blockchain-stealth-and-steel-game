import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreasureChest} from '../../runtime/systems/objects/treasure-chest.js';
test('chest is a persistent nonblocking enter sensor and requires exit before reopening',()=>{
  let count=0;const chest=createTreasureChest({position:{x:100,y:100},onEnter:()=>count++});
  const actor={getMovementCollider:()=>({x:90,y:90,width:20,height:20})};
  chest.update(actor);chest.update(actor);assert.equal(count,1);assert.equal(chest.movementCollider,undefined);
  chest.update(null);chest.update(actor);assert.equal(count,2);
  chest.dispose();chest.update(null);chest.update(actor);assert.equal(count,2);
});

test('chest remains rendered and sensor-stable while entry is gated, then opens after readiness',()=>{
  let ready=false,count=0;const chest=createTreasureChest({position:{x:100,y:100},canEnter:()=>ready,onEnter:()=>count++});
  const actor={getMovementCollider:()=>({x:90,y:90,width:20,height:20})};
  chest.update(actor);assert.equal(count,0);
  chest.update(null);ready=true;chest.update(actor);assert.equal(count,1);
  assert.deepEqual(chest.position,{x:100,y:100});assert.equal(chest.sensor.x,76);assert.equal(chest.sensor.y,80);
  chest.dispose();
});
