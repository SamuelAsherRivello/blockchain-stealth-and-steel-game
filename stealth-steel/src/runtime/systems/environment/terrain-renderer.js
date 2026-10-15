import { addSprite2D, createSprite2DLayer } from '@babylonjs/lite';
import { TILED_LAYER_DEPTH_STEP } from './render-depth.js';

export function createTerrainRendering(tiles, atlases, api = { addSprite2D, createSprite2DLayer }, layerCount = Math.max(-1, ...tiles.map(tile => tile.layerIndex)) + 1) {
  const groups = new Map();
  for (const tile of tiles) {
    if (!tile.valid) continue;
    // Keep authored layers separate even when they share a texture atlas.
    const key = JSON.stringify([tile.layerIndex, tile.layerName, tile.image, !!tile.animation.length]);
    if (!groups.has(key)) groups.set(key, { tile, tiles: [] });
    groups.get(key).tiles.push(tile);
  }
  const terrainLayers = [];
  const animatedTerrain = [];
  for (const group of groups.values()) {
    const { tile: first } = group;
    // Tiled stores layers bottom-to-top. Reserve a full band even for empty layers.
    // Negative terrain depths keep all bands behind gameplay, regardless of layer count.
    const baseOrder = (first.layerIndex - layerCount) * TILED_LAYER_DEPTH_STEP;
    const layer = api.createSprite2DLayer(atlases.get(first.image), {
      capacity: group.tiles.length,
      // Animation may overlay fill within its own authored layer, never the next layer.
      order: baseOrder + (first.animation.length ? 1 : 0),
      pivot: [0, 0],
    });
    terrainLayers.push(layer);
    for (const tile of group.tiles) {
      const sprite = api.addSprite2D(layer, {
        positionPx: [tile.spritePosition.x, tile.spritePosition.y],
        sizePx: tile.displaySize ?? tile.frameSize,
        frame: tile.frame,
        flipX: tile.flipX === true,
      });
      if (tile.animation.length) animatedTerrain.push({ sprite, frames: tile.animation, elapsed: 0, tile });
    }
  }
  return { terrainLayers, animatedTerrain };
}
