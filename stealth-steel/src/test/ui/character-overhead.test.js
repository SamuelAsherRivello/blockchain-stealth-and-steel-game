import test from 'node:test';
import assert from 'node:assert/strict';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';
import { createCharacterOverhead, getCharacterOverheadLayout, drawCharacterOverheads,
  CHARACTER_OVERHEAD_OFFSETS, HEALTH_BAR_STYLE } from '../../runtime/ui/character-overhead.js';

function record(character = 'player') {
  const combat = createCombatActorState({ setVisualTransform() {}, getCombatCollider() {} });
  return { character, combat, actor: { getMovementCollider: () => ({ type: 'circle', x: 100, y: 200 }) },
    overhead: createCharacterOverhead(combat), expressionInstances: [{ icon: '!', opacity: 1 }] };
}

test('every character has separate stable slots that move together with center and jump', () => {
  for (const character of ['player', 'sheep', 'goblin', 'warrior', 'lancer', 'archer', 'monk']) {
    assert.ok(CHARACTER_OVERHEAD_OFFSETS[character]);
    const base = getCharacterOverheadLayout({ x: 100, y: 200 }, character, 1024);
    const moved = getCharacterOverheadLayout({ x: 116, y: 212 }, character, 1024, -8);
    assert.equal(moved.bar.x - base.bar.x, 16);
    assert.equal(moved.bar.y - base.bar.y, -20);
    assert.equal(moved.icon.y - base.icon.y, -20);
    assert.ok(base.icon.y + 25 + 4 <= base.bar.y - HEALTH_BAR_STYLE.height / 2);
    assert.ok(base.bar.y < 1024 - 200);
  }
});

test('death remains drawable until .25 seconds; retained player revival restarts cleanly', () => {
  const r = record();
  r.combat.applyDamage(150);
  r.combat.updateDeath(.2); r.overhead.update(.2);
  assert.equal(r.overhead.snapshot.ratio, 0);
  assert.equal(r.overhead.snapshot.opacity, 1);
  r.combat.updateDeath(.05); r.overhead.update(.05);
  assert.equal(r.overhead.snapshot.opacity, 0);
  r.combat.revive(); r.overhead.update(.2);
  assert.equal(r.overhead.snapshot.ratio, 1);
  assert.equal(r.overhead.snapshot.opacity, 1);
  r.overhead.dispose(); r.combat.applyDamage(25); r.overhead.update(1);
  assert.equal(r.overhead.snapshot.opacity, 0);
  assert.equal(record().overhead.snapshot.opacity, 0);
});

test('render both elements regardless of debug settings, suppress dead actors and release canvas state', () => {
  const r = record('goblin');
  const calls = []; let saves = 0;
  const ctx = { save() { saves++; }, restore() { saves--; }, fillRect(...args) { calls.push(args); },
    translate() {}, scale() {}, beginPath() {}, arc() {}, fill() {}, stroke() {}, fillText(text) { calls.push(text); } };
  drawCharacterOverheads(ctx, null, [r], 1024);
  assert.deepEqual(calls, ['!']);
  calls.length = 0; r.combat.applyDamage(25); r.overhead.update(.2);
  drawCharacterOverheads(ctx, null, [r], 1024);
  assert.equal(calls.filter(Array.isArray).length, 3);
  assert.equal(calls.at(-1), '!'); assert.equal(saves, 0);
  calls.length = 0; r.combat.applyDamage(100); r.combat.updateDeath(.25);
  drawCharacterOverheads(ctx, null, [r], 1024);
  assert.deepEqual(calls, []);
});
