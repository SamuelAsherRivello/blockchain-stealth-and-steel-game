// Synthetic menu-only fixture. Not wallet acceptance or a production BIS adapter.
import {createLevelCompleteUi} from '../../runtime/ui/level-complete-ui.js';
import {createLevelReward} from '../../runtime/integration/level-reward.js';
const mode=new URLSearchParams(location.search).get('mode')??'success';
let calls=0,nexts=0,restarts=0,state,flow;
const listeners=new Set();
const publish=value=>{state={...state,...value};listeners.forEach(fn=>fn({rewards:[state]}));};
const bis={
  beginReward:()=>state={workflowId:'fixture',status:mode==='guest'?'guest':mode==='owned'?'owned':'available',canCollect:!['guest','owned'].includes(mode),busy:false,canCheck:false,needsAcknowledgment:false,message:mode==='guest'?'Log in to collect this trophy.':''},
  refreshRewardAsync:async()=>{},
  async collectRewardAsync(){calls++;publish({status:'pending',busy:true,canCollect:false});await new Promise(resolve=>setTimeout(resolve,500));
    if(mode==='uncertain')publish({status:'uncertain',busy:false,canCheck:true,message:'Synthetic unknown outcome; check status.'});
    else if(mode==='error')publish({status:'error',busy:false,needsAcknowledgment:true,message:'Synthetic insufficient funds.'});
    else publish({status:'owned',busy:false,message:'Synthetic fixture collected.'});
  },
  checkRewardAsync:async()=>publish({status:'owned',busy:false,canCheck:false}),
  acknowledgeRewardAsync:async()=>publish({needsAcknowledgment:false}),endReward(){},
};
const accountHost={readyAsync:async()=>bis,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
const ui=createLevelCompleteUi({host:document.getElementById('host'),onCollect:()=>flow.collect(),onCheck:()=>flow.check(),onAcknowledge:()=>flow.acknowledge(),onContinue:()=>flow.next(),onRestart:()=>flow.restart()});
flow=createLevelReward({accountHost,ui,progress:{current:1,completed:0,total:2,hasNext:true,advance:()=>nexts++,restart:()=>restarts++},gold:{collected:7,total:15}});
flow.show();
Object.assign(window,{completionFixture:{calls:()=>calls,nexts:()=>nexts,restarts:()=>restarts}});
window.addEventListener('pagehide',()=>{flow.dispose();ui.dispose();},{once:true});
