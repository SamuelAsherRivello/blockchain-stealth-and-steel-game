## Context

The game already creates a BIS `BisGameServices` instance whose Account UI is
wired to the three public capability methods. The game-world Items HUD has a
local adapter method, while treasure and completion UI currently decide
visibility separately from capability readiness. See the proposal and delta
specs for the required observable behavior.

## Goals / Non-Goals

**Goals:**

- Expose the three BIS capability results through the game account boundary in
  a synchronous, safe-to-read form.
- Apply capability checks before rendering Items, treasure, and trophy UI.
- Preserve the existing loading, readiness, disabled-state, uncertainty, and
  recovery logic once each feature is visible.
- Keep capability checks read-only and avoid wallet operations during startup
  or visibility evaluation.

**Non-Goals:**

- Changing BIS capability semantics or the vendored package.
- Enabling asset minting, contract actions, trophy collection, or treasure
  interaction merely because a capability is true.
- Removing existing operation-level guards or changing guest gameplay outside
  the specified feature visibility.

## Decisions

1. **Use the account adapter as the game boundary.** Add
   `hasAssetMintingSupport()` and `hasContractSupport()` alongside the existing
   `hasItemSupport()`. Delegate to `BisGameServices` when available and retain
   conservative false/fallback behavior for unavailable or older adapters.
   This keeps game modules independent of BIS internals.

2. **Gate at creation/render boundaries.** Pass the capability predicates into
   the existing main-menu, level composition, treasure, and completion UI
   paths before they create visible controls or treasure objects. This avoids
   hiding already-created elements after the fact and prevents capability-false
   treasure sensors from entering the world.

3. **Preserve existing enabled-state decisions.** A true capability only makes
   the relevant feature eligible for rendering. Existing account readiness,
   asset ownership, inventory loading, operation state, and failure handling
   continue to decide whether visible controls are enabled.

4. **Prefer false during unavailable lifecycle states.** If the account is not
   initialized, disposed, loading, or does not expose a boolean capability,
   the adapter returns false. This gives guests a stable UI and prevents a
   transient loading state from initiating or exposing wallet-backed flows.

## Risks / Trade-offs

- [Risk] Capability state can change after a level or menu is created →
  [Mitigation] Re-evaluate the adapter predicate at the existing refresh and
  session-update boundaries; do not cache a positive result beyond the current
  session.
- [Risk] Older test fixtures or fallback BIS adapters lack the two newer
  methods → [Mitigation] Treat missing methods as false for the new gated
  features while preserving the existing item-support fallback only where the
  adapter contract explicitly supports it.
- [Risk] Moving treasure from always-rendered to capability-gated changes guest
  presentation → [Mitigation] Add explicit guest/false and true capability
  tests and verify ordinary non-treasure gameplay remains playable.
