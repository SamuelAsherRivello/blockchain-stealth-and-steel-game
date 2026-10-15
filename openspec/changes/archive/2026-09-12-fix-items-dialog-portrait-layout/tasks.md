## 1. Restore frame-bounded Items presentation

- [x] C078-T001 Remove the Items-specific desktop panel sizing so Items inherits the logo-free shared menu composition and frame bounds; verify a focused UI test asserts that no Items override uses browser-wide dimensions.
- [x] C078-T002 Retain the shared ribbon, parchment, close control, focus return, exact instruction, and equipment callbacks while mounting Items within the game frame; verify existing Items and menu-window tests pass.

## 2. Make card density portrait-first

- [x] C078-T003 Add inventory-count layout hooks that use a large one-column treatment for two owned items, compact columns only as inventory size requires, and square cards throughout; verify focused two-item and nine-item UI tests assert their expected topologies.
- [x] C078-T004 Style item art, name, sats price, stats, and selected treatment against the Start Menu-sized parchment panel; verify card content has no wrapping overlap in the two-item browser fixture and selected state remains visually distinct.

## 3. Verify responsive presentation

- [x] C078-T005 Run the Items, Start Menu, Settings, and shared window tests plus `npm run build`; verify all pass.
- [x] C078-T006 Inspect desktop and portrait browser renders with two and nine owned items; verify every Items dialog bound stays inside the portrait game frame, all nine cards fit without scrollbars, and no desktop gutter is covered.
