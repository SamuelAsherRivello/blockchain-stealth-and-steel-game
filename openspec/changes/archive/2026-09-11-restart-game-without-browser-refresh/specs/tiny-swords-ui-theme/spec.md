## ADDED Requirements

### Requirement: End-level restart remains in the current document
The themed Restart Game action on both loss and completion menus SHALL create a fresh game run without refreshing or navigating the browser document. It SHALL retain the existing themed Start Menu behavior and shall preserve the visible game frame, persistent settings, account data, and saved Map Order while resetting run-owned gameplay state.

#### Scenario: Restart after completion
- **WHEN** the player activates Restart Game from a Level Completed or Game Completed menu
- **THEN** the themed menu closes and the first map in the saved Map Order begins as a fresh run in the current document
- **AND** no browser navigation or document refresh occurs

#### Scenario: Restart after loss
- **WHEN** the player activates Restart Game from the themed loss menu
- **THEN** the game returns to its fresh-run start presentation without stale loss, combat, pickup, or reward UI
- **AND** no browser navigation or document refresh occurs
