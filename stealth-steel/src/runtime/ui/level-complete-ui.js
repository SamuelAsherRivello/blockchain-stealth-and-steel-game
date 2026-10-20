import { createMenu } from "./menu.js";

export function createLevelLostUi({ host, onPay, onRestart, frameElement = null, documentRef = globalThis.document }) {
  const menu = createMenu({titleText:'You Lost',bodyText:'Try again!',frameElement,documentRef,
    buttonClicksOnly: true,
    buttons:[{displayText:'Continue (… Sats)',icon:'⚡',className:'level-lost-pay'},{displayText:'Restart Game',className:'level-lost-restart'}]});
  const {backdrop,panel,body,actions,buttons:[payButton,restartButton]} = menu;
  backdrop.className += ' level-complete-backdrop'; panel.className += ' level-complete-panel outcome-loss';
  backdrop.hidden = true; payButton.disabled = true;
  body.setAttribute('role','status'); body.setAttribute('aria-live','polite');
  const pay = () => { if (!payButton.disabled) void onPay(); };
  const restart = () => { if (!restartButton.disabled) onRestart(); };
  const containKey = event => {
    event.stopPropagation();
    if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
    if (event.key === 'Tab') {
      event.preventDefault();
      const enabled = [payButton,restartButton].filter(button => !button.disabled);
      if (enabled.length) enabled[(enabled.indexOf(documentRef.activeElement) + (event.shiftKey ? enabled.length - 1 : 1)) % enabled.length].focus();
    }
  };
  backdrop.addEventListener('keydown',containKey); backdrop.addEventListener('keyup',containKey);
  payButton.addEventListener('click',pay); restartButton.addEventListener('click',restart); host.append(backdrop);
  return {backdrop,panel,actions,payButton,restartButton,
    setState({sats,canPay,status,message,paymentSupported = true}) {
      payButton.menuLabel.textContent = `Continue (${sats ?? '…'} Sats)`;
      payButton.hidden = !paymentSupported;
      payButton.disabled = !canPay;
      restartButton.disabled = status === 'pending';
      body.textContent = message || 'Try again!';
      panel.setAttribute('aria-busy',String(status === 'pending'));
    },
    show() { menu.show(); (payButton.disabled ? restartButton : payButton).focus(); },
    hide() { menu.hide(); },
    dispose() { menu.hide(() => { payButton.removeEventListener('click',pay); restartButton.removeEventListener('click',restart); backdrop.removeEventListener('keydown',containKey); backdrop.removeEventListener('keyup',containKey); menu.disposeFrameBounds(); menu.disposeTransition(); backdrop.remove(); }); },
  };
}

export function createLevelCompleteUi({host, onContinue, onRestart = onContinue, onCollect = () => {}, onCheck = () => {}, onAcknowledge = () => {}, showTrophyActions = () => true, outcome = 'win', frameElement = null, documentRef = globalThis.document}) {
  if(outcome === 'loss'){const ui=createLevelLostUi({host,onPay:()=>{},onRestart,frameElement,documentRef});ui.payButton.hidden=true;return {...ui,button:ui.restartButton};}
  const menu = createMenu({titleText:'Completed',bodyText:'',frameElement,documentRef,
    buttonClicksOnly: true,
    buttons:[{displayText:'Collect Trophy',className:'level-complete-collect'},
      {displayText:'Next Level',className:'level-complete-continue'},
      {displayText:'Restart Game',className:'level-complete-restart'},
      {displayText:'Check Trophy Status',className:'level-complete-check'},
      {displayText:'OK',className:'level-complete-acknowledge'}]});
  const {backdrop,panel,title,body,actions,
    buttons:[collectButton,continueButton,restartButton,checkButton,acknowledgeButton]}=menu;
  backdrop.className += ' level-complete-backdrop'; panel.className += ' level-complete-panel outcome-win'; backdrop.hidden=true;
  body.setAttribute('aria-live','polite');
  let completion={levelNumber:1,levelsCompleted:1,totalLevels:1,hasNext:true,collected:0,total:0};
  let state={busy:false,canCollect:false,canCheck:false,needsAcknowledgment:false,status:'checking',message:'Checking ownership…'};
  const pad=value=>String(Math.max(0,value)).padStart(2,'0');
  function render() {
    const final=!completion.hasNext;
    const trophyVisible = Boolean(showTrophyActions?.());
    const heading=final?'Game Completed':'Completed';
    title.menuTitleLabel.textContent=heading;
    const gold=`${pad(completion.collected)}/${pad(completion.total)}`;
    body.textContent=final?`Great Job. You completed ${completion.levelsCompleted}/${completion.totalLevels} levels. You collected ${gold} gold in the final level and reached the exit.`:`Great Job. You collected ${gold} gold and reached the exit.`;
    const message=state.status==='owned'?'You already own this trophy.':state.status==='guest'?'Log in to collect this trophy.':state.message;
    if(!final && trophyVisible && message)body.textContent+=` ${message}`;
    collectButton.menuLabel.textContent='Collect Trophy';
    collectButton.hidden=final || !trophyVisible; collectButton.disabled=final || !trophyVisible || !state.canCollect || state.busy || state.needsAcknowledgment;
    continueButton.hidden=final; continueButton.disabled=state.busy || state.needsAcknowledgment;
    restartButton.disabled=state.busy || (!final && state.needsAcknowledgment);
    checkButton.hidden=final || !trophyVisible || !state.canCheck; checkButton.disabled=final || !trophyVisible || state.busy;
    checkButton.menuLabel.textContent=state.status==='uncertain'?'Check Trophy Status':'Check Trophy Ownership';
    acknowledgeButton.hidden=final || !state.needsAcknowledgment; acknowledgeButton.disabled=final || state.busy;
    panel.setAttribute('aria-busy',String(state.busy));
  }
  const actionHandlers=[[collectButton,onCollect],[continueButton,onContinue],[restartButton,onRestart],[checkButton,onCheck],[acknowledgeButton,onAcknowledge]].map(([button,callback])=>{
    const handler=()=>{if(!button.disabled && !button.hidden)void callback();};button.addEventListener('click',handler);return [button,handler];
  });
  const keydown=event=>{
    event.stopPropagation();
    if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
    if(event.key==='Escape')event.preventDefault();
    if(event.key==='Tab'){
      event.preventDefault();const enabled=menu.buttons.filter(button=>!button.hidden&&!button.disabled);
      enabled[(enabled.indexOf(documentRef.activeElement)+(event.shiftKey?enabled.length-1:1))%enabled.length]?.focus();
    }
  };
  backdrop.addEventListener('keydown',keydown);backdrop.addEventListener('keyup',keydown);host.append(backdrop);render();
  return {backdrop,panel,actions,button:continueButton,collectButton,continueButton,restartButton,checkButton,acknowledgeButton,
    setCompletion(value){completion={...completion,...value};render();},
    setState(value){state={...state,...value};render();if(state.needsAcknowledgment)acknowledgeButton.focus();},
    show(){render();menu.show();(menu.buttons.find(button=>!button.hidden&&!button.disabled)??panel).focus();},
    dispose(){menu.hide(()=>{for(const [button,handler]of actionHandlers)button.removeEventListener('click',handler);backdrop.removeEventListener('keydown',keydown);backdrop.removeEventListener('keyup',keydown);menu.disposeFrameBounds();menu.disposeTransition();backdrop.remove();});},
  };
}
