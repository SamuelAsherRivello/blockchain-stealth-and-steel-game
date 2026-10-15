export function createPauseController({
  onPause = () => {},
  onResume = () => {},
  now = () => performance.now(),
} = {}) {
  const reasons = new Set();
  let lastResumeTime = null;

  return {
    get isPaused() {
      return reasons.size > 0;
    },
    get lastResumeTime() {
      return lastResumeTime;
    },
    getDelta(deltaSeconds) {
      return reasons.size ? 0 : Math.max(0, deltaSeconds);
    },
    pause(reason = "legacy") {
      const alreadyPaused = reasons.size > 0;
      reasons.add(reason);
      if (alreadyPaused) {
        return false;
      }
      onPause();
      return true;
    },
    resume(reason = "legacy") {
      if (!reasons.delete(reason) || reasons.size) {
        return lastResumeTime;
      }
      lastResumeTime = now();
      onResume();
      return lastResumeTime;
    },
  };
}
