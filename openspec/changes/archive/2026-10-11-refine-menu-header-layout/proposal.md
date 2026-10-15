# Proposal

## Why

Closable menus such as Settings and Developer use the shared Tiny Swords menu, but their title and close artwork do not yet read as one deliberately aligned header. The title can feel offset within the ribbon while the X is aligned by a separate grid concern, making otherwise identical menus look subtly inconsistent.

## What Changes

- Define one shared menu header contract containing explicit header text and header button regions.
- Center menu titles within the safe visible artwork region while reserving the close-button hit area.
- Keep the close button right-aligned with a stable 44px-or-larger interactive target and vertically align it with the title artwork.
- Apply the same header composition to Settings, Developer, Items, and every other closable shared menu.
- Preserve title accessibility, close labels, focus behavior, menu actions, artwork, and responsive in-frame behavior.
- Add structural and style regression coverage for the shared header roles and alignment contract.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `tiny-swords-ui-theme`: Refine the shared closable-menu header structure and title/close alignment requirements.

## Impact

- Affects the shared menu factory, game-window wrapper, Tiny Swords menu CSS, and focused UI tests.
- Covers Settings, Developer, Items, and other menus created through the shared closable-menu path.
- Does not change menu copy, controls, persistence, gameplay, dependencies, or modal dismissal semantics.
