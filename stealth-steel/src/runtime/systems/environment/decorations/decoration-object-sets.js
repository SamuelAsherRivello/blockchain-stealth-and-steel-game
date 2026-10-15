import { isCellInGrid } from "../grid-contract.js";

export const GrassDecorationsEnabled = false;

export const GRASS_SET = Object.freeze({
  name: "grass",
  images: Object.freeze(["10.png", "11.png"].map(name => `assets/images/terrain/decorations/grass/${name}`)),
  frameSize: Object.freeze([64, 64]),
  spawnRule: "walkable",
  spawnFrequency: 0.1,
  spawnOffset: Object.freeze({ x: 20, y: 20 }),
  angleOffset: 15,
  baseScale: 0.5,
  scaleOffset: 0.15,
});

export const cellKey = ({ x, y }) => `${x},${y}`;

export function validateDecorationSet(set) {
  const fail = field => { throw new TypeError(`Decoration set ${set?.name ?? "<unnamed>"}: invalid ${field}`); };
  if (!set?.name) fail("name");
  if (!Array.isArray(set.images) || !set.images.length || set.images.some(image => typeof image !== "string" || !image)) fail("images");
  if (set.spawnRule !== "walkable") fail("spawnRule");
  if (!Number.isFinite(set.spawnFrequency) || set.spawnFrequency < 0 || set.spawnFrequency > 1) fail("spawnFrequency");
  for (const axis of ["x", "y"]) if (!Number.isFinite(set.spawnOffset?.[axis]) || set.spawnOffset[axis] < 0) fail(`spawnOffset.${axis}`);
  if (!Number.isFinite(set.angleOffset) || set.angleOffset < 0) fail("angleOffset");
  if (!Number.isFinite(set.baseScale) || set.baseScale <= 0) fail("baseScale");
  if (!Number.isFinite(set.scaleOffset) || set.scaleOffset < 0 || set.scaleOffset >= 1) fail("scaleOffset");
  if (!Array.isArray(set.frameSize) || set.frameSize.length !== 2 || set.frameSize.some(size => !Number.isFinite(size) || size <= 0)) fail("frameSize");
  return set;
}

/** The caller supplies terrain walkability, independently of actor perception. */
export function planDecorationSet({ set, grid, groundCells, occupiedCells = [], isWalkable, random = Math.random, enabled = true }) {
  validateDecorationSet(set);
  if (!enabled) return [];
  const occupied = new Set(occupiedCells.map(cellKey));
  const seen = new Set();
  const placements = [];
  const sample = bound => bound === 0 ? 0 : (random() * 2 - 1) * bound;
  for (const cell of groundCells) {
    const key = cellKey(cell);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!isCellInGrid(cell, grid) || occupied.has(key) || !isWalkable(cell) || set.spawnFrequency === 0) continue;
    if (set.spawnFrequency < 1 && random() >= set.spawnFrequency) continue;
    placements.push({
      id: `${set.name}:${key}`, set: set.name, cell: { ...cell },
      image: set.images[Math.floor(random() * set.images.length)],
      frameSize: [...set.frameSize],
      position: { x: (cell.x + 0.5) * grid.tileSizePx + sample(set.spawnOffset.x),
        y: (cell.y + 0.5) * grid.tileSizePx + sample(set.spawnOffset.y) },
      rotation: sample(set.angleOffset) * Math.PI / 180,
      scale: set.baseScale * (1 + sample(set.scaleOffset)),
    });
  }
  return placements;
}

/** Water and background effects do not supply walkable support. */
export function collectDecorationGroundCells(terrainTiles) {
  return terrainTiles.filter(tile => tile.valid && /(?:Tilemap_|Bridge\.tsj)/i.test(tile.source ?? ""))
    .map(tile => tile.gameCell);
}
