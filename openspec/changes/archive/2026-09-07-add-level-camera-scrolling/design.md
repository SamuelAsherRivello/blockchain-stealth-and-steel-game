## Context

See proposal.md. Rendering currently projects world Y using screen height, but actors also use movement bounds height for projection. Existing HUD changes in main.js must be preserved.

## Goals / Non-Goals

Keep one 576x1024 surface and 64-pixel tiles, with larger world bounds and unchanged origin-relative positions. No zoom, rotation, level-selection UI, per-level dead-zone tuning, or new dependencies.

## Decisions

- Normalize camera mode in the Tiled adapter; compute interior bounds relative to its origin. Keep fixed-mode defaults and use minimum coordinates in scrolling grid consumers so moved origins work.
- Separate render height from actor bounds. Use one shared Sprite2DView across world layers, and matching canvas/DOM projection. This avoids rewriting entity positions when panning.
- Calculate minimal dead-zone correction, clamp its target, interpolate using `1-exp(-dt/0.15)`, settle corrections below 0.1px, then clamp again. Update after gameplay movement and before diagnostics; use the gameplay pause/end state.
- Clamp only scrolling movement to world bounds; retain fixed-mode collision behavior. Use world bounds for depth normalization without coupling projection height to world size.
- Use the user-authored wider Level 1 for browser QA through the normal game URL. Remove the demo-map route and its mutation controls; retain the read-only development inspection snapshot.

## Risks / Trade-offs

- Mixed world/screen coordinates -> exercise actors, terrain, projectiles, goal DOM, grid labels and clicking together in browser.
- Newly spawned layers can miss the view -> register all dynamic layers through one world-layer attachment path.
- Larger maps expand navigation work -> retain existing simulation behavior; streaming and offscreen AI suspension are outside C064.
- Concurrent HUD edits -> targeted edits and final diff inspection; preserve unrelated changes.

## Migration Plan

Missing cameraMode remains fixed. Authors opt in via a Tiled map string property. Level 1 opts in at the user's request; preserve its authored tiles and objects. Validation and focused/full runtime checks precede completion.
