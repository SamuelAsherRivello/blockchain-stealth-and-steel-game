# Proposal

## Why

Game menus appear and disappear immediately, which makes transitions between the Start, settings, treasure, loss, and completion views feel abrupt. C093 will give every game menu the same brief opacity-and-size motion already used by BIS views while preserving accessibility and menu actions.

## What Changes

- Add shared enter and exit lifecycle behavior to game menus.
- Keep a closing menu mounted and non-interactive until its exit animation finishes.
- Honor reduced-motion preferences by showing and hiding menus without animation.
- Verify menu opening and closing in a managed browser.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tiny-swords-ui-theme`: The shared themed menu presentation gains accessible enter and exit transitions for every game menu.

## Impact

- Affects the shared menu factory, game-window lifecycle, start prompt, and outcome menu visibility handling.
- Adds focused UI tests and browser validation.
- Does not change gameplay, menu content, storage, wallet behavior, or dependencies.
