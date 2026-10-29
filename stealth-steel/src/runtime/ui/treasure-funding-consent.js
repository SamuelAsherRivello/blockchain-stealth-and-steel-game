import {GameWindow} from './game-window.js';
import {createMenuButton} from './menu.js';

/** Game-owned approval for one original offer. It never holds wallet secrets. */
export function createTreasureFundingConsent({host,screenLayer,frameElement=null,pauseController,session,documentRef=globalThis.document}){
  let current,disposed=false;
  function render(){
    if(disposed)return;
    const state=session.getState(),consent=state.fundingConsent;
    if(state.status!=='awaiting-consent'||!consent){current?.view.close();return;}
    if(current?.id===consent.sessionId){current.countdown.textContent=`${state.remainingSeconds} seconds remain in the original offer window.`;return;}
    current?.view.close();
    const content=documentRef.createElement('div');content.className='treasure-content';
    content.style.display='block';content.style.maxHeight='42dvh';content.style.overflowY='auto';content.style.paddingRight='8px';
    const paragraph=text=>{const p=documentRef.createElement('p');p.className='menu-prose';p.style.fontSize='16px';p.style.lineHeight='1.4';p.textContent=text;content.append(p);return p;};
    const network=consent.network==='mutinynet'?'Mutinynet':'Signet';
    paragraph(`Lock 1,000 sats from your selected Game Wallet on ${network} for this treasure offer?`);
    paragraph(`Game Wallet: …${consent.gameId.slice(-8)}. Player Wallet: …${consent.playerId.slice(-8)}. These are the selected BIS wallets; this prompt does not prove a protected publisher treasury.`);
    paragraph(consent.gameSource==='server'?'Game Wallet signing source: server. BIS requests signing from the configured server.':consent.gameSource==='manual'?'Game Wallet signing source: manual. The selected wallet signs in this browser.':'Game Wallet signing source is unavailable in this package snapshot. Check Account before funding.');
    paragraph('A verified claim pays 1,000 sats to the Player Wallet. Refunds require original-contract recovery. Browser validation controls expiry and payout checks; a modified client can bypass those checks.');
    paragraph('Funding requires the supported zero-fee policy; otherwise BIS skips this offer. The configured signing source can sign automatically; another popup is not guaranteed. Review the signing source in Account.');
    paragraph(`The offer ends at ${new Date(consent.expiresAt).toLocaleTimeString()}. Time spent deciding and funding uses the original window; it never exceeds 90 seconds.`);
    const countdown=paragraph(`${state.remainingSeconds} seconds remain in the original offer window.`);countdown.setAttribute('role','status');
    const feedback=paragraph('');feedback.setAttribute('role','status');
    const accept=createMenuButton({displayText:'Fund 1,000 sats',documentRef});
    const skip=createMenuButton({displayText:'Skip treasure',documentRef});
    accept.addEventListener('click',()=>{accept.disabled=true;const result=session.acceptFundingConsent(consent.sessionId);if(result.status!=='accepted'){accept.disabled=false;feedback.textContent='This offer is unavailable. You can skip treasure and continue playing.';}render();});
    skip.addEventListener('click',()=>session.declineFundingConsent(consent.sessionId));
    pauseController.pause('treasure-consent');
    const entry={id:consent.sessionId,countdown,view:null};
    entry.view=new GameWindow({host,screenLayer,frameElement,title:'Fund treasure',content,buttons:[accept,skip],documentRef,
      onClose:()=>{if(current===entry){current=null;pauseController.resume('treasure-consent');}session.declineFundingConsent(consent.sessionId);}});
    current=entry;
    entry.view.backdrop.addEventListener('keydown',event=>{
      event.stopPropagation();
      if(event.key==='Escape'){event.preventDefault();entry.view.close();}
      if(event.key==='Tab'){
        event.preventDefault();const buttons=[...entry.view.backdrop.querySelectorAll('button:not(:disabled)')].filter(button=>!button.hidden);
        const index=buttons.indexOf(documentRef.activeElement);buttons[(index+(event.shiftKey?buttons.length-1:1))%buttons.length]?.focus();
      }
    });
    for(const type of ['keyup','pointerdown','pointerup','touchstart','touchend'])entry.view.backdrop.addEventListener(type,event=>event.stopPropagation());
    skip.focus();
  }
  const unsubscribe=session.subscribe(render),timer=setInterval(render,500);
  render();
  return {get isOpen(){return !!current;},dispose(){disposed=true;clearInterval(timer);unsubscribe();current?.view.close();}};
}
