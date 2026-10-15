const roleKey = wallet => wallet ? [wallet.profileId ?? null, wallet.network ?? null] : [null, null];

/** Tracks the independently scoped Player and Game Wallet identities in public BIS snapshots. */
export function createWalletLifecycle() {
  let revision = 0;
  let key = JSON.stringify([null, null, null, null]);
  return Object.freeze({
    observe(snapshot) {
      const next = JSON.stringify([...roleKey(snapshot?.account?.playerWallet), ...roleKey(snapshot?.account?.gameWallet)]);
      if (next !== key) { key = next; revision++; }
      return revision;
    },
    current(candidate) { return candidate === revision; },
    get revision() { return revision; },
  });
}
