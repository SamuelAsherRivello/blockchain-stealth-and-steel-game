## MODIFIED Requirements

### Requirement: Existing actions remain recognizable and functional

The themed UI SHALL retain existing outcome messages, available action labels, settings values, and gameplay effects. Instructions and keyboard hints SHALL describe Attack/V and movement, omitting Item/C activation while temporarily disabled. Attack SHALL use the fixed knife melee action. Other keyboard bindings SHALL remain available. The approved Start Menu SHALL show the Stealth & Steel logo above its blue Start Menu ribbon. Other menus SHALL NOT show the logo. Prompt bodies SHALL contain no decorative icons. Attack SHALL be the sole visible action button while Item is temporarily unavailable. Decorative artwork SHALL NOT intercept gameplay or control input outside intended interactive regions. Main menu SHALL refer to the existing Stealth Grid start screen. Status badges SHALL retain the meanings of suspicious, investigating, alert, and hidden indicators and their existing timing.

#### Scenario: Simultaneous movement and attack
- **WHEN** one pointer moves the joystick and another activates Attack
- **THEN** both actions work with their existing independent input behavior
- **AND** the themed pressed state corresponds to the control being used

#### Scenario: Settings and outcome actions
- **WHEN** the user adjusts Music or SFX, changes fullscreen, opens or closes settings, or resets settings
- **THEN** each action retains its existing state and gameplay effect while using the themed presentation

#### Scenario: Completion reward and progression (BIS C6)
- **WHEN** the player reaches the level exit
- **THEN** the themed prompt shows Level Completed with HUD gold counts and Collect Level N Trophy, Continue To Next Level and Restart Game
- **AND** the final level in the active run order shows Game Completed with completed/total levels and omits Continue
- **AND** collection uses the public BIS asset-collection controller, retains the menu and disables its actions during the bounded attempt
- **AND** confirmed collection shows the awarded image toast and disables collection; uncertainty preserves the request for Check Trophy Status
- **AND** guests, owned trophies and missing configuration cannot collect but can navigate
- **AND** Continue loads the next map in the active run order, while Restart Game starts the first map in the saved Map Order preference (Level1 by default) without clearing wallet state
- **AND** the death menu uses Restart Game while retaining its paid revival action

#### Scenario: Hidden or alert state changes
- **WHEN** the game changes a character's hidden or perception state
- **THEN** the corresponding themed badge communicates the same state at the existing world position and timing

