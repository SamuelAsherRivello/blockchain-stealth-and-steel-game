import test from 'node:test';
import assert from 'node:assert/strict';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';

test('health changes notify before death and ignore blocked/invalid damage', () => {
  const events = [];
  const combat = createCombatActorState({ setVisualTransform() {}, getCombatCollider() {},
    onHealthChange: event => events.push(event), onDeathStart: () => events.push('death') });
  assert.equal(combat.maxHealth, 100);
  assert.deepEqual(events, []);
  for (const value of [0, -1, NaN, Infinity]) combat.applyDamage(value);
  assert.deepEqual(events, []);
  const observed = [];
  const unsubscribe = combat.subscribeHealthChanges(event => observed.push(event));
  combat.applyDamage(25);
  assert.deepEqual(events, [{ previous: 100, current: 75, maximum: 100 }]);
  combat.applyDamage(100);
  assert.deepEqual(events.slice(1), [{ previous: 75, current: -25, maximum: 100 }, 'death']);
  combat.applyDamage(25); assert.equal(events.length, 3);
  unsubscribe(); combat.updateDeath(.25); combat.revive();
  assert.equal(observed.length, 2);
  assert.deepEqual(events.at(-1), { previous: -25, current: 100, maximum: 100 });
});
