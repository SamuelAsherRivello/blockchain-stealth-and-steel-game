// These atlas families share the same layout. Tops/stairs are not cliff faces.
const COLOR_CLIFF_FRAMES = new Set([36, 39, 41, 42, 43, 44, 45, 48, 50, 51, 52, 53]);
const ELEVATION_SIDE_FRAMES = new Set([12, 13, 14, 15, 20, 21, 22, 23]);

export function terrainBlocksVision(tile) {
  if (tile.blocked || tile.blocksVision === true) return true;
  const source = tile.source?.split(/[\\/]/).pop();
  if (/^Tilemap_color[1-5]\.tsj$/.test(source ?? '')) return COLOR_CLIFF_FRAMES.has(tile.frame);
  return source === 'Tilemap_Elevation.tsj' && ELEVATION_SIDE_FRAMES.has(tile.frame);
}

// Use logical tile ownership, not collider x/y: polygons have only points,
// and even a thin edge occludes its entire tile under the game's sight rules.
export function createTerrainVision(terrainTiles) {
  const blocked = new Set(terrainTiles.filter(terrainBlocksVision)
    .map(({ gameCell }) => `${gameCell.x},${gameCell.y}`));
  return (cell) => !blocked.has(`${cell.x},${cell.y}`);
}
