import test from 'node:test';
import assert from 'node:assert/strict';
import {createBisGame} from '../../runtime/integration/bis-host-game.js';
import {createBisGameRewardFeedback} from '../../runtime/integration/bis-game-reward-feedback.js';

test('host applies matching continuation once and rejects replayed or stale delivery', async () => {
  let session = 'run-one', revives = 0;
  const host = createBisGame({gameId:'stealth-and-steel',getActiveGameSessionId:()=>session,canCaptureContinuation:()=>true,applyContinuation:()=>++revives === 1});
  const gameSession = host.getActiveGameSession();
  const target = host.captureContinuationTarget({gameSession});
  const command = {operationId:'continue-1',gameSession,continuationTarget:target};
  assert.deepEqual(await host.applyConfirmedContinuationAsync(command),{status:'applied'});
  assert.deepEqual(await host.applyConfirmedContinuationAsync(command),{status:'already-applied'});
  session = 'run-two';
  assert.deepEqual(await host.applyConfirmedContinuationAsync(command),{status:'not-applicable'});
  assert.equal(revives,1);
});

test('host keeps reward presentation game-owned and session-scoped', async () => {
  let session = 'run-one', presentations = 0;
  const host = createBisGame({gameId:'stealth-and-steel',getActiveGameSessionId:()=>session,applyContinuation:()=>false,presentPlayerReward:()=>{presentations++;return true;}});
  const gameSession = host.getActiveGameSession();
  const reward = {kind:'sats',amountSats:1000,operationId:'reward-1',gameSession,rewardId:'treasure',rewardDisplayName:'Treasure'};
  assert.deepEqual(await host.presentConfirmedPlayerRewardAsync(reward),{status:'applied'});
  assert.deepEqual(await host.presentConfirmedPlayerRewardAsync(reward),{status:'already-applied'});
  session = undefined;
  assert.deepEqual(await host.presentConfirmedPlayerRewardAsync({...reward,operationId:'reward-2'}),{status:'not-applicable'});
  assert.equal(presentations,1);
});

test('concurrent continuation/reward delivery reserves before yielding and commits only once',async()=>{
  for(const kind of ['continuation','reward']){
    let commits=0,release;
    const host=createBisGame({gameId:'g',getActiveGameSessionId:()=> 's',canCaptureContinuation:()=>true,
      prepareEffect:()=>new Promise(resolve=>release=resolve),applyContinuation:()=>{commits++;return true;},presentPlayerReward:()=>{commits++;return true;}});
    const gameSession=host.getActiveGameSession();
    const input={operationId:'o',gameSession,continuationTarget:host.captureContinuationTarget({gameSession}),kind:'sats',amountSats:1000,rewardId:'r',rewardDisplayName:'Treasure'};
    const deliver=value=>kind==='continuation'?host.applyConfirmedContinuationAsync(value):host.presentConfirmedPlayerRewardAsync(value);
    const first=deliver(input),duplicate=deliver(input);await Promise.resolve();release();
    assert.deepEqual(await first,{status:'applied'});assert.deepEqual(await duplicate,{status:'already-applied'});assert.equal(commits,1);
  }
});

test('preparation revalidates session and target immediately before synchronous mutation',async()=>{
  for(const change of ['replace','dispose','target']){
    let session='s',active=true,target=true,release,commits=0;
    const host=createBisGame({gameId:'g',isActive:()=>active,getActiveGameSessionId:()=>session,canCaptureContinuation:()=>target,
      prepareEffect:()=>new Promise(resolve=>release=resolve),applyContinuation:()=>{commits++;return true;}});
    const gameSession=host.getActiveGameSession();const work=host.applyConfirmedContinuationAsync({operationId:'o',gameSession,continuationTarget:host.captureContinuationTarget({gameSession})});
    await Promise.resolve();if(change==='replace')session='new';if(change==='dispose')active=false;if(change==='target')target=false;release();
    assert.deepEqual(await work,{status:'not-applicable'});assert.equal(commits,0);
  }
});

test('failed preparation/commit releases its ledger without claiming financial retry',async()=>{
  let fail=true,commits=0;
  const host=createBisGame({gameId:'g',getActiveGameSessionId:()=> 's',canCaptureContinuation:()=>true,
    prepareEffect:async()=>{if(fail)throw Error('preparation');},applyContinuation:()=>{commits++;return true;}});
  const gameSession=host.getActiveGameSession(),input={operationId:'o',gameSession,continuationTarget:host.captureContinuationTarget({gameSession})};
  assert.deepEqual(await host.applyConfirmedContinuationAsync(input),{status:'not-applicable'});assert.equal(commits,0);fail=false;
  assert.deepEqual(await host.applyConfirmedContinuationAsync(input),{status:'applied'});assert.equal(commits,1);
});

test('notifications work outside gameplay, but disposed runtime receives neither events nor sessions',()=>{
  let active=true,events=0;const host=createBisGame({gameId:'g',isActive:()=>active,getActiveGameSessionId:()=>undefined,applyContinuation:()=>false,onBisEvent:()=>events++});
  host.onBisEvent({type:'accountClosed'});assert.equal(events,1);active=false;host.onBisEvent({type:'accountClosed'});assert.equal(events,1);assert.equal(host.getActiveGameSession(),undefined);
});

test('confirmed asset/sats feedback is visible, game-owned and deduplicated by session/operation',async()=>{
  const nodes=[],documentRef={createElement:()=>({hidden:true,setAttribute(){},remove(){}})},feedback=createBisGameRewardFeedback({host:{append:node=>nodes.push(node)},documentRef});
  let session='s',presentations=0;
  const host=createBisGame({gameId:'g',getActiveGameSessionId:()=>session,applyContinuation:()=>false,presentPlayerReward:reward=>{presentations++;return feedback.present(reward);}});
  const base={gameSession:host.getActiveGameSession(),rewardId:'r',rewardDisplayName:'Level 1 Trophy'};
  const asset={...base,operationId:'mint',kind:'asset',asset:{quantity:'3'}};
  assert.equal((await host.presentConfirmedPlayerRewardAsync(asset)).status,'applied');assert.equal(nodes[0].hidden,false);assert.match(nodes[0].textContent,/3 × Level 1 Trophy/);
  assert.equal((await host.presentConfirmedPlayerRewardAsync(asset)).status,'already-applied');assert.equal(presentations,1);
  const sats={...base,operationId:'claim',kind:'sats',amountSats:1250};assert.equal((await host.presentConfirmedPlayerRewardAsync(sats)).status,'applied');assert.match(nodes[0].textContent,/1,250 sats/);
  session='replacement';assert.equal((await host.presentConfirmedPlayerRewardAsync({...asset,operationId:'late'})).status,'not-applicable');assert.equal(presentations,2);feedback.dispose();
});

test('a fresh host session rejects continuation and reward commands captured by the discarded run', async () => {
  const oldSession = 'run-one';
  const oldHost = createBisGame({
    gameId:'stealth-and-steel', getActiveGameSessionId:()=>oldSession,
    canCaptureContinuation:()=>true, applyContinuation:()=>true,
  });
  const oldGameSession = oldHost.getActiveGameSession();
  const continuation = {
    operationId:'continue-old', gameSession:oldGameSession,
    continuationTarget:oldHost.captureContinuationTarget({gameSession:oldGameSession}),
  };
  const reward = {operationId:'reward-old',gameSession:oldGameSession,rewardId:'LVL1'};
  let revives = 0, presentations = 0;
  const freshHost = createBisGame({
    gameId:'stealth-and-steel', getActiveGameSessionId:()=> 'run-two',
    applyContinuation:()=>{revives++;return true;},
    presentPlayerReward:()=>{presentations++;return true;},
  });

  assert.deepEqual(await freshHost.applyConfirmedContinuationAsync(continuation),{status:'not-applicable'});
  assert.deepEqual(await freshHost.presentConfirmedPlayerRewardAsync(reward),{status:'not-applicable'});
  assert.equal(revives,0);
  assert.equal(presentations,0);
});
