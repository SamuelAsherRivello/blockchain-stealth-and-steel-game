## 1. Camera and level contract

- [x] 1.1 C064-T001 Implement validated map camera settings and origin-relative world bounds; verify fixed defaults, shifted origins and undersized rejection in tests.
- [x] 1.2 C064-T002 Implement damped camera and shared projection; verify dead zones, edge clamps, initialization, pause, reversal, convergence and frame-rate independence.

## 2. Runtime integration

- [x] 2.1 C064-T003 Separate gameplay bounds from render dimensions across actors, navigation, spawning, pickups and projectiles; verify movement and selection beyond the old viewport and at shifted bounds.
- [x] 2.2 C064-T004 Connect world sprite layers, diagnostics, DOM goal, input and depth ordering to the camera; verify projection and depth tests plus the build.

## 3. End-to-end verification

- [x] 3.1 C064-T005 Use the user-authored scrolling Level 1 at the normal game URL, remove the demo override, and document authoring; verify scrolling, edge limits, world-layer alignment, clicking and pause in the browser, with fixed-mode and invalid-map automated checks.
- [x] 3.2 C064-T006 Run the complete test suite, build and strict OpenSpec validation; review the diff and record any pre-existing failures.

## Verification evidence

- Camera/world unit tests and related projectile, archer-depth, goal, and Tiled validation checks pass.
- Production build and strict C064 OpenSpec validation pass.
- Initial implementation Chrome/WebGPU checks on localhost:5175 passed (the temporary fixture has since been removed): keyboard scrolling, all corner clamps, inverse-projected selection, pause, minimum dimensions, invalid-map startup rejection, Level 1 fixed mode, diagnostics, and portrait/landscape goal projection and scaling.
- The QA server disables watching to avoid reloads from concurrent work. Browser scripts and screenshots are in output/playwright/camera-*.
- Full-suite snapshot: 834 tests, 831 pass, 3 fail. The remaining assertions concern ongoing unrelated work: goblin/lancer tests still expect the previous enemy controllers after the concurrent GOAP migration, and repository-layout.test.js rejects the concurrent public/ui artwork directory. See output/camera-tests-final.log.
- Level 1 now uses follow-player at the user's request. Its authored layout is preserved; Level 2 is unchanged.
- Follow-up on the authored Level 1 at localhost:5173: keyboard movement reaches the right clamp (128 logical pixels), the vertical axis stays locked, actor layers share the view, DOM goal alignment is exact, HUD stays stationary, pause freezes the view, and a scrolled click selects cell (3,5). All 27 focused camera/world/Tiled tests, the production build, and strict OpenSpec validation pass. Demo fixture and URL override removed.
- Release preflight: all 843 tests pass after updating expectations for the latest user-authored Level 1 and recognizing the already-approved themed HUD image directory. Publishing checks and production build pass.
