import { createAttackExecution } from '../../characters/enemies/enemy-action-adapter.js';
export function rangedAction(binding, { cost = 1 } = {}) {
  return { id: 'ranged', preconditions: { atPosition: true }, effects: { done: true }, cost,
    create() { let execution; return {
      start(ctx) { execution = createAttackExecution(ctx, binding, 'ranged'); execution.start(); },
      update: (ctx, delta) => execution.update(ctx, delta), cancel: reason => execution?.cancel(reason),
      get committed() { return execution?.committed; }, get phase() { return execution?.phase; }, get reason() { return execution?.reason; },
    }; } };
}
