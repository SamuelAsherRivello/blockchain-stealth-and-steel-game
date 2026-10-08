import test from 'node:test';
import assert from 'node:assert/strict';
import {createBisAccount} from '../../runtime/integration/bis-account.js';
import {createPauseController} from '../../runtime/ui/pause-controller.js';
class Element extends EventTarget {
  children=[];hidden=false;inert=false;
  append(...items){for(const item of items){item.parent=this;this.children.push(item);}}
  setAttribute(){} focus(){} querySelectorAll(){return [];} contains(el){return el===this||this.children.some(c=>c.contains(el));}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
}
function fixture({load,ready=Promise.resolve(),timeoutMs=100,getBisGame}={}) {
  const documentRef=new EventTarget();documentRef.createElement=()=>new Element();
  const host=new Element(),other=new Element();host.append(other);let closes=0,restarts=0,creates=0,mounts=0,disposals=0;
  let state={view:'empty',phase:'active'};const listeners=new Set(),events=new Set();
  const publish=view=>{state={view};for(const listener of listeners)listener();};
  const setProfile=profileId=>{state={...state,...(profileId?{profileId}:{})};if(!profileId)delete state.profileId;for(const listener of listeners)listener();};
  const context={getState:()=>state,ready:()=>ready,subscribe:l=>{listeners.add(l);return()=>listeners.delete(l);},onEvent:l=>{events.add(l);return()=>events.delete(l);},openAccountDialog:()=>publish('account'),dispose:()=>{disposals++;}};
  const api={createBisContext:()=>{creates++;return context;},createBisUi:()=>({mount:()=>mounts++,unmount:()=>mounts--})};
  const pause=createPauseController();pause.pause('settings');
  const adapter=createBisAccount({host,pauseController:pause,documentRef,load:load??(()=>Promise.resolve(api)),timeoutMs,onClose:()=>closes++,restartGame:()=>restarts++,getBisGame});
  const overlay=host.children[1],back=overlay.children[0].children[1];
  return {adapter,api,publish,setProfile,emit:e=>{for(const listener of events)listener(e);},back,overlay,pause,other,counts:()=>({closes,restarts,creates,mounts,disposals,listeners:listeners.size,events:events.size})};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('initial hydration stays open; duplicate opens reuse one context; nested Back does not close',async()=>{
 let release;const f=fixture({ready:new Promise(r=>release=r)});const work=f.adapter.open();await flush();
 assert.equal(f.overlay.children[0].hidden,true);
 assert.equal(f.overlay.children[0].children[0].textContent,'');
 f.publish('empty');await flush();assert.equal(f.adapter.isOpen,true);release();await work;
 await f.adapter.open();assert.equal(f.counts().creates,1);assert.equal(f.counts().mounts,1);assert.equal(f.other.inert,true);
 f.publish('account');await flush();assert.equal(f.counts().closes,0);
 f.publish('empty');await flush();assert.equal(f.counts().closes,1);assert.equal(f.pause.isPaused,true);assert.equal(f.other.inert,false);
 await f.adapter.open();assert.equal(f.counts().creates,1);f.adapter.dispose();assert.equal(f.counts().listeners,0);assert.equal(f.counts().events,0);assert.equal(f.counts().mounts,0);
});
test('loading timeout and import failure retain Back and never block final gameplay resume',async()=>{
 for(const load of [()=>new Promise(()=>{}),()=>Promise.reject(Error('fixture failure'))]){
 const f=fixture({load,timeoutMs:5});await f.adapter.open();assert.equal(f.overlay.hidden,false);assert.match(f.overlay.children[0].children[0].textContent,/unavailable/);
 f.back.dispatchEvent(new Event('click'));assert.equal(f.counts().closes,1);f.pause.resume('settings');assert.equal(f.pause.isPaused,false);f.adapter.dispose();}
});
test('dispose during import or hydration prevents late mounting',async()=>{
 let release;const f=fixture({ready:new Promise(r=>release=r)});const work=f.adapter.open();await flush();f.adapter.dispose();release();await work;assert.equal(f.counts().mounts,0);assert.equal(f.counts().disposals,1);
 let finish;const g=fixture({load:()=>new Promise(r=>finish=r)});const pending=g.adapter.open();g.adapter.dispose();finish(g.api);await pending;assert.equal(g.counts().creates,0);
});
test('restart is host-owned and deduplicated without returning to Settings or resuming',async()=>{
 const f=fixture();await f.adapter.open();f.publish('empty');f.emit({type:'restartRequested',reason:'logout',logoutId:'one'});f.emit({type:'restartRequested',reason:'logout',logoutId:'one'});await flush();
 assert.equal(f.counts().restarts,1);assert.equal(f.counts().closes,0);assert.equal(f.pause.isPaused,true);f.adapter.dispose();
});
test('the standalone account reads its game recipient from the local BIS game wallet', async () => {
 const f = fixture(); const create = f.api.createBisContext; let options;
 f.api.createBisContext = value => { options = value; return create(value); };
 f.api.createBisGameWallet = () => ({getState:()=>({addresses:{arkadeAddress:'tark1local-game-recipient'}}),dispose(){}});
 try { await f.adapter.open(); assert.equal(options.continueRecipient,'tark1local-game-recipient'); }
 finally { f.adapter.dispose(); }
});
test('exposes the active player profile independently of any game controller state', async () => {
 const f=fixture();await f.adapter.ready();
 assert.equal(f.adapter.getPlayerProfileId(),undefined);
 f.setProfile('saved-player');
 assert.equal(f.adapter.getPlayerProfileId(),'saved-player');
 f.setProfile(undefined);
 assert.equal(f.adapter.getPlayerProfileId(),undefined);
  f.adapter.dispose();
});

test('reports item support from an active Player Wallet without requiring a Game Wallet', async () => {
 const f=fixture();await f.adapter.ready();
 assert.equal(f.adapter.hasItemSupport(), false);
 f.setProfile('saved-player');
 assert.equal(f.adapter.hasItemSupport(), true);
 f.adapter.dispose();
});

test('item support becomes unavailable when the Player Wallet is no longer active', async () => {
 const f=fixture();await f.adapter.ready();f.setProfile('saved-player');
 f.publish('empty');
 assert.equal(f.adapter.hasItemSupport(), false);
 f.adapter.dispose();
});

test('new wallet-backed capabilities default to false when the adapter has no BIS service methods', async () => {
 const f=fixture();await f.adapter.ready();
 assert.equal(f.adapter.hasAssetMintingSupport(), false);
 assert.equal(f.adapter.hasContractSupport(), false);
 f.adapter.dispose();
});
test('uses the current BisService facade with the game-owned IBisGame getter', async () => {
 const game={getActiveGameSession:()=>undefined};let captured,mounts=0,disposals=0;
 const context={getState:()=>({view:'empty'}),ready:()=>Promise.resolve(),subscribe:()=>()=>{},onEvent:()=>()=>{},openAccountDialog:()=>{},dispose:()=>{}};
 class BisService {
   constructor(options){captured=options;this.context=context;this.gameWallet={};this.lto={};}
   ready(){return context.ready();} mount(){mounts++;} dispose(){disposals++;}
 }
 const f=fixture({getBisGame:()=>game,load:()=>Promise.resolve({BisService})});
 await f.adapter.open();
 assert.equal(captured.getBisGame(),game);
 assert.equal(mounts,1);
 f.adapter.dispose();
 assert.equal(disposals,1);
});
test('reports treasure readiness only when player and game wallet setup are usable', async () => {
 const f = fixture();
 const wallet = {getState:()=>({profileId:'saved-game',status:'ready'}),dispose(){}};
 f.api.createBisGameWallet = () => wallet;
 await f.adapter.ready();
 assert.equal(f.adapter.isTreasureReady(), false);
 f.setProfile('saved-player');
 assert.equal(f.adapter.isTreasureReady(), true);
 f.adapter.dispose();
});
test('a disposed account adapter ignores its stale restart event while its replacement remains usable',async()=>{
 const first=fixture();await first.adapter.open();first.adapter.dispose();first.emit({type:'restartRequested',logoutId:'old'});await flush();
 assert.equal(first.counts().restarts,0);
 const replacement=fixture();await replacement.adapter.open();replacement.emit({type:'restartRequested',logoutId:'fresh'});await flush();
 assert.equal(replacement.counts().restarts,1);replacement.adapter.dispose();
});

test('game signer and LTO reuse one BIS session while the toast mount remains passive',async()=>{
 const f=fixture(),disposed=[],wallet={getState:()=>({profileId:'saved-game'}),dispose:()=>disposed.push('wallet')};
 let creates=0,ltoOptions,walletOptions;
 f.api.createBisGameWallet=options=>{walletOptions=options;creates++;return wallet;};
 f.api.createBisLto=options=>{ltoOptions=options;return {dispose:options=>disposed.push(options)};};
 const first=await f.adapter.ready(),second=await f.adapter.ready();
 assert.equal(first,second);assert.equal(creates,1);assert.equal('serviceUrl' in walletOptions,false);assert.equal(ltoOptions.context,first.context);assert.equal(ltoOptions.gameWallet,wallet);
 assert.equal(f.overlay.hidden,false);assert.match(f.overlay.className,/game-account-passive/);assert.equal(f.counts().mounts,1);
 await f.adapter.open();f.back.dispatchEvent(new Event('click'));assert.match(f.overlay.className,/game-account-passive/);assert.equal(f.counts().mounts,1);
 f.adapter.dispose({preserveContracts:true});assert.deepEqual(disposed,[{endSessions:false},'wallet']);assert.equal(f.counts().mounts,0);
});
