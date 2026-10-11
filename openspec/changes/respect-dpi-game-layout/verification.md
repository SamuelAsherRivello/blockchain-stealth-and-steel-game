# C083 browser acceptance — 2026-10-11

C083-T006 remains incomplete. The repaired shared game preview starts in a
fresh guest Edge context with both mute parameters and no browser/network
errors, but the zoom-equivalent layout measurements fail proportionality.

## Method and evidence

Used the same loaded page at
`http://127.0.0.1:5175/blockchain-stealth-and-steel-game/?muteMusic=true&muteSFX=true`.
CDP desktop metrics changed from 1440×900 at DPR 1 to 2880×1800 at DPR 0.5.
This emulates the CSS viewport/DPR consequences of 100% to 50% desktop zoom;
it does not operate the browser's native zoom menu. Captures use CDP directly
so Playwright screenshot viewport restoration cannot change the measured state.

Measurements, isolated diagnostic script, and captures are under
`output/screenshots/respect-dpi-game-layout/`. This ignored evidence contains
no account or wallet state.

| Element | Physical width at 100% | Physical width at 50% emulation |
| --- | ---: | ---: |
| Game frame and render canvas | 506.25 | 506.25 |
| Menu | 462.25 | 240 |
| Parchment | 416.03 | 216 |
| Start action | 274 | 137 |
| Settings control | 56.23 | 32 |
| Joystick | 124.80 | 71 |
| Action control | 84.38 | 48 |

The world frame remains aligned, but menu/control widths shrink independently
by approximately 43–50%. This does not satisfy the C083 proportionality
acceptance contract. Do not mark C083-T006 complete or archive C083 from these
results. Follow-up should coordinate the menu overlap with C087 and separately
cover HUD/control geometry, then confirm native browser zoom where available.

Five focused viewport/world tests pass. Both active planning changes pass
strict OpenSpec validation. No application source, dependency version,
server lifecycle, account, or wallet changes were made for this check.
