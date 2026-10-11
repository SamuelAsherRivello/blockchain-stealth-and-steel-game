# Tasks

## 1. Release build foundations

- [x] `C089-T001` 1.1 Add a testable release helper for exact tags, patch derivation, checked-in version agreement, and resumable publication state; verify focused tests reject duplicates, stale `main`, and mismatched versions.
- [x] `C089-T002` 1.2 Add release metadata preparation/final-size accounting and deterministic browser ZIP creation with safe extraction/staging tests; verify a representative build's recorded size equals its final uncompressed file total.
- [x] `C089-T003` 1.3 Add a validated release-specific Vite base while preserving the local repository base; verify tests cover default and versioned paths and inspect a versioned production build's asset URLs.

## 2. Version release publication

- [x] `C089-T004` 2.1 Replace push-driven Pages publishing with a checked-in `workflow_dispatch` release workflow that gates all remote changes on locked installation, publishing tests, full tests, BIS typecheck, and build; verify workflow tests enforce trigger, branch, gate order, and atomic commit/tag push.
- [x] `C089-T005` 2.2 Complete immutable GitHub Release asset and versioned Pages publication, including matching-asset retries and root/latest redirects; verify focused tests and a local staged-site inspection cover current and prior release directories.
- [x] `C089-T006` 2.3 Update README release instructions with the `main` dispatch, patch-version source, asset/Pages URLs, and failure recovery; verify documentation tests assert the workflow and live URL accurately without adding release numbers to README.

## 3. Integration verification

- [x] `C089-T007` 3.1 Run `openspec validate fix-repo-release` and attempt `--strict`, the focused release tests, `npm run test:publish`, `npm test`, `npm run typecheck:bis-contract`, and `npm run build`; resolve C089 failures and report the existing canonical-ID CLI warning or unrelated environment failures precisely.
- [x] `C089-T008` 3.2 Load a locally served versioned build in an AI-muted real browser, verify startup, metadata and asset paths with no console/network errors, then review `git diff --check` and the scoped status while preserving unrelated work.
