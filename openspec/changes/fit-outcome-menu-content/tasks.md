# Tasks

## 1. Establish outcome-menu layout coverage

- [x] 1.1 Add focused assertions for outcome-specific paper sizing, action separation, and lower safe-edge containment; verify the test fails against the crowded current composition.
- [x] 1.2 Extend the browser fixture or completion host to measure completion and loss paper/action bounds at fullscreen 100% using `?muteMusic=true&muteSFX=true`; verify body/action separation, paper containment, and no page errors.

## 2. Fit the outcome composition

- [x] 2.1 Add outcome-only menu geometry that gives the paper enough height for body copy, visible actions, normal inter-button spacing, and lower breathing room; verify the focused layout assertions pass without changing Start Menu selectors.
- [x] 2.2 Preserve the existing outcome action order, labels, hidden/disabled states, and accessibility behavior; verify the level-complete UI and level-reward tests pass.

## 3. Verify the delivered fullscreen result

- [x] 3.1 Run the focused UI tests, browser verification, full test suite, production build, OpenSpec validation, and `git diff --check`; inspect completion and loss screenshots at 100% fullscreen and verify the paper visibly encloses the complete menu.
