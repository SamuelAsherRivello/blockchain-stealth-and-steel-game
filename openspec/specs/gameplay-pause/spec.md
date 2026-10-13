# gameplay-pause Specification

## Purpose
Defines a reliable modal pause state that freezes mutable gameplay and input while keeping the current Babylon Lite scene visibly rendered.

## Requirements

### Requirement: Pause gameplay while settings is open
Opening the Settings Menu SHALL freeze player movement, virtual-controller actions, keyboard gameplay input, player animation progression, animated terrain progression, coordinate changes, and every other mutable game-time behavior until all applicable Settings, Account and other pause owners release their pauses.

#### Scenario: Open settings during movement
- **WHEN** the archer is moving and the player opens settings
- **THEN** movement stops at the current position
- **AND** coordinates, gameplay animations, and animated terrain do not advance while the menu remains open

#### Scenario: Attempt actions while paused
- **WHEN** Jump, Shoot, movement keys, or joystick input occurs while settings is open
- **THEN** no gameplay action or movement is produced

### Requirement: Continue rendering the paused scene
The render loop SHALL continue presenting the frozen game scene and Settings Menu while mutable game-time behavior is paused.

#### Scenario: View paused scene
- **WHEN** the Settings Menu remains open
- **THEN** the current terrain and archer remain visible beneath the backdrop
- **AND** the rendered surface does not become blank or stale because rendering stopped

### Requirement: Resume without hidden progress
Closing the Settings Menu SHALL resume only if no other pause owner remains, from the same logical state without applying elapsed wall-clock time from the pause or replaying input that occurred while paused.

#### Scenario: Resume after a long pause
- **WHEN** the player closes settings after leaving it open for an arbitrary duration
- **THEN** the next gameplay update uses only active time after closing
- **AND** the archer does not jump, teleport, or fast-forward

#### Scenario: Release input during pause
- **WHEN** an input was active before settings opened and is released while settings is open
- **THEN** closing settings does not restore that input as active

### Requirement: Independent Account pause ownership
Settings and BIS Account SHALL acquire/release separate pause reasons while preserving existing start/loss pauses. Account SHALL keep the scene rendered, isolate keyboard/pointer input and preserve the final-resume time reset. Paid revival SHALL release only the player-loss reason after enemy cleanup and full-health restoration. The passive BIS toast host SHALL not acquire a gameplay pause or intercept input. Coordination: BIS `openspec/changes/smoke-test-bis-to-game/` and `openspec/changes/archive/2026-09-07-add-b2-game-pay-to-continue/`.

#### Scenario: Account returns while another pause remains
- **WHEN** Account returns to Settings, or Settings closes while a start/loss pause remains
- **THEN** gameplay stays paused with no intermediate resume or replay of held input

### Requirement: Logout restart releases Account interaction ownership
When a BIS logout restart is accepted, the game SHALL release the Account overlay's focus trap and inert-input ownership before presenting the resulting Start menu. The Start menu SHALL retain its own existing pause ownership until the player starts the game.

#### Scenario: Start menu remains after Account logout
- **WHEN** logout completes from Account opened above a visible Start menu
- **THEN** the scene remains paused by the Start menu
- **AND** the Start control is focusable and usable without a page refresh

#### Scenario: Account was opened during gameplay
- **WHEN** logout completes from Account opened during active gameplay
- **THEN** the game reaches its fresh Start-menu state without retaining the Account pause or input blocker
