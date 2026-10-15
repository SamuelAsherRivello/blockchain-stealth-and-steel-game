## Context

The repository loads the saved TMJ files directly through the existing Tiled normalization and level-progression flow. Level 1 is a finite 13-by-18 map with the complete authored terrain and gameplay object set; the current Level 2 and Level 3 files have different layouts and dimensions. See `proposal.md` and the `tiled-level-authoring` delta for the required result.

## Goals / Non-Goals

**Goals:**

- Use `Level01.tmj` as the sole source for both replacement maps.
- Make `Level03.tmj` an exact content copy of Level 1.
- Make `Level02.tmj` a complete horizontal placement mirror of Level 1 while retaining the same assets and rendering the terrain artwork as a true horizontal mirror.
- Keep the Level 2 player start in the mirrored playable grid at normalized cell `(5,3)` and validate that its movement collider is walkable.
- Keep the map files valid for the existing loader and level progression.

**Non-Goals:**

- Do not change camera behavior, alternate coordinate systems, level progression, tilesets, or Level 1.
- Do not add level-specific runtime branching; horizontal flipping is a general Tiled normalization/rendering capability.

## Decisions

- **Level 3 uses the complete Level 1 TMJ content.** Copy the full source map structure, metadata, dimensions, tileset references, tile layers, object layers, spawners, goals, pickups, and props so Level 3 is identical at the authored-map level.
- **Level 2 mirrors placements in authored map space.** Reverse each tile row horizontally and set Tiled's horizontal-flip flag on every nonzero tile, preserving the underlying tile identity and layer order. Reflect positioned object geometry across the map's vertical pixel centerline: tile/rectangle object X becomes `mapPixelWidth - x - width`, point-object X becomes `mapPixelWidth - x`, and object-local polygon/polyline X coordinates are reflected within their containing geometry. Preserve Y coordinates, object types, properties, and assets. The Player Spawner is placed at the mirrored playable-grid cell `(5,3)` because the runtime's 9-column playable grid is narrower than the full authored map and the unconstrained pixel reflection landed on blocked terrain.
- **Horizontal tile flips are first-class normalized data.** The Tiled loader exposes the horizontal-flip bit separately from the tile ID, the terrain renderer passes it to Babylon sprite creation, and tileset collision shapes mirror their local X geometry when the bit is set.
- **Both maps inherit Level 1's dimensions and structure.** This avoids retaining incompatible Level 2/3 layer shells or object schemas and lets the existing loader treat all three files as the same authored level design.
- **Validation compares normalized authored content.** Verify Level 3 matches Level 1, verify Level 2's X-reflected placements and unchanged Y/assets against Level 1, verify the horizontal-flip bits and walkable player start, and run focused map/level tests plus browser QA.

## Risks / Trade-offs

- [Risk] Tiled tile layers and object layers use different coordinate representations → Mitigation: validate tile rows, object positions, object geometry, layer order, and normalized gameplay records separately.
- [Risk] Existing tests encode the old Level 2/3 dimensions or placements → Mitigation: update focused mirror tests to assert the new contract and record unrelated stale assertions without broadening the change.
- [Risk] A mirrored object may retain an orientation-sensitive property or asset → Mitigation: preserve asset identity and normal rendering as explicitly requested; only authored placement geometry is mirrored.

## Migration Plan

1. Read `Level01.tmj` as the immutable source.
2. Generate the full Level 3 replacement from the source content.
3. Generate the full Level 2 replacement by applying the authored horizontal placement transform.
4. Validate both replacement files with the existing Tiled/level normalization checks, compare normalized results, and verify the Level 2 start cell is walkable.
5. Run focused tests, build the project, and inspect the actual Level 2 in a browser.
