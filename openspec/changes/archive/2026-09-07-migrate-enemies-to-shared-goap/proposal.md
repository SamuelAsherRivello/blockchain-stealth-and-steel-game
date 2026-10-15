## Why

Enemy decisions currently span awareness, patrol, specialized controllers, and actor updates, making new behavior combinations and interruption rules difficult to maintain consistently. C063 introduces one GOAP system for every enemy and a reusable action library so enemy identity comes from capabilities and parameters while movement, combat, and the player experience remain familiar.

## What Changes

- Add a dependency-free, bounded GOAP planner, per-enemy knowledge snapshots, goal selection, and a single action executor with explicit success, failure, cancellation, and commitment rules.
- Supply reusable parameterized actions for waiting, patrol, moving to a known target or interaction position, facing, searching, melee, ranged attacks, and bush burning. Capability checks prevent unsupported actions from being enabled.
- Migrate all currently supported enemies: Goblin, Warrior, Lancer, Archer, and Monk. All spawned instances use the shared brain; no legacy autonomous controller continues issuing competing decisions for a migrated actor.
- Retain actor animation/physics/combat state machines and immediate defensive reactions as execution mechanisms coordinated with the GOAP executor. Preserve input, HUD, art, sound timing, Tiled identities, spawn rules, stats, collision, and pause/death/disposal behavior.
- Preserve per-enemy concealment and alert memory, cardinal adjacent-player priority, exact attack centering, committed attack locks, and existing recovery. Monk remains a non-combatant; this does not introduce autonomous healing.
- Permit two bounded improvements: choose a reachable attack position appropriate to the weapon, including stopping the Archer in range; and recover from invalid plans or blocked targets without stale-route resumption, repeated target switching, or unbounded retries. No new attacks, omniscient pursuit, cover system, or squad tactics are included.
- Provide developer-readable goal, plan, action, knowledge, and failure snapshots with optional Enemy AI Labels in Developer Settings, disabled by default, independently persisted/reset as `debug.showEnemyAiLabels`, showing Goal and Action on the existing debug canvas.

## Capabilities

### New Capabilities

- `enemy-goap`: Bounded planning, per-enemy facts, priority arbitration, action execution, recovery, diagnostics, and the all-enemy migration contract.
- `enemy-action-library`: Composable action definitions and isolated action instances configured by validated enemy profiles, including the initial reusable action inventory.

### Modified Capabilities

- `archer-enemy-ai`: Add range-aware movement toward a legitimately known target while retaining existing shot eligibility, facing ranges, captured targets, projectile release, and recovery.

Other existing behavior requirements are compatibility constraints, not a reason to rewrite their specifications in this change. C060 concealment refinements govern earlier adjacency wording; active spatial and movement changes remain separate.

## Impact

- Runtime: `stealth-steel/src/runtime/ai/` (new), all five folders under `characters/enemies/`, shared navigation/recovery and attack preparation, perception integration, and enemy creation/update/cleanup in `main.js`.
- Tests: pure planner/executor/action tests, profile and roster integration tests, existing enemy/perception/combat regressions, and real-browser scenarios showing all five enemies and actual Archer arrow release.
- Dependencies: no new runtime package, worker infrastructure, authoring tool, or backend service. Existing JavaScript ES modules and Node test tooling remain in use.
- Internal controller interfaces may change; authored maps, public character identities, game controls, and presentation remain compatible.
- Existing UI edits and active OpenSpec work are not part of C063. Implementation must integrate with the current checkout without overwriting unrelated work or treating older unsynced specifications as authority to undo newer behavior.
