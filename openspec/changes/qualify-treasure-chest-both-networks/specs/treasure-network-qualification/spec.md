# Spec delta

## Purpose

Define how Treasure earns per-network and per-mode qualification using real contract behavior, protected recovery and verifiable receipts.

## ADDED Requirements

### Requirement: Network support is advertised only after mode qualification
Each network and signing mode SHALL be enabled only when its exact contract behavior and lifecycle have passed the applicable live acceptance matrix.

#### Scenario: Mutinynet co-signer evidence is incomplete
- **WHEN** operator admission or finalization evidence is missing for the co-signer mode
- **THEN** that mode remains unavailable for new offers
- **AND** browser-policy availability does not imply co-signer qualification

#### Scenario: Browser-policy mode passes independently
- **WHEN** real funded contract and lifecycle evidence passes for browser-policy mode on one network
- **THEN** only that network and mode may be advertised with browser-enforced limitations disclosed

### Requirement: Admin mode choices describe actual guarantees
Admin SHALL expose only network modes that are explicitly selectable for testing and SHALL label their enforcement guarantees before funding.

#### Scenario: Tester selects Mutinynet
- **WHEN** the Admin network is Mutinynet
- **THEN** Arkade co-signer is the default and Browser validation is an explicit alternative
- **AND** selecting co-signer cannot silently downgrade

#### Scenario: Tester selects Signet
- **WHEN** the Admin network is Signet for the Signet-only release
- **THEN** Browser validation is the only available mode

### Requirement: Game mode selection is automatic and immutable
Game clients SHALL select the strongest currently supported mode through non-mutating preflight before funding and SHALL NOT ask the player to choose.

#### Scenario: Stronger mode is unavailable before funding
- **WHEN** preflight proves the co-signer mode is unsupported before any financial submission
- **THEN** the game may select the approved browser-policy mode and disclose its limits

#### Scenario: Submission outcome is uncertain
- **WHEN** funding or a spend may have reached the network
- **THEN** the original mode and operation remain bound and no fallback or replacement is submitted

### Requirement: Recovery of unresolved original contracts requires attributable evidence
An unresolved contract SHALL retain its original descriptor, journal and reservations until exact network evidence establishes its result; recovery SHALL use only the original contract terms and authorized keys.

#### Scenario: Original B2 swept output lacks operator acceptance evidence
- **WHEN** current operator identity or acceptance rules for the exact recovery intent are unknown
- **THEN** no signing or submission occurs and the output remains unresolved

#### Scenario: Recovery completes
- **WHEN** the exact original output is recovered and the terminal transaction is independently verified
- **THEN** the original operation is reconciled with its receipt and reservations updated from evidence

### Requirement: Two-network qualification preserves real contract evidence
Qualification SHALL use the exact imported BIS artifact, real compiled scripts, real network funding and spends, and exact receipts for every advertised network/mode lifecycle case.

#### Scenario: Deterministic tests pass without live receipts
- **WHEN** UI, type, unit or simulated-provider tests pass without real contract receipts
- **THEN** they establish deterministic behavior only and do not qualify network acceptance

#### Scenario: A lifecycle case is blocked or unperformed
- **WHEN** a required live case cannot safely run or lacks verifiable evidence
- **THEN** it remains explicitly blocked or unperformed and the corresponding qualification stays incomplete

### Requirement: Responsiveness acceptance separates local and provider time
Treasure SHALL report local interaction timing separately from provider response and SHALL retain the 100 ms local p95 goal for this two-network qualification.

#### Scenario: Provider is slow or offline
- **WHEN** a provider request is slow or unavailable
- **THEN** local controls remain usable and provider duration is not counted as local input acknowledgement

#### Scenario: Hidden tab and funded action are measured
- **WHEN** acceptance measures hidden-tab recovery or funded action acknowledgement
- **THEN** it uses an actual hidden tab and real operation receipt or records the case unperformed
