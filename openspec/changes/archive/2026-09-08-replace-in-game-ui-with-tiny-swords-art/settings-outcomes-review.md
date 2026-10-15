# Settings and outcome menus

The settings action and its destination heading now both read "Developer".
Close controls move a further 10% left and 5% up relative to their own size.

Checkbox artwork and checkmarks align horizontally with the slider thumb's
100% center, using a 9.2px visual offset inside the unchanged 44px hit area.

The painted slider track now spans between the thumb's endpoint centers
(12.8px inset per side), so at maximum no track protrudes beyond the thumb.
The native range retains its full-width input area and unchanged values.

Sliders now omit visible endpoint numbers and use the full available row
width. Their native minimum, maximum, step and keyboard behavior remain intact.

## Latest compact layout feedback

Applied the user's current/proposed reference: close X moves 14px up and
16px left; checkbox artwork is 22x22 inside its original 44x44 hit area;
slider thumbs shrink from 32px to 25.6px (80%). Settings top/bottom padding
is reduced to 42px/18px, control gaps to 8px, and slider label/track spacing
is tighter. Slider input hit height remains 44px. At 576x1024 the Settings
panel height decreases from 498px to 424px.

All blue action buttons use a lifecycle-managed `menu-button-label` that
measures its text and shrinks its font to available width, without wrapping.
It refits on resize, font loading, content changes and remount, and removes
its observers/listeners on disconnect. Browser verification shows Developer
Settings at 27px normally, 16.02px at 320px viewport width, then 27px again
when expanded. Every measured label remains one line and fits its content box.

68 UI/controller tests and the production build pass. Settings persistence,
all developer toggles and both Continue actions pass the browser recheck.
Evidence: output/playwright/c061-button-fit-qa.js and updated Settings captures;
output/c061-compact-settings-tests.log and c061-compact-settings-build.log.

Completed C061-T017, C061-T018 and C061-T019 on 2026-09-07 for the user's
requested Settings, death and Level Complete updates, including reusable
toggle and slider controls.

Settings and Developer Settings now use the shared parchment/ribbon menu
frame with a scrollable control body and 44px red-X close target. Only
Start Menu supplies a logo. Existing actions and labels are preserved.
The source Icon_09.png (64x64) is copied unchanged from the supplied UI/Icons
folder and displayed at 32px within the 44px close target. Sliders reuse
the approved round artwork for their thumb; tracks and toggle states use
matching blue, parchment and dark-outline colors with visible focus.

`ui/menu-controls.js` provides store-independent native controls:

- `createSliderControl({ labelText, value, min, max, step, onChange, documentRef })`
  returns `row`, `slider` and `dispose`. Range defaults are 0..100, step 1;
  input callbacks receive numbers.
- `createToggleControl({ labelText, checked, onChange, documentRef })`
  returns `row`, `checkbox` and `dispose`. Change callbacks receive booleans.

Both controls have shared class-based styles usable outside Settings.
The Music/SFX adapters bind them to the existing settings store. FullScreen
uses the same toggle and synchronizes with fullscreenchange. All current
developer toggles use it, including the Enemy AI Labels toggle added by
concurrent work (five total; the original C061 inventory listed four).

Win and loss use the same approved blue ribbon and button, with existing
Level Complete / You did great! / Continue and You Lost / Try again! /
Continue text. Outcome body accents are green and muted red respectively.
No logo or decorative body artwork is present. Existing dismissal behavior,
focus and Continue callbacks remain intact.

## Verification

- 68 UI/controller tests pass, including reusable controls with custom
  ranges, numeric/boolean callbacks and listener disposal.
- Production build passes with the existing integration chunk-size warning.
- Browser Settings captures: 576x1024, 320x740 and 1138x590; no panel overflow.
  Scrollable developer content keeps all five toggles and Reset reachable.
- Music value survives reload; original value restored after the check.
  Every developer toggle switches both ways. Closing Settings resumes play.
- FullScreen enters/exits and synchronizes the checkbox in a real browser.
- Both real outcome UI instances were displayed directly for browser checks;
  exact text, lack of logo, and keyboard Continue/reload were verified.
  Outcome screenshots cover 576x1024 and 320x740. No page errors.

Evidence: output/c061-settings-tests.log, output/c061-settings-build.log,
output/playwright/c061-settings-outcomes-qa.js and c061-fullscreen-qa.js.
Screenshots: output/playwright/c061-settings-{portrait,narrow,short}.png,
c061-developer-{portrait,narrow,short}.png, c061-death-{portrait,narrow}.png,
and c061-complete-{portrait,narrow}.png.

Live preview: http://127.0.0.1:5173/?skipIntro=true (open the gear).
Loading/error, diagnostics, remaining asset cleanup and full-feature final
QA remain separately tracked in C061-T020 through C061-T024.

## Developer refinements — 2026-09-07

Removed Crop Marks, Particle FX Preview, and Animated Tile Preview, including
their persisted setting keys, subscriptions, standalone preview layers, public
preview handle, preview-only modules/tests and crop-marker styles. Actual
gameplay particle effects and animations remain available.

Added Debug Visualizations with Coordinates, Enemy Perceptions, Enemy Tasks,
Physics Colliders, and Tile Map Info, in that order. The former combined
collider diagnostics now switch independently. Existing enemy goal/action
labels retain their persisted key and appear as Enemy Tasks.

Renamed Reset to Clear All Settings and updated the project GitHub target to
https://github.com/SamuelAsherRivello/stealth-and-steel-game.

Verification: 81 focused UI/settings/particle tests pass, including all 32
combinations of the five canvas diagnostic switches. Build passes. Live
browser toggles, reset, portrait/narrow layouts, absent preview handle/crop
markers and no page errors verified. Evidence: output/developer-tests.log,
output/developer-build.log, output/playwright/c061-debug-visualizations-qa.js,
and output/playwright/c061-debug-developer-{portrait,narrow}.png.

Latest label refinement: heading renamed Debug Draw. All reusable checkbox and slider labels use 80% of the previous font size (12.8–16px), and checkbox labels fill the available row up to the checkbox hit area. Browser verified at widths 576 and 320 with zero gap between label box and checkbox hit area.
