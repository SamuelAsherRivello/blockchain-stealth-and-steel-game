# Proposal

## Why

The five enemy types currently expose the same gameplay-facing actor contract but use two different visual implementations: Monk uses the shared character actor while Archer, Goblin, Warrior, and Lancer each duplicate sprite-layer, animation, transform, and disposal code. This makes death rotation pivots difficult to tune consistently and makes visual regressions more likely while adding no gameplay value.

Collider diagnostics also expose collider shapes without a direct marker for the live character center, making it difficult to verify the exact pivot and ground-registration point used by movement, artwork, and death rotation.

## What Changes

- Consolidate all five enemy renderers behind one shared character visual/lifecycle contract while retaining each enemy's existing animation catalog, behavior controller, attack/defense/heal behavior, movement geometry, and asset identity.
- Define explicit per-enemy artwork pivots and offsets through the shared contract, and ensure death scaling and rotation use the configured artwork pivot rather than an implicit center or unrelated anchor.
- Preserve current animation selection, animation timing, visual effects, depth ordering, transform behavior, disposal, and combat lifecycle.
- When collider diagnostics are enabled, draw a small solid black dot at the current center of every active character's movement collider, including enemies, player, and NPCs.
- Keep existing collider shapes, colors, ordering, coordinate markers, and gameplay collision routing unchanged except for the added center dots.

## Capabilities

### New Capabilities

- `enemy-rendering-contract`: Defines the shared visual actor contract, per-enemy artwork pivot configuration, and pivot-anchored death transforms for all five enemy types.

### Modified Capabilities

- `character-spatial-contract`: Require all five enemies to use the shared visual/lifecycle path while retaining explicit character-specific spatial pivots and offsets.
- `character-perception-debug-rendering`: Add live black center dots to collider-mode diagnostics for every active character.

## Impact

Affected runtime enemy character modules under `stealth-steel/src/runtime/characters/enemies/`, the shared character actor/transform contract, combat death visual-transform integration, `main.js` diagnostic assembly/rendering, and related unit/browser tests. No new dependency, asset format, map data, or gameplay rule is required.
