# Design

## Context

See proposal.md - Why. The shared menu factory supplies the same content stack to the Start Menu, loss menu, and completion menu. The current stylesheet applies the button-sheet visual overlap to every adjacent action and recently permits the shared content stack to collapse to zero minimum height. Those choices are incompatible with outcome states that show two or more full-size actions.

## Goals / Non-Goals

**Goals:**

- Scope the geometry fix to `.level-complete-panel` and its loss/completion variants.
- Preserve the shared Tiny Swords artwork, text, accessibility, action order, and disabled behavior.
- Make the paper background derive its height from a deliberate body/action footprint with a clear lower safe edge.
- Verify the rendered bounds, not only stylesheet declarations, in a 100% fullscreen browser run.

**Non-Goals:**

- Do not redesign the Start Menu or broaden C087's 50%-125% Start Menu zoom work.
- Do not change progression, payments, trophy gating, or button labels.
- Do not add scrolling, viewport-dependent clipping, or a new dependency.

## Decisions

1. **Use an outcome-only layout hook.** Keep the shared menu rules as the baseline, then give `.level-complete-panel` its own content minimum/spacing and final-action margin. This prevents the one-button Start Menu from becoming unnecessarily tall.

2. **Use normal action separation for outcome stacks.** The negative transparent-sheet overlap remains available to menus that rely on it, but outcome actions use a non-negative gap so each button face and its text remain distinct. Increasing the paper footprint is preferable to shrinking outcome labels or hiding controls.

3. **Test paper-to-action containment.** Focused source tests cover the intended selectors and values; a browser fixture or existing completion host measures the paper bottom, final visible action bottom, body/action separation, and absence of browser errors at `?muteMusic=true&muteSFX=true`.

## Risks / Trade-offs

- [Risk] A taller outcome panel may use more of the portrait frame → keep the existing frame-bound backdrop and verify the 100% fullscreen composition remains inside the game frame.
- [Risk] Source-contract tests can accept CSS that still renders poorly → require rendered browser bounds and a screenshot review.
- [Risk] Existing user edits overlap the same stylesheet → preserve unrelated changes and make only scoped outcome-menu edits.

## Migration Plan

Apply the scoped CSS/test changes, run focused UI tests and the fullscreen browser check, then run the production build and OpenSpec validation. Reverting the outcome-specific selector and its tests restores the prior layout without data migration.
