import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreasureRuntime} from '../../runtime/integration/treasure-runtime.js';
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
// Existing financial lifecycle fixtures explicitly approve their new offer.
// Separate consent tests verify that default Start never funds.
function startApproved(runtime){runtime.start();const consent=runtime.getState().fundingConsent;if(consent)runtime.acceptFundingConsent(consent.sessionId);}
function setup(saved){
  const values=new Map(saved?[['stealth-steel-treasure-session-v1',JSON.stringify(saved)]]:[]),calls=[],listeners=new Set();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  let snapshot={account:{playerWallet:{profileId:'player',network:'signet'},gameWallet:{profileId:'game',network:'signet'}},capabilities:{contracts:{available:true}},contracts:{status:'ready',contracts:[]}};
  const bis={getSnapshot:()=>snapshot,startContractAsync:async request=>{calls.push(['start',request]);return {status:'unavailable'};},checkContractsAsync:async()=>snapshot.contracts,endContractSessionAsync:async id=>calls.push(['end',id]),claimContractAsync:async id=>{calls.push(['claim',id]);return {status:'pending'};},rejectContractAsync:async id=>{calls.push(['reject',id]);return {status:'pending'};}};
  const host={getBis:()=>bis,readyAsync:async()=>bis,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
  return {bis,host,storage,calls,publish(value){snapshot={...snapshot,...value};listeners.forEach(fn=>fn(snapshot));}};
}

test('creation-disabled rollback preserves exact original inspection on both networks without replacement funding',async()=>{
  for(const network of ['signet','mutinynet']){
    const startedAt=Math.floor(Date.now()/1000)*1000,saved={id:'legacy-run',reference:'treasure:legacy-run',playerId:'player',gameId:'game',
      walletKey:JSON.stringify(['player',network,'game',network]),expiresAt:startedAt+90000,status:'active',offered:true,contractId:'legacy-original'};
    const s=setup(saved),queries=[];
    s.publish({account:{playerWallet:{profileId:'player',network},gameWallet:{profileId:'game',network}},capabilities:{contracts:{available:false}}});
    s.bis.checkContractsAsync=async filter=>{queries.push(filter);return {status:'ready',contracts:[]};};
    const runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage,resumeRun:true});
    runtime.start();assert.equal(runtime.getState().status,'unverified');
    await runtime.inspect();
    assert.equal(queries.length,1);assert.equal(queries[0].sessionId,'legacy-run');
    assert.equal(queries[0].hostReference,'treasure:legacy-run');assert.equal(queries[0].includeResolved,true);
    assert.equal(runtime.snapshot().contractId,'legacy-original');
    assert.deepEqual(s.calls,[]);runtime.dispose({preserveSession:true});assert.deepEqual(s.calls,[]);
  }
});

test('creation-disabled rollback preserves unresolved legacy Claim journals on both networks',async()=>{
  for(const network of ['signet','mutinynet']){
    const startedAt=Math.floor(Date.now()/1000)*1000,saved={id:'legacy-unknown-claim',reference:'treasure:legacy-unknown-claim',playerId:'player',gameId:'game',
      walletKey:JSON.stringify(['player',network,'game',network]),expiresAt:startedAt+90000,status:'pending',offered:true,contractId:'legacy-original'};
    const s=setup(saved),queries=[];
    s.publish({account:{playerWallet:{profileId:'player',network},gameWallet:{profileId:'game',network}},capabilities:{contracts:{available:false}}});
    s.bis.checkContractsAsync=async filter=>{queries.push(filter);return {status:'ready',contracts:[{id:'legacy-original',type:'lto',purpose:'treasureLTO',sessionId:saved.id,
      hostReference:saved.reference,scope:{playerId:'player',gameId:'game',network,operator:`https://${network}.arkade.sh`,exclusivityKey:'treasure'},amountSats:1000,
      startedAt,expiresAt:startedAt+90000,operationKind:'claim',financial:'unknown',eligibility:'within-window',canClaim:false}]};};
    const runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage,resumeRun:true});
    runtime.start();await runtime.inspect();
    assert.equal(queries.length,1);assert.equal(queries[0].includeResolved,true);
    assert.equal(runtime.getState().status,'pending');assert.equal(runtime.snapshot().contractId,'legacy-original');
    assert.equal(JSON.parse(s.storage.getItem('stealth-steel-treasure-session-v1')).contractId,'legacy-original');
    assert.deepEqual(s.calls,[]);runtime.dispose({preserveSession:true});assert.deepEqual(s.calls,[]);
  }
});

test('unknown creation write survives creation-disabled restart without changing the unresolved journal',async()=>{
  const s=setup();let operationJournalBytes,checks=0;
  const originalScriptHex=`5120${'ab'.repeat(32)}`;
  const recoveryMaterial={fixtureOnly:true,opaqueBytes:'treasure-recovery-fixture-7f31'};
  s.bis.startContractAsync=async request=>{
    s.calls.push(['start',request]);
    const contract={id:'unresolved-write-contract',type:'lto',purpose:'treasureLTO',sessionId:request.offerSessionId,
      hostReference:request.hostReference,amountSats:1000,startedAt:request.startedAt,expiresAt:request.expiresAt,
      scope:{playerId:'player',gameId:'game',network:'signet',operator:'https://signet.arkade.sh',exclusivityKey:'treasure'},
      operationKind:'claim',financial:'unknown',eligibility:'within-window',canClaim:false,originalScriptHex,recoveryMaterial};
    operationJournalBytes=JSON.stringify({operationId:'fixture-unknown-create',state:'unknown',contract});
    return {status:'unknown',contract};
  };
  s.bis.checkContractsAsync=async filter=>{
    checks++;assert.equal(filter.includeResolved,true);
    const journal=JSON.parse(operationJournalBytes);
    assert.equal(filter.sessionId,journal.contract.sessionId);
    return {status:'ready',contracts:[journal.contract]};
  };

  const first=createTreasureRuntime({accountHost:s.host,storage:s.storage});startApproved(first);
  await tick();
  assert.equal(first.getState().status,'pending');
  assert.equal(first.snapshot().contractId,'unresolved-write-contract');
  const firstJournalBytes=operationJournalBytes;
  first.dispose({preserveSession:true});

  s.publish({capabilities:{contracts:{available:false}}});
  const restarted=createTreasureRuntime({accountHost:s.host,storage:s.storage,resumeRun:true});
  restarted.start();await restarted.inspect();
  assert.equal(restarted.getState().status,'pending');
  assert.equal(restarted.snapshot().contractId,'unresolved-write-contract');
  assert.equal(checks,2);
  assert.equal(s.calls.filter(([kind])=>kind==='start').length,1);
  assert.deepEqual(s.calls.filter(([kind])=>['claim','reject','end'].includes(kind)),[]);
  assert.equal(operationJournalBytes,firstJournalBytes);
  const retained=JSON.parse(operationJournalBytes);
  assert.equal(retained.state,'unknown');
  assert.equal(retained.contract.id,'unresolved-write-contract');
  assert.equal(retained.contract.originalScriptHex,originalScriptHex);
  assert.deepEqual(retained.contract.recoveryMaterial,recoveryMaterial);
  assert.equal(JSON.parse(s.storage.getItem('stealth-steel-treasure-session-v1')).contractId,'unresolved-write-contract');
  restarted.dispose({preserveSession:true});
  assert.equal(operationJournalBytes,firstJournalBytes);
});

test('unsupported network cannot create an offer or authorize funding',async()=>{
  const s=setup();s.publish({account:{playerWallet:{profileId:'player',network:'mainnet'},gameWallet:{profileId:'game',network:'mainnet'}}});
  const runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});runtime.start();
  assert.equal(runtime.getState().status,'no-offer');assert.equal(runtime.getState().fundingConsent,undefined);
  assert.equal(runtime.acceptFundingConsent(runtime.getState().sessionId).status,'unavailable');
  await runtime.inspect();await tick();assert.deepEqual(s.calls,[]);runtime.dispose();
});
test('Start before BIS readiness stays skipped rather than retroactively funding',async()=>{
  const s=setup();let current,resolve;const ready=new Promise(done=>resolve=done);
  const runtime=createTreasureRuntime({accountHost:{...s.host,getBis:()=>current,readyAsync:()=>ready},storage:s.storage});startApproved(runtime);current=s.bis;resolve(current);await tick();assert.equal(s.calls.filter(call=>call[0]==='start').length,0);assert.equal(runtime.getState().status,'missing-player');runtime.dispose();await tick();
});
test('progression preserves offer lifetime; menu entry does not reconcile it on load',async t=>{
  const now=Date.now(),saved={id:'run',reference:'treasure:run',playerId:'player',gameId:'game',expiresAt:now+90000,status:'active',offered:true,contractId:'offer'},s=setup(saved);
  t.mock.method(Date,'now',()=>now+30000);
  const resumed=createTreasureRuntime({accountHost:s.host,storage:s.storage,resumeRun:true});resumed.start();await tick();assert.equal(resumed.getState().status,'unverified');assert.equal(resumed.getState().remainingSeconds,0);assert.equal(resumed.getState().sessionId,'run');assert.equal(s.calls.filter(call=>call[0]==='start').length,0);
  resumed.dispose({preserveSession:true});assert.equal(s.calls.filter(call=>call[0]==='end').length,0);
  const menu=createTreasureRuntime({accountHost:s.host,storage:s.storage});await tick();assert.deepEqual(s.calls.filter(call=>call[0]==='end'),[]);menu.dispose();
});
test('repeated Starts end prior offer, retain amount/duration and use explicit offer identity',async()=>{
  const s=setup(),runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});startApproved(runtime);await tick();const first=runtime.getState().sessionId;startApproved(runtime);await tick();assert.notEqual(runtime.getState().sessionId,first);assert.deepEqual(s.calls.filter(call=>call[0]==='end'),[['end',first]]);
  const request=s.calls.find(call=>call[0]==='start')[1];assert.equal(request.offerSessionId,first);assert.equal('sessionId' in request,false);assert.equal(request.amountSats,1000);assert.equal(request.expiresAt,(Math.floor(request.startedAt/1000)+90)*1000);assert.equal(request.purpose,'treasureLTO');runtime.dispose();await tick();assert.equal(s.calls.filter(call=>call[0]==='end').length,2);
});
test('inspection coalesces per offer and stale slow reads cannot block or replace a rapid reopen',async()=>{
  const s=setup(),requests=[];
  s.bis.startContractAsync=async request=>{s.calls.push(['start',request]);return {status:'submitted'};};
  s.bis.checkContractsAsync=filter=>new Promise(resolve=>requests.push({filter,resolve}));
  const runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});
  startApproved(runtime);await tick();
  const first=runtime.snapshot();assert.equal(requests.length,1);
  const sharedInspection=runtime.inspect();await tick();assert.equal(requests.length,1);

  startApproved(runtime);await tick();
  const second=runtime.snapshot();assert.notEqual(second.id,first.id);assert.equal(requests.length,2);
  assert.deepEqual(requests.map(({filter})=>filter.sessionId),[first.id,second.id]);

  const contractFor=session=>({id:`offer-${session.id}`,type:'lto',purpose:'treasureLTO',sessionId:session.id,
    hostReference:session.reference,amountSats:1000,startedAt:session.startedAt,expiresAt:session.expiresAt,
    scope:{playerId:'player',gameId:'game',network:'signet',operator:'https://signet.arkade.sh',exclusivityKey:'treasure'},
    financial:'funded',eligibility:'within-window',canClaim:true});
  requests[0].resolve({status:'ready',contracts:[contractFor(first)]});await sharedInspection;await tick();
  assert.equal(runtime.getState().sessionId,second.id);assert.notEqual(runtime.getState().status,'active');
  requests[1].resolve({status:'ready',contracts:[contractFor(second)]});await tick();
  assert.equal(runtime.getState().status,'active');assert.equal(runtime.getState().contractId,`offer-${second.id}`);
  runtime.dispose();
});
test('closed-window funding progress comes from safe events, scopes offers and permits claim/reject',async()=>{
  for(const action of ['claim','reject']){
    const s=setup(),runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});startApproved(runtime);await tick();const binding=runtime.snapshot();
    const contract={id:'offer',type:'lto',purpose:'treasureLTO',sessionId:binding.id,offerSessionId:binding.id,hostReference:binding.reference,
      scope:{playerId:'player',gameId:'game',network:'signet',operator:'https://signet.arkade.sh',exclusivityKey:'treasure'},amountSats:1000,
      startedAt:binding.startedAt,expiresAt:binding.expiresAt,financial:'funding',eligibility:'within-window',canClaim:false};
    s.publish({contracts:{status:'ready',contracts:[{...contract,hostReference:'other'}]}});assert.notEqual(runtime.getState().status,'active');
    s.publish({contracts:{status:'ready',contracts:[contract]}});assert.equal(runtime.getState().status,'preparing');
    s.publish({contracts:{status:'ready',contracts:[{...contract,financial:'funded',canClaim:true}]}});assert.equal(runtime.getState().status,'active');
    assert.equal((await runtime.act(action)).status,'pending');assert.ok(s.calls.some(([command,id])=>command===action&&id==='offer'));runtime.dispose();
  }
});
test('unrelated refresh and an unknown delayed claim never submit a second operation',async()=>{
  const s=setup(),runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});startApproved(runtime);await tick();
  const binding=runtime.snapshot(),contract={id:'offer',type:'lto',purpose:'treasureLTO',sessionId:binding.id,
    hostReference:binding.reference,amountSats:1000,startedAt:binding.startedAt,expiresAt:binding.expiresAt,
    scope:{playerId:'player',gameId:'game',network:'signet',operator:'https://signet.arkade.sh',exclusivityKey:'treasure'},
    financial:'funded',eligibility:'within-window',canClaim:true};
  s.publish({contracts:{status:'ready',contracts:[contract]}});assert.equal(runtime.getState().status,'active');
  let finish,submissions=0;s.bis.claimContractAsync=async()=>{submissions++;return new Promise(resolve=>finish=resolve);};
  const original=runtime.act('claim');
  s.publish({contracts:{status:'ready',contracts:[]}});
  assert.equal(runtime.getState().status,'active');
  assert.equal((await runtime.act('claim')).status,'unavailable');assert.equal(submissions,1);
  finish({status:'unknown'});assert.equal((await original).status,'unknown');
  assert.equal(runtime.getState().status,'unavailable');
  assert.equal((await runtime.act('claim')).status,'unavailable');assert.equal(submissions,1);
  runtime.dispose();
});
test('unavailable projection is distinct from empty; wallet/network replacement makes an old offer ineligible',async()=>{
  const s=setup(),runtime=createTreasureRuntime({accountHost:s.host,storage:s.storage});startApproved(runtime);await tick();s.publish({contracts:{status:'unavailable',contracts:[]}});assert.equal(runtime.getState().status,'unavailable');
  s.publish({account:{playerWallet:{profileId:'player',network:'mutinynet'},gameWallet:{profileId:'game',network:'signet'}}});assert.equal(runtime.getState().status,'no-offer');assert.equal((await runtime.act('claim')).status,'unavailable');runtime.dispose();
});
