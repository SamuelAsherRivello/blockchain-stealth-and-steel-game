import assert from "node:assert/strict";
import test from "node:test";
import { createWalletLifecycle } from "../../runtime/integration/wallet-lifecycle.js";

test("wallet lifecycle distinguishes Player and Game Wallet role changes", () => {
  const lifecycle = createWalletLifecycle();
  assert.equal(lifecycle.observe({ account: {} }), 0);
  assert.equal(lifecycle.observe({ account: { playerWallet: { profileId: "player", network: "signet" } } }), 1);
  assert.equal(lifecycle.observe({ account: { playerWallet: { profileId: "player", network: "signet" }, gameWallet: { profileId: "game", network: "signet" } } }), 2);
  assert.equal(lifecycle.observe({ account: { playerWallet: { profileId: "player", network: "signet" }, gameWallet: { profileId: "game", network: "signet" } } }), 2);
  assert.equal(lifecycle.observe({ account: { gameWallet: { profileId: "game", network: "signet" } } }), 3);
});

test("wallet lifecycle rejects stale asynchronous work after either role changes", () => {
  const lifecycle = createWalletLifecycle();
  const work = lifecycle.observe({ account: { playerWallet: { profileId: "player", network: "signet" } } });
  lifecycle.observe({ account: { playerWallet: { profileId: "player", network: "signet" }, gameWallet: { profileId: "game", network: "signet" } } });
  assert.equal(lifecycle.current(work), false);
});
