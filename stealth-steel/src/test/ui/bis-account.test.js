import test from 'node:test';
import assert from 'node:assert/strict';
import {createBisAccount} from '../../runtime/integration/bis-account.js';
import {createPauseController} from '../../runtime/ui/pause-controller.js';
class Element extends EventTarget {
  children=[];hidden=false;inert=false;
  append(...items){for(const item of items){item.remove();item.parentElement=this;this.children.push(item);}}
  setAttribute(){} focus(){} querySelectorAll(){return [];} contains(el){return el===this||this.children.some(c=>c.contains(el));}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(c=>c!==this);this.parentElement=null;}
}
const flush=()=>new Promise(r=>setImmediate(r));
function fixture({load,ready=Promise.resolve(),timeoutMs=100}={}) {
  const documentRef=new EventTarget();documentRef.createElement=()=>new Element();
  const host=new Element(),other=new Element();host.append(other);
  let closes=0,restarts=0,creates=0,mounts=0,disposals=0,options,adapter;
  let snapshot={account:{visible:false,hasProfile:false,phase:'idle'},capabilities:{items:{available:false},assetMinting:{available:false},contracts:{available:false},payments:{available:false}},equipment:{status:'unavailable'},continuations:[],rewards:[],contracts:{status:'unavailable',contracts:[]}};
  const game={onBisEvent:event=>adapter.onBisEvent(event)};
  class BisService {
    mounted=false;
    constructor(value){creates++;options=value;}
    readyAsync(){return ready;}
    mount(){mounts++;this.mounted=true;}
    getSnapshot(){return snapshot;}
    openAccountDialog(){snapshot={...snapshot,account:{...snapshot.account,visible:true}};}
    hasItemSupport(){return snapshot.capabilities.items.available;}
    hasAssetMintingSupport(){return snapshot.capabilities.assetMinting.available;}
    hasContractSupport(){return snapshot.capabilities.contracts.available;}
    hasPaymentSupport(){return snapshot.capabilities.payments.available;}
    dispose(){disposals++;if(this.mounted){mounts--;this.mounted=false;}}
  }
  const api={BisService},pause=createPauseController();pause.pause('settings');
  adapter=createBisAccount({host,pauseController:pause,documentRef,load:load??(()=>Promise.resolve(api)),timeoutMs,onClose:()=>closes++,restartGame:()=>restarts++,getBisGame:()=>game});
  const overlay=host.children[1],back=overlay.children[0].children[1];
  const emit=event=>options?.getBisGame().onBisEvent(event);
  return {adapter,api,host,documentRef,game,emit,back,overlay,pause,other,
    publish(value){snapshot={...snapshot,...value};emit({type:'stateChanged',snapshot});},
    counts:()=>({closes,restarts,creates,mounts,disposals}),options:()=>options};
}

test('hydration and safe state changes do not infer Account close; explicit close returns only to Settings',async()=>{
  let release;const f=fixture({ready:new Promise(r=>release=r)});const work=f.adapter.open();await flush();
  assert.equal(f.overlay.children[0].hidden,true);f.publish({account:{visible:false}});assert.equal(f.adapter.isOpen,true);
  release();await work;await f.adapter.open();assert.equal(f.counts().creates,1);assert.equal(f.counts().mounts,1);assert.equal(f.other.inert,true);
  f.publish({account:{visible:false}});await flush();assert.equal(f.counts().closes,0);
  f.emit({type:'accountClosed'});await flush();assert.equal(f.counts().closes,1);assert.equal(f.pause.isPaused,true);assert.equal(f.other.inert,false);
  assert.match(f.overlay.className,/game-account-passive/);await f.adapter.open();f.adapter.dispose();assert.equal(f.counts().mounts,0);
});

test('timeout and failed import retain Back and do not block gameplay resume',async()=>{
  for(const load of [()=>new Promise(()=>{}),()=>Promise.reject(Error('fixture failure'))]){
    const f=fixture({load,timeoutMs:5});await f.adapter.open();assert.match(f.overlay.children[0].children[0].textContent,/unavailable/);
    f.back.dispatchEvent(new Event('click'));assert.equal(f.counts().closes,1);f.pause.resume('settings');assert.equal(f.pause.isPaused,false);f.adapter.dispose();
  }
});

test('failed package loading retries without composing old factories',async()=>{
  let attempts=0,f;f=fixture({load:()=>++attempts===1?Promise.reject(Error('offline')):Promise.resolve(f.api)});
  await f.adapter.open();f.back.dispatchEvent(new Event('click'));await f.adapter.open();assert.equal(f.counts().mounts,1);
  assert.equal('getSession' in f.adapter,false);assert.equal('createEquipment' in f.adapter,false);assert.equal('createContinue' in f.adapter,false);f.adapter.dispose();
});

test('missing modern service is unavailable, never a legacy composition fallback',async()=>{
  const f=fixture({load:async()=>({createBisContext(){throw Error('legacy factory called');}})});
  await f.adapter.open();assert.match(f.overlay.children[0].children[0].textContent,/unavailable/);f.adapter.dispose();
});

test('dispose during import or hydration prevents late mounting',async()=>{
  let release;const f=fixture({ready:new Promise(r=>release=r)});const work=f.adapter.open();await flush();f.adapter.dispose();release();await work;
  assert.equal(f.counts().mounts,0);assert.equal(f.counts().disposals,1);
  let finish;const g=fixture({load:()=>new Promise(r=>finish=r)});const pending=g.adapter.open();g.adapter.dispose();finish(g.api);await pending;assert.equal(g.counts().creates,0);
});

test('Account close followed by stable logout restart neither returns to Settings nor resumes',async()=>{
  const f=fixture();await f.adapter.open();f.emit({type:'accountClosed'});
  f.emit({type:'restartRequested',reason:'logout',logoutId:'one'});f.emit({type:'restartRequested',reason:'logout',logoutId:'one'});await flush();
  assert.equal(f.counts().restarts,1);assert.equal(f.counts().closes,0);assert.equal(f.pause.isPaused,true);f.adapter.dispose();
});

test('uses one typed facade and forwards the original complete host getter',async()=>{
  const f=fixture();const first=await f.adapter.readyAsync(),second=await f.adapter.readyAsync();assert.equal(first,second);assert.equal(f.options().getBisGame(),f.game);
  assert.equal(f.adapter.getBis(),first);assert.equal(f.counts().creates,1);assert.equal(f.counts().mounts,1);f.adapter.dispose({preserveContracts:true});assert.equal(f.counts().disposals,1);
});

test('snapshot capabilities preserve Player-only Items and game-local subscriptions',async()=>{
  const f=fixture();await f.adapter.readyAsync();const seen=[];const unsub=f.adapter.subscribe(value=>seen.push(value));
  f.publish({account:{playerWallet:{profileId:'player'},phase:'active'},capabilities:{items:{available:true},assetMinting:{available:true},contracts:{available:false},payments:{available:true}}});
  assert.equal(f.adapter.getPlayerProfileId(),'player');assert.equal(f.adapter.hasItemSupport(),true);assert.equal(f.adapter.hasAssetMintingSupport(),true);assert.equal(f.adapter.hasContractSupport(),false);assert.equal(seen.length,1);
  unsub();f.publish({account:{},capabilities:{items:{available:false},assetMinting:{available:false},contracts:{available:false},payments:{available:false}}});assert.equal(seen.length,1);assert.equal(f.adapter.hasItemSupport(),false);assert.equal(f.adapter.hasPaymentSupport(),false);f.adapter.dispose();
});

test('stale events cannot restart a disposed adapter or write its views',async()=>{
  const f=fixture();await f.adapter.open();let updates=0;f.adapter.subscribe(()=>updates++);f.adapter.dispose();f.emit({type:'restartRequested',logoutId:'old'});f.publish({});await flush();assert.equal(f.counts().restarts,0);assert.equal(updates,0);
});

test('fullscreen relocation preserves modal blocking and disposal restores interaction',async()=>{
  const f=fixture();await f.adapter.open();const fullscreen=new Element();f.documentRef.fullscreenElement=fullscreen;f.documentRef.dispatchEvent(new Event('fullscreenchange'));assert.equal(f.overlay.parentElement,fullscreen);f.adapter.dispose();assert.equal(f.other.inert,false);
});

test('BIS owns Escape while the host contains keyboard and pointer events',async()=>{
  const f=fixture();await f.adapter.open();for(const type of ['keydown','keyup','pointerdown','pointerup','click','touchstart','touchend']){let stopped=false;const event=new Event(type);event.key='Escape';event.stopPropagation=()=>stopped=true;f.overlay.dispatchEvent(event);assert.equal(stopped,true);}assert.equal(f.adapter.isOpen,true);f.adapter.dispose();
});
