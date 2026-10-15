import { createEngine, createSpriteRenderer, registerSpriteRenderer, startEngine, createSpriteAnimationManager, updateSpriteAnimationManager } from '@babylonjs/lite';
import { createPlayer, loadPlayerAtlases } from '../../runtime/characters/player/player.js';
import { normalizeTiledMap, collectTiledLayerTiles, createLevelTerrainTiles } from '../../../plugins/tiled-babylon-lite/index.js';
import { collidersOverlap } from '../../runtime/gameplay/game-logic.js';

const mapUrl = new URL('/assets/levels/tiled/maps/Level01.tmj', location.href);
const map = await (await fetch(mapUrl)).json();
const tilesets = new Map(await Promise.all(map.tilesets.map(async ({source}) => [source, await (await fetch(new URL(source, mapUrl))).json()])));
const level = normalizeTiledMap(map, tilesets);
const obstacles = createLevelTerrainTiles(collectTiledLayerTiles(level), 64, 832, new Set()).flatMap(tile => tile.colliders);
const engine = await createEngine(document.querySelector('#game'), { maxDevicePixelRatio: 1 });
engine._w = 512; engine._h = 832;
const player = createPlayer({ atlases: await loadPlayerAtlases(engine), bounds: { width: 512, height: 832 }, obstacles, initialPosition: { x: 225, y: 660 } });
const manager = createSpriteAnimationManager();
player.playAnimation(manager);
registerSpriteRenderer(createSpriteRenderer(engine, { layers: player.layers, clearValue: { r: .1, g: .2, b: .13, a: 1 } }));
await startEngine(engine);
const ctx = document.querySelector('#terrain').getContext('2d');
const result = document.querySelector('#result'), button = document.querySelector('#run');
let running = false, elapsed = 0, previous = performance.now(), overlap = false;
button.disabled = false;
result.textContent = 'Ready at point 1: X 225, Y 660';
button.onclick = () => {
  player.resetInput(); player.setPosition({ x: 225, y: 660 }); elapsed = 0; overlap = false; running = true;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft' }));
};
function frame(now) {
  const dt = Math.min(.04, (now - previous) / 1000); previous = now;
  player.update(dt); updateSpriteAnimationManager(manager, dt * 1000);
  const circle = player.getMovementCollider();
  if (running) {
    elapsed += dt; overlap ||= obstacles.some(obstacle => collidersOverlap(circle, obstacle));
    result.textContent = `Holding only left: X ${circle.x.toFixed(1)}, Y ${circle.y.toFixed(1)}`;
    if (elapsed >= 2) {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft', key: 'ArrowLeft' })); running = false;
      result.textContent = `${circle.x < 110 && circle.y > 726 && !overlap ? 'PASS' : 'FAIL'}: held only left; X ${circle.x.toFixed(1)}, Y ${circle.y.toFixed(1)}; terrain overlap: ${overlap}`;
    }
  }
  ctx.clearRect(0, 0, 512, 832); ctx.strokeStyle = '#e7b86b';
  for (const obstacle of obstacles) {
    ctx.beginPath();
    if (obstacle.points) { obstacle.points.forEach((p, i) => i ? ctx.lineTo(p.x, 832 - p.y) : ctx.moveTo(p.x, 832 - p.y)); ctx.closePath(); }
    else ctx.rect(obstacle.x, 832 - obstacle.y - obstacle.height, obstacle.width, obstacle.height);
    ctx.stroke();
  }
  ctx.strokeStyle = '#63f58b'; ctx.beginPath(); ctx.arc(circle.x, 832 - circle.y, circle.radius, 0, Math.PI * 2); ctx.stroke();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
