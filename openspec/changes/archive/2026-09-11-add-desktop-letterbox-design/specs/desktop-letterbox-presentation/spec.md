## Purpose

Give wide, desktop game presentations an intentional forest-gate surround
while keeping that presentation outside the playable portrait game window.

## ADDED Requirements

### Requirement: Wide desktop gutters present forest-gate art
When a fine-pointer, hover-capable desktop viewport is wider than the
centered portrait game window, the system SHALL present only the horizontal
gutters with a subdued forest-gate treatment: a dark forest atmosphere,
mossy stone accents, and narrow weathered steel-and-stone rails beside the
game window. The presentation SHALL remain lower contrast than the game and
SHALL not create decorative bands above or below it.

#### Scenario: Wide Windows browser
- **WHEN** the game is viewed in a wide Windows browser with side gutters
- **THEN** both gutters show the forest-gate treatment and the 9:16 game
  window remains the visual focal point at the exact center

#### Scenario: Desktop viewport narrows to the game window
- **WHEN** a desktop viewport becomes no wider than the centered game window
- **THEN** no portion of the exterior presentation remains visibly exposed

### Requirement: Exterior presentation is isolated from game interaction
The letterbox presentation SHALL be decorative and non-interactive. It SHALL
not receive focus, accept pointer or touch interaction, add controls or
readable game information, or alter the game window's visual bounds.

#### Scenario: Pointer use in a visible gutter
- **WHEN** a user clicks or taps a visible desktop gutter
- **THEN** no gameplay action, UI action, or focus change is caused by the
  exterior presentation

#### Scenario: Game content is measured
- **WHEN** the runtime measures the game window, canvas, debug layer, or UI
  safe area
- **THEN** each retains the same frame-bounded geometry it has without the
  exterior presentation

### Requirement: Touch-first mobile omits exterior presentation
The system SHALL omit the letterbox presentation for touch-first mobile
viewports and SHALL preserve the existing full-height portrait world crop,
safe-area UI, and mobile controls.

#### Scenario: Portrait mobile browser
- **WHEN** the game is displayed in a narrow portrait mobile browser
- **THEN** no forest-gate art is visible outside the game world and the
  existing portrait presentation remains unchanged

#### Scenario: Mobile viewport changes
- **WHEN** mobile browser chrome, orientation, or viewport dimensions change
- **THEN** the world crop and safe-area UI update normally without exposing
  exterior presentation or introducing a black band
