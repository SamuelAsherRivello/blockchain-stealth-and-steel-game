## 1. Shared enemy decision contracts

- [x] 1.1 C072-T001 Extend the enemy profile schema and Goblin, Warrior, and Monk profiles with deterministic 35%, 60/20/10/10, 45%, and two-to-four-cell settings; verify profile validation and focused `enemy-brain` tests cover every configured boundary.
- [x] 1.2 C072-T002 Add a bounded tactical-flee route selector that accepts only safe reachable two-to-four-cardinal-cell destinations and returns explicit failure rather than a shorter recovery path; verify focused AI tests cover valid routes, blocked routes, and no valid destination.
- [x] 1.3 C072-T003 Update the shared GOAP brain so Monk has no voluntary attack action, proximity flee preempts gold/patrol, gold selection uses nearest reachable living gold after idle, and Warrior response replacement retains one action owner; verify focused AI tests cover priority, stable tie selection, and no competing movement request.

## 2. Archetype behavior integration

- [x] 2.1 C072-T004 Wire each eligible Warrior player-knife impact through one deterministic 60/20/10/10 response before melee damage, with guard fully blocking only its triggering hit and a failed tactical flee returning to normal fight-or-take-hit behavior; verify `player-melee` and Warrior behavior tests cover all four buckets and consecutive impacts.
- [x] 2.2 C072-T005 Supply the shared brain with current gold snapshots and route validity so Monks pursue but never collect gold, and retain the existing player-only pickup transaction; verify a Monk can reach/cross gold without changing its living state or the player counter.
- [x] 2.3 C072-T006 Raise the Goblin's post-combat patrol bush-burn roll to 35% without changing combat-target priority; verify deterministic tests at 0.349... and 0.35 plus an eligible-combat case.
- [x] 2.4 C072-T007 Preserve individual perception, bush concealment, alert expiry, collision, and ordinary recovery behavior across new Warrior and Monk paths; verify focused perception/recovery regressions remain green.

## 3. End-to-end verification

- [x] 3.1 C072-T008 Run `npm.cmd test` and `npm.cmd run build`; verify both commands complete successfully with the new focused tests included.
- [x] 3.2 C072-T009 Run the game in a browser and verify observable play: adjacent Warrior knife hits show each response without an invalid short flee, a Monk never attacks and flees within two cells while sometimes walking to gold without collecting it, and Goblins more often choose post-combat bush burning; verified the live game at http://127.0.0.1:5178/. Manual smoke coverage confirmed startup, map rendering, enemies, gold, and attack input; deterministic tests cover the random Warrior/Goblin branches and Monk routing because the live map has no safe control for forcing each branch.
