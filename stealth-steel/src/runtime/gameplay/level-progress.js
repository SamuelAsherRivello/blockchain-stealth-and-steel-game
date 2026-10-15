export const RUN_STORAGE_KEY = 'stealth-steel-level-run-v1';

export function catalogFromFiles(files) {
  const levels = files.filter(name => /^Level\d{2,}\.tmj$/.test(name))
    .map(file => ({number: Number(file.match(/\d+/)[0]), file})).sort((a,b) => a.number-b.number);
  if (!levels.length || levels.some((level,index) => level.number !== index+1)) throw Error('Packaged levels must be contiguous, starting with Level01.tmj.');
  return levels;
}

export function normalizeMapOrder(catalog, preference) {
  const numbers = catalog.map(level => level.number).sort((a, b) => a - b);
  return [...new Set([...(Array.isArray(preference) ? preference : []).filter(number => numbers.includes(number)), ...numbers])];
}

export function createLevelProgress(catalog, storage, reload, getPreferredOrder = () => [], { initialRun, onAdvance = null, onRestart = () => {} } = {}) {
  let order = normalizeMapOrder(catalog, getPreferredOrder()), completed = 0;
  if (initialRun?.order && Number.isInteger(initialRun.completed)
    && initialRun.completed >= 0 && initialRun.completed < initialRun.order.length
    && JSON.stringify(normalizeMapOrder(catalog, initialRun.order)) === JSON.stringify(initialRun.order)) {
    order = initialRun.order;
    completed = initialRun.completed;
    try { storage.setItem(RUN_STORAGE_KEY, 'null'); } catch { /* An in-memory run does not require session storage. */ }
  } else try {
    const saved = JSON.parse(storage.getItem(RUN_STORAGE_KEY) ?? 'null');
    if (saved?.pendingTransition === true && Array.isArray(saved.order) && saved.order.length === catalog.length
      && JSON.stringify(normalizeMapOrder(catalog, saved.order)) === JSON.stringify(saved.order)
      && Number.isInteger(saved.completed) && saved.completed >= 0 && saved.completed < saved.order.length) {
      // Continue reloads the page; consume its destination once so manual refresh starts over.
      storage.setItem(RUN_STORAGE_KEY, 'null');
      if (storage.getItem(RUN_STORAGE_KEY) !== 'null') throw Error('Level transition could not be consumed.');
      order = saved.order; completed = saved.completed;
    }
  } catch { /* Unreadable game progress starts a guest run, never touches wallet data. */ }
  const current = order[completed];
  const save = (nextOrder, count) => {
    const value = JSON.stringify({order: nextOrder, completed: count, pendingTransition: true});
    storage.setItem(RUN_STORAGE_KEY, value);
    if (storage.getItem(RUN_STORAGE_KEY) !== value) throw Error('Game progress could not be saved. Enable browser storage and try again.');
    if (onAdvance) onAdvance({order: nextOrder, completed: count});
    else reload();
  };
  return {
    current, completed, total: catalog.length,
    file: catalog.find(level => level.number === current).file,
    get hasNext() { return completed + 1 < order.length; },
    advance() { if (this.hasNext) save(order, completed + 1); },
    restart() {
      const freshRun = { order: normalizeMapOrder(catalog, getPreferredOrder()), completed: 0 };
      try { storage.setItem(RUN_STORAGE_KEY, 'null'); } catch { /* Restart remains available without session storage. */ }
      onRestart(freshRun);
      return freshRun;
    },
  };
}
