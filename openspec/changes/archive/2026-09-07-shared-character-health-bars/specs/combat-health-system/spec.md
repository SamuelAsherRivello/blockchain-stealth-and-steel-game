## ADDED Requirements

### Requirement: Shared character health visibility on change
Every player, enemy character type, and sheep SHALL use the same compact green health fill, dark background, and thin border without numeric text. A meter SHALL start hidden and appear only when its character's current health changes. Actual health SHALL change immediately; presentation SHALL animate independently using gameplay time and pause with gameplay.

#### Scenario: A character takes damage while its meter is hidden
- **WHEN** current health changes from a previous value to a new value
- **THEN** the meter fades in for 0.1 seconds while showing the previous value, then animates its fill to the new value over 0.1 seconds
- **AND** after 1 second measured from the latest health change it fades out over 0.1 seconds

#### Scenario: Another change arrives during a fill transition
- **WHEN** health changes while the fill is animating or holding
- **THEN** the fill animates from its currently displayed value to the latest health over a fresh 0.1 seconds without snapping
- **AND** the hide timer restarts at that health change

#### Scenario: Another change arrives during a fade
- **WHEN** health changes during fade-in
- **THEN** the existing fade-in finishes while retaining the displayed health, then the fill animates to the latest health over 0.1 seconds
- **WHEN** health changes during fade-out
- **THEN** the meter fades back in from its current opacity over 0.1 seconds, then animates to the latest health over 0.1 seconds
- **AND** either change restarts the hide timer

#### Scenario: Health does not change
- **WHEN** a character spawns, a hit is blocked, or an update leaves current health unchanged
- **THEN** its meter is not revealed and its hide timer is not extended

#### Scenario: A character dies or revives
- **WHEN** lethal damage reduces character health to zero or below
- **THEN** the displayed fill animates to zero and the meter remains eligible to render during the existing 0.25-second death animation
- **AND** the meter disappears when the character becomes dead, even if its normal timeout has not elapsed
- **WHEN** an existing dead character revives with restored health
- **THEN** the meter starts a fresh reveal and fill transition for the restored health

### Requirement: Shared overhead placement
Perception icons and health meters SHALL be anchored to each character's logical center plus a centrally configured character-type-specific overhead offset, separate from artwork offsets. The perception icon SHALL occupy a fixed slot above the health bar, which SHALL clear the character's head. Both elements SHALL follow the same movement, visual jump displacement, and camera translation independently of debug visibility settings.

#### Scenario: Perception and damage occur together
- **WHEN** a perception icon and health bar are visible for the same character
- **THEN** both remain readable with a gap accommodating the icon at its full animation size
- **AND** neither element changes position when the other appears or disappears

## REMOVED Requirements

### Requirement: No health visibility
**Reason**: Character health changes now reveal a temporary shared overhead meter.
**Migration**: Use Shared character health visibility on change and Shared overhead placement. Bush health UI remains hidden.

