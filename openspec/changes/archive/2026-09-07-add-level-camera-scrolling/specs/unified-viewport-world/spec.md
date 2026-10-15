## MODIFIED Requirements

### Requirement: Shared logical viewport
All world-rendered terrain, actors, pickups, projectiles, effects, and diagnostics SHALL use the same fixed logical viewport dimensions and SHALL be transformed to screen space by one shared viewport scale and level camera. Gameplay bounds SHALL be independent of the viewport on scrolling levels. World-anchored DOM markers SHALL follow this projection, HUD controls SHALL remain screen-anchored, and pointer selection SHALL use the inverse projection.

#### Scenario: Window is resized
- **WHEN** the game viewport changes size
- **THEN** every world element preserves its relative logical position and scales uniformly with the rest of the world

#### Scenario: Larger level scrolls
- **WHEN** the player moves beyond the original viewport
- **THEN** gameplay operates throughout the level interior, world art and diagnostics remain aligned with correct depth ordering, HUD stays stationary, and clicking selects the visible world cell
