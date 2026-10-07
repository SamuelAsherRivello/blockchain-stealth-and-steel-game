<!-- AI: This diagram has one canonical source in the BIS repository. Keep this page pointed at that shared asset. -->
![BIS sequence diagram](https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/diagrams/bis-sequence-diagram-2.png)

### Legend

1. [Bitcoin](https://bitcoin.org/en/) (Layer 1) — The decentralized base layer that provides final settlement and security.
2. [Ark](https://ark-protocol.org/) (Layer 2) — An off-chain Bitcoin transaction-batching protocol for fast, low-cost payments with self-custodied exits to Layer 1.
3. [Arkade](https://arkadeos.com/) (Layer 2) — A programmable Bitcoin execution layer for wallets, payments, assets, and contracts.
4. [BIS](https://github.com/SamuelAsherRivello/blockchain-integration-service) (Integration) — A TypeScript/React library that connects Arkade workflows to a game through a small, protocol-neutral contract.
5. [Stealth & Steel](https://github.com/SamuelAsherRivello/blockchain-stealth-and-steel-game) (Application) — The host game that owns its scenes, player state, and gameplay consequences after BIS confirms an outcome.

# Deep Dive

This project spans two repositories:

1. [BIS Library](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/deep-dive.md) — reusable TypeScript/React library for Signet and Mutinynet wallet and blockchain workflows.
2. [Stealth & Steel Game](https://github.com/SamuelAsherRivello/blockchain-stealth-and-steel-game/blob/main/stealth-steel/documentation/deep-dive.md) — a TypeScript stealth-action game that consumes BIS.

---

## Stealth & Steel Game

### Roles

- **BIS** owns the package boundary, account and wallet UI, local wallet lifecycle, and truthful provider outcomes.
- **Stealth & Steel** implements `IBisGame`. It owns runs, scenes, pause state, player revival, reward presentation, and the decision whether a confirmed result still applies to the current run.

Read the [BIS Deep Dive](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/deep-dive.md) alongside this page: BIS confirmation stops at `IBisGame`; a game effect begins only after this repository accepts that delivery.

### `IBisGame`

[`createBisGame`](../src/runtime/integration/bis-host-game.js) implements the published [`IBisGame`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/state-layer-core/bis-game.ts) boundary. It exposes no Arkade types or scene objects to BIS.

```ts
// Collects the protocol-neutral callbacks owned by the game.
interface IBisGame {

  // Returns the current run identity, or no session outside an active run.
  getActiveGameSession(): BisGameSession | undefined;

  // Captures an opaque target only when the current run permits continuation.
  captureContinuationTarget(input: { gameSession: BisGameSession }): BisGameContinuationTarget | undefined;

  // Applies one confirmed continuation effect to the matching game session.
  applyConfirmedContinuation(input: BisGameConfirmedContinuation): Promise<BisGameEffectReceipt>;

  // Presents one confirmed player reward to the matching game session.
  presentConfirmedPlayerReward(input: BisGameConfirmedPlayerReward): Promise<BisGameEffectReceipt>;

// Ends the game-owned BIS contract.
}
```

`BisGameSession` holds a stable `gameId` and per-run `gameSessionId`. The continuation target stays opaque to BIS. The game returns `applied`, `already-applied`, or `not-applicable`; these effect receipts report game presentation only, not payment, minting, or reversal status.

### Game-owned delivery rules

The adapter issues a continuation target only during `LEVEL_LOST`. It keeps a per-session delivered-operation ledger, so replayed operations produce `already-applied`, and a result for an old or inactive run produces `not-applicable`.

```js
// Creates the game-owned implementation of the BIS contract.
const bisGame = createBisGame({

  // Gives every active run a stable, opaque session identity.
  gameId: 'stealth-and-steel',

  // Returns the active run only while gameplay has a valid session.
  getActiveGameSessionId: () => activeRunId(),

  // Allows a continuation target only from the defeat state.
  canCaptureContinuation: () => state === GameState.LEVEL_LOST,

  // Delegates a confirmed continuation to the existing revival behavior.
  applyContinuation: revivePaidPlayer,

  // Delegates a confirmed reward to the game-owned presentation behavior.
  presentPlayerReward: showGameOwnedReward,

// Finishes the immutable game contract implementation.
});
```

The continuation callback uses the existing game revival path. It preserves player replacement, local enemy cleanup, and pause/resume behavior. A reward callback remains a game-owned presentation decision.

### `BisService`

[`createBisAccount`](../src/runtime/integration/bis-account.js) dynamically imports the vendored package and creates its public [`BisService`](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/packages/integration/src/client/integration-layer/bis-service.ts) facade with a callback for the current game implementation.

```js
// Creates the BIS lifecycle facade with the current game callback.
const services = new BisService({ getBisGame: () => bisGame });

// Waits for persisted account state before exposing BIS workflows.
await services.ready();

// Mounts BIS-owned account UI in the game-provided container.
services.mount(container);

// Creates a continuation controller after the game supplies a valid target.
const controller = services.createContinue({ onEffectReceipt });
```

`BisService` composes BIS-owned context, game wallet, LTO, and UI; hydrates account state before workflows; and disposes those resources in reverse order. The game account host only adapts the service into the game frame, focus, pause, Settings, and restart behavior. It keeps account loading independent of game startup, so ordinary play continues when BIS, an account, or a network connection is unavailable.

### Safety boundary

Opening Settings → Account mounts UI and may hydrate stored local state, but it does not initiate a wallet operation. Payment, asset, contract, and continuation operations are created only through an explicit player action in BIS. The game never handles wallet credentials, recovery phrases, or signing material.
