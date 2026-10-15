## Context

The current runtime already receives treasure spawners from normalized Tiled data, loads a runtime PNG atlas, creates treasure sensors, and owns the BIS-backed treasure session separately from the visual object. The change must preserve that separation while preventing a sensor entry from opening the treasure window before account and game-wallet readiness is verified. See proposal.md and `specs/treasure-rendering/spec.md` for the user-facing contract.

## Goals / Non-Goals

**Goals:**

- Keep treasure sprite creation tied only to authored level data and renderer readiness.
- Make the sensor's enter callback consult a current, game-owned BIS readiness predicate before opening treasure UI.
- Allow readiness changes to affect interaction without recreating the level object or sprite.
- Preserve the existing nonblocking sensor, treasure pause, session lifecycle, and runtime-compatible PNG asset behavior.

**Non-Goals:**

- Do not add a second BIS wallet, contract, or account API.
- Do not hide, remove, or replace treasure artwork when BIS is unavailable.
- Do not change Tiled map coordinates, treasure reward economics, or the existing Claim/Reject flow.
- Do not make ordinary game startup depend on BIS readiness.

## Decisions

1. **Keep rendering unconditional and gate only the enter action.** The level loader will continue to create the sprite layer and chest for every normalized treasure spawner. The chest's enter handler will perform the readiness check immediately before requesting the treasure window. This avoids coupling visual construction to asynchronous account hydration and preserves guest play.

   *Alternative considered:* omit the chest until BIS is ready. Rejected because it makes the level visually different for guests and requires rebuilding or synchronizing the object after asynchronous setup.

2. **Use the existing BIS account host as the readiness authority.** The integration will expose or use the existing account/game-wallet state already used by the treasure runtime, requiring a usable player identity and game-wallet state before opening UI. No direct inspection of BIS internals or new wallet service endpoint will be introduced.

   *Alternative considered:* let the treasure session decide whether to open UI. Rejected because session availability is a financial-flow concern, while the account host owns setup readiness and the UI should not be opened for a missing setup.

3. **Keep the chest callback live rather than snapshotting readiness.** The callback will evaluate current readiness on each sensor entry, so a chest rendered during loading becomes interactive after setup completes without replacing its sprite, sensor, or spawner object.

   *Alternative considered:* subscribe to readiness and mutate the chest's callback at load time. Rejected because it adds subscription lifecycle complexity and can leave stale callbacks after account disposal.

4. **Test the boundary at the chest/runtime seam.** Unit tests will cover visible creation and gated enter behavior for absent, loading, unavailable, and ready states; existing browser smoke coverage will be extended only where needed to prove guest movement remains usable and ready setup opens the established window.

## Risks / Trade-offs

- [Risk] BIS state may change between the readiness check and the UI/session call. → Keep the existing treasure session's failure handling authoritative; a failed operation leaves the rendered chest and reports its existing unavailable state.
- [Risk] A readiness predicate may accidentally require a player account for ordinary gameplay. → Scope the predicate only to treasure entry and retain the existing nonblocking `accountHost.ready()` startup behavior.
- [Risk] Reusing the current sensor could permit repeated callbacks during a transient state. → Preserve the chest's existing enter/exit debounce and ensure rejected entries do not add a treasure pause.

## Migration Plan

1. Add the readiness-gated enter path and focused tests.
2. Run the focused treasure/BIS tests, the production build, and the relevant browser smoke check.
3. If the change must be rolled back, revert only the gate and its tests; authored treasure data, artwork, and the existing session implementation remain compatible.
