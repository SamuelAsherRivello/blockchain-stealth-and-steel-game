import { createEnemyProfile, COMMON_ACTIONS } from '../../../ai/enemy-profile.js';
export const archerProfile = createEnemyProfile({ id: 'archer', actions: [...COMMON_ACTIONS, 'ranged'], attackRange: 4 * 64, facingRange: 5 * 64, recoverySeconds: 0.75 });
