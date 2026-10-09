# Proposal

## Why

The game has a push-driven Pages workflow but no checked-in version-release workflow, so `openspec-release-version` cannot derive and publish a verified release. C089 completes the release publication behavior already required by `release-metadata-display` and left unfinished in archived C010.

## What Changes

- Replace automatic publication of every `main` push with a documented manual release workflow that operates on the authoritative `main` commit, derives the next patch version from the checked-in package version, and refuses duplicate or divergent releases. **BREAKING:** unreleased pushes to `main` no longer replace the public game.
- Run the existing publishing checks, full tests, and production build before changing remote Git state. Publish a matching tag, immutable browser-build GitHub Release asset, and versioned Pages build only after those checks pass.
- Generate exact release metadata, including the fixed-width final uncompressed build size, and make the public root and `latest` point to the newest tagged release while preserving older versioned builds.
- Update release documentation and focused workflow tests so agents and maintainers can identify the release source, version rule, dispatch path, and verification evidence.
- Keep package imports, wallet operations, and release dispatch outside this change; implementation prepares the repository but does not publish a release.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `release-metadata-display`: Specify the manual release trigger, checked-in version source and patch rule, pre-publication gates, immutable tag and asset behavior, safe recovery, and release-controlled Pages entry points already described by this capability.

## Impact

- GitHub Actions under `.github/workflows/`, release tooling and focused tests under `stealth-steel/`, `package.json` and `package-lock.json` version handling, Vite's release base path, `stealth-steel/public/environment.json`, and README release instructions.
- The public demo URL remains the same, but updates only after a successful tagged release. Existing released version URLs remain addressable.
