# C045 verification — 2026-09-08

## Reconciliation and sync

The existing square/fill contract supersedes the historical triangle/stroke design. The later tiny-swords-ui-theme requirement for five independent Developer toggles and current settings/runtime tests supersede the old Collider-mode gate: Enemy Perceptions controls perception areas independently of Physics Colliders. Updated the C045 planning reconciliation, task descriptions and corresponding main/delta requirement to describe those existing controls. Preserved all task and change IDs and unrelated main-spec requirements.

## Implementation

Found and reproduced an overlap defect: per-detector drawing placed a later detector's Visual squares above an earlier detector's Audio squares. Commands now draw all Visual squares before all Audio squares. Extracted the existing canvas perception pass into drawPerceptionDiagnostics, used by both the main compositor and browser fixture. It preserves canonical Y conversion, fill/blink styling and snapshot immutability, and performs no drawing when disabled.

Added regression coverage for cross-detector ordering and the real canvas pass (off/on, coordinates, active/inactive fills, and snapshot preservation). Updated the compositor test dependency for the extracted renderer; its 32 debug-toggle combinations continue to pass.

## Automated validation

- Focused collider-diagnostics, settings UI and roster heading tests: 35 passed.
- npm test: 960 passed, 0 failed.
- npm run build: passed; existing large-chunk advisory remains.
- npm run openspec -- validate add-character-perception-debug-rendering --strict: passed.
- npm run openspec -- validate --specs: all 54 passed.

## Browser validation

http://127.0.0.1:5175/src/test/browser/perception-diagnostics.html uses production Goblin, Archer and Warrior sprites/actors, isolated centralized perception managers with controlled player targets, the runtime settings store, and the shared production perception canvas renderer. Test controls use a nonpersistent store.

Each actor passed 356 sampled updates across disabled, left/up/right/down movement, target leaving detection, perception-off/colliders-on and perception-on/colliders-off phases. Both channels activated at overlapping cells; each detector showed both blink states; all Audio squares rendered above all Visual squares. No fixture errors or browser console errors occurred.

Inspected the rendered active/inactive squares and manually clicked the browser toggles: 36 squares were visible with perception on and colliders off; zero squares remained with perception off and colliders on, while movement circles stayed visible. The fixture remains interactive for review.

All six tasks are complete.
