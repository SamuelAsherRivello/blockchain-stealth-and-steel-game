<!-- AI: This follows the Deep Dive Overview format: always show a diagram with a legend, one overview paragraph with Related Projects, and the three most important concepts. Each concept has a paragraph, a code embed, and a Learn More sentence linking to Deep Dive Details. For every documentation page, format code embeds consistently: introduce the example with a concise explanatory paragraph, leave a blank line, use the correct language fence (`ts` for TypeScript or `js` for JavaScript), keep the example focused on the public API and runnable shape, add short comments inside the code when they clarify intent, and leave a blank line before the closing fence and following prose. Use TypeScript terminology for BIS's public integration boundary and distinguish the game's JavaScript runtime. Keep this structure stable for future BIS/game overview updates. -->
![BIS sequence diagram](https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/diagrams/bis-sequence-diagram-2.png)

### Legend

1. [Bitcoin](https://bitcoin.org/en/) (Layer 1) — The decentralized base layer that provides final settlement and security.
2. [Ark](https://ark-protocol.org/) (Layer 2) — An off-chain Bitcoin transaction-batching protocol for fast, low-cost payments with self-custodied exits to Layer 1.
3. [Arkade](https://arkadeos.com/) (Layer 2) — A programmable Bitcoin execution layer for wallets, payments, assets, and contracts.
4. [BIS](https://github.com/SamuelAsherRivello/blockchain-integration-service) (Integration) — A custom TypeScript/React library that connects Signet or Mutinynet Arkade workflows to a game through a small, game-neutral contract.
5. [Game](https://github.com/SamuelAsherRivello/blockchain-stealth-and-steel-game) (Application) — The custom Stealth & Steel game, which owns scenes and gameplay consequences after BIS confirms an outcome.

# Deep Dive Overview

Stealth & Steel is a JavaScript/Babylon Lite game with focused JSDoc/TypeScript boundary checks. BIS is the separate TypeScript/React library for Signet and Mutinynet workflows. The shared diagram is a conceptual economic overview: “Pay-To-Play” means optional paid continuation here, and “Play-To-Earn” corresponds to a confirmed contract reward. It is not a literal API sequence or a game-to-Bitcoin interface.

### Related Projects

- [Blockchain Integration Service](https://github.com/SamuelAsherRivello/blockchain-integration-service): The reusable TypeScript/React library consumed by this game.
- [Stealth & Steel](https://github.com/SamuelAsherRivello/blockchain-stealth-and-steel-game): This repository, containing the JavaScript/Babylon Lite game.

The game owns scenes, gameplay consequences, and session decisions. BIS owns wallet/provider workflows, financial truth, Account UI, and safe public snapshots. The three-part boundary below is the starting point; continue to [Deep Dive Details](deep-dive-details.md) for every workflow and compatibility rule.

## BIS

### 1. `BisService`

The game consumes the public [`IBis`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/integration-layer/bis.ts) facade implemented by BIS [`BisService`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/integration-layer/bis-service.ts). The game imports the package root and stylesheet, awaits `readyAsync()`, and mounts BIS into a game-owned frame. It does not access Arkade, wallet contexts, recovery data, or private controllers.

```js
// The game loads the public BIS package without making it part of game startup.
const api = await import('@bis/integration');

// Creates the lifecycle facade with the game-owned IBisGame callback.
const bis = new api.BisService({ getBisGame });

// Waits for account state to hydrate before the game exposes wallet workflows.
await bis.readyAsync();

// Mounts BIS-owned Account and wallet UI into the game-owned frame.
bis.mount(container);
```

Learn more about bootstrap, notifications, workflow commands, and presentation boundaries in [Deep Dive Details: BisService](deep-dive-details.md#1-bisservice).

### 2. `IBis`

The game receives the complete public [`IBis`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/integration-layer/bis.ts) service contract. It uses named commands and copied snapshots without accessing BIS wallet contexts, provider objects, or private controllers.

```ts
interface IBis {
  readyAsync(): Promise<void>;
  mount(container: HTMLElement): void;
  openAccountDialog(): void;
  isLoadingUIVisible(): boolean;
  showLoadingUI(): void;
  hideLoadingUI(): void;
  getSnapshot(): BisSnapshot;
  hasItemSupport(): boolean;
  hasAssetMintingSupport(): boolean;
  hasContractSupport(): boolean;
  beginContinuation(request?: BisGameContinuationRequest): BisGameContinuationState;
  payContinuationAsync(workflowId: string): Promise<BisGameContinuationState>;
  checkContinuationAsync(workflowId: string): Promise<BisGameContinuationState>;
  endContinuation(workflowId: string): void;
  beginReward(request: BisGameRewardRequest): BisGameRewardState;
  refreshRewardAsync(workflowId: string): Promise<BisGameRewardState>;
  collectRewardAsync(workflowId: string): Promise<BisGameRewardState>;
  checkRewardAsync(workflowId: string): Promise<BisGameRewardState>;
  acknowledgeRewardAsync(workflowId: string): Promise<BisGameRewardState>;
  endReward(workflowId: string): void;
  refreshEquipmentAsync(): Promise<BisGameEquipmentState>;
  selectEquipmentAsync(assetId: string): Promise<BisGameEquipmentState>;
  clearEquipmentAsync(family: BisGameEquipmentFamily): Promise<BisGameEquipmentState>;
  startContractAsync(request: BisContractRequest): Promise<BisContractActionResult>;
  queryContractsAsync(filter?: BisContractFilter): Promise<BisContractQueryResult>;
  checkContractsAsync(filter?: BisContractFilter): Promise<BisContractQueryResult>;
  claimContractAsync(contractId: string): Promise<BisContractActionResult>;
  rejectContractAsync(contractId: string): Promise<BisContractActionResult>;
  endContractSessionAsync(offerSessionId: string): Promise<void>;
  resetForGameAsync(): Promise<BisResetResult>;
  dispose(options?: BisDisposeOptions): void;
}
```

Learn more about the public commands, copied projections, and cleanup policy in [Deep Dive Details: IBis](deep-dive-details.md#every-workflow-through-ibis).

### 3. `IBisGame`

The game implements [`IBisGame`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/state-layer-core/bis-game.ts) through the [`createBisGame()` factory](../src/runtime/integration/bis-host-game.js). It supplies the active session, captures an opaque continuation target, applies confirmed continuation and reward effects, and receives `onBisEvent` notifications. The game chooses how an effect changes scenes or player state; BIS never manipulates gameplay.

```ts
interface IBisGame {

  // Receives copied BIS state and lifecycle notifications through one game-owned channel.
  onBisEvent(event: BisEvent): void;

  // Identifies the current game run so BIS never delivers an outcome to a different session.
  getActiveGameSession(): BisGameSession | undefined;

  // Records the game-defined point to resume after a verified BIS operation completes.
  captureContinuationTarget(input: Readonly<{
    gameSession: BisGameSession;
  }>): BisGameContinuationTarget | undefined;

  // Applies a confirmed continuation and reports whether the game effect took place.
  applyConfirmedContinuationAsync(input: BisGameConfirmedContinuation): Promise<BisGameEffectReceipt>;

  // Presents a confirmed player reward and reports whether the game effect took place.
  presentConfirmedPlayerRewardAsync(input: BisGameConfirmedPlayerReward): Promise<BisGameEffectReceipt>;
}
```

Learn more about the five callbacks, effect receipts, stale-result protection, session identity, and workflow mapping in [Deep Dive Details: IBisGame](deep-dive-details.md#2-ibisgame).

## Want More Detail?

To learn more about the technical details see the [Deep Dive Details](deep-dive-details.md).
