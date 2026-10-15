/** Passive view of a snapshot. World-to-screen camera translation is owned by the debug canvas. */
export function enemyAiLabel({ position, snapshot, jumpOffset = 0, isAlive = true }, screenHeight) {
  if (!isAlive || !snapshot || snapshot.disposed) return null;
  return {
    x: position.x, y: screenHeight - position.y - 82 + jumpOffset,
    lines: [`Goal: ${snapshot.goal}`, `Action: ${snapshot.action}`],
  };
}

export function drawEnemyAiLabels(context, labels, viewport = null) {
  context.save();
  context.font = '600 12px system-ui, sans-serif';
  context.textAlign = 'center'; context.textBaseline = 'top';
  for (const label of labels) {
    if (!label) continue;
    const width = Math.max(...label.lines.map(line => context.measureText(line).width)) + 12;
    if (viewport && (label.x < viewport.x || label.x > viewport.x + viewport.width
      || label.y + 82 < viewport.y || label.y > viewport.y + viewport.height)) continue;
    const x = viewport ? Math.max(viewport.x + width / 2 + 2, Math.min(viewport.x + viewport.width - width / 2 - 2, label.x)) : label.x;
    const y = viewport ? Math.max(viewport.y + 4, label.y) : label.y;
    context.fillStyle = 'rgba(12, 17, 24, 0.9)';
    context.fillRect(x - width / 2, y - 4, width, 36);
    context.fillStyle = '#eef4ff';
    label.lines.forEach((line, index) => context.fillText(line, x, y + index * 16));
  }
  context.restore();
}
