## ADDED Requirements

### Requirement: Items entry visibility follows BIS item support
The game SHALL render the main-menu Items button only when the active BIS account reports `hasItemSupport()` as true. When the capability is true, the existing inventory loading, empty-state, equipment refresh, and enabled/disabled behavior SHALL remain authoritative.

#### Scenario: Item support is unavailable
- **WHEN** the BIS account is absent, loading, logged out, unavailable, or reports `hasItemSupport()` as false
- **THEN** the main-menu Items button is not rendered
- **AND** no item inventory operation is initiated solely to determine visibility

#### Scenario: Item support is available
- **WHEN** the active BIS account reports `hasItemSupport()` as true
- **THEN** the main-menu Items button is rendered
- **AND** opening it uses the existing inventory and equipment-selection behavior

