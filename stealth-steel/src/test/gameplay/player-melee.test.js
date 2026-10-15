import test from 'node:test';
import assert from 'node:assert/strict';
import { createKnifeSwing, resolvePlayerKnifeImpact } from '../../runtime/gameplay/player-melee.js';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';
import { createEquipmentSnapshot } from '../../runtime/gameplay/equipment-effects.js';

test('knife has one midpoint event, ignores overlapping requests, and completes at 400ms', () => {
  const swing = createKnifeSwing();
  assert.equal(swing.start(), true);
  assert.equal(swing.start(), false);
  assert.deepEqual(swing.advance(.199), { impact: false, completed: false });
  assert.deepEqual(swing.advance(.001), { impact: true, completed: false });
  assert.deepEqual(swing.advance(.199), { impact: false, completed: false });
  assert.deepEqual(swing.advance(.001), { impact: false, completed: true });
  assert.deepEqual(swing.advance(1), { impact: false, completed: false });
  assert.equal(swing.start(), true);
  assert.deepEqual(swing.advance(1), { impact: true, completed: true });
});

test('paused time does not advance and cancellation discards the unfinished hit', () => {
  const swing = createKnifeSwing(); swing.start(); swing.advance(.1);
  assert.deepEqual(swing.advance(0), { impact: false, completed: false });
  swing.cancel();
  assert.deepEqual(swing.advance(1), { impact: false, completed: false });
  swing.start();
  assert.deepEqual(swing.advance(.2), { impact: true, completed: false });
});

function record(character, x = 0, y = 0) {
  const position = { x, y };
  const collider = { x, y, width: 64, height: 64 };
  let deaths = 0, flashes = 0;
  const combat = createCombatActorState({label: character, getCombatCollider: () => collider,
    setVisualTransform() {}, onDeathStart: () => deaths++, onHitFlashStart: () => flashes++});
  return {character, type: 'enemy', actor: {getPosition: () => position}, combat,
    collider, get deaths() { return deaths; }, get flashes() { return flashes; }};
}
const player = () => record('player');

for (const character of ['goblin', 'warrior', 'lancer', 'archer', 'monk']) {
  test(`${character}: four 25 damage knife impacts preserve feedback and death`, () => {
    const enemy = record(character, 40); const hero = player();
    assert.equal(enemy.combat.health, 100);
    for (let hit = 1; hit <= 4; hit++) {
      resolvePlayerKnifeImpact(hero, [enemy]);
      assert.equal(enemy.combat.health, 100 - hit * 25);
      assert.equal(enemy.deaths, hit === 4 ? 1 : 0);
    }
    assert.equal(enemy.flashes, 3);
    resolvePlayerKnifeImpact(hero, [enemy]);
    assert.equal(enemy.combat.health, 0);
  });
}

test('impact uses current collider overlap, hits all directions, and excludes other actors', () => {
  const hero = player();
  const enemies = [record('goblin', -40), record('warrior', 40), record('archer', 0, -40), record('monk', 0, 40)];
  const missed = record('lancer', 100);
  const sheep = {...record('sheep'), type: 'sheep'};
  assert.equal(resolvePlayerKnifeImpact(hero, [...enemies, missed, sheep]), 4);
  assert.deepEqual(enemies.map(e => e.combat.health), [75, 75, 75, 75]);
  assert.equal(missed.combat.health, 100); assert.equal(sheep.combat.health, 100);
  missed.collider.x = 40;
  enemies[0].collider.x = -100;
  assert.equal(resolvePlayerKnifeImpact(hero, [missed, enemies[0]]), 1);
  assert.equal(missed.combat.health, 75); assert.equal(enemies[0].combat.health, 75);
  hero.combat.applyDamage(100);
  assert.equal(resolvePlayerKnifeImpact(hero, [missed]), 0);
  assert.equal(missed.combat.health, 75);
});

test('an actively guarding Warrior blocks a knife impact without changing other melee targets', () => {
  const hero = player();
  const warrior = record('warrior', 40);
  warrior.actor.isDefending = true;
  const goblin = record('goblin', -40);
  assert.equal(resolvePlayerKnifeImpact(hero, [warrior, goblin]), 1);
  assert.equal(warrior.combat.health, 100);
  assert.equal(goblin.combat.health, 75);
});

test('an eligible enemy can react before its knife damage resolves, while other overlaps remain independent', () => {
  const hero = player();
  const warrior = record('warrior', 40);
  const goblin = record('goblin', -40);
  const reactions = [];
  Object.defineProperty(warrior.actor, 'isDefending', { get: () => reactions.includes(warrior) });
  assert.equal(resolvePlayerKnifeImpact(hero, [warrior, goblin], {
    onEligibleImpact(enemy) { reactions.push(enemy); },
  }), 1);
  assert.deepEqual(reactions, [warrior, goblin]);
  assert.equal(warrior.combat.health, 100);
  assert.equal(goblin.combat.health, 75);
});

test('combo damage upgrades only targets confirmed by the preceding impact', () => {
  const hero = player();
  const confirmed = record('warrior', 40);
  const newcomer = record('goblin', -40);
  const impacts = resolvePlayerKnifeImpact(hero, [confirmed, newcomer], {
    multiplier: 2,
    eligibleTargetIds: new Set(['warrior']),
    collectImpacts: true,
  });
  assert.equal(confirmed.combat.health, 50);
  assert.equal(newcomer.combat.health, 75);
  assert.deepEqual(impacts.map(({ targetId, upgraded }) => [targetId, upgraded]), [
    ['warrior', true], ['goblin', false],
  ]);
});

test('the spawned player snapshot applies the selected Dagger bonus to committed knife damage', () => {
  const hero = { ...player(), equipment: createEquipmentSnapshot({ status: 'ready', effective: { Dagger: { attributeDeltas: [{ bisAttribute: 'playerDamage', bisAttributeDelta: 30 }] } } }) };
  const enemy = record('goblin', 40);
  resolvePlayerKnifeImpact(hero, [enemy]);
  assert.equal(enemy.combat.health, 67.5);
});
