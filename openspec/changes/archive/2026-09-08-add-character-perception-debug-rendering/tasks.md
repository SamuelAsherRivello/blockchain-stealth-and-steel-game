## Current contract reconciliation (2026-09-08)

Perception diagnostics use centered squares: Visual occupies 50% of a cell and Audio 25%, with Audio drawn on top. Active detection blinks at 100% purple for 0.2 seconds on and 0.1 seconds off. Inactive Audio is 40%; inactive Visual fades by distance through 40%, 30%, 20%, and 10%. Triangle, stroke-width and 80% active-opacity descriptions below are historical and superseded. The later independent Developer controls supersede Collider-mode gating: Enemy Perceptions controls these indicators independently of Physics Colliders. Runtime collider-diagnostics.js and its existing tests confirm this styling.

Existing task IDs, checkbox states and historical review evidence are retained. This specification sync does not claim new implementation or verification.

## 1. Rendering primitives

- [x] C045-T001 Add centered Visual (50%-cell) and Audio (25%-cell) square geometry and purple fill styling; verify exact bounds, range fade and active opacity in focused tests.
- [x] C045-T002 Adapt collider diagnostics to consume the centralized read-only perception snapshot; verify no perception indicators render when Enemy Perceptions is off, independently of Physics Colliders.

## 2. Integration and overlap

- [x] C045-T003 Render all living detector geometries relative to current grid location and facing; verify all four directions and moving-cell updates in tests.
- [x] C045-T004 Render independent overlapping Visual/Audio squares with all Audio squares on top and 200ms-on/100ms-off active blinking; verify simultaneous channel activation behavior.

## 3. Verification

- [x] C045-T005 Run the full unit suite, production build, and OpenSpec validation; record all passing commands.
- [x] C045-T006 Verify in a real browser with Enemy Perceptions enabled that goblin, archer, and warrior overlays move, rotate, activate, overlap, and disappear when Enemy Perceptions is disabled, independently of Physics Colliders.

Verification completed on 2026-09-08: all 960 tests, production build, strict change validation and all 54 main-spec validations passed. Browser diagnostics passed for Goblin, Archer and Warrior; manual toggles confirmed zero perception squares while Physics Colliders remained enabled. See verification.md.
