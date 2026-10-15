import { createDistanceImpulse } from './player-damage.js';
import { moveWithCollisions } from './game-logic.js';
import { GRID } from '../systems/environment/grid-contract.js';

export function createEnemyKnockback({ character, bounds, obstacles = [] }) {
  const impulse = createDistanceImpulse();
  return {
    get active() { return impulse.active; },
    start(direction, { distance = GRID.tileSizePx / 2, duration = .2 } = {}) {
      impulse.start(direction, { distance, duration });
    },
    move(position, deltaSeconds, dynamicColliders = []) {
      const displacement = impulse.step(deltaSeconds);
      if (!displacement) return null;
      const distance = Math.hypot(displacement.x, displacement.y);
      if (distance === 0) return { ...position };
      return moveWithCollisions(position,
        { x: displacement.x / distance, y: displacement.y / distance }, distance,
        bounds, character, [...obstacles, ...dynamicColliders.map(({ collider }) => collider)]);
    },
  };
}
