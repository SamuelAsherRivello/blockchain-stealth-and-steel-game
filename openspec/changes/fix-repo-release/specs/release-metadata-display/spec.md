# Spec Delta

## ADDED Requirements

### Requirement: Version releases are manually dispatched from authoritative main
The repository SHALL provide a documented manual GitHub Actions release dispatch on `main`. It SHALL derive the next `v<major>.<minor>.<patch>` tag by incrementing the checked-in application patch version, keep the package and lockfile versions aligned, and release only a commit containing the intended remote `main` changes.

#### Scenario: Next patch release is dispatched
- **WHEN** the authoritative `main` commit contains application version `0.1.15` and the latest corresponding release is `v0.1.15`
- **THEN** the workflow prepares `v0.1.16` from that commit and publishes no earlier commit as the new release

#### Scenario: Release source has moved or version is already fully published
- **WHEN** remote `main` advances during release preparation or the intended tag, asset, and Pages deployment already exist
- **THEN** the workflow fails safely without overwriting a tag, release asset, or newer branch commit

### Requirement: Release verification precedes remote mutation
The release workflow SHALL install locked dependencies, pass publishing checks, the full test suite, and the production build before pushing a version commit or tag or creating a GitHub Release. Failed verification SHALL leave remote release state unchanged.

#### Scenario: A required check fails
- **WHEN** a publishing check, full test, or production build fails
- **THEN** no release commit, tag, GitHub Release, or Pages publication is created

## MODIFIED Requirements

### Requirement: Release builds contain self-consistent metadata
The release workflow SHALL require an exact three-component release tag, write that tag and a fixed-width placeholder size before building, calculate the total uncompressed size of all files in the completed browser build, replace the placeholder with the same-width byte count, and verify that the replacement does not change the measured total. The tag SHALL match the released package and lockfile version.

#### Scenario: Release build records its exact total size
- **WHEN** a release tagged `v0.1.7` produces a browser build whose total file size fits the metadata field
- **THEN** the built `environment.json` contains release version `v0.1.7` and a twelve-digit download-size value equal to the final total uncompressed build size

#### Scenario: Invalid release tag is rejected
- **WHEN** the release workflow receives a tag that is not exactly `v<major>.<minor>.<patch>`
- **THEN** the workflow fails before building or publishing the browser app

#### Scenario: Version sources disagree
- **WHEN** the intended tag does not match the released package version or the lockfile version
- **THEN** the workflow fails before pushing a release commit or publishing the browser app

### Requirement: Published releases remain addressable
The release workflow SHALL package the browser build as an immutable GitHub Release asset, assemble available versioned builds under their release tags, and publish root and `latest` entry points that direct users to the newly released version. Unreleased `main` pushes SHALL NOT replace those entry points or remove earlier versioned builds.

#### Scenario: New release is published
- **WHEN** the GitHub Release for `v0.1.7` is published successfully
- **THEN** the versioned `v0.1.7` build remains available and both the root and `latest` entry points lead to it

#### Scenario: Main advances without a release
- **WHEN** a commit is pushed to `main` after the latest published release
- **THEN** the public root and `latest` still lead to that release, and its versioned build remains available

#### Scenario: Publication is retried
- **WHEN** a release tag exists but publication previously failed before the GitHub Release asset or Pages deployment completed
- **THEN** a retry uses that same tag and immutable build identity without generating an extra version or replacing an existing asset
