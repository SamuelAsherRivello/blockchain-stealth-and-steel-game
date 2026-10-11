import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createPlayer } from '../../runtime/characters/player/player.js';

class Control extends EventTarget {
  style = {};
  classList = { add() {}, remove() {}, toggle() {} };
  setPointerCapture() {}
  getBoundingClientRect() { return {left: 0, top: 0, width: 100, height: 100}; }
}
function event(type, props = {}) {
  const e = new Event(type, {cancelable: true});
  for (const [key, value] of Object.entries(props)) Object.defineProperty(e, key, {value});
  return e;
}
function harness({ onExecutionStart = () => null } = {}) {
  globalThis.window = new EventTarget();
  const controls = Object.fromEntries(['movement-joystick', 'movement-puck', 'attack-action'].map(id => [id, new Control()]));
  globalThis.document = {querySelector: selector => controls[selector.slice(1)] ?? null};
  const atlas = {frames: Array.from({length: 8}, () => ({uvMin: [0,0], uvMax: [1,1], sourceSizePx: [192,192]}))};
  const atlases = Object.fromEntries(['idle','run','attack', 'shoot', ...['axe','hammer','knife','pickaxe','gold','meat','wood'].flatMap(s => [`idle-${s}`, `run-${s}`])].map(n => [n, atlas]));
  let attacks = 0, hits = 0, arrows = 0, drops = 0;
  const actor = createPlayer({atlases, bounds: {width:1024,height:1024}, obstacles: [], initialPosition: {x:320,y:320},
    onAttackStart: () => attacks++, onExecutionStart, onAttackImpact: () => hits++, onShoot: () => arrows++, onDropItem: () => drops++});
  const manager = createSpriteAnimationManager(); actor.playAnimation(manager);
  return {actor, controls, manager, get attacks() {return attacks;}, get hits() {return hits;}, get arrows() {return arrows;}, get drops() {return drops;},
    key(code, repeat = false) { window.dispatchEvent(event('keydown', {code, repeat})); },
    step(dt) { updateSpriteAnimationManager(manager, dt*1000); actor.update(dt); }};
}

test('live equipment activation changes actual movement and clearing restores baseline', () => {
  const h = harness();
  try {
    h.key('KeyD');
    const measure = multiplier => {
      h.actor.setPosition({x:320,y:320});
      h.actor.setMovementMultiplier(multiplier);
      h.step(.1);
      return h.actor.getPosition().x - 320;
    };
    const baseline = measure(1);
    assert.ok(baseline > 0);
    assert.equal(h.actor.getMovementSpeed(), 210);
    assert.ok(Math.abs(measure(1.1) / baseline - 1.1) < 1e-9);
    assert.ok(Math.abs(h.actor.getMovementSpeed() - 231) < 1e-9);
    assert.equal(measure(1), baseline);
    for (const invalid of [NaN, Infinity, -1, 3]) assert.equal(measure(invalid), baseline);
  } finally { h.actor.dispose(); }
});

test('empty-slot Attack queues a deliberate rapid follow-up and no arrow', () => {
  const h = harness();
  try {
    h.key('KeyV'); assert.equal(h.attacks, 1); h.step(.199); assert.equal(h.hits,0);
    h.key('KeyV'); h.step(.001); assert.equal(h.hits,1);
    h.step(.2); h.key('KeyV',true); h.step(.5); assert.equal(h.hits,2); assert.equal(h.attacks, 2);
    h.key('KeyV'); h.step(.7); assert.equal(h.attacks, 3); assert.equal(h.hits,3); assert.equal(h.arrows,0);
  } finally { h.actor.dispose(); }
});

test('a relaxed Rapid Triple accepts its third swing after the short second animation finishes', () => {
  const h = harness();
  try {
    h.key('KeyV'); h.step(.5);
    h.key('KeyV'); h.step(.4);
    h.key('KeyV'); h.step(.7);
    assert.equal(h.attacks, 3);
    assert.equal(h.hits, 3);
  } finally { h.actor.dispose(); }
});

test('C preserves the item; alternate weapon preview cannot interrupt an attack while walking', () => {
  const h = harness();
  try {
    h.key('Digit2'); h.key('KeyC'); assert.equal(h.actor.getLoadout().item,'gold'); assert.equal(h.drops,0);
    h.key('Digit1'); h.step(.4); h.key('KeyD'); h.key('KeyV'); h.step(.15);
    assert.equal(h.hits,0); h.step(.05); assert.equal(h.hits,1);
    assert.ok(h.actor.getPosition().x > 320); h.step(.2);
    assert.deepEqual(h.actor.getLoadout(),{weapon:'axe',item:'gold'});
    assert.equal(h.arrows,0);
  } finally { h.actor.dispose(); }
});

test('missing Item supports pointer, accessible activation, blur, and dispose', () => {
  const h = harness();
  try {
    h.controls['movement-joystick'].dispatchEvent(event('pointerdown',{pointerId:1,clientX:100,clientY:50}));
    h.controls['attack-action'].dispatchEvent(event('pointerdown',{pointerId:2}));
    h.step(.2); assert.equal(h.hits,1); assert.ok(h.actor.getPosition().x > 320);
    h.controls['attack-action'].dispatchEvent(event('pointercancel',{pointerId:2}));
    window.dispatchEvent(event('blur')); h.step(.2);
    h.controls['attack-action'].dispatchEvent(event('click',{detail:0})); h.step(.4); assert.equal(h.hits,2);
    const heldEnter = event('keydown',{code:'Enter',repeat:true});
    h.controls['attack-action'].dispatchEvent(heldEnter); assert.equal(heldEnter.defaultPrevented,true);
  } finally { h.actor.dispose(); }
});

test('pause preserves swing time; disabled input, death and disposal cannot release stale hits', () => {
  const h = harness();
  h.key('KeyV'); h.step(.1);
  h.actor.setInputEnabled(false,{preserveAttack:true}); h.key('KeyV'); h.step(0); assert.equal(h.hits,0);
  h.actor.setInputEnabled(true); h.step(.1); assert.equal(h.hits,1); h.step(.2);
  h.key('KeyV'); h.step(.1); h.actor.setInputEnabled(false); h.step(.5); assert.equal(h.hits,1);
  h.actor.setInputEnabled(true); h.step(.5); assert.equal(h.hits,1);
  h.key('KeyV'); h.actor.dispose(); h.step(.5); assert.equal(h.hits,1);
});

test('an armed rear-cell attack replaces the ordinary midpoint and locks only gameplay movement for 0.8 seconds', () => {
  let armed = true;
  const h = harness({ onExecutionStart: () => {
    if (!armed) return null;
    armed = false;
    return { direction: { x: 1, y: 0 } };
  }});
  try {
    const start = h.actor.getPosition();
    h.key('KeyV');
    assert.equal(h.actor.isExecuting, true);
    assert.equal(h.attacks, 0);
    h.key('KeyD'); h.step(.4);
    assert.equal(h.hits, 0);
    assert.deepEqual(h.actor.getPosition(), start);
    h.step(.4);
    assert.equal(h.actor.isExecuting, false);
    h.key('KeyV'); h.step(.2);
    assert.equal(h.attacks, 1);
    assert.equal(h.hits, 1);
  } finally { h.actor.dispose(); }
});

test('an execution cancels an in-flight or buffered dagger combo before it can deal ordinary damage', () => {
  let armed = false;
  const h = harness({ onExecutionStart: () => armed ? { direction: { x: 1, y: 0 } } : null });
  try {
    h.key('KeyV'); h.step(.1);
    h.key('KeyV'); // buffer the normal follow-up
    armed = true;
    h.key('KeyV');
    assert.equal(h.actor.isExecuting, true);
    h.step(.3);
    assert.equal(h.hits, 0, 'the cancelled first move has no midpoint');
    h.step(.5);
    armed = false;
    h.key('KeyV'); h.step(.2);
    assert.equal(h.hits, 1, 'unarmed attacks resume through the combo lifecycle');
  } finally { h.actor.dispose(); }
});
