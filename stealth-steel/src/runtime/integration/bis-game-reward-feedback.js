/** Game-owned presentation; never performs or retries a financial operation. */
export function createBisGameRewardFeedback({host, documentRef=globalThis.document}) {
  const message=documentRef.createElement('p');
  message.className='bis-game-confirmed-reward';message.hidden=true;
  message.setAttribute('role','status');message.setAttribute('aria-live','polite');
  host.append(message);
  let disposed=false;
  return {
    /** @param {import('@bis/integration').BisGameConfirmedPlayerReward} reward */
    present(reward) {
      if(disposed)return false;
      message.textContent=reward.kind==='sats'
        ? `Treasure received: ${reward.amountSats.toLocaleString('en-US')} sats.`
        : `Reward received: ${reward.asset.quantity} × ${reward.rewardDisplayName}.`;
      message.hidden=false;return true;
    },
    dispose(){disposed=true;message.remove();},
  };
}
