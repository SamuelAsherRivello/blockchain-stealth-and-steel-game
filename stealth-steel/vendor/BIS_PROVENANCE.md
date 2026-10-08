# Current BIS release package snapshot (2026-10-06)

Current artifact: bis-integration-0.0.11.tgz. SHA-256: 089e20fb20013e0af84ec117ac5e6b06540350f745c1bc2426a90c0ddd2b41fb. Source commit: 24c732a3b05992e5aef97525cb6109a0305304f3. The 126-file inventory is recorded in [bis-package-inventory.json](bis-package-inventory.json). The archive was packed locally from the explicit `@bis/integration` workspace. Archive verification, the BIS contract typecheck, focused account/host tests, and the production build passed; this is the immutable game input.

### Game-consumable public API changes

- `BisService` replaces the prior `BisGameServices` facade. It accepts `getBisGame()`, composes context, Game Wallet, LTO, and UI, and preserves the package `./style.css` export.
- `IBisGame` replaces `BisHostGame`. Its `BisGameSession` and confirmed-delivery inputs use `gameSession` rather than `gameSessionReference`; stale or replayed game effects remain game-owned and idempotent.
- `BisService.isBisVisible()`, `showLoading()`, `hideLoading()`, and the read-only capability checks remain available for host UI coordination. They do not initiate wallet operations, and the game remains playable without an account.

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
