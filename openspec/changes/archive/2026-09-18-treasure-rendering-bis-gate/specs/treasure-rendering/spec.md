## Purpose

This capability makes authored treasure visible in the level for every player while ensuring that treasure interaction is available only when the required BIS account and game-wallet setup is ready.

## ADDED Requirements

### Requirement: Authored treasure is rendered in the level
The game SHALL render one visible treasure chest for each valid treasure spawner in the loaded level, using the spawner's authored position and the level's established world-depth ordering. Rendering the chest SHALL NOT depend on a connected BIS account.

#### Scenario: Guest loads a level with treasure
- **WHEN** a player loads a valid level containing a treasure spawner without a BIS account
- **THEN** the treasure chest is visible at its authored level position and ordinary gameplay remains available

#### Scenario: Treasure artwork is available to the renderer
- **WHEN** the level renderer initializes a treasure chest
- **THEN** it uses the runtime-compatible treasure artwork and does not require the editor-only asset format to decode at runtime

### Requirement: Treasure interaction requires ready BIS setup
The game SHALL expose treasure's enter interaction and treasure window only when the BIS account host reports a usable player account and game-wallet setup for the treasure flow. Missing, unavailable, loading, or failed BIS setup SHALL leave the rendered chest visible but non-interactive.

#### Scenario: BIS setup is absent
- **WHEN** the player enters the treasure sensor without a usable BIS account or game wallet
- **THEN** no treasure window opens, no treasure pause is added, and the chest remains visible

#### Scenario: BIS setup is still loading
- **WHEN** the player enters the treasure sensor while BIS setup is loading
- **THEN** the chest does not open the treasure window and gameplay is not paused by treasure interaction

#### Scenario: BIS setup is ready
- **WHEN** the player enters the treasure sensor with a usable BIS account and game wallet
- **THEN** the treasure window opens through the existing treasure flow and the treasure pause is applied

### Requirement: Rendering and interaction remain independently recoverable
The game SHALL keep treasure rendering alive when BIS readiness changes, and SHALL permit interaction to become available after setup becomes ready without requiring the level to be rebuilt. A failed or unavailable treasure action SHALL not remove the visible chest or block unrelated gameplay.

#### Scenario: Account becomes ready after level load
- **WHEN** a level has already rendered a non-interactive treasure chest and the required BIS setup later becomes ready
- **THEN** the existing chest can become interactive without duplicating its visual instance or sensor

#### Scenario: Treasure operation is unavailable
- **WHEN** a ready-account treasure interaction reports an unavailable or unsuccessful operation
- **THEN** the chest remains rendered, unrelated movement and gameplay remain usable, and the treasure flow reports its existing unavailable state
