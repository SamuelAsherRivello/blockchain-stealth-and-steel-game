## Context

See proposal.md for motivation. The stage centers a full-height 9:16
`.game-frame`; its Babylon and debug canvases are frame children. `#uiLayer`
is a fixed sibling whose visible bounds are calculated from the intersection
of the browser viewport and that frame. The selected forest-gate mockup is
reference-only: it includes a generated copy of the game screenshot and
therefore cannot ship as a surrounding asset.

## Goals / Non-Goals

**Goals:**

- Add the approved dark forest, mossy ruin, and steel-rail atmosphere only
  where wide desktop layouts already expose side gutters.
- Preserve the frame's CSS dimensions and measured bounding rectangle.
- Keep all gameplay, UI, canvas, diagnostic, input, and mobile code paths
  independent of the presentation layer.

**Non-Goals:**

- Extending the playable Babylon world, adding game objects, or rendering a
  second camera.
- Placing HUD, menu, status, or controls in the gutters.
- Using the generated composite screenshot as a production background.
- Changing phone, tablet touch-first, or portrait crop behavior.

## Decisions

### Isolated stage-sibling presentation

Place an `aria-hidden` decorative presentation as a stage sibling behind the
existing game frame, rather than as a canvas layer or a child of the frame.
It has no event handling and uses `pointer-events: none`.

This preserves the frame as the sole measured rectangle, avoids perturbing
canvas size or the safe-area intersection, and keeps exterior art out of the
game's clipping context. A Babylon extension was rejected because it would
couple a static browser decoration to world/camera behavior. Frame
pseudo-elements were rejected because the frame's required clipping would
hide exterior rails.

### Responsive visibility follows desktop capability and actual gutters

Enable the presentation only for hover-capable, fine-pointer environments.
It remains behind the frame, so it has no visible area if the viewport is not
wider than the 9:16 frame. Touch-first mobile keeps the current base
background and crop path.

This is more robust than a fixed width breakpoint: it follows the actual
desktop interaction capability and never creates a mobile-specific layout.
An unconditional full-viewport background was rejected because it could
appear at mobile edges during viewport changes.

### Production art is a dedicated exterior asset set

Create original, purpose-built exterior forest backdrop art without any game
screen content, text, or controls. Use it as a low-contrast stage background;
render the rails as independent decorative elements aligned to the dynamic
left and right edges of the 9:16 frame. The visual target is the approved
forest-gate sketch: desaturated forest depth, mossy ruins at the outer edges,
and weathered steel-and-stone inner rails.

Using a terrain tileset directly was rejected because its imagery is an atlas,
not a stable standalone backdrop. Using a single screenshot composite was
rejected because it would duplicate or alter the game window.

### Verification preserves the viewport contract

Extend the existing responsive layout tests to assert the new layer is
decorative, frame-external, non-interactive, and desktop-gated. Browser QA
will verify the visual at wide Windows desktop sizes and 80%, 100%, and 125%
zoom, then verify a portrait mobile viewport has no exterior treatment.

## Risks / Trade-offs

- [Generated exterior art distracts from the game] -> Keep it low contrast,
  test it against the menu and active gameplay, and revise only the exterior
  asset rather than game layers.
- [CSS stacking leaks over the canvas or DOM UI] -> Use an explicit lower
  stage layer, preserve existing frame and UI stacking, and verify opening
  menus, diagnostics, and controls.
- [Capability media queries differ across devices] -> Verify with a real
  desktop browser plus emulated and physical touch-first mobile behavior; the
  absence requirement is validated independently of desktop styling.
- [Wide or zoomed layouts reveal a rail misalignment] -> Anchor rails from
  the existing dynamic frame width and validate resize and zoom states.

## Migration Plan

1. Add the exterior asset and presentation layer behind the current frame.
2. Verify desktop and mobile viewport behavior before release.
3. Roll back by removing the isolated presentation markup, styles, and
   exterior assets; game rendering and UI require no migration.
