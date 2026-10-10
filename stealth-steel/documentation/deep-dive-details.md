<!-- AI: This is the detailed game-side contract reference. Keep it current with the vendored BIS artifact, use TypeScript terminology for BIS's public integration boundary, distinguish the game's JavaScript runtime, and link back to deep-dive-overview.md for the concise entry point. For every documentation page, format code embeds consistently: introduce the example with a concise explanatory paragraph, leave a blank line, use the correct language fence (`ts` for TypeScript or `js` for JavaScript), keep the example focused on the public API and runnable shape, add short comments inside the code when they clarify intent, and leave a blank line before the closing fence and following prose. -->

# Deep Dive Details

This is the detailed companion to [Deep Dive Overview](deep-dive-overview.md). Stealth & Steel is a JavaScript/Babylon Lite game with focused JSDoc/TypeScript boundary checks. BIS is the separate TypeScript/React library for Signet and Mutinynet workflows. Read the companion [BIS Deep Dive Overview](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/deep-dive-overview.md).

## Contracts

The [installed artifact/provenance](../vendor/BIS_PROVENANCE.md) and public exports are authoritative. The [communication analysis](BIS_GAME_COMMUNICATION_EXPLORATION.md) contains the full type inventory and responsibility table.

| Surface | Owner and purpose |
| --- | --- |
| `IBis` | Complete game → BIS named-command and safe-snapshot interface. |
| `BisService` | BIS runtime class implementing `IBis`, with private context/wallet/LTO/UI/controller composition. |
| `IBisGame` | All five BIS → game callbacks: session read, target capture, continuation application, reward presentation, `onBisEvent`. |
| `createBisGame()` | Actual game-owned JavaScript implementation factory, not a shared adapter class. |
| `BisSnapshot`, `BisCapabilities`, `BisEvent` | Copied readonly projection, capability reasons, state/Account/restart/operation notifications. |
| `BisGame…Request/State`, `BisContract…`, `BisResetResult` | Workflow inputs/progress, financial offers and safe reset outcomes, not controller handles. |

The [public-type fixture](../src/test/integration/fixtures/bis-contract-types.ts) checks every facade command and rejects missing host callbacks, private member access, and mutable projections. BIS-published system types use `IBis`/`Bis`; game-integration types use `IBisGame`/`BisGame`. Unrelated game code needs no renaming.

## 1. `BisService`

[`createBisAccount()`](../src/runtime/integration/bis-account.js) imports only the package root and public stylesheet. It holds a typed `IBis`, awaits `readyAsync()`, and mounts into the game-owned frame. There is no `getSession()` or low-level factory fallback. An unavailable import shows Back/retry; guest gameplay and baseline equipment still work. Initial equipment readiness is bounded by the existing 1.5-second fallback.

This canonical public example is compiled by the fixture:

```ts
import { BisService, type IBis, type IBisGame } from '@bis/integration';
import '@bis/integration/style.css';

export async function mountBis(game: IBisGame, container: HTMLElement): Promise<IBis> {
  const bis: IBis = new BisService({ getBisGame: () => game });
  await bis.readyAsync();
  bis.mount(container);
  return bis;
}
```

[`main.js`](../src/runtime/main.js) supplies the lazy current host getter, and `IBisGame.onBisEvent` routes to the private game Account handler. Game-local listeners distribute snapshots to views; those listeners are not BIS subscriptions or a third cross-component contract.

`stateChanged` supplies safe state. `accountClosed` explicitly returns to Settings; the host no longer infers closure from context views. Closure is queued so a same-turn stable `restartRequested.logoutId` takes precedence and is deduplicated. Account preserves pause reasons, native geometry, fullscreen relocation, inert controls, and focus trapping. The passive mount keeps BIS toasts available after Account closes. `operationChanged` is a typed notification; views obtain receipts from workflow snapshots.

## 2. `IBisGame`

[`createBisGame()`](../src/runtime/integration/bis-host-game.js) implements all five callbacks. A continuation target is captured only in `LEVEL_LOST`. BIS captures the originating host, run, and target before financial work; it never substitutes the run current at confirmation.

The game keeps applied and in-flight entries keyed by application/session/operation. It reserves before yielding, waits for overlapping duplicates, then revalidates the run immediately before a synchronous mutation. Optional asynchronous preparation cannot mutate gameplay. An applied duplicate returns `already-applied`; stale, ended, disposed, failed, or mismatched-target work returns `not-applicable`. Preparation failure releases the in-flight entry without authorizing another financial operation.

The paid-revival commit uses [the existing revival path](../src/runtime/gameplay/paid-revival.js): replace the dead player through the initial spawn factory, clear nearby enemies, and resume only the loss pause. Confirmed rewards use [game-owned feedback](../src/runtime/integration/bis-game-reward-feedback.js), visibly distinguishing asset quantity/name from a sats payout. The game chooses copy and placement; BIS does not manipulate scenes.

## 3. `BisGameSession`

The game invalidates the session before restart/level-transition animation, local reset, and disposal. A disposed adapter supplies no active session and ignores later notifications. Financial confirmation and `BisGameEffectReceipt` are separate: `applied`, `already-applied`, or `not-applicable` never means paid/minted/refunded, and presentation failure never remints, repays, or reverses funds.

## Every workflow through `IBis`

| Game consumer | Commands and projection | Preserved policy |
| --- | --- | --- |
| [Loss flow](../src/runtime/integration/pay-to-continue.js) | `beginContinuation`, `payContinuationAsync`, `checkContinuationAsync`, `endContinuation`; `snapshot.continuations` | BIS's 1,000-sat price; pending navigation guard; close only on applicable effect receipt. |
| [Trophy flow](../src/runtime/integration/level-reward.js) | `beginReward`, `refreshRewardAsync`, `collectRewardAsync`, `checkRewardAsync`, `acknowledgeRewardAsync`, `endReward`; `snapshot.rewards` | Level 1–3 metadata, quantity one, ownership/uncertainty/recheck/acknowledgement and navigation guards. |
| [Items](../src/runtime/ui/items-ui.js) | `refreshEquipmentAsync`, `selectEquipmentAsync`, `clearEquipmentAsync`; `snapshot.equipment` | Player-only ownership/selection, nine-item catalog; movement/combat interpretation remains game-owned. |
| [Treasure bridge](../src/runtime/integration/treasure-runtime.js) | `startContractAsync`, `checkContractsAsync`, `claimContractAsync`, `rejectContractAsync`, `endContractSessionAsync`; `snapshot.contracts` | Exact offer/purpose/reference/wallet scope; 1,000 sats and original 90-second wall-clock deadline. See [treasure guide](treasure-lto.md). |
| [Settings](../src/runtime/ui/settings-ui.js) | Await `resetForGameAsync`; inspect completed/failed `BisResetResult` | Clear game settings separately; block duplicate clicks, show failure, and allow retry. |

`queryContractsAsync` is available for non-reconciling reads; the game uses the recovery-aware check command for explicit inspection. `getSnapshot`, capability queries, and lifecycle/loading commands are available without exposing mutable BIS services. Begin commands allocate workflows; they do not themselves charge or mint. Showing a completion screen can read ownership, but only Collect initiates collection.

## Identity, cleanup and presentation compatibility

`BisWalletReference` carries profile/network. `BisContractRequest.offerSessionId` is the financial offer lifetime, mapped to legacy `sessionId`; queries expose both. Compatibility `BisContractFilter.gameId` and contract `scope.gameId` mean Game **wallet profile**, not application ID. `operationId` identifies a financial operation and its delivery; do not reuse it for unrelated effects. Game treasure persistence records wallet/network bindings. Legacy snapshots without a network binding are interpreted as Signet, never silently rebound across networks.

BIS owns wallet setup, recovery, signing, journals, locks, pending reconciliation, and safe outcomes. Detailed Account reads/actions remain embedded BIS UI responsibilities, not gameplay APIs. Reset/disposal invalidate late local work; `preserveContracts` preserves offer eligibility across supported transitions. Neither cancels submitted remote transactions nor guarantees remote recovery.

The public stylesheet and mount container are supported presentation inputs. Existing host CSS also depends on `.bis-toast-lightning`, `.bis-network-anchor`, and `.bis-version-label`; these remain explicit implementation-selector compatibility dependencies, not official typed API/theme hooks or state channels. No wallet state is read from DOM/CSS. Issued artwork URLs are immutable presentation contracts and remain unchanged.

## Release and evidence

BIS releases first. The game imports its exact versioned archive, verifies archive/all installed file hashes and provenance, then publishes the identical complete version. Each repository publishes independently on its own `main` push: BIS Admin/Marketplace together, game at its single stable Pages route. No tag, GitHub Release, or manual dispatch is required. See [release instructions](../../README.md#-release-version).

Automated fixtures cover stale/concurrent delivery, actual public types, Account ordering, workflow states, and reset. Credential-free browser acceptance uses the imported runtime with both `muteMusic=true&muteSFX=true`; it never creates accounts or fabricates financial confirmation. Full-game live payment/mint/claim and physical-device acceptance are distinct, unperformed gates.
