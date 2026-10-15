## Context

See proposal.md for motivation. `character-perception.js` already checks `isWalkable` for target and intermediate cells, but `main.js` omits that callback, leaving its always-true default active. Shadows separately derive cells from collider `x/y`; polygon colliders expose `points` instead, so that mapping does not cover triangles reliably. The terrain loader already provides each tile's logical `gameCell` and `blocked` flag based on its authored colliders.

## Goals / Non-Goals

**Goals:** Give detection and shadows one terrain-cell predicate independent of actor size, using current level terrain records.

**Non-Goals:** Change collision shapes, navigation, heading, audio, alert timers, bush concealment, or add geometric ray casting. Existing remembered targets can persist after direct sight is lost.

## Decisions

1. Build a set of blocked logical cell keys from terrain records whose `blocked` flag or `blocksVision` flag is true. Any valid collision portion blocks the tile for vision; duplicate tiles in one cell combine by union. Use `gameCell` rather than collider origins to handle rectangles and polygons uniformly and avoid screen/world coordinate confusion. Reusing actor navigation walkability would introduce actor-radius and occupancy dependencies and can leave thin edge tiles visually open.
2. Supply the resulting inverse membership predicate to both `createCharacterPerception` and `createEnemyVisionShadowDrawCommands`. Keep existing dynamic bush/enemy blockers separate. Remove the shadow-only terrain-origin mapping when wiring this predicate so both consumers use identical terrain data.
3. Build the set when the level terrain is loaded and recreate it on level changes. Normalize additive `blocksVision` tile metadata and classify cliff-face/slope frames across Tilemap_color1 through color5 and raised sides in Tilemap_Elevation. Flat grass and elevation tops remain transparent absent colliders or explicit metadata. False metadata never cancels a collider or cliff classification. The detector's own cell remains outside the forward ray, as with bushes. Use tile semantics, not screenshot coordinates or pixel colors; tile metadata can extend the classification without changing movement physics.

## Risks / Trade-offs

- [A thin edge blocks an entire visual cell] → This follows the requested tile-level rule; movement still uses the precise collider geometry.
- [Unit tests pass while live wiring remains absent] → Add an integration regression using the runtime terrain setup, then verify detection and rendered shadows in a browser.
- [Audio or remembered alert looks like sight through terrain] → Verify visual events independently and use a player beyond audio range with a fresh enemy for the browser case.
- [Concurrent edits in main.js] → Make narrowly scoped wiring changes against the current checkout and preserve unrelated work.

## Migration Plan

No data migration or dependency changes. Add regression coverage, wire both consumers, and verify the running game. If rollback is necessary, use an additive follow-up change restoring the previous wiring without discarding other terrain asset edits.


## Implementation verification (2026-09-07)

- 72 focused perception, terrain collider, and shadow tests passed using Node's `--test-isolation=none` (the sandbox disallows test-worker spawning).
- 173 adjacent attack/concealment regressions passed. Production build and strict OpenSpec validation passed.
- Browser: http://127.0.0.1:5176/ loaded and started successfully. Ports 5173-5175 were occupied.
- Browser fixture: http://127.0.0.1:5176/src/test/browser/terrain-vision.html passed all six cases and was visually inspected. It uses production terrain, perception, and shadow-command functions; its canvas draws the returned shadows over terrain artwork. Cases cover full cliff, triangle, thin edge, collider-free cliff, explicit grass blocker, and clear grass.
- Actual Level01 layered-data regression covers the marked cliff cells, including the upper central pair at Tiled cells (4,2) and (5,2). No screenshot-coordinate blacklist or map edits were needed.
- Broader optional terrain suite found three unrelated failures: Level01 layer names, authored layout checksum, and object-only image normalization. These expectations concern existing map/loader changes outside C066; they were not modified here.
- Atlas classification: color1-5 frames 36,39,41-45,48,50-53; elevation side frames 12-15,20-23. Flat elevation tops and stairs remain transparent unless collidable or explicitly marked. A Tiled tile boolean `blocksVision: true` adds sight blocking; false never removes collision/classification blocking.

Final overlay follow-up: purple visual diagnostics now use the same visibility options as shadows. The regression failed before the fix and passed afterward; 69 related tests, six browser cases, and the production build passed.
