## Purpose

Provide a reusable circular iris transition that reveals or covers one supplied UI region without affecting adjacent presentation areas.

## ADDED Requirements

### Requirement: Target-cropped circular transition
The system SHALL accept a target element and render a black overlay only within that element's current bounds. The overlay SHALL reveal the target through a circle centred in the target and SHALL use the same circle in reverse to cover it. The transition SHALL update its crop when the target is resized.

#### Scenario: Portrait game frame excludes desktop gutters
- **WHEN** the transition targets the portrait game frame in a wide desktop viewport
- **THEN** the circular blackout and reveal affect only the game frame and leave both exterior gutters visible

#### Scenario: Target bounds change
- **WHEN** the target element's size changes
- **THEN** the overlay updates to the target's new position and dimensions while keeping its circle centred in that target

### Requirement: Timed initial reveal
The system SHALL begin fully black and, after the initial game frame and any enabled Start Menu have rendered, reveal the target from its centre over 250 ms. Once fully revealed, the overlay SHALL stop intercepting input.

#### Scenario: Default startup with Start Menu
- **WHEN** a run starts with the Start Menu enabled
- **THEN** the Start Menu is composed behind a fully black target before the 250 ms centre-out reveal begins

#### Scenario: Startup without Start Menu
- **WHEN** a run starts with the Start Menu disabled
- **THEN** the rendered game target is revealed from black over 250 ms without requiring a menu

### Requirement: Restart cover and reveal
The system SHALL pause the outgoing run when Restart Game is activated, cover the target from its outer edge to its centre over 250 ms, and retain full black until the fresh run has rendered. It SHALL then reveal the fresh run from its centre over 250 ms and restore normal input after the reveal.

#### Scenario: Restart from a loss menu
- **WHEN** the player activates Restart Game from the loss menu
- **THEN** the outgoing run stops while the target closes to black, the fresh initial run is composed, and its normal initial presentation reopens through the circle

#### Scenario: Repeated restart activation
- **WHEN** Restart Game is activated again while its circular transition is already in progress
- **THEN** the system performs only one replacement run and one corresponding reveal
