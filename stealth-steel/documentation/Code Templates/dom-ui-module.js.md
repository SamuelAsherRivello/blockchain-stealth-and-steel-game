# DOM UI module

## Purpose

Render one game-owned overlay or HUD and translate explicit user input into controller actions.

## Allowed dependencies

- DOM primitives, one controller interface, and existing UI helpers.
- No wallet SDK, persistence, or direct BIS internal import.

## Template

```js
export function createFeatureUi({ host, controller }) {
  const root = document.createElement('section');
  const unsubscribe = controller.subscribe?.(() => render(controller.getState()));
  function render(state) { /* reflect state; do not invent financial status */ }
  host.append(root); render(controller.getState?.() ?? {});
  return { show: () => { root.hidden = false; }, hide: () => { root.hidden = true; }, dispose() { unsubscribe?.(); root.remove(); } };
}
```

## State, errors, and disposal

The controller owns business state; the UI owns DOM nodes, focus, and event listeners. A dismissed UI must not cancel a submitted operation. Error copy must be safe and actionable.

Here “controller” means a game-owned view model, never a BIS workflow handle. BIS views use public `IBis` commands and copied workflow state delivered through the game's private `IBisGame.onBisEvent` dispatcher. Do not infer Account/wallet state from BIS DOM/CSS or create a context subscription. A timer may render a countdown, not drive financial recovery. Respect pending/acknowledgement navigation guards, and inspect safe reset failure before reporting completion. See the [actual gateway/workflows](../deep-dive.md).

## Verification

Use the project’s lightweight DOM fixture pattern and run its matching `node --test` file.
