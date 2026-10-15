## Purpose

Provide a complete Tiny Swords visual treatment for the game's existing interface, with readable and responsive controls and user-reviewed visual deliverables before staged adoption.

## ADDED Requirements

### Requirement: Reusable menu presentation

Menus SHALL support configurable title text, body text and button display
text using the approved shared presentation. The logo SHALL be optional,
omitted by default, and used only by Start Menu. All game-owned text action
buttons within menus SHALL share the approved blue button appearance.
Button display text SHALL remain on one line, automatically reducing its
font size to fit the available width and restoring it when space permits.
UI text SHALL not be selectable, while retaining accessible names and
keyboard operation.

#### Scenario: A menu uses different content
- **WHEN** a menu is supplied its title, body and action text
- **THEN** that text appears using the shared banner, parchment and buttons
- **AND** a menu without a logo reserves no empty logo area

### Requirement: Approved compact HUD presentation

The HUD SHALL show version metadata at the upper-left inset using 9.6px text and left-aligned Gold directly beneath it, without a gold ribbon or coin. Settings artwork SHALL retain the approved half-size presentation and raised inner icon. Move and action controls SHALL use unchanged artwork geometry with tint for pressed states, while retaining joystick translation. Item and its label SHALL be temporarily absent; the Attack sword SHALL occupy 45.5%. The Move and Attack labels SHALL share a baseline lowered 20px from the previously reviewed raised position.

#### Scenario: Approved HUD appears in gameplay
- **WHEN** the player enters gameplay
- **THEN** the compact readouts and controller composition match the approved HUD
- **AND** pressing controls changes tint without squashing or replacing their artwork
- **AND** pointer hover over Settings adds no large blue circle

### Requirement: Complete and coherent visual coverage

The game SHALL present all existing UI surfaces using a coherent visual theme based on a selective use of the supplied Tiny Swords UI assets. Coverage SHALL include loading and startup errors, Retry, runtime errors, the main/start menu, HUD, virtual controller, settings and developer settings, win/loss menus, overhead status badges, the goal marker, metadata, coordinate readouts, and diagnostic labels/selection presentation. Diagnostic shapes SHALL preserve their geometric accuracy and meaningful color distinctions.

#### Scenario: User encounters each interface surface
- **WHEN** the user starts the game, plays, opens settings and developer settings, and reaches either end-level outcome
- **THEN** every displayed screen, control, label, and status badge uses the coordinated theme
- **AND** the interface retains the existing actions and information

#### Scenario: Diagnostic overlays are enabled
- **WHEN** the user enables diagnostics or selects a grid cell
- **THEN** their labels and selection treatment are coordinated with the theme
- **AND** collider, grid-spot, and perception geometry remains precise and distinguishable

### Requirement: Independent developer visualizations

Developer SHALL contain a Debug Draw heading and five independent,
persistent toggles in this order: Coordinates, Enemy Perceptions, Enemy Tasks,
Physics Colliders, Tile Map Info. Coordinates SHALL control position readouts
and center/grid-spot markers; Enemy Perceptions SHALL control perception areas
and active-target markers; Enemy Tasks SHALL control enemy goal/action labels;
Physics Colliders SHALL control collider geometry and spawner markers; Tile Map
Info SHALL control grid lines, cell labels, and selected-cell highlighting.
All five SHALL default off. Clear All Settings SHALL restore settings defaults
and synchronize the displayed controls. Open GitHub SHALL open
https://github.com/SamuelAsherRivello/stealth-and-steel-game.

#### Scenario: Optional visualizations are independent
- **WHEN** the user enables one visualization
- **THEN** only its diagnostic presentation is enabled
- **AND** gameplay perception, particle effects, and animations retain their behavior

#### Scenario: Obsolete previews are removed
- **WHEN** the game starts, including with previously saved preview preferences
- **THEN** Crop Marks, Particle FX Preview, and Animated Tile Preview have no controls, subscriptions, preview layers, or public preview handle
- **AND** obsolete preview preferences are ignored

### Requirement: Fullscreen visual review deliverables

C061 SHALL provide three separate full-screen visual previews of the potential finished HUD, main menu, and end-level menu before runtime artwork replacement begins. Previews SHALL show complete game compositions using the supplied art direction and existing game content, and SHALL be identified as proposed visuals. User feedback SHALL be incorporated into the direction used for runtime work.

#### Scenario: Initial visual review
- **WHEN** the first preview set is presented
- **THEN** the user receives one complete-screen HUD image, one complete-screen main-menu image, and one complete-screen end-level image
- **AND** the images are not represented as evidence of completed runtime implementation
- **AND** runtime artwork work waits for the user's feedback and a settled visual direction

### Requirement: Intermediate acceptance remains explicit

C061 SHALL present the implemented HUD for explicit user approval before main-menu artwork implementation, and SHALL present the implemented main menu for explicit user approval before completing remaining surfaces. Each implementation review SHALL include screenshots of the running game and access to its current local preview. Approval SHALL refer to the reviewed result; absent approval or requested revisions SHALL keep the subsequent stage pending.

#### Scenario: HUD review requests revisions
- **WHEN** the user requests changes to the implemented HUD or has not approved it
- **THEN** the next main-menu implementation stage remains pending
- **AND** requested HUD revisions are presented for review before progression

#### Scenario: Main menu is approved
- **WHEN** the user explicitly approves the implemented main-menu result
- **THEN** the remaining interface work can proceed using the accepted direction

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
- **AND** the final packaged level shows Game Completed with completed/total levels and omits Continue
- **AND** collection uses the public BIS asset-collection controller, retains the menu and disables its actions during the bounded attempt
- **AND** confirmed collection shows the awarded image toast and disables collection; uncertainty preserves the request for Check Trophy Status
- **AND** guests, owned trophies and missing configuration cannot collect but can navigate
- **AND** Continue loads the next packaged level, while Restart Game returns to Level 1 without clearing wallet state
- **AND** the death menu uses Restart Game while retaining its paid revival action

#### Scenario: Hidden or alert state changes
- **WHEN** the game changes a character's hidden or perception state
- **THEN** the corresponding themed badge communicates the same state at the existing world position and timing

### Requirement: Responsive and accessible themed controls

The UI SHALL remain legible and usable inside the visible game area at desktop and narrow portrait sizes, after viewport changes, browser zoom, and fullscreen transitions. Panel edges and icons SHALL remain undistorted. Interactive hit areas SHALL be at least 44 CSS pixels in each dimension. Text labels, accessible names, keyboard operation, and visible focus SHALL remain available independently of decorative images. Available hover, pressed, checked, and disabled states SHALL be visually distinguishable without relying on hover for touch operation.

#### Scenario: Narrow portrait interaction
- **WHEN** the game is viewed at a 320 CSS pixel wide portrait viewport
- **THEN** the HUD and controls remain inside the visible game area without overlapping interactive targets
- **AND** menu content remains readable and reachable, scrolling where necessary

#### Scenario: Keyboard and fullscreen use
- **WHEN** the user navigates controls by keyboard and enters or exits fullscreen
- **THEN** focus remains visible, controls retain accessible labels, and the layout stays usable

### Requirement: Graceful startup and asset availability

The game SHALL keep loading/error text and Retry usable if themed images fail to load. Loading visuals SHALL NOT display a determinate completion amount unless backed by actual progress. Shipped assets SHALL resolve from the application's configured deployment base path and SHALL not require access to the original local source folder.

#### Scenario: An image fails during startup
- **WHEN** a themed startup image cannot be loaded
- **THEN** the loading or error message remains legible
- **AND** Retry remains operable when startup has failed

#### Scenario: Hosted beneath a path prefix
- **WHEN** the built game is served beneath its configured non-root base path
- **THEN** the themed artwork loads from the deployed application assets without local filesystem dependencies
