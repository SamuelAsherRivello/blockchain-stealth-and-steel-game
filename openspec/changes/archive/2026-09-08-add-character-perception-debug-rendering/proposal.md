## Current contract reconciliation (2026-09-08)

Perception diagnostics use centered squares: Visual occupies 50% of a cell and Audio 25%, with Audio drawn on top. Active detection blinks at 100% purple for 0.2 seconds on and 0.1 seconds off. Inactive Audio is 40%; inactive Visual fades by distance through 40%, 30%, 20%, and 10%. Triangle, stroke-width and 80% active-opacity descriptions below are historical and superseded. The later independent Developer controls supersede Collider-mode gating: Enemy Perceptions controls these indicators independently of Physics Colliders. Runtime collider-diagnostics.js and its existing tests confirm this styling.

Existing task IDs, checkbox states and historical review evidence are retained. This specification sync does not claim new implementation or verification.

## Why

Collider mode needs a direct visual explanation of each character's perception geometry and the grid spot currently triggering detection. This makes the centralized gameplay system inspectable while keeping user-facing perception display out of scope.

## What Changes

- Render every living detector's Visual and Audio Perception only while Collider mode is enabled.
- Draw centered 50%-cell triangles for perception grid spots.
- Use a 4px white line for Visual Perception and a 2px purple line for Audio Perception.
- Use thin lines for inactive perception cells and double thickness for actively detected cells.
- Render overlapping Visual and Audio indicators independently.
- Consume the centralized system's read-only geometry and active-detection snapshot.

## Capabilities

### New Capabilities

- `character-perception-debug-rendering`: Collider-mode visualization of perception geometry and active detections.

### Modified Capabilities

None.

## Impact

Likely affects the existing collider diagnostic canvas, main render/update integration, and UI tests. It adds no dependency and does not add runtime user-facing inspection or interaction.
