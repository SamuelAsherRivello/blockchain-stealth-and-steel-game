## ADDED Requirements

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
Themed menu ribbon titles SHALL use twice the current default title size while staying on one line and wholly within the visible ribbon artwork safe area by reducing only as far as required to fit. Regular menu action buttons SHALL use 30 percent of the prior vertical gap between adjacent actions. Map-order level sub-buttons SHALL retain their independent spacing. The final regular action button SHALL remain a shared fixed 8 CSS pixels above the parchment's lower safe edge. Themed menus SHALL use responsive non-scrolling layouts and SHALL never expose a menu scrollbar.

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
Themed toast messages SHALL not display a lightning-bolt icon. Every menu close control SHALL retain a hit target of at least 44 by 44 CSS pixels and remain keyboard-operable. At every supported game-frame scale, the visible close X SHALL sit one rendered X-width left of its prior reviewed position while remaining inside its own hit target and without overlapping the title.

#### Scenario: A toast reports an account event
- **WHEN** a themed toast is rendered for an account or contract status event
- **THEN** its message contains no lightning-bolt icon
- **AND** its status text remains readable

#### Scenario: Close control remains usable after resize
- **WHEN** a user opens a closable menu and changes the game-frame scale or orientation
- **THEN** the X remains visually offset left by one rendered X-width
- **AND** pointer, touch, and keyboard activation close the active menu
