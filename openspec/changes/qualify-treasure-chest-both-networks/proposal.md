# Proposal

## Why

The Signet release can ship with a clearly disclosed browser-policy contract, but it does not establish Mutinynet enforcement or resolve the original swept B2 output. This follow-up qualifies both advertised Mutinynet modes with real receipts and protects unresolved recovery until operator-specific evidence supports a safe action.

## What Changes

- Qualify Signet and Mutinynet independently, including Mutinynet Arkade co-signer and browser-policy modes.
- Restore the Admin signing-solution selector: Signet exposes Browser validation only; Mutinynet defaults to Arkade co-signer and offers Browser validation explicitly. The game selects the strongest supported mode before funding without asking players.
- Complete the per-network lifecycle, recovery, rollback and real funded UI matrix on the exact imported BIS artifact.
- Recover the original B2 output only after deployment-specific acceptance evidence and protected wallet checks; retain its reservation and unresolved status until exact network receipts prove a terminal result.
- Measure cold/warm, offline, slow-provider, hidden-tab and funded acknowledgement behavior. The 100 ms local p95 target remains a follow-up acceptance goal; provider latency is reported separately.
- Keep unavailable modes visibly unavailable, prohibit fallback after any uncertain submission, and preserve exact receipts and sanitized evidence.

## Capabilities

### New Capabilities

- `treasure-network-qualification`: Per-network and per-mode qualification, recovery, rollback and release evidence for real treasure contracts.

### Modified Capabilities

None. The reward-contract requirements that were introduced by C094 are carried forward by the new qualification capability; there is no archived base spec to modify yet.

## Impact

The game Admin and runtime, the exact imported BIS public contract and adapter, protected test-wallet acceptance, deployment checks, performance fixtures and OpenSpec evidence are in scope. No mainnet, production treasury, or simulated contract behavior is introduced. The Signet-only release is a prerequisite; game changes remain separate from BIS implementation until BIS evidence is ready.
