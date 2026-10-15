## Context

See proposal.md for motivation. C063 is a JavaScript ES-module architecture change across the five enemies; it does not migrate Sheep or the Player.

Current decision ownership is split between `enemy-awareness-controller.js`, `enemy-patrol-controller.js`, `goblin-behavior-controller.js`, and the Archer's own `update()`. `main.js` constructs controllers and supplies snapshots. Actors own movement, animation, projectile release, impact queues, attack preparation clocks, and some defense decisions. Perception reactions carry independent awareness timers and remembered cells but also invoke movement/facing callbacks. Existing tests cover these boundaries independently.

The current checkout includes unsynced and overlapping specifications. C060 refines C056's earlier hidden-adjacency wording: an unaware enemy cannot attack the concealed player. C057 requires centering before player attacks. C055 requires an awareness-entry locomotion stop. C038 and the active `universal-grid-spot-occupancy` and `quantized-enemy-movement-on-one-axis` changes are ongoing spatial work, not work to complete through C063. C061 UI work and C062 folder restructuring are separate; current code lives under `stealth-steel/src/runtime`.

Two defense discrepancies require an explicit baseline: the current Warrior selector and tests reject vertical arrows despite older `warrior-character` text mentioning upward probability, and `main.js` currently supplies projectile snapshots only to Warriors despite a Lancer defense implementation. C063 preserves current integrated defense behavior; it neither enables Lancer auto-defense nor adds vertical Warrior defense. Document these as pre-existing discrepancies during verification, not as GOAP improvements. Other pre-existing spec/runtime disagreements must likewise be distinguished from changes introduced here.

## Goals / Non-Goals

**Goals:**
- Make action selection and ownership uniform while preserving enemy-specific execution and animation vocabularies.
- Demonstrate real multi-step planning and reuse across profiles, including parameterized interaction positions and actor capabilities.
- Bound planning, target selection, retries, diagnostics, and state retention on the browser main thread.
- Preserve exact eligibility and lifecycle contracts with focused regressions and browser evidence.

**Non-Goals:**
- A general-purpose GOAP package, runtime dependency, worker pool, editable behavior graph, new settings screen, or Tiled action authoring format.
- New damage, weapons, health tuning, autonomous Monk healing, cover, retreat/kiting, squad orders, or new defense behavior.
- Replacing physics, occupancy, pathfinding with symbolic planning, or changing Player/Sheep AI.

## Decisions

### 1. Small pure planner, separate goal selection and execution

Use forward uniform-cost search over a fixed small symbolic state. An action definition describes preconditions, effects, cost, capability requirements, and an execution factory. Planning operates only on immutable snapshots and copied facts. Return `{ status, steps, cost, expanded }` with `found`, `already-satisfied`, `unreachable`, or `budget-exhausted` status. Only a fully found plan executes.

Use a canonical state key and retain the cheapest known cost per state; stable action order resolves equal costs. Costs must be finite and non-negative. Reject dominated/no-progress transitions, apply a depth cap, and never permit an action-generation loop to create unlimited candidates. Initial tuning candidates are depth 8, 256 expansions per request, and 1024 expansions across a gameplay update, subject to representative browser measurement. These are conservative starting limits, not performance claims. Validate configuration and expose consumed work.

A scheduler services pending ordinary requests in round-robin order. Requests deferred by the global budget remain pending and are rebuilt from fresh relevant facts when serviced. A per-request cap failure waits for a meaningful fact change or bounded retry; it does not immediately repeat every frame. Goal eligibility and the current action are still checked every active update. An already eligible adjacent attack uses the same planner with its one eligible terminal action (one expansion, separately counted), preserving the next-update response even when the ordinary search budget is spent. Scheduler callbacks only compute plans; effects start after the current enemy priority checks. Death and defense are execution constraints, not searchable goals.

Alternatives: BFS prioritizes fewest steps rather than travel cost; backward A* adds regression/heuristic complexity; a Unity library does not fit this project. Bitmask facts and workers are deferred until measured need. A fixed scripted successor chain was rejected because it would not demonstrate GOAP composition.

### 2. Per-enemy knowledge adapter and explicit frame ownership

`enemy-facts.js` projects only permitted player observations, local adjacency, and reaction memory. The planner uses goal-local `atPosition` and `done` facts. Separate context holds the single bound target ID, permitted positions, eligibility rule, and resumable route state; per-segment validation detects changed occupancy. Generated candidate bindings become part of step identity; facts for one target cannot satisfy an action bound to another. Snapshot positions are not global live Player references.

Centralized perception remains the source for detections and occlusion. `enemy-perception-reaction.js` retains state transitions, durations, and memory. For migrated enemies, its movement/facing callbacks publish reaction intent/dirty state rather than directly driving the actor. Track hidden movement only through the existing visually confirmed permission, without timer refresh. Direct local adjacent interaction eligibility remains available without granting persistent target knowledge. Audio supplies the existing evidence point, not a continuously updated unseen position. Runtime target access for final attack validation is filtered by the same policy.

Define and test one frame pipeline: update physical/world inputs and permitted observations; advance reaction time once; derive current knowledge and transition events; run immediate constraint checks and goal arbitration; start/tick the executor; advance each actor once for preparation, animation/physics, and existing combat work; consume completion/interruption events for the next decision. Integrate existing centralized perception event production deliberately so expiry and new evidence are not applied in inconsistent orders or with stale hidden-target permission. Active gameplay delta is the only gameplay clock.

Keep future symbolic effects separate from observed results. `shotComplete` is an objective-local token reset for a new shot request, not a permanent world boolean that suppresses later attacks. Likewise patrol/search/burn completion tokens belong to a decision generation. Planning cannot set health or secretly extend perception. Observe exactly-once attack completion and recovery rather than infer a hit from an animation request.

### 3. One executor with explicit interruption and commitment

`executor.js` owns a single instantiated action with `start(context)`, `update(context, delta)`, `cancel(reason)`, and a snapshot. Results are running, succeeded, failed, or cancelled. A generation token protects against stale callbacks. Shared definitions are immutable; execution state is never stored on a shared definition.

Player melee/ranged actions contain the mandatory preparation sequence: capture own occupied GridSpot center, request normal centering through `player-attack-preparation.js`, revalidate the initiating rule and concealment until commitment, then invoke the actor attack. Use authoritative configured GridSpots and ordinary axis/collision rules. Centered attacks may commit immediately. Non-player Goblin interactions keep their current mechanics and do not inherit a new centering requirement.

Committed attacks, including the Archer's target, one release, and recovery, survive ordinary goal changes. Do not start another action while the protected lifecycle is running. Existing Warrior defense can supersede an attack and cancel pending impacts; the adapter reports that interruption to the executor, invalidates future steps, and holds decisions until defense completes. Retain Lancer behavior as wired today. Do not route immediate defense through a budgeted planner or duplicate its timer in the brain.

Knockback, death, disposal, scene teardown, and pause retain existing precedence. Cancel uncommitted centering on invalidation/displacement. Clear movement requests on cancellation; never restore a previously interrupted route. The actor adapter can expose lifecycle signals/queries needed for reliable completion; presentation state names need not be standardized across actors.

Alternative: leaving old controllers active under a planner wrapper would preserve multiple writers. They must be disconnected for each migrated actor; reusable helpers can be extracted without preserving their autonomous loops.

### 4. A reusable action library with capability-checked profiles

Use plain objects/factories, not one class per fact or a hierarchy per enemy. The planner contains no character-name branches. Profile validation checks known action IDs, compatible capability methods, valid durations/ranges, costs, and target policies. Keep configuration defaults close to each enemy under `<type>/<type>-goap.js`; a shared profile validator assembles the library definitions with those defaults.

| Action factory | Principal parameters | Planned effect | Execution |
| --- | --- | --- | --- |
| `wait` | reason, duration/range | idle or retry interval completed | Stop intent; advance one action-owned active-time timer. |
| `patrol` | timed/route mode, duration or distance range, home radius, destination policy | patrol segment completed | Shared navigation; keep Goblin route-distance and other enemies' timed-patrol semantics distinct. |
| `move-to` | target binding, destination policy, reach/stop condition, travel cost | at bound evidence or interaction position | Navigate permitted cardinal routes with movement recovery. |
| `face` | stimulus binding, facing policy, observation duration | stimulus observation completed | Request supported heading only while unlocked. |
| `search` | remembered point, direction schedule, remaining awareness time | search step completed | Bounded directional inspection under the existing reaction timer, without starting a second investigation clock. |
| `melee` | target policy, animation variant, reach rule, recovery, player-preparation flag | one melee cycle completed | Call actor capability and observe real impact/animation lifecycle. |
| `ranged` | facing/attack ranges, target eligibility, shot capability, recovery | one shot cycle completed | Center when needed; invoke shoot; observe release and recovery. |
| `burn-bush` | target policy, cardinal reach, existing damage/recovery | one burn cycle completed | Reuse fire reach and bush damage integration exactly once. |

The generic movement factory is instantiated as move-to-evidence, approach-melee-position, approach-firing-position, or approach-bush-position. These are data bindings, not copied navigation implementations. Mandatory facing/centering/recovery within an attack remain execution phases; they are not additional searchable actions just to make plans longer. Ordinary facing observation remains a separate reusable action because it satisfies a non-combat suspicion goal.

Immediate defense is an existing execution capability shared through the adapter contract, not a new autonomous `guard` goal. A future heal/cover/flee action would require real gameplay semantics and tests before registration; animation availability alone is insufficient.

### 5. Profiles preserve roles and priority policy

Priority order: inactive/pause and existing forced locks; immediate integrated defense; eligible adjacent-player attack; other currently eligible combat; state-appropriate awareness activity; ordinary activity. The awareness entry stop governs new locomotion, with the current higher-priority adjacent combat exception. Same-state evidence updates do not restart the entry stop. Preserve current action for equal-priority equivalent alternatives while valid.

| Profile | Enabled voluntary activity | Defaults and boundaries |
| --- | --- | --- |
| Goblin | idle, route patrol, face/search, move-to, melee player/sheep, burn-bush | Idle 3-5 s; patrol 2-5 route cells and home radius 4; melee cardinal distance 1; recovery 1.25 s; bush roll 0.25 at a fresh normal decision; existing 50 damage. |
| Warrior | idle, timed patrol, face/search, move-to, player melee | Current shared patrol defaults; existing default melee variant; both actor attack variants remain callable; existing integrated automatic guard stays immediate. |
| Lancer | idle, timed patrol, face/search, move-to, player melee | Preserve directional thrust selection and current patrol defaults; no activation of currently unwired projectile defense. |
| Archer | idle, timed patrol, face/search, move-to, ranged | Facing 5 and attack 4 world units at current 64 px/unit; Euclidean inclusive checks; recovery 0.75 s; current detected ranged rule OR eligible cardinal adjacency; no minimum-range retreat. |
| Monk | idle, timed patrol, face/search, move-to | Patrol and all four awareness responses only; no combat or autonomous heal. |

Common current defaults: patrol idle 3-5 s, timed patrol 2-5 s, blocked retry 3 s, meaningful-progress stall threshold 1 s. Preserve current perception defaults (suspicion 1-3 s, investigation 8 s, direction dwell 2 s, alert 3-5 s and current evidence thresholds). Store units explicitly to avoid treating the Goblin's patrol distance as a duration. Reuse exported actor timing/constants where possible so config and execution cannot drift.

Randomness is sampled with an injected source at normal activity boundaries and stored with that decision. The planner is deterministic and never rolls probabilities during branch expansion. For Goblin, eligible nearby characters precede the bush roll; a successful roll scans the map for the nearest reachable living bush with stable snapshot-order ties. Existing post-swing character priority, recovery, and non-player repeat-target behavior are captured in baseline tests before extraction. Do not add pursuit of distant Sheep merely because the movement action supports it.

### 6. Bind reachable destinations outside symbolic search

Reuse existing cardinal traversal, collider clearance, occupancy, and movement recovery through `navigation.js`. Symbolic search reasons about reaching one selected interaction point, not a branch for every walking step. Cache a reachability result per relevant origin/occupancy revision where safe; invalidation is mandatory on changed blockers or perception-dependent bush access. Limit candidate generation and grid expansion separately from GOAP expansion; defer an incomplete nearest-target scan rather than incorrectly declaring later bushes unreachable. The finite configured grid is the search domain. No reservation system is introduced; multiple Goblins may select the same bush and physical occupancy still decides movement.

Choose the shortest reachable route to an eligible interaction position with stable tie-breaking. For ranged movement, candidates are unoccupied reachable centers within the current attack radius of the permitted target location. Reuse applicable detection/occlusion constraints; a candidate does not guarantee a ballistic hit. Retain a valid current destination while it still permits the goal; changed target position invalidates only affected predicates. A final live check after centering prevents a moved player from being attacked under stale range eligibility.

The Archer already in range plans `[ranged]`; outside range with current permitted knowledge plans `[move-to(firing-position), ranged]`. Lost live permission switches to `[move-to(evidence), search]` within remaining awareness time. A Monk uses evidence movement/search without acquiring the attack goal. Goblin mischief plans `[move-to(bush-adjacent), burn-bush]` or `[burn-bush]` when already adjacent. These examples must be produced by the planner from facts/effects, not installed as fixed chains.

On a failed segment, reuse the existing safe alternative and one-cell escape policy before waiting. Preserve collision/concealment constraints when relaxing patrol preferences. Cache failure against target/destination and relevant evidence/occupancy revision until revalidation or retry. Stop safely if no route exists; do not downgrade an active awareness state into unrelated patrol simply because an attack plan is unavailable.

### 7. Folder and integration layout

Paths below are relative to `stealth-steel/src/`:

```text
runtime/
+-- ai/
|   +-- goap/
|   |   +-- planner.js
|   |   +-- executor.js
|   +-- enemy-brain.js
|   +-- enemy-facts.js
|   +-- enemy-profile.js
|   +-- planning-scheduler.js
|   +-- navigation.js
|   +-- enemy-ai-labels.js
|   +-- actions/
|       +-- index.js
|       +-- wait.js
|       +-- patrol.js
|       +-- move-to.js
|       +-- face.js
|       +-- search.js
|       +-- melee.js
|       +-- ranged.js
|       +-- burn-bush.js
+-- characters/
|   +-- movement-recovery.js
|   +-- enemies/
|       +-- enemy-action-adapter.js
|       +-- player-attack-preparation.js
|       +-- archer/archer-goap.js
|       +-- goblin/goblin-goap.js
|       +-- warrior/warrior-goap.js
|       +-- lancer/lancer-goap.js
|       +-- monk/monk-goap.js
+-- systems/perception/                 existing sensing/memory
+-- main.js                            attach/tick/dispose brain
test/
+-- ai/                                planner/action/profile tests
+-- characters/                        existing compatibility tests
+-- browser/                           full-roster GOAP fixture
```

Existing per-enemy actor, state, animation, and defense files remain in their current folders. Extract shared services out of old controllers as required. Retire autonomous controller use only after corresponding profile migration; retain non-AI/demo consumers only where actually used. Preserve existing navigation diagnostic fields through the brain snapshot so developer tooling remains usable. Document the action-authoring contract with one two-profile reuse example.

### 8. Validation and sources

Planner tests cover cost preference, real composition, cycles, already-satisfied goals, bound exhaustion, stable ties, invalid costs, and no mutation. Executor tests cover target binding, pre-commit revalidation, exactly-once effects, atomic recovery, defense interruption, pause, and disposal. Cross-profile tests prove parameter isolation and generic movement/melee reuse. Integration tests cover all five spawn factories and absence of legacy competing writers.

Browser acceptance uses the current game and a controlled full-roster fixture: no change in controls/presentation; real Archer arrow release; repeated eligible melee; Goblin bush damage and alternate-target priority; passive Monk; distinct hidden-player knowledge; awareness transition stops; blocked route recovery; pause/resume and removal. Include at least 20 mixed enemy instances for a bounded-work exercise, report actual planning and navigation work and frame timings on the test machine, and test urgent adjacency while ordinary search is saturated. Do not claim faster AI without measurements.

The prior exploration reviewed these resources. They inform the separation of planning, facts, and execution; exact algorithms and tuning above are project design choices:
- [13luck: Building a Game Bot with GOAP](https://tezee.art/articles/building-game-bot-goap?lang=en): pure fact/action planning and the need to keep the state space small.
- [Jeff Orkin: Three States and a Plan](https://www.gamedevs.org/uploads/three-states-plan-ai-of-fear.pdf): planning above actor execution, with reusable goals and action sets.
- [CrashKonijn GOAP architecture](https://goap.crashkonijn.com/upgrading/core-concepts): action provider/executor separation, sensing, and lifecycle validation.

## Risks / Trade-offs

- Model and real world diverge -> revalidate live preconditions, observe actual completion, and never apply simulated damage to gameplay.
- Several systems still write movement -> disconnect legacy decisions per migrated actor and test one owner through the real spawn/update path.
- Replanning creates hesitation or repeated switching -> immediate validated adjacent plans, stable bindings, event-driven replans, and bounded retries.
- Pathfinding dominates despite a cheap planner -> separately budget and measure reachability/candidate work; do not run pathfinding inside every search branch.
- New ranged positioning makes Archer behavior different -> constrain it to stopping in existing attack range, with no kiting, extra visibility, accuracy, or damage.
- Older specs disagree with current tests or newer deltas -> use the explicit compatibility baseline and record discrepancies; do not fix unrelated gameplay during migration.
- Main loop overlaps ongoing UI work -> inspect current diffs before edits, change only enemy integration, and verify the existing UI flow afterward.
- Legacy IDs are duplicated or absent in unrelated changes -> use unique C063 and full change names for ambiguous references; do not perform an unrelated ID repair.

## Migration Plan

1. Capture existing roster behavior in focused tests and a baseline browser fixture; record the compatibility discrepancies above.
2. Add pure planner/executor/profile validation and shared navigation/actions while existing runtime remains functional.
3. Migrate Archer as the first integration seam, proving actual shooting and range-aware planning. During development a temporary factory switch can select exactly one decision path per instance; it must never run both.
4. Migrate Warrior and Lancer melee and defense coordination, Monk movement/observation, then Goblin alternate-target and bush behavior. Completion requires all five profiles, not just the pilot.
5. Make GOAP the only default for all enemy factories, remove the temporary switch and unused autonomous wiring, preserve required actor/demo APIs, and run roster-wide validation.
6. Run focused regressions, the repository test suite, production build, strict C063 validation, and real-browser acceptance. Record measured budgets and observed behavior changes with the results.

Recovery during implementation uses additive corrective edits or a temporary single-owner factory selection; final release contains no legacy fallback that hides migration failures. Do not discard unrelated changes or rewrite Git history. Archiving and synchronizing unrelated OpenSpec changes are outside this implementation.

## Confirmed interview decisions

Archer stands and shoots at close range; profiles remain code-only; travel and search share the existing investigation timer; defense stays an immediate reflex. Add Enemy AI Labels to Developer Settings using debug.showEnemyAiLabels, false by default, persisted/reset through the existing store. Draw Goal and Action (including waiting/recovery/defense) above living enemies independently of colliders. Labels are passive, follow the displayed actor, disappear on disable/death/disposal, and never reveal hidden coordinates. Existing snapshots remain available. No new Tiled format or tactical retreat is included.
## Implemented detail

See `stealth-steel/src/runtime/ai/README.md` for the compatibility matrix, action contract, code-profile units and exact frame ownership. Navigation uses 256-cell resumable slices with a 4096-cell frame cap. Ordinary planning has a 1024-expansion frame cap; immediate one-action plans are counted separately. The old Archer automatic selector and all legacy production controller wiring are removed. Existing controller modules remain only for historical fixtures/tests. Optional labels are rendered before the collider early return and use the existing camera transform. Browser acceptance includes toggle independence, persistence/reset, resize, all five types and dead/disposed cleanup.
