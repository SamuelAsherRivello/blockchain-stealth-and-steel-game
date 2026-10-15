import test from 'node:test';
import assert from 'node:assert/strict';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';
import { createGoblin } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createMonk } from '../../runtime/characters/enemies/monk/monk.js';
import { createArcher } from '../../runtime/characters/enemies/archer/archer.js';

const factories = { goblin: createGoblin, warrior: createWarrior, lancer: createLancer, monk: createMonk };
function setup(factory, obstacles = []) {
  const sprites = [];
  const api = {
    createSprite2DLayer: (_atlas, options) => ({ ...options }),
    addSprite2D: (layer, options) => { const sprite = { layer, ...options }; sprites.push(sprite); return sprite; },
    updateSprite2D: (sprite, patch) => Object.assign(sprite, patch),
    playSprite2DAnimation: () => ({}), stopSpriteAnimation() {}, removeSprite2D() {},
  };
  const actor = factory({ atlases: {}, initialPosition: { x: 320, y: 320 }, bounds: { width: 1024, height: 1024 }, obstacles, api, runtimeApi: api });
  const combat = createCombatActorState({ getCombatCollider: () => actor.getCombatCollider(),
    setVisualTransform: patch => actor.setVisualTransform(patch), onKnockback: (d, o) => actor.applyKnockback(d, o) });
  return { actor, combat, sprites };
}

for (const [name, factory] of Object.entries(factories)) {
  test(`${name}: damage moves half a cell away, regardless of frame rate, and flashes all animations`, () => {
    for (const delta of [1 / 30, 1 / 144, .25]) {
      const { actor, combat, sprites } = setup(factory);
      combat.applyDamage(25, { x: 3, y: 4 });
      actor.setMovementIntent({ x: -1, y: 0 });
      actor.update(0);
      assert.deepEqual(actor.getPosition(), { x: 320, y: 320 }, 'pause freezes recoil');
      for (let elapsed = 0; elapsed < .2 - 1e-9; elapsed += delta) actor.update(delta);
      assert.ok(Math.abs(actor.getPosition().x - (320 + 32 * .6)) < 1e-7, `x recoil: ${JSON.stringify(actor.getPosition())}`);
      assert.ok(Math.abs(actor.getPosition().y - (320 + 32 * .8)) < 1e-7);
      assert.deepEqual(actor.getGridPosition(64), { x: 5, y: 5 });
      combat.updateDeath(.1);
      assert.ok(sprites.every(s => s.color?.[0] > 1), 'every animation flashes');
      combat.updateDeath(.6);
      assert.ok(sprites.every(s => s.color?.[0] === 1), 'flash clears');
    }
  });
  test(`${name}: recoil respects walls and replaces travel on a fresh hit`, () => {
    const { actor, combat } = setup(factory, [{ x: 350, y: 200, width: 64, height: 300 }]);
    combat.applyDamage(25, { x: 1, y: 0 });
    actor.update(.2);
    assert.ok(actor.getMovementCollider().x + actor.getMovementCollider().radius <= 350);
    const start = actor.getPosition();
    combat.applyDamage(25, { x: -1, y: 0 });
    actor.update(.2);
    assert.ok(Math.abs(actor.getPosition().x - (start.x - 32)) < 1e-7);
  });
  test(`${name}: a second hit replaces an unfinished impulse`, () => {
    const { actor, combat } = setup(factory);
    combat.applyDamage(25, { x: 1, y: 0 });
    actor.update(.05);
    const start = actor.getPosition();
    combat.applyDamage(25, { x: -1, y: 0 });
    actor.update(.2);
    assert.ok(Math.abs(actor.getPosition().x - (start.x - 32)) < 1e-7);
    assert.equal(actor.isKnockedBack, false);
  });
}

test('archer recoils while shooting and blocks a new shot during the impulse', () => {
  const atlas = { frames: Array.from({ length: 6 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
  const actor = createArcher({ atlases: new Proxy({}, { get: () => atlas }), initialPosition: { x: 320, y: 320 },
    bounds: { width: 1024, height: 1024 }, obstacles: [] });
  const combat = createCombatActorState({ getCombatCollider: () => actor.getCombatCollider(),
    setVisualTransform: patch => actor.setVisualTransform(patch), onKnockback: (d, o) => actor.applyKnockback(d, o) });
  assert.equal(actor.shootAt({ x: 600, y: 320 }), true);
  combat.applyDamage(25, { x: -1, y: 0 });
  assert.equal(actor.shootAt({ x: 600, y: 320 }), false);
  actor.update(.2);
  assert.deepEqual(actor.getPosition(), { x: 288, y: 320 });
  actor.dispose();
});

for (const factory of [createWarrior, createLancer]) test(`${factory.name}: guard does not swallow damage recoil`, () => {
  const { actor, combat } = setup(factory);
  actor.update(0, [], [{ id: 42, direction: { x: -1, y: 0 }, collider: { x: 500, y: 350, width: 72, height: 20 } }]);
  assert.equal(actor.isDefending, true);
  combat.applyDamage(25, { x: -1, y: 0 });
  actor.update(.2);
  assert.deepEqual(actor.getPosition(), { x: 288, y: 320 });
});

test('damage flash exposes priority immediately and ends after its duration', () => {
  const { combat } = setup(createGoblin);
  assert.equal(combat.isDamageFlashing, false);
  combat.applyDamage(25);
  assert.equal(combat.isDamageFlashing, true);
  combat.updateDeath(.6);
  assert.equal(combat.isDamageFlashing, false);
});

