## MODIFIED Requirements

### Requirement: Damage is applied only by defined sources and amounts
The system SHALL apply damage only through the defined interaction matrix and
SHALL ignore all other contact sources for damage. A successful player knife swing SHALL deal exactly 25 damage once to each eligible living Goblin, Warrior, Lancer, Archer, or Monk through direct damage-collider overlap at the swing midpoint. Knife hits SHALL retain existing hit feedback, supported knockback, and death handling; projectile-only defense SHALL not reject knife hits. An arrow approaching from
the direction the Warrior is already facing SHALL always trigger defense and
deal no damage. An arrow approaching from behind SHALL never trigger defense
and SHALL reduce Warrior health by 50. An upward-moving arrow SHALL be defended
only when its 50% defense attempt succeeds. A downward-moving arrow SHALL never
be defended and SHALL reduce Warrior health by 50.

#### Scenario: Sheep is hit by goblin
- **WHEN** the sheep collider overlaps a goblin collider as a result of touch
- **THEN** sheep health is reduced by 100 and no other damage type is applied in the same frame

#### Scenario: Hero shoots sheep
- **WHEN** a hero arrow collider overlaps a sheep collider
- **THEN** sheep health is reduced by 100

#### Scenario: Hero shoots goblin
- **WHEN** a hero arrow collider overlaps a goblin collider
- **THEN** goblin health is reduced by 50

#### Scenario: Hero shoots undefended Warrior
- **WHEN** a hero arrow approaches from behind and overlaps the Warrior
- **THEN** Warrior health is reduced by 50 and the normal arrow-hit lifecycle applies

#### Scenario: Hero shoots defending Warrior
- **WHEN** a hero arrow approaches from the direction the Warrior is facing and overlaps the Warrior
- **THEN** Warrior health does not change and the arrow enters its deflected lifecycle

#### Scenario: Upward arrow hits Warrior
- **WHEN** an upward-moving hero arrow overlaps the Warrior after its 50% defense attempt
- **THEN** it is deflected for no damage on success or reduces Warrior health by 50 on failure

#### Scenario: Downward arrow hits Warrior
- **WHEN** a downward-moving hero arrow overlaps the Warrior
- **THEN** Warrior health is reduced by 50 and the normal arrow-hit lifecycle applies

#### Scenario: Hero walks into goblin
- **WHEN** the hero collider overlaps the goblin collider while the hero is moving
- **THEN** goblin health is unchanged unless a knife swing reaches its midpoint with overlapping damage colliders

#### Scenario: Goblin damages hero only during attack swing
- **WHEN** the goblin is in an active swing damage phase and its damage window overlaps the hero
- **THEN** hero health is reduced by 25

#### Scenario: Goblin touching hero outside attack swing
- **WHEN** the goblin overlaps the hero while not in an attack damage phase
- **THEN** the hero health does not change

#### Scenario: Knife hits each enemy type
- **WHEN** a successful knife swing hits a living Goblin, Warrior, Lancer, Archer, or Monk
- **THEN** its health decreases by exactly 25 once and existing hit or lethal feedback runs

#### Scenario: Four isolated knife hits defeat an enemy
- **WHEN** an enemy starting at its existing 100 health receives four successful knife hits with no other damage
- **THEN** its health progresses through 75, 50, 25, and 0
- **AND** at zero health its existing death lifecycle begins and it stops accepting damage
