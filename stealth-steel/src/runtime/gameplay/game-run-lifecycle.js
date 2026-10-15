/** Coordinates one disposable game run at a time within the current document. */
export function createGameRunCoordinator({ createRun }) {
  let generation = 0;
  let activeRun = null;
  let disposed = false;
  let replacement = null;

  const disposeActive = () => {
    const previous = activeRun;
    activeRun = null;
    previous?.resource.dispose();
  };

  const activate = async (run) => {
    if (disposed) return null;
    disposeActive();
    const currentGeneration = ++generation;
    const resource = await createRun({ generation: currentGeneration, run });
    if (disposed || currentGeneration !== generation) {
      resource?.dispose();
      return null;
    }
    activeRun = { generation: currentGeneration, run, resource };
    return activeRun;
  };

  return {
    start: activate,
    restart(run) {
      if (!replacement) {
        replacement = activate(run).finally(() => { replacement = null; });
      }
      return replacement;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      generation++;
      disposeActive();
    },
    get generation() { return generation; },
    get activeRun() { return activeRun; },
  };
}
