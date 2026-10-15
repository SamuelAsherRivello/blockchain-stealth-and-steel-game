import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createStealthAttackController,
  createStealthAttackGravity,
  createStealthAttackShadowLifecycle,
  createStealthExecution,
} from '../../runtime/gameplay/stealth-attack.js';
import { createStealthAttackShadowDrawCommands } from '../../runtime/ui/collider-diagnostics.js';
import { createCombatActorState, STEALTH_DEATH_DURATION_SECONDS } from '../../runtime/gameplay/combat-actor.js';

const enemy = (overrides = {}) => ({
  id: 'goblin-1', isAlive: true, cell: { x: 4, y: 5 },
  position: { x: 288, y: 352 }, heading: 'right', ...overrides,
});

test('an enemy exposes one yellow stealth space directly behind only after a quarter second of stable facing', () => {
  const attacks = createStealthAttackController({ tileSize: 64 });
  assert.deepEqual(attacks.update([enemy()], .249), []);
  assert.deepEqual(attacks.update([enemy()], .001), []);
  const [zone] = attacks.update([enemy()], .001);
  assert.deepEqual(zone, {
    id: 'goblin-1:stealth', enemyId: 'goblin-1', cell: { x: 3, y: 5 },
    interactionPosition: { x: 224, y: 352 }, sourcePosition: { x: 288, y: 352 }, heading: 'right', token: 0, order: 0,
  });
  assert.deepEqual(createStealthAttackShadowDrawCommands([zone], 64, { screenHeight: 1024 }), [{
    id: 'goblin-1:stealth', enemyId: 'goblin-1', positionPx: [224, 672], sizePx: [64, 64], frame: 0,
    color: [1, .84, .1, .68],
  }]);
});

test('turning or moving an enemy immediately invalidates its armed space and restarts the timer', () => {
  const attacks = createStealthAttackController({ tileSize: 64 });
  attacks.update([enemy()], .251);
  assert.equal(attacks.getZones().length, 1);
  assert.deepEqual(attacks.update([enemy({ position: { x: 289, y: 352 } })], .1), []);
  assert.deepEqual(attacks.update([enemy({ position: { x: 289, y: 352 } })], .251), [{
    id: 'goblin-1:stealth', enemyId: 'goblin-1', cell: { x: 3, y: 5 },
    interactionPosition: { x: 224, y: 352 }, sourcePosition: { x: 289, y: 352 }, heading: 'right', token: 1, order: 0,
  }]);
  assert.deepEqual(attacks.update([enemy({ position: { x: 289, y: 352 }, heading: 'up' })], .1), []);
  assert.deepEqual(attacks.update([enemy({ position: { x: 289, y: 352 }, heading: 'up' })], .251), []);
});

test('stealth attack gravity matches bush pull timing and only consumes a still-armed position', () => {
  const gravity = createStealthAttackGravity();
  const zone = { id: 'goblin-1:stealth', enemyId: 'goblin-1', token: 0, interactionPosition: { x: 224, y: 352 } };
  gravity.observe([zone], { x: 184, y: 352 });
  assert.deepEqual(gravity.step(.125), { x: 224, y: 352 });
  assert.equal(gravity.movementLocked, true);
  assert.deepEqual(gravity.consume({ x: 224, y: 352 }), { id: 'goblin-1:stealth', enemyId: 'goblin-1', token: 0 });
  assert.equal(gravity.consume(), null);
  gravity.observe([], { x: 224, y: 352 });
  assert.equal(gravity.movementLocked, false);
});

test('a stealth takedown is a one-shot with a longer spinning death and forceful knockback', () => {
  const transforms = [], knockbacks = [];
  const combat = createCombatActorState({ getCombatCollider() {}, setVisualTransform: value => transforms.push(value),
    onKnockback: (direction, options) => knockbacks.push({ direction, options }) });
  combat.applyStealthKill({ x: -1, y: 0 });
  assert.equal(combat.health, 0);
  assert.equal(combat.isDying, true);
  assert.equal(knockbacks[0].options.duration, STEALTH_DEATH_DURATION_SECONDS);
  combat.updateDeath(.4);
  assert.ok(Math.abs(transforms.at(-1).rotation) > Math.PI, 'death should visibly spin before completing');
  assert.equal(combat.isDying, true);
  combat.updateDeath(.4);
  assert.equal(combat.isDead, true);
});

test('rear-cell positions cover horizontal facings only, invalidate on death, and choose overlap by record order', () => {
  const attacks = createStealthAttackController({ tileSize: 64 });
  const directions = { left: { x: 5, y: 5 }, right: { x: 3, y: 5 } };
  for (const [heading, cell] of Object.entries(directions)) {
    const [zone] = attacks.update([enemy({ id: heading, heading })], .251);
    assert.deepEqual(zone.cell, cell);
  }
  assert.deepEqual(attacks.update([enemy({ id: 'vertical', heading: 'up' })], .251), []);
  assert.deepEqual(attacks.update([enemy({ id: 'vertical', heading: 'down' })], .251), []);
  assert.deepEqual(attacks.update([enemy({ id: 'dead', isAlive: false })], .1), []);
  const gravity = createStealthAttackGravity();
  const position = { x: 224, y: 352 };
  gravity.observe([
    { id: 'second', enemyId: 'second', token: 0, order: 1, interactionPosition: position },
    { id: 'first', enemyId: 'first', token: 0, order: 0, interactionPosition: position },
  ], position);
  assert.equal(gravity.getArmed().enemyId, 'first');
});

test('stealth gravity retains its selected source while it owns pull and hold', () => {
  const gravity = createStealthAttackGravity();
  const zone = {
    id: 'goblin-1:stealth', enemyId: 'goblin-1', token: 0,
    interactionPosition: { x: 224, y: 352 }, sourcePosition: { x: 288, y: 352 },
  };
  gravity.observe([zone], { x: 184, y: 352 });
  assert.deepEqual(gravity.getSourcePosition(), { x: 288, y: 352 });
  assert.equal(gravity.isAudioSuppressed(), true);
  gravity.step(.125);
  assert.deepEqual(gravity.getSourcePosition(), { x: 288, y: 352 });
  gravity.step(.25);
  assert.equal(gravity.isAudioSuppressed(), false);
  assert.equal(gravity.getSourcePosition(), null);
});

test('yellow shadow instances fade independently from gameplay tokens and pause without progress', () => {
  const shadows = createStealthAttackShadowLifecycle();
  const zone = { id: 'goblin-1:stealth', enemyId: 'goblin-1', interactionPosition: { x: 224, y: 352 } };
  assert.equal(shadows.update([zone], .0625)[0].opacity, .5);
  assert.equal(shadows.update([zone], 0)[0].opacity, .5);
  assert.equal(shadows.update([zone], .0625)[0].phase, 'hold');
  assert.equal(shadows.update([], .0625)[0].opacity, .5);
  assert.deepEqual(shadows.update([], .0625), []);
  const blocked = { id: 'blocked', enemyId: 'blocked', interactionPosition: { x: 32, y: 32 } };
  const appearing = { id: 'appearing', enemyId: 'appearing', interactionPosition: { x: 96, y: 32 } };
  shadows.update([blocked], .125);
  const simultaneous = shadows.update([appearing], .0625);
  assert.deepEqual(simultaneous.map(({ id, opacity }) => ({ id, opacity })), [
    { id: 'blocked', opacity: .5 }, { id: 'appearing', opacity: .5 },
  ]);
  assert.equal(createStealthAttackShadowDrawCommands([blocked], 64)[0].positionPx[0], 32, 'blocked terrain never hides the yellow signal');
});

test('execution stays physical-position-neutral while its 0.8 second visual lunge runs', () => {
  const execution = createStealthExecution();
  assert.equal(execution.start({ x: 1, y: 0 }), true);
  const middle = execution.advance(.4);
  assert.equal(middle.frame, 2);
  assert.ok(middle.visualOffset.x > 0);
  assert.equal(middle.completed, false);
  assert.equal(execution.advance(.4).completed, true);
  assert.equal(execution.active, false);
});
