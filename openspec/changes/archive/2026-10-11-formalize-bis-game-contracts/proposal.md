# Proposal

## Why

The game currently reaches BIS through its facade, exposed context/wallet/LTO objects, controller factories, and independent event subscriptions. C088 (`formalize-bis-game-contracts`) replaces that fragmented vocabulary with the agreed two-contract boundary and delivers a tested game release consuming the corresponding working BIS export.

## What Changes

- **BREAKING:** consume game-facing operations only through exported `IBis`, implemented by `BisService`; implement all `IBisGame` methods, including typed notifications, through the game adapter.
- Remove the game-facing `getSession()` escape hatch, legacy low-level composition fallback, raw controller access, and wallet-readiness duplication; migrate Account, continuation, trophies, equipment, treasure, reset and disposal.
- Bind effects to their originating session, suppress concurrent duplicates, invalidate ended/disposed runs, and provide actual game-owned reward feedback without changing financial outcomes.
- Import the exact built BIS package from the verified new BIS Pages release commit, recording its version, archive/file hashes, inventory and public API changes. Check against actual package exports instead of a handwritten declaration mirror.
- Update all affected current documentation, particularly this repository's deep dive, communication exploration, refactor thoughts, treasure guide, code templates, README links, provenance and smoke instructions; preserve historical archives as history.
- Adopt the Pages-only outcome explicitly confirmed on 2026-10-09: game updates pushed to `main` deploy independently to the single stable game Pages link. Restore push-to-Pages behavior where the overlapping C089 manual/tag-based workflow conflicts, preserving unrelated changes and useful compatible tooling. Increment the game version according to repository policy, run all tests and runtime checks, commit/push only intended changes, and verify the deployed game. Tags, GitHub Releases, release assets and manual release dispatch are not publication prerequisites.
- Reconcile outdated tag/immutable-release requirements with that approved release outcome; address the observed OpenSpec CLI/adapter version mismatch so the full suite passes rather than accepting its failure.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `bis-host-game-contract`: two-interface consumption, complete notifications, real-package conformance, session-safe effects, immutable local package provenance and accurate integration documentation.
- `release-metadata-display`: self-consistent package-versioned Pages builds and verified deployment, replacing obsolete tag/GitHub Release requirements while preserving metadata formatting and startup fallback behavior.

## Impact

Game runtime integration/UI modules, `main.js`, contract-check tooling, integration/UI/release tests, vendored tarball/lockfile, affected current documentation, release metadata and scoped reconciliation of the Pages deployment workflow. BIS provider work belongs to its own same-named change in the adjacent repository; cross-repository ordering is BIS implementation/verification/Pages release, verified export/import, game migration/verification/Pages release. C088 task identities use permanent `C088-T###` IDs. The confirmed Pages decision supersedes C089's conflicting publication behavior, not its unrelated work or historical artifacts.

No gameplay redesign, custody/backend changes, new funding policy, credential use or live wallet transactions are authorized by the verification plan. Ordinary guest/offline play remains independent of BIS.
