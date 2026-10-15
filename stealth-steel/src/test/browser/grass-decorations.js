import { createEngine, loadSpriteAtlas, createSpriteRenderer, registerSpriteRenderer, startEngine,
  addSpriteRendererLayer, removeSpriteRendererLayer } from "@babylonjs/lite";
import { GRASS_SET, planDecorationSet } from "../../runtime/systems/environment/decorations/decoration-object-sets.js";
import { createDecorationObjects } from "../../runtime/systems/environment/decorations/decoration-objects.js";
import { createLevelCamera } from "../../runtime/gameplay/level-camera.js";

const canvas = document.querySelector("canvas"), result = document.querySelector("#result");
try {
  const engine = await createEngine(canvas);
  const grid = { tileSizePx: 64, columns: 9, rows: 32, minColumn: 0, minRow: 0 };
  const camera = createLevelCamera({ mode: "follow-player", bounds: { x: 0, y: 0, width: 576, height: 2048 } });
  const atlases = new Map(await Promise.all(GRASS_SET.images.map(async image => [image,
    await loadSpriteAtlas(engine, `/${image}`, { gridSize: GRASS_SET.frameSize, sampling: "nearest" })])));
  const groundCells = Array.from({ length: 288 }, (_, i) => ({ x: i % 9, y: Math.floor(i / 9) }));
  const occupiedCells = [{ x: 4, y: 4 }, { x: 4, y: 20 }];
  let counter = 0;
  const placements = planDecorationSet({ set: { ...GRASS_SET, spawnFrequency: 1, spawnOffset: { x: 0, y: 0 }, angleOffset: 0 }, grid, groundCells, occupiedCells,
    isWalkable: () => true, random: () => ((counter++ * 37) % 100) / 100 });
  const build = () => createDecorationObjects({ placements, atlases, screenHeight: 1024, tileSize: 64 });
  let grass = build(), top = false, rebuilds = 0;
  const renderer = createSpriteRenderer(engine, { layers: grass.layers.map(layer => camera.attachLayer(layer)),
    clearValue: { r: .25, g: .42, b: .16, a: 1 } });
  registerSpriteRenderer(renderer);
  await startEngine(engine);
  const report = () => {
    const valid = grass.instances.length === 286 && new Set(grass.instances.map(p => p.id)).size === 286
      && grass.layers.every(layer => layer.view === camera.view)
      && grass.instances.every(p => p.position.x === (p.cell.x + .5) * 64 && p.position.y === (p.cell.y + .5) * 64);
    result.textContent = `${valid ? "PASS" : "FAIL"}: ${grass.instances.length} unique centered sprites; 2 reserved tiles empty.\nCamera Y: ${camera.getOffset().y}; rebuilds: ${rebuilds}; variants: ${grass.layers.length}`;
  };
  camera.initialize({ x: 288, y: 512 }); report();
  document.querySelector("#scroll").onclick = () => { top = !top; camera.initialize({ x: 288, y: top ? 1536 : 512 }); report(); };
  document.querySelector("#restart").onclick = () => {
    for (const layer of grass.layers) removeSpriteRendererLayer(renderer, layer);
    grass.dispose(); grass = build();
    for (const layer of grass.layers) addSpriteRendererLayer(renderer, camera.attachLayer(layer));
    rebuilds++; report();
  };
} catch (error) { result.textContent = `FAIL: ${error.message}`; }
