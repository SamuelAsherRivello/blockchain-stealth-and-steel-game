import { canEnemyTargetPlayer } from '../systems/perception/player-hidden.js';
import { cardinalDistance } from './navigation.js';

/** Do not let a global player snapshot become an enemy's global player knowledge. */
export function senseEnemy({ actor, grid, reaction, getPlayer }) {
  const raw = getPlayer(), ownCell = actor.getGridPosition(grid.tileSizePx);
  const targetable = canEnemyTargetPlayer(raw, reaction);
  const adjacent = targetable && raw?.cell && cardinalDistance(ownCell, raw.cell) === 1;
  const detected = targetable && (raw?.detected === true || (raw?.hidden && reaction.canTrackHiddenPlayer()));
  const player = (adjacent || detected) ? { ...raw, type: 'player', character: 'player', targetable, detected,
    position: { ...raw.position }, cell: { ...raw.cell } } : null;
  return { player, adjacent: Boolean(adjacent), detected: Boolean(detected), reaction: reaction.getSnapshot() };
}
