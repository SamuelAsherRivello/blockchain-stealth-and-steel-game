## Context

See proposal.md for motivation and scope. The live game creates shared brains in `stealth-steel/src/runtime/main.js`. The shared action in `ai/actions/patrol.js` randomly chooses reachable candidates for Goblin's bounded route patrol; other profiles use timed one-cell steps and always continue straight when possible. Changing the older `enemy-patrol-controller.js` alone would miss production behavior.

The brain currently exposes an injected random chooser and navigation snapshots, but no patrol destination. Its world callback contains sheep and bushes, so teammate data needs a separate input to avoid making enemies eligible combat targets accidentally. Navigation already provides bounded, scheduler-budgeted reachability and live step validation.

## Goals / Non-Goals

**Goals:** Keep selection pure and deterministic, share it across all five enemy profiles, and coordinate active intent without coupling mutable plans between brains.

**Non-Goals:** A new GOAP goal, flocking or movement forces, per-frame global search, territory assignment, exclusive reservations, historical coverage heatmaps, changing spawn locations, or expanding existing patrol ranges.

## Decisions

### Rank existing candidates by nearest teammate separation

Add a pure selection helper taking legal candidates, the selecting enemy ID, fresh teammate snapshots, and injected randomness. Each peer contributes its current authoritative GridSpot and, if present, its selected patrol destination. Score a candidate by the minimum Manhattan distance to any of these points. The nearest occupied or intended area determines how crowded that choice is; one distant peer cannot outweigh a nearby cluster. Duplicate points do not change a minimum.

Use the full logical level coordinate system. Reachability and patrol bounds continue to filter candidates before scoring. Manhattan distance is a cheap spatial coverage heuristic; route distance remains authoritative for reachability. Computing pairwise paths for every peer would add cost and a different meaning to geographic spread.

### Mix preferred choices with unrestricted random choices

When separation differs, use a named default preference probability of 0.8: with 80% probability choose randomly among maximum-score candidates; with 20% probability choose uniformly among all legal candidates. For N candidates and K best candidates, the preferred set has probability `0.8 + 0.2 * K / N`; every nonpreferred candidate has probability `0.2 / N`. This makes “most often apart” measurable without making gathering impossible. Use the brain's injected random source for both the branch and candidate draw, with stable candidate order and existing random boundary handling.

With no peers or equal scores, use uniform route selection. For timed patrol ties, choose straight ahead in the 80% preference branch when that candidate exists, and uniformly among all options in the 20% unrestricted branch; otherwise use uniform selection. This retains a straight-ahead preference while giving every candidate a nonzero probability. With unequal scores, the preferred branch can retain straight-ahead continuity only when it is among the best candidates; the unrestricted branch remains uniform. Reconsider at completed cell steps, not mid-step, and preserve the overall timed patrol duration. Always choosing the farthest candidate would eliminate nearby choices; hard separation thresholds could strand enemies in narrow spaces.

### Read fresh peer snapshots and publish transient intent

Add a dedicated `getPatrolPeers` brain input with an empty default, wired in main.js from the live enemy records. Return copied stable IDs, current GridSpots, and optional patrol destinations for living enemies. Exclude self by ID. Include living nonpatrolling enemies' current cells but no combat, player, or perception knowledge. Do not reuse the sheep target list.

Store selected patrol intent per brain/action and expose a copied `patrolDestination` in the existing immutable navigation snapshot. Set it when the reachability selector commits a destination, rather than when an asynchronous search starts. Read peers when that selector executes, so subsequent choices in the same update see earlier selections even when searches span scheduler frames. Peer access must read stored state only, with no recursive peer lookup. A one-cell timed step publishes that step's destination; a route patrol publishes its final cell.

Clear intent through all success, failure, cancellation, awareness/combat preemption, defense/displacement, death, disposal, and level teardown paths. Filter dead or removed records immediately even before a brain's next update. Existing normal-patrol escape candidates can use the preference when convenient, but dedicated emergency escape/retry behavior must remain free of spacing constraints. No shared reservation table is needed; transient per-enemy values naturally disappear with their owners.

### Verify distribution and visible group behavior

Use deterministic branch/choice inputs to prove positive probability for nearby options, preference for separated options, tie behavior, and one-candidate fallback. Cover self/dead/non-enemy exclusion, current versus intended position influence, same-update selection, cancellation and reset, and both production patrol modes.

For a repeatable multi-enemy open-grid fixture, run a fixed bank of random seeds against the current independent policy and the new policy. Record average nearest-neighbor distance and occupied coarse level sectors after warm-up; require improved mean separation and no reduction in mean occupied sectors. Keep terrain, spawns, durations, seeds, and observation times identical. This compares group outcomes rather than merely restating the scoring formula. Also cover a constrained corridor where grouping is necessary. In a real browser, observe production mixed enemies over multiple idle/patrol cycles, including occasional close choices and continued combat/awareness interrupts. Record evidence and any tuning in verification.md.

## Risks / Trade-offs

- Local maxima and timed-step direction changes can produce edge crowding or jitter -> Preserve continuity for ties, hold an active step stable, and validate whole-group spread over time in the fixture and browser.
- Spatial distance can count an enemy across a wall as nearby -> Accept this as a level-area heuristic; only reachable candidate routes can execute.
- Home bounds and disconnected terrain limit total coverage -> Keep their existing contracts; this is a bias toward wider spread, not a guarantee that every level cell is patrolled.
- Sequential decisions retain some update-order bias -> Publish immediately, use stable ordering, and keep the unrestricted random branch; no global synchronized assignment is required.
- Scoring costs O(candidates * living enemies) -> Run only on destination selection and preserve existing navigation search budgets; do not add per-frame whole-level scans.

## Migration Plan

Implement the helper and tests, connect per-brain intent and live peer snapshots, then integrate both shared patrol modes. Run focused tests, the full unit suite, production build, and browser checks before marking tasks complete. No saved-state or map migration is required. If behavior needs rollback, an additive follow-up change can restore the original selector and clear unused intent without rewriting history.
