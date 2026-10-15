## Context

See proposal.md for motivation. The root package currently launches Vite, and its tests and runtime modules use relative filesystem paths. Incoming main also contains BIS vendor archives and standalone browser smoke scripts. The current working changes colocate three tracked Aseprite sources with PNG exports and move the ignored goblin source next to its exports. Preserve those changes and the unrelated C061 planning folder.

## Goals / Non-Goals

**Goals:** Move files with verified source-to-destination mappings; retain binary data; keep npm commands and production output at the root; preserve Tiled authoring and game loading.

**Non-Goals:** Gameplay changes, dependency upgrades, publishing, commits, global configuration edits, and deleting existing OpenSpec history.

## Decisions

1. Set Vite's root to `stealth-steel` from the existing root configuration, retaining relative deployment base and BIS JSX configuration. Keep root `dist/` through an explicit output path. Keeping the root HTML would divide the application; placing it in public would bypass HTML transformation.
2. Move `src` to `stealth-steel/src/runtime`, `test` to `stealth-steel/src/test`, and test runner/smoke scripts into that test tree. Preserve runtime organization below runtime. Resolve test filesystem paths relative to each file and repository configuration paths separately.
3. Move `public` into the application; map old image categories into `assets/images`, archer into `images/enemies`, audio and levels into assets, UI artwork into images/ui, and Tiled palette icons into images/ui/spawners. Documentation screenshots stay with documentation. Rewrite Tiled relative references from their old absolute target to its mapped new location without changing level data.
4. Retain Aseprite files beside images, updating the ignored goblin filename. These authoring files now sit in public as explicitly requested and Vite can copy them into production output; Git-ignore alone does not exclude public files from a local build.
5. Move all vendor archives together and update only the local dependency paths in package and lockfile. Existing versions and package integrity values remain stable.
6. Rename the entire planning directory, preserving archives and IDs. The installed OpenSpec 1.11.0 hardcodes `openspec`; the reference template creates an ignored compatibility link. Because this user requires the standard `openspec` directory, provide a repository-scoped CLI adapter under `openspec/` and `npm run openspec -- ...`. Adapt planning path literals only for the current invocation; do not change global installation files, configuration, package names, or metadata formats. Fail clearly on unsupported CLI versions. Exercise list/status/instructions/validation and a temporary change lifecycle. Update local skills to invoke the repository entry. A root compatibility link was considered and rejected because it violates the requested folder contract.
7. Update current docs and main/active spec path examples. Preserve archived documents as historical records. Keep README section order and hidden authoring instructions.

## Risks / Trade-offs

- Relative import depth changes -> map imports against original and destination file paths; run the entire suite and bundle build.
- Tiled JSON and dynamic asset paths -> verify all local map/tileset/image references and check runtime asset catalogs.
- Aseprite sources under public -> document actual copy behavior and retain the goblin ignore rule.
- OpenSpec upstream hardcoded paths -> isolate a version-checked adapter with lifecycle coverage; keep global installation untouched.
- Local/incoming edits -> fast-forward main before moving files, reject destination collisions, and preserve unrelated changes.

## Migration Plan

1. Verify main is fast-forwarded and inspect its final files; record a baseline of tests.
2. Map and move application, media, tests, vendor, and planning files within the workspace.
3. Update root configuration, paths, local workflow guidance, and documentation.
4. Run layout/reference checks, full tests, publishing checks, production build, and OpenSpec validation.
5. Present the result and ask the user to approve and run `npm run dev` before committing. Recovery, if needed, uses explicit reverse file mappings while preserving work; no destructive Git operation is permitted.
