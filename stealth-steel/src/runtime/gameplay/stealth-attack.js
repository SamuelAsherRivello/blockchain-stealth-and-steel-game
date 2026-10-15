import { GRID } from '../systems/environment/grid-contract.js';

export const STEALTH_ATTACK_READY_SECONDS = 0.25;
export const STEALTH_ATTACK_SHADOW_FADE_SECONDS = 0.125;
export const STEALTH_EXECUTION_SECONDS = 0.8;
const PULL_SECONDS = 0.125;
const HOLD_SECONDS = 0.25;
const HEADING_STEP = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
});
const HORIZONTAL_HEADINGS = new Set(['left', 'right']);

function samePosition(a, b) {
  return a && b && Math.abs(a.x - b.x) <= 1e-6 && Math.abs(a.y - b.y) <= 1e-6;
}

/** Publishes the current behind-facing cell only while an enemy remains still. */
export function createStealthAttackController({ tileSize = GRID.tileSizePx } = {}) {
  const states = new Map();
  let zones = [];
  return {
    getZones() { return zones.map((zone) => ({
      ...zone,
      cell: { ...zone.cell },
      interactionPosition: { ...zone.interactionPosition },
      sourcePosition: { ...zone.sourcePosition },
    })); },
    update(enemies, deltaSeconds) {
      const active = new Set();
      const delta = Math.max(0, deltaSeconds);
      zones = [];
      for (const [order, enemy] of enemies.entries()) {
        if (!enemy?.isAlive || !enemy.id || !enemy.cell || !HEADING_STEP[enemy.heading] || !enemy.position) continue;
        active.add(enemy.id);
        const prior = states.get(enemy.id);
        const changed = prior && (prior.heading !== enemy.heading || !samePosition(prior.position, enemy.position));
        const state = prior ?? { elapsed: 0, token: 0 };
        if (changed) { state.elapsed = 0; state.token += 1; }
        else state.elapsed += delta;
        state.heading = enemy.heading;
        state.position = { ...enemy.position };
        states.set(enemy.id, state);
        if (state.elapsed <= STEALTH_ATTACK_READY_SECONDS || !HORIZONTAL_HEADINGS.has(enemy.heading)) continue;
        const direction = HEADING_STEP[enemy.heading];
        const cell = { x: enemy.cell.x - direction.x, y: enemy.cell.y - direction.y };
        zones.push(Object.freeze({
          id: `${enemy.id}:stealth`, enemyId: enemy.id, cell,
          interactionPosition: { x: (cell.x + .5) * tileSize, y: (cell.y + .5) * tileSize },
          sourcePosition: { ...enemy.position },
          heading: enemy.heading, token: state.token, order,
        }));
      }
      for (const id of states.keys()) if (!active.has(id)) states.delete(id);
      return this.getZones();
    },
  };
}

/** Retains visual-only yellow shadows after their opportunity expires. */
export function createStealthAttackShadowLifecycle({ fadeSeconds = STEALTH_ATTACK_SHADOW_FADE_SECONDS } = {}) {
  const instances = new Map();
  const duration = Math.max(1e-9, fadeSeconds);

  function clone(instance) {
    return {
      id: instance.id,
      enemyId: instance.enemyId,
      interactionPosition: { ...instance.interactionPosition },
      opacity: instance.opacity,
      phase: instance.phase,
    };
  }

  return {
    update(zones, deltaSeconds) {
      const current = new Map((zones ?? []).map((zone) => [zone.id, zone]));
      const delta = Math.max(0, deltaSeconds);
      for (const zone of current.values()) {
        const existing = instances.get(zone.id);
        if (existing) {
          existing.enemyId = zone.enemyId;
          existing.interactionPosition = { ...zone.interactionPosition };
          existing.phase = existing.phase === 'out' ? 'in' : existing.phase;
        } else {
          instances.set(zone.id, {
            id: zone.id,
            enemyId: zone.enemyId,
            interactionPosition: { ...zone.interactionPosition },
            opacity: 0,
            phase: 'in',
          });
        }
      }
      for (const instance of instances.values()) {
        if (!current.has(instance.id)) instance.phase = 'out';
        if (instance.phase === 'in') {
          instance.opacity = Math.min(1, instance.opacity + delta / duration);
          if (instance.opacity >= 1) instance.phase = 'hold';
        } else if (instance.phase === 'out') {
          instance.opacity = Math.max(0, instance.opacity - delta / duration);
          if (instance.opacity <= 0) instances.delete(instance.id);
        }
      }
      return this.getInstances();
    },
    getInstances() { return [...instances.values()].map(clone); },
    clear() { instances.clear(); },
  };
}

/** Owns the player-only lock and visual lunge for a successful execution. */
export function createStealthExecution({ durationSeconds = STEALTH_EXECUTION_SECONDS, lungePixels = 22 } = {}) {
  const duration = Math.max(1e-9, durationSeconds);
  let execution = null;
  return {
    get active() { return execution !== null; },
    start(direction) {
      if (execution) return false;
      const length = Math.hypot(direction?.x ?? 0, direction?.y ?? 0) || 1;
      execution = { direction: { x: (direction?.x ?? 1) / length, y: (direction?.y ?? 0) / length }, elapsed: 0 };
      return true;
    },
    cancel() { execution = null; },
    advance(deltaSeconds) {
      if (!execution) return { active: false, completed: false, frame: 0, visualOffset: { x: 0, y: 0 } };
      execution.elapsed = Math.min(duration, execution.elapsed + Math.max(0, deltaSeconds));
      const progress = execution.elapsed / duration;
      const lunge = Math.sin(Math.PI * progress) * lungePixels;
      const result = {
        active: progress < 1,
        completed: progress >= 1,
        frame: Math.min(3, Math.floor(Math.min(progress, 1 - 1e-9) * 4)),
        visualOffset: { x: execution.direction.x * lunge, y: execution.direction.y * lunge },
      };
      if (result.completed) execution = null;
      return result;
    },
  };
}

/** Bush-equivalent pull and brief hold for one currently armed stealth space. */
export function createStealthAttackGravity({ gridWidth = GRID.tileSizePx } = {}) {
  const minimumDistance = gridWidth * .75;
  let activeZones = new Map();
  let pull = null;
  let hold = null;
  let armed = null;
  function isCurrent(zone) {
    const current = activeZones.get(zone?.id);
    return current?.enemyId === zone?.enemyId && current?.token === zone?.token;
  }
  function clearIfInvalid() {
    if (pull && !isCurrent(pull.zone)) pull = null;
    if (hold && !isCurrent(hold.zone)) hold = null;
    if (armed && !isCurrent(armed)) armed = null;
  }
  return {
    get active() { return pull !== null; },
    get movementLocked() { return pull !== null || hold !== null; },
    getSourcePosition() {
      const source = (pull ?? hold)?.zone?.sourcePosition;
      return source ? { ...source } : null;
    },
    isAudioSuppressed() { return pull !== null || hold !== null; },
    getEntry() {
      const zone = (pull ?? hold)?.zone;
      return zone && { id: zone.id, enemyId: zone.enemyId, token: zone.token };
    },
    cancel() { pull = null; hold = null; armed = null; },
    observe(zones, position, enabled = true) {
      activeZones = new Map((zones ?? []).map((zone) => [zone.id, zone]));
      clearIfInvalid();
      if (!enabled) { this.cancel(); return; }
      if (armed && Math.hypot(position.x - armed.interactionPosition.x, position.y - armed.interactionPosition.y) >= minimumDistance) armed = null;
      if (pull || hold) return;
      const zone = [...activeZones.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).find((candidate) => (
        Math.hypot(position.x - candidate.interactionPosition.x, position.y - candidate.interactionPosition.y) < minimumDistance
      ));
      if (!zone) return;
      armed = zone;
      if (samePosition(position, zone.interactionPosition)) return;
      pull = { zone, start: { ...position }, elapsed: 0 };
    },
    step(deltaSeconds) {
      clearIfInvalid();
      if (hold) {
        hold.remaining -= Math.max(0, deltaSeconds);
        if (hold.remaining <= 1e-9) hold = null;
        return null;
      }
      if (!pull) return null;
      pull.elapsed += Math.max(0, deltaSeconds);
      const progress = Math.min(1, pull.elapsed / PULL_SECONDS);
      const target = pull.zone.interactionPosition;
      const position = progress === 1 ? { ...target } : {
        x: pull.start.x + (target.x - pull.start.x) * progress * progress,
        y: pull.start.y + (target.y - pull.start.y) * progress * progress,
      };
      if (progress === 1) {
        const remaining = HOLD_SECONDS - Math.max(0, pull.elapsed - PULL_SECONDS);
        if (remaining > 1e-9) hold = { zone: pull.zone, remaining };
        pull = null;
      }
      return position;
    },
    getArmed() {
      clearIfInvalid();
      return armed && { id: armed.id, enemyId: armed.enemyId, token: armed.token };
    },
    consume(position) {
      clearIfInvalid();
      if (!armed || !samePosition(position, armed.interactionPosition)) return null;
      const result = { id: armed.id, enemyId: armed.enemyId, token: armed.token };
      armed = null;
      return result;
    },
  };
}
