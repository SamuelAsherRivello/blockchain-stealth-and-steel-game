import { createEnemyProfile, COMMON_ACTIONS } from '../../../ai/enemy-profile.js';
export const goblinProfile = createEnemyProfile({ id: 'goblin', actions: [...COMMON_ACTIONS, 'melee', 'burn-bush'], patrolMode: 'route', homeRadius: 4, recoverySeconds: 1.25, bushChance: 0.35, attackStyle: 'direction', targets: ['player', 'sheep'] });
