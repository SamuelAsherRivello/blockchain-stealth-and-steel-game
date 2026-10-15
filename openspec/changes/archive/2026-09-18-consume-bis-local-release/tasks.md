## 1. Inspect and prepare the local BIS artifact

- [x] 1.1 C081-T001 Confirm the adjacent BIS checkout, package metadata, dirty
  state, and current game vendor dependency with read-only status and manifest
  inspection; verify no unrelated files are selected for the change.
- [x] 1.2 C081-T002 Pack only `@bis/integration` from BIS `0.0.1`, inspect the
  tarball contents and package metadata, and record its exact path and SHA-256;
  verify the archive contains the expected package metadata and public files.

## 2. Update the game dependency and provenance

- [x] 2.1 C081-T003 Replace the game's vendored BIS tarball with the packed
  `0.0.1` artifact and regenerate the exact file inventory; verify every
  inventory entry hashes to the installed archive contents.
- [x] 2.2 C081-T004 Update `package.json`, `package-lock.json`, and
  `BIS_PROVENANCE.md` so the game resolves the pinned tarball and documents the
  version, hash, source context, and verification date; verify npm lockfile
  resolution and provenance agree on the same artifact.
- [x] 2.3 C081-T005 Verify the game imports only the public BIS API and retains
  the no-account/no-connectivity playable path; make only scoped compatibility
  adjustments if the verified package requires them; verify with source search,
  contract typecheck, and the existing focused game tests.

## 3. Verify and hand off

- [x] 3.1 C081-T006 Run the focused BIS/game tests, BIS-contract typecheck,
  production build, and dependency/provenance checks without wallet operations;
  verify each command's exit status and record the results.
- [x] 3.2 C081-T007 Run the game in the existing Vite pane and perform a real
  browser smoke test covering game start, BIS UI loading, and console/network
  health; verify the live page URL and report the exact test scenarios for user
  playtesting.
- [x] 3.3 C081-T008 Confirm the final diff is scoped, record the tarball path,
  SHA-256, dependency version, test results, and build result; do not create the
  future BIS-update skill in this change; verify with `git diff --check`, status,
  and a final scoped file list.
