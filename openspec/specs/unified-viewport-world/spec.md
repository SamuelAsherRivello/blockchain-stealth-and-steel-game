# unified-viewport-world Specification

## Purpose
Keeps the complete logical game world aligned to one fixed grid coordinate space while the viewport scales to different window sizes.

## Requirements

### Requirement: Shared logical viewport
All world-rendered terrain, actors, pickups, projectiles, effects, and diagnostics SHALL use the same fixed logical viewport dimensions and SHALL be transformed to screen space by one shared viewport scale and level camera. Gameplay bounds SHALL be independent of the viewport on scrolling levels. World-anchored DOM markers SHALL follow this projection, HUD controls SHALL remain screen-anchored, and pointer selection SHALL use the inverse projection.

#### Scenario: Window is resized
- **WHEN** the game viewport changes size
- **THEN** every world element preserves its relative logical position and scales uniformly with the rest of the world

#### Scenario: Larger level scrolls
- **WHEN** the player moves beyond the original viewport
- **THEN** gameplay operates throughout the level interior, world art and diagnostics remain aligned with correct depth ordering, HUD stays stationary, and clicking selects the visible world cell

### Requirement: Grid-centered world placement
An object authored for grid cell `(x, y)` SHALL use the exact center `(x + 0.5, y + 0.5)` multiplied by the tile size as its logical world position.

#### Scenario: Gold pickup is authored in a grid cell
- **WHEN** the level loads the pickup
- **THEN** its sprite center and combat-collider center are both located at the exact center of that cell

### Requirement: Non-blocking pickup collision
A gold pickup SHALL expose a combat collider for player collection and SHALL expose no movement collider that could block movement.

#### Scenario: Player moves through a pickup
- **WHEN** the player enters the pickup's combat collider
- **THEN** the pickup is collected and player movement is not obstructed
