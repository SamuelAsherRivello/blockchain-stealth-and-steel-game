# Proposal

## Why

Logging out through BIS while the Start menu is already visible leaves the game darkened and input-inert. The game processes the ordinary Player-disconnect refresh before BIS's definitive logout restart signal, so it rebuilds the menu without releasing the Account overlay's pause and input ownership.

## What Changes

- Give the logout restart request precedence over ordinary Player connection refreshes, producing one usable fresh Start-menu presentation with no retained Account overlay, inert controls, or Account pause reason.
- Add a BIS-to-game logout-authorization handshake: the game can allow, deny, or require a BIS-rendered confirmation whose body text comes from the game; BIS rechecks the authorization after its Confirm button is used.
- When a registered game cannot authorize logout, provide an explicit BIS-owned override warning instead of silently clearing wallet access.
- Reconcile Player and Game Wallet identity changes from BIS's public safe notifications, rather than treating a Player disconnect as the only wallet-lifecycle transition.
- Invalidate wallet-scoped game eligibility and stale asynchronous results when either wallet changes, while preserving free gameplay and never representing local UI cleanup as cancellation of submitted financial work.
- Add focused lifecycle and managed-browser coverage for Player and Game Wallet login/logout transitions, including the reported Start-menu logout path.

## Capabilities

### New Capabilities

- `wallet-lifecycle-reconciliation`: Reconciles public BIS Player and Game Wallet state changes with game-owned menus, pauses, eligibility, and stale-session handling.

### Modified Capabilities

- `bis-host-game-contract`: Require game handling of typed wallet lifecycle notifications through the public BIS contract.
- `gameplay-pause`: Require logout recovery to release Account interaction ownership while retaining the Start-menu pause.

## Impact

Affected areas include the exported `@bis/integration` host contract and Account logout UI, the BIS release artifact consumed by the game, the game BIS Account adapter, run/menu lifecycle coordination, equipment and wallet-dependent workflow bridges, contract tests, and managed Playwright lifecycle acceptance. No BIS internal imports, wallet secrets, or transaction cancellation behavior are added.
