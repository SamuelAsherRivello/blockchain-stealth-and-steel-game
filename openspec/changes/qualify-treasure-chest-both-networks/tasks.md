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

- [ ] C096-T001 Establish current artifact, operator identity and protected-wallet preflight for each network/mode; stop before signing if identity, funding or reservation state is ambiguous.
- [ ] C096-T002 Obtain new attributable co-signer operator acceptance/admission and delayed-finalization evidence; otherwise record blocked and keep Mutinynet co-signer creation unavailable.
- [ ] C096-T003 Run one bounded original B2 recovery only after T001/T002 prerequisites pass; verify exact script, output, destination, fee, terminal receipt and reservation reconciliation. If prerequisite evidence is absent, document stop without action.
- [ ] C096-T004 Complete the exact-artifact per-network/mode real lifecycle matrix, reusing matching receipts and recording every case as passed, failed, blocked or unperformed.
- [ ] C096-T005 Verify managed browser Claim/Reject flow with real funded offers and exact receipts; deterministic fixtures must not inject financial success.
- [ ] C096-T006 Exercise creation-disable rollback with legacy and unresolved contracts; preserve journals, original scripts and recovery.
- [x] C096-T007 Verify Admin selector labels/defaults and game automatic pre-funding mode selection; ensure no silent downgrade after uncertain submission.
- [ ] C096-T008 Measure local cold/warm/offline/slow and actual hidden-tab behavior plus funded acknowledgement on a documented device; meet local p95 <=100 ms or document failure, reporting provider latency separately.
- [x] C096-T009 Independently review proofs, receipts, recovery and disclosure against both specs; enable only passing network/mode tuples and retain blockers.
- [ ] C096-T010 Run complete game and BIS acceptance, exact artifact/type/build/publish checks, then verify deployed Admin/game routes and release version. Keep game import separate until BIS evidence is ready; publish only under the applicable release authorization.

## 2026-10-27 bounded independent progress

This pass completed deterministic review and recorded live stop conditions. It
did not use a wallet, provider signing endpoint, protected Preview bypass,
deployment, or publication. The exact source/test review was performed against
the BIS checkout at `D:\Documents\Projects\VC\Bitcoin\blockchain-integration-service`;
the game package remains separate.

| Task | Disposition in this pass | Evidence / remaining gate |
| --- | --- | --- |
| C096-T001 | Blocked before signing | The original Signet wallet vault lock and unverified journal state remain unresolved. No lock clearing or wallet operation is allowed. Prior protected inventory is recorded in C094's acceptance handoff and `docs/treasure-contract-feasibility.md`. |
| C096-T002 | Blocked; no retry | Prior co-signer admission/delayed-finalization observations are inconclusive. No new attributable operator evidence was provided; Mutinynet covenant creation stays unavailable. |
| C096-T003 | Stopped before recovery | The original B2 swept/expired 1,000-sat operation lacks authoritative acceptance semantics and destination/fee proof. Do not sign or submit. |
| C096-T004–T006 | Live acceptance blocked | Exact-artifact lifecycle, funded managed-browser Claim/Reject, and live rollback still require T001 and, for the covenant mode, T002/T003. Existing receipts remain in BIS's frozen acceptance report; deterministic fixtures do not replace missing cases. |
| C096-T007 | Deterministic criteria complete; live lifecycle remains separate | `contract-validation.test.ts` proves the one Signet option, two Mutinynet options, their descriptions/default ordering, automatic host selection, and rejection of unavailable explicit choices. Admin source pins Signet to browser-policy and defaults Mutinynet to covenant; the game omits a local mode so BIS selects before funding. A new `treasure-session.test.ts` case starts with explicit covenant mode, receives a pending acknowledgement without a contract, snapshots/restores the session, later reconciles the same covenant record, and proves there is one creation call and no browser-policy fallback. The implementation now preserves the explicit mode in portable recovery. Focused Admin session suite passes 19/19. This covers deterministic choice/no-downgrade behavior; funded live cases remain blocked under T001/T004/T005. |
| C096-T008 | Local metrics pass; task remains open | Existing `output/reports/treasure-local-responsiveness/verification.json` reports cold/warm p95 below 100 ms and offline/slow smoke results on the documented headless reference setup. It records `hiddenObserved:false`, no funded acknowledgement, and no provider timing. Those remaining checks were not simulated. |
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
