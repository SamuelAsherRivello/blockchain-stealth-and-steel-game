## ADDED Requirements

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
