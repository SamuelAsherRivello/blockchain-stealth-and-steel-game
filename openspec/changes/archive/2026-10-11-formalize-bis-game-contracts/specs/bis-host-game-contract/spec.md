# Spec Delta

## MODIFIED Requirements

### Requirement: Game consumes a verified pinned BIS release artifact

The game SHALL consume `@bis/integration` from a locally vendored packed tarball whose package metadata, SHA-256, packed-file inventory and exact BIS source commit are recorded in provenance. The dependency SHALL resolve to that verified artifact, not a BIS source-folder path or mutable remote branch. The exported version SHALL correspond to the verified new BIS Pages release implemented for the coordinated change.

#### Scenario: Local BIS artifact is prepared
- **WHEN** the BIS update workflow packs the adjacent repository's integration package
- **THEN** the game records the tarball path, exact package version, released source commit, SHA-256 and packed-file inventory before installing or building with it

#### Scenario: Dependency installation is repeated
- **WHEN** a developer installs the game from its lockfile
- **THEN** npm resolves the recorded vendored tarball and does not require the adjacent BIS checkout, a source symlink, or a mutable GitHub branch

#### Scenario: Imported archive differs from its inventory
- **WHEN** an archive or installed package file does not match the recorded inventory
- **THEN** package verification SHALL fail and the game SHALL not release that dependency

### Requirement: Game fulfills one published host contract

The game SHALL implement exported `IBisGame` and call BIS only through exported `IBis`, using the exact verified package's public API. The host contract SHALL include session read, target capture, confirmed continuation/reward delivery and typed event notifications. The game SHALL use no internal BIS import, Arkade type or raw context/wallet/controller channel, and SHALL remain playable without BIS, an account or connectivity.

#### Scenario: Game starts without a BIS account
- **WHEN** a player starts a normal game session without an available BIS account
- **THEN** gameplay proceeds without a host delivery or wallet-dependent action

#### Scenario: Game creates the BIS adapter
- **WHEN** the game initializes its BIS integration
- **THEN** it provides the complete published host contract through the verified vendored package's public API only

#### Scenario: Contract remains compatible after the local update
- **WHEN** the game builds and runs its BIS contract checks against the pinned artifact
- **THEN** the actual published contracts SHALL be accepted without importing BIS internal source paths or Arkade types
- **AND** a handwritten declaration mirror SHALL not substitute for the package's types

#### Scenario: A removed member is used by the consumer
- **WHEN** a game call refers to a member that the exported `IBis` contract does not expose
- **THEN** a contract or import-boundary check SHALL fail

### Requirement: Confirmed continuation delivery is typed and idempotent

BIS SHALL request a continuation effect only after independently confirming its financial operation. The game SHALL evaluate delivery against the bound active session and stable operation identifier, then return a typed receipt of `applied`, `already-applied`, or `not-applicable`. A result for a prior, ended, disposed or reloaded session SHALL be `not-applicable` and SHALL not modify the current run. A failed or unavailable game effect SHALL not cause BIS to charge again, reverse confirmed financial state, or deliver the effect to another session. Overlapping duplicates SHALL not apply the effect twice.

#### Scenario: Matching confirmed continuation revives the current loss
- **WHEN** BIS delivers a confirmed operation that matches the active defeat session and its continuation target
- **THEN** the game applies its existing paid-revival behavior once and returns `applied`

#### Scenario: Delivery is replayed for the same session
- **WHEN** BIS redelivers an already-applied confirmed continuation with the same operation identifier and session
- **THEN** the game returns `already-applied` and does not revive, remove enemies, or resume play a second time

#### Scenario: Delivery arrives after a new run begins
- **WHEN** a confirmed continuation for an old session arrives after restart, reload, or session replacement
- **THEN** the game returns `not-applicable` and the new run remains unchanged

#### Scenario: Duplicate delivery overlaps an in-flight effect
- **WHEN** the same session/operation is delivered concurrently
- **THEN** at most one game mutation SHALL occur
- **AND** the duplicate of an applied effect SHALL report `already-applied`

#### Scenario: Session ends during asynchronous preparation
- **WHEN** an effect performs asynchronous preparation and its session ends before the mutation
- **THEN** the game SHALL revalidate session applicability immediately before mutation and return `not-applicable` without changing the replacement run

### Requirement: Confirmed player reward presentation is game-owned

After BIS independently confirms a player-owned asset or sats reward, BIS SHALL provide the originally bound session, stable operation identifier, reward identifier and typed display/payload data. The game SHALL return a typed effect receipt and choose its own artwork, wording, UI placement and gameplay effect. A reward-presentation outcome SHALL not cause BIS to mint, transfer or charge again; concurrent duplicate presentation SHALL not duplicate feedback.

#### Scenario: Active session presents a confirmed reward
- **WHEN** BIS delivers a confirmed reward for the active session
- **THEN** the game presents its game-owned reward feedback and returns `applied`

#### Scenario: Reward has no applicable game session
- **WHEN** BIS delivers a confirmed reward for an ended or unknown session
- **THEN** the game returns `not-applicable` without changing a current session or replaying the BIS operation

#### Scenario: Reward completes after restart
- **WHEN** a reward started in an earlier run confirms after a new run begins
- **THEN** the game SHALL evaluate the earlier session rather than the session current at confirmation
- **AND** it SHALL not show the reward as an achievement of the replacement run

## ADDED Requirements

### Requirement: Game workflows use named commands and safe notifications

Account lifecycle, continuation, trophy collection, equipment, treasure, reset and cleanup SHALL use named `IBis` operations and safe DTOs. State, Account-close, restart and operation/effect notifications SHALL arrive through `IBisGame.onBisEvent`. Gameplay/UI consumers SHALL not recreate controller ownership or inspect wallet implementation state.

#### Scenario: The game receives Account-close and logout notifications
- **WHEN** BIS reports Account dismissal or a logout restart request
- **THEN** the game SHALL preserve Settings navigation, focus and pause behavior and deduplicate restart by its event identity

#### Scenario: Treasure funding confirms with its window closed
- **WHEN** BIS publishes updated contract state while the treasure window is closed
- **THEN** the game SHALL receive the update without requiring that window's timer to poll
- **AND** it SHALL reveal a chest only if its offer binding and gameplay eligibility still match

#### Scenario: Clear All Settings fails to reset BIS
- **WHEN** BIS reports a local cleanup failure
- **THEN** the game SHALL present failure rather than claim complete reset
- **AND** it SHALL permit a subsequent retry without silently abandoning BIS state

### Requirement: Integration documentation is accurate across the handoff

Affected current game documentation SHALL describe the installed exported contract, actual runtime adapter, typed responsibilities and release verification. Both-repository links and snippets SHALL resolve to the current implementation. The communication report SHALL retain its Contracts section and roles table while distinguishing historical observations from implemented and still-proposed behavior.

#### Scenario: Deep dives explain the released integration
- **WHEN** a reader follows the game or BIS deep dive after the coordinated release
- **THEN** both SHALL agree on `IBis`/`IBisGame`, DTO names, ownership and financial/effect separation
- **AND** source examples SHALL not promote removed backdoors or an unimplemented adapter class

### Requirement: Game acceptance uses the imported runtime

C088 SHALL pass the full game test suite, publishing checks, real-package contract checks, production build, artifact verification and browser runtime acceptance using the imported BIS version. No focused-test-only exception SHALL satisfy the full-green gate. AI-created browser URLs SHALL include both music and SFX mute parameters.

#### Scenario: Browser acceptance observes the installed BIS
- **WHEN** the production-built game is tested without wallet credentials
- **THEN** ordinary play and Settings/Account SHALL work, the BIS version SHALL match provenance, and no wallet action SHALL be initiated
- **AND** failures/coverage limits SHALL be recorded rather than fabricated as successful transactions
