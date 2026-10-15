## Why

Restart Game currently persists a transition and refreshes the browser to recreate the world. That was a useful bootstrap shortcut, but it is now unnecessarily disruptive: the player loses the current browser session while asking only for a new game run.

## What Changes

- Replace the browser-navigation restart path with an in-place fresh-run lifecycle for Restart Game from both loss and completion menus.
- Dispose the old run's gameplay resources and asynchronous callbacks before creating a new first-level run, without reloading the document.
- Preserve browser-persistent settings, wallet/account data, and the selected Map Order; reset all run-owned world, combat, pickup, UI, and session state.
- Give each fresh run a new game-session identity so delayed callbacks for the abandoned run cannot affect it.
- Keep Continue to Next Level outside this change; it retains its existing transition behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `player-loss-flow`: A free loss-menu restart must reset in place without browser navigation while retaining its existing abandoned-run safety guarantees.
- `tiny-swords-ui-theme`: Restart Game from either themed end-level menu must visibly return to the normal fresh-run start state without refreshing the browser.

## Impact

- `stealth-steel/src/runtime/main.js` lifecycle ownership, animation-frame scheduling, world disposal, and fresh-run composition.
- `runtime/gameplay/level-progress.js` restart intent and run selection, while retaining existing Map Order behavior.
- Loss/reward integration, BIS account/session handling, and their focused tests.
- Browser QA proving both Restart Game routes reset the game without a page navigation.
