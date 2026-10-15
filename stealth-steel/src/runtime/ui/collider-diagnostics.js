export const COMBAT_COLLIDER_STYLE = Object.freeze({
  fillStyle: "rgb(255 70 70 / 22%)",
  strokeStyle: "#ff4646",
});

export const MOVEMENT_COLLIDER_STYLE = Object.freeze({
  fillStyle: "rgb(64 144 255 / 22%)",
  strokeStyle: "#4090ff",
});

export const TERRAIN_COLLIDER_STYLE = Object.freeze({
  ...MOVEMENT_COLLIDER_STYLE,
  lineWidth: 1,
});

export const VISUAL_PERCEPTION_STYLE = Object.freeze({ fillStyle: "rgb(160 80 255 / 40%)", blinkFillStyle: "rgb(160 80 255 / 100%)" });
export const AUDIO_PERCEPTION_STYLE = Object.freeze({ fillStyle: "rgb(160 80 255 / 40%)", blinkFillStyle: "rgb(160 80 255 / 100%)" });
export const ACTIVE_PERCEPTION_MARKER_STYLE = Object.freeze({ strokeStyle: "#ff3030", lineWidth: 3, size: 20 });
export const GRID_SPOT_MARKER_STYLE = Object.freeze({ strokeStyle: "#ffffff", lineWidth: 1, size: 2.5 });
export const PLAYER_CENTER_MARKER_STYLE = Object.freeze({ strokeStyle: "#000000", lineWidth: 1, size: 3.5 });
const activeStartByKey = new Map();

function hasValidVisualGeometry(actor) {
  const direction = typeof actor.heading === "string"
    ? { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[actor.heading]
    : actor.heading && [actor.heading.x, actor.heading.y];
  return actor.cell
    && Array.isArray(direction)
    && Number.isInteger(direction[0])
    && Number.isInteger(direction[1])
    && Math.abs(direction[0]) + Math.abs(direction[1]) === 1
    && Number.isInteger(actor.visualRange ?? 4)
    && (actor.visualRange ?? 4) >= 0;
}

export function getPerceptionBlinkState(activeSince, now) {
  if (activeSince === undefined) return true;
  return ((now - activeSince) % 300) < 200;
}

export function createPerceptionSquare(cell, tileSize, size = tileSize) {
  const inset = (tileSize - size) / 2;
  const x = cell.x * tileSize + inset;
  const y = cell.y * tileSize + inset;
  return [{ x, y }, { x: x + size, y }, { x: x + size, y: y + size }, { x, y: y + size }];
}

export function createPerceptionDrawCommands(snapshot, tileSize, now = 0, visionOptions = {}) {
  const detections = snapshot?.detections ?? [];
  const activeKeys = new Set(detections.map((d) => `${d.detectorId}:${d.type}:${d.cell.x},${d.cell.y}`));
  for (const key of activeStartByKey.keys()) if (!activeKeys.has(key)) activeStartByKey.delete(key);
  for (const d of detections) {
    const key = `${d.detectorId}:${d.type}:${d.cell.x},${d.cell.y}`;
    if (!activeStartByKey.has(key)) activeStartByKey.set(key, now);
  }
  const detectors = Array.isArray(snapshot) ? snapshot : (snapshot?.actors ?? [])
    .filter((actor) => actor.type === "enemy" && actor.isAlive !== false)
    .filter(hasValidVisualGeometry)
    .map((actor) => ({
      ...actor,
      visualCells: getVisibleVisualCells(actor, tileSize, visionOptions), id: actor.id,
      audioCells: getAudioCells(actor.cell),
      activeVisualCells: detections.filter((d) => d.detectorId === actor.id && d.type === "visual").map(({ cell }) => cell),
      activeAudioCells: detections.filter((d) => d.detectorId === actor.id && d.type === "audio").map(({ cell }) => cell),
    }));
  return detectors.flatMap((detector) => [
    ...(detector.visualCells ?? []).map((cell, index) => ({
      channel: "visual", points: createPerceptionSquare(cell, tileSize, tileSize / 2),
      style: { fillStyle: `rgb(160 80 255 / ${40 * (detector.visualStrength ?? getVisualStrength(index + 1))}%)`, blinkFillStyle: "rgb(160 80 255 / 100%)" }, active: (detector.activeVisualCells ?? []).some((active) => active.x === cell.x && active.y === cell.y), activeSince: activeStartByKey.get(`${detector.id}:visual:${cell.x},${cell.y}`),
    })),
    ...(detector.audioCells ?? []).map((cell) => ({
      channel: "audio", points: createPerceptionSquare(cell, tileSize, tileSize / 4),
      style: AUDIO_PERCEPTION_STYLE, active: (detector.activeAudioCells ?? []).some((active) => active.x === cell.x && active.y === cell.y), activeSince: activeStartByKey.get(`${detector.id}:audio:${cell.x},${cell.y}`),
    })),
  ]).filter(({ points }) => points.length === 4)
    .sort((a, b) => Number(a.channel === 'audio') - Number(b.channel === 'audio')).map((command) => ({
    ...command, blinking: command.active && getPerceptionBlinkState(command.activeSince, now),
  }));
}

export function drawPerceptionDiagnostics(context, snapshot, tileSize, screenHeight, now, { enabled = false, visionOptions = {} } = {}) {
  if (!enabled) return [];
  const commands = createPerceptionDrawCommands(snapshot, tileSize, now, visionOptions);
  for (const command of commands) {
    context.beginPath();
    command.points.forEach((point, index) => {
      context[index === 0 ? 'moveTo' : 'lineTo'](point.x, screenHeight - point.y);
    });
    context.closePath();
    context.fillStyle = command.blinking ? command.style.blinkFillStyle : command.style.fillStyle;
    context.fill();
  }
  return commands;
}

export function getVisibleVisualCells(actor, tileSize, { isWalkable = () => true, blockers = [] } = {}) {
  if (actor?.isAlive === false || !hasValidVisualGeometry(actor) || !Number.isFinite(tileSize) || tileSize <= 0) return [];
  const cells = getVisualCells(actor.cell, actor.heading, actor.visualRange ?? 4);
  const blocked = (cell) => !isWalkable(cell) || blockers.some((blocker) => blocker?.x === cell.x && blocker?.y === cell.y);
  const visible = [];
  for (const cell of cells) {
    if (blocked(cell)) break;
    visible.push(cell);
  }
  return visible;
}

export function createEnemyVisionShadowDrawCommands(snapshot, tileSize, options = {}) {
  const actors = Array.isArray(snapshot) ? snapshot : (snapshot?.actors ?? []);
  return actors
    .filter((actor) => actor?.type === "enemy" && actor.isAlive !== false)
    .flatMap((actor) => getVisibleVisualCells(actor, tileSize, options).map((cell, index) => ({
      detectorId: actor.id,
      cell: { ...cell },
      positionPx: [
        (cell.x + 0.5) * tileSize,
        (options.screenHeight ?? 1024) - (cell.y + 0.5) * tileSize,
      ],
      sizePx: [tileSize, tileSize],
      frame: 0,
      opacity: 0.4 - index * 0.1,
      color: [1, 1, 1, 0.4 - index * 0.1],
    })));
}

/** Uses the same tile-shadow art as enemy vision, recolored for a takedown space. */
export function createStealthAttackShadowDrawCommands(zones, tileSize, options = {}) {
  return (zones ?? []).filter((zone) => zone?.enemyId && zone?.interactionPosition).map((zone) => ({
    id: zone.id,
    enemyId: zone.enemyId,
    positionPx: [
      zone.interactionPosition.x,
      (options.screenHeight ?? 1024) - zone.interactionPosition.y,
    ],
    sizePx: [tileSize, tileSize],
    frame: 0,
    color: [1, .84, .1, .68 * (zone.opacity ?? 1)],
  }));
}

export function createActivePerceptionMarkerCommands(snapshot, tileSize = 64) {
  const detections = snapshot?.knownDetections ?? snapshot?.detections ?? [];
  const seen = new Set();
  return detections.filter(({ cell }) => {
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(({ cell }) => ({
    x: cell.x * tileSize + tileSize / 2,
    y: cell.y * tileSize + tileSize / 2,
    style: ACTIVE_PERCEPTION_MARKER_STYLE,
  }));
}

export function createCharacterColliderDrawCommands(characters) {
  return [
    ...characters
      .filter(({ combatCollider }) => Boolean(combatCollider))
      .map(({ combatCollider }) => ({
        collider: combatCollider,
        style: COMBAT_COLLIDER_STYLE,
      })),
    ...characters
      .filter(({ movementCollider }) => Boolean(movementCollider))
      .map(({ movementCollider }) => ({
        collider: movementCollider,
        style: MOVEMENT_COLLIDER_STYLE,
      })),
  ];
}

export function createCharacterCenterDrawCommands(characters) {
  return characters
    .filter(({ centerCollider, movementCollider }) => Boolean(centerCollider ?? movementCollider))
    .map(({ centerCollider, movementCollider }) => {
      const collider = centerCollider ?? movementCollider;
      return {
        x: collider.type === "circle" ? collider.x : collider.x + collider.width / 2,
        y: collider.type === "circle" ? collider.y : collider.y + collider.height / 2,
      };
    });
}

export function createGridSpotMarkerCommands(entities) {
  return entities
    .filter(({ active = true, gridSpot }) => active && gridSpot)
    .map(({ gridSpot }) => ({
      ...gridSpot.getMarkerCommand(),
      style: GRID_SPOT_MARKER_STYLE,
    }));
}

export function createPlayerCenterMarkerCommands(entities) {
  return createCharacterCenterDrawCommands(entities.filter(({ isPlayer }) => isPlayer))
    .map((center) => ({ ...center, style: PLAYER_CENTER_MARKER_STYLE }));
}

export function drawGridSpotMarker(context, marker, screenHeight) {
  if (!context || !marker || !Number.isFinite(screenHeight)) return;
  const screenY = screenHeight - marker.y;
  const size = marker.style?.size ?? GRID_SPOT_MARKER_STYLE.size;
  context.beginPath();
  context.moveTo(marker.x - size, screenY - size);
  context.lineTo(marker.x + size, screenY + size);
  context.moveTo(marker.x + size, screenY - size);
  context.lineTo(marker.x - size, screenY + size);
  context.strokeStyle = marker.style?.strokeStyle ?? GRID_SPOT_MARKER_STYLE.strokeStyle;
  context.lineWidth = marker.style?.lineWidth ?? GRID_SPOT_MARKER_STYLE.lineWidth;
  context.stroke();
}
import { getAudioCells, getVisualCells, getVisualStrength } from "../systems/perception/character-perception.js";
