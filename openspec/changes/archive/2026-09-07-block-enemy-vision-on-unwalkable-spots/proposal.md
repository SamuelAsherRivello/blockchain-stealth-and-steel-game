## Why

Enemy sight currently ignores terrain in the live game because centralized perception receives no terrain walkability predicate. Tiles containing an unwalkable portion must block the enemy's forward sight, just as bushes do, with matching visible perception shadows.

## What Changes

- Treat a terrain tile containing any authored movement-blocking collider as a blocked visual cell, including partial triangles and thin edge colliders.
- Also block cliff faces, rock walls, raised terrain sides and slopes across terrain palettes, even without colliders; support an additive `blocksVision` tile property for further blockers.
- Connect the same terrain-cell classification to live visual detection and perception-shadow rendering.
- Preserve cardinal heading, range, strength, bush/enemy blockers, audio rules, and existing alert-memory behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `character-perception`: Clarify that any unwalkable portion of a terrain tile blocks its entire visual cell and all cells beyond it in the running game.
- `runtime-enemy-vision-shadows`: Require the same terrain classification as detection, including partial collider tiles.

## Impact

Affected areas are `stealth-steel/src/runtime/main.js`, shared terrain/perception cell classification, and perception/shadow regression tests. Existing terrain records already expose `gameCell` and `blocked`; tile sight metadata may be added without changing movement physics or dependencies.

