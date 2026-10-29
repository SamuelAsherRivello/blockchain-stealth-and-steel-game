# Design

## Current execution ownership

The 2026-10-29 takeover section of the BIS program ledger supersedes historical owner/thread assignments and obsolete package-version observations in this document. It does not supersede contract guarantees or safety requirements. Use the actual accepted candidate version, archive hash and source evidence rather than a historical 0.0.27/0.0.29/0.0.30 observation.

The Treasure/game owner follows the execution order in proposal.md. One owner writes BIS runtime/release files, one writes game runtime/release files, and the coordinator writes the shared program ledger. Only the assigned financial-slot owner may operate protected acceptance wallets. The other owner can prepare wallet-free code, fixtures, synchronization and browser observations.

Preflight the exact test command, browser cache and private temporary-path requirements with a small affected check. Reuse unchanged-source evidence, run focused checks during fixes, and run required integrated checks after the candidate is frozen. Do not start competing suites or replace real hidden-tab or network evidence with injected state.

## Context

This change follows the Signet-only release slice in C094. It carries forward the remaining Mutinynet and cross-network qualification work without treating partial Signet evidence as completion of the original combined acceptance. The installed baseline is BIS 0.0.30. The current takeover authorizes the next import through the established verified artifact workflow after the BIS owner supplies its accepted exact archive. Passing baseline checks does not accept that future candidate.

## Decisions

- Track capability as a tuple of network, immutable signing mode, artifact version and lifecycle case. A pass for one tuple does not qualify another.
- Keep Mutinynet co-signer creation disabled while attributable deployed-operator acceptance and delayed-finalization evidence are missing. Do not repeat generic upstream failures without new evidence.
- Keep Browser validation as a real contract path with weaker client/browser-enforced timing. It is not a simulation and does not claim covenant timing or anti-cheat enforcement.
- Admin explicitly selects a mode for controlled testing; game requests use non-mutating preflight and select automatically before funding. Persist the selected mode with the original offer before any submission.
- For B2, validate the exact original descriptor and original-key binding in protected context. Require the current operator identity, supported batch intent, exact destination and fee rules before one bounded recovery attempt. If any prerequisite is missing, stop without signing or submitting and preserve the reservation.
- Reuse matching historical receipts; do not repeat passed financial actions. Every new funded case has a bounded observation window, reconciliation, exact transaction receipts and asset accounting. Unknown outcomes retain reservations and block competing operations.
- Measure browser input acknowledgement and provider latency separately. The 100 ms local p95 target remains a qualification goal here; an unmeasured hidden-tab or funded-action case remains open.

## Task ID migration

The seven open C094 tasks retain their original IDs and complete acceptance intent in this change's task crosswalk. C094 is narrowed to the Signet release. C094 open IDs map as follows: T006/T007 to this change's proof review and per-mode qualification; T018/T019 to the exact-artifact funded UI and lifecycle matrix; T020 to rollback; T026 to performance; T035 to missing BIS live cases. No migrated criterion is considered passed by this mapping.

The original B2 outpoint is `6810a50d5b77d707dcea6b2469243dfceedbedfade0175bb0119bbf7d4afcec7:0` (1,000 sats). It is swept, preconfirmed, expired and currently not spendable. The original script hash and game actor binding are recorded in the protected handoff. Public Mutinynet `/v1/info` did not identify the deployed operator build; this is a stop condition until new attributable evidence exists.

## Rollout and stop conditions

Enable a network/mode only after exact artifact, public mode disclosure, real funding/spend, recovery, rollback and receipt review pass. Stop on uncertain submission, mismatch in identity/network/output/asset accounting, missing operator admission semantics, changed original B2 state, or any need for a second spend to infer success. The Signet-only release can ship without declaring Mutinynet qualified, provided its deployed creation path truthfully disables Mutinynet and existing contracts remain inspectable/recoverable.
