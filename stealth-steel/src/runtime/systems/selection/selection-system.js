import { isCellInGrid } from "../environment/grid-contract.js";

export function createSelectionSystem(grid) {
  let selectedGridSpot = null;
  const isValid = (cell) => isCellInGrid(cell, grid);

  return {
    getSelectedGridSpot() {
      return selectedGridSpot ? { ...selectedGridSpot } : null;
    },
    toggleGridSpot(cell) {
      if (!isValid(cell)) return null;
      if (selectedGridSpot?.x === cell.x && selectedGridSpot?.y === cell.y) {
        selectedGridSpot = null;
      } else {
        selectedGridSpot = { x: cell.x, y: cell.y };
      }
      return selectedGridSpot ? { ...selectedGridSpot } : null;
    },
  };
}

export function gridSpotFromLogicalPoint(point, grid) {
  return gridSpotFromWorldPoint({ x: point.x, y: grid.heightPx - point.y }, grid);
}

export function gridSpotFromWorldPoint(point, grid) {
  const cell = {
    x: Math.floor(point.x / grid.tileSizePx),
    y: Math.floor(point.y / grid.tileSizePx),
  };
  return isCellInGrid(cell, grid) ? cell : null;
}
