# Proposal

## Approved two-workflow release, 2026-10-29

The user's current decision supersedes the earlier Signet-only restriction and mode terminology below. The game must preserve all existing features with Mutinynet **Local** and provide them with Signet **Server**. This version has no user-selectable Local/Server toggle. The shared header shows the selected mode at the upper-left and retains network/BIS version. Local uses the browser-held Game Wallet without a BIS server probe; Server keeps the Player local and the Game key on the signer.

Treasure targets both networks using the same real compiled contract after actual qualification. Preserve explicit consent, the 1,000-sat reward, original 90-second deadline, exact receipts and recovery. If a demonstrated network limitation prevents support on both networks, fully qualify the easiest network and report the other as unsupported using the existing Contracts `available` / `reason` support indicator; do not add another checkbox or capability field. Block new unsupported-network offers/funding while preserving inspection and recovery of existing contracts. Stronger unqualified modes and hosted Mutinynet remain unavailable without blocking independently qualified Treasure support.

Use the finite nine-step sequence in the BIS program. Game-only implementation may proceed immediately. Import one frozen, package-verified immutable local candidate before public publication, then verify both complete game flows and publish only that accepted hash/version. New tasks C094-T045 through C094-T047 track the changed requirements; old Signet-only checkmarks are historical and do not prove this release. C096 owns the two-tuple funded/performance acceptance. Sandbox step 9 is owned in the BIS repository and must pass before final release closure.

## Historical execution takeover, 2026-10-29 (superseded)

This section records an earlier coordination snapshot. Its Signet-only release scope and fallback wording do not override the current release contract above or the BIS program's authoritative nine-step plan.

The user requested replacement ownership, minimum calendar time and a two-hour completion target. Reuse this change and its acceptance criteria; do not restart its implementation or migrate unfinished requirements into a nominally completed replacement. The Treasure/game execution chat owns this change under the current takeover section of the BIS program ledger.

Finish exact-artifact Local Mutinynet and Server Signet acceptance, including funded Claim/Reject where Treasure support is qualified, then the matching game release. Preserve the real contract's disclosed guarantee limits. Import the immutable BIS candidate after package verification and before public publication.

The execution target ends at 15:28 UTC on 2026-10-29. This target does not waive live evidence, spending limits or uncertain-operation preservation. Report an exact external blocker once, continue independent authorized work, and reopen the blocked action only when its recorded prerequisite changes.

## Why

The game has real contract integration and recovery, but the earlier blanket Mutinynet creation gate removes the requested Local workflow. This release must restore Local Mutinynet and complete Server Signet using real compiled contracts with separately verified evidence.

## What Changes

- Release the funded Treasure experience on Mutinynet Local and Signet Server using one exact imported BIS package and real compiled contract funding/spending where each network is supported.
- If a demonstrated network limitation prevents support on one network, qualify the easiest network and use the existing Contracts `available` / `reason` indicator for the unsupported network; add no second Treasure checkbox/capability and block only new unsupported offers/funding.
- Keep Admin as living documentation: Signet shows Browser validation only; Mutinynet shows Arkade co-signer by default and Browser validation as an explicit fallback, each with truthful guarantee labels.
- Keep ordinary gameplay usable when Treasure is unavailable; retain inspection and recovery of existing contracts on either network.
- Restore new Mutinynet offers through the qualified Local Browser validation path when supported. Admin's stronger contract-test option remains explicit and cannot silently downgrade or claim unproved guarantees.
- Complete Signet-specific real funded UI/lifecycle checks, rollback, exact-artifact verification, and deployment checks before release.
- Carry the original two-network tasks, Mutinynet co-signer proof, B2 recovery, full lifecycle matrix, and 100 ms performance qualification into C096.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `treasure-reward-contract`: Support qualified Local Mutinynet and Server Signet Treasure flows, preserving truthful guarantee disclosure and original recovery.
- `treasure-rendering`: Reveal and operate treasure on either qualified tuple only after matching real funding is verified.

## Impact

The game runtime, imported BIS dependency, tests, documentation and Pages deployment are in scope. Import the exact package-verified BIS candidate and provenance supplied by the BIS owner after local source/build gates; public publication is not an import prerequisite. It must pass the game and live acceptance gates before the matching release. Mutinynet qualification and the original B2 swept output are tracked in C096. No simulated transactions, mainnet, production treasury, or fake financial success is introduced.

## Task migration

The original open task IDs C094-T006, T007, T018, T019, T020, T026 and T035 keep their original identifiers and full acceptance criteria in C096's carryover table. They are not completed by this release. C094 covers Local Mutinynet and Server Signet release acceptance; its new completion tasks use IDs C094-T037 onward. See `acceptance-handoff-2026-10-26.md` for the evidence boundary and migration map.
