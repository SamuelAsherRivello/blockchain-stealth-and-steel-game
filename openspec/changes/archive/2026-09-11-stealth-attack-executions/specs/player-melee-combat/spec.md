## MODIFIED Requirements

### Requirement: Attack always uses the existing knife animation
Every accepted unarmed Attack activation SHALL play the existing four-frame knife animation once at its existing 100 ms frame cadence, independently of equipped weapon or held item. An Attack activation armed by a current stealth rear-cell opportunity SHALL instead start that capability's dedicated execution presentation using the existing knife frames and SHALL emit no projectile. Completion SHALL restore the appropriate current idle or running presentation. Movement SHALL remain available during an unarmed knife swing; execution movement is governed by the stealth-attack execution capability.

#### Scenario: Attack with empty or different equipment
- **WHEN** the player activates an unarmed Attack with no weapon, a knife, or another selected weapon, with or without an item
- **THEN** the same knife swing plays once and no projectile is created
- **AND** completion restores the player's current locomotion/loadout presentation

#### Scenario: Armed stealth attack
- **WHEN** the player activates Attack from a current armed stealth rear-cell opportunity
- **THEN** the dedicated execution presentation replaces the ordinary knife swing
- **AND** no projectile is created

#### Scenario: Movement and temporary presentation expire during a swing
- **WHEN** the player moves or a loadout preview expires during an unarmed swing
- **THEN** movement continues and the full knife animation completes without replacement or restart

### Requirement: Each swing commits one timed impact
Each accepted unarmed swing SHALL resolve exactly one impact at its midpoint, 200 ms into the 400 ms swing. A coarse update crossing the midpoint or completion SHALL not lose or duplicate that impact. Input during an active unarmed swing SHALL not restart it or queue another swing. A stealth execution SHALL not create this ordinary midpoint impact.

#### Scenario: Turning while swinging
- **WHEN** the player changes movement direction after starting an unarmed swing
- **THEN** the swing continues uninterrupted and damage depends only on live collider overlap

#### Scenario: Repeated activation or coarse update
- **WHEN** repeated Attack input arrives during an unarmed swing or an update crosses its midpoint and end
- **THEN** that swing produces at most one impact and does not start another swing

#### Scenario: Execution replaces midpoint
- **WHEN** the player starts a stealth execution
- **THEN** no ordinary knife midpoint impact or area damage is committed
