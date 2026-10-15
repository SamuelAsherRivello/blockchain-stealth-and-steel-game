## Why

The player's one-button dagger attack is currently a flat repeated swing: it neither rewards deliberate rhythm nor makes spam a meaningful tactical choice. One hit-confirmed dagger combo will make mastery legible through damage, timing, and audiovisual feedback without adding weapons or controls.

## What Changes

- Add C072's internal, playtest-tunable one-button dagger combo profile: press rhythms classify attacks as Rapid Triple, ordinary, or over-fast.
- Add one hit-confirmed dagger combo. Rapid Triple escalates into a visual jump finisher.
- Allow a single next attack request to be buffered while a dagger swing is active, then execute it only through the selected combo lifecycle. A miss ends the affected target's combo progression.
- Preserve the existing dagger collider and overlap targeting while allowing combo-specific animation direction, speed, and impact timing. Combo damage applies independently to every overlapping living enemy.
- Apply a one-second cooldown only after an over-fast three-press sequence; other off-rhythm attacks remain ordinary and safe.
- Add confirmed-combo feedback: reusable particles, player and enemy flashes, and attack/damage sound-pitch variation.
- Permit the Rapid Triple's visual-only jump presentation without adding a player-controlled jump or changing ground collision.

## Capabilities

### New Capabilities

- `player-dagger-combos`: Classify one-button dagger rhythms and resolve Rapid Triple, ordinary attacks, and the over-fast penalty.

### Modified Capabilities

- `player-melee-combat`: Replace the fixed, non-buffered, midpoint-only knife lifecycle with a combo-aware dagger lifecycle while retaining its collider contract.
- `combat-health-system`: Define base and combo dagger damage amounts for every overlapping eligible enemy.
- `virtual-player-controller`: Preserve the single Attack control while allowing buffered deliberate presses and a combo-only visual jump exception.
- `reusable-particle-effects`: Support disposable, gameplay-owned player-combo particle instances alongside the existing preview and bush consumers.

## Impact

- Affected runtime areas: `stealth-steel/src/runtime/characters/player/player.js`, `gameplay/player-melee.js`, `main.js`, audio hooks, and particle-effect lifecycle integration.
- Affected test areas: player knife/input, player melee/combat health, virtual controller, particle effects, audio, and browser-visible knife-combo fixtures.
- No new dependency, player-facing settings UI, weapon, button, projectile, collider shape, player-controlled jump, or enemy status system is introduced.
