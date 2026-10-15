## ADDED Requirements

### Requirement: Level 1-derived playable map variants
The authored level set SHALL provide Level 2 and Level 3 as complete Level 1-derived TMJ maps. Level 3 SHALL contain the same map design and assets as Level 1, while Level 2 SHALL contain the same map design and assets with authored terrain and object placements reflected left-to-right across the map's vertical centerline. Level 2 terrain tiles SHALL carry Tiled horizontal-flip state through normalization and rendering, and its player start SHALL resolve to normalized cell `(5,3)` on a walkable movement cell.

#### Scenario: Level 3 is identical to Level 1
- **WHEN** the game loads `Level03.tmj`
- **THEN** it exposes the same map dimensions, metadata, tilesets, visual layers, tile placements, gameplay layers, objects, spawners, goals, pickups, and authored assets as `Level01.tmj`

#### Scenario: Level 2 is a normal horizontally mirrored Level 1
- **WHEN** the game loads `Level02.tmj`
- **THEN** it exposes the complete Level 1 design with each terrain and object placement mirrored left-to-right, the same Y placement and asset identity, applies horizontal flips to terrain artwork and collision geometry, and starts the player at walkable normalized cell `(5,3)`

#### Scenario: All three level files remain directly loadable
- **WHEN** the level catalog loads `Level01.tmj`, `Level02.tmj`, and `Level03.tmj`
- **THEN** all three maps satisfy the existing finite orthogonal Tiled contract and are playable through the existing level progression flow
