# Proposal

## Why

The shared menu factory has the right semantic regions, but the usable parchment area is currently distributed across panel padding, minimum heights, and menu-specific exceptions. That makes body copy and action stacks drift between Start, Items, Developer, Treasure, loss, and completion menus, especially at the user's 100% browser zoom on a high-scale display.

## What Changes

- Establish the visible parchment below the blue ribbon as the shared menu content region.
- Give every menu content stack the same four-sided safe inset within that region.
- Make the body parent fill the remaining usable vertical space while the buttons parent uses only its rendered controls, its regular action gaps, and its own top/bottom spacing.
- Keep supported desktop and narrow portrait menu compositions free of menu or backdrop scrolling.
- Apply the shared structure to Start, Items, Settings, Developer, Treasure Chest, loss, and completion menus without changing their copy, actions, game behavior, or header/logo rules.
- Keep the three temporary, non-layout-affecting debug overlays available to verify the content stack, body parent, and buttons parent during review.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `tiny-swords-ui-theme`: Define a consistent parchment content rectangle and flex allocation for all themed menu body and action regions.

## Impact

- Shared menu DOM composition and Tiny Swords menu CSS.
- Menu callers for Start, Items, Settings, Developer, Treasure Chest, loss, and completion will inherit the layout contract without behavioral changes.
- Existing menu UI tests and Playwright visual checks will need coverage for desktop and portrait compositions, including the temporary overlay bounds.
