# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
