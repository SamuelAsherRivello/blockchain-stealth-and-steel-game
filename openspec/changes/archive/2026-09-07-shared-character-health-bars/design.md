## Context

C068 is a retrospective record of the approved and implemented health-bar plan. All seven character types already use shared combat state, while perception icons are drawn on the world-aligned canvas. The main combat-health-system spec already contains the implemented requirements. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:** Keep authoritative health separate from delayed presentation; give every actor the same meter implementation; preserve character-center positioning through movement, jumps, camera translation, death, and revival.

**Non-Goals:** New damage sources, healing mechanics, health UI for props or bushes, changes to sprite artwork offsets, dependencies, or saved data.

## Decisions

- `combat-actor.js` exposes `maxHealth`, an optional `onHealthChange`, and `subscribeHealthChanges` returning an unsubscribe function. Notifications carry previous/current/maximum health before death callbacks. This avoids duplicating damage detection in each character or polling and missing intermediate changes.
- `health-bar.js` owns hidden, fading-in, changing, holding, and fading-out phases. Gameplay delta time consumes phase boundaries, including the one-second deadline. Repeated changes retarget from displayed health instead of queuing outdated values. Exact behavior lives in the delta spec.
- `character-overhead.js` owns each actor's meter subscription and both overhead drawings. The main loop updates meters during death as well as life, disposes them with removed actors, and suppresses dead actors. Retained players can reveal restored health on revival without reusing the previous fade state.
- Bars are 40 by 6 logical pixels with a one-pixel border. Screen-space offsets from character center are player (0,-56), sheep (0,-72), goblin (0,-64), warrior (0,-72), lancer (0,-64), archer (0,-72), and monk (0,-56). Icons use a fixed slot above the bar with clearance for their full 50-pixel image and a six-pixel gap. The same visual jump offset and camera translation affect both elements. Fixed slots avoid layout jumps when only one element is visible.
- A lethal bar disappears at the existing 0.25-second death completion instead of lingering at an empty position or extending gameplay death. Displayed health clamps to zero without changing existing negative-health death semantics.

## Risks / Trade-offs

- Different artwork heights can overlap the overhead UI: offsets were adjusted against all seven production sprites in the browser fixture, including simultaneous icons and bars.
- Wall-clock timing would animate while paused: the meter receives gameplay delta, with unit and browser pause coverage.
- Dead player records survive for revival: subscriptions remain until disposal, while dead snapshots force zero opacity and revival begins a fresh reveal.
- The canvas also carries debug drawings: overhead rendering runs independently of all debug toggles, verified across their combinations.

## Migration Plan

No data migration is required. Requirements were incorporated into the main spec during implementation; archival checks compare the two added requirement blocks and confirm the former prohibition is absent. Any rollback must be a separate additive edit to presentation wiring and specs, preserving existing commits and unrelated work.

## Verification Evidence

Implementation verification completed on 2026-09-07: the full Node suite passed; the production build passed; strict combat-health-system validation passed; and the real-sprite browser fixture passed 18 checks across all seven types. Visual inspection confirmed initial invisibility, head clearance, simultaneous icons/meters, movement, jump, and camera tracking. Fixture: `stealth-steel/src/test/browser/health-bars.html`. Focused tests cover exact boundaries, rapid hits, both fade directions, pause, lethal clamping, cleanup, and revival.
