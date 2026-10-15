import { addSprite2D, createSprite2DLayer, removeSprite2D } from "@babylonjs/lite";
import { TILE_MAP_SUB_Z } from "../render-depth.js";
import { GridSpot } from "../grid-spot.js";

const DEFAULT_API = { addSprite2D, createSprite2DLayer, removeSprite2D };

export function createDecorationObjects({ placements, atlases, screenHeight, tileSize, api = DEFAULT_API }) {
  const layers = [];
  const sprites = [];
  const instances = [];
  for (const [image, atlas] of atlases) {
    const selected = placements.filter(placement => placement.image === image);
    if (!selected.length) continue;
    const layer = api.createSprite2DLayer(atlas, { capacity: selected.length,
      order: TILE_MAP_SUB_Z.groundDecorations, pivot: [0.5, 1] });
    layers.push(layer);
    for (const placement of selected) {
      const sizePx = placement.frameSize.map(size => size * placement.scale);
      // Keep the unrotated PNG center on the sampled position, then rotate
      // around its bottom center rather than around that center position.
      sprites.push(api.addSprite2D(layer, { positionPx: [placement.position.x, screenHeight - placement.position.y + sizePx[1] / 2],
        sizePx, frame: 0, rotation: placement.rotation }));
      instances.push({ ...placement, gridSpot: new GridSpot({ x: (placement.cell.x + 0.5) * tileSize,
        y: (placement.cell.y + 0.5) * tileSize }, { width: tileSize, height: tileSize }) });
    }
  }
  return { layers, instances, dispose() { for (const sprite of sprites.splice(0)) api.removeSprite2D(sprite); instances.length = 0; } };
}
