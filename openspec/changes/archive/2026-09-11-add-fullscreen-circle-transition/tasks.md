## 1. Target-bound transition controller

- [x] 1.1 C077-T001 Add the reusable SVG circle-transition controller with a target-element parameter, black blackout path, 250 ms reveal/cover animation, resize observation, and teardown; verify focused tests cover black, midpoint, revealed, and covered states.
- [x] 1.2 C077-T002 Mount the non-interactive accessibility-hidden SVG overlay and generic crop CSS; verify the controller aligns its inline bounds to the supplied game-frame rectangle without affecting desktop gutters.

## 2. Game-run composition

- [x] 2.1 C077-T003 Start the reveal only after the first rendered game frame and optional Start Menu are ready; verify the startup preloader remains black until the initial composition completes.
- [x] 2.2 C077-T004 Route loss, completion, and account Restart Game paths through pause, circle cover, fresh-run replacement, and circle reveal; verify repeat requests share one in-flight restart transition.

## 3. Verification

- [x] 3.1 C077-T005 Run focused UI/lifecycle tests and the production build; verify target cropping, 250 ms endpoints, and existing restart behaviour pass.
- [x] 3.2 C077-T006 Run the game in a real browser; verify the Start Menu reveals inside the portrait target while gutters remain visible, then verify Restart Game returns to the fresh Start Menu after the cover/reveal sequence.
