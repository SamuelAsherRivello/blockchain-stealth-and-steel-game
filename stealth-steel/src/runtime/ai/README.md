# Shared enemy GOAP (C063)

All five production enemy factories attach `createEnemyBrain`. Player and Sheep retain their own controllers. No runtime dependency or Tiled setting was added.

## Compatibility baseline

| Enemy | Preserved behavior | Profile differences |
| --- | --- | --- |
| Goblin | Eligible player first, nearby Sheep, occasional nearest reachable bush; existing fire animation and 50 damage; 1.25 s recovery | Route patrol of 2–5 cells, home radius 4 (Chebyshev distance), one 0.25 bush roll per normal decision; direction-style attack |
| Warrior | Player melee, both callable attack variants, automatic frontal defense and cancelled impacts when guarding | Timed patrol; variant-style melee |
| Lancer | Cardinal thrust artwork/facing, committed heading, player melee | Timed patrol; actor chooses directional animation; production still does not supply auto-defense projectiles |
| Archer | Inclusive 256 px shot range, 320 px facing range, exact own-cell centering, captured aim, frame-5 arrow release, 0.75 s recovery | Ranged capability; approaches a known player outside range and stands/shoots when close |
| Monk | Patrol and all four awareness states; no automatic attacks or healing | Only the five movement/observation actions |

Common idle duration is 3–5 s; timed patrol duration is 2–5 s. Perception retains suspicion 1–3 s, investigation 8 s, direction dwell 2 s, visual alert 3–5 s. Investigation travel and looking use that same timer. An unaware enemy cannot see, attack or traverse a player-occupied bush. Each enemy's visually confirmed hidden tracking expires independently; an adjacent interaction does not grant distant knowledge.

Warrior's existing selector excludes vertical arrows. Lancer's defense capability remains callable but unwired in production. These pre-existing boundaries were preserved. Existing C055 entry stops, C056/C060 adjacency and concealment, and C057 exact centering still apply.

Deliberate gameplay changes are limited to Archer approach-to-range and safer invalid-plan recovery/target retention. Defense stays an immediate actor reflex. Existing UI/camera work in the checkout is separate from C063.

## Ownership and folder layout

```text
runtime/
|-- ai/
|   |-- goap/planner.js           pure bounded uniform-cost search
|   |-- goap/executor.js          one action instance and generation
|   |-- enemy-brain.js            priority, bindings, lifecycle
|   |-- enemy-facts.js            permitted per-enemy knowledge
|   |-- enemy-profile.js          defaults and capability validation
|   |-- planning-scheduler.js     pending planning and navigation budgets
|   |-- navigation.js            resumable cardinal BFS and physical progress
|   |-- enemy-ai-labels.js        passive canvas view
|   `-- actions/
|       |-- wait.js   patrol.js   move-to.js   face.js   search.js
|       `-- melee.js  ranged.js   burn-bush.js  index.js
|-- characters/enemies/
|   |-- enemy-action-adapter.js
|   |-- player-attack-preparation.js
|   `-- {goblin,warrior,lancer,archer,monk}/{type}-goap.js
`-- main.js                      spawn, reaction clock, brain, actor, dispose
```

The main loop advances reaction time once, computes scheduled plans, then checks each enemy's current priorities before starting/ticking its executor. Actors advance preparation and physical movement once; the existing animation manager and impact/projectile systems retain their clocks. A scheduled result never starts an attack during scheduling. This prevents a pending Sheep/bush plan from committing before fresh player-adjacency checks.

Priority is death/pause/defense and forced locks, protected attack lifecycle, eligible adjacent player, other eligible combat, awareness, then ordinary activity. A changed goal cancels interruptible movement. A committed attack retains target and recovery. Once recovery ends, eligible combat can restart on that same update. Disposing cancels requests, preparation and navigation and invalidates executor generations.

## Action contract

An action definition has `{ id, preconditions, effects, cost, create }`. Preconditions/effects contain scalar symbolic facts; costs are finite and non-negative. Definitions are treated as immutable. `create()` allocates isolated state and returns `{ start(context), update(context, delta), cancel(reason), phase, reason, committed }`. `update` reports `running`, `succeeded`, `failed` or `cancelled`. Never store a timer, target progress or route on a shared definition. Asynchronous extensions must capture an executor generation and check `isCurrent(generation)` before completing.

The brain binds one goal's target ID and eligibility rule before generating candidates. Its tiny symbolic world is `{ atPosition, done }`, local to that binding; it never combines facts from different target candidates. Planning predicts effects on copied facts; only execution invokes damage or shooting. Goals are selected by the existing priority policy, while the planner composes actions that achieve them.

For Archer, an out-of-range observation produces `[move-to, ranged]` from the actions' preconditions/effects. Navigation chooses a reachable center within 256 px. When already eligible, the planner produces `[ranged]`. The adapter uses existing exact-centering preparation, rechecks live eligibility, captures aim on accepted `shootAt`, then observes the actor's shot and recovery. A missed arrow does not imply a hit in planner facts. Search ends when the existing awareness state changes, not because the action grants itself a second timer.

Two profiles reuse exactly the same melee action:

```js
createEnemyProfile({ id: 'warrior', actions: [...COMMON_ACTIONS, 'melee'],
  attackStyle: 'variant', attackVariant: 'attack-1', targets: ['player'] });
createEnemyProfile({ id: 'goblin', actions: [...COMMON_ACTIONS, 'melee', 'burn-bush'],
  attackStyle: 'direction', recoverySeconds: 1.25, targets: ['player', 'sheep'] });
```

Durations and retry/recovery are seconds, firing/facing ranges are world pixels, patrol distance/home bounds/melee adjacency are cells, costs are unitless weights, and bush chance is a probability from 0 to 1. Profiles are deeply copied/frozen and validated; supported action capabilities must exist on the actor. No planner branch names a character. Adding an action means adding its definition/execution, registering its capability, then selecting it in a profile and goal policy with actual gameplay tests.

## Bounds and recovery

Uniform-cost search has depth 8 and 256 expansions per request. Stable insertion order breaks cost ties, and state/depth dominance rejects cycles. The scheduler caps ordinary planning at 1024 expansions per active frame. Eligible immediate combat uses the same planner's one-action case (one expansion), counted separately as `immediate`; it cannot be delayed by ordinary work. Only complete plans execute.

Resumable BFS has a separate 4096-cell frame budget and takes at most 256 cells per slice. Counters record actual consumed cells, refunding unused allowance. Incomplete scans remain pending. Search respects configured grid origin/dimensions and collider segment checks; execution revalidates each segment. One second without physical progress fails the route. One safe cardinal escape is attempted before a three-second active-time retry; new urgent adjacent combat can preempt that wait. Patrol preferences may relax for the safety escape, while collision and concealment never relax. A valid bound bush is retained while travelling.

## Diagnostics and verification

`brain.getNavigationSnapshot()` returns a deeply frozen copy: identity, goal, remaining plan, phase/action, permitted evidence/target ID, failure/replan reason, and work/retry/navigation fields. Main exposes these through its existing development canvas dataset, plus scheduler work in `data-ai-work`. Snapshots contain no forbidden live hidden-player coordinates.

Developer → Debug Draw → **Enemy Tasks** uses `debug.showEnemyAiLabels`, false by default, with persistence and Clear All Settings. Light text on a dark canvas rectangle shows `Goal` and `Action`, including waiting, attack recovery and defense. The debug canvas draws labels independently of the other visualization toggles, follows the camera and art jump, clips/clamps at viewport edges, and remains non-interactive. Clearing each frame removes disabled/dead/disposed labels.

Unit coverage lives in `src/test/ai/`; the existing adjacency and attack-preparation suites now instantiate real actors with GOAP. `src/test/browser/goap-roster.html` renders 20 real actors with production animation, projectile, melee-impact and reactive-bush code. Parameters: `mode=combat|roam|blocked|range|bush|knowledge`, cardinal `dx`/`dy`, `startX`/`startY`, duration, and optional deterministic `step` in seconds. Default uses wall-clock delta. Result JSON is on `#result[data-result]`, including planning/navigation and frame measurements. `step=0.1` is useful for background-throttled browser acceptance; do not interpret those frame intervals as foreground game performance.

The initial baseline had 804/805 passing tests; the failure was the unrelated public UI image-folder rule. Final acceptance results are recorded in C063's `verification.md`.
