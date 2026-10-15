# Tasks

## 1. Define the DPI-aware viewport contract

- [x] `C083-T001` 1.1 Add a tested, bounded production DPR policy and wire it into the real engine initialization without changing browser diagnostic engine defaults.
- [x] `C083-T002` 1.2 Extend viewport coordination so effective DPR/zoom changes refresh render/debug backing dimensions and diagnostics while preserving the 576x1024 logical coordinate space.
- [x] `C083-T007` 1.3 Add center-anchored UI-layer mousewheel zoom from 50% to 150% in 10% steps without scaling the game layer.

## 2. Preserve layout and input alignment

- [x] `C083-T003` 2.1 Audit and adjust canvas/UI CSS and pointer conversion contracts so CSS presentation rectangles, logical fitted bounds, and physical backing buffers cannot introduce a second scale.
- [x] `C083-T004` 2.2 Add focused regression tests for DPR, browser zoom, pointer mapping, frame alignment, and safe-area invariants.

## 3. Verify the live result

- [x] `C083-T005` 3.1 Run focused UI/viewport tests, the relevant full test suite, production build, and `git diff --check` while preserving unrelated dirty files.
- [x] `C083-T006` 3.2 Run the game at `?muteMusic=true&muteSFX=true` and capture/measure the supplied 100% and 50% zoom cases, confirming menu/HUD/control alignment and no off-frame UI.
