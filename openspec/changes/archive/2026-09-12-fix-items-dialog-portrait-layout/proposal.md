## Why

The Items dialog currently overrides the shared portrait menu geometry with a desktop-sized board. On a normal Windows browser it can extend beyond the playable frame and leaves item cards either clipped or too small to read.

## What Changes

- Rework the Items dialog as a compact, portrait-frame menu that follows the accepted Start Menu width, safe margins, ribbon placement, and parchment presentation.
- Present the owned inventory as a centered, responsive square-card grid that uses the available portrait panel without overflowing it.
- Preserve the exact activation instruction, existing item details, selection behavior, and the visible selected state.

## Capabilities

### New Capabilities

- `item-equipment-selection`: Provides a playable-player Items dialog with readable, selectable equipment cards inside the shared game menu presentation.

### Modified Capabilities

- `responsive-game-viewport`: Requires the Items dialog to remain completely inside the frame-bounded visible UI safe area at desktop and portrait sizes.

## Impact

- Affects the Items UI renderer, shared menu-window framing, and Items-specific CSS.
- Adds UI regression coverage for portrait sizing and compact inventory layouts.
- Does not change item ownership, equipment effects, sign-in rules, or external services.
