## 1. Persistent ordering and progression

- [x] 1.1 C070-T001 Add order preference and catalog normalization; verify persistence, malformed data, added maps, and reset with unit tests.
- [x] 1.2 C070-T002 Implement run snapshot/index transitions and correct completion counts; verify reordered Continue, Restart, manual refresh, and trophy identity tests.

## 2. Developer menu and map

- [x] 2.1 C070-T003 Add themed Map Order buttons and reset refresh; verify successive clicks, keyboard focus, and saved ordering.
- [x] 2.2 C070-T004 Copy Level02.tmj to Level03.tmj; verify identical bytes, source preservation, catalog inclusion, and map loading.

## 3. Integration verification

- [x] 3.1 C070-T005 Run relevant tests and production build; verify in a real browser that Level2 then Level3 produces Level3,Level2,Level1 and refresh with skipIntro loads Level03. Record results.

## Verification results

- 24 focused Node tests passed across map-order, level-progress, settings-ui, and level-reward suites using `--test-isolation=none` because sandbox child-process spawning was unavailable.
- Production build passed; existing large-chunk warning remains.
- In-app browser at `http://localhost:5173/?skipIntro=true`: clicked Level2 then Level3, verified left-to-right order and focus on the promoted button. Refreshed and reopened Developer: saved order remained Level3,Level2,Level1. The canvas loaded-map attribute confirmed Level03.tmj and no intro appeared. Final layout visually checked.
- Level02.tmj and Level03.tmj SHA256 hashes match; Level02 has no Git changes.
- OpenSpec strict validation passed. All five implementation tasks complete.
