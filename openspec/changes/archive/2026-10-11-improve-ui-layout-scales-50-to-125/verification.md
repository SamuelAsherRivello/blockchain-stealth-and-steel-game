# C087 verification — 2026-10-11

All four tasks are complete. The Start Menu uses calibrated, hardcoded
frame-relative values scoped to its existing modifier classes. Settings,
Items, Treasure and outcome menu geometry retain their shared rules.

## Baseline and reconciliation

The checked-in runner could not start because it imported a missing
`chrome-webgpu.mjs` and defaulted to an obsolete URL. It now uses the existing
Windows Edge browser options and shared preview on port 5175. Output is under
repository-root `output/screenshots/improve-ui-layout-scales-50-to-125/`.

Before the CSS change, the repaired runner recorded a physical composition
width of 240px at 50% versus approximately 528px at 110%. Its historical
110% constants also failed current composition height. Those constants predate
C084's shared centered header and the current full-size Start/Items actions;
they additionally encoded different 125% geometry despite C087's uniform
110% spec contract. Coordinator confirmed preserving the surviving C087
contract plus newer header/actions/artwork.

The final contract retains the historical approved 110% logo and panel
position/width anchors. Actions remain centered with current full-size hit
areas, and paper grows around both actions. The header is centered over the
panel. Current complete geometry at 110% is the reference for every supplied
zoom factor, including 125%; no low-zoom failure is encoded as accepted.

## Browser evidence

`node stealth-steel/src/test/browser/check-start-menu-zoom-layout.mjs`
passes at 50%, 75%, 80%, 90%, 110% and 125% zoom-equivalent desktop viewports.
Each context supplies both `muteMusic=true` and `muteSFX=true`; these fixture
cases emulate CSS viewport/DPR consequences and do not operate browser zoom.
The actual Start Menu implementation has both actions enabled in the fixture.

- All composition, logo, header, panel, paper and action frame-relative
  measurements match 110% within 0.002; physical geometry matches within 3px.
- Physical composition width is approximately 527.9px at every supplied level.
- Complete Start/Items bounds fit the parchment, its bottom remains below
  Items, and action hit areas are at least 44 CSS pixels in these desktop cases.
- Items invokes its callback once without starting; Start invokes its callback
  once and removes the menu. Accessible names and decorative icon separation
  are preserved. No page errors occur.
- 110% and 125% captures were visually inspected: centered logo/header/actions,
  legible copy, undistorted existing artwork and enclosed final action.

The production game also passes the C083 native-browser-zoom runner after this
CSS change: actual browser tab zoom at 50%, 100% and 125%, rendered world artwork,
DPR-only backing changes, pointer mapping, wheel limits/modifiers, Settings and
guest Account bounds. No wallet operations are involved. The production guest
menu has Start only; two-action coverage comes from the explicit fixture.

## Automated gates

- Full `npm test`: 1139/1139 pass, including existing Start, Items and themed UI
  source/behavior tests. No existing source-contract expectations needed changes.
- `npm run build`: pass; existing chunk-size advisory remains. Metadata reports
  game 0.0.21 and BIS 0.0.21, not a new release.
- Strict main specs and C087 validation: pass.
- `git diff --check`: pass.

Logs, baseline measurements and captures remain ignored under `output/`.
Pre-existing title translation, player/equipment and old vendor edits remain
outside this scoped change. No world, DPR, account or gameplay behavior changed.
