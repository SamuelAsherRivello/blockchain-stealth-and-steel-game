# Proposal

## Why

The fullscreen 100% outcome screenshots show the completion and loss menus running out of usable paper space: body copy is crowded against the action stack, adjacent buttons visually collide, and the lower actions have no intentional breathing room. The recent shared button sizing is suitable for the approved single-action Start Menu but does not provide a contained composition for multi-action outcome menus.

## What Changes

- Give loss and completion menus an outcome-specific paper/content footprint that grows to contain their body copy and every visible action.
- Restore visible spacing between outcome actions instead of applying the shared transparent-sheet overlap to the full stack.
- Keep the paper edge visibly below the final action and preserve the existing title, body copy, action labels, disabled states, and button behavior.
- Add focused layout assertions and a fullscreen browser check at 100% with both AI-mute query parameters.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `tiny-swords-ui-theme`: Outcome menus must contain readable body copy and a visibly spaced, fully enclosed action stack.

## Impact

- Affects the shared Tiny Swords menu stylesheet and outcome-menu layout hooks.
- Adds or updates focused UI/layout tests and browser verification.
- Does not change gameplay progression, BIS calls, menu copy, or the Start Menu composition.
