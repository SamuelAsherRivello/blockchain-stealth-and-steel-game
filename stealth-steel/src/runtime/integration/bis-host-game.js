/** @typedef {import('@bis/integration').IBisGame} IBisGame */
/** @typedef {import('@bis/integration').BisGameSession} BisGameSession */
/** @typedef {import('@bis/integration').BisGameContinuationTarget} BisGameContinuationTarget */
/** @typedef {import('@bis/integration').BisGameConfirmedContinuation} BisGameConfirmedContinuation */
/** @typedef {import('@bis/integration').BisGameConfirmedPlayerReward} BisGameConfirmedPlayerReward */
/** @typedef {import('@bis/integration').BisGameEffectReceipt} BisGameEffectReceipt */

const receipt = status => Object.freeze({ status });
const sameSession = (left, right) => left?.gameId === right?.gameId && left?.gameSessionId === right?.gameSessionId;

/**
 * Creates the one game-owned implementation of BIS's public game contract.
 * The callbacks deliberately speak in game decisions, not wallet concepts.
 *
 * @param {{gameId: string, getActiveGameSessionId: () => string | undefined,
 *   canCaptureContinuation?: () => boolean,
 *   applyContinuation: () => boolean | Promise<boolean>,
 *   presentPlayerReward?: (reward: BisGameConfirmedPlayerReward) => boolean | Promise<boolean>}} options
 * @returns {IBisGame}
 */
export function createBisGame(options) {
  /** @type {Map<string, Set<string>>} */
  const deliveredOperationIdsBySession = new Map();
  const active = () => {
    const gameSessionId = options.getActiveGameSessionId();
    return gameSessionId ? Object.freeze({ gameId: options.gameId, gameSessionId }) : undefined;
  };
  const delivery = async (input, apply) => {
    const current = active();
    if (!sameSession(current, input.gameSession)) return receipt('not-applicable');
    const delivered = deliveredOperationIdsBySession.get(current.gameSessionId) ?? new Set();
    if (delivered.has(input.operationId)) return receipt('already-applied');
    if (!await apply()) return receipt('not-applicable');
    delivered.add(input.operationId);
    deliveredOperationIdsBySession.set(current.gameSessionId, delivered);
    return receipt('applied');
  };
  return Object.freeze({
    getActiveGameSession() { return active(); },
    captureContinuationTarget({ gameSession }) {
      if (!sameSession(active(), gameSession) || !options.canCaptureContinuation?.()) return undefined;
      return Object.freeze({ continuationTargetId: `continue:${gameSession.gameSessionId}` });
    },
    /** @param {BisGameConfirmedContinuation} input @returns {Promise<BisGameEffectReceipt>} */
    applyConfirmedContinuation(input) {
      if (input.continuationTarget.continuationTargetId !== `continue:${input.gameSession.gameSessionId}`) return Promise.resolve(receipt('not-applicable'));
      return delivery(input, options.applyContinuation);
    },
    /** @param {BisGameConfirmedPlayerReward} input @returns {Promise<BisGameEffectReceipt>} */
    presentConfirmedPlayerReward(input) {
      return delivery(input, () => options.presentPlayerReward?.(input) ?? false);
    },
  });
}
