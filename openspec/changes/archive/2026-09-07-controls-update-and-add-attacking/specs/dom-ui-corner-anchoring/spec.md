## MODIFIED Requirements

### Requirement: Corner and control-unit anchoring
The version label SHALL be anchored to the upper-left, the settings control SHALL be anchored to the upper-right, the Move control SHALL be anchored to the lower-left, and Attack SHALL be the sole lower-right action while Item is temporarily unavailable. No blank Item slot SHALL reserve layout space.

#### Scenario: All overlay controls are visible
- **WHEN** the visible game rectangle is rendered
- **THEN** the version and settings controls occupy opposite upper corners, Move occupies the lower-left, and Attack occupies the lower-right

#### Scenario: Lower-right unit resizes
- **WHEN** the Attack control changes rendered size due to browser scale
- **THEN** Attack remains anchored to the lower-right inset
