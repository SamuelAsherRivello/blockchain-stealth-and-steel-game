## MODIFIED Requirements

### Requirement: Jump functionality is absent
The player controller SHALL NOT expose, bind, or execute player-controlled jump behavior. No input, button, or independent controller animation state may lift the player or apply a jump arc. A game-owned Rapid Triple dagger finisher MAY apply a temporary visual-only vertical presentation offset; it SHALL not create a jump input, change ground position, or alter movement or combat colliders.

#### Scenario: Jump input is unavailable
- **WHEN** the player uses the former jump control or any formerly bound jump input
- **THEN** no jump state, vertical offset, or jump animation is created

#### Scenario: Dagger finisher visual jump
- **WHEN** the game-owned Rapid Triple finisher reaches its configured visual jump presentation
- **THEN** the player has no new input-bound jump behavior
- **AND** the visual offset does not move its ground position or colliders

### Requirement: Attack integrates without owning weapon behavior
Attack SHALL request the game-owned dagger lifecycle once per deliberate pointer press, accessible button activation, or non-repeated V keydown during active gameplay. The attack SHALL be available without an equipped weapon and SHALL ignore the selected weapon type. Held V SHALL not auto-repeat attacks. During an active dagger move, one later deliberate Attack request MAY be delivered to C072's bounded next-move buffer; disabled gameplay input, cooldown, and additional active-move requests SHALL create no attack or queued input.

#### Scenario: Weapon attack is available
- **WHEN** the player presses Attack or V during active gameplay while no dagger move is active and no cooldown applies
- **THEN** the game-owned dagger move begins once regardless of weapon selection

#### Scenario: One later deliberate attack is buffered
- **WHEN** Attack or V is deliberately activated once while an active dagger move has no next-move buffer
- **THEN** no second move begins immediately
- **AND** C072 receives one later deliberate request for sequence classification

#### Scenario: Weapon attack is unavailable
- **WHEN** Attack or V is activated while input is disabled, cooldown is active, or an active dagger move already has a next-move buffer
- **THEN** no new attack begins or is queued and gameplay continues without an error

#### Scenario: Accessible button activation
- **WHEN** the focused Attack button is activated with Enter or Space during active gameplay
- **THEN** one dagger request is delivered

#### Scenario: Holding V
- **WHEN** V remains held through repeated keydown events and dagger-move completion
- **THEN** repeats create no additional requests until a new deliberate press
