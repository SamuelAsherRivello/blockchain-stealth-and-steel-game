## ADDED Requirements

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
