[Overview](overview.md) · [Standardization analysis](standardization-analysis.md) · Architecture analysis · [Verification baseline](verification-baseline.md) · [Back](overview.md)

# Architecture Analysis

## Module map

| # | Boundary | Responsibility and dependency direction |
| --- | --- | --- |
| ARCH02 | `src/runtime/main.js` | Browser entry point and composition root: initializes rendering, maps, actors, UI, lifecycle, integration, and diagnostics; it imports 95 modules across the runtime. |
| ARCH03 | `src/runtime/gameplay/` | Game state, viewport, combat, progression, run lifecycle, and pure movement/collision utilities. |
| ARCH04 | `src/runtime/characters/` and `systems/` | Actor factories/state plus environment, perception, spawner, goal, and object services. |
| ARCH05 | `src/runtime/ai/` | GOAP planner/executor, profiles, navigation, facts, and scheduler; [its local README](../../../../stealth-steel/src/runtime/ai/README.md) documents explicit action and lifecycle contracts. |
| ARCH06 | `src/runtime/ui/`, `audio/`, and `integration/` | Browser adapters/presentation, audio controls, and BIS-specific host/account/payment/reward behavior. |
| ARCH07 | `plugins/` and `public/` | Tiled, virtual-controller, and asset boundaries consumed by the runtime. |

The project has a sensible inward shape in most places: small runtime modules expose `create…` factories or narrow functions; the AI’s planner/executor contract and BIS host facade are explicit. `main.js` is intentionally the entry point, but currently also performs composition, event handling, run state ownership, entity orchestration, rendering setup, diagnostics, and teardown.

## Contracts, ownership, and test seams

| # | Area | Evidence | Assessment |
| --- | --- | --- | --- |
| ARCH08 | AI contract | `enemy-brain.js` receives actor/grid/profile/callback collaborators; its README defines action lifecycle and immutable profile constraints; dedicated AI tests exercise planner, executor, priorities, and recovery. | Healthy explicit boundary with injected collaborators and good seams. |
| ARCH09 | Integration contract | `createBisHostGame` takes callbacks, owns session/operation de-duplication, and returns a frozen facade; contract typecheck passed. | Healthy optional integration seam; its narrow scope should remain explicit. |
| ARCH10 | Game mechanics | `game-logic.js` is imported by roughly 23 runtime files by filename and contains shared collision/movement functions with tests. | A genuine shared utility/domain boundary; changes deserve broad regression checks. |
| ARCH11 | Composition ownership | `runtime/main.js` is 2,141 lines and has 95 imports; its `createGameRun` begins near line 309 and it also contains 200+ lines of diagnostics helpers. | High coupling at a single ownership point; tests mainly exercise extracted feature modules rather than a fully constructed run. |

## Candidate A01

| # | Candidate | Evidence | Expected value | Risk and non-goals | Urgency and owner |
| --- | --- | --- | --- | --- | --- |
| ARCH12 | Extract a `game-run` composition boundary from `runtime/main.js`. | The module imports 95 dependencies across AI, characters, gameplay, integration, UI, systems, assets, and rendering, and is 2,141 lines long. Existing `createGameRunCoordinator` and `game-run-lifecycle.js` indicate a seam already exists. | Localizes construction/disposal and makes high-risk lifecycle flows testable through injected collaborators; lowers merge conflicts in the entry point. | Risk: reordering setup, disposal, render-loop, or pause semantics. Non-goals: do not move every domain, alter gameplay, rename public APIs, or migrate assets. Preserve `main.js` as browser startup adapter. | Medium; `$triage-rearchitect` after release failures are fixed. |

## Candidate A02

| # | Candidate | Evidence | Expected value | Risk and non-goals | Urgency and owner |
| --- | --- | --- | --- | --- | --- |
| ARCH13 | Specify an executable browser-run acceptance seam for lifecycle/integration behavior. | `src/test/browser` holds 49 scenario assets, but `npm test` discovers only `*.test.js`; full Node tests pass 1,092 assertions but not browser scenarios. | Separates unit confidence from production composition confidence and protects entry-point extraction. | Risk: browser checks can be slower and require a local server/graphics environment. Non-goals: do not require every browser artifact in every commit. | Medium-low; `$triage-standardize` for verification policy, then `$triage-rearchitect` if extracting the run boundary. |

The recommended refactor is not urgent solely because of file size: bounded domain modules, extensive Node coverage, and explicit AI/integration contracts mitigate risk. It should be planned before another feature crosses rendering, actor, UI, and BIS lifecycles.
