import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine,
  createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createPlayer, loadPlayerAtlases } from '../../runtime/characters/player/player.js';
import { createSheep, loadSheepAtlases } from '../../runtime/characters/npc/sheep/sheep.js';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../runtime/characters/enemies/monk/monk.js';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';
import { createCharacterOverhead, drawCharacterOverheads, getCharacterOverheadLayout } from '../../runtime/ui/character-overhead.js';
import { loadStatusBadgeArt } from '../../runtime/ui/status-badge.js';
import { createLevelCamera } from '../../runtime/gameplay/level-camera.js';
import { createPauseController } from '../../runtime/ui/pause-controller.js';

const width = 1008, height = 420;
const bounds = { width: 1920, height: 2048, renderHeight: height };
const canvas = document.querySelector('#game'), overlay = document.querySelector('#overlay');
const ctx = overlay.getContext('2d');
const engine = await createEngine(canvas, { maxDevicePixelRatio: 1 });
engine._w = width; engine._h = height;
const manager = createSpriteAnimationManager();
const camera = createLevelCamera({ mode: 'follow-player', bounds: { ...bounds, x: 0, y: 0 } });
const pause = createPauseController();
const badge = loadStatusBadgeArt();
const types = ['player', 'sheep', 'goblin', 'warrior', 'lancer', 'archer', 'monk'];
const factories = [createPlayer, createSheep, createGoblin, createWarrior, createLancer, createArcher, createMonk];
const loaders = [loadPlayerAtlases, loadSheepAtlases, loadGoblinAtlases, loadWarriorAtlases, loadLancerAtlases, loadArcherAtlases, loadMonkAtlases];
const atlases = await Promise.all(loaders.map(load => load(engine)));
const records = types.map((character, index) => {
  const actor = factories[index]({ atlases: atlases[index], bounds, obstacles: [], initialPosition: { x: 72 + index * 144, y: 160 } });
  actor.playAnimation(manager);
  const size = character === 'sheep' ? 128 : character === 'lancer' ? 320 : 192;
  const combat = createCombatActorState({ label: character, getCombatCollider: () => actor.getCombatCollider(),
    setVisualTransform: patch => actor.setVisualTransform(patch),
    onDeathProgress: value => actor.setVisualTransform({ sizePx: [size * value, size * value] }),
  });
  return { character, actor, combat, overhead: createCharacterOverhead(combat), expressionJumpOffset: 0,
    expressionInstances: [{ icon: character === 'player' ? 'H' : '!', opacity: 1 }] };
});
registerSpriteRenderer(createSpriteRenderer(engine, {
  layers: records.flatMap(record => record.actor.layers.map(layer => camera.attachLayer(layer))),
  clearValue: { r: .15, g: .25, b: .18, a: 1 },
}));
await startEngine(engine);

function snapshot() {
  return records.map(r => ({ character: r.character, health: r.combat.health, dead: r.combat.isDead,
    position: r.actor.getPosition(), layout: getCharacterOverheadLayout(r.actor.getPosition(), r.character, height, r.expressionJumpOffset),
    ...r.overhead.snapshot }));
}
function draw() {
  ctx.clearRect(0, 0, width, height);
  const offset = camera.getOffset();
  ctx.save(); ctx.translate(-offset.x, offset.y);
  drawCharacterOverheads(ctx, badge, records, height);
  ctx.fillStyle = '#edf6ee'; ctx.textAlign = 'center'; ctx.font = '14px system-ui';
  for (const r of records) ctx.fillText(r.character, r.actor.getPosition().x, height - r.actor.getPosition().y + 85);
  ctx.restore();
  document.querySelector('#result').textContent = JSON.stringify(snapshot().map(({ character, health, opacity, phase }) => ({ character, health, opacity, phase })), null, 2);
}
function step(seconds) {
  const delta = pause.getDelta(seconds);
  for (const r of records) { r.combat.updateDeath(delta); r.overhead.update(delta); }
  updateSpriteAnimationManager(manager, delta * 1000); draw();
}
function damage(amount) { for (const r of records) r.combat.applyDamage(amount); draw(); }
document.querySelector('#damage').onclick = () => damage(25);
document.querySelector('#step').onclick = () => step(.05);
document.querySelector('#settle').onclick = () => step(.2);
document.querySelector('#timeout').onclick = () => step(1);
document.querySelector('#icons').onclick = () => { for (const r of records) r.expressionInstances[0].opacity = 1 - r.expressionInstances[0].opacity; draw(); };
document.querySelector('#move').onclick = () => { for (const r of records) { const p = r.actor.getPosition(); r.actor.setPosition({ x: p.x + 12, y: p.y + 12 }); } draw(); };
document.querySelector('#jump').onclick = () => { for (const r of records) {
  if (!r.actor.setArtYOffset) continue;
  r.expressionJumpOffset = r.expressionJumpOffset ? 0 : -8;
  r.actor.setArtYOffset(r.expressionJumpOffset);
} draw(); };
document.querySelector('#camera').onclick = () => { camera.update({ x: 600, y: 512 }, .1); draw(); };
document.querySelector('#lethal').onclick = () => damage(200);
document.querySelector('#reset').onclick = () => location.reload();
document.querySelector('#checks').onclick = () => {
  const checks = [];
  const check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  const near = (a, b) => Math.abs(a - b) < 1e-7;
  try {
    check(records.every(r => r.combat.health === 100), 'fresh roster');
    check(records.every(r => r.overhead.snapshot.opacity === 0), 'all seven meters initially hidden');
    damage(25); step(.05);
    check(records.every(r => near(r.overhead.snapshot.opacity, .5) && near(r.overhead.snapshot.health, 100)), 'halfway fade shows previous health');
    step(.1);
    check(records.every(r => near(r.overhead.snapshot.health, 87.5)), 'halfway health transition');
    pause.pause(); const before = JSON.stringify(snapshot()); step(10);
    check(JSON.stringify(snapshot()) === before, 'pause freezes all meters'); pause.resume();
    damage(25); step(.1);
    check(records.every(r => near(r.overhead.snapshot.health, 50)), 'rapid hits retarget smoothly');
    for (const r of records) {
      const { bar } = getCharacterOverheadLayout(r.actor.getPosition(), r.character, height);
      const pixel = ctx.getImageData(Math.round(bar.x - 10), Math.round(bar.y), 1, 1).data;
      check(pixel[1] > pixel[0] && pixel[1] > pixel[2] && pixel[3] === 255, `${r.character} has rendered green fill`);
    }
    step(.95);
    check(records.every(r => near(r.overhead.snapshot.opacity, .5)), 'fade-out starts one second after latest change');
    damage(25); step(.1);
    check(records.every(r => near(r.overhead.snapshot.opacity, 1) && near(r.overhead.snapshot.health, 50)), 'fade-out reverses without a fill jump');
    step(.1); damage(200); step(.2);
    check(records.every(r => r.combat.isDying && near(r.overhead.snapshot.ratio, 0)), 'lethal bars reach zero while dying');
    step(.05);
    check(records.every(r => r.combat.isDead && r.overhead.snapshot.opacity === 0), 'all meters removed at death completion');
    for (const r of records) r.combat.revive(); step(.2);
    check(records.every(r => near(r.overhead.snapshot.ratio, 1)), 'revival restores health through the shared notification');
    document.querySelector('#status').textContent = `PASS: ${checks.length} browser checks, all seven real character types.`;
  } catch (error) { document.querySelector('#status').textContent = `FAIL: ${error.message}`; console.error(error); }
};
document.querySelector('#status').textContent = 'Ready. All health meters are hidden.';
draw();
