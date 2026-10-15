## Why

Game code, assets, tests, and tooling currently crowd the repository root. C062 consolidates the game under `stealth-steel/` and provides one hidden `openspec/` planning directory while keeping npm commands at the repository root.

## What Changes

- **BREAKING**: Move application files into `stealth-steel/`, with code in `src/runtime/`, automated tests and smoke tools in `src/test/`, and no separate scripts directory.
- Keep `package.json`, `package-lock.json`, `vite.config.js`, README, license, and repository tooling at the root; put the browser entry at `stealth-steel/index.html`.
- Consolidate public files into `public/assets/audio/`, `public/assets/images/`, and `public/assets/levels/`. Put archer art under `images/enemies/archer/` and editable Aseprite files beside the matching exported images.
- Move documentation, plugins, and vendor packages into `stealth-steel/`. Preserve source bytes, metadata, existing changes, and the goblin source ignore rule.
- **BREAKING**: Rename `openspec/` to `openspec/` without a second directory or compatibility link. Provide a repository CLI entry and update local skill commands if the installed CLI needs adaptation.
- Update imports, runtime URLs, Tiled references, npm scripts, dependency paths, deployment configuration, and current documentation. Preserve gameplay behavior and root-level `dist/` output.
- Run automated tests and production build, then stop for the user's approval and manual Vite check before committing.

## Capabilities

### New Capabilities
- `repository-layout`: Defines repository roots, asset organization, root npm commands, and hidden planning tooling.

### Modified Capabilities
- None. Gameplay requirements are unchanged; existing path examples will be migrated to the new locations.

## Impact

All application imports, test fixture paths, Tiled image references, publishing checks, local skills, and vendor dependency locations are affected. No new gameplay feature or dependency upgrade is requested. The user pulled main and the verified baseline is `d2a5946`; existing work is preserved. The Pages trigger follows the verified GitHub default branch, `main`. No commit or publish is authorized before the requested user review.
