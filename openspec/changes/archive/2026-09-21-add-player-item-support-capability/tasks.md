## 1. Player item capability

- [x] C082-T001 Add `hasItemSupport()` to the game BIS account adapter and cover active, logged-out, and unavailable states with focused tests.
- [x] C082-T002 Route Items availability through `hasItemSupport()` while preserving the current equipment refresh and start-menu behavior.

## 2. Verification and handoff

- [x] C082-T003 Run focused integration/UI tests, production build, and `git diff --check`; verify no wallet operation is initiated and the live game remains playable without a Game Wallet.
