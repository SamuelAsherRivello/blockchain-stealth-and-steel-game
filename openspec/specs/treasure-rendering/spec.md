# treasure-rendering Specification

## Purpose
This capability makes authored treasure visible in the level for every player while ensuring that treasure interaction is available only when the required BIS account and game-wallet setup is ready.

## Requirements

### Requirement: Authored treasure is rendered in the level
The game SHALL render one visible treasure chest for each valid treasure spawner in the loaded level only when the BIS account reports `hasContractSupport()` as true. The chest SHALL use the spawner's authored position and the level's established world-depth ordering. When contract support is false or unavailable, the treasure chest and its sensor SHALL not be rendered.

#### Scenario: Contract support is unavailable
- **WHEN** a player loads a valid level containing a treasure spawner and `hasContractSupport()` is false or unavailable
- **THEN** no treasure chest or treasure sensor is rendered
- **AND** ordinary non-treasure gameplay remains available

#### Scenario: Contract support is available
- **WHEN** a player loads a valid level containing a treasure spawner and `hasContractSupport()` is true
- **THEN** the treasure chest is visible at its authored level position
- **AND** the runtime-compatible treasure artwork is used

#### Scenario: Guest loads a level with treasure
- **WHEN** a player loads a valid level containing a treasure spawner without contract support
- **THEN** no treasure chest or treasure sensor is rendered and ordinary non-treasure gameplay remains available

#### Scenario: Treasure artwork is available to the renderer
- **WHEN** contract support is true and the level renderer initializes a treasure chest
- **THEN** it uses the runtime-compatible treasure artwork and does not require the editor-only asset format to decode at runtime

### Requirement: Treasure interaction requires ready BIS setup
The game SHALL expose treasure's enter interaction and treasure window only when the rendered treasure has the existing usable BIS account and game-wallet setup required by the treasure flow. Missing, unavailable, loading, or failed setup SHALL leave the capability-gated treasure absent or non-interactive without pausing gameplay.

#### Scenario: Contract support becomes unavailable
- **WHEN** the player enters or remains near a treasure sensor and `hasContractSupport()` becomes false
- **THEN** the treasure interaction does not open a treasure window
- **AND** no treasure pause or wallet operation is initiated

#### Scenario: Contract support and existing readiness are available
- **WHEN** `hasContractSupport()` is true and the existing treasure readiness checks pass
- **THEN** the treasure window opens through the existing treasure flow
- **AND** the existing treasure pause and failure handling remain unchanged

#### Scenario: BIS setup is absent
- **WHEN** contract support is true but the player enters the treasure sensor without a usable BIS account or game wallet
- **THEN** no treasure window opens, no treasure pause is added, and the existing non-interactive behavior remains in effect

#### Scenario: BIS setup is still loading
- **WHEN** contract support is true but the player enters the treasure sensor while BIS setup is loading
- **THEN** the treasure window does not open and gameplay is not paused by treasure interaction

#### Scenario: BIS setup is ready
- **WHEN** contract support is true and the player enters the treasure sensor with a usable BIS account and game wallet
- **THEN** the treasure window opens through the existing treasure flow and the treasure pause is applied

### Requirement: Rendering and interaction remain independently recoverable
The game SHALL keep treasure rendering alive when BIS readiness changes, and SHALL permit interaction to become available after setup becomes ready without requiring the level to be rebuilt. A failed or unavailable treasure action SHALL not remove the visible chest or block unrelated gameplay.

#### Scenario: Account becomes ready after level load
- **WHEN** a level has already rendered a non-interactive treasure chest and the required BIS setup later becomes ready
- **THEN** the existing chest can become interactive without duplicating its visual instance or sensor

#### Scenario: Treasure operation is unavailable
- **WHEN** a ready-account treasure interaction reports an unavailable or unsuccessful operation
- **THEN** the chest remains rendered, unrelated movement and gameplay remain usable, and the treasure flow reports its existing unavailable state
