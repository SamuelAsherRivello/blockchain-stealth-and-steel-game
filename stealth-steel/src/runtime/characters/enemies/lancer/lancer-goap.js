import { createEnemyProfile, COMMON_ACTIONS } from '../../../ai/enemy-profile.js';
export const lancerProfile = createEnemyProfile({ id: 'lancer', actions: [...COMMON_ACTIONS, 'melee'] });
