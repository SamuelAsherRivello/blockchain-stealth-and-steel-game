import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine, createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../runtime/characters/enemies/monk/monk.js';
import { createCharacterPerception } from '../../runtime/systems/perception/character-perception.js';
import { createPerceptionDrawCommands } from '../../runtime/ui/collider-diagnostics.js';

const bounds = { width: 1728, height: 1152 };
const canvas = document.querySelector('#game'), overlay = document.querySelector('#labels');
const output = document.querySelector('#result'), phaseLabel = document.querySelector('#phase');
const engine = await createEngine(canvas, { maxDevicePixelRatio: 1 });
engine._w = bounds.width; engine._h = bounds.height;
const manager = createSpriteAnimationManager(), perception = createCharacterPerception();
const loaders = [loadGoblinAtlases, loadWarriorAtlases, loadLancerAtlases, loadArcherAtlases, loadMonkAtlases];
const factories = [createGoblin, createWarrior, createLancer, createArcher, createMonk];
const names = ['goblin', 'warrior', 'lancer', 'archer', 'monk'];
const atlases = await Promise.all(loaders.map(load => load(engine)));
const records = factories.map((factory, i) => {
  const actor = factory({ atlases: atlases[i], initialPosition: { x: 352 + 512 * (i % 3), y: 288 + 512 * Math.floor(i / 3) }, bounds, obstacles: [] });
  actor.playAnimation(manager);
  perception.register({ id: names[i], type: 'enemy', cell: actor.getGridPosition(64), heading: actor.getHeading() });
  return { actor, name: names[i], samples: 0, errors: [], phases: new Set() };
});
registerSpriteRenderer(createSpriteRenderer(engine, { layers: records.flatMap(r => r.actor.layers), clearValue: { r: .1, g: .22, b: .14, a: 1 } }));
await startEngine(engine);
// World Y grows upward on screen; the existing perception heading names use -Y as "up".
const stages = [['Left', -1, 0, 'left'], ['Up', 0, 1, 'down'], ['Right', 1, 0, 'right'], ['Down', 0, -1, 'up']]
  .flatMap(([name, x, y, heading]) => [{ name, x, y, heading, duration: .65 }, { name: `Stopped after ${name}`, x, y, heading, stopped: true, duration: .35 }]);
let index = 0, elapsed = 0, previous = performance.now();
function check(record, valid, message) { if (!valid && !record.errors.includes(message)) record.errors.push(message); }
function frame(now) {
  const dt = Math.min(.04, Math.max(.001, (now - previous) / 1000)); previous = now;
  const stage = stages[index];
  for (const r of records) {
    const before = r.actor.getPosition();
    r.actor.setMovementIntent(stage.stopped ? { x: 0, y: 0 } : { x: stage.x, y: stage.y });
    r.actor.update(dt, [], [], null);
    const after = r.actor.getPosition();
    check(r, r.actor.getHeading() === stage.heading, `${stage.name}: heading`);
    check(r, stage.stopped ? after.x === before.x && after.y === before.y : (after.x - before.x) * stage.x + (after.y - before.y) * stage.y > 0, `${stage.name}: movement`);
    perception.updateActor(r.name, { cell: r.actor.getGridPosition(64), heading: r.actor.getHeading() });
  }
  perception.update(dt);
  const snapshot = perception.getSnapshot();
  const ctx = overlay.getContext('2d'); ctx.clearRect(0, 0, bounds.width, bounds.height);
  ctx.strokeStyle = '#ffffff18';
  for (let x = 0; x <= bounds.width; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, bounds.height); ctx.stroke(); }
  for (let y = 0; y <= bounds.height; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(bounds.width, y); ctx.stroke(); }
  for (const r of records) {
    const detector = snapshot.actors.find(a => a.id === r.name), cell = detector.cell;
    const commands = createPerceptionDrawCommands({ ...snapshot, actors: [detector] }, 64, now).filter(c => c.channel === 'visual');
    check(r, commands.length === 4, `${stage.name}: visual range`);
    commands.forEach((command, i) => {
      const center = command.points.reduce((sum, p) => ({ x: sum.x + p.x / 4, y: sum.y + p.y / 4 }), { x: 0, y: 0 });
      check(r, center.x === (cell.x + stage.x * (i + 1) + .5) * 64 && center.y === (cell.y + stage.y * (i + 1) + .5) * 64, `${stage.name}: diagnostic direction`);
      ctx.fillStyle = command.style.fillStyle; ctx.beginPath();
      command.points.forEach((point, j) => ctx[j ? 'lineTo' : 'moveTo'](point.x, bounds.height - point.y));
      ctx.closePath(); ctx.fill();
    });
    const p = r.actor.getMovementCollider();
    ctx.strokeStyle = '#84ff99'; ctx.beginPath(); ctx.arc(p.x, bounds.height - p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '20px system-ui'; ctx.fillText(r.name, p.x - 35, bounds.height - p.y - 60);
    r.samples++; r.phases.add(stage.name);
  }
  updateSpriteAnimationManager(manager, dt * 1000); elapsed += dt;
  const complete = index === stages.length - 1 && elapsed >= stage.duration;
  const result = { complete, passed: complete && records.every(r => !r.errors.length), rows: records.map(r => ({ name: r.name, phases: [...r.phases], samples: r.samples, errors: r.errors })) };
  output.textContent = JSON.stringify(result, null, 2); phaseLabel.textContent = complete ? (result.passed ? 'PASS — all five enemies' : 'FAIL — see results') : stage.name;
  if (complete) return;
  if (elapsed >= stage.duration) { index++; elapsed = 0; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
