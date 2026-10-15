# archer-enemy-ai Specification

## Purpose

Defines the autonomous archer's proximity-based facing and ranged attack behavior against the living player.

## Requirements

### Requirement: Archer faces a nearby player
The archer SHALL update its horizontal facing toward the living player when the player's total 2D Euclidean distance is within an inclusive distance of five world units. A player outside that distance SHALL NOT change the archer's facing.

#### Scenario: Player is nearby on the left
- **WHEN** the living player is at most five total 2D world units from the archer and is to its left
- **THEN** the archer faces left

#### Scenario: Player is nearby on the right
- **WHEN** the living player is at most five total 2D world units from the archer and is to its right
- **THEN** the archer faces right

#### Scenario: Player is beyond facing range
- **WHEN** the living player is more than five total 2D world units from the archer
- **THEN** the archer retains its previous horizontal facing

### Requirement: Archer shoots only within ranged attack distance
The archer SHALL start a ranged attack only when a living player is within an inclusive total 2D Euclidean distance of four world units and the archer is not already shooting or recovering. Distance alone SHALL NOT cause an attack against a dead or absent player.

#### Scenario: Player enters attack range
- **WHEN** a living player is at most four total 2D world units away and the archer is ready
- **THEN** the archer starts one non-looping shoot animation

#### Scenario: Player is outside attack range
- **WHEN** the living player is more than four total 2D world units away
- **THEN** the archer does not start shooting

#### Scenario: Attack is already active
- **WHEN** the player remains in range during the shoot animation or recovery
- **THEN** the archer does not restart or overlap the attack

### Requirement: Archer attack is visibly synchronized
The archer SHALL play its complete shoot animation for each accepted attack and SHALL release at most one arrow during that animation. Movement and target retargeting SHALL not alter the active shot after it begins.

#### Scenario: Shoot animation completes
- **WHEN** the archer reaches the end of its shoot animation
- **THEN** the archer returns to its normal ready state and may reevaluate the player

#### Scenario: Player moves during attack
- **WHEN** the player changes position after the attack begins
- **THEN** the active attack keeps its original release target and does not restart

### Requirement: Archer approaches a reachable ranged attack position
An Archer with a legitimately known target outside its existing inclusive four-unit Euclidean attack range SHALL choose a reachable unoccupied firing position within that range when one is available. It SHALL stop approaching once its position permits the existing ranged attack rule, including centering and detection eligibility. It SHALL use ordinary cardinal navigation, occupancy, collision, and per-enemy concealment restrictions. Range-aware positioning SHALL NOT grant new perception, guarantee a projectile hit, change weapon range, or bypass the existing adjacent-player rule.

#### Scenario: Known player is outside range
- **WHEN** the Archer has permitted current target information and a safe route to an eligible firing position
- **THEN** it moves into range and reevaluates live attack eligibility before centering and shooting
- **AND** it does not continue toward the player's occupied cell merely because an older pursuit route exists

#### Scenario: Already able to shoot
- **WHEN** the player already satisfies the existing ranged or cardinal-adjacent attack rule
- **THEN** the Archer begins its existing attack preparation without first repositioning to another firing cell

#### Scenario: Firing position is unavailable
- **WHEN** no eligible destination is reachable or the selected route becomes blocked
- **THEN** the Archer uses bounded alternative selection or waiting and does not walk through obstacles, shoot outside range, or continuously retry the same failed plan

#### Scenario: Current target knowledge is lost
- **WHEN** the Archer loses permission to know the player's current location before committing a shot
- **THEN** live pursuit and uncommitted shooting stop and investigation can use only permitted remembered evidence

#### Scenario: Player moves after shot commitment
- **WHEN** the player changes position after the Archer commits its shoot animation
- **THEN** the existing captured target, at-most-one arrow release, and recovery behavior remain unchanged
