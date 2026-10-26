# Tasks

C094, `productionize-treasure-chest-contract`. Planning is complete; implementation progress is recorded below. Partial live Mutinynet acceptance is recorded, not full qualification. A failed enforcement proof blocks the corresponding qualification. Existing legacy inspection and recovery remain supported. Live actions require explicit test-wallet grants and spending limits. The user explicitly authorized upstream BIS implementation on 2026-10-21; its scope and evidence are recorded in `BIS/documentation/treasure-production-acceptance.md` in the BIS repository.

## 1. Establish evidence and the upstream contract

### Frozen work boundary, approved 2026-10-21

Section 6 records the completed bounded BIS acceptance pass. The user authorized
a separate BIS hardening and missing-live-acceptance phase on 2026-10-22, tracked
in section 7. That authorization permits targeted CSP/dependency fixes and new
acceptance fixtures, but not game import, release, onboarding or blind upstream
probe retries. Sections
1-5 retain their original IDs, requirements and evidence. T006/T007 are blocked
where remote negative admission and delayed-finalization semantics lack
authoritative evidence; do not repeat their inconclusive upstream probes.
T010 retains its full deployed-host hardening gate. T011-T018, T023-T026 and
game portions of T019-T021 are deferred until a separately authorized game
import/integration phase. No deferred or blocked task is marked complete.
The CLI's aggregate checkbox count is not a percentage of BIS readiness.

- [x] 1.1 C094-T001 Record the exact vendored archive hash, installed-file inventory, public API and existing test commands in a sanitized baseline report; verify with the existing package verifier and source-linked evidence for script timing, wallet ownership, restored state and browser-only monitoring.
- [x] 1.2 C094-T002 Prepare the narrow upstream BIS handoff for versioned LTO enforcement, safe DTOs, portable recovery and legacy support; verify a requirement mapping reconciles hosted-signer/shared-service claims with the confirmed no-server local-wallet model and excludes Conditional Vault work.
- [x] 1.3 C094-T003 Add executable regression fixtures for restored `active` state, pending claims crossing expiry, wrong network/offer and explicit session-end versus window-close behavior; verify failures expose the relevant current gaps without touching wallet secrets or claiming network acceptance.
- [x] 1.4 C094-T022 Record cold/warm interaction and provider timing boundaries in the baseline; verify no treasure-added startup wait and distinguish the proposed 100 ms local p95 budget from funding, acceptance and confirmation latency.

## 2. Prove the required spend rules

- [x] 2.1 C094-T004 Produce a bounded Signet and Mutinynet capability report for pinned SDK/operator identities, supported contract execution, authoritative time precision, acceptance point, output limits and fees; verify each claimed capability against primary documentation and read-only provider evidence without funding.
- [x] 2.2 C094-T005 Build an executable isolated proof of the user-approved whole-second deadline, rounded down from the original 90-second window, and authorized claim/reject/session-end/refund paths; verify emitted bytecode with valid signatures for before/at/after expiry, clock tampering, early revocation, wrong destinations, preimage exposure and every unilateral branch. Record infeasibility rather than substitute application checks.
- [ ] 2.3 C094-T006 Under explicit protected test grants, exercise the proposed script with each actual advertised operator and enforcement mode and inspect exact funded output bytes and spend receipts; verify accepted valid spends and rejected invalid spends for covenant mode, including delayed finalization. Separately verify real Signet fallback funding/spends and disclose its browser-policy limits. Preserve private recovery and sanitize the report. Unsupported behavior blocks the corresponding qualification; no fallback after an unknown submission.
- [ ] 2.4 C094-T007 Review the proof against all C094 requirements and document the selected mechanism, authoritative clock and admission semantics; verify an independent review can reproduce its results and that it uses no new infrastructure, changed amount, changed deadline or unapproved custody model.

## 3. Obtain the verified upstream BIS dependency

Current gate evidence is in `docs/treasure-contract-feasibility.md` and BIS's `BIS/documentation/treasure-bounded-acceptance.md`. The isolated VM proof passes; remote negative admission and delayed finalization remain blocked. Existing test-wallet grants apply. Production-qualified rollout still requires its live evidence; approved disclosed browser-policy testing and original recovery are separate. No game runtime or vendored package has been imported.

BIS's evidence history records exact real funding, Claim, early Reject and expiry refunds for Signet browser validation and both Mutinynet modes. Portable recovery and recognition of a peer-profile payout passed on all three configurations. The frozen acceptance report maps exact receipts and distinguishes missing live cases. Onboarding remains a separate task; its historical unknowns are not reclassified as network failure.

The protected treasure test-ledger review reports no outstanding treasure/portable reservations. Historical prototype-loss dispositions retain unknown network outcomes. The current bounded pass does not repeat already passed transactions or inconclusive co-signer probes. Test results and source-identity hashes are recorded in BIS's frozen acceptance report rather than maintained as competing progress snapshots here.

- [x] 3.1 C094-T008 In the explicitly authorized upstream BIS scope, deliver the versioned script/adapter and safe public enforcement/evidence projections; verify runtime destination, signer, network, fee and asset-change checks plus executable contract tests, immutable pre-funding mode selection and visible Signet fallback disclosure, with legacy scripts retaining their original terms.
- [x] 3.2 C094-T009 Obtain upstream journal/reservation and portable encrypted recovery support; verify lost-submit/finalize acknowledgements, corrupt storage, export/import, reset/logout safeguards, cross-device competing outpoints and exact original recovery through adapter/storage tests and documented operator procedures.

T008/T009 evidence update: BIS now has password-encrypted portable recovery through normal Account controls and public IBis methods. Real source-browser closure, independent-profile import, disabled-until-verified actions and original 1,000-sat expiry/refund passed on Signet browser validation and both Mutinynet modes. Original browsers recognize the exact peer payout. Adapter/storage tests cover authenticated encryption, corruption, stale imports, immutable bindings, preserved reservations, reset/logout safeguards, competing outcomes and exact signed finalization, including legacy root reconstruction without new signatures. Private superseded requests remain archived. The recovery procedure is `BIS/documentation/treasure-contract-recovery.md`; full receipts and qualification limits are in `treasure-production-acceptance.md` in BIS. The earlier recovery milestone passed 1,262 host tests. Current full-suite and build results, including unrelated failures, are recorded in the frozen BIS acceptance report. This completes upstream adapter/recovery support, not T006/T019 live qualification or the game import. A fresh co-signer negative probe still returned generic code 13; its original refund was later verified, but specific rule rejection and admission/delayed-finalization semantics remain unproven. No game runtime or vendored package was imported.
- [ ] 3.3 C094-T010 Obtain upstream wallet hardening and disclosure for the local model; verify restrictive content policy and dependency review appropriate to the deployed game, explicit Game Wallet funding consent, no secrets in public descriptors/logs, and documented batch-expiry and exit limitations.

2026-10-26 T010 review: both production dependency audits report zero advisories.
A game-only Pages-compatible production CSP now passes three unit tests, build,
10 publishing checks, public contract types and managed guest browser checks.
Clean initial load, Start, settings and Account each have zero CSP violations;
the separate six negative canaries are intentionally blocked. BIS CSP is
unchanged. The pinned SDK README's batch/renewal/exit limits are now disclosed
in BIS's recovery guide. The later authorized game funding-consent gate now
passes 32 focused tests and a final 1,174-test game suite, plus final build,
publishing and public type gates. Browser checks on synthetic public profiles
verify desktop/mobile Skip/close/Escape with zero financial calls or CSP
violations. T010 stays open for deployed verification of the candidate policy
and exact imported-artifact privacy/resource review. No wallet/provider action,
dependency import or publication occurred. Full evidence and reopening criteria
are in BIS's `treasure-t010-hardening-2026-10-26.md` program handoff.

- [x] 3.4 C094-T011 Import the verified upstream release through the established BIS export/import workflow; verify archive/install hashes, recorded source provenance, public contract types and matching full game/BIS versions. Do not replace the dependency with an adjacent source-directory import or bundle unrelated dirty work.

## 4. Adapt treasure state and presentation

- [x] 4.1 C094-T012 Replace restored `active` authority with unverified state and exact BIS projection binding; verify C094-T003 fixtures and new tests prove cache tampering cannot reveal a new chest, authorize a claim, extend a deadline or cross wallet networks.
- [x] 4.2 C094-T013 Keep financial progress separate from the display countdown and offer eligibility; verify pre-deadline accepted claims stay pending across expiry, failed/unknown spends retain truthful state, and duplicate events cannot repeat reward feedback or target a replacement run.
- [x] 4.3 C094-T014 Preserve explicit Start, authored position/artwork, funded reveal, Claim/Reject/Back, pause and re-entry behavior; verify UI and runtime tests cover delayed funding, temporarily unavailable revealed chests, closed-window updates, progression, session end and late async callbacks.
- [x] 4.4 C094-T015 Integrate legacy status, unsupported-network handling and explicit recovery access through public BIS operations; verify legacy reads/recovery stay available when replacement creation is disabled and ordinary guest gameplay remains usable.
- [x] 4.5 C094-T016 Update treasure and deep-dive documentation for the imported version and confirmed custody/enforcement/recovery model; verify every current-state statement and link matches source and distinguish local tests, live evidence and remaining exit limitations.
- [x] 4.6 C094-T023 Implement scoped single-flight inspection and immediate chest presentation; verify rapid reopen, stale generations and slow reads produce one offer-scoped request with responsive Back/Escape and no countdown-triggered network work.
- [x] 4.7 C094-T024 Integrate durable action acceptance independently of unrelated list refresh; verify duplicate clicks, unknown outcomes and delayed completions neither resubmit spends nor close replacement windows.
- [x] 4.8 C094-T025 Stabilize layout/focus and delayed loading feedback; verify the 300 ms indicator and ten-second delay thresholds with controlled timers, accessible feedback and safe Check status, documenting that neither threshold cancels a transaction.

## 5. Verify the complete feature and rollout boundary

- [x] 5.1 C094-T017 Run the game full test suite, `npm run typecheck:bis-contract`, `npm run test:publish`, package artifact verification and `npm run build`; verify the exact imported dependency passes without focused-test-only exceptions, recording any unrelated baseline failure separately.
- [ ] 5.2 C094-T018 Validate the built game with the managed Playwright browser using both mute query parameters; verify guest play and the real imported package, then separately verify funded Claim/Reject UI under explicit grants without injecting financial success projections.
- [ ] 5.3 C094-T019 Complete the per-network live acceptance matrix for funding, zero-player-balance claim, reject, session end, expiry/refund, competing spends, closed-browser recovery, lost acknowledgements, recovery import, network replacement, asset change and insufficient funds; verify exact receipts and sanitized evidence identify every passed, failed and unperformed case.
- [ ] 5.4 C094-T020 Exercise creation-disable rollback with legacy and new unresolved contracts; verify exact original inspection/recovery still works without deleting journals, changing funded scripts or replaying uncertain submissions, and record the procedure alongside the acceptance report.
- [ ] 5.5 C094-T021 Review all acceptance evidence against both delta specs; verify qualification is limited to the selected local-wallet model and networks actually proven, unresolved proof/live failures leave C094 incomplete, and publishing remains a separately requested action.
- [ ] 5.6 C094-T026 Measure cold/warm input-to-presentation and action acknowledgement on a documented reference device; verify p95 at most 100 ms, no treasure-added startup barrier, and stable behavior with slow/offline/reopen/hidden-tab conditions. Report live provider durations separately.

## 6. Finish bounded BIS acceptance without importing the game

- [x] 6.1 C094-T027 Inventory every BIS acceptance case for Signet browser validation and both Mutinynet modes; verify exact existing receipts and distinguish deterministic coverage, live proof, failures, blockers and unperformed cases in the BIS acceptance report.
- [x] 6.2 C094-T028 Verify BIS session cancellation, duplicate/competing actions, identity/network changes, insufficient funds, asset preservation and creation-disable recovery; add focused regression tests and fix reproducible treasure-specific defects, recording missing live evidence without calling deterministic tests network proof.
- [x] 6.3 C094-T029 Dispose of missing live checks under the approved one-funded-attempt-per-case/configuration, 120-second observation and one original-reconciliation limits; verify each receipt or record blocked/unperformed status and protected outstanding reservations. Reuse passed cases and do not retry existing upstream negative-admission/delayed-finalization blockers. Completion means a truthful bounded disposition, not completion of T006/T019.
- [x] 6.4 C094-T030 Review BIS local-custody consent, public DTO/log secrecy, dependency and CSP risks, batch/exit limitations and safe rollback; verify source-linked findings and document blockers/reopening conditions without silently completing T010's deployed-game gate.
- [x] 6.5 C094-T031 Measure BIS/Admin local feedback and usable navigation on a documented reference setup in cold/warm/slow/offline cases; verify the 100 ms p95 target or record the measured failure/blocker, separating provider latency and deferred game-chest measurements.
- [x] 6.6 C094-T032 Run final full BIS tests, typecheck and builds after the last fix; verify a final evidence-backed pass/fail/blocker disposition, no new inconclusive upstream retries, preserved original recovery and no game runtime/vendor/import/release changes. Keep production qualification and C094 incomplete where required guarantees remain blocked.

Bounded pass disposition: BIS's `BIS/documentation/treasure-bounded-acceptance.md`
is the current matrix and blocker report. The final focused run passes 90 tests;
root typecheck, all package builds and isolated VM proof pass. The final full
run records 1,306 passes and one unrelated server-settlement type-fixture failure;
its targeted recheck passes, but the full suite is not claimed green. Guest
Account navigation p95 is 13-35 ms; funded interaction/game latency is unperformed.
No outstanding treasure/portable test reservations were found in the protected
ledger. No new funded transaction, upstream negative probe, onboarding action,
game import or release ran. Section 6 is closed with documented blockers, not
production qualification. Original blocked/deferred tasks stay unchecked.

## 7. BIS hardening and missing live acceptance, authorized 2026-10-22

- [x] 7.1 C094-T033 Fix BIS host CSP and vulnerable documentation-renderer dependencies; verify real-browser injection blocking, legitimate wallet/documentation/resource behavior, dependency audit and built static HTML coverage without changing the game dependency.
- [x] 7.2 C094-T034 Extend protected acceptance fixtures for session end, duplicate/competing requests, identity/network changes, asset-preserving funding, empty-player claim, insufficient funds, lost acknowledgements, rollback and funded-action responsiveness; verify fixture safeguards, original-request recovery and secret-free diagnostics before live use.
- [ ] 7.3 C094-T035 Execute the missing BIS checks per network/mode with exact receipt and asset evidence; verify explicit pass/fail/blocker dispositions and reconcile original operations before competing spends. Do not repeat upstream negative-admission or delayed-finalization probes without new evidence.
- [x] 7.4 C094-T036 Run final BIS regression, typecheck, builds and CSP/dependency verification; update the acceptance report with actual remaining blockers, wallet reservation disposition and reproduction commands. Verify no game import, release or unrelated server-wallet change.

2026-10-26 T034 completion: the assigned deterministic fixture pass verifies all
nine scenario groups and narrows Admin diagnostics to fixed public reasons and
flags. Focused evidence is 68 safeguard tests, 12 browser/harness tests and one
SDK-only empty-player construction test, all passing with no skips or TODOs.
Targeted strict types and configured BIS root typecheck pass. The exact source
manifest and per-case evidence are in BIS's
`openspec/programs/bis-server-treasure-release/treasure-t034-fixtures-2026-10-26.md`
and `output/reports/treasure-contract/t034-fixtures/`. B2 inputs remain frozen.
No wallet/provider/financial action or game import occurred. T035 and upstream
qualification remain open; browser fixtures are not funded acceptance or p95.

2026-10-22 hardening progress: T033 passes CSP injection/resource checks, the
production-prefix static browser checks and a zero-vulnerability production
dependency audit. The BIS follow-up is `BIS/documentation/treasure-hardening-acceptance.md`.
Six new real funded runs verify explicit session end/current-format creation-disable
recovery on all three configurations, empty-player/duplicate-click Claim on both
Mutinynet modes, and browser-mode recovery after a dropped real successful
finalization response. Exact contract/checkpoint/payout receipts are recorded.
All six runs are reconciled; four unrelated old unknown operations stay protected.
The Admin duplicate-click warning/busy-feedback defect is fixed and tested in
desktop/mobile deterministic browser fixtures. The final full BIS run passes
1,320 tests, typecheck/builds/static staging pass, and no game import/release or
onboarding occurred. T034-T036 stay unchecked because missing financial cases
and final acceptance completion still remain. Existing upstream proof blockers
are not retried or waived.

2026-10-23 acceptance continuation: all three empty-Game-wallet insufficient-
funds cases passed with exact not-submitted records and zero financial POSTs.
The later Mutinynet asset-issuance setup has an unknown acknowledgement after
one original-only reconciliation; its reservation remains protected. No live
asset-carrier pass is claimed. Readiness parsing and bounded acknowledgement
observation were corrected in BIS, with 33 deterministic tests and one wallet-
free browser check passing. Those corrections do not authorize another mint or
qualify the remaining identity/race/legacy/latency cases. T034-T036 remain open;
the game dependency and runtime remain unchanged.

2026-10-25 protected acceptance continuation: recovered and verified the saved
alternate/original profile setup without financial actions. Fixed asynchronous
readiness observation and enforced the protected 5,000-sat per-operation and
10,000-sat rolling network-day limits, with 12 focused policy/browser checks
passing. A wallet-free Admin reproduction found 319 repeated provider reads
caused by a changing reporting callback; the polling-effect fix and the existing
Treasure feedback regression both pass serially. The final corrected Signet
identity/race run still stopped at the bounded readiness observation before
creating a case, contract or reservation. Five old unknown operations remain
protected. No additional funded retry is planned without new readiness evidence.
The funded-test slot is returned to the coordinator. Final integrated checks
belong to that coordinator and must include the new UI fix. T034-T036 and the
original qualification gates remain incomplete; no game import occurred here.

2026-10-25 readiness follow-up: official SDK, standalone BIS and retained BIS
Node reads all verify 2,000 spendable Signet sats. A public-key-only fresh browser
SDK read and the protected-browser public BIS controller also pass. A second
actual Admin regression proves that a later boarding error erases explicit
Wallet Status. Game Wallet reports now retain a bounded history; three serial
browser regressions and eleven current policy tests pass. Real Admin read-only
run `harden-readonly-s3` captures ready with zero financial actions and exits
successfully. The readiness reopening condition is satisfied. The original
identity/race case remains unfunded, awaiting the coordinator's exclusive funded
slot handoff, without replacing its run ID. No upstream proof gate or T034-T036
checkbox is waived by these read results. Integrated gates must include the
new App change; game import remains separate.

During the coordinator's shared-adapter hold, the passive feedback observer and
future `feedback-claim` fixture were added without financial execution. The same
observer passes desktop/mobile wallet-free tests, including no-input timeout
without extra action, disabled controls or leftover instrumentation. Current
samples are 10.2 ms and 9.0 ms, explicitly programmatic and not funded p95.
Future trusted-input measurement remains separate from exact payment verification;
a measurement timeout cannot cancel or repeat a spend. The coordinator's current
financial assignment still covers only the original identity/race case after
the hold is lifted. No new funded latency test or qualification is implied.

After coordinator acceptance of the independent SDK comparison and slot handoff,
the original Signet browser identity/race case passed. Exact original funding,
checkpoint and Player payout are recorded in BIS's hardening report; actual
alternate identity Claim/Reject were denied, the original profile/deadline were
restored, and one claim won. Both test operations are settled. The authorized
Signet feedback case stopped twice before funding on explicit unavailable
readiness, with one ready read-only check between them. It has no case journal,
financial operation or timing sample. No replacement/unknown retry was performed.
Five old unknowns stay protected. The owner returns the funded slot and freezes
runtime/test/fixture edits for integrated gates, with source hashes and sanitized
financial disposition saved. T034-T036, missing live checks, funded p95 and
remote covenant qualification remain incomplete; no game import/release occurred.

Final local verification: T036 is complete after the coordinator's full rerun
passes all 1,337 tests, with zero failed/skipped/TODO cases. Typecheck/builds,
five CSP checks, production-prefix Pages staging/browser checks and a zero-known-
vulnerability production audit pass. The final 935-file source comparison reports
no changes across the run. The first run's lone readiness-navigation timeout is
preserved; its narrow DOMContentLoaded correction was followed by the full rerun.
BIS's hardening report links all evidence and keeps wallet reservations and live
blockers explicit. Game inventory/dependency remains BIS 0.0.23; no import or
release ran. T034/T035 and original qualification tasks stay unchecked. Only
acceptance documentation and this planning checkbox changed after the final run.

Subsequent fixture-only follow-up: a fresh wallet-free Chromium test changes the
real network preference and encrypted contract storage in both directions with
identical profile IDs. Actual LTO service Claim/Reject/Refund are denied on the
other network; both journals remain unchanged, and returning restores the
original contract/deadline. The synthetic financial dependencies are forbidden
and no remote request is allowed. Twelve focused fixture/policy tests pass.
This is deterministic isolation coverage, not the missing live replacement.
Read-only vault metadata establishes no eligible unresolved legacy fixture.
The unchanged verified BIS 0.0.23 game artifact contains the genuine old adapter;
the BIS hardening report records provenance and a guarded old-version creation
and current-version recovery setup for a future coordinated financial slot.
No legacy funding, game import, runtime edit or upstream retry occurred.
T034/T035 remain unchecked; the new fixture must join subsequent integrated
verification rather than inherit the earlier 1,337-test snapshot's result.

The next assigned fixture slot adds executable protected `network-replacement`
and `legacy-rollback` runner paths. Exact run-ID slot guards precede wallet
access, two-operation budget headroom precedes funding, and saved/registered
wallets on both networks must pass real readiness before a switch case funds.
The switch uses preference/remount with actual public factories, denies wrong-
scope actions under a financial-POST backstop, preserves both full journals and
restores the original before its exact Claim. Legacy creation uses the actual
0.0.23 distribution export, verified directly against all 149 authentic archive
members and installed files, with provenance persisted before funding. Old
monitoring stops without ending the session; original private recovery goes
directly to the protected vault. Current creation-disabled factories must refund
that exact original. Eighteen wallet-free safeguard/import/isolation tests pass;
no protected readiness or financial scenario ran in this slot. Actual eligibility
and live receipts remain unobserved. T034/T035 stay open pending review and live
verification; no game runtime/dependency, shared server or upstream probe changed.

Pre-funding coordinator review caught the legacy branch querying a missing Admin
signing selector after its document had become the blank harness. The corrected
common post-funding helper preserves the real selector check for Admin paths,
and verifies immutable old artifact/script/terms/outpoint data for legacy before
capturing protected recovery. Public browser-mode projection remains distinct
from absent private legacy mode. A new wallet-free navigation/storage regression
exercises that actual DOM transition and rejects changed script, deadline, role
and funding source without mutation or remote calls. All 19 combined focused
checks pass. This is synthetic-format regression coverage, not a real legacy
funding/recovery pass. No financial attempt occurred; source review and an
assigned live slot remain required, with T034/T035 still open.

The subsequently assigned sole Signet/browser `harden-legacy-s1` passed genuine
0.0.23 contract funding and current creation-disabled original refund. Exact
funding 55da5616f51e30d292194a41fa53d2fcb5f247552b08db6656f64c3934138c22:0
links through checkpoint 8500f17bec1d7a9c45b07551e19b14ea0c35b3f1dc2444ff63fabbbecfe9c208:0
to the asset-free 1,000-sat Game Wallet refund
dc53bae0c49562cacc0087833f1abac465d2ac3295a6d7132fc9f1cc73a05b1e:0.
Both operations are settled, zero fees; the private original record retains
field absence, identities, deadline and script. The original window is 89,132 ms.
The coordinator independently verified the chain. All nine source hashes match,
the runner is terminal, and the financial slot is returned. Five old unknowns
remain protected. Other-network eligibility is the next read-only assignment;
no further financial case or game import is authorized here. This controlled
Signet legacy pass does not complete the broader T034/T035/T019/T020 gates.

The assigned read-only same-browser eligibility check then completed without
financial actions. No registered Mutinynet pair is saved/selected in that
Signet-owned browser. `treasure-empty-game-mutinynet` has no conflicting operation
in the snapshot, but needs normal restoration of its existing registered
identities into the Mutinynet namespace before the switch fixture can run.
That preparation is proposed only, pending coordinator assignment; no identity,
profile, registration, journal or funded output was fabricated. Current exact
metadata and the proposal are in BIS's hardening output directory. Source stays
frozen, game import stays separate and T034/T035 remain open.

After explicit coordinator assignment, nonfinancial preparation restored only
the existing registered `treasure-empty-game-mutinynet` identities through real
BIS restore APIs in the owned browser. The failed initial backstop report and
strict diagnostic are preserved: both blocked POSTs were exact local connection
metadata probes. Following source review and a narrowly approved `/api/bis/connect`
exception, a NEW read-only verification passes with no further restoration,
exact saved identities, ready manual Game source, creation disabled and zero
unresolved wallet/asset/contract intents or reservations. Metadata returned real
404 responses; no response or financial outcome was fabricated. Original Signet
state/journal/preference and all nine source hashes are unchanged. The actual
live network-replacement case still needs its separate exclusive financial
handoff. T034/T035 remain open; no game import or further funded case occurred.

Assigned `harden-network-s1` then stopped unfunded on unavailable Admin readiness;
protected disposition confirms no case, operation or funding and five historical
unknowns unchanged. Authorized sanitized read diagnostics reproduce failed
Bitcoin explorer reads while Arkade returns HTTP 200. A bounded independent
Node/Chromium comparison confirms the explicitly overridden mempool.space
endpoint times out outside BIS, with no recorded CSP block or HTTP 429.
The coordinator verifies the installed SDK-default explorer's canonical Signet
genesis and CORS, then changes only the Signet API scalar and its existing test.
Existing CSP already allows it; no storage or contract rule changes. A separate
readonly SDK diagnostic verifies the actual 1,000-sat Game balance; it is never
used to override normal readiness. The subsequent actual Admin readonly
`harden-net-read-s2` passes with real new-provider HTTP 200 requests and no status
or provider injection. All 18 affected diagnostic policy/browser checks pass.
Failed logs remain preserved. No funded case is retried before fresh explicit
coordinator assignment, and final integrated verification must include these
changes. T034/T035 and original broader qualification gates remain open.

Final coordinator fixture review found two regressions, both preserved in its
failed log: early slot refusal gained an extra empty diagnostic row, and the
synthetic legacy selector setup remained unstable. The narrow fixes suppress
diagnostics until an owned page exists and serve a fully controlled initial
fixture document with direct asserted DOM setup, without changing any production
timing/financial guard or weakening assertions. Early refusal and legacy
transition each pass independently, and all 18 diagnostic policy/browser checks
pass. No new wallet/provider probe or financial case ran. Updated source hashes
are returned for independent rerun; actual normal-Admin readiness remains ready
on the coordinator's unchanged provider fix. No financial retry is authorized
until its explicit handoff, and T034/T035 remain open.

After explicit exclusive re-handoff, original `harden-network-s1` passes actual
Signet/browser funding, Mutinynet context replacement, wrong-scope Claim/Reject/
Refund denial with zero financial POSTs, both full journals unchanged and
original Signet identity/deadline/outpoint restoration before one exact Claim.
Funding c9f423b1845bd73b06a67768336be739c828cdc2478c5787acbec876fd5ed160:0
links through checkpoint 2fc139e0ea8e1f470ea4bda80961523bc6ceb38ebfeb9cb4e79c634164132c11:0
to original Player payout
10b1cda3c414dbeca81f1bf1fa67923007be943c085c850311062d51adb73046:0,
exactly 1,000 asset-free sats. Both operations are settled, zero fees; all 12
reviewed source files match and five historical unknowns are unchanged. Rolling
Signet exposure is 6,000 sats; the runner is terminal and the slot returned.
No Mutinynet spend, duplicate funding or original reconciliation occurred. The
old unfunded failure remains preserved. A stale coordinator name filter was
also corrected in the evidence: the actual renamed legacy test subsequently
passes under an explicit full-file run. This case does not waive remaining
asset/latency/other-mode/upstream/integrated/game gates or complete T034/T035.

2026-10-26 imported-candidate verification: T016 documentation now describes the exact local BIS/game 0.0.26 candidate, truthful signing-source fallback, consent, rounded deadline, enforcement and recovery limits. Local links resolve. T017 passes 1,178/1,178 full game tests on Node 24.21.0, public contract typecheck, 10 publishing checks, archive/all 201 installed-file verification and production build. Managed built guest flow has zero CSP violations; one guarded /api/bis/connect POST is intentionally blocked. Desktop/mobile synthetic consent dismissals make zero financial calls. Six distinct injection canaries are blocked, with duplicate event records from two test listeners. These results do not complete deployed, funded UI, operator admission/finalization or final qualification gates. See acceptance-handoff-2026-10-26.md for the latest imported-candidate addendum.

2026-10-26 T015 integration verification: the exact installed 0.0.26 facade reads/checks and portable export/import do not depend on new-creation capability. The embedded Contracts view retains legacy financial/eligibility status, mode disclosure, original refresh/refund controls and encrypted recovery controls independently of creation support. Game regressions now verify original restored-session inspection on both networks with creation disabled and no replacement funding, unsupported-network rejection, and Account access with contract creation unavailable. The focused Account/runtime suite passes 21/21. The earlier managed real-import guest flow passes. This completes public integration/recovery access; it does not complete T020 live funded rollback or T018/T019 network acceptance.

2026-10-26 T011 import completion: the user-authorized local 0.0.27 candidate is installed from the exact lockfile and versioned archive f441f9e2bba7f9f6d510c00405b90c0dbb7bdc25adfac0c69bcfe28533bb914c. All 201 archive and installed-file hashes match; source commit/dirty provenance is recorded; game/BIS versions match 0.0.27; only the current archive remains vendored. Full tests pass 1,181/1,181 on Node 24.21.0, public contract types include optional signing source, publishing passes 10/10, and production build passes. Managed dev and production browser Account display BIS: v0.0.27; guest flow and synthetic source-aware consent checks pass without wallet operations. T011 completes local import verification, not a public release, server signing deployment or live contract qualification. The exact verified game server was stopped/restarted under the shared startup lock only for the clean install and is restored on 5176. See the latest acceptance handoff.

2026-10-26 independent local pass: progress remains 27/36. Fixed two inspection-feedback bugs and verified two regression failures on the prior code, nine passing UI tests and all 1,183 game tests on Node 24.21.0. Types, 10 publishing checks, production build, exact 0.0.27 package verifier and managed real-game guest flow pass. Controlled unverified chest component p95 is 18.6–19.3 ms cold and 14.9–16.3 ms warm/Back on the documented headless reference setup. Slow/reopen coalescing and corrected delayed feedback pass. Offline checks are smoke samples; actual hidden state and funded Claim/Reject timing remain unperformed, so T026 stays open. A fresh pinned native VM passes 50 vectors with three script sources identical to the installed archive; this does not complete T006/T007 remote-clock/admission or independent qualification review. T011 remains complete. T010/T021/T035 remain incomplete for their recorded deployed/live gates. No B2 wallet read/write, signing, funding, new import or publication occurred. Evidence: output/reports/treasure-local-responsiveness/verification.json.
