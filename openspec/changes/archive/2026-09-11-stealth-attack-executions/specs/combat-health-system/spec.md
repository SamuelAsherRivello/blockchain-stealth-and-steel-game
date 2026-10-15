## MODIFIED Requirements

### Requirement: Death animation triggers at zero health
When an entity health reaches 0 or below, the entity SHALL stop voluntary movement and SHALL run a 250ms death animation unless a defined stealth execution applies. Normal non-player entities SHALL animate in place. The player SHALL complete the lethal hit's collision-limited knockback during its normal death animation, without accepting further attacks or player input. A stealth execution target SHALL instead receive a stronger execution knockback while shrinking, fading, and rotating three full times across 0.8 active seconds.

#### Scenario: Entity dies from projectile
- **WHEN** hero arrow damage causes a target health to reach 0 or below
- **THEN** the target stops moving immediately and plays a 250ms in-place death animation that scales from current scale to 0, fades opacity from 1 to 0, and rotates randomly by -20° or +20°

#### Scenario: Player dies from an enemy hit
- **WHEN** an enemy hit reduces player health to zero or below
- **THEN** the player receives that hit's knockback while shrinking, fading, and rotating for 250ms, and finishes forced travel before death completion

#### Scenario: Enemy dies from a stealth execution
- **WHEN** a current rear-cell execution defeats a living enemy
- **THEN** that enemy receives the defined stronger execution knockback while shrinking and fading through three full rotations for 0.8 active seconds

## ADDED Requirements

### Requirement: Stealth execution is a defined lethal combat source
A valid stealth execution SHALL reduce only its selected living enemy to zero health immediately. It SHALL reveal the existing health meter's zero state and remove that enemy's active combat collider during its execution death presentation. It SHALL not apply ordinary knife damage to the target or any other entity.

#### Scenario: Execution target is living
- **WHEN** the player begins a valid execution against its selected living enemy
- **THEN** that enemy's health becomes zero exactly once
- **AND** it cannot accept later damage during its death presentation

#### Scenario: Nearby enemy overlaps the player
- **WHEN** an unselected living enemy overlaps the player during an execution start
- **THEN** that enemy's health does not change because of the execution

### Requirement: Execution grants temporary player damage immunity
While a valid execution presentation is active, every defined incoming damage source SHALL leave player health unchanged. The immunity SHALL end when the 0.8-second execution presentation ends or when normal player teardown takes precedence.

#### Scenario: Arrow reaches the player during execution
- **WHEN** a gameplay enemy arrow overlaps the player during an execution presentation
- **THEN** the player takes no arrow damage

#### Scenario: Melee impact reaches the player during execution
- **WHEN** an enemy committed melee impact reaches the player during an execution presentation
- **THEN** the player takes no melee damage

