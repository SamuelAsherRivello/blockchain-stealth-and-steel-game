export function trophyForLevel(level) {
  if (![1,2,3].includes(level)) return null;
  return {name:`Achievement: Level ${level}`,ticker:`LVL${level}`,amount:'1',decimals:0,
    iconUrl:`https://samuelasherrivello.github.io/blockchain-integration-service/assets/achievements/v2/level-${level}-trophy.png`};
}

/** @param {{accountHost: ReturnType<typeof import('./bis-account.js').createBisAccount>, ui: any, progress: any, gold: any, showTrophyActions?: () => boolean}} options */
export function createLevelReward({accountHost,ui,progress,gold,showTrophyActions=()=>true}) {
  /** @type {import('@bis/integration').IBis} */
  let bis;
  let workflowId,state,unsubscribe,disposed=false,visible=false,initializing=false;
  /** @param {import('@bis/integration').BisSnapshot} snapshot */
  const update=snapshot=>{if(disposed||!workflowId)return;const next=snapshot.rewards.find(value=>value.workflowId===workflowId);if(next){state=next;ui.setState(next);}};
  const navigation=action=>{
    if(disposed || state?.busy || state?.needsAcknowledgment)return;
    try{action();}catch{ui.setState({status:'error',busy:false,canCollect:false,canCheck:false,needsAcknowledgment:true,message:'Game progress could not be saved. Enable browser storage and try again.'});}
  };
  async function initialize() {
    if(disposed||initializing||workflowId)return;
    const asset=trophyForLevel(progress.current);
    if(!asset){ui.setState({status:'blocked',canCollect:false,canCheck:false,busy:false,message:'No trophy is configured for this level.'});return;}
    initializing=true;
    try{
      const current=await accountHost.ready();
      if(disposed||!current)return;
      bis=current;state=bis.beginReward({asset,successMessage:`Level ${progress.current} Trophy collected!`});workflowId=state.workflowId;
      unsubscribe=accountHost.subscribe(update);ui.setState(state);await bis.refreshReward(workflowId);
    }catch{if(!disposed)ui.setState({status:'error',canCollect:false,canCheck:true,busy:false,message:'Trophies are unavailable. Check again or continue.'});}
    finally{initializing=false;}
  }
  return {
    show(){if(visible||disposed)return;visible=true;const trophyVisible=Boolean(showTrophyActions?.());ui.setCompletion({levelNumber:progress.current,levelsCompleted:progress.completed+1,totalLevels:progress.total,hasNext:progress.hasNext,collected:gold.collected,total:gold.total});ui.show();if(trophyVisible)void initialize();},
    collect:()=>workflowId?bis.collectReward(workflowId):undefined,
    check:()=>workflowId?bis.checkReward(workflowId):initialize(),
    acknowledge(){if(workflowId)return bis.acknowledgeReward(workflowId);ui.setState({needsAcknowledgment:false,message:''});},
    next:()=>navigation(()=>progress.advance()),restart:()=>navigation(()=>progress.restart()),
    dispose(){disposed=true;unsubscribe?.();if(workflowId)bis.endReward(workflowId);workflowId=undefined;},
  };
}
