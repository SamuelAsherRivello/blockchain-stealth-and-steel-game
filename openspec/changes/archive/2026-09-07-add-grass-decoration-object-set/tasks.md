## 1. Assets and set definition

- [x] 1.1 C065-T001 Copy the supplied grass PNGs into the planned project asset folder and add the grass set catalog with two images, walkable rule, 0.1 frequency, 0.5 base scale, 0.15 relative scale offset, 20px X/Y offsets, 15-degree bottom-center rotation offset, and GrassDecorationsEnabled=false; verify copied file hashes match sources and configuration validation covers valid defaults and invalid inputs and the disabled path.

## 2. Placement and occupancy

- [x] 2.1 C065-T002 Implement complete setup occupancy extraction and empty-walkable eligibility using the actual level grid; verify fixtures cover bushes, pickups, all spawner types, initial actors, goals, resources, other non-blocking objects, multi-cell footprints, absent/non-walkable ground, nonzero origins, and offscreen cells.
- [x] 2.2 C065-T003 Implement the pure decoration placement helper with injected RNG, rate boundaries, uniform image selection, tile-center coordinates, independent random X/Y offsets, and random angle offset and relative uniform scale; verify deterministic tests for 0%, 100%, intermediate thresholds, both image choices, zero/nonzero X/Y and angle offsets, scale bounds, and bottom-center rotation.

## 3. Runtime integration

- [x] 3.1 C065-T004 Load shared grass textures and render static instances during level initialization after occupancy reservations are available; verify integration tests show at most one instance per eligible tile at configured frequency, stable image choices during frames, and no duplicates on reinitialization.
- [x] 3.2 C065-T005 Integrate instance disposal and applicable grid diagnostics while keeping grass outside movement, perception, projectile, and reactive-bush behavior; verify movement/collection do not alter grass and existing bush tests continue to pass.

## 4. Verification

- [x] 4.1 C065-T006 Run focused environment and level integration tests plus npm run build; record results and distinguish any unrelated pre-existing failures.
- [x] 4.2 C065-T007 Verify in a real browser that both supplied variants render sharply within configured transform bounds, full coverage works at frequency 1, configured sampling uses frequency 0.1, and the live default switch leaves grass disabled, occupied tiles have none, camera scrolling preserves placement, actors render above grass, and restart does not duplicate instances; record the live URL and visual evidence.

## Verification results

- Nine focused decoration tests passed, including frequency boundaries, independent X/Y and angle bounds, relative scale, bottom-center pivot, occupancy, lifecycle, and disabled default.
- Production build passed after final runtime changes.
- Related environment run: 33/35 passed before tuning; two existing Level01 expectations disagree with current authored map layer names and checksum. The map was not changed by C065.
- Browser: http://127.0.0.1:5173/?skipIntro=true showed both variants while enabled; final disabled state reports zero grass instances and shows no grass.
- Browser camera fixture: http://127.0.0.1:5173/src/test/browser/grass-decorations.html passed with 286 unique sprites, two excluded cells, both variants, camera Y=1024, and rebuild count=1. Screenshots inspected in the task.
