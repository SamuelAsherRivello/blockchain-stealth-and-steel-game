## Why

The existing Tiny Swords menu surfaces share artwork but still vary in placement, spacing, typography, and control geometry. The reviewed layouts identify repeatable rules that will make every menu feel like one system while preserving its existing actions and accessibility.

## What Changes

- Remove lightning-bolt imagery from game-owned toast messaging; retain payment semantics and existing action-button labels.
- Establish a shared, responsive vertical composition reference: the first menu element (the start logo when present; otherwise the ribbon) begins 15 CSS pixels below the reserved toast-bottom line, whether a toast is visible or not.
- Make ordinary menu body copy use one shared style selector across start, treasure, loss, and completion prompts; controls retain their own control-oriented styles.
- Standardize menu internals: 20px heading-content indents, 30-percent subtitle/form spacing, a shared body-text contract, ribbon titles that fit the visible artwork, reduced action-button gaps, and a shared lower safe-edge action placement. Map-order sub-buttons remain excluded from the regular action-button gap rule.
- Replace the short-viewport scrolling menu body with a responsive compact layout that never exposes a menu scrollbar.
- Correct the responsive close-control geometry so the visual X moves left by one icon width while its 44px-or-larger hit target stays reliably clickable at all supported frame scales.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `tiny-swords-ui-theme`: Define the shared menu layout, text, toast, action-spacing, and responsive close-control requirements for the existing themed menu system.

## Impact

- Affects the shared menu factory and game-window composition, Tiny Swords menu CSS, toast/message call sites, and focused UI tests.
- Covers the start menu, treasure menu, loss and level-complete outcomes, settings/developer windows, and their shared body copy, form rhythm, and action buttons.
- Does not add dependencies or alter gameplay, payments, settings persistence, or menu actions.
