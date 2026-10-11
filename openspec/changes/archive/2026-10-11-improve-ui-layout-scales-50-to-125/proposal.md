# Proposal

## Why

The portrait world frame remains visually stable when Chrome page zoom changes, but the Start Menu combines frame-relative measurements with fixed CSS-pixel limits. At 50%, 75%, 80%, and 90% zoom that makes the menu disproportionately small or clips its second action; 110% is the approved reference and 125% remains acceptable.

## What Changes

- Add a browser UI-layout contract that measures the complete Start Menu against its game frame across the supplied 50% through 125% zoom-equivalent viewport range.
- Make the Start Menu's logo, ribbon, parchment, copy, and actions use one frame-relative layout scale, calibrated to the approved 110% composition.
- Ensure the parchment art encloses every visible Start Menu action with intentional lower breathing room at every supported zoom level.
- Preserve Start and Items behavior, accessible names, and existing Tiny Swords artwork.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `tiny-swords-ui-theme`: The Start Menu must retain its approved composition and complete, usable actions across the supported browser-zoom range.

## Impact

- `stealth-steel/src/runtime/ui/tiny-swords-menu.css` and a Start Menu-specific layout hook.
- A minimal browser fixture and Playwright layout regression test under `stealth-steel/src/test/browser/`.
- Focused UI tests, the project test suite, and the production build; no runtime dependency or gameplay API changes.
