# Design

## Context

See [proposal.md](proposal.md) for the motivation. `createMenu()` already owns a stable three-region DOM structure: header, body parent, and buttons parent. The current presentation distributes the parchment's usable bounds across panel padding, stack minimum heights, and menu-specific overrides. The temporary overlay confirms the regions without participating in layout and remains useful as a review aid.

## Goals / Non-Goals

**Goals:**

- Turn the visible parchment below the ribbon into the sole shared content coordinate system.
- Preserve the existing semantic menu regions while making vertical allocation deterministic.
- Make all standard menu variants inherit one responsive layout contract.
- Retain the non-layout-affecting three-box debug overlay for visual verification.

**Non-Goals:**

- Redesign ribbon art, logo treatment, typography, button art, copy, or game actions.
- Change gameplay pause, settings persistence, item behavior, treasure offers, or outcome flows.
- Introduce a new menu framework or a runtime dependency.

## Decisions

### Use the parchment bounds as the layout owner

The shared menu panel will expose one content region bounded by the actual paper surface below the title ribbon, rather than treating panel padding and per-menu min-heights as layout ownership. This gives every menu the same visual reference and prevents the Developer menu from needing a distinct horizontal correction.

Alternative considered: retain panel padding and tune each caller's overrides. Rejected because every new action count or body length would require another exception and would not make the six existing menu families converge.

### Allocate body and actions with a single column flex contract

The body parent will be the flexible region and the buttons parent will be content-sized. Action gaps and the final action's lower breathing margin remain part of the buttons region. An empty actions container will collapse, allowing Items and similar views to devote their usable height to body content.

Alternative considered: fixed percentages or fixed heights for body and footer. Rejected because the number of buttons, optional trophy actions, and control-heavy developer content vary by menu and viewport.

### Keep menu-specific content inside the shared regions

Prompt copy, the Items empty/list state, Settings and Developer controls, the treasure timer, and outcome variants retain their own content rules inside the body or action parent. Map Order sub-buttons remain a control-specific group rather than joining the regular footer action rhythm.

Alternative considered: move each menu into a specialized shell. Rejected because the shared factory already captures the correct semantic boundary and separate shells would reintroduce drift.

### Retain the debug overlay as a sibling, not a styled target

The three review boxes will continue to be positioned from the rendered DOM rectangles inside a sibling overlay above the menu. It must remain pointer-inert and excluded from the menu's flex/grid calculations.

Alternative considered: borders and labels on the content nodes themselves. Rejected because borders alter box dimensions and labels participate in layout, which can mask or create the issue under review.

## Risks / Trade-offs

- [Visible parchment art does not map exactly to the panel's box] → Establish and verify the shared paper bounds against the overlay at desktop and portrait sizes before removing existing exceptions.
- [Very short viewports cannot contain all Developer controls] → Preserve the existing compact responsive rules and verify the supported desktop and narrow-portrait compositions without a menu or backdrop scrollbar; unsupported extremes remain outside this change.
- [Optional completion actions change footer height] → Validate each available action count so the body flexes and the final control retains its lower safe margin.
- [Temporary debug labels obscure artwork] → Keep them visibly temporary, pointer-inert, and outside layout; removal remains a later, deliberate cleanup.

## Migration Plan

1. Consolidate shared parchment bounds and flex ownership in the shared menu CSS.
2. Remove superseded per-menu geometry overrides only when the shared rule reproduces their intended visual result.
3. Exercise Start, Items, Settings, Developer, Treasure Chest, loss, and completion states with the three overlays visible.
4. Run focused UI tests and browser checks at the user-reported 100% browser zoom / high-display-scale composition and a narrow portrait composition.

Rollback is a focused reversion of the shared layout rule; menu behavior and caller APIs remain unchanged.
