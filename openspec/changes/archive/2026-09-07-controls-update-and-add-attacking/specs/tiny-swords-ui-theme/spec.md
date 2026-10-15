## MODIFIED Requirements

### Requirement: Approved compact HUD presentation

The HUD SHALL show version metadata at the upper-left inset using 9.6px text and left-aligned Gold directly beneath it, without a gold ribbon or coin. Settings artwork SHALL retain the approved half-size presentation and raised inner icon. Move and action controls SHALL use unchanged artwork geometry with tint for pressed states, while retaining joystick translation. Item and its label SHALL be temporarily absent; the Attack sword SHALL occupy 45.5%. The Move and Attack labels SHALL share a baseline lowered 20px from the previously reviewed raised position.

#### Scenario: Approved HUD appears in gameplay
- **WHEN** the player enters gameplay
- **THEN** the compact readouts and controller composition match the approved HUD
- **AND** pressing controls changes tint without squashing or replacing their artwork
- **AND** pointer hover over Settings adds no large blue circle

### Requirement: Existing actions remain recognizable and functional

The themed UI SHALL retain existing outcome messages, available action labels, settings values, and gameplay effects. Instructions and keyboard hints SHALL describe Attack/V and movement, omitting Item/C activation while temporarily disabled. Attack SHALL use the fixed knife melee action. Other keyboard bindings SHALL remain available. The approved Start Menu SHALL show the Stealth & Steel logo above its blue Start Menu ribbon. Other menus SHALL NOT show the logo. Prompt bodies SHALL contain no decorative icons. Attack SHALL be the sole visible action button while Item is temporarily unavailable. Decorative artwork SHALL NOT intercept gameplay or control input outside intended interactive regions. Main menu SHALL refer to the existing Stealth Grid start screen. Status badges SHALL retain the meanings of suspicious, investigating, alert, and hidden indicators and their existing timing.

#### Scenario: Simultaneous movement and attack
- **WHEN** one pointer moves the joystick and another activates Attack
- **THEN** both actions work with their existing independent input behavior
- **AND** the themed pressed state corresponds to the control being used

#### Scenario: Settings and outcome actions
- **WHEN** the user adjusts Music or SFX, changes fullscreen, opens or closes settings, resets settings, or selects Continue after a level outcome
- **THEN** each action retains its existing state and gameplay effect while using the themed presentation

#### Scenario: Hidden or alert state changes
- **WHEN** the game changes a character's hidden or perception state
- **THEN** the corresponding themed badge communicates the same state at the existing world position and timing
