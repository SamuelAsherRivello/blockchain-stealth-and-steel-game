import { CARDINAL_STEPS } from '../../characters/movement-recovery.js';
import { choosePatrolDestination } from '../patrol-selection.js';
export function patrolAction({ duration, cost = 1 } = {}) {
  return { id: 'patrol', preconditions: {}, effects: { done: true }, cost, create() {
    let context, remaining = duration, direction;
    const startRoute = () => {
      context.setPatrolDestination(null);
      context.navigation.start(candidates => {
        const current = context.actor.getGridPosition(context.grid.tileSizePx);
        let options = candidates.filter(x => x.route.length > 0);
        if (context.profile.patrolMode === 'route') {
          options = options.filter(x => x.route.length >= context.profile.patrolCells[0] && x.route.length <= context.profile.patrolCells[1]
            && (context.profile.homeRadius === null || Math.max(Math.abs(x.cell.x - context.spawnCell.x), Math.abs(x.cell.y - context.spawnCell.y)) <= context.profile.homeRadius));
        } else {
          options = options.filter(x => x.route.length === 1);
        }
        const eligible = options.length ? options : candidates.filter(x => x.route.length === 1);
        const straight = context.profile.patrolMode === 'timed' ? eligible.find(x =>
          x.cell.x - current.x === direction?.x && x.cell.y - current.y === direction?.y) : null;
        const chosen = choosePatrolDestination(eligible, { id: context.id, peers: context.getPatrolPeers(), random: context.random, straight });
        context.setPatrolDestination(chosen ? { ...chosen.cell } : null);
        if (chosen) direction = CARDINAL_STEPS.find(step => step.x === chosen.route[0].x - current.x && step.y === chosen.route[0].y - current.y);
        return chosen;
      }, { maxDepth: context.profile.patrolMode === 'route' ? context.profile.patrolCells[1] : 1 });
    };
    return { get phase() { return 'patrol'; }, get reason() { return context?.navigation.snapshot().recoveryReason; },
      start(ctx) { context = ctx; startRoute(); },
      update(ctx, delta) {
        if (ctx.profile.patrolMode === 'timed') { remaining -= delta; if (remaining <= 0) return 'succeeded'; }
        const status = ctx.navigation.update(delta);
        if (status === 'succeeded' && ctx.profile.patrolMode === 'timed') { startRoute(); return 'running'; }
        return status;
      }, cancel() { context?.setPatrolDestination(null); context?.navigation.cancel(); } };
  } };
}
