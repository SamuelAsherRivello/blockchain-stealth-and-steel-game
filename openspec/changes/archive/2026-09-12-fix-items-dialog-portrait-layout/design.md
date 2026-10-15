## Context

The shared menu system already accepts a game-frame element and binds its backdrop to that frame. The Start Menu uses that shared composition successfully, but Items adds a desktop-sized panel override that fights the shared frame bounds. See proposal.md for the motivation.

## Goals / Non-Goals

**Goals:**

- Reuse the shared logo-free menu composition and frame-bounded backdrop for Items.
- Make card topology depend on inventory count so a two-item inventory is not rendered as two undersized cells of a three-column board.
- Retain the card data, interaction, accessible controls, and current active-state treatment.

**Non-Goals:**

- Change wallet, ownership, equipment-effect, account, or inventory data behavior.
- Alter the approved Start Menu layout or the desktop letterbox presentation.
- Add scrolling, pagination, new explanatory text, or visual assets.

## Decisions

### Remove Items’ desktop panel overrides

Items will inherit the same compact composition width, parchment, and ribbon geometry as logo-free Start Menu dialogs. This restores the existing frame-bound responsive contract. Keeping a separate desktop board was rejected because its viewport-relative sizing conflicts with a centered 9:16 game frame.

### Use portrait-first inventory row capacity

The grid will select a column-and-row topology from its item count: a small inventory keeps large cards in a single portrait column; medium inventories add a second column; full inventories use the three-by-three capacity. Card size will be constrained by the menu content area rather than the browser viewport. A fixed three-column grid was rejected because it makes two cards unreadably small while reserving empty columns.

### Preserve shared menu ownership

`createItemsUi` continues to supply only Items content to `GameWindow`; shared menu and frame-bound code continue to own backdrop measurement, title artwork, focus, and close handling. A standalone dialog was rejected because it would duplicate the Start Menu geometry and create another responsive surface.

## Risks / Trade-offs

- [Nine cards have less space than two cards] → Use a compact three-by-three mode only at the full inventory capacity and cover it with a no-scroll regression test.
- [Long asset names can consume card space] → Retain wrapping and use grid rows that reserve separate space for art, details, and stats.
- [Game-frame dimensions change after a resize] → Continue using the shared frame-bound menu mechanism and verify both desktop and portrait renders.

## Migration Plan

1. Replace the Items-specific desktop sizing rules with portrait menu rules and inventory-count layout hooks.
2. Add focused UI tests for two-card readability topology and nine-card compact topology.
3. Run the focused UI suite, production build, and browser checks at desktop and portrait sizes.
