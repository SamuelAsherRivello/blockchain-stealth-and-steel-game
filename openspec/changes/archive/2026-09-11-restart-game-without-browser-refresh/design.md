## Context

See proposal.md for motivation. `main.js` currently creates one complete game run in `start()`: it creates the WebGPU engine, loads a map and assets, builds world/UI/BIS objects, schedules its own `requestAnimationFrame` loop, and only disposes those objects from a one-shot `pagehide` handler. `createLevelProgress()` persists both Continue and Restart transitions, then calls a supplied browser reload callback. Loss and completion menus, plus the BIS account restart event, converge on that restart path.

The existing loss and BIS contracts already require a fresh run to reject old continuation effects. The existing Map Order contract requires a fresh run to use the latest saved preference, while Continue follows the order snapshot captured by its current run.

## Goals / Non-Goals

**Goals:**

- Make one document lifetime support consecutive, isolated game runs.
- Guarantee that a discarded run cannot keep updating, rendering, receiving input, or applying asynchronous effects after its replacement begins.
- Keep the existing fresh-run Map Order, start-prompt, persistent-settings, and account-data semantics.

**Non-Goals:**

- Changing Continue To Next Level, adding checkpoints/saves, or preserving in-progress gameplay across manual refresh.
- Changing paid revival, rewards, the public BIS host contract, map assets, or persistent settings.
- Keeping a loss/completion/account modal open across a new run.

## Decisions

### 1. Separate browser lifetime from game-run lifetime

Refactor the current one-shot `start()` composition into a browser-lifetime coordinator and a disposable game-run factory. The canvas, WebGPU engine, viewport sizing, global settings/audio, and actual `pagehide` registration stay browser-owned. Each game run owns its map-specific renderer layers, actors/spawners, AI/perception, projectiles/effects, gameplay UI, input handlers, pause sources, BIS host adapter, account integration, and animation-frame callback.

The coordinator keeps at most one active run. It starts a replacement only after awaiting/discharging the old run's idempotent disposer; the reusable disposer is also invoked by `pagehide`. This is preferred to re-importing `bootstrap.js` or calling `start()` recursively because module imports and global observers are not restartable game state. It is also preferred to recreating the document because preserving the document is the requested behavior.

### 2. Use an explicit fresh-run command, not the persisted reload transition

Level progression will distinguish two intents. Continue retains the present persisted transition and browser reload behavior. Restart produces a fresh run descriptor using the current normalized Map Order and its first map, clears any run-transition marker, and hands that descriptor to the coordinator without invoking `location.reload()`.

The new run receives a newly created progression object rather than mutating the completed/lost object's fixed current-level fields. This preserves Continue's captured order while ensuring Restart observes a Map Order preference changed since the discarded run began.

### 3. Make replacement cancellation generation-bound

The coordinator assigns a generation and game-session ID to every run. Replacement first invalidates the active generation, cancels its scheduled animation frame, and removes its run-owned resources. All delayed loading, payment, reward, equipment, and account callbacks must verify that their captured generation/session is still active before changing game state.

The existing BIS host adapter already binds continuation delivery to a game-session ID. A restart creates a new adapter/session and tears down the previous run's account/loss controllers, so a late old-session receipt remains `not-applicable`. Browser-persistent wallet/account data is not cleared; the run-scoped account UI and its restart latch are recreated so a BIS `restartRequested` event reaches the same fresh-run coordinator safely.

### 4. Preserve the initial presentation policy

After the replacement run has initialized its first map, it follows the same start-prompt policy as the initial launch: the normal game shows the Start Menu and waits for Start, while the existing development `skipIntro=true` behavior remains supported. All end-level and transient UI from the old run is removed before the new start presentation becomes interactive.

### 5. Treat an in-place restart as a browser-visible contract

Tests must distinguish an ordinary fresh visual state from a hidden page reload. Browser verification will capture the document URL and navigation entry count before activating Restart Game, then prove they are unchanged after the new Start Menu is present. It will cover both completion and loss entry points and assert that a late old-session continuation has no effect.

## Risks / Trade-offs

- [A run leaves a scheduled frame, renderer layer, input listener, or DOM menu behind] -> centralize every run-owned disposer and make it idempotent; test a second restart and inspect the resulting UI/world counts.
- [A loader or BIS callback resolves after disposal] -> capture and validate the run generation/session at every async boundary before publishing state.
- [Restart accidentally follows a stale progression snapshot] -> build the fresh descriptor from the saved Map Order at the restart click and retain the existing reordered-run tests.
- [Reusing WebGPU resources has renderer-specific cleanup requirements] -> inventory the Babylon Lite engine/renderer disposal API during implementation and cover repeated restart in the browser before treating the lifecycle as complete.
- [The user sees a blank or competing end-state UI while the replacement map loads] -> keep the initiating action disabled until disposal begins, then surface only the established startup/error presentation for the new run.

## Migration Plan

1. Characterize the existing reload-backed Continue and Restart behaviors in focused tests, including current Map Order and late-callback guarantees.
2. Extract the reusable run disposer/coordinator and replace Restart call sites while retaining Continue's persisted navigation path.
3. Run focused lifecycle, progression, loss, reward, account, and UI tests; then perform real-browser restart checks from both end-level routes.
4. If the new lifecycle fails before release, restore Restart's current reload-backed command as a contained rollback; it has no persisted data migration.
