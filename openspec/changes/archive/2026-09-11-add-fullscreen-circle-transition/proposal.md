## Why

The game previously appeared all at once when loading or resetting a run. A short circular iris transition makes both moments legible while keeping the playable portrait frame, rather than the desktop gutters, as the visual focus.

## What Changes

- Add a reusable target-bound full-screen circle-transition controller that starts black, reveals through a centre circle, and reverses to black.
- Render the transition only after the initial game frame and optional Start Menu have been composed.
- Route in-place Restart Game through a closing transition, pause the outgoing run, then reveal the rebuilt initial run.
- Keep the duration at 250 ms and block input only while the transition overlay is visible.

## Capabilities

### New Capabilities

- `fullscreen-circle-transition`: A reusable, target-cropped circular blackout/reveal transition for game-run startup and restart.

### Modified Capabilities

- None.

## Impact

- `stealth-steel/index.html` and `src/runtime/ui/style.css` provide the SVG blackout layer and its visual stacking.
- `src/runtime/ui/fullscreen-transition.js`, startup preloader, and game-run orchestration own timing, target cropping, and restart sequencing.
- Focused UI tests and real-browser QA cover the circle endpoints, 250 ms timing, target-div crop, startup menu, and restart flow.
