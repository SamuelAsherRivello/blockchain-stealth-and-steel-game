import { waitAction } from './wait.js';
import { patrolAction } from './patrol.js';
import { moveToAction } from './move-to.js';
import { faceAction } from './face.js';
import { searchAction } from './search.js';
import { meleeAction } from './melee.js';
import { rangedAction } from './ranged.js';
import { burnBushAction } from './burn-bush.js';
export const actionLibrary = Object.freeze({ wait: waitAction, patrol: patrolAction, 'move-to': moveToAction,
  face: faceAction, search: searchAction, melee: meleeAction, ranged: rangedAction, 'burn-bush': burnBushAction });
