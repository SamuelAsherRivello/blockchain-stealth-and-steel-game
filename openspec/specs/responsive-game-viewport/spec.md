# responsive-game-viewport Specification

## Purpose
Ensure the world fills the drawable browser height while every UI element
preserves a consistent visible safe margin across desktop, mobile, and
fullscreen layouts.

## Requirements

### Requirement: World background covers the drawable viewport

The system SHALL extend the world background from the top edge to the bottom
edge of the drawable viewport without exposing page-background letterboxing.
On a wide, fine-pointer desktop viewport, the system SHALL permit a
decorative non-game presentation only in horizontal gutters outside the
centered game window; it SHALL not appear above or below the world, enter the
game window, or replace the mobile world background.

#### Scenario: Narrow mobile fullscreen viewport

- **WHEN** the game enters fullscreen on a narrow portrait mobile display
- **THEN** the world background reaches the drawable top and bottom edges with
  no black strip above or below it and no exterior presentation is visible

#### Scenario: Display cutout viewport

- **WHEN** the browser exposes drawable space around a display cutout
- **THEN** the world background extends into that space rather than reserving
  an opaque page-background band

#### Scenario: Wide desktop viewport

- **WHEN** a wide, fine-pointer desktop viewport exposes space to the left
  and right of the complete game window
- **THEN** any exterior presentation occupies only that horizontal space while
  the world continues to occupy the complete game window

### Requirement: World presentation preserves its proportions

The system SHALL present the logical world as a centered, full-height 9:16 layer without stretching sprites, tiles, colliders, or coordinate relationships. The render and diagnostic canvas backing buffers SHALL use a deliberate device-pixel-ratio policy while their CSS rectangles remain the logical presentation surface. Browser zoom and display scaling SHALL not alter the logical reference resolution or introduce a second layout scale. The system MAY crop peripheral world content outside the left and right edges of a narrower visible viewport.

#### Scenario: High-DPI display

- **WHEN** the browser reports a device pixel ratio greater than 1
- **THEN** the render and diagnostic surfaces use the configured bounded backing-buffer scale while the visible game frame remains proportional to the 576x1024 logical viewport

#### Scenario: Browser zoom at 50 percent or 100 percent

- **WHEN** the browser zoom changes between the supplied 50% and 100% cases
- **THEN** the game frame, start menu, HUD, controls, and diagnostic overlays remain aligned, proportional, and inside their intended frame without doubling or shrinking a second time

#### Scenario: Viewport is narrower than 9:16

- **WHEN** the drawable viewport is narrower than the full-height 9:16 world
- **THEN** the world remains centered and proportional while equal peripheral regions may be cropped from its left and right edges

#### Scenario: Viewport is at least as wide as the world

- **WHEN** the drawable viewport is at least as wide as the full-height 9:16 world
- **THEN** the complete proportional world remains visible and UI remains inside the game window rather than entering the surrounding page area

### Requirement: UI uses a visible safe-area rectangle

The system SHALL define the UI safe area from the intersection of the game
window and currently visible viewport, browser-reported device safe-area
insets, and the configured UI screen margin. The screen margin SHALL be
preserved inside every applicable edge of that visible game-window rectangle.

#### Scenario: Game window is narrower than the viewport

- **WHEN** surrounding page area is visible to the left and right of the game
- **THEN** all UI remains inside the game window and preserves its configured
  margin from the game-window edges

#### Scenario: Cropped world on a narrow viewport

- **WHEN** the world extends beyond the visible left and right viewport edges
- **THEN** the UI safe area's left and right edges remain inset from the visible
  intersection edges by the configured margin

#### Scenario: Device reports safe-area insets

- **WHEN** a device reports one or more non-zero safe-area insets
- **THEN** the UI safe area begins after each inset and preserves the configured
  screen margin inside it

### Requirement: Complete UI remains inside the safe area

The system SHALL keep the release version, settings gear, coordinate readout,
diagnostics, settings backdrop and dialog, Items dialog, virtual joystick,
action controls, and their labels completely inside the UI safe-area rectangle.

#### Scenario: UI initializes before viewport coordination

- **WHEN** the document paints before the first safe-area calculation completes
- **THEN** the UI remains hidden until its game-window intersection bounds have
  been applied, preventing an offscreen-to-onscreen startup snap

#### Scenario: Normal gameplay UI on mobile

- **WHEN** the game is displayed in a narrow mobile viewport
- **THEN** the version, gear, coordinates, joystick, and action controls each
  preserve their configured margin from the applicable safe-area edges

#### Scenario: Compact settings gear

- **WHEN** the settings gear is rendered at any supported viewport size
- **THEN** its complete control is 50 percent of the previous responsive size
  while its upper-right anchor remains unchanged

#### Scenario: Settings menu is open

- **WHEN** the settings menu opens in a viewport smaller than the world layer
- **THEN** the complete dialog border, close control, and settings content fit
  inside the UI safe area without horizontal or vertical clipping

#### Scenario: Items dialog is open on desktop

- **WHEN** a logged-in player opens the Items dialog while desktop gutters are visible
- **THEN** the dialog’s complete rendered bounds remain inside the portrait game frame and UI safe area
- **AND** no card, parchment edge, ribbon, or close control enters a desktop gutter

### Requirement: Viewport changes update world crop and UI safe area

The system SHALL independently update the world crop and UI safe-area layout after window resize, orientation change, fullscreen change, visual viewport resize or scroll, device-pixel-ratio change, or browser zoom change without requiring a page reload. Pointer conversion SHALL use the current CSS presentation rectangle and logical viewport scale rather than physical canvas backing dimensions.

#### Scenario: Device-pixel-ratio or zoom changes while running

- **WHEN** the effective device-pixel ratio changes while the game is open
- **THEN** the render/debug backing buffers and viewport diagnostics update without moving the DOM UI out of the game-frame safe area or changing logical gameplay coordinates

#### Scenario: Pointer input after zoom

- **WHEN** a player clicks or taps a game control after changing browser zoom
- **THEN** the input maps to the same logical game location represented by the visible CSS frame

#### Scenario: Mobile browser chrome changes the visible viewport

- **WHEN** mobile browser chrome changes the visible viewport bounds
- **THEN** the world remains full-height and centered while the UI elements preserve their margin from the recalculated visible safe-area edges

#### Scenario: Device orientation changes

- **WHEN** the device changes between portrait and landscape
- **THEN** the world crop and UI safe area recalculate independently without stretching the world or clipping the UI

### Requirement: UI-layer zoom is independent from world presentation

The system SHALL use 100% as the default UI scale. Plain mousewheel input over the game frame SHALL adjust only the UI layer in 10% increments between 50% and 150%, centered on the game frame; it SHALL not scale, crop, or reposition the logical game/world layer. Modifier-key wheel input SHALL remain available for browser zoom behavior.

#### Scenario: Increase UI zoom

- **WHEN** the player uses a plain upward mousewheel step over the game frame
- **THEN** the UI layer increases by 10% up to a maximum of 150% while the world canvas remains unchanged

#### Scenario: Decrease UI zoom

- **WHEN** the player uses a plain downward mousewheel step over the game frame
- **THEN** the UI layer decreases by 10% down to a minimum of 50% while remaining centered on the game frame

#### Scenario: Modifier-key browser zoom

- **WHEN** the player uses Ctrl+wheel, Meta+wheel, or Alt+wheel
- **THEN** the game does not consume the event for UI zoom and the browser may handle its normal zoom behavior
