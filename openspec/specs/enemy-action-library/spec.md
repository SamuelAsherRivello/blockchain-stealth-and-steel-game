# enemy-action-library Specification

## Purpose

Define reusable enemy action capabilities and configurable profiles so different enemy types can compose behavior without duplicating action logic or sharing mutable runtime state.

## Requirements

### Requirement: Reusable actions have explicit contracts
The action library SHALL expose stable action identities, required actor capabilities, configurable parameters, preconditions, predicted effects, finite non-negative costs, and execution/cancellation contracts. Actions SHALL compose through facts rather than hardcoded successor sequences. Target and destination selection SHALL produce a bounded set of candidates whose identity is retained through planning and execution.

#### Scenario: Shared movement enables different interactions
- **WHEN** a melee profile requires cardinal adjacency and a ranged profile requires a firing position
- **THEN** both can use the same movement action implementation with different destination and range parameters before their respective attacks

#### Scenario: Target disappears
- **WHEN** the bound bush, character, or destination becomes invalid
- **THEN** the action fails or cancels against that binding rather than silently claiming success or attacking a replacement target

### Requirement: Profiles select capabilities and parameters
Each enemy profile SHALL declare enabled goals and actions, target policies, ranges, reaction timing, patrol limits, recovery values, and action cost parameters. Invalid parameters, unknown actions, or unsupported actor capabilities SHALL produce a clear validation failure before the profile can issue gameplay actions. Definitions SHALL be shareable; targets, timers, random decisions, routes, and action progress SHALL be instance-local.

#### Scenario: Two Goblins use the same profile
- **WHEN** one Goblin enters recovery or selects a bush
- **THEN** another Goblin using that profile retains its own target, timer, and plan

#### Scenario: Unsupported healing is configured
- **WHEN** a profile requests an autonomous healing capability that has no implemented gameplay contract
- **THEN** validation rejects it instead of treating an available animation as a working heal action

### Requirement: Initial library supports current activity families
The initial library SHALL support timed idle/wait, patrol segment, movement to a permitted known point or interaction position, facing a permitted stimulus, bounded directional search, melee attack, ranged attack, and bush burning. Player attack actions SHALL share exact GridSpot centering and live pre-commit validation. Non-player interactions SHALL retain their existing preparation and damage rules. Physical navigation and attack mechanics SHALL remain authoritative for completion.

#### Scenario: Enemy prepares a player attack
- **WHEN** a combat action is selected while the enemy is off-center
- **THEN** the enemy reaches the captured occupied GridSpot center using normal collision-aware movement before facing and committing
- **AND** repeated requests do not create duplicate preparations or attack events

#### Scenario: Already centered enemy attacks
- **WHEN** an eligible player attack is selected at the exact center
- **THEN** the enemy can commit on that active update without an added planner or action-phase delay

### Requirement: Profiles preserve the five enemy roles
Goblin SHALL retain normal patrol, awareness reactions, cardinal nearby-character melee, and probabilistic bush selection with its existing default 0.25 chance, home patrol limits, 50 bush damage, and recovery. Eligible adjacent-player combat SHALL override alternate targets. Warrior and Lancer SHALL retain patrol, awareness, existing player melee and currently integrated defensive behavior. Archer SHALL retain patrol, awareness, facing, shot and recovery behavior plus the specified range-aware movement. Monk SHALL retain patrol and awareness without autonomous attack or healing. Unused art variants SHALL remain available without automatically becoming new behavior.

#### Scenario: Goblin chooses normal activity
- **WHEN** no higher-priority reaction or eligible nearby character requires action and a fresh normal activity decision is made
- **THEN** one random draw below 0.25 allows reachable bush selection and a draw at or above 0.25 permits normal home-bounded patrol
- **AND** planning retries do not reroll that decision continuously

#### Scenario: Goblin reaches a living bush
- **WHEN** the Goblin reaches a valid cardinal burn position and accepts a burn
- **THEN** its existing fire reach and damage policy produces one 50-damage event per accepted burn and respects recovery

#### Scenario: Monk is adjacent to the player
- **WHEN** a Monk is cardinally adjacent in any perception state
- **THEN** it uses its applicable movement or observation behavior without initiating an attack or healing animation

#### Scenario: Defensive actor is migrated
- **WHEN** a Warrior or Lancer is connected to the shared brain
- **THEN** migration does not enable previously unwired automatic defense or change reaction windows, facing rules, damage outcomes, or protection duration

### Requirement: Reuse is demonstrable without changing the planner
An existing supported action SHALL be reusable by another compatible enemy profile through configuration and its actor adapter, without modifying the planner or duplicating that action's execution implementation. Changes to parameters SHALL affect only the configured profile or instance.

#### Scenario: Different patrol tuning
- **WHEN** two profiles enable the shared patrol action with different idle duration and patrol bounds
- **THEN** each exhibits its configured behavior using the same action implementation

#### Scenario: Different supported melee variant
- **WHEN** a compatible profile selects an already supported melee animation variant
- **THEN** the shared melee action invokes that variant through the actor capability without adding a character-specific branch to the planner

### Requirement: Normal patrol choices favor group separation
Every supported enemy using the shared patrol action SHALL favor legal destinations with greater separation from other living enemies and their active patrol destinations. Selection SHALL remain random, give every legal candidate a nonzero probability, and assign more than half of the selection probability to candidates with the greatest separation when candidate separation differs. This SHALL apply to both route destinations and new timed patrol step destinations, without retargeting an unfinished step solely because another enemy moves. Distances SHALL use authoritative logical level cells, independent of camera position.

#### Scenario: Open space competes with a cluster
- **WHEN** an enemy can choose between equally legal patrol destinations with different separation from its teammates
- **THEN** the most separated candidates collectively receive more than half of the selection probability
- **AND** nearer candidates remain selectable

#### Scenario: Mixed enemy group patrols
- **WHEN** Goblin, Warrior, Lancer, Archer, and Monk make normal patrol decisions in the same level
- **THEN** each uses the group separation preference appropriate to its existing legal candidate set
- **AND** the same inputs and injected random sequence reproduce the same choices

#### Scenario: Timed patrol could continue into a cluster
- **WHEN** a timed patrol finishes a step and another legal next step provides better separation than continuing straight
- **THEN** the next choice applies the separation preference instead of always continuing straight

#### Scenario: No peers or tied separation
- **WHEN** no other living enemies exist or every candidate has equal separation
- **THEN** patrol continues with ordinary random selection, retaining the existing straight-ahead preference for timed patrol ties where applicable

#### Scenario: Camera moves
- **WHEN** the camera scrolls while the enemy cells, chosen destinations, legal candidates, and random inputs remain unchanged
- **THEN** patrol selection produces the same result

### Requirement: Patrol coordination tracks only current living enemy intent
Patrol coordination SHALL use other living enemies' current cells and currently selected patrol destinations. A selected destination SHALL become available to subsequent decisions as soon as it is selected, including subsequent decisions in the same gameplay update. It SHALL cease influencing selection on completion, failure, cancellation, interruption, death, removal, or level reset. Coordination SHALL exclude the selecting enemy and SHALL NOT treat player, sheep, bushes, or spawn points as teammate positions. It SHALL NOT grant player knowledge or alter perception.

#### Scenario: Two enemies choose in sequence
- **WHEN** one enemy selects a patrol destination and another chooses afterward before either arrives
- **THEN** the later choice accounts for the earlier destination as a soft preference
- **AND** it can still choose that area if the candidate is otherwise legal

#### Scenario: Patrol intent becomes stale
- **WHEN** a patrol finishes, fails, is canceled or interrupted, or its enemy dies or is removed
- **THEN** later selections do not consider the old patrol destination
- **AND** a surviving enemy's current cell still contributes to separation

#### Scenario: New level begins
- **WHEN** the game resets or loads another level
- **THEN** no patrol destination from the previous level influences the new group's choices

### Requirement: Separation remains subordinate to legal movement and behavior priorities
Group separation SHALL rank only existing legal patrol candidates and SHALL NOT impose a minimum spacing requirement or reserve cells exclusively. Existing patrol durations, route limits, Goblin home bounds, live collision and occupancy checks, world boundaries, recovery, and higher-priority actions SHALL remain authoritative. A single legal nearby destination SHALL remain usable. Lack of preferred spacing SHALL NOT cause waiting when legal movement exists. A trapped enemy SHALL retain existing recovery behavior.

#### Scenario: Narrow corridor
- **WHEN** the only legal patrol destination lies close to another enemy
- **THEN** the enemy can select it and move using existing movement validation

#### Scenario: Spacious destination is illegal
- **WHEN** a more separated destination is unreachable, occupied, outside the logical level, or outside the enemy's normal patrol bounds
- **THEN** normal selection excludes it regardless of its separation
- **AND** existing escape recovery retains its allowed relaxation of patrol preferences

#### Scenario: Combat or awareness interrupts patrol
- **WHEN** an existing higher-priority attack or perception reaction supersedes patrol
- **THEN** it retains its current priority and timing, and the obsolete patrol destination is cleared
