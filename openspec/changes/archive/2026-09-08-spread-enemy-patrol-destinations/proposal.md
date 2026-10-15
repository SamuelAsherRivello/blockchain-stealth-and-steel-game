## Why

Enemies currently choose patrol movement independently, so the group can cluster and leave much of the accessible level lightly covered. Patrol choices should usually spread enemies out while retaining randomness and allowing occasional nearby destinations.

## What Changes

- Bias normal patrol destination selection toward space farther from other living enemies and their active patrol destinations, using the full logical level rather than the camera viewport.
- Keep every otherwise legal destination possible; separation is a preference, with no hard exclusion radius or exclusive territory.
- Apply the shared policy to Goblin, Warrior, Lancer, Archer, and Monk, including both route patrol and timed patrol step decisions.
- Preserve existing reachability, occupancy, patrol timing, route-distance and home-radius limits, recovery, and higher-priority behavior.
- Expose the currently selected patrol destination for coordination and verification, clearing it when the patrol ends or is interrupted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-action-library`: Add group-aware soft patrol spreading to the shared patrol action, with deterministic random selection and transient destination coordination.

## Impact

- Runtime changes are expected in `stealth-steel/src/runtime/ai/actions/patrol.js`, `enemy-brain.js`, a pure patrol selection helper, and enemy snapshot wiring in `stealth-steel/src/runtime/main.js`.
- Add focused selection, action lifecycle, and multi-enemy integration tests plus browser verification. No dependencies, spawn placement changes, or authored map changes are required.
- C069 is the permanent change identity; implementation tasks use permanent C069-T### identifiers.
- Interpretation: “next spawn location” means the next destination of an already spawned, patrolling enemy. Wider coverage means improved group spread within existing legal patrol areas; removing Goblin's home radius and maintaining historical visited-area coverage are outside this change.
