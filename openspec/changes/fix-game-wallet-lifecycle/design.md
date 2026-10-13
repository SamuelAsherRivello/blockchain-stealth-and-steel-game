# Design

## Context

See [proposal.md](proposal.md). The current host forwards every public BIS event to the Account adapter, but the run coordinator independently rebuilds the Start menu for Player connection events. A Player logout delivers a normal disconnect before the stable restart request. At that point the visible Start menu causes the coordinator to return early, and the Account adapter remains active with its pause, focus trap, and inert siblings.

The public contract supplies typed events and copied snapshots. Player connection/disconnection is typed; Game Wallet lifecycle is observed by comparing the safe account snapshot. The game must not reach into BIS controllers, wallet storage, or DOM.

## Goals / Non-Goals

**Goals:**

- Establish one game-owned lifecycle reducer/dispatcher that gives a deduplicated logout restart precedence over ordinary menu refreshes.
- Release Account interaction ownership before the resulting fresh Start menu becomes interactive.
- Track a safe Player/Game Wallet identity-and-network key and invalidate wallet-scoped UI/work when that key changes.
- Exercise real adapter ordering in focused tests and a managed-browser test.

**Non-Goals:**

- Change BIS's account storage, recovery, financial submission, or existing event semantics.
- Cancel or reverse submitted transactions, erase the independent Game Wallet merely because the Player changes, or require wallets for free gameplay.
- Add internal BIS imports, raw wallet access, or a browser reload requirement for the Start-menu path.

## Decisions

### Route all public lifecycle input through one game-owned transition

The host event callback will first deliver the event/snapshot to the Account adapter, then dispatch its game consequence. A restart request will carry a distinct, deduplicated terminal transition; it must not use the ordinary `rebuildStartMenu` early return. The transition will explicitly deactivate/tear down the Account presentation before invoking the existing fresh-run coordinator or a single fallback reload only where a run reconstruction is unavailable.

This is preferred to changing BIS event order because the stable restart notification is already the public completion signal and other consumers may observe the current ordering. It is also preferred to special-casing the Start-menu DOM because pause, focus, and inert ownership belong to the Account adapter rather than the menu.

### Derive wallet-role changes from copied snapshots

The game will retain the previous public Player and Game Wallet `{profileId, network}` values. On each `stateChanged` snapshot it will compare those values, refresh capability/UI state, and advance a wallet-eligibility generation whenever either changes. Wallet-dependent async results must validate the generation and current identities immediately before applying UI or gameplay effects.

This is preferred to inventing Game Wallet login/logout events, because the current verified BIS contract exposes the necessary safe snapshot and keeps event vocabulary stable. Existing Player events remain useful for immediate menu refresh, but snapshot comparison is the complete role lifecycle source.

### Use a two-stage exported logout authorization

The verified BIS package will add an optional game-host logout callback. Its first call receives only public Player/session identity and returns `allow`, `deny`, or `confirm` with an opaque authorization ID and bounded plain-text body. BIS owns the dialog title and controls; it inserts only the game body into the confirmation content. On the BIS Confirm action, it calls the host again with the opaque ID, so the game revalidates the same run before wallet cleanup. A registered host that fails to respond causes BIS to display its own force-logout warning, which requires a separate player confirmation. A consumer with no registered game retains ordinary BIS logout.

This is preferred to a game-owned dialog because Account already owns the logout operation and wallet safeguards, while the game still owns its progress-loss wording and decision. It is preferred to a one-shot approval because an active run can change while the Account dialog is open.

### Preserve independent menu and Account pause ownership

Logout teardown will release only `bis-account` ownership and restore the elements it made inert. The replacement Start menu retains the normal Start pause. This prevents the frozen screen while preserving the existing rule that menu display pauses mutable game time.

## Risks / Trade-offs

- [A stale async capability result repaints after logout] → Bind it to the wallet-eligibility generation and verify it at completion.
- [An Account-close event races the restart event] → Queue close as today, but make the restart transition cancel/supersede the pending close and own teardown once.
- [Repeated events create multiple menus] → Deduplicate by logout ID and ensure menu reconstruction is idempotent.
- [Tests only cover synthetic event order] → Run the managed browser flow through the mounted public fixture with both Player and Game Wallet snapshot transitions.
- [BIS and game versions drift] → Export and verify a new immutable BIS package before importing it into the game, with public contract checks on both sides.

## Migration Plan

1. Add the exported BIS authorization contract, Account-flow tests, and a verified package export.
2. Import that immutable package into the game, then add focused adapter/coordinator tests for authorization ordering, teardown, wallet-role comparison, and stale completions.
3. Add managed-browser acceptance for the Start-menu logout path and wallet-role enable/disable behavior.
4. Roll back by reverting the BIS package import and game-only lifecycle changes; no storage or transaction migration is required.
