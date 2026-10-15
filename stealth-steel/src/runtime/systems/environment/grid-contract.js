export const GRID = Object.freeze({
  tileSizePx: 64,
  columns: 9,
  rows: 16,
  widthPx: 576,
  heightPx: 1024,
});

export function isCellInGrid(cell, grid) {
  const x = grid.minColumn ?? 0, y = grid.minRow ?? 0;
  return !!cell && Number.isInteger(cell.x) && Number.isInteger(cell.y)
    && cell.x >= x && cell.x < x + grid.columns
    && cell.y >= y && cell.y < y + grid.rows;
}

if (
  GRID.columns * GRID.tileSizePx !== GRID.widthPx
  || GRID.rows * GRID.tileSizePx !== GRID.heightPx
) {
  throw new Error("The logical grid must cover the complete game screen.");
}
