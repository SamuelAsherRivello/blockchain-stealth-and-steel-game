# player-loss-flow Specification

## Purpose

Finish the player's defeat animation before offering a free restart or verified paid continuation, preserving the current world when the player resumes. This carries forward C058 (fix-player-damage-and-loss-prompt) and the coordinated BIS `openspec/changes/archive/2026-09-07-add-b2-game-pay-to-continue/` integration.

## Requirements

### Requirement: Complete defeat before displaying loss choices
Lethal damage SHALL disable player input, further damage and victory, and SHALL complete the existing 250 ms death animation and lethal knockback before entering LEVEL_LOST. The defeated player SHALL remain hidden and non-colliding in its owning spawner until paid continuation replaces it without resetting inventory or position. The loss pause SHALL freeze gameplay while rendering the scene.

#### Scenario: Defeat finishes
- **WHEN** the death animation completes
- **THEN** the game shows one You Lost menu with Try again!, retaining the dead player record and the frozen world

#### Scenario: Death animation is still playing
- **WHEN** lethal damage has occurred and fewer than 250 ms of active animation time have elapsed
- **THEN** the player death animation remains visible, input is disabled, and no loss prompt is shown

#### Scenario: Death occurs on the goal
- **WHEN** lethal damage and goal overlap occur in the same gameplay update
- **THEN** defeat takes precedence and the win prompt is not displayed

#### Scenario: Manual pause during death
- **WHEN** gameplay is manually paused during the death animation and later resumed
- **THEN** death progress pauses and resumes without displaying the loss prompt early

### Requirement: Ordered BIS-priced continuation and free restart
The loss menu SHALL show a lightning icon to the left of `Pay 1000 Sats To Continue` as the first action and `Restart Game` below. The amount SHALL come from BIS's public price API. Pay SHALL remain visible, greyed out and disabled without a logged-in account or available service. Pay and Restart SHALL both stay disabled from an explicit Pay click until confirmed success or definitive failure; pending reads SHALL not unlock them. Failure SHALL expose an accessible message and restore choices. Shared menu text SHALL shrink to fit the available button width including icon space.

#### Scenario: Logged-out death
- **WHEN** the player has no active BIS account
- **THEN** Pay is greyed out and Restart Game is available without paying

#### Scenario: Backdrop click
- **WHEN** the player clicks outside the loss panel
- **THEN** the loss prompt remains available and gameplay stays paused

### Requirement: Apply one successful payment to the matching defeat
Only a confirmed callback for the current defeat SHALL replace the dead player with a fresh full-health actor using the same reusable `spawnPlayer(row, column, options)` path used at level start. Replacement SHALL dispose old rendering, animation, input, overhead and perception registrations and preserve the exact current position and loadout. The game SHALL immediately remove all enemy records in the player's logical cell and its eight neighbors and transition LEVEL_LOST to LEVEL_PLAYING. Enemy cleanup SHALL precede resume and include AI/perception/render removal. Other entities, projectiles, counters and future spawning SHALL retain their state. Only the loss pause SHALL be released. BIS SHALL show `User paid 1000 sats to continue` through its mounted toast system.

#### Scenario: Paid revival with another pause
- **WHEN** the matching payment succeeds while Settings independently owns a pause
- **THEN** the player is revived, enemies in the centered 3x3 cells are removed, and the Settings pause continues to keep gameplay frozen

### Requirement: Abandoned runs receive no payment consequence
Restart Game SHALL begin a free new run in the current document without browser navigation or refresh. The new run SHALL start the first map of the saved Map Order, reset all run-owned world and player state, and use a new game-session identity without clearing persistent settings or account data. Closing or refreshing SHALL not restore the defeated world's state. The game SHALL dispose each loss controller on teardown and ignore callbacks from old defeats or sessions. Normal BIS payment-journal recovery SHALL remain separate from gameplay.

#### Scenario: Restart from loss without browser navigation
- **WHEN** the enabled Restart Game action is activated from the loss menu
- **THEN** the defeated world is discarded and a fresh run reaches its normal initial start state without changing the document URL or creating a browser navigation
- **AND** the fresh run uses the first saved Map Order map while preserving persistent settings and account data

#### Scenario: Late payment after restart
- **WHEN** an old payment completes after Restart Game has created a new session
- **THEN** it cannot revive the player, remove enemies, or otherwise modify the new session

#### Scenario: Late payment after close
- **WHEN** an old payment completes after its game session ends
- **THEN** it cannot revive the player or remove enemies in a new session
