import test from 'node:test';
import assert from 'node:assert/strict';
import { enemyAiLabel, drawEnemyAiLabels } from '../../runtime/ai/enemy-ai-labels.js';
import { createRuntimeSettingsStore, RUNTIME_DEBUG_SETTING_KEYS as keys } from '../../runtime/runtime-settings/runtime-settings-store.js';

test('AI label preference is default-off, independent, persisted and reset', () => {
  let stored = null;
  const storage = { getItem: () => stored, setItem: (_key, value) => { stored = value; }, removeItem: () => { stored = null; } };
  const store = createRuntimeSettingsStore(storage);
  assert.equal(store.get(keys.showEnemyAiLabels), false);
  store.set(keys.showEnemyAiLabels, true);
  assert.equal(store.get(keys.showColliders), false);
  const restored = createRuntimeSettingsStore(storage);
  assert.equal(restored.get(keys.showEnemyAiLabels), true);
  restored.set(keys.showColliders, true); restored.set(keys.showEnemyAiLabels, false);
  assert.equal(restored.get(keys.showColliders), true);
  restored.reset(); assert.equal(restored.get(keys.showEnemyAiLabels), false); assert.equal(stored, null);
});

test('labels follow display height and jump, omit target coordinates and clean up dead/disposed records', () => {
  const record = { position: { x: 96, y: 160 }, jumpOffset: -8, snapshot: { goal: 'investigate', action: 'recovery', target: { x: 7, y: 8 } } };
  const label = enemyAiLabel(record, 1024);
  assert.deepEqual(label, { x: 96, y: 774, lines: ['Goal: investigate', 'Action: recovery'] });
  assert.equal(enemyAiLabel(record, 768).y, label.y - 256);
  assert.equal(enemyAiLabel({ ...record, isAlive: false }, 1024), null);
  assert.equal(enemyAiLabel({ ...record, snapshot: { ...record.snapshot, disposed: true } }, 1024), null);
  const drawn = [], ctx = { save() {}, restore() {}, measureText: text => ({ width: text.length * 7 }), fillRect() {}, fillText: text => drawn.push(text) };
  drawEnemyAiLabels(ctx, [label]); assert.deepEqual(drawn, label.lines);
  drawn.length = 0; drawEnemyAiLabels(ctx, []); assert.deepEqual(drawn, []);
});
