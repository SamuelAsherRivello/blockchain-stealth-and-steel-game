# item-equipment-selection Specification

## Purpose

Provide a compact, playable-player equipment chooser whose item cards remain readable and usable within the game’s established portrait menu presentation.

## Requirements

### Requirement: Items uses the shared portrait menu frame

The system SHALL open Items as a closable Tiny Swords menu inside the visible game frame. Its width, parchment bounds, title ribbon, and safe margins SHALL match the logo-free Start Menu presentation rather than expand into desktop gutters or beyond the game frame.

#### Scenario: Wide desktop browser

- **WHEN** a logged-in player opens Items on a wide desktop browser
- **THEN** the complete Items ribbon, parchment, close control, instruction, and cards remain inside the centered portrait game frame
- **AND** the exterior desktop gutters remain decorative only

#### Scenario: Portrait viewport

- **WHEN** a logged-in player opens Items in a portrait viewport
- **THEN** the dialog uses the same compact menu width and horizontal safe margins as the Start Menu
- **AND** no portion of the dialog is clipped or positioned offscreen

### Requirement: Inventory cards use available portrait space

The system SHALL present owned equipment as selectable square cards using a centered grid that adapts to the owned-item count. The grid SHALL use one column for a small inventory when that preserves readable card content, add columns only as needed, and show up to nine owned cards without a scrollbar.

#### Scenario: Player owns two items

- **WHEN** the player opens Items with two owned equipment assets
- **THEN** both assets appear as large, readable square cards within the parchment panel
- **AND** their name, sats price, Speed, Offense, and Defense values remain legible without overlap

#### Scenario: Player owns nine items

- **WHEN** the player opens Items with nine owned equipment assets
- **THEN** all nine square cards are visible within the portrait panel without a dialog or grid scrollbar

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

### Requirement: Items entry visibility follows BIS item support

The game SHALL construct the main-menu action set from the active BIS account's
`hasItemSupport()` capability. When the capability is true, the menu SHALL
render exactly a Start button and an Items button. When the capability is
false, unavailable, loading, logged out, or absent, the menu SHALL render
exactly a Start button and SHALL NOT render, hide, disable, label, or otherwise
expose an Items action. No item inventory operation SHALL be initiated solely
to determine menu visibility.

#### Scenario: Item support is unavailable

- **WHEN** the BIS account is absent, loading, logged out, unavailable, or
  reports `hasItemSupport()` as false
- **THEN** the Start Menu contains exactly one action, Start
- **AND** no Items button or BIS-only item action exists in the menu DOM
- **AND** ordinary gameplay remains available

#### Scenario: Item support is available

- **WHEN** the active BIS account reports `hasItemSupport()` as true
- **THEN** the Start Menu contains exactly two actions, Start and Items
- **AND** opening Items uses the existing inventory and equipment-selection
  behavior
- **AND** the Items action retains its existing enabled/disabled behavior

#### Scenario: Unsupported users do not receive a deferred BIS action

- **WHEN** the Start Menu is created before item support is available
- **THEN** the initial menu remains Start-only
- **AND** capability refreshes do not focus, activate, or invoke inventory for a
  nonexistent Items action
