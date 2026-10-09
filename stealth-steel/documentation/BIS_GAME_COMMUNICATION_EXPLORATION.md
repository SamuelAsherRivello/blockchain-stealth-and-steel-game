# BIS ↔ Stealth & Steel communication analysis

As-built C088 analysis, 2026-10-09. The original [2026-10-08 exploration](BIS_GAME_COMMUNICATION_EXPLORATION_BASELINE_2026-10-08.md) is historical evidence, not current integration guidance. This report follows the BIS 0.0.18 export and the corresponding game migration; task completion and online publication are tracked separately in [C088](../../openspec/changes/formalize-bis-game-contracts/tasks.md).

## 1. Contracts

Two interfaces now carry runtime API communication: the game calls `IBis`; BIS calls `IBisGame`. Supporting types are readonly data, not additional channels. `BisService` is the shared concrete runtime class; the game uses the JavaScript `createBisGame()` factory, not an invented adapter class.

The prefix rule governs only BIS-published interaction vocabulary. System infrastructure uses `IBis…`/`Bis…`; game integration uses `IBisGame…`/`BisGame…`. It does not rename unrelated scenes, AI, gameplay, UI or game storage code.

| Interface / implementation surface | Current status | Intended importance / proposed role |
| --- | --- | --- |
| `IBis` | Implemented/exported; checked against the installed archive. | Main game → BIS contract; adopted. Lifecycle, safe reads and every workflow's named actions. |
| `IBisGame` | Implemented/exported with five required methods including `onBisEvent`. | Main BIS → game contract; adopted. Session/target capture, confirmed effects and all notifications. |
| `BisService` | Runtime class implements `IBis`; context/wallet/LTO/UI/controller composition is private. | Single BIS lifecycle owner; no mutable-service escape hatch. |
| `createBisGame()` | Game-owned factory returns `IBisGame`. | Own active-run applicability, concurrent delivery ledger, synchronous game commits and event routing. |
| `BisContext` and low-level controller/factory APIs | Remain public for supported non-game consumers. Not used by this game's runtime boundary. | Internal to the facade for game use; no additional game contracts proposed. Admin/Marketplace remain separate consumer scope. |
| Additional interfaces or shared runtime DTO classes | None required by this migration. | Named payload types cover data; avoid recreating controller interfaces. |

The complete exchanged vocabulary is:

| Types | Meaning and use |
| --- | --- |
| `BisOptions`, `BisDisposeOptions` | Current game lookup and contract-preservation policy. |
| `BisSnapshot`, `BisCapabilities`, `BisEvent` | Safe copied state, broad capabilities/reasons, typed state/Account/restart/operation notifications. |
| `BisNetwork`, `BisWalletReference` | Public network and profile/network identity. Legacy `TestNetwork` remains available outside this promoted game vocabulary. |
| `BisGameSession`, `BisGameOperationReference` | Application/run identity; stable financial operation with originating run and optional workflow/contract identity. |
| `BisGameContinuationRequest`, `BisGameContinuationState`, `BisGameContinuationTarget`, `BisGameConfirmedContinuation` | Begin input, price/progress/availability, opaque loss target and confirmed effect delivery. |
| `BisGameRewardRequest`, `BisGameRewardState`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt` | Reward metadata/progress and discriminated asset/sats delivery; independent applied/already-applied/not-applicable receipt. |
| `BisGameEquipmentDefinition`, `BisGameEquipmentFamily`, `BisGameEquipmentTier`, `BisGameEquipmentItem`, `BisGameEquipmentSlots`, `BisGameEquipmentState` | Equipment catalog facts, owned items and selected/effective loadout; gameplay interpretation stays game-owned. |
| `BisAsset`, `BisAssetMetadata`, `BisAssetMetadataValue` | Existing generic asset payload vocabulary; confirmed asset rewards reuse `BisAsset`. |
| `BisContractRequest`, `BisContractState`, `BisContractQueryResult`, `BisContractFilter`, `BisContractActionResult` | Offer configuration, safe queries, financial/eligibility state and action outcomes. Compatibility fields retain their original meanings. |
| `BisResetResult`, `BisError`, `BisOperationResult` | Safe reset completion/failure and general result vocabulary. `BisOperationResult` is exported but not the universal return wrapper: commands retain their declared workflow/action return types. |

Type sources: [installed public exports](../../node_modules/@bis/integration/src/index.ts), [BIS boundary declarations](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/64b090f869656057823d023b5e31e202c28930b3/BIS/packages/integration/src/client/integration-layer/bis.ts), [BIS host declarations](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/64b090f869656057823d023b5e31e202c28930b3/BIS/packages/integration/src/client/state-layer-core/bis-game.ts). The installed-package link is local developer evidence; the companion repository links and [provenance](../vendor/BIS_PROVENANCE.md) supply the durable source identity. No handwritten declarations substitute for those exports.

## 2. Roles and responsibilities

Current Contracts describe the installed/as-built boundary, not the historical baseline. Proposed Contracts mark the adopted two-interface design and identify any remaining future work. Detailed wallet functions inside Account are not additional game APIs.

| Role | BIS offers | Game offers | Current Contracts | Proposed Contracts |
| --- | --- | --- | --- | --- |
| Integration composer | One owned context, Game Wallet, LTO worker, UI and transient workflow lifecycle. | Dynamic package/style load, mounting container, current host getter and teardown timing. | `IBis`, `IBisGame`, `BisService`, `BisOptions`, `BisDisposeOptions` | Adopted: same types; no controller factories or raw session object. |
| Player account manager | Explicit creation/restoration/selection, local access, network policy, recovery UI and guarded logout. | Settings entry; ordinary guest/offline play; modal input/focus/pause ownership. | `IBis`, `IBisGame`, `BisSnapshot`, `BisEvent`, `BisWalletReference`, `BisNetwork` | Adopted: same types; recovery/signing material stays within BIS UI. |
| Wallet read service | Balances, addresses, activity/assets/contracts and truthful unavailable state inside Account. | Consume safe capabilities/references and workflow facts, not detailed SDK state. | `IBis`, `BisSnapshot`, `BisCapabilities`, `BisWalletReference`, `BisContractQueryResult` | Adopted: same types; no new detailed wallet-read game interface. |
| Wallet operation coordinator | Explicit sending/invoices/swaps/onboarding and provider validation inside BIS. | User entry and game-specific commands; never invent financial success. | `IBis`, `IBisGame`, `BisEvent`, workflow request/state types | Adopted: same contracts; embedded Account owns detailed quoting/submission. |
| Financial truth/recovery | Stable operation IDs, journals, locks, reservations, reconciliation and confirmed outcomes. | Guard applicable game effects and return a separate receipt. | `BisGameOperationReference`, `BisGameConfirmedContinuation`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt`, `BisContractActionResult` | Adopted through `IBis`/`IBisGame`; effect failure never retries money. |
| Local Game Wallet manager | Separate origin-local profile/network, setup, signing and recovery. | Supply no credentials; use capabilities rather than recreate wallet readiness. | `IBis`, `BisWalletReference`, `BisSnapshot`, `BisCapabilities` | Adopted: same types; no raw Game Wallet handle. |
| Paid continuation | Existing 1,000-sat Player→Game payment, status and confirmation. | Capture loss target; replace player, clear nearby enemies and resume loss pause once. | `IBis`, `IBisGame`, `BisGameContinuationRequest`, `BisGameContinuationState`, `BisGameContinuationTarget`, `BisGameConfirmedContinuation`, `BisGameEffectReceipt` | Adopted: same types, named begin/pay/check/end commands. |
| Generic asset/reward service | Exact-quantity asset operations, ownership and unresolved-mint reconciliation. | Asset identity/eligibility/metadata and game-owned feedback. | `IBis`, `IBisGame`, `BisAsset`, `BisGameRewardRequest`, `BisGameRewardState`, `BisGameConfirmedPlayerReward` | Adopted: same types; do not expose unrelated mint/burn controllers to gameplay. |
| Trophy collection policy | Ownership/uncertainty checks, stable request and collect/check/acknowledge availability. | Level 1–3 trophy metadata, quantity one and completion/navigation UI. | `BisGameRewardRequest`, `BisGameRewardState`, `BisGameOperationReference`, `BisGameEffectReceipt` | Adopted via `IBis`/`IBisGame`; actual operation state governs availability. |
| Equipment catalog/loadout | Nine-item classification, ownership validation and one selected item per family. | Items/HUD and movement/offense/defense interpretation, stable actor snapshots. | `IBis`, `BisSnapshot`, all six `BisGameEquipment…` types | Adopted: same types; Player-only support, no required Game Wallet. |
| Limited-time contracts | Fund/query/check/claim/reject/end, durable progress notifications and recovery. | 1,000 sats, 90-second deadline, purpose/reference/offer binding, eligible chest reveal/interaction. | `IBis`, `IBisGame`, `BisContractRequest`, `BisContractFilter`, `BisContractState`, `BisContractQueryResult`, `BisContractActionResult`, `BisGameConfirmedPlayerReward` | Adopted: same types; no raw LTO, readiness reconstruction or window-driven financial polling. |
| Notification/presentation | Account screens, passive toasts and typed state/Account/restart/operation events. | Native frame geometry, focus/inert/fullscreen handling and reward feedback. | `IBisGame`, `BisEvent`, `BisSnapshot`, confirmed reward/receipt types; mount + public stylesheet | Runtime contract adopted. Future official theme hooks could replace three disclosed implementation-selector overrides. |
| Reset/logout/disposal | Serialized safe local reset, workflow invalidation, stable logout request and preservation choice. | Invalidate run before reset/transition; clear game settings, inspect reset result, show failure/retry. | `IBis`, `IBisGame`, `BisResetResult`, `BisError`, `BisEvent`, `BisDisposeOptions` | Adopted: same types; local cleanup is not remote cancellation. |
| Admin/Marketplace support | Separate supported public helpers/components, checkout and demo experiences. | No game gameplay dependency on those consumers. | Separate non-game BIS exports; neither adds a game contract. | No additional game interface. BIS pushes deploy both demos; game pushes deploy its one stable route. |

## 3. Communication in both directions

### Game → BIS

`ready`, `mount`, `openAccountDialog`, `isBisVisible`, `showLoading`, `hideLoading`, `getSnapshot`, `hasItemSupport`, `hasAssetMintingSupport`, `hasContractSupport`; named workflow groups:

- Continuation: `beginContinuation`, `payContinuation`, `checkContinuation`, `endContinuation`.
- Reward: `beginReward`, `refreshReward`, `collectReward`, `checkReward`, `acknowledgeReward`, `endReward`.
- Equipment: `refreshEquipment`, `selectEquipment`, `clearEquipment`.
- Contracts: `startContract`, `queryContracts`, `checkContracts`, `claimContract`, `rejectContract`, `endContractSession`.
- Cleanup: `resetForGame`, `dispose`.

Beginning a continuation/reward allocates workflow state without charging/minting. Views retain public workflow IDs, not BIS controllers. Contract start is a financial request initiated by the existing explicit game Start policy; its capability is not a promise that submission succeeds.

### BIS → game

`IBisGame` requires `getActiveGameSession`, `captureContinuationTarget`, `applyConfirmedContinuation`, `presentConfirmedPlayerReward` and `onBisEvent`.

Notifications include `stateChanged`, `accountClosed`, stable `restartRequested`, `operationChanged` and retained account connection events. This game handles state/close/restart; operation receipts are consumed from snapshots, while unneeded connection/operation notifications may be ignored. A required handler need not act on every event variant. Throwing host handlers cannot rewrite financial outcomes.

The Account host's local listeners merely distribute these events inside the game. They do not subscribe to BIS context, poll its private storage or form a second BIS channel. A closed treasure window remains closed when a state update arrives; its timer renders countdown only.

## 4. Does the game honor the contract?

The migrated production API path uses the two interfaces. No private source import, Arkade SDK import, raw context/Game Wallet/LTO handle, `getSession()`, mutable workflow factory or declaration-mirror fallback remains in that boundary. The actual installed types and negative fixtures check this claim; tests also scan runtime imports/backdoors.

The original concurrent-delivery gap is resolved by reserving an in-flight application/session/operation entry before yielding. Duplicates await the original receipt; only a successful synchronous commit is marked applied. Revalidation occurs after asynchronous preparation. Reset, restart/level transition and disposal invalidate applicability before replacement, not after its animation.

Confirmed rewards now produce visible game-owned asset/sats feedback rather than merely testing completion state. BIS binds the original run before financial work. A stale callback cannot celebrate an old mint/claim in the replacement run. Receipt failure neither resubmits money nor changes financial confirmation.

Account uses explicit close/restart ordering and stable logout-ID deduplication. Items is Player-only. Trophy actions follow their own workflow state rather than a Game-Wallet capability. Treasure uses public capabilities and exact financial scope; funding updates do not depend on an open UI. Reset failure is visible and retryable, including absent-wallet behavior.

These are implementation/automated conformance findings, not a claim that every live wallet, browser or future call honors the contract. Full online game publication stays incomplete until its independent deployment and runtime checks pass.

## 5. Official, unused and implicit surfaces

| Surface | Used / unused / remaining coupling |
| --- | --- |
| Public package root + `./style.css` | Used; exact local archive and peer versions pinned. |
| `IBis`/`IBisGame` | Used as the complete runtime boundary. Some commands (`showLoading`, `hideLoading`, non-reconciling contract query) are available but not needed by current views. |
| Low-level public BIS factories/context/controllers | Official for supported non-game consumers; deliberately unused by this game's runtime. Being public does not make them part of the new promoted game contract. |
| Admin, Marketplace helpers/components | Unused by game gameplay; separate apps. |
| Account `getSession`, old factory fallback, context-view dismissal inference | Removed; historical analysis explains why. |
| Handwritten `bis-contract.d.ts` / `paths` substitution | Removed; real exported types now checked. |
| Mount container + public stylesheet | Supported presentation compatibility, not state channels. |
| `.bis-toast-lightning`, `.bis-network-anchor`, `.bis-version-label` overrides | Remaining implementation-selector presentation coupling; disclosed, not a new official theme API. No semantic state is inferred from these selectors. |
| Issued BIS artwork URLs | Required immutable presentation dependencies; retained unchanged. |
| Game treasure/level session storage | Game-owned persistence, not scraping BIS storage. Lifetime/identity policy still crosses the boundary through named commands. |
| Old `game-wallet-public.json` | No production reference; historical configuration, not a current recipient channel. |

No game-side credential handling, private signer access, hidden Admin channel or direct BIS-storage read was found in the inspected production boundary. This is a scoped source/search finding, not a universal historical/security guarantee.

## 6. Shared language and exact semantics

| Term | Formal meaning |
| --- | --- |
| Application `gameId` | `BisGameSession.gameId`, here `stealth-and-steel`. Never a wallet ID. |
| Gameplay session | `gameSessionId`, current runtime UUID; inactive after reset/transition/disposal. |
| Wallet identity | `BisWalletReference.profileId` + network. Treasure persists both wallet/network bindings. |
| Offer session | `BisContractRequest.offerSessionId`; original financial eligibility lifetime, possibly spanning levels. Legacy contract/filter `sessionId` means this offer, not gameplay run. |
| Compatibility contract `gameId` | `BisContractFilter.gameId` / contract `scope.gameId` mean Game wallet profile. Retained compatibility, not renamed into an application ID. |
| Operation/workflow/contract | Separate identifiers: financial action, facade-owned transient flow, durable financial record. |
| Confirmed / owned / applied | Financial outcome, current asset ownership, game-effect receipt. Not interchangeable. |
| Asset reward / sats reward | Explicit `kind` union with `asset` or `amountSats`; common originating run/operation/reward identifiers. |
| Capability / eligibility | Broad feature support versus current workflow/action availability; neither guarantees a financial submission. |
| Logout / reset / dispose / end offer | Confirmed access cleanup; forceful local reset; live-resource teardown; financial eligibility end. None promises remote cancellation. |

Legacy treasure persistence without an explicit network key is interpreted as Signet. A new network/profile never silently inherits that eligibility. The retained wallet-profile field names are a compatibility compromise, documented and tested rather than treated as a complete durable-schema rename.

## 7. Evidence, release workflow and limits

The verified provider export is 0.0.18 from commit `64b090f869656057823d023b5e31e202c28930b3`, with 127 packed/installed files and archive SHA-256 `bb9066ff8f82b9a85da0e3bd43255e21ba17a9a788b16145801630fdf8afe118`. [BIS's push Pages run](https://github.com/SamuelAsherRivello/blockchain-integration-service/actions/runs/37901274392) succeeded and both demos identify 0.0.18. [Provenance](../vendor/BIS_PROVENANCE.md) records exact import evidence and history.

BIS releases first; game imports that immutable archive and exports/publishes the same complete version. The production metadata hook rejects mismatch and measures final uncompressed build bytes with fixed-width metadata. Independent `main` pushes publish BIS Admin/Marketplace together or the game's one stable route, without a tag, GitHub Release or manual dispatch prerequisite.

Provider full tests/builds/routes, isolated package consumer/type checks and live demo checks passed. Game-focused contract/workflow tests and publishing/build checks pass; full-suite and muted development/production/live browser gates must also be completed and recorded in C088, not inferred from this prose. Automated delivery fixtures do not constitute live payment/mint/claim acceptance. No credentials, signing, transactions or physical-device acceptance are part of this verification.

## 8. Source map

- [Account gateway](../src/runtime/integration/bis-account.js), [host implementation](../src/runtime/integration/bis-host-game.js), [runtime composition/lifecycle](../src/runtime/main.js).
- [Continuation](../src/runtime/integration/pay-to-continue.js), [trophies](../src/runtime/integration/level-reward.js), [reward feedback](../src/runtime/integration/bis-game-reward-feedback.js).
- [Items](../src/runtime/ui/items-ui.js), [equipment effects](../src/runtime/gameplay/equipment-effects.js), [treasure bridge](../src/runtime/integration/treasure-runtime.js), [treasure policy](../src/runtime/integration/treasure-session.js), [treasure UI](../src/runtime/ui/treasure-ui.js), [reset UI](../src/runtime/ui/settings-ui.js).
- [Archive verifier](../tools/verify-bis-package.mjs), [actual-public-type fixture](../src/test/integration/fixtures/bis-contract-types.ts), [boundary tests](../src/test/integration/bis-public-boundary.test.js), [host tests](../src/test/integration/bis-host-game.test.js).
- [Game deep dive](deep-dive.md), [BIS deep dive](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/64b090f869656057823d023b5e31e202c28930b3/BIS/documentation/deep-dive.md), [cross-project smoke runbook](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/64b090f869656057823d023b5e31e202c28930b3/BIS/documentation/SMOKE_TEST_BIS_TO_GAME.md).
