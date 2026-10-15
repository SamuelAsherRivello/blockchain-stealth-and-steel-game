import test from 'node:test';
import assert from 'node:assert/strict';
import { comparePatrol } from '../fixtures/patrol-comparison.js';
import { snapshotPatrolPeers } from '../../runtime/ai/patrol-selection.js';

test('fixed-seed production patrol actions improve group spread over the original policy', () => {
  const average = original => {
    const results = Array.from({length:20},(_,i)=>comparePatrol(i+1,original));
    return { separation:results.reduce((s,r)=>s+r.separation,0)/20,sectors:results.reduce((s,r)=>s+r.sectors,0)/20 };
  };
  const before=average(true),after=average(false);console.log('C069 comparison',JSON.stringify({before,after}));
  assert.ok(after.separation>before.separation);assert.ok(after.sectors>=before.sectors);
  const corridor=comparePatrol(1,false,true);console.log('C069 corridor',JSON.stringify(corridor));assert.ok(corridor.moves>100);
});

test('peer snapshots are copied and death, removal and reset cannot retain intent', () => {
  const cell={x:20,y:30},destination={x:22,y:31};
  const live={combat:{isAlive:true,label:'living'},actor:{getGridPosition:()=>cell},brain:{getPatrolDestination:()=>({...destination})}};
  const dead={combat:{isAlive:false,label:'dead'}};
  assert.deepEqual(snapshotPatrolPeers([live,dead],64),[{id:'living',cell,patrolDestination:destination}]);
  const snapshot=snapshotPatrolPeers([live],64);snapshot[0].cell.x=0;assert.equal(cell.x,20);
  live.combat.isAlive=false;assert.deepEqual(snapshotPatrolPeers([live],64),[]);
  assert.deepEqual(snapshotPatrolPeers([],64),[]);
});
