# Design

## Context

See [proposal.md](proposal.md) and [the deltas](specs/) for C088's scope and behavior. The game currently pins `bis-integration-0.0.16.tgz`; the account wrapper also exposes `getSession()`/raw facade internals, returns BIS controllers and subscribes to context events. Treasure consumes `.lto` and duplicates wallet readiness; equipment, continuation and trophies each manage separate controllers. The game remains plain JavaScript with focused JSDoc/TypeScript checks.

`bis-host-game.js` records applied operation IDs after awaiting callbacks, so concurrent deliveries can both enter the effect. `main.js` does not invalidate every disposed session and its reward callback currently checks completion state without actual reward-specific feedback. `tsconfig.bis-contract.json` maps the package name to a local declaration mirror, so it is not evidence of conformance with the installed archive.

On 2026-10-09 the user explicitly confirmed independent Pages-only publishing: BIS updates deploy Admin and Marketplace together, and game updates deploy to one stable game link. Overlapping uncommitted C089 (`fix-repo-release`) work currently removes `deploy-pages.yml` and introduces a manual/tag-based `release.yml` plus helpers/tests/docs. That publication behavior conflicts with the confirmed decision and must be reconciled within C088 without blanket deletion of unrelated work or rewriting C089's historical artifacts. The source metadata file contains `v0.1.15` with a zero-size placeholder; compatible metadata sizing helpers may be reused without tag coupling. The OpenSpec adapter pins CLI 1.13.1 while the recent package-import evidence records an installed 1.14.0 mismatch.

## Goals / Non-Goals

Goals: consume all BIS functionality through the two exported contracts, preserve gameplay and navigation, demonstrate actual package/runtime compatibility, update all affected current docs, and release the game only after the new BIS Pages release and verified package handoff.

Non-goals: TypeScript conversion of the whole game, unrelated game-type renaming, moving gameplay into BIS, new wallet funding rules, credentials/financial transactions during acceptance, rewriting archived history, or creating release infrastructure the user did not select.

## Decisions

### 1. Use the provider's published declarations and vocabulary

The authoritative interface/DTO inventory and named method groups are in the BIS same-named [provider design](../../../../blockchain-integration-service/openspec/changes/formalize-bis-game-contracts/design.md). The main contracts are `IBis` and `IBisGame`, with `BisService` the provider implementation and `createBisGame()` the game implementation factory. Supporting shared DTOs do not expose controller interfaces or mutable services.

Remove the handwritten `declare module '@bis/integration'` mirror and package-name path substitution. Point the focused checker at the installed public package exports; cover both the host implementation and the actual account/workflow consumer boundary, adding JSDoc types or a small typed integration module where needed. Include negative contract fixtures proving that a missing method and raw `.context/.gameWallet/.lto/.ui` access fail checking. Do not merely extend the mirror or import adjacent BIS source to make checks pass.

### 2. Centralize the game-side gateway without adding a third BIS channel

`bis-account.js` loads only the package root and public stylesheet, constructs `BisService`, and retains a typed `IBis` handle. Remove the lower-level factory fallback and `getSession()` escape hatch. A missing/unloadable package shows the existing Account-unavailable UI and leaves ordinary gameplay usable; it does not trigger secret-dependent recovery or old composition.

Route `IBisGame.onBisEvent` into a private game-owned snapshot/event handler. Local game subscribers/view models are implementation details, not additional BIS communication contracts. Account, workflow views, equipment and treasure derive state from safe projections and call named `IBis` commands. The game does not own or receive BIS workflow controllers, and it does not call a context/wallet subscription method.

Preserve Account loading timeout/retry, native game-frame geometry, focus trap, fullscreen relocation, inert controls, pause reasons and passive toast presentation. Use explicit Account-close/restart notifications instead of inferring dismissal from raw `view` transitions; deduplicate stable logout identities. A host notification error must not become a financial failure.

Treat the mount target, public stylesheet and documented host styling hooks as presentation compatibility, not hidden state/event channels. Do not derive wallet/Account state from private BIS DOM or CSS classes. Coordinate any stale diagram labels at the one canonical BIS asset rather than copying the diagram into this repository.

### 3. Migrate every workflow, not just the host adapter

| Current consumer | New boundary usage | Preserved behavior |
| --- | --- | --- |
| `bis-account.js` / `main.js` | Lifecycle, snapshot/capability reads and typed event routing. | Background initialization, guest start, Account focus/pause and cleanup. |
| `pay-to-continue.js` | Begin/pay/check/end continuation by public workflow ID. | 1,000-sat price, pending guard, one confirmed revival, nearby-enemy cleanup and pause resume. |
| `level-reward.js` | Begin/refresh/collect/check/acknowledge/end reward. | Existing Level 1–3 trophy metadata, quantity, ownership checks and navigation guards. |
| Equipment/item views and gameplay effect mapping | Refresh/select/clear equipment; snapshot notifications. | Nine-item catalog, owned selections, movement/combat interpretation and actor snapshots. |
| Treasure runtime/UI | Start/query/check/claim/reject/end contract session; safe contract updates. | Existing offer amount, duration, purpose, host reference, exclusivity and eligibility rules. |
| Clear All Settings | Await typed `resetForGame` result and handle failure/retry. | Host owns game settings; BIS owns forceful local cleanup, never remote cancellation. |

Remove duplicate `isTreasureReady()` wallet logic. Use the public operation capabilities/state, including unavailable reasons. Item support stays Player-only; trophy collection action availability follows the actual existing operation rather than substituting an unrelated global gate.

Keep application ID, gameplay run ID, wallet profile/network and treasure offer-session ID separate. The existing offer-session lifetime may span level transitions; that does not authorize delivering an old gameplay effect to a new level session. Preserve financial recovery after window close and restart; state updates from BIS, not the treasure-window interval, determine pending funding progress. A closed window remains closed until a valid game interaction; a state notification is not an instruction to open it.

### 4. Make game effects concurrent-safe and session-safe

Maintain separate applied and in-flight delivery entries keyed by application/session/operation. Reserve an in-flight entry before yielding; matching duplicates wait for its result and report `already-applied` only if the original applied. Validate session/target before entry and immediately before any gameplay mutation. Async preparation may not mutate a replacement run; actual revival/presentation commits are synchronous after revalidation.

Ended/disposed runtimes return no active session. Invalidate the host generation on restart, reload/disposal and reset. Release in-flight entries after non-applicable/failed work without claiming application. Do not let a ledger cleanup authorize another financial operation.

Implement visible game-owned reward feedback using the confirmed typed asset/sats payload and the matching run, rather than returning a boolean for `LEVEL_COMPLETE` without presenting anything. Keep wallet confirmation and receipt independent: failed/inapplicable presentation never remints, pays, refunds or reverses a confirmed operation. Synthetic host-delivery tests are not live transaction evidence.

### 5. Verified BIS export/import precedes production game adoption

The provider must first pass its checks and publish the intended new BIS version through its existing Pages workflow. Pack only its integration workspace from the exact verified released commit/build. During import, use the actual game root (`blockchain-stealth-and-steel-game`), not the obsolete BabylonJS path in the local import skill; do not modify that skill as part of this change.

Inspect package metadata, runtime, stylesheet and public types before installation; record archive SHA-256, source commit, file count and per-file SHA-256 inventory as UTF-8 without BOM. Pin the single exact vendor filename in the dependency/lockfile, resolve React peer versions explicitly, reinstall from the lockfile, run the archive/installed-file verifier and contract checks, and add truthful public API change notes to `BIS_PROVENANCE.md`. Remove only superseded game-vendor archives after the retained archive is verified; preserve historical provenance and BIS-owned archives.

The import phase is package-only; its skill prohibition on modifying BIS does not replace the separate authorized provider work. No source-folder dependency, symlink, unpinned `main` dependency or npm registry publication is used. “Latest BIS” means the coordinated new verified released version at this handoff; if remote BIS advances before game publication, re-evaluate and import the authoritative newer compatible release rather than silently claim the old one is latest.

### 6. Update current documentation with as-built evidence

Update README links/release wording, both deep dives, `BIS_GAME_COMMUNICATION_EXPLORATION.md`, `PROJECT_REFACTOR_THOUGHTS.md`, `treasure-lto.md`, relevant Code Templates, provenance and browser/smoke guidance. Search the remaining current game-owned docs for promoted old names, source paths and backdoors; update affected references, not unrelated game documents or immutable archives.

Keep Section 1 Contracts and the roles table columns `BIS offers`, `Game offers`, `Current Contracts`, `Proposed Contracts`. After implementation, Current Contracts must describe the installed boundary; completed proposals are marked adopted and baseline findings remain dated historical evidence. Document any remaining gap rather than claiming all findings were automatically solved. Correct the game's JavaScript/adapter-factory description and cross-repo links. Compile canonical examples against the real package and verify local/companion links; the diagram remains the shared BIS canonical asset.

### 7. Release and acceptance are explicit gates

Align `openspec/cli.mjs` and its repository-layout test with a verified supported installed/pinned CLI version, preserving canonical IDs and commands instead of masking/skipping the known incompatibility. C088 and its permanent task IDs remain stable.

Restore the game's push-to-`main` Pages deployment at `https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/`, its single public game entry link. Reconcile C089's manual/tag-based workflow, Vite base configuration, publishing tests and current release instructions so they do not replace or compete with this publication path. Preserve compatible metadata helpers and unrelated changes; no tag, GitHub Release asset, versioned route or `latest` redirect is a prerequisite. The game deployment is independent of the BIS demo deployment and never repacks or publishes BIS itself.

The user's 2026-10-09 clarification requires BIS-first full-version lockstep: release BIS, import that exact verified package, then export/publish the game with the identical complete version. This cycle is BIS 0.0.18 → game 0.0.18, not an independently chosen game patch or a match of only patch digits. Check authoritative remote state, synchronize package/lockfile and generate the public release label from it. The production build rejects version disagreement. Add or adapt the final-build metadata/size generation hook and tests needed to satisfy `release-metadata-display`. The display remains a `vX.Y.Z` label, not a required Git tag; guest metadata fallback still works. Test the push trigger, stable base/asset URLs, one game entry link and absence of tag/manual-dispatch prerequisites in addition to the actual Pages build.

Run verifier, actual-package contract checker, full tests, publishing checks and production build. Run credential-free browser acceptance on the installed production runtime: guest play, Settings/Account open-close/retry, BIS version, Items guest state, continuation/reward unavailable paths, treasure unavailable/closed-window presentation, reset/navigation, restart/disposal and console/network errors. Use isolated browser storage and both `muteMusic=true&muteSFX=true` on every AI-created URL. Never create accounts or manufacture financial confirmation in the real UI.

Refresh existing README screenshots from the actual current UI at their existing paths. After checks pass, review scoped files, commit/push only this change, verify the exact intended commit is on remote `main`, monitor its push-triggered Pages run and test the single stable game route/game/BIS release identities. Do not introduce a second public game entry link for `latest` or versioned builds. The goal is not achieved by an accepted dispatch, a local build or an old live page.

## Risks / Trade-offs

- Existing views assume controller subscription → migrate every listed consumer and add negative boundary tests, not only host-interface tests.
- Async effect already mutates before validation → enforce guarded preparation/synchronous commit in game callbacks; test stale and concurrent paths.
- Imported source types expose compiler/SDK complexity → fix the real published type-resolution/build configuration, not an independent declaration mirror.
- Full suite exposes unrelated failures → baseline evidence identifies cause; resolve authorized verification defects, escalate unrelated changes, and keep the full-green gate incomplete until resolved.
- Concurrent repository changes → compare statuses/remote commits immediately before each mutation and stage only owned files; never blanket commit/reset.
- Pages cannot preserve immutable release URLs → preserve exact package/source provenance and make no historical-hosting guarantee.

## Migration Plan

1. Apply/verify the provider change and confirm its new BIS Pages release/export.
2. Import/verify its exact archive; migrate gateway, workflows and host effects against exported types.
3. Update as-built docs/examples, CLI compatibility and metadata generation; pass full automated and muted browser checks.
4. Commit/push scoped game changes, await Pages success and verify the deployed game consumes the intended BIS version.
5. Final cross-repository audit records both commits/versions/workflow runs, archive hash and test/runtime evidence. Deployment failure remains incomplete; rollback is a scoped forward change if authorized, never destructive checkout cleanup or wallet-state deletion.
