import test from 'node:test';
import assert from 'node:assert/strict';
import { plan } from '../../runtime/ai/goap/planner.js';
import { createExecutor } from '../../runtime/ai/goap/executor.js';
import { createPlanningScheduler } from '../../runtime/ai/planning-scheduler.js';

const move = { id: 'move', preconditions: { range: false }, effects: { range: true }, cost: 2 };
const shoot = { id: 'shoot', preconditions: { range: true }, effects: { shot: true }, cost: 1 };
test('planner composes actions by effects and selects cheapest total cost without mutation', () => {
  const facts = Object.freeze({ range: false, shot: false });
  const actions = [shoot, { id: 'expensive', preconditions: {}, effects: { shot: true }, cost: 10 }, move];
  assert.deepEqual(plan(facts, { shot: true }, actions).steps.map(x => x.id), ['move', 'shoot']);
  assert.deepEqual(facts, { range: false, shot: false });
  assert.deepEqual(plan(facts, { shot: true }, actions), plan(facts, { shot: true }, actions));
  assert.deepEqual(plan({ range: true }, { shot: true }, actions).steps.map(x => x.id), ['shoot']);
});
test('planner terminates cycles, validates costs, honors budgets and handles satisfied goals', () => {
  assert.equal(plan({ shot: true }, { shot: true }, []).status, 'already-satisfied');
  assert.equal(plan({ range: false }, { shot: true }, [move, { id: 'back', preconditions: { range: true }, effects: { range: false }, cost: 0 }]).status, 'unreachable');
  assert.equal(plan({ range: false }, { shot: true }, [move, shoot], { maxExpansions: 1 }).status, 'budget-exhausted');
  assert.throws(() => plan({}, {}, [{ ...move, cost: NaN }]), /cost/);
});
test('executor runs exactly once, isolates instances, protects commitments and invalidates stale callbacks', () => {
  let starts = 0;
  const action = { id: 'shot', create: () => { let ticks = 0; return { start() { starts++; }, update() { return ++ticks === 2 ? 'succeeded' : 'running'; }, get committed() { return true; } }; } };
  const a = createExecutor(), b = createExecutor();
  a.start([action], {}); b.start([action], {});
  a.update({}, 1); assert.equal(a.cancel('goal-change'), false);
  a.update({}, 1); a.update({}, 1);
  assert.equal(a.snapshot().status, 'succeeded'); assert.equal(b.snapshot().status, 'running'); assert.equal(starts, 2);
  const generation = b.generation;
  b.cancel('death', true); assert.equal(b.isCurrent(generation), false);
});
test('scheduler bounds work and serves pending agents fairly', () => {
  const s = createPlanningScheduler({ maxExpansions: 2, maxNavigation: 4 });
  const seen = [];
  s.request('a', budget => { seen.push('a'); return { expanded: budget }; });
  s.request('b', budget => { seen.push('b'); return { expanded: budget }; });
  s.beginFrame(); assert.deepEqual(seen, ['a']);
  s.request('a', budget => { seen.push('a'); return { expanded: budget }; });
  s.beginFrame(); assert.deepEqual(seen, ['a', 'b']);
  assert.equal(s.takeNavigation(10), 4); assert.equal(s.takeNavigation(1), 0);
});

test('planner keeps scalar target bindings distinct and rejects depth exhaustion', () => {
  const actions = [
    { id: 'reach-a', cost: 1, preconditions: {}, effects: { at: 'a' } },
    { id: 'attack-b', cost: 1, preconditions: { at: 'b' }, effects: { done: true } },
  ];
  assert.equal(plan({ at: 'none' }, { done: true }, actions).status, 'unreachable');
  assert.equal(plan({ range: false }, { shot: true }, [move, shoot], { maxDepth: 1 }).status, 'budget-exhausted');
});
