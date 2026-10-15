## ADDED Requirements

### Requirement: Gameplay consumers can own disposable particle instances
Gameplay consumers SHALL be able to create, play once, reuse, and dispose particle-effect instances independently of the preview and bush consumers. A disposed combo effect SHALL stop playback, hide or remove its render resources, and not invoke stale callbacks after gameplay teardown.

#### Scenario: A confirmed combo impact plays its effect
- **WHEN** a confirmed player dagger combo impact selects a particle effect
- **THEN** the effect starts once at the configured combat presentation position without changing preview playback

#### Scenario: Combo effect teardown is safe
- **WHEN** gameplay disposes while a player-combo particle effect is active
- **THEN** the effect releases its resources without a later callback or visible stale sprite
