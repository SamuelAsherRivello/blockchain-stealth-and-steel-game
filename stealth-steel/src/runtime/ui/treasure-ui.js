import {GameWindow} from './game-window.js';
import {createMenuButton} from './menu.js';
import {treasureMessage} from '../integration/treasure-session.js';
import {playSfx} from '../audio/sfx.js';

export function createTreasureUi({host,screenLayer,frameElement=null,pauseController,session,documentRef=globalThis.document,playSound=playSfx}) {
  let window,disposed=false,busy=false;
  let message,countdown,claim,reject,back;
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
      message=documentRef.createElement('p');message.className='tiny-swords-body-text treasure-message';message.setAttribute('role','status');
      countdown=documentRef.createElement('p');countdown.className='tiny-swords-body-text treasure-countdown';
      claim=createMenuButton({displayText:'Claim',documentRef});reject=createMenuButton({displayText:'Reject',documentRef});back=createMenuButton({displayText:'Back',documentRef});
      claim.addEventListener('click',()=>void act('claim'));reject.addEventListener('click',()=>void act('reject'));back.addEventListener('click',()=>window?.close());
      content.append(message,countdown);
      pauseController.pause('treasure');
      window=new GameWindow({host,screenLayer,frameElement,title:'Treasure Chest',content,
        buttons:[claim,reject,back],documentRef,onClose:()=>{window=null;pauseController.resume('treasure');}});
      playSound('treasure');
      for(const eventName of ['keydown','keyup','pointerdown','pointerup','touchstart','touchend'])window.backdrop.addEventListener(eventName,event=>{
        event.stopPropagation();
        if(eventName==='keydown'&&event.key==='Escape'){event.preventDefault();window?.close();}
        if(eventName==='keydown'&&event.key==='Tab'){
          event.preventDefault();const buttons=[...window.backdrop.querySelectorAll('button:not(:disabled)')].filter(button=>!button.hidden);const index=buttons.indexOf(documentRef.activeElement);buttons[(index+(event.shiftKey?buttons.length-1:1))%buttons.length]?.focus();
        }
      });
      render();void session.inspect();back.focus();
    },
    get isOpen(){return !!window;},
    dispose(){disposed=true;clearInterval(timer);unsubscribe();window?.close();},
  };
}
