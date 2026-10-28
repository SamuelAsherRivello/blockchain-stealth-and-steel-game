# Tasks

C096, `qualify-treasure-chest-both-networks`. This is the follow-up to C094's Signet-only release. Do not claim the original open C094 criteria passed by migration. Use exact imported artifacts and real contract receipts; keep unknown outcomes protected.

## Original C094 task carryover

- C094-T006: each real signing mode's funded outputs, valid/invalid spend admission and delayed finalization; Signet browser-policy receipts. Covenant claims remain blocked absent operator evidence.
- C094-T007: independent proof and guarantee review.
- C094-T018: managed browser funded Claim/Reject on exact artifact.
- C094-T019: per-network/mode funding, empty-player claim, reject, session end, expiry/refund, competing spends, closed-browser and lost-ack recovery, import, network replacement, asset change and insufficient funds.
- C094-T020: live creation-disable rollback with legacy/new unresolved operations.
- C094-T026: cold/warm, offline/slow, actual hidden-tab, funded acknowledgement; local p95 <=100 ms target and provider timing reported separately.
- C094-T035: missing BIS cases per network/mode with exact receipts and asset evidence, no blind retries.

## Qualification work

- [x] C096-T001 Establish current artifact, operator identity and protected-wallet preflight for each network/mode; stop before signing if identity, funding or reservation state is ambiguous.
- [x] C096-T002 Disposition complete — blocked, not qualified. No new attributable co-signer operator acceptance/admission or delayed-finalization evidence exists; the current Mutinynet identity is unavailable, so co-signer creation remains unavailable. Do not infer signing success.
- [x] C096-T003 Disposition complete — stopped before recovery, not recovered. Current public evidence shows the exact original B2 output is swept, preconfirmed, and past its recorded expiry, so the pinned refund spendability precondition fails. The protected run/operation and terminal destination/fee receipt are also absent. No recovery, signing, or submission was performed; do not substitute generic SDK recovery.
- [x] C096-T004 Complete the per-network/mode lifecycle evidence matrix and record every case as passed, failed, blocked or unperformed. Matrix completion is evidence inventory only; it does not promote any network/mode to production-qualified.
- [ ] C096-T005 Verify managed browser Claim/Reject flow with real funded offers and exact receipts; deterministic fixtures must not inject financial success.
- [ ] C096-T006 Exercise creation-disable rollback with legacy and unresolved contracts; preserve journals, original scripts and recovery.
- [x] C096-T007 Verify Admin selector labels/defaults and game automatic pre-funding mode selection; ensure no silent downgrade after uncertain submission.
- [ ] C096-T008 Measure local cold/warm/offline/slow and actual hidden-tab behavior plus funded acknowledgement on a documented device; meet local p95 <=100 ms or document failure, reporting provider latency separately.
- [x] C096-T009 Independently review proofs, receipts, recovery and disclosure against both specs; enable only passing network/mode tuples and retain blockers.
- [ ] C096-T010 Run complete game and BIS acceptance, exact artifact/type/build/publish checks, then verify deployed Admin/game routes and release version. Keep game import separate until BIS evidence is ready; publish only under the applicable release authorization.

Current shared game candidate verification update (2026-10-28): the full root
`npm test` run passed **1,192/1,192** with zero failures, cancellations, or
skips in 12.838 seconds. Log:
`output/reports/diagnostics/treasure-root-suite-2026-10-28/npm-test.log`.
This supersedes earlier full-game-suite counts for the current shared 0.0.30
tree. It is deterministic evidence only; the funded Claim/Reject, live rollback,
actual hidden-tab and remaining BIS/deployed-release gates stay open. C096-T010
remains unchecked.

T001 completed as a fail-closed read-only preflight on 2026-10-28; this is not
signing acceptance. The local BIS integration and published game are both
0.0.30, with SDK 0.4.79. BIS Production identity returned Signet
`signingReady:true` with `sign`, `signMessage`, and `signerSession`; Mutinynet
identity returned HTTP 200 with `signingReady:false` and no capabilities.
Both public Arkade `/v1/info` routes returned HTTP 200 but did not disclose an
operator version. Signet exposes Browser validation only. Mutinynet Admin
exposes Arkade co-signer and Browser validation; the co-signer is unavailable,
so the automatic game choice remains Browser validation before funding.

Protected Signet preflight found an active registered pair but one pair-scoped
unknown 2,000-sat refund with no provider txid, verified fee, linked Admin run,
or receipt. The Signet Player and Game read-only observations both returned
zero available BTC/Arkade and zero assets; application journals were
unavailable. Its current 24-hour window has 18 rows / 61,364 intent sats and
six missing-fee rows, with zero settled txid-bearing fee candidates. The
1,000-sat and conservative 2,000-sat projections both refuse
`acceptance-budget-unverified`.

Protected Mutinynet preflight found the named pair and active distinct grants,
ten pair journal rows and no pair-scoped nonterminal runner operation. Both
Player and Game read-only observations returned zero available BTC/Arkade and
zero assets; application journals were unavailable. The network-wide window
has eight rows / 153,950 intent sats, two missing-fee rows, and four
nonterminal operations. Its 1,000-sat and 2,000-sat projections also refuse
`acceptance-budget-unverified`. No wallet was attached; no signing, funding,
reconciliation, or transaction occurred. The run stopped before signing on
the recorded reservation, journal, identity, and budget gates. Sanitized
evidence is in BIS `output/reports/treasure/2026-10-28/`:
`current-artifact-operator-identity.json`,
`protected-signet-gate-host-20261028.json`,
`protected-mutinynet-budget-check.json`,
`signet-pair-live-readiness.json`, and
`mutinynet-pair-live-readiness.json`.

T002 and T003 are closed only at their explicit blocked/stopped disposition
branches. Neither is a successful signing or recovery acceptance. No network
mode is qualified by these dispositions; funded lifecycle, browser acceptance,
release, and remaining rollback/performance checks remain open.

### C096-T004 per-network/mode lifecycle evidence matrix — 2026-10-28

The statuses below inventory existing BIS Admin/network receipts for the
supported tuples. `Passed (historical)` means the named live case has an exact
receipt in the cited acceptance record; it does not mean the complete tuple is
production-qualified or that the game UI was exercised. For C096's exact game
artifact, the installed 0.0.30 archive hash is recorded in C094-T038, but the
historical BIS run records do not carry a join to that archive hash. Therefore
every historical pass is **blocked for exact-artifact qualification** until
that provenance link is established; its historical network result remains
useful evidence. `Unperformed` means no matching live case is recorded.
Deterministic safeguards are identified separately and never counted as live
passes.

| Lifecycle case | Signet / Browser validation | Mutinynet / Browser validation | Mutinynet / Arkade co-signer | Evidence and limits |
| --- | --- | --- | --- | --- |
| Funding and contract creation | Passed — current Signet Admin funding/Claim chain | Passed — historical M1 funding/Claim chain | Passed — historical C1 funding/Claim chain | BIS `treasure-hardening-acceptance.md` “New live receipts” and “Empty-player claims”; bounded receipt index S1/M1/C1. These are Admin receipts, not game-client UI acceptance. |
| Claim to an initially empty Player | Passed — S1 | Unperformed — empty-player precondition not established in bounded record | Unperformed — empty-player precondition not established in bounded record | BIS `treasure-bounded-acceptance.md` evidence matrix and receipt index; Mutinynet empty-player limitation is explicit. |
| Early explicit Reject | Passed — S2 | Passed — M2 | Passed — C2 after original reconciliation | BIS `treasure-bounded-acceptance.md` receipt index and C2/M2 reconciliation notes. |
| Explicit session-end cancellation (distinct from closing a window) | Unperformed live; deterministic pass | Unperformed live; deterministic pass | Unperformed live; deterministic signed cancel-plan pass | BIS `treasure-bounded-acceptance.md`, “Session-end cancellation”. |
| Uninterrupted expiry and refund | Passed — S3 | Passed — M3 | Passed — C3 | BIS `treasure-bounded-acceptance.md` receipt index; current matching session receipts also appear in BIS hardening “New live receipts”. |
| Conflicting or competing spend | Unperformed adversarial live race; deterministic duplicate/competing-operation safeguards pass | Unperformed adversarial live race; deterministic safeguards pass | Unperformed adversarial live race; deterministic safeguards pass | BIS `treasure-bounded-acceptance.md`, “Duplicate/competing operations”; no race pass is claimed. |
| Closed-window recovery | Passed — S4 | Passed — M4 | Passed — C4 after original reconciliation | BIS `treasure-bounded-acceptance.md` portable-recovery row and receipt index. This is not the game-client flow. |
| Lost acknowledgement and original-operation recovery | Passed — original Signet recovery receipts | Passed — `harden-lost-m1`, one successful finalization response dropped and original payout independently verified | Passed — C2/C4 original-operation recovery | BIS `treasure-bounded-acceptance.md` and `treasure-hardening-acceptance.md` “Browser-only lost-acknowledgement fixture”. No replacement submission is counted as recovery. |
| Encrypted export/import and cross-profile recognition | Passed — S4 | Passed — M4 | Passed — C4 | BIS `treasure-bounded-acceptance.md` portable-recovery row; not imported-game UI acceptance. |
| Network/profile replacement during an active session | Passed — actual Signet preference/remount transition, wrong-scope actions denied, original chain restored before one Claim | Blocked — no matching funded replacement lifecycle in current evidence | Blocked — no matching funded replacement lifecycle in current evidence | BIS `treasure-hardening-acceptance.md` “Current verification and reservations”; this is the Signet case only and does not prove Mutinynet replacement. |
| Asset-bearing funding and exact asset-preserving change | Unperformed live; deterministic verifier/binding pass | Unperformed live; deterministic verifier/binding pass | Unperformed live; local binding only | BIS `treasure-bounded-acceptance.md`, “Asset carrier and exact asset-preserving change”. |
| Insufficient funds / fee-policy change | Unperformed live; deterministic safeguards pass | Unperformed live; deterministic safeguards pass | Unperformed live; deterministic policy tests pass | BIS `treasure-bounded-acceptance.md`, “Insufficient funds and fee-policy change”. |

The matrix is complete as an evidence inventory, including its blocked and
unperformed cases. It does not claim all rows passed. Exact game-client funded
Claim/Reject remains C096-T005/C094-T038; live rollback remains C096-T006;
actual hidden-tab and funded-action timing remain C096-T008. No network/mode
tuple is promoted to production-qualified by checking T004.

#### B2 exact-input SDK settlement source review

The pinned `@arkade-os/sdk` is 0.4.79. Its `Wallet.settle({inputs})` accepts
caller-selected inputs and bypasses generic candidate selection, but the normal
settlement path still refreshes expired VTXO state, requires the exact input to
be annotatable from a registered SDK contract record/handler, and invokes the
handler's optional `assertSpendableNow` hook before intent registration. The
built-in `arkade` handler has no such spendability hook; its generic selection
is separately opt-in through contract metadata. The V4 treasure code compiles
the script directly and uses its staged player/game/emulator/operator and
checkpoint-signing flow; no registration of a B2 treasure record with the SDK
handler registry or wallet contract repository was found. Therefore exact
`settle({inputs:[B2]})` is not a safe shortcut: in the present setup it lacks
the annotation record, and manually adding an `arkade` row would still not
validate the Treasure refund branch, bound Game destination, or terminal
receipt. Operator/emulator acceptance remains unproven. The exact source review
and SHA-256 fingerprints are in BIS
`output/reports/treasure-sdk-recovery-review-2026-10-28/source-review.md`.
No wallet/provider/network call was made. C096-T003 remains stopped; C096-T005
does not gain any recovery acceptance from this finding.

Follow-up source-only comparison of `stealth-steel/tools/treasure-contract-live.mjs`
and the compiled artifact families is recorded in BIS
`output/reports/treasure-sdk-recovery-review-2026-10-28/source-review.md`.
That runner builds the isolated `BISTreasureFeasibilityV1` artifact, not B2's
V4 artifact; the legacy cooperative LTO refund is another distinct script.
Deterministic fixture compilation confirms different script hashes/branch
rules, but cannot reconstruct B2 without its protected original terms. The
observed swept/preconfirmed/expired output may satisfy an elapsed offer-time
predicate, but that does not establish exact V4 branch validity or
operator/emulator admission/finalization. No source-only patch can prove those
missing protocol facts; no generic refund workaround is justified.

#### Remaining C096 source-only work audit

| Task | Source/local work already evidenced | Outstanding acceptance (why the task stays open) |
| --- | --- | --- |
| C096-T005 | Current 0.0.30 guest route reaches Settings → Account; deterministic Claim/Reject guards are covered without financial-success injection. | Must connect the registered managed test session and complete real funded Claim/Reject with exact receipts. Current wallet/budget readiness does not admit a funded slot; no new operation is safe. |
| C096-T006 | Creation-disabled rollback regression is committed (`eb80ece`) and passed 10/10 focused runtime tests; unresolved legacy Claim journal preservation is covered for both networks. | Real rollback with the registered legacy/unresolved contract and reconciled protected journal/recovery receipts has not run. A fixture cannot close this live gate. |
| C096-T008 | Current-source-hash-matched cold/warm/offline/slow UI p95 measurements meet the local target on desktop and mobile; repeated reads coalesce. | Automation never observed `visibilityState: hidden`; funded acknowledgement and provider latency were not measured. No extra synthetic visibility event is counted. |
| C096-T010 | Current artifact/version/provenance checks, production build and publish checks, public route/version observations, and OpenSpec validation are recorded. | Final acceptance requires the remaining live gates, clean exact-artifact integration and authorized coordinated release checks. The latest BIS full-suite run had one sandbox process-ownership failure; an isolated elevated rerun passed, so the suite was not repeated. |

No remaining C096 task is source/test-only. The local portion of T005/T006/T008/T010
is recorded above; each open task requires the named live/runtime/receipt gate.

## 2026-10-28 additional T008 browser visibility attempt

In the managed Chrome DevTools session, game page 2 remained selected while a
foreground `about:blank` page was opened as page 4, then page 3 was selected.
The game page still reported `document.hidden === false`,
`visibilityState === 'visible'`, and `hasFocus === true`. The temporary page
was closed and game page 2 restored as selected. CUA could not attach to page 4
because its IAB browser surface was unavailable. This is another failed
visibility transition, not hidden-tab evidence. Do not repeat equivalent tab
switch attempts; C096-T008 remains open for an actual hidden-state observation
and funded acknowledgement/provider timing.

## 2026-10-27 bounded independent progress

This pass completed deterministic review and recorded live stop conditions. It
did not use a wallet, provider signing endpoint, protected Preview bypass,
deployment, or publication. The exact source/test review was performed against
the BIS checkout at `D:\Documents\Projects\VC\Bitcoin\blockchain-integration-service`;
the game package remains separate.

| Task | Disposition in this pass | Evidence / remaining gate |
| --- | --- | --- |
| C096-T001 | Historical 2026-10-27 status; superseded by the 2026-10-28 fail-closed preflight above | At that time the original Signet wallet vault lock and unverified journal state were unresolved. The later protected read-only preflight is the task's deliverable and confirms no signing is admitted; it does not clear the lock or qualify a network/mode. |
| C096-T002 | Blocked; no retry | Prior co-signer admission/delayed-finalization observations are inconclusive. No new attributable operator evidence was provided; Mutinynet covenant creation stays unavailable. |
| C096-T003 | Stopped before recovery | The original B2 swept/expired 1,000-sat operation lacks authoritative acceptance semantics and destination/fee proof. Do not sign or submit. |
| C096-T004–T006 | Historical 2026-10-27 status; see current dispositions above | At that time the matrix, funded managed-browser Claim/Reject, and live rollback were open. C096-T004's exhaustive evidence inventory is now complete, but historical receipts are not joined to the exact 0.0.30 archive hash, so current-artifact qualification remains blocked. C096-T005 and T006 remain open for live game UI acceptance and rollback. |
| C096-T007 | Deterministic criteria complete; live lifecycle remains separate | `contract-validation.test.ts` proves the one Signet option, two Mutinynet options, their descriptions/default ordering, automatic host selection, and rejection of unavailable explicit choices. Admin source pins Signet to browser-policy and defaults Mutinynet to covenant; the game omits a local mode so BIS selects before funding. A new `treasure-session.test.ts` case starts with explicit covenant mode, receives a pending acknowledgement without a contract, snapshots/restores the session, later reconciles the same covenant record, and proves there is one creation call and no browser-policy fallback. The implementation now preserves the explicit mode in portable recovery. Focused Admin session suite passes 19/19. This covers deterministic choice/no-downgrade behavior; funded live cases remain blocked under T001/T004/T005. |
| C096-T008 | Local latency criteria pass; actual hidden-tab and funded acknowledgement remain open | Fresh 0.0.30 source-hash-matched UI measurement in `output/reports/treasure-local-responsiveness-2026-10-28/performance-current.json`: at 1280×844, cold open/back p95 14.7/15.3 ms and warm open/back 15.7/15.6 ms; at 390×844, cold 15.4/16.7 ms and warm 15.7/15.6 ms. Offline UI open/back 11.1/15.4 ms desktop and 12.6/14.3 ms mobile. Slow-read coalescing and delayed feedback pass; 0 financial calls. Browser automation attempts (background tab, headed tab switch, minimized window) all continued to report `visibilityState: visible`, so actual hidden-tab behavior was not observed and remains open. Funded acknowledgement was unperformed; provider latency was not measured. |
| C096-T009 | Independent disposition review complete; no tuple qualified | Reviewed the C094 and C096 specifications, Admin/game mode selection, offer persistence/recovery, BIS signing and settlement boundaries, sanitized Signet receipts, and the blocked Mutinynet co-signer/B2 record. Signet `browser-policy-v1` has real-contract evidence but still lacks current protected managed-browser funded Claim/Reject acceptance. Mutinynet `arkade-covenant-v2` lacks attributable operator admission/finalization evidence and the original B2 recovery prerequisites; Mutinynet `browser-policy-v1` also lacks its exact funded lifecycle matrix. No network/mode tuple is promoted to fully qualified. This disposition review does not certify missing live evidence. |
| C096-T010 | Local deterministic checks pass; release gate blocked | Focused BIS tests pass 35/35; focused game regressions pass 30/30; game production build passes. Previously completed exact archive, full game suite, public types, publish checks and OpenSpec validation remain recorded under C094-T043. A fresh read-only public Pages check returned root and `environment.json` HTTP 200 with v0.0.27, but none of its three JavaScript bundles contains the Mutinynet release-boundary status/message. The protected BIS Preview redirects browser CORS preflight to Vercel Authentication; no approved CORS-safe path has been supplied. Do not publish or import another package version while these acceptance gates remain open. |

The current implementation-level feature checks are therefore reviewable, but
the production qualification and release are not complete. T007's deterministic
mode-selection and uncertain-acknowledgement criterion is complete; T009's
independent disposition review is complete with every unqualified tuple kept
blocked. Live work resumes only when its exact gate clears: verified protected
wallet/journal state for T001, attributable operator acceptance for T002, and
the browser-accessible runtime needed for the remaining game acceptance.

## 2026-10-27 exact 0.0.29 release candidate

BIS commit `0a2b1726877fa6f85917c13bebbe29dbaf4e5d72` fixes hosted Game Wallet
address projection using its read-only identity. The exact committed package
subtree was built and imported as `@bis/integration@0.0.29`, SHA-256
`3617a257a9d1e48084d9e845d9d911747735d3dff9dcd6f4bb9fb0d51d89aff6`, with all
201 archive and installed files verified. BIS full suite, contract typecheck,
and build passed. Game contract typecheck, focused BIS UI tests 22/22, Pages
checks 10/10, full game suite, and production build passed. The production
build identifies BIS 0.0.29 and Pages metadata `v0.0.29`.

This closes the exact-artifact and deterministic acceptance portion of
C096-T010 only. The 0.0.29 Pages release still needs deployment and a live
managed Signet connection. Current protected wallet status shows retained
Signet funds and unverified application journals, so no new spend is safe until
the exact registered application session reconciles them. T001, T004-T006,
T008, and T010 remain open; T002/T003 remain blocked without new operator or
original B2 evidence. No Mutinynet acceptance or network/mode qualification is
claimed by this candidate build.

## 2026-10-27 continued implementation and published-runtime verification

The production game at `https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/`
is now v0.0.28. Read-only browser checks from the exact Pages origin received
HTTP 200 from BIS `/api/bis/identity?network=signet` and Arkade `/v1/info`; the
BIS `/api/bis/connect` request from the game returned HTTP 200 and the game
displayed Signet / BIS v0.0.28. Thus the previous v0.0.27/deployed-boundary and
Pages CORS claims above are historical and superseded. Production health is
ready, and Signet identity reports `sign`, `signMessage`, and `signerSession`.

The protected Pages-origin run restored the registered test Player Wallet
through the actual first-use/restore UI without exposing its phrase to logs or
tool output. It reached the server-backed Game Wallet UI, which identified
`Game wallet source: Server`, but the Arkade address remained `—` after the
bounded wait. A separate read-only Node SDK derivation from the public Signet
identity succeeded; this does not establish browser address derivation or a
funded offer. No contract was created, no spend was attempted, and no Claim or
Reject receipt exists from this run. Stop here: do not retry the same browser
flow without a code/evidence change that explains the address-read failure.
T038 and C096-T004/T005 remain open.

## 2026-10-28 read-only original B2 recovery/API review

C096-T003 remains open; no protected-wallet state was read, and no run, operation, provider, signer, or network transaction was touched. Local source inspection compared the frozen B2 qualifier and its one-run recovery with the installed SDK. BIS locks and installs `@arkade-os/sdk` 0.4.79; the official release page shows 0.4.79 as the latest stable tag (released 2026-10-08). Current upstream SDK docs are for 0.5.0-rc.26, so they are prerelease guidance rather than a reason to change the pinned stable dependency. The installed 0.4.79 declarations expose `getVtxoManager().recoverVtxos()` / `getRecoverableBalance()`.

These are distinct recovery paths:

- `treasure-v4-qualification.ts --reconcile` is read/verify-and-reconcile for the exact original B2 run. It never resubmits: if a spend transaction ID was already journaled, it verifies the original payout ancestry and reconciles that operation; otherwise, if only the funding ID exists, it verifies the exact original 1,000-sat funding output and reconciles funding. It does not resume the B2 staged protocol sequence and cannot invent a missing transaction ID.
- `treasure-v4-funding-recovery.ts` is a separate, narrowly pinned refund path for `treasure-b2-261026-1125`. Its admission requires the original V4 Mutinynet B2 run, exact `treasure-empty-game-mutinynet` pair and original source hash, `stopped-fund` / `original-unresolved`, elapsed treasure offer deadline, a recorded reconciliation timestamp, exact settled 1,000-sat funding operation whose provider ID matches the run, no prior claim binding/stage/spend/receipt, no conflicting operation, and matching still-authorized wallet profiles/grants. Any existing refund must be only a prepared unsent reservation, or an exact staged pending operation that the recovery path can continue safely.
- Critically, “offer deadline elapsed” is not Ark VTXO expiry. Before constructing/signing the refund, the recovery code re-reads the exact funding `txid:vout` and requires the original script/value, unspent, unswept, unrolled, non-preconfirmed, asset-free, not expired, and `canSpendOffchain`. Thus this code is not a recovery route for an Ark output that has already expired or been swept. It reconstructs the original refund branch, binds the original terms/funding/checkpoint script, and stages game, emulator, operator, and checkpoint signatures. Its unknown-state handling preserves the original reservation; the recovery script’s output explicitly does not claim production qualification.
- The SDK’s general VTXO recovery API instead selects swept-but-still-spendable VTXOs and eligible preconfirmed subdust for settlement back to the wallet; the SDK source says contract paths that refuse a spend now are skipped. It is not evidence that a swept/expired custom treasure covenant can be refunded to the original game destination, and must not be substituted for the pinned original-contract recovery. The official emulator `SubmitTx` documentation also distinguishes emulator signing from Ark operator admission; emulator approval alone cannot establish B2's pre-deadline operator acceptance.

To establish whether the original recovery is currently eligible, a separately authorized read-only protected-journal inspection must verify the exact run ID and source hash, run phase/outcome/reconciliation timestamp/deadline/terms/funding ID, corresponding fund and refund operation states/provider IDs/fingerprints, absence of any conflicting reservations, and wallet profile/grant binding. A fresh indexer observation must then establish the funding output still matches the original script and is unspent, unswept, unrolled, spendable and unexpired. None of those current protected-ledger or live-output facts is established by this source review. If the funding VTXO is already swept/expired or a prior spend is ambiguous, the dedicated refund gate fails closed and C096-T003 remains stopped pending a separately reviewed route and authoritative evidence.

A terminal receipt must link the exact original funding outpoint through the actual checkpoint/spend ancestry to the exact original Game destination and 1,000-sat output, with the operation journal reconciled to that provider transaction. The current receipt verifier proves this transaction/output ancestry but does not itself calculate `observedFeeSats`; fee evidence must be independently obtained and matched to the original operation before claiming the task's exact fee criterion. Do not mark C096-T003 complete from offline tests, source eligibility, SDK recovery APIs, or emulator output.

Official references reviewed: [SDK 0.4.79 release](https://github.com/arkade-os/ts-sdk/releases/tag/%40arkade-os%2Fsdk%2F0.4.79); [current SDK documentation](https://arkade-os.github.io/ts-sdk/) (0.5.0-rc.26); [SDK VTXO recovery implementation](https://github.com/arkade-os/ts-sdk/blob/master/packages/ts-sdk/src/wallet/vtxo-manager.ts); [Arkade emulator SubmitTx semantics](https://github.com/arkade-os/emulator).

## 2026-10-28 current-artifact responsiveness follow-up

Rebuilt the game as package v0.0.30 (BIS 0.0.30). Production build passed and emitted Pages metadata `v0.0.30`, 18,829,269 uncompressed bytes. The fresh measurement report is `output/reports/treasure-local-responsiveness-2026-10-28/performance-current.json`; it records SHA-256 for the current treasure UI source, harness bundle, built CSS and main game bundle. The treasure UI source hash matches the reviewed implementation; measurements use that component bundle with the current build stylesheet, isolated `file://` fixture and `connect-src 'none'` CSP.

Measured cold component mounts (20) and warm open/back actions (50) at 1280×844 and 390×844. All observed p95 values are below the 100 ms target: desktop cold open/back 14.7/15.3 ms and warm 15.7/15.6 ms; mobile cold 15.4/16.7 ms and warm 15.7/15.6 ms. Offline open/back were 11.1/15.4 ms desktop and 12.6/14.3 ms mobile. Deliberately slow unresolved inspection retained delayed feedback and coalesced repeated checks. The harness made zero financial calls and no provider calls; provider latency and funded action acknowledgement remain unmeasured.

Actual hidden-tab acceptance is still open. A background page/tab switch in the attached browser, a headed Playwright second-tab switch, and minimizing the headed browser window all left `document.visibilityState` at `visible`. The automation environment did not transition the document into the browser's hidden lifecycle state, so no hidden behavior is claimed. The checkbox remains open for that real hidden-tab observation and the separate funded acknowledgement criterion.

## 2026-10-28 protected B2 inspector attempt

The existing `treasure-contract-inspect.mjs` was invoked twice for the exact original run ID without `--reconcile` (once in the default workspace context and once with elevated host context). Both invocations exited nonzero with only the wrapper result `protected-original-inspection-unavailable`. The wrapper hides the underlying cause, so this does not establish whether vault access, run lookup, or another protected read failed; no current run/journal fields or indexer findings can be claimed from these attempts. No signing, operation or journal reconciliation, submission, broadcast, or recovery was requested. The sanitized result is retained at `../../../output/reports/treasure-b2-readonly-2026-10-28/inspection.json`. C096-T003 remains open; this diagnostic does not authorize a recovery retry.

## 2026-10-28 direct public B2 outpoint observation

At `2026-10-28T10:57:58.134Z`, a read-only `RestIndexerProvider.getVtxos` query to `https://mutinynet.arkade.sh` for the exact documented original outpoint `6810a50d5b77d707dcea6b2469243dfceedbedfade0175bb0119bbf7d4afcec7:0` returned one 1,000-sat row. The returned script-byte SHA-256 (`0ee48440ac8c72203b4fce00a36aca48684351731f755e4be80f803a9625050f`) matches the original script hash previously recorded in the protected handoff. The indexer reports `isSwept:true`, `isPreconfirmed:true`, `isUnrolled:false`, no spend/settlement transaction ID, `expiresAt:2026-10-26T14:52:19.000Z`, and virtual status `swept`. Sanitized fields are in `../../../output/reports/treasure-b2-readonly-2026-10-28/public-outpoint-observation.json`; the temporary query script is beside it.

This fresh public observation confirms the pinned refund path's spendability admission fails; it does not reveal the protected run/operation journal, operator acceptance semantics, or destination/fee proof, and it is not a terminal recovery receipt. No protected wallet, signer, reconciliation, signature, broadcast, or transaction was used. Do not attempt a refund or use generic VTXO recovery for this covenant. C096-T003 remains open pending the authoritative protected-ledger and separately reviewed recovery-path evidence required by its acceptance criteria.

2026-10-28 SDK recovery-source review: the pinned `@arkade-os/sdk` 0.4.79
`recoverVtxos()` implementation was inspected read-only; source fingerprints
and details are recorded in
`output/reports/treasure-sdk-recovery-review-2026-10-28/source-review.md`.
It queries wallet-wide recoverable outputs with `withUnrolled:false`, filters
through registered contract handlers, and settles selected outputs back to the
wallet address. It is neither target-scoped nor proof that this custom B2
covenant's refund branch, destination, fees, or receipt are valid. Do not invoke
it for B2. Combined with the exact public outpoint observation, the existing
recovery hypothesis is closed as unsafe/ineligible; C096-T003 remains open
pending a separately reviewed target-scoped path and authoritative protected
journal/operator/terminal-receipt evidence.

2026-10-28 C096-T006 deterministic rollback follow-up: added a focused
regression proving creation-disabled inspection preserves an unresolved legacy
Claim journal on both Signet and Mutinynet, retains the original contract ID,
requests resolved contracts, and makes no start/claim/reject/end calls. The
focused `node --test stealth-steel/src/test/ui/treasure-runtime.test.js` run
passed **10/10**. This is local fixture evidence only; C096-T006 remains open
for live rollback with real legacy/unresolved operations and protected
journal/recovery receipts.

C096-T006 regression commit: `eb80ece` (`test: preserve unresolved treasure claim rollback`); focused log: `output/reports/treasure/C096-T006-2026-10-28/treasure-runtime-focused.log` (10/10).

2026-10-28 C096-T006 deterministic failed-write/restart follow-up: extended
`stealth-steel/src/test/ui/treasure-runtime.test.js` with an unknown creation
write followed by a simulated restart while contract creation is disabled. A
fixture-only provider journal contains an unresolved state, exact contract ID,
original-script sentinel, and recovery-material sentinel. The test serializes
that journal once and verifies its exact bytes are unchanged after inspection,
preserve-session disposal, disabled-creation restart, and re-inspection. It
also verifies the restored session retains the contract ID, the script and
recovery sentinels are unchanged in the mocked journal, only one create
submission occurred, and claim/reject/end were never called. No protected
vault, network, signing, or transaction is involved. The focused runtime suite
now passes **11/11** (`node --test
stealth-steel/src/test/ui/treasure-runtime.test.js`).

This closes only the deterministic fixture gap for unknown-write/restart
preservation. The operation journal, original script, and recovery fields are
test sentinels returned by a mock; these checks do not inspect or prove
preservation of the real BIS protected journal or signed recovery material.
The active-offer/unknown-Claim fixture cases also remain deterministic only.
C096-T006 remains open for rollback on real legacy and unresolved operations,
full protected-journal/script/recovery preservation, and attributable live
receipts. C096-T008 remains open because the managed Chrome/CDP session could
not be attached to obtain an actual hidden lifecycle state.

## 2026-10-28 C096-T008 managed Chrome/CDP attempt and T006 criterion audit

One distinct managed-browser/CDP attempt could not attach to a browser session:
`mcp__chrome_devtools__list_pages` returned `The browser is already running for
C:\Users\srive\.cache\chrome-devtools-mcp\chrome-profile. Use --isolated to
run multiple browser instances. Cause: The browser is already running for
C:\Users\srive\.cache\chrome-devtools-mcp\chrome-profile. Use a different
userDataDir or stop the running browser first.` A separate Playwright tab-list
attempt returned `Browser is already in use for
C:\Users\srive\AppData\Local\ms-playwright-mcp\mcp-chrome-80c3244, use
--isolated to run multiple instances of the same browser`. The read-only host
process lookup needed to discover an existing CDP endpoint returned `Access to
a CIM resource was not available to the client.` No browser was stopped,
replaced, or launched against either locked profile. No visibility override
was applied. This is a distinct lifecycle-attachment attempt, not evidence of
hidden behavior; the managed environment could not expose a hidden lifecycle
state. C096-T008 remains open for genuine hidden-tab evidence and funded
acknowledgement.

T008 independent local criteria were already measured against the current
0.0.30 UI source in
`output/reports/treasure-local-responsiveness-2026-10-28/performance-current.json`:
cold/warm desktop and mobile, offline open/back, and slow unresolved-read
feedback/coalescing all meet the recorded local target. No additional local
latency-only case remains to run. Actual hidden-tab behavior still lacks a
browser visibility transition; funded acknowledgement and provider latency
remain unmeasured because they require the separately gated live operation.
The current root `npm test` result is deterministic suite evidence, not a
substitute for those T008 observations. Keep C096-T008 open.

The T006 audit compared all eleven cases in
`stealth-steel/src/test/ui/treasure-runtime.test.js` with the task wording. The
two creation-disabled regressions provide deterministic fixture evidence on
both Signet and Mutinynet for an active legacy offer with no returned contracts
and an unresolved legacy Claim returned by inspection. They verify a scoped
resolved-contract query, retain the original contract ID (and, in the pending
case, that ID in the stored session), and assert that start/claim/reject/end
are never called. The additional unknown-create/restart regression preserves
the exact serialized bytes of a mocked unresolved journal, including its
contract ID, original-script sentinel, and recovery-material sentinel, across
an object-level runtime restart with creation disabled; it asserts one create
submission and no claim/reject/end calls. The remaining eight tests cover other
runtime behavior and do not add rollback, script-retention, or recovery-
material evidence.

The tests do not prove byte preservation of the real BIS journal, restore a
real browser session or process, inspect protected recovery material, or
execute rollback against real funded legacy and unresolved operations. The
script and recovery values in the added regression are mock sentinels, not
original signed material. The fixture cannot establish process-level recovery
or network settlement. Thus only deterministic fixture rollback-safety is
evidenced; C096-T006 remains unchecked for protected-state and live-operation
acceptance. The updated focused suite passes 11/11.
