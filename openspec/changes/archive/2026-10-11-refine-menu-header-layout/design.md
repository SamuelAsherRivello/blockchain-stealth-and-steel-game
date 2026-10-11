# Design

## Context

See proposal.md - Why. The shared menu factory already creates a `game-window-header`, title element, close button, and ribbon artwork, but the title currently carries both title-fitting behavior and header-grid positioning. The existing Tiny Swords UI specification also requires readable responsive titles and usable close targets.

## Goals / Non-Goals

**Goals:**

- Make the header DOM communicate its two visual roles explicitly: title text and close button.
- Establish one alignment model that remains stable as the game frame scales or the title length changes.
- Preserve the existing accessible dialog naming, focus restoration, close hit area, and ribbon artwork.
- Keep the change shared so Settings and Developer cannot drift into separate header treatments.

**Non-Goals:**

- Redesign the parchment, ribbon artwork, title typography, menu body, buttons, or settings controls.
- Change modal opening, nesting, backdrop dismissal, persistence, or gameplay behavior.
- Add viewport-specific sizing formulas or a new dependency.

## Decisions

### Use explicit header roles

The shared menu composition will expose a header container with a title-text child and a header-button child. Existing returned `header`, `title`, and close-button references remain available so callers do not need a new public lifecycle API. This is preferred over styling the title and button through positional child selectors because the roles remain clear if the composition evolves.

### Center within a safe title region

The title text will be centered in the visible ribbon region after accounting for the ribbon endcaps and the close-button zone. The close button will occupy the right header column with its full hit target. This is preferred over centering across the entire header because long titles could overlap the X, and preferred over centering only in the leftover grid column because short titles appear visually displaced.

### Keep artwork independent from interaction geometry

Ribbon artwork remains decorative and pointer-inert. The close artwork is rendered inside the button's existing hit target, so visual centering can be adjusted without shrinking or moving the accessible interaction area.

### Verify structure and geometry separately

Tests will assert the header role structure and class hooks, while CSS-focused tests assert the shared grid/alignment rules and 44px close target. Existing title-fitting and close-control tests remain authoritative for responsive behavior.

## Risks / Trade-offs

- [A title may be wider than the safe title region] -> Retain one-line fitting and reduce the title before it reaches the reserved close zone.
- [Changing shared selectors could affect non-closable ribbon titles] -> Scope the new header rules to the explicit closable-header roles and preserve the existing standalone title path.
- [Existing focused tests may encode the prior child structure] -> Update only tests whose assertions describe the intentionally changed header contract; retain behavioral and accessibility assertions.

## Migration Plan

1. Add the shared header-role structure and CSS contract in the menu presentation layer.
2. Update focused menu tests for Settings/Developer-equivalent closable windows and responsive close geometry.
3. Run focused UI tests, the project test suite, and build; then visually inspect Settings and Developer in the running game.
4. Roll back by reverting only the C084 shared header changes; no persisted data or runtime state migration is required.
