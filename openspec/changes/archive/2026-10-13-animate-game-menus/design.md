# Design

## Context

The shared `createMenu` factory creates the themed backdrop and composition, but callers own visibility and disposal. `GameWindow`, the start prompt, and outcome menus currently hide or remove the backdrop immediately. See `proposal.md` for motivation and the Tiny Swords UI Theme delta for required behavior.

## Goals / Non-Goals

**Goals:**

- Give every `createMenu` consumer one lifecycle for entering, exiting, hiding, and disposal.
- Keep the displayed menu accessible while open and remove it from keyboard and pointer input during exit.
- Use shared CSS motion values and honor `prefers-reduced-motion`.

**Non-Goals:**

- Change menu layouts, artwork, labels, focus order, gameplay pause ownership, or BIS account UI.
- Animate unrelated HUD, toasts, or fullscreen world transitions.

## Decisions

### Menu-owned transition controller

`createMenu` will expose lifecycle methods that manage transition classes, hidden state, input blocking, and completion callbacks. Its callers will use those methods instead of directly setting `hidden` or removing the backdrop. This keeps the behavior uniform across menus that stay mounted and menus that are disposed.

Direct CSS-only visibility rules were considered, but they cannot defer DOM removal or coordinate focus and interactivity during exit.

### CSS animation with a JavaScript completion boundary

The theme stylesheet will define shared enter and exit keyframes for opacity and scale, plus a reduced-motion override. The controller will wait for the matching transition end event, with a bounded fallback for environments that do not emit it. Closing menus will be inert and pointer-disabled before their exit starts.

The BIS React component model was considered directly, but the game uses imperative DOM nodes. Matching its visual values and lifecycle contract without introducing React preserves the game architecture.

### Focus after visible state changes

Callers will focus their intended control after requesting entry. An exit will not restore focus until the removal callback runs, so a closing view cannot receive interaction. Existing opener restoration and outcome-menu focus selection remain caller responsibilities.

## Risks / Trade-offs

- [Animation end does not fire] -> Complete the lifecycle through a duration-based fallback.
- [A repeated show or close races an earlier lifecycle] -> Cancel the obsolete completion handler and use the current transition state.
- [Reduced-motion users see a delayed close] -> Detect the media preference and complete the lifecycle synchronously when motion is disabled.

## Migration Plan

1. Add the shared controller and styling.
2. Move each existing themed menu caller from direct hide/remove operations to the shared methods.
3. Add unit coverage and validate the visible flows in a managed Playwright browser.
4. Roll back by removing the new controller calls and shared animation styles. No persisted data changes.
