# Spec Delta

## Purpose

Defines a consistent visual actor contract for every enemy type so artwork,
animation lifecycle, pivot placement, death transforms, and cleanup behave
uniformly while enemy-specific gameplay remains distinct.

## ADDED Requirements

### Requirement: All five enemies use one visual actor contract
Archer, Goblin, Warrior, Lancer, and Monk SHALL use the same observable visual actor lifecycle for sprite creation, animation selection, transform updates, visual effects, and disposal while retaining their existing behavior-specific actions.

#### Scenario: Enemy-specific action remains available
- **WHEN** an enemy performs its existing attack, defense, ranged, or healing action
- **THEN** the action and animation timing remain unchanged while the shared visual lifecycle updates the active artwork

#### Scenario: Enemy is disposed
- **WHEN** an enemy is removed from the active game
- **THEN** all of its animation artwork is stopped and removed through the shared lifecycle

### Requirement: Enemy artwork uses an explicit configured pivot
Each enemy SHALL define an explicit artwork pivot and art offset used consistently for animation placement, scaling, rotation, and visual effects. The artwork pivot SHALL be the normalized center of the enemy's main PNG frame (`[0.5, 0.5]`), while the existing art offset and gameplay collider pivot remain independent.

#### Scenario: Artwork is transformed
- **WHEN** an enemy moves, changes animation, scales, or receives a visual transform
- **THEN** its artwork remains registered to the configured pivot and art offset

#### Scenario: Death rotation is applied
- **WHEN** an enemy runs its existing death rotation tween
- **THEN** the artwork rotates around the center of its main PNG artwork while its logical position and collider center remain governed by the existing character position

### Requirement: Visual consolidation preserves enemy behavior
The shared visual actor contract SHALL NOT change enemy movement, attack eligibility, attack timing, defense outcomes, healing behavior, projectile behavior, collider geometry, depth ordering, or health/death durations.

#### Scenario: Existing enemy behavior is exercised
- **WHEN** the same gameplay input, AI decision, collision, or lifecycle event is applied before and after visual consolidation
- **THEN** the enemy produces the same gameplay result and only the internal visual organization differs
