# Spec Delta

## ADDED Requirements

### Requirement: Game authorizes Player logout before wallet cleanup
Before clearing a Player Wallet associated with a registered game, BIS SHALL request a public game authorization. The game SHALL be able to allow logout, deny logout with safe text, or require confirmation with safe game-provided body text and an opaque authorization identifier. For a confirmation decision, BIS SHALL render its own title and controls around the game-provided body text and SHALL re-request authorization after its Confirm control is activated before clearing wallet access.

#### Scenario: Start-menu logout is authorized
- **WHEN** the game reports that its active presentation is the Start menu
- **THEN** it can allow the Player logout without a progress-loss confirmation
- **AND** BIS continues its existing wallet logout safeguards

#### Scenario: Active-run logout needs confirmation
- **WHEN** the game reports that logout can discard current game progress
- **THEN** BIS displays its Account logout title and buttons with the game's supplied body text
- **AND** BIS does not clear wallet access until the game allows the post-confirmation recheck

#### Scenario: Game authorization is unavailable
- **WHEN** a registered game authorization callback throws, rejects, or does not complete in its bounded interval
- **THEN** BIS displays an explicit BIS-owned override warning
- **AND** logout proceeds only after the player separately confirms that override

### Requirement: Logout restart takes precedence over ordinary account refresh
The game SHALL treat the stable BIS logout restart notification as the terminal lifecycle action for that logout identity. Ordinary Player connection or snapshot refresh notifications that precede it SHALL not prevent Account teardown or leave the game in an intermediate menu state.

#### Scenario: Logout occurs from the visible Start menu
- **WHEN** Player logout publishes a disconnect/snapshot refresh followed by one restart notification while the Start menu is visible
- **THEN** the game reaches exactly one fresh, interactive Start-menu presentation
- **AND** the Account overlay is not active, no non-Account game controls remain inert, and no Account pause reason remains

#### Scenario: Duplicate restart notifications arrive
- **WHEN** BIS repeats the restart notification with the same logout identity
- **THEN** the game performs at most one logout restart transition
- **AND** it does not produce duplicate menus or a browser navigation loop

