import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createGoblin } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk } from '../../runtime/characters/enemies/monk/monk.js';
import { createCharacterPerception } from '../../runtime/systems/perception/character-perception.js';
import { createPerceptionDrawCommands } from '../../runtime/ui/collider-diagnostics.js';

const atlas = { frames: Array.from({ length: 20 }, () => ({ uvMin: [0, 0], uvMax: [1, 1], sourceSizePx: [192, 192] })) };
const directions = [['left', -1, 0], ['up', 0, -1], ['right', 1, 0], ['down', 0, 1]];
for (const [name, factory] of Object.entries({ goblin: createGoblin, warrior: createWarrior, lancer: createLancer, archer: createArcher, monk: createMonk })) {
  test(`${name} publishes current movement heading, detection and diagnostics through turns and stops`, () => {
    const actor = factory({ atlases: new Proxy({}, { get: () => atlas }), initialPosition: { x: 480, y: 480 }, bounds: { width: 1024, height: 1024 }, obstacles: [] });
    const perception = createCharacterPerception();
    perception.register({ id: name, type: 'enemy', cell: actor.getGridPosition(64), heading: actor.getHeading() });
    perception.register({ id: 'player', type: 'player', cell: { x: 0, y: 0 } });
    try {
      for (const [heading, x, y] of directions) {
        for (const stopped of [false, true]) {
          actor.setMovementIntent(stopped ? { x: 0, y: 0 } : { x, y });
          const before = actor.getPosition();
          actor.update(1 / 60, [], [], null);
          const after = actor.getPosition(), cell = actor.getGridPosition(64);
          assert.equal(actor.getHeading(), heading);
          if (stopped) assert.deepEqual(after, before);
          else assert.ok((after.x - before.x) * x + (after.y - before.y) * y > 0);
          perception.updateActor(name, { cell, heading: actor.getHeading() });
          perception.updateActor('player', { cell: { x: cell.x + x, y: cell.y + y } });
          const detections = perception.update();
          assert.ok(detections.some(d => d.type === 'visual' && d.strength === 1));
          const snapshot = perception.getSnapshot();
          assert.equal(snapshot.actors.find(a => a.id === name).heading, heading);
          const visual = createPerceptionDrawCommands(snapshot, 64).filter(c => c.channel === 'visual');
          assert.equal(visual.length, 4);
          visual.forEach((command, i) => {
            const center = command.points.reduce((sum, p) => ({ x: sum.x + p.x / 4, y: sum.y + p.y / 4 }), { x: 0, y: 0 });
            assert.deepEqual(center, { x: (cell.x + x * (i + 1) + .5) * 64, y: (cell.y + y * (i + 1) + .5) * 64 });
          });
        }
      }
    } finally { actor.dispose(); }
  });
}

test('runtime publishes enemy movement state after actor updates and before perception evaluates it', async () => {
  const main = await readFile(new URL('../../runtime/main.js', import.meta.url), 'utf8');
  const movement = main.indexOf('record.actor.update(activeDelta, getNavigationColliders(record.actor)');
  const publication = main.indexOf('characterPerception.updateActor(record.combat.label');
  const evaluation = main.indexOf('characterPerception.update(activeDelta)');
  assert.ok(movement >= 0 && publication > movement && evaluation > publication, 'perception must consume this frame of enemy movement');
});
