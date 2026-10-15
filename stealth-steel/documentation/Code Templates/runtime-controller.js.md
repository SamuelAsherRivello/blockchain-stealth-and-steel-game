# Runtime controller

## Purpose

Own one game runtime concern: state, timing, subscription, and cleanup for a named gameplay or integration boundary.

## Allowed dependencies

- Its immediate game systems and explicit public integration facades.
- No Arkade import and no BIS source-path import. Only `runtime/integration/` may load `@bis/integration`.
- For BIS workflows, retain a typed `IBis` and public workflow ID, not a returned BIS controller. Use named begin/action/check/end commands and game-local snapshot listeners fed solely by `IBisGame.onBisEvent`.

## Template

```js
export function createFeatureController({ dependency }) {
  let disposed = false;
  let generation = 0;
  const timers = new Set();
  const isCurrent = token => !disposed && token === generation;
  return {
    async start() { const token = ++generation; /* do work; guard every late result with isCurrent(token) */ },
    dispose() { disposed = true; generation++; for (const timer of timers) clearTimeout(timer); timers.clear(); },
  };
}
```

## State, errors, and disposal

Name the owner of mutable state. Treat a stale session as inapplicable rather than trying to repair a new run. Dispose listeners and timers in the reverse order they were acquired. Keep real BIS financial outcomes separate from game effects.

Game-effect delivery reserves an application/session/operation in-flight entry before yielding. Await optional preparation, revalidate the session/target, and commit synchronously. Matching concurrent duplicates await the original result; report `already-applied` only after an applied commit. Invalidate the run before restart/reset/disposal. Never remint/pay/claim to retry presentation. See the implemented [host factory](../../src/runtime/integration/bis-host-game.js) and [typechecked canonical example](../../src/test/integration/fixtures/bis-contract-types.ts).

## Verification

Add focused Node tests for success, replay/stale behavior, and disposal, then run `npm test`.
