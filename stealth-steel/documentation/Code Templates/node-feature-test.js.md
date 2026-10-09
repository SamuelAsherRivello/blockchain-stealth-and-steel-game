# Node feature test

## Purpose

Prove a game contract with deterministic callbacks and no renderer, wallet, or network dependency.

## Template

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('stale delivery does not affect the active run', async () => {
  const fixture = createFixture();
  const oldCommand = fixture.command();
  fixture.startNewRun();
  assert.deepEqual(await fixture.host.applyConfirmedContinuation(oldCommand), {status:'not-applicable'});
});
```

## Verification

Name the behavior, use an explicit fixture, and cover normal, replayed, stale, and disposed paths as relevant. Run `npm test` and any dedicated contract typecheck.

For BIS effects, also test overlapping duplicates, session replacement during async preparation, failed preparation/commit, reset/transition invalidation and separate asset/sats feedback. Only a synchronous guarded commit may mutate gameplay. Typed receipts never authorize another financial action. Mock named `IBis` commands and publish safe snapshots through the game dispatcher; do not revive removed controller factories or substitute a declaration mirror. Keep synthetic delivery/menu fixtures explicitly separate from live wallet acceptance. See [host tests](../../src/test/integration/bis-host-game.test.js) and [public contract checks](../../src/test/integration/bis-public-boundary.test.js).
