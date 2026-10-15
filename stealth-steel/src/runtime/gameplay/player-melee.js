import { collidersOverlap } from './game-logic.js';
import { PLAYER_PAWN_ANIMATION_CATALOG, PLAYER_WEAPON_DAMAGE } from '../characters/player/player-pawn-catalog.js';
import { SpawnerType } from '../systems/spawners/spawner-catalog.js';
import { getPlayerOutgoingDamage } from './equipment-effects.js';

const animation = PLAYER_PAWN_ANIMATION_CATALOG.weapons.knife.attack;
const duration = animation.frameCount * animation.frameDurationMs / 1000;

// One game-time clock drives both the displayed knife frame and its damage event.
export function createKnifeSwing() {
  let active = false, elapsed = 0, released = false;
  let move = { duration, impactAt: duration / 2, delay: 0, direction: 1 };
  return {
    get active() { return active; },
    get elapsed() { return elapsed; },
    get frame() {
      const frame = Math.min(animation.frameCount - 1, Math.max(0, Math.floor((elapsed - move.delay + 1e-9) * 1000 / animation.frameDurationMs)));
      return move.direction < 0 ? animation.frameCount - 1 - frame : frame;
    },
    start(nextMove = {}) {
      if (active) return false;
      move = {
        duration: nextMove.duration ?? duration,
        impactAt: nextMove.impactAt ?? duration / 2,
        delay: nextMove.delay ?? 0,
        direction: nextMove.direction ?? 1,
      };
      active = true; elapsed = 0; released = false;
      return true;
    },
    cancel() { active = false; },
    advance(deltaSeconds) {
      if (!active) return { impact: false, completed: false };
      const totalDuration = move.delay + move.duration;
      elapsed = Math.min(totalDuration, elapsed + Math.max(0, deltaSeconds));
      const impact = !released && elapsed + 1e-9 >= move.delay + move.impactAt;
      if (impact) released = true;
      const completed = elapsed + 1e-9 >= totalDuration;
      if (completed) active = false;
      return { impact, completed };
    },
  };
}

export function resolvePlayerKnifeImpact(player, enemies, {
  multiplier = 1,
  eligibleTargetIds = null,
  onEligibleImpact = () => {},
  collectImpacts = false,
} = {}) {
  if (!player?.combat.isAlive) return 0;
  const collider = player.combat.getCombatCollider();
  if (!collider) return 0;
  const from = player.actor.getPosition();
  const impacts = [];
  for (const enemy of enemies) {
    if (enemy.type !== SpawnerType.ENEMY || !enemy.combat.isAlive) continue;
    const target = enemy.combat.getCombatCollider();
    if (!target || !collidersOverlap(collider, target)) continue;
    onEligibleImpact(enemy);
    if (enemy.actor.isDefending) continue;
    const to = enemy.actor.getPosition();
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const direction = length ? { x: (to.x - from.x) / length, y: (to.y - from.y) / length } : { x: 1, y: 0 };
    const targetId = enemy.combat.label;
    const upgraded = eligibleTargetIds?.has(targetId) ?? false;
    const damageMultiplier = upgraded ? multiplier : 1;
    enemy.combat.applyDamage(
      getPlayerOutgoingDamage(player, PLAYER_WEAPON_DAMAGE.knife) * damageMultiplier,
      direction,
    );
    impacts.push({ enemy, targetId, upgraded });
  }
  return collectImpacts ? impacts : impacts.length;
}
