/** Pure bounded uniform-cost search. Facts contain scalar values, never live actors. */
export const matches = (facts, conditions) => Object.entries(conditions).every(([key, value]) => facts[key] === value);
const keyOf = facts => JSON.stringify(Object.keys(facts).sort().map(key => [key, facts[key]]));

export function plan(facts, goal, actions, { maxExpansions = 256, maxDepth = 8 } = {}) {
  if (!Number.isInteger(maxExpansions) || maxExpansions < 0 || !Number.isInteger(maxDepth) || maxDepth < 0) throw new RangeError('Invalid planning budget');
  for (const action of actions) {
    if (!Number.isFinite(action.cost) || action.cost < 0) throw new RangeError('Action cost must be finite and non-negative');
  }
  const result = (status, steps = [], cost = 0) => ({ status, steps, cost, expanded });
  let expanded = 0, serial = 0, depthLimited = false;
  if (matches(facts, goal)) return result('already-satisfied');
  const queue = [{ facts: { ...facts }, steps: [], cost: 0, serial: serial++ }];
  // Depth participates in dominance: a cheaper but longer path cannot exhaust the
  // depth limit and suppress a shorter viable path to the same facts.
  const best = new Map([[`${keyOf(facts)}:0`, 0]]);
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost || a.serial - b.serial);
    const current = queue.shift();
    if (matches(current.facts, goal)) return result('found', current.steps, current.cost);
    if (expanded >= maxExpansions) return result('budget-exhausted');
    if (current.steps.length >= maxDepth) { depthLimited = true; continue; }
    expanded++;
    for (const action of actions) {
      if (!matches(current.facts, action.preconditions ?? {})) continue;
      const next = { ...current.facts, ...action.effects };
      if (keyOf(next) === keyOf(current.facts)) continue;
      const cost = current.cost + action.cost, depth = current.steps.length + 1;
      const stateKey = keyOf(next);
      let dominated = false;
      for (let d = 0; d <= depth; d++) if ((best.get(`${stateKey}:${d}`) ?? Infinity) <= cost) { dominated = true; break; }
      if (dominated) continue;
      best.set(`${stateKey}:${depth}`, cost);
      queue.push({ facts: next, steps: [...current.steps, action], cost, serial: serial++ });
    }
  }
  return result(depthLimited ? 'budget-exhausted' : 'unreachable');
}
