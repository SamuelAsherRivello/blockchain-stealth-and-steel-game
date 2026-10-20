# Spec Delta

## MODIFIED Requirements

### Requirement: Collider diagnostics render shared occupancy markers
Collider-mode diagnostics SHALL render a small solid black center dot for every active player, enemy, and NPC character using the current visual rotation center used by its artwork pivot. Diagnostic records without a visual rotation center MAY fall back to the current movement-collider center. Existing logical-grid occupancy X markers, when enabled separately, SHALL remain independent of these live pivot dots.

#### Scenario: Diagnostics are enabled
- **WHEN** Physics Colliders diagnostics are enabled
- **THEN** every active character shows one black dot at the current artwork rotation center, including while the character is moving within a grid cell

#### Scenario: Character has different collider roles
- **WHEN** a character has both combat and movement colliders
- **THEN** the black dot is placed at the artwork rotation center used for death rotation, not at the combat rectangle's center unless those centers coincide

#### Scenario: Diagnostics are disabled
- **WHEN** Physics Colliders diagnostics are disabled
- **THEN** live physical-center dots are absent
