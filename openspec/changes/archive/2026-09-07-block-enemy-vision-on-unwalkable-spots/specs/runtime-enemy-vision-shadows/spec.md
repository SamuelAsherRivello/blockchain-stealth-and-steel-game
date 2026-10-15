## MODIFIED Requirements

### Requirement: Render unobstructed enemy visual perception shadows

The game SHALL render the `tile-shadow.png` asset centered in each grid cell that lies within a living enemy's unobstructed cardinal visual-perception path.

#### Scenario: Enemy has clear sight
- **WHEN** a living enemy has a valid heading and visual range and its visual path contains no blocker
- **THEN** a shadow is rendered in every cell of that path during normal gameplay

#### Scenario: Terrain blocks sight
- **WHEN** a terrain blocker occurs in an enemy's visual path
- **THEN** the blocker cell and every cell beyond it receive no perception shadow

#### Scenario: Living character blocks sight
- **WHEN** a living blocking character occurs in an enemy's visual path
- **THEN** the blocker cell and every cell beyond it receive no perception shadow

#### Scenario: Multiple enemies perceive independently
- **WHEN** multiple living enemies have visual ranges that overlap or differ
- **THEN** each enemy's unobstructed cells are rendered independently using that enemy's current position and heading

#### Scenario: Partial terrain blockers agree with detection
- **WHEN** a tile containing any authored movement-blocking portion lies in the enemy visual path, including a triangle or thin edge collider
- **THEN** the blocker cell and all later cells receive no perception shadow, using the same terrain-cell blocking rule as visual detection


#### Scenario: Solid terrain and explicit sight blockers
- **WHEN** the visual line reaches a cliff face, rock wall, raised terrain side or slope, or a tile explicitly marked blocksVision, including one without movement colliders
- **THEN** that cell and every later cell are excluded from visual detection and perception shadows consistently across terrain palette variants

#### Scenario: Flat terrain remains transparent
- **WHEN** an ordinary flat grass or platform-top tile has no collider or explicit sight-blocking property
- **THEN** it does not obstruct sight

#### Scenario: Purple visual diagnostics match blocked sight
- **WHEN** the enemy perception debug overlay is enabled and a visual blocker occurs on the forward line
- **THEN** the purple visual cells stop before the blocker using the same terrain and living-blocker rules as perception shadows, while audio geometry remains governed by its own rules
