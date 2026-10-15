## Why

**C080 — mirror-level-one-into-level-two-and-three**

Levels 2 and 3 currently do not provide the same complete playable authored experience as the strong Level 1 design. Reusing Level 1 as the source design will make all three level selections playable while giving Level 2 a distinct left-to-right mirrored layout.

## What Changes

- Replace the complete contents of `Level03.tmj` with an exact Level 1 map design copy, including all map metadata, dimensions, tilesets, visual layers, gameplay objects, and authored assets.
- Replace the complete contents of `Level02.tmj` with a left-to-right horizontal mirror of the complete Level 1 map design, including terrain placement and authored object placement. Encode tile mirroring with Tiled horizontal-flip flags so the runtime renders the artwork as a true mirror.
- Preserve Level 1 unchanged as the source map.
- Extend the Tiled loader and terrain renderer to preserve and apply horizontal tile flips, including mirrored collision geometry.
- Keep the Level 2 player start in the mirrored playable grid at normalized cell `(5,3)`, and verify that this cell is walkable. This is a deliberate gameplay constraint on the authored spawner rather than a blind full-map pixel reflection.
- Update focused map-level tests and archive the completed OpenSpec change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tiled-level-authoring`: Require the shipped Level 2 and Level 3 TMJ maps to provide complete Level 1-derived playable designs, with Level 2 horizontally mirrored and Level 3 identical.

## Impact

- Affects the two authored TMJ runtime level files, the Tiled normalization/rendering path, and focused level tests.
- Preserves the existing Tiled map format and gameplay object loading while adding explicit horizontal-flip handling for mirrored terrain and collision shapes.
- Requires map-level validation, focused comparison checks, a walkability assertion for the Level 2 start, and browser QA.
