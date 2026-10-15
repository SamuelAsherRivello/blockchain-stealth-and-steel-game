# player-melee-combat Specification

## Purpose

Provide a repeatable player knife attack whose visible swing, collider overlap, damage event, and gameplay lifecycle remain consistent across keyboard and touch input.

## Requirements

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

### Requirement: Knife reach targets living enemies by collider overlap
At its configured impact, a dagger move SHALL damage every living enemy whose current damage collider overlaps the player's current damage collider using the existing overlap test. An ordinary move SHALL deal exactly 25 base damage once per enemy; a confirmed C072 combo move SHALL apply its configured dagger multiplier once per enemy. Facing, grid adjacency, and terrain SHALL add no separate eligibility gate. Collider dimensions SHALL remain unchanged. Dead/dying enemies, the player, sheep, pickups, and environment objects SHALL not receive dagger damage. Existing projectile defense SHALL not reject dagger damage.

#### Scenario: Multiple overlapping enemies
- **WHEN** two living enemies overlap the player's damage collider at an ordinary or confirmed combo impact
- **THEN** each receives that move's damage once regardless of facing

#### Scenario: Nearby non-overlapping enemy
- **WHEN** an enemy is in a neighboring grid cell but its damage collider does not overlap the player's
- **THEN** the dagger move deals no damage to that enemy

#### Scenario: Target moves before impact
- **WHEN** an enemy leaves the player's damage collider before a dagger move's configured impact
- **THEN** that move misses it

#### Scenario: Walking without swinging
- **WHEN** the player walks into an enemy without a successful dagger impact
- **THEN** that enemy receives no player contact damage

### Requirement: Swing lifecycle respects gameplay availability
Dagger moves SHALL only start while gameplay input is enabled and the player is alive. Pause SHALL freeze move, buffered-input, combo-delay, impact, and cooldown progress. Death, level transitions, and teardown SHALL discard unfinished moves, buffered presses, and target combo progress without a subsequent damage event. An otherwise completed move SHALL permit a new deliberate activation unless C072's over-fast cooldown is active.

#### Scenario: Pausing before impact
- **WHEN** gameplay pauses before a dagger move's impact
- **THEN** no impact occurs during pause and resuming continues from the paused progress

#### Scenario: Death or level transition cancels a swing
- **WHEN** the player dies or leaves the level before an impact is consumed
- **THEN** the abandoned move deals no subsequent damage
- **AND** its buffered sequence and cooldown state are cleared

#### Scenario: Subsequent deliberate attack
- **WHEN** a dagger move completes and the player presses Attack again during active gameplay with no cooldown
- **THEN** a fresh dagger move can produce its own single impact
