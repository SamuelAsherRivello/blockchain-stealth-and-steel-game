/** @typedef {import('@bis/integration').IBisGame} IBisGame */
/** @typedef {import('@bis/integration').BisGameSession} BisGameSession */
/** @typedef {import('@bis/integration').BisGameContinuationTarget} BisGameContinuationTarget */
/** @typedef {import('@bis/integration').BisGameConfirmedContinuation} BisGameConfirmedContinuation */
/** @typedef {import('@bis/integration').BisGameConfirmedPlayerReward} BisGameConfirmedPlayerReward */
/** @typedef {import('@bis/integration').BisGameEffectReceipt} BisGameEffectReceipt */

/** @param {BisGameEffectReceipt['status']} status @returns {BisGameEffectReceipt} */
const receipt = status => Object.freeze({ status });
const sameSession = (left, right) => left?.gameId === right?.gameId && left?.gameSessionId === right?.gameSessionId;

/**
 * Creates the one game-owned implementation of BIS's public game contract.
 * The callbacks deliberately speak in game decisions, not wallet concepts.
 *
 * @param {{gameId: string, getActiveGameSessionId: () => string | undefined,
 *   canCaptureContinuation?: () => boolean,
 *   applyContinuation: () => boolean,
 *   presentPlayerReward?: (reward: BisGameConfirmedPlayerReward) => boolean,
 *   prepareEffect?: (input: BisGameConfirmedContinuation | BisGameConfirmedPlayerReward) => Promise<void>,
 *   isActive?: () => boolean,
 *   onBisEvent?: (event: import('@bis/integration').BisEvent) => void}} options
 * @returns {IBisGame}
 */
export function createBisGame(options) {
  const applied = new Set();
  /** @type {Map<string, Promise<BisGameEffectReceipt>>} */
  const inFlight = new Map();
  const active = () => {
    const gameSessionId = options.isActive?.() === false ? undefined : options.getActiveGameSessionId();
    return gameSessionId ? Object.freeze({ gameId: options.gameId, gameSessionId }) : undefined;
  };
  /** @param {BisGameConfirmedContinuation | BisGameConfirmedPlayerReward} input @param {() => boolean} commit */
  const delivery = async (input, commit) => {
    if (!sameSession(active(), input.gameSession) || !input.operationId) return receipt('not-applicable');
    const key = JSON.stringify([input.gameSession.gameId, input.gameSession.gameSessionId, input.operationId]);
    if (applied.has(key)) return receipt('already-applied');
    const pending = inFlight.get(key);
    if (pending) return receipt((await pending).status === 'applied' ? 'already-applied' : 'not-applicable');
    // Reserve before yielding. Preparation may await; mutation must be synchronous.
    const work = Promise.resolve().then(async () => {
      try {
        await options.prepareEffect?.(input);
        if (!sameSession(active(), input.gameSession) || commit() !== true) return receipt('not-applicable');
        applied.add(key);
        return receipt('applied');
      } catch { return receipt('not-applicable'); }
    });
    inFlight.set(key, work);
    try { return await work; } finally { if (inFlight.get(key) === work) inFlight.delete(key); }
  };
  return Object.freeze({
    onBisEvent(event) { if (options.isActive?.() !== false) options.onBisEvent?.(event); },
    getActiveGameSession() { return active(); },
    captureContinuationTarget({ gameSession }) {
      if (!sameSession(active(), gameSession) || !options.canCaptureContinuation?.()) return undefined;
      return Object.freeze({ continuationTargetId: `continue:${gameSession.gameSessionId}` });
    },
    /** @param {BisGameConfirmedContinuation} input @returns {Promise<BisGameEffectReceipt>} */
    applyConfirmedContinuationAsync(input) {
      if (input.continuationTarget.continuationTargetId !== `continue:${input.gameSession.gameSessionId}`) return Promise.resolve(receipt('not-applicable'));
      return delivery(input, () => options.canCaptureContinuation?.() === true && options.applyContinuation());
    },
    /** @param {BisGameConfirmedPlayerReward} input @returns {Promise<BisGameEffectReceipt>} */
    presentConfirmedPlayerRewardAsync(input) {
      return delivery(input, () => options.presentPlayerReward?.(input) ?? false);
    },
  });
}
