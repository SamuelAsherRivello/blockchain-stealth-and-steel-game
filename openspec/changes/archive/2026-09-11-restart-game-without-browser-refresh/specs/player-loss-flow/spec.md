## MODIFIED Requirements

### Requirement: Abandoned runs receive no payment consequence
Restart Game SHALL begin a free new run in the current document without browser navigation or refresh. The new run SHALL start the first map of the saved Map Order, reset all run-owned world and player state, and use a new game-session identity without clearing persistent settings or account data. Closing or refreshing SHALL not restore the defeated world's state. The game SHALL dispose each loss controller on teardown and ignore callbacks from old defeats or sessions. Normal BIS payment-journal recovery SHALL remain separate from gameplay.

#### Scenario: Restart from loss without browser navigation
- **WHEN** the enabled Restart Game action is activated from the loss menu
- **THEN** the defeated world is discarded and a fresh run reaches its normal initial start state without changing the document URL or creating a browser navigation
- **AND** the fresh run uses the first saved Map Order map while preserving persistent settings and account data

#### Scenario: Late payment after restart
- **WHEN** an old payment completes after Restart Game has created a new session
- **THEN** it cannot revive the player, remove enemies, or otherwise modify the new session

#### Scenario: Late payment after close
- **WHEN** an old payment completes after its game session ends
- **THEN** it cannot revive the player or remove enemies in a new session
