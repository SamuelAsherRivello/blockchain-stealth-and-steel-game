# Design

## Current two-workflow execution contract

The user explicitly replaced the Signet-only consumer restriction on 2026-10-29. Mutinynet uses Direct and Signet uses Server, with all existing game/account/payment/inventory/reward/Treasure features. Shared BIS composition owns source routing and the upper-left `Server` / `Direct` header; game code consumes the public API. No global force-manual flag may disable Server Signet, and Direct Mutinynet must not probe the BIS service.

Remove the unconditional Mutinynet new-offer ban. The game chooses the qualified Browser validation mode before funding on both required tuples; stronger unqualified modes remain disabled. Direct is a signing-source label, not a contract-enforcement guarantee. Preserve consent, original terms, exact evidence, zero-fee 1,000-sat payout, legacy inspection and original-mode recovery.

The BIS program's finite sequence is authoritative. Implement game-only changes while BIS finishes its public composition. After BIS freezes and package-verifies the candidate, import its exact immutable hash for local integration without waiting for Pages publication. Run required current-candidate tests/types/build/publish checks and actual Direct Mutinynet + Server Signet guest/account/continuation/Treasure flows. Publish matching versions only after acceptance. Sandbox's four-page step 9 must also pass before final release closure; BIS owns those files.

Historical Signet-only tasks remain evidence of their original release, not evidence that new Direct creation, mode routing/header or the new candidate passed. C094-T045/T046/T047 are the new implementation and release gates; C094-T038 and C096-T005/T008/T010 remain mandatory where applicable.

## Current execution ownership

The 2026-10-29 takeover section of the BIS program ledger supersedes historical owner/thread assignments and obsolete package-version observations in this document. It does not supersede contract guarantees or safety requirements. Use the actual accepted candidate version, archive hash and source evidence rather than a historical 0.0.27/0.0.29/0.0.30 observation.

The Treasure/game owner follows the execution order in proposal.md. One owner writes BIS runtime/release files, one writes game runtime/release files, and the coordinator writes the shared program ledger. Only the assigned financial-slot owner may operate protected acceptance wallets. The other owner can prepare wallet-free code, fixtures, synchronization and browser observations.

Preflight the exact test command, browser cache and private temporary-path requirements with a small affected check. Reuse unchanged-source evidence, run focused checks during fixes, and run required integrated checks after the candidate is frozen. Do not start competing suites or replace real hidden-tab or network evidence with injected state.

## Historical Signet-only scope, superseded by the current two-workflow contract

C094 is the Signet-only release slice. It preserves the real contract, wallet consent, immutable terms, exact receipt checks, portable recovery, legacy inspection, and responsive user flow already implemented. New creation is permitted only on Signet using Browser validation, whose weaker browser-enforced expiry is disclosed at the point of selection and in contract details. This mode is a real compiled Arkade contract with real funding/spending; it is not covenant-enforced timing, anti-cheat, or a protected treasury.

Mutinynet new creation is unavailable to the game client in Release 1. Existing Mutinynet contracts remain inspectable and recoverable under their actual original mode. Admin remains the living test documentation already approved: Signet exposes Browser validation only; Mutinynet exposes Arkade co-signer by default plus explicit Browser validation, with no silent downgrade. Those Admin test options do not mean either mode has passed release qualification. The game makes no user-facing mode choice.

The installed baseline is BIS 0.0.30, archive SHA-256 `5f031b0915fb7b865679fdd080c74b3e906a58c0a0f6f1c8a0373a2165da6ede`, with 201 verified packed files. The current takeover authorizes the next exact-artifact import and matching release under C094. Import waits for BIS server acceptance, BIS publication and the accepted archive/provenance handoff. The server proposal's downstream game-verification tasks must not create a circular pre-export gate. Preserve unrelated dirty files; the accepted manifest must truthfully identify source state and prove the packed candidate. Earlier 0.0.27 freezes below describe historical phases and do not cancel this authorization.

Carryover mapping: original open tasks C094-T006/T007/T018/T019/T020/T026/T035 retain their IDs and full requirements in C096. C096 owns Mutinynet/co-signer acceptance, original B2 recovery, two-network funded lifecycle, full rollback, hidden-tab/funded responsiveness, and corresponding independent review. C094's remaining tasks below are interpreted only for Signet and release readiness; none of the historical incomplete tasks is marked complete by this scope change.

### Signet release gates

Before shipping, prove with the exact current package: the game can create no offer on Mutinynet; the Admin selector matches its agreed per-network choices and labels; a real Signet-funded offer supports the claimed player actions and receipt reconciliation; creation-disable rollback preserves new and legacy journals; the built release passes full quality checks; and deployed game routes identify the candidate version. Existing real receipts may be reused only when they match exact artifact, network, mode, terms and lifecycle case. No simulated projections qualify a funded UI case.

If a Signet live case is blocked, keep the Signet release blocked and document the precise stop condition. Do not treat the two-network follow-up as a substitute for a Signet release gate.

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

### Preserve local Player custody and source-bound Game authority

The browser remains the Player signer and active workflow/recovery worker. Direct keeps the user-owned Game signer local; Server uses the explicitly approved private BIS signer. Consent identifies the actual Game Wallet supplying 1,000 sats. Neither source establishes anti-cheat or background completion while all browsers are closed. Keys and old operations never migrate merely because source or network changes.

Browser storage remains useful for caching and coordination. Production recovery additionally needs a user-controlled, encrypted portable recovery bundle with a versioned descriptor and protected journal. Public descriptors contain network, operator identity, participant public keys, amount, original deadline, script/program commitment, contract outpoint and sanitized operation references. Secrets, preimages and signed recovery artifacts remain private. Restoring on a different device requires explicit import and live reconciliation before any new mutation. Concurrent independent-device spending is not coordinated by browser locks; exact outpoint conflicts and uncertain outcomes must be handled conservatively.

### Use an enforcement proof before funding the replacement

The current script is a legacy format. Do not retrofit it by merely adding CLTV to refund. Arkade's [contract deep dive](https://docs.arkadeos.com/contracts/deep-dive) documents CLTV for collaborative paths and CSV for unilateral exit. A minimum locktime does not establish a maximum claim time, and ordinary Bitcoin time semantics do not guarantee a precise 90-second wall-clock boundary.

Build a specific executable compatibility proof using pinned SDK 0.4.79 and each intended operator. The user approved whole-second precision rounded down on 2026-10-20. Compute deadlineSeconds = floor(startedAtMs / 1000) + 90 once from original Start, persist both terms, and commit the deadline in the program. The effective window is greater than 89 and at most 90 seconds. Rendering uses deadlineSeconds * 1000; neither funding completion nor reopening recalculates it. Claim requires emulator time strictly before deadline; expiry refund permits time equal to or later than deadline. Verify the authoritative time source, transaction acceptance point and delayed finalization independently. Evaluate supported covenant/program execution only where its independent capability check and signer pins pass. Verify emitted bytecode, not a JavaScript copy of its rules. No deployment or additional service is authorized by this proposal.

The proof must establish the original deadline in an immutable commitment, a correctly authorized 1,000-sat player payout, rejection authorized by the player, expiry recovery to the game, and resistance to late claims and unauthorized early revocation through every reachable branch. Preserve the existing explicit new Start or session-end cancellation, bound to its original offer and authorized as a local user lifecycle action. A modified Game Wallet path must not silently impersonate that authorization. A claim merely persisted locally before expiry is not necessarily accepted remotely. Define the admission point from real operator evidence. A claim remotely accepted in time may finalize later without being refunded concurrently.

If the existing supported infrastructure cannot provide the approved rounded-down deadline and authorization rules, publish a feasibility result, preserve legacy recovery, and block covenant-enforcement qualification. Do not change the amount or committed deadline. On 2026-10-21 the user explicitly approved the Signet browser-policy fallback below. Other changes to guarantees or provider infrastructure still require a separate decision.

### Select and disclose enforcement before funding

Mutinynet targets the pinned Arkade covenant path. The user's subsequent Admin/API decision on 2026-10-21 approves `browser-policy-v1` on both networks. Admin has one browser-policy option on Signet and two explicit options on Mutinynet, defaulting to Arkade co-signer there. Explicit Admin co-signer selection fails visibly rather than silently choosing another mode. The game API makes no player-facing choice and automatically selects the best path supported by pre-funding capability checks. Signet has no configured stronger option yet; a future independently trusted configuration can add it. Unavailable capability reads may select the disclosed browser-policy mode only before funding. This fallback uses the real legacy script, contract funding and spends; browser time controls eligibility and does not prove network-enforced expiry or destination covenants. Its limitations must appear in public descriptors, Account contract details, the Admin selector and documentation. Never call it simulated execution or covenant-enforced timing.

Persist the selected format and enforcement mode with the immutable original terms before any funding submission. A provider or wallet failure after a durable prepared/submitted operation does not select another mode. Unknown acknowledgements retain the original journal and reservations. Reopening, network changes and upgrade cannot change a funded script. Recovery dispatches by its original format, not current capability. No automatic second funding or reward payment follows an error. Real financial success still requires exact receipt evidence in either mode.

Browser-policy qualification is separate from covenant qualification on each network. It accepts the disclosed browser trust limitation, but not fabricated identifiers, cached balances as payment proof, ordinary wallet transfers presented as contracts, or fake funding/success. An unverified network or incompatible fee policy may still make both modes unavailable.

### Keep financial ownership in BIS

Create an upstream handoff before changing BIS source. It must reconcile the stale hosted-service requirements, own the script/program, scope and network validation, controlled signing, fee policy, exact receipts, journal durability, portable recovery and legacy execution adapter. The game must receive only safe, versioned public projections with enforcement mode, evidence freshness, supported actions and bound offer terms. It cannot infer safety from `hasContractSupport()` alone.

Preserve zero-fee eligibility and the full 1,000-sat payout. Changed fees or unsupported limits disable new creation until reviewed; they do not silently reduce the reward. Verify asset-preserving change from source and receipt data. Avoid reusing cached scripts across operator signer rotation. Distinguish confirmed Arkade execution from Bitcoin settlement and unilateral exit readiness.

BIS must reject wrong network/operator/identity/offer references, malformed restored records, destination replacement and duplicate operations before signing. Locally mutable offer requests are not proof of gameplay eligibility. Because both wallets are user-owned, this plan makes no claim that software can prevent their owner from creating their own offers or self-transferring funds.

### Keep cached game state out of financial authority

Restored `active` state becomes an unverified presentation state. Reveal/action eligibility requires a matching safe BIS projection for the immutable offer, both wallet networks, current runtime generation and supported enforcement version. On restoration, exact targeted inspection can occur at the explicit progression/open boundary without startup funding or unsolicited toasts. Delayed funding cannot extend the deadline. Pause, hidden tabs, paid continuation and supported level transitions do not restart it.

Retain an already revealed chest if status later becomes pending or unavailable, but disable financial actions. Session replacement invalidates old callbacks and reward feedback. The countdown can tick locally using a monotonic rendering clock anchored to verified terms; it never authorizes a spend. Local timer expiry must not replace an unresolved pre-deadline claim's financial status with a final expired/refunded result.

### Keep the player experience responsive under slow networks

Prepare package imports and reusable non-mutating reads in the background. Treasure adds no startup barrier and never funds an offer before explicit Start. Preserve the current rule that an unready Start is skipped; do not silently queue it when wallets later become ready. A short, nonblocking explanation is appropriate for a connected user expecting treasure. Guests receive no wallet error or treasure setup interruption.

Open the chest synchronously from its current scoped projection. Keep artwork, message area, countdown area and button positions stable. Pending state disables only the actions it conflicts with. Back/Escape and focus navigation remain usable. Retain a revealed chest through uncertainty; never show a restored game cache as freshly verified funding.

Use one in-flight inspection per offer and wallet/network generation. Reopening adopts that request; concurrent subscribers and the recovery monitor share its work. Ordinary rendering and countdown ticks perform no provider requests. Use a fresh matching BIS projection immediately; inspect when evidence is invalidated or its validity cannot be established, rather than imposing a new full-account scan at every opening. Explicit Check status targets the original offer. Bound read observation without treating its timeout as cancellation of any financial operation.

Claim/Reject immediately enter a local busy state. Close only the originating window after the action is durably accepted. Do not wait for an unrelated account-wide contract refresh before returning that acceptance. This requires an upstream public-contract change if the installed facade cannot expose it. Pending acceptance is not success. Completion arrives through the existing event channel after exact receipt verification. Older projections cannot regress a newer operation, and late callbacks cannot mutate a replacement window, wallet or run.

Delay a dedicated loading indicator until 300 ms to avoid flashes; keep action acknowledgement immediate. After ten seconds without a result, show a concise delayed-status message and retain Back plus a coalesced Check status action. These are presentation thresholds, not deadlines for cancellation, automatic resubmission or refunds. Retrying inspection never retries a spend. Explicit actions take priority over speculative reads without cancelling already submitted work or bypassing locks.

On a documented reference device and controlled browser profile, target a p95 of at most 100 ms from input to visible local acknowledgement or chest presentation. Record cold and warm runs separately, including package load, first funded projection, durable acceptance and verified confirmation. Test delayed reads, offline transitions, rapid reopen, repeated clicks and hidden tabs. Do not impose the local UI budget on provider execution or certify it with mocked financial success. Funding latency still consumes the original 90-second window.

Recovery export belongs in explicit setup/recovery and destructive-cleanup safeguards; it must not add a download or confirmation at every Start, chest open or claim.

### Model recovery as a financial operation

Maintain separate eligibility, submission, finalization and evidence states. Reserve before signing/submission and durably persist material before each irreversible provider call. A local UI acceptance or toast never establishes a terminal result. Resume only the original signed submission/finalization where supported; reconcile exact original inputs and outputs first. Missing receipts retain uncertainty and block conflicting spends.

Browser closure cannot execute cleanup. Reopening restores quietly; explicit inspection/action resumes the original operation. Logout, reset and migration must not discard unresolved recovery or imply cancellation. Portable recovery is confirmed before destructive local cleanup. Batch expiry and exit paths require their own capability and recovery tests. A 1,000-sat output may be uneconomic to exit individually, so emergency-exit claims must include real fee funding and timing evidence, or remain explicitly unverified.

### Separate deterministic and funded acceptance

Run deterministic game/public-contract tests without wallet secrets. Add an independently invoked protected financial runner using explicitly granted test wallets, networks and spending limits. Never reuse a grant or execute financial actions merely because the test harness exists. Keep phrases, preimages, signed artifacts and raw provider responses out of logs and reports. Use encrypted private storage for recovery and `output/reports/treasure-contract/` for sanitized diagnostics.

The acceptance matrix covers Signet and Mutinynet independently: fund/claim, reject, expiry/refund, wrong signer/destination, before/at/after deadline, concurrent claim/refund, closed browser and resumed cleanup, lost submit/finalize acknowledgements, storage corruption, recovery import, network replacement, asset-bearing change and depleted Game Wallet. Operator rejections of invalid spends must be demonstrated with validly signed negative fixtures, not just disabled buttons. Proof of one network is not proof of the other. Guest browser checks remain a separate regression gate.

## Risks / Trade-offs

### Bounded BIS acceptance and stop conditions

The user approved freezing this pass on 2026-10-21. No new feature, onboarding,
dependency upgrade, server-wallet adoption, game import or release belongs to
this milestone. Preserve existing servers, wallet storage and concurrent edits.
Existing security, financial and game requirements are not weakened by the
smaller immediate work boundary.

1. Inventory each case for Signet browser validation and both Mutinynet modes.
   Reuse exact matching receipts, artifact identity and test evidence. Record
   deterministic safeguards separately from live operator behavior.
2. Verify session cancellation, duplicate/competing operations, identity/network
   changes, insufficient funds, asset preservation and creation-disable recovery.
   Fix and rerun reproducible BIS defects only. Unsupported cases stay explicit.
3. Allow at most one new funded attempt per missing case/configuration. Observe
   at most 120 seconds, then perform one reconciliation of the original operation.
   Unknown outcomes retain journals/reservations and stop competing spends.
   These runner limits do not cancel a submitted financial operation or promise
   a network completion time. Later original-operation recovery is a separate
   safety action, never a replacement funding attempt.
4. Do not retry the existing generic-code-13 co-signer negative probes or remote
   admission/delayed-finalization proof. Reopen only after new operator diagnostics
   or a supported observable admission interface. Record missing evidence and its
   effect on qualification. The isolated VM cannot substitute for remote proof.
5. Review consent, public DTO/log secrecy, dependency risks and host CSP without
   adopting unrelated architecture. Missing deployed-host protections remain
   blockers, not a reason to claim browser signing isolation.
6. Measure BIS/Admin local acknowledgement/navigation on a named reference setup,
   cold and warm, including slow/offline conditions. Retain the 100 ms p95 local
   target and report provider time separately. The game chest target remains a
   later game acceptance gate, not a BIS measurement claim.
7. After the final fix, run the full BIS suite, typecheck and builds. Deliver a
   matrix with passed/failed/blocked/unperformed statuses, exact evidence links,
   outstanding reservations, blocker owners and concrete reopening conditions.

Stop the bounded pass after its checks have a documented disposition. Stop a
specific upstream-blocked check immediately rather than rerunning it. A check
with missing evidence is not passed. Production-qualified creation stays gated
by the existing qualification requirement; Admin test availability is not a
claim of production enforcement. The game runtime, vendored archive, lockfile
and import/release workflow remain untouched. Do not archive C094 as complete.

- Exact expiry may be unsupported by current cooperative scripts. The proof blocks production qualification before exposing replacement funding.
- Local compromise controls both wallets. Use restrictive content policy, dependency review, minimal signing permissions and explicit local-custody disclosure; do not claim isolation that same-origin code lacks.
- Browser loss can strand recovery material. Require encrypted export/restore and verifiable targeted recovery; mnemonic-only recovery is not assumed sufficient.
- User-owned independent devices may compete for the same output. Reconcile exact outcomes and preserve reservations; do not promise distributed locks.
- Unavailable operators or liveness deadlines can prevent immediate claim/refund. Retain visible pending state, independent inspection, and a tested recovery procedure.
- Upstream BIS is already dirty with Conditional Vault work. Keep the handoff narrow and import a verified released artifact without bundling unrelated changes.

## Migration Plan

1. Record baseline artifact hashes and sanitized evidence; retain all legacy descriptors and unresolved operations.
2. Complete the enforcement proof and upstream handoff. Failure blocks production-qualified replacement rollout, not the approved disclosed browser-policy testing or original-contract reads/recovery. Stop already inconclusive remote probes under the frozen BIS acceptance rules.
3. Implement and verify the upstream versioned format under its separately scoped change. Never rewrite the script or deadline of an already funded legacy output. Label legacy timing as application-enforced.
4. Export/import a verified BIS package using established workflows, preserve matched full game/BIS versions for a coordinated release, then adapt the game through public contracts only.
5. Complete deterministic, package, build and protected live acceptance, including real game UI claim/reject. Review the result before any production qualification.
6. Roll back new creation by capability/version gate. Retain the adapter and journal readers needed to inspect and resolve both legacy and replacement contracts. Never roll back by clearing wallet storage or replaying uncertain work.

## Open Questions

The separately authorized BIS phase on 2026-10-22 supersedes the previous
pass's prohibition on targeted dependency fixes and new acceptance fixtures.
Apply CSP at the BIS host entry boundary, including built static HTML; preserve
required wallet/operator connections and same-origin resources without allowing
arbitrary inline JavaScript. Upgrade only the affected documentation dependency
chain, preserving unrelated lockfile changes. Verify in an independent browser
and protected real-wallet fixtures. Do not restart existing shared servers or
alter wallet storage merely to load a configuration change; use a scoped test
server if needed. Missing remote rejection/admission evidence still blocks the
corresponding claim, not the separately testable BIS hardening work. The game
runtime/vendor/import remain out of scope.

Whole-second precision rounded down is approved. The proof must still determine the supported enforcement mechanism, clock authority and executable admission/finalization boundary. These are bounded technical deliverables with a stop condition. No server or treasury architecture decision remains open. Hosting, new networks, mainnet, and replacement guarantees after an infeasible proof require a separate decision and are outside implementation scope.
