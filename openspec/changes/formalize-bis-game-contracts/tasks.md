# Tasks

Canonical change identity: C088 (`formalize-bis-game-contracts`). Every `C088-T###` identity below is permanent across reordering/renaming. Apply the provider's same-named BIS change first; its verified new Pages release/export is a prerequisite for the production package import.

## 1. Verify and import the working BIS export

- [x] 1.1 C088-T001 Record game statuses/revisions and full test/build baseline, confirm the BIS handoff's successful Pages run/version/source commit, and inspect archive exports; verify the handoff corresponds to the actual new remote BIS implementation rather than an old or dirty checkout.
- [x] 1.2 C088-T002 Verify archive metadata and SHA-256, generate the exact UTF-8-no-BOM packed-file inventory, pin the single versioned vendor tarball in manifest/lockfile and resolve peers explicitly; verify lockfile installation and `node stealth-steel/tools/verify-bis-package.mjs` without sibling-source dependencies or forced peer overrides.
- [x] 1.3 C088-T003 Update current `BIS_PROVENANCE.md` with version, source commit, hashes, count and consumable public API changes, then remove only superseded game-vendor archives after verification; verify the retained artifact/install inventory again and preserve historical records.

## 2. Adopt the real two-interface gateway

- [x] 2.1 C088-T004 Remove the handwritten package declaration mirror/path substitution, check actual installed `IBis`/`IBisGame` exports, and extend boundary coverage to actual consumer code; verify positive type conformance and negative missing-method/internal-member fixtures rather than accepting a local shim.
- [x] 2.2 C088-T005 Migrate `bis-account.js`/BIS bootstrap to a typed `IBis` handle, remove `getSession()` and legacy low-level composition, and route safe snapshots/events through `IBisGame`; verify Account/adapter tests and no BIS-private or raw controller imports/access in the runtime boundary.
- [x] 2.3 C088-T006 Preserve explicit Account-close/logout event ordering, pause/focus/inert/fullscreen/passive UI behavior and unavailable retry; verify `bis-account.test.js` covers close-to-Settings, stable restart deduplication, timeout, failed import and disposal during initialization.
- [x] 2.4 C088-T007 Update the game deep dive's gateway/interfaces/bootstrap snippet and affected integration template guidance alongside the new gateway; verify examples compile against the imported package and companion/source links use the actual repository and JavaScript factory.

## 3. Session-bound game effects

- [x] 3.1 C088-T008 Add applied/in-flight session/operation ledgers and guarded synchronous mutation after any async preparation; verify concurrent duplicates, replay, preparation-time session replacement, failures and stale targets in `bis-host-game.test.js` with at most one game mutation.
- [x] 3.2 C088-T009 Invalidate active host sessions on restart/reset/runtime disposal and implement `onBisEvent` routing without another BIS channel; verify disposed/ended runs supply no session and late events/effects cannot change a replacement runtime.
- [x] 3.3 C088-T010 Implement actual game-owned confirmed asset/sats reward feedback and keep receipts independent of financial outcome; verify visible presentation, duplicate suppression, wrong-session rejection and no mint/payment retry in host/reward tests.
- [x] 3.4 C088-T011 Update the deep dive and relevant runtime-controller/test templates with the implemented ledger, commit guard and reward behavior; verify documented receipts match tests and never claim synthetic delivery as live wallet acceptance.

## 4. Migrate all workflow consumers

- [x] 4.1 C088-T012 Replace continuation controllers with named begin/pay/check/end commands and snapshot state; verify `pay-to-continue.test.js` preserves price, pending navigation guards, one paid-revival effect and loss-pause resume.
- [x] 4.2 C088-T013 Replace trophy controllers with named reward commands/states and actual per-operation availability; verify `level-reward.test.js` preserves Level 1–3 metadata/quantity, ownership checks, uncertainty/recheck, acknowledgement and next/restart guards.
- [x] 4.3 C088-T014 Replace equipment-controller access with refresh/select/clear and published game equipment DTOs; verify Items UI, ownership/selection and movement/combat effect tests, including Player-only support without a Game Wallet.
- [x] 4.4 C088-T015 Replace treasure `.lto`/wallet reads and readiness duplication with public contract commands/projections/events; verify treasure runtime/UI tests cover pending funding updates while closed, scoped offers, claim/reject/end, unavailable states and preserved offer lifetimes.
- [x] 4.5 C088-T016 Await safe `resetForGame` completion/failure in Clear All Settings and detach transient host workflows correctly; verify absent-wallet reset, failure messaging/retry, concurrent reset and late callback suppression in settings/integration tests without remote-cancellation claims.
- [x] 4.6 C088-T017 Update workflow sections in the game deep dive, treasure guide and relevant view/runtime templates alongside these migrations; verify canonical snippets use only `IBis`/`IBisGame`, each flow's safety rules match its tests, and no old workflow-controller guidance remains current.

## 5. Release tooling and complete documentation reconciliation

- [x] 5.1 C088-T018 Align the repository OpenSpec adapter and layout test with the verified supported CLI version while preserving canonical IDs/commands; verify `npm run openspec -- context --json`, the repository-layout test and strict C088 validation all pass without masking the observed version-mismatch failure.
- [x] 5.2 C088-T019 Implement package-derived Pages release metadata and fixed-width final uncompressed-build size generation; verify valid/invalid versions, size consistency and unchanged runtime fallback through release-metadata tests and a real production build.
- [x] 5.3 C088-T020 Reconcile overlapping C089 release work with the confirmed Pages-only decision: restore game push-to-`main` deployment, align workflow/Vite base/publishing tests and README metadata/release guidance, and prevent a competing manual/tag publisher while preserving compatible helpers and unrelated work; verify push-triggered publication independently of BIS, correct stable asset paths, one public game entry link and no tag/GitHub Release/manual-release prerequisite.
- [x] 5.4 C088-T021 Update `BIS_GAME_COMMUNICATION_EXPLORATION.md` Contracts section and five-column roles table plus refactor thoughts to as-built state; verify current/proposed/historical distinctions, actual exported type inventory and all source links against the installed release and updated code.
- [x] 5.5 C088-T022 Audit all remaining current game-owned BIS docs/templates/smoke/styling guidance and embedded diagrams, comparing both deep dives; verify a reviewed-doc/media inventory, typechecked examples, link checks, supported presentation hooks and consistent ownership/financial/effect semantics, coordinating stale labels at the shared canonical BIS diagram while preserving historical archived plans.

## 6. Full runtime gate and new game Pages release

- [x] 6.1 C088-T023 Run archive/installed-file verification, `npm run typecheck:bis-contract`, full `npm test`, `npm run test:publish`, production build and strict C088 validation; verify every gate is green and record any failing gate without substituting focused-test success.
- [x] 6.2 C088-T024 Run isolated credential-free development and production browser acceptance with both mute query parameters; verify guest play, Account open/close/retry, BIS version, Items/continuation/reward/treasure unavailable paths, reset/navigation, restart/disposal and console/network status using the imported runtime without synthetic financial success.
- [x] 6.3 C088-T025 Refresh existing README screenshots from the actual game UI at their existing paths and inspect them; verify the captured state/version and existing README references are accurate without exposing wallet data.
- [x] 6.4 C088-T026 Fetch/compare authoritative release state, use the exact full version of the released/imported BIS for the game, synchronize manifest/lockfile/release metadata and recheck that the imported BIS is the intended latest verified release; verify rebuilt metadata, rejection of version disagreement, and repeat the full automated/package/browser gates on the final release candidate.
- [ ] 6.5 C088-T027 Review scoped diffs/whitespace and preserve unrelated work, commit/push only intended game changes, verify their commit on remote `main`, and monitor its push-triggered Pages deployment independently of BIS; verify the exact workflow run succeeds without tag/release creation or manual dispatch rather than treating push acceptance as publication.
- [ ] 6.6 C088-T028 Verify the single stable public game link, new game release label and installed BIS release identity, then complete the paired audit with provider handoff task 5.3; verify both commits/versions/workflow URLs, package hash/inventory, full test results, documentation and runtime evidence before reporting the full objective achieved.
