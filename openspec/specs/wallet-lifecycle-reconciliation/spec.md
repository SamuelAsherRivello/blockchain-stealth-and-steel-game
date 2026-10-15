# wallet-lifecycle-reconciliation Specification

## Purpose
Define the game-owned response when the public BIS snapshot changes either the Player Wallet or the Game Wallet identity and readiness.

## Requirements

### Requirement: Wallet identity changes are reconciled from public BIS state
The game SHALL compare successive safe BIS snapshots to detect Player Wallet and Game Wallet login, logout, identity replacement, and network replacement. It SHALL not infer wallet state from BIS DOM or import internal BIS state.

#### Scenario: Game Wallet login changes readiness
- **WHEN** a safe BIS snapshot adds or replaces the Game Wallet identity
- **THEN** the game recomputes wallet-dependent eligibility using the current Player and Game Wallet identities and networks
- **AND** free gameplay remains available

#### Scenario: Game Wallet logout removes readiness
- **WHEN** a safe BIS snapshot removes the Game Wallet identity while the Player Wallet remains available
- **THEN** the game disables Game-Wallet-dependent actions and invalidates stale Game-Wallet-bound presentation or eligibility
- **AND** it does not log out the Player Wallet or leave interaction blocked

### Requirement: Wallet replacement invalidates obsolete game work
When either wallet identity or network changes, the game SHALL prevent obsolete asynchronous wallet-dependent work from enabling actions, applying a game effect, or replacing the current wallet-derived presentation. It SHALL not represent this local invalidation as cancellation of a submitted financial operation.

#### Scenario: Wallet-bound work completes after replacement
- **WHEN** a wallet-dependent result arrives after either bound wallet has logged out, been replaced, or changed network
- **THEN** the game ignores the obsolete result for current eligibility and presentation
- **AND** any recorded submitted operation remains subject to BIS's existing recovery behavior
