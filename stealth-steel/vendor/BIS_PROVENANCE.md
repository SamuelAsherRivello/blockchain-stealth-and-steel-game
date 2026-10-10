# Current BIS release package snapshot (2026-10-10)

- Package: `@bis/integration` 0.0.20.
- Current artifact: `bis-integration-0.0.20.tgz`.
- SHA-256: `4cbf7550b049c6ed222c90a50d6093f6b66281704ec3d011def406307edded87`.
- Source commit: `fe201ae0f19bbdd0833c79801b6a6cbabc227ebb`.
- Inventory: 132 packed files in [bis-package-inventory.json](bis-package-inventory.json), UTF-8 without BOM.
- Export: all packed source files match committed Git bytes; the package excludes unrelated worktree edits. BIS validation passed 816 tests, typecheck and production build. Both public BIS routes display 0.0.20 after [successful Pages deployment](https://github.com/SamuelAsherRivello/blockchain-integration-service/actions/runs/38080634269).
- Consumer verification: archive hash and all 132 installed files pass; real BIS contract typecheck, 19 focused integration tests, all 1,130 tests, 10 publishing checks and production build pass. Only the current tarball is retained.
- Browser: muted Edge guest gameplay starts; Settings → Account displays `BIS: v0.0.20`; Back returns to Settings. No JavaScript or failed-network errors. The only warning concerns Chromium WebGPU powerPreference on Windows. Tested URL: http://127.0.0.1:5173/blockchain-stealth-and-steel-game/?muteMusic=true&muteSFX=true. No account or wallet action was initiated.
- Toolchain: React/React DOM and their types remain 19.3.0; TypeScript remains 7.0.2. No peer overrides or source symlinks.

### Game-consumable public API changes

- Added `createSharedArkadeWalletService`, `normalizeSharedWalletFailure` and shared wallet state, scope, operation and storage types.
- Added `assetDiagnostic`, `assetDiagnosticCode`, `diagnoseAssetFailure`, diagnostic types and `BisPendingDiagnostic` for safe actionable asset feedback.
- Added `inspectBisEquipmentAsset` and `BisEquipmentClassificationStatus`. Equipment now requires on-chain description and structured attribute metadata; legacy holdings remain generic until migrated.
- Player and Game Wallet readiness follows account/network/session changes and rejects stale results. Continue availability requires verified unreserved funds; payment capability remains separate from balance.
- The game's existing public `IBis`/`IBisGame` host integration consumes these internal readiness improvements without a new composition API.

BIS and this game use the same complete version, 0.0.20. The game publishes independently through its existing stable Pages route. This import performs no wallet operations.

# Historical 0.0.19 snapshot (2026-10-10)

- Package: `@bis/integration` 0.0.19.
- Current artifact: `bis-integration-0.0.19.tgz`.
- SHA-256: `8835f2895c1de6e5f74b0cf62c06ada347c35fcdc80ed84623d8fe84ea900961`.
- Source commit: `324d903ad2d02bcfee3b8b56b9fec34c9a67741a`.
- Inventory: 131 packed files in [bis-package-inventory.json](bis-package-inventory.json), UTF-8 without BOM.
- Verification: package typecheck and production build pass; the lifecycle regression passes and verifies account events stay on the game channel without browser reload. The full BIS suite still has unrelated pre-existing failures in this dirty checkout. Game import verification and build are pending completion below.
- Toolchain: React/React DOM and their types 19.3.0; TypeScript 7.0.2 matches the verified provider compiler. No forced peer overrides, source-folder dependencies or source symlinks.

### Game-consumable public API changes

- Account login/logout lifecycle notifications remain `IBisGame.onBisEvent` events; BIS does not reload the browser. The game owns start-menu reconstruction and non-menu refresh behavior.
- Added `IBis.hasPaymentSupport()` and `BisSnapshot.capabilities.payments`, which report Player Wallet/Game Wallet readiness without requiring payment balance. Continuation `canPay` separately reflects verified available funds.
- `BisService implements IBis`; context, wallets, UI and controllers are private. Named continuation, reward, equipment, contract, reset and lifecycle commands replace raw composition.
- `IBisGame` requires `onBisEvent`. Notifications carry safe snapshots and operation references. Confirmed asset/sats effects are bound to their originating gameplay run and return independent application receipts.
- `BisSnapshot`, `BisCapabilities`, `BisGame…State/Request`, `BisContract…`, and `BisResetResult` are the shared vocabulary. Reset reports completion/failure and never promises remote cancellation.

BIS releases first; the game imports this immutable package and publishes the same full version, 0.0.19, independently through Pages. No wallet actions are authorized by import verification.

The `0.0.19` game release is being prepared from the imported archive; browser and Pages deployment evidence will be recorded after the release workflow completes. See [paired verification](../../openspec/changes/formalize-bis-game-contracts/verification.md) for prior coverage and explicit financial/device limits.

## Historical 0.0.16 snapshot (2026-10-08)

- Package: `@bis/integration` 0.0.16.
- Current artifact: `bis-integration-0.0.16.tgz`.
- SHA-256: `0c5a4d551f443e78a8e52e5aa32df258e9ea6eb41f3838f51a755536217ce041`.
- Source commit: `a2ae498ab88d73d6255b8f2db79afc853f343c97`.
- Inventory: 126 packed files in [bis-package-inventory.json](bis-package-inventory.json).
- Verification: archive and all 126 installed files verified; BIS contract typecheck, 16 focused tests, publishing checks, and production build passed. The full suite passed 1,095/1,096 tests; its OpenSpec adapter test failed because the installed CLI is 1.14.0 while the adapter pins 1.13.1. A muted local Chrome run started without an account; Settings → Account displayed BIS v0.0.16, with no console or failed-network errors and no wallet action initiated. Tested URL: http://127.0.0.1:5173/blockchain-stealth-and-steel-game/?muteMusic=true&muteSFX=true.

### Game-consumable public API changes

- No public API changes in the packed source compared with the prior 0.0.11 snapshot. The `BisService`, `IBisGame`, and `./style.css` exports remain available.
- The game can continue using the existing account and host integration without a contract adaptation.

This archive is a verified local BIS export for deterministic game builds. It is not a published GitHub package or release and does not authorize wallet operations. See [play and setup instructions](../documentation/treasure-lto.md).

## Historical package records

# BIS release package

- Package: `@bis/integration` 0.14.0.
- Release: https://github.com/SamuelAsherRivello/blockchain-integration-service/releases/tag/v0.14.0
- Source commit: `e68f356b553d49c90d7888ebb9cd6a262d9a6ad3`.
- Downloaded release archive: `bis-integration-0.14.0.tgz`.
- Vendored filename: `bis-integration-0.14.0-31b999e50909.tgz`.
- SHA-256: `31b999e509092f9dda274c62aa8bcc0d4eb5f3a69b34a7bd6242f80285b560ba` (verified against the published SHA256SUMS).
- Exact 70-file inventory: [bis-package-inventory.json](bis-package-inventory.json).
- React and React DOM: 19.2.8.

This release adds the paid-continuation, trophy-collection, and queued toast APIs used by the game. BIS mounts at native 100%; the game owns restart after confirmed logout.

Run `node stealth-steel/tools/verify-bis-package.mjs` from the game root after installation.
See the [coordinating runbook](https://github.com/SamuelAsherRivello/blockchain-integration-service/blob/main/BIS/documentation/SMOKE_TEST_BIS_TO_GAME.md)
for setup and remaining live/device acceptance.

F1 local development snapshot: bis-integration-0.14.1-f1-c70c2adcabe1.tgz. SHA-256: c70c2adcabe1fdceadaf34a8a6a15478e70db9051b6c14d12795503b085e5e1a. Includes independent Admin wallet API and public Continue recipient configuration; live payment verification pending.

F1 host configuration: set public VITE_BIS_GAME_WALLET_ADDRESS before building. BIS disables new Continue payments when it is absent or invalid. The value is the game's Arkade receiving address, not a signing credential. Admin can be closed during receipt. No actual recipient has been selected in this checkout by this change.

Final F1 snapshot: bis-integration-0.14.1-f1-c70c2adcabe1.tgz. SHA-256: c70c2adcabe1fdceadaf34a8a6a15478e70db9051b6c14d12795503b085e5e1a. Supersedes the earlier local F1 snapshot above.

## G1/G2 local development snapshot (2026-09-09)

Current artifact: bis-integration-0.14.1-g1-g2-1b31a54a68a9.tgz. SHA-256: 1b31a54a68a9fe777de6db6e4b84ea8058a179e5563053a53a3a17ca2642f505. Supersedes earlier F1 snapshots for this checkout. All 93 installed files verified against the current inventory. React and React DOM remain deduplicated at 19.2.8.

Includes generic contracts, encrypted recovery, Item List/Item List Detail, and the client LTO controller. New creation is gated pending live race/preservation evidence; query/refund/recovery remain available. See [treasure integration setup and acceptance](../documentation/treasure-lto.md). This is an unreleased local package, not a published release.

Autonomous verification update: bis-integration-0.14.1-g1-g2-3fb9421ed7bb.tgz; SHA-256 3fb9421ed7bb6c11230e219943fbc14d76948ce9e73779b6c7528d3d7b6b0e56. All 93 files verified. Includes game-role refund toasts and scoped disposal recovery. BIS 52 focused tests and isolated browser acceptance pass; live creation gate remains unchanged.

Final acceptance snapshot: bis-integration-0.14.1-g1-g2-8b79d547b577.tgz; SHA-256 8b79d547b5774c826b509b1301dce746b1bea8f09cc607ca15ef9034b7c32bb0. Supersedes the prior G1/G2 snapshots above. All 93 installed files verified. Adds an origin-exclusive Admin Reset guard for unresolved player/game contracts. Game build and actual loaded BIS version check pass. Live creation remains gated.

Default-enabled LTO snapshot: bis-integration-0.14.1-g1-g2-3b1f7f91ca8c.tgz; SHA-256 3b1f7f91ca8cc79981227d54a8449dc7419c740b5c346deca0633077beec61ca. Supersedes all earlier G1/G2 snapshots above. All 93 installed files verify and the game build passes. Creation uses runtime readiness by default; explicit creationEnabled:false retains recovery. This is an unreleased local snapshot.

Asset-carrier funding fix: bis-integration-0.14.1-g1-g2-d191d1bc8688.tgz; SHA-256 d191d1bc8688c22c77fccf8bf23e5156b6adf17275b16014013d90f30459a47c. Supersedes earlier G1/G2 snapshots. The 93-file inventory verifies. Preserves every asset in game change and provides sanitized preparation failure reasons.
