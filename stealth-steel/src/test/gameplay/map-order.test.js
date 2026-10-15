import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogFromFiles, createLevelProgress, normalizeMapOrder } from '../../runtime/gameplay/level-progress.js';
import { createRuntimeSettingsStore, MAP_ORDER_SETTING_KEY } from '../../runtime/runtime-settings/runtime-settings-store.js';

const catalog = catalogFromFiles(['Level01.tmj', 'Level02.tmj', 'Level03.tmj']);
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
test('order persists, normalizes stale entries, and resets', () => {
  const data = storage();
  const settings = createRuntimeSettingsStore(data);
  settings.set(MAP_ORDER_SETTING_KEY, [3, 2, 1]);
  assert.deepEqual(createRuntimeSettingsStore(data).get(MAP_ORDER_SETTING_KEY), [3, 2, 1]);
  assert.deepEqual(normalizeMapOrder(catalog, [2, 2, 99]), [2, 1, 3]);
  assert.deepEqual(normalizeMapOrder(catalog, null), [1, 2, 3]);
  settings.set(MAP_ORDER_SETTING_KEY, 'bad');
  assert.deepEqual(normalizeMapOrder(catalog, settings.get(MAP_ORDER_SETTING_KEY)), [1, 2, 3]);
  settings.reset();
  assert.deepEqual(normalizeMapOrder(catalog, settings.get(MAP_ORDER_SETTING_KEY)), [1, 2, 3]);
});
test('run snapshot survives preference edits; refresh and restart use latest order', () => {
  const data = storage();
  let preference = [3, 2, 1];
  const start = () => createLevelProgress(catalog, data, () => {}, () => preference);
  let run = start();
  assert.equal(run.file, 'Level03.tmj');
  assert.equal(run.completed, 0);
  preference = [2, 1, 3];
  run.advance(); run = start();
  assert.equal(run.current, 2); assert.equal(run.completed, 1);
  run.advance(); run = start();
  assert.equal(run.current, 1); assert.equal(run.completed, 2); assert.equal(run.hasNext, false);
  run.restart(); run = start();
  assert.equal(run.current, 2); assert.equal(run.completed, 0);
  preference = [3, 2, 1];
  assert.equal(start().current, 3);
});
