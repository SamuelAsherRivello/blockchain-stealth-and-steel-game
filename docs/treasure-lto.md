# LTO treasure integration

Current local candidate: BIS/game 0.0.28. This imported snapshot is not production-qualified or deployed. The exact archive, hash, dirty-source provenance and history are in [provenance](../stealth-steel/vendor/BIS_PROVENANCE.md). Read [Deep Dive Overview](deep-dive-overview.md) for the three-part boundary and [Deep Dive Details](deep-dive-details.md) for the complete workflow reference.

## Setup and availability

Ordinary guest gameplay requires no wallet. BIS owns Player setup and separate Game Wallet Login through Account. The imported package supports manual browser signing and a separately configured server signing source. C094 local-wallet qualification does not qualify that server deployment. The game never receives recovery phrases or signing material. Profile IDs and networks alone do not establish custody. Consent uses the optional public signing-source field when available; older snapshots explicitly say the source is unavailable.

Release 1 is game-client Signet-only. New Signet offers use the real Browser validation contract path and disclose that a modified client can bypass browser-enforced expiry. New Mutinynet game offers are unavailable before consent or funding; the game reports that Mutinynet Treasure offers are not available yet. Existing offers on either network remain inspectable and recoverable under their original terms. Admin remains the testing reference: Signet has Browser validation only; Mutinynet defaults to Arkade co-signer and offers Browser validation explicitly. Admin choices describe testable configurations and do not claim live qualification.

The game consumes `IBis.hasContractSupport()` rather than reconstructing readiness from raw wallets. A capability is not proof of funding: BIS still validates wallet/network scope, fees, provider terms, reserved inputs and financial journals on each operation. Without support, Start remains playable and creates no offer. Starting before BIS finishes loading does not queue a later replacement offer.

## Commands and scope

[`treasure-runtime.js`](../stealth-steel/src/runtime/integration/treasure-runtime.js) calls `startContractAsync`, `checkContractsAsync`, `claimContractAsync`, `rejectContractAsync` and `endContractSessionAsync` on `IBis`. Safe `BisSnapshot.contracts` updates arrive through `IBisGame.onBisEvent` and the game-owned Account dispatcher. There is no `.lto`, `getSession()` or direct wallet/controller access.

Explicit Start proposes one 1,000-sat offer. Its deadline is `(Math.floor(startedAt / 1000) + 90) * 1000`, rounded down so it never exceeds 90 seconds. No funding or inspection starts before Fund 1,000 sats. Skip, close and Escape create no offer. Approval binds to the original wallets, network and available signing-source projection; a change before submission invalidates it. The request uses `purpose: 'treasureLTO'`, `exclusivityKey: 'treasure'` and a stable host reference. `BisContractRequest.offerSessionId` is financial eligibility identity, not application ID or gameplay run ID. For compatibility, query `sessionId` means offer session and query/contract `gameId` means Game wallet profile. The game matches offer, purpose, reference and both wallet identities; stored bindings include networks.

Pause, hidden tabs, funding latency, paid continuation and level transitions never extend the original deadline. Supported progression preserves the offer lifetime; an explicit new Start or active-runtime disposal ends it. Reopening the game or recreating its runtime does not end or reconcile the saved offer. Old browser snapshots without a network binding are interpreted as Signet rather than rebound across networks. Submitted remote transactions are never cancelled by a UI close, reset or local eligibility end.

## Trigger and feedback policy

The level-start boundary opens funding consent when BIS reports support. Approval starts preparation without waiting for the provider before returning control. Funding requires the supported zero-fee policy. Configured signing may run automatically; another signing popup is not guaranteed. Opening the treasure chest performs the exact-session inspection needed for chest eligibility, rather than relying on a controller-load reconciliation. Loading the game, restoring the saved session, or refreshing a screen produces no funding toast. Claim and Reject are explicit actions and may present their own result; unchanged pending funding is represented in the game state and is not repeatedly announced.

## Gameplay and closed-window updates

The authored Level01 chest position remains Tiled column4,row11 (game cell3,5; world center224,352), two cells above the fresh player. A chest is revealed only after a matching eligible funded offer becomes active; it does not always spawn for a guest. Its nonblocking sensor opens the game-owned Treasure Chest window only when contract support is available. Updates received with the window closed can reveal eligible artwork but never open a window or claim funds.

Claim/Reject uses public actions and closes only its originating window after durable acceptance. Back removes only the treasure pause; leave/re-enter the sensor to reopen. Pending/unavailable/expired/resolved state is truthful and action buttons are gated. The UI timer renders the countdown only; it no longer polls financial progress. Explicit inspection/open uses BIS recovery-aware checks; the BIS recovery worker publishes progress independently.

Confirmed sats presentation is bound to the gameplay run captured before financial work. An offer may outlive a level runtime, but its old effect cannot mutate or celebrate a replacement run. Game feedback and `BisGameEffectReceipt` never determine financial truth or retry a claim.

The palette is [`TreasureChestSpawner.tsj`](../stealth-steel/public/assets/levels/tiled/tilesets/TreasureChestSpawner.tsj); runtime artwork remains its PNG, not an AI-generated replacement. Issued BIS achievement/equipment URLs remain unchanged.

## Verification and limits

Node coverage verifies guest skip, fixed lifetime/persistence, exact offer identity, closed-window funding events, wrong scope, claim/reject, network replacement, pending navigation and late-window protection. The archive verifier checks all 201 installed files and the immutable archive. Current suite, build, type, browser and live gates are recorded in [C094](../openspec/changes/productionize-treasure-chest-contract/tasks.md). Historical C088 acceptance does not qualify this candidate.

AI-created game URLs must contain both `muteMusic=true&muteSFX=true`; use fresh browser storage and no wallet credentials/account creation/signing. Credential-free acceptance cannot prove a live funded claim/refund. Historical isolated-operator/hosted-wallet evidence in archived plans concerns prior implementations, not acceptance of this release. Physical-device touch and actual Tiled-editor save/reload remain separate unperformed checks.

## Enforcement, recovery and candidate limits

Release 1 game offers use disclosed Signet Browser validation, which a modified client can bypass. The game exposes no signing-mode choice. Mutinynet mode selection remains in Admin for controlled testing, with Arkade co-signer as the default and Browser validation as an explicit option; the game client does not create new Mutinynet offers in this release. A failed or unknown submission never authorizes replacement-mode funding. Real contract outputs and network receipts determine financial results. Local UI state cannot confirm payment. See the [C094 acceptance handoff](../openspec/changes/productionize-treasure-chest-contract/acceptance-handoff-2026-10-26.md) for the Signet release scope and recorded live blockers; two-network qualification and B2 recovery remain separate follow-up work.

Open Settings, Account and the BIS contract controls for original-contract recovery. BIS owns password-encrypted portable recovery export/import, reservations and journals. Imported recovery requires verification before actions become available. Preserve original requests and reconcile unknown outcomes before another spend. Browser closure does not guarantee monitoring or recovery. Batch expiry, renewal and unilateral exit remain SDK/operator constraints. Portable export cannot guarantee continuous monitoring, cheap exit or recovery from every batch failure.

Production HTML uses a generated restrictive CSP with exact script hashes and provider origins. A configured public HTTPS signer URL adds only its origin to connection permissions. Credentials must never appear in this public URL. Local policy tests cannot establish deployed resource compatibility. Current negative-admission and delayed-finalization blockers remain open; deterministic and historical live results do not qualify this exact candidate.
