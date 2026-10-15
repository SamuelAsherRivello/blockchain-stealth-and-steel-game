# repository-layout Specification

## Purpose

Give contributors one predictable application folder, organized public assets, and a hidden planning directory while retaining root-level npm commands.


## Requirements

### Requirement: Root commands operate on the contained application
The repository SHALL keep its npm manifests and Vite configuration at the root. Application code SHALL live under `stealth-steel/src/runtime/`, tests and their execution tools under `stealth-steel/src/test/`, and the HTML entry point at `stealth-steel/index.html`. Documentation, plugins, and vendor packages SHALL live inside `stealth-steel/`. No separate application scripts directory SHALL remain.

#### Scenario: Contributor runs the project from the repository root
- **WHEN** a contributor installs the locked dependencies and runs the documented npm test and build commands
- **THEN** tests execute against the relocated application and the production bundle is written to root `dist/`
- **AND** the documented Vite launch command serves the relocated HTML entry point

### Requirement: Public assets are grouped by media purpose
The application SHALL organize served assets under `assets/audio/`, `assets/images/`, and `assets/levels/`. All game images and editable Aseprite files SHALL be under images, each Aseprite source beside its corresponding exports. Archer artwork SHALL be under `images/enemies/archer/`. Environment metadata SHALL remain `public/environment.json`. Tiled maps and palettes SHALL resolve their relocated images and tilesets correctly.

#### Scenario: Existing game and Tiled content load after relocation
- **WHEN** the game or Tiled opens existing levels, characters, UI, and audio
- **THEN** referenced assets resolve at their new paths with unchanged artwork and gameplay data
- **AND** the goblin Aseprite source remains Git-ignored

### Requirement: One hidden planning directory
The repository SHALL store active changes, archived changes, configuration, and specifications only under `openspec/`, preserving canonical change and task IDs. A visible `openspec/` directory or link SHALL NOT be required. Repository documentation and skills SHALL describe an executable CLI entry that reads and writes this hidden directory without changing globally installed tools.

#### Scenario: Contributor inspects and validates planning state
- **WHEN** a contributor runs the documented repository OpenSpec status, list, instructions, or validate commands
- **THEN** the commands resolve `openspec/` and preserve all existing changes, including untracked work
- **AND** no root `openspec/` compatibility directory or link is created

### Requirement: Review precedes committing
The migration SHALL complete automated verification and report its results before requesting user approval and a manual Vite check. It SHALL NOT commit or publish before that review.

#### Scenario: Migration is ready for user review
- **WHEN** the automated checks finish
- **THEN** the user receives the result, any outstanding limitation, and the root Vite launch command
- **AND** the working changes remain uncommitted for approval
