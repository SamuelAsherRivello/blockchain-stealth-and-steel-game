import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine, createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createCharacterPerception, CARDINAL_DIRECTIONS } from '../../runtime/systems/perception/character-perception.js';
import { drawPerceptionDiagnostics } from '../../runtime/ui/collider-diagnostics.js';
import { createRuntimeSettingsStore, RUNTIME_DEBUG_SETTING_KEYS as keys } from '../../runtime/runtime-settings/runtime-settings-store.js';

const bounds = { width: 1728, height: 768 }, size = 64;
const engine = await createEngine(document.querySelector('#game'), { maxDevicePixelRatio: 1 });
engine._w = bounds.width; engine._h = bounds.height;
const manager = createSpriteAnimationManager(), store = createRuntimeSettingsStore(null);
const context = document.querySelector('#labels').getContext('2d');
const output = document.querySelector('#result'), phaseLabel = document.querySelector('#phase');
const perceptionToggle = document.querySelector('#perceptions'), colliderToggle = document.querySelector('#colliders');
for (const [input, key] of [[perceptionToggle, keys.showEnemyPerceptions], [colliderToggle, keys.showColliders]]) {
  input.addEventListener('change', () => store.set(key, input.checked));
  store.subscribe(key, value => { input.checked = value; });
}
const atlases = await Promise.all([loadGoblinAtlases(engine), loadArcherAtlases(engine), loadWarriorAtlases(engine)]);
const records = [createGoblin, createArcher, createWarrior].map((factory, i) => {
  const name = ['goblin', 'archer', 'warrior'][i];
  const actor = factory({ atlases: atlases[i], initialPosition: { x: 352 + 512 * i, y: 352 }, bounds, obstacles: [] });
  actor.playAnimation(manager);
  const perception = createCharacterPerception();
  perception.register({ id: name, type: 'enemy', cell: actor.getGridPosition(size), heading: actor.getHeading() });
  perception.register({ id: `${name}-target`, type: 'player', cell: { x: -10, y: -10 }, isMoving: true });
  return { name, actor, perception, samples: 0, blinkOn: false, blinkOff: false };
});
registerSpriteRenderer(createSpriteRenderer(engine, { layers: records.flatMap(r => r.actor.layers), clearValue: { r: .1, g: .22, b: .14, a: 1 } }));
await startEngine(engine);
const stages = [
  { name: 'Disabled', enabled: false, colliders: false, duration: .3 },
  ...[['Left', -1, 0], ['Up', 0, 1], ['Right', 1, 0], ['Down', 0, -1]].map(([name, x, y]) => ({ name, x, y, enabled: true, colliders: true, active: true, duration: 1 })),
  { name: 'Player leaves detection', enabled: true, colliders: true, duration: .4 },
  { name: 'Perception off, colliders on', enabled: false, colliders: true, active: true, duration: .4 },
  { name: 'Perception on, colliders off', enabled: true, colliders: false, active: true, duration: .8 },
];
let index = 0, elapsed = 0, previous = performance.now(), complete = false;
const errors = new Set(), phases = new Set();
function check(condition, message) { if (!condition) errors.add(message); }
function frame(now) {
  const dt = Math.min(.04, Math.max(.001, (now - previous) / 1000)); previous = now;
  const stage = stages[index];
  if (!complete && elapsed === 0) { store.set(keys.showEnemyPerceptions, stage.enabled); store.set(keys.showColliders, stage.colliders); }
  const snapshot = { actors: [], detections: [] };
  for (const r of records) {
    r.actor.setMovementIntent({ x: stage.x ?? 0, y: stage.y ?? 0 });
    r.actor.update(dt, [], [], null);
    const cell = r.actor.getGridPosition(size), heading = r.actor.getHeading(), direction = CARDINAL_DIRECTIONS[heading];
    r.target = stage.active ? { x: cell.x + direction.x, y: cell.y + direction.y } : { x: -10, y: -10 };
    r.perception.updateActor(r.name, { cell, heading });
    r.perception.updateActor(`${r.name}-target`, { cell: r.target });
    r.perception.update(dt);
    const current = r.perception.getSnapshot(); snapshot.actors.push(...current.actors); snapshot.detections.push(...current.detections);
    if (!complete) {
      check(current.detections.filter(d => d.type === 'visual' || d.type === 'audio').length === (stage.active ? 2 : 0), `${r.name}: ${stage.name} activation`);
      if (stage.x || stage.y) check(direction.x === stage.x && direction.y === stage.y, `${r.name}: ${stage.name} rotation`);
      r.samples++;
    }
  }
  context.clearRect(0, 0, bounds.width, bounds.height);
  const commands = drawPerceptionDiagnostics(context, snapshot, size, bounds.height, now, { enabled: store.get(keys.showEnemyPerceptions) });
  if (!complete) {
    check(commands.length === (stage.enabled ? 36 : 0), `${stage.name}: toggle visibility`);
    check(commands.filter(c => c.active).length === (stage.enabled && stage.active ? 6 : 0), `${stage.name}: overlapping activation`);
    if (commands.length) check(commands.slice(0, 12).every(c => c.channel === 'visual') && commands.slice(12).every(c => c.channel === 'audio'), 'Audio must render above every Visual square');
    for (const r of records) {
      const x = (r.target.x + .5) * size, y = (r.target.y + .5) * size;
      const active = commands.filter(c => c.active && c.points.some(p => Math.abs(p.x - x) < 17 && Math.abs(p.y - y) < 17));
      r.blinkOn ||= active.some(c => c.blinking); r.blinkOff ||= active.some(c => !c.blinking);
    }
    phases.add(stage.name);
  }
  for (const r of records) {
    const p = r.actor.getMovementCollider();
    if (store.get(keys.showColliders)) { context.strokeStyle = '#84ff99'; context.beginPath(); context.arc(p.x, bounds.height - p.y, p.radius, 0, Math.PI * 2); context.stroke(); }
    context.fillStyle = '#fff'; context.font = '22px system-ui'; context.fillText(r.name, p.x - 35, bounds.height - p.y - 65);
    if (stage.active) { context.beginPath(); context.arc((r.target.x + .5) * size, bounds.height - (r.target.y + .5) * size, 3, 0, Math.PI * 2); context.fill(); }
  }
  updateSpriteAnimationManager(manager, dt * 1000);
  elapsed += dt;
  if (!complete && elapsed >= stage.duration) {
    if (index < stages.length - 1) { index++; elapsed = 0; }
    else { complete = true; check(records.every(r => r.blinkOn && r.blinkOff), 'Every detector must show both blink states'); }
  }
  const passed = complete && !errors.size;
  phaseLabel.textContent = complete ? (passed ? 'PASS — checks complete; toggles remain interactive' : 'FAIL — see results') : stage.name;
  output.textContent = JSON.stringify({ complete, passed, phases: [...phases], errors: [...errors], rows: records.map(({ name, samples, blinkOn, blinkOff }) => ({ name, samples, blinkOn, blinkOff })), displayedSquares: commands.length, perceptions: store.get(keys.showEnemyPerceptions), colliders: store.get(keys.showColliders) }, null, 2);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
