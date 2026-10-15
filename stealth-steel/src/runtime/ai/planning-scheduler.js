/** FIFO pending requests provide fair service independent of actor update order. */
export function createPlanningScheduler({ maxExpansions = 1024, maxNavigation = 4096 } = {}) {
  if (![maxExpansions, maxNavigation].every(value => Number.isInteger(value) && value > 0)) throw new RangeError('Invalid scheduler budget');
  const pending = new Map();
  let expanded = 0, navigation = 0, immediate = 0;
  return {
    request(id, callback) { if (!pending.has(id)) pending.set(id, callback); },
    cancel(id) { pending.delete(id); },
    beginFrame() {
      expanded = 0; navigation = 0; immediate = 0;
      for (const [id, callback] of [...pending]) {
        if (expanded >= maxExpansions) break;
        pending.delete(id);
        const result = callback(Math.min(256, maxExpansions - expanded));
        expanded += result?.expanded ?? 0;
      }
    },
    takeNavigation(wanted) { const count = Math.min(wanted, maxNavigation - navigation); navigation += count; return count; },
    refundNavigation(unused) { navigation = Math.max(0, navigation - unused); },
    recordImmediate(count) { immediate += count; },
    snapshot() { return { expanded, immediate, navigation, pending: pending.size, maxExpansions, maxNavigation }; },
  };
}
