# C094 acceptance handoff, 2026-10-26

## Current execution contract, 2026-10-29

The current takeover section in the BIS program ledger and C094 design's release gate supersede historical package versions, import freezes and whole-checkout-clean assumptions in this handoff. The installed baseline is game/BIS 0.0.30. The next import and matching release are authorized after the BIS owner accepts its server candidate, publishes BIS and supplies the exact archive, hash, source commit/state, packed inventory and verifier result. Preserve unrelated changes and require truthful packed-source provenance. Server tasks waiting for game import/release evidence are downstream of this handoff.

The old unknown Signet refund and original Mutinynet B2 remain distinct unresolved operations. Do not clear their journals or infer terminal failure. A distinct registered test pair may proceed only under the coordinator's sole financial slot and its own fresh journal/budget admission. The game currently holds no such slot. Current source synchronization, browser observations, publication fix and remaining prerequisites are in `output/reports/treasure/game-takeover-2026-10-29/current-disposition.md`; historical evidence below retains its original dates and limits.

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

## Observed deployed v0.0.27 and closeout review

Progress is now 29/36. T010 is complete for the observed local-model deployed hardening: both new Pages runs succeeded; Admin/Marketplace/game are 200 with CSP; public environment.json and real Account show v0.0.27. Actual game CSP matches the reviewed generator, a fresh guest flow has no violations, six injection canaries are blocked, and 41 focused privacy/storage tests pass. The previous 404/no-CSP blockers are superseded. The deployed policy has signerEndpoint=none; hosted signer configuration is a separate owner task and is not qualified by this check.

T021 evidence review is complete with an incomplete-qualification conclusion against all 18 requirements in both specs. It does not waive the remaining seven tasks: T006/T007/T018/T019/T020/T026/T035. The public frontend is a prototype, not proof of production contract acceptance.

New offline cohorts of 20 samples per width pass p95: 1280 px opening 15.7 ms/Back 15.0 ms, 390 px opening 15.3 ms/Back 15.0 ms. Actual hidden state still was not obtained, even after removing focus emulation and minimizing only the owned test window. Funded acknowledgement remains unperformed. The SDK-only V4 assessment uses public-vector keys with signing/network access prohibited. Its four covenant branches have no generic handler path for either actor; the additional game-owned CSV exit is excluded from collaborative recovery. A metadata opt-in flag supplies no missing authorization. No supported turnkey recovery for the original swept V4 output is validated, but operator-assisted recovery is not proved impossible.

Complete review: BIS openspec/programs/bis-server-treasure-release/treasure-closeout-review-2026-10-26.md. Sanitized checks and hashes: [verification.json](../../../output/reports/treasure-shipping-readiness/verification.json). Original B2 wallet state and reservations remain untouched; no new release or financial action occurred. All owned test browsers/previews are closed; shared game server 5176 is preserved.

## Bounded original B2 protocol research

Official pinned arkd source supports a candidate swept-output batch ownership proof through an existing game-owned CSV leaf, although the generic SDK handler selects no collaborative V4 path. This is source evidence only. The unsigned specimen uses synthetic public fixture keys and an unrelated outpoint; it is not the original recovery transaction. No signatures, wallet access or financial API calls occurred.

The original-key question is now resolved by the coordinator's protected host-context read-only check: saved terms are present, the saved game actor matches the protected game identity, and the compiled original script hash is `0ee48440ac8c72203b4fce00a36aca48684351731f755e4be80f803a9625050f`. No phrase or key was printed and no wallet mutation/signature/transaction occurred. The sole remaining B2 evidence blocker is deployment-specific confirmation of the running Mutinynet build and acceptance rules for this exact swept CSV-leaf batch intent, destination and fee. A fresh public `/v1/info` response reports an empty operator version and generic fee/limit fields only. Research stops here, without a financial request. C094 remains 29/36 with all seven existing tasks open.

The complete findings, official pinned links and next evidence required are recorded in BIS `openspec/programs/bis-server-treasure-release/treasure-b2-public-protocol-2026-10-26.md`. Its ignored `output/reports/treasure-contract/b2-public-protocol-2026-10-26/verification.json` pins 24 Git-blob-verified source snapshots and sanitized observations. Original funds remain unresolved and reservations unchanged. This report does not authorize publication or close any financial acceptance gate.

Final task disposition remains 29/36. T006 lacks original B2 recovery plus authoritative live enforcement/mode evidence; T007 cannot independently review guarantees that remain unproven. T018 has passing deployed guest/CSP evidence but no funded UI check on the exact deployed game. T019 has a funded Signet Claim receipt and other bounded checks, but not the full network/mode lifecycle and recovery matrix. T020 has deterministic safeguards but no live rollback for legacy and unresolved contracts. T026 passes cold/warm/offline cohorts but lacks an actual hidden-tab observation and funded acknowledgement timing. T035 has protected fixtures and selected Signet coverage, but lacks the required complete per-network/mode receipts and B2 recovery. Keep all seven tasks unchecked. CLI progress was re-read after the protocol research and remains 29/36.

## Signet release split and first application pass, 2026-10-26

C094 now scopes Release 1 to Signet Browser validation; C096 (`qualify-treasure-chest-both-networks`) carries the original cross-network requirements under their original C094 task IDs. The carryover is not completion evidence. C094 adds release-specific tasks C094-T037 through C094-T042. C096 includes the Mutinynet co-signer evidence gate, original B2 recovery stop conditions, per-network lifecycle, rollback, managed funded UI and actual hidden-tab/funded-action timing.

The game runtime now refuses new Mutinynet Treasure offers before consent or any financial call and reports “Treasure offers are not available on Mutinynet yet.” Existing contracts still use the existing inspection and recovery path. The Signet consent path retains its 1,000-sat terms and whole-second deadline. Focused consent tests pass 12/12; full game tests pass 1,186/1,186; BIS public typecheck, publishing checks (10/10), production build and both OpenSpec validations pass. Build retains the existing large-chunk warning.

This is local implementation evidence only. The task remains open because the exact deployed-game route/version, real funded game UI acceptance, bounded Signet lifecycle matrix and live rollback have not all been verified. Admin keeps the agreed network-specific testing choices; the game client remains Signet-only for Release 1. No wallet operation, B2 action, deployment, publication or game package import occurred in this pass. Original B2 remains unresolved and untouched. Do not ship until the remaining C094 release gates pass.

Follow-up environment check: the shared BIS Admin Preview on fixed port 5174 is not listening. The documented live test-wallet command could not unlock the protected vault from this execution context (`vault-protection-unavailable`; host retry reported `vault-locked`), and the sandbox's per-command LocalAppData redirect does not expose the registered host vault. No stale lock was removed or wallet files inspected. Stop before live acceptance until the protected Preview and wallet context are available; do not infer pending-operation clearance from this failure. Browser UI financial transactions are handoff-only under the active computer-use policy.

## Local release gates completed, 2026-10-26

C094-T043 verifies the exact imported BIS 0.0.27 artifact, aligned game/dependency versions, full 1,186-test game suite, BIS public typecheck, 10/10 publish tests, production build, both OpenSpec validations and updated Signet-only disclosure. T044 verifies the local game blocks new Mutinynet offers before any offer/funding call and preserves inspection/recovery code paths. The package verifier confirms the archive hash and 201 installed files. The build completes with the known large-chunk warning. Deployment, managed guest route verification and live wallet acceptance remain separate and open.

## Closeout recheck, 2026-10-27

The bounded continuation found no new evidence that clears the live acceptance gates. The Signet wallet CLI, run from the available BIS workspace, returned `vault-protection-unavailable`; the process reported a sandbox-scoped `LOCALAPPDATA` path. No vault files, recovery material, lock files or wallet state were read or changed. Stop before any Signet funding/signing action until the protected host wallet context is available. This does not change the disposition of any pending operation.

The public game root and `environment.json` both return HTTP 200, and the published metadata still identifies `v0.0.27`. This proves the currently published version only; it does not contain or verify the pending C094 release boundary, and no deployment was attempted. The pre-start snapshot found no listener on port 5176; the later standard launcher attempt and route timeouts are recorded below, so local game-route acceptance remains open. A request to the local BIS Admin URL returned the Admin HTML, but port 5174 has no observable listener owner in this execution context; do not count that response as an ownership-verified local preview or as managed-guest selector verification.

C094 remains 32/37 with T037, T038, T039, T040 and T042 open. T037 and T042 stop on missing local/deployed candidate evidence. T038 and T039 stop before funded Signet UI/lifecycle actions because the protected wallet context is unavailable; browser financial submissions also require the user's managed browser handoff under the active computer-use policy. T040 stops before live rollback because it requires that same protected context and must preserve all unresolved journals. Do not retry wallet access through alternate contexts, infer failure from unavailable state, publish, import another game dependency, or touch original B2/Mutinynet operations. Resume only when an ownership-verified local preview and protected managed Signet wallet/browser context are available; then execute the narrow checks recorded in C094-T037 through T042 and record exact receipts before any release decision.

Startup follow-up: after the earlier port snapshot, the prescribed `npm run dev` launcher started the game on fixed port 5176 and reported Vite dependency bundling. The exact advertised route did not answer within the bounded 2-second initial check plus 4-second follow-up check (both timed out). The launcher session is being preserved for inspection; no alternate port, restart, or wallet/browser action was attempted. The earlier observation that 5176 had no listener was the pre-start snapshot and is superseded by this launch attempt. Local route acceptance remains open until HTTP and rendered content are verified.


## Non-wallet acceptance continuation, 2026-10-27

### Ownership-verified BIS Admin selector

The fixed BIS Admin route on port 5174 is owned by the BIS project. Its `/__project_run_identity` response matched the SHA-256 project key computed from the BIS repository root and reported port 5174/PID 95312 (`node BIS/scripts/dev-all.ts`). The Admin page loaded as `BIS - Admin`, version `v0.0.27`. Its Treasure selector showed exactly one Signet choice, `Browser validation (less secure)`, and the adjacent disclosure stated the co-signer is not configured for Signet. The live page also logged a 404 from `/api/bis/connect`; selector rendering and inspection succeeded, but no wallet action was attempted.

The safe Mutinynet selector behavior is verified by exact local tests, not a funded browser flow: `node --test --test-force-exit BIS/packages/integration-admin/tests/client/treasure-disclosure.test.ts BIS/packages/integration/tests/client/contract-validation.test.ts` passed 3/3. These assert one Signet option, two Mutinynet options, the preferred co-signer default, explicit fallback behavior, and disclosure language. An earlier attempt to apply `--test-name-pattern` through the BIS wrapper loaded all 267 file suites and caused one harness failure in `view-cache.test.ts` because its setup was filtered out while its `after` hook still called `server.close()`. The exact two-file invocation above passed; no unrelated source was changed.

### Game preview diagnosis

The shared 5176 process is identified as PID 42344 running `node stealth-steel/tools/dev/project-run.mjs`, recorded by the game root launcher. It owns the fixed port but both its identity endpoint and game route time out. The installed host `run-project.ps1` helper reported “Assigned port 5176 is occupied or unhealthy” and preserved the process/run record. I did not stop or replace it.

The requested isolated check used `npm run dev -- --isolated --port 5276`. It created its own `output/run-state/isolated-5276/project-run.json` (instance `39544bfb-a5b7-40da-a073-cda1378ca8eb`, listener PID 51764); the shared run record was not overwritten. Despite that startup record, subsequent host `curl` requests to both isolated identity/game routes timed out, and the managed Playwright browser returned `ERR_CONNECTION_TIMED_OUT`. The isolated process and shared process remain running and untouched. This shows the game route problem is not explained solely by a stale 5176 listener; its underlying cause remains unresolved, so there is no verified local game route for the deterministic browser gate.

### Public release evidence (T042 remains open)

The public game root and `environment.json` return HTTP 200; the environment reports `v0.0.27`. The latest Pages workflow is [run 40373581687](https://github.com/SamuelAsherRivello/blockchain-stealth-and-steel-game/actions/runs/40373581687), successful for current committed SHA `fe48aaa7f4c31a49f55673953116b16881319dce` on 2026-10-26. This is the existing release, not the uncommitted C094 candidate. I fetched the public JS asset graph (18 assets) and the deployed bundle does not contain the new Mutinynet-unavailable message/status. Therefore the published game does not show the new release boundary. No publication was attempted.

### Exact live gates still open

- **C094-T037:** Complete a working local game-route/browser check proving the new Mutinynet offer is blocked before consent/funding while existing contract inspection/recovery remains available; verify the Admin selector in both network contexts and verify that the deployed candidate route displays the release boundary. Current Signet Admin rendering and deterministic option tests pass; game route and deployed boundary do not.
- **C094-T038:** In the managed guest, verify the exact imported `@bis/integration` 0.0.27 artifact, then perform real funded Signet Claim and Reject UI flows using approved test wallets. Record exact transaction/contract receipts; do not inject financial projections.
- **C094-T039:** Complete the bounded Signet live matrix with exact evidence for funding, empty-player claim, reject/session-end, expiry/refund, conflict, closed-browser recovery, lost acknowledgement, import, asset preservation and insufficient funds. Reuse matching receipts and stop on unresolved operations rather than replaying them.
- **C094-T040:** Verify live Signet creation-disable rollback against both legacy and new unresolved contracts while preserving journals and original recovery; do not replay uncertain submissions.
- **C094-T042:** After an authorized candidate release, verify its exact deployed route/version and successful Pages workflow. The current successful run and v0.0.27 route are baseline evidence only.

The protected host-context `npm run test-wallets -- status --network signet --live` returned `vault-locked`; sandbox status had returned `vault-protection-unavailable`. No lock was cleared, no application journal was inferred or altered, and no wallet operation occurred. C094 remains 32/37; all five release tasks above stay open. Original B2, Mutinynet funds, deployment/publication, and the separate game import remain untouched.

## Final read-only gate result, 2026-10-27

The isolated 5276 launcher produced no log file in `output/logs/project-run-start/`, `output/project-run/`, or `output/logs/` for this run. Its terminal session printed the command and the advertised 5276 URL, with no later Vite error text; the isolated run record names PID 51764 and remains separate from the shared run record. The coordinator's additional host check reports 5276 times out and 5277 refuses connections. The route therefore fails the browser acceptance gate; no further browser navigation or port retry was made. Port 5176 was left untouched during this continuation.

Source inspection confirms the local candidate guard: `treasure-session.js` assigns `network-unavailable` when a new session is started on Mutinynet before it can enter funding consent; the matching UI test asserts no financial calls. Existing `inspect()` and restoration tests cover observation/recovery of saved contracts. This is source/test evidence only because neither the shared nor isolated game route can be verified in the browser.

Exact candidate identity: branch `main`, committed HEAD `fe48aaa7f4c31a49f55673953116b16881319dce` (same as `origin/main`), root `package.json` version `0.0.27`. C094's game/runtime, docs, workflow and OpenSpec changes remain uncommitted in the working tree; C096 remains a separate untracked OpenSpec proposal. There is no new release tag, built candidate version, or candidate deployment. The successful Pages run and public `v0.0.27` route apply only to the committed HEAD baseline.

Independent isolated-port reproduction reported by coordinator, 2026-10-27: a separate run on port 5278 printed its launcher URL, but its HTTP route timed out after 20 seconds. The coordinator cleaned only that 5278 process under its isolated startup lock and removed only the 5278 run record after confirming there was no listener. Shared 5176 and this task's 5276 were untouched. This adds an independent reproduction of the game-route failure on a third port; it does not identify the underlying cause or clear T037.

## Isolated browser confirmation, 2026-10-27

Using the existing managed Playwright session, I opened the coordinator-owned isolated route `http://127.0.0.1:6278/blockchain-stealth-and-steel-game/?muteMusic=true&muteSFX=true` (no additional browser/server was started). The rendered page title is `BIS Stealth & Steel`; after waiting 10 seconds, the loading indicator cleared and the game DOM showed the Tiny Swords movement demo, welcome dialog, joystick/action controls, Level 1/3 and the visible game version `v0.0.26`. The console contains one 404 for `/api/bis/connect` and one Windows WebGPU warning that `powerPreference` is ignored; Babylon Lite reports the WebGPU engine, with no other errors or warnings. This establishes that the game renders on the coordinator's isolated port. No game control was activated and no wallet action occurred.

The visible local game version `v0.0.26` comes from `stealth-steel/public/environment.json`; root `package.json` is `0.0.27` and pins BIS 0.0.27. Public Pages metadata is `v0.0.27`. This mismatch is part of the exact unreleased candidate state and needs an explicit release-version decision before publication; it does not prove that the C094 release boundary is deployed. T037 remains open because the public game bundle lacks the Mutinynet-unavailable boundary and actual network-state UI verification is incomplete.

## Release metadata alignment, 2026-10-27

The previous isolated browser check found `stealth-steel/public/environment.json` at `v0.0.26` while the root package and vendored BIS were `0.0.27`. This follow-up aligns both active game release sources: `version.txt` is now `version=0.0.27` and source `stealth-steel/public/environment.json` is `v0.0.27`. `package.json` and `package-lock.json` already match `0.0.27`, as does the `@bis/integration` 0.0.27 tarball dependency. The source/publication build output reports `v0.0.27` and computed `downloadSize=000018828863`.

A tracked-source search found no remaining active `0.0.26` release metadata outside preserved OpenSpec history and `stealth-steel/vendor/BIS_PROVENANCE.md`, whose 0.0.26 sections document an older verified snapshot. The focused `npm run test:publish` checks passed 10/10. `npm run build` succeeded after transforming 1,374 modules; Vite retains the existing warning for chunks above 500 kB. `git diff --check` passes for the two metadata files.

This is a local, uncommitted candidate preparation only. No release tag, Pages deployment, GitHub release, or publication occurred. T037 remains open pending the deployed Mutinynet boundary and network-state UI acceptance. T043 remains open until its complete package, full-suite, typecheck, publishing and build criteria are satisfied in the final candidate. T038-T040 remain gated on the protected Signet wallet and exact live acceptance receipts.

## T043 revalidation and gate reconciliation, 2026-10-27

C094-T043 is complete and remains checked after a full rerun following the 0.0.27 metadata correction. The exact BIS package verifier passes with 201 installed files and JS/CSS exports; `npm ls` reports `@bis/integration@0.0.27`; the full game suite passes 1,186/1,186; `npm run typecheck:bis-contract` passes; `npm run test:publish` passes 10/10; `npm run build` succeeds and writes `dist/environment.json` with `v0.0.27` and download size `000018828863`. Both C094 and C096 pass standard `openspec validate`. The known CLI warning says the base schema ignores project-required permanent `id`; `--strict` rejects this unknown key even though `openspec show --json --deltas-only` parses C094's 19 and C096's 6 deltas. Preserve the IDs and record the standard validation result. This supersedes the interim note above that left T043 open pending final-candidate reruns; it is now supported by exact evidence.

Current open C094 release gates are T037 (deployed Mutinynet boundary and actual network-context UI verification), T038 (managed guest plus real funded Signet Claim/Reject receipts), T039 (full bounded Signet lifecycle receipts), T040 (live creation-disable rollback preserving unresolved legacy/new journals), and T042 (authorized candidate route/version and successful release workflow). The approved host-context Signet status still returns `vault-locked`; do not sign, fund, clear the lock, or publish until the wallet gate and T038-T040 are resolved. No Mutinynet funded test, deployment or publication occurred.

## T037 partial verification and BIS endpoint preflight, 2026-10-27

T037 deterministic work is supported by the local production bundle and tests: the built `main-BZ0QszJu.js` contains the Mutinynet-unavailable status/message; the focused UI test file passes 12/12 and verifies Mutinynet never prompts for consent or makes a financial call, while recovery of saved offers remains available. The isolated game rendered in the managed browser on 6278 after coordinator startup; the local Admin 5174 route is ownership-verified and its Signet-only selector was observed, with two-network Admin options tested deterministically. These checks do not complete T037 because the deployed Pages bundle is still the earlier `v0.0.27` build without the new release boundary and actual network-state UI verification has not been completed.

The BIS production endpoint responds to read-only GET `/api/bis/health` with HTTP 200, `service=bis-server`, `protocol=1`, `runtime=vercel`, `storage=ready`, `publicSigning=false`, `ownerSigning=true`, and three wallet slots for Signet and Mutinynet. Vercel's production alias `bis-server-rho.vercel.app` maps to READY deployment `dpl_BHV176tqnPF9GTdLb7tKtNtgDF3M`, source commit `3c0ac446b2d52edbd1d8037ffbf2c3b7aec4dd0e`. Its root package is 0.0.24 and it predates the `BIS/packages/bis-server` workspace. This is not the requested BIS 0.0.27 deployment. No POST `/api/bis/connect` or signing request was made. Keep publication blocked until the 0.0.27 server endpoint is ready and T038-T040 are resolved.

Gate reconciliation: C094-T043 remains complete after the full 0.0.27 local verification. C094-T037, T038, T039, T040 and T042 remain unchecked. The protected Signet wallet vault still returns `vault-locked`; no Mutinynet funded test, wallet operation, deployment or publication occurred.

## Continued release preflight, 2026-10-27

The existing managed browser session on port 6278 was reloaded after metadata alignment. The rendered game identifies as BIS `v0.0.27`; the welcome screen and controls load. In Account, both Signet and Mutinynet can be selected. No account creation, restore, funding, signing or contract action was performed. This only verifies network selection, not the Treasure offer boundary. The browser's `/api/bis/connect` requests return 404 because this isolated frontend is not paired with the required BIS endpoint; do not count it as managed live acceptance. The deterministic production bundle and focused consent test still prove the local Mutinynet early guard and saved-offer recovery path. The real player-facing Treasure action remains unverified in-browser, and the public Pages bundle has not been updated with the boundary, so T037 stays open.

The protected host status previously identified `vault.lock` metadata for a non-running PID 96644 (recorded start time 2026-10-27 03:52:29). This makes the lock appear stale but does not prove the protected application journal has no pending operation. Existing instructions prohibit clearing locks or signing/funding without journal verification. Leave the lock, vault, journal and wallet data untouched; T038-T040 remain stopped before any financial action. Do not treat a lost acknowledgement as failure or retry any operation.

### Exact release sequence and stop conditions

1. BIS owner publishes and verifies the BIS 0.0.27 server candidate. Read-only `/api/bis/health` must identify the intended deployment and required storage/signing capability; the current production alias points to a 0.0.24 deployment and is not acceptable. The local frontend's `/api/bis/connect` 404 is not a substitute for this gate.
2. In the protected managed Signet context, first reconcile the existing journal through the supported wallet procedure without clearing the lock. Only after journal state and exact prior receipts are known, perform the bounded T038/T039 Signet matrix, reusing matching receipts and stopping on any unknown or submitted state. Preserve exact receipts and asset balances.
3. Verify T040 rollback with legacy and new unresolved contracts, preserving original recovery and journals. If the wallet/journal cannot be safely reconciled, leave T038-T040 open and stop financial actions.
4. Rebuild the exact game candidate from the aligned 0.0.27 sources and imported BIS archive. Confirm T037 locally in the actual game flow (Mutinynet refusal before consent/funding and existing-contract recovery), then confirm Admin's network-specific signing selector without account or wallet actions.
5. Only after T037-T040 pass, deploy the candidate through the existing `Deploy game Pages` workflow on `main`. That workflow runs `npm ci`, verifies the immutable BIS package, publishing contracts, full test suite, public contract typecheck and production build before uploading `dist`. Verify the successful workflow run and HTTP 200 plus expected app/version at the public game route and `environment.json`; verify the deployed Mutinynet boundary. A failed prerequisite, missing receipt, wrong deployment identity, unexpected output spend, or unknown transaction acknowledgement is a hard stop; do not publish around it.

The release is not ready to publish today: the endpoint version mismatch, isolated frontend 404, unreconciled Signet vault lock, and outstanding deployed/funded acceptance are independent gates. No deployment, publication, lock removal, wallet action, Mutinynet funding, game import or B2 action occurred in this continuation.

## BIS Preview and deployed Pages recheck, 2026-10-27

Vercel lists BIS deployment `dpl_CBbMTtjv9Cs77GjAzTDdNLxX9x2g` as READY from commit `87580a56c7f67d0869c1511cbfed8bcf3a2cdcf6`, but its target is `null` and it has no aliases. A direct health GET reached Vercel protection. The authenticated read-only fetch returned HTTP 200 with storage ready, `publicSigning=false`, `ownerSigning=true`, and three wallet slots for Signet and Mutinynet. This verifies the protected Preview deployment's health; it does not promote it or qualify production. The production alias remains the older 0.0.24 deployment.

The public game Pages root and `environment.json` each return HTTP 200; the latter reports v0.0.27. Its live JS asset does not contain `network-unavailable` or the Mutinynet unavailable player message, so the deployed route still lacks the candidate boundary. The owner is verifying a separate domain-separated Signet deployment-proof route; this task made no signing call. The Vercel authenticated-fetch tool may create or reuse share access; it returned no share URL or expiry, so whether a link was created/reused and its expiry are unknown. This was disclosed to the BIS owner for cleanup review; do not call share-link tools again. The BIS owner confirmed this Preview is the approved endpoint for local/staging game-client validation only, not the public Pages endpoint. The actual candidate client and deployed Pages boundary remain unverified; keep T037 and T042 open.

The BIS owner subsequently confirmed this protected Preview URL is the intended endpoint for local/staging game-client validation only; it is not the public release endpoint. An isolated game start was attempted on free port 6279 with `VITE_BIS_SERVER_URL` set to the Preview URL. The launcher printed the test route, but the managed browser timed out and a local port check found no listener; only the launcher created for this attempt was stopped. The shared game port 5176 was untouched. No BIS connect, signing, or transaction request reached the candidate from the game.

The deterministic consent/recovery suite was rerun and passes 12/12. Its Mutinynet case asserts the unavailable message, absent consent, and zero offer/funding/action calls. Its restore case asserts the existing offer inspection call remains available while funding is still unavailable. These use injected test adapters and do not constitute a Preview integration run. The BIS owner reports a separate Preview Signet domain-proof signature verified locally and the Mutinynet public-signing proof rejected; those checks are infrastructure-only. Keep T037 and T042 open until a candidate Pages client displays the release boundary and the deployed Pages acceptance gate passes. T038-T040 remain gated by protected Signet journal reconciliation.

## Confirmed Preview client attempt, 2026-10-27

Following the BIS owner's confirmation that the protected Preview is intended for local/staging validation, one project-run-start attempt launched the game on isolated port 6279 with `VITE_BIS_SERVER_URL` set to `https://bis-server-qxhkdoc2c-ashers-projects-d3be6036.vercel.app/api/bis/`. The local route returned HTTP 200 within 0.3 seconds; the managed browser rendered BIS v0.0.27. The Account screen displayed Mutinynet selected and “You are not logged in.” No Create/Restore action or wallet data was used.

Browser diagnostics show `POST /api/bis/connect` failed at the CORS preflight because Vercel Authentication redirected the OPTIONS request (“Redirect is not allowed for a preflight request”). The request did not reach BIS `/connect`; no signing or transaction request occurred. Consequently this no-account client cannot display the Treasure `network-unavailable` state or verify saved-offer inspection against the Preview. The focused injected-adapter test remains deterministic evidence only: 12/12 pass, covering the explicit Mutinynet message with zero offer/funding/action calls and restored offer inspection without new funding authorization. Evidence screenshots are `output/screenshots/treasure-preview-6279/game.png` and `account-mutinynet.png`; logs are under `output/project-run/treasure-candidate-6279/`.

The BIS owner has been informed and asked for a safe CORS-compatible Preview access method that does not put a Vercel bypass credential in the client. Do not retry endpoint access or introduce a client-side bypass until an approved method is available. After browser verification, the recorded launcher process exited without a stderr diagnostic and port 6279 had no listener; only this attempt's stale run record was removed. Per the one-attempt instruction, no restart was made. Shared port 5176 and wallet storage are untouched. T037 stays open until the real candidate client can reach BIS safely, display the Mutinynet-unavailable state, preserve existing-contract inspection/recovery, and the deployed Pages boundary is verified. T038-T040 remain gated on protected Signet vault/journal reconciliation; T042 remains open.

## Signet lifecycle matrix disposition, 2026-10-27

This matrix closes C094-T039's bounded evidence inventory only. A `blocked` or
`unperformed` row is not a passing live acceptance case, and this disposition
does not qualify the release. Evidence is drawn from the BIS
[`treasure-production-acceptance.md`](../../../../blockchain-integration-service/BIS/documentation/treasure-production-acceptance.md)
and [`signet-onboarding-investigation.md`](../../../../blockchain-integration-service/BIS/documentation/signet-onboarding-investigation.md).

| Required case | Status | Exact evidence or stop condition |
| --- | --- | --- |
| Contract funding | Passed in BIS Admin, browser-policy-v1 | Contract funding `377deb629d0adc1b89682e38f2c898c811baa33e94d9f1531c20f6287602be8f`, 1,000 sats to the compiled contract output. This is not a funded game-client UI result. |
| Empty-player Claim | Passed in BIS Admin | Player Wallet was empty when restored; Claim `3bc65a1fab9e638755762c5baf92e15e7b632b3bdd71bb603fd495f1e763af1c`, 1,000 sats to the bound Player Wallet. |
| Early Reject | Passed in BIS Account contract details | `6c47631db82817f6bc73a74cf12593e65667d301b721ce4579e8af9f8c86d1b5`, 1,000 sats to the bound Game Wallet. |
| Explicit session-end spend | Unperformed | No exact live session-end receipt is recorded. Stop before another financial case while protected vault/journal state is unverified. |
| Expiry/refund | Passed in BIS Admin | `040f66b91b24dfd684487f38aab6a1d86c7615407c7bcaa15ce1d5c67c579b26`, 1,000 sats to the bound Game Wallet after uninterrupted expiry. |
| Conflicting/competing action | Unperformed | No exact Signet competing-spend acceptance is recorded. Do not create a competing spend until the protected journal and reservations are verified. |
| Closed-browser portable recovery/import | Passed for original Signet Browser validation contract | Export, close source browser, restore wallets in a separate protected profile, import encrypted recovery, and recover after the unchanged deadline. Funding `6ceea41aee2e291521cc2b10c369ab9f22a942248797e51386d162fa8ad7e884`; refund `1ebb57b4f3c280aaf51b1847d8582c8a9b3240c0a7c6b3651dc33a313c458b4d`. This was BIS Admin portable recovery, not game-client UI acceptance. |
| Lost-acknowledgement recovery | Passed for original operations | Interrupted expiry recovery `d6e9e37278dea2a83e5b16c3cee5e38952fead9bbfa8e8e109c0d47284d6fd71`; interrupted Reject setup recovered by original expiry `c0644ab83f7fd4c935652ddd588d19c56eb5c7f328f77aabaa0b76e248788de3`. The latter is explicitly not counted as Reject acceptance. No replacement funding was used. |
| Exact imported package identity | Passed locally; live game interaction blocked | `@bis/integration` 0.0.27 archive/install identity and all 201 installed-file hashes passed under C094-T043. The managed game client cannot reach the protected Preview because its OPTIONS request redirects to Vercel Authentication; no approved CORS-safe access method exists. |
| Asset-bearing inputs/change preservation | Unperformed | Existing receipts verify asset-free contract/payout outputs; no live asset-bearing funding/change case is evidenced. Stop before spending while original input/journal state is unverified. |
| Insufficient-funds handling | Unperformed live | Deterministic BIS safeguards are documented in the bounded report, but no exact funded Signet insufficient-funds UI case/receipt is recorded. No new live attempt is warranted before journal verification. |

The exact receipts establish real Signet `browser-policy-v1` cases, not
server-enforced expiry, a Signet co-signer, complete lifecycle coverage, or
the imported game's funded UI behavior. C094-T038, T040 and T042 remain open;
T039's checkbox records that each matrix row now has a supported disposition.

## C094 Apply checkpoint, 2026-10-27

The CLI reports **33/37 tasks complete**. The four remaining tasks are:

| Task | Remaining acceptance gate |
| --- | --- |
| C094-T037 | Local deterministic UI evidence now includes the rendered unavailable message, disabled Claim/Reject, and preserved inspection. The recorded shared game route has no live listener, the one protected Preview attempt failed at the Vercel-authenticated CORS preflight, and the public v0.0.27 Pages bundles lack the release boundary. A real candidate browser route and deployed boundary are still required. |
| C094-T038 | The exact package passes local verification and BIS Admin has real Signet receipts, but the exact imported game client has not completed managed guest plus funded Claim/Reject. Host-context read-only status confirms `vault-locked`; journal state is not verified, and Preview access is blocked. |
| C094-T040 | Live creation-disable rollback with legacy and unresolved contracts requires verified protected journal state. Host-context read-only status confirms `vault-locked`; do not clear or bypass it or initiate a wallet action. |
| C094-T042 | Candidate Pages deployment and workflow verification depend on T037-T040. No publication is performed before those gates pass. |

The local acceptance suite after the added T037 UI regression passes
1,187/1,187; `npm run typecheck:bis-contract`, `npm run test:publish` (10/10),
the exact BIS package verifier (0.0.27, 201 files), production build and C094
OpenSpec validation pass. The build retains the existing >500 kB chunk warning.
A host-context read-only check confirms PID 42344 owns loopback 5176 and runs
the configured `node stealth-steel/tools/dev/project-run.mjs` launcher, matching
the shared run record. The route times out, and the normal launcher refused to
replace the occupied port. No server was stopped or replaced. Do not restart
without explicit resolution. Proposal 2 remains unimplemented until proposal 1
reaches its completion gate.

The latest host-context read-only wallet status is `vault-locked`. Its
application journal remains unverified; do not clear or bypass the lock, sign,
fund, or attempt rollback. This is the explicit blocker for the remaining live
Signet Claim/Reject and rollback acceptance.

## C094 shared-server and deployment recheck, 2026-10-27

The earlier 5176 listener/timeout note above is superseded for server health:
after the user explicitly authorized restarting only the confirmed project-owned
unhealthy game process, the official project-run-start helper relaunched the
shared game on fixed port 5176 under its startup lock. It verified HTTP 200 and
the expected BIS Stealth & Steel title at
`http://127.0.0.1:5176/blockchain-stealth-and-steel-game/`. Managed Playwright
rendered the local v0.0.27 welcome flow. No account creation, restore, wallet,
or contract action occurred. The running shared server should be reused.

The public game route also renders v0.0.27 in managed Playwright, but an
inspection of its 14 loaded JavaScript assets found neither the
`network-unavailable` status nor the Mutinynet unavailable message. The public
Pages bundle therefore still lacks the release boundary; no deployment was
triggered. The local welcome view does not prove the Treasure flow because the
isolated frontend's `/api/bis/connect` responds 404 and no account was used.

The deployed BIS Admin v0.0.27 runtime preview was inspected without account or
wallet actions. Its Signet limited-time-offer selector exposes only
“Browser validation (less secure)” with the co-signer-unavailable disclosure.
On Mutinynet it exposes “Arkade co-signer (preferred)” as the default and
“Browser validation (less secure)” as the explicit alternative, with the
co-signer and deadline qualification disclosure. This verifies the visible
network-specific Admin choices only; the logged-out wallet reports a server
configuration error, and no offer was started.

The current OpenSpec count remains 33/37 with C094-T037, T038, T040 and T042
open. T037 still requires the actual game Treasure state and a deployed bundle
carrying the boundary. T038 and T040 remain blocked before any wallet action by
the protected `vault-locked` state and unverified journal; do not clear or
bypass it. T042 depends on the prior gates. The Signet evidence matrix in
C094-T039 is a completed bounded disposition, not full lifecycle qualification.
Proposal 2 (C096) remains separate and unimplemented.

## Bounded local pre-login check, 2026-10-27

In the managed browser on the healthy shared game route at `127.0.0.1:5176`,
the guest game rendered and Settings opened. The existing browser request log
contains `POST /api/bis/connect` with response `404 Not Found`. The Account
component initializes the BIS service; reopening it can issue another
connection request. Under the explicit no-POST constraint for this check, I
did not open Account or select a network. No Create, Restore, Login, signing or
funding action occurred. Therefore the local pre-login Mutinynet UI state was
not verified in this attempt; the exact integration limitation is that this
isolated local route has no responding `/api/bis/connect` endpoint. Do not retry
this check until a safe no-POST verification path or a functioning connection
endpoint is available. This does not alter C094's 33/37 count: T037, T038,
T040 and T042 remain open, and C096 remains separate.

## Single isolated production-endpoint UI attempt, 2026-10-27

One isolated run was started with `VITE_BIS_SERVER_URL=https://bis-server-rho.vercel.app/api/bis/`
on test port 6280, with its isolated run state; shared port 5176 was untouched.
The launcher printed the route, but managed Playwright navigation timed out
with `net::ERR_CONNECTION_TIMED_OUT`. One host-side HTTP check to the same
route also timed out. No page loaded, so no POST guard could be installed and
Account/network selection could not be inspected. No BIS request, Create,
Restore, Login, signing or funding action was performed in this attempt. The
isolated server process was stopped and port 6280 was confirmed unbound. This
attempt does not verify the pre-login Mutinynet boundary; T037 remains open.
Per the one-attempt limit, do not retry this isolated configuration. C094
remains 33/37; T038/T040 remain vault/journal gated, T042 remains blocked, and
C096 remains separate.

## Host-context guarded Mutinynet UI check, 2026-10-27

The prior sandbox-launched isolated server was unreachable from the managed
browser. A separate host-context run using the documented
`VITE_BIS_SERVER_URL=https://bis-server-rho.vercel.app/api/bis/` then served
HTTP 200 on isolated port 6281, with its own `output/run-state/isolated-6281`
record. Shared port 5176 remained healthy and untouched. Managed Playwright
installed a guard before navigation that aborted all non-GET browser requests.
The game rendered v0.0.27; Settings and Account opened; selecting Mutiny
displayed `Network: Mutinynet` and `You are not logged in.` Create and Restore
were visible but were not clicked. The only captured BIS mutation request,
`POST https://bis-server-rho.vercel.app/api/bis/connect`, was aborted in the
browser as `ERR_BLOCKED_BY_CLIENT`; it did not reach the server. No login,
wallet or financial action occurred.

This proves the selected pre-login Account view, but no Treasure Chest
unavailable message is shown in Account. Guest play started and ended at the
normal `You Lost` screen before any chest interaction; the offered `Continue
(1000 Sats)` action was not selected. The live local Treasure boundary and
preservation of existing inspection remain unverified, so T037 stays open.
The public Pages assets still lack the Mutinynet boundary. The previous 6280
timeout is consistent with a sandbox/host reachability difference; the
host-context route succeeded. C094 remains 33/37; T038/T040/T042 remain open,
and C096 remains separate.

## 2026-10-27 selected-network snapshot integration fix

The host-context guarded guest route was reloaded on isolated port 6281. The
browser guard was installed before navigation and blocks all non-GET requests;
no account creation, restore, login, wallet, funding, signing, or contract
action was performed. The game source now carries the selected network from
the BIS account snapshot when no Player profile exists, prioritizes the
Mutinynet-unavailable state before the missing-player state, and reveals the
chest in explicit unavailable/unverified states so existing offers remain
inspectable. Chest entry still requires contract support or one of those
explicit recovery/unavailable states. A regression test checks this boundary
and that unavailable Mutinynet does not authorize an offer/action call.

BIS now exposes the selected network in the read-only public account snapshot
even before Player login. The focused facade suite passes 21/21; BIS
typecheck/build pass. Game tests pass 1,189/1,189, BIS-contract typecheck and
publishing checks pass (10/10), and the production build succeeds with the
existing large-chunk warning. The local package artifact is still BIS 0.0.27,
so the new BIS source change has not yet been exported/imported into the game;
T043 is reopened until the exact revised artifact and aligned version are
verified. No C096 work or deployment occurred.

The managed browser rendered guest gameplay, but reaching the chest in this
run was not completed; the selected-network boundary is covered by deterministic
tests, not counted as T037 live UI evidence. Public Pages still lacks the
boundary. A read-only sandbox status attempt returned
`vault-protection-unavailable` because sandbox `LOCALAPPDATA` resolves to an
isolated AppContainer path. A host-context read-only inspection confirmed the
documented vault root has the expected restricted ACL, but found a live lock
owned by PID 87640. That owner exited and the lock was absent before the
subsequent targeted read-only observation. T037, T038, T040 and T042 remain
open; T043 is also open pending export/import and exact-artifact verification.
C094 is 32/37.

A targeted read-only host-context Signet observation for the existing
`market-remint-player` test wallet reports 3,000 spendable Arkade sats against
a 1,000-sat funded target, but readiness is `incomplete` with
`application-journals-unverified`. The wallet is not safe for a contract spend
until those application journals are verified/reconciled. No spend, funding,
reconciliation, or signing was attempted. The live observation completed and
released its vault lock normally.

Final verification pass: BIS full suite passes 1,715/1,715 when run in host
context with `PLAYWRIGHT_BROWSERS_PATH` pointing to the already-installed
matching Chromium 1248 cache. The earlier 44 failures were environmental:
missing Chromium in the sandbox's redirected cache and AppContainer EPERM on
atomic rename in redirected Temp. The corrected run passes browser, encrypted
wallet-fixture, contract, and recovery suites. BIS typecheck, all workspace
builds, and `check:release` pass at version 0.0.27. Game full suite passes
1,189/1,189; game contract typecheck, publishing checks (10/10), production
build, and C094 OpenSpec validation pass. The production build retains the
existing large-chunk warning. These checks do not close live acceptance: T037
still lacks a rendered chest status and deployed boundary; T038/T040 remain
blocked by `application-journals-unverified`; T042 depends on those gates; and
T043 remains open because the revised BIS artifact has not been exported or
imported. No game package import, C096 work, or deployment occurred. C094 is
32/37.

2026-10-27 live acceptance resolution: the protected host-context runner used
the registered `treasure-c094-live` Signet pair and actual Admin UI. Claim and
Reject each funded a real 1,000-sat offer, executed the corresponding UI
action, and verified the exact indexed payout/refund plus the contract funding,
checkpoint and spend chain. The legacy rollback additionally verified pinned
@bis/integration 0.0.23 archive provenance and recovered the original funded
legacy offer through the current UI with creation disabled; the current
session rollback independently denied a replacement and foreign offer,
prevented network replacement, coalesced repeated session end, and refunded
the original current contract. Each runner reported `verified:true`; no
unknown transaction was replayed. A fee-unknown blocker was resolved by
read-only retrieval of the settled transaction and parent (470 sats input and
output, 0 fee), then durable fee evidence was added without changing the
operation intent or settlement state. BIS adds `reconcile-operation-fee.ts`
for this guarded recovery, with checks against the exact original provider ID.
Focused tests pass 24/24. T040 is now complete; T037, T038, T042 and T043
remain open. T038 still needs the exact exported/imported candidate in the
managed guest; the captured Signet Admin receipts are the financial portion,
not proof of that package boundary. C094 is now 33/37. The separate
Mutinynet signing-mode check is pending; the existing `market-remint-game`
wallet has an unresolved `harden-asset-mint-m1` operation and was not used.
No game import, C096 work or deployment occurred.

The final BIS verification run after the fee-evidence fix passes 1,716/1,716
tests, `npm run typecheck`, all workspace builds, and `npm run check:release`
for 0.0.27. Builds retain the existing large-chunk warnings and the
ineffective `boarding-record.ts` dynamic-import warning. The exact Signet live
receipt IDs are recorded in `tasks.md`; all are confirmed 1,000-sat vout-0
outputs with indexed funding/checkpoint/spend evidence.

Mutinynet signing-mode acceptance is bounded by live wallet readiness: the
available Game Wallet candidates have zero spendable sats or unresolved
application/journal state, and `/api/faucet/balance?network=mutinynet` reports
0 available, 599,000 recoverable and 600,000 boarding sats. The default
`market-remint-game` is additionally reserved by the unresolved
`harden-asset-mint-m1` journal. Onboarding belongs to the separate onboarding
task, so no conversion, spend, or journal override was attempted. Browser and
co-signer funded receipts therefore remain open. OpenSpec reports C094 at
33/37 with T037, T038, T042 and T043 remaining. No game import, C096 work, or
deployment occurred.

Two further guarded read-only Admin probes selected Mutinynet Browser
validation and Arkade co-signer in turn. Both reported the expected persisted
mode, an enabled Game Wallet Details control, and no server-configuration
error. Neither probe reached a signing or funding control, so they confirm the
Admin choices and configuration display only; they do not substitute for the
blocked funded mode checks.

The managed guest at `http://127.0.0.1:5176/blockchain-stealth-and-steel-game/`
rendered game shell v0.0.28. Settings → Account then showed BIS v0.0.27,
`Network: Choose`, and disabled Create/Restore controls. This proves the reused
managed Vite server is serving a stale BIS package view despite the on-disk
0.0.28 node_modules verifier passing. Account initialization made only
`POST /api/bis/connect`, which returned 404; no wallet or financial action
occurred. The server was left running per the preserve-server instruction. Keep
T037, T038 and T042 open. C094-T043 is complete. The prior full BIS suite passed
1,716/1,716 on this same implementation before the package-only 0.0.28 metadata
bump; the overlapping revalidation was stopped after it logged WebSocket port
24678 already in use. The 0.0.28 version transition check, BIS typecheck/build,
exact archive/package verifier, and all game checks passed. The live identity still matches run record instance `7866f867-a692-4793-8c86-b573868786d6`, PID `59796`, port 5176; startup lock is clear. The requested forced stop was rejected by automatic review because the repo instruction preserves existing servers and no explicit human authorization was found. The server remains untouched.
C094 is 34/37.
## Managed-guest acceptance preparation, 2026-10-28

This section prepares the remaining C094-T038 check; it does not claim that a guest connection or funded contract lifecycle has succeeded. The public game reports `releaseVersion: v0.0.30`. I independently followed the published lazy-loaded JavaScript graph: the game main bundle and integration bundle return HTTP 200; the main bundle contains the configured production endpoint `https://bis-server-rho.vercel.app/api/bis/` and the explicit `network-unavailable` treasure state. The integration bundle contains the `Game wallet source: Server` label. The production Signet identity endpoint returns HTTP 200, network `signet`, `signingReady: true`, and `sign`, `signMessage`, and `signerSession` capabilities. Mutinynet identity returns HTTP 200 but `signingReady: false` with an empty capabilities list. Thus the published game points to the verified Signet service and its own shipped UI marks Mutinynet treasure as unavailable. Identity/configuration availability does not prove a guest connection or signing operation.

The exact managed-guest sequence, to run only after the protected test-wallet journal is safely available and the BIS acceptance budget permits the bounded test, is:

1. Open the stable public game and wait for the game to reach its normal start screen. Open Settings → Account and select Signet. Create or restore only the approved Player Wallet. Do not invoke Game Wallet Login: the production integration should supply the server-managed Game Wallet.
2. Confirm Account identifies the Player Wallet and the Game Wallet source as `Server`, then return to gameplay. Start one treasure offer and inspect the funding-consent dialog. It must identify Signet, show the selected Player and Game Wallet suffixes, identify server signing, state the 1,000-sat amount and original deadline, and offer `Fund 1,000 sats` and `Skip treasure`. Skip is the no-spend exit.
3. For the authorized funded path, choose `Fund 1,000 sats` once. Record the offer/session ID and deadline, then wait for the original offer to appear. Verify the funded contract from the connected account's contract list and linked network output; do not infer funding from a toast, pending status, browser storage, or a locally generated transaction ID.
4. Run Claim and Reject as separate original offers, one bounded action each. Claim must pay the Player Wallet; Reject must follow the contract's defined refund path to the Game Wallet. For every funding and terminal action, preserve the exact operation ID, offer/contract ID, network, action, provider transaction ID, verified output `txid:vout`, value, script/address, destination role, provider/indexer verification result and timestamp. The wallet journal must reconcile each operation to `settled` with verified network evidence before another spend. Capture the visible final UI state and sanitized proof-run output, while keeping signed requests, phrases, private keys and recovery material in the protected vault.
5. Separately verify Mutinynet shows the explicit unavailable state and exposes no Claim/Reject action. This is a no-spend negative check and must not be presented as Mutinynet contract acceptance.

Acceptance stops immediately if the deployed endpoint or network identity does not match, either wallet source is ambiguous, the protected journal has an unresolved operation, the rolling budget guard refuses, funding is not verified from network outputs, an operation result is unknown, or the browser cannot reach the account screen. On an unknown result, preserve evidence and reconcile the original operation before any retry. Do not substitute a local projection or fixture for a network receipt.

Preparation-only non-wallet verification of Proposal 1 task 5.5 also passed for the published BIS Admin and Marketplace. Both routes returned HTTP 200 with their respective titles; all referenced route-entry JavaScript assets returned HTTP 200, and each application bundle identifies BIS v0.0.30 and the production BIS server URL. Their bundles contain the disclosed Signet browser-validation and Mutinynet co-signer, browser-validation, and unavailable-state copy. This verifies published artifact contents only; it does not verify a wallet connection, hosted signature, or user-visible runtime state. BIS task 5.5 and game T038 remain open for the live UI checks above.

## Published guest UI observation, 2026-10-28

The earlier CUA attempt in this task could not see the game tab; that limitation is superseded by the subsequent direct observation recorded in [account-guest-state.md](../../../output/reports/treasure/2026-10-28/account-guest-state.md). On the published v0.0.30 game, the observer loaded the start screen, opened Settings → Account, and saw `NETWORK: SIGNET`, `BIS: v0.0.30`, `Server`, and `You are not logged in.` The visible actions were Create Account, Restore Account and Back. The observer stopped before Create/Restore. No wallet material was entered and no signing, funding or transaction was attempted.

This satisfies the narrower T038 criterion that the published guest can reach Account, sees Signet and the expected logged-out state, and is presented the server configuration label. It does not prove an established managed Game Wallet connection, server signer session, player-wallet pairing, or any contract flow. T038 remains open for managed connection behavior and real funded Signet Claim/Reject receipts. No further user tab-opening action is needed for the already recorded guest-state observation.

## 2026-10-28 C094-T038 candidate handoff and protected stop

The current game import is internally consistent but is not the BIS candidate:
game package `@bis/integration` 0.0.30 and its archive verify against SHA-256
`5f031b0915fb7b865679fdd080c74b3e906a58c0a0f6f1c8a0373a2165da6ede`, while
the BIS worktree has 24 modified integration-package paths and new untracked
server-boarding source/tests. The BIS export manifest for the same 0.0.30 hash
names source commit `a77ad6b20da03e0a063cd689bd6a5f4d9663ee83` and marks the
source worktree dirty; the current BIS checkout is at
`7077ddf7c7392a1d9b3f673b034241ad2f20606e`. Representative source hashes
differ from the installed archive. The 0.0.30 package therefore cannot stand
in for the active BIS changes. Do not import or relabel it as the new candidate.
Detailed comparisons are in
`output/reports/treasure/2026-10-28/c094-t038-artifact-preflight.json`.

**Exact BIS-to-game handoff required to resume T038:** BIS must finish its
current integration changes and acceptance gates, then provide (1) the chosen
package version and exact archive path, (2) the archive SHA-256, (3) the source
commit and source-tree state recorded by the export manifest, (4) the manifest
and export-verifier result tying that archive to the source snapshot, and
(5) the BIS acceptance report identifying the passed final-snapshot checks and
any live qualification limits. The game import must then install that exact
archive and independently verify its version, lockfile/provenance hash, all
installed files and runtime exports before any managed-guest test. Until that
handoff exists, keep the existing game import unchanged and T038 open.

The fresh protected Signet preflight found original refund operation
`clean-signet-mvrlrrg6-recover` still `unknown` for 2,000 sats, without a
provider transaction ID, recorded input outpoint, linked acceptance run, or
verified fee. Six of 18 rolling-window Signet rows lack verified fees; both
1,000- and 2,000-sat zero-fee projections fail closed with
`acceptance-budget-unverified`. One approved indexer request returned zero
VTXOs on its first page, but pagination is unknown and was not retried. The
Vercel runtime-log query for the original 04:00–06:00 UTC window returned HTTP
400 because Hobby retention is one hour; no logs were returned, which proves
neither absence, failure nor settlement. These sanitized results are in the
BIS `output/reports/treasure/2026-10-28/c094-t038-fail-closed-preflight.json`
and `vercel-runtime-log-retention-check.json`.

Stop condition remains active: no Signet wallet attach, signing, funding,
Claim/Reject or recovery until the original operation has an attributable
terminal receipt or authoritative terminal failure, its inputs/provider
acknowledgement can be correlated, and verified fee evidence lets the guard
admit the exact bounded slot. No further indexer or historical-log retries.
The public guest Account observation and 1,192/1,192 deterministic suite do
not establish managed Game Wallet connection or funded UI receipts. C094 stays
36/37 (T038 open); C096 stays 6/10. The game import remains separate while BIS
finishes and exports its accepted candidate.

## Minimal C094-T038 acceptance procedure after BIS handoff

This is the shortest sequence that can close T038; it does not waive the
separate C094 lifecycle matrix. At this checkpoint the BIS artifact and the
protected Signet gate are both prerequisites and neither currently passes.

1. **Accept one BIS artifact.** Obtain the BIS owner's accepted package
   version, immutable archive SHA-256, source commit/tree state, export
   manifest and verifier result, plus final-snapshot acceptance evidence.
   Reject an archive whose manifest or provenance does not tie it to that
   accepted candidate. The current game 0.0.30 archive is not a substitute.
2. **Import and verify that exact artifact.** Use the established BIS
   release-import workflow. Verify the game package version, lockfile,
   provenance, archive hash, installed-file inventory and public exports all
   agree. Build the game candidate from that import; keep the import scoped to
   the accepted BIS artifact.
3. **Pass the protected no-spend gate before opening the wallet.** Reconcile
   the original unknown refund from attributable terminal evidence, resolve
   its input/operation correlation, obtain verified fee evidence, then run the
   normal budget/journal admission for the exact bounded test. If any
   reservation remains unknown or admission refuses, stop before wallet
   attachment or signing.
4. **Verify the managed guest.** In the approved managed test browser, select
   Signet and establish the Player Wallet while confirming the Game Wallet is
   supplied by BIS Server. Verify the connected managed game-wallet session
   without invoking separate Game Wallet Login. Capture the visible source
   labels and the exact imported BIS version.
5. **Run one real Claim offer and one real Reject offer.** For each original
   offer, capture the 1,000-sat funding consent and deadline, fund once, and
   wait for independent verification of the exact contract output before
   acting. Claim the first offer and Reject the second through the game UI.
   Preserve and verify each original funding output and terminal payout/refund
   by operation ID, contract ID, txid:vout, amount, script/destination role,
   and provider/indexer evidence. Mark success only after the journal is
   settled from those receipts and the UI reflects the matching outcome.

Stop immediately on package/provenance mismatch, wrong network or wallet
source, unresolved journal, budget refusal, missing consent, unknown
submission/finalization, or any receipt that does not match the original
contract. Preserve the reservation and reconcile the original operation; do
not retry or create a replacement. T038 closes only when steps 1–5 pass for
the same imported candidate and exact receipts. As of 2026-10-28, C094 remains
36/37, T038 is unchecked, and C096 remains 6/10.
