import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreasureSession} from '../../runtime/integration/treasure-session.js';
import {createTreasureFundingConsent} from '../../runtime/ui/treasure-funding-consent.js';

const tick=()=>new Promise(resolve=>setTimeout(resolve,0));

test('funding approval is invalidated when the public signing source changes, including before submission',async()=>{
  for(const initial of [undefined,'manual','server'])for(const next of ['manual','server']){
    if(initial===next)continue;
    for(const afterApproval of [false,true]){
      const f=fixture();f.snapshot.account.gameWallet.source=initial;f.session.start();
      const id=f.session.getState().sessionId;
      assert.equal(f.session.getState().fundingConsent.gameSource,initial);
      if(afterApproval)assert.equal(f.session.acceptFundingConsent(id).status,'accepted');
      f.snapshot.account.gameWallet.source=next;
      if(!afterApproval)assert.equal(f.session.acceptFundingConsent(id).status,'unavailable');
      await tick();assert.deepEqual(f.calls,[]);f.session.dispose();
    }
  }
});
function fixture(network='signet'){
  let clock=1234,sequence=0;
  const calls=[],snapshot={account:{playerWallet:{profileId:'player-original',network},gameWallet:{profileId:'game-original',network}},capabilities:{contracts:{available:true}}};
  const options={getSnapshot:()=>snapshot,now:()=>clock,newId:()=>`offer-${++sequence}`,offers:{
    start:async request=>{calls.push(['start',request]);return {status:'unavailable'};},
    checkContractsAsync:async()=>{calls.push(['inspect']);return {status:'ready',contracts:[]};},
    claim:async()=>{calls.push(['claim']);return {status:'pending'};},reject:async()=>{calls.push(['reject']);return {status:'pending'};},
    endSession:async id=>calls.push(['end',id]),
  }};
  return {session:createTreasureSession(options),options,calls,snapshot,setNow:value=>{clock=value;}};
}

test('both networks require explicit consent before offer creation, inspection or any financial call',async()=>{
  for(const network of ['signet','mutinynet']){
    const f=fixture(network);f.session.start();
    const consent=f.session.getState().fundingConsent;
    assert.equal(f.session.getState().status,'awaiting-consent');
    assert.equal(consent.network,network);assert.equal(consent.amountSats,1000);
    assert.equal(consent.gameId,'game-original');assert.equal(consent.playerId,'player-original');
    await f.session.inspect();f.session.notify({contracts:{status:'unavailable',contracts:[]}});
    assert.equal((await f.session.act('claim')).status,'unavailable');
    await tick();assert.deepEqual(f.calls,[]);assert.equal(f.session.getState().status,'awaiting-consent');
    f.session.dispose();assert.deepEqual(f.calls,[]);
  }
});

test('acceptance funds once with the original amount and rounded deadline even after time spent deciding',async()=>{
  const f=fixture();f.session.start();const original=f.session.snapshot();f.setNow(31_234);
  assert.equal(f.session.acceptFundingConsent(original.id).status,'accepted');
  assert.equal(f.session.acceptFundingConsent(original.id).status,'unavailable');
  await tick();const starts=f.calls.filter(([kind])=>kind==='start');assert.equal(starts.length,1);
  assert.equal(starts[0][1].amountSats,1000);assert.equal(starts[0][1].startedAt,original.startedAt);
  assert.equal(starts[0][1].expiresAt,original.expiresAt);
  assert.equal(original.expiresAt,(Math.floor(original.startedAt/1000)+90)*1000);
  assert.ok(original.expiresAt-original.startedAt<=90_000);
});

test('decline and ending an unapproved session are non-financial and cannot later be accepted',async()=>{
  const f=fixture();f.session.start();const id=f.session.getState().sessionId;
  assert.equal(f.session.declineFundingConsent(id).status,'declined');
  assert.equal(f.session.acceptFundingConsent(id).status,'unavailable');
  f.session.end();await tick();assert.deepEqual(f.calls,[]);
});

test('late consent never extends the original deadline or creates an offer',async()=>{
  for(const offset of [0,1]){
    const f=fixture();f.session.start();const original=f.session.snapshot();f.setNow(original.expiresAt+offset);
    assert.equal(f.session.acceptFundingConsent(original.id).status,'too-late');
    assert.equal(f.session.snapshot().expiresAt,original.expiresAt);await tick();assert.deepEqual(f.calls,[]);
  }
});

test('a replaced wallet or network cannot reuse the previous consent',async()=>{
  for(const role of ['playerWallet','gameWallet'])for(const patch of [{profileId:'replacement'},{network:'mutinynet'}]){
    const f=fixture();f.session.start();const original=f.session.snapshot();
    Object.assign(f.snapshot.account[role],patch);
    assert.equal(f.session.acceptFundingConsent(original.id).status,'unavailable');await tick();assert.deepEqual(f.calls,[]);
  }
  const f=fixture();f.session.start();f.session.acceptFundingConsent(f.session.getState().sessionId);
  f.snapshot.account.gameWallet.profileId='changed-between-click-and-submit';await tick();assert.deepEqual(f.calls,[]);
});

test('stale approval or close cannot approve or decline a replacement offer',async()=>{
  const f=fixture();f.session.start();const first=f.session.getState().sessionId;f.session.start();
  const second=f.session.getState().sessionId;assert.notEqual(first,second);
  assert.equal(f.session.acceptFundingConsent(first).status,'unavailable');
  assert.equal(f.session.declineFundingConsent(first).status,'unavailable');
  assert.equal(f.session.getState().status,'awaiting-consent');await tick();assert.deepEqual(f.calls,[]);
});

test('restoring cached consent never authorizes new funding while original-contract recovery stays available',async()=>{
  const f=fixture();f.session.start();const saved={...f.session.snapshot(),fundingStarted:true,status:'active',offered:true,contractId:'original-contract'};
  const restored=createTreasureSession(f.options);assert.equal(restored.restore(saved),true);
  assert.equal(restored.getState().status,'unverified');assert.equal(restored.acceptFundingConsent(saved.id).status,'unavailable');
  await restored.inspect();assert.deepEqual(f.calls,[['inspect']]);
});

class Element extends EventTarget{
  constructor(tag,doc){super();this.tagName=tag;this.doc=doc;this.children=[];this.style={};this.attributes=new Map();this.parentNode=null;this.isConnected=false;this._text='';}
  set textContent(value){this._text=value;this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
  append(...children){for(const child of children){child.parentNode=this;child.isConnected=true;this.children.push(child);}}
  setAttribute(key,value){this.attributes.set(key,value);}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(child=>child!==this);this.parentNode=null;this.isConnected=false;}
  focus(){this.doc.activeElement=this;}
  querySelectorAll(){return descendants(this).filter(child=>child.tagName==='button'&&!child.disabled);}
}
const descendants=node=>node.children.flatMap(child=>[child,...descendants(child)]);
function uiFixture(t,network='signet'){
  const timers=[];t.mock.method(globalThis,'setInterval',callback=>{timers.push(callback);return timers.length;});t.mock.method(globalThis,'clearInterval',()=>{});
  const f=fixture(network),doc={createElement:tag=>new Element(tag,doc)},host=doc.createElement('div');host.isConnected=true;
  const pauses=new Set(['other-menu']);
  const ui=createTreasureFundingConsent({host,session:f.session,documentRef:doc,pauseController:{pause:key=>pauses.add(key),resume:key=>pauses.delete(key)}});
  return {...f,host,doc,ui,timers,pauses,button:text=>descendants(host).find(node=>node.tagName==='button'&&node.textContent===text)};
}

test('consent names the public signing source and keeps an explicit fallback for older snapshots',t=>{
  const f=uiFixture(t);
  for(const [source,copy] of [[undefined,'signing source is unavailable'],['server','signing source: server'],['manual','signing source: manual']]){
    f.snapshot.account.gameWallet.source=source;f.session.start();
    assert.ok(f.host.textContent.includes(copy));
    assert.equal(f.host.textContent.includes('Both wallets are yours in this browser'),false);
    f.button('Skip treasure').dispatchEvent(new Event('click'));
  }
  assert.deepEqual(f.calls,[]);f.ui.dispose();f.session.dispose();
});

test('consent UI shows exact terms and Skip, close and Escape never create an offer',async t=>{
  for(const action of ['skip','close','escape']){
    const f=uiFixture(t,'mutinynet');f.session.start();assert.equal(f.ui.isOpen,true);
    assert.match(f.host.textContent,/1,000 sats/);assert.match(f.host.textContent,/Mutinynet/);
    assert.match(f.host.textContent,/Game Wallet/);assert.match(f.host.textContent,/original window/);
    assert.match(f.host.textContent,/zero-fee policy/);assert.match(f.host.textContent,/can sign automatically; another popup is not guaranteed/);
    assert.match(f.host.textContent,/Check Game Wallet Login for the signing source/);
    assert.doesNotMatch(f.host.textContent,/Both wallets are yours in this browser|local browser wallet/);
    assert.equal(f.doc.activeElement,f.button('Skip treasure'),'safe decline is initially focused');
    if(action==='skip')f.button('Skip treasure').dispatchEvent(new Event('click'));
    else if(action==='close')descendants(f.host).find(node=>node.attributes.get('aria-label')==='Close window').dispatchEvent(new Event('click'));
    else {const event=new Event('keydown',{cancelable:true});event.key='Escape';f.host.children[0].dispatchEvent(event);}
    await tick();assert.equal(f.ui.isOpen,false);assert.deepEqual(f.calls,[]);assert.deepEqual([...f.pauses],['other-menu']);f.ui.dispose();
  }
});

test('consent UI approval creates one request and expiration skips without extending terms',async t=>{
  const f=uiFixture(t);f.session.start();const accept=f.button('Fund 1,000 sats');
  accept.dispatchEvent(new Event('click'));accept.dispatchEvent(new Event('click'));await tick();
  assert.equal(f.calls.filter(([kind])=>kind==='start').length,1);assert.equal(f.ui.isOpen,false);f.ui.dispose();
  const expired=uiFixture(t);expired.session.start();const original=expired.session.snapshot();
  expired.setNow(original.expiresAt);expired.timers.forEach(callback=>callback());await tick();
  assert.equal(expired.ui.isOpen,false);assert.deepEqual(expired.calls,[]);assert.equal(expired.session.snapshot().expiresAt,original.expiresAt);expired.ui.dispose();
});
