import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameRunController } from '../../runtime/gameplay/game-run-controller.js';
import { createGameRunCoordinator } from '../../runtime/gameplay/game-run-lifecycle.js';

test('replacement disposes the old run once before creating exactly one fresh run', async () => {
  const events = [];
  const coordinator = createGameRunCoordinator({
    createRun: async ({ generation, run }) => {
      events.push(`create:${generation}:${run.name}`);
      return {
        dispose() {
          events.push(`cancel-frame:${run.name}`);
          events.push(`remove-listeners:${run.name}`);
          events.push(`remove-layers:${run.name}`);
        },
      };
    },
  });

  await coordinator.start({ name: 'first' });
  const replacement = coordinator.restart({ name: 'second' });
  assert.equal(coordinator.restart({ name: 'ignored' }), replacement, 'overlapping restart shares the in-flight replacement');
  await replacement;

  assert.deepEqual(events, [
    'create:1:first',
    'cancel-frame:first',
    'remove-listeners:first',
    'remove-layers:first',
    'create:2:second',
  ]);
  assert.equal(coordinator.generation, 2);
  assert.equal(coordinator.activeRun?.run.name, 'second');
  coordinator.dispose();
  coordinator.dispose();
  assert.deepEqual(events.slice(-3), ['cancel-frame:second', 'remove-listeners:second', 'remove-layers:second']);
});

test('a run that resolves after disposal cannot become active', async () => {
  let resolveRun;
  const coordinator = createGameRunCoordinator({
    createRun: () => new Promise(resolve => { resolveRun = resolve; }),
  });
  const pending = coordinator.start({ name: 'late' });
  coordinator.dispose();
  const events = [];
  resolveRun({ dispose: () => events.push('disposed-late') });
  await pending;
  assert.deepEqual(events, ['disposed-late']);
  assert.equal(coordinator.activeRun, null);
});

test('controller serializes the browser restart transition around replacement', async () => {
  const events = [];
  const controller = createGameRunController({
    createRun: async (run) => {
      events.push(`create:${run.name}`);
      return { dispose: () => events.push(`dispose:${run.name}`) };
    },
    transition: {
      cover: async () => { events.push('cover'); },
      reveal: async () => { events.push('reveal'); },
    },
  });
  const pauseController = { pause: (reason) => events.push(`pause:${reason}`) };

  await controller.start({ name: 'first' });
  const replacement = controller.restart({ name: 'second' }, pauseController);
  assert.equal(
    controller.restart({ name: 'ignored' }, pauseController),
    replacement,
    'overlapping restarts share the pending transition',
  );
  await replacement;

  assert.deepEqual(events, [
    'create:first',
    'pause:restart-transition',
    'cover',
    'dispose:first',
    'create:second',
    'reveal',
  ]);
  controller.dispose();
  assert.deepEqual(events.slice(-1), ['dispose:second']);
});
