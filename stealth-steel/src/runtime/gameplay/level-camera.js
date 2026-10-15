import { GRID } from "../systems/environment/grid-contract.js";

export const CAMERA_FOLLOW = Object.freeze({ columns: 3, rows: 4, dampingSeconds: 0.15, settlePx: 0.1 });
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** World coordinates use the normalized map origin; projection stays viewport-sized. */
export function getLevelWorld(level) {
  const mode = level.cameraMode ?? "fixed";
  if (!["fixed", "follow-player"].includes(mode)) throw new Error(`Invalid level cameraMode: ${mode}`);
  const follow = mode === "follow-player";
  // Keep the authored border only where there is room for a full viewport inside it.
  const borderX = level.width >= GRID.columns + 2 ? 1 : 0;
  const borderY = level.height >= GRID.rows + 2 ? 1 : 0;
  const minColumn = follow ? borderX - level.origin.x : 0;
  const minRow = follow ? borderY - level.origin.y : 0;
  const columns = follow ? level.width - 2 * borderX : GRID.columns;
  const rows = follow ? level.height - 2 * borderY : GRID.rows;
  const grid = { ...GRID, minColumn, minRow, columns, rows, widthPx: columns * GRID.tileSizePx, heightPx: rows * GRID.tileSizePx };
  const bounds = { x: minColumn * GRID.tileSizePx, y: minRow * GRID.tileSizePx,
    width: grid.widthPx, height: grid.heightPx, renderHeight: GRID.heightPx, enforce: follow };
  return { mode, grid, bounds };
}

/** Camera offset is the bottom-left visible world point. Sprite view uses Y-down pixels. */
export function createLevelCamera(world, { getRenderScale = () => 1 } = {}) {
  const { bounds, mode } = world;
  const width = GRID.widthPx, height = GRID.heightPx;
  const halfZone = { x: CAMERA_FOLLOW.columns * GRID.tileSizePx / 2, y: CAMERA_FOLLOW.rows * GRID.tileSizePx / 2 };
  const min = { x: bounds.x, y: bounds.y };
  const max = { x: bounds.x + Math.max(0, bounds.width - width), y: bounds.y + Math.max(0, bounds.height - height) };
  const offset = mode === "fixed" ? { x: 0, y: 0 } : { ...min };
  // Babylon Lite projects sprite coordinates against backing pixels. Read the
  // current backing scale when uploading each layer, including after a resize,
  // so world coordinates and camera offsets remain logical pixels.
  const view = { positionPx: [0, 0], get zoom() { return getRenderScale(); }, rotation: 0 };
  function sync() { view.positionPx[0] = offset.x; view.positionPx[1] = -offset.y; }
  sync();
  const api = {
    view,
    initialize(player) {
      if (mode === "follow-player") {
        offset.x = clamp(player.x - width / 2, min.x, max.x);
        offset.y = clamp(player.y - height / 2, min.y, max.y);
      }
      sync();
    },
    update(player, deltaSeconds) {
      if (mode !== "follow-player" || !player || !(deltaSeconds > 0)) return;
      const blend = -Math.expm1(-deltaSeconds / CAMERA_FOLLOW.dampingSeconds);
      for (const axis of ["x", "y"]) {
        const center = offset[axis] + (axis === "x" ? width : height) / 2;
        const delta = player[axis] - center;
        const correction = delta - clamp(delta, -halfZone[axis], halfZone[axis]);
        if (correction === 0) continue;
        const target = clamp(offset[axis] + correction, min[axis], max[axis]);
        let next = offset[axis] + (target - offset[axis]) * blend;
        if (Math.abs(target - next) < CAMERA_FOLLOW.settlePx) next = target;
        offset[axis] = clamp(next, min[axis], max[axis]);
      }
      sync();
    },
    getOffset: () => ({ ...offset }),
    worldToScreen: (point) => ({ x: point.x - offset.x, y: height - point.y + offset.y }),
    screenToWorld: (point) => ({ x: point.x + offset.x, y: height - point.y + offset.y }),
    attachLayer(layer) { layer.view = view; return layer; },
  };
  return api;
}
