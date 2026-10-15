import { createEnemyProfile, COMMON_ACTIONS } from '../../../ai/enemy-profile.js';
export const monkProfile = createEnemyProfile({
  id: 'monk', actions: [...COMMON_ACTIONS], targets: [],
  fleeFromPlayer: true, fleeTriggerCells: 2, fleeCells: [2, 4], goldChance: 0.45,
});
