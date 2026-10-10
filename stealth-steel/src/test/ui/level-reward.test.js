import test from 'node:test';
import assert from 'node:assert/strict';
import {createLevelReward,trophyForLevel} from '../../runtime/integration/level-reward.js';
import {createLevelCompleteUi} from '../../runtime/ui/level-complete-ui.js';
class Element extends EventTarget {
  children=[];hidden=false;parentNode=null;_text='';
  set textContent(value){this._text=value;this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  append(...children){for(const child of children){child.parentNode=this;this.children.push(child);}}
  setAttribute(){}focus(){}remove(){this.parentNode?.children.splice(this.parentNode.children.indexOf(this),1);}
}
const documentRef={createElement:()=>new Element()};
const completionTitle = ui => ui.panel.children[0].children[0].children[0].children[0].textContent;
const completionBody = ui => ui.panel.children[0].children[1].children[0].children[0].textContent;
test('reordered completion counts maps played and retains trophy identity', async () => {
  let snapshot, asset;
  const flow = createLevelReward({
    ui: {setCompletion: value => snapshot = value, show() {}, setState() {}},
    progress: {current: 3, completed: 0, total: 3, hasNext: true},
    gold: {collected: 0, total: 10},
    accountHost: {readyAsync: async () => ({beginReward: value => { asset = value.asset; throw new Error('guest'); }})},
  });
  flow.show();
  await Promise.resolve();
  assert.equal(snapshot.levelsCompleted, 1);
  assert.equal(snapshot.levelNumber, 3);
  assert.equal(asset.ticker, 'LVL3');
  flow.dispose();
});
test('completion snapshot renders exact level/final bodies and action gating',()=>{
  const host=new Element();let collects=0,next=0,restarts=0;
  const ui=createLevelCompleteUi({host,documentRef,onCollect:()=>collects++,onContinue:()=>next++,onRestart:()=>restarts++});
  ui.setCompletion({levelNumber:1,totalLevels:2,hasNext:true,collected:3,total:100});ui.show();
  assert.equal(completionTitle(ui),'Completed');assert.match(completionBody(ui),/03\/100 gold/);
  ui.setState({canCollect:true,status:'available',message:''});ui.collectButton.dispatchEvent(new Event('click'));assert.equal(collects,1);
  ui.setState({busy:true});for(const b of [ui.collectButton,ui.continueButton,ui.restartButton]){assert.equal(b.disabled,true);b.dispatchEvent(new Event('click'));}assert.equal(collects,1);assert.equal(next+restarts,0);
  ui.setState({busy:false,status:'owned',canCollect:false});assert.equal(ui.backdrop.hidden,false);assert.equal(ui.continueButton.disabled,false);
  assert.equal(completionBody(ui),'Great Job. You collected 03/100 gold and reached the exit. You already own this trophy.');
  assert.ok(!ui.panel.children.some(child=>child.className==='level-complete-status'));
  ui.setCompletion({levelNumber:2,levelsCompleted:2,totalLevels:2,hasNext:false});assert.equal(completionTitle(ui),'Game Completed');assert.match(completionBody(ui),/2\/2 levels/);assert.equal(ui.continueButton.hidden,true);assert.equal(ui.restartButton.textContent,'Restart Game');ui.dispose();
});
test('flow snapshots HUD and late initialization cannot attach to a disposed screen',async()=>{
  let resolve,begins=0,snapshot,shows=0;
  const ui={setCompletion:v=>snapshot=v,show:()=>shows++,setState:()=>{throw Error('late UI write');}};
  const flow=createLevelReward({ui,progress:{current:2,total:2,hasNext:false},gold:{collected:42,total:99},accountHost:{readyAsync:()=>new Promise(r=>resolve=r)}});
  flow.show();flow.show();flow.dispose();resolve({beginReward:()=>begins++});await new Promise(r=>setTimeout(r,0));
  assert.equal(shows,1);assert.equal(snapshot.collected,42);assert.equal(snapshot.total,99);assert.equal(begins,0);
});
test('unconfigured trophy never initializes wallet and navigation remains available',()=>{
  assert.equal(trophyForLevel(4),null);let next=0;const states=[];
  const flow=createLevelReward({ui:{show(){},setCompletion(){},setState:s=>states.push(s)},progress:{current:4,total:5,hasNext:true,advance:()=>next++},gold:{collected:0,total:0},accountHost:{readyAsync:()=>{throw Error('wallet called');}}});
  flow.show();flow.next();assert.equal(next,1);assert.equal(states[0].canCollect,false);flow.dispose();
});

test('all three trophy requests retain metadata and use individual reward state without Game-Wallet gate',async()=>{
  for(const level of [1,2,3]){
    let request,state={workflowId:'reward',status:'available',canCollect:true,busy:false,needsAcknowledgment:false},nexts=0,restarts=0;const listeners=new Set(),calls=[],states=[];
    const publish=value=>{state={...state,...value};listeners.forEach(fn=>fn({rewards:[state]}));};
    const bis={beginReward:value=>{request=value;return state;},refreshRewardAsync:async id=>calls.push(['refresh',id]),collectRewardAsync:async id=>{calls.push(['collect',id]);publish({status:'pending',busy:true});},checkRewardAsync:async id=>calls.push(['check',id]),acknowledgeRewardAsync:async id=>{calls.push(['ack',id]);publish({needsAcknowledgment:false});},endReward:id=>calls.push(['end',id])};
    const flow=createLevelReward({accountHost:{readyAsync:async()=>bis,hasAssetMintingSupport:()=>false,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}},
      ui:{show(){},setCompletion(){},setState:value=>states.push(value)},progress:{current:level,total:3,advance:()=>nexts++,restart:()=>restarts++},gold:{collected:0,total:1}});
    flow.show();await Promise.resolve();await Promise.resolve();assert.deepEqual(request.asset,trophyForLevel(level));assert.equal(request.asset.amount,'1');assert.equal(states.at(-1).canCollect,true);
    await flow.collect();flow.next();flow.restart();assert.equal(nexts+restarts,0);
    publish({status:'uncertain',busy:false,canCollect:false,canCheck:true});await flow.check();assert.ok(calls.some(([command])=>command==='check'));
    publish({status:'error',needsAcknowledgment:true});flow.next();assert.equal(nexts,0);await flow.acknowledge();flow.next();assert.equal(nexts,1);
    publish({status:'owned',canCollect:false});assert.equal(states.at(-1).canCollect,false);flow.dispose();assert.equal(listeners.size,0);assert.deepEqual(calls.at(-1),['end','reward']);
  }
});
