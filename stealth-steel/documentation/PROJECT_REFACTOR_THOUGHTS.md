# Project Refactor Thoughts — Stealth and Steel

## Goal

The refactor aims to meet long-term stability and scalability goals expected by senior engineers while preserving a game that remains playable without BIS.

## Observed strengths

- Gameplay, UI, AI, and integration already have meaningful directory boundaries.
- `runtime/integration/` is a natural home for the optional BIS seam.
- Existing Node tests make stale callbacks, pause behavior, UI teardown, and game state practical to characterize.

## Risks and response

| Risk | Response |
| --- | --- |
| A payment callback can outlive a defeated run. | Bind commands to an explicit session and use a per-session operation ledger. |
| The game becomes coupled to wallet/provider details. | Consume only `IBisGame` and `BisService` through the published package. |
| A large scene assembler obscures integration ownership. | Keep `main.js` as composition; locate game behavior in `runtime/integration/bis-host-game.js`. |
| Style guidance drifts across feature work. | Apply the three local Code Templates when files are touched. |

## Adopted direction

`createBisGame` is the game showcase factory. It owns active sessions, opaque continuation targets, idempotent receipts, and game-only delivery callbacks. `BisService` remains a library facade; it confirms and routes workflow results but never decides what a player revival or reward looks like. The paired [Deep Dive](deep-dive.md) documents this boundary in both repository directions.
