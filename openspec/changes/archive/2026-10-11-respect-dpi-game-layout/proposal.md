# Proposal

## Why

The game preserves its logical portrait composition, but browser zoom and high-DPI display settings can change the relationship between CSS pixels, the canvas backing buffer, and DOM overlays. The supplied 100% and 50% captures show the desired invariant: the game frame, start menu, HUD, and controls remain proportional and aligned at both zoom levels.

## What Changes

- Define an explicit production device-pixel-ratio policy for the render and diagnostic canvases.
- Cap effective rendering DPR at 2, with 100% browser zoom as the baseline presentation.
- Keep gameplay coordinates and the 576x1024 reference viewport independent from physical backing-buffer pixels.
- Add default mousewheel zoom for the UI layer only, bounded from 50% to 150% and centered on the game frame; the game layer remains unchanged.
- Reconcile canvas backing dimensions, CSS frame dimensions, pointer conversion, and DOM safe-area measurements after zoom, resize, orientation, and fullscreen changes.
- Add regression coverage for DPR-aware rendering and browser-zoom layout invariants.
- Verify the live game at 100% and 50% browser zoom with the required AI audio mute query parameters.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `responsive-game-viewport`: Require the logical game frame, render/debug surfaces, pointer coordinates, and DOM UI to remain aligned and proportional across device-pixel-ratio and browser-zoom changes.

## Impact

- Production engine initialization and viewport coordination in `stealth-steel/src/runtime/main.js` and related viewport modules.
- Render/UI CSS and focused responsive or viewport tests.
- Browser smoke verification and build/test commands; no new runtime dependency is expected.
