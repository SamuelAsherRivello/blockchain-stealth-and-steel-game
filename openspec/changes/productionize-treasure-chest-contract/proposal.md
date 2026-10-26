# Proposal

## Why

The treasure flow uses real Arkade scripts and transactions, but its deadline, cancellation, recovery and verification depend on a trusted browser and have no demonstrated current-release live acceptance. C094 will preserve the chest reward experience while establishing production quality for the user-selected model of separate, user-owned Player and Game Wallets without an application server.

## What Changes

- Preserve explicit Start, one 1,000-sat offer, funded chest reveal, Claim/Reject/Back, nonblocking gameplay and session-bound reward feedback. Use the user-approved whole-second deadline rounded down: deadlineSeconds = floor(startedAtMs / 1000) + 90. The effective window is greater than 89 and at most 90 seconds; funding delay consumes it.
- Define the custody and enforcement contract. Both wallets remain user-owned and local; this does not provide an operator-funded public reward treasury, anti-cheat authority, cross-origin exclusivity or browser-independent scheduling.
- Prove whether the selected Arkade execution path can enforce expiry and authorized early rejection. A refund-after-time branch alone is insufficient to prevent late claims. Gate covenant-enforcement qualification on executable boundary and bypass tests plus live proof. On 2026-10-21 the user additionally approved a disclosed browser-validation fallback on Signet and Mutinynet using a real funded contract with browser-enforced eligibility, not simulated transactions. Select and persist the mode before funding; never downgrade an existing contract or fall back after an uncertain submission.
- Make local state a recoverable cache of financial evidence, with portable recovery, immutable descriptors, exact receipt checks, and defined behavior after browser closure, reset, storage loss, identity change and lost acknowledgements.
- Keep all claim/refund authorization in BIS and its real Arkade adapter. Migrate through a verified package artifact; the game continues to use only public `IBis` commands and `IBisGame` events.
- Add a separate controlled financial acceptance suite. Existing credential-free package/browser checks remain credential-free and cannot certify a funded lifecycle.
- Reconcile the treasure-rendering specification with the existing funded-offer reveal policy and update stale current-version documentation.
- Make player responsiveness an acceptance criterion: no treasure-added startup wait, immediate chest presentation and button feedback, coalesced targeted inspection, and financial confirmation independent of window lifetime.
- Preserve stable artwork, layout and focus while requests are slow. Keep Back/Escape usable and expose safe status checking without duplicate claims or refunds. Measure local UI response separately from provider latency.
- Per the user's subsequent 2026-10-21 refinement, Admin is living documentation: one Browser validation option on Signet, Arkade co-signer by default plus Browser validation on Mutinynet. Explicit Admin selections test the chosen path without hidden downgrade. The game API selects the best supported pre-funding mode automatically and offers players no choice. Both modes use real contract transactions; only their enforcement guarantees differ.

## Capabilities

### Frozen BIS milestone, approved 2026-10-21

Finish a bounded BIS acceptance pass before any game import. The current pass
may fix reproducible treasure-specific BIS defects, verify existing behavior,
and document evidence and blockers. It does not add features, upgrade
dependencies, perform onboarding, adopt concurrent server-wallet work, import
or release the game, or change the 1,000-sat reward or original deadline.

Reuse existing matching network receipts. Do not repeat inconclusive co-signer
negative-admission or delayed-finalization probes without new operator
diagnostics or a supported observable interface. Missing live cases have at
most one new funded attempt per case/configuration, 120 seconds of observation
and one original-operation reconciliation. An unknown result retains its
reservation and stops competing spends; it is not a failure or a pass.

The deliverable is a per-mode evidence matrix and final BIS disposition, with
passed, failed, blocked and unperformed checks distinguished. Completing this
bounded pass does not waive production qualification. C094, the game import
and corresponding guarantees remain incomplete wherever required evidence is
blocked. Game implementation and rendering requirements below remain deferred,
not removed.

### New Capabilities

On 2026-10-22 the user authorized a separate BIS hardening/acceptance phase.
The earlier frozen pass remains a historical milestone. Targeted CSP and
documentation dependency fixes and fixtures for its missing live cases are now
in scope. Game import/release and onboarding remain separate. Existing upstream
blockers must not be retried without new diagnostic or protocol evidence.

- `treasure-reward-contract`: User-owned wallet model, immutable offer terms, enforcement qualification, trustworthy financial state, recovery, migration and live acceptance for treasure rewards.

### Modified Capabilities

- `treasure-rendering`: Reveal a chest only for its matching eligible funded offer, preserve its authored rendering and existing interaction, and prevent cached session state from establishing funded eligibility.

## Impact

- Game code in `stealth-steel/src/runtime/integration/treasure-session.js`, `treasure-runtime.js`, `bis-host-game.js`, `ui/treasure-ui.js` and treasure composition in `main.js`; adjacent tests, contract typecheck, documentation and vendored BIS provenance.
- Upstream dependency in the adjacent BIS repository: `wallet-layer-arkade/lto-script.ts`, `lto-contract.ts`, core `contracts.ts`, `lto-service.ts`, `contract-storage.ts`, reservations and public contract DTOs. This game-local change records an upstream handoff; its apply edit root does not itself authorize editing BIS. The upstream change must be explicitly scoped there before implementation.
- Existing BIS `limited-time-offers` requirements still describe a hosted signer and shared service, while current source and project brief describe local wallets and no application server. The upstream handoff must reconcile those stale requirements explicitly against the user's confirmed local model.
- No new server, shared treasury, mainnet launch, paid gameplay change, unrelated wallet refactor or Conditional Vault implementation. Supported network claims require separate evidence for Signet and Mutinynet; unavailable networks remain unavailable.
- Implementation is in progress. Production qualification is conditional on the enforcement proof and live lifecycle matrix, not on completion of planning artifacts or UI tests.

The user explicitly authorized upstream BIS implementation on 2026-10-21. BIS scope is recorded in `BIS/documentation/treasure-production-acceptance.md` in that repository. Separate server-wallet work remains outside C094; preserve its concurrent edits without adopting its custody model implicitly.
