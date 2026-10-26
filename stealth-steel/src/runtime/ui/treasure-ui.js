import {GameWindow} from './game-window.js';
import {createMenuButton} from './menu.js';
import {treasureMessage} from '../integration/treasure-session.js';
import {playSfx} from '../audio/sfx.js';

export function createTreasureUi({host,screenLayer,frameElement=null,pauseController,session,documentRef=globalThis.document,playSound=playSfx,now=()=>Date.now(),setTimeoutRef=globalThis.setTimeout,clearTimeoutRef=globalThis.clearTimeout}) {
  let window,disposed=false,busy=false,inspectionPromise=null,inspectionStartedAt=0,loadingTimer,delayedTimer;
  let message,countdown,loading,delayed,claim,reject,checkStatus,back;
  const clearFeedbackTimers=()=>{clearTimeoutRef(loadingTimer);clearTimeoutRef(delayedTimer);loadingTimer=delayedTimer=null;};
  const setFeedback=(showLoading,showDelayed)=>{
    if(!window)return;
    loading.hidden=!showLoading;delayed.hidden=!showDelayed;checkStatus.hidden=!showDelayed;
  };
  function attachInspectionFeedback(owner,promise){
    clearFeedbackTimers();
    const showIfCurrent=(showLoading,showDelayed)=>{if(window===owner&&inspectionPromise===promise)setFeedback(showLoading,showDelayed);};
    const elapsed=Math.max(0,now()-inspectionStartedAt);
    setFeedback(elapsed>=300&&elapsed<10000,elapsed>=10000);
    if(elapsed<300)loadingTimer=setTimeoutRef(()=>showIfCurrent(true,false),300-elapsed);
    if(elapsed<10000)delayedTimer=setTimeoutRef(()=>showIfCurrent(false,true),10000-elapsed);
    promise.finally(()=>{
      if(inspectionPromise!==promise)return;
      inspectionPromise=null;clearFeedbackTimers();setFeedback(false,false);
    });
  }
  function inspect(owner){
    if(!inspectionPromise){
      inspectionStartedAt=now();
      const request=Promise.resolve().then(()=>session.inspect()).catch(()=>{});
      inspectionPromise=request;
    }
    attachInspectionFeedback(owner,inspectionPromise);
    return inspectionPromise;
  }
  const render=()=>{
    if(!window)return;
    const state=session.getState();message.textContent=treasureMessage(state.status);
    countdown.textContent=state.status==='active'?`${state.remainingSeconds} secs remaining ...`:'';
    claim.disabled=reject.disabled=busy||state.status!=='active';
    claim.hidden=reject.hidden=['claimed','rejected','missing-player'].includes(state.status);
    claim.style.display=reject.style.display=claim.hidden?'none':'';
    countdown.style.display=countdown.textContent?'':'none';
  };
  const unsubscribe=session.subscribe(render);
  // Countdown is presentation only; BIS events drive financial progress even closed.
  const timer=setInterval(render,500);
  async function act(kind){
    if(busy)return;const origin=window;busy=true;render();
    let result;
    try {result=await session.act(kind);} catch {result={status:'unavailable'};}
    busy=false;
    if(disposed)return;
    if(result.status==='pending'&&window===origin)origin?.close();else render();
  }
  return {
    open(){
      if(disposed||window)return;
      const content=documentRef.createElement('div');content.className='treasure-content';
      message=documentRef.createElement('p');message.className='menu-prose treasure-message';message.setAttribute('role','status');
      countdown=documentRef.createElement('p');countdown.className='menu-prose treasure-countdown';
      loading=documentRef.createElement('p');loading.className='menu-prose treasure-feedback treasure-loading';loading.textContent='Checking treasure status…';loading.setAttribute('role','status');loading.hidden=true;
      delayed=documentRef.createElement('p');delayed.className='menu-prose treasure-feedback treasure-delayed';delayed.textContent='Treasure status is taking longer than expected.';delayed.setAttribute('role','status');delayed.hidden=true;
      claim=createMenuButton({displayText:'Claim',documentRef});reject=createMenuButton({displayText:'Reject',documentRef});checkStatus=createMenuButton({displayText:'Check status',documentRef});back=createMenuButton({displayText:'Back',documentRef});checkStatus.hidden=true;
      claim.addEventListener('click',()=>void act('claim'));reject.addEventListener('click',()=>void act('reject'));checkStatus.addEventListener('click',()=>{if(window)void inspect(window);});back.addEventListener('click',()=>window?.close());
      content.append(message,countdown,loading,delayed);
      pauseController.pause('treasure');
      window=new GameWindow({host,screenLayer,frameElement,title:'Treasure Chest',content,
        buttons:[claim,reject,checkStatus,back],documentRef,onClose:()=>{const closed=window;window=null;clearFeedbackTimers();if(closed)pauseController.resume('treasure');}});
      playSound('treasure');
      for(const eventName of ['keydown','keyup','pointerdown','pointerup','touchstart','touchend'])window.backdrop.addEventListener(eventName,event=>{
        event.stopPropagation();
        if(eventName==='keydown'&&event.key==='Escape'){event.preventDefault();window?.close();}
        if(eventName==='keydown'&&event.key==='Tab'){
          event.preventDefault();const buttons=[...window.backdrop.querySelectorAll('button:not(:disabled)')].filter(button=>!button.hidden);const index=buttons.indexOf(documentRef.activeElement);buttons[(index+(event.shiftKey?buttons.length-1:1))%buttons.length]?.focus();
        }
      });
      render();void inspect(window);back.focus();
    },
    get isOpen(){return !!window;},
    dispose(){disposed=true;clearInterval(timer);unsubscribe();window?.close();},
  };
}
