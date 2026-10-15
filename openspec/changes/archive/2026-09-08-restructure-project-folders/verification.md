# C062 verification

## Baseline

- User completed the main pull; verified checkout `d2a5946` on local `master`.
- The pulled lockfile installed successfully. Before relocation: 802 tests passed, 0 failed (`output/c062-main-baseline.log`).
- The earlier 795-test result preceded the pull and is not the migration baseline.

## Migration integrity

- Moved 779 files using a validated manifest; every destination was verified byte-for-byte immediately after its move.
- Final checks confirmed 108 binary/other files, all 260 archived OpenSpec files, and all 6 unrelated C061 files remained byte-for-byte unchanged.
- All 17 Tiled documents preserve their non-path data; only 21 path strings changed.
- Active maps and every current tileset resolve their image/tileset references inside the public asset tree. All public PNG/SVG/Aseprite files reside under images; archer is under enemies; source files sit beside their PNG exports.
- All 15 local README links resolve. Canonical OpenSpec metadata and existing change/task identities were retained.
- GitHub reports `main` as its default branch; Pages now triggers on main while building from the root and uploading root `dist/`.

## Final automated checks

- `npm ci`: passed using the relocated vendor path; dependency versions and integrity values unchanged (`output/c062-install-relocated.log`).
- `npm test`: 805 passed, 0 failed, 0 skipped (`output/c062-tests.log`). Includes three new layout/reference checks.
- `npm run test:publish`: 7 passed, 0 failed (`output/c062-publish-tests.log`).
- `npm run build`: passed (`output/c062-build.log`). Vite reports the existing large BIS integration chunk; this migration does not split or change that package.
- `npm run openspec -- validate restructure-project-folders --strict`: passed.
- Hidden OpenSpec adapter: list/status/apply instructions passed in the actual repository. A separate fixture passed create, list, status, apply instructions, strict validation, and archive, without creating an `openspec/` folder or link (`output/c062-cli-lifecycle.log`). Globally installed OpenSpec files were not edited.

## Browser verification

- Started Vite at `http://127.0.0.1:5173/` with localhost binding.
- Confirmed preloader completion, Start prompt, rendered terrain/characters/gold, Settings, guest Account screen, Back to Settings, and return to the game in the real browser.
- Left the game and Vite running for the user's manual check.

## Existing limitation and review gate

`Level01.tmj.bak.tmj` already referenced the missing retired `TinySwordsTerrain.tsj` before migration. That historical editor backup is preserved unchanged and excluded from the active-map reference check; the current maps and palettes pass.

As requested, Aseprite authoring files are under public and can be served/copied by Vite. The goblin source remains Git-ignored; Git-ignore does not exclude it from a local build.

The user reviewed the running Vite version and explicitly approved committing and pushing this migration to `main`. All checks above completed before that approval. C061 remains unrelated local work and is excluded from the migration commit.
