export const TREASURE_REVEAL_SECONDS = 0.25;

export function createTreasureReveal({ sprite, api, durationSeconds = TREASURE_REVEAL_SECONDS }) {
  let elapsedSeconds = 0;
  let complete = false;

  const render = progress => api.updateSprite2D(sprite, {
    alpha: progress,
    scaleX: progress,
    scaleY: progress,
  });

  render(0);

  return {
    get isComplete() { return complete; },
    update(deltaSeconds = 0) {
      if (complete) return true;
      elapsedSeconds = Math.min(durationSeconds, elapsedSeconds + Math.max(0, deltaSeconds));
      render(elapsedSeconds / durationSeconds);
      complete = elapsedSeconds >= durationSeconds;
      return complete;
    },
  };
}
