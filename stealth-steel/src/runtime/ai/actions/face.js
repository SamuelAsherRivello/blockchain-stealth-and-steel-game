import { cardinalIntent, cellCenter } from '../../characters/movement-recovery.js';
export function faceAction(binding, { cost = 1 } = {}) {
  return { id: 'face', preconditions: {}, effects: { done: true }, cost, create() { return {
    phase: 'observe', start(ctx) { ctx.actor.setMovementIntent({ x: 0, y: 0 }); },
    update(ctx) { ctx.actor.faceDirection(cardinalIntent(ctx.actor.getPosition(), cellCenter(binding.cell, ctx.grid.tileSizePx))); return 'running'; },
  }; } };
}
