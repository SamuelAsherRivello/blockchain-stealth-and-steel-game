export const ACTION_IDS = Object.freeze(['wait', 'patrol', 'move-to', 'face', 'search', 'melee', 'ranged', 'burn-bush']);
export const COMMON_ACTIONS = Object.freeze(['wait', 'patrol', 'move-to', 'face', 'search']);
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export function createEnemyProfile(overrides = {}) {
  const profile = { id: 'enemy', actions: [...COMMON_ACTIONS], idleSeconds: [3, 5], patrolSeconds: [2, 5], patrolCells: [2, 5],
    patrolMode: 'timed', homeRadius: null, recoverySeconds: 0, retrySeconds: 3, attackRange: 64, facingRange: 0,
    meleeCells: 1, bushChance: 0, goldChance: 0, bushDamage: 50, attackVariant: 'attack-1', attackStyle: 'variant', targets: ['player'],
    fleeFromPlayer: false, fleeTriggerCells: 0, fleeCells: [2, 4],
    playerAttackFightChance: 0, playerAttackTakeHitChance: 0, playerAttackDefenseChance: 0, playerAttackFleeChance: 0,
    costs: {}, perception: {}, ...overrides };
  for (const key of ['idleSeconds', 'patrolSeconds', 'patrolCells']) {
    const range = profile[key];
    if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite) || range[0] < 0 || range[1] < range[0]) throw new RangeError(`Invalid ${key}`);
  }
  for (const key of ['recoverySeconds', 'retrySeconds', 'attackRange', 'facingRange', 'meleeCells', 'fleeTriggerCells', 'bushChance', 'goldChance', 'bushDamage', 'playerAttackFightChance', 'playerAttackTakeHitChance', 'playerAttackDefenseChance', 'playerAttackFleeChance']) {
    if (!Number.isFinite(profile[key]) || profile[key] < 0) throw new RangeError(`Invalid ${key}`);
  }
  if (profile.retrySeconds <= 0 || profile.bushChance > 1 || profile.goldChance > 1
    || profile.playerAttackFightChance > 1 || profile.playerAttackTakeHitChance > 1
    || profile.playerAttackDefenseChance > 1 || profile.playerAttackFleeChance > 1
    || profile.playerAttackFightChance + profile.playerAttackTakeHitChance + profile.playerAttackDefenseChance + profile.playerAttackFleeChance > 1
    || !['timed', 'route'].includes(profile.patrolMode)
    || (profile.homeRadius !== null && (!Number.isFinite(profile.homeRadius) || profile.homeRadius < 0))) throw new RangeError('Invalid profile configuration');
  if (!Array.isArray(profile.actions) || profile.actions.some(id => !ACTION_IDS.includes(id))) throw new TypeError('Unknown action');
  if (!Array.isArray(profile.targets) || profile.targets.some(target => !['player', 'sheep'].includes(target))) throw new TypeError('Unknown target policy');
  if (typeof profile.id !== 'string' || !profile.id || !['variant', 'direction'].includes(profile.attackStyle)
    || !profile.patrolCells.every(Number.isInteger) || !Number.isInteger(profile.meleeCells)
    || !Number.isInteger(profile.fleeTriggerCells)
    || !Array.isArray(profile.fleeCells) || profile.fleeCells.length !== 2 || !profile.fleeCells.every(Number.isInteger)
    || profile.fleeCells[0] < 1 || profile.fleeCells[1] < profile.fleeCells[0]
    || typeof profile.fleeFromPlayer !== 'boolean') throw new TypeError('Invalid profile identity, attack style or cell units');
  if (Object.entries(profile.costs).some(([id, cost]) => !ACTION_IDS.includes(id) || !Number.isFinite(cost) || cost < 0)) throw new RangeError('Invalid action cost');
  return freeze(structuredClone(profile));
}
export function validateCapabilities(profile, actor) {
  const requirements = { wait: 'setMovementIntent', patrol: 'setMovementIntent', 'move-to': 'setMovementIntent', face: 'faceDirection', search: 'faceDirection', melee: 'attack', ranged: 'shootAt', 'burn-bush': 'attack' };
  for (const id of profile.actions) if (typeof actor[requirements[id]] !== 'function') throw new TypeError(`${profile.id}: unsupported capability ${id}`);
  for (const method of ['getPosition', 'getGridPosition']) if (typeof actor[method] !== 'function') throw new TypeError(`${profile.id}: unsupported capability ${method}`);
}
