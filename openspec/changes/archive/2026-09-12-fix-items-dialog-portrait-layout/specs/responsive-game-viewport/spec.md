## MODIFIED Requirements

### Requirement: Complete UI remains inside the safe area

The system SHALL keep the release version, settings gear, coordinate readout, diagnostics, settings backdrop and dialog, Items dialog, virtual joystick, action controls, and their labels completely inside the UI safe-area rectangle.

#### Scenario: UI initializes before viewport coordination

- **WHEN** the document paints before the first safe-area calculation completes
- **THEN** the UI remains hidden until its game-window intersection bounds have been applied, preventing an offscreen-to-onscreen startup snap

#### Scenario: Normal gameplay UI on mobile

- **WHEN** the game is displayed in a narrow mobile viewport
- **THEN** the version, gear, coordinates, joystick, and action controls each preserve their configured margin from the applicable safe-area edges

#### Scenario: Compact settings gear

- **WHEN** the settings gear is rendered at any supported viewport size
- **THEN** its complete control is 50 percent of the previous responsive size while its upper-right anchor remains unchanged

#### Scenario: Settings menu is open

- **WHEN** the settings menu opens in a viewport smaller than the world layer
- **THEN** the complete dialog border, close control, and settings content fit inside the UI safe area without horizontal or vertical clipping

#### Scenario: Items dialog is open on desktop

- **WHEN** a logged-in player opens the Items dialog while desktop gutters are visible
- **THEN** the dialog’s complete rendered bounds remain inside the portrait game frame and UI safe area
- **AND** no card, parchment edge, ribbon, or close control enters a desktop gutter
