# Design

## Context

The runtime already reads `accountHost.hasItemSupport()` and passes the result
to `createStartGamePrompt`. The prompt currently creates both buttons first,
then hides or disables Items. The design should make the rendered action list
match the capability at construction time while retaining the existing
capability refresh path for an already-open prompt.

## Goals / Non-Goals

**Goals:**

- Make the public Start Menu contain only actions available to the current
  session.
- Preserve the existing Start and Items callbacks, focus behavior, and menu
  styling.
- Keep capability absence safe and ordinary gameplay available.

**Non-Goals:**

- Change how BIS determines item support or how inventory is loaded.
- Add login prompts, account controls, or replacement non-BIS item features.
- Change the Items dialog or item selection rules.

## Decisions

### Build the action list from initial capability

`createStartGamePrompt` will include the Items button in the shared menu
`buttons` array only when `itemsVisible` is true. The returned prompt will
continue to expose `itemsButton` as `null` when absent, and its state-update
methods will tolerate that absence. This ensures the DOM never contains a
hidden BIS-only action for unsupported users.

Alternative considered: keep a hidden button and toggle it. Rejected because
hidden DOM is still an unnecessary BIS-only surface and makes structural
acceptance ambiguous.

### Keep enabled state separate from visibility

When support is available, the existing `itemsEnabled` value controls whether
Items can be activated. When support is unavailable, no Items button exists;
the runtime must not attempt to open inventory or focus a missing control.

### Preserve runtime capability refresh

The main runtime may still call `setItemsSupported` and `setItemsEnabled`
after account readiness. These updates will be null-safe and will not create a
new button after the menu is mounted. A prompt created without support remains
Start-only for that presentation.

## Risks / Trade-offs

- If capability becomes available after initial menu creation, the current
  prompt will remain Start-only until a new prompt is created; this avoids
  mutating the action layout during an open menu.
- Tests and callers that assume `itemsButton` is always an element must be
  updated to handle the documented nullable reference.

## Migration Plan

This is a runtime/UI-only change with no persisted-data or API migration.
Deploy with focused menu and capability tests plus the production build.
Rollback is limited to restoring unconditional Items-button construction.
