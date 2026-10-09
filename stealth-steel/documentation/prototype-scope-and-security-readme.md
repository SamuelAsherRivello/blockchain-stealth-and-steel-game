# Prototype Scope and Security

## Status

Stealth and Steel is a proof of concept for exploring Bitcoin-related game
experiences. It is intended for development, demos, and evaluation only; it is
not production-ready.

## Security model

Stealth and Steel is client-authoritative and insecure by design. Its
browser-side state, UI, and gameplay flows must not be treated as trusted
controls or as guarantees of ownership, balances, transactions, or asset
availability. Do not rely on the game to protect real funds, valuable assets,
credentials, or production player data.

## Supported networks

The game's Blockchain Integration Service (BIS) integration supports the
Bitcoin **Signet** and **Mutinynet** test networks only. Do not use it with
Bitcoin mainnet, real funds, or production wallets.

## Use expectations

- Treat all interactions as experimental.
- Use only testnet funds and disposable test accounts.
- Independently verify any transaction or asset behavior before relying on it.
- Production games require their own server-side authority and security model.

Return to the [Stealth and Steel README](../../README.md).
