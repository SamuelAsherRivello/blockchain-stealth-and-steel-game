# Spec delta

## MODIFIED Requirements

### Requirement: Authored treasure is rendered in the level
The game SHALL reveal one treasure chest per valid authored spawner only after a current, matching BIS projection establishes an eligible funded offer and contract support. It SHALL use the authored position, runtime artwork and established world-depth ordering. Capability readiness or restored game session state alone SHALL NOT establish funding. Without a matching eligible funded offer, no new chest or sensor SHALL be created.

#### Scenario: Contract support is unavailable
- **WHEN** a player loads a valid level containing a treasure spawner and `hasContractSupport()` is false or unavailable
- **THEN** no new treasure chest or treasure sensor is rendered
- **AND** ordinary non-treasure gameplay remains available

#### Scenario: Contract support is available
- **WHEN** contract support is available and a current matching projection proves an eligible funded offer
- **THEN** the treasure chest appears at its authored level position
- **AND** the runtime-compatible artwork is used without opening the treasure window automatically

#### Scenario: Guest loads a level with treasure
- **WHEN** a player loads a valid level containing a treasure spawner without contract support
- **THEN** no treasure chest or sensor is rendered and ordinary gameplay remains available

#### Scenario: Treasure artwork is available to the renderer
- **WHEN** verified offer eligibility permits a treasure chest to be initialized
- **THEN** it uses runtime-compatible treasure artwork without decoding the editor-only asset format

#### Scenario: Capability is ready before funding
- **WHEN** the wallet capability is ready but matching funding is pending or unknown
- **THEN** the game does not reveal a new chest or enable a claim

#### Scenario: Active state is restored from game storage
- **WHEN** game storage contains a previously active treasure session without a current verified BIS projection
- **THEN** the restored cache cannot reveal a new chest or authorize its financial actions

### Requirement: Rendering and interaction remain independently recoverable
Once revealed, the chest SHALL remain rendered when offer status becomes pending, unavailable or expired; financial interaction SHALL follow current verified eligibility. Supported offer updates SHALL enable interaction without duplicating artwork or sensors. A failed treasure action SHALL leave unrelated gameplay usable. Readiness changes SHALL NOT create a replacement for an offer skipped at Start.

#### Scenario: Account becomes ready after level load
- **WHEN** a revealed chest temporarily loses interaction readiness and the same offer later becomes verified and eligible again
- **THEN** its existing visual and sensor can become interactive without duplication

#### Scenario: Treasure operation is unavailable
- **WHEN** a revealed chest's action reports an unavailable or unsuccessful operation
- **THEN** its artwork remains visible, unrelated movement remains usable, and the flow reports unavailable state

#### Scenario: Start was skipped before wallet readiness
- **WHEN** account readiness appears after a Start that did not create an offer
- **THEN** readiness alone does not create a new offer or reveal a funded chest
