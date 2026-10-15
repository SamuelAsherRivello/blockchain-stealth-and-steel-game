# C083 verification — 2026-10-11

All seven tasks are complete against the actual production game entry. The
initial audit exposed unchecked implementation claims, shrinking UI at 50%
zoom, and backing-pixel world projection. Those failures were repaired before
this final verification; the earlier failure report is superseded.

## Delivered behavior

- Production DPR is capped at 2. Diagnostic backing uses the same policy;
  engine defaults in separate diagnostic examples are unchanged.
- The shared UI root uses logical reference dimensions and one frame transform.
  Menu bounds and font fitting use that coordinate space. Body-mounted Account
  keeps physical frame bounds. Compact menu rules use the logical container.
- Camera layers read the actual backing scale through the public sprite view,
  retaining logical world coordinates, offsets, and pointer conversion while
  Babylon Lite projects against physical render-target dimensions.
- Resolution media queries re-arm after DPR changes. Existing resize,
  orientation, fullscreen and visual-viewport subscriptions remain active.
- Plain wheel over the game frame changes only the centered UI from 50% to
  150% in 10% steps. Ctrl/Meta/Alt wheel remains unconsumed.

## Live browser acceptance

Runner: `stealth-steel/src/test/browser/check-dpi-layout.mjs`.
URL: `http://127.0.0.1:5175/blockchain-stealth-and-steel-game/?muteMusic=true&muteSFX=true`.
Fresh temporary Edge profile, headless WebGPU, no wallet operations. A local
extension calls the browser's native tab zoom API; this is actual browser zoom,
not merely a viewport-size simulation. CDP captures avoid Playwright screenshot
viewport restoration. All tested native states use the same loaded page.

| Native zoom | DPR | CSS viewport | Physical frame | Physical menu width | Physical Start width |
| --- | ---: | --- | --- | ---: | ---: |
| 100% | 1 | 1440x900 | 506.25x900 | 421.875 | 240.82 |
| 50% | 0.5 | 2880x1800 | 506.25x900 | 421.875 | 240.82 |
| 125% | 1.25 | 1152x720 | 506.25x900 | 421.875 | 240.82 |

Frame, UI, parchment, Start, Settings gear, joystick, attack control and version
all preserve physical dimensions within one pixel and remain inside the frame.
Start remains inside parchment. Frame-center input maps to logical (288,512).
Settings opens/closes in every native state. Guest Account opens and fits its
physical frame after resetting zoom. No page errors or failed HTTP responses.

The runner also samples actual canvas artwork in logical coordinates, preventing
a false pass from correctly sized rectangles with incorrectly scaled sprites.
Mean RGB error versus the paused baseline is 6.03/255 at DPR 0.5 and 0.18/255
at native 125%, below the 15/255 rasterization tolerance. Blank artwork is rejected.
DPR-only checks at 3, 0.5 and 1 retain identical CSS geometry while backing
buffers cap at 2. CDP does not reliably emit resolution media events, so these
DPR-only cases explicitly supply a resize signal; native zoom exercises real
browser events. Wheel limits, centering, unchanged world buffers and modifier
pass-through all pass.

Evidence: ignored `output/screenshots/respect-dpi-game-layout/acceptance.json`
and `native-100.png`, `native-50.png`, `native-125.png`. Logs are under
`output/reports/respect-dpi-game-layout/`. Profiles are isolated test profiles.

## Automated gates

- `npm test`: 1139/1139 pass, including camera projection, viewport/DPR, safe-area,
  menu, pointer and body-mounted overlay regressions.
- `npm run build`: pass; existing large-chunk advisory remains. Metadata reports
  game 0.0.21 / BIS 0.0.21; no release is claimed by this verification.
- Strict main-spec and C083 validation: pass.
- `git diff --check`: pass.

The full suite also required repairing three current documentation links to the
already archived C088 directory; only those link targets changed. Pre-existing
equipment/player, title translation and old vendor archive edits are excluded
from this change. Another owner's account lifecycle browser runner is preserved.
