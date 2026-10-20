# Spec Delta

## MODIFIED Requirements

### Requirement: Shared actor lifecycle with unique behavior
All runtime characters MUST use the shared actor lifecycle for sprite creation, transform updates, animation lifecycle, visual effects, diagnostics, and disposal. Character-specific behavior MUST remain independently definable, and all five enemy types MUST use the same visual lifecycle while retaining their distinct gameplay controllers and animation catalogs.

#### Scenario: Character-specific behavior
- **WHEN** characters perform distinct actions such as healing, guarding, fleeing, attacking, or ranged firing
- **THEN** those behaviors remain character-specific while spatial and sprite lifecycle behavior follows the shared actor contract

#### Scenario: Five enemy implementations share visual lifecycle
- **WHEN** Archer, Goblin, Warrior, Lancer, or Monk is created or updated
- **THEN** its sprite creation, transform updates, animation lifecycle, visual effects, and disposal follow the same shared actor path
