# Design

## Context

See [proposal.md](proposal.md) for scope. The assessment inspected the game's vendored BIS 0.0.23 source archive, the adjacent BIS LTO implementation, game runtime and tests on 2026-10-19. Source inspection establishes intended behavior, not current network execution. No funded transaction or acceptance test ran during planning.

### Evidence and assessment

1. **Real contract construction.** BIS `wallet-layer-arkade/lto-script.ts` constructs a `VtxoScript` with a player-plus-operator hashlocked claim, game-plus-operator refund, and two CSV exit paths. `lto-contract.ts` funds its actual script, spends a selected leaf using `signAndSubmitOffchainTx`, persists submission/finalization material and checks exact indexed sources and outputs. This is substantive contract code. No fabricated runtime transaction identifier or ordinary wallet transfer standing in for the contract was found in this path.
2. **Deadline workaround.** Neither `expiresAt` nor `startedAt` enters `buildLtoScript`. The source explicitly says the deadline is client eligibility and the cooperative refund has no timelock. `contracts.ts` and `lto-service.ts` use `Date.now()` for eligibility. A modified browser can bypass those checks; the present script does not encode a 90-second upper claim bound. Both cooperative spends compete for one output. The game signer can authorize refund before the displayed deadline.
3. **Destination guarantees.** The normal adapter checks intended payout and change before submission, but the signature/hash branches do not themselves covenant the destination. The player and game authorization model, destination substitution attacks and unilateral branches must all be reviewed. Application validation cannot be described as covenant enforcement.
4. **Local trust and durability.** Both signing identities and the preimage are loaded within the same origin. AES-GCM recovery with a nonextractable browser key protects stored bytes, but same-origin executing code can invoke its decryption and signing. IndexedDB compare-and-swap and Web Locks coordinate cooperating contexts on that origin, not other devices or origins. Browser closure stops the five-second refund monitor. Clearing origin storage can remove recovery that mnemonic restoration alone cannot reconstruct, particularly the random preimage and transaction journal.
5. **Useful but limited verification.** BIS script tests decode leaves and round-trip their encoding. Adapter tests mock provider and indexer boundaries. `lto-simulated-operator.test.tsx` uses real SDK signing with an in-process simulated operator. Game tests inject BIS projections. `smoke-bis-contracts.mjs` deliberately uses guest contexts and performs no funded operations. These are valid deterministic tests, not evidence of operator acceptance or contract-level deadline enforcement.
6. **Specification and documentation drift.** Game `treasure-rendering` currently describes capability-based rendering, but `main.js` reveals only after session state becomes `active`. `treasure-runtime.js` can restore an `active` session cache before inspection. The treasure guide still opens with 0.0.18 while package/provenance are 0.0.23. Upstream `limited-time-offers` still specifies a hosted signer and independent-browser shared service despite the current local architecture. These current-state claims need reconciliation, not use as acceptance evidence.

Assessment: credible network-integrated prototype, not established production quality. The substantive shortcut is application-enforced timing and lifecycle control around a real script. Mocked tests are clearly test infrastructure; they become misleading only if presented as live acceptance.

## Goals / Non-Goals

Goals are specified in [treasure-reward-contract](specs/treasure-reward-contract/spec.md) and [treasure-rendering](specs/treasure-rendering/spec.md). The user explicitly selected separate user-owned wallets and no custom application server. Security and operational claims must stay within that boundary. This plan does not claim anti-cheat rewards, a protected operator treasury or mainnet readiness.

The Conditional Vault work in the adjacent BIS repository has different state and acceptance rules. Reuse reviewed capability and VM infrastructure only after checking compatibility; do not treat its unfinished proofs as treasure acceptance or edit its active artifacts.

## Decisions

### Preserve the local wallet model

The browser remains the application signer and active recovery worker. Consent and setup must make clear whose Game Wallet supplies the 1,000 sats. A locally controlled wallet cannot be advertised as a shared publisher treasury protected against the player controlling the browser. An external signing service would solve different authority and scheduling problems, but the user declined that architecture for this change.

Browser storage remains useful for caching and coordination. Production recovery additionally needs a user-controlled, encrypted portable recovery bundle with a versioned descriptor and protected journal. Public descriptors contain network, operator identity, participant public keys, amount, original deadline, script/program commitment, contract outpoint and sanitized operation references. Secrets, preimages and signed recovery artifacts remain private. Restoring on a different device requires explicit import and live reconciliation before any new mutation. Concurrent independent-device spending is not coordinated by browser locks; exact outpoint conflicts and uncertain outcomes must be handled conservatively.

### Use an enforcement proof before funding the replacement

The current script is a legacy format. Do not retrofit it by merely adding CLTV to refund. Arkade's [contract deep dive](https://docs.arkadeos.com/contracts/deep-dive) documents CLTV for collaborative paths and CSV for unilateral exit. A minimum locktime does not establish a maximum claim time, and ordinary Bitcoin time semantics do not guarantee a precise 90-second wall-clock boundary.

Build a specific executable compatibility proof using pinned SDK 0.4.79 and each intended operator. Establish the authoritative time source, rounding, boundary comparison, transaction acceptance point and behavior after delayed finalization. Evaluate supported covenant/program execution only where its independent capability check and signer pins pass. Verify the emitted program, not a JavaScript copy of its rules. No deployment or additional service is authorized by this proposal.

The proof must establish the original deadline in an immutable commitment, a correctly authorized 1,000-sat player payout, rejection authorized by the player, expiry recovery to the game, and resistance to late claims and unauthorized early revocation through every reachable branch. Preserve the existing explicit new Start or session-end cancellation, bound to its original offer and authorized as a local user lifecycle action. A modified Game Wallet path must not silently impersonate that authorization. A claim merely persisted locally before expiry is not necessarily accepted remotely. Define the admission point from real operator evidence. A claim remotely accepted in time may finalize later without being refunded concurrently.

If the existing supported infrastructure cannot provide those rules at 90-second precision, publish a feasibility result, preserve legacy recovery, and block the new production-qualified path. Do not change the amount, deadline, trust model or provider infrastructure as a workaround. That result is a valid investigation outcome, but does not complete C094's production objective. A changed product guarantee requires a subsequent user decision.

### Keep financial ownership in BIS

Create an upstream handoff before changing BIS source. It must reconcile the stale hosted-service requirements, own the script/program, scope and network validation, controlled signing, fee policy, exact receipts, journal durability, portable recovery and legacy execution adapter. The game must receive only safe, versioned public projections with enforcement mode, evidence freshness, supported actions and bound offer terms. It cannot infer safety from `hasContractSupport()` alone.

Preserve zero-fee eligibility and the full 1,000-sat payout. Changed fees or unsupported limits disable new creation until reviewed; they do not silently reduce the reward. Verify asset-preserving change from source and receipt data. Avoid reusing cached scripts across operator signer rotation. Distinguish confirmed Arkade execution from Bitcoin settlement and unilateral exit readiness.

BIS must reject wrong network/operator/identity/offer references, malformed restored records, destination replacement and duplicate operations before signing. Locally mutable offer requests are not proof of gameplay eligibility. Because both wallets are user-owned, this plan makes no claim that software can prevent their owner from creating their own offers or self-transferring funds.

### Keep cached game state out of financial authority

Restored `active` state becomes an unverified presentation state. Reveal/action eligibility requires a matching safe BIS projection for the immutable offer, both wallet networks, current runtime generation and supported enforcement version. On restoration, exact targeted inspection can occur at the explicit progression/open boundary without startup funding or unsolicited toasts. Delayed funding cannot extend the deadline. Pause, hidden tabs, paid continuation and supported level transitions do not restart it.

Retain an already revealed chest if status later becomes pending or unavailable, but disable financial actions. Session replacement invalidates old callbacks and reward feedback. The countdown can tick locally using a monotonic rendering clock anchored to verified terms; it never authorizes a spend. Local timer expiry must not replace an unresolved pre-deadline claim's financial status with a final expired/refunded result.

### Model recovery as a financial operation

Maintain separate eligibility, submission, finalization and evidence states. Reserve before signing/submission and durably persist material before each irreversible provider call. A local UI acceptance or toast never establishes a terminal result. Resume only the original signed submission/finalization where supported; reconcile exact original inputs and outputs first. Missing receipts retain uncertainty and block conflicting spends.

Browser closure cannot execute cleanup. Reopening restores quietly; explicit inspection/action resumes the original operation. Logout, reset and migration must not discard unresolved recovery or imply cancellation. Portable recovery is confirmed before destructive local cleanup. Batch expiry and exit paths require their own capability and recovery tests. A 1,000-sat output may be uneconomic to exit individually, so emergency-exit claims must include real fee funding and timing evidence, or remain explicitly unverified.

### Separate deterministic and funded acceptance

Run deterministic game/public-contract tests without wallet secrets. Add an independently invoked protected financial runner using explicitly granted test wallets, networks and spending limits. Never reuse a grant or execute financial actions merely because the test harness exists. Keep phrases, preimages, signed artifacts and raw provider responses out of logs and reports. Use encrypted private storage for recovery and `output/reports/treasure-contract/` for sanitized diagnostics.

The acceptance matrix covers Signet and Mutinynet independently: fund/claim, reject, expiry/refund, wrong signer/destination, before/at/after deadline, concurrent claim/refund, closed browser and resumed cleanup, lost submit/finalize acknowledgements, storage corruption, recovery import, network replacement, asset-bearing change and depleted Game Wallet. Operator rejections of invalid spends must be demonstrated with validly signed negative fixtures, not just disabled buttons. Proof of one network is not proof of the other. Guest browser checks remain a separate regression gate.

## Risks / Trade-offs

- Exact expiry may be unsupported by current cooperative scripts. The proof blocks production qualification before exposing replacement funding.
- Local compromise controls both wallets. Use restrictive content policy, dependency review, minimal signing permissions and explicit local-custody disclosure; do not claim isolation that same-origin code lacks.
- Browser loss can strand recovery material. Require encrypted export/restore and verifiable targeted recovery; mnemonic-only recovery is not assumed sufficient.
- User-owned independent devices may compete for the same output. Reconcile exact outcomes and preserve reservations; do not promise distributed locks.
- Unavailable operators or liveness deadlines can prevent immediate claim/refund. Retain visible pending state, independent inspection, and a tested recovery procedure.
- Upstream BIS is already dirty with Conditional Vault work. Keep the handoff narrow and import a verified released artifact without bundling unrelated changes.

## Migration Plan

1. Record baseline artifact hashes and sanitized evidence; retain all legacy descriptors and unresolved operations.
2. Complete the enforcement proof and upstream handoff. Failure blocks replacement funding, not legacy reads or recovery.
3. Implement and verify the upstream versioned format under its separately scoped change. Never rewrite the script or deadline of an already funded legacy output. Label legacy timing as application-enforced.
4. Export/import a verified BIS package using established workflows, preserve matched full game/BIS versions for a coordinated release, then adapt the game through public contracts only.
5. Complete deterministic, package, build and protected live acceptance, including real game UI claim/reject. Review the result before any production qualification.
6. Roll back new creation by capability/version gate. Retain the adapter and journal readers needed to inspect and resolve both legacy and replacement contracts. Never roll back by clearing wallet storage or replaying uncertain work.

## Open Questions

The proof will determine supported enforcement mechanism, authoritative clock precision and executable acceptance point. These are bounded technical deliverables with a stop condition, not approved changes to the user experience. No server or treasury architecture decision remains open. Hosting, new networks, mainnet, and replacement guarantees after an infeasible proof require a separate decision and are outside implementation scope.
