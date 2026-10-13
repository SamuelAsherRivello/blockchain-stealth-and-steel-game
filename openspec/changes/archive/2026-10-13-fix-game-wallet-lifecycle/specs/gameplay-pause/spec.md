# Spec Delta

## ADDED Requirements

### Requirement: Logout restart releases Account interaction ownership
When a BIS logout restart is accepted, the game SHALL release the Account overlay's focus trap and inert-input ownership before presenting the resulting Start menu. The Start menu SHALL retain its own existing pause ownership until the player starts the game.

#### Scenario: Start menu remains after Account logout
- **WHEN** logout completes from Account opened above a visible Start menu
- **THEN** the scene remains paused by the Start menu
- **AND** the Start control is focusable and usable without a page refresh

#### Scenario: Account was opened during gameplay
- **WHEN** logout completes from Account opened during active gameplay
- **THEN** the game reaches its fresh Start-menu state without retaining the Account pause or input blocker
