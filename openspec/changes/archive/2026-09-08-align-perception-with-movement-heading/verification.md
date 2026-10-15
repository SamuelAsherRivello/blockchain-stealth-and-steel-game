# C051 verification — 2026-09-08

## Sync

The delta's Visual Perception requirement and all its scenarios exactly match the main character-perception spec. No main-spec edit was needed. All 54 main specs passed validation.

## Implementation review and corrections

Final verification found two remaining gaps despite the earlier implementation checkboxes: Archer exposed horizontal artwork facing as its perception heading, and the main loop published enemy cells/headings before updating enemy movement.

Archer now maintains cardinal locomotion heading independently of horizontal sprite flipping, retains its last heading on stop, and keeps queued movement from changing heading during shooting/recovery. The main loop publishes actor state after enemy updates and before perception evaluation. Existing perception coordinate names remain unchanged: up means negative world Y, while screen projection inverts Y.

Added five production-actor regression cases covering movement, consecutive turns, stopped heading retention, current detection, and debug square direction. Added a main-loop ordering assertion. Replaced the old Archer vertical-movement assertion that required horizontal-only perception while retaining the artwork-flip and shot-lock checks. The new tests reproduced three failures before the runtime correction and passed afterward.

## Validation

- Focused heading, centralized perception and collider-diagnostics tests: 40 passed, 0 failed.
- Complete npm test suite: 958 passed, 0 failed.
- Production build: passed, with the existing large-chunk advisory.
- Browser fixture: /src/test/browser/perception-heading.html on http://127.0.0.1:5175/ (5173 and 5174 were occupied). Uses production sprites, actors, centralized perception snapshots and purple diagnostic draw commands. All five enemies passed all four movement directions and a stop after each direction, with zero heading, movement, range or diagnostic-direction errors. Rendered diagnostics were visually inspected and browser logs contained no errors.

All four tasks are complete.
