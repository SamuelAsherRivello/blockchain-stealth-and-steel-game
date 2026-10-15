## Purpose

Provide a compact, playable-player equipment chooser whose item cards remain readable and usable within the game’s established portrait menu presentation.

## ADDED Requirements

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

The Items dialog SHALL display `Select 1 of each item type to activate it for gameplay`, preserve existing card details and selection behavior, and make an active item visually distinct without relying solely on text.

#### Scenario: Player selects an item

- **WHEN** the player activates an unselected equipment card
- **THEN** that card becomes the active item for its type using the existing equipment selection behavior
- **AND** the active visual state is visibly stronger than an inactive card
