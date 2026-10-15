export function moveToAction(binding, { cost = 1 } = {}) {
  return { id: 'move-to', preconditions: { atPosition: false }, effects: { atPosition: true }, cost, create() {
    let context;
    return { get phase() { return context?.navigation.snapshot().navigationStatus === 'searching' ? 'finding route' : 'move-to'; },
      get reason() { return context?.navigation.snapshot().recoveryReason; },
      start(ctx) {
        context = ctx;
        const maxDepth = binding.type === 'escape' ? 1
          : binding.type === 'flee' ? binding.maxCells
            : undefined;
        ctx.navigation.start(candidates => ctx.selectDestination(candidates, binding), maxDepth ? { maxDepth } : undefined);
      },
      update(ctx, delta) {
        if (!ctx.bindingValid(binding)) return 'failed';
        return ctx.navigation.update(delta);
      }, cancel() { context?.navigation.cancel(); } };
  } };
}
