import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine, createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases, LANCER_FRAME } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../runtime/characters/enemies/monk/monk.js';
import { createCombatActorState } from '../../runtime/gameplay/combat-actor.js';
import { resolveProjectileHit } from '../../runtime/systems/objects/projectile-combat.js';

const types = ['goblin', 'warrior', 'lancer', 'archer', 'monk'];
const factories = [createGoblin, createWarrior, createLancer, createArcher, createMonk];
const loaders = [loadGoblinAtlases, loadWarriorAtlases, loadLancerAtlases, loadArcherAtlases, loadMonkAtlases];
const engine = await createEngine(document.querySelector('#game'), { maxDevicePixelRatio: 1 });
engine._w = 896; engine._h = 384;
const manager = createSpriteAnimationManager();
const atlases = await Promise.all(loaders.map(load => load(engine)));
const records = types.map((character, i) => {
  const actor = factories[i]({ atlases: atlases[i], initialPosition: { x: 96 + i * 160, y: 160 }, bounds: { width: 896, height: 384 }, obstacles: [] });
  actor.playAnimation(manager);
  const record = { type: 'enemy', character, actor, color: [1, 1, 1, 1] };
  record.combat = createCombatActorState({ label: character, getCombatCollider: () => actor.getCombatCollider(),
    setVisualTransform: patch => { if (patch.color) record.color = patch.color; actor.setVisualTransform(patch); },
    onHitFlashStart: () => { record.color = [1.6, 1.6, 1.6, 1]; actor.setVisualTransform({ color: record.color }); },
    onKnockback: (direction, options) => actor.applyKnockback(direction, options),
    onDeathProgress: value => { const size = character === 'lancer' ? LANCER_FRAME.width : 192; actor.setVisualTransform({ sizePx: [size * value, size * value], anchor: character === 'lancer' ? 'artwork-bottom' : character === 'warrior' ? 'body-bottom' : undefined }); },
  });
  return record;
});
registerSpriteRenderer(createSpriteRenderer(engine, { layers: records.flatMap(r => r.actor.layers), clearValue: { r: .12, g: .25, b: .18, a: 1 } }));
await startEngine(engine);
const snapshot = () => records.map(r => ({ enemy: r.character, health: r.combat.health, position: r.actor.getPosition(), flashing: r.combat.isDamageFlashing, color: r.color }));
const show = () => { document.querySelector('#status').textContent = JSON.stringify(snapshot(), null, 2); };
function step(dt) {
  updateSpriteAnimationManager(manager, dt * 1000);
  for (const r of records) {
    if (r.combat.isAlive || (r.combat.isDying && r.actor.isKnockedBack)) r.actor.update(dt);
    r.combat.updateDeath(dt);
  }
}
document.querySelector('#hit').onclick = () => { for (const r of records) r.combat.applyDamage(25, { x: 1, y: 0 }); step(.1); show(); };
document.querySelector('#settle').onclick = () => { step(.1); step(.6); show(); };
document.querySelector('#reset').onclick = () => location.reload();
document.querySelector('#checks').onclick = () => {
  const checks = [];
  const check = (ok, label) => { if (!ok) throw Error(label); checks.push(label); };
  try {
    check(records.every(r => r.combat.health === 100), 'fresh roster');
    const starts = records.map(r => r.actor.getPosition());
    for (const r of records) r.combat.applyDamage(25, { x: 1, y: 0 });
    step(0);
    check(records.every((r, i) => r.actor.getPosition().x === starts[i].x), 'pause freezes recoil');
    step(.1);
    for (const [i, r] of records.entries()) {
      check(Math.abs(r.actor.getPosition().x - starts[i].x - 24) < 1e-6, `${r.character}: 24px halfway recoil`);
      check(r.combat.isDamageFlashing && r.color[0] > 1, `${r.character}: white flash`);
    }
    step(.1); step(.6);
    for (const [i, r] of records.entries()) {
      check(Math.abs(r.actor.getPosition().x - starts[i].x - 32) < 1e-6, `${r.character}: 32px total recoil`);
      check(!r.combat.isDamageFlashing && r.color[0] === 1, `${r.character}: flash clears`);
      resolveProjectileHit({ markHit() {}, deflect() {} }, { id: 'arrow', direction: { x: -1, y: 0 } }, r);
    }
    step(.2);
    check(records.every((r, i) => r.combat.health === 25 && Math.abs(r.actor.getPosition().x - starts[i].x) < 1e-6), 'arrows damage and recoil all five enemies');
    for (const r of records) r.combat.applyDamage(25, { x: 1, y: 0 });
    step(.2); step(.05);
    check(records.every((r, i) => r.combat.isDead && Math.abs(r.actor.getPosition().x - starts[i].x - 32) < 1e-6), 'lethal hits finish recoil during death');
    document.querySelector('#status').textContent = `PASS: ${checks.length} checks across all five enemy types.\n${checks.join('\n')}`;
  } catch (error) { document.querySelector('#status').textContent = `FAIL: ${error.message}`; console.error(error); }
};
show();
