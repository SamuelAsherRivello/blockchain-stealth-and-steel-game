# Proposal

## Why

The game now contains real contract integration, recovery, and responsive chest UX, but release claims must be limited to evidence actually established for each network. This release makes the user-facing Treasure flow available on Signet through the real, disclosed Browser validation contract path while keeping Mutinynet creation unavailable until its separate qualification is complete.

## What Changes

- Release the existing funded Treasure experience on Signet only, using the exact imported BIS package and real compiled contract funding/spending.
- Keep Admin as living documentation: Signet shows Browser validation only; Mutinynet shows Arkade co-signer by default and Browser validation as an explicit fallback, each with truthful guarantee labels.
- Keep ordinary gameplay usable when Treasure is unavailable; retain inspection and recovery of existing contracts on either network.
- Keep new Mutinynet offers unavailable to the game client in Release 1. Admin's explicit Mutinynet test options remain visible and cannot silently downgrade; their presence does not claim qualification.
- Complete Signet-specific real funded UI/lifecycle checks, rollback, exact-artifact verification, and deployment checks before release.
- Carry the original two-network tasks, Mutinynet co-signer proof, B2 recovery, full lifecycle matrix, and 100 ms performance qualification into C096.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `treasure-reward-contract`: Scope new offer creation and release claims to the Signet Browser validation path; preserve explicit weaker-guarantee disclosure and recovery access.
- `treasure-rendering`: Reveal and operate new treasure only when Signet Browser validation is available and a matching real funded offer is verified.

## Impact

The game Admin/runtime, existing imported BIS 0.0.27 dependency, tests, documentation and Pages deployment are in scope. BIS code is already available as the exact imported artifact; no further game import is authorized before BIS readiness. Mutinynet qualification and the original B2 swept output are tracked in C096. No simulated transactions, mainnet, production treasury, or fake financial success is introduced.

## Task migration

The original open task IDs C094-T006, T007, T018, T019, T020, T026 and T035 keep their original identifiers and full acceptance criteria in C096's carryover table. They are not completed by this release. C094 is limited to Signet release acceptance and its new completion tasks use IDs C094-T037 onward. See `acceptance-handoff-2026-10-26.md` for the evidence boundary and migration map.
