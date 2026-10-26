# C094 contract feasibility

Observed on 2026-10-20. This report separates deterministic proof, read-only capability observations and partial funded compatibility results. It is not complete live financial acceptance or approval to replace the installed LTO format.

## Operator observations

Both configured operators returned HTTP 200 from GET /v1/info.

- Signet: https://signet.arkade.sh, reported network signet, signer 028bf56160efc769112b361de4117b3c71b88ca16f1bb9f6ac7a2781929abc5e6a, exit delay 172544 seconds.
- Mutinynet: https://mutinynet.arkade.sh, reported network mutinynet, signer 03301078808e4f7bc0dadfe29e34b1df8eaf0108ef06b1722274075ebc107a127a, exit delay 2048 seconds.
- Both reported minimum VTXO 1 sat, maximum -1, dust 330 sats and transaction fee rate 0. Signet intent fees were empty strings; Mutinynet intent fees were 0.0. These reports are observations, not independent proof of contract acceptance. The 1000-sat principal exceeds reported dust; exact wire funding still needs acceptance.

SDK 0.4.79 is installed. Its network definitions configure both operator URLs but contain no default Signet emulator pin. Its independently bundled Mutinynet emulator pin is 03f823b9b2febc81f4af967e77aed2f541cbd3397c6d8f5a72e32eb7b471af889a. The public https://emulator.mutinynet.arkade.sh/v1/info returned that key and v0.0.9-rc.2. Endpoint readability and matching identity do not prove opcode compatibility or funded spending.

Existing local emulator endpoints also returned HTTP 200: 127.0.0.1:7074 reported 0377862f1572d642245a4b965c98bd18059b0897353e90c20c18ac92e8d753e3d2; 127.0.0.1:7075 reported 02c8d7311dbfcb52d2b53258c57e062590337ed7796145afed5bd432be6490571d. These match the separate Conditional Vault source configuration but have empty version strings. C094 has not adopted these keys or endpoints. Local HTTP availability is not a production deployment or remote-browser connectivity proof.

## Execution and clock semantics

The [Arkade contract deep dive](https://docs.arkadeos.com/contracts/deep-dive) documents collaborative CLTV, unilateral CSV and two-phase SubmitTx/FinalizeTx. Plain CLTV does not provide an upper claim deadline.

SDK 0.4.79 additionally exposes ArkadeProgramScript and CHECKTIME. Covenant execution requires an emulator co-signer and previous-transaction data from the indexer. This adds an explicit co-signer trust and liveness dependency even with no custom application server.

The inspected upstream emulator checkout is bd17836542c409d176a3ee61782e00a606d10f6c. Git diff found no changes to pkg, api-spec, internal, go.mod or go.sum. Its engine initializes currentTime from time.Now().Unix(); CHECKTIME tests deadline <= currentTime. Thus the authoritative value is the emulator's wall clock in whole seconds, not the browser timer or Bitcoin consensus time. On 2026-10-20 the user approved deadlineSeconds = floor(startedAtMs / 1000) + 90. The window is greater than 89 and at most 90 seconds. Remote signing admission and finalization semantics remain unverified by funded execution.

## Isolated proof

Run from the game root:

`node --test stealth-steel/tools/treasure-contract-proof.test.mjs`

The proof is deliberately outside the default game suite because it requires pinned upstream VM executables. Set TREASURE_VM_ROOT to their directory, or prepare them through the adjacent BIS/tools/conditional-vault-vm/build.ps1 workflow. The default path references that adjacent tool output. The ordinary game tests do not acquire this dependency.

The compiled artifact is stealth-steel/tools/treasure-contract-proof.mjs. It has no provider, wallet, storage or game-funding connection. It commits network, identities, destinations and deadline; claim requires player authorization, early reject/cancel requires player and game authorization, expiry refund requires game authorization. Its only unilateral branch is a game-owned CSV exit. The replacement has no secret preimage, so exposing a legacy preimage cannot unlock its claim branch.

Five isolated tests passed. They cover all 1000 possible millisecond offsets in a Start second, reject a supplied deadline inconsistent with its original Start, execute 192 time/destination/amount/input/output covenant vectors per process for both network bindings repeated in two fresh VM processes, verify actual player/game signature requirements, and run eight signed Bitcoin exit fixtures checking CSV units, maturity sequence and game ownership. These are deterministic tests with test keys, not funded network spends. The clock runner injects test time into the unchanged upstream VM; it does not prove production clock synchronization.

The observed runner hashes were c2891174fe35cbdb297b7eaa1c49602dbefe7ede6f2796fe1a5a5cdfeb0b7de6 for conditional-vault-vm-clock.exe and 3d17e895b05af19196cfafc631fbbf77e0715532660da6a2b6873455d0533262 for conditional-vault-vm.exe. Rebuild/review before relying on another checkout's binaries. Exit fixtures do not fund unroll/anchor fees or establish actual chain maturity.

## Funded compatibility evidence

The protected inventory confirmed active standing grants for the existing test pair on both test networks. No new C094-specific grant was assumed necessary. These runs used the existing SDK-pinned public Mutinynet co-signer, not the local Conditional Vault endpoints. No new service was deployed. No mainnet transaction was submitted.

Mutinynet preparation `treasure-mutinynet-fund-a` supplied 50,000 test sats and settled against exact receipt `550e792103a73d51a4933691b4f888576dad04d3464be6e563b3a529d695bc5f`. The compatibility tools consume the protected testing infrastructure privately; they are never imported by the game or its normal test suite.

| Case | Exact evidence | Result |
| --- | --- | --- |
| Original claim proof funding | `505578f13eba2015ab764267f013dbb2bf7304b5dce664783af61adc76cba272:0`, 1,000 sats, compiled script `512028cda7cf5897620a1e0c3297094505f683a27dceac5d8d8e41611df26b4cd8d7` | Verified wire transaction and indexed asset-free output |
| Original claim | `a93ff196af8ad707d6cf6f7685f72767a2c306734a288205aa0dfa7f6eef87f1:0`, 1,000 sats, bound player script `5120d81cb9142691019fc7b3a6fa768b74e30b47ac1aa0a711eaaa40b01fd46724c8` | Verified wire transaction and indexed asset-free payout; original unknown acknowledgement reconciled without resubmission |
| Second proof funding | `f900722519383e10386b2b8f3fd1814df0cce376982313781baf86a3c52f4755:0`, 1,000 sats, compiled script `5120402e6074de7f8dcd9db968dcff3b0a329cd1d06d78e34fb27106905875860698` | Verified after journal acknowledgement failure; rejection was not completed before expiry |
| Second proof expiry recovery | Original refund `f38fc10798b3636d3bc85c5a912f24c14e9aec9c7d3b6611e48a886a58a6c576`, original deadline `1792517254` | Unknown; no wire transaction or payout indexed; original contract output still reported unspent |
| Signet preparation | Original request `treasure-signet-fund-a`, 50,000 test sats | Unknown acknowledgement; repeated original reconciliation reports pending, wallet has zero available sats; no replacement request submitted |

The original refund and its checkpoint have valid participant signatures under local SDK verification. This does not establish remote acceptance, finalization or rejection. The first tool version did not retain provider response/error bodies, so the exact remote failure cause is not established. Subsequent tool changes retain those bodies only in the protected vault. They have not been used to replay this unknown refund.

The journal helper uses a fail-fast vault lock. The second funding was submitted and finalized, but its journal remained submitting until exact receipt reconciliation. Concurrent protected-wallet diagnostics are a possible contributor, not a proven cause. The runner now waits briefly for vault lock contention without repeating any provider call. It also derives an unknown claim's transaction ID from the original signed request and performs read-only receipt reconciliation, rather than funding or claiming again.

Original descriptors, signatures, requests and reservations remain in the protected vault. One 1,000-test-sat contract remains unresolved. The inspector defaults to read-only observation; its explicit reconciliation mode changes journal state only when the exact original transaction and bound 1,000-sat asset-free output are observed. It never submits a transaction. Do not infer settlement from balance changes or infer rejection merely from a missing indexer record.

## Unresolved gate

C094-T005 is complete under the user-approved rounding rule. C094-T006 remains incomplete. Mutinynet funding and one exact claim are proven, but rejection, expiry recovery, validly signed invalid spends, authoritative admission timing and delayed finalization are not qualified. Signet lacks both funded readiness and an independently established supported co-signer configuration.

The unknown refund reserves the involved Mutinynet test identity against further conflicting tests. Continue only by reconciling its original operation or through an explicitly reviewed recovery procedure, not by issuing a replacement spend. Signet likewise retains its original funding reservation. Operator/faucet evidence or a reviewed recovery decision is required before these live gates can advance.

The installed game runtime and vendored BIS artifact remain unchanged. No production-qualified creation path has been enabled. Do not adopt local Conditional Vault services silently, reset the deadline, treat provider info as execution proof, or mark the production objective complete.
