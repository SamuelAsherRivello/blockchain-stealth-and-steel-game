## Why

The centered portrait game is intentionally preserved on wide Windows
browsers, but its empty side gutters currently read as unused black space.
C075 turns those gutters into a quiet, deliberate forest-gate presentation
without changing the playable 9:16 world or the established mobile view.

## What Changes

- Add a desktop-only, non-interactive letterbox presentation behind the
  centered game frame: dim forest atmosphere, mossy ruins, and narrow
  weathered steel-and-stone vertical rails inspired by the approved sketch.
- Keep the 9:16 game frame, Babylon/debug canvases, DOM UI safe area,
  game input, and logical/world coordinates unchanged.
- Keep narrow and touch-first mobile presentation free of the decorative
  exterior treatment; the current portrait crop and controls remain intact.
- Add automated viewport-contract coverage and real-browser visual checks for
  desktop gutters, resizing, zoom, and mobile absence.

## Capabilities

### New Capabilities

- `desktop-letterbox-presentation`: Presents thematic, desktop-only side
  gutters around the existing game frame without becoming game content.

### Modified Capabilities

- `responsive-game-viewport`: Distinguish intentional desktop exterior art
  from page-background letterboxing while preserving mobile world coverage,
  crop behavior, and the frame-bounded UI safe area.

## Impact

The change affects the outer stage structure and presentation CSS in
`stealth-steel/index.html` and `stealth-steel/src/runtime/ui/style.css`, plus
purpose-built decorative image assets and responsive-layout tests. It adds no
dependencies and does not modify Babylon world rendering, viewport
measurement, input conversion, UI-safe-area computation, or mobile controls.
The selected generated forest-gate mockup is a visual reference only, not a
production asset or a replacement for any central-game pixels.
