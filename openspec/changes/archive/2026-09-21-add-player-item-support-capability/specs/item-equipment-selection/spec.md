## MODIFIED Requirements

### Requirement: Equipment selection remains clear and unchanged

The Items dialog SHALL display `Select 1 of each item type to activate it for gameplay`, preserve existing card details and selection behavior, and make an active item visually distinct without relying solely on text. The game SHALL expose item support as a lower-camel-case `hasItemSupport()` capability. Item support SHALL be available when the Player Wallet is active and BIS item access is available, without requiring a selected or ready Game Wallet.

#### Scenario: Player selects an item

- **WHEN** the player activates an unselected equipment card
- **THEN** that card becomes the active item for its type using the existing equipment selection behavior
- **AND** the active visual state is visibly stronger than an inactive card

#### Scenario: Player Wallet supports items without a Game Wallet

- **WHEN** the Player Wallet is logged in and active and no Game Wallet is selected
- **THEN** `hasItemSupport()` returns true
- **AND** the Items entry point remains available

#### Scenario: Player is not logged in

- **WHEN** the Player Wallet is not active
- **THEN** `hasItemSupport()` returns false
- **AND** the game does not present Items as available

#### Scenario: BIS item access is unavailable

- **WHEN** the account or BIS item service cannot be initialized
- **THEN** `hasItemSupport()` returns false
- **AND** ordinary gameplay remains available

#### Scenario: Trophy reward is completed

- **WHEN** the game mints and transfers a one-at-a-time trophy reward
- **THEN** the trophy flow remains independent of `hasItemSupport()` and its Game Wallet requirement
