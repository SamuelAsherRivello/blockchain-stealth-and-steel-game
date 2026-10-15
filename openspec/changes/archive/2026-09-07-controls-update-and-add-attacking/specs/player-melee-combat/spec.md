## Purpose

Provide a repeatable player knife attack whose visible swing, collider overlap, damage event, and gameplay lifecycle remain consistent across keyboard and touch input.

## ADDED Requirements

### Requirement: Attack always uses the existing knife animation
Every accepted Attack activation SHALL play the existing four-frame knife animation once at its existing 100 ms frame cadence, independently of equipped weapon or held item. Attack SHALL emit no projectile. Completion SHALL restore the appropriate current idle or running presentation. Movement SHALL remain available during the swing.

#### Scenario: Attack with empty or different equipment
- **WHEN** the player activates Attack with no weapon, a knife, or another selected weapon, with or without an item
- **THEN** the same knife swing plays once and no projectile is created
- **AND** completion restores the player's current locomotion/loadout presentation

#### Scenario: Movement and temporary presentation expire during a swing
- **WHEN** the player moves or a loadout preview expires during the swing
- **THEN** movement continues and the full knife animation completes without replacement or restart

### Requirement: Each swing commits one timed impact
Each accepted swing SHALL resolve exactly one impact at its midpoint, 200 ms into the 400 ms swing. A coarse update crossing the midpoint or completion SHALL not lose or duplicate that impact. Input during an active swing SHALL not restart it or queue another swing.

#### Scenario: Turning while swinging
- **WHEN** the player changes movement direction after starting a swing
- **THEN** the swing continues uninterrupted and damage depends only on live collider overlap

#### Scenario: Repeated activation or coarse update
- **WHEN** repeated Attack input arrives during a swing or an update crosses its midpoint and end
- **THEN** that swing produces at most one impact and does not start another swing

### Requirement: Knife reach targets living enemies by collider overlap
At the midpoint the knife SHALL damage every living enemy whose current damage collider overlaps the player's current damage collider using the existing overlap test. Damage SHALL be exactly 25 once per enemy per swing. Facing, grid adjacency, and terrain SHALL add no separate eligibility gate. Collider dimensions SHALL remain unchanged. Dead/dying enemies, the player, sheep, pickups, and environment objects SHALL not receive knife damage. Existing projectile defense SHALL not reject knife damage.

#### Scenario: Multiple overlapping enemies
- **WHEN** two living enemies overlap the player's damage collider at impact
- **THEN** each takes 25 damage once regardless of facing

#### Scenario: Nearby non-overlapping enemy
- **WHEN** an enemy is in a neighboring grid cell but its damage collider does not overlap the player's
- **THEN** the swing deals no damage to that enemy

#### Scenario: Target moves before impact
- **WHEN** an enemy leaves the player's damage collider before the midpoint
- **THEN** that swing misses it

#### Scenario: Walking without swinging
- **WHEN** the player walks into an enemy without a successful knife impact
- **THEN** that enemy receives no player contact damage

### Requirement: Swing lifecycle respects gameplay availability
Swings SHALL only start while gameplay input is enabled and the player is alive. Pause SHALL freeze swing and impact progress. Death, level transitions, and teardown SHALL discard unfinished or unconsumed impacts. An otherwise completed swing SHALL permit a new deliberate activation.

#### Scenario: Pausing before impact
- **WHEN** gameplay pauses before a swing's midpoint
- **THEN** no impact occurs during pause and resuming continues from the paused progress

#### Scenario: Death or level transition cancels a swing
- **WHEN** the player dies or leaves the level before an impact is consumed
- **THEN** the abandoned swing deals no subsequent damage

#### Scenario: Subsequent deliberate attack
- **WHEN** a swing completes and the player presses Attack again during active gameplay
- **THEN** a fresh swing can produce its own single impact
