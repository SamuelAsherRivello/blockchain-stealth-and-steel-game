<!-- AI: The diagram has one canonical source in BIS. Do not copy it here. -->
![BIS sequence diagram](https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/diagrams/bis-sequence-diagram-2.png)

# Deep Dive

Stealth & Steel is a JavaScript/Babylon Lite game with focused JSDoc/TypeScript boundary checks. BIS is the separate TypeScript/React library for Signet and Mutinynet workflows. Read the companion [BIS Deep Dive](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/deep-dive.md). The shared diagram is a conceptual economic overview: “Pay-To-Play” means optional paid continuation here; “Play-To-Earn” corresponds to a confirmed contract reward. It is not a literal API sequence or a game-to-Bitcoin interface.

## 1. Contracts

The [installed artifact/provenance](../vendor/BIS_PROVENANCE.md) and public exports are authoritative. The [communication analysis](BIS_GAME_COMMUNICATION_EXPLORATION.md) contains the full type inventory and responsibility table.

| Surface | Owner and purpose |
| --- | --- |
| `IBis` | Complete game → BIS named-command and safe-snapshot interface. |
| `BisService` | BIS runtime class implementing `IBis`, with private context/wallet/LTO/UI/controller composition. |
| `IBisGame` | All five BIS → game callbacks: session read, target capture, continuation application, reward presentation, `onBisEvent`. |
| `createBisGame()` | Actual game-owned JavaScript implementation factory, not a shared adapter class. |
| `BisSnapshot`, `BisCapabilities`, `BisEvent` | Copied readonly projection, capability reasons, state/Account/restart/operation notifications. |
| `BisGame…Request/State`, `BisContract…`, `BisResetResult` | Workflow inputs/progress, financial offers and safe reset outcomes, not controller handles. |

The [public-type fixture](../src/test/integration/fixtures/bis-contract-types.ts) checks every facade command and rejects missing host callbacks, private member access and mutable projections. The [checker](../../tsconfig.bis-contract.json) uses the actual installed package, not a path substitution/declaration mirror. BIS-published system types use `IBis`/`Bis`; game-integration types use `IBisGame`/`BisGame`. Unrelated game code needs no renaming.

## 2. Bootstrap and notifications

[`createBisAccount()`](../src/runtime/integration/bis-account.js) imports only the package root and public stylesheet. It holds a typed `IBis`, awaits `ready()` and mounts into the game-owned frame. There is no `getSession()` or low-level factory fallback. An unavailable import shows Back/retry; guest gameplay and baseline equipment still work. Initial equipment readiness is bounded by the existing 1.5-second fallback.

This canonical public example is compiled by the fixture:

```ts
import { BisService, type IBis, type IBisGame } from '@bis/integration';
import '@bis/integration/style.css';

export async function mountBis(game: IBisGame, container: HTMLElement): Promise<IBis> {
  const bis: IBis = new BisService({ getBisGame: () => game });
  await bis.ready();
  bis.mount(container);
  return bis;
}
```

[`main.js`](../src/runtime/main.js) supplies the lazy current host getter, and `IBisGame.onBisEvent` routes to the private game Account handler. Its game-local listeners distribute snapshots to views; those listeners are not BIS subscriptions or a third cross-component contract.

`stateChanged` supplies safe state. `accountClosed` explicitly returns to Settings; the host no longer infers closure from context views. Closure is queued so a same-turn stable `restartRequested.logoutId` takes precedence and is deduplicated. Account preserves pause reasons, native geometry, fullscreen relocation, inert controls and focus trapping. The passive mount keeps BIS toasts available after Account closes. `operationChanged` is available as a typed notification; these views obtain receipts from workflow snapshots.

## 3. Session-bound effects

[`createBisGame()`](../src/runtime/integration/bis-host-game.js) implements all five callbacks. `BisGameSession.gameId` is the application ID; `gameSessionId` is this runtime's UUID. A continuation target is captured only in `LEVEL_LOST`. BIS captures the originating host/run/target before financial work, never substitutes the run current at confirmation.

The game keeps applied and in-flight entries keyed by application/session/operation. It reserves before yielding, waits for overlapping duplicates, then revalidates the run immediately before a synchronous mutation. Optional asynchronous preparation cannot mutate gameplay. An applied duplicate returns `already-applied`; stale, ended, disposed, failed or mismatched-target work returns `not-applicable`. Preparation failure releases the in-flight entry without authorizing another financial operation.

The paid-revival commit uses [the existing revival path](../src/runtime/gameplay/paid-revival.js): replace the dead player through the initial spawn factory, clear nearby enemies and resume only the loss pause. Confirmed rewards use [game-owned feedback](../src/runtime/integration/bis-game-reward-feedback.js), visibly distinguishing asset quantity/name from a sats payout. The game chooses copy and placement; BIS does not manipulate scenes.

Main invalidates the session before restart/level-transition animation, local reset and disposal. A disposed adapter supplies no active session and ignores later notifications. Financial confirmation and `BisGameEffectReceipt` are separate: `applied`, `already-applied`, or `not-applicable` never means paid/minted/refunded, and presentation failure never remints, repays or reverses funds.

## 4. Every workflow through `IBis`

| Game consumer | Commands and projection | Preserved policy |
| --- | --- | --- |
| [Loss flow](../src/runtime/integration/pay-to-continue.js) | `beginContinuation`, `payContinuation`, `checkContinuation`, `endContinuation`; `snapshot.continuations` | BIS's 1,000-sat price; pending navigation guard; close only on applicable effect receipt. |
| [Trophy flow](../src/runtime/integration/level-reward.js) | `beginReward`, `refreshReward`, `collectReward`, `checkReward`, `acknowledgeReward`, `endReward`; `snapshot.rewards` | Level 1–3 metadata, quantity one, ownership/uncertainty/recheck/acknowledgement and navigation guards. Actual reward state, not Game-Wallet/contract readiness, governs availability. |
| [Items](../src/runtime/ui/items-ui.js) | `refreshEquipment`, `selectEquipment`, `clearEquipment`; `snapshot.equipment` | Player-only ownership/selection, nine-item catalog; game [movement/combat interpretation](../src/runtime/gameplay/equipment-effects.js) remains separate. |
| [Treasure bridge](../src/runtime/integration/treasure-runtime.js) | `startContract`, `checkContracts`, `claimContract`, `rejectContract`, `endContractSession`; `snapshot.contracts` | Exact offer/purpose/reference/wallet scope; 1,000 sats and original 90-second wall-clock deadline. See [treasure guide](treasure-lto.md). |
| [Settings](../src/runtime/ui/settings-ui.js) | Await `resetForGame`; inspect completed/failed `BisResetResult` | Clear game settings separately; block duplicate clicks, show failure and allow retry. Absent BIS is not an absent-wallet error. |

`queryContracts` is available for non-reconciling reads; the game uses the recovery-aware check command for explicit inspection. `getSnapshot`, capability queries and lifecycle/loading commands are available without exposing mutable BIS services. Begin commands allocate workflows; they do not themselves charge or mint. Showing a completion screen can read ownership, but only Collect initiates collection.

Treasure financial updates arrive even with its window closed; its timer now renders countdown only. Updates never open a window. Offer eligibility may span level transitions without allowing an old run's effect in a new run. Start before BIS readiness skips funding instead of retroactively creating an offer.

## 5. Identity, cleanup and presentation compatibility

`BisWalletReference` carries profile/network. `BisContractRequest.offerSessionId` is the financial offer lifetime, mapped to legacy `sessionId`; queries expose both. Compatibility `BisContractFilter.gameId` and contract `scope.gameId` mean Game **wallet profile**, not application ID. `operationId` identifies a financial operation and its delivery; do not reuse it for unrelated effects. Game treasure persistence records wallet/network bindings. Legacy snapshots without a network binding are interpreted as Signet, never silently rebound across networks.

BIS owns wallet setup, recovery, signing, journals, locks, pending reconciliation and safe outcomes. Detailed Account reads/actions remain embedded BIS UI responsibilities, not gameplay APIs. Reset/disposal invalidate late local work; `preserveContracts` preserves offer eligibility across supported transitions. Neither cancels submitted remote transactions or guarantees remote recovery.

The public stylesheet and mount container are supported presentation inputs. Existing host CSS also depends on `.bis-toast-lightning`, `.bis-network-anchor` and `.bis-version-label`; these remain explicit implementation-selector compatibility dependencies, not official typed API/theme hooks or state channels. No wallet state is read from DOM/CSS. A future public theme API would remove this remaining presentation coupling; this refactor does not claim to provide one. Issued artwork URLs are immutable presentation contracts and remain unchanged.

## 6. Release and evidence

BIS releases first. The game imports its exact versioned archive, verifies archive/all installed file hashes and provenance, then publishes the identical complete version. The production metadata hook rejects version mismatch, derives `vX.Y.Z` from the package and records the final uncompressed build size using a fixed twelve-digit field.

Each repository publishes independently on its own `main` push: BIS Admin/Marketplace together, game at its single stable Pages route. No tag, GitHub Release or manual dispatch is required. See [release instructions](../../README.md#-release-version).

Automated fixtures cover stale/concurrent delivery, actual public types, Account ordering, workflow states and reset. Credential-free browser acceptance uses the imported runtime with both `muteMusic=true&muteSFX=true`; it never creates accounts or fabricates financial confirmation. Full-game live payment/mint/claim and physical-device acceptance are distinct, unperformed gates. [C088](../../openspec/changes/formalize-bis-game-contracts/tasks.md) records implementation and publication progress; this explanation alone does not establish a successful online game deployment.
