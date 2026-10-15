# Spec Delta

## ADDED Requirements

### Requirement: Themed game menus transition on visibility changes

Every themed game menu SHALL animate its visible content and backdrop when it opens or closes. Opening SHALL animate opacity and size from a smaller state to its final state. Closing SHALL animate from its final state to the smaller state before the menu is hidden or removed. The Start, settings, developer, treasure, loss, and completion menus SHALL use this shared behavior.

#### Scenario: A player opens a menu

- **WHEN** the game presents any themed menu
- **THEN** its content and backdrop animate into view with opacity and size changes
- **AND** the menu accepts input after entering

#### Scenario: A player closes a menu

- **WHEN** the player closes or dismisses a themed menu
- **THEN** it remains visible until its exit animation finishes
- **AND** it does not accept input during that exit
- **AND** the game removes or hides it after the exit finishes

#### Scenario: The player prefers reduced motion

- **WHEN** the browser reports a reduced-motion preference
- **THEN** the game shows and hides themed menus without motion
- **AND** the menu actions and focus behavior remain available
