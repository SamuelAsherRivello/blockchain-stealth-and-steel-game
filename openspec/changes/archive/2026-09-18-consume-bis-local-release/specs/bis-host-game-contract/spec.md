## ADDED Requirements

### Requirement: Game consumes a verified pinned BIS release artifact
The game SHALL consume `@bis/integration` from a locally vendored packed tarball
whose package metadata, SHA-256, and file inventory are recorded in repository
provenance metadata. The dependency SHALL resolve to the exact verified artifact
used for the build rather than a BIS source-folder path or an unbounded remote
branch.

#### Scenario: Local BIS artifact is prepared
- **WHEN** the BIS update workflow packs the adjacent repository's integration
  package
- **THEN** the game records the tarball path, package version `0.0.1`, SHA-256,
  and packed-file inventory before installing or building with it

#### Scenario: Dependency installation is repeated
- **WHEN** a developer installs the game from its lockfile
- **THEN** npm resolves the recorded vendored tarball and does not require the
  adjacent BIS checkout, a source symlink, or a mutable GitHub branch

### Requirement: BIS update verification is credential-free
The game-side BIS update verification SHALL inspect package contents and public
API compatibility, run applicable tests/typechecks/builds, and SHALL NOT request,
  print, commit, or use wallet secrets or perform wallet operations.

#### Scenario: Verification runs without wallet setup
- **WHEN** the package update checks execute in a checkout without wallet
  credentials or a configured account
- **THEN** package and game verification can complete without exposing secrets or
  broadcasting, signing, or initiating a payment

## MODIFIED Requirements

### Requirement: Game fulfills one published host contract
The game SHALL fulfill the published `BisHostGame` contract from the exact
verified vendored BIS artifact and SHALL use no BIS internal source path or
Arkade type. The contract SHALL contain active-session reference,
continuation-target capture, confirmed-continuation application, and
confirmed-player-reward presentation capabilities. The game SHALL remain
playable when the BIS package, account, or connectivity is unavailable.

#### Scenario: Game starts without a BIS account
- **WHEN** a player starts a normal game session without an available BIS account
- **THEN** gameplay proceeds without a host delivery or wallet-dependent action

#### Scenario: Game creates the BIS adapter
- **WHEN** the game initializes its BIS integration
- **THEN** it provides the complete published host contract through the verified
  vendored package's public API only

#### Scenario: Contract remains compatible after the local update
- **WHEN** the game builds and runs its BIS contract checks against the pinned
  artifact
- **THEN** the published host contract is accepted without importing BIS
  internal source paths or Arkade types
