# virtual-player-controller Specification

## Purpose
Provide responsive pointer and touch controls for X/Y player movement, item use, and weapon attacks while preserving the game's existing keyboard movement behavior.

## Requirements

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

### Requirement: Joystick controls X/Y ground movement

The joystick SHALL produce a two-dimensional movement vector where left and right change world X and up and down change world Y. Twelve o'clock SHALL request positive Y, three o'clock positive X, six o'clock negative Y, and nine o'clock negative X.

#### Scenario: Joystick moves along cardinal directions

- **WHEN** the player holds the joystick at a cardinal direction
- **THEN** the player moves along the corresponding world X or Y direction

#### Scenario: Joystick moves diagonally

- **WHEN** the player holds the joystick diagonally
- **THEN** the player moves along both world axes
- **AND** diagonal movement does not exceed the configured maximum walking speed

### Requirement: Joystick movement is proportional and captured

The joystick SHALL ignore displacement within a central dead zone and SHALL scale movement intensity from the dead-zone edge to full displacement. A gesture that begins inside the joystick SHALL continue tracking the same pointer outside the joystick until release or cancellation.

#### Scenario: Stick remains near center

- **WHEN** the active pointer remains inside the joystick dead zone
- **THEN** the joystick requests no movement

#### Scenario: Stick is partially displaced

- **WHEN** the active pointer is held between the dead-zone edge and joystick edge
- **THEN** the requested movement speed is below the configured maximum

#### Scenario: Active pointer leaves the joystick

- **WHEN** a movement gesture begins inside the joystick and moves beyond its boundary
- **THEN** the gesture continues with its displacement clamped to full input
- **AND** releasing or cancelling that pointer immediately returns movement input to zero

### Requirement: Keyboard and joystick movement coexist

Existing WASD and arrow-key movement SHALL remain available. A displaced joystick SHALL control movement while active; otherwise currently held keyboard movement SHALL apply without requiring a new key press.

#### Scenario: Player uses only the keyboard

- **WHEN** the joystick is centered and a movement key is held
- **THEN** the player moves with the existing keyboard behavior

#### Scenario: Joystick temporarily overrides a held key

- **WHEN** a movement key is held and the joystick becomes displaced
- **THEN** joystick direction and intensity control movement
- **AND** releasing the joystick resumes the still-held keyboard movement

### Requirement: Jump functionality is absent
The player controller SHALL NOT expose, bind, or execute player-controlled jump behavior. No input, button, or independent controller animation state may lift the player or apply a jump arc. A game-owned Rapid Triple dagger finisher MAY apply a temporary visual-only vertical presentation offset; it SHALL not create a jump input, change ground position, or alter movement or combat colliders.

#### Scenario: Jump input is unavailable
- **WHEN** the player uses the former jump control or any formerly bound jump input
- **THEN** no jump state, vertical offset, or jump animation is created

#### Scenario: Dagger finisher visual jump
- **WHEN** the game-owned Rapid Triple finisher reaches its configured visual jump presentation
- **THEN** the player has no new input-bound jump behavior
- **AND** the visual offset does not move its ground position or colliders

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
Attack SHALL request the game-owned dagger lifecycle once per deliberate pointer press, accessible button activation, or non-repeated V keydown during active gameplay. The attack SHALL be available without an equipped weapon and SHALL ignore the selected weapon type. Held V SHALL not auto-repeat attacks. During an active dagger move, one later deliberate Attack request MAY be delivered to C072's bounded next-move buffer; disabled gameplay input, cooldown, and additional active-move requests SHALL create no attack or queued input.

#### Scenario: Weapon attack is available
- **WHEN** the player presses Attack or V during active gameplay while no dagger move is active and no cooldown applies
- **THEN** the game-owned dagger move begins once regardless of weapon selection

#### Scenario: One later deliberate attack is buffered
- **WHEN** Attack or V is deliberately activated once while an active dagger move has no next-move buffer
- **THEN** no second move begins immediately
- **AND** C072 receives one later deliberate request for sequence classification

#### Scenario: Weapon attack is unavailable
- **WHEN** Attack or V is activated while input is disabled, cooldown is active, or an active dagger move already has a next-move buffer
- **THEN** no new attack begins or is queued and gameplay continues without an error

#### Scenario: Accessible button activation
- **WHEN** the focused Attack button is activated with Enter or Space during active gameplay
- **THEN** one dagger request is delivered

#### Scenario: Holding V
- **WHEN** V remains held through repeated keydown events and dagger-move completion
- **THEN** repeats create no additional requests until a new deliberate press
