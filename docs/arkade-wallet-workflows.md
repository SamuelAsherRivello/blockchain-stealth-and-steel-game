# Arkade wallet signing and QR workflows in BIS

Reviewed 2026-10-30. Arkade requires the wallet owner's cryptographic authorization for spends; it does not require a QR code. A QR code can move a signing request between the game and a separate wallet or device. BIS supports browser-held Local Game Wallets and server-held Game signing authority, while the Player Wallet stays in the browser. No external-wallet QR signing bridge was found in the adjacent BIS integration checkout.

The coordinated release candidate uses Local on Mutinynet and Server on Signet, with no user mode toggle. The shared Account header identifies the selected mode, network and BIS version. Server connection health is separate; an outage does not select a Local wallet. This is the approved candidate contract. Exact-package, live and deployment acceptance remain tracked in C094/C096; this document does not certify a new release.

## Three different things a QR code can mean

| Flow | What the QR carries | Is it a signature approval? | BIS today |
| --- | --- | --- | --- |
| **Receive/payment QR** | An address or invoice that another wallet scans to pay. | No. The *payer's* wallet authorizes its own spend. | BIS presents copyable Arkade and Bitcoin receiving addresses; Lightning invoice creation is unavailable on its configured Signet route. A receiving QR could be added as a display convenience. |
| **Connect wallet QR** | A session invitation linking a game to an external wallet. | No, connection alone does not approve future transfers. | No such connector found. |
| **Sign request QR** | Transaction details or a transport link sent to a second device; a signed response comes back. | Yes, only after the external wallet checks the request and signs the exact transaction. | No such bridge found. Player and Local Game Wallets sign in the browser; Server Game signing uses the configured BIS service. |

Arkade's [wallet setup guide](https://docs.arkadeos.com/wallets/getting-started/create-your-wallet) creates a signing identity locally and passes it to `Wallet.create`. Its [send guide](https://docs.arkadeos.com/wallets/operations/sending-payments) calls the wallet to send. Arkade also has examples in which the [SDK runs in the browser while an external wallet provider handles signing](https://github.com/arkade-os/packages#how-it-works). Those examples establish that signer separation is possible; they do not establish that BIS has integrated any particular wallet or QR protocol.

## What BIS actually does on a write

1. A user creates or restores a Player Wallet. BIS derives its Arkade identity and saves the recovery phrase in origin-scoped IndexedDB, encrypted with a browser `CryptoKey`. A Local Game Wallet uses a separate browser-held identity. A Server Game Wallet uses a public server reference; its recovery phrase is not imported into the game. Existing operations retain their original network, wallet source and recovery journal.
2. For direct sending and Bitcoin/Arkade transfers, BIS shows a review screen and requires an explicit **Confirm Send** or **Confirm Transfer** action. It rechecks quote, account, network, funds, and operation state before submitting. Asset burns also have a confirmation dialog. Other game writes, including continuation payments and timed contract actions, have their own flow; a generic QR prompt is not part of them.
3. The adapter uses the selected local identity or scoped Server Game signing authority and submits through the configured Arkade operator. BIS journals pending operations and reconciles uncertain results. A click, a network acknowledgment and final settlement are different events. Losing a Server response cannot authorize a replacement Local spend.

Treasure uses the existing Contracts support indicator and its reason for the selected network. Unsupported new offers must not fund. Missing login or a wallet that is still loading is a readiness issue, not proof that the network cannot support the contract. Existing-contract inspection and recovery remain available under the original authority. Ordinary account, payment, item and reward features keep their own capability checks.

Evidence in the adjacent BIS checkout: `wallet-layer-arkade/account.ts`, `server-wallet.ts`, `sending.ts`, `boarding.ts`, `assets.ts`, and `lto-contract.ts`; `state-layer-core/account-storage.ts` and `server-first-game-wallet.ts`; `ui-layer-react/AccountSend.tsx`, `AccountTransfer.tsx`, and `AccountAssets.tsx`. This game's [`bis-account.js`](../stealth-steel/src/runtime/integration/bis-account.js) mounts the BIS UI without handling wallet keys.

## Why another web3 game might scan for every important write

A game that does **not** hold a player's signing key must ask the player's separate wallet to authorize a spend or contract call. A QR can bridge a desktop game to a phone wallet. It helps keep the key out of the game origin and can give the player an independent display of the destination, amount, asset, fee, network, and contract terms. The protection comes from the *separate signer verifying exactly what it signs*, not from the square code itself. Browser extensions and native wallet connections can provide the same separation without a QR.

BIS's Local model removes that handoff. It lets the browser wallet sign directly, while its encrypted storage and key remain accessible to code running with the same origin's privileges. Server Game signing keeps that Game key on the service; the Player key still uses the browser model. The app's review button supplies consent, not an independent cryptographic approval boundary or proof of correct gameplay. Arkade's operator co-signing and [unilateral-exit security model](https://docs.arkadeos.com/learn/core-concepts/security-and-trust-model) do not replace the player's own signing decision.

## Product choices for BIS

| Option | Player experience | Good fit | Main work |
| --- | --- | --- | --- |
| **Keep local signing** | Review and confirm in BIS, then sign immediately. | Small test amounts and frequent game actions. | Improve transaction detail and risk based confirmation while preserving pending/recovery handling. |
| **Connect an external signer** | Approve each sensitive write in a wallet extension or app; QR only if that connector uses one. | Valuable player assets or a game treasury whose key should live elsewhere. | Integrate a compatible Arkade signing identity/provider, validate supported transaction types, and handle declined, changed, expired, and interrupted requests. |
| **Hybrid policy** | Local approval for routine actions; separate device for large transfers, burns, or admin minting. | Games needing fast play and strong controls for high impact actions. | Define thresholds and owner policy before signing, ensure a bypass through another BIS path is impossible, and make recovery usable if the second device is lost. |

**Suggested first experiment:** make a read-only transaction preview for one BIS direct send, showing exact network, destination, amount, assets retained in change, and whether the result is pending or settled. Then prototype an external signer behind the wallet adapter for that *single* operation. Test a rejected request, a modified request, a disconnected device, and recovery after refresh before extending it to assets, boarding, or game contracts. A QR should be added only if the chosen signer transport actually needs it; never put a recovery phrase or private key in a QR.

## Related Arkade references

- [Sending payments](https://docs.arkadeos.com/wallets/operations/sending-payments) and [Bitcoin ramps](https://docs.arkadeos.com/wallets/advanced/ramps) describe the different write paths and settlement steps.
- [Arkade security and trust](https://docs.arkadeos.com/learn/core-concepts/security-and-trust-model) explains owner signatures, operator coordination, and exit paths.
- [Arkade browser wallet provider example](https://github.com/arkade-os/packages#how-it-works) shows SDK logic separated from signing. Its supported providers and transaction coverage must be checked before choosing a BIS integration.
