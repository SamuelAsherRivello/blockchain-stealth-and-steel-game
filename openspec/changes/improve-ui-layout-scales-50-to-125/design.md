# Design

## Context

The shared Tiny Swords menu stylesheet mixes `cqw` measurements with fixed `px`, `dvh`, `clamp()`, and fixed-pixel maximums. The runtime already constrains the UI layer and each menu backdrop to the visible game frame. See proposal.md for the motivation.

## Goals / Non-Goals

**Goals:**

- Preserve the approved 110% Start Menu geometry as a relationship to the 9:16 game frame.
- Keep the complete two-action Start Menu visible and inside its parchment at 50%, 75%, 80%, 90%, 110%, and 125% zoom-equivalent viewport sizes.
- Catch regressions with browser measurements of rendered DOM bounds rather than source-only CSS assertions.

**Non-Goals:**

- Do not alter the world/canvas scaling policy, browser zoom, device-pixel-ratio handling, or the optional wheel-driven UI scale described by C083.
- Do not redesign other menu types, change artwork, copy, Items availability, or game input behavior.

## Decisions

1. **Scope the new geometry to the Start Menu.** Its screenshots are the accepted visual evidence. Shared rules continue to supply artwork and interaction behavior; a Start Menu modifier owns its composition measurements. This avoids moving Settings, Items, Treasure, or outcome dialogs without review.

2. **Use the visible game-frame width as the only visual coordinate system.** The new Start Menu values are hardcoded frame-relative `cqw` measurements calibrated from the approved 110% capture. Fixed-pixel caps and viewport-height offsets that change their proportion under browser zoom are not used in that composition. This follows the game frame that already bounds the overlay, instead of adding browser-zoom detection or inverse-zoom compensation.

3. **Test browser layout using zoom-equivalent CSS viewports.** A Playwright fixture renders the actual Start Menu inside a 9:16 frame. For each supplied zoom factor it uses the corresponding CSS viewport dimensions, measures geometry relative to the frame, and verifies stable proportions, containment, and a parchment bottom edge below the final action. This directly detects the fixed-pixel/frame-relative mismatch while remaining headless and deterministic.

4. **Write the contract before changing the layout.** The first run is expected to expose the existing failure at the lower zoom factors. The same test must pass after the CSS refactor; no test will encode the broken appearance as accepted behavior.

## Risks / Trade-offs

- [Risk] Frame-relative text can become too small on an unusually short physical display -> retain the existing semantic controls and test the supplied zoom range before widening scope to responsive mobile behavior.
- [Risk] The shared stylesheet contains legacy source-contract tests that assert fixed values -> update only expectations contradicted by C087's Start Menu-specific contract; retain tests for other menus.
- [Risk] A test can prove geometry but not artistic judgement -> preserve 110% and 125% captures as manual review gates after the automated pass.

## Migration Plan

Add and run the failing browser contract, refactor only the Start Menu geometry, then rerun the same contract at all six levels alongside focused UI tests and the production build. The change is CSS/test-only and can be rolled back by reverting the scoped selector and test files.
