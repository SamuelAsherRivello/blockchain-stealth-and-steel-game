import { createGameRunCoordinator } from "./game-run-lifecycle.js";

/**
 * Owns the document-level lifecycle for one active game run.
 *
 * Browser presentation stays at the entry point: the controller receives only
 * the run factory and the cover/reveal transition used around replacements.
 */
export function createGameRunController({ createRun, transition }) {
  let coordinator = null;
  let restartTransition = null;

  function getCoordinator() {
    if (!coordinator) {
      coordinator = createGameRunCoordinator({
        createRun: ({ run }) => createRun(run),
      });
    }
    return coordinator;
  }

  return Object.freeze({
    start(initialRun) {
      return getCoordinator().start(initialRun);
    },
    restart(run, pauseController) {
      if (restartTransition) {
        return restartTransition;
      }
      pauseController.pause("restart-transition");
      restartTransition = transition.cover()
        .then(() => getCoordinator().restart(run))
        .then(() => transition.reveal())
        .finally(() => { restartTransition = null; });
      return restartTransition;
    },
    dispose() {
      coordinator?.dispose();
    },
  });
}
