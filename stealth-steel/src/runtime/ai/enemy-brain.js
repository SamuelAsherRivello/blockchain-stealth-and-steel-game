import { createEnemyPerceptionReaction } from '../systems/perception/enemy-perception-reaction.js';
import { canEnemyTargetPlayer } from '../systems/perception/player-hidden.js';
import { cancelPlayerAttackPreparation, hasPlayerAttackPreparation } from '../characters/enemies/player-attack-preparation.js';
import { cellCenter, cellKey } from '../characters/movement-recovery.js';
import { plan } from './goap/planner.js';
import { createExecutor } from './goap/executor.js';
import { createNavigation, createReachabilitySearch, cardinalDistance } from './navigation.js';
import { validateCapabilities } from './enemy-profile.js';
import { senseEnemy } from './enemy-facts.js';
import { actionLibrary } from './actions/index.js';

export function createEnemyBrain({ id, actor, grid, isWalkable, profile, getPlayer = () => null,
  getWorld = () => ({ characters: [], bushes: [], gold: [] }), getPatrolPeers = () => [], isAlive = () => true, onStateChange = () => {}, random = Math.random, scheduler = null }) {
  validateCapabilities(profile, actor);
  const executor = createExecutor(), navigation = createNavigation({ actor, grid, isWalkable, scheduler, retrySeconds: profile.retrySeconds });
  const spawnCell = actor.getGridPosition(grid.tileSizePx);
  let disposed = false, entryStop = false, dirty = false, goal = null, goalKey = null, binding = null;
  let normalStage = 'idle', sampledDuration = null, bushRoll = null, goldRoll = null, bushScan = null, goldScan = null, suppressedSheep = null;
  let failureKey = null, failureRemaining = 0, lastReason = 'spawn', lastPlan = [], expanded = 0, evidence = null;
  let escapeAttempted = false, fleeSequence = 0;
  let stealthIdleRemaining = 0;
  let readyPlan = null;
  let patrolDestination = null;
  const stop = () => actor.setMovementIntent({ x: 0, y: 0 });
  const choose = values => values[Math.min(values.length - 1, Math.floor(Math.max(0, Math.min(1, random())) * values.length))];
  const duration = range => range[0] + Math.max(0, Math.min(1, random())) * (range[1] - range[0]);
  const reaction = createEnemyPerceptionReaction({ profile: profile.perception, random,
    onStateChange(next, previous) {
      patrolDestination = null;
      dirty = true; entryStop = next !== 'NONE'; bushScan = null;
      if (next === 'NONE') { normalStage = 'idle'; sampledDuration = null; bushRoll = null; goldRoll = null; bushScan = null; goldScan = null; evidence = null; }
      onStateChange(next, previous);
    },
    onMoveTo(cell) { evidence = { ...cell }; },
    onFace(cell) { if (!evidence) evidence = { ...cell }; },
  });
  const sense = () => senseEnemy({ actor, grid, reaction, getPlayer });
  const ownCell = () => actor.getGridPosition(grid.tileSizePx);
  const resolveTarget = value => {
    if (value.type === 'player') { const player = sense().player; return player?.id === value.id ? player : null; }
    const list = value.type === 'bush' ? getWorld().bushes
      : value.type === 'gold' ? getWorld().gold
        : getWorld().characters;
    return list?.find(x => x.id === value.id && x.isAlive !== false) ?? null;
  };
  const attackEligible = (target, rule) => {
    if (!target || target.isAlive === false) return false;
    if (rule === 'ranged') return canEnemyTargetPlayer(target, reaction) && target.detected === true
      && Math.hypot(target.position.x - actor.getPosition().x, target.position.y - actor.getPosition().y) <= profile.attackRange;
    return target.cell && cardinalDistance(ownCell(), target.cell) === profile.meleeCells
      && (target.character !== 'player' || canEnemyTargetPlayer(target, reaction));
  };
  const bindingValid = value => value.type === 'evidence' || value.type === 'escape' || value.type === 'flee' || Boolean(resolveTarget(value));
  const selectDestination = (candidates, value) => {
    if (value.type === 'escape') return choose(candidates.filter(x => x.route.length === 1));
    if (value.type === 'flee') {
      const currentDistance = cardinalDistance(ownCell(), value.playerCell);
      const eligible = candidates.filter(x => (
        x.route.length >= value.minCells
        && x.route.length <= value.maxCells
        && cardinalDistance(x.cell, value.playerCell) > currentDistance
      ));
      return choose(eligible);
    }
    const target = value.type === 'evidence' ? { cell: value.cell } : resolveTarget(value);
    if (!target) return null;
    if (value.type === 'gold') return candidates.find(x => cellKey(x.cell) === cellKey(target.cell));
    if (value.rule === 'ranged') return candidates.find(x => {
      const center = cellCenter(x.cell, grid.tileSizePx);
      return (x.route.length === 0 || isWalkable(x.cell)) && Math.hypot(center.x - target.position.x, center.y - target.position.y) <= profile.attackRange;
    });
    if (value.type !== 'evidence') return candidates.find(x => cardinalDistance(x.cell, target.cell) === profile.meleeCells);
    return candidates.filter(x => cardinalDistance(x.cell, target.cell) < cardinalDistance(ownCell(), target.cell))
      .sort((a, b) => cardinalDistance(a.cell, target.cell) - cardinalDistance(b.cell, target.cell) || a.route.length - b.route.length)[0];
  };
  const context = { id, actor, grid, profile, spawnCell, reaction, navigation, choose, random, getPatrolPeers,
    setPatrolDestination(cell) { patrolDestination = cell ? { ...cell } : null; },
    resolveTarget, attackEligible, bindingValid, selectDestination,
    onAttackCommitted(value) { if (value.type === 'sheep') suppressedSheep = value.id; } };
  const cost = action => profile.costs[action] ?? 1;
  function actionsFor(next) {
    const value = next.binding;
    const create = action => actionLibrary[action](value, { cost: cost(action) });
    if (next.activity === 'wait') return [actionLibrary.wait({ duration: next.duration, reason: next.name === 'retry' ? 'waiting' : 'idle', cost: cost('wait') })];
    if (next.activity === 'patrol') return [actionLibrary.patrol({ duration: next.duration, cost: cost('patrol') })];
    if (next.activity === 'face') return [create('face')];
    if (next.activity === 'search') return [create('move-to'), actionLibrary.search({ cost: cost('search') })];
    if (next.activity === 'escape' || next.activity === 'flee' || next.activity === 'seek-gold') return [create('move-to')].map(x => ({ ...x, effects: { done: true } }));
    return [create('move-to'), create(next.activity)].filter(x => profile.actions.includes(x.id));
  }
  function atPosition(next) {
    if (['wait', 'patrol', 'face'].includes(next.activity)) return true;
    if (next.activity === 'search') return evidence && cardinalDistance(ownCell(), evidence) <= 1;
    if (next.activity === 'escape' || next.activity === 'flee') return false;
    if (next.activity === 'seek-gold') {
      const target = resolveTarget(next.binding);
      return Boolean(target?.cell && cellKey(ownCell()) === cellKey(target.cell));
    }
    return attackEligible(resolveTarget(next.binding), next.binding.rule);
  }
  function install(next, budget = 256, deferred = false) {
    if (disposed || !isAlive() || goalKey !== next.key) return { expanded: 0 };
    if (actor.isMovementLocked?.() || dirty || (next.binding && !bindingValid(next.binding))) { goalKey = null; return { expanded: 0 }; }
    const result = plan({ atPosition: Boolean(atPosition(next)), done: false }, { done: true }, actionsFor(next), { maxExpansions: budget });
    expanded = result.expanded;
    if (result.status === 'found') {
      if (deferred) readyPlan = { key: next.key, steps: result.steps };
      else { lastPlan = result.steps.map(x => x.id); executor.start(result.steps, context); }
    }
    else { lastReason = result.status; failureKey = next.key; failureRemaining = profile.retrySeconds; goalKey = null; }
    return result;
  }
  function start(next, immediate = false) {
    executor.cancel('goal-change'); navigation.cancel(); scheduler?.cancel(id); readyPlan = null; lastPlan = [];
    goal = next; goalKey = next.key; binding = next.binding ?? null;
    if (!['retry', 'recover'].includes(next.name)) lastReason = 'goal-change';
    if (immediate || !scheduler) { const result = install(next); scheduler?.recordImmediate(result.expanded ?? 0); }
    else scheduler.request(id, budget => install(next, budget, true));
  }
  function fleeGoal(player) {
    fleeSequence += 1;
    return {
      name: 'flee player', key: `flee:${player.id}:${fleeSequence}`, activity: 'flee', immediate: true,
      binding: { type: 'flee', playerId: player.id, playerCell: { ...player.cell }, minCells: profile.fleeCells[0], maxCells: profile.fleeCells[1] },
    };
  }
  function select(sensed) {
    const player = sensed.player;
    const rawPlayer = getPlayer();
    const fleePlayer = profile.fleeFromPlayer && rawPlayer?.cell && canEnemyTargetPlayer(rawPlayer, reaction)
      && cardinalDistance(ownCell(), rawPlayer.cell) <= profile.fleeTriggerCells
      ? { ...rawPlayer, type: 'player', character: 'player', cell: { ...rawPlayer.cell }, position: { ...rawPlayer.position } }
      : null;
    const attack = !profile.targets.includes('player') ? null : profile.actions.includes('ranged') ? 'ranged' : profile.actions.includes('melee') ? 'melee' : null;
    if (fleePlayer) return fleeGoal(fleePlayer);
    if (attack && sensed.adjacent) return { name: 'attack player', key: `adjacent:${player.id}`, activity: attack, immediate: true,
      binding: { type: 'player', id: player.id, rule: 'adjacent' } };
    if (attack === 'ranged' && player?.detected) return { name: 'shoot player', key: `ranged:${player.id}:${cellKey(player.cell)}`, activity: attack,
      binding: { type: 'player', id: player.id, rule: 'ranged' }, immediate: attackEligible(player, 'ranged') };
    if (profile.targets.includes('sheep') && profile.actions.includes('melee')) {
      const nearby = (getWorld().characters ?? []).filter(x => x.character === 'sheep' && x.isAlive !== false && x.cell && cardinalDistance(ownCell(), x.cell) <= profile.meleeCells);
      if (!nearby.some(x => x.id === suppressedSheep)) suppressedSheep = null;
      if (goal?.name === 'attack sheep' && nearby.some(x => x.id === binding?.id) && executor.running) return goal;
      const sheep = nearby.find(x => x.id !== suppressedSheep);
      if (sheep) return { name: 'attack sheep', key: `sheep:${sheep.id}`, activity: 'melee', binding: { type: 'sheep', id: sheep.id, rule: 'adjacent' } };
    }
    if (sensed.reaction.state !== 'NONE') {
      const point = sensed.reaction.state === 'SUSPICIOUS' ? sensed.reaction.suspicionCell ?? evidence : evidence ?? sensed.reaction.lastKnownCell;
      if (point) return { name: sensed.reaction.state === 'SUSPICIOUS' ? 'observe' : 'investigate',
        key: `${sensed.reaction.state}:${cellKey(point)}`, activity: sensed.reaction.state === 'SUSPICIOUS' ? 'face' : 'search', binding: { type: 'evidence', cell: { ...point } } };
      return { name: 'observe', key: `observe:${sensed.reaction.state}`, activity: 'wait', duration: sensed.reaction.remainingSeconds };
    }
    if (normalStage === 'idle') {
      sampledDuration ??= duration(profile.idleSeconds);
      return { name: 'idle', key: 'idle', activity: 'wait', duration: sampledDuration };
    }
    if (profile.actions.includes('burn-bush')) {
      if (goal?.name === 'burn bush' && bindingValid(binding) && (executor.running || goalKey)) return goal;
      bushRoll ??= random();
      if (bushRoll < profile.bushChance) {
        bushScan ??= createReachabilitySearch(ownCell(), grid, isWalkable);
        const budget = scheduler ? scheduler.takeNavigation(256) : 256;
        const result = bushScan.step(budget);
        scheduler?.refundNavigation(budget - result.used);
        if (!result.done) return { name: 'find bush', key: 'find-bush', activity: 'wait', duration: 0.01 };
        let selected = null;
        for (const bush of getWorld().bushes ?? []) {
          if (bush.isAlive === false || !bush.cell) continue;
          const candidate = result.candidates.find(x => cardinalDistance(x.cell, bush.cell) === profile.meleeCells);
          if (candidate && (!selected || candidate.route.length < selected.length)) selected = { bush, length: candidate.route.length };
        }
        if (selected) return { name: 'burn bush', key: `bush:${selected.bush.id}`, activity: 'burn-bush', binding: { type: 'bush', id: selected.bush.id, rule: 'adjacent' } };
      }
    }
    if (profile.goldChance > 0) {
      goldRoll ??= random();
      if (goldRoll < profile.goldChance) {
        goldScan ??= createReachabilitySearch(ownCell(), grid, isWalkable);
        const budget = scheduler ? scheduler.takeNavigation(256) : 256;
        const result = goldScan.step(budget);
        scheduler?.refundNavigation(budget - result.used);
        if (!result.done) return { name: 'find gold', key: 'find-gold', activity: 'wait', duration: 0.01 };
        let selected = null;
        for (const gold of getWorld().gold ?? []) {
          if (gold.isAlive === false || !gold.cell) continue;
          const candidate = result.candidates.find(value => cellKey(value.cell) === cellKey(gold.cell));
          if (candidate && (!selected || candidate.route.length < selected.length)) selected = { gold, length: candidate.route.length };
        }
        if (selected) {
          return { name: 'seek gold', key: `gold:${selected.gold.id}:${cellKey(selected.gold.cell)}`, activity: 'seek-gold',
            binding: { type: 'gold', id: selected.gold.id } };
        }
      }
    }
    sampledDuration ??= duration(profile.patrolSeconds);
    return { name: 'patrol', key: 'patrol', activity: 'patrol', duration: sampledDuration };
  }
  function finish(status, previous) {
    if (status === 'succeeded') {
      if (previous === 'idle') { normalStage = 'activity'; sampledDuration = null; }
      if (['patrol', 'burn bush', 'attack sheep', 'seek gold', 'flee player'].includes(previous)) {
        normalStage = ['patrol', 'seek gold', 'flee player'].includes(previous) ? 'idle' : 'activity';
        sampledDuration = null; bushRoll = null; goldRoll = null; bushScan = null; goldScan = null;
      }
    } else if (previous !== 'recover') {
      lastReason = executor.snapshot().reason ?? status; failureKey = goalKey; failureRemaining = profile.retrySeconds; escapeAttempted = false;
    }
    goalKey = null;
  }
  const brain = {
    reaction,
    getPatrolDestination() { return !disposed && isAlive() && patrolDestination ? { ...patrolDestination } : null; },
    get mode() { return executor.snapshot().phase ?? goal?.name ?? 'idle'; },
    cancelNavigation() { executor.cancel('navigation-cancel'); navigation.cancel(); scheduler?.cancel(id); goalKey = null; },
    respondToPlayerAttack() {
      if (disposed || !isAlive() || actor.isDefending) return 'ignored';
      const player = getPlayer();
      if (!player?.cell || !canEnemyTargetPlayer(player, reaction)
        || cardinalDistance(ownCell(), player.cell) !== profile.meleeCells) return 'ignored';
      const roll = random();
      const fightEnd = profile.playerAttackFightChance;
      const takeHitEnd = fightEnd + profile.playerAttackTakeHitChance;
      const defenseEnd = takeHitEnd + profile.playerAttackDefenseChance;
      const fleeEnd = defenseEnd + profile.playerAttackFleeChance;
      if (roll < fightEnd) return 'fight';
      if (roll < takeHitEnd) return 'take-hit';
      if (roll < defenseEnd && typeof actor.beginDefense === 'function') {
        executor.cancel('player-attack-defense', true); navigation.cancel(); scheduler?.cancel(id);
        goal = null; goalKey = null; binding = null; stop();
        const direction = {
          x: Math.sign(player.position.x - actor.getPosition().x),
          y: Math.sign(player.position.y - actor.getPosition().y),
        };
        return actor.beginDefense(direction) ? 'defend' : 'ignored';
      }
      if (roll < fleeEnd) {
        if (actor.isMovementLocked?.()) return 'ignored';
        const next = fleeGoal(player); start(next, true);
        const outcome = executor.update(context, .001);
        if (outcome !== 'running') {
          finish(outcome, next.name);
          return 'take-hit';
        }
        return 'flee';
      }
      return 'fight';
    },
    cancel() { this.cancelNavigation(); },
    beginStealthIdle({ seconds } = {}) {
      if (disposed || !isAlive()) return false;
      const sampled = Number.isFinite(seconds) ? seconds : 2 + Math.max(0, Math.min(1, random()));
      stealthIdleRemaining = Math.max(2, Math.min(3, sampled));
      executor.cancel('stealth-entry', true); navigation.cancel(); scheduler?.cancel(id); cancelPlayerAttackPreparation(actor);
      readyPlan = null; goal = { name: 'stealth idle', key: 'stealth-idle', activity: 'wait' };
      goalKey = 'stealth-idle'; binding = null; stop();
      return true;
    },
    dispose() { if (disposed) return; disposed = true; readyPlan = null; scheduler?.cancel(id); executor.cancel('disposed', true); navigation.cancel(); cancelPlayerAttackPreparation(actor); reaction.reset(); },
    update(delta) {
      if (disposed || !isAlive()) { this.dispose(); return; }
      if (delta <= 0) return;
      if (stealthIdleRemaining > 0) {
        stealthIdleRemaining = Math.max(0, stealthIdleRemaining - delta);
        stop();
        if (stealthIdleRemaining > 1e-9) return;
        goal = null; goalKey = null; binding = null;
      }
      const raw = getPlayer();
      if (raw?.hidden && raw.isAlive !== false && raw.cell) reaction.trackHiddenPlayer(raw.cell);
      failureRemaining = Math.max(0, failureRemaining - delta);
      if (actor.isDefending) { executor.cancel('defense', true); scheduler?.cancel(id); goalKey = null; stop(); return; }
      if (executor.committed) {
        const previous = goal?.name, outcome = executor.update(context, delta);
        if (outcome === 'running') return;
        finish(outcome, previous);
      }
      if (actor.isMovementLocked?.()) { executor.cancel('displacement', true); navigation.cancel(); cancelPlayerAttackPreparation(actor); goalKey = null; stop(); return; }
      const sensed = sense();
      if (dirty) { executor.cancel('awareness-change'); navigation.cancel(); scheduler?.cancel(id); goalKey = null; dirty = false; }
      const next = select(sensed);
      if (entryStop && !next.immediate) { stop(); entryStop = false; return; }
      if (hasPlayerAttackPreparation(actor) && executor.running) {
        const outcome = executor.update(context, delta); if (outcome !== 'running') finish(outcome, goal?.name); return;
      }
      if (failureRemaining > 0 && next.key === failureKey && !next.immediate) {
        if (!escapeAttempted) {
          escapeAttempted = true;
          start({ name: 'recover', key: 'escape', activity: 'escape', binding: { type: 'escape' } }, true);
        } else if (goalKey !== 'escape' && goalKey !== 'retry') start({ name: 'retry', key: 'retry', activity: 'wait', duration: failureRemaining }, true);
      } else if (goalKey !== next.key) start(next, next.immediate);
      // Scheduling is pure. Start effects only after this enemy's current priority checks.
      if (readyPlan?.key === goalKey) {
        lastPlan = readyPlan.steps.map(step => step.id); executor.start(readyPlan.steps, context); readyPlan = null;
      }
      if (executor.running) { const previous = goal?.name; const outcome = executor.update(context, delta); if (outcome !== 'running') finish(outcome, previous); }
      if (profile.facingRange > 0 && sensed.player?.detected && !actor.isMovementLocked?.() && !hasPlayerAttackPreparation(actor)
        && Math.hypot(sensed.player.position.x - actor.getPosition().x, sensed.player.position.y - actor.getPosition().y) <= profile.facingRange) actor.faceDirection({ x: sensed.player.position.x - actor.getPosition().x, y: 0 });
    },
    getNavigationSnapshot() {
      const execution = executor.snapshot();
      const snapshot = { ...navigation.snapshot(), id, character: profile.id, state: reaction.getSnapshot().state,
        patrolDestination: this.getPatrolDestination(),
        recoveryState: failureRemaining > 0 && !executor.committed ? (goal?.name === 'recover' ? 'moving' : 'waiting') : navigation.snapshot().recoveryState,
        goal: goal?.name ?? 'idle', plan: execution.plan.length ? execution.plan : [...lastPlan],
        action: actor.isDefending ? 'defense' : execution.phase ?? (scheduler ? 'waiting' : 'idle'),
        phase: execution.phase, mode: this.mode, target: binding?.type === 'evidence' ? { ...binding.cell } : null,
        targetId: binding && binding.type !== 'evidence' ? binding.id : null,
        lastReason, planningExpanded: expanded, retryRemaining: failureRemaining, stealthIdleRemaining, disposed };
      const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
      return freeze(snapshot);
    },
  };
  return brain;
}
