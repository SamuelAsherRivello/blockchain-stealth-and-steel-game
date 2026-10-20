# Spec delta

## Purpose

Provide a verifiable treasure reward lifecycle for user-owned wallets, preserving the game's reward experience and making enforcement, custody and recovery guarantees explicit.

## ADDED Requirements

### Requirement: Local wallet ownership is explicit
The treasure flow SHALL use separate user-owned Player and Game Wallets without an application server. Setup SHALL identify the Game Wallet as the source of the reward. The product SHALL NOT imply a protected shared publisher treasury, authoritative gameplay verification, distributed exclusivity or cleanup while all clients are closed.

#### Scenario: Reward setup
- **WHEN** a user configures treasure rewards
- **THEN** the user can identify which locally controlled Game Wallet funds the reward
- **AND** no shared treasury key or automatically transferred recovery phrase is required

### Requirement: Original reward terms remain immutable
Explicit Start SHALL request at most one offer of 1,000 sats with an immutable deadline 90 seconds after its original start. The offer SHALL bind network, operator, wallet identities, offer identity and host reference. Funding delay, pause, tab suspension, progression, continuation and reopening SHALL NOT extend its deadline or create a replacement.

#### Scenario: Delayed funding
- **WHEN** funding completes 60 seconds after the original Start
- **THEN** no more than 30 seconds of the original offer window remains

#### Scenario: Repeated start request
- **WHEN** the same offer request is repeated or restored
- **THEN** the existing operation is inspected without a second funding submission

### Requirement: Production enforcement is independently qualified
A production-qualified treasure offer SHALL demonstrate its committed deadline and authorized claim, rejection, session-end cancellation and refund rules through executable spend validation and real operator acceptance. Browser time checks, a refund minimum timelock alone and UI tests SHALL NOT establish expiry enforcement. Unsupported exact behavior SHALL block qualification without silently changing the window or trust model.

#### Scenario: Modified client bypasses countdown
- **WHEN** a validly signed late claim bypasses the browser's eligibility checks
- **THEN** the qualified execution path rejects it using the committed rules

#### Scenario: Early refund bypass
- **WHEN** the Game Wallet attempts to revoke an active offer without its required rejection or explicit bound session-end authorization
- **THEN** the qualified execution path rejects the spend through every reachable branch

#### Scenario: User explicitly ends an offer session
- **WHEN** an explicit new Start or user-authorized session end cancels the original offer
- **THEN** only that offer becomes ineligible and its original funding is reconciled before returning its sats
- **AND** closing the treasure window alone does not cancel the offer

#### Scenario: Exact enforcement is unavailable
- **WHEN** the selected infrastructure cannot prove the required deadline and authorization behavior
- **THEN** replacement production-qualified creation remains unavailable
- **AND** existing contracts remain inspectable and recoverable with their actual guarantees disclosed

### Requirement: Financial state follows exact evidence
Funding, claim and refund SHALL become confirmed only from matching contract inputs, output scripts, amounts, asset change and operation identity. Financial status SHALL remain distinct from offer eligibility and game feedback. Unknown submission or finalization SHALL retain reservations and prevent a competing spend until its outcome is established.

#### Scenario: Claim accepted before expiry finalizes later
- **WHEN** verified remote admission occurred within the deadline but finalization remains unresolved after it
- **THEN** the original claim remains pending until its exact result is reconciled
- **AND** expiry does not launch a conflicting refund or report a completed refund

#### Scenario: Wrong payment is observed
- **WHEN** the player receives an unrelated payment of 1,000 sats
- **THEN** it cannot confirm the treasure claim or deliver its game feedback

### Requirement: Recovery survives application lifecycle changes
Unresolved contracts SHALL have protected, versioned recovery that can be explicitly exported, restored and reconciled without recreating the original transaction. Browser closure SHALL NOT imply refund completion. Logout, reset, upgrade and rollback SHALL preserve unresolved recovery or require verified recovery export before destructive cleanup.

#### Scenario: Browser closes at expiry
- **WHEN** all clients close before expiry and the user later returns
- **THEN** the original offer is restored quietly
- **AND** explicit inspection or action resumes exact recovery without claiming cleanup ran during closure

#### Scenario: Original browser data is lost
- **WHEN** the user imports a valid protected recovery bundle on a fresh origin or device
- **THEN** the original descriptor and journal are reconciled against the original network before another spend is allowed
- **AND** restoring a mnemonic alone is not reported as complete contract recovery without the required material

#### Scenario: Corrupt recovery
- **WHEN** restored recovery cannot be authenticated or matched to its script and identities
- **THEN** signing is unavailable and uncertainty is reported without freeing reserved inputs

### Requirement: Claims preserve the promised reward
A qualified claim SHALL deliver 1,000 sats to the bound Player Wallet under verified supported zero-fee terms without requiring a prior player balance. Funding SHALL preserve all game-owned input assets and change. Fee changes, unsupported policies, insufficient funds or substituted destinations SHALL prevent a new unsupported submission.

#### Scenario: Game funds share an asset carrier
- **WHEN** eligible Game Wallet inputs contain assets as well as sufficient sats
- **THEN** the funded contract contains 1,000 asset-free sats and verified game-owned change retains every asset quantity

#### Scenario: Fees change
- **WHEN** the current operator policy would reduce the player's 1,000-sat reward
- **THEN** new creation is unavailable without silently deducting fees or changing the amount

### Requirement: Reward presentation is bound to its originating run
The game SHALL present confirmed treasure success only for a verified claim bound to the active originating run and stable operation identity. Duplicate notifications SHALL NOT duplicate feedback. A replaced or ended run SHALL NOT receive an old claim's effect, and presentation failure SHALL NOT initiate another payment.

#### Scenario: Old claim completes after restart
- **WHEN** a verified old claim completes after the player starts a different run
- **THEN** the financial result remains inspectable without applying treasure feedback to the new run

### Requirement: Qualification has separate live evidence
Production qualification SHALL include protected real funding, claim, rejection, expiry/refund and interrupted recovery acceptance for each advertised network using the exact imported BIS artifact. Deterministic tests SHALL be labeled separately. Failed or unperformed live cases SHALL remain explicit and block the corresponding qualification claim.

#### Scenario: Guest browser tests pass
- **WHEN** credential-free gameplay and package checks pass without a funded contract
- **THEN** they establish UI and API compatibility only
- **AND** the financial acceptance matrix remains incomplete

#### Scenario: Only one network passes
- **WHEN** Signet succeeds but Mutinynet is unverified or fails
- **THEN** the result cannot qualify Mutinynet and unsupported creation stays unavailable there
