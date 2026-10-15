export function waitAction({ duration, reason = 'idle', cost = 1 } = {}) {
  return { id: 'wait', preconditions: {}, effects: { done: true }, cost, create() {
    let remaining = duration;
    return { phase: reason, start(ctx) { ctx.actor.setMovementIntent({ x: 0, y: 0 }); },
      update(_ctx, delta) { remaining = Math.max(0, remaining - delta); return remaining <= 1e-9 ? 'succeeded' : 'running'; } };
  } };
}
