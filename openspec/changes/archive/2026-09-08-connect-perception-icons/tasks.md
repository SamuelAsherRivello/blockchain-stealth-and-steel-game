## Current contract reconciliation (2026-09-08)

Preserve stop-before-redecision on awareness transitions and the existing expression mapping. Under C060, an enemy with its own visually confirmed ALERT tracks hidden movement only until its existing alert timer expires; concealment produces no new detection and never refreshes that timer. The icon follows the resulting reaction state, with investigation beginning on expiry.

Existing task IDs, checkbox states and historical review evidence are retained. This specification sync does not claim new implementation or verification.

## 1. State-to-icon contract

- [ ] C046-T001 Add focused tests for the four perception states mapping to the existing overhead expressions, including `NONE` clearing the icon, and verify they fail before the connection is implemented.
- [ ] C046-T002 Connect the reaction state observed after perception updates to the existing expression-instance data while preserving placement, fade, scale, flash, and manual debug behavior; verify the focused perception-expression tests pass.

## 2. Lifecycle and transitions

- [ ] C046-T003 Verify state transitions from weak, medium, and strong detections update the corresponding overhead icon on the next rendered frame, and verify de-escalation to `NONE` hides it without leaving stale instances.
- [ ] C046-T004 Verify independent characters can display different perception icons simultaneously and that dead/unregistered characters do not retain rendered perception icons.

## 3. Verification

- [ ] C046-T005 Run the full unit suite, production build, and OpenSpec validation; record all passing commands.
- [ ] C046-T006 Verify in a real browser that a character hearing the player visibly changes among the available perception icons and that the icon clears after perception recovery.
- [x] C046-T007 Add focused tests for player/bush combat-collider hiding, multiple-bush continuity, and dead-bush exclusion.
- [x] C046-T008 Implement player `H` expression lifecycle and synchronized all-layer opacity transitions without enemy flash/jump effects.
- [ ] C046-T009 Verify hidden-state animation changes preserve 80% opacity, run the full suite/build/OpenSpec validation, and verify the behavior in a real browser.
- [x] C046-T010 Exclude hidden players from audio and visual perception detections and add focused regression coverage.


## Shared icon typography

- [x] C046-T011 Use one 22.4 px base font size for all player and enemy perception icons, removing the per-icon font-size exception.

Verified the shared font change on 2026-09-08 with four focused overhead/expression tests, production build and the real-browser health-bars fixture showing player H and enemy icons. Earlier unchecked tasks remain unfinished; this font change does not claim full feature verification.
