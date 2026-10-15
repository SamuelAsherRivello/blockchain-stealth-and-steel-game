export const PATROL_SEPARATION_PREFERENCE = 0.8;

/** Rank already-legal destinations; intent is a preference, never a reservation. */
export function choosePatrolDestination(candidates, { id, peers = [], random = Math.random, straight = null } = {}) {
  if (candidates.length <= 1) return candidates[0];
  const points = peers.filter(peer => peer.id !== id && peer.isAlive !== false)
    .flatMap(peer => [peer.cell, peer.patrolDestination]).filter(Boolean);
  const scores = candidates.map(({ cell }) => points.length
    ? Math.min(...points.map(point => Math.abs(cell.x - point.x) + Math.abs(cell.y - point.y))) : 0);
  const maximum = Math.max(...scores);
  const best = candidates.filter((_, index) => scores[index] === maximum);
  const draw = () => Math.max(0, Math.min(1, random()));
  const choose = values => values[Math.min(values.length - 1, Math.floor(draw() * values.length))];
  if (best.length === candidates.length && !straight) return choose(candidates);
  if (draw() < PATROL_SEPARATION_PREFERENCE) return best.includes(straight) ? straight : choose(best);
  return choose(candidates);
}

/** Live records keep death, removal and level teardown out of coordination. */
export function snapshotPatrolPeers(records, tileSize) {
  return records.filter(record => record.combat.isAlive).map(record => ({
    id: record.combat.label,
    cell: { ...record.actor.getGridPosition(tileSize) },
    patrolDestination: record.brain?.getPatrolDestination() ?? null,
  }));
}
