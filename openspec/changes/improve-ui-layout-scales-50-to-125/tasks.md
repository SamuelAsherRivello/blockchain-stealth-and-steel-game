# Tasks

## 1. Establish the browser layout contract

- [x] `C087-T001` 1.1 Add a minimal Start Menu browser fixture and a Playwright test that measures frame-relative logo, ribbon, parchment, and action bounds at 50%, 75%, 80%, 90%, 110%, and 125% zoom-equivalent viewports; run it before the refactor to record the current failing low-zoom result.

## 2. Stabilize the approved Start Menu composition

- [ ] `C087-T002` 2.1 Refactor only the Start Menu layout geometry onto calibrated hardcoded game-frame-relative values, retaining its supplied artwork and behavior; verify `C087-T001` passes at every supplied zoom level with the final action fully inside the parchment.
- [ ] `C087-T003` 2.2 Update focused menu source-contract tests only where C087 intentionally supersedes fixed-pixel assumptions; verify the Start, Items, and existing themed-menu unit tests pass.

## 3. Verify the delivered UI

- [ ] `C087-T004` 3.1 Run the C087 browser test using `?muteMusic=true&muteSFX=true`, focused UI tests, the full test suite, production build, OpenSpec validation, and `git diff --check`; inspect 110% and 125% captures against their approved states before requesting commit authorization.
