import { requestPlayerAttack, hasPlayerAttackPreparation, cancelPlayerAttackPreparation } from './player-attack-preparation.js';
import { collidersOverlap } from '../../gameplay/game-logic.js';

export function fireHitCollider(body, direction, reach) {
  return Math.abs(direction.x) >= Math.abs(direction.y)
    ? { x: direction.x >= 0 ? body.x + body.width : body.x - reach, y: body.y, width: reach, height: body.height }
    : { x: body.x, y: direction.y >= 0 ? body.y + body.height : body.y - reach, width: body.width, height: reach };
}

/** Rendering/physics stay in actors. Only this adapter initiates planned attacks. */
export function createAttackExecution(context, binding, kind) {
  const { actor, profile, grid } = context;
  let committed = false, remaining = profile.recoverySeconds, phase = 'preparing', reason = null, cancelled = false;
  const resolve = () => context.resolveTarget(binding);
  const eligible = target => context.attackEligible(target, binding.rule);
  const commit = (target, direction) => {
    if (cancelled || !target || !eligible(target)) return false;
    const from = actor.getPosition();
    direction ??= { x: target.position.x - from.x, y: target.position.y - from.y };
    const accepted = kind === 'ranged' ? actor.shootAt(target.position)
      : profile.attackStyle === 'direction' ? actor.attack(direction) : actor.attack(profile.attackVariant, direction);
    if (!accepted) return false;
    committed = true; phase = 'attacking';
    context.onAttackCommitted?.(binding);
    if (kind === 'burn-bush' && target.combatCollider
      && collidersOverlap(fireHitCollider(actor.getCombatCollider(), direction, grid.tileSizePx), target.combatCollider)) target.applyFireDamage(profile.bushDamage);
    return true;
  };
  return {
    get committed() { return committed; }, get phase() { return phase; }, get reason() { return reason; },
    start() {
      const target = resolve();
      if (!target || !eligible(target)) { reason = 'target-ineligible'; return; }
      actor.setMovementIntent({ x: 0, y: 0 });
      if (binding.type === 'player') requestPlayerAttack(actor, { grid, getTarget: resolve, eligible, commit });
      else commit(target);
    },
    update(_context, delta) {
      if (reason) return 'failed';
      if (!committed) {
        const target = resolve();
        if (!target || !eligible(target) || !hasPlayerAttackPreparation(actor)) {
          reason = 'preparation-cancelled'; return 'failed';
        }
        return 'running';
      }
      if (actor.isDefending) { reason = 'defense'; return 'cancelled'; }
      if (actor.state === 'recovering') phase = 'recovery';
      if (actor.isAttacking || actor.isMovementLocked?.()) return 'running';
      phase = 'recovery';
      // Archer owns its full recovery; Goblin's controller-owned recovery moves here.
      if (kind === 'ranged') return 'succeeded';
      remaining = Math.max(0, remaining - delta);
      return remaining <= 1e-9 ? 'succeeded' : 'running';
    },
    cancel() { cancelled = true; if (!committed) cancelPlayerAttackPreparation(actor); actor.setMovementIntent({ x: 0, y: 0 }); },
  };
}
