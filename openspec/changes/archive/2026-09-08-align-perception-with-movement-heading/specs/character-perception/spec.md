## MODIFIED Requirements

### Requirement: Visual Perception is a blocked cardinal line
Visual Perception SHALL begin at the detecting enemy's current grid location and extend four grid spaces in its current cardinal movement heading by default. When any enemy is walking left, up, right, or down, the first Visual Perception cell SHALL be respectively left, up, right, or down from the enemy. A terrain tile containing any unwalkable portion, bush, or living enemy in the player's exact visual cell SHALL negate detection of that one spot. A terrain tile containing any unwalkable portion, bush, or living enemy in an earlier cell between detector and player SHALL block detection in that cell and every cell beyond it. A player SHALL NOT be visually detected when sharing a blocking cell with the blocker.

#### Scenario: Player enters a visible cell
- **WHEN** the living player occupies an unobstructed cell on the detector's Visual Perception line
- **THEN** the system reports a visual detection at that player grid spot

#### Scenario: Terrain blocks visual detection
- **WHEN** an unwalkable tile lies between the detector and player on the Visual Perception line
- **THEN** the player is not visually detected beyond the blocking tile

#### Scenario: Terrain negates the target visual spot
- **WHEN** the player's exact Visual Perception cell is unwalkable
- **THEN** the player is not visually detected in that one spot

#### Scenario: Bush blocks the visual line
- **WHEN** a bush occupies a cell on the detector's Visual Perception line before the player
- **THEN** the player is not visually detected in that cell or any later cell on the same line

#### Scenario: Enemy blocks the visual line
- **WHEN** an enemy occupies a cell on the detector's Visual Perception line before the player
- **THEN** the player is not visually detected in that cell or any later cell on the same line

#### Scenario: Blocker negates its own visual spot
- **WHEN** a bush or living enemy occupies the player's exact Visual Perception cell
- **THEN** the player is not visually detected in that one spot

#### Scenario: Detector inside a bush retains visual perception
- **WHEN** the detector and a bush occupy the same cell and the player occupies a clear cell in the detector's facing direction
- **THEN** the bush does not block the detector's own visual ray and the player is visually detected normally

#### Scenario: Walking left controls visual perception
- **WHEN** the detector is walking left
- **THEN** its Visual Perception line extends left from its current grid cell

#### Scenario: Walking up controls visual perception
- **WHEN** the detector is walking up
- **THEN** its Visual Perception line extends up from its current grid cell

#### Scenario: Walking right controls visual perception
- **WHEN** the detector is walking right
- **THEN** its Visual Perception line extends right from its current grid cell

#### Scenario: Walking down controls visual perception
- **WHEN** the detector is walking down
- **THEN** its Visual Perception line extends down from its current grid cell

#### Scenario: Any unwalkable portion blocks the whole visual cell
- **WHEN** a terrain tile on the forward visual line contains any authored movement-blocking portion, including a full rectangle, partial triangle, or thin edge collider
- **THEN** the entire tile cell and all later cells on that line are excluded from visual detection, even if the tile center remains walkable

#### Scenario: Collider-free terrain preserves sight
- **WHEN** terrain along the visual line has no movement-blocking geometry, cliff or raised-side classification, explicit sight-blocking property, or other visual blockers
- **THEN** visual detection follows the existing heading, range, and strength rules


#### Scenario: Solid terrain and explicit sight blockers
- **WHEN** the visual line reaches a cliff face, rock wall, raised terrain side or slope, or a tile explicitly marked blocksVision, including one without movement colliders
- **THEN** that cell and every later cell are excluded from visual detection and perception shadows consistently across terrain palette variants

#### Scenario: Flat terrain remains transparent
- **WHEN** an ordinary flat grass or platform-top tile has no collider or explicit sight-blocking property
- **THEN** it does not obstruct sight
