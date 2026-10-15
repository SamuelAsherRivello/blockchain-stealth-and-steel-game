## Purpose

Enable larger authored levels through a bounded, damped player-follow camera while preserving fixed-level presentation.

## ADDED Requirements

### Requirement: Per-level camera mode and interior bounds
Maps SHALL select fixed or follow-player mode, defaulting to fixed. Follow-player maps SHALL exclude the outermost tile on all four sides from camera visibility and SHALL reject interiors smaller than the 9-column by 16-row viewport before gameplay loads.

#### Scenario: Invalid scrolling map
- **WHEN** a follow-player map is narrower than 11 columns or shorter than 18 rows including its border
- **THEN** a clear invalid-level error is shown and gameplay does not load

#### Scenario: Fixed compatibility
- **WHEN** a map loads without camera properties
- **THEN** its framing, scale, and authored content remain unchanged

### Requirement: Damped dead-zone following
All follow-player levels SHALL use a centered dead zone three columns wide and four rows tall. Continuous player movement outside it SHALL cause independent horizontal and vertical exponential following with a 0.15-second time constant toward the nearest dead-zone edge, without overshoot or recentering. Remaining corrections below 0.1 logical pixel SHALL settle exactly.

#### Scenario: Player stops or reverses
- **WHEN** the player stops outside the dead zone
- **THEN** the camera eases to its edge; returning inside the dead zone stops correction on that axis

#### Scenario: Level boundary
- **WHEN** following would expose a border tile
- **THEN** the camera remains clamped inside the interior even if the player leaves the dead zone

### Requirement: Camera lifecycle
The camera SHALL initialize centered on the player spawn, clamped to interior bounds, without an opening pan. It SHALL freeze during pause or ended gameplay and reinitialize on restart. An axis with no travel room SHALL remain locked.

#### Scenario: Start beside a corner
- **WHEN** a scrolling level starts with its player near a corner
- **THEN** the first view contains the player and no outer border tiles

#### Scenario: Pause
- **WHEN** gameplay pauses while following
- **THEN** the camera does not continue easing
