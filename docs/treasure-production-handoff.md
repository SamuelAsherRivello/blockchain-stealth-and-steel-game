# C094 upstream BIS handoff

This handoff requests a versioned LTO dependency for the game's C094 plan. It is not evidence that BIS implements the replacement. The game remains pinned to verified BIS 0.0.23 until a new artifact is verified and imported.

## Confirmed product boundary

The user selected separate user-owned Player and Game Wallets in the browser, no custom application server and a 1000-sat reward. On 2026-10-20 the user approved whole-second expiry rounded down: deadlineSeconds = floor(startedAtMs / 1000) + 90. Commit this once from explicit Start; the effective window exceeds 89 seconds and never exceeds 90. Browser-local protection does not provide an operator treasury or anti-cheat authority. Never add hosted signing or share publisher keys to satisfy a stale specification.

Upstream `limited-time-offers` still includes hosted-signer, disk persistence and independent-browser shared-service requirements. Reconcile them in an explicitly scoped BIS change against the confirmed local model before implementing. Its `account-contracts` evidence and read-versus-reconciliation distinction must remain intact. Conditional Vault work is a separate capability.

## Required mapping

1. Immutable offer terms and enforcement qualification map to a versioned script/program and network-specific capability evidence. Establish whether all reachable claim and refund paths can enforce the required rules. Ordinary script encoding and browser Date.now checks do not qualify a 90-second maximum.
2. Financial truth maps to journaled submission/finalization and exact input/output, destination, amount and asset-change receipts. Keep uncertain inputs reserved; resume the original operation rather than resubmit on UI timeout.
3. Safe game integration maps to provider-neutral DTOs carrying version, immutable binding, enforcement mode, evidence freshness and safe actions. Preserve IBisGame events and run-bound effect receipts.
4. Local recovery maps to encrypted portable recovery, original descriptors and authenticated restore. Neither browser cleanup nor mnemonic restoration alone proves transaction recovery.
5. Fast interaction maps to durable action acceptance independent of a subsequent full-account list refresh, one in-flight offer-scoped inspection per wallet generation, and prioritization of explicit work without cancelling submitted transactions.
6. Stable presentation maps to monotonic operation/evidence ordering, safe stale-response handling and distinctions among local busy, durable pending, unknown and verified success. A 300 ms loading indicator threshold and ten-second delayed-status threshold affect presentation only.
7. Migration maps to retained legacy descriptor/adapter readers, no rewriting already funded scripts, and creation-disable rollback that preserves recovery.

## Delivery and acceptance

Deliver tests and documentation with each boundary. Test zero-player-balance claims, full 1000-sat payout, asset-bearing game change, fee changes, wrong network/operator/identity/destination, exact deadline boundaries, session-end/reject authorization, submit/finalize acknowledgement loss, corrupt/imported recovery and concurrent original-outpoint spends.

Provide independent Signet and Mutinynet live acceptance under explicit test-wallet grants and a sanitized evidence matrix. UI or mocked SDK tests cannot stand in for funded execution. Do not deploy a new service, change amount/deadline, claim mainnet readiness or change the approved custody model to make a proof pass.

The game imports only an immutable packed release with source commit, archive SHA-256 and installed-file inventory verified through existing export/import workflows. Preserve matching complete game/BIS versions for a coordinated release. Publishing is separately requested.
