import { CARDINAL_STEPS, cellKey, cellCenter, cardinalIntent, createMovementRecovery } from '../characters/movement-recovery.js';
import { isCellInGrid } from '../systems/environment/grid-contract.js';

export const cardinalDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
/** Resumable BFS, independent of symbolic planning. All ties retain stable order. */
export function createReachabilitySearch(start, grid, isWalkable, { maxDepth = grid.columns * grid.rows, excludedFirst = null } = {}) {
  const queue = [{ cell: { ...start }, route: [] }], visited = new Set([cellKey(start)]);
  let cursor = 0, expanded = 0;
  return {
    step(budget = 256) {
      let used = 0;
      while (cursor < queue.length && used < budget) {
        const current = queue[cursor++]; used++; expanded++;
        if (current.route.length >= maxDepth) continue;
        for (const step of CARDINAL_STEPS) {
          const cell = { x: current.cell.x + step.x, y: current.cell.y + step.y };
          if (!isCellInGrid(cell, grid) || visited.has(cellKey(cell))) continue;
          if (!current.route.length && excludedFirst && cellKey(cell) === cellKey(excludedFirst)) continue;
          if (!isWalkable(cell) || isWalkable.canTraverse?.(current.cell, cell) === false) continue;
          visited.add(cellKey(cell)); queue.push({ cell, route: [...current.route, cell] });
        }
      }
      return { done: cursor >= queue.length, used, expanded, candidates: cursor >= queue.length ? queue : null };
    },
  };
}

export function createNavigation({ actor, grid, isWalkable, scheduler, retrySeconds = 3 }) {
  const recovery = createMovementRecovery({ retrySeconds });
  let search = null, route = [], selection = null, status = 'idle', reason = null, expanded = 0, intent = { x: 0, y: 0 };
  const stop = () => { intent = { x: 0, y: 0 }; actor.setMovementIntent(intent); };
  return {
    start(select, options) {
      stop(); route = []; selection = select; reason = null; expanded = 0;
      search = createReachabilitySearch(actor.getGridPosition(grid.tileSizePx), grid, isWalkable, options); status = 'searching'; recovery.cancel();
    },
    cancel() { stop(); search = null; route = []; status = 'idle'; recovery.cancel(); },
    update(delta) {
      if (delta <= 0) return 'running';
      if (search) {
        const budget = scheduler ? scheduler.takeNavigation(256) : 256;
        const result = search.step(budget); expanded = result.expanded;
        scheduler?.refundNavigation(budget - result.used);
        if (!result.done) { stop(); return 'running'; }
        route = selection(result.candidates)?.route?.map(cell => ({ ...cell })) ?? null; search = null;
        if (!route) { status = 'failed'; reason = 'no-route'; stop(); return 'failed'; }
        recovery.accept(); status = 'moving';
      }
      if (status === 'failed') return 'failed';
      const position = actor.getPosition();
      while (route.length && Math.hypot(position.x - cellCenter(route[0], grid.tileSizePx).x, position.y - cellCenter(route[0], grid.tileSizePx).y) <= 3) {
        route.shift(); recovery.accept();
      }
      if (!route.length) { status = 'succeeded'; stop(); return 'succeeded'; }
      const next = route[0], cell = actor.getGridPosition(grid.tileSizePx), waypoint = cellCenter(next, grid.tileSizePx);
      if (!isWalkable(next) || isWalkable.canTraverse?.(cell, next) === false || recovery.observe(position, waypoint, delta)) {
        reason = 'blocked-or-stalled'; status = 'failed'; stop(); return 'failed';
      }
      intent = cardinalIntent(position, waypoint); actor.setMovementIntent(intent); return 'running';
    },
    snapshot() { return { ...recovery.snapshot(), navigationStatus: status, recoveryReason: reason ?? recovery.snapshot().recoveryReason,
      navigationExpanded: expanded, intent: { ...intent }, waypoint: route?.[0] ? cellCenter(route[0], grid.tileSizePx) : null,
      cell: actor.getGridPosition(grid.tileSizePx), position: actor.getPosition() }; },
  };
}
