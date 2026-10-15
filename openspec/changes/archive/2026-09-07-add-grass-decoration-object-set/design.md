## Context

See proposal.md for motivation. Runtime code now lives under `stealth-steel/src/runtime`. `main.js` assembles terrain, reactive bushes, gold objects, pickup spawners, actor spawners, and goals. `stealth-steel/plugins/tiled-babylon-lite/index.js` supplies normalized objects and separate spawner/goal collections. Existing reactive decorations are animated bushes; automatic static grass needs its own set configuration and placement pass.

## Goals / Non-Goals

**Goals:** Keep eligibility and random selection testable independently of rendering; reuse level coordinates, terrain walkability, asset loading, and render infrastructure.

**Non-Goals:** New Tiled authoring UI, extra spawn rules, grass animation or collision, dynamic replenishment, multiple-set priority policy, or changes to existing bush behavior.

## Decisions

1. Add a small runtime decoration-set catalog and pure placement helper under environment/decorations. Grass declares `spawnFrequency: 0.1` (probability 0..1), `spawnOffset: { x: 20, y: 20 }` in world pixels, `angleOffset: 15` in degrees, `baseScale: 0.5`, and `scaleOffset: 0.15`. Each X/Y component and angle is sampled independently within its signed bounds. Uniform scale is `baseScale * (1 + random(-scaleOffset, +scaleOffset))`, giving 0.425..0.575 of source dimensions without stretching. Choices remain stable for each instance. A data catalog supports later sets without a generalized rule engine.
2. Compute setup occupancy from normalized authored objects plus every separate spawn, pickup, goal, and initial actor reservation. Include non-blocking objects and all logical cells of multi-cell footprints. Ignore terrain support artwork and metadata-only helpers. Reuse the established grid/origin conversion rather than inferring occupancy solely from colliders or relying on a list of bush-specific exclusions. Evaluate actual ground presence and terrain walkability over `worldGrid`, not viewport dimensions or an actor-specific perception predicate.
3. Run the placement pass after setup reservations are resolved and before presenting the level. Inject RNG for deterministic tests; production may use Math.random. Frequency checks handle 0 and 1 explicitly; selected tiles choose one image uniformly. Keep stable per-instance descriptors so render frames never reroll. No persistence of random choices across reloads is required.
4. Copy the two original PNGs into `stealth-steel/public/assets/images/terrain/decorations/grass/10.png` and `11.png` during implementation. Preserve source pixels, transparent padding, and filenames. Use nearest sampling, center the scaled source frame on the tile plus sampled X/Y displacement, and use a bottom-center pivot for rotation. Position the pivot half the scaled image height below the sampled center before rotation. This explicitly chooses frame-center alignment rather than trimming or shifting visible pixel bounds. Use the existing world rendering and camera transforms, with grass above ground and below actors.
5. Static instances own no blocking, combat, concealment, or entry-animation behavior. Expose their logical cell to existing decoration diagnostics where applicable, without treating them as movement blockers. Dispose/rebuild along with level rendering. Runtime entities may subsequently overlap grass without changing it.

## Risks / Trade-offs

- Incomplete occupancy coverage could put grass under non-colliding spawners or goals → build one complete setup occupancy input and test each category plus multi-cell objects.
- Camera bounds differ from level bounds → iterate the actual level grid and test offscreen cells and nonzero origins.
- Transparent padding can make visible blades appear displaced despite correct frame centering → retain original artwork and verify tile-center alignment visually; later offset tuning stays configurable.
- Large levels can increase sprite count → load each image once and use the existing renderer; inspect full-level performance in browser without introducing a separate renderer prematurely.

6. Export `GrassDecorationsEnabled = false` from the set catalog. The runtime skips grass atlas loading and passes the flag to the planner; disabled placement returns no instances. Tests and the browser fixture can exercise the planner independently while the live game stays off.

## Migration Plan

Add assets, catalog, planner, and rendering integration additively. No map rewrite or dependency change is required. Keeping `GrassDecorationsEnabled = false` disables generated grass for rollback while retaining the reusable configuration.
