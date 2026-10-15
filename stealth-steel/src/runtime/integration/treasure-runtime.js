import {createTreasureSession} from './treasure-session.js';
const key='stealth-steel-treasure-session-v1';
/** @param {{accountHost: ReturnType<typeof import('./bis-account.js').createBisAccount>, resumeRun?: boolean, storage?: Storage}} options */
export function createTreasureRuntime({accountHost,resumeRun=false,storage=globalThis.sessionStorage}) {
  const current=()=>accountHost.getBis();
  const unavailable=async()=>({status:'unavailable',contracts:[]});
  const offers={
    start:request=>current()?.startContractAsync(request)??unavailable(),
    checkContractsAsync:filter=>current()?.checkContractsAsync(filter)??unavailable(),
    claim:id=>current()?.claimContractAsync(id)??unavailable(),reject:id=>current()?.rejectContractAsync(id)??unavailable(),
    endSession:async id=>{const ready=await accountHost.readyAsync();await ready?.endContractSessionAsync(id);},
  };
  const session=createTreasureSession({getSnapshot:()=>current()?.getSnapshot(),offers});
  let saved;
  try{saved=JSON.parse(storage.getItem(key)??'null');}catch{/* Gameplay remains available without storage. */}
  if(resumeRun)session.restore(saved);
  const persist=()=>{try{storage.setItem(key,JSON.stringify(session.snapshot()??null));}catch{/* No replacement can be created without an explicit Start. */}};
  const unsubscribe=session.subscribe(persist);persist();
  const unsubscribeState=accountHost.subscribe(snapshot=>session.notify(snapshot));
  return {...session,start(){if(!resumeRun||!session.snapshot())session.start();},dispose({preserveSession=false}={}){unsubscribeState();unsubscribe();session.dispose({preserveSession});if(!preserveSession)persist();}};
}
