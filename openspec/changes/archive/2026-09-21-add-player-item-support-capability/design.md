## Context

The game’s BIS adapter already owns the Player Wallet context, the optional Game Wallet, and equipment controller lifecycle. Items currently use a direct Player Wallet profile check in `main.js`, which hides the distinction between item support and other account operations.

## Goals / Non-Goals

**Goals:**

- Establish one game-facing item capability with stable lower-camel-case naming.
- Keep Items usable with Player Wallet login alone.
- Preserve unavailable-account fallback and existing equipment selection behavior.
- Keep trophy reward collection out of the item capability.

**Non-Goals:**

- Do not modify the adjacent BIS repository or package.
- Do not mint, transfer, or perform wallet operations during implementation or tests.
- Do not change trophy ownership, reward delivery, or Game Wallet-backed LTO behavior.

## Decisions

- Add `hasItemSupport()` to the game account adapter. It returns true only for an active Player Wallet context; the adapter’s successful initialization is the BIS availability boundary.
- Keep `getPlayerProfileId()` for existing identity uses and use `hasItemSupport()` for Items enablement. This avoids coupling UI capability to a Game Wallet profile.
- Preserve the current asynchronous equipment refresh fallback. If initialization fails, the capability remains false and the game continues.
- Test the capability at the adapter boundary and verify Items remains disabled without a player while no Game Wallet is required by the capability.

## Risks / Trade-offs

- [Risk] A logged-in Player Wallet can report item support before the equipment list has finished loading. → Keep the existing equipment controller state and refresh gating; capability means support is possible, not that assets are already loaded.
- [Risk] Future BIS versions may expose a native item-support capability. → Keep the game method as a thin adapter seam that can delegate to the package later.

## Migration Plan

1. Add the adapter capability and replace the direct Items enablement check.
2. Run focused adapter/UI tests and the production build.
3. During the next explicitly requested BIS package import, record any compatible public BIS API changes in the release notes as required by the project skill.
