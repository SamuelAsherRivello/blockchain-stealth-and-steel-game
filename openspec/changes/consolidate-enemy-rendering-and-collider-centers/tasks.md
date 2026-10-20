# Tasks

## 1. Shared visual actor contract

- [x] 1.1 C095-T001 Extract the common enemy sprite/layer, animation visibility, transform, pivot, art-offset, visual-effect, and disposal lifecycle into the shared visual actor module while preserving its current public actor methods; verify the existing shared-actor and Monk character tests pass.
- [x] 1.2 C095-T002 Add explicit per-character visual definitions for frame size, display size, artwork pivot, art offset, and animation descriptors, retaining the currently tuned Monk/Archer/Goblin/Warrior/Lancer values; verify catalog and character-contract tests cover every definition.
- [x] 1.3 C095-T003 Add pivot-focused transform tests that confirm position, scale, and rotation preserve each configured artwork pivot and do not move the logical movement-collider center; verify the focused character test command passes.

## 2. Migrate enemy implementations without behavior changes

- [x] 2.1 C095-T004 Migrate Archer and Goblin rendering to the shared visual actor contract while keeping their existing shooting, directional attack, movement, knockback, and state-transition behavior; verify Archer/Goblin lifecycle, attack, and damage tests pass.
- [x] 2.2 C095-T005 Migrate Warrior and Lancer rendering to the shared visual actor contract while keeping their existing attack variants, defense rules, projectile interactions, movement, and knockback behavior; verify Warrior/Lancer state, defense, projectile, and damage tests pass.
- [x] 2.3 C095-T006 Reconcile Monk with the final shared visual contract and remove duplicated or obsolete rendering paths without changing healing, patrol, perception, or non-combat behavior; verify Monk behavior and enemy-roster tests pass.
- [x] 2.4 C095-T007 Route the existing combat death tween's scale, alpha, and rotation through the configured per-enemy artwork pivot, including revive/reset transforms; verify death rotation and revive tests cover all five enemy types and preserve existing durations and angles.

## 3. Collider center diagnostics

- [x] 3.1 C095-T008 Add pure diagnostic commands for the live geometric center of each active character's movement collider and a filled black-dot renderer; verify circle and rectangle center calculations and black-dot styling with unit tests.
- [x] 3.2 C095-T009 Draw one black live-center dot for every active player, enemy, and NPC when Physics Colliders diagnostics are enabled, while leaving collider colors/order and Coordinates grid markers unchanged; verify debug-visualization tests cover the visibility gate and all character records.

## 4. Integration verification

- [x] 4.1 C095-T010 Run the complete automated test suite and build/lint checks, then perform a managed browser smoke check with `?muteMusic=true&muteSFX=true` showing all five enemies under Physics Colliders diagnostics; verify no behavior, asset-loading, pivot, or cleanup regression remains.
