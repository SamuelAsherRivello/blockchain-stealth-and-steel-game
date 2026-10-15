## Purpose

Provide a complete player defeat sequence that visibly finishes the death animation before presenting a clear loss prompt and restart action.

## ADDED Requirements

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
