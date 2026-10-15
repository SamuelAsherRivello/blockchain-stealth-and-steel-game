# C052 movement verification — 2026-09-08

## Sync and implementation

Both requirements and all scenarios in specs/actor-ai-behaviors/spec.md exactly match the main spec. No additional sync edit was needed. Goblin, Warrior, Lancer, Archer and the shared Monk path already use the grid-aligned movement controller; no runtime movement edit was required.

Added enemy-grid-alignment.test.js to exercise all five production actor factories through movement, collider, grid-cell and layer-order APIs. Its 15 cases cover horizontal and vertical travel across cell boundaries, smooth correction without teleporting, stopping, axis changes and dynamic wall blocking. Midpoint checks allow the existing boundary tie convention.

## Automated checks

- Focused Node run: 117 passed, 0 failed. Includes enemy-grid-alignment, player-grid-alignment, attack-preparation, character-spatial and render-depth tests.
- Production build: passed; existing large-chunk advisory remains.
- The initial complete npm test run: 932 passed, 5 failed before adding the new tests. All failures were in settings-ui.test.js and concerned Developer navigation, Account placement and control access through stale child indices.
- Updated settings-ui.test.js to find the Developer button and settings content by their existing classes instead of decorative panel child positions. Behavioral assertions, including control ordering, remain intact; no settings runtime changes were needed. All 12 settings tests passed.
- Final complete npm test run including the new roster coverage and repaired selectors: 952 tests, 952 passed, 0 failed.
- C052-T007 is complete: collider, occupancy and render-depth coverage passed along with the complete automated suite.

## Browser checks

Local server: http://127.0.0.1:5175/ (5173 and 5174 were occupied).

- /src/test/browser/enemy-grid-alignment.html: production sprites for all five enemies; Right, Up, Left, Down, Stopped and Dynamic wall phases. All five passed, each with 443 sampled updates, successful wall stopping and zero reported centerline, occupancy, depth, idle-drift or penetration errors. Inspected the rendered sprites, green movement circles and logical-cell X markers in the browser. An initial fixture setup error (missing empty obstacles argument) was corrected before the passing run.
- /src/test/browser/goap-roster.html?duration=6&startX=-12&startY=-10: 20 real enemy/awareness cases. All combat attacks started at cell centers, no actor moved during a committed attack, all four Archer cases released four arrows, and Monk cases produced no attacks or healing. Pause preservation and disposal checks passed; no browser errors were reported. Rendered combat was visually inspected.

Browser smoke task C052-T008 is complete. All 8/8 tasks are complete; the change is ready to archive.
