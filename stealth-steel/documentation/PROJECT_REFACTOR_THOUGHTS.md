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
| The game becomes coupled to wallet/provider details. | Consume `IBis`; implement `IBisGame`, using actual installed public declarations. `BisService` is the implementation, not an additional contract. |
| A large scene assembler obscures integration ownership. | Keep `main.js` as composition; locate game behavior in `runtime/integration/bis-host-game.js`. |
| Style guidance drifts across feature work. | Apply the three local Code Templates when files are touched. |

## Adopted direction

`createBisGame` is the actual JavaScript game factory. Its applied/in-flight session/operation ledger reserves before yielding and revalidates before a synchronous mutation. Main invalidates sessions before transition/reset/disposal. Confirmed asset/sats rewards now produce visible game-owned feedback; effect receipts remain independent of financial confirmation.

`BisService implements IBis` with private composition. Account, continuation, trophies, equipment, treasure and reset use named commands/safe projections; notifications arrive only through `IBisGame.onBisEvent`. Game-local subscribers are not extra BIS channels. The declaration mirror and raw session/controller fallback are removed.

The paired [Deep Dive](deep-dive.md) and [communication analysis](BIS_GAME_COMMUNICATION_EXPLORATION.md) describe adopted contracts and remaining presentation-selector coupling. Future public theme hooks and catalog injection are separate proposals, not silently implemented by this refactor. Existing catalog facts remain BIS-owned; movement/combat interpretation remains game-owned.

Release policy: publish BIS first, import its verified immutable archive, then publish the game with the identical complete version. The two Pages deployments are independent and push-triggered; no release tag/manual dispatch is required. C088 tracks actual full-suite/browser/deployment evidence, which must not be inferred from the architecture description.
