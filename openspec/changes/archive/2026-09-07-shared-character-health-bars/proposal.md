## Why

Players need to see how much health a character loses without permanently covering the playfield in meters. C068 records the completed shared health-bar implementation and its verified overhead layout.

## What Changes

- Reveal the same green, unnumbered health meter for every player, enemy type, and sheep only when health changes.
- Fade in for 0.1 seconds, animate health for 0.1 seconds, and fade out for 0.1 seconds starting one second after the latest health change.
- Smoothly retarget rapid changes, pause animation with gameplay, and remove meters when the existing death animation finishes.
- Position health bars and perception icons in separate fixed slots above each character, using a character-specific center offset and shared jump/camera tracking.
- Replace the previous character health-UI prohibition; preserve hidden health UI for bushes and other objects.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `combat-health-system`: Health-change presentation and shared overhead placement for all character types.

## Impact

Shared combat state exposes maximum health and unsubscribable change notifications. The main actor lifecycle owns meter controllers, and the existing canvas compositor draws both overhead elements. No new dependency, persistence migration, or gameplay damage rule is introduced. The main spec was updated during implementation; this retrospective record captures that completed work for archival.
