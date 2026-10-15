## Current contract reconciliation (2026-09-08)

Retain the approved visual style and recorded acceptance gates. Later controls hide Item and its label without reserving space; Attack/V performs fixed knife melee. Outcome menus retain the current BIS trophy/progression actions and paid revival/Restart Game flow. Historical preview and review descriptions below do not restore Item or a single Continue-only outcome. Developer settings use the five independent toggles listed in the synchronized delta, with Clear All Settings; removed preview controls stay removed.

Existing task IDs, checkbox states and historical review evidence are retained. This specification sync does not claim new implementation or verification.

## Why

The game's generic DOM controls, dialog styling, and canvas badges do not match its Tiny Swords world artwork. C061 replaces the complete in-game UI presentation with a selective, coherent use of the supplied UI assets, with visual feedback and approval before advancing through implementation milestones.

## What Changes

- Replace the presentation of loading and errors, the main/start menu, the HUD and virtual controller, settings and developer settings, win/loss menus, overhead status badges, the goal marker, and auxiliary readouts.
- Establish shared parchment panels, blue ribbon headings, asset-backed controls, readable typography, and coordinated interaction states.
- Select assets from `C:\Users\srive\Downloads\Tiny Swords (Organized)\UI`; copy only files actually used.
- Deliver in four ordered milestones:
  - **01 - Fullscreen visual previews:** send three potential finished-screen screenshots/mockups: HUD, main menu, and end-level menu. Collect user feedback and resolve the direction before runtime art work.
  - **02 - HUD:** update the in-game HUD artwork, demonstrate it in the running game, and obtain explicit user approval before milestone 03.
  - **03 - Main menu:** update the in-game main-menu artwork, demonstrate it in the running game, and obtain explicit user approval before milestone 04.
  - **04 - Finish the rest:** complete all remaining UI surfaces and full verification using the approved direction.
- Treat the existing Stealth Grid start prompt as the main menu. Use the approved Stealth & Steel logo above a Start Menu ribbon, preserve instructions and the Start action, and show no logo on other menus; this change does not introduce new navigation destinations.

## Capabilities

### New Capabilities

- `tiny-swords-ui-theme`: Complete, consistent asset-backed UI presentation, fullscreen preview deliverables, staged visual acceptance, responsive controls, and coverage of all existing UI surfaces.

### Modified Capabilities

None. Existing gameplay, input, settings, and viewport requirements remain the behavioral contracts; the new capability governs their visual presentation. Pre-existing code/spec discrepancies will be documented rather than silently expanded into behavior changes.

## Impact

- Presentation: `index.html`, `src/ui/*`, application-level controller theme overrides, and the status/diagnostic drawing sections of `src/main.js`.
- Assets: a curated project-owned directory under `public/ui/`, with a source and slice mapping for selected files.
- Integration: existing DOM overlays, canvas status indicators, viewport sizing, startup loading, and virtual-controller visual states.
- Existing OpenSpec work: coordinate with `add-start-game-prompt`, `dom-ui-corner-anchoring`, and `connect-perception-icons`; preserve their IDs and keep their unrelated tasks separate.
- Validation: relevant UI/input tests, production build, and browser screenshots at desktop and portrait sizes.
- No new UI library, renderer, gameplay mechanic, or additional menu destination is required.
