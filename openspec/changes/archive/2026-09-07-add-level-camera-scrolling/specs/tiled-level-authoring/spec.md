## MODIFIED Requirements

### Requirement: Declared game origin cell
Every map SHALL contain exactly one editor-only origin marker tile whose cell is game tile `(0,0)`. Fixed levels SHALL render that coordinate in the lower-left cell of the initial viewport. Follow-player levels SHALL instead initialize at the bounded player-centered view. Authored cells left of or below the origin SHALL retain negative game coordinates in both modes.

#### Scenario: Map extends around the initial viewport
- **WHEN** authored content exists left of or below the origin marker tile
- **THEN** normalization preserves it with negative game X or Y coordinates without requiring an infinite Tiled map

#### Scenario: Origin marker is invalid
- **WHEN** the map contains zero, multiple, off-grid, or render-enabled origin marker tiles
- **THEN** validation reports an actionable error and does not infer an origin

#### Scenario: Scrolling initial view
- **WHEN** the player spawns away from the origin in a follow-player level
- **THEN** the bounded camera starts at the player while the origin and all cell labels retain their authored meaning
