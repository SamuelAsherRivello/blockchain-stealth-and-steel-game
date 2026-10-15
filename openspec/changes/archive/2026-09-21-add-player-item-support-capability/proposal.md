## Why

The game needs a clear capability boundary between player-facing item support and Game Wallet-backed operations. A logged-in Player Wallet is sufficient for the game to discover and use administratively minted items, while trophies remain a separate game reward flow.

## What Changes

- Add a lower-camel-case `hasItemSupport()` capability to the game’s BIS account adapter.
- Make item support depend on an active Player Wallet and BIS item access, not on a selected Game Wallet.
- Use the capability for Items availability and equipment refresh behavior.
- Keep one-at-a-time trophy minting and player transfer outside the item-support capability.
- Preserve ordinary gameplay when account or BIS services are unavailable.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `item-equipment-selection`: make player item support an explicit Player Wallet capability without requiring a Game Wallet.

## Impact

- Affected game BIS adapter and Items/start-menu integration.
- Adds focused adapter and UI tests.
- No BIS package, adjacent repository, wallet credentials, mint operation, or dependency change is included.
