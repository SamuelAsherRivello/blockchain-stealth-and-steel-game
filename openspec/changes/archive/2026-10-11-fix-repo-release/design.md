# Design

## Context

See [proposal.md](proposal.md) for the motivation and the `release-metadata-display` delta for the contract. The current `.github/workflows/deploy-pages.yml` builds every `main` push; `vite.config.js` uses a fixed repository base; `stealth-steel/public/environment.json` has a checked-in version and twelve-digit size placeholder. The archived C010 design chose immutable release assets and versioned Pages, but its workflow tasks were left undone. The game repository currently has only the Pages workflow.

## Goals / Non-Goals

**Goals:** Make one manual workflow the authoritative path from a verified remote `main` commit to the next patch tag, GitHub Release asset, and versioned Pages deployment. Make reruns safe after a partial publication failure and keep existing release assets unchanged.

**Non-Goals:** Publish a release while implementing C089, change BIS packaging or wallet behavior, introduce a second version source, or make arbitrary prerelease/minor/major increments.

## Decisions

### Use the root package version as the version source

The workflow runs only by `workflow_dispatch` on `main`. It fetches `origin/main` and tags, requires the checked-out commit to match the remote tip, and derives the next patch from root `package.json`. The lockfile root version and current latest tag must agree with that starting version. Preparation increments both npm manifest versions and writes the matching `releaseVersion` plus the twelve-digit placeholder to `stealth-steel/public/environment.json`. This keeps all checked-in version data in one release commit. A matching existing tag enters a retry path only when it is the latest tag and publication is incomplete; it never increments again to hide a failed run or moves the public root back to an older version.

Alternative: add `version.txt` or derive solely from the latest tag. Both introduce disagreement with the checked-in npm version already displayed and tested by the game.

### Keep all release work in one manually dispatched workflow

Replace the push-triggered Pages workflow with `.github/workflows/release.yml`. The job uses Node 22, locked npm installation, `npm run test:publish`, `npm test`, BIS contract typecheck, and `npm run build` before any remote Git write. A single release helper contains testable version, metadata, archive, and Pages staging logic; the workflow keeps GitHub authentication, atomic push, `gh release` commands, and Pages deployment visible in YAML. It runs with a non-canceling release concurrency group and minimum necessary contents/Pages/id-token permissions.

Alternative: keep two independent publish workflows. That risks a push deployment overwriting root/latest or a token-created release event failing to trigger the second workflow.

### Give each versioned build a release-specific Vite base

Default Vite development/build behavior retains `/blockchain-stealth-and-steel-game/`. A validated release tag supplied by the workflow switches the build base to `/blockchain-stealth-and-steel-game/releases/<tag>/`, so every JS, CSS, image, audio, and `environment.json` request stays within its immutable version directory.

Alternative: reuse the root base in archived builds. That would make old HTML depend on newer root assets and defeat versioned availability.

### Finalize size before remote mutation, then push commit and tag atomically

The helper writes a fixed-width size placeholder before Vite builds, measures the completed `dist` tree, replaces the placeholder with the same-width decimal total, and remeasures to prove equality. It creates a repository-specific ZIP whose root is the browser build. After all checks and ZIP creation pass, the workflow commits version files and uses an atomic Git push for `main` and the matching tag. A rejected push changes neither remote ref. The workflow then creates or verifies the GitHub Release and uploads the ZIP only if absent; if an asset exists, its content must match the candidate or the run fails rather than replacing it.

Alternative: tag or create the release before tests/build. This would leave published identities for a build that may not pass required checks.

### Reconstruct Pages from immutable release assets

The Pages staging helper downloads available ZIP assets for published exact-version tags, validates extraction paths, and places each under `releases/<tag>/`. It includes the current candidate even if the GitHub Release is still being finalized. Root and `latest` contain relative redirects to the newly released tag; `.nojekyll` prevents GitHub Pages from hiding static assets. The workflow uploads this assembled site with `actions/upload-pages-artifact` and deploys it in the same run. A retry for a tag with an existing identical asset can rebuild the Pages tree without a new tag, asset, or version bump. The README describes the manual dispatch, remote `main` requirement, patch rule, verification, and URL layout.

Alternative: retain the push-driven `dist` deployment. A later unreleased commit would replace the newest tagged release at the public URL.

## Risks / Trade-offs

- [A release can fail after the atomic push] → Treat the existing current tag as a resumable publication state; do not bump another version or overwrite an existing asset.
- [A concurrent `main` push can invalidate the prepared release] → Re-fetch and require the expected parent immediately before the atomic push; rely on the remote non-fast-forward check as the final guard.
- [Older GitHub Releases may not contain the expected browser ZIP] → Preserve every available versioned build and report missing assets; never fabricate an archive from a moving branch.
- [A versioned Vite base can break asset loading] → Test the generated base and verify a built version in a muted browser before completing implementation.
- [The current full suite can fail locally because a global OpenSpec CLI is newer than the repository adapter] → Run and report the exact suite result; do not bypass release checks or change unrelated OpenSpec tooling in C089.

## Migration Plan

1. Add helper logic, focused tests, and release-specific Vite base support. Make the tests prove version/tag agreement, size accounting, safe archive paths, and redirects.
2. Replace push Pages publishing with the manual release workflow and update publishing tests plus README. No workflow is dispatched during C089 implementation.
3. Verify OpenSpec artifacts, focused release tests, full tests, BIS contract typecheck, production build, generated staging layout, and a muted browser load of a versioned build. Review the scoped diff and preserve the unrelated OpenSpec change.
4. A later explicit release request commits and pushes the prepared game changes, dispatches `release.yml` on `main`, waits for success, and verifies remote tag, release asset, versioned URL, and root/latest redirects. Roll back by releasing a new patch from reverted source; never move or delete an immutable released tag or asset.
