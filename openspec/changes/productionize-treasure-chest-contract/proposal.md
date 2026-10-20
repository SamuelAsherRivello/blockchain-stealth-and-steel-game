# Proposal

## Why

The treasure flow uses real Arkade scripts and transactions, but its deadline, cancellation, recovery and verification depend on a trusted browser and have no demonstrated current-release live acceptance. C094 will preserve the chest reward experience while establishing production quality for the user-selected model of separate, user-owned Player and Game Wallets without an application server.

## What Changes

- Preserve explicit Start, one 1,000-sat offer, the original 90-second wall-clock window, funded chest reveal, Claim/Reject/Back, nonblocking gameplay and session-bound reward feedback.
- Define the custody and enforcement contract. Both wallets remain user-owned and local; this does not provide an operator-funded public reward treasury, anti-cheat authority, cross-origin exclusivity or browser-independent scheduling.
- Prove whether the selected Arkade execution path can enforce expiry and authorized early rejection. A refund-after-time branch alone is insufficient to prevent late claims. Gate production qualification on executable boundary and bypass tests plus live proof. If the exact requirement is unsupported, retain recovery and report the limitation; do not silently substitute client time or change the window.
- Make local state a recoverable cache of financial evidence, with portable recovery, immutable descriptors, exact receipt checks, and defined behavior after browser closure, reset, storage loss, identity change and lost acknowledgements.
- Keep all claim/refund authorization in BIS and its real Arkade adapter. Migrate through a verified package artifact; the game continues to use only public `IBis` commands and `IBisGame` events.
- Add a separate controlled financial acceptance suite. Existing credential-free package/browser checks remain credential-free and cannot certify a funded lifecycle.
- Reconcile the treasure-rendering specification with the existing funded-offer reveal policy and update stale current-version documentation.

## Capabilities

### New Capabilities

- `treasure-reward-contract`: User-owned wallet model, immutable offer terms, enforcement qualification, trustworthy financial state, recovery, migration and live acceptance for treasure rewards.

### Modified Capabilities

- `treasure-rendering`: Reveal a chest only for its matching eligible funded offer, preserve its authored rendering and existing interaction, and prevent cached session state from establishing funded eligibility.

## Impact

- Game code in `stealth-steel/src/runtime/integration/treasure-session.js`, `treasure-runtime.js`, `bis-host-game.js`, `ui/treasure-ui.js` and treasure composition in `main.js`; adjacent tests, contract typecheck, documentation and vendored BIS provenance.
- Upstream dependency in the adjacent BIS repository: `wallet-layer-arkade/lto-script.ts`, `lto-contract.ts`, core `contracts.ts`, `lto-service.ts`, `contract-storage.ts`, reservations and public contract DTOs. This game-local change records an upstream handoff; its apply edit root does not itself authorize editing BIS. The upstream change must be explicitly scoped there before implementation.
- Existing BIS `limited-time-offers` requirements still describe a hosted signer and shared service, while current source and project brief describe local wallets and no application server. The upstream handoff must reconcile those stale requirements explicitly against the user's confirmed local model.
- No new server, shared treasury, mainnet launch, paid gameplay change, unrelated wallet refactor or Conditional Vault implementation. Supported network claims require separate evidence for Signet and Mutinynet; unavailable networks remain unavailable.
- This is planning only. Production qualification is conditional on the enforcement proof and live lifecycle matrix, not on completion of planning artifacts or UI tests.
