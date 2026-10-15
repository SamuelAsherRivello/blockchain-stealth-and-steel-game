# Milestone 02 - implemented HUD

Version text font size reduced to 80%, from 12px to 9.6px.

Latest label adjustment: Move (Keys), Item (C), and Attack (V) moved down
20px only. At 576x1024 their top changes from y975 to y995; Move remains
at y847. No controller artwork or margin positions changed.

## Latest gear and Item refinements

The gear no longer adds the old blue outline on pointer hover. Hover tints
the up artwork; down uses that same artwork and size with a darker tint.
Keyboard focus remains visible. The Item square is halved again, from
48x48 to 24x24 at 576x1024 (25% of the button artwork dimensions).
Browser measurements verify no image, size or transform change across
gear states and the exact square dimensions. Evidence:
`output/c061-gear-state-qa.log`, `output/playwright/c061-hud-latest.png`.

## Controller press/art revision

Latest user feedback: Move, Item and Attack now retain their regular/up
art in the pressed/down state and use only a darker tint. Removed action
scale/squash; the joystick still translates normally with movement input.
Item uses a flat white 48px square at the reference viewport. The sword is
70% of its previous size (65% to 45.5% of the action artwork width/height).
The gear's separate pressed treatment remains unchanged.

Real-browser presses verified identical image URLs, background sizes,
dimensions and transforms between up/down states for all three controls,
with only filter tint changing. Evidence:
`output/c061-controller-tint-qa.log` and
`output/playwright/c061-controller-updated.png`.

## Latest HUD revision (2026-09-07)

User feedback after the initial runtime review supersedes the original
banner/centered metadata layout described below:

- Remove the gold ribbon and coin decoration. Version sits at the upper
  left safe-area corner; live gold text is left-aligned immediately below.
- Halve the settings button artwork, retain its existing accessible hit
  area, center it vertically with the gold text, and lift its inner icon by
  5% of that icon's height. Pressed artwork uses the same reduced size.
- Move all controller labels up by their full 22px height, and translate
  the entire controller down 20px. At 576x1024, Move begins at y847 and all
  labels at y975. Retain the existing margin settings as requested.
- Move optional coordinate readouts immediately beneath the simpler gold
  line; their values and visibility behavior are unchanged.

The revised build passes. Browser evidence and checks are in
`output/c061-hud-revision-qa.log`,
`output/playwright/c061-hud-revised-portrait.png`, and
`output/playwright/c061-hud-revised-narrow.png`.
The live URL remains `http://127.0.0.1:5173/?skipIntro=true`.
HUD approval remains pending; no later milestone was implemented.

Implemented on local `main`, tracking `origin/main`, after the requested
fast-forward-only pull reported Already up to date. Base: `8de8920`.
The repository now uses `stealth-steel/` and the `openspec/` CLI adapter.

## Accepted direction

The user approved the v2 previews with one correction: **show the logo only
on Start Menu, never on other menus**. This completes C061-T006 and
authorizes milestone 02. It does not pre-approve the implemented HUD.

The screen HUD uses the approved 14px safe inset plus device safe-area
insets. World objects and their attached badges retain their world anchors.
At 576x1024, metadata and gold center at x130, gear and gold center at y67,
all three controller artwork centers are y898, and all labels begin y977.
Smaller viewports reduce artwork sizes while maintaining 44px minimum
interactive targets and the same alignments. The flag remains the approved
Tiny Swords goal artwork with improved contrast.

## Implementation and source mapping

All production paths below are relative to `stealth-steel/`.
Source UI root: `C:\Users\srive\Downloads\Tiny Swords (Organized)\UI`.
Only six selected PNGs are installed in `public/ui/tiny-swords/`.

| Source path | Native dimensions | Use and mapping |
| --- | --- | --- |
| Ribbons/Ribbon_Blue_3Slides.png | 192x64 | Gold banner. Horizontal 64px end slices with stretched middle; top/bottom slices zero. No sheet gutters. |
| Buttons/SmallBlueRoundButton_Regular.png | 128x128 | Full frame scaled uniformly for Move, puck, Item, Attack, gear and world badges. |
| Buttons/SmallBlueRoundButton_Pressed.png | 128x128 | Full frame counterpart for pointer press/capture states. |
| Icons/Icon_03.png | 64x64 | Full-frame coin alongside unchanged live gold text. |
| Icons/Icon_05.png | 64x64 | Full-frame sword for generic Attack. |
| Icons/Icon_10.png | 64x64 | Full-frame gear; native button/accessible name preserved. |

The existing `public/assets/images/terrain/resources/meat/Meat Resource.png`
and `public/assets/images/goals/Goal.png` remain shared project assets.
No menu/logo artwork is shipped early by this milestone.

- `src/runtime/ui/tiny-swords-hud.css`: scoped application overrides;
  preserves reusable controller plugin defaults and all menu presentation.
- `src/runtime/ui/settings-ui.js`: swaps only the gear's image URL.
- `src/runtime/ui/status-badge.js`: draws the selected round artwork with
  the existing symbol/flash color; readable fallback if artwork is missing.
- `src/runtime/main.js`: calls the badge renderer inside the existing
  position, jump, opacity and scale logic. No perception timing edits.
- `index.html`: loads the HUD stylesheet after the controller defaults.
- Existing gear-path test updated for the selected deployed image.

## Verification

- 75/75 focused UI, controller, perception-expression, hiding, goal and
  release-metadata tests pass. Log: `output/c061-hud-tests.log`.
- Production build passes. The pre-existing BIS integration chunk-size
  warning remains; log: `output/c061-build.log`.
- Playwright browser checks cover 576x1024, 1280x900 and 320x740, including
  exact center/baseline alignment, safe bounds and minimum target sizes.
- Real CDP touch input activates Move and Attack simultaneously; touch
  cancellation leaves zero pressed controls. Pointer-capture, lost-capture,
  multiple-pointer and blur cases are also covered by controller unit tests.
- Keyboard movement changes the live player position; C/V actions execute.
  Gear opens settings, settings pause movement, close resumes, keyboard
  focus remains visible, and the unthemed Start flow still dismisses correctly.
- In the actual running game, entering a bush renders H at player position
  (224,417); leaving to (224,287) clears it after the existing fade. The same
  renderer handles ?, i and ! with their existing flash colors.
- No page runtime errors occurred in browser QA.
- Built CSS rewrites assets to relative `../ui/tiny-swords/` URLs. The gear
  and badge loaders use Vite BASE_URL. No original source-folder dependency.

## Review evidence

Live game: `http://127.0.0.1:5173/` (Start to play).
Direct developer HUD view: `http://127.0.0.1:5173/?skipIntro=true`.

- `output/playwright/c061-hud-desktop.png`
- `output/playwright/c061-hud-portrait.png`
- `output/playwright/c061-hud-narrow.png`
- `output/playwright/c061-hud-touch.png`
- `output/playwright/c061-hud-hidden.png`
- `output/playwright/c061-start-unchanged.png`
- `output/c061-browser-qa.log` and `output/c061-badge-qa.log`

**C061-T012 is pending:** review/approval of this implemented HUD is the
next checkpoint before milestone 03 (Start Menu). The logo-only-on-Start
decision is recorded for that later implementation.
