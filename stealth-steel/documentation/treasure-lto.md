# LTO treasure integration

Current contract migration: BIS/game 0.0.18. The exact archive, hash, released source and history are in [provenance](../vendor/BIS_PROVENANCE.md). Read [Deep Dive Overview](deep-dive-overview.md) for the three-part boundary and [Deep Dive Details](deep-dive-details.md) for the complete workflow reference.

## Setup and availability

Ordinary guest gameplay requires no wallet. BIS owns explicit Player and separate Game Wallet setup through Account and Game Wallet Login, local to the browser origin. There is no application wallet server or `VITE_BIS_WALLET_SERVICE_URL` dependency. The normal game uses the selected local wallets; it never receives recovery phrases or signing material.

The game consumes `IBis.hasContractSupport()` rather than reconstructing readiness from raw wallets. A capability is not proof of funding: BIS still validates wallet/network scope, fees, provider terms, reserved inputs and financial journals on each operation. Without support, Start remains playable and creates no offer. Starting before BIS finishes loading does not queue a later replacement offer.

## Commands and scope

[`treasure-runtime.js`](../src/runtime/integration/treasure-runtime.js) calls `startContractAsync`, `checkContractsAsync`, `claimContractAsync`, `rejectContractAsync` and `endContractSessionAsync` on `IBis`. Safe `BisSnapshot.contracts` updates arrive through `IBisGame.onBisEvent` and the game-owned Account dispatcher. There is no `.lto`, `getSession()` or direct wallet/controller access.

Explicit Start requests one 1,000-sat offer with a 90-second wall-clock lifetime, `purpose: 'treasureLTO'`, `exclusivityKey: 'treasure'` and a stable host reference. `BisContractRequest.offerSessionId` is financial eligibility identity, not application ID or gameplay run ID. For compatibility, query `sessionId` means offer session and query/contract `gameId` means Game wallet profile. The game matches offer, purpose, reference and both wallet identities; stored bindings include networks.

Pause, hidden tabs, funding latency, paid continuation and level transitions never extend the original deadline. Supported progression preserves the offer lifetime; an explicit new Start or active-runtime disposal ends it. Reopening the game or recreating its runtime does not end or reconcile the saved offer. Old browser snapshots without a network binding are interpreted as Signet rather than rebound across networks. Submitted remote transactions are never cancelled by a UI close, reset or local eligibility end.

## Trigger and feedback policy

The level-start boundary is the funding trigger. Starting a level requests one level-scoped offer; gameplay remains nonblocking while BIS prepares or recovers it. Opening the treasure chest performs the exact-session inspection needed for chest eligibility, rather than relying on a controller-load reconciliation. Loading the game, restoring the saved session, or refreshing a screen produces no funding toast. Claim and Reject are explicit actions and may present their own result; unchanged pending funding is represented in the game state and is not repeatedly announced.

## Gameplay and closed-window updates

The authored Level01 chest position remains Tiled column4,row11 (game cell3,5; world center224,352), two cells above the fresh player. A chest is revealed only after a matching eligible funded offer becomes active; it does not always spawn for a guest. Its nonblocking sensor opens the game-owned Treasure Chest window only when contract support is available. Updates received with the window closed can reveal eligible artwork but never open a window or claim funds.

Claim/Reject uses public actions and closes only its originating window after durable acceptance. Back removes only the treasure pause; leave/re-enter the sensor to reopen. Pending/unavailable/expired/resolved state is truthful and action buttons are gated. The UI timer renders the countdown only; it no longer polls financial progress. Explicit inspection/open uses BIS recovery-aware checks; the BIS recovery worker publishes progress independently.

Confirmed sats presentation is bound to the gameplay run captured before financial work. An offer may outlive a level runtime, but its old effect cannot mutate or celebrate a replacement run. Game feedback and `BisGameEffectReceipt` never determine financial truth or retry a claim.

The palette is [`TreasureChestSpawner.tsj`](../public/assets/levels/tiled/tilesets/TreasureChestSpawner.tsj); runtime artwork remains its PNG, not an AI-generated replacement. Issued BIS achievement/equipment URLs remain unchanged.

## Verification and limits

Node coverage verifies guest skip, fixed lifetime/persistence, exact offer identity, closed-window funding events, wrong scope, claim/reject, network replacement, pending navigation and late-window protection. The archive verifier checks127 installed files and the immutable archive. Full suite/build/public-type and development/production/live browser gates are recorded in [C088](../../openspec/changes/formalize-bis-game-contracts/tasks.md), not implied by this guide.

AI-created game URLs must contain both `muteMusic=true&muteSFX=true`; use fresh browser storage and no wallet credentials/account creation/signing. Credential-free acceptance cannot prove a live funded claim/refund. Historical isolated-operator/hosted-wallet evidence in archived plans concerns prior implementations, not acceptance of this release. Physical-device touch and actual Tiled-editor save/reload remain separate unperformed checks.
