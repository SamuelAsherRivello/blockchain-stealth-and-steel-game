# Tiny Swords UI Theme Specification

## Purpose

Provide a complete Tiny Swords visual treatment for the game's existing interface, with readable and responsive controls and user-reviewed visual deliverables before staged adoption.

## Requirements

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

The themed UI SHALL retain existing outcome messages, available action labels, settings values, and gameplay effects. Instructions and keyboard hints SHALL describe Attack/V and movement, omitting Item/C activation while temporarily disabled. Attack SHALL use the fixed knife melee action. Other keyboard bindings SHALL remain available. The approved Start Menu SHALL show the Stealth & Steel logo above its blue Start Menu ribbon. Other menus SHALL NOT show the logo. Prompt bodies SHALL contain no decorative icons. Attack SHALL be the sole visible action button while Item is temporarily unavailable. Decorative artwork SHALL NOT intercept gameplay or control input outside intended interactive regions. Main menu SHALL refer to the existing Stealth Grid start screen. Status badges SHALL retain the meanings of suspicious, investigating, alert, and hidden indicators and their existing timing. Trophy buttons and trophy-related completion text SHALL be rendered only when BIS reports `hasAssetMintingSupport()` as true; when rendered, the existing trophy operation readiness, disabled-state, uncertainty, and recovery behavior SHALL remain authoritative.

#### Scenario: Trophy asset minting support is unavailable
- **WHEN** level completion is shown and `hasAssetMintingSupport()` is false or unavailable
- **THEN** trophy buttons and trophy-related text are not rendered
- **AND** the player can still use the non-trophy completion actions that remain applicable

#### Scenario: Trophy asset minting support is available
- **WHEN** level completion is shown and `hasAssetMintingSupport()` is true
- **THEN** the existing trophy buttons and trophy-related text are rendered
- **AND** the existing trophy flow determines whether those controls are enabled

#### Scenario: Simultaneous movement and attack
- **WHEN** one pointer moves the joystick and another activates Attack
- **THEN** both actions work with their existing independent input behavior
- **AND** the themed pressed state corresponds to the control being used

#### Scenario: Settings and outcome actions
- **WHEN** the user adjusts Music or SFX, changes fullscreen, opens or closes settings, or resets settings
- **THEN** each action retains its existing state and gameplay effect while using the themed presentation

#### Scenario: Completion reward and progression (BIS C6)
- **WHEN** the player reaches the level exit
- **THEN** the themed prompt shows Level Completed with HUD gold counts, and shows trophy collection controls and copy only when asset minting support is available
- **AND** the final level in the active run order shows Game Completed with completed/total levels and omits Continue
- **AND** collection uses the public BIS asset-collection controller, retains the menu and disables its actions during the bounded attempt
- **AND** confirmed collection shows the awarded image toast and disables collection; uncertainty preserves the request for Check Trophy Status
- **AND** unsupported trophy capability does not prevent non-trophy navigation
- **AND** Continue loads the next map in the active run order, while Restart Game starts the first map in the saved Map Order preference (Level1 by default) without clearing wallet state
- **AND** the death menu uses Restart Game while retaining its paid revival action

#### Scenario: Hidden or alert state changes
- **WHEN** the game changes a character's hidden or perception state
- **THEN** the corresponding themed badge communicates the same state at the existing world position and timing

### Requirement: End-level restart remains in the current document
The themed Restart Game action on both loss and completion menus SHALL create a fresh game run without refreshing or navigating the browser document. It SHALL retain the existing themed Start Menu behavior and shall preserve the visible game frame, persistent settings, account data, and saved Map Order while resetting run-owned gameplay state.

#### Scenario: Restart after completion
- **WHEN** the player activates Restart Game from a Level Completed or Game Completed menu
- **THEN** the themed menu closes and the first map in the saved Map Order begins as a fresh run in the current document
- **AND** no browser navigation or document refresh occurs

#### Scenario: Restart after loss
- **WHEN** the player activates Restart Game from the themed loss menu
- **THEN** the game returns to its fresh-run start presentation without stale loss, combat, pickup, or reward UI
- **AND** no browser navigation or document refresh occurs

### Requirement: Responsive and accessible themed controls

The UI SHALL remain legible and usable inside the visible game area at desktop and narrow portrait sizes, after viewport changes, browser zoom, and fullscreen transitions. Panel edges and icons SHALL remain undistorted. Interactive hit areas SHALL be at least 44 CSS pixels in each dimension. Text labels, accessible names, keyboard operation, and visible focus SHALL remain available independently of decorative images. Available hover, pressed, checked, and disabled states SHALL be visually distinguishable without relying on hover for touch operation. Every closable themed menu header SHALL contain a header text region and a header button region; the title SHALL be visually centered within the ribbon's safe title region, and the close button SHALL be vertically aligned and right-aligned within its own hit target without overlapping the title.

#### Scenario: Closable menu header is consistently aligned

- **WHEN** the player opens Settings, Developer, Items, or another closable themed menu
- **THEN** the title and close control appear in one shared header container
- **AND** the title is centered within the safe ribbon region
- **AND** the close control is right-aligned and vertically aligned within its artwork

#### Scenario: Header remains usable after resize

- **WHEN** the visible game frame changes size, orientation, or browser zoom while a closable menu is open
- **THEN** the title remains on one line within the safe region or reduces to fit
- **AND** the close button retains a hit target of at least 44 by 44 CSS pixels
- **AND** the title does not overlap the close control

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

### Requirement: Shared menu composition anchors to the toast reservation

Every themed menu SHALL reserve the standard toast location even when no toast is visible. Its first visible composition element SHALL begin 15 CSS pixels below the reserved toast's lower edge: the Start Menu logo when present, or the blue title ribbon for menus without that logo. A logo-free menu SHALL not reserve an empty logo-sized vertical gap.

#### Scenario: Start menu appears beneath an absent toast
- **WHEN** the Start Menu is shown without an active toast
- **THEN** its logo begins 15 CSS pixels below the standard toast-bottom reference
- **AND** its title ribbon remains below the logo without overlap

#### Scenario: A logo-free menu appears beneath a toast
- **WHEN** Settings, Developer, Treasure, loss, or completion is shown with or without an active toast
- **THEN** its title ribbon begins 15 CSS pixels below the same toast-bottom reference
- **AND** no vacant logo region changes that ribbon position

### Requirement: Themed menu text and section rhythm are shared

The themed menu system SHALL apply one shared body-text selector to every ordinary prose block in the Start, Treasure Chest, You Lost, and Level Completed prompts. That selector SHALL own the same font face, font treatment, color, alignment, margins, and text-block positioning for each of those menus. Sliders, toggles, and other controls SHALL retain control-specific text treatment. Every menu title ribbon SHALL leave visible vertical separation before its first body or control content. Content associated with a titled section, including Developer Debug Draw and Map options, SHALL begin 20 CSS pixels to the right of its section heading. The vertical space following a section subtitle and following a form item SHALL be 30 percent of the prior shared value.

#### Scenario: Prompt body treatment remains synchronized
- **WHEN** the ordinary prose style is changed for a themed menu
- **THEN** every start, treasure, loss, and completion prompt prose block receives the same style through the shared selector
- **AND** slider and toggle labels do not inherit that prose style

#### Scenario: Developer sections are visually grouped
- **WHEN** the Developer menu shows Debug Draw controls or Map order choices
- **THEN** the content under each heading is indented 20 CSS pixels
- **AND** the title ribbon has visible separation from the first heading or control
- **AND** subtitle and form-item following gaps use 30 percent of their prior shared spacing

### Requirement: Themed menu titles and actions retain a compact responsive rhythm

Themed menu ribbon titles SHALL use twice the current default title size while staying on one line and wholly within the visible ribbon artwork safe area by reducing only as far as required to fit. For closable menus, the safe title area SHALL account for the header button hit target before title fitting is measured. Regular menu action buttons SHALL use 30 percent of the prior vertical gap between adjacent actions. Map-order level sub-buttons SHALL retain their independent spacing. The final regular action button SHALL remain a shared fixed 8 CSS pixels above the parchment's lower safe edge. Themed menus SHALL use responsive non-scrolling layouts and SHALL never expose a menu scrollbar.

#### Scenario: Title fitting reserves the close control

- **WHEN** a closable menu title approaches the right side of the ribbon
- **THEN** title fitting measures the safe title region before the close-button hit target
- **AND** the title remains fully readable without entering the close control region

#### Scenario: Long ribbon title fits at narrow width

- **WHEN** a menu title would overflow its available ribbon width
- **THEN** the title remains on one line at the largest reduced size that fits wholly inside the visible ribbon artwork
- **AND** it grows back toward the doubled default size when space permits

#### Scenario: Developer actions use the shared bottom rhythm

- **WHEN** Developer shows Open GitHub and Clear All Settings
- **THEN** the gap between those regular actions is 30 percent of the prior shared action gap
- **AND** Clear All Settings remains 8 CSS pixels above the parchment lower safe edge
- **AND** the Level 1, Level 2, and Level 3 sub-buttons are not governed by that action gap

#### Scenario: A constrained menu remains complete without scrolling

- **WHEN** a themed menu is shown at a supported narrow portrait or short desktop viewport
- **THEN** all of its body copy, controls, and final action remain visible in a responsive compact layout
- **AND** neither its content nor its backdrop exposes a scrollbar

### Requirement: Toast messaging and close controls are visually unambiguous

Themed toast messages SHALL not display a lightning-bolt icon. Every menu close control SHALL retain a hit target of at least 44 by 44 CSS pixels, remain keyboard-operable, and occupy the shared header button region. At every supported game-frame scale, the visible close X SHALL be vertically aligned with the header artwork and right-aligned within that region without overlapping the title.

#### Scenario: Close control uses the shared header region

- **WHEN** a user opens a closable themed menu
- **THEN** the visible X is rendered inside the right-aligned header button region
- **AND** pointer, touch, and keyboard activation close the active menu

#### Scenario: A toast reports an account event

- **WHEN** a themed toast is rendered for an account or contract status event
- **THEN** its message contains no lightning-bolt icon
- **AND** its status text remains readable

#### Scenario: Close control remains usable after resize

- **WHEN** a user opens a closable menu and changes the game-frame scale or orientation
- **THEN** the X remains visually aligned within the shared header button region
- **AND** pointer, touch, and keyboard activation close the active menu

### Requirement: Outcome menus contain their complete readable action composition

Loss and completion menus SHALL provide enough parchment space for their body text, every visible action, visible spacing between adjacent actions, and a lower breathing margin after the final action. The action stack SHALL remain fully inside the visible paper background at the supported fullscreen 100% composition.

#### Scenario: Level completion with multiple actions

- **WHEN** a level completion menu displays its body copy and two or more visible actions
- **THEN** the paper extends below the final visible action
- **AND** adjacent action buttons have visible separation
- **AND** the body copy is not overlapped or visually merged with the first action

#### Scenario: Loss menu with two actions

- **WHEN** the loss menu displays its message and Pay/Restart actions
- **THEN** both visible actions are fully contained by the paper
- **AND** the final action has visible lower breathing room

#### Scenario: Single-action Start Menu remains unchanged

- **WHEN** the Start Menu displays its body copy and Start action
- **THEN** it retains its approved paper, ribbon, logo, and action composition without inheriting outcome-menu-only spacing changes
