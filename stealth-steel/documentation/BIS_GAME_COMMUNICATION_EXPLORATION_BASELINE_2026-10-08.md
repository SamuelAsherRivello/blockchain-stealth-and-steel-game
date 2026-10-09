> Historical baseline only — 2026-10-08. Its observations, versions, source-line references and failures describe the pre-C088 implementation, not current guidance. See [the as-built communication analysis](BIS_GAME_COMMUNICATION_EXPLORATION.md). The former declaration mirror was removed by C088; source links otherwise point at evolving files.

# BIS ↔ Stealth & Steel communication exploration

Exploratory analysis, 2026-10-08. This is a description of the current boundary and a set of design thoughts for formalizing it; it is not an approved implementation plan.

## 1. Contracts

The proposed runtime boundary has two main interfaces: the game calls `IBis`, and BIS calls `IBisGame`. Named methods on those interfaces cover requests, reads, notifications and confirmed effects. Supporting types describe the exchanged data; they do not provide additional communication channels. This section records a proposed design, not interfaces already implemented by this analysis.

The naming rule applies only to the interaction contract that BIS creates and publishes, currently through `@bis/integration`. It does not prescribe names for unrelated game code, scenes, UI, combat, persistence or implementation adapters.

| Contract category | Interface prefix | Data-type / class prefix | Examples |
| --- | --- | --- | --- |
| BIS system infrastructure | `IBis` | `Bis` | `IBis`, `BisService`, `BisSnapshot`, `BisNetwork`, `BisWalletReference`, `BisContractState`. |
| BIS-published game integration | `IBisGame` | `BisGame` | `IBisGame`, `BisGameSession`, `BisGameOperationReference`, `BisGameContinuationRequest`, `BisGameRewardState`, `BisGameEquipmentItem`. |

Generic accounts, assets, networks, wallet references, financial contracts and service lifecycle belong to the system category. Gameplay-session bindings, continuation, game rewards, equipment and game-effect receipts belong to the game-integration category. Classification follows what the type represents, not which repository consumes it. Current-name inventories remain unchanged as evidence; proposed names follow this rule, including renaming the currently published `TestNetwork` to `BisNetwork` at the public boundary.

| Interface / implementation surface | Current status | Proposed role | Supporting shared types |
| --- | --- | --- | --- |
| `IBis` | Does not currently exist. Game requests use `BisService`, its public fields, factories and controllers. | Main game → BIS interface: initialization, mounting/Account UI, snapshots/capabilities, equipment, continuation, rewards, contracts, status checks, reset and disposal. | `BisOptions`, `BisDisposeOptions`, `BisSnapshot`, `BisCapabilities`, workflow request/state types, `BisOperationResult`, `BisError`, `BisResetResult`. |
| `IBisGame` | Published interface with active-session read, continuation-target capture, confirmed-continuation application and confirmed-reward presentation. | Main BIS → game interface: retain the four explicit methods and add `onBisEvent(event)` for state changes, Account dismissal, restart requests and operation notifications. Deliver effects with session binding and typed receipts. | `BisGameSession`, `BisGameContinuationTarget`, `BisGameConfirmedContinuation`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt`, `BisEvent`. |
| `BisContext` | Published interface exposing account state, subscriptions/events, Account navigation and wallet operations. Game currently accesses it through the facade. | Remain behind `IBis` for this game's integration. Publish the game-relevant projection and notifications through the two main interfaces. | Current `BisState`, `BisEvent` and wallet result types; proposed `BisSnapshot`, `BisCapabilities`, expanded `BisEvent`. |
| Equipment and asset-collection controller return types | Public factories expose controller objects, with named state/options types but no separate named controller interfaces. | Keep controller ownership within BIS. Route actions and state through `IBis`, using stable workflow/operation references where needed. | Current `BisEquipmentState`, `BisAssetCollectionOptions`, `BisAssetCollectionState`; proposed `BisGameEquipmentItem`, `BisGameEquipmentState`, `BisGameRewardRequest`, `BisGameRewardState`, `BisGameOperationReference`. |
| Continuation and LTO controller return types | Public factories expose controller objects. Continuation also delivers through `IBisGame`; treasure currently calls `.lto` directly. | Route continuation and contract commands/status through `IBis`; confirmed game effects and notifications through `IBisGame`. Remove raw controller/session access from the game boundary. | Current `BisGameContinueOptions`, `BisGameContinueState`, `BisLtoRequest`, `BisContractFilter`, `BisContract`; proposed `BisGameContinuationRequest`, `BisGameContinuationState`, `BisContractRequest`, `BisContractFilter`, `BisContractState`. |
| `BisService` | Existing concrete facade class, not an interface. | Implement `IBis` and retain internal composition ownership. Game consumers depend on the interface rather than its context/wallet/LTO/UI fields. | `BisOptions`, `BisDisposeOptions` and the request/result types above. |
| Game adapter from `createBisGame()` | Existing factory returns an object implementing `IBisGame`. | Continue implementing `IBisGame`; add notification handling, explicit session invalidation and concurrent-delivery protection. A new class is not required. | Game-session, confirmed-effect, receipt and event types above. |

The supporting type inventory is:

| Shared types | Meaning |
| --- | --- |
| `BisOptions`, `BisDisposeOptions` | Initialization, host UI configuration and cleanup/preservation choices. |
| `BisSnapshot`, `BisCapabilities`, `BisEvent` | Safe state projection, feature/action availability with reasons, and typed notifications. |
| `BisNetwork`, `BisWalletReference` | BIS network and wallet profile/network identity; generic system facts independent of gameplay. |
| `BisGameSession`, `BisGameOperationReference` | Application/gameplay-session identity and a stable workflow operation bound to its originating game session. Wallet and application identities remain distinct. |
| `BisGameContinuationTarget`, `BisGameConfirmedContinuation`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt` | Opaque continuation target, confirmed continuation/reward delivery, and `applied` / `already-applied` / `not-applicable` receipts. Reward data distinguishes an asset reward from a sats payout. |
| `BisGameContinuationRequest`, `BisGameContinuationState` | Game continuation input, price, financial status and action availability. |
| `BisGameRewardRequest`, `BisGameRewardState` | Game reward definition, collection/ownership status and action availability. |
| `BisGameEquipmentDefinition`, `BisGameEquipmentFamily`, `BisGameEquipmentTier`, `BisGameEquipmentItem`, `BisGameEquipmentSlots`, `BisGameEquipmentState` | BIS-published equipment definitions, categories, tiers, owned item facts and effective selections. |
| `BisAsset`, `BisAssetMetadata`, `BisAssetMetadataValue` | Existing generic wallet-asset payload types, reused inside game reward data where needed. |
| `BisContractRequest`, `BisContractFilter`, `BisContractState` | Offer input and binding, queries, financial outcome and current eligibility. |
| `BisOperationResult`, `BisError`, `BisResetResult` | Typed command results, errors and confirmed reset completion. |

Reuse existing type semantics where they fit, and rename published types where required by the category prefixes. These are readonly data objects, not new shared runtime classes. `BisService` is the existing implementation class to retain. No additional main interfaces or DTO classes are proposed.

All game/BIS runtime API communication should cross `IBis` or `IBisGame`. Account screens, provider calls, wallet setup, journals and internal controllers remain BIS-owned. DOM mounting, the public stylesheet and artwork URLs still have presentation compatibility requirements; interface consolidation alone does not make those dependencies disappear.

## 2. Roles and responsibilities

The game already has a substantial public agreement with BIS. It uses the packaged library, safe state, controllers, events, and a game-owned `IBisGame` implementation. However, that agreement is distributed across several surfaces. `IBisGame` covers only confirmed continuation and asset-reward callbacks; it does not cover Account navigation, logout/restart, equipment, treasure contracts, capabilities, or reset.

| Role | BIS offers | Game offers | Current Contracts | Proposed Contracts |
| --- | --- | --- | --- | --- |
| Integration composer | `BisService` creates and owns the player context, Game Wallet, LTO service, and React UI. | Mounting container, package loading, game adapter and teardown timing. | `BisService` class, `BisServiceOptions`, `BisContext`, `IBisGame`; UI/controller return types are inferred. | `IBis` + `IBisGame`; `BisOptions`, `BisDisposeOptions`, `BisSnapshot`, `BisError`. |
| Player account manager | Network selection, explicit creation/restoration, saved profiles, account selection, recovery UI, logout guards and persistence. | Account entry in Settings; ordinary gameplay without an account. | `BisContext`, `BisState`, `BisEvent`, `TestNetwork`; production Account UI reached through the facade. | `IBis` for Account commands/state, `IBisGame` for notifications; `BisSnapshot`, `BisNetwork`, `BisWalletReference`, `BisCapabilities`, `BisEvent`. Recovery details remain inside BIS UI. |
| Wallet read service | Real balances, receiving addresses, transactions, assets, contracts, refresh and unavailable states. | Decisions about gameplay/menu access based on safe wallet facts. | `BisContext`, `BisState`, `BisBalance`, `BisActivity`, `BisTransaction`, `BisAssets`, `BisContract`, `BisGameWalletState`; embedded UI uses most detailed reads. | `IBis` + `IBisGame`; `BisSnapshot`, `BisWalletReference`, `BisCapabilities`, `BisEvent`, workflow states. Detailed Account reads remain BIS UI-owned unless explicitly included in the host contract. |
| Wallet operation coordinator | Sending, receiving/invoices, Bitcoin↔Arkade swaps/boarding, onboarding, quoting, submitting and checking. | Explicit user entry/actions; truthful presentation of outcomes. | `BisContext`, `BisSendQuote`, `BisSendStatus`, `BisInvoiceReceiving`, transfer/boarding and onboarding return types; mostly accessed inside embedded BIS UI. | `IBis` for game-facing entry/commands, `IBisGame` for notifications; `BisOperationResult`, `BisError`, `BisEvent`, plus `BisGameOperationReference` when an operation is bound to gameplay. Detailed wallet operation types remain internal to the embedded Account workflows. |
| Financial truth and recovery owner | Stable IDs, journals, locks, reservations, pending/unknown states, reconciliation and confirmation. | Applying only applicable confirmed game effects and returning a receipt. | `BisContinueRequest`, `BisContinueResult`, asset request/result types, `BisContractActionResult`, `BisGameConfirmedContinuation`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt`. | `IBis` + `IBisGame`; `BisGameOperationReference`, `BisOperationResult`, `BisError`, workflow states, confirmed-effect types and `BisGameEffectReceipt`. Financial and game-effect results remain distinct. |
| Local Game Wallet manager | Separate network-scoped wallet selection/restoration, balances, payments and assets; acts in lieu of a server in this prototype. | Choosing when game workflows use the selected wallet. | `BisGameWalletState`, factory-inferred Game Wallet API, `BisPlayerRecipient`; setup/secret-bearing methods are used by BIS UI rather than gameplay. | `IBis` + `IBisGame`; `BisWalletReference`, `BisSnapshot`, `BisCapabilities`, `BisEvent`. Wallet setup and signing objects remain behind the interfaces. |
| Paid-continuation service | Current 1,000-sat price, Player→Game Wallet payment, status polling, toast and confirmed delivery. | Valid loss target; revival, nearby-enemy removal and resuming play. | `IBisGame`, `BisGameSession`, `BisGameContinuationTarget`, `BisGameConfirmedContinuation`, `BisGameEffectReceipt`, `BisServiceContinueDeliveryOptions`, `BisGameContinueState`, `BisContinueRequest`, `BisContinueResult`. | `IBis` for continuation actions/state, `IBisGame` for capture/delivery; `BisGameContinuationRequest`, `BisGameContinuationState`, `BisGameOperationReference`, existing session/target/confirmed-effect/receipt types. |
| Generic asset service | Exact-quantity mint/list/burn/delivery, ownership reads and unresolved-mint reconciliation. | Reward identity, eligibility, metadata and gameplay presentation. | `BisContext`, `BisAsset`, `BisMintAssetRequest`, `BisMintAssetResult`, `BisListAssetsResult`, `BisPendingMintResult`, burn/delivery request/results and `BisAssetError`. | `IBis` + `IBisGame`; `BisGameRewardRequest`, `BisGameRewardState`, `BisGameOperationReference`, `BisOperationResult`, `BisError`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt`; reuse `BisAsset` for generic asset payloads. |
| Asset-collection policy helper | Checks ownership, blocks unresolved mints, issues a stable request and exposes collect/check/acknowledge state. | Level 1–3 trophy metadata, success wording and completion UI/navigation. | `BisAssetCollectionOptions`, `BisAssetCollectionState`, factory-inferred collection controller; `IBisGame` for confirmed reward presentation. | `IBis` for collection/check/acknowledge, `IBisGame` for confirmed presentation; `BisGameRewardRequest`, `BisGameRewardState`, `BisGameSession`, `BisGameOperationReference`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt`. |
| Equipment catalog and loadout manager | Classifies game assets, defines nine items, validates ownership and saves one selection per family. | Items window/HUD, movement/combat application and actor snapshots. | `BisEquipmentDefinition`, `BisEquipmentFamily`, `BisEquipmentTier`, `BisEquipmentItem`, `BisEquipmentSlots`, `BisEquipmentState`; factory-inferred controller. | `IBis` for refresh/select/clear, `IBisGame` for state notifications; `BisGameEquipmentDefinition`, `BisGameEquipmentFamily`, `BisGameEquipmentTier`, `BisGameEquipmentItem`, `BisGameEquipmentSlots`, `BisGameEquipmentState`, `BisCapabilities`, `BisEvent`. |
| Limited-time contract service | Funds, claims, rejects/refunds and reconciles offers; separates financial state from eligibility and preserves recovery. | Treasure amount/window/purpose, offer-session binding, chest reveal and interaction. | `BisLtoRequest`, `BisContractFilter`, `BisContractsResult`, `BisContractActionResult`, `BisContract`, `BisGameWalletState`; factory-inferred LTO API currently reached through `.lto`. | `IBis` for offer/query/action/end-session/status, `IBisGame` for notifications and applicable confirmed payouts; `BisContractRequest`, `BisContractFilter`, `BisContractState`, `BisWalletReference`, `BisGameOperationReference`, `BisEvent`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt`. |
| Notification/presentation service | Account screens, operation feedback, queued toasts and receiving-payment notifications. | Window geometry, pause/input/focus and gameplay-specific feedback. | `BisState`, `BisEvent`, `BisToastOptions`, UI factory-inferred methods; internal CSS selectors also form an implicit dependency. | `IBis` for mounting/Account actions, `IBisGame` for notifications/effects; `BisOptions`, `BisSnapshot`, `BisEvent`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt`. Supported styling hooks must be explicitly documented alongside the interfaces. |
| Reset/logout coordinator | Confirmed logout cleanup/restart request; `resetForGame()` clears BIS-owned local state. | Restarting, clearing game settings and reporting completion/failure. | `BisEvent`, `BisServiceResetResult`, `BisServiceResetError`, `BisServiceResetErrorCode`; host currently lacks complete result/error handling. | `IBis` for reset/disposal, `IBisGame` for restart/state notification; `BisResetResult`, `BisError`, `BisEvent`, `BisDisposeOptions`. |
| Admin and Marketplace support | Public admin helpers, checkout/trading and reusable React components. | Separate consumer experiences; no production game gameplay dependency. | Admin factory-inferred API, `BisMarketplaceCheckoutRequest`, `BisMarketplaceCheckoutRecord`, `BisMarketplaceTradingAvailability`, component props; exported but not directly consumed by the game. | No additional game interface: shared game-facing operations use `IBis`/`IBisGame` and their payloads. Admin-only commands and Marketplace-specific presentation/checkout types remain separate consumer scope. |

The proposed columns describe the complete intended host boundary for each responsibility. Existing semantics can be reused, with BIS-published names brought under the system/game prefixes in Section 1. The Current Contracts column preserves actual existing names, including those that need migration. An interface/type entry describes a contract, while `BisService` is identified explicitly as a class and factory return types as inferred object contracts. No naming change is proposed for unrelated game-project code.

Sources: [S1], [S2], [S3], [S4], [G1]–[G9].

## 3. Scope and exact baseline

This report follows the current working files in both local repositories, including existing uncommitted game changes. It does not describe only their committed HEADs.

| Baseline | Observed value |
| --- | --- |
| Game HEAD | `62f3958fe5cd27191fbc2fc430b466cb2abb755d` |
| Game working tree | Already modified before this analysis, including BIS adapter, callback types, runtime, package metadata and vendor artifact. |
| BIS HEAD | `bdb49bfb305a1ae3634fb687bc953443e099f3c3` |
| BIS working tree | Clean when inspected. |
| Game dependency | `file:stealth-steel/vendor/bis-integration-0.0.11.tgz` |
| Installed integration version | `0.0.11` |
| Adjacent integration workspace version | `0.0.16` |
| Recorded artifact source commit | `24c732a3b05992e5aef97525cb6109a0305304f3` |
| Archive SHA-256 | `089e20fb20013e0af84ec117ac5e6b06540350f745c1bc2426a90c0ddd2b41fb` |
| Package verification | Archive hash and all 126 inventoried installed files passed. |

The version numbers differ, but all **123 files under the installed package's `src/` directory** match their corresponding adjacent BIS source files after normalizing CRLF/LF and trailing whitespace. The initial byte comparison reported 12 differences; those were formatting differences. There is no demonstrated source API divergence between these two inspected baselines. This comparison does not establish equivalence of separately built distribution files or future versions.

The installed package is the authoritative input for what this game runs. The adjacent repository provides current specifications, documentation and tests. [P1]–[P4]

Inspection covered production game imports/call sites, the installed public exports and relevant implementations, BIS specifications, game specifications, adapters, UI ownership, persistence and focused tests. No browser account storage was read, and no financial operation was performed.

## 4. What “communicate with BIS” currently means

BIS is embedded in the game as an npm browser library. The game does not call a separate BIS HTTP server, exchange messages with BIS Admin, or depend on Admin being open.

The actual channels are:

1. **Package loading:** dynamic import of `@bis/integration` and its public `style.css` export.
2. **Commands and reads:** calls on `BisService`, its publicly exposed objects and workflow controllers.
3. **State subscriptions:** `subscribe(listener)` signals a change; the listener then calls `getState()`. The callback does not carry a state payload.
4. **Public events:** `context.onEvent()` carries account/restart events.
5. **Game callbacks:** BIS invokes the game-owned `IBisGame` methods for session capture and confirmed effects.
6. **UI embedding:** BIS mounts its React UI inside a game-owned DOM container; DOM events, focus, pause and CSS form a separate integration contract.
7. **Persistence:** BIS owns origin-local account and operation records; the game owns its run/treasure records. Some workflow coordination relies on both lifecycles remaining consistent.
8. **Remote presentation assets:** game trophies and equipment reference artwork hosted under the BIS Pages `/assets/` paths. These are asset URLs, not a BIS transaction API.

Provider/network communication is performed inside BIS's wallet adapter layer. No production game import of the Arkade SDK, private BIS source module, BIS wallet-storage key, or direct BIS network endpoint was found. The game has an unrelated `fetch` wrapper for editor configuration. [G1], [G5], [G8], [S1], [S6]

## 5. Game → BIS: workflow inventory

### 5.1 Startup and Account embedding

`main.js` creates `accountHost` with a lazy `getBisGame()` callback. It immediately requests equipment, which initializes BIS even before the player opens Account. BIS package hydration is therefore not exclusively initiated by the Account button. Initial equipment readiness is bounded by a 1.5-second race; missing equipment produces baseline gameplay.

`createBisAccount.initialize()` prefers `new BisService({getBisGame})`, then takes references to `services.context`, `services.gameWallet` and `services.lto`. It subscribes to state/events before mounting the production UI. It calls `context.ready()` directly, then `services.mount(mount)`.

Opening Account pauses with the `bis-account` reason, blocks siblings with `inert`, traps focus and calls `context.openAccountDialog()`. The first-loading backdrop has no temporary loading message. A 15-second timeout/import failure offers “Back to Settings.” Closing Account leaves the BIS mount alive in a passive overlay so toasts can still render.

The host infers root dismissal from `view: account → empty`, waits one microtask to allow the logout restart event, and then returns to Settings. This ordering is a real behavioral dependency but is not represented as an explicit Account-close event. [G1], [G2]

### 5.2 Paid continuation

After a loss, `createPayToContinue.show()` asks `accountHost.createContinue({onEffectReceipt})` for a controller. `BisService.createContinue()` captures the current `IBisGame`, active session and opaque continuation target **before payment**. It builds a slash-joined continuation `context` string from those values.

The controller exposes `getState`, `subscribe`, `pay`, `check` and `dispose`. BIS owns price, payer/recipient validation, stable operation ID, pending recovery and approximately three-second status polling. The game displays this state and blocks free restart while payment is pending.

After financial success, BIS calls `applyConfirmedContinuation()`. The game revives only from the applicable loss state. The loss UI closes only after an `applied` receipt; its generation guard drops old callbacks. Disposal abandons delivery but does not cancel a submitted payment. [G3], [G6], [S2], [S7]

### 5.3 Level trophies

On level completion, the game supplies:

- Name: `Achievement: Level N`.
- Ticker: `LVLN`, for N = 1, 2 or 3.
- Amount: exact decimal string `'1'`; decimals: `0`.
- Icon: BIS-hosted `/assets/achievements/v2/level-N-trophy.png`.
- Success text: `Level N Trophy collected!`.

The game asks `createAssetCollection()` for a controller and uses `refresh`, `collect`, `check`, `acknowledge`, `getState`, `subscribe` and `dispose`. It respects `busy` and `needsAcknowledgment` before navigation. BIS checks ownership and unresolved operations, performs minting/reconciliation and shows the success toast.

The current helper calls **the Player context's `mintAsset()`**. Its source account is the selected Player Wallet. Meanwhile, the game shows trophy actions only when `hasAssetMintingSupport()` says that a distinct ready Game Wallet has at least 1,000 available sats. This couples the UI gate to a different wallet than the actual mint source. The capability can hide an otherwise possible player-funded mint, or advertise trophy actions even when the player's own eligible funds are insufficient. The mint API still checks its real source; this is a capability/UX mismatch, not evidence that mint funding checks are bypassed. [G4], [S2], [S5], [S8]

### 5.4 Equipment

The game obtains one equipment controller per Account host. It refreshes and subscribes to its state. The Items UI calls `select(assetId)` or `clear(family)`; BIS refreshes ownership before saving a selection and discards selections no longer owned.

The game consumes `ownedItems` and `effective` slots, then maps `effectPercent` values 10/20/30 into movement, outgoing-damage and incoming-damage multipliers. Each spawned actor receives a game-owned equipment snapshot. BIS supplies ownership/catalog/loadout facts; the game applies movement and combat effects.

The catalog is already embedded in BIS: `stealth-and-steel`, Shoes/Dagger/Shield, tiers I–III, prices, names, artwork and percentages. The game repeats knowledge of family names and allowed effect percentages. This is an intentional shared domain model, but it conflicts with describing every part of BIS as generic. [G7], [G9], [S9]

### 5.5 Treasure / limited-time offers

`treasure-runtime.js` accesses `accountHost.getSession().lto` directly. It calls:

- `start(request)`.
- `checkContracts(filter)`.
- `claim(contractId)` / `reject(contractId)`.
- `endSession(sessionId)`.
- `reconcile()` after initialization.

The host creates a distinct treasure session and submits a 1,000-sat, 90-second offer with `purpose: 'treasureLTO'`, `exclusivityKey: 'treasure'` and `hostReference: 'treasure:<id>'`. The game reads player and Game Wallet snapshots to decide whether an offer can start. Starting before BIS is ready remains skipped; readiness later does not automatically create a replacement offer.

BIS supplies contract financial/eligibility/capability fields. The game matches those fields to its local session and translates them into treasure states, chest reveal, countdown and text. Claim/reject acceptance returns `pending`; the game closes the treasure window and later queries final state. Rejection ends eligibility before refund confirmation, so a local `rejected` state is not itself proof of returned funds.

The game stores its own treasure snapshot in `sessionStorage`. Progression and paid continuation preserve the treasure deadline; returning to a fresh run ends the old offer. BIS's recovery service may outlive its UI to reconcile unresolved funding/refunds.

Observation is less complete than persistence: the runtime bridge supplies `getState()` wrappers but does not forward the Game Wallet subscription supported by `createTreasureSession()`. It also has no contract-change subscription. The Treasure UI's half-second timer only inspects contracts while its window is open; initial readiness and offer-start completion trigger individual inspections. If funding remains pending through those inspections and confirms later, the closed-window path has no continuing read to observe it, even though chest reveal requires `active`. This needs targeted acceptance/coverage because BIS reconciliation alone does not publish the game's treasure projection.

This workflow uses a supported exported BIS service, but it bypasses the narrow confirmed-effect callback interface. A treasure claim does **not** flow through `presentConfirmedPlayerReward()`. There is a separate contract-result language. [G5], [G8], [S10]

### 5.6 Reset and teardown

The game Developer button labeled “Clear Local Storage” resets its own settings, then calls `getBisServices()?.resetForGame()` when a facade is available. BIS resets the Game Wallet, contract storage and player context and returns `{status:'completed', resetId}` or throws `BisServiceResetError`.

The host ignores the successful result and has no local `try/catch` or reset status UI. If BIS has not initialized, the facade lookup returns nothing and BIS cleanup is skipped. If BIS reset fails, game settings have already been cleared. The cross-component action is therefore not an atomic “everything cleared” transaction.

During game disposal, workflow controllers and subscriptions are disposed before the facade. A `preserveContracts` choice is derived from the game's saved level-transition record and passed to both treasure and BIS disposal. This preserves recovery across the game's progression/reload behavior. Account dismissal does not erase BIS accounts. [G1], [G2], [G10], [S2]

## 6. BIS → game: complete delivery inventory

| Communication | Payload / result | Game behavior | Contract status |
| --- | --- | --- | --- |
| `getActiveGameSession()` | `{gameId, gameSessionId}` or `undefined`. | Returns one UUID for the current level runtime when playing/lost/complete. | Official `IBisGame`; used by continuation and trophy delivery. |
| `captureContinuationTarget({gameSession})` | `{continuationTargetId}` or `undefined`. | Only captures while lost; target is `continue:<gameSessionId>`. | Official `IBisGame`; used before creating a continuation controller. |
| `applyConfirmedContinuation(input)` | Operation ID, bound game session, continuation target → receipt. | Revives the player, removes adjacent enemies, transitions state and resumes the loss pause. | Official `IBisGame`; used. |
| `presentConfirmedPlayerReward(input)` | Operation ID, game session, reward ID/display name → receipt. | Currently only tests whether the game is `LEVEL_COMPLETE`; no reward-specific presentation is performed here. | Official `IBisGame`; invoked for trophy collection, partly implemented behavior. |
| `restartRequested` event | `{type, reason:'logout', logoutId}`. | Deduplicates IDs, retains pause and invokes game restart. | Official `BisEvent`, outside `IBisGame`; used. |
| `accountConnected` / `accountDisconnected` events | `{type, profileId}`. | Account-host event handler ignores these types. Equipment/capability changes are observed through state instead. | Official, exported, not directly handled by the game. |
| Context subscription | Change notification, followed by `getState()`. | Detects Account dismissal; other helpers read identity/phase. | Official; used, including implicit UI sequencing. |
| Continue-controller subscription | `sats`, status, `canPay`, message. | Renders loss payment state. | Official; used. |
| `onEffectReceipt` | `applied`, `already-applied`, `not-applicable`. | Closes loss UI only for `applied`. | Official facade option; used. |
| Asset-controller subscription | Status, message, busy, collect/check/acknowledgment flags. | Renders trophy controls and blocks navigation where required. | Official; used. |
| Equipment-controller subscription | Owned items, effective slots, readiness/profile. | Updates Items/HUD and future actor equipment snapshots. | Official; used. |
| Contract method results | Contract snapshots plus pending/confirmed/unavailable/etc. | Matches treasure identity, projects its own treasure state and polls. | Official exported LTO API; used directly. |
| Mounted BIS UI and toasts | DOM/React presentation and input events. | Hosts geometry, blocks game interaction when Account is active; retains passive toast mount. | Public mounting API; internal CSS styling is additionally coupled. |

There is no BIS callback that directly spawns a chest, changes a level, alters combat, reloads the browser or starts the game. Those consequences stay in the game. An incoming-payment toast does not automatically imply a gameplay reward. [G1]–[G9], [S2], [S3], [S11]

## 7. Official interfaces and structures: used and unused

### 7.1 `BisService` facade

| Public surface | Production game use |
| --- | --- |
| Constructor with `BisServiceOptions.getBisGame` | Used. |
| `context`, `gameWallet`, `lto` | Used directly, despite being composed by the facade. These are public fields, not private-module imports. |
| `ui` | Facade uses it internally; host does not directly use this field in the normal facade path. |
| `ready()` | Not called directly by the game facade path; game calls `context.ready()`. |
| `mount()` | Used. |
| `openAccountDialog()` | Not called through facade; game calls `context.openAccountDialog()`. |
| `isBisVisible()` | Exported, unused by game; host tracks its own `active` flag and context view. |
| `showLoading()` / `hideLoading()` | Exported, unused; host owns startup backdrop/error state. |
| `hasItemSupport()` | Used. |
| `hasAssetMintingSupport()` | Used for trophy visibility. |
| `hasContractSupport()` | Wrapped by Account host but no production call site to that wrapper found. Treasure instead duplicates a narrower readiness check. |
| `resetForGame()` | Used from Developer settings. Result/error structures are not handled explicitly there. |
| `createEquipment()` / `createAssetCollection()` / `createContinue()` | Used. |
| `dispose({preserveContracts})` | Used. |

There is an explicit `IBisGame` interface for the direction BIS→game, but no comparably narrow named `IBisService` interface for game→BIS. That direction is a concrete class, exported factories and inferred controller return types. [S1], [S2], [G1]

### 7.2 Other package-root runtime exports

These groups account for the remaining runtime exports in the inspected `src/index.ts`. “Not directly used” does not mean the capability is unavailable: the embedded BIS UI and facade use many of them internally.

| Exports | Production game use |
| --- | --- |
| `createBisContext`, `createBisUi`, `createBisGameWallet`, `createBisLto`, `createBisEquipment`, `createBisAssetCollection`, `createBisContinue` | Named only in the legacy fallback branch; normal integration reaches them through the facade. |
| `createBisAdminContext` | Not used. Public but explicitly admin-oriented; game does not use reset/faucet helpers through it. |
| `GameOverlay` | Not used; game has its own host container/adapter. |
| `validateMint`, `normalizeAssetMetadata` | Not called directly; BIS owns validation. |
| `getContinuePriceSats`, `networkLabel` | Not called directly; game renders controller-provided price/messages. |
| `arkExplorerAssetUrl`, `arkExplorerTransactionUrl`, `testNetwork` | Not called directly by production game integration. |
| `advanceLocalMarketplaceCheckout`, `beginLocalMarketplaceCheckout`, `confirmLocalMarketplaceCheckoutLeg`, `readLocalMarketplaceCheckout`, `readLocalMarketplaceCheckouts`, `getBisMarketplaceTradingAvailability` | Not used by game gameplay. Marketplace operations are a different consumer surface. |
| `BIS_STEALTH_AND_STEEL_GAME_ID`, `bisMarketplaceItems`, `classifyBisEquipmentAsset`, `marketplaceItemMetadata` | Not imported directly by the game; equipment helper uses the shared domain definitions internally. Game independently spells its ID/families/effect percentages. |
| `PendingOperations`, `usePendingNotice`, `CopyableValueField`, `BalanceTooltip`, `formatBalanceSats`, `MessageType` | Not imported directly by production game code; presentation/controller internals use related behavior. |

### 7.3 Data contracts

| Structures | Current use / gap |
| --- | --- |
| `IBisGame`, `BisGameSession`, `BisGameContinuationTarget`, `BisGameConfirmedContinuation`, `BisGameConfirmedPlayerReward`, `BisGameEffectReceipt` | Used by adapter JSDoc, but resolved by the game's local declaration mirror during its focused typecheck. |
| `BisServiceOptions`, `BisServiceContinueDeliveryOptions` | Used structurally by constructor/controller options; game does not typecheck those callers. |
| `BisState`, `BisContext`, `BisEvent`, `BisGameWalletState` | Read/handled structurally in JavaScript. No full game-side compiler check of those consumers. |
| `BisGameContinueState`, `BisContinueRequest`, `BisContinueResult`, `BisGameContinueOptions` | Continue state is consumed; request/result are managed inside BIS. Low-level options differ from facade options. |
| `BisAssetCollectionOptions`, `BisAssetCollectionState`, `BisAsset`, `BisMintAssetRequest`, mint/list/pending/error results | Game supplies asset metadata and consumes helper state; raw financial requests/results remain inside BIS. |
| `BisEquipmentDefinition`, item/family/tier types, `BisEquipmentSlots`, `BisEquipmentState` | Consumed as plain objects with game-specific family/effect assumptions. |
| `BisLtoRequest`, `BisContractFilter`, `BisContractsResult`, `BisContractActionResult`, `BisContract` | Passed/read directly by treasure JavaScript. No game-side schema check. |
| `BisServiceResetResult`, `BisServiceResetError`, `BisServiceResetErrorCode` | Public but not inspected in reset handler. |
| `BisBalance`, `BisActivity`, `BisTransaction`, `BisInvoiceReceiving`, `BisSendQuote`, `BisSendStatus`, `BisAssets`, burn/delivery results and `BisPlayerRecipient` | Offered through lower-level APIs/embedded UI; not direct gameplay contracts. |
| `BisAssetMetadata`, `BisAssetMetadataValue`, `BisToastOptions`, marketplace checkout request/record and trading availability | Available to consumers; current game uses only a small structural subset indirectly. |

Public state/event payloads contain public identifiers and operation facts rather than recovery phrases. The broader Game Wallet factory also has account setup methods: `createWallet()` returns an internal-shaped account record containing a phrase and `selectWallet()` accepts it. The embedded BIS UI uses those setup methods; the game does not. Thus “no recovery material in public state/events” is accurate, but “every exported method is incapable of returning recovery material” would be too broad. A future narrow game contract should exclude wallet setup internals. [S1], [S3], [S4]

## 8. Does the game honor the contract?

### 8.1 Behavior that aligns

- Uses the pinned public package and stylesheet, with verified archive/file provenance.
- Does not import private BIS implementation modules or Arkade SDK types in production game code.
- Keeps gameplay available with missing account/equipment/connectivity.
- Lets BIS own financial confirmation, price, wallet validation and unresolved outcomes.
- Provides all four `IBisGame` methods and returns the published receipt values.
- Rejects old-session deliveries and sequential duplicate operation IDs in tested adapter cases.
- Guards paid-continuation UI callbacks with a generation and closes only after a successful game effect.
- Keeps ordinary Account dismissal and disposal separate from account deletion.
- Registers/deduplicates confirmed-logout restart handling and retains game-owned pause/restart behavior.
- Uses fresh BIS equipment ownership before selections and baseline gameplay on unavailable equipment.
- Keeps pending financial recovery distinct from host UI/controller disposal.

### 8.2 Confirmed gaps and evidence-backed concerns

| Finding | Evidence and impact | Classification |
| --- | --- | --- |
| Concurrent duplicate effects are not serialized. | `delivery()` records an operation ID only after awaiting the effect. A local async-reward probe delivered the same operation twice concurrently: **two effects; two `applied` receipts**. Sequential tests pass but do not cover overlap. | Reproduced contract gap. Current runtime callbacks are synchronous, which narrows practical exposure, but the adapter explicitly allows async callbacks. [G6] |
| Session can change during an awaited effect. | Session identity is checked only before `await apply()`. A second probe changed the session while an async reward callback awaited: it still executed and returned `applied`. | Reproduced adapter lifecycle gap for async effects. Actual current callbacks are synchronous; a future async presentation must define cancellation/revalidation. [G6] |
| Reward receipt reports presentation without presentation work. | `main.js` supplies `presentPlayerReward: () => state === LEVEL_COMPLETE`; it ignores reward metadata. The visible success feedback comes from BIS's own toast. | Current implementation falls short of the game specification's game-owned feedback scenario. The callback is wired but behaves as an acknowledgment. [G2], [G6], [D1] |
| Reward session is captured at completion time. | `createAssetCollection()` obtains `getBisGame()` and the active session inside `onCollected`, after mint success. It does not bind the initiating game session when the workflow begins, unlike continuation. | BIS-side contract weakness. Normal controller disposal/generation guards reduce exposure, but the facade alone does not preserve originating-session identity. [S2] |
| Reward effect receipt is dropped. | BIS calls `presentConfirmedPlayerReward(...).catch(() => {})` without observing the resolved receipt or exposing an `onEffectReceipt` like continuation. | Delivery observability gap; financial truth remains unchanged. [S2] |
| Trophy capability checks the wrong source wallet for this flow. | Visibility requires a funded Game Wallet; the collection controller mints from the Player context. | Verified capability/workflow mismatch. [G4], [S5], [S8] |
| Treasure duplicates readiness policy. | `isTreasureReady()` checks active player, ready Game Wallet and distinct IDs, but omits the official capability's `hasProfile`, `playerConnected` and same-network conditions. | Host policy drift. BIS still independently checks wallets/networks before operations. [G1], [S5], [S10] |
| Treasure lacks observation while its window is closed. | Bridge drops wallet subscription; no contract subscription is forwarded; UI timer calls `inspect()` only for an open window. Chest reveal waits for the game projection to reach `active`. | Static integration gap: funding confirmed after the initial inspections can remain unobserved until another inspection is triggered. No live stuck-treasure claim is made here. [G2], [G5], [G8] |
| Legacy continuation fallback has the wrong options shape. | Without `BisService`, host forwards `{onEffectReceipt}` to `createBisContinue(context, options)`, which requires `{context, onSuccess}` and throws when `context` is absent. | Broken compatibility path. Dormant with the verified installed package. [G1], [G3], [S7] |
| Other legacy fallback composition is incomplete. | Game Wallet fallback omits `playerNetwork`; context fallback omits the facade's Game Wallet role/reset callbacks and wallet-refresh subscription. | Unsupported equivalence assumption. Tests exercise simplified fallback fixtures, not full modern semantics. [G1], [S2] |
| Typecheck proves compatibility with a local copy. | `tsconfig.bis-contract.json` maps `@bis/integration` to `bis-contract.d.ts` and checks only `bis-host-game.js`. | Contract verification gap. Current copy matches inspected published game types; future package drift or wrong service/controller calls can pass this check. [P4] |
| Retired game host is not explicitly invalidated. | Active-session getter does not check `main.js`'s `disposed`; the adapter has no `dispose()`/session-end method. Normal controllers are disposed, but a retained old adapter can still report the old runtime's session. | Static lifecycle concern, not a demonstrated late production delivery. Existing fresh-host tests do not prove old-host invalidation. [G2], [G6] |
| Reset completion is not coordinated. | Settings resets first; absent facade skips BIS; thrown reset lacks host feedback; result ignored. | Cross-component completion/error contract gap. [G10] |
| Specifications still use old language. | Game main spec says `BisHostGame` and names artifact version `0.0.1`; current package/spec uses `IBisGame` and installed version is `0.0.11`. | Documentation drift, not demonstrated source API drift. [D1], [D2], [P1] |

The exploration therefore does **not** support “the game always honors one complete contract.” It supports “the game uses the public package correctly in its main path, with several implicit agreements and specific gaps around delivery, fallback, readiness and reset.”

## 9. Unofficial paths and implicit coupling

“Back door” needs a precise distinction here. Some paths bypass the facade but are officially public. Others depend on implementation details that have no published contract.

| Path | What it actually is | Assessment |
| --- | --- | --- |
| `services.context` / `.gameWallet` / `.lto` | Public fields on the facade. | Supported access today, but broadens the host dependency beyond a small service interface. |
| `accountHost.getSession()` | Game-owned raw composition-object escape hatch containing `api`, context, wallet, LTO, facade and potentially controllers. | Internal to the game, not a BIS export. Treasure uses it instead of a narrow typed offer port. |
| Treasure's `purpose`, `exclusivityKey`, `hostReference` strings | Host-supplied public LTO metadata. | Valid extension points; conventions are handwritten rather than declared as a shared treasure schema. |
| `.bis-toast-lightning`, `.bis-network-anchor`, `.bis-version-label` CSS overrides | Selectors inside BIS-owned UI. | Implicit styling back door. A class rename/internal layout change can alter the game without an API type change. |
| Context `view` transition + microtask ordering | Host interprets public state as dismissal and sequences against restart event. | Supported state access with an undocumented event-order dependency. |
| Local `bis-contract.d.ts` module declaration | Replaces installed package declarations for one compiler check. | Verification shortcut, not runtime communication. Masks actual-package type drift. |
| Legacy factories when `BisService` is absent | Public low-level APIs reconstructed by the game. | Deliberate compatibility route with no version negotiation and demonstrated shape/semantics mismatch. |
| `game-wallet-public.json` | Old public continuation-recipient configuration. | No production reference found. Normal recipient comes from the local BIS Game Wallet. Retained file/historical documentation can mislead readers. |
| Game `sessionStorage` treasure/level records | Game-owned persistence. | Not a direct read of BIS private storage. Nevertheless, preserve/end semantics span both components. |
| BIS-hosted image URLs | Stable external artwork references embedded in issued metadata and UI. | A presentation/versioning contract separate from service commands. |

No evidence was found of a game-side private wallet import, storage scraping, direct signer access, copied Account screens, or hidden BIS Admin command channel. Absence is based on inspected production code/searches, not a claim about every historical branch. [G1], [G5], [G8], [G11], [P4]

## 10. Language that should be brought together

| Current term | Actual meaning(s) | Suggested shared language |
| --- | --- | --- |
| `gameId` | `BisGameSession.gameId` is application ID `stealth-and-steel`; contract `scope.gameId` and treasure `session.gameId` are the Game Wallet's **profile ID**. | Distinguish `gameDefinitionId` from `gameWalletProfileId` in the contract vocabulary. |
| `gameSessionId` / `sessionId` | IBisGame level-runtime UUID versus treasure run/offer UUID, intentionally preserved across some level transitions. | Define `gameplaySessionId` and `offerSessionId`, with explicit lifetime rules. |
| `context` | The BIS account-context object; also an opaque persisted continuation string. | `playerContext` versus `continuationReference`/structured continuation binding. |
| `continuationTargetId` | One game-defined continuation target for a session. | Keep opaque; document whether it identifies a defeat or an entire runtime and when it expires. |
| `operationId` | Financial request/attempt identity; LTO fund/claim/refund each have their own operation. Adapter also uses it as effect dedupe identity. | Specify issuer, scope, lifetime and whether cross-effect-kind reuse is permitted. |
| `rewardId` | Trophy ticker if available, otherwise asset ID; not a canonical immutable asset identity in all cases. | Separate `rewardDefinitionId`, `assetId` and confirmed delivery identity if both matter. |
| Reward / trophy / item / asset / treasure | Generic wallet asset, game achievement, equipment asset, or sats from a contract. | Define outcome kinds explicitly: asset reward, equipment ownership, sats payout and continuation. |
| `pending` | Controller/payment pending, contract funding/claiming/refunding/unknown, or host waiting for a contract to become claimable. | Preserve domain-specific statuses; define mappings rather than implying one universal pending state. |
| `confirmed` / `succeeded` / `minted` / `owned` / `applied` | Different financial, ownership and gameplay facts. | Keep financial outcome, current ownership and game-effect receipt separate. |
| `ready` / support / `canPay` / `canClaim` | Snapshot readiness, broad feature visibility or immediate action eligibility. | Distinguish capability, current eligibility and operation validation. |
| Logout / reset / dispose / end session | User-confirmed access cleanup, force clearing local state, releasing live resources, ending contract eligibility. | Four separate lifecycle commands with documented persistence consequences. |

The biggest ambiguity is the overloaded `gameId`: an application identifier and a wallet owner identifier look interchangeable in code even though they are not. Treasure persistence also omits an explicit network/operator binding; BIS enforces these in its own records, but the game snapshot does not express that relationship. [G5], [G6], [S3], [S10]

## 11. Thoughts for formalization

### 11.1 Define the supported boundary, not just the callback interface

Document `IBis` and `IBisGame` as the two main host contracts, covering lifecycle, capability reads, state/events, workflow actions and confirmed effect delivery. `BisService` implements `IBis`; the game adapter implements `IBisGame`. Keep workflow controllers within BIS and publish the named request/state/result types in Section 1, following its system/game prefix rule. The rule governs BIS-published interaction types, not the consuming game's unrelated code.

Move this game's `.context/.gameWallet/.lto` and `getSession()` interactions into named `IBis` operations and `IBisGame` notifications. Other consumers may retain explicitly supported lower-level APIs, but those objects do not become additional channels in the proposed two-interface game contract.

### 11.2 Make identity, timing and outcome rules explicit

Publish a common vocabulary for application ID, wallet profile ID, gameplay session, offer session, financial operation and effect delivery. Bind trophy rewards to their initiating session as deliberately as continuation targets. Define concurrent delivery behavior, session invalidation and the distinction between confirming funds and acknowledging a game presentation.

The current receipt union is useful. Keep it, but specify how both workflows expose/record receipts and what happens when an effect throws or becomes inapplicable. A confirmed payment/mint must remain confirmed even when its game effect cannot apply.

### 11.3 Separate generic infrastructure from the game catalog

Account, financial operations, assets and contracts are reusable infrastructure. Shoes/Dagger/Shield, game catalog IDs, prices and percentages are a game domain profile already owned by BIS today. Decide whether to retain that as an explicit supported profile or provide an injected catalog/definition boundary. Do not call the catalog generic while its exported constants and classification rules are game-specific.

The game should continue owning movement/combat consequences. Shared item facts should have one definition, while game application rules can remain separate.

### 11.4 Align capabilities with the operation being offered

Define separate availability for player-funded trophy minting, game-funded asset issuance/delivery, equipment selection, continuation payment and LTO creation. Each should state which wallet funds the action, which network it applies to and whether it is merely a feature flag or an actionable quote/readiness result.

Treasure should consume the agreed capability/eligibility rather than reconstructing it from account snapshots. A capability must not be treated as proof that a later financial submission will succeed.

### 11.5 Decide compatibility and UI extension policy

Either require the pinned facade version or maintain an explicit tested adapter for each supported older version. The presence/absence of a class export is insufficient version negotiation. Remove or migrate orphaned configuration only after confirming supported consumers.

Specify Account-close/restart event ordering and ownership of loading, focus and pause. If host styling is supported, offer stable theme options, CSS variables or documented selectors. The current three internal-selector overrides should be tracked as compatibility obligations until replaced.

### 11.6 Make verification exercise the real boundary

Compile the game adapter and its BIS callers against declarations from the exact verified package. Keep the archive verifier. Add meaningful contract coverage for concurrent duplicates, session changes/teardown during delivery, reward-session binding, receipt handling, reset failure/initialization and network-scoped treasure behavior. Existing controller fixtures remain useful, but they are not a substitute for checking actual facade composition.

These are directions for a subsequent implementation proposal. Sections 1–2 record the proposed interface/type names and scope; this report does not implement those contracts, move domain ownership or apply compatibility changes.

## 12. Verification performed and limits

| Check | Result |
| --- | --- |
| `node stealth-steel/tools/verify-bis-package.mjs` | Passed: SHA-256, 126 installed files and public development/production JS/CSS exports. |
| `npm run typecheck:bis-contract` | Passed, with the local declaration-mirror limitation described above. |
| Focused host/account/continue/trophy tests | 22 passed. |
| Focused treasure runtime/equipment effects/Items UI tests | 11 passed. |
| Installed-versus-adjacent source comparison | 123 matching files under shipped `src/` after line-ending/trailing-whitespace normalization. |
| Concurrent duplicate async reward probe | Two effects, two `applied` receipts: reproduced gap. |
| Session change during awaited async reward probe | Effect ran and returned `applied` after active session changed: reproduced gap. |

The probes exercised the existing adapter in memory and made no wallet calls. No implementation files or tests were changed for this analysis. Full builds, BIS's complete test suite, live financial acceptance and browser interaction were not run; the passing focused tests are not evidence of live payment/mint/claim success.

## 13. Source map

Game sources:

- **[G1]** [Account host adapter](../src/runtime/integration/bis-account.js), especially initialization/events at lines 72–105 and public wrappers at lines 127–165.
- **[G2]** [Main runtime](../src/runtime/main.js), Account/equipment composition at 942–958, treasure/Items wiring at 1157–1223, host callback creation at 1250–1266, disposal at 1841 onward.
- **[G3]** [Paid-continuation lifecycle](../src/runtime/integration/pay-to-continue.js).
- **[G4]** [Level trophy metadata and workflow](../src/runtime/integration/level-reward.js).
- **[G5]** [Treasure session policy](../src/runtime/integration/treasure-session.js), identity matching, state projection, offer request and persistence restoration.
- **[G6]** [Game callback adapter](../src/runtime/integration/bis-host-game.js), delivery logic at 28–35 and four public callbacks at 39–52; [paid revival](../src/runtime/gameplay/paid-revival.js).
- **[G7]** [Equipment effects](../src/runtime/gameplay/equipment-effects.js) and [Items UI](../src/runtime/ui/items-ui.js).
- **[G8]** [Treasure runtime bridge](../src/runtime/integration/treasure-runtime.js) and [Treasure UI](../src/runtime/ui/treasure-ui.js).
- **[G9]** [Equipment tests](../src/test/gameplay/equipment-effects.test.js) and [Items tests](../src/test/ui/items-ui.test.js).
- **[G10]** [Settings/reset handler](../src/runtime/ui/settings-ui.js), lines 155–162.
- **[G11]** [BIS host CSS overrides](../src/runtime/integration/bis-account.css) and [unreferenced public wallet configuration](../src/runtime/integration/game-wallet-public.json).

Package and type evidence:

- **[P1]** [Game package manifest](../../package.json) and [lockfile](../../package-lock.json).
- **[P2]** [BIS provenance](../vendor/BIS_PROVENANCE.md) and [installed-file inventory](../vendor/bis-package-inventory.json).
- **[P3]** [Artifact verifier](../tools/verify-bis-package.mjs).
- **[P4]** [Focused typecheck configuration](../../tsconfig.bis-contract.json) and the removed local declaration mirror (historical).

BIS sources below refer to the adjacent checkout. Corresponding shipped source files were compared with the installed package as described in Section 3:

- **[S1]** [Public exports](../../../blockchain-integration-service/BIS/packages/integration/src/index.ts), [package manifest](../../../blockchain-integration-service/BIS/packages/integration/package.json) and [integration README](../../../blockchain-integration-service/BIS/packages/integration/integration-package-readme.md).
- **[S2]** [BisService facade](../../../blockchain-integration-service/BIS/packages/integration/src/client/integration-layer/bis-service.ts), especially reward delivery at 110–128 and continuation binding at 131–150.
- **[S3]** [Published game types](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/bis-game.ts) and [context state/events/API](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/context.ts), lines 37–129.
- **[S4]** [Game Wallet](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/game-wallet.ts) and [account secret shape](../../../blockchain-integration-service/BIS/packages/integration/src/client/wallet-layer-arkade/account.ts).
- **[S5]** [Capability policy](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/capabilities.ts).
- **[S6]** [Context composition](../../../blockchain-integration-service/BIS/packages/integration/src/client/wallet-layer-arkade/context-composition.ts) and [package boundaries](../../../blockchain-integration-service/docs/readme/package-boundaries-readme.md).
- **[S7]** [Continuation controller](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/game-continue.ts) and [persisted request/result contract](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/continuation.ts).
- **[S8]** [Asset collection](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/asset-collection.ts), [asset types/validation](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/assets.ts) and context `mintAsset()` at line 725.
- **[S9]** [Equipment domain/catalog](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/equipment.ts) and [loadout controller](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/equipment-loadout.ts).
- **[S10]** [LTO service](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/lto-service.ts) and [contract snapshots/lifecycle](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/contracts.ts).
- **[S11]** [UI mount contract](../../../blockchain-integration-service/BIS/packages/integration/src/client/ui-layer-react/client.tsx) and [receiving-payment notifications](../../../blockchain-integration-service/BIS/packages/integration/src/client/state-layer-core/payment-notifications.ts).

Specifications and cross-project acceptance:

- **[D1]** [Game host contract specification](../../openspec/specs/bis-host-game-contract/spec.md).
- **[D2]** [BIS game contract specification](../../../blockchain-integration-service/openspec/specs/bis-game-contract/spec.md).
- **[D3]** [Account integration specification](../../../blockchain-integration-service/openspec/specs/game-account-smoke-test/spec.md) and [cross-project smoke runbook](../../../blockchain-integration-service/BIS/documentation/SMOKE_TEST_BIS_TO_GAME.md).
- Existing [callback tests](../src/test/integration/bis-host-game.test.js), [Account host tests](../src/test/ui/bis-account.test.js), [continue tests](../src/test/ui/pay-to-continue.test.js), [trophy tests](../src/test/ui/level-reward.test.js) and [treasure runtime tests](../src/test/ui/treasure-runtime.test.js).
