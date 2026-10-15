/** Owns action lifetime; definitions and planning effects never hold runtime state. */
export function createExecutor() {
  let steps = [], index = 0, active = null, status = 'idle', reason = null, generation = 0;
  const activate = context => {
    active = steps[index].create();
    status = 'running';
    active.start?.(context);
  };
  return {
    get generation() { return generation; },
    isCurrent(value) { return value === generation && status === 'running'; },
    get committed() { return Boolean(active?.committed); },
    get running() { return status === 'running'; },
    get actionId() { return status === 'running' ? steps[index]?.id : null; },
    start(next, context) {
      if (active?.committed) return false;
      this.cancel('replaced', true);
      steps = [...next]; index = 0; reason = null;
      if (!steps.length) { status = 'succeeded'; return true; }
      activate(context); return true;
    },
    update(context, delta) {
      if (status !== 'running' || delta <= 0) return status;
      const outcome = active.update(context, delta) ?? 'running';
      if (outcome === 'running') return outcome;
      if (!['succeeded', 'failed', 'cancelled'].includes(outcome)) throw new Error(`Invalid action result: ${outcome}`);
      reason = active.reason ?? null;
      active.cancel?.(outcome); active = null;
      if (outcome === 'succeeded' && ++index < steps.length) activate(context);
      else { status = outcome; generation++; }
      return status;
    },
    cancel(why, force = false) {
      if (active?.committed && !force) return false;
      active?.cancel?.(why); active = null; steps = []; index = 0; status = 'cancelled'; reason = why; generation++;
      return true;
    },
    snapshot() { return { status, action: this.actionId, phase: active?.phase ?? this.actionId,
      plan: steps.slice(index).map(step => step.id), reason, committed: this.committed }; },
  };
}
