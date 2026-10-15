# player-dagger-combos Specification

## Purpose

Provide expressive, hit-confirmed dagger combos from the single existing Attack control while making deliberate rhythm beneficial and frantic spam costly.

## Requirements

### Requirement: One Attack input classifies rhythmic dagger sequences
The system SHALL classify deliberate presses of the existing Attack control using active-gameplay time into exactly one of ordinary, Rapid Triple, or over-fast sequence outcomes. C072 SHALL use one shared, playtest-tunable profile for the classification bands, attack speed, impact time, damage multiplier, cooldown, particle selection, flash, and sound-pitch values. Keyboard, accessible-button, and pointer activation SHALL use the same classifier. A maximum of one next deliberate press MAY be buffered during an active dagger move; repeated inputs SHALL neither restart the active move nor accumulate an unbounded queue.

#### Scenario: A normal rhythm remains ordinary
- **WHEN** the player uses the Attack control with a rhythm that matches neither combo nor the over-fast sequence
- **THEN** each accepted move is an ordinary dagger move
- **AND** no combo reward or penalty cooldown occurs

#### Scenario: Input source does not change recognition
- **WHEN** the same deliberate press intervals are made with V, accessible Attack activation, or the pointer Attack control
- **THEN** C072 resolves the same sequence outcome

### Requirement: Rapid Triple is the single hit-confirmed dagger combo
Rapid Triple SHALL contain an ordinary opening hit, escalating confirmed follow-up hits, and a visual-jump dagger finisher. A combo step SHALL only advance for an enemy that the preceding required dagger impact hit while living; a miss SHALL end that enemy's progression without changing other overlapping enemies' independent progression. A successful final impact SHALL apply the configured recovery only to future Attack acceptance; it SHALL not alter finisher presentation.

#### Scenario: Rapid Triple finishes after confirmed hits
- **WHEN** a player completes the configured Rapid Triple press rhythm and each required preceding dagger impact hits an enemy
- **THEN** the enemy receives the configured escalating dagger damage
- **AND** the final move plays the visual-jump dagger finisher

#### Scenario: A successful finisher recovers before the next attack
- **WHEN** the final Rapid Triple impact hits one or more living enemies
- **THEN** new Attack requests are rejected for the configured recovery duration after the finisher completes
- **AND** the finisher's animation, cloud, sound, and jump presentation remain unchanged

#### Scenario: A miss ends one target's combo progression
- **WHEN** an enemy leaves the dagger overlap before a required combo impact while another overlapping enemy is hit
- **THEN** the first enemy receives no later combo upgrade from that sequence
- **AND** the second enemy may continue receiving its independently confirmed combo steps

### Requirement: Over-fast sequences have a visible post-sequence drawback
An over-fast three-press sequence SHALL resolve its accepted moves as ordinary dagger moves, then apply a one-second active-gameplay cooldown after the third move completes. The cooldown SHALL reject new Attack requests without creating attacks or hidden queued inputs. It SHALL be visibly distinguishable from a rewarded combo. An incorrect but non-over-fast rhythm SHALL not receive this penalty.

#### Scenario: Frantic presses are punished after ordinary hits
- **WHEN** the player completes the configured over-fast three-press pattern
- **THEN** its three accepted dagger moves retain ordinary damage and presentation
- **AND** new Attack requests are rejected for one active-gameplay second after the third move completes

#### Scenario: Pause preserves the penalty duration
- **WHEN** gameplay pauses during an over-fast cooldown
- **THEN** the remaining cooldown does not elapse until active gameplay resumes

### Requirement: Confirmed combo impacts communicate their tier
Every confirmed upgraded combo impact SHALL use its configured combination of particle effect, player flash, enemy flash, attack-sound pitch, and damage-sound pitch. The presentation MAY reverse the existing dagger frames or vary their playback speed and impact time, but SHALL use no second weapon or projectile. The Rapid Triple finisher's jump SHALL be visual only: its ground position and movement and combat colliders SHALL remain unchanged.

#### Scenario: An upgraded hit is readable
- **WHEN** a configured upgraded combo impact hits a living enemy
- **THEN** the configured particle, player/enemy flash, and pitch feedback play once for that impact

#### Scenario: Finisher visual motion preserves gameplay geometry
- **WHEN** the Rapid Triple finisher plays its visual jump
- **THEN** the player retains the same ground position and collider geometry used by ordinary dagger overlap

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
