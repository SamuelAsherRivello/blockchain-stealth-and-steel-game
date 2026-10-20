# Tasks

C094, `productionize-treasure-chest-contract`. Planning is complete; no implementation or financial acceptance task is complete. Tasks execute in dependency order. A failed enforcement proof blocks the replacement implementation and production qualification. Existing legacy inspection and recovery remain supported. Live actions require explicit test-wallet grants and spending limits. The game-local edit root does not cover upstream BIS source changes; the upstream handoff must be separately scoped before those edits.

## 1. Establish evidence and the upstream contract

- [ ] 1.1 C094-T001 Record the exact vendored archive hash, installed-file inventory, public API and existing test commands in a sanitized baseline report; verify with the existing package verifier and source-linked evidence for script timing, wallet ownership, restored state and browser-only monitoring.
- [ ] 1.2 C094-T002 Prepare the narrow upstream BIS handoff for versioned LTO enforcement, safe DTOs, portable recovery and legacy support; verify a requirement mapping reconciles hosted-signer/shared-service claims with the confirmed no-server local-wallet model and excludes Conditional Vault work.
- [ ] 1.3 C094-T003 Add executable regression fixtures for restored `active` state, pending claims crossing expiry, wrong network/offer and explicit session-end versus window-close behavior; verify failures expose the relevant current gaps without touching wallet secrets or claiming network acceptance.

## 2. Prove the required spend rules

- [ ] 2.1 C094-T004 Produce a bounded Signet and Mutinynet capability report for pinned SDK/operator identities, supported contract execution, authoritative time precision, acceptance point, output limits and fees; verify each claimed capability against primary documentation and read-only provider evidence without funding.
- [ ] 2.2 C094-T005 Build an executable isolated proof of immutable 90-second rules and authorized claim/reject/session-end/refund paths; verify emitted bytecode with valid signatures for before/at/after expiry, clock tampering, early revocation, wrong destinations, preimage exposure and every unilateral branch. Record infeasibility rather than substitute application checks.
- [ ] 2.3 C094-T006 Under explicit protected test grants, exercise the proposed script with each actual advertised operator and inspect exact funded output bytes and spend receipts; verify accepted valid spends and rejected invalid spends, including delayed finalization. Preserve private recovery and sanitize the report. If unsupported, document the exact blocking behavior and stop replacement work.
- [ ] 2.4 C094-T007 Review the proof against all C094 requirements and document the selected mechanism, authoritative clock and admission semantics; verify an independent review can reproduce its results and that it uses no new infrastructure, changed amount, changed deadline or unapproved custody model.

## 3. Obtain the verified upstream BIS dependency

- [ ] 3.1 C094-T008 In the explicitly scoped upstream change, deliver the versioned script/adapter and safe public enforcement/evidence projections; verify runtime destination, signer, network, fee and asset-change checks plus executable contract tests, with legacy scripts retaining their original terms.
- [ ] 3.2 C094-T009 Obtain upstream journal/reservation and portable encrypted recovery support; verify lost-submit/finalize acknowledgements, corrupt storage, export/import, reset/logout safeguards, cross-device competing outpoints and exact original recovery through adapter/storage tests and documented operator procedures.
- [ ] 3.3 C094-T010 Obtain upstream wallet hardening and disclosure for the local model; verify restrictive content policy and dependency review appropriate to the deployed game, explicit Game Wallet funding consent, no secrets in public descriptors/logs, and documented batch-expiry and exit limitations.
- [ ] 3.4 C094-T011 Import the verified upstream release through the established BIS export/import workflow; verify archive/install hashes, recorded source provenance, public contract types and matching full game/BIS versions. Do not replace the dependency with an adjacent source-directory import or bundle unrelated dirty work.

## 4. Adapt treasure state and presentation

- [ ] 4.1 C094-T012 Replace restored `active` authority with unverified state and exact BIS projection binding; verify C094-T003 fixtures and new tests prove cache tampering cannot reveal a new chest, authorize a claim, extend a deadline or cross wallet networks.
- [ ] 4.2 C094-T013 Keep financial progress separate from the display countdown and offer eligibility; verify pre-deadline accepted claims stay pending across expiry, failed/unknown spends retain truthful state, and duplicate events cannot repeat reward feedback or target a replacement run.
- [ ] 4.3 C094-T014 Preserve explicit Start, authored position/artwork, funded reveal, Claim/Reject/Back, pause and re-entry behavior; verify UI and runtime tests cover delayed funding, temporarily unavailable revealed chests, closed-window updates, progression, session end and late async callbacks.
- [ ] 4.4 C094-T015 Integrate legacy status, unsupported-network handling and explicit recovery access through public BIS operations; verify legacy reads/recovery stay available when replacement creation is disabled and ordinary guest gameplay remains usable.
- [ ] 4.5 C094-T016 Update treasure and deep-dive documentation for the imported version and confirmed custody/enforcement/recovery model; verify every current-state statement and link matches source and distinguish local tests, live evidence and remaining exit limitations.

## 5. Verify the complete feature and rollout boundary

- [ ] 5.1 C094-T017 Run the game full test suite, `npm run typecheck:bis-contract`, `npm run test:publish`, package artifact verification and `npm run build`; verify the exact imported dependency passes without focused-test-only exceptions, recording any unrelated baseline failure separately.
- [ ] 5.2 C094-T018 Validate the built game with the managed Playwright browser using both mute query parameters; verify guest play and the real imported package, then separately verify funded Claim/Reject UI under explicit grants without injecting financial success projections.
- [ ] 5.3 C094-T019 Complete the per-network live acceptance matrix for funding, zero-player-balance claim, reject, session end, expiry/refund, competing spends, closed-browser recovery, lost acknowledgements, recovery import, network replacement, asset change and insufficient funds; verify exact receipts and sanitized evidence identify every passed, failed and unperformed case.
- [ ] 5.4 C094-T020 Exercise creation-disable rollback with legacy and new unresolved contracts; verify exact original inspection/recovery still works without deleting journals, changing funded scripts or replaying uncertain submissions, and record the procedure alongside the acceptance report.
- [ ] 5.5 C094-T021 Review all acceptance evidence against both delta specs; verify qualification is limited to the selected local-wallet model and networks actually proven, unresolved proof/live failures leave C094 incomplete, and publishing remains a separately requested action.
