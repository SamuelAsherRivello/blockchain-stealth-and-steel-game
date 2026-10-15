export function createGoalExit(actor, destination, onComplete) {
  const start = actor.getPosition();
  const target = { ...destination };
  let elapsed = 0;
  let complete = false;
  actor.setInputEnabled(false);
  actor.setVisualTransform({ rotation: 0, alpha: 1, pivot: [0.5, 0.5] });
  return {
    update(deltaSeconds) {
      if (complete) return;
      elapsed += Math.max(0, deltaSeconds);
      const progress = Math.min(1, elapsed / 0.25);
      actor.setPosition({
        x: start.x + (target.x - start.x) * progress,
        y: start.y + (target.y - start.y) * progress,
      });
      actor.setVisualTransform({ rotation: Math.PI / 4 * progress, alpha: 1 - progress });
      if (progress === 1) {
        complete = true;
        onComplete();
      }
    },
  };
}
