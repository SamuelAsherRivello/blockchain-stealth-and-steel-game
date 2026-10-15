## 1. Exterior art and stage composition

- [x] 1.1 C075-T001 Create the dedicated, text-free forest-gate exterior
  asset set from the approved visual direction, and verify it contains no game
  screenshot pixels, controls, or readable text.
- [x] 1.2 C075-T002 Add an aria-hidden, non-interactive exterior presentation
  behind the existing stage game frame, and verify the game frame remains the
  centered full-height 9:16 element.
- [x] 1.3 C075-T003 Style the desktop gutters with subdued forest depth,
  mossy outer accents, and dynamically frame-adjacent weathered rails, and
  verify no decorative band appears above or below the game window.

## 2. Responsive and interaction preservation

- [x] 2.1 C075-T004 Gate the exterior presentation to hover-capable,
  fine-pointer desktop environments and verify it is absent on a touch-first
  portrait mobile viewport.
- [x] 2.2 C075-T005 Preserve canvas/debug-canvas, UI safe-area, and input
  ownership while the exterior layer is present, and verify gutter clicks do
  not issue gameplay/UI actions or receive focus.
- [x] 2.3 C075-T006 Extend responsive-layout coverage for the external,
  non-interactive desktop layer and unchanged frame geometry, and verify the
  targeted Node test suite passes.

## 3. Browser validation

- [x] 3.1 C075-T007 Run the game in a wide Windows browser at 80%, 100%, and
  125% zoom; verify centered 9:16 gameplay, aligned rails, low-contrast
  gutters, and normal menu/HUD/diagnostic layering.
- [x] 3.2 C075-T008 Verify a portrait mobile viewport across resize and
  orientation changes; confirm the current world crop, safe-area UI, and
  touch controls remain unchanged with no exterior art exposed.
