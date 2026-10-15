## Why

**C081 — consume-bis-local-release**

Stealth & Steel currently consumes a vendored BIS tarball whose package metadata
does not match the adjacent BIS repository's verified `@bis/integration` `0.0.1`
release. Updating from the local packed artifact now gives the game a
reproducible dependency boundary while the BIS work is still uncommitted and
unpublished; pulling GitHub `main` would not provide that release boundary.

## What Changes

- Pack `@bis/integration` from the adjacent BIS repository at
  `D:\Documents\Projects\VC\Bitcoin\blockchain-integration-service` without
  editing that repository.
- Inspect the packed tarball, record its exact package version, source context,
  SHA-256, and file inventory in the game's existing vendor provenance files.
- Replace the game's vendored BIS artifact and update its dependency metadata and
  lockfile to consume the exact local `0.0.1` tarball.
- Verify the public BIS host-game contract remains compatible without importing
  BIS internal source paths or exposing wallet credentials.
- Run the relevant game tests, BIS-contract typecheck, production build, and
  browser smoke verification after implementation.
- Keep a future project-specific BIS update skill as a design follow-up only;
  do not create that skill in this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `bis-host-game-contract`: Require the game to consume and verify a pinned,
  locally packed BIS release artifact while continuing to use only the package's
  published host-game API and remaining playable without BIS availability.

## Impact

- Affects the game's root `package.json` and `package-lock.json`, the vendored
  `stealth-steel/vendor` BIS tarball, provenance/inventory metadata, and
  compatibility or release tests as needed.
- Reads the adjacent BIS repository and its package output, but does not modify
  or publish that repository.
- No wallet operations, secret handling, public-port exposure, source-folder
  symlink, GitHub `main` dependency, or Git history operation is required.
