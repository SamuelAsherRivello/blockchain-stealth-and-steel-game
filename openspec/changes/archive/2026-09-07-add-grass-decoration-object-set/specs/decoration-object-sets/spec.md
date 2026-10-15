## Purpose

Provide reusable decoration object sets that automatically add visual detail to eligible level tiles with configurable placement rules, density, and offset.

## ADDED Requirements

### Requirement: Configurable decoration object set
Each decoration object set SHALL declare a unique name, a nonempty image list, spawn rule, spawn frequency from 0 through 1, nonnegative X/Y offsets in world pixels, nonnegative angle offset in degrees, positive base scale, and relative scale offset from 0 inclusive to 1 exclusive. Grass SHALL use the supplied `10.png` and `11.png`, rule `walkable`, frequency 0.1, X/Y offsets 20px each, angle offset 15 degrees, base scale 0.5, and scale offset 0.15. Invalid configuration SHALL produce an actionable error identifying the set and field.

#### Scenario: Tuned grass configuration
- **WHEN** the grass set is loaded
- **THEN** it exposes the two images and the configured 10% frequency, 20px displacement bounds, 15-degree rotation bound, half-size base, and 15% relative scale variation

#### Scenario: Invalid configuration
- **WHEN** a set has an empty image list, unsupported rule, out-of-range frequency, or invalid offset or scale
- **THEN** validation identifies the set and invalid parameter before placement

### Requirement: Global grass enable switch
The system SHALL expose `GrassDecorationsEnabled`, defaulting to false. While false, level initialization SHALL create no grass instances or grass texture loads. Enabling it SHALL restore the configured grass placement at the next level initialization.

#### Scenario: Disabled by default
- **WHEN** a level initializes with GrassDecorationsEnabled false
- **THEN** no grass is generated or rendered and other level content remains available

#### Scenario: Enabled
- **WHEN** GrassDecorationsEnabled is true when a level initializes
- **THEN** the configured grass placement rules apply

### Requirement: Empty walkable eligibility
Rule `walkable` SHALL select only walkable tiles inside the full level bounds that have nothing else placed on them at setup. Bushes, pickups, all spawners including player and enemy spawners, actor starts, goals, resources, existing decorations, and other placed objects SHALL exclude their occupied tiles even when non-blocking. Base ground artwork SHALL NOT itself count as an occupying object. Non-walkable terrain and absent ground SHALL be ineligible.

#### Scenario: Empty ground
- **WHEN** a tile is walkable and has no placed object or reserved start/spawn location
- **THEN** it is eligible for grass

#### Scenario: Occupied ground
- **WHEN** a walkable tile contains any placed object or reserved start/spawn location
- **THEN** it receives no grass, including when that object has no collision

#### Scenario: Full level coverage
- **WHEN** eligible tiles exist outside the initial camera view
- **THEN** they are considered along with eligible visible tiles

### Requirement: Spawn probability and image choice
When enabled, at spawn frequency 1 the system SHALL place exactly one decoration per eligible tile. At frequency 0 it SHALL place none. Intermediate frequencies SHALL give each eligible tile the configured independent probability of one placement. Each placement SHALL independently choose one image uniformly from its set and retain that choice for its lifetime.

#### Scenario: Full coverage
- **WHEN** grass placement runs while enabled with frequency 1
- **THEN** every eligible tile receives exactly one instance using either supplied image

#### Scenario: Tuned density
- **WHEN** an enabled set uses frequency 0 or an intermediate frequency
- **THEN** it produces no instances at frequency 0 or samples each eligible tile at the configured probability respectively

### Requirement: Centered visual placement
The decoration SHALL be anchored at its tile's world-space center plus independent random X/Y displacements within its configured bounds, with a random rotation within negative and positive angle offset about the bottom center of the PNG. Uniform scale SHALL be baseScale multiplied by one plus a random value within negative and positive scaleOffset. At baseScale 0.5 and scaleOffset 0.15, the final scale SHALL range from 0.425 through 0.575 of source dimensions. The scaled, unrotated PNG center SHALL start at the sampled position; rotation SHALL keep its bottom-center pivot fixed. Zero offset SHALL mean that tile center, not the world origin. Grass SHALL preserve source artwork and transparency and SHALL render above ground and below actors. It SHALL NOT obstruct movement, perception, projectiles, or pickup collection or act as a reactive bush.

#### Scenario: Zero offset
- **WHEN** grass is placed with zero X/Y and angle offsets
- **THEN** its sprite frame center aligns with the eligible tile center without random positional jitter

#### Scenario: Adjusted offset
- **WHEN** a set uses a nonzero offset
- **THEN** X and Y are sampled independently within their negative and positive offset bounds, rotation is sampled within its angle bounds, and tile eligibility is unchanged

#### Scenario: Scale and bottom-center rotation
- **WHEN** enabled grass is generated with the configured scale and angle offsets
- **THEN** each instance uses one uniform scale within 0.425..0.575 and rotation within -15..15 degrees around the PNG bottom center, retained for its lifetime


### Requirement: Setup-only lifecycle
Placement SHALL run once per level initialization after authored occupancy and initial spawn reservations are known. Image, position, scale, and rotation SHALL be sampled once per instance. Runtime movement, item collection, and object destruction SHALL NOT regenerate, reroll, or remove existing grass. Reinitializing a level SHALL rebuild its decorations without retaining duplicate instances from the previous initialization.

#### Scenario: Tile becomes empty during play
- **WHEN** a pickup is collected or an actor leaves its initially reserved tile
- **THEN** no new grass appears on that tile during the current level

#### Scenario: Restart
- **WHEN** the level is initialized again
- **THEN** placement is rebuilt from setup occupancy with at most one grass instance per eligible tile
