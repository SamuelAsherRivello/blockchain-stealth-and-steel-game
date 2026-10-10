import test from 'node:test';
import assert from 'node:assert/strict';
import {createPayToContinue} from '../../runtime/integration/pay-to-continue.js';
function fixture() {
  let state={workflowId:'continue-1',sats:1000,canPay:true,status:'idle',message:''},pays=0,restarts=0,visible=false,ended=0;
  const listeners=new Set(),states=[];
  const publish=value=>{state={...state,...value};listeners.forEach(fn=>fn(bis.getSnapshot()));};
  const bis={beginContinuation:()=>state,getSnapshot:()=>({continuations:[state]}),endContinuation:()=>ended++,
    payContinuationAsync:async id=>{assert.equal(id,state.workflowId);pays++;publish({status:'pending',canPay:false});return state;},checkContinuationAsync:async()=>state};
  const flow=createPayToContinue({accountHost:{readyAsync:async()=>bis,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}},
    ui:{setState:s=>states.push(s),show:()=>visible=true,hide:()=>visible=false},restart:()=>restarts++});
  return {flow,states,publish,stats:()=>({pays,restarts,visible,ended,listeners:listeners.size})};
}
test('named continuation commands preserve BIS price, pending guard and one applied-receipt dismissal',async()=>{
  const f=fixture();await f.flow.show();assert.equal(f.states.at(-1).sats,1000);await f.flow.pay();f.flow.restart();assert.equal(f.stats().restarts,0);
  f.publish({effectReceipt:{status:'not-applicable'}});assert.equal(f.stats().visible,true);
  f.publish({effectReceipt:{status:'applied'}});f.publish({effectReceipt:{status:'applied'}});assert.equal(f.stats().visible,false);assert.equal(f.stats().ended,1);assert.equal(f.stats().listeners,0);f.flow.dispose();
});
test('disposal or free restart ends only its workflow and drops late snapshots',async()=>{
  for(const end of ['dispose','restart']){const f=fixture();await f.flow.show();f.flow[end]();f.publish({effectReceipt:{status:'applied'}});assert.equal(f.stats().visible,true);assert.equal(f.stats().ended,1);}
});
test('late BIS readiness cannot begin a workflow for a disposed loss screen',async()=>{
  let release,begins=0;const flow=createPayToContinue({accountHost:{readyAsync:()=>new Promise(resolve=>release=resolve)},ui:{show(){},setState(){},hide(){}},restart(){}});
  const work=flow.show();flow.dispose();release({beginContinuation(){begins++;}});await work;assert.equal(begins,0);
});
test('unavailable BIS leaves ordinary free restart available',async()=>{
  let restart=0,state;const flow=createPayToContinue({accountHost:{readyAsync:async()=>{throw Error('offline');}},ui:{show(){},setState:value=>state=value},restart:()=>restart++});await flow.show();assert.equal(state.canPay,false);flow.restart();assert.equal(restart,1);
});
