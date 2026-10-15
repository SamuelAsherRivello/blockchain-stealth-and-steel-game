# OpenSpec synchronization review — 2026-09-08

All 18 currently open changes are synchronized. Verified exact requirement-body and scenario agreement for 85 delta requirements using the paths returned by current CLI status. Strict validation passed for all 54 main specs and 18 open changes (72/72). Diff whitespace checks passed.

## Reconciliation

Older deltas now carry the current contracts for filtered perception, escalation and bounded bush tracking, Attack-only controls, knife damage, and BIS loss/progression actions. Full surviving scenarios were preserved. C045 now consistently specifies 100% active blink opacity, confirmed against runtime collider-diagnostics.js and its existing tests, with the inactive visual distance fade retained. Compatible defeat timing, same-frame goal priority, manual pause and non-dismissable backdrop scenarios were carried into the current loss spec.

Proposal, design and task documents for the seven previously conflicting changes have explicit current-contract notes; earlier checked tasks and review evidence remain historical. No checkbox states or existing IDs were changed. No implementation edits or gameplay verification were performed by this sync. C069 was archived by concurrent work and is excluded from the current open inventory.

| ID | Name | Status | Synched | Tasks |
| --- | --- | --- | --- | --- |
| C062 | restructure-project-folders | OPEN | Yes | 8/8 |
| C061 | replace-in-game-ui-with-tiny-swords-art | OPEN | Yes | 19/24 |
| C060 | respect-bush-concealment-during-enemy-alert | OPEN | Yes | 4/4 |
| C059 | add-bush-gravity-movement | OPEN | Yes | 7/7 |
| C058 | fix-player-damage-and-loss-prompt | OPEN | Yes | 13/13 |
| C057 | center-enemies-before-attacking | OPEN | Yes | 9/9 |
| C056 | attack-player-from-adjacent-grid-spot | OPEN | Yes | 8/8 |
| C052 | add-start-game-prompt | OPEN | Yes | 4/6 |
| C052 | quantized-enemy-movement-on-one-axis | OPEN | Yes | 6/8 |
| C051 | align-perception-with-movement-heading | OPEN | Yes | 3/4 |
| C048 | add-lockup-detector | OPEN | Yes | 0/6 |
| C046 | connect-perception-icons | OPEN | Yes | 3/10 |
| C045 | add-character-perception-debug-rendering | OPEN | Yes | 4/6 |
| C041 | dom-ui-corner-anchoring | OPEN | Yes | 4/6 |
| C038 | refactor-character-spatial-contract | OPEN | Yes | 4/12 |
| C036 | add-centralized-character-perception | OPEN | Yes | 3/6 |
| Missing | add-runtime-enemy-vision-shadows | OPEN | Yes | 5/6 |
| Missing | universal-grid-spot-occupancy | OPEN | Yes | 8/10 |

## Remaining identity diagnostics

The inventory below exposes pre-existing identity problems. Specification synchronization passed; canonical identity validation remains blocked, so no automatic IDs were assigned.

- add-runtime-enemy-vision-shadows: missing change ID
- C052: add-start-game-prompt and quantized-enemy-movement-on-one-axis
- universal-grid-spot-occupancy: missing change ID
- C053: archive\2026-09-02-add-gold-counter and archive\2026-09-02-prevent-enemy-walking-into-occupied-cells

Paths above are relative to openspec/changes/. Missing metadata IDs belong to task prefixes C039 (universal-grid-spot-occupancy) and C055 (add-runtime-enemy-vision-shadows), already used by archived changes; these were not inferred as valid change IDs.

Call again with "All" or "archived" to see more.
