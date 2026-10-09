# Current BIS release package snapshot (2026-10-09)

- Package: `@bis/integration` 0.0.18.
- Current artifact: `bis-integration-0.0.18.tgz`.
- SHA-256: `bb9066ff8f82b9a85da0e3bd43255e21ba17a9a788b16145801630fdf8afe118`.
- Source commit: `64b090f869656057823d023b5e31e202c28930b3`.
- Successful BIS Pages run: https://github.com/SamuelAsherRivello/blockchain-integration-service/actions/runs/37901274392
- Inventory: 127 packed files in [bis-package-inventory.json](bis-package-inventory.json), UTF-8 without BOM.
- Verification: exact isolated released build packed; archive and all 127 installed files verified after lockfile installation. Provider full suite/builds/routes/browser acceptance and isolated public-type consumer pass. Game migration passes all 1,123 automated tests, actual-package typechecking, publishing checks and production build. Fresh muted development/production Edge contexts verify guest play, Account, focus/fullscreen/native narrow layout, movement/pause, safe reset, unavailable capabilities and load failure/timeout recovery. Existing development-only gameplay QA verifies guest continuation/trophy states and replacement runtime; it does not simulate financial success. Online game publication is recorded separately after its deployment succeeds.
- Remote recheck: BIS `main` also contains later same-version presentation/loading changes at `89e0b4beb5228c0ac275a3eb25ab456090e631e0`, with successful [Pages run](https://github.com/SamuelAsherRivello/blockchain-integration-service/actions/runs/37905524560). This immutable game archive is deliberately the fully verified 0.0.18 release snapshot at `64b090f`, not a claim that those subsequent UI edits are packed here. Both versions remain 0.0.18.
- Toolchain: React/React DOM and their types 19.3.0; TypeScript 7.0.2 matches the verified provider compiler. No forced peer overrides, source-folder dependencies or source symlinks.

### Game-consumable public API changes

- `BisService implements IBis`; context, wallets, UI and controllers are private. Named continuation, reward, equipment, contract, reset and lifecycle commands replace raw composition.
- `IBisGame` requires `onBisEvent`. Notifications carry safe snapshots and operation references. Confirmed asset/sats effects are bound to their originating gameplay run and return independent application receipts.
- `BisSnapshot`, `BisCapabilities`, `BisGame…State/Request`, `BisContract…`, and `BisResetResult` are the shared vocabulary. Reset reports completion/failure and never promises remote cancellation.

BIS releases first; the game imports this immutable package and publishes the same full version, 0.0.18, independently through Pages. No wallet actions are authorized by import verification.

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
