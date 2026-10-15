import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerrainRendering } from '../../../runtime/systems/environment/terrain-renderer.js';

function render(placements) {
  const tiles = placements.map(tile => ({ valid: true, spritePosition: { x: 0, y: 0 },
    frameSize: [64, 64], frame: 0, animation: [], ...tile }));
  const atlases = new Map(tiles.map(tile => [tile.image, tile.image]));
  return createTerrainRendering(tiles, atlases, {
    createSprite2DLayer: (atlas, options) => ({ atlas, ...options, sprites: [] }),
    addSprite2D: (layer, options) => { const sprite = { layer, ...options }; layer.sprites.push(sprite); return sprite; },
  });
}

test('Underground water draws static fill, then foam, then ground regardless of image encounter order', () => {
  const { terrainLayers, animatedTerrain } = render([
    { image: 'foam', layerName: 'Underground', layerIndex: 0, animation: [{ tileid: 0, duration: 100 }], frameSize: [192, 192], displaySize: [172.8, 172.8] },
    { image: 'water', layerName: 'Underground', layerIndex: 0 },
    { image: 'ground', layerName: 'Background', layerIndex: 1 },
  ]);
  const order = image => terrainLayers.find(layer => layer.atlas === image).order;
  assert.ok(order('water') < order('foam'), 'Static water must be behind animated foam');
  assert.ok(order('foam') < order('ground'), 'All Underground artwork must be behind ground');
  assert.equal(animatedTerrain.length, 1);
  assert.deepEqual(animatedTerrain[0].sprite.sizePx, [172.8, 172.8], 'Apply display scale independently from atlas sampling');
});

test('Background covers Underground regardless of water animation or texture', () => {
  const { terrainLayers } = render([
    { image: 'foam', source: '../tilesets/Water.tsj', layerName: 'Underground', layerIndex: 0, animation: [{tileid: 0, duration: 100}] },
    { image: 'water', source: '../tilesets/Water.tsj', layerName: 'Background', layerIndex: 1 },
    { image: 'ground', layerName: 'Background', layerIndex: 1 },
  ]);
  const order = image => terrainLayers.find(layer => layer.atlas === image).order;
  assert.ok(order('foam') < order('water'));
  assert.ok(order('foam') < order('ground'));
});

test('authored layer order wins over Underground naming', () => {
  const { terrainLayers } = render([
    { image: 'ground', layerName: 'Background', layerIndex: 0 },
    { image: 'water', source: '../tilesets/Water.tsj', layerName: 'Underground', layerIndex: 1 },
  ]);
  assert.ok(terrainLayers[0].order < terrainLayers[1].order);
});

test('each authored layer reserves 1000 depths including gaps for empty layers', () => {
  const { terrainLayers } = render([
    { image: 'bottom', layerName: 'Custom bottom', layerIndex: 0 },
    { image: 'middle', layerName: 'Custom middle', layerIndex: 2 },
    { image: 'top', layerName: 'Custom top', layerIndex: 3 },
  ]);
  assert.equal(terrainLayers[1].order - terrainLayers[0].order, 2000);
  assert.equal(terrainLayers[2].order - terrainLayers[1].order, 1000);
  assert.ok(terrainLayers[2].order + 999 < 0, 'all reserved terrain depths remain behind gameplay');
});

test('a shared atlas does not merge different Tiled layers or reorder their artwork', () => {
  const { terrainLayers } = render([
    { image: 'shared', layerName: 'Underground', layerIndex: 0 },
    { image: 'other', layerName: 'Background', layerIndex: 1 },
    { image: 'shared', layerName: 'Midground', layerIndex: 2 },
  ]);
  const ordered = [...terrainLayers].sort((a, b) => a.order - b.order);
  assert.deepEqual(ordered.map(layer => layer.atlas), ['shared', 'other', 'shared']);
  assert.ok(ordered[0].order < ordered[1].order && ordered[1].order < ordered[2].order);
});
