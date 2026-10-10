import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreasureRuntime} from '../../runtime/integration/treasure-runtime.js';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function setup(saved){
  const values=new Map(saved?[['stealth-steel-treasure-session-v1',JSON.stringify(saved)]]:[]),calls=[],listeners=new Set();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  let snapshot={account:{playerWallet:{profileId:'player',network:'signet'},gameWallet:{profileId:'game',network:'signet'}},capabilities:{contracts:{available:true}},contracts:{status:'ready',contracts:[]}};
  const bis={getSnapshot:()=>snapshot,startContractAsync:async request=>{calls.push(['start',request]);return {status:'unavailable'};},checkContractsAsync:async()=>snapshot.contracts,endContractSessionAsync:async id=>calls.push(['end',id]),claimContractAsync:async id=>{calls.push(['claim',id]);return {status:'pending'};},rejectContractAsync:async id=>{calls.push(['reject',id]);return {status:'pending'};}};
  const host={getBis:()=>bis,readyAsync:async()=>bis,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
  return {bis,host,storage,calls,publish(value){snapshot={...snapshot,...value};listeners.forEach(fn=>fn(snapshot));}};
}
test('Start before BIS readiness stays skipped rather than retroactively funding',async()=>{
  const s=setup();let current,resolve;const ready=new Promise(done=>resolve=done);
  const runtime=createTreasureRuntime({accountHost:{...s.host,getBis:()=>current,readyAsync:()=>ready},storage:s.storage});runtime.start();current=s.bis;resolve(current);await tick();assert.equal(s.calls.filter(call=>call[0]==='start').length,0);assert.equal(runtime.getState().status,'missing-player');runtime.dispose();await tick();
});
test('progression preserves offer lifetime; menu entry does not reconcile it on load',async t=>{
  const now=Date.now(),saved={id:'run',reference:'treasure:run',playerId:'player',gameId:'game',expiresAt:now+90000,status:'active',offered:true,contractId:'offer'},s=setup(saved);
  t.mock.method(Date,'now',()=>now+30000);
  const resumed=createTreasureRuntime({accountHost:s.host,storage:s.storage,resumeRun:true});resumed.start();await tick();assert.equal(resumed.getState().remainingSeconds,60);assert.equal(resumed.getState().sessionId,'run');assert.equal(s.calls.filter(call=>call[0]==='start').length,0);
  resumed.dispose({preserveSession:true});assert.equal(s.calls.filter(call=>call[0]==='end').length,0);
  const menu=createTreasureRuntime({accountHost:s.host,storage:s.storage});await tick();assert.deepEqual(s.calls.filter(call=>call[0]==='end'),[]);menu.dispose();
});
test('repeated Starts end prior offer, retain amount/duration and use explicit offer identity',async()=>{
  const s=setup(),runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});runtime.start();await tick();const first=runtime.getState().sessionId;runtime.start();await tick();assert.notEqual(runtime.getState().sessionId,first);assert.deepEqual(s.calls.filter(call=>call[0]==='end'),[['end',first]]);
  const request=s.calls.find(call=>call[0]==='start')[1];assert.equal(request.offerSessionId,first);assert.equal('sessionId' in request,false);assert.equal(request.amountSats,1000);assert.equal(request.expiresAt-request.startedAt,90000);assert.equal(request.purpose,'treasureLTO');runtime.dispose();await tick();assert.equal(s.calls.filter(call=>call[0]==='end').length,2);
});
test('closed-window funding progress comes from safe events, scopes offers and permits claim/reject',async()=>{
  for(const action of ['claim','reject']){
    const s=setup(),runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});runtime.start();await tick();const binding=runtime.snapshot();
    const contract={id:'offer',type:'lto',purpose:'treasureLTO',sessionId:binding.id,offerSessionId:binding.id,hostReference:binding.reference,scope:{playerId:'player',gameId:'game'},financial:'funding',canClaim:false};
    s.publish({contracts:{status:'ready',contracts:[{...contract,hostReference:'other'}]}});assert.notEqual(runtime.getState().status,'active');
    s.publish({contracts:{status:'ready',contracts:[contract]}});assert.equal(runtime.getState().status,'preparing');
    s.publish({contracts:{status:'ready',contracts:[{...contract,financial:'funded',canClaim:true}]}});assert.equal(runtime.getState().status,'active');
    assert.equal((await runtime.act(action)).status,'pending');assert.ok(s.calls.some(([command,id])=>command===action&&id==='offer'));runtime.dispose();
  }
});
test('unavailable projection is distinct from empty; wallet/network replacement makes an old offer ineligible',async()=>{
  const s=setup(),runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});runtime.start();await tick();s.publish({contracts:{status:'unavailable',contracts:[]}});assert.equal(runtime.getState().status,'unavailable');
  s.publish({account:{playerWallet:{profileId:'player',network:'mutinynet'},gameWallet:{profileId:'game',network:'signet'}}});assert.equal(runtime.getState().status,'no-offer');assert.equal((await runtime.act('claim')).status,'unavailable');runtime.dispose();
});
