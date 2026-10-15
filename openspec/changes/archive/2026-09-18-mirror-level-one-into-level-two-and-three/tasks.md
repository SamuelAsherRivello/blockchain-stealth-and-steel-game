## 1. Source-derived map replacements

- [x] 1.1 C080-T001 Replace `stealth-steel/public/assets/levels/tiled/maps/Level03.tmj` with the complete Level 1 TMJ content and verify its parsed JSON structure and content match `Level01.tmj` exactly.
- [x] 1.2 C080-T002 Replace `stealth-steel/public/assets/levels/tiled/maps/Level02.tmj` with the complete Level 1-derived horizontal mirror, reflecting terrain rows and object placement geometry, setting Tiled horizontal-flip flags, and preserving Y coordinates, assets, properties, and layer order; verify the transformed map parses successfully.

- [x] 1.3 C080-T005 Preserve horizontal tile flips through normalization, mirror terrain collision geometry, and render flipped terrain through the Babylon adapter.
- [x] 1.4 C080-T006 Place the Level 2 player start at normalized cell `(5,3)` and verify its movement collider is walkable.

## 2. Map-level verification

- [x] 2.1 C080-T003 Verify the normalized Level 2 and Level 3 maps expose the same dimensions, layers, tilesets, gameplay object categories, and playable content as Level 1, with Level 2 X-reflected, terrain flipped, and Level 3 identical.
- [x] 2.2 C080-T004 Run the focused level/map validation, build, and browser QA; record the unrelated stale Level 1 goblin-placement assertion and confirm that only intended level-mirroring files, runtime flip support, tests, and OpenSpec artifacts are staged.
