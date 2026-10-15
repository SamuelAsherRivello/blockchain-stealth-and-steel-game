## Why

The game currently exposes some BIS-backed controls before the corresponding
capability is available, leaving users to discover disabled or non-functional
flows. The newly published BIS capability checks provide a clear boundary for
feature visibility while preserving the existing readiness and enabled-state
logic after a feature is shown.

## What Changes

- **C083** Gate the main-menu Items button on `hasItemSupport()`; when shown,
  preserve the current inventory loading and enabled/disabled behavior.
- Gate authored treasure rendering on `hasContractSupport()`; when treasure is
  rendered, preserve the existing interaction readiness and failure behavior.
- Gate trophy buttons and trophy-related text in the level-complete UI on
  `hasAssetMintingSupport()`; when shown, preserve the existing trophy flow and
  enabled/disabled state logic.
- Keep guest gameplay and non-BIS UI available without initiating wallet
  operations solely to evaluate visibility.
- Add focused unit, integration, and browser-facing coverage for true and false
  capability states.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `item-equipment-selection`: Items visibility is now controlled by
  `hasItemSupport()` before existing inventory behavior is evaluated.
- `treasure-rendering`: authored treasure is rendered only when
  `hasContractSupport()` is true, while existing interaction readiness remains
  authoritative after rendering.
- `tiny-swords-ui-theme`: trophy controls and trophy copy are rendered only
  when `hasAssetMintingSupport()` is true, while existing completion and
  collection behavior remains unchanged when visible.

## Impact

- Affects the game BIS account adapter/service capability surface, main-menu
  Items control, treasure spawner/rendering path, level-complete reward UI, and
  their tests.
- Uses the already vendored BIS public capability API; no new dependency or
  wallet operation is introduced.
- Existing feature readiness checks remain in place after visibility gating.
