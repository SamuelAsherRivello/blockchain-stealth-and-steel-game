## Why

Empty walkable tiles need grass detail placed automatically during level setup. A configurable decoration object set makes the initial full coverage easy to tune and supports additional sets later.

## What Changes

- Introduce decoration object sets with an image list, spawn rule, spawn rate, and spawn offset.
- Add the `grass` set using the supplied `10.png` and `11.png`, choosing one image randomly per placement.
- Define rule `walkable` as an empty walkable tile: no bush, pickup, spawner, goal, resource, actor start, or other placed object.
- Set grass spawn frequency to 0.1 (10%), base scale to 0.5 with relative scale offset 0.15, X/Y offsets to 20 pixels each, and angle offset to 15 degrees. Sample each once during level setup; rotate around the PNG bottom center.
- Keep grass visual and non-blocking; later movement or pickup removal does not trigger new placement.

- Add the global `GrassDecorationsEnabled = false` switch; retain the configured feature but disable grass generation and texture loading by default.

## Capabilities

### New Capabilities
- `decoration-object-sets`: Configurable sets, empty-walkable eligibility, random image selection, centered placement, and setup lifecycle.

### Modified Capabilities
None.

## Impact

Implementation will affect `stealth-steel/src/runtime/main.js`, environment decoration modules, level occupancy extraction, sprite loading/rendering, and focused environment tests. Assets will be copied from `C:/Users/srive/Downloads/Tiny Swords (Organized)/Decorations/Misc/10.png` and `11.png` into project assets during implementation. Existing Tiled reactive bushes retain their behavior. No new dependency or editor UI is required.
