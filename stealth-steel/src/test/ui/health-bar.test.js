import test from 'node:test';
import assert from 'node:assert/strict';
import { createHealthBar } from '../../runtime/ui/health-bar.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
const change = (bar, previous, current) => bar.healthChanged({ previous, current, maximum: 100 });

test('spawn is silent; fade, fill, timeout and fade-out use exact gameplay time', () => {
  const bar = createHealthBar(100, 100);
  assert.equal(bar.snapshot.opacity, 0);
  bar.update(5);
  assert.equal(bar.snapshot.opacity, 0);
  change(bar, 100, 75);
  bar.update(.05); near(bar.snapshot.opacity, .5); near(bar.snapshot.health, 100);
  bar.update(.05); near(bar.snapshot.opacity, 1); near(bar.snapshot.health, 100);
  bar.update(.05); near(bar.snapshot.health, 87.5);
  bar.update(.05); near(bar.snapshot.health, 75);
  bar.update(.8); near(bar.snapshot.opacity, 1);
  bar.update(.05); near(bar.snapshot.opacity, .5);
  bar.update(.05); near(bar.snapshot.opacity, 0);
});

test('unchanged health does not reveal or extend the timer; paused time is inert', () => {
  const bar = createHealthBar(100, 100);
  change(bar, 100, 100); bar.update(.1); near(bar.snapshot.opacity, 0);
  change(bar, 100, 75); bar.update(.15);
  const before = bar.snapshot; bar.update(0); bar.update(-1);
  assert.deepEqual(bar.snapshot, before);
  change(bar, 75, 75); bar.update(.95); near(bar.snapshot.opacity, 0);
});

test('rapid changes retarget from the displayed fill and restart the timeout', () => {
  const bar = createHealthBar(100, 100);
  change(bar, 100, 75); bar.update(.15); near(bar.snapshot.health, 87.5);
  change(bar, 75, 50); near(bar.snapshot.health, 87.5);
  bar.update(.05); near(bar.snapshot.health, 68.75);
  bar.update(.05); near(bar.snapshot.health, 50);
  bar.update(.9); near(bar.snapshot.opacity, 1);
  bar.update(.1); near(bar.snapshot.opacity, 0);
});

test('a change during fade-in preserves the old fill and the fade completion time', () => {
  const bar = createHealthBar(100, 100);
  change(bar, 100, 75); bar.update(.05);
  change(bar, 75, 50); bar.update(.05);
  near(bar.snapshot.opacity, 1); near(bar.snapshot.health, 100);
  bar.update(.1); near(bar.snapshot.health, 50);
});

test('a change during fade-out reverses smoothly before changing fill', () => {
  const bar = createHealthBar(100, 100);
  change(bar, 100, 75); bar.update(1.05); near(bar.snapshot.opacity, .5);
  change(bar, 75, 50); near(bar.snapshot.opacity, .5);
  bar.update(.05); near(bar.snapshot.opacity, .75); near(bar.snapshot.health, 75);
  bar.update(.05); near(bar.snapshot.opacity, 1); near(bar.snapshot.health, 75);
  bar.update(.1); near(bar.snapshot.health, 50);
});

test('lethal values clamp to zero; healing animates upward; large steps finish', () => {
  const bar = createHealthBar(100, 100);
  change(bar, 100, -25); bar.update(.2); near(bar.snapshot.ratio, 0);
  bar.reset(25, 100); change(bar, 25, 75); bar.update(.15); near(bar.snapshot.health, 50);
  bar.update(10); near(bar.snapshot.health, 75); near(bar.snapshot.opacity, 0);
});
