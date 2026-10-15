import { GameState } from './game-state.js';

/** Rebuild the player through the level-start factory, preserving the surrounding world. */
export function revivePaidPlayer({machine, player, spawners, enemyType, tileSize, spawnPlayer, resume}) {
  if (machine.state !== GameState.LEVEL_LOST || !player?.combat.isDead) return false;
  const owner = spawners.find(spawner => spawner.actors.includes(player));
  if (!owner) return false;
  const cell = player.actor.getGridPosition(tileSize);
  const position = player.actor.getPosition();
  const loadout = player.actor.getLoadout();
  for (const spawner of spawners) {
    for (const enemy of spawner.actors) {
      if (enemy.type !== enemyType) continue;
      const other = enemy.actor.getGridPosition(tileSize);
      if (Math.abs(other.x - cell.x) <= 1 && Math.abs(other.y - cell.y) <= 1) spawner.remove(enemy);
    }
  }
  owner.replace(player, () => spawnPlayer(cell.y, cell.x, {position, loadout}));
  machine.continueAfterPayment();
  resume();
  return true;
}
