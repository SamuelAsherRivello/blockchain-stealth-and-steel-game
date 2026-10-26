# C094 acceptance handoff, 2026-10-26

Latest T010 review is in the
[wallet hardening handoff](../../../../blockchain-integration-service/openspec/programs/bis-server-treasure-release/treasure-t010-hardening-2026-10-26.md).
Its local production CSP candidate passes clean managed-browser gameplay and
Account checks. The game now requires explicit per-offer funding consent and
passes focused/full regression plus wallet-free desktop/mobile consent checks.
T010 remains open for exact deployed/imported-artifact verification. No package
import or publication ran.

The initial [task](tasks.md) reconciliation recorded 18 of 36 complete. T012 and T013 include
the coordinator's game-host fixes for unverified restore, exact offer/network
binding and pending financial state surviving countdown expiry. The previous
three TODOs are executable assertions. The coordinator reports 18 related tests
and contract typecheck passing. This handoff inspected the updated source and
task entries without rerunning the coordinator's tests or changing host code.

The [cross-repository qualification handoff](../../../../blockchain-integration-service/openspec/programs/bis-server-treasure-release/treasure-qualification-handoff-2026-10-26.md)
records the current per-network/mode matrix, historical receipt reuse, remaining
browser acceptance cases, upstream B1 dependency and bounded B2 next action.
It supplements the existing proposal/design; no requirement or task checkbox is
changed by this handoff.

The approved browser-policy mode can qualify separately for its disclosed real
contract behavior, once its own acceptance matrix passes. It does not establish
network-enforced expiry or complete the stronger covenant qualification gate.
Existing or unknown contracts never downgrade. No current mode has a newly
completed full production acceptance matrix.

B1 remains blocked before funding pending attributable operator rejection
evidence. B2's current V4 runner is offline-verified, but its funded check remains
unperformed. The bounded 1,000-sat faucet source passed independent offline
verification; this does not establish a funding receipt or eligible source coin.
The coordinator subsequently reports a settled real 1,000-sat faucet receipt,
one eligible source coin in `treasure-empty-game-mutinynet`, 1,000 of 10,000 sats
rolling exposure and no pending conflict. The Treasure owner independently
confirms all 11 runner pin inputs and 15 offline snapshot inputs unchanged.
Its B2 source remains frozen and ready for one coordinator-owned run after fresh
protected checks. B1 remains blocked. No financial or provider action occurred
in this handoff; its financial update comes from the coordinator's evidence.

The game still records BIS 0.0.23 in its vendor inventory. Host fixes do not
replace that dependency. Keep import separate until BIS is ready, then use the
verified release/export/import workflow and complete the unchanged game,
deployment and live acceptance gates. T006/T007 and T035 remain open.

The later assigned T034 fixture task is complete with 81 focused passing checks,
targeted strict types and configured BIS root typecheck. The CLI now reports
23/36 complete with T034 checked and T035 unchecked. Its
[dedicated handoff](../../../../blockchain-integration-service/openspec/programs/bis-server-treasure-release/treasure-t034-fixtures-2026-10-26.md)
records all nine scenario groups, narrow diagnostics hardening and exact scope.
No live case is completed by that checkbox. The coordinator's latest B2 attempt
stopped before provider access at protected-vault authorization; restore the
existing protected path before any separately assigned live action.

## Coordinator continuation, 2026-10-26

The OpenSpec ledger now records 22 of 36 tasks complete. C094-T014 and
C094-T023 through C094-T025 cover preserved start/reveal/action/recovery UI
behavior, offer-scoped single-flight inspection, immediate durable action
acknowledgement behavior, and stable delayed-status feedback. The revealed-chest
uncertainty regression confirms that unavailable status retains the exact offer
binding, disables Claim, and only restores eligibility from the matching funded
projection. The delayed-status
UI was checked with controlled timers: the indicator appears at 300 ms, and the
10-second threshold exposes a coalesced `Check status` action without submitting
a financial operation. Its focused fixture set passes 9/9; UI tests pass 7/7;
the complete game suite passes 1,162/1,162; `npm run test:publish` passes 10/10;
BIS contract typecheck and production build pass. The game remains on package/BIS version 0.0.23; no BIS
package import or release occurred.

A fresh `node stealth-steel/tools/verify-bis-package.mjs` check confirms the
currently vendored `@bis/integration` archive and all 149 installed files still
match verified version 0.0.23; it does not cover the next BIS export/import.
GitHub Pages run 39898190104 for main commit
`df009a29c79321575f3edbd8fdb6940f79177964` failed in `npm run test:publish`
before the game suite, build or deployment. Its stale assertion expected
`.github/workflows/release.yml` to be absent, but that workflow exists on main.
The current local publishing test now asserts the release workflow's contracts
and passes 10/10. The fix is not yet on GitHub, so no Pages deployment is
verified. A direct read of the current public game root and `environment.json`
returned HTTP 200 and `releaseVersion: v0.0.23` (published size `18680522`);
this confirms the old deployment remains live, not that the candidate is live.
The next release still requires the matching BIS release/import, completion of
the remaining live qualification and rollback tasks, and a successful Pages
workflow plus public route/version checks.

## Imported 0.0.26 local acceptance addendum, 2026-10-26

This addendum supersedes earlier current-version/count statements above. The canonical CLI now reports **25 of 36 tasks complete**, with T016 and T017 completed in this pass. The previous program ledger count of 16 and this file's older count of 22 are historical.

The existing imported artifact remains 0.0.26, SHA-256 `44de29908cefd8d80d5e4260770902ade0d85b11419098209f2b6c9c495dbfb9`, with 201 verified installed files and recorded dirty-source provenance. This pass did not import, reinstall, repack or change versions. Local verification is not a production-qualified release. T011 remains open for the verified upstream release/integrated handoff, particularly if the new BIS public signing-source field changes the package.

Game-only corrections add the actual Signet explorer and pinned Mutinynet preflight origins to production CSP. An explicitly configured public HTTPS signer adds only its exact connection origin. Consent no longer asserts browser ownership from profile IDs. It consumes optional public manual/server signing source when present, otherwise clearly reports unknown source. Source changes before submission invalidate consent, including a change between approval and the queued command. No private BIS controller or wallet storage is read. The current archive does not yet expose the new public field, so its honest unknown-source fallback is the integrated path tested here.

Verification passes 1,178 full game tests on Node 24.21.0, public contract types, all 10 publishing checks, archive/all installed-file verification and production build. Guest Start, Settings and imported Account have zero CSP violations. The browser guard intentionally blocked one same-origin /api/bis/connect POST, resulting in an expected blocked-resource console error; no request reached the signer. Desktop/mobile synthetic public-profile consent checks verify visible actions and Skip/close/Escape with no financial calls or CSP violations. Six distinct injection canaries are blocked; two test listeners produced 12 event records. Same-origin script and legitimate CSSOM controls pass. Synthetic fixtures never inject a successful financial result and do not prove a real contract lifecycle.

Open tasks remain T006, T007, T010, T011, T015, T018, T019, T020, T021, T026 and T035. Remote negative-admission and delayed-finalization proof remain blocked without new upstream evidence. The original B2 source is preconfirmed and expired, and no new financial action was assigned. Additional exact-artifact legacy/recovery integration, funded UI/lifecycle, creation-disable rollback, reference-device performance and deployed resource/privacy checks remain unperformed. Existing reservations, wallet data and journals remain untouched. Publishing requires separate authorization and evidence. The isolated production preview is stopped after ownership verification; shared servers are untouched.

Sanitized evidence: [verification.json](../../../output/reports/treasure-imported-0.0.26/verification.json), with source and log SHA-256 values. Current documentation is [treasure-lto.md](../../../docs/treasure-lto.md) and both deep-dive pages.

## Recovery-access continuation, 2026-10-26

C094 now reports 26/36 complete. T015 public integration/recovery access is complete: exact imported source retains reads, original actions and encrypted recovery independently of new creation. New regressions verify original inspection on both networks with creation disabled and no replacement funding, unsupported-network rejection, and Account accessibility when creation is unavailable. The focused suite passes 21/21; the complete game suite passes 1,181/1,181 on Node 24.21.0 with no failures or skips. This does not complete the separate live funded rollback T020. Evidence is [recovery-verification.json](../../../output/reports/treasure-imported-0.0.26/recovery-verification.json).

A fresh protected read-only B2 inspection passes registered wallet binding, active grants, no reported pending wallet operation, zero unrelated pending operations, 2,000-sat rolling-day headroom, operator/emulator identity and zero-fee policy. The exact original 1,000-sat output is now swept, preconfirmed, expired and not spendable, with no assets. Its original run remains unresolved and already reconciled; no spend, refund, replacement allocation or signing occurred. B2 cannot proceed. Preserve the original outcome and journal. B1 remains blocked without new upstream attribution evidence.

A fresh public route check reports Admin 200 without candidate CSP, Marketplace 404, and game 200 on v0.0.23 without candidate CSP. These are deployment blockers, not local failures. No import or publication occurred. The remaining ten tasks are T006, T007, T010, T011, T018, T019, T020, T021, T026 and T035. Reference-device p95 and the exact deployed/funded cases remain unperformed.

## Explicit signing-source release gate

The installed 0.0.26 archive does not declare BisWalletReference.source in src/client/integration-layer/bis.ts. Its actual consumer behavior is the unknown-source fallback. Controlled manual/server snapshot tests verify compatibility logic only. Source-aware production behavior requires a separately published updated BIS version containing the field, exact archive import/verification and integrated checks for both source projections. No new publication or import was performed. T010/T011 and final qualification remain open.

## Exact 0.0.27 import completion, 2026-10-26

The latest current candidate is BIS/game 0.0.27, superseding the earlier 0.0.26 current-version and missing-field statements. T011 is complete and C094 reports 27/36. The exact archive SHA-256 is f441f9e2bba7f9f6d510c00405b90c0dbb7bdc25adfac0c69bcfe28533bb914c. All 201 archive-member and installed-file hashes match. Source commit/dirty provenance is retained; only the referenced 0.0.27 archive remains vendored. No source-folder dependency or symlink is used.

The new archive actually declares optional BisWalletReference.source. The public type fixture now reads that field from the real imported snapshot type. Manual/server/unknown consent behavior remains tested with controlled public snapshots, while dev and production guest Account use the real installed package and visibly display BIS: v0.0.27. Synthetic source tests prove UI compatibility, not funded or server-signing qualification.

A clean npm ci --ignore-scripts reports zero vulnerabilities. All 1,181 full game tests pass on Node 24.21.0, public types and all 10 publishing checks pass, and production build passes with the existing chunk-size warning. Guest Start, Settings and Account pass in dev and production with zero CSP violations. Signing/provider traffic is guarded; one local connect POST is intentionally blocked in each guest check. Desktop/mobile consent dismissal checks make no financial calls. All six distinct injection canaries are blocked; duplicate test listeners produce 12 records.

For Windows dependency replacement, the identity-verified game PID 13536 was stopped under the shared startup lock, the exact lockfile was installed, and the root launcher restarted only the game on fixed port 5176. The restored identity is 29f49aa0-4bbe-4e5a-a4eb-be9bba7701a5, PID 65412. The owned isolated production preview on 6176 is stopped; the shared game remains running. BIS/faucet servers and wallet storage are untouched.

Evidence is [verification.json](../../../output/reports/treasure-imported-0.0.27/verification.json), including source/log hashes, browser outputs and server lifecycle. The remaining tasks are T006, T007, T010, T018, T019, T020, T021, T026 and T035. Local import completion is not publication or production qualification. Original B2 recovery remains unresolved/protected, and no new financial action occurred.

## Non-financial local responsiveness and gate review

Progress remains 27/36. Two current-window inspection feedback bugs are fixed: completion clears notices, and reopening/checking a delayed request retains its elapsed feedback. Both new tests fail against the reconstructed prior implementation; the updated nine-test UI suite and full 1,183-test suite pass. Types, publishing 10/10, build, exact package verifier and managed real-game guest flow pass.

On the documented Windows/headless Chromium/SwiftShader reference setup, 20 cold and 50 warm samples per 1280/390 px width show cold chest presentation p95 18.6–19.3 ms and warm presentation/Back p95 14.9–16.3 ms. This uses the real window/UI code with controlled unverified state, disabled Claim/Reject and no financial success projection. Offline samples pass; no provider is contacted. Back acknowledgement is measured separately from its existing exit animation. The headless browser does not actually become hidden on tab switching; hidden-tab and funded action timing remain unperformed. T026 remains open.

A fresh pinned native VM passes 50 vectors, with three proof script files matching the installed 0.0.27 archive. This is local execution under supplied clock/expiry context, not authoritative operator timing, live acceptance or independent qualification. T006/T007 remain incomplete. Local CSP/dependency/consent evidence supports only the local part of T010; exact deployed verification is still missing. T011 remains complete. T021 final qualification and T035 missing live checks remain incomplete. B2 wallet state and its protected unresolved operation were not accessed in this pass.

Evidence: [verification.json](../../../output/reports/treasure-local-responsiveness/verification.json) and [performance.json](../../../output/reports/treasure-local-responsiveness/performance.json). The isolated preview is stopped; shared game PID 65412 on 5176 is preserved. No new import, financial action or publication occurred.
