## Purpose

Make a stationary enemy's vulnerable rear position legible and let the player convert a correctly timed entry into a deterministic, cinematic execution.

## ADDED Requirements

### Requirement: Stable horizontal enemies expose a rear-cell opportunity
Every living enemy facing `left` or `right` SHALL expose one opportunity exactly one grid cell opposite its facing only after its position and heading have remained unchanged for more than 0.25 seconds of active gameplay time. An enemy facing `up` or `down` SHALL expose no opportunity. The opportunity SHALL use the existing tile-shadow artwork in yellow, irrespective of terrain or character occupancy in that rear cell.

#### Scenario: Stable enemy becomes vulnerable
- **WHEN** a living enemy remains at one position facing left or right for more than 0.25 active seconds
- **THEN** a yellow opportunity appears in the directly opposite grid cell

#### Scenario: Vertically facing enemy remains stable
- **WHEN** a living enemy remains at one position facing up or down for more than 0.25 active seconds
- **THEN** no yellow opportunity appears

#### Scenario: Rear cell is blocked
- **WHEN** the rear cell contains blocking terrain or another character
- **THEN** the yellow opportunity still renders at that exact cell
- **AND** normal collision rules determine whether the player can enter it

#### Scenario: Enemy turns, moves, dies, or is removed
- **WHEN** the source enemy changes heading, changes position, dies, or is removed
- **THEN** its opportunity immediately becomes gameplay-ineligible
- **AND** it does not become eligible again until a new stable interval exceeds 0.25 active seconds

### Requirement: Opportunity presentation fades independently from eligibility
A newly eligible opportunity SHALL fade from transparent to its full yellow appearance over 0.125 active seconds and SHALL remain visible at full opacity while eligible. An ineligible or removed opportunity SHALL fade to transparent over 0.125 active seconds without retaining gameplay eligibility.

#### Scenario: Opportunity becomes ineligible during fade-out
- **WHEN** an enemy moves or turns while its yellow shadow is fading out
- **THEN** the shadow can finish its fade-out
- **AND** the player cannot enter, pull toward, or execute from that old opportunity

#### Scenario: Gameplay pauses
- **WHEN** gameplay pauses during an opportunity fade
- **THEN** the fade progress does not advance until active gameplay resumes

### Requirement: Entering an opportunity uses bush-style gravity
When the player can enter a currently eligible rear cell and meets the established bush gravity entry conditions, the player SHALL pull to that cell's center in 0.125 active seconds and remain movement-locked for the following 0.25 active seconds. During that pull and hold, the player SHALL face the selected source enemy and SHALL not emit movement-based audio perception to any enemy. If multiple current opportunities share an entered cell, the first source enemy in stable spawn/record order SHALL own the entry.

#### Scenario: Entry into one available rear cell
- **WHEN** the player enters a current reachable opportunity
- **THEN** the player is centered and movement-locked using the bush gravity duration and collision behavior
- **AND** faces the selected source enemy without generating audio perception during the owned pull and hold

#### Scenario: Multiple opportunities share a cell
- **WHEN** more than one current opportunity has the same entry cell
- **THEN** the first enemy in stable record order is selected
- **AND** the selection is deterministic across identical updates

### Requirement: Stealth entry pauses the selected source enemy
When a player successfully enters an opportunity, its selected living source enemy SHALL stop its voluntary action and remain idle for one randomly sampled duration from 2 through 3 active seconds before considering another AI state. The idle window SHALL be independent per source enemy and SHALL end immediately if that enemy dies or is removed.

#### Scenario: Player enters a source enemy's opportunity
- **WHEN** the player successfully enters a current reachable opportunity
- **THEN** the selected source enemy remains idle for a sampled 2–3 second active-time window
- **AND** resumes ordinary AI state selection only after that window ends

### Requirement: A valid rear-cell attack performs a dedicated execution
An Attack activation from an armed, currently eligible rear-cell opportunity SHALL target only its selected source enemy. It SHALL not run the ordinary knife impact or damage any other enemy. The player SHALL remain logically centered in the rear cell while existing knife frames present a visual-only lunge toward the target.

#### Scenario: Armed player attacks
- **WHEN** the player activates Attack from a selected current opportunity
- **THEN** the selected living enemy is immediately defeated
- **AND** ordinary knife midpoint damage does not occur
- **AND** the player gameplay center remains in the rear cell

#### Scenario: Opportunity invalidates before Attack
- **WHEN** the selected enemy turns or moves before the player activates Attack
- **THEN** the player cannot execute that enemy
- **AND** a later unarmed Attack follows the normal knife behavior

### Requirement: Execution locks and protects the player for its presentation
A successful execution SHALL movement-lock and make the player invulnerable to all incoming damage for 0.8 active seconds. Input, collision, and damage behavior SHALL return to their normal state when that interval completes or ordinary level/death teardown cancels the sequence.

#### Scenario: Another enemy attacks during execution
- **WHEN** an enemy melee hit, arrow, or other defined damage source reaches the player during the 0.8-second execution
- **THEN** the player takes no damage

#### Scenario: Execution ends
- **WHEN** 0.8 active seconds have elapsed after execution starts
- **THEN** the player's movement and ordinary damage susceptibility return

### Requirement: A stealth execution plays its dedicated hit sound
A successful stealth execution SHALL play the supplied `StealthHit01.mp3` exactly once when it starts. Ordinary knife attacks and failed or invalidated execution attempts SHALL not play that sound.

#### Scenario: Valid stealth execution begins
- **WHEN** the player begins a valid stealth execution
- **THEN** `StealthHit01.mp3` plays once instead of the generic lancer sound

#### Scenario: Execution cannot begin
- **WHEN** an execution opportunity is invalid or absent
- **THEN** the dedicated stealth hit sound does not play
