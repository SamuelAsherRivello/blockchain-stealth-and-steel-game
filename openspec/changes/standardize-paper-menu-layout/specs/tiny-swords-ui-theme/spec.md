# Spec Delta

## ADDED Requirements

### Requirement: Themed menus share a parchment content layout
Every themed menu SHALL define its content stack as the visible parchment region from the parchment's left and right edges, from its lower edge, to the point where it meets the blue title ribbon. The stack SHALL use one shared safe inset on all four sides. Within that inset, the body parent and buttons parent SHALL each span the available inline space. The buttons parent SHALL consume only the height required by its rendered action controls, their regular gaps, and its own action spacing; the body parent SHALL consume the remaining usable block space. Empty button parents SHALL not create a visible action-height reservation.

#### Scenario: A prompt with body copy and actions is shown
- **WHEN** Start, Treasure Chest, You Lost, or Level Completed displays body copy and one or more actions
- **THEN** its content stack, body parent, and buttons parent align to the same parchment safe inset
- **AND** the body parent occupies the space remaining above the action region
- **AND** every rendered action remains wholly within the parchment's lower safe area

#### Scenario: A menu has no actions
- **WHEN** Items or another themed menu renders no action controls
- **THEN** its empty buttons parent reserves no visible action height
- **AND** its body parent uses the remaining parchment content space without changing the shared safe inset

#### Scenario: A control-heavy menu is shown
- **WHEN** Settings or Developer renders controls and regular action buttons
- **THEN** control content remains in the body parent and regular action buttons remain in the buttons parent
- **AND** the two parents use the same parchment safe inset as prompt menus
- **AND** control-specific grouping and Map Order sub-button spacing remain independent of the regular action region

#### Scenario: The game is viewed at a supported desktop or portrait composition
- **WHEN** any themed menu is viewed at a supported desktop scale or narrow portrait viewport
- **THEN** its body and action regions remain readable, inside the visible parchment, and free of overlap
- **AND** neither the menu nor its backdrop exposes a scrollbar

## MODIFIED Requirements

### Requirement: Responsive and accessible themed controls
The UI SHALL remain legible and usable inside the visible game area at desktop and narrow portrait sizes, after viewport changes, browser zoom, and fullscreen transitions. Panel edges and icons SHALL remain undistorted. Interactive hit areas SHALL be at least 44 CSS pixels in each dimension. Text labels, accessible names, keyboard operation, and visible focus SHALL remain available independently of decorative images. Available hover, pressed, checked, and disabled states SHALL be visually distinguishable without relying on hover for touch operation. Every closable themed menu header SHALL contain a header text region and a header button region; the title SHALL be visually centered within the ribbon's safe title region, and the close button SHALL be vertically aligned and right-aligned within its own hit target without overlapping the title. At supported desktop browser zoom factors from 50% through 125%, the Start Menu SHALL preserve the approved 110% composition relative to the visible game frame and keep all visible actions fully enclosed by its parchment. Themed menus at supported desktop and narrow portrait compositions SHALL remain complete without exposing a menu or backdrop scrollbar.

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
- **WHEN** the game is viewed at a supported narrow portrait viewport
- **THEN** the HUD and controls remain inside the visible game area without overlapping interactive targets
- **AND** every visible menu body, control, and action remains readable and reachable without a menu or backdrop scrollbar

#### Scenario: Keyboard and fullscreen use
- **WHEN** the user navigates controls by keyboard and enters or exits fullscreen
- **THEN** focus remains visible, controls retain accessible labels, and the layout stays usable

#### Scenario: Start Menu at supported browser zoom
- **WHEN** the desktop Start Menu is shown at 50%, 75%, 80%, 90%, 110%, or 125% browser zoom
- **THEN** its logo, ribbon, parchment, body copy, Start action, and visible Items action remain inside the game frame with the approved 110% visual proportions
- **AND** the parchment lower edge remains below the final visible action without clipping its artwork or label
