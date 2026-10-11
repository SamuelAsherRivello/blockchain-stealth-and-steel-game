# Spec Delta

## MODIFIED Requirements

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
