# Milestone 01 - preview set v1

## Current revision: v2 (2026-09-07)

The user requested another draft of all three images with the following
changes. These decisions supersede the v1 presentation choices below;
the user approved v2 with the logo restricted to Start Menu only.

- Keep the gold banner at x14/y35; center release metadata over its width.
- Establish one 14px four-edge safe rectangle for this 576x1024 draft.
  All screen UI fits within it; elements need not touch its boundary.
- Move the gear down and left: y35, right38; its center aligns with the
  gold banner center at y67.
- Align Move, Item, and Attack button centers at y898. All three text
  labels start at y977, leaving extra space below the smaller action buttons.
- Use the supplied project logo above the prompt banner. The source is
  `output/imagegen/stealth-and-steel-logo-draft.png`; its baked checkerboard
  was removed using imagegen to create the preview-only alpha cutout
  `output/playwright/c061-previews/assets/stealth-and-steel-logo-transparent.png`.
- Change the start prompt banner title from Stealth Grid to **Start Menu**;
  the game identity is the **Stealth & Steel** logo above it. Preserve
  the existing instructions and Start action.
- Reduce parchment nine-slice rendered edge/corner sizes from 64px to
  32px on all sides. Raise the 82px banner by 41px, from top13 to top-28.
- Use the same blue banner, title colors, dimensions, positioning and logo
  above both prompts. Keep Level Complete / You did great! / Continue.
- Remove the body flag and play icons from prompt actions, leaving body
  copy and text-only action labels on the themed button backgrounds.

All three revised compositions use a fresh clean world capture (world-v2),
without baked v1 UI, and are saved as `hud-v2.png`, `main-menu-v2.png`, and
`level-complete-v2.png` in `output/playwright/c061-previews/`. Each is labeled
PROPOSED VISUAL / C061 / V2. The v1 PNGs and editable `index-v1.html` remain
available. The user approved this revision with the logo only on Start Menu. C061-T006 is complete. See hud-review.md for the subsequent implementation.

Prepared 2026-09-07 after the user's request to continue and apply the UI
proposal. Preview feedback is pending. Runtime adoption has not begun.

## Review artifacts

All three PNGs are 576 by 1024 CSS pixels, captured through Playwright from
the same HTML composition and actual running-game world capture. Each image
is labeled PROPOSED VISUAL, C061, V1. These are proposed compositions, not
screenshots of an implemented runtime theme.

- `output/playwright/c061-previews/hud-v1.png`
- `output/playwright/c061-previews/main-menu-v1.png`
- `output/playwright/c061-previews/level-complete-v1.png`
- Editable preview: `output/playwright/c061-previews/index.html`
- Capture script: `output/playwright/c061-previews/capture-previews.js`
- Local preview: `http://127.0.0.1:5173/output/playwright/c061-previews/index.html?screen=hud`
  (use `screen=menu` or `screen=end` for the other compositions).

Preview artifacts are local files in the repository's ignored output folder.
The game remains available at `http://127.0.0.1:5173/` with its existing UI.

## Refreshed baseline and ownership

- C052 `add-start-game-prompt`: runtime title is Stealth Grid; instructions
  are "Use bushes to hide. Reach the flag to win. Collect gold for fun.";
  action is Start. Runtime backdrop click calls `prompt.close()`, despite
  the earlier Start-only dismissal plan. Preserve that baseline in C061.
  The developer-only `?skipIntro=true` path is available.
- `dom-ui-corner-anchoring`: its delta spec requires 25px; `src/ui/style.css`
  currently defines `--screen-margin: 20px`. C061 does not resolve this
  independent discrepancy. The preview keeps control hit boxes at a 20px
  inset; transparent asset padding is additional visual space.
- C046 `connect-perception-icons`: task status remains mixed; actual code
  maps expression instances to canvas badges and supports H. Rendering
  uses collider-derived positions plus expression offsets and jump offsets,
  with opacity/scale transitions. C061 must preserve this state and geometry.
  Preview ?, i, and ! are illustrative states placed above existing actors,
  not claims that the captured simulation had those perception states.
- The existing goal flag, gold format `Gold: 00/10`, release text
  `v0.1.8 0.0Mb`, Move (Keys), Item (C), and Attack (V) were read from the
  running game. The meat icon represents the existing held-item action.
  It does not introduce an inventory or change the action's behavior.
- Main-menu and win text are copied exactly from their UI modules. Loss
  remains You Lost / Try again! / Continue for the later milestone.
- Inventory refreshed against `src/ui/*`, `index.html`, controller plugin,
  and `src/main.js`: HUD/readouts/settings gear, virtual controller,
  world badges/goal, start/win/loss menus, settings/developer controls,
  startup/error/Retry, diagnostics and shared visual states remain in scope
  at their original milestones. No related change tasks were modified.

## Inspected source mapping

Source root: `C:\Users\srive\Downloads\Tiny Swords (Organized)\UI`.
Only selected candidates were copied into the local preview output folder;
no assets have been installed in `public/ui/` yet.

| Source relative path | Native pixels | Preview slicing and role |
| --- | --- | --- |
| Papers/RegularPaper.png | 320 x 320 | Nine 64 x 64 cells with origins at every combination of x/y 0, 128, 256. Exclude the intervening 64px gutters. Corners retain fixed dimensions; only edge/center cells extend. |
| Ribbons/Ribbon_Blue_3Slides.png | 192 x 64 | Contiguous 64 x 64 left, center, right cells at x 0, 64, 128; fixed ends, expanding middle. HUD and title. |
| Ribbons/Ribbon_Yellow_3Slides.png | 192 x 64 | Same mapping; win title accent. |
| Buttons/BigBlueButton_Regular.png | 320 x 320 | Nine cells using the paper mapping; 32px rendered corners in the main action button. |
| Buttons/BigBlueButton_Pressed.png | 320 x 320 | Candidate pressed counterpart; not used in these static images. Inspect before runtime adoption. |
| Buttons/SmallBlueRoundButton_Regular.png | 128 x 128 | Whole frame, proportionally scaled; gear, Move base/puck, actions, world badges. Transparent margins remain local to the frame. |
| Buttons/Button_Blue.png | 64 x 64 | Candidate only; not used in final v1 previews. |
| Buttons/TinyRoundBlueButton.png | 64 x 64 | Candidate only; not used in final v1 previews. |
| Icons/Icon_03.png | 64 x 64 | Whole frame, visually verified coin. |
| Icons/Icon_05.png | 64 x 64 | Whole frame, visually verified sword for generic Attack. |
| Icons/Icon_07.png | 64 x 64 | Whole frame, visually verified play triangle for Start/Continue. |
| Icons/Icon_10.png | 64 x 64 | Whole frame, visually verified gear. |

The preview also references the existing project meat-resource and goal
PNGs. No new icon sheet, font package, or UI dependency was added.
CSS assembles the inspected source frames; it does not stretch sheet gutters
or rasterize text. Labels remain real HTML text. Production asset selection
and responsive/input validation belong to milestone 02 after feedback.

## Verification and checkpoint

- Visually inspected all three complete PNGs, including lower controls.
- All three images share the same captured world and viewport dimensions.
- Verified menu wording, Item-before-Attack order, settings gear, counters,
  representative badges, and source-derived panel/button composition.
- Preview image decode checks pass. The running baseline emitted the
  existing missing `/favicon.ico` request and Windows WebGPU
  powerPreference warning; no game startup failure was observed.
- In-app browser capture clipped or incorrectly scaled portrait output;
  final deliverables use Playwright CLI CSS-pixel screenshots instead.
- No runtime code changed, so gameplay tests/build are not completion
  evidence for this visual-only milestone. They remain required in later
  implementation milestones.
- **C061-T006 remains pending:** user feedback on these specific v1 images
  is required before adopting artwork in the HUD.
