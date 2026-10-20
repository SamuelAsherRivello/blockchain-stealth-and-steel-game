# Design

## Context

See `proposal.md` for motivation. Monk already uses `shared-character-actor.js`, while Archer, Goblin, Warrior, and Lancer each duplicate Sprite2D layer creation, animation visibility, positioning, visual-transform, and disposal logic. The Babylon Lite renderer uses a layer-wide normalized pivot: the layer pivot is the point that lands at `positionPx` and the center of rotation. Existing enemy-specific frame sizes, artwork pivots, offsets, animation catalogs, colliders, and behavior state machines must remain authoritative.

## Goals / Non-Goals

**Goals:**

- Provide one shared visual/lifecycle implementation for all five enemies.
- Keep behavior modules responsible for their existing movement, AI, attacks, defense, healing, projectile, and recovery rules.
- Make every death scale/rotation transform use the enemy's explicit artwork pivot.
- Add a live black center dot for every active character while Physics Colliders diagnostics are enabled.
- Preserve the existing red combat and blue movement collider rendering and the separate coordinate/grid markers.

**Non-Goals:**

- Rewriting enemy AI or attack/defense state machines.
- Changing animation sheets, frame counts, animation durations, colliders, render-depth rules, death durations, or damage values.
- Adding a per-enemy ground-shadow node or changing the existing global perception/stealth shadow layers.
- Moving character configuration into Tiled or introducing a new rendering dependency.

## Decisions

### Extract a shared visual actor core, not a single universal behavior class

Create one reusable visual actor path that owns animation layers, active animation visibility, sprite transforms, configured pivot/offset, visual effects, and disposal. Enemy factories retain thin adapters for behavior-specific state and delegate visual work to that core. This keeps the five enemies organized consistently without forcing Archer's shooting lifecycle or Warrior/Lancer defense logic into Monk's simpler actor.

An alternative was to make every enemy a direct instance of the existing shared movement actor. That would require moving bespoke attack and movement transitions into generic hooks and risks changing behavior. The visual-core boundary removes duplication while preserving those controllers.

### Treat the artwork pivot as per-character authored data

Each character definition will expose frame size, display size, normalized artwork pivot, and art offset together with its animation descriptors. All five enemy artwork pivots and the player artwork pivot are explicitly centered at `[0.5, 0.5]`, and their visual anchors are aligned to the logical grid/collider center; gameplay collider pivots remain authoritative. The renderer will use that same centered artwork pivot for layer creation and every size/rotation transform, so death rotation is visibly anchored at the center of the main PNG artwork inside the occupied grid spot.

Death rotation remains driven by the existing combat actor tween. The actor only supplies rotation, scale, alpha, and color; the shared visual renderer applies them around the configured layer pivot without moving the logical actor position or colliders.

### Derive diagnostic dots from the live visual rotation center

The diagnostic character records expose the current visual rotation center used by the Sprite2D layer pivot. Add a pure command helper that uses that point for characters with a visual pivot, falling back to the movement-collider geometric center for non-visual diagnostic records, and a small filled-dot renderer that maps world Y to the debug canvas. Draw these dots after the collider outlines when `showColliders` is true. Keep logical grid X markers behind their existing Coordinates toggle and do not derive the new dots from grid spots, combat colliders, or stale snapshots.

### Validate through behavior-preserving tests

Add unit coverage for the shared visual core's pivot and transform options, each enemy's pivot/animation registration, and death rotation updates. Add diagnostics tests for circle and rectangle centers, all-character inclusion, black-dot styling, and the Physics Colliders visibility gate. Run existing enemy behavior, combat/death, collider-role, and browser smoke checks to catch lifecycle or alignment regressions.

## Risks / Trade-offs

- [Risk] A visual-core migration can accidentally alter a bespoke enemy's animation transition. → Mitigation: keep existing behavior functions and animation names intact, route only sprite/layer lifecycle through the shared core, and preserve each catalog's frame metadata.
- [Risk] A pivot tuned for one frame set may look wrong during another animation or scaled death transform. → Mitigation: keep pivots explicit per character, inspect all animation states with collider dots enabled, and test death transforms for every enemy.
- [Risk] Center dots may be confused with existing logical grid markers. → Mitigation: draw them only with Physics Colliders, use a filled black dot, and leave the existing Coordinates/grid X markers and toggle unchanged.
- [Risk] Removing duplicated disposal paths may leak or double-remove sprites. → Mitigation: make the shared core idempotent and retain lifecycle tests for spawn, animation switch, death, disposal, and revive.

## Migration Plan

1. Introduce the shared visual-core contract and migrate Monk first as the existing reference implementation.
2. Migrate Archer, Goblin, Warrior, and Lancer one at a time, preserving their public actor methods and behavior controllers.
3. Route combat death transforms through the shared pivot-aware visual path and add the collider center-dot diagnostics.
4. Run the focused and full test suites plus a browser inspection of each enemy with Physics Colliders enabled.

Rollback is a source revert: the change has no saved-data, map, asset, or external API migration.
