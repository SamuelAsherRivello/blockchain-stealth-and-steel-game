## Context

The adjacent BIS checkout is a separate workspace with package version `0.0.1`
and an uncommitted implementation. The game already uses a vendored tarball, so
the safest integration boundary is to pack only `BIS/packages/integration`,
inspect the archive, and replace the game's current artifact with that exact
file. GitHub `main` is intentionally not a release source: it is mutable and
does not represent the verified local implementation.

The existing checkout is dirty for unrelated level-authoring work and already
contains BIS provenance edits. Implementation must preserve unrelated changes
and update only the BIS-consumption scope.

## Goals / Non-Goals

**Goals:**

- Make the game's BIS input reproducible and auditable as one exact local
  tarball.
- Preserve the existing public host contract and no-account gameplay path.
- Leave enough provenance for a future update to be repeated safely.

**Non-Goals:**

- Publishing BIS, committing or pushing either repository, or consuming a
  mutable GitHub branch.
- Changing BIS source code, wallet behavior, gameplay design, or unrelated
  level-authoring work.
- Creating the future project-specific BIS update skill during this change.

## Artifact flow

1. Read the adjacent BIS package metadata and run its existing package-level
   validation/build checks as applicable, without editing or publishing BIS.
2. Run `npm pack` for `@bis/integration` in the BIS workspace, capture the
   generated tarball, inspect its `package/package.json` and archive file list,
   and compute SHA-256.
3. Copy the tarball into `stealth-steel/vendor` using a versioned filename,
   regenerate the vendor inventory, and update `BIS_PROVENANCE.md` with the
   source checkout, version, artifact path, hash, and verification date.
4. Point the game's dependency at the vendored tarball and refresh the game's
   lockfile. Do not retain an ambiguous source-folder dependency.
5. Verify the public imports used by the game against the packed artifact and
   keep the existing no-BIS graceful-start behavior intact.

## Decisions

- **Use a local packed tarball:** this matches the currently verified but
  unpublished BIS state and gives npm a file-level reproducibility boundary.
  A source-folder dependency would couple the game to a moving checkout, while
  GitHub `main` would be mutable and could omit the local release.
- **Record both hash and inventory:** the SHA-256 identifies the archive and the
  inventory makes accidental content drift or repacking visible during review.
- **Keep the game-side public API boundary:** importing internal BIS files would
  make future updates brittle and could leak implementation or wallet types.

## Risks / Trade-offs

- [Local artifact is not available to a fresh clone] → Keep the tarball in the
  game's vendor directory and record its exact dependency and provenance.
- [BIS package API differs from the current game adapter] → Run the contract
  typecheck, focused tests, build, and browser smoke check before handoff.
- [Dirty adjacent checkout causes accidental edits] → Use read-only inspection
  and `npm pack` only; verify the BIS working tree remains unchanged.

## Migration Plan

Install the exact vendored tarball, refresh the lockfile, update provenance, and
run the verification suite. If compatibility fails, leave the existing game
artifact untouched and report the failure rather than falling back to GitHub
`main` or a source-folder link. Rollback is therefore a scoped restoration of
the prior vendor file and dependency metadata by the authorized implementer,
without destructive Git operations.

## Open Questions

None that change the approved scope or acceptance criteria. The future skill's
exact name and placement can be decided separately after this workflow proves
the update contract.

## Verification

Implementation verification should include the relevant focused game tests,
`npm run typecheck:bis-contract`, `npm test`, `npm run build`, and a real browser
smoke check through the existing Vite server. The browser check should confirm
normal gameplay can start without account setup and that the BIS UI path loads
from the vendored package without console errors. No real wallet action is part
of acceptance.

## Future project-specific skill (not created here)

After this change stabilizes, a project-local skill could provide a repeatable
"update BIS from adjacent checkout" workflow. It should locate the adjacent BIS
repository, verify the requested immutable/versioned release boundary, pack and
inspect only `@bis/integration`, update the vendor artifact/lockfile/provenance,
run the credential-free checks, and stop before wallet operations or publishing.
It should refuse mutable `main` consumption by default and require an explicit
version or commit/archive identity. This proposal records the design only; no
skill files are created.
