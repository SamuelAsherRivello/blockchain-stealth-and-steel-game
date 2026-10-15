# Spec Delta

## MODIFIED Requirements

### Requirement: Release versions use an exact three-component tag

The system SHALL accept release display versions only in the form `v<major>.<minor>.<patch>`, normalize an uppercase leading `V` to lowercase, and use `v0.0.0` when supplied runtime metadata is absent or invalid. For Pages builds this tag-shaped label SHALL derive from the checked-in package version; an actual Git tag SHALL not be required.

#### Scenario: Valid release version is displayed
- **WHEN** metadata supplies `v0.1.7` or `V0.1.7`
- **THEN** the resolved release version is `v0.1.7`

#### Scenario: Invalid release version falls back locally
- **WHEN** metadata supplies an incomplete, prerelease, non-string, or otherwise invalid version
- **THEN** the resolved release version is `v0.0.0`

#### Scenario: Package-versioned Pages deployment
- **WHEN** the game is built for Pages with a valid checked-in package version
- **THEN** release metadata SHALL use that version with a lowercase `v` prefix without requiring a Git tag

### Requirement: Release builds contain self-consistent metadata

The Pages production build SHALL derive its release label from the authoritative package version, write a fixed-width placeholder size before measuring, calculate the total uncompressed size of all completed browser-build files, replace the placeholder with the same-width byte count and verify the replacement does not change that total. Invalid build-version input SHALL fail publication rather than masquerade as a valid release. BIS SHALL release first; the game SHALL import its verified archive and publish with the identical complete major.minor.patch version. A mismatch SHALL fail the game production build.

#### Scenario: Coordinated versions must match completely
- **WHEN** BIS `0.0.18` has released and the game imports that verified version
- **THEN** the game package and published label SHALL be `0.0.18` and `v0.0.18` respectively
- **AND** a game package version differing in any component SHALL fail production build validation

#### Scenario: Release build records its exact total size
- **WHEN** a Pages build of package version `0.1.7` produces a browser build whose total size fits the metadata field
- **THEN** built `environment.json` contains release version `v0.1.7` and a twelve-digit byte count equal to the final uncompressed browser-build size

#### Scenario: Invalid release tag is rejected
- **WHEN** build input is not an exact three-component package version
- **THEN** the production release build fails before publishing the browser app

### Requirement: Published releases remain addressable

The game SHALL publish tested updates pushed to `main` through a push-triggered Pages workflow at the single stable application route `https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/`. Current user-facing entry guidance SHALL provide one game link, not separate latest/versioned entry links. Game publication SHALL be independent of BIS Admin/Marketplace deployment. Release evidence SHALL identify the intended remote commit, package version, imported BIS version and successful deployment run. Tags, GitHub Release assets, immutable tag-addressed builds, root/latest redirects and manual release dispatch SHALL not be prerequisites for this approved Pages release process.

#### Scenario: New release is published
- **WHEN** a tested game update is pushed to `main` and its push-triggered Pages workflow successfully deploys that commit
- **THEN** the documented public game route serves that application/version and uses the verified BIS artifact
- **AND** release evidence identifies both deployed game and BIS versions and the successful workflow run

#### Scenario: Game and BIS updates are published separately
- **WHEN** a game update is published after importing the verified BIS artifact
- **THEN** the game workflow SHALL update the single stable game route without publishing the BIS demo site
- **AND** the game update SHALL not require a tag, release asset or manual release dispatch

#### Scenario: Deployment serves an earlier commit
- **WHEN** the route or deployment evidence identifies an earlier version than the intended game update
- **THEN** release verification SHALL remain incomplete despite a successful local build or accepted workflow dispatch
