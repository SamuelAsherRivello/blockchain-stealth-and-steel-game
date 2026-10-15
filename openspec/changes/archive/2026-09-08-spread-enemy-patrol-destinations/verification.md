# C069 verification — 2026-09-08

## Implemented behavior

All five production enemy profiles share soft patrol separation. Selection scores already-legal destinations against living teammates' current cells and active patrol destinations. The preferred branch (80%) chooses among the most separated options; the unrestricted branch (20%) keeps nearby options possible. Timed patrol keeps a straight-ahead preference only among equally preferred candidates. Existing bounds, home radius, movement validation, and action priorities remain authoritative.

Intent is copied per brain, published at destination selection, read live by subsequent decisions, and cleared through the action/executor lifecycle. The production peer callback receives only enemy records; combat target lists and player knowledge are unchanged.

## Automated evidence

- C069-T001: Three new action tests failed against the original selector: no separation preference, no intent publication, and no peer-aware outcome. Node's sandboxed worker launch initially returned EPERM; direct `node --test --test-isolation=none` produced the expected assertion failures.
- C069-T002: `patrol-selection.test.js` proves the two-candidate distribution is exactly 90 preferred versus 10 nearby choices over a deterministic 100-draw matrix. It also covers ties, random boundary 1, empty/single candidates, current and intended peer cells, dead/self exclusion, timed continuity, and unchanged in-progress destinations when peers move.
- C069-T003: `patrol-group.test.js` verifies copied live snapshots and death/removal/reset exclusion. The main-game browser snapshot confirms the production callback and per-brain destination output.
- C069-T004: Action tests cover fresh peers at deferred selector execution, route distance/home filtering, and timed duration. Brain tests verify all five profiles, same-update sequential selection, existing scheduling budgets, and retained player-knowledge isolation. Inputs use logical GridSpots and contain no camera coordinates; the existing navigation test covers nonzero world origins.
- C069-T005: Brain tests cover cancellation, disposal, death, defense, displacement, awareness interruption, adjacent-player attack, blocked navigation, and completion for all applicable profiles. Existing enclosed-enemy, live-blockage, escape and retry tests pass. Peer tests prove reset/removal cannot retain old intent.
- C069-T006: The comparison uses production patrol actions and navigation, ten mixed route/timed actors, fixed seeds 1–20, a 24x24 open grid, 120 seconds per run, 30-second warm-up, one-second observations, and 6x6-cell sectors. The frozen pre-C069 selector is retained only as a test fixture. Both policies use identical spawns, timing ranges, occupancy rules, seeds, and observation times.

| Mean across seeds | Original | C069 |
| --- | ---: | ---: |
| Nearest-enemy distance, cells | 5.4606 | 10.5718 |
| Occupied sectors | 7.4383 | 9.8239 |

The 18x1 corridor simulation retained 13,421 moving updates with mean nearest-enemy distance 1.4356 cells. Close grouping does not block otherwise legal patrol.

- C069-T007: Final `npm test`: **936 passed, 0 failed**. Log: `output/playwright/c069-unit-tests.log`. `npm run build`: passed; existing large-chunk advisory only.

## Browser evidence (C069-T008)

Playwright used a real headed Chromium browser against Vite at `http://127.0.0.1:5173/`. Fixture checks are repeatable with `check-patrol-spread.cjs` through `playwright-cli run-code --filename`. Production sprites and brains ran for 60 simulated seconds at four fixed 25ms updates per rendered frame, with an awareness interruption at 50 seconds.

- `/src/test/browser/patrol-spread.html`: ten real enemies, all moved. Mean separation after warm-up 7.1868 cells versus initial 1 cell. 360 destinations selected; 26 within two cells of a peer. All ten cleared intent at the awareness transition and on disposal. Zero diagonal AI intents or jumps over eight pixels per update. Screenshot inspected: `output/playwright/c069-spread.png`.
- `/src/test/browser/patrol-spread.html?corridor`: all five real enemy types moved inside one legal row. 193 destinations, 44 close choices, mean separation 3.2773 cells, all five interruptions and cleanup passed. Screenshot inspected: `output/playwright/c069-corridor.png`.
- `/src/test/browser/goap-roster.html?mode=combat&duration=6`: all 16 combat-enemy/state combinations attacked, four Monks neither attacked nor healed, and no movement during attacks. Pause and disposal checks passed. Screenshot: `output/playwright/c069-combat.png`.
- Normal game: loaded Start Menu, clicked Start, then also verified development startup at `/?skipIntro=true`. Confirmed all five enemy records and active Warrior/Lancer patrol destinations in `#renderCanvas.dataset.navigationDebug`. Screenshot inspected: `output/playwright/c069-main-game.png`. Browser reported zero console errors.

The rendered actors retain their existing small perpendicular grid-alignment corrections from `createGridAlignedMovementController`; these are separate from the AI's cardinal movement intent. An initially overstrict fixture assertion on any two-axis position change was corrected after inspecting that existing controller. C069 neither changes that controller nor claims to implement the separate movement-alignment change.

## Completion (C069-T009)

`npm run openspec -- validate spread-enemy-patrol-destinations --strict` passed. Planning artifacts match the implemented 80/20 selection and scope. All nine tasks have evidence above. No maps, spawn positions, dependencies, or gameplay UI were changed by this work. Other task edits already present or arriving concurrently in main specs and the menu stylesheet were left untouched.
