## MODIFIED Requirements

### Requirement: Virtual controller remains visible and usable

The game SHALL display one movement joystick in the lower-left and one action button labeled `Attack` in the lower-right. Item SHALL be temporarily absent from visible layout, hit testing, and keyboard focus. The complete controller SHALL remain inside the visible game frame on desktop and mobile after viewport or orientation changes, without reserving an empty Item slot.

#### Scenario: Controller appears at startup
- **WHEN** gameplay starts in a supported browser
- **THEN** the movement joystick and Attack button are visible and Item is absent
- **AND** controls do not overlap one another or extend outside the game frame

#### Scenario: Viewport changes
- **WHEN** the viewport size or orientation changes
- **THEN** the controller remains fully visible inside the game frame
- **AND** existing coordinate and control guidance remains legible without overlapping the controller

### Requirement: Item activation uses the held item

Player-triggered Item activation SHALL be temporarily disabled. C SHALL not be accepted as a gameplay action and SHALL cause no item consumption, drop, animation, movement, or attack. Item inventory and pickup data SHALL remain available for future restoration; other loadout keys SHALL retain their existing behavior.

#### Scenario: Item activation with a held item
- **WHEN** the player presses, holds, or releases C while holding an item
- **THEN** the item remains held and no gameplay action or animation is triggered by C

#### Scenario: Item activation without a held item
- **WHEN** the player presses C with an empty item slot
- **THEN** no gameplay action, animation, or error occurs

#### Scenario: Item control is omitted
- **WHEN** the controller starts, resets, handles blur, or is disposed without an Item element
- **THEN** no error occurs and available controls retain their normal lifecycle

### Requirement: Action buttons support simultaneous pointers

Attack SHALL activate once on pointer press and SHALL remain usable while another pointer controls movement. Releasing, cancelling, or moving an action pointer SHALL NOT reset the joystick. Pressed appearance SHALL follow the Attack pointer and clear on release, cancellation, lost capture, or blur.

#### Scenario: Attack while moving
- **WHEN** one pointer controls the joystick and a second pointer presses Attack
- **THEN** one knife attack begins without interrupting movement

#### Scenario: Attack pointer is cancelled
- **WHEN** the Attack pointer is cancelled while the joystick remains held
- **THEN** Attack's pressed appearance clears and joystick movement continues

#### Scenario: Former jump action is pressed while moving
- **WHEN** one pointer controls the joystick and another pointer presses the former Item/Jump button location outside Attack's hit area
- **THEN** no item or jump action occurs and movement remains uninterrupted

#### Scenario: Separate action pointers are used
- **WHEN** one pointer presses Attack and another presses the inactive former Item/Jump location
- **THEN** only Attack requests an action
- **AND** Attack's pressed appearance follows only its own active pointer state

### Requirement: Attack integrates without owning weapon behavior

Attack SHALL request the game-owned fixed knife attack once per deliberate pointer press, accessible button activation, or non-repeated V keydown during active gameplay. The attack SHALL be available without an equipped weapon and SHALL ignore the selected weapon type. Held V SHALL not auto-repeat attacks. Active swings and disabled gameplay input SHALL reject additional attack requests without queueing them.

#### Scenario: Weapon attack is available
- **WHEN** the player presses Attack or V during active gameplay while no swing is active
- **THEN** the game-owned knife attack begins once regardless of weapon selection

#### Scenario: Weapon attack is unavailable
- **WHEN** Attack or V is activated while input is disabled or another swing is active
- **THEN** no new attack begins or is queued and gameplay continues without an error

#### Scenario: Accessible button activation
- **WHEN** the focused Attack button is activated with Enter or Space during active gameplay
- **THEN** one knife attack is requested

#### Scenario: Holding V
- **WHEN** V remains held through repeated keydown events and swing completion
- **THEN** repeats start no additional attack until a new deliberate press

## REMOVED Requirements

### Requirement: Shoot integrates without owning projectile behavior
**Reason**: The player action is now a fixed knife swing and the HUD exposes Attack rather than Shoot.
**Migration**: Route Attack/V to the game-owned knife melee action; retain enemy projectile behavior independently.
