# Spec Delta

## MODIFIED Requirements

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
