# Spec delta

## Purpose

Provide a verifiable treasure reward lifecycle for user-owned wallets, preserving the game's reward experience and making enforcement, custody and recovery guarantees explicit.

## ADDED Requirements

### Requirement: Qualified Treasure works in both required wallet modes
The game SHALL support new real Browser validation offers on Mutinynet Direct and Signet Server after each tuple passes its live acceptance. It SHALL disclose browser-enforced expiry and retain original-contract inspection/recovery. Unsupported stronger modes SHALL NOT qualify a tuple or prevent independently qualified Browser validation.

#### Scenario: Player uses Signet release
- **WHEN** the player requests a new Treasure offer on Signet
- **THEN** the real compiled contract path may fund and spend under Browser validation
- **AND** the user is told expiry is enforced by the browser

#### Scenario: Game player starts on Mutinynet Direct
- **WHEN** a ready player explicitly starts on qualified Mutinynet Direct and accepts the funding consent
- **THEN** the real Browser validation contract may fund from the selected local Game Wallet without any BIS server request
- **AND** Claim, Reject, expiry/refund and recovery retain their original terms and require exact receipts

#### Scenario: Game player starts on Signet Server
- **WHEN** a ready player explicitly starts on qualified Signet Server and accepts funding consent
- **THEN** the same user-facing Treasure flow uses the server-assisted Game authority with a local Player Wallet
- **AND** no server mnemonic or owner credential is exposed to the player

#### Scenario: Admin documents Mutinynet test choices
- **WHEN** an Admin tester selects Mutinynet
- **THEN** Arkade co-signer is selected by default and Browser validation is an explicit option
- **AND** the selector describes actual guarantees and does not silently downgrade

### Requirement: Wallet source and ownership are explicit
Direct SHALL use separate user-owned Player and Game Wallets. Server SHALL keep Player signing local and Game authority on the BIS service. Setup SHALL identify the actual reward-funding wallet and selected source. Neither source SHALL imply authoritative gameplay verification, distributed browser exclusivity or cleanup while all clients are closed.

#### Scenario: Reward setup
- **WHEN** a user configures treasure rewards
- **THEN** the user can identify which local or server-assisted Game Wallet funds the reward
- **AND** no shared treasury key or automatically transferred recovery phrase is required

### Requirement: Original reward terms remain immutable
Explicit Start SHALL request at most one 1,000-sat offer with immutable deadlineSeconds = floor(startedAtMs / 1000) + 90. The deadline SHALL never exceed 90 seconds after original Start. The offer SHALL bind network, operator, wallet identities, offer identity and host reference. Funding delay, pause, tab suspension, progression, continuation and reopening SHALL NOT extend its deadline or create a replacement.

#### Scenario: Start falls between whole seconds
- **WHEN** original Start occurs 999 milliseconds into a second
- **THEN** the committed deadline is 89.001 seconds later
- **AND** display and spend eligibility use that same immutable deadline

#### Scenario: Delayed funding
- **WHEN** funding completes 60 seconds after the original Start
- **THEN** no more than 30 seconds of the original offer window remains

#### Scenario: Repeated start request
- **WHEN** the same offer request is repeated or restored
- **THEN** the existing operation is inspected without a second funding submission

### Requirement: Production enforcement is independently qualified
A covenant-qualified treasure offer SHALL demonstrate its committed deadline and authorized claim, rejection, session-end cancellation and refund rules through executable spend validation and real operator acceptance. Browser time checks, a refund minimum timelock alone and UI tests SHALL NOT establish covenant expiry enforcement. Unsupported exact behavior SHALL block covenant qualification. The separately approved Signet and Mutinynet browser-policy mode SHALL retain real contract transactions and explicitly disclose its weaker enforcement.

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
- **THEN** covenant-qualified creation remains unavailable
- **AND** existing contracts remain inspectable and recoverable with their actual guarantees disclosed

### Requirement: Browser fallback is real, disclosed and selected before funding
Signet and Mutinynet MAY use `browser-policy-v1` when the supported covenant path fails non-mutating preflight or has no trusted configuration. This mode SHALL use real compiled scripts, funding, spending and exact receipts while identifying expiry as browser-enforced. The original format and enforcement mode SHALL be immutable after funding preparation. An unknown or submitted financial operation SHALL NOT trigger fallback, a replacement contract or a second spend. Explicit Admin co-signer selection SHALL fail visibly rather than silently downgrade.

#### Scenario: Signet has no supported co-signer configuration
- **WHEN** non-mutating preflight cannot establish the stronger path before funding
- **THEN** Signet can select the approved browser-policy real-contract mode with its limitations visible
- **AND** verified financial results still require exact network receipts

#### Scenario: Stronger-path submission acknowledgement is lost
- **WHEN** funding or spending may have reached the network
- **THEN** BIS preserves and reconciles the original mode and signed operation
- **AND** it does not retry through the browser-policy path

### Requirement: Admin documents selectable solutions while game hosts use automatic selection
The Admin treasure flow SHALL expose a labelled signing/validation selector with only Browser validation on Signet and Arkade co-signer plus Browser validation on Mutinynet. Mutinynet SHALL default to the co-signer option. Each option SHALL explain its actual guarantee; browser validation SHALL identify its weaker expiry enforcement. Game hosts SHALL use automatic pre-funding selection without asking players to choose a solution. Actual persisted validation mode SHALL remain inspectable on the contract.

#### Scenario: Admin switches network
- **WHEN** the tester selects Signet or Mutinynet
- **THEN** the selector presents only that network's configured options and its sensible default
- **AND** an existing funded contract keeps its original mode

#### Scenario: Player starts a game
- **WHEN** the game requests an offer through BIS
- **THEN** BIS selects the best supported pre-funding mode automatically
- **AND** no signing-solution selector interrupts gameplay

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

### Requirement: Bounded BIS acceptance preserves qualification gates
The bounded BIS-only acceptance pass SHALL reuse valid existing evidence and
assign each required network/mode check a passed, failed, blocked or unperformed
status. A blocked or unperformed check SHALL NOT establish its guarantee or
complete its original qualification task. The pass SHALL NOT import the game,
perform onboarding or add unrelated features. Its original dependency freeze
applies to that completed pass; the separately authorized 2026-10-22 BIS
hardening phase MAY fix the affected dependency chain and add protected missing
live-case fixtures. It SHALL keep the game import separate and SHALL NOT retry
upstream blockers without new evidence.

#### Scenario: Upstream errors do not identify a rejected rule
- **WHEN** existing co-signer probes return generic errors without authoritative rejection or admission evidence
- **THEN** the corresponding enforcement checks remain blocked without further probes
- **AND** reopening requires new operator diagnostics or a supported observable interface

#### Scenario: A new missing live case remains unknown
- **WHEN** its single funded attempt is unresolved after 120 seconds and one original-operation reconciliation
- **THEN** its exact journal and reservations remain protected
- **AND** no replacement funding, fallback spend or successful qualification is inferred

#### Scenario: The bounded BIS pass is closed with blockers
- **WHEN** every bounded check has an evidence-backed disposition but a required guarantee remains blocked
- **THEN** the BIS report distinguishes acceptance-pass closure from production qualification
- **AND** the game import and affected qualification tasks remain incomplete

### Requirement: Treasure adds no financial startup barrier
Treasure SHALL add no network-dependent wait to ordinary game startup or explicit Start. Background preparation SHALL NOT fund an offer. Missing readiness at Start SHALL remain a skipped offer rather than funding later automatically. Funding delay SHALL consume the original offer window.

#### Scenario: Provider is slow during Start
- **WHEN** the player starts while contract inspection or funding is slow
- **THEN** gameplay begins without waiting for treasure
- **AND** no replacement offer or extended deadline is created

### Requirement: Action feedback precedes financial confirmation
Claim and Reject SHALL visibly acknowledge input immediately, suppress duplicate actions and close only their originating window after durable acceptance. Unrelated list refreshes SHALL NOT delay that acceptance. Pending acceptance SHALL NOT be presented as confirmed success. Late or older responses SHALL NOT regress newer operation state.

#### Scenario: Claim is accepted while list refresh is slow
- **WHEN** the claim is durably accepted and an unrelated account refresh remains pending
- **THEN** its originating window can close and gameplay resumes
- **AND** success waits for verified financial evidence

#### Scenario: Observation times out
- **WHEN** a submitted action has no known result after a UI observation timeout
- **THEN** it remains pending or unknown with its reservations retained
- **AND** checking status does not resubmit the spend

### Requirement: Responsiveness has measured acceptance
The feature SHALL measure local interaction responsiveness separately from provider latency. On a documented reference device and controlled profile, p95 local input acknowledgement and chest presentation SHALL take at most 100 ms. Acceptance SHALL cover cold, warm, slow and offline cases without simulated financial success substituting for live proof.

#### Scenario: Slow provider response
- **WHEN** provider reads take ten seconds or fail
- **THEN** local button acknowledgement and usable Back controls remain within the local response budget
- **AND** network confirmation timing is reported separately
