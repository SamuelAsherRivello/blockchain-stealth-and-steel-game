# Milestone 03 - implemented Start Menu

## Approved reusable menu

User approved the latest presentation ("That looks good") and requested
generalization. C061-T016 is complete. `ui/menu.js` now exports:

- `createMenu({ titleText, bodyText, buttons, logo, titleId, documentRef })`:
  builds an accessible dialog with the shared ribbon, parchment, text and
  actions. `logo` defaults to null. Caller owns mounting, visibility,
  focus and event handlers, preserving each menu's existing lifecycle.
- `createMenuButton({ displayText, className, documentRef })`: returns a
  native blue menu button with caller-provided display text.

Start Menu supplies the only logo. Start and win/loss prompts use the
shared menu; Start, Continue, Account, Developer Settings, Open GitHub and
Reset use the shared button. Icon-only close controls and the external
Account application's own interface retain their separate roles.

The existing Start Menu title and full body wording are unchanged.
Shared styling preserves all approved spacing, sizes, text positions,
non-selectable text and artwork states. Menus without a logo center their
panel without reserving logo space. Dialog titles/body IDs remain unique.

Verification: 65 UI/controller tests pass; production build passes.
Five-size browser fit check passes. Browser checks confirm Start, settings
navigation, Reset, and Continue returning to Start; only Start has a logo.
Evidence: output/c061-reusable-tests.log, output/c061-reusable-build.log,
output/playwright/c061-reusable-menu-qa.js, c061-reusable-start.png and
c061-reusable-outcome.png. Later entries below record earlier revisions.

Start action text now uses explicit grid centering with a small optical
adjustment for the blue artwork's lower rim, at normal and compact sizes.

Latest heading revision: Start Menu text moves up 5px within its existing
heading box. Blue ribbon artwork renders at 80% height, centered vertically
within that box; its width and the surrounding layout remain unchanged.

Latest parchment revision: halve the rendered outer slices again, from
32px to 16px for left/right widths and top/bottom heights. The source PNG,
panel bounds, contents, button slices, and logo/banner positions stay intact.

Latest composition revision follows the user's second reference image:
the logo begins near 10% of viewport height, with the full menu group
raised and the logo layered in front of the banner. The logo-to-panel gap
is 12px (8px in short windows), producing a slight 16px (14px compact)
overlap with the ribbon bounds. Artwork sizes remain unchanged.

## Short desktop viewport correction

The user's 100% browser-scale screenshot exposed fixed 480px menu width
and excessive height in a shorter window. Reproduced at 1138x590: the
menu extended beyond the 332px game area and required 70px of scrolling.
Composition width now follows the visible UI container. Compact styling
uses container width, plus reduced logo, gaps, padding, banner and button
height below 650px viewport height. Text stays readable and Start retains
a 56px minimum hit height in that layout.

The same executable browser check failed before the fix and passes after
at 1138x590, 1280x720, 1024x500, 320x740 and 576x1024, with no overflow
or scrollbar and the ribbon within the game area. Test command:
`npx.cmd --yes --package @playwright/cli playwright-cli -s=c061 run-code --filename=output/playwright/c061-start-menu-fit-qa.js`.
Evidence: output/playwright/c061-start-fit-1138x590.png and corresponding
captures for each tested viewport. Main-menu approval remains pending.

Implemented 2026-09-07 after explicit approval of the final HUD.
HUD and feature-spec sync were committed first as fe7354b.

The Start Menu now uses the approved Stealth & Steel logo above the blue
Start Menu ribbon. Instructions remain "Use bushes to hide. Reach the flag
to win. Collect gold for fun." The action remains Start, without a body
icon. The new art primitives are opt-in; other menus retain their prior
presentation and contain no logo.

## Asset mapping

All files are deployed under stealth-steel/public/ui/tiny-swords/.
RegularPaper.png and BigBlueButton_Regular.png are 320x320 source sheets.
Their nine 64x64 tiles begin at x/y 0, 128, and 256; the intervening 64px
gutters are excluded. CSS grid renders the corners and edges at 32px,
half the initial draft size. Ribbon_Blue_3Slides.png is 192x64, divided
into three adjacent 64px pieces, displayed in an 82px heading with top -28px.
The logo is the approved 1466x1073 alpha cutout from the preview assets,
displayed at up to 272px wide with preserved aspect ratio.
No source images were altered. Button hover/down tint the regular art.

## Verification

- Production build passes (existing large integration-bundle warning).
- Seven focused Start Menu/controller tests pass.
- Wider UI/controller suite: 60 pass, one fails in the existing settings
  source assertion at settings-ui.test.js:202. It expects drawGridLines()
  while concurrent camera changes use drawGridLines(offset). No menu
  implementation or input behavior causes this assertion mismatch.
- Browser: 576x1024, 1280x900, and 320x740 compositions fit within the viewport.
- Start receives initial focus, the paused player remains still during
  ArrowRight input, Enter activates Start and resumes gameplay, and the
  development skipIntro query suppresses the prompt. No page errors.
- Prior backdrop-click dismissal remains unchanged, including its existing
  pause behavior. The older main start-prompt spec also has stale body text;
  those pre-existing discrepancies remain separately owned as recorded in
  preview-review.md.

Screenshots: output/playwright/c061-start-menu-portrait.png,
output/playwright/c061-start-menu-desktop.png, and
output/playwright/c061-start-menu-narrow.png.
Browser script: output/playwright/c061-start-menu-qa.js.
Test/build logs: output/c061-start-focused-tests.log,
output/c061-start-tests.log, and output/c061-start-build.log.

Live review: http://127.0.0.1:5173/ (without skipIntro).
Implemented Start Menu approval remains pending at C061-T016.
