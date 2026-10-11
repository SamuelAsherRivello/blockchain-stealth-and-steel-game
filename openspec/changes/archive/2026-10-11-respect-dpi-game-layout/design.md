# Design

## Context

The existing responsive viewport already treats 576x1024 as the logical game space and uses CSS to fit a centered 9:16 frame. The production engine path does not make its device-pixel-ratio behavior explicit, while browser zoom changes CSS-pixel measurements and can expose mismatches between canvas backing dimensions and DOM overlays. See proposal.md and the responsive-game-viewport delta for the required behavior.

## Goals / Non-Goals

**Goals:**

- Keep one logical coordinate system for world rendering, diagnostics, and input.
- Make physical canvas resolution deliberate, bounded, and independent of CSS layout size.
- Recompute the relevant render and UI measurements when viewport or effective DPR signals change.
- Prove the result with source tests, build checks, and live 50%/100% browser-zoom captures.

**Non-Goals:**

- Redesign the portrait composition, menu artwork, or responsive breakpoints.
- Change gameplay dimensions, tile sizes, camera rules, or control semantics.
- Add a user-facing graphics-quality setting.

## Decisions

1. **Use an explicit bounded DPR policy at production engine creation.** This prevents uncontrolled backing-buffer growth on dense displays while retaining sharper rendering than a forced DPR of 1. A shared helper or constant will make the policy testable and keep browser-test engines free to choose their own settings.

2. **Use 100% as the UI baseline and cap effective DPR at 2.** Browser zoom is treated as a presentation concern; rendering remains in the logical viewport and does not create a second gameplay coordinate scale.

3. **Keep CSS geometry authoritative for layout and input.** The visible frame and canvas `getBoundingClientRect()` remain CSS-pixel presentation measurements; physical backing dimensions are an implementation detail of rendering. Pointer conversion continues through the logical fitted rectangle and must not read `canvas.width` or `canvas.height` as CSS dimensions.

4. **Treat effective DPR as a viewport signal.** The runtime will refresh diagnostics and any needed canvas sizing when resize/fullscreen/orientation/visual-viewport changes occur and when the effective DPR changes. The implementation should avoid a permanent polling loop; a media-query or equivalent change signal is preferred, with existing resize observation retained as the fallback.

5. **Scale only the UI layer for mousewheel zoom.** Plain wheel input over the game frame changes a center-anchored UI scale from 0.5 to 1.5 in 0.1 steps, prevents page scrolling, and leaves the game/world layer untouched. Modifier-key wheel input remains available to the browser.

6. **Extend focused contract tests before broad verification.** Tests will assert the explicit engine option/policy, logical-vs-physical separation, and zoom-stable coordinate/layout contracts. Browser verification will compare the same game state at 100% and 50% with `?muteMusic=true&muteSFX=true`.

## Risks / Trade-offs

- [Risk] A larger backing buffer increases GPU memory and fill cost → cap the DPR and verify startup/render stability on dense displays.
- [Risk] Browser zoom may emit different combinations of resize and visual-viewport events → use the existing coordinator plus an effective-DPR change signal and test both supplied zoom levels.
- [Risk] Source-contract tests can pass while a real browser overlay drifts → require live screenshots/measurements of the game frame, menu, HUD, and controls.

## Migration Plan

Implement behind the existing production initialization path, run focused tests and build, then perform the 100%/50% browser checks. Rollback is limited to reverting the scoped runtime, style, and test edits; no persisted data or external API changes are involved.
