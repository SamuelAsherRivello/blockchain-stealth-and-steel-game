## Context

C077 adds a transition across the static startup preloader, DOM start-menu layer, and in-place game-run replacement lifecycle. The visual effect must be reusable for any target div and must not use portrait-frame CSS assumptions.

## Goals / Non-Goals

**Goals:**

- Use one target-bound controller for startup and restart.
- Keep the mask physically circular in the target's measured pixel space.
- Preserve the existing no-navigation restart lifecycle.

**Non-Goals:**

- Add a renderer dependency, a generic scene router, or transitions for Continue to Next Level.
- Animate the desktop letterbox or other content outside the supplied target.

## Decisions

### SVG even-odd blackout path

The overlay uses an SVG blackout path with an even-odd circular hole. It avoids browser-specific mask-mode behaviour while allowing the radius to be updated precisely per animation frame. A CSS radial mask was rejected because its radius and crop behaviour are less reliable across the supported browser set.

### Target rectangle is the source of crop geometry

The controller accepts a target element, reads its client rectangle, and sets the fixed overlay's position and pixel dimensions to match. A `ResizeObserver` updates changed target dimensions, while the existing window-resize path refreshes positional changes. This keeps the controller reusable and leaves frame sizing to its owner.

### Explicit lifecycle sequencing

Startup keeps the preloader black until the first frame and normal UI are ready, then invokes reveal. Restart pauses immediately, waits for cover completion, replaces the disposable run, and then reveals. A single in-flight promise prevents duplicate replacement runs. The controller also uses a short timer fallback so a browser that parks an animation frame near its endpoint cannot leave an invisible input blocker active.

## Risks / Trade-offs

- [An SVG overlay can intercept pointer input] → Hide the SVG attribute after a completed reveal and retain its transparent input plane only while visible.
- [Target layout can change outside a window resize] → Observe target dimension changes and expose a resize refresh method for owner-driven layout changes.
- [Animation frames can be throttled] → Finish at the rounded visual endpoint with a duration-bounded timer fallback.

## Migration Plan

1. Mount the static SVG overlay beneath the startup preloader.
2. Compose the target-bound controller with the game frame.
3. Route startup and restart through reveal/cover sequencing.
4. Verify focused controller tests, production build, and browser startup/restart behaviour.
