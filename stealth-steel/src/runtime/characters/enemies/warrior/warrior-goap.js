import { createEnemyProfile, COMMON_ACTIONS } from '../../../ai/enemy-profile.js';
export const warriorProfile = createEnemyProfile({
  id: 'warrior', actions: [...COMMON_ACTIONS, 'melee'],
  playerAttackFightChance: 0.6, playerAttackTakeHitChance: 0.2,
  playerAttackDefenseChance: 0.1, playerAttackFleeChance: 0.1, fleeCells: [2, 4],
});
