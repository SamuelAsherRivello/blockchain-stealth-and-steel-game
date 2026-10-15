import { createHealthBar } from './health-bar.js';
import { drawStatusBadge } from './status-badge.js';
import { getColliderCenter } from '../characters/character-spatial.js';

// Screen-space offsets from the logical character center to the health-bar center.
// These belong to overhead presentation, never to sprite artwork or colliders.
export const CHARACTER_OVERHEAD_OFFSETS = Object.freeze(Object.fromEntries(
  Object.entries({ player: -56, sheep: -72, goblin: -64, warrior: -72, lancer: -64, archer: -72, monk: -56 })
    .map(([character, y]) => [character, Object.freeze({ x: 0, y })]),
));
export const HEALTH_BAR_STYLE = Object.freeze({
  width: 40, height: 6, border: '#c8d5ba', background: '#18221c', fill: '#62cc68',
});
const ICON_HALF_SIZE = 25;
const ICON_GAP = 6;
const ICON_MIN_SCALE = 0.3;

export function getCharacterOverheadLayout(center, character, screenHeight, jumpOffset = 0) {
  const offset = CHARACTER_OVERHEAD_OFFSETS[character] ?? CHARACTER_OVERHEAD_OFFSETS.player;
  const bar = { x: center.x + offset.x, y: screenHeight - center.y + offset.y + jumpOffset };
  return { bar, icon: { x: bar.x, y: bar.y - HEALTH_BAR_STYLE.height / 2 - ICON_GAP - ICON_HALF_SIZE } };
}

/** Own the meter subscription with the actor, including a retained player's revival. */
export function createCharacterOverhead(combat) {
  const meter = createHealthBar(combat.health, combat.maxHealth);
  let disposed = false;
  const unsubscribe = combat.subscribeHealthChanges(change => {
    if (change.previous <= 0 && change.current > 0) meter.reset(change.previous, change.maximum);
    meter.healthChanged(change);
  });
  return {
    get snapshot() {
      return combat.isDead || disposed ? { ...meter.snapshot, opacity: 0 } : meter.snapshot;
    },
    update(deltaSeconds) {
      if (disposed) return;
      if (combat.isDead) meter.reset(combat.health, combat.maxHealth);
      else meter.update(deltaSeconds);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      meter.reset(combat.health, combat.maxHealth);
    },
  };
}

/** Draw in world canvas coordinates; the caller applies the camera translation once. */
export function drawCharacterOverheads(context, badgeArt, records, screenHeight) {
  for (const record of records) {
    if (record.combat.isDead) continue;
    const layout = getCharacterOverheadLayout(getColliderCenter(record.actor.getMovementCollider()),
      record.character ?? record.type, screenHeight, record.expressionJumpOffset ?? 0);
    const meter = record.overhead?.snapshot;
    if (meter?.opacity > 0) {
      const { width, height, border, background, fill } = HEALTH_BAR_STYLE;
      const x = layout.bar.x - width / 2, y = layout.bar.y - height / 2;
      context.save();
      context.globalAlpha = meter.opacity;
      context.fillStyle = border; context.fillRect(x, y, width, height);
      context.fillStyle = background; context.fillRect(x + 1, y + 1, width - 2, height - 2);
      context.fillStyle = fill; context.fillRect(x + 1, y + 1, (width - 2) * meter.ratio, height - 2);
      context.restore();
    }
    for (const instance of record.expressionInstances ?? []) {
      const opacity = Math.max(0, Math.min(1, instance.opacity ?? 0));
      if (!instance.icon || opacity <= 0) continue;
      const scale = ICON_MIN_SCALE + (1 - ICON_MIN_SCALE) * opacity;
      context.save();
      context.globalAlpha = opacity;
      context.translate(layout.icon.x, layout.icon.y);
      context.scale(scale, scale);
      context.shadowColor = 'rgb(0 0 0 / 70%)';
      context.shadowBlur = 4; context.shadowOffsetY = 2;
      drawStatusBadge(context, badgeArt, { x: 0, y: 0, icon: instance.icon, flash: instance.flash });
      context.restore();
    }
  }
}
