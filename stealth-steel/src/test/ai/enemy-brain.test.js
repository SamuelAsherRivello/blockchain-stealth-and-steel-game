import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEnemyBrain } from '../../runtime/ai/enemy-brain.js';
import { createEnemyProfile, validateCapabilities } from '../../runtime/ai/enemy-profile.js';
import { createNavigation, createReachabilitySearch } from '../../runtime/ai/navigation.js';
import { createPlanningScheduler } from '../../runtime/ai/planning-scheduler.js';
import { updatePlayerAttackPreparation } from '../../runtime/characters/enemies/player-attack-preparation.js';
import { goblinProfile } from '../../runtime/characters/enemies/goblin/goblin-goap.js';
import { warriorProfile } from '../../runtime/characters/enemies/warrior/warrior-goap.js';
import { lancerProfile } from '../../runtime/characters/enemies/lancer/lancer-goap.js';
import { archerProfile } from '../../runtime/characters/enemies/archer/archer-goap.js';
import { monkProfile } from '../../runtime/characters/enemies/monk/monk-goap.js';

const grid = { tileSizePx: 64, columns: 12, rows: 12 };
function fixture(profile = warriorProfile, options = {}) {
  let position = { x: 160, y: 160 }, intent = { x: 0, y: 0 }, alive = true, lock = 0, defending = false;
  let player = { id: 'player', isAlive: true, hidden: false, detected: false, position: { x: 224, y: 160 }, cell: { x: 3, y: 2 } };
  const attacks = [], defenses = [], actor = {
    getPosition: () => ({ ...position }), getGridPosition: size => ({ x: Math.floor(position.x / size), y: Math.floor(position.y / size) }),
    getMovementCollider: () => ({ type: 'circle', ...position, radius: 24 }),
    getCombatCollider: () => ({ x: position.x - 32, y: position.y - 32, width: 64, height: 64 }),
    setMovementIntent: value => { intent = { ...value }; }, faceDirection() {},
    attack(...args) { attacks.push({ position: { ...position }, args }); lock = 0.5; return true; },
    shootAt(target) { attacks.push({ position: { ...position }, target: { ...target } }); lock = 1.35; return true; },
    beginDefense(direction) { defenses.push({ ...direction }); defending = true; return true; },
    isMovementLocked: () => lock > 0 || defending, get isAttacking() { return lock > 0; }, get isDefending() { return defending; },
  };
  const brain = createEnemyBrain({ id: options.id ?? 'enemy', actor, grid, profile, getPlayer: () => player,
    random: () => 0, isAlive: () => alive, isWalkable: () => true, ...options });
  return { actor, brain, attacks, defenses, get intent() { return intent; }, get player() { return player; },
    set player(value) { player = value; }, set position(value) { position = value; }, set alive(value) { alive = value; }, set defending(value) { defending = value; },
    tick(delta = 0.1) {
      brain.reaction.update(delta); brain.update(delta);
      if (delta <= 0) return;
      if (lock > 0) { lock = Math.max(0, lock - delta); return; }
      if (defending) return;
      if (!updatePlayerAttackPreparation(actor, delta, center => { position = { ...center }; })) {
        position.x += intent.x * 120 * delta; position.y += intent.y * 120 * delta;
      }
    },
  };
}

test('profiles validate capabilities and immutable enemy-specific parameters', () => {
  assert.throws(() => createEnemyProfile({ idleSeconds: [4, 2] }), /idleSeconds/);
  assert.throws(() => createEnemyProfile({ actions: ['teleport'] }), /action/);
  assert.throws(() => createEnemyProfile({ costs: { melee: -1 } }), /cost/);
  assert.throws(() => validateCapabilities(archerProfile, { setMovementIntent() {}, faceDirection() {} }), /ranged/);
  assert.equal(Object.isFrozen(goblinProfile.idleSeconds), true);
  assert.equal(monkProfile.actions.includes('melee'), false);
  assert.equal(goblinProfile.bushChance, .35);
  assert.equal(monkProfile.fleeTriggerCells, 2);
  assert.equal(monkProfile.goldChance, .45);
  assert.equal(warriorProfile.playerAttackFightChance, .6);
  assert.equal(warriorProfile.playerAttackTakeHitChance, .2);
  assert.equal(warriorProfile.playerAttackDefenseChance, .1);
  assert.equal(warriorProfile.playerAttackFleeChance, .1);
  assert.throws(() => createEnemyProfile({ fleeTriggerCells: -1 }), /fleeTriggerCells/);
  assert.throws(() => createEnemyProfile({ playerAttackFightChance: .6, playerAttackTakeHitChance: .3, playerAttackDefenseChance: .1, playerAttackFleeChance: .1 }), /profile configuration/);
});

test('all combat profiles immediately center and commit; Monk remains passive', () => {
  for (const profile of [goblinProfile, warriorProfile, lancerProfile, archerProfile, monkProfile]) {
    const f = fixture(profile); f.position = { x: 161, y: 160 }; f.tick();
    assert.equal(f.attacks.length, profile === monkProfile ? 0 : 1, profile.id);
    if (f.attacks.length) assert.deepEqual(f.attacks[0].position, { x: 160, y: 160 });
    f.brain.dispose();
  }
});

test('adjacency bypasses exhausted ordinary planning, while committed attacks survive knowledge changes', () => {
  const scheduler = createPlanningScheduler({ maxExpansions: 1 });
  scheduler.request('busy', () => ({ expanded: 1 })); scheduler.beginFrame();
  const f = fixture(warriorProfile, { scheduler }); f.tick(); assert.equal(f.attacks.length, 1);
  f.player.hidden = true; f.brain.reaction.forceState('INVESTIGATING'); f.tick();
  assert.equal(f.brain.getNavigationSnapshot().action, 'attacking');
  assert.equal(f.attacks.length, 1);
  f.defending = true; f.tick(); assert.equal(f.brain.getNavigationSnapshot().action, 'defense');
  f.brain.dispose();
});

test('knowledge is isolated and hidden tracking expires before another current hidden coordinate is consumed', () => {
  const a = fixture(), b = fixture();
  for (const f of [a, b]) { f.player.hidden = true; f.player.position = { x: 480, y: 160 }; f.player.cell = { x: 7, y: 2 }; }
  a.brain.reaction.acceptDetection({ type: 'visual', strength: 1, cell: { x: 5, y: 2 } });
  a.tick(); b.tick();
  assert.deepEqual(a.brain.reaction.getSnapshot().lastKnownCell, { x: 7, y: 2 });
  assert.equal(b.brain.reaction.getSnapshot().lastKnownCell, null);
  a.player.cell = { x: 8, y: 2 }; a.player.position.x = 544;
  a.tick(3.1);
  assert.deepEqual(a.brain.reaction.getSnapshot().lastKnownCell, { x: 7, y: 2 });
  assert.notDeepEqual(a.brain.getNavigationSnapshot().target, { x: 8, y: 2 });
  const snapshot = a.brain.getNavigationSnapshot(); assert.equal(Object.isFrozen(snapshot.plan), true);
  a.brain.dispose(); b.brain.dispose();
});

test('Archer composes move then ranged outside range; close Archer stands and shoots without retreat', () => {
  const far = fixture(archerProfile); far.player.position.x = 608; far.player.cell.x = 9; far.player.detected = true;
  far.tick(); assert.deepEqual(far.brain.getNavigationSnapshot().plan, ['move-to', 'ranged']);
  assert.equal(far.attacks.length, 0); assert.equal(far.intent.x, 1);
  const close = fixture(archerProfile); close.tick(); assert.equal(close.attacks.length, 1); assert.deepEqual(close.intent, { x: 0, y: 0 });
  far.brain.dispose(); close.brain.dispose();
});

test('investigation travel and looking share one clock; repeated detection has no repeated entry freeze', () => {
  const f = fixture(monkProfile); f.player = null;
  f.brain.reaction.acceptDetection({ type: 'audio', strength: 1, cell: { x: 8, y: 2 } });
  f.tick(); assert.deepEqual(f.intent, { x: 0, y: 0 });
  f.tick(); assert.equal(f.intent.x, 1);
  const before = f.brain.reaction.getSnapshot().remainingSeconds;
  f.brain.reaction.acceptDetection({ type: 'audio', strength: 1, cell: { x: 8, y: 2 } });
  f.tick(); assert.equal(f.intent.x, 1); assert.ok(f.brain.reaction.getSnapshot().remainingSeconds < before);
  for (let i = 0; i < 80; i++) f.tick();
  assert.equal(f.brain.reaction.getSnapshot().state, 'SUSPICIOUS'); f.brain.dispose();
});

test('burns bind living bushes and deliver exactly one 50-damage event per committed action', () => {
  let damage = 0, alive = true;
  const bush = { id: 'bush', isAlive: true, cell: { x: 3, y: 2 }, position: { x: 224, y: 160 },
    combatCollider: { x: 192, y: 128, width: 64, height: 64 }, applyFireDamage(value) { damage += value; alive = false; } };
  const f = fixture(createEnemyProfile({ ...goblinProfile, idleSeconds: [0, 0] }), {
    getWorld: () => ({ characters: [], bushes: alive ? [bush] : [] }),
  }); f.player = null;
  f.tick(); f.tick(); assert.equal(damage, 50); assert.equal(f.attacks.length, 1);
  for (let i = 0; i < 40; i++) f.tick();
  assert.equal(damage, 50); assert.equal(f.attacks.length, 1); f.brain.dispose();
});

test('Goblin uses the 35-percent bush roll after combat priority and preserves the boundary', () => {
  const bush = { id: 'bush', isAlive: true, cell: { x: 3, y: 2 }, position: { x: 224, y: 160 },
    combatCollider: { x: 192, y: 128, width: 64, height: 64 }, applyFireDamage() {} };
  const profile = createEnemyProfile({ ...goblinProfile, idleSeconds: [0, 0] });
  const burnsFor = roll => {
    const f = fixture(profile, { random: () => roll, getWorld: () => ({ characters: [], bushes: [bush] }) });
    f.player = null;
    f.tick(); f.tick();
    return f;
  };
  const selected = burnsFor(.349);
  assert.equal(selected.brain.getNavigationSnapshot().goal, 'burn bush');
  selected.brain.dispose();
  const skipped = burnsFor(.35);
  assert.notEqual(skipped.brain.getNavigationSnapshot().goal, 'burn bush');
  skipped.brain.dispose();

  const combatFirst = fixture(profile, { random: () => 0, getWorld: () => ({ characters: [], bushes: [bush] }) });
  combatFirst.tick();
  assert.equal(combatFirst.brain.getNavigationSnapshot().goal, 'attack player');
  combatFirst.brain.dispose();
});

test('navigation honors world grid origins, deferred scans and dynamic invalidation', () => {
  const search = createReachabilitySearch({ x: -2, y: -2 }, { columns: 4, rows: 4, minColumn: -2, minRow: -2 }, () => true);
  assert.equal(search.step(1).done, false);
  const done = search.step(100); assert.equal(done.candidates.length, 16);
  const f = fixture(); let walkable = true;
  const nav = createNavigation({ actor: f.actor, grid, isWalkable: () => walkable });
  nav.start(candidates => candidates.find(x => x.cell.x === 4 && x.cell.y === 2));
  assert.equal(nav.update(0.1), 'running'); walkable = false;
  assert.equal(nav.update(0.1), 'failed'); assert.deepEqual(f.intent, { x: 0, y: 0 }); f.brain.dispose();
});

test('enclosed enemies make a bounded escape attempt then wait three active seconds; pause and death stop work', () => {
  const f = fixture(createEnemyProfile({ ...monkProfile, idleSeconds: [0, 0] }), { isWalkable: () => false }); f.player = null;
  f.tick(); f.tick(); f.tick(); f.tick();
  assert.equal(f.brain.getNavigationSnapshot().goal, 'retry');
  const remaining = f.brain.getNavigationSnapshot().retryRemaining;
  f.tick(0); assert.equal(f.brain.getNavigationSnapshot().retryRemaining, remaining);
  for (let i = 0; i < 20; i++) f.tick();
  assert.equal(f.brain.getNavigationSnapshot().goal, 'retry');
  f.alive = false; f.tick(); assert.equal(f.brain.getNavigationSnapshot().disposed, true); assert.deepEqual(f.intent, { x: 0, y: 0 });
});

test('real spawn wiring attaches GOAP exclusively for every enemy factory', () => {
  const source = readFileSync(new URL('../../runtime/main.js', import.meta.url), 'utf8');
  assert.match(source, /record\.brain = createEnemyBrain/);
  assert.match(source, /record\.controller = record\.awareness = record\.brain/);
  for (const enemy of ['Archer', 'Goblin', 'Warrior', 'Lancer', 'Monk']) assert.match(source, new RegExp(`function create${enemy}Record`));
  assert.doesNotMatch(source, /createEnemyPatrolController|createEnemyAwarenessController|createGoblinBehaviorController/);
  const archer = readFileSync(new URL('../../runtime/characters/enemies/archer/archer.js', import.meta.url), 'utf8');
  assert.doesNotMatch(archer, /chooseArcherAction|requestPlayerAttack|autonomous/);
});

test('a stealth entry makes only its source brain idle for its sampled active-time window', () => {
  const f = fixture(warriorProfile, { random: () => 0 });
  f.brain.beginStealthIdle({ seconds: 2 });
  assert.deepEqual(f.intent, { x: 0, y: 0 });
  assert.equal(f.brain.getNavigationSnapshot().goal, 'stealth idle');
  f.tick(1.9);
  assert.equal(f.brain.getNavigationSnapshot().goal, 'stealth idle');
  f.tick(.1);
  assert.notEqual(f.brain.getNavigationSnapshot().goal, 'stealth idle');
  f.brain.dispose();
});

test('a Monk flees a permitted player within two cells without attacking, then may seek a reachable gold pickup', () => {
  const fleeing = fixture(monkProfile, { random: () => 0 });
  fleeing.player = { ...fleeing.player, position: { x: 288, y: 160 }, cell: { x: 4, y: 2 } };
  fleeing.brain.update(.1);
  assert.equal(fleeing.attacks.length, 0);
  assert.equal(fleeing.brain.getNavigationSnapshot().goal, 'flee player');
  assert.notDeepEqual(fleeing.intent, { x: 0, y: 0 });
  fleeing.brain.dispose();

  const hidden = fixture(monkProfile, { random: () => 0 });
  hidden.player = { ...hidden.player, hidden: true, position: { x: 288, y: 160 }, cell: { x: 4, y: 2 } };
  hidden.brain.update(.1);
  assert.notEqual(hidden.brain.getNavigationSnapshot().goal, 'flee player');
  hidden.brain.dispose();

  const gold = { id: 'gold-1', isAlive: true, cell: { x: 4, y: 2 }, position: { x: 288, y: 160 } };
  const seeker = fixture(createEnemyProfile({ ...monkProfile, idleSeconds: [0, 0], goldChance: 1 }), {
    random: () => 0,
    getWorld: () => ({ characters: [], bushes: [], gold: [gold] }),
  });
  seeker.player = null;
  seeker.tick(); seeker.tick();
  assert.equal(seeker.attacks.length, 0);
  assert.equal(seeker.brain.getNavigationSnapshot().goal, 'seek gold');
  assert.equal(seeker.brain.getNavigationSnapshot().targetId, gold.id);
  assert.notDeepEqual(seeker.intent, { x: 0, y: 0 });
  seeker.brain.dispose();

  const blockedGold = { id: 'blocked', isAlive: true, cell: { x: 3, y: 2 }, position: { x: 224, y: 160 } };
  const reachableGold = { id: 'reachable', isAlive: true, cell: { x: 4, y: 2 }, position: { x: 288, y: 160 } };
  const nearestReachable = fixture(createEnemyProfile({ ...monkProfile, idleSeconds: [0, 0], goldChance: 1 }), {
    random: () => 0,
    isWalkable: cell => cell.x !== 3 || cell.y !== 2,
    getWorld: () => ({ characters: [], bushes: [], gold: [blockedGold, reachableGold] }),
  });
  nearestReachable.player = null;
  for (let index = 0; index < 4; index++) nearestReachable.tick();
  assert.equal(nearestReachable.brain.getNavigationSnapshot().targetId, reachableGold.id);
  nearestReachable.brain.dispose();

  const firstGold = { id: 'first', isAlive: true, cell: { x: 3, y: 2 }, position: { x: 224, y: 160 } };
  const secondGold = { id: 'second', isAlive: true, cell: { x: 2, y: 3 }, position: { x: 160, y: 224 } };
  const stableTie = fixture(createEnemyProfile({ ...monkProfile, idleSeconds: [0, 0], goldChance: 1 }), {
    random: () => 0,
    getWorld: () => ({ characters: [], bushes: [], gold: [firstGold, secondGold] }),
  });
  stableTie.player = null;
  stableTie.tick(); stableTie.tick();
  assert.equal(stableTie.brain.getNavigationSnapshot().targetId, firstGold.id);
  stableTie.brain.dispose();
});

test('Warrior independently resolves every eligible knife impact into the confirmed 60/20/10/10 outcomes', () => {
  const fight = fixture(warriorProfile, { random: () => .59 });
  assert.equal(fight.brain.respondToPlayerAttack(), 'fight');
  assert.equal(fight.defenses.length, 0);
  assert.equal(fight.attacks.length, 0);
  fight.brain.dispose();

  const takeHit = fixture(warriorProfile, { random: () => .79 });
  assert.equal(takeHit.brain.respondToPlayerAttack(), 'take-hit');
  assert.equal(takeHit.defenses.length, 0);
  takeHit.brain.dispose();

  const guard = fixture(warriorProfile, { random: () => .89 });
  assert.equal(guard.brain.respondToPlayerAttack(), 'defend');
  assert.deepEqual(guard.defenses, [{ x: 1, y: 0 }]);
  assert.equal(guard.attacks.length, 0);
  guard.brain.dispose();

  const interrupt = fixture(warriorProfile, { random: () => .89 });
  interrupt.actor.attack({ x: 1, y: 0 });
  assert.equal(interrupt.brain.respondToPlayerAttack(), 'defend');
  assert.equal(interrupt.defenses.length, 1);
  interrupt.brain.dispose();

  const flee = fixture(warriorProfile, { random: () => .95 });
  assert.equal(flee.brain.respondToPlayerAttack(), 'flee');
  assert.equal(flee.brain.getNavigationSnapshot().goal, 'flee player');
  assert.equal(flee.attacks.length, 0);
  assert.notDeepEqual(flee.intent, { x: 0, y: 0 });
  flee.brain.dispose();

  const rolls = [.59, .89];
  const consecutive = fixture(warriorProfile, { random: () => rolls.shift() });
  assert.equal(consecutive.brain.respondToPlayerAttack(), 'fight');
  assert.equal(consecutive.brain.respondToPlayerAttack(), 'defend');
  assert.equal(consecutive.defenses.length, 1);
  consecutive.brain.dispose();

  const trapped = fixture(warriorProfile, { random: () => .95, isWalkable: () => false });
  assert.equal(trapped.brain.respondToPlayerAttack(), 'take-hit');
  assert.notEqual(trapped.brain.getNavigationSnapshot().goal, 'recover');
  trapped.brain.dispose();
});

test('20 mixed brains respect planning and navigation caps across repeated blockage and resume', () => {
  const scheduler = createPlanningScheduler({ maxExpansions: 8, maxNavigation: 128 });
  let blocked = false;
  const profiles = [goblinProfile, warriorProfile, lancerProfile, archerProfile, monkProfile];
  const roster = Array.from({ length: 20 }, (_, i) => fixture(createEnemyProfile({ ...profiles[i % 5], idleSeconds: [0,0], bushChance: 0 }),
    { id: `load-${i}`, scheduler, isWalkable: () => !blocked }));
  roster.forEach(f => { f.player = null; });
  const moved = new Set(); let maxPending = 0;
  for (let frame = 0; frame < 900; frame++) {
    blocked = frame >= 200 && frame < 600;
    scheduler.beginFrame();
    roster.forEach((f,i) => { f.tick(1/60); if (f.intent.x || f.intent.y) moved.add(i); });
    const work = scheduler.snapshot(); maxPending = Math.max(maxPending, work.pending);
    assert.ok(work.expanded <= 8); assert.ok(work.navigation <= 128);
    assert.ok(work.immediate <= 40, 'at most one small urgent/recovery request per enemy');
  }
  assert.equal(moved.size, 20); assert.ok(maxPending <= 20);
  roster.forEach(f => f.brain.dispose()); assert.equal(scheduler.snapshot().pending, 0);
});

test('deferred alternate attacks cannot commit before fresh adjacent-player priority is evaluated', () => {
  const scheduler = createPlanningScheduler();
  const sheep = { id: 'sheep', character: 'sheep', isAlive: true, cell: { x: 1, y: 2 }, position: { x: 96, y: 160 } };
  const f = fixture(goblinProfile, { scheduler, getWorld: () => ({ characters: [sheep], bushes: [] }) });
  const player = f.player; f.player = null; f.tick();
  f.player = player; scheduler.beginFrame();
  assert.equal(f.attacks.length, 0, 'scheduler only computes, never commits');
  f.tick(); assert.equal(f.attacks.length, 1);
  assert.deepEqual(f.attacks[0].args[0], { x: 1, y: 0 }); f.brain.dispose();
});

test('all five live profiles publish isolated immutable patrol intent and clear it on every exit', () => {
  for (const profile of [goblinProfile, warriorProfile, lancerProfile, archerProfile, monkProfile]) {
    for (const exit of ['cancel', 'dispose', 'death', 'defense', 'awareness', 'attack', 'blocked', 'completion', 'displacement']) {
      if (exit === 'attack' && profile === monkProfile) continue;
      let walkable = true;
      const f = fixture(createEnemyProfile({ ...profile, idleSeconds: [0,0], bushChance: 0 }), {
        isWalkable: () => walkable, getPatrolPeers: () => [{ id: 'other', cell: { x: 0, y: 0 } }],
      }); f.player = null;
      f.brain.update(.1); f.brain.update(.1);
      const destination = f.brain.getPatrolDestination(); assert.ok(destination, `${profile.id} ${exit}`);
      const snapshot = f.brain.getNavigationSnapshot(); assert.ok(Object.isFrozen(snapshot.patrolDestination));
      destination.x = -100; assert.notEqual(f.brain.getPatrolDestination().x, -100);
      if (exit === 'cancel') f.brain.cancelNavigation();
      if (exit === 'dispose') f.brain.dispose();
      if (exit === 'death') { f.alive = false; assert.equal(f.brain.getPatrolDestination(), null); f.brain.update(.1); }
      if (exit === 'defense') { f.defending = true; f.brain.update(.1); }
      if (exit === 'displacement') { f.actor.isMovementLocked = () => true; f.brain.update(.1); }
      if (exit === 'awareness') { f.brain.reaction.forceState('SUSPICIOUS'); assert.equal(f.brain.getPatrolDestination(), null); f.brain.update(.1); }
      if (exit === 'attack') { f.player = { id: 'p', isAlive: true, cell: { x: 3, y: 2 }, position: { x: 224, y: 160 } }; f.brain.update(.1); assert.equal(f.attacks.length, 1); }
      if (exit === 'blocked') { walkable = false; f.brain.update(.1); }
      if (exit === 'completion') {
        for (let i = 0; i < 500 && f.brain.getPatrolDestination(); i++) f.tick(.025);
      }
      assert.equal(f.brain.getPatrolDestination(), null, `${profile.id} ${exit}`); f.brain.dispose();
    }
  }
});

test('later brains see earlier intent in the same update without acquiring player knowledge', () => {
  let peers = [];
  const profile = createEnemyProfile({ ...warriorProfile, idleSeconds: [0,0] });
  const a = fixture(profile, { id:'a', getPatrolPeers: () => peers.map(f => ({ id: f.id, cell: f.actor.getGridPosition(64), patrolDestination: f.brain.getPatrolDestination() })) });
  const b = fixture(profile, { id:'b', getPatrolPeers: () => [{ id:'a', cell: a.actor.getGridPosition(64), patrolDestination: a.brain.getPatrolDestination() }] });
  a.id = 'a'; b.id = 'b'; a.player = b.player = null; peers = [a,b];
  a.brain.update(.1); b.brain.update(.1); a.brain.update(.1); b.brain.update(.1);
  assert.notDeepEqual(a.brain.getPatrolDestination(), b.brain.getPatrolDestination());
  assert.equal(b.brain.reaction.getSnapshot().lastKnownCell, null);
  a.brain.dispose(); b.brain.dispose();
});
