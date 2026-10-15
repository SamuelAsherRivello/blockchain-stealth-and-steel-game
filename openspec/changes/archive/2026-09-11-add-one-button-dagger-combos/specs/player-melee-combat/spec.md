## MODIFIED Requirements

### Requirement: Attack always uses the existing knife animation
Every accepted Attack activation SHALL play the existing four-frame knife animation as the only player attack animation, independently of equipped weapon or held item. C072 MAY play those frames forward or backward and at a configured speed for a classified combo move, including a visual-only jump on the Rapid Triple finisher. Attack SHALL emit no projectile. Completion SHALL restore the appropriate current idle or running presentation. Movement SHALL remain available during every dagger move, and visual combo motion SHALL not alter ground movement or collider placement.

#### Scenario: Attack with empty or different equipment
- **WHEN** the player activates Attack with no weapon, a knife, or another selected weapon, with or without an item
- **THEN** the same knife frames play once in their ordinary or classified-combo presentation and no projectile is created
- **AND** completion restores the player's current locomotion/loadout presentation

#### Scenario: Movement and temporary presentation expire during a swing
- **WHEN** the player moves or a loadout preview expires during a dagger move
- **THEN** movement continues and the complete move presentation finishes without replacement or restart

### Requirement: Each swing commits one timed impact
Each accepted dagger move SHALL resolve exactly one impact at that move's configured active-gameplay impact time. A coarse update crossing the configured impact or completion SHALL not lose or duplicate that impact. An Attack press during an active dagger move SHALL not restart it; C072 MAY retain at most one deliberate next press as its next-move buffer and SHALL discard further presses until that buffer is consumed or cleared.

#### Scenario: Turning while swinging
- **WHEN** the player changes movement direction after starting a dagger move
- **THEN** the move continues uninterrupted and damage depends only on live collider overlap at its configured impact

#### Scenario: Repeated activation or coarse update
- **WHEN** a deliberate Attack press arrives during an active dagger move and an update crosses that move's configured impact and end
- **THEN** the move produces at most one impact
- **AND** at most one subsequent dagger move may begin from its retained next press

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
