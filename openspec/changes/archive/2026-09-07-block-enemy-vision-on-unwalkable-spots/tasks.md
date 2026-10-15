## 1. Terrain sight classification

- [x] 1.1 C066-T001 Add failing regression coverage for terrain-to-visual-cell classification using full rectangles, triangles, thin edges, collider-free tiles, duplicate placements, cliff/raised-side variants without colliders, and explicit blocksVision metadata; verify the cases expose the missing shared classification before implementation.
- [x] 1.2 C066-T002 Implement a shared terrain visibility predicate from terrain records' collider, cliff/raised-side classification, explicit blocksVision metadata, and logical cells; verify the classification tests pass, including partial colliders whose centers are walkable.

## 2. Runtime integration

- [x] 2.1 C066-T003 Wire the predicate into live centralized perception and add integration coverage showing target-cell and intervening terrain block visual events in all four headings while clear cells, bush/enemy blockers, and audio retain their existing behavior; verify the focused perception tests pass.
- [x] 2.2 C066-T004 Use the same predicate for enemy vision shadows and replace the collider-origin terrain mapping; verify shadow tests exclude the blocker and all later cells for rectangles, triangles, and edges and agree with detection.

## 3. Verification

- [x] 3.1 C066-T005 Run relevant terrain, perception, concealment/reaction, and shadow suites plus the project build; verify they pass and record results without changing unrelated behavior.
- [x] 3.2 C066-T006 Verify in a real browser with a fresh enemy and a player beyond audio range that full, partial, collider-free cliff, and explicitly marked terrain tiles stop visual detection and shadows, then verify a clear path still detects; record the URL and observed results.



