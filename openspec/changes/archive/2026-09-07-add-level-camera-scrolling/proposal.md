## Why

The runtime currently uses the visible 9-by-16 grid as its world size. C064 lets individual levels extend beyond that view while preserving fixed-mode framing for maps that do not opt in.

## What Changes

- Add per-map fixed/follow-player camera mode, defaulting to fixed.
- Follow the player through a shared centered 3-column by 4-row dead zone with 0.15-second exponential damping.
- Confine scrolling to the map interior, excluding one outer tile on every side; reject interiors smaller than the viewport.
- Separate world bounds from projection dimensions throughout gameplay, rendering, diagnostics, input, and DOM world markers.
- Use the user-authored wider Level 1 as the scrolling example, with no demo-map override.

## Capabilities

### New Capabilities
- `level-camera-scrolling`: Per-level camera selection, damping, initialization, bounds, and validation.

### Modified Capabilities
- `unified-viewport-world`: Shared camera projection independent of gameplay dimensions.
- `tiled-level-authoring`: Follow-mode initial framing may center on the player instead of the declared origin.

## Impact

Tiled normalization, camera controller, runtime assembly, navigation bounds, depth sorting, world overlays, selection, and tests. No new dependencies. Level 1 opts into scrolling; its user-authored artwork is preserved.
