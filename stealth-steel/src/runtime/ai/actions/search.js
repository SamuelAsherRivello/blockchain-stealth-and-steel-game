export function searchAction({ cost = 1 } = {}) {
  return { id: 'search', preconditions: { atPosition: true }, effects: { done: true }, cost, create() { return {
    phase: 'search', start(ctx) { ctx.actor.setMovementIntent({ x: 0, y: 0 }); },
    update(ctx) {
      const reaction = ctx.reaction.getSnapshot();
      ctx.actor.faceDirection([{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }][reaction.searchDirectionIndex]);
      return 'running'; // The existing awareness clock owns the search deadline.
    },
  }; } };
}
