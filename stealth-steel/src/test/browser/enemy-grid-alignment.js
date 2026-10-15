import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine, createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../runtime/characters/enemies/monk/monk.js';
import { getYSortedLayerOrder } from '../../runtime/systems/environment/render-depth.js';

const bounds = { width: 1152, height: 640 };
const canvas = document.querySelector('#game'), overlay = document.querySelector('#labels');
const output = document.querySelector('#result'), phaseLabel = document.querySelector('#phase');
const engine = await createEngine(canvas, { maxDevicePixelRatio: 1 });
engine._w = bounds.width; engine._h = bounds.height;
const manager = createSpriteAnimationManager();
const loaders = [loadGoblinAtlases, loadWarriorAtlases, loadLancerAtlases, loadArcherAtlases, loadMonkAtlases];
const factories = [createGoblin, createWarrior, createLancer, createArcher, createMonk];
const names = ['goblin', 'warrior', 'lancer', 'archer', 'monk'];
const atlases = await Promise.all(loaders.map(load => load(engine)));
const records = factories.map((factory, i) => {
  const actor = factory({ atlases: atlases[i], initialPosition: { x: 96 + 192 * i + 10, y: 234 }, bounds, obstacles: [] });
  actor.playAnimation(manager);
  return { actor, name: names[i], samples: 0, errors: [], phases: new Set(), blocked: false };
});
registerSpriteRenderer(createSpriteRenderer(engine, { layers: records.flatMap(r => r.actor.layers), clearValue: { r: .1, g: .22, b: .14, a: 1 } }));
await startEngine(engine);
const stages = [
  { name: 'Right', intent: { x: 1, y: 0 }, duration: 1 },
  { name: 'Up', intent: { x: 0, y: 1 }, duration: 1 },
  { name: 'Left', intent: { x: -1, y: 0 }, duration: 1 },
  { name: 'Down', intent: { x: 0, y: -1 }, duration: 1 },
  { name: 'Stopped', intent: { x: 0, y: 0 }, duration: .4 },
  { name: 'Dynamic wall', intent: { x: 0, y: 1 }, duration: 3 },
];
const wall = { collider: { x: 0, y: 384, width: 1152, height: 32 } };
let stageIndex = 0, stageTime = 0, previous = performance.now();
function check(record, condition, message) { if (!condition && !record.errors.includes(message)) record.errors.push(message); }
function frame(now) {
  const dt = Math.min(.04, Math.max(.001, (now - previous) / 1000)); previous = now;
  const stage = stages[stageIndex];
  for (const r of records) {
    const before = r.actor.getMovementCollider();
    if (stageTime === 0) r.target = Math.floor((stage.intent.x ? before.y : before.x) / 64) * 64 + 32;
    r.actor.setMovementIntent(stage.intent);
    r.actor.update(dt, stageIndex === 5 ? [wall] : [], [], null);
    const c = r.actor.getMovementCollider(), cell = r.actor.getGridPosition(64);
    check(r, Math.hypot(c.x - before.x, c.y - before.y) < 12, 'teleport');
    check(r, Math.abs(c.x - (cell.x * 64 + 32)) <= 32.000001 && Math.abs(c.y - (cell.y * 64 + 32)) <= 32.000001, 'occupancy');
    check(r, r.actor.layers.every(layer => Math.abs(layer.order - getYSortedLayerOrder(c.y, bounds)) < 1e-8), 'depth');
    if (stageIndex === 4) check(r, c.x === before.x && c.y === before.y, 'idle drift');
    else if (stageTime > .21) check(r, Math.abs((stage.intent.x ? c.y : c.x) - r.target) < 1e-6, 'centerline');
    if (stageIndex === 5) {
      check(r, c.y + c.radius <= wall.collider.y + 1e-6, 'wall penetration');
      if (stageTime > 2 && Math.abs(c.y - before.y) < 1e-6) r.blocked = true;
    }
    r.samples++; r.phases.add(stage.name);
  }
  updateSpriteAnimationManager(manager, dt * 1000);
  stageTime += dt;
  const ctx = overlay.getContext('2d'); ctx.clearRect(0, 0, 1152, 640); ctx.strokeStyle = '#ffffff22';
  for (let x = 0; x <= 1152; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke(); }
  for (let y = 0; y <= 640; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1152, y); ctx.stroke(); }
  if (stageIndex === 5) { ctx.fillStyle = '#79878a'; ctx.fillRect(0, 224, 1152, 32); }
  for (const r of records) {
    const c = r.actor.getMovementCollider(), cell = r.actor.getGridPosition(64);
    ctx.strokeStyle = '#84ff99'; ctx.beginPath(); ctx.arc(c.x, 640 - c.y, c.radius, 0, Math.PI * 2); ctx.stroke();
    const x = cell.x * 64 + 32, y = 640 - (cell.y * 64 + 32);
    ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = '14px system-ui'; ctx.fillText(r.name, c.x - 22, 640 - c.y - 55);
  }
  phaseLabel.textContent = stage.name;
  const complete = stageIndex === stages.length - 1 && stageTime >= stage.duration;
  const result = { complete, passed: complete && records.every(r => !r.errors.length && r.blocked), rows: records.map(r => ({ character: r.name, phases: [...r.phases], samples: r.samples, blocked: r.blocked, errors: r.errors })) };
  output.textContent = JSON.stringify(result, null, 2);
  if (complete) { phaseLabel.textContent = result.passed ? 'PASS — all five enemies' : 'FAIL — see results'; return; }
  if (stageTime >= stage.duration) { stageIndex++; stageTime = 0; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
