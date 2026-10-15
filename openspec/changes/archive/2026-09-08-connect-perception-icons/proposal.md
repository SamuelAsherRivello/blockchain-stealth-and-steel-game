## Current contract reconciliation (2026-09-08)

Preserve stop-before-redecision on awareness transitions and the existing expression mapping. Under C060, an enemy with its own visually confirmed ALERT tracks hidden movement only until its existing alert timer expires; concealment produces no new detection and never refreshes that timer. The icon follows the resulting reaction state, with investigation beginning on expiry.

Existing task IDs, checkbox states and historical review evidence are retained. This specification sync does not claim new implementation or verification.

## Why

Characters already have four perception-state icons available above them, and the perception system already updates an independent reaction state. The two pieces are not yet connected, so the player cannot see when a character hears or otherwise accepts a perception event.

## What Changes

- Connect each character's current perception reaction state to its overhead expression icon.
- Show the icon corresponding to `SUSPICIOUS`, `INVESTIGATING`, or `ALERT` after the perception system updates that character's state.
- Hide the overhead icon for `NONE` and when the character has no active perception state.
- Preserve the existing icon placement, fade, scale, flash, and debug-key behavior unless changed by the state-to-icon connection.
- Ensure state transitions and clearing perception state update the icon on the next rendered frame.
- Show a capital `H` over the player while the player's combat collider overlaps at least one living bush combat collider.
- Fade all player artwork from 100% to 80% opacity on hidden entry and back to 100% on exit over the existing enemy expression animation duration, without the enemy white flash or jump.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-perception-reactions`: Runtime overhead icons must reflect each character's four-state perception reaction.

## Impact

Likely affects the main update coordinator, player visual transforms, character records, expression-icon rendering, bush overlap checks, and perception/stealth tests. No new dependency or asset is required; the existing icon renderer is reused.


## Shared icon typography (2026-09-08)

All player and enemy perception icons use one 22.4 px base font size (80% of the previous 28 px standard), with no special font-size override for H. Badge geometry, placement and animation remain unchanged.
