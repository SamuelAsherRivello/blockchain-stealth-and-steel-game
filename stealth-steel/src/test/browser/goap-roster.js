import { resolveMeleeImpacts } from "../../runtime/gameplay/player-damage.js";
import { loadSpriteAtlas } from "@babylonjs/lite";
import { createReactiveDecoration } from "../../runtime/systems/environment/decorations/reactive-decoration.js";
import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine,
  createSpriteAnimationManager, updateSpriteAnimationManager, createSprite2DLayer, addSprite2D } from '@babylonjs/lite';
import { createGoblin, loadGoblinAtlases } from '../../runtime/characters/enemies/goblin/goblin.js';
import { createWarrior, loadWarriorAtlases } from '../../runtime/characters/enemies/warrior/warrior.js';
import { createLancer, loadLancerAtlases } from '../../runtime/characters/enemies/lancer/lancer.js';
import { createArcher, loadArcherAtlases } from '../../runtime/characters/enemies/archer/archer.js';
import { createMonk, loadMonkAtlases } from '../../runtime/characters/enemies/monk/monk.js';
import { loadPlayerAtlases, PLAYER_PIVOT, PLAYER_FRAME, PLAYER_ART_OFFSET } from '../../runtime/characters/player/player.js';
import { GridSpot } from '../../runtime/systems/environment/grid-spot.js';
import { createEnemyBrain } from "../../runtime/ai/enemy-brain.js";
import { createEnemyProfile } from "../../runtime/ai/enemy-profile.js";
import { createPlanningScheduler } from "../../runtime/ai/planning-scheduler.js";
import { enemyAiLabel, drawEnemyAiLabels } from "../../runtime/ai/enemy-ai-labels.js";
import { goblinProfile } from "../../runtime/characters/enemies/goblin/goblin-goap.js";
import { warriorProfile } from "../../runtime/characters/enemies/warrior/warrior-goap.js";
import { lancerProfile } from "../../runtime/characters/enemies/lancer/lancer-goap.js";
import { archerProfile } from "../../runtime/characters/enemies/archer/archer-goap.js";
import { monkProfile } from "../../runtime/characters/enemies/monk/monk-goap.js";
import { loadArrowAtlas, createProjectileRenderer } from '../../runtime/systems/objects/projectile-renderer.js';

const params = new URLSearchParams(location.search);
const offset = { x: Number(params.get('dx') ?? 1), y: Number(params.get('dy') ?? 0) };
const duration = Number(params.get('duration') ?? 6);
const mode = params.get('mode') ?? 'combat';
const profiles = [goblinProfile, warriorProfile, lancerProfile, archerProfile, monkProfile];
const scheduler = createPlanningScheduler();
const timings = [], intervals = [], work = [];
let bushDamage = 0;
const startOffset = { x: Number(params.get('startX') ?? 0), y: Number(params.get('startY') ?? 0) };
const canvas = document.querySelector('canvas'), output = document.querySelector('#result');
const bounds = { width: 960, height: 1024 }, grid = { tileSizePx: 64, columns: 15, rows: 16 };
document.querySelector('#resize').addEventListener('click', () => {
  const scene = document.querySelector('.scene'); scene.style.width = scene.style.width === '480px' ? '960px' : '480px';
});
const types = ['goblin', 'warrior', 'lancer', 'archer', 'monk'];
const states = ['NONE', 'SUSPICIOUS', 'INVESTIGATING', 'ALERT'];
const factories = [createGoblin, createWarrior, createLancer, createArcher, createMonk];
const engine = await createEngine(canvas, { maxDevicePixelRatio: 1 });
engine._w = bounds.width; engine._h = bounds.height;
const manager = createSpriteAnimationManager();
const atlases = await Promise.all([loadGoblinAtlases, loadWarriorAtlases, loadLancerAtlases, loadArcherAtlases, loadMonkAtlases, loadPlayerAtlases, loadArrowAtlas].map(load => load(engine)));
const arrows = createProjectileRenderer({ atlas: atlases[6], bounds, obstacles: [] });
const records = [];
const bushAtlas = mode === "bush" ? await loadSpriteAtlas(engine, "/assets/images/terrain/decorations/bushes/Bushe1.png", { gridSize: [128,128], sampling: "nearest" }) : null;
for (const [row, state] of states.entries()) for (const [column, character] of types.entries()) {
  const origin = { x: 96 + 192 * column, y: 864 - row * 256 };
  const playerPosition = { x: origin.x + offset.x * 64, y: origin.y + offset.y * 64 };
  const playerSpot = new GridSpot(playerPosition, grid);
  const playerLayer = createSprite2DLayer(atlases[5].idle, { capacity: 1, order: 1, pivot: [PLAYER_PIVOT.x, PLAYER_PIVOT.y] });
  addSprite2D(playerLayer, { positionPx: [playerPosition.x + PLAYER_ART_OFFSET.x, bounds.height - playerPosition.y - PLAYER_ART_OFFSET.y],
    sizePx: [PLAYER_FRAME.width, PLAYER_FRAME.height], frame: 0 });
  const player = { layers: [playerLayer], getPosition: () => ({ ...playerPosition }), getGridPosition: () => playerSpot.cell };
  const initial = { x: origin.x + startOffset.x, y: origin.y + startOffset.y };
  const record = { damage: 0, character, awarenessState: state, origin, starts: 0, shots: 0, heals: 0, movedDuringAttack: false, firstAttack: false, attackCenters: [], aimCenters: [] };
  const actor = factories[column]({ atlases: atlases[column], initialPosition: initial, bounds, obstacles: [],
    onHeal: () => record.heals++, onShoot: (position, target, options) => {
      record.shots++;
      arrows.shoot(position, options.initialVelocityDirection, character, { target, speedMultiplier: 0.5, collisionEnabled: false, rotationEnabled: true, ...options });
    } });
  actor.playAnimation(manager);
  const face = actor.faceDirection.bind(actor);
  actor.faceDirection = direction => { record.aimCenters.push(actor.getPosition()); return face(direction); };
  const target = { id: `player-${row}-${column}`, isAlive: true, hidden: mode === 'knowledge', detected: mode === 'range', position: playerPosition, cell: playerSpot.cell };
  const bush = mode === 'bush' && column === 0 ? createReactiveDecoration({
    object: { id: `fixture-${row}`, position: playerPosition, decoration: {
      frameSize: { width: 128, height: 128 }, idleFrame: 0, frameCount: 8, frameDurationMs: 100,
      acceptedCharacterTypes: [], sensor: { x: playerPosition.x-32, y: playerPosition.y-32, width:64, height:64 },
      combatCollider: { x: playerPosition.x-32, y: playerPosition.y-32, width:64, height:64 },
    } }, atlas: bushAtlas, animationManager: manager, screenHeight: bounds.height,
  }) : null;
  const awareness = createEnemyBrain({ id: `enemy-${row}-${column}`, actor, scheduler, grid,
    profile: createEnemyProfile({ ...profiles[column], idleSeconds: mode === 'combat' ? [3,5] : [0,0], bushChance: mode === 'bush' ? 1 : 0 }),
    isWalkable: () => mode !== 'blocked', random: () => 0,
    getPlayer: () => ['combat','range','knowledge'].includes(mode) ? target : null,
    getWorld: () => ({ characters: [], bushes: bush?.isAlive ? [bush.getSnapshot()] : [] }),
  });
  if (mode === 'combat') awareness.reaction.forceState(state);
  if (mode === 'knowledge' && row === 0) awareness.reaction.acceptDetection({ type: 'visual', strength: 1, cell: target.cell });
  Object.assign(record, { actor, player, awareness, bush, target, originalTargetCell: { ...target.cell }, targetMoved: false }); records.push(record);
}
registerSpriteRenderer(createSpriteRenderer(engine, { layers: [...records.flatMap(r => [...r.actor.layers, ...(r.bush ? r.bush.layers : r.player.layers)]), arrows.layer], clearValue: { r: .15, g: .3, b: .17, a: 1 } }));
await startEngine(engine);
document.querySelector('#description').textContent = `Player offset ${offset.x},${offset.y}; enemy starts ${startOffset.x},${startOffset.y}px from center. Rows: NONE, SUSPICIOUS, INVESTIGATING, ALERT. Stops after ${duration}s.`;
let elapsed = 0, previous = performance.now();
const attacking = actor => /attack|shooting/.test(actor.state);
function frame(now) {
  intervals.push(now - previous);
  const delta = Math.max(0, Number(params.get('step') ?? Math.min((now - previous) / 1000, .04))); previous = now;
  const aiStart = performance.now();
  scheduler.beginFrame();
  if (delta === 0) { requestAnimationFrame(frame); return; }
  for (const r of records) {
    const before = r.actor.getPosition(), wasAttacking = attacking(r.actor);
    if (mode === 'knowledge' && elapsed >= 3.1 && !r.targetMoved) { r.targetMoved = true; r.target.cell = { x:r.target.cell.x+1, y:r.target.cell.y }; r.target.position = { x:r.target.position.x+64, y:r.target.position.y }; }
    r.awareness.reaction.update(delta);
    r.awareness.update(delta);
    r.actor.update(delta, [], [], null);
    resolveMeleeImpacts([{ actor: r.actor, character: r.character, combat: { isAlive: true } }], {
      actor: r.player, combat: { isAlive: true, getCombatCollider: () => ({ x: r.player.getPosition().x-32, y: r.player.getPosition().y-32, width:64, height:64 }), applyDamage: value => { r.damage += value; } },
    });
    r.bush?.update([], delta);
    if (!wasAttacking && attacking(r.actor)) { r.starts++; r.attackCenters.push(r.actor.getPosition()); }
    if (elapsed === 0) r.firstAttack = attacking(r.actor);
    if (wasAttacking && JSON.stringify(before) !== JSON.stringify(r.actor.getPosition())) r.movedDuringAttack = true;
  }
  timings.push(performance.now() - aiStart); work.push(scheduler.snapshot());
  const labelContext = document.querySelector('#labels').getContext('2d');
  labelContext.clearRect(0,0,bounds.width,bounds.height);
  drawEnemyAiLabels(labelContext, records.map(r => enemyAiLabel({ position: r.actor.getPosition(), snapshot: r.awareness.getNavigationSnapshot() }, bounds.height)));
  updateSpriteAnimationManager(manager, delta * 1000);
  arrows.update(delta);
  elapsed += delta;
  bushDamage = records.reduce((sum,r) => sum + (r.bush ? 100-r.bush.health : 0),0);
  const rows = records.map(r => ({ damage: r.damage, bushHealth: r.bush?.health, character: r.character, awareness: r.awareness.reaction.getSnapshot().state,
    state: r.actor.state, starts: r.starts, shots: r.shots, heals: r.heals, firstAttack: r.firstAttack,
    movedDuringAttack: r.movedDuringAttack, visibleLayers: r.actor.layers.filter(l => l.visible).length,
    position: r.actor.getPosition(), center: r.origin, attackCenters: r.attackCenters, decision: r.awareness.getNavigationSnapshot(),
    moved: JSON.stringify(r.actor.getPosition()) !== JSON.stringify(r.origin) }));
  const percentile = (values, p) => [...values].sort((a,b) => a-b)[Math.floor((values.length-1)*p)] ?? 0;
  const result = { complete: elapsed >= duration, mode, offset, elapsed, bushDamage, rows,
    performance: { frames: timings.length, updateMedianMs: percentile(timings,.5), updateP95Ms: percentile(timings,.95),
      frameMedianMs: percentile(intervals,.5), frameP95Ms: percentile(intervals,.95),
      maxPlanning: Math.max(...work.map(w => w.expanded)), maxImmediate: Math.max(...work.map(w => w.immediate)), maxNavigation: Math.max(...work.map(w => w.navigation)),
      maxPending: Math.max(...work.map(w => w.pending)) } };
  if (result.complete && mode === 'knowledge') {
    result.knowledgeIsolated = records.slice(5).every(r => r.awareness.reaction.getSnapshot().lastKnownCell === null && r.starts === 0);
    result.hiddenTrackingExpired = records.slice(0,5).every(r => !r.awareness.reaction.canTrackHiddenPlayer()
      && JSON.stringify(r.awareness.reaction.getSnapshot().lastKnownCell) === JSON.stringify(r.originalTargetCell));
  }
  if (result.complete) {
    const before = records.map(r => JSON.stringify(r.awareness.getNavigationSnapshot()));
    records.forEach(r => r.awareness.update(0));
    result.pausePreserved = records.every((r,i) => JSON.stringify(r.awareness.getNavigationSnapshot()) === before[i]);
    records.forEach(r => r.awareness.dispose());
    labelContext.clearRect(0,0,bounds.width,bounds.height);
    result.disposalCleanedLabels = records.every(r => enemyAiLabel({ position: r.actor.getPosition(), snapshot: r.awareness.getNavigationSnapshot() }, bounds.height) === null);
  }
  output.textContent = JSON.stringify({ complete: result.complete, mode, bushDamage, performance: result.performance,
    pausePreserved: result.pausePreserved, disposalCleanedLabels: result.disposalCleanedLabels,
    rows: rows.map(({ character, starts, shots, heals, movedDuringAttack, visibleLayers, decision }) => ({ character, starts, shots, heals, movedDuringAttack, visibleLayers, goal: decision.goal, action: decision.action, retry: decision.retryRemaining })) }, null, 2); output.dataset.complete = String(result.complete); output.dataset.result = JSON.stringify(result);
  if (elapsed < duration) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
