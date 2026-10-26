import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreasureSession} from '../../runtime/integration/treasure-session.js';

// Deterministic host policy fixtures. No provider, credentials or wallet action.
function fixture() {
  let now=1000;
  const calls=[];
  const snapshot={account:{playerWallet:{profileId:'player',network:'signet'},gameWallet:{profileId:'game',network:'signet'}},capabilities:{contracts:{available:true}}};
  const session=createTreasureSession({
    getSnapshot:()=>snapshot,now:()=>now,newId:()=> 'original',
    offers:{start:async()=>({status:'unavailable'}),checkContractsAsync:async()=>({status:'ready',contracts:[]}),
      claim:async()=>{calls.push('claim');return {status:'pending'};},
      reject:async()=>({status:'pending'}),endSession:async id=>calls.push(['end',id])},
  });
  const saved={id:'original',reference:'treasure:original',expiresAt:91000,status:'active',offered:true,
    playerId:'player',gameId:'game',walletKey:JSON.stringify(['player','signet','game','signet']),contractId:'offer'};
const contract={id:'offer',type:'lto',purpose:'treasureLTO',sessionId:'original',hostReference:'treasure:original',
    scope:{playerId:'player',gameId:'game',network:'signet',operator:'https://signet.arkade.sh',exclusivityKey:'treasure'},
    amountSats:1000,startedAt:1000,expiresAt:91000,financial:'funded',eligibility:'within-window',canClaim:true};
  return {session,saved,contract,calls,snapshot,setNow:value=>{now=value;}};
}

test('restored active cache stays unverified until the exact funded BIS projection arrives',async()=>{
  const f=fixture();f.session.restore(f.saved);
  assert.equal(f.session.getState().status,'unverified');
  assert.equal((await f.session.act('claim')).status,'unavailable');
  assert.deepEqual(f.calls,[]);
  f.session.updateContracts({status:'ready',contracts:[f.contract]});
  assert.equal(f.session.getState().status,'active');
});

test('a revealed chest remains bound through unavailable status and reactivates only from the exact funded offer',async()=>{
  const f=fixture();f.session.restore(f.saved);f.session.updateContracts({status:'ready',contracts:[f.contract]});
  assert.equal(f.session.getState().status,'active');
  const original=f.session.snapshot();
  f.session.updateContracts({status:'unavailable',contracts:[]});
  assert.equal(f.session.getState().status,'unavailable');
  assert.equal(f.session.snapshot().contractId,original.contractId);
  assert.equal(f.session.snapshot().id,original.id);
  assert.equal((await f.session.act('claim')).status,'unavailable');
  assert.deepEqual(f.calls,[]);
  f.session.updateContracts({status:'ready',contracts:[f.contract]});
  assert.equal(f.session.getState().status,'active');
  assert.equal(f.session.snapshot().contractId,original.contractId);
});

test('tampered cached expiry cannot extend the deadline from the exact BIS projection',()=>{
  const f=fixture();f.session.restore({...f.saved,expiresAt:Number.MAX_SAFE_INTEGER,status:'active'});
  assert.equal(f.session.getState().status,'unverified');
  assert.equal(f.session.getState().remainingSeconds,0);
  f.session.updateContracts({status:'ready',contracts:[f.contract]});
  f.setNow(92000);
  assert.equal(f.session.getState().status,'expired');
  assert.equal(f.session.getState().remainingSeconds,0);
});

test('accepted pending claim survives presentation expiry and stale funded projections',async()=>{
  const f=fixture();f.session.restore(f.saved);
  f.session.updateContracts({status:'ready',contracts:[f.contract]});
  await f.session.act('claim');f.setNow(92000);
  f.session.updateContracts({status:'ready',contracts:[f.contract]});
  assert.equal(f.session.getState().status,'pending');
  assert.deepEqual(f.calls,['claim']);
});

test('C094 wrong offer cannot become active',()=>{
  const f=fixture();f.session.restore({...f.saved,status:'pending'});
  f.session.updateContracts({status:'ready',contracts:[{...f.contract,hostReference:'other'}]});
  assert.equal(f.session.getState().status,'unverified');
});

test('incoming wrong-network contract cannot establish active funding',async()=>{
  const f=fixture();f.session.restore({...f.saved,status:'pending'});
  f.session.updateContracts({status:'ready',contracts:[{...f.contract,scope:{...f.contract.scope,network:'mutinynet'}}]});
  assert.equal(f.session.getState().status,'unverified');
  assert.equal((await f.session.act('claim')).status,'unavailable');
  assert.deepEqual(f.calls,[]);
});

test('funded projection with an unresolved claim operation remains pending',()=>{
  const f=fixture();f.session.restore(f.saved);f.session.updateContracts({status:'ready',contracts:[f.contract]});
  f.session.updateContracts({status:'ready',contracts:[{...f.contract,financial:'unknown',eligibility:'expired',canClaim:false,operationKind:'claim'}]});
  f.setNow(92000);
  assert.equal(f.session.getState().status,'pending');
});

test('C094 wallet network replacement prevents claim',async()=>{
  const f=fixture();f.session.restore(f.saved);
  f.snapshot.account.playerWallet.network='mutinynet';
  assert.equal((await f.session.act('claim')).status,'unavailable');
  assert.deepEqual(f.calls,[]);
});

test('C094 explicit session end targets original offer',()=>{
  const f=fixture();f.session.restore(f.saved);f.session.end();
  assert.deepEqual(f.calls,[['end','original']]);
  assert.equal(f.session.getState().status,'no-offer');
});
