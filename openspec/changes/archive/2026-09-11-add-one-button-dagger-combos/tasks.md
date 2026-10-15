## 1. Combo model and dagger lifecycle

- [x] `C072-T001` Add the central C072 tuning profile and a pure one-button sequence resolver for ordinary, Rapid Triple, over-fast, one buffered press, per-target confirmation, pause, and cancellation; verify focused resolver tests cover each state and configurable band.
- [x] `C072-T002` Replace the fixed knife-swing timing model with descriptor-driven duration, forward/reverse frame order, one configurable impact, recovery/delay, and coarse-update safety; verify player-melee tests prove exactly one impact per move at every configured boundary.
- [x] `C072-T003` Add the over-fast post-third-move one-second active-gameplay cooldown and ordinary off-rhythm behavior; verify focused tests prove no hidden queue, pause preservation, and that incorrect non-over-fast timing is unpenalized.

## 2. Player input and combat integration

- [x] `C072-T004` Route V, accessible Attack, and pointer Attack requests through the same bounded player combo lifecycle while retaining movement and preventing held-key repeats; verify player-knife and virtual-controller tests cover matching classification across all three input sources.
- [x] `C072-T005` Extend player dagger impact resolution to report actual hit records and apply each move descriptor's damage multiplier through the existing equipment damage path; verify combat tests cover ordinary 25 base damage, Rapid Triple's confirmed upgrades, and independent multi-enemy progression.
- [x] `C072-T006` Integrate lifecycle clearing with input disable, death, teardown, level transition, and existing stealth-attack consumption; verify player and gameplay integration tests show no stale impact, combo state, cooldown, or stealth interaction.

## 3. Combo presentation and feedback

- [x] `C072-T007` Add gameplay-owned reusable combo particle management with one-shot playback, safe reuse, and teardown disposal; verify active Rapid Triple playback is independent of bush effects.
- [x] `C072-T008` Implement descriptor-driven player flash, enemy flash, reverse/variable-speed dagger frames, configured impact timing, and the Rapid Triple visual-only jump; verify visual tests prove unchanged world position and combat/movement colliders throughout the finisher.
- [x] `C072-T009` Route configured attack and confirmed-damage sound pitch through the existing SFX player without adding assets; verify confirmed Rapid Triple feedback uses the configured pitches and misses emit no damage sound.

## 4. Gameplay verification and playtest readiness

- [x] `C072-T010` Add a browser-visible dagger-combo fixture covering Rapid Triple, an over-fast sequence, misses, multi-target overlap, feedback, cooldown, and collider stability; verify it passes in a real browser on the current Vite URL.
- [x] `C072-T011` Perform desktop keyboard and mobile-style pointer playtests to calibrate the centralized Rapid Triple timing, feedback, cloud placement, and recovery values. Evidence: the user accepted the forgiving Rapid Triple cadence and sound, final forward-backward-forward animation, cloud placement/depth, and 1.95-second successful-finisher recovery.
- [x] `C072-T012` Run focused unit/browser tests, the relevant broader suite, `npm.cmd run build`, `npm.cmd run openspec -- validate add-one-button-dagger-combos --strict`, and `git diff --check`; report any unrelated failures separately.
