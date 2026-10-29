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

#### Scenario: Qualified Mutinynet Direct offer
- **WHEN** the active Mutinynet Direct run has a current matching verified funded Browser validation offer
- **THEN** the authored chest and normal interaction become available without a BIS server
- **AND** the upper-left shared header shows `Direct` with the selected network and BIS version

#### Scenario: Qualified Signet Server offer
- **WHEN** the active Signet Server run has a current matching verified funded Browser validation offer
- **THEN** the same authored chest and normal interaction become available
- **AND** the upper-left shared header shows `Server`, with actual connection health reported separately

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

## ADDED Requirements

### Requirement: Chest presentation stays stable during inspection
An eligible chest window SHALL open from current scoped presentation without awaiting a provider response. Its layout, artwork and focus SHALL remain stable through pending, unavailable and expired states. Back and Escape SHALL remain usable during inspection or actions, and closing SHALL NOT cancel submitted financial work.

#### Scenario: Reopen during a slow inspection
- **WHEN** the player closes and reopens the same chest while inspection is pending
- **THEN** the window opens immediately and adopts the existing offer-scoped request
- **AND** a response for the old window cannot close the new one

### Requirement: Loading feedback is bounded and nonblocking
The window SHALL acknowledge input immediately, delay dedicated loading indicators until 300 ms, and explain a delayed result after ten seconds. Status checking SHALL coalesce matching inspections and SHALL NOT submit another financial action. Countdown rendering SHALL NOT request network data.

#### Scenario: Inspection completes quickly
- **WHEN** inspection finishes before 300 ms
- **THEN** no transient loading indicator flashes

#### Scenario: Inspection remains unresolved
- **WHEN** a result remains unknown for ten seconds
- **THEN** the player sees delayed-status feedback with usable Back and safe status checking
- **AND** the fixed offer deadline and original financial operation remain unchanged
