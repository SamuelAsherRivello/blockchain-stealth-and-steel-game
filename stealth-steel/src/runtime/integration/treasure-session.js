// Host gameplay policy. BIS knows contracts; this module owns treasure/session semantics.
import {testNetwork} from '@bis/integration';

export function createTreasureSession({ getSnapshot, offers, now = Date.now, newId = () => crypto.randomUUID() }) {
  let session, generation = 0, inspection, acting = false;
  const listeners = new Set();
  const publish = () => listeners.forEach(listener => listener());
  const wallets = () => {
    const snapshot=getSnapshot();
    const player=snapshot?.account.playerWallet;
    return {player,game:snapshot?.account.gameWallet,network:snapshot?.account.network??player?.network??'signet',available:snapshot?.capabilities.contracts.available??false};
  };
  const walletKey = () => { const {player,game}=wallets();return JSON.stringify([player?.profileId,player?.network??'signet',game?.profileId,game?.network??'signet']); };
  const gameSource = () => ['manual','server'].includes(wallets().game?.source) ? wallets().game.source : undefined;
  const sourceMatches = () => session?.gameSource === undefined || session.gameSource === gameSource();
  const matches = contract => {
    if (!session || !contract || contract.type !== 'lto' || contract.purpose !== 'treasureLTO' ||
      contract.sessionId !== session.id || contract.hostReference !== session.reference ||
      contract.amountSats !== 1000 || !Number.isSafeInteger(contract.startedAt) ||
      !Number.isSafeInteger(contract.expiresAt) ||
      contract.expiresAt !== (Math.floor(contract.startedAt / 1000) + 90) * 1000) return false;
    const {player,game,network}=wallets(), scope=contract.scope;
    const playerNetwork=player?.network??'signet', gameNetwork=game?.network??'signet';
    if (!scope || !player?.profileId || !game?.profileId || !['signet','mutinynet'].includes(network) ||
      player.profileId !== session.playerId || game.profileId !== session.gameId || network !== playerNetwork || network !== gameNetwork || scope.network !== network ||
      scope.operator !== testNetwork(network).operator || scope.playerId !== session.playerId ||
      scope.gameId !== session.gameId || scope.exclusivityKey !== 'treasure' || !sourceMatches() ||
      (session.validationMode && contract.validationMode !== session.validationMode)) return false;
    return !session.contractId || contract.id === session.contractId;
  };
  function getState() {
    if (!session) return { status: 'no-offer', remainingSeconds: 0 };
    const remainingSeconds = Math.max(0, Math.ceil((session.expiresAt - now()) / 1000));
    let status = session.status;
    if(status==='awaiting-consent'&&!remainingSeconds)status='expired';
    if (session.offered && !remainingSeconds && !['claimed', 'rejected', 'pending', 'unavailable', 'unverified'].includes(status)) status = 'expired';
    const {player,game,network}=wallets();
    if (session.playerId !== player?.profileId && status !== 'missing-player') status = 'no-offer';
    if(status!=='missing-player' && (session.gameId!==game?.profileId || (session.walletKey && session.walletKey!==walletKey())))status='no-offer';
    if(player && (network!==(player.network??'signet') || (session.network && session.network!==network)))status='no-offer';
    if(!sourceMatches() || (status==='awaiting-consent' && session.gameSource!==gameSource()))status='no-offer';
    return { status, remainingSeconds, sessionId: session.id, contractId: session.contractId,
      ...(status==='awaiting-consent'?{fundingConsent:{sessionId:session.id,network:session.network,playerId:session.playerId,
        gameId:session.gameId,gameSource:session.gameSource,validationMode:session.validationMode,amountSats:1000,startedAt:session.startedAt,expiresAt:session.expiresAt}}:{}) };
  }
  function end() {
    generation++;
    if (session&&(session.fundingStarted||session.contractId||session.offered||session.status==='unverified')) void offers.endSession(session.id).catch(() => {});
    session = undefined; publish();
  }
  function updateContracts(result) {
    if(!session || !session.playerId || session.fundingStarted===false)return;
    if(result.status!=='ready'){session.status='unavailable';publish();return;}
    const contract=result.contracts.find(matches);
    if(!contract)return;
    session.contractId=contract.id;session.startedAt=contract.startedAt;session.expiresAt=contract.expiresAt;
    session.walletKey=walletKey();session.offered=true;
    const unresolvedClaim=session.status==='pending'||(contract.operationKind==='claim'&&['claiming','unknown'].includes(contract.financial));
    session.status=contract.financial==='claimed'?'claimed':contract.financial==='refunded'?(session.status!=='rejected'&&now()>=session.expiresAt?'expired':'rejected'):contract.eligibility==='ended'?'rejected':
      contract.financial==='failed'?'no-offer':unresolvedClaim?'pending':contract.canClaim?'active':contract.financial==='funding'?'preparing':'pending';
    publish();
  }
  async function inspect() {
    if (!session || !session.playerId || session.fundingStarted===false) return;
    const currentSession = session, currentGeneration = generation, currentWalletKey = walletKey();
    const key = JSON.stringify([currentSession.id, currentGeneration, currentWalletKey]);
    if (inspection?.key === key) return inspection.promise;
    const promise = Promise.resolve().then(async () => {
      try {
        const result = await offers.checkContractsAsync({purpose:'treasureLTO',sessionId:currentSession.id,
          hostReference:currentSession.reference,gameId:currentSession.gameId,includeResolved:true});
        if (currentGeneration !== generation || session !== currentSession || walletKey() !== currentWalletKey) return;
        updateContracts(result);
      } catch {
        if (currentGeneration === generation && session === currentSession && walletKey() === currentWalletKey) {
          session.status = 'unavailable'; publish();
        }
      }
    });
    inspection = {key, promise};
    try { return await promise; }
    finally { if (inspection?.promise === promise) inspection = undefined; }
  }
  return {
    getState, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    snapshot() {return session?{...session}:undefined;},
    restore(saved) {
      if(session||!saved||typeof saved.id!=='string'||saved.reference!==`treasure:${saved.id}`||!Number.isSafeInteger(saved.expiresAt)||typeof saved.status!=='string')return false;
      session={id:saved.id,reference:saved.reference,expiresAt:0,walletKey:typeof saved.walletKey==='string'?saved.walletKey:JSON.stringify([saved.playerId,'signet',saved.gameId,'signet']),status:'unverified',offered:false,
        ...(['manual','server'].includes(saved.gameSource)?{gameSource:saved.gameSource}:{}),
        ...(['signet','mutinynet'].includes(saved.network)?{network:saved.network}:{}),
        ...(['browser-policy-v1','arkade-covenant-v2'].includes(saved.validationMode)?{validationMode:saved.validationMode}:{}),
        playerId:typeof saved.playerId==='string'?saved.playerId:undefined,gameId:typeof saved.gameId==='string'?saved.gameId:undefined,contractId:typeof saved.contractId==='string'?saved.contractId:undefined};
      generation++;publish();return true;
    },
    start() {
      end(); const startedAt = now();
      const {player,game,network,available}=wallets(),id=newId();
      const expiresAt=(Math.floor(startedAt/1000)+90)*1000;
      session = {id,reference:`treasure:${id}`,playerId:player?.profileId,gameId:game?.profileId,gameSource:gameSource(),network,walletKey:walletKey(),startedAt,expiresAt,offered:false,fundingStarted:false,
        validationMode:'browser-policy-v1',
        status:!player?.profileId?'missing-player':!available||!game?.profileId||network!==(player.network??'signet')||network!==(game.network??'signet')||!['signet','mutinynet'].includes(network)?'no-offer':network==='mutinynet'&&gameSource()!=='manual'?'network-unavailable':'awaiting-consent'};
      publish();
    },
    acceptFundingConsent(sessionId) {
      if(!session||session.id!==sessionId||session.status!=='awaiting-consent'||getState().status==='no-offer'||!wallets().available)return {status:'unavailable'};
      if(now()>=session.expiresAt){session.status='expired';publish();return {status:'too-late'};}
      const original=session,current=generation;
      session.status='preparing';publish();
      void Promise.resolve().then(()=>{
        if(current!==generation||session!==original||walletKey()!==original.walletKey||wallets().network!==original.network||gameSource()!==original.gameSource||!wallets().available||now()>=original.expiresAt){
          if(session===original){session.status='no-offer';publish();}return {status:'unavailable'};
        }
        original.fundingStarted=true;
        return offers.start({offerSessionId:original.id,hostReference:original.reference,purpose:'treasureLTO',exclusivityKey:'treasure',amountSats:1000,
          startedAt:original.startedAt,expiresAt:original.expiresAt,validationMode:original.validationMode});
      }).then(result => {
        if(current!==generation || session!==original) return;
        if(result.contract && matches(result.contract)) { session.contractId=result.contract.id; session.offered=true; }
        if(result.status==='unavailable'||result.status==='not-submitted')session.status='no-offer';
        publish(); void inspect();
      }).catch(() => { if(current===generation && session===original) {session.status='unavailable';publish();} });
      return {status:'accepted'};
    },
    declineFundingConsent(sessionId) {
      if(!session||session.id!==sessionId||session.status!=='awaiting-consent')return {status:'unavailable'};
      session.status='no-offer';publish();return {status:'declined'};
    },
    inspect, end, updateContracts,
    notify(snapshot){updateContracts(snapshot.contracts);publish();},
    async act(kind) {
      if (acting || !session?.contractId || getState().status !== 'active' || !['claim','reject'].includes(kind)) return {status:'unavailable'};
      const current=generation;acting=true;
      try {
        const result=await offers[kind](session.contractId);
        if(current!==generation||!session)return {status:'unavailable'};
        if(result.status==='pending')session.status=kind==='reject'?'rejected':'pending';
        else if(result.status==='too-late')session.status='expired';
        else session.status='unavailable';
        publish();return result;
      } catch {if(current===generation&&session){session.status='unavailable';publish();}return {status:'unavailable'};}
      finally {acting=false;}
    },
    dispose({preserveSession=false}={}) {if(!preserveSession)end();else generation++;listeners.clear();},
  };
}

export function treasureMessage(status) {
  return ({active:'Limited Time Offer: Treasure found — Claim 1,000 sats?','awaiting-consent':'Treasure funding needs your approval',unverified:'Verifying the original treasure offer',preparing:'Treasure is being prepared',expired:"You found a treasure but it's expired",
    'missing-player':'Connect an account to receive treasure offers','network-unavailable':'Mutinynet treasure needs a Local Game Wallet. Open Account to check your wallet.','no-offer':'No treasure offer available',unavailable:'Treasure status is unavailable',
    pending:'Treasure transaction is pending',claimed:'Reward claimed',rejected:'Offer ended'})[status] ?? 'No treasure offer available';
}

export function shouldRevealTreasureChest(status) {
  return ['active','network-unavailable','unverified','unavailable'].includes(status);
}
