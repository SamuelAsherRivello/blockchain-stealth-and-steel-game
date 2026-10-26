import test from 'node:test';
import assert from 'node:assert/strict';
import {createTreasureUi} from '../../runtime/ui/treasure-ui.js';
import {treasureMessage} from '../../runtime/integration/treasure-session.js';
class Element extends EventTarget {
 constructor(tag,doc){super();this.tagName=tag;this.doc=doc;this.children=[];this.style={};this.attributes=new Map();this.parentNode=null;this.isConnected=false;this._text='';}
 set textContent(value){this._text=value;this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 append(...children){for(const child of children){child.parentNode=this;child.isConnected=true;this.children.push(child);}}
 setAttribute(key,value){this.attributes.set(key,value);}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(child=>child!==this);this.parentNode=null;this.isConnected=false;}
 focus(){this.doc.activeElement=this;}
 querySelectorAll(){return descendants(this).filter(child=>child.tagName==='button'&&!child.disabled);}
}
const descendants=node=>node.children.flatMap(child=>[child,...descendants(child)]);
const click=button=>button.dispatchEvent(new Event('click'));
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
function setup(t){
 const timers=[];t.mock.method(globalThis,'setInterval',callback=>{timers.push(callback);return timers.length;});t.mock.method(globalThis,'clearInterval',()=>{});
 let clock=0,nextTimeout=0;const timeouts=[];
 const schedule=(callback,delay)=>{const timer={id:++nextTimeout,due:clock+delay,callback,cancelled:false};timeouts.push(timer);return timer.id;};
 const unschedule=id=>{const timer=timeouts.find(item=>item.id===id);if(timer)timer.cancelled=true;};
 const advance=ms=>{clock+=ms;let next;while((next=timeouts.filter(timer=>!timer.cancelled&&timer.due<=clock).sort((a,b)=>a.due-b.due)[0])){next.cancelled=true;next.callback();}};
 const doc={createElement:tag=>new Element(tag,doc)},host=doc.createElement('div'),screen=doc.createElement('div');host.isConnected=true;
 const pauses=new Set(['another-menu']),listeners=new Set(),sounds=[];let state={status:'active',remainingSeconds:90};let action=async()=>({status:'pending'}),inspection=async()=>{},calls=0,inspections=0;
 const session={getState:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},inspect:()=>{inspections++;return inspection();},act:async kind=>{calls++;return action(kind);}};
 const ui=createTreasureUi({host,screenLayer:screen,pauseController:{pause:key=>pauses.add(key),resume:key=>pauses.delete(key)},session,documentRef:doc,playSound:name=>sounds.push(name),now:()=>clock,setTimeoutRef:schedule,clearTimeoutRef:unschedule});
 const button=text=>descendants(host).find(node=>node.tagName==='button'&&node.textContent===text);
 return {ui,host,doc,pauses,timers,timeouts,advance,button,sounds,setState:value=>{state={...state,...value};listeners.forEach(fn=>fn());},setAction:fn=>{action=fn;},setInspection:fn=>{inspection=fn;},calls:()=>calls,inspections:()=>inspections};
}
test('treasure sound plays once each time the chest window opens',t=>{
 const s=setup(t);s.ui.open();s.ui.open();assert.deepEqual(s.sounds,['treasure']);
 click(s.button('Back'));s.ui.open();assert.deepEqual(s.sounds,['treasure','treasure']);s.ui.dispose();
});
test('all treasure messages and action eligibility update in one open game window',t=>{
 const s=setup(t);s.ui.open();assert.equal(s.doc.activeElement,s.button('Back'));
 assert.ok(s.host.textContent.includes('Limited Time Offer: Treasure found — Claim 1,000 sats?'));
 assert.ok(s.host.textContent.includes('90 secs remaining ...'));
 for(const status of ['preparing','active','unverified','expired','missing-player','no-offer','unavailable','pending','claimed','rejected']){
  s.setState({status});assert.ok(s.host.textContent.includes(treasureMessage(status)));
  assert.equal(s.button('Claim').disabled,status!=='active');assert.equal(s.button('Reject').disabled,status!=='active');
  assert.equal(s.button('Claim').hidden,['missing-player','claimed','rejected'].includes(status));
 }
 click(s.button('Back'));assert.equal(s.ui.isOpen,false);assert.deepEqual([...s.pauses],['another-menu']);s.ui.dispose();
});
test('slow status inspection keeps chest presentation, Back and Escape responsive without countdown reads',async t=>{
 const s=setup(t),finish=[];s.setInspection(()=>new Promise(resolve=>finish.push(resolve)));
 s.ui.open();assert.equal(s.ui.isOpen,true);assert.ok(s.host.textContent.includes('Limited Time Offer: Treasure found — Claim 1,000 sats?'));
 assert.equal(s.inspections(),0);await Promise.resolve();assert.equal(s.inspections(),1);for(const timer of s.timers)timer();assert.equal(s.inspections(),1);
 click(s.button('Back'));assert.equal(s.ui.isOpen,false);s.ui.open();assert.equal(s.ui.isOpen,true);await Promise.resolve();assert.equal(s.inspections(),1);
 const escape=new Event('keydown',{cancelable:true});escape.key='Escape';s.host.children.at(-1).dispatchEvent(escape);
 assert.equal(s.ui.isOpen,false);for(const resolve of finish)resolve();await tick();s.ui.dispose();
});
test('inspection feedback waits 300 ms, offers coalesced Check status after 10 seconds, and never submits a financial action',async t=>{
 const s=setup(t),finish=[];s.setInspection(()=>new Promise(resolve=>finish.push(resolve)));s.ui.open();
 const loading=()=>descendants(s.host).find(node=>node.className==='menu-prose treasure-feedback treasure-loading');
 assert.equal(s.button('Check status').hidden,true);assert.equal(loading().hidden,true);
 s.advance(299);assert.equal(loading().hidden,true);
 s.advance(1);assert.equal(loading().hidden,false);
 s.advance(9700);assert.ok(s.host.textContent.includes('Treasure status is taking longer than expected.'));assert.equal(s.button('Check status').hidden,false);
 await Promise.resolve();assert.equal(s.inspections(),1);click(s.button('Check status'));await Promise.resolve();assert.equal(s.inspections(),1);assert.equal(s.calls(),0);
 finish[0]();await tick();assert.equal(s.button('Check status').hidden,true);assert.equal(loading().hidden,true);s.ui.dispose();
});
test('completed inspection clears its visible loading notice without another click',async t=>{
 const s=setup(t);let finish;s.setInspection(()=>new Promise(resolve=>{finish=resolve;}));
 s.ui.open();await Promise.resolve();s.advance(500);
 const loading=()=>descendants(s.host).find(node=>node.className==='menu-prose treasure-feedback treasure-loading');
 assert.equal(loading().hidden,false);finish();await tick();
 assert.equal(loading().hidden,true);assert.equal(s.button('Check status').hidden,true);
 assert.equal(s.ui.isOpen,true);assert.equal(s.calls(),0);s.ui.dispose();
});

test('reopening or checking a delayed inspection retains feedback and completion clears the current window',async t=>{
 const s=setup(t);let finish;s.setInspection(()=>new Promise(resolve=>{finish=resolve;}));
 s.ui.open();await Promise.resolve();s.advance(11000);click(s.button('Back'));s.ui.open();
 const delayed=()=>descendants(s.host).find(node=>node.className==='menu-prose treasure-feedback treasure-delayed');
 assert.equal(delayed().hidden,false);assert.equal(s.button('Check status').hidden,false);
 click(s.button('Check status'));await Promise.resolve();
 assert.equal(delayed().hidden,false);assert.equal(s.button('Check status').hidden,false);assert.equal(s.inspections(),1);
 finish();await tick();assert.equal(delayed().hidden,true);assert.equal(s.button('Check status').hidden,true);
 assert.equal(s.ui.isOpen,true);assert.equal(s.calls(),0);s.ui.dispose();
});

test('accepted Claim and Reject close only the treasure pause and reject duplicate clicks',async t=>{
 for(const kind of ['Claim','Reject']){
  const s=setup(t);let finish;s.setAction(()=>new Promise(resolve=>{finish=resolve;}));s.ui.open();
  click(s.button(kind));click(s.button(kind));assert.equal(s.calls(),1);assert.equal(s.ui.isOpen,true);
  finish({status:'pending'});await tick();assert.equal(s.ui.isOpen,false);assert.deepEqual([...s.pauses],['another-menu']);s.ui.dispose();
 }
});
test('a late action cannot close a newly reopened chest window',async t=>{
 const s=setup(t);let finish;s.setAction(()=>new Promise(resolve=>{finish=resolve;}));s.ui.open();click(s.button('Claim'));
 click(s.button('Back'));s.ui.open();finish({status:'pending'});await tick();
 assert.equal(s.ui.isOpen,true);assert.ok(s.pauses.has('treasure'));s.ui.dispose();
});
test('keyboard and touch events stay inside the treasure window and Escape releases only its pause',t=>{
 const s=setup(t);s.ui.open();const backdrop=s.host.children[0];
 for(const type of ['keydown','keyup','pointerdown','pointerup','touchstart','touchend']){
  const event=new Event(type,{cancelable:true});let stopped=false;event.stopPropagation=()=>{stopped=true;};backdrop.dispatchEvent(event);assert.equal(stopped,true);
 }
 const tab=new Event('keydown',{cancelable:true});tab.key='Tab';backdrop.dispatchEvent(tab);assert.ok(descendants(backdrop).includes(s.doc.activeElement));assert.equal(tab.defaultPrevented,true);
 const escape=new Event('keydown',{cancelable:true});escape.key='Escape';backdrop.dispatchEvent(escape);assert.equal(s.ui.isOpen,false);assert.deepEqual([...s.pauses],['another-menu']);s.ui.dispose();
});

