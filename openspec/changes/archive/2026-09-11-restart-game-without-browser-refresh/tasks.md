## 1. Characterize restart and run ownership

- [x] 1.1 C076-T001 Add focused progression tests that distinguish Continue's existing persisted reload from Restart's fresh in-memory run descriptor; verify Restart selects the current first Map Order entry, clears the run-transition marker, and never invokes the reload callback.
- [x] 1.2 C076-T002 Add focused lifecycle tests with injected run resources; verify replacement disposes the prior run exactly once, cancels its animation frame/listeners/layers, rejects a second overlapping restart, and starts one new run only after the old one is inactive.
- [x] 1.3 C076-T003 Extend loss, BIS-host, and account integration tests for a restarted session; verify stale continuation/reward/account callbacks are not applicable to the fresh session while persistent settings and account data are untouched.

## 2. Implement the in-place fresh-run lifecycle

- [x] 2.1 C076-T004 Refactor `main.js` into browser-lifetime setup plus a disposable game-run factory/coordinator; inventory the Babylon Lite renderer/engine lifecycle API and verify all current run-owned world, input, UI, and animation resources are registered with an idempotent disposer.
- [x] 2.2 C076-T005 Implement the explicit fresh-run progression command and route loss-menu, completion-menu, and BIS account restart requests through the coordinator; verify Continue retains its existing persisted reload transition while Restart uses no browser-navigation API.
- [x] 2.3 C076-T006 Bind async loaders, payment/reward delivery, and account integration to the active run generation/session; verify a new session receives a fresh BIS host adapter and Start Menu policy while old callbacks and UI cannot mutate or overlay it.
- [x] 2.4 C076-T007 Preserve the current first-map, Map Order, `skipIntro`, pause, viewport, settings, and account-data contracts across replacement; verify the old world is fully removed and the fresh run exposes only its normal initial presentation.

## 3. Verify browser-visible restart behavior

- [x] 3.1 C076-T008 Run the focused progression, lifecycle, loss, BIS-host, account, level-reward, and UI tests; verify repeated Restart Game calls leave one active run and all relevant assertions pass.
- [x] 3.2 C076-T009 Add and run real-browser coverage for Restart Game from both loss and completion: capture the URL and navigation-entry count, activate Restart, verify they are unchanged, then verify the first saved Map Order level and fresh Start Menu appear with no stale UI.
- [x] 3.3 C076-T010 Run the complete automated suite, production build, and strict OpenSpec validation for C076; verify no Continue, Map Order, payment, account, or viewport regression and record the local browser URL used for final QA.
  - Final browser QA: `http://127.0.0.1:5182/`. The complete suite still reports the pre-existing, unrelated C071 menu-overlap assertion mismatch (`10px` stylesheet value versus its `8px` expectation); scoped C076 tests, browser QA, build, and OpenSpec validation pass.
