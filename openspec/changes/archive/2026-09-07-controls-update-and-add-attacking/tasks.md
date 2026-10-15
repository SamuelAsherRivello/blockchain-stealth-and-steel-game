## 1. Focused behavior coverage

- [x] 1.1 C067-T001 Add and run failing player/controller tests for empty-slot and alternate-slot knife attacks, inactive C with a held item, missing Item DOM lifecycle, V repeat suppression, accessible Attack activation, and simultaneous joystick input; record the expected pre-implementation failures.
- [x] 1.2 C067-T002 Add and run failing melee tests for a single 200 ms impact, coarse updates, collider overlap regardless of facing, no extra terrain gate, no walking/contact damage, moving targets, multiple enemies, excluded targets, all five enemy types, and four isolated 25-damage hits; record expected failures.

## 2. Controller and animation

- [x] 2.1 C067-T003 Temporarily remove Item markup and C activation, update control hints, and make the controller tolerate absent Item registration/reset/disposal; verify controller tests pass and Attack occupies the lower-right without a blank slot.
- [x] 2.2 C067-T004 Replace the player's obsolete shooting path with a fixed knife swing using the existing catalog, 25 damage, preserved horizontal animation facing, and exactly one midpoint event; verify state/catalog tests and empty/different-loadout cases pass without spawning an arrow.
- [x] 2.3 C067-T005 Preserve locomotion during attacks and prevent preview-timer expiry, key repeat, or repeated pointer activation from interrupting or duplicating swings; verify animation completion restores current locomotion and focused regression tests pass.

## 3. Runtime combat integration

- [x] 3.1 C067-T006 Connect player impacts to enemy-only damage resolution using live damage-collider overlap through existing combat state, removing player-to-enemy walking/contact damage; verify each enemy loses exactly 25 per successful swing and existing flash, supported knockback, and death lifecycle run.
- [x] 3.2 C067-T007 Freeze swings during pause and cancel pending impacts on death, level transitions, and teardown; verify lifecycle tests cover pause/resume, coarse end crossings, and death before impact and prevention of stale hits after revival.

## 4. Integration verification

- [x] 4.1 C067-T008 Run the relevant player, controller, combat, perception, and goal tests plus the existing test suite and npm run build; verify failures are resolved or clearly identified as pre-existing, preserving unrelated local changes and enemy arrows and enemy-to-sheep contact damage.
- [x] 4.2 C067-T009 Verify the real running game and a deterministic combat fixture in a browser: Attack/V visibly plays the full knife swing, hits overlapping colliders regardless of direction, misses non-overlapping targets, defeats each isolated 100-HP enemy in four hits, and never launches a player arrow; capture runtime evidence and the live URL.
- [x] 4.3 C067-T010 Verify desktop and narrow portrait touch layouts, joystick-plus-Attack, keyboard focus/activation, C with a held item, pause/resume, and death/level transition cancellation; record results and screenshots showing Item absent and preserved Attack styling.
- [x] 4.4 C067-T011 Run strict OpenSpec validation, review the implementation against all six delta specs, and record completion evidence; flag superseded Item/C wording in older active UI changes for reconciliation before later sync/archive.
