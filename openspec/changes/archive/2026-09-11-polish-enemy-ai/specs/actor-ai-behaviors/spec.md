## MODIFIED Requirements

### Requirement: Goblin patrol decisions may select environmental mischief
At each new patrol decision, after resolving any eligible player or sheep attack, the initial goblin SHALL use its configured deterministic random source to select bush burning with a 35 percent probability. A failed roll SHALL continue normal patrol selection. Bush burning SHALL NOT interrupt an active attack, recovery, or patrol route.

#### Scenario: Mischief roll succeeds
- **WHEN** the goblin reaches a new patrol decision with no eligible player or sheep attack and the configured roll is below 0.35
- **THEN** it searches the entire logical map for a reachable living bush

#### Scenario: Mischief roll does not succeed
- **WHEN** the goblin reaches a new patrol decision and the configured roll is 0.35 or greater
- **THEN** it chooses its normal spawn-bounded patrol behavior without searching for a bush

#### Scenario: Combat target has priority
- **WHEN** an eligible player or sheep is in attack range at the same decision where bush burning could be selected
- **THEN** the goblin attacks that character without making a bush-burning roll

## ADDED Requirements

### Requirement: Monks flee rather than attack nearby players
A Monk SHALL never voluntarily damage the player, sheep, or any other actor. When a living Monk has existing-perception permission to react to the player and the player is within a cardinal grid distance of two cells or fewer, it SHALL give that proximity flee priority over patrol and gold seeking. The Monk SHALL select a safe, reachable destination whose cardinal grid distance from the player is between two and four cells inclusive, preserving normal world-boundary and collision constraints.

#### Scenario: Player is two cells away
- **WHEN** a Monk with eligible player perception evaluates its normal decision and the player is exactly two cardinal grid cells away
- **THEN** it selects a two-to-four-cell flee route instead of attacking, patrolling, or seeking gold

#### Scenario: Player is not perceptible
- **WHEN** a player is within two cells but the Monk is not permitted to react under the existing concealment and perception rules
- **THEN** the Monk does not use the hidden player's location to choose a flee route

#### Scenario: Monk is adjacent to a player
- **WHEN** a living Monk is cardinally adjacent to an eligible player
- **THEN** it starts a valid flee route and does not issue a voluntary attack

### Requirement: Monks may seek gold without collecting it
At each normal decision after the configured idle interval, when not preempted by an eligible proximity flee, a Monk SHALL use its configured deterministic random source to select gold seeking with a 45 percent probability. On success, it SHALL route toward the nearest reachable living gold pickup using the authoritative gold snapshot and stable snapshot order to break equal route lengths. Arriving at or moving through a gold pickup SHALL NOT collect it, change its world state, or change any pickup counter; existing player-only pickup rules remain authoritative.

#### Scenario: Gold-seeking roll succeeds
- **WHEN** a Monk reaches a post-idle normal decision, no eligible proximity flee applies, and the configured roll is below 0.45
- **THEN** it routes toward the nearest reachable living gold pickup

#### Scenario: Gold-seeking roll does not succeed
- **WHEN** a Monk reaches a post-idle normal decision and the configured roll is 0.45 or greater
- **THEN** it resumes its normal patrol decision without searching for gold

#### Scenario: Monk reaches gold
- **WHEN** a Monk reaches or crosses a living gold pickup while pursuing it
- **THEN** the pickup remains living and the player pickup counter remains unchanged

#### Scenario: No gold is reachable
- **WHEN** the gold-seeking search finds no living gold with a reachable route
- **THEN** the Monk safely returns to normal non-combat decision behavior

### Requirement: Tactical flee does not use shorter recovery escapes
When an archetype explicitly selects a tactical flee that requires a destination two to four cells from the player, it SHALL execute that action only when a safe route to a destination in that complete range is available at selection time. If no such route is available, it SHALL abandon the tactical flee and return to that archetype's normal behavior; it SHALL NOT use a one-cell or otherwise shorter recovery escape as a substitute. This rule applies to the Warrior's knife-impact flee response and the Monk's player-proximity flee, while ordinary recovery for already-started movement retains its shared behavior.

#### Scenario: Warrior tactical flee has no valid destination
- **WHEN** a Warrior selects its knife-impact flee outcome but no safe reachable destination is two to four cells from the player
- **THEN** it abandons the tactical flee and follows its normal fight-or-take-hit behavior without selecting a shorter escape

#### Scenario: Monk proximity flee has no valid destination
- **WHEN** a Monk has an eligible player within two cells but no safe reachable destination is two to four cells from that player
- **THEN** it abandons that flee attempt and returns to its normal non-combat behavior without selecting a shorter escape
