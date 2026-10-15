# Enemy Actors Specification

## Purpose

Defines a reusable enemy actor contract so individual enemy types share
predictable state, animation, movement, update, and cleanup behavior.

## Requirements

### Requirement: Enemy content has a stable organization
The system SHALL organize each enemy type beneath an `enemies/<type>/`
boundary and SHALL keep that type's behavior, state, and asset descriptors
together without coupling them to player modules. Each enemy type SHALL retain
a stable character identity across Tiled map or spawner data, actor factory
selection, and runtime lifecycle management.

#### Scenario: Adding a second enemy type
- **WHEN** a developer adds an enemy other than the goblin
- **THEN** the new type can be added under its own enemy folder while reusing
  the common enemy actor contract

#### Scenario: Selecting an enemy from authored map data
- **WHEN** Tiled map or spawner data names a supported enemy character identity
- **THEN** the matching enemy type is created without replacing or changing
  another supported enemy type

### Requirement: Enemy locomotion uses explicit states
An enemy actor SHALL expose `idle`, `walking`, and `attacking` states and SHALL
select `idle` or `walking` from its requested movement while it is not
attacking.

#### Scenario: Movement begins
- **WHEN** a non-attacking enemy receives non-zero requested movement
- **THEN** it transitions to `walking` and plays its walking animation

#### Scenario: Movement stops
- **WHEN** a non-attacking enemy receives zero requested movement
- **THEN** it transitions to `idle` and plays its idle animation

### Requirement: Attacks are atomic
An enemy actor SHALL reject a new attack while already attacking, SHALL lock
locomotion for the duration of the attack animation, and SHALL return to
`idle` or `walking` when that animation completes.

#### Scenario: Attack completes with movement requested
- **WHEN** an attack animation completes and requested movement is non-zero
- **THEN** the enemy transitions to `walking`

#### Scenario: Repeated attack request
- **WHEN** an attack is requested while the enemy is already attacking
- **THEN** the current attack continues without restarting

### Requirement: Enemy resources have a complete lifecycle
The system SHALL update all spawned enemies through the game loop and SHALL
stop their animations, remove their sprite resources, and release their
listeners or callbacks when they are disposed.

#### Scenario: Enemy disposal
- **WHEN** an enemy is removed from the active game
- **THEN** it no longer updates or renders and retains no active animation

### Requirement: Combat enemies attack a cardinally adjacent player independently of awareness
Every living Goblin, Warrior, Lancer, and Archer SHALL accept its existing attack against the living player on the next active gameplay update when their authoritative GridSpots differ by exactly one column and zero rows, or zero columns and one row, and the enemy is eligible to start an attack. This rule SHALL apply in `NONE`, `SUSPICIOUS`, `INVESTIGATING`, and `ALERT`, without requiring a detection event or facing toward the player. As refined by C060, a hidden player SHALL remain ineligible unless this enemy has its own unexpired visually confirmed ALERT. The attack decision SHALL take priority over patrol, investigation, pursuit, blocked-navigation waiting, and selection of another target. Adjacency alone SHALL NOT change the perception state or grant ongoing knowledge of a non-adjacent player. As refined by C057, accepting an attack SHALL first center the enemy in its occupied GridSpot, then update heading toward the live player, and only then start the attack animation; an already centered enemy SHALL start on the same update.

#### Scenario: Four directions in every alert state
- **WHEN** an eligible Goblin, Warrior, Lancer, or Archer is one GridSpot above, below, left, or right of a living player in any of the four perception states
- **THEN** it begins attack preparation on the next active update, centers in its own GridSpot, stops locomotion, faces the live player, and then starts its existing attack

#### Scenario: Hidden player or player behind the enemy
- **WHEN** a living player is cardinally adjacent but undetected or behind an eligible combat enemy
- **THEN** the enemy begins attack preparation without waiting for perception to escalate if the player is exposed or this enemy has an unexpired visually confirmed ALERT
- **AND** an unaware enemy cannot attack a hidden player merely because the player is adjacent

#### Scenario: Navigation or alternate target is pending
- **WHEN** the player becomes cardinally adjacent while an eligible combat enemy is patrolling, investigating, pursuing, waiting for a route retry, or selecting a sheep or bush target
- **THEN** the player attack takes priority and obsolete movement does not resume during the attack

#### Scenario: Diagonal or non-adjacent player
- **WHEN** the player is diagonal, in the same GridSpot, or more than one cardinal step away
- **THEN** this adjacency rule does not start an attack and existing non-adjacent combat rules remain in effect

#### Scenario: Continuous motion within grid spots
- **WHEN** character positions move within their currently registered GridSpots
- **THEN** attack eligibility follows those GridSpots rather than artwork offsets or a separate pixel-distance threshold

### Requirement: Adjacency attacks preserve action lifecycle
Adjacency attacks SHALL respect existing protected actions, recovery, death, disposal, and pause. They SHALL NOT restart or retarget an active attack. After the existing attack and recovery complete, the enemy SHALL reevaluate the live player and SHALL attack again if cardinal adjacency still holds. A prior attack against that player SHALL NOT suppress later eligible attacks. Archer attacks SHALL keep their existing captured target, animation, one-arrow release, and recovery behavior. This change SHALL NOT introduce new damage amounts, hitboxes, or projectile collision rules.

#### Scenario: Player remains adjacent
- **WHEN** an attack and its existing recovery have finished and the living player is still cardinally adjacent
- **THEN** the enemy starts a new attack from a fresh eligibility check

#### Scenario: Player leaves or dies
- **WHEN** the player moves away or dies during an attack or recovery
- **THEN** the current attack retains its existing lifecycle and no subsequent adjacency attack starts from stale target information

#### Scenario: Protected action or paused game
- **WHEN** the enemy is already attacking, recovering, or otherwise action-locked, or gameplay is paused
- **THEN** adjacency does not restart the action or bypass the lock or pause

#### Scenario: Inactive actor
- **WHEN** the enemy is dead or disposed, or there is no living player
- **THEN** no adjacency attack starts

### Requirement: Monk remains non-combatant
The Monk SHALL patrol and respond to the four perception states through its existing navigation behavior. Player adjacency SHALL NOT trigger an attack or healing animation for the Monk.

#### Scenario: Adjacent Monk in every alert state
- **WHEN** a Monk is cardinally adjacent to the player in `NONE`, `SUSPICIOUS`, `INVESTIGATING`, or `ALERT`
- **THEN** it continues the applicable patrol or alert behavior without attacking or healing

### Requirement: Enemy player attacks prepare at the center of their own grid space
Every living Goblin, Warrior, Lancer, and Archer choosing to attack the player SHALL first move its authoritative world center to the exact center of the GridSpot it occupies at that decision. It SHALL then stop movement, update heading toward the player's current position, and only then initiate its existing attack. This sequence SHALL apply to both adjacent-player and existing non-adjacent player attack decisions. For C056 adjacency decisions, the next active update SHALL begin this preparation; attack animation initiation SHALL wait for preparation to finish. An already centered enemy SHALL face and attack without an artificial waiting period. Monk behavior and attacks targeting sheep or bushes SHALL remain unchanged.

#### Scenario: Off-center enemy chooses an attack
- **WHEN** any combat enemy chooses an eligible player attack while off-center in its occupied GridSpot
- **THEN** it moves to that GridSpot's center before facing the player and starting its attack
- **AND** no attack animation, attack sound, damage event, or projectile starts during preparation

#### Scenario: Already centered enemy
- **WHEN** an eligible enemy chooses a player attack while exactly centered
- **THEN** it stops locomotion, updates heading toward the player, and starts the attack in that order on the same active update

#### Scenario: Player moves during preparation
- **WHEN** the player moves while the enemy is centering and remains eligible when centering finishes
- **THEN** the enemy faces the player's latest position before starting the attack
- **AND** its existing target-locking rules apply after attack initiation

### Requirement: Attack centering uses normal world movement
Preparation SHALL use continuous, collision-aware movement at the enemy's normal movement speed and respect existing axis movement rules. The destination SHALL be the captured occupied GridSpot center using configured grid dimensions, rather than a patrol destination or the player's cell. The enemy SHALL arrive at the exact center without overshoot or oscillation. Preparation SHALL take locomotion priority over patrol, pursuit, investigation, and awareness-facing actions. Ordinary movement heading during centering SHALL remain permitted; the final heading update toward the player SHALL occur only after arrival.

#### Scenario: Decision during a patrol step
- **WHEN** an attack is chosen partway through movement toward another cell
- **THEN** the enemy centers in the cell occupied at the decision and obsolete navigation cannot replace its centering destination

#### Scenario: Configurable grid and frame duration
- **WHEN** centering runs with a different supported grid size or a frame step longer than the remaining travel distance
- **THEN** arrival is clamped to the configured cell center through collision-aware movement and the enemy does not attack from an offset position

### Requirement: Preparation respects eligibility and interruptions
The enemy SHALL revalidate the living player and the initiating attack rule before starting the attack. If eligibility is lost, preparation SHALL cancel without an attack and normal decisions SHALL resume. Death, disposal, or movement-locking displacement SHALL cancel preparation; paused gameplay SHALL freeze it. A blocked or stalled centering movement SHALL use existing bounded recovery rather than teleporting, attacking off-center, or retrying in an unbounded update loop. Repeated decisions SHALL NOT duplicate preparations, attacks, or recovery updates. Existing committed attacks and their cooldowns SHALL remain protected.

#### Scenario: Player becomes ineligible
- **WHEN** the player dies or no longer satisfies the initiating attack rule before attack initiation
- **THEN** no attack starts from the stored decision and the enemy resumes normal decision-making

#### Scenario: Centering is obstructed
- **WHEN** terrain or an actor prevents reaching the captured center
- **THEN** no attack begins and bounded movement recovery handles the obstruction without passing through it

#### Scenario: Pause or interruption
- **WHEN** gameplay pauses during preparation
- **THEN** preparation does not advance until gameplay resumes
- **AND** death, disposal, or movement-locking displacement cancels the pending attack

#### Scenario: Repeated decisions and existing attack lifecycle
- **WHEN** multiple attack triggers occur during preparation or an attack and its recovery
- **THEN** only one preparation and one committed attack are accepted, with the existing animation, damage, projectile release, and recovery lifecycle preserved
