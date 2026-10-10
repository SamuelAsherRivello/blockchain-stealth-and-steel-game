import { resolvePlayerKnifeImpact } from "./gameplay/player-melee.js";
import { createStealthAttackController, createStealthAttackShadowLifecycle } from "./gameplay/stealth-attack.js";
import { enemyAiLabel, drawEnemyAiLabels } from "./ai/enemy-ai-labels.js";
import { snapshotPatrolPeers } from "./ai/patrol-selection.js";
import { createEnemyBrain } from "./ai/enemy-brain.js";
import { createPlanningScheduler } from "./ai/planning-scheduler.js";
import { goblinProfile } from "./characters/enemies/goblin/goblin-goap.js";
import { warriorProfile } from "./characters/enemies/warrior/warrior-goap.js";
import { lancerProfile } from "./characters/enemies/lancer/lancer-goap.js";
import { archerProfile } from "./characters/enemies/archer/archer-goap.js";
import { monkProfile } from "./characters/enemies/monk/monk-goap.js";
import { resolveEnemyArrowPlayerHit, resolveMeleeImpacts } from "./gameplay/player-damage.js";
import { createCombatActorState } from "./gameplay/combat-actor.js";
import { getColliderCenter } from "./characters/character-spatial.js";
import { GridSpot, getQuantizedGridCell } from "./systems/environment/grid-spot.js";
import { GrassDecorationsEnabled, GRASS_SET, planDecorationSet, collectDecorationGroundCells } from "./systems/environment/decorations/decoration-object-sets.js";
import { createDecorationObjects } from "./systems/environment/decorations/decoration-objects.js";
import { createPickupSfxStreak, playSfx, playPerceptionSfx } from "./audio/sfx.js";
import { setGameplayMusicActive } from "./audio/menu-music.js";
import { createStealthAttackShadowLayer } from "./ui/stealth-attack-shadow.js";
import {
  addSpriteRendererLayer,
  addSprite2D,
  createEngine,
  createSprite2DLayer,
  createSpriteAnimationManager,
  createSpriteRenderer,
  disposeEngine,
  disposeSpriteRenderer,
  loadSpriteAtlas,
  removeSprite2D,
  setSprite2DFrame,
  updateSprite2D,
  registerSpriteRenderer,
  removeSpriteRendererLayer,
  startEngine,
  updateSpriteAnimationManager,
} from "@babylonjs/lite";

import { collidersOverlap, getOtherCharacterGridOccupancyColliders, getOtherCharacterColliders, separateOverlappingCharacterColliders } from "./gameplay/game-logic.js";
import { createGameStateMachine, GameState } from "./gameplay/game-state.js";
import { gridCellToWorldCenter } from "./gameplay/world-viewport.js";
import { GAME_VIEWPORT, formatViewportDiagnostics, logicalPointFromClient, measureGameViewport } from "./gameplay/game-viewport.js";
import {
  collectTiledLayerTiles,
  formatLevelCellLabel,
  loadTiledMap,
} from "../../plugins/tiled-babylon-lite/index.js";
import { GRID, isCellInGrid } from "./systems/environment/grid-contract.js";
import { createLevelCamera, getLevelWorld } from "./gameplay/level-camera.js";
import { getCharacterGridCell, getCharacterLayerOrder } from "./characters/character-spatial.js";
import { getYSortedLayerOrder } from "./systems/environment/render-depth.js";
import { createLevelTerrainTiles } from "../../plugins/tiled-babylon-lite/index.js";
import { getColumnAnimationOffset } from "../../plugins/tiled-babylon-lite/terrain-runtime.js";
import { createTerrainRendering } from "./systems/environment/terrain-renderer.js";
import {
  PLAYER_FRAME,
  PLAYER_MOVEMENT_COLLIDER,
  PLAYER_PIVOT,
  createPlayer,
  loadPlayerAtlases,
} from "./characters/player/player.js";
import {
  GOBLIN_FRAME,
  GOBLIN_MOVEMENT_COLLIDER,
  GOBLIN_PIVOT,
  createGoblin,
  loadGoblinAtlases,
} from "./characters/enemies/goblin/goblin.js";
import { createCharacterLockupWatchdog } from "./gameplay/character-lockup-watchdog.js";
import { ARCHER_FRAME, ARCHER_MOVEMENT_COLLIDER, ARCHER_PIVOT, createArcher, loadArcherAtlases } from "./characters/enemies/archer/archer.js";
import { createGridWalkability } from "./characters/npc/sheep/sheep-navigation.js";
import {
  WARRIOR_FRAME,
  WARRIOR_MOVEMENT_COLLIDER,
  WARRIOR_PIVOT,
  createWarrior,
  loadWarriorAtlases,
} from "./characters/enemies/warrior/warrior.js";
import {
  createWarriorDemoController,
} from "./characters/enemies/warrior/warrior-demo-controller.js";
import { LANCER_FRAME, LANCER_MOVEMENT_COLLIDER, LANCER_PIVOT, createLancer, loadLancerAtlases } from "./characters/enemies/lancer/lancer.js";
import {
  MONK_FRAME, MONK_MOVEMENT_COLLIDER, MONK_PIVOT, createMonk, loadMonkAtlases,
} from "./characters/enemies/monk/monk.js";
import {
  SHEEP_FRAME_SIZE,
  SHEEP_MOVEMENT_COLLIDER,
  SHEEP_PIVOT,
  createSheep,
  loadSheepAtlases,
} from "./characters/npc/sheep/sheep.js";
import { CharacterType } from "./characters/npc/sheep/sheep-state.js";
import { createSheepContactCoordinator } from "./characters/npc/sheep/sheep-flock.js";
import { createCharacterPerception, PerceptionTargetState } from "./systems/perception/character-perception.js";
import { createTerrainVision } from "./systems/perception/terrain-vision.js";
import { getEnemyExpression } from "./systems/perception/enemy-expression.js";
import { getPlayerHidingBush, isPlayerHidden, stepHiddenOpacity, canEnemyTargetPlayer, getOccupiedBushBlockers } from "./systems/perception/player-hidden.js";
import {
  createProjectileRenderer,
  loadArrowAtlas,
} from "./systems/objects/projectile-renderer.js";
import { resolveProjectileHit } from "./systems/objects/projectile-combat.js";
import { createPauseController } from "./ui/pause-controller.js";
import { createStartGamePrompt, shouldShowStartGamePrompt, shouldSkipIntro } from "./ui/start-game-prompt.js";
import { Dust02ParticleEffect, Fire03ParticleEffect } from "./particle-fx/index.js";
import { loadEditorConfig } from "./editor-config/editor-config.js";
import { createCoordinatesUi } from "./ui/coordinates-ui.js";
import { createReleaseMetadataUi } from "./ui/release-metadata-ui.js";
import { createGoldCounterUi } from "./ui/gold-counter-ui.js";
import { createLevelCounterUi } from "./ui/level-counter-ui.js";
import { createItemsHudUi } from "./ui/items-hud-ui.js";
import { createItemsUi } from "./ui/items-ui.js";
import { loadStatusBadgeArt } from "./ui/status-badge.js";
import { createCharacterOverhead, drawCharacterOverheads } from "./ui/character-overhead.js";
import { createBisAccount } from "./integration/bis-account.js";
import { createBisGame } from "./integration/bis-host-game.js";
import { createPayToContinue } from "./integration/pay-to-continue.js";
import { createLevelReward } from "./integration/level-reward.js";
import { createLevelProgress } from "./gameplay/level-progress.js";
import { createGameRunController } from "./gameplay/game-run-controller.js";
import { revivePaidPlayer } from "./gameplay/paid-revival.js";
import "./integration/bis-account.css";
import { createSettingsUi } from "./ui/settings-ui.js";
import { createRunPresentation } from "./ui/run-presentation.js";
import { createFullscreenTransition } from "./ui/fullscreen-transition.js";
import { createEquipmentSnapshot, EMPTY_EQUIPMENT_SNAPSHOT } from "./gameplay/equipment-effects.js";
import { createBisGameRewardFeedback } from "./integration/bis-game-reward-feedback.js";
import { createLevelCompleteUi, createLevelLostUi } from "./ui/level-complete-ui.js";
import {createTreasureRuntime} from './integration/treasure-runtime.js';
import {createTreasureUi} from './ui/treasure-ui.js';
import {createTreasureChest} from './systems/objects/treasure-chest.js';
import {createTreasureReveal} from './systems/objects/treasure-reveal.js';
import {createObjectSpawner} from './systems/objects/object-spawner.js';
import { createGoal } from "./systems/goals/goal.js";
import { createGoalExit } from "./systems/goals/goal-exit.js";
import { createViewportSafeArea } from "./ui/viewport-safe-area.js";
import {
  RUNTIME_DEBUG_SETTING_KEYS,
  runtimeSettingsStore,
  MAP_ORDER_SETTING_KEY,
} from "./runtime-settings/runtime-settings-store.js";
import {
  GAME_DEPTH,
  TILE_MAP_SUB_Z,
} from "./systems/environment/render-depth.js";
import { createSpawner } from "./systems/spawners/spawner.js";
import { createGoldStone } from "./systems/objects/gold-stone.js";
import { chooseNineGridDestinations, createGoldPickup } from "./systems/objects/gold-pickup.js";
import { createPickupSystem } from "./systems/objects/pickup-system.js";
import {
  SpawnerCharacter,
  SpawnerType,
  createInitialSpawnerConfigs,
} from "./systems/spawners/spawner-catalog.js";
import { createSpawnerMarker } from "./systems/spawners/spawner-marker.js";
import { createSelectionSystem, gridSpotFromWorldPoint } from "./systems/selection/selection-system.js";
import {
  createReactiveDecoration,
  getCenteredEffectPosition,
} from "./systems/environment/decorations/reactive-decoration.js";
import {
  createCharacterCenterDrawCommands,
  createPlayerCenterMarkerCommands,
  createGridSpotMarkerCommands,
  drawGridSpotMarker,
  createCharacterColliderDrawCommands,
  createActivePerceptionMarkerCommands,
  drawPerceptionDiagnostics,
  createEnemyVisionShadowDrawCommands,
  createStealthAttackShadowDrawCommands,
  TERRAIN_COLLIDER_STYLE,
} from "./ui/collider-diagnostics.js";

const SCREEN_WIDTH = GAME_VIEWPORT.referenceResolution.width;
const SCREEN_HEIGHT = GAME_VIEWPORT.referenceResolution.height;
const TILE_SIZE = GAME_VIEWPORT.referenceGridSize.width;
const showFilesizeInHud = false;
const showMapLevelSelectorInSettings = false;
// Temporary work-mode guard while character separation is being completed.
const TEMPORARILY_FREEZE_ENEMY_AI = false;
// Diagnostic switch: when true, green movement colliders do not block each other.
const TEMPORARILY_DISABLE_GREEN_GREEN_COLLISIONS = false;
// Diagnostic switch: isolate the player/world loop from enemy updates.
const TEMPORARILY_DISABLE_ENEMY_UPDATES = false;
const PLAYER_HIDDEN_FADE_SECONDS = 0.2;
const ENEMY_EXPRESSION_FADE_SECONDS = 0.25;
const ENEMY_EXPRESSION_INSTANCE_FADE_SECONDS = ENEMY_EXPRESSION_FADE_SECONDS / 2;
const EMOTIONAL_JUMP_DURATION_SECONDS = 0.096;
const EMOTIONAL_JUMP_HEIGHT_PIXELS = 8;
const ENEMY_EXPRESSION_GRID_OFFSET = TILE_SIZE;
// Measured from the combo placement guide: point 1 to point 2.
const DAGGER_COMBO_CLOUD_SCREEN_OFFSET = Object.freeze([10, 64]);
const EMPTY_TERRAIN_FRAMES = new Set([
  4, 13, 22, 31, 37, 38, 40, 46, 47, 49,
]);

const canvas = document.querySelector("#renderCanvas");
const debugCanvas = document.querySelector("#debugCanvas");
const debugContext = debugCanvas.getContext("2d");
const baselineDevicePixelRatio = window.devicePixelRatio || 1;
function refreshBrowserZoomCompensation() {
  const zoomFactor = (window.devicePixelRatio || baselineDevicePixelRatio) / baselineDevicePixelRatio;
  document.documentElement.style.setProperty("--browser-zoom-factor", String(Math.max(0.5, zoomFactor)));
}
refreshBrowserZoomCompensation();
window.addEventListener("resize", refreshBrowserZoomCompensation);
if (import.meta.env.DEV) document.documentElement.dataset.gameDocumentSession = crypto.randomUUID();
const statusBadgeArt = loadStatusBadgeArt();
const errorOutput = document.querySelector("#error");
  const gameUi = document.querySelector("#gameUi");
  const domBody = document.querySelector("#dom-body");
  const domScreen = document.querySelector(".dom-screen");
  const updatePromptBodyCenter = () => {
    const bodyBounds = domBody.getBoundingClientRect();
    const offset = bodyBounds.top + bodyBounds.height / 2 - window.innerHeight / 2;
    domBody.style.setProperty("--prompt-body-center-offset-y", `${offset}px`);
  };
  const promptBodyResizeObserver = new ResizeObserver(updatePromptBodyCenter);
  promptBodyResizeObserver.observe(domBody);
  updatePromptBodyCenter();
const uiLayer = document.querySelector("#uiLayer");
const gameFrame = document.querySelector(".game-frame");
const viewportSafeArea = createViewportSafeArea({ element: uiLayer, frameElement: gameFrame });
const coordinatesUi = createCoordinatesUi();
const runPresentation = createRunPresentation({
  virtualController: document.querySelector(".virtual-controller"),
});
const fullscreenTransition = createFullscreenTransition({
  overlay: document.querySelector("#fullscreen-transition"),
  circle: document.querySelector("#fullscreen-transition-circle"),
  blackout: document.querySelector("#fullscreen-transition-blackout"),
  target: gameFrame,
});

let latestGameViewport = null;

function refreshGameViewportDiagnostics() {
  latestGameViewport = measureGameViewport(GAME_VIEWPORT);
  canvas.dataset.viewport = formatViewportDiagnostics(latestGameViewport);
  debugCanvas.dataset.viewport = formatViewportDiagnostics(latestGameViewport);
  if (GAME_VIEWPORT.qaDiagnostics) {
  }
  return latestGameViewport;
}

const viewportResizeObserver = new ResizeObserver(refreshGameViewportDiagnostics);
viewportResizeObserver.observe(gameFrame);
window.addEventListener("resize", refreshGameViewportDiagnostics);
window.addEventListener("resize", fullscreenTransition.resize);

let gameRunController = null;

window.addEventListener("pagehide", () => {
  gameRunController?.dispose();
  viewportSafeArea.dispose();
  viewportResizeObserver.disconnect();
  promptBodyResizeObserver.disconnect();
  window.removeEventListener("resize", refreshGameViewportDiagnostics);
  window.removeEventListener("resize", fullscreenTransition.resize);
  window.removeEventListener("resize", refreshBrowserZoomCompensation);
  fullscreenTransition.dispose();
}, { once: true });

function getGameRunController(options) {
  if (!gameRunController) {
    gameRunController = createGameRunController({
      createRun: (run) => createGameRun({ ...options, initialRun: run }),
      transition: fullscreenTransition,
    });
  }
  return gameRunController;
}

function restartWithFullscreenTransition(run, pauseController) {
  return gameRunController?.restart(run, pauseController) ?? Promise.resolve(null);
}


function setCharacterSpawnProgress(actor, size, progress) {
  actor.setVisualTransform({
    sizePx: [size * Math.max(progress, 0.001), size * Math.max(progress, 0.001)],
  });
  for (const layer of actor.layers) {
    layer.opacity = progress;
  }
}

function makeTouchKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function makeDirection(from, to) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const distance = Math.hypot(deltaX, deltaY) || 1;
  return {
    x: deltaX / distance,
    y: deltaY / distance,
  };
}

export async function start(options = {}) {
  return getGameRunController(options).start(options.initialRun);
}

async function createGameRun({ showStartPrompt = true, initialRun } = {}) {
  let disposed = false, bisSessionActive=true;
  const progress = createLevelProgress(
    __GAME_LEVELS__,
    {getItem:key=>window.sessionStorage.getItem(key),setItem:(key,value)=>window.sessionStorage.setItem(key,value)},
    () => { bisSessionActive=false;window.location.reload(); },
    () => runtimeSettingsStore.get(MAP_ORDER_SETTING_KEY),
    { initialRun,
      onAdvance: run => { if (!disposed) {bisSessionActive=false;restartWithFullscreenTransition(run, pauseController);} },
      onRestart: run => { if (!disposed) {bisSessionActive=false;restartWithFullscreenTransition(run, pauseController);} } },
  );
  if (!navigator.gpu) {
    throw new Error("This Babylon Lite demo requires a browser with WebGPU enabled.");
  }

  const engine = await createEngine(canvas, {
    maxDevicePixelRatio: 1,
  });
  // Babylon Lite's automatic surface observer otherwise replaces the logical
  // render size with the CSS size on every engine frame. Keep the render
  // surface fixed; CSS scales the complete canvas as the viewport root.
  engine._w = GAME_VIEWPORT.referenceResolution.width;
  engine._h = GAME_VIEWPORT.referenceResolution.height;
  refreshGameViewportDiagnostics();
  const animationManager = createSpriteAnimationManager();
  const level = await loadTiledMap(`${import.meta.env.BASE_URL}assets/levels/tiled/maps/${progress.file}`);
  canvas.dataset.levelFile = progress.file;
  const world = getLevelWorld(level);
  const worldBounds = world.bounds;
  const worldGrid = world.grid;
  const camera = createLevelCamera(world);
  const selectionSystem = createSelectionSystem(worldGrid);
  const terrainImages = new Set(collectTiledLayerTiles(level).map(({ image }) => image));
  const [
    terrainAtlasEntries,
    archerAtlas,
    archerEnemyAtlases,
    arrowAtlas,
    visionShadowAtlas,
    sheepAtlases,
    goblinAtlases,
    warriorAtlases,
    lancerAtlases,
    monkAtlases,
    releaseMetadata,
  ] = await Promise.all([
    Promise.all([...terrainImages].map(async (image) => [
      image,
      await loadSpriteAtlas(engine, image, {
        gridSize: collectTiledLayerTiles(level).find(tile => tile.image === image).frameSize,
        sampling: "nearest",
      }),
    ])),
    loadPlayerAtlases(engine),
    loadArcherAtlases(engine),
    loadArrowAtlas(engine),
    loadSpriteAtlas(engine, `${import.meta.env.BASE_URL}assets/images/terrain/tile-shadow.png`, {
      gridSize: [TILE_SIZE, TILE_SIZE],
      sampling: "nearest",
    }),
    loadSheepAtlases(engine),
    loadGoblinAtlases(engine),
    loadWarriorAtlases(engine),
    loadLancerAtlases(engine),
    loadMonkAtlases(engine),
    loadEditorConfig(import.meta.env.BASE_URL),
  ]);
  const terrainAtlasByImage = new Map(terrainAtlasEntries);

  const terrainTiles = createLevelTerrainTiles(
    collectTiledLayerTiles(level),
    TILE_SIZE,
    SCREEN_HEIGHT,
    EMPTY_TERRAIN_FRAMES,
  );
  const obstacleColliders = terrainTiles.flatMap(({ colliders }) => colliders);
  const terrainVision = createTerrainVision(terrainTiles);
  const decorationDescriptorsByImage = new Map(
    level.reactiveDecorations.map(({ decoration }) => [decoration.image, decoration]),
  );
  const decorationAtlasByImage = new Map(await Promise.all(
    [...decorationDescriptorsByImage].map(async ([image, descriptor]) => [
      image,
      await loadSpriteAtlas(engine, image, {
        gridSize: [descriptor.frameSize.width, descriptor.frameSize.height],
        sampling: "nearest",
      }),
    ]),
  ));
  const goldStoneImages = new Set(level.goldStones.flatMap(({ goldStone }) => goldStone.variantImages ?? [goldStone.image]));
  const goldPickupImages = [
    `${import.meta.env.BASE_URL}assets/images/terrain/resources/gold/gold-pickup-1.png`,
    `${import.meta.env.BASE_URL}assets/images/terrain/resources/gold/gold-pickup-2.png`,
  ];
  const goldStoneAtlases = new Map(await Promise.all([...goldStoneImages].map(async (image) => [image, await loadSpriteAtlas(engine, image, { gridSize: [128, 128], sampling: "nearest" })])));
  const goldPickupAtlases = new Map(await Promise.all(goldPickupImages.map(async (image) => [image, await loadSpriteAtlas(engine, image, { gridSize: [64, 64], sampling: "nearest" })])));
  let goldCounter;
  const pickupSfx = createPickupSfxStreak();
  const pickupSystem = createPickupSystem({ onCollect: () => { goldCounter?.increment(); pickupSfx.play(); } });
  const goldPickupDefinition = {
    create: ({ position, index }) => {
      const image = goldPickupImages[Math.floor(Math.random() * goldPickupImages.length)];
      const pickup = createGoldPickup({ object: { id: `gold-${index}` }, atlas: goldPickupAtlases.get(image), startPosition: position.start, destination: position.destination, screenHeight: SCREEN_HEIGHT, depthBounds: worldBounds });
      pickup.destination = position.cell;
      return pickup;
    },
  };
  for (const spawner of level.goldPickupSpawners ?? []) {
    const position = gridCellToWorldCenter(spawner.gameCell, TILE_SIZE);
    const pickup = pickupSystem.spawn(goldPickupDefinition, { start: position, cell: spawner.gameCell, destination: position });
    pickup?.update(0.35);
  }
  const goldStoneObjects = level.goldStones.map((object) => {
    const image = object.goldStone.variantImages[Math.floor(Math.random() * object.goldStone.variantImages.length)];
    return createGoldStone({ object: { ...object, goldStone: { ...object.goldStone, image } }, atlas: goldStoneAtlases.get(image), animationManager, screenHeight: SCREEN_HEIGHT, depthBounds: worldBounds, onDeathComplete: (position) => {
      const origin = getQuantizedGridCell(position, { width: TILE_SIZE, height: TILE_SIZE });
      const destinations = chooseNineGridDestinations(origin, Math.random() < 0.5 ? 2 : 3, (cell) => isCellInGrid(cell, worldGrid) && !pickupSystem.pickups.some((pickup) => pickup.destination?.x === cell.x && pickup.destination?.y === cell.y));
      for (const cell of destinations) {
        pickupSystem.spawn(goldPickupDefinition, { start: position, cell, destination: { x: (cell.x + 0.5) * TILE_SIZE, y: (cell.y + 0.5) * TILE_SIZE } });
      }
    } });
  });
  const bushFireEffects = await Promise.all(level.reactiveDecorations.map((object) => (
    Fire03ParticleEffect.create({
      engine,
      animationManager,
      position: getCenteredEffectPosition({
        position: object.position,
        frameSize: object.decoration.frameSize,
        effectSize: {
          width: Fire03ParticleEffect.descriptor.displaySize[0],
          height: Fire03ParticleEffect.descriptor.displaySize[1],
        },
        screenHeight: SCREEN_HEIGHT,
      }),
      order: GAME_DEPTH.effects,
      visible: false,
    })
  )));
  const daggerComboEffects = await Promise.all(Array.from({ length: 4 }, () => (
    Dust02ParticleEffect.create({
      engine,
      animationManager,
      position: [-64, -64],
      // Combo clouds must remain behind the player, even at the top of the map.
      order: GAME_DEPTH.npcs - 1,
      visible: false,
    })
  )));
  let nextDaggerComboEffect = 0;
  function playDaggerComboEffect(position, multiplier, facing = 1) {
    if (multiplier <= 1) return;
    const sizeScale = multiplier >= 3 ? 0.6 : 0.5;
    const size = Dust02ParticleEffect.descriptor.displaySize[0] * sizeScale;
    const effect = daggerComboEffects[nextDaggerComboEffect++ % daggerComboEffects.length];
    const spawnPositionPx = getCenteredEffectPosition({
        position: {
          x: position.x + facing * TILE_SIZE * 0.5,
          y: position.y - TILE_SIZE * 0.5,
        },
        frameSize: PLAYER_FRAME,
        effectSize: { width: size, height: size },
        screenHeight: SCREEN_HEIGHT,
      });
    updateSprite2D(effect.sprite, {
      positionPx: [
        spawnPositionPx[0] + DAGGER_COMBO_CLOUD_SCREEN_OFFSET[0],
        spawnPositionPx[1] + DAGGER_COMBO_CLOUD_SCREEN_OFFSET[1],
      ],
      sizePx: [size, size],
      color: multiplier >= 3 ? [1.35, 1.12, 0.45, 1] : [0.7, 1.15, 1.5, 1],
    });
    effect.layer.visible = true;
    effect.playOnce(() => { effect.layer.visible = false; });
  }
  const bushLeafAtlas = await loadSpriteAtlas(engine, `${import.meta.env.BASE_URL}assets/images/particles/bush-particle.png`, {
    gridSize: [16, 14], sampling: "nearest",
  });
  const reactiveDecorations = level.reactiveDecorations.map((object, index) => (
    createReactiveDecoration({
      object,
      atlas: decorationAtlasByImage.get(object.decoration.image),
      animationManager,
      screenHeight: SCREEN_HEIGHT,
      tileSize: TILE_SIZE,
      depthBounds: worldBounds,
      fireEffect: bushFireEffects[index],
      leafAtlas: bushLeafAtlas,
      onCharacterEnter: (character) => {
        if (character.type === CharacterType.PLAYER) playSfx("bush");
      },
    })
  ));

  const { terrainLayers, animatedTerrain } = createTerrainRendering(terrainTiles, terrainAtlasByImage, undefined, level.layers.length);
  const visionShadowLayer = createSprite2DLayer(visionShadowAtlas, {
    capacity: 128,
    order: TILE_MAP_SUB_Z.ground + 1,
    pivot: [0.5, 0.5],
  });
  const stealthShadowLayer = createStealthAttackShadowLayer(visionShadowAtlas, {
    capacity: 64,
    order: TILE_MAP_SUB_Z.ground + 1,
    pivot: [0.5, 0.5],
  });
  let visionShadowSprites = [];
  const stealthAttacks = createStealthAttackController({ tileSize: TILE_SIZE });
  const stealthShadowLifecycle = createStealthAttackShadowLifecycle();
  const stealthShadowSprites = new Map();
  function getVisionOptions(snapshot) {
    const characterBlockers = snapshot.actors
      .filter((actor) => actor.isAlive !== false && actor.type !== "player")
      .map((actor) => actor.cell);
    const bushBlockers = reactiveDecorations
      .filter((decoration) => !decoration.isDead)
      .map((decoration) => decoration.cell);
    return {
      isWalkable: terrainVision,
      blockers: [...characterBlockers, ...bushBlockers],
      screenHeight: SCREEN_HEIGHT,
    };
  }
  function syncVisionShadows(snapshot, stealthInstances = []) {
    for (const sprite of visionShadowSprites) removeSprite2D(sprite);
    const commands = createEnemyVisionShadowDrawCommands(snapshot, TILE_SIZE, getVisionOptions(snapshot));
    visionShadowSprites = commands.map((command) => addSprite2D(visionShadowLayer, {
      positionPx: command.positionPx,
      sizePx: command.sizePx,
      frame: command.frame,
      color: command.color,
    }));
    const current = new Set();
    for (const command of createStealthAttackShadowDrawCommands(stealthInstances, TILE_SIZE, { screenHeight: SCREEN_HEIGHT })) {
      current.add(command.id);
      const sprite = stealthShadowSprites.get(command.id);
      if (sprite) {
        updateSprite2D(sprite, { positionPx: command.positionPx, color: command.color });
      } else {
        stealthShadowSprites.set(command.id, addSprite2D(stealthShadowLayer, {
          positionPx: command.positionPx, sizePx: command.sizePx, frame: command.frame, color: command.color,
        }));
      }
    }
    for (const [id, sprite] of stealthShadowSprites) {
      if (!current.has(id)) {
        removeSprite2D(sprite);
        stealthShadowSprites.delete(id);
      }
    }
  }

  // Once terrain sprites exist, phase water playback by the logical world column.
  for (const animation of animatedTerrain) {
    if (!animation.tile.source.endsWith("/Water.tsj")) continue;
    const offset = getColumnAnimationOffset(animation.frames, animation.tile.gameCell.x);
    animation.elapsed = offset.elapsed;
    setSprite2DFrame(animation.sprite, offset.frame);
  }

  const projectiles = createProjectileRenderer({
    atlas: arrowAtlas,
    bounds: worldBounds,
    obstacles: obstacleColliders,
    onPickup: () => playSfx("bush"),
  });
  let renderer = null;
  let nextActorId = 1;
  const sheepContactCoordinator = createSheepContactCoordinator();
  const characterPerception = createCharacterPerception({
    isWalkable: terrainVision,
    getBlockers: () => [
      ...reactiveDecorations.map((decoration) => ({
        id: decoration.id,
        type: "bush",
        isAlive: decoration.isAlive,
        cell: decoration.cell,
      })),
      ...getRecordsByType(SpawnerType.ENEMY).map((record) => ({
        id: record.combat.label,
        type: "enemy",
        isAlive: record.combat.isAlive,
        cell: record.actor.getGridPosition(TILE_SIZE),
      })),
    ],
  });

  const enemyPlanningScheduler = createPlanningScheduler();
  const enemyProfiles = { goblin: goblinProfile, warrior: warriorProfile, lancer: lancerProfile, archer: archerProfile, monk: monkProfile };

  function attachActor(record) {
    record.overhead = createCharacterOverhead(record.combat);
    if (renderer) {
      for (const layer of record.actor.layers) {
        addSpriteRendererLayer(renderer, camera.attachLayer(layer));
      }
      record.actor.playAnimation(animationManager);
    }
    if (!record.expressionInstances) {
      record.expressionInstances = [];
    }
    if (record.expressionState === undefined) {
      record.expressionState = "NONE";
    }
    if (record.expressionJumpOffset === undefined) {
      record.expressionJumpOffset = 0;
    }
    if (record.expression === undefined) {
      record.expression = getEnemyExpression("NONE");
    }
    // Initial actors are attached before the renderer is created. Spawn state
    // must still begin there, so every actor gets the same reveal animation.
    record.combat.beginSpawn();
    if (record.type === SpawnerType.ENEMY && !record.reaction) {
      const geometry = {
        [SpawnerCharacter.ARCHER]: { frame: ARCHER_FRAME, pivot: ARCHER_PIVOT, collider: ARCHER_MOVEMENT_COLLIDER },
        [SpawnerCharacter.GOBLIN]: { frame: GOBLIN_FRAME, pivot: GOBLIN_PIVOT, collider: GOBLIN_MOVEMENT_COLLIDER },
        [SpawnerCharacter.WARRIOR]: { frame: WARRIOR_FRAME, pivot: WARRIOR_PIVOT, collider: WARRIOR_MOVEMENT_COLLIDER },
        [SpawnerCharacter.LANCER]: { frame: LANCER_FRAME, pivot: LANCER_PIVOT, collider: LANCER_MOVEMENT_COLLIDER },
        [SpawnerCharacter.MONK]: { frame: MONK_FRAME, pivot: MONK_PIVOT, collider: MONK_MOVEMENT_COLLIDER },
      }[record.character];
      record.brain = createEnemyBrain({
        id: record.combat.label, actor: record.actor, grid: worldGrid,
        profile: enemyProfiles[record.character], scheduler: enemyPlanningScheduler,
        getPlayer: () => {
          const player = getRecordsByType(SpawnerType.PLAYER).find(({ combat }) => combat.isAlive);
          return player ? {
            id: player.combat.label, isAlive: true,
            detected: characterPerception.getSnapshot().detections.some(event => event.detectorId === record.combat.label),
            hidden: isPlayerHidden(player.combat.getCombatCollider(), reactiveDecorations),
            position: player.actor.getPosition(), cell: player.actor.getGridPosition(TILE_SIZE),
          } : null;
        },
        getPatrolPeers: () => snapshotPatrolPeers(getRecordsByType(SpawnerType.ENEMY), TILE_SIZE),
        getWorld: () => ({
          characters: getRecordsByType(SpawnerType.SHEEP).filter(target => target.combat.isAlive).map(target => ({
            id: target.combat.label, character: "sheep", isAlive: true, position: target.actor.getPosition(), cell: target.actor.getGridPosition(TILE_SIZE),
          })),
          bushes: reactiveDecorations.filter(decoration => !decoration.isDead).map(decoration => decoration.getSnapshot()),
          gold: pickupSystem.pickups.filter(pickup => pickup.isAlive).map(pickup => ({
            id: pickup.id, isAlive: true, position: { ...pickup.position }, cell: pickup.cell,
          })),
        }),
        isWalkable: createActorWalkability(record.actor, geometry),
        isAlive: () => record.combat.isAlive,
        onStateChange: (state) => playPerceptionSfx(state),
      });
      record.controller = record.awareness = record.brain;
      record.reaction = record.brain.reaction;
    }
    if ([SpawnerType.PLAYER, SpawnerType.ENEMY].includes(record.type)) {
      characterPerception.register({
        id: record.combat.label,
        type: record.type === SpawnerType.PLAYER ? "player" : "enemy",
        isAlive: record.combat.isAlive,
        cell: record.actor.getGridPosition(TILE_SIZE),
        facing: record.actor.getFacing?.() ?? "right",
        acceptRepeatedDetections: true,
        onDetection: (event) => record.reaction?.acceptDetection(event),
      });
    }
    return record;
  }

  function disposeActorRecord(record) {
    record.overhead.dispose();
    record.awareness?.dispose();
    characterPerception.unregister(record.combat.label);
    if (renderer) {
      for (const layer of record.actor.layers) {
        removeSpriteRendererLayer(renderer, layer);
      }
    }
    record.actor.dispose();
  }

  function spawnPlayer(row, column, {
    position = { x: (column + 0.5) * TILE_SIZE, y: (row + 0.5) * TILE_SIZE },
    loadout,
  } = {}) {
    const actor = createPlayer({
      atlases: archerAtlas,
      bounds: worldBounds,
      obstacles: obstacleColliders,
      initialPosition: position,
      initialLoadout: loadout,
      movementMultiplier: equipmentSnapshot.movementMultiplier,
      onExecutionStart: () => {
        const armed = actor.getArmedStealthAttack();
        if (!armed) return null;
        const target = getRecordsByType(SpawnerType.ENEMY).find((record) => (
          record.combat.label === armed.enemyId && record.combat.isAlive
        ));
        if (!target || !stealthAttacks.getZones().some((zone) => (
          zone.id === armed.id && zone.enemyId === armed.enemyId && zone.token === armed.token
        ))) return null;
        const attack = actor.consumeStealthAttack();
        if (!attack || attack.id !== armed.id || attack.token !== armed.token) return null;
        target.combat.applyStealthKill(makeDirection(actor.getPosition(), target.actor.getPosition()));
        playSfx("stealthHit");
        return { direction: makeDirection(actor.getPosition(), target.actor.getPosition()) };
      },
      onStealthAttackEnter: (entry) => {
        const target = getRecordsByType(SpawnerType.ENEMY).find((record) => (
          record.combat.label === entry.enemyId && record.combat.isAlive
        ));
        target?.brain?.beginStealthIdle?.();
      },
      onAttackStart: (move = {}) => {
        playSfx("warrior", { pitch: move.multiplier >= 3 ? 1.42 : move.multiplier >= 2 ? 1.12 : 1 });
      },
      onAttackImpact: (move = {}, eligibleTargetIds) => {
        const impacts = resolvePlayerKnifeImpact(
          getRecordsByType(SpawnerType.PLAYER).find(record => record.actor === actor),
          getRecordsByType(SpawnerType.ENEMY),
          {
            multiplier: move.multiplier ?? 1,
            eligibleTargetIds,
            onEligibleImpact: enemy => enemy.brain?.respondToPlayerAttack?.(),
            collectImpacts: true,
          },
        );
        if (impacts.length > 0) playSfx("lancer", { pitch: move.multiplier >= 3 ? 1.52 : move.multiplier >= 2 ? 1.15 : 1 });
        if ((move.multiplier ?? 1) > 1) {
          playDaggerComboEffect(actor.getPosition(), move.multiplier, actor.getFacing());
        }
        return {
          confirmedTargetIds: impacts.map(({ targetId }) => targetId),
          advancedTargetIds: (move.multiplier ?? 1) > 1
            ? impacts.filter(({ upgraded }) => upgraded).map(({ targetId }) => targetId)
            : impacts.map(({ targetId }) => targetId),
        };
      },
      onDropItem: (item, startPosition, movement) => {
        if (item !== "gold") return;
        const direction = movement.x !== 0 || movement.y !== 0
          ? movement
          : { x: 1, y: 0 };
        const length = Math.hypot(direction.x, direction.y) || 1;
        const destination = {
          x: Math.max(worldGrid.minColumn, Math.min(worldGrid.minColumn + worldGrid.columns - 1, Math.floor(startPosition.x / TILE_SIZE + direction.x / length))) + 0.5,
          y: Math.max(worldGrid.minRow, Math.min(worldGrid.minRow + worldGrid.rows - 1, Math.floor(startPosition.y / TILE_SIZE + direction.y / length))) + 0.5,
        };
        pickupSystem.spawn(goldPickupDefinition, {
          start: startPosition,
          cell: { x: destination.x - 0.5, y: destination.y - 0.5 },
          destination: { x: destination.x * TILE_SIZE, y: destination.y * TILE_SIZE },
        });
      },
    });
    const combat = createCombatActorState({
      label: `player-${nextActorId++}`,
      getCombatCollider: () => actor.getCombatCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        PLAYER_FRAME.width,
        progress,
      ),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [PLAYER_FRAME.width * value, PLAYER_FRAME.height * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
      onDeathStart: () => { actor.setInputEnabled(false); gameStateMachine.playerDefeated(); playSfx("lose"); },
      onDeathComplete: () => { gameStateMachine.deathCompleted(); pauseController.pause('player-loss'); void paidContinue.show(); },
    });
    return attachActor({ type: SpawnerType.PLAYER, actor, combat, equipment: equipmentSnapshot });
  }

  function createSheepRecord(position) {
    const actor = createSheep({
      atlases: sheepAtlases,
      initialPosition: position,
      bounds: worldBounds,
      obstacles: obstacleColliders,
      grid: worldGrid,
      scareDistanceCells: 3,
      frighteningTypes: [CharacterType.PLAYER],
      minimumFleeDistanceCells: 1,
      maximumFleeDistanceCells: 3,
    });
    const combat = createCombatActorState({
      label: `sheep-${nextActorId++}`,
      getCombatCollider: () => actor.getCombatCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        SHEEP_FRAME_SIZE,
        progress,
      ),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [SHEEP_FRAME_SIZE * value, SHEEP_FRAME_SIZE * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
    });
    return attachActor({ type: SpawnerType.SHEEP, actor, combat });
  }

  function getNavigationColliders(actor) {
    const enemy = getRecordsByType(SpawnerType.ENEMY).find(record => record.actor === actor);
    const player = getRecordsByType(SpawnerType.PLAYER).find(record => record.combat.isAlive);
    const bushBlockers = enemy ? getOccupiedBushBlockers(player?.combat.getCombatCollider(),
      reactiveDecorations, TILE_SIZE, enemy.reaction?.canTrackHiddenPlayer()) : [];
    return [SpawnerType.PLAYER, SpawnerType.SHEEP, SpawnerType.ENEMY]
      .flatMap(type => getRecordsByType(type))
      .filter(record => record.combat.isAlive && record.actor !== actor)
      .map(record => ({ id: record.combat.label, collider: record.actor.getMovementCollider() }))
      .concat(bushBlockers);
  }

  function createActorWalkability(actor, character) {
    const terrain = createGridWalkability({
      bounds: worldBounds, character, grid: worldGrid, obstacles: obstacleColliders,
    });
    const walkable = cell => {
      const blockers = getNavigationColliders(actor);
      return !blockers.some(({ collider }) => {
        const occupied = getCharacterGridCell(collider, TILE_SIZE);
        return occupied.x === cell.x && occupied.y === cell.y;
      }) && terrain(cell, blockers);
    };
    walkable.canTraverse = (from, to) => {
      const current = getCharacterGridCell(actor.getMovementCollider(), TILE_SIZE);
      return walkable(to) && terrain.canTraverse(from, to, getNavigationColliders(actor),
        from.x === current.x && from.y === current.y ? getColliderCenter(actor.getMovementCollider()) : null);
    };
    return walkable;
  }

  function createArcherRecord(position) {
    const ownerId = `archer-${nextActorId++}`;
    const actor = createArcher({ atlases: archerEnemyAtlases, initialPosition: position, bounds: worldBounds, obstacles: obstacleColliders, onShoot: (spawnPosition, target, options) => {
      playSfx("archer");
      const dx = target.x - spawnPosition.x; const dy = target.y - spawnPosition.y;
      const length = Math.hypot(dx, dy) || 1;
      return projectiles.shoot(spawnPosition, options.initialVelocityDirection ?? { x: dx / length, y: dy / length }, ownerId, { target, speedMultiplier: 0.5, collisionEnabled: true, rotationEnabled: true, ...options });
    } });
    const combat = createCombatActorState({ label: ownerId, getCombatCollider: () => actor.getCombatCollider(), setVisualTransform: (transform) => actor.setVisualTransform(transform), onSpawnProgress: (progress) => setCharacterSpawnProgress(actor, ARCHER_FRAME.width, progress), onDeathProgress: (value) => actor.setVisualTransform({ sizePx: [ARCHER_FRAME.width * value, ARCHER_FRAME.height * value] }), onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }), onKnockback: (direction, options) => actor.applyKnockback(direction, options) });
    return attachActor({ type: SpawnerType.ENEMY, character: SpawnerCharacter.ARCHER, actor, combat, controller: null });
  }

  function createGoblinRecord(position) {
    const actor = createGoblin({
      onAttack: () => playSfx("goblin"),
      atlases: goblinAtlases,
      initialPosition: position,
      bounds: worldBounds,
      obstacles: obstacleColliders,
    });
    const combat = createCombatActorState({
      label: `goblin-${nextActorId++}`,
      getCombatCollider: () => actor.getCombatCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        GOBLIN_FRAME.width,
        progress,
      ),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [GOBLIN_FRAME.width * value, GOBLIN_FRAME.height * value],
      }),
      onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }),
      onKnockback: (direction, options) => actor.applyKnockback(direction, options),
    });
    const record = {
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.GOBLIN,
      actor,
      combat,
      controller: null,
    };
    return attachActor(record);
  }

  function createWarriorRecord(position) {
    const actor = createWarrior({
      onAttack: () => playSfx("warrior"),
      atlases: warriorAtlases,
      initialPosition: position,
      bounds: worldBounds,
      obstacles: obstacleColliders,
    });
    const combat = createCombatActorState({
      label: `warrior-${nextActorId++}`,
      getCombatCollider: () => actor.getCombatCollider(),
      setVisualTransform: (transform) => actor.setVisualTransform(transform),
      onSpawnProgress: (progress) => setCharacterSpawnProgress(
        actor,
        WARRIOR_FRAME.width,
        progress,
      ),
      onDeathProgress: (value) => actor.setVisualTransform({
        sizePx: [WARRIOR_FRAME.width * value, WARRIOR_FRAME.height * value],
        anchor: "body-bottom",
      }),
      onHitFlashStart: () => actor.setVisualTransform({
        color: [1.6, 1.6, 1.6, 1],
      }),
      onKnockback: (direction, options) => {
        actor.applyKnockback(direction, options);
      },
    });
    return attachActor({
      type: SpawnerType.ENEMY,
      character: SpawnerCharacter.WARRIOR,
      actor,
      combat,
      controller: null,
    });
  }

  function createLancerRecord(position) {
    const actor = createLancer({ onAttack: () => playSfx("lancer"), atlases: lancerAtlases, initialPosition: position, bounds: worldBounds, obstacles: obstacleColliders });
    const combat = createCombatActorState({ label: `lancer-${nextActorId++}`, getCombatCollider: () => actor.getCombatCollider(), setVisualTransform: (transform) => actor.setVisualTransform(transform), onSpawnProgress: (progress) => setCharacterSpawnProgress(actor, LANCER_FRAME.width, progress), onDeathProgress: (value) => actor.setVisualTransform({ sizePx: [LANCER_FRAME.width * value, LANCER_FRAME.height * value], anchor: "artwork-bottom" }), onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }), onKnockback: (direction, options) => actor.applyKnockback(direction, options) });
    return attachActor({ type: SpawnerType.ENEMY, character: SpawnerCharacter.LANCER, actor, combat, controller: null });
  }

  function createMonkRecord(position) {
    const actor = createMonk({ onHeal: () => playSfx("monk"), atlases: monkAtlases, initialPosition: position, bounds: worldBounds, obstacles: obstacleColliders });
    const combat = createCombatActorState({ label: `monk-${nextActorId++}`, getCombatCollider: () => actor.getCombatCollider(), setVisualTransform: (transform) => actor.setVisualTransform(transform), onSpawnProgress: (progress) => setCharacterSpawnProgress(actor, MONK_FRAME.width, progress), onDeathProgress: (value) => actor.setVisualTransform({ sizePx: [MONK_FRAME.width * value, MONK_FRAME.height * value] }), onHitFlashStart: () => actor.setVisualTransform({ color: [1.6, 1.6, 1.6, 1] }), onKnockback: (direction, options) => actor.applyKnockback(direction, options) });
    return attachActor({ type: SpawnerType.ENEMY, character: SpawnerCharacter.MONK, actor, combat, controller: null });
  }

  let settingsUi;
  const pauseController = createPauseController({
    onPause: () => {
      spawnerByType.get(SpawnerType.PLAYER).actors[0]?.actor.setInputEnabled(false, { preserveAttack: true });
    },
    onResume: () => {
      const player = spawnerByType.get(SpawnerType.PLAYER).actors[0];
      player?.actor.setInputEnabled(player.combat.isAlive && gameStateMachine.state === GameState.LEVEL_PLAYING);
      previousTime = performance.now();
    },
  });
  let bisGame;
  const accountHost = createBisAccount({
    host: domScreen, pauseController,
    frameElement: gameFrame,
    restartGame: () => progress.restart(),
    onClose: () => settingsUi?.returnFromAccount(),
    getBisGame: () => bisGame,
  });
  let equipmentSnapshot = EMPTY_EQUIPMENT_SNAPSHOT;
  let unsubscribeEquipment = () => {};
  const bisPromise = accountHost.readyAsync();
  const initialEquipmentState = bisPromise.then(bis => bis?.refreshEquipmentAsync());
  equipmentSnapshot = createEquipmentSnapshot(await Promise.race([
    initialEquipmentState.catch(() => ({ status: "unavailable" })),
    new Promise(resolve => setTimeout(() => resolve({ status: "unavailable" }), 1500)),
  ]));

  const spawnerConfigs = createInitialSpawnerConfigs({
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    tileSize: TILE_SIZE,
    authoredSpawners: level.spawners,
  });
  const markerDefinitions = {
    [SpawnerCharacter.PLAYER]: {
      atlas: archerAtlas.idle,
      frameSize: PLAYER_FRAME,
    },
    [SpawnerCharacter.SHEEP]: {
      atlas: sheepAtlases.idle,
      frameSize: { width: SHEEP_FRAME_SIZE, height: SHEEP_FRAME_SIZE },
    },
    [SpawnerCharacter.GOBLIN]: {
      atlas: goblinAtlases.idle,
      frameSize: GOBLIN_FRAME,
    },
    [SpawnerCharacter.WARRIOR]: {
      atlas: warriorAtlases.idle,
      frameSize: WARRIOR_FRAME,
    },
    [SpawnerCharacter.ARCHER]: { atlas: archerEnemyAtlases.idle, frameSize: ARCHER_FRAME },
    [SpawnerCharacter.LANCER]: { atlas: lancerAtlases.idle, frameSize: LANCER_FRAME },
    [SpawnerCharacter.MONK]: { atlas: monkAtlases.idle, frameSize: MONK_FRAME },
  };
  const actorFactories = {
    [SpawnerCharacter.PLAYER]: (position) => spawnPlayer(
      Math.floor(position.y / TILE_SIZE), Math.floor(position.x / TILE_SIZE), { position },
    ),
    [SpawnerCharacter.SHEEP]: createSheepRecord,
    [SpawnerCharacter.GOBLIN]: createGoblinRecord,
    [SpawnerCharacter.WARRIOR]: createWarriorRecord,
    [SpawnerCharacter.ARCHER]: createArcherRecord,
    [SpawnerCharacter.LANCER]: createLancerRecord,
    [SpawnerCharacter.MONK]: createMonkRecord,
  };
  const spawnCharacterShapes = {
    [SpawnerCharacter.PLAYER]: {
      frame: PLAYER_FRAME,
      pivot: PLAYER_PIVOT,
      collider: PLAYER_MOVEMENT_COLLIDER,
    },
    [SpawnerCharacter.SHEEP]: {
      frame: { width: SHEEP_FRAME_SIZE, height: SHEEP_FRAME_SIZE },
      pivot: SHEEP_PIVOT,
      collider: SHEEP_MOVEMENT_COLLIDER,
    },
    [SpawnerCharacter.GOBLIN]: {
      frame: GOBLIN_FRAME,
      pivot: GOBLIN_PIVOT,
      collider: GOBLIN_MOVEMENT_COLLIDER,
    },
    [SpawnerCharacter.WARRIOR]: {
      frame: WARRIOR_FRAME,
      pivot: WARRIOR_PIVOT,
      collider: WARRIOR_MOVEMENT_COLLIDER,
    },
    [SpawnerCharacter.ARCHER]: { frame: ARCHER_FRAME, pivot: ARCHER_PIVOT, collider: ARCHER_MOVEMENT_COLLIDER },
    [SpawnerCharacter.LANCER]: { frame: LANCER_FRAME, pivot: LANCER_PIVOT, collider: LANCER_MOVEMENT_COLLIDER },
    [SpawnerCharacter.MONK]: { frame: MONK_FRAME, pivot: MONK_PIVOT, collider: MONK_MOVEMENT_COLLIDER },
  };
  const spawnWalkability = Object.fromEntries(Object.entries(spawnCharacterShapes)
    .map(([character, shape]) => [character, createGridWalkability({
      bounds: worldBounds,
      character: shape,
      grid: worldGrid,
      obstacles: obstacleColliders,
    })]));
  const spawnerMarkers = spawnerConfigs.map((config) => createSpawnerMarker({
    ...markerDefinitions[config.character],
    worldPosition: config.position,
    boundsHeight: SCREEN_HEIGHT,
    gridSize: TILE_SIZE,
  }));
  const spawners = spawnerConfigs.map((config) => createSpawner({
    ...config,
    minimumCount: config.character === SpawnerCharacter.SHEEP ? 1 : config.minimumCount,
    maximumCount: config.character === SpawnerCharacter.SHEEP ? 1 : config.maximumCount,
    tileSize: TILE_SIZE,
    validateSpawnPosition: config.type !== SpawnerType.PLAYER,
    spawnMaxDistance: [SpawnerCharacter.PLAYER, SpawnerCharacter.SHEEP, SpawnerCharacter.GOBLIN, SpawnerCharacter.WARRIOR, SpawnerCharacter.ARCHER, SpawnerCharacter.MONK]
      .includes(config.character) ? 0 : 1,
    isWalkable: (_position, cell) => spawnWalkability[config.character](cell,
      spawners.flatMap((otherSpawner) => otherSpawner.actors
        .filter((record) => record.combat.isAlive)
        .map((record) => ({ collider: record.actor.getMovementCollider() }))),
    ),
    getWalkableCells: () => Array.from({ length: worldGrid.rows }, (_, y) => y + worldGrid.minRow)
      .flatMap((y) => Array.from({ length: worldGrid.columns }, (_, x) => ({ x: x + worldGrid.minColumn, y }))),
    getActorPosition: (record) => record.actor.getPosition(),
    createActor: actorFactories[config.character],
    disposeActor: disposeActorRecord,
  }));
  for (const spawner of spawners) {
    spawner.initialize();
  }
  const spawnerByType = new Map(spawners.map((spawner) => [spawner.config.type, spawner]));
  const getRecordsByType = (type) => spawners
    .filter((spawner) => spawner.config.type === type)
    .flatMap((spawner) => spawner.actors);
  globalThis.characterPerceptionDebug = Object.freeze({ snapshot: () => characterPerception.getSnapshot() });
  const getBushBurningSnapshot = () => ({
      bushes: reactiveDecorations.map((decoration) => ({
        id: decoration.id,
        health: decoration.health,
        isAlive: decoration.isAlive,
        isDying: decoration.isDying,
        isDead: decoration.isDead,
        firePlaying: decoration.firePlaying,
        cell: decoration.cell,
      })),
      goblins: getRecordsByType(SpawnerType.ENEMY)
        .filter(({ character }) => character === SpawnerCharacter.GOBLIN)
        .map(({ actor, combat, controller }) => ({
          id: combat.label,
          mode: controller.mode,
          navigation: controller.getNavigationSnapshot?.(),
          cell: getCharacterGridCell(actor.getMovementCollider(), TILE_SIZE),
        })),
    });
  globalThis.bushBurningDebug = Object.freeze({ snapshot: getBushBurningSnapshot });
  const grassAtlases = new Map(await Promise.all((GrassDecorationsEnabled ? GRASS_SET.images : []).map(async image => [image,
    await loadSpriteAtlas(engine, `${import.meta.env.BASE_URL}${image}`, { gridSize: GRASS_SET.frameSize, sampling: "nearest" }),
  ])));
  const grassWalkability = createGridWalkability({ bounds: worldBounds, grid: worldGrid, obstacles: obstacleColliders,
    character: { frame: PLAYER_FRAME, pivot: PLAYER_PIVOT, collider: PLAYER_MOVEMENT_COLLIDER } });
  const grassPlacements = planDecorationSet({ enabled: GrassDecorationsEnabled, set: GRASS_SET, grid: worldGrid,
    groundCells: collectDecorationGroundCells(terrainTiles),
    occupiedCells: [
      ...(level.decorationOccupiedCells ?? []),
      ...[...level.spawners, ...level.goldPickupSpawners, ...(level.treasureSpawners??[]), ...level.goals].map(object => object.gameCell),
      ...reactiveDecorations.map(object => object.getGridSpot().cell),
      ...spawners.flatMap(spawner => spawner.actors.map(record => getCharacterGridCell(record.actor.getMovementCollider(), TILE_SIZE))),
    ], isWalkable: grassWalkability });
  const grassDecorations = createDecorationObjects({ placements: grassPlacements, atlases: grassAtlases,
    screenHeight: SCREEN_HEIGHT, tileSize: TILE_SIZE });
  if (import.meta.env.DEV) canvas.dataset.grassDecorations = JSON.stringify(grassPlacements);
  let activeTouchPairs = new Set();

  renderer = createSpriteRenderer(engine, {
    layers: [
      ...terrainLayers,
      ...grassDecorations.layers,
      visionShadowLayer,
      stealthShadowLayer,
      ...reactiveDecorations.flatMap((decoration) => decoration.layers),
      ...goldStoneObjects.map((object) => object.layer),
      ...pickupSystem.pickups.map((pickup) => pickup.layer),
      ...bushFireEffects.map((effect) => effect.layer),
      ...daggerComboEffects.map((effect) => effect.layer),
      ...spawnerMarkers.map((marker) => marker.layer),
      ...spawners.flatMap((spawner) => (
        spawner.actors.flatMap((record) => record.actor.layers)
      )),
      projectiles.layer,
    ].map(layer => camera.attachLayer(layer)),
    clearValue: { r: 0.25, g: 0.48, b: 0.22, a: 1 },
  });
  camera.initialize(level.cameraFocus ?? getRecordsByType(SpawnerType.PLAYER)[0]?.actor.getPosition() ?? spawnerConfigs.find(config => config.type === SpawnerType.PLAYER).position);
  registerSpriteRenderer(renderer);
  pickupSystem.setRenderer({ add: (layer) => addSpriteRendererLayer(renderer, camera.attachLayer(layer)), remove: (layer) => removeSpriteRendererLayer(renderer, layer) });

  const handleGridSelection = (event) => {
    const viewport = latestGameViewport ?? refreshGameViewportDiagnostics();
    const logicalPoint = logicalPointFromClient({ x: event.clientX, y: event.clientY }, viewport);
    const selectedGridSpot = gridSpotFromWorldPoint(camera.screenToWorld(logicalPoint), worldGrid);
    if (selectedGridSpot) selectionSystem.toggleGridSpot(selectedGridSpot);
  };
  canvas.addEventListener("pointerup", handleGridSelection);

  for (const spawner of spawners) {
    for (const record of spawner.actors) {
      record.actor.playAnimation(animationManager);
    }
  }
  let previousTime = performance.now();
  let showColliders = runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showColliders);
  coordinatesUi.setVisible(runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showCoordinates));
  const unsubscribeCoordinates = runtimeSettingsStore.subscribe(
    RUNTIME_DEBUG_SETTING_KEYS.showCoordinates, value => coordinatesUi.setVisible(value),
  );
  for (const marker of spawnerMarkers) {
    marker.setVisible(showColliders);
  }
  const unsubscribeColliders = runtimeSettingsStore.subscribe(
    RUNTIME_DEBUG_SETTING_KEYS.showColliders,
    (value) => {
      showColliders = value;
      for (const marker of spawnerMarkers) {
        marker.setVisible(value);
      }
      if (!value) {
        debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }
    },
  );
  const treasure = createTreasureRuntime({accountHost,resumeRun:progress.completed>0});
  const treasureUi = createTreasureUi({host:domBody,screenLayer:domScreen,frameElement:gameFrame,pauseController,session:treasure});
  let startGamePrompt = null;
  settingsUi = createSettingsUi({
    host: gameUi, modalHost: domBody, screenLayer: domScreen, frameElement: gameFrame, pauseController,
    catalog: __GAME_LEVELS__, openAccount: () => accountHost.open(),
    getBis: () => accountHost.getBis(),
    onBisReset: () => { bisSessionActive=false; },
    showMapLevelSelectorInSettings,
    isStartMenuVisible: () => startGamePrompt !== null,
  });
  createReleaseMetadataUi({ host: gameUi, metadata: releaseMetadata, showFilesizeInHud });
  goldCounter = createGoldCounterUi({ host: gameUi, total: level.goldPickupSpawners?.length ?? 0 });
  createLevelCounterUi({ host: gameUi, level: progress.completed + 1, total: progress.total });
  const itemsHud = createItemsHudUi({ host: gameUi, snapshot: equipmentSnapshot });
  let itemsWindow = null;
  let itemsEnabled = false;
  const applyEquipmentState = state => {
    equipmentSnapshot = createEquipmentSnapshot(state);
    itemsHud?.render(equipmentSnapshot);
    // Equipment refreshes can briefly omit its profile while account assets settle.
    // The public capability is authoritative, independent of a Game Wallet.
    itemsEnabled = accountHost.hasItemSupport();
    startGamePrompt?.setItemsSupported(itemsEnabled);
    startGamePrompt?.setItemsEnabled(itemsEnabled);
  };
  const openItems = () => {
    if (itemsWindow || !itemsEnabled) return;
    itemsWindow = createItemsUi({
      host: domBody,
      screenLayer: domScreen,
      frameElement: gameFrame,
      opener: startGamePrompt?.itemsButton,
      equipmentProvider: () => bisPromise,
      onState: applyEquipmentState,
      onClose: () => { itemsWindow = null; startGamePrompt?.itemsButton?.focus(); },
    });
  };
  if (import.meta.env.DEV) {
    window.__codexPrepareItemsBisLoading = async () => {
      const bis = await accountHost.readyAsync();
      let release;
      let releaseAction;
      const qaItem = { assetId: "qa-dagger", family: "Dagger", name: "Dagger I", priceSats: 1100,
        attributeDeltas: [{ bisAttribute: "playerDamage", bisAttributeDelta: 10 }],
        iconUrl: `${import.meta.env.BASE_URL}assets/images/ui/items/dagger.png` };
      bis.refreshEquipmentAsync = () => new Promise(resolve => {
        release = () => resolve({ status: "ready", profileId: "qa", ownedItems: [qaItem], effective: {} });
      });
      bis.selectEquipmentAsync = () => new Promise(resolve => {
        releaseAction = () => resolve({ status: "ready", profileId: "qa", ownedItems: [qaItem], effective: { Dagger: qaItem } });
      });
      itemsEnabled = true;
      startGamePrompt?.setItemsSupported(true);
      startGamePrompt?.setItemsEnabled(true);
      openItems();
      window.__codexReleaseItemsBisLoading = () => release?.();
      window.__codexReleaseItemsBisActionLoading = () => releaseAction?.();
    };
  }
  void bisPromise.then(bis => {
    if (disposed) return;
    unsubscribeEquipment = accountHost.subscribe(snapshot=>applyEquipmentState(snapshot.equipment));
    if(bis)applyEquipmentState(bis.getSnapshot().equipment);
  }).catch(() => {});
  void initialEquipmentState.then(applyEquipmentState).catch(() => {});
  const goal = createGoal({ host: world.mode === "follow-player" ? gameFrame : gameUi, position: { x: (level.goals[0].gameCell.x + 0.5) * TILE_SIZE, y: (level.goals[0].gameCell.y + 0.5) * TILE_SIZE }, screenWidth: SCREEN_WIDTH, screenHeight: SCREEN_HEIGHT });
  const goalAtlas = await loadSpriteAtlas(engine, `${import.meta.env.BASE_URL}assets/images/goals/StepsDown-uneven.png`, {
    gridSize: [64, 64], sampling: "nearest",
  });
  const treasureAtlas = await loadSpriteAtlas(engine,
    `${import.meta.env.BASE_URL}assets/images/ui/spawners/treasure-chest.png`, {gridSize:[64,64],sampling:'nearest'});
  const treasureLayers=[];
  const treasureSpawners=[];
  const treasureReveals=[];
  let treasureRevealed=false;
  const revealTreasures=()=>{
    if(treasureRevealed||treasure.getState().status!=='active')return;
    treasureRevealed=true;
    for(const authored of level.treasureSpawners??[]){
      const position=gridCellToWorldCenter(authored.gameCell,TILE_SIZE);
      const spawner=createObjectSpawner({type:'treasure',position,createObject:position=>{
        const layer=createSprite2DLayer(treasureAtlas,{capacity:1,order:getYSortedLayerOrder(position.y,worldBounds),pivot:[0.5,0.5]});
        const sprite=addSprite2D(layer,{positionPx:[position.x,SCREEN_HEIGHT-position.y],sizePx:[64,64],frame:0,alpha:0,scaleX:0,scaleY:0});
        addSpriteRendererLayer(renderer,camera.attachLayer(layer));treasureLayers.push(layer);
        treasureReveals.push(createTreasureReveal({sprite,api:{updateSprite2D}}));
        return createTreasureChest({position,sensor:authored.sensor,canEnter:()=>accountHost.hasContractSupport(),onEnter:()=>void treasureUi.open()});
      }});spawner.initialize();treasureSpawners.push(spawner);
    }
  };
  const unsubscribeTreasureReveal=treasure.subscribe(revealTreasures);
  revealTreasures();
  const goalLayer = createSprite2DLayer(goalAtlas, {
    capacity: 1, order: TILE_MAP_SUB_Z.groundDecorations, pivot: [0.5, 0.5],
  });
  addSprite2D(goalLayer, {
    positionPx: [goal.position.x, SCREEN_HEIGHT - goal.position.y],
    sizePx: [64, 64], frame: 0,
  });
  addSpriteRendererLayer(renderer, camera.attachLayer(goalLayer));
  goal.updateView(camera);
  if (import.meta.env.DEV) globalThis.levelCameraDebug = Object.freeze({
    snapshot: () => ({ mode: world.mode, bounds: { ...worldBounds }, grid: { ...worldGrid },
      offset: camera.getOffset(), view: { positionPx: [...camera.view.positionPx] },
      player: getRecordsByType(SpawnerType.PLAYER)[0]?.actor.getPosition(),
      actors: spawners.flatMap(spawner => spawner.actors).map(record => ({
        id: record.combat.label, position: record.actor.getPosition(),
        screen: camera.worldToScreen(record.actor.getPosition()),
        orders: record.actor.layers.map(layer => layer.order),
        sharesView: record.actor.layers.every(layer => layer.view === camera.view),
      })),
      goal: { position: goal.position, screen: camera.worldToScreen(goal.position) },
      selected: selectionSystem.getSelectedGridSpot(), paused: pauseController.isPaused,
      state: gameStateMachine.state,
    }),
  });
  // The individual reward state owns collection availability, not contract/Game-Wallet readiness.
  const showTrophyActions = () => true;
  const levelCompleteUi = createLevelCompleteUi({host:domBody,frameElement:gameFrame,showTrophyActions,onContinue:()=>levelReward.next(),onRestart:()=>levelReward.restart(),onCollect:()=>levelReward.collect(),onCheck:()=>levelReward.check(),onAcknowledge:()=>levelReward.acknowledge()});
  const levelReward = createLevelReward({accountHost,ui:levelCompleteUi,progress,gold:goldCounter,showTrophyActions});
  const gameStateMachine = createGameStateMachine();
  const levelLostUi = createLevelLostUi({host:domBody,frameElement:gameFrame,onPay:()=>paidContinue.pay(),onRestart:()=>paidContinue.restart()});
  const paidContinue = createPayToContinue({accountHost,ui:levelLostUi,restart:()=>progress.restart(),
  });
  const bisGameSessionId = crypto.randomUUID();
  const rewardFeedback=createBisGameRewardFeedback({host:gameUi});
  bisGame = createBisGame({
    gameId: 'stealth-and-steel',
    isActive: () => !disposed,
    onBisEvent: event => accountHost.onBisEvent(event),
    getActiveGameSessionId: () => !disposed && bisSessionActive && [GameState.LEVEL_PLAYING, GameState.LEVEL_LOST, GameState.LEVEL_COMPLETE].includes(gameStateMachine.state) ? bisGameSessionId : undefined,
    canCaptureContinuation: () => gameStateMachine.state === GameState.LEVEL_LOST,
    applyContinuation: () => revivePaidPlayer({machine:gameStateMachine,player:getRecordsByType(SpawnerType.PLAYER)[0],spawners,
      enemyType:SpawnerType.ENEMY,tileSize:TILE_SIZE,spawnPlayer,resume:()=>pauseController.resume('player-loss')}),
    presentPlayerReward: reward => rewardFeedback.present(reward),
  });
  startGamePrompt = shouldShowStartGamePrompt({ showStartPrompt: showStartPrompt && !initialRun })
    ? createStartGamePrompt({
      host: domBody,
      frameElement: gameFrame,
      onItems: openItems,
      itemsVisible: itemsEnabled,
      itemsEnabled,
      onStart: () => {
        treasure.start();
        startGamePrompt.close();
        startGamePrompt = null;
        settingsUi.syncGearStacking();
        pauseController.resume();
        setGameplayMusicActive(true);
      },
    })
    : null;
  if (startGamePrompt) {
    settingsUi.syncGearStacking();
    pauseController.pause();
  } else {
    setGameplayMusicActive(true);
  }
  runPresentation.show();
  const restartQaOutcome = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get("restartQaOutcome")
    : null;
  if (["loss", "completion"].includes(restartQaOutcome)
    && sessionStorage.getItem("stealth-steel-restart-qa-outcome") !== restartQaOutcome) {
    sessionStorage.setItem("stealth-steel-restart-qa-outcome", restartQaOutcome);
    queueMicrotask(() => {
      if (disposed) return;
      startGamePrompt?.close();
      startGamePrompt = null;
      settingsUi.syncGearStacking();
      pauseController.resume();
      setGameplayMusicActive(true);
      gameStateMachine.assetsLoaded();
      if (restartQaOutcome === "loss") {
        gameStateMachine.playerDefeated();
        gameStateMachine.deathCompleted();
        pauseController.pause("player-loss");
        void paidContinue.show();
      } else {
        gameStateMachine.goalReached();
        levelReward.show();
      }
    });
  }
  const characterLockupWatchdog = createCharacterLockupWatchdog();
  let goalExit = null;

  function update(currentTime) {
    const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.05);
    previousTime = currentTime;
    goalExit?.update(deltaSeconds);
    let activeDelta = [GameState.LEVEL_LOST, GameState.LEVEL_COMPLETE].includes(gameStateMachine.state) ? 0 : pauseController.getDelta(deltaSeconds);
    if (gameStateMachine.state === GameState.LEVEL_START) {
      gameStateMachine.assetsLoaded();
    }

    updateSpriteAnimationManager(animationManager, activeDelta * 1000);
    for (const animation of animatedTerrain) {
      const duration = animation.frames.reduce((sum, frame) => sum + frame.duration, 0);
      animation.elapsed = (animation.elapsed + activeDelta * 1000) % duration;
      let remaining = animation.elapsed;
      for (const frame of animation.frames) {
        if (remaining < frame.duration) { setSprite2DFrame(animation.sprite, frame.tileid); break; }
        remaining -= frame.duration;
      }
    }
    if (activeDelta > 0) {
      for(const reveal of treasureReveals)reveal.update(activeDelta);
      const nextTouchPairs = new Set();
      for (const spawner of spawners) {
        for (const record of spawner.actors) {
          record.combat.updateSpawn(activeDelta);
          if (record.combat.isDying && (record.type === SpawnerType.PLAYER
            || (record.type === SpawnerType.ENEMY && record.actor.isKnockedBack))) {
            record.actor.update(activeDelta, [...getRecordsByType(SpawnerType.PLAYER), ...getRecordsByType(SpawnerType.ENEMY), ...getRecordsByType(SpawnerType.SHEEP)]
              .filter(other => other !== record && other.combat.isAlive).map(other => ({ collider: other.actor.getMovementCollider() })));
          }
          record.combat.updateDeath(activeDelta);
          record.overhead.update(activeDelta);
          if (gameStateMachine.state === GameState.LEVEL_LOST) activeDelta = 0;
          if (record.combat.isDead && record.type !== SpawnerType.PLAYER) {
            spawner.remove(record);
          }
        }
        spawner.update(activeDelta);
      }

      const playerRecord = spawnerByType.get(SpawnerType.PLAYER).actors[0] ?? null;
      const sheepRecords = getRecordsByType(SpawnerType.SHEEP);
      const enemyRecords = getRecordsByType(SpawnerType.ENEMY);
      const characterRecords = [
        ...(playerRecord ? [playerRecord] : []),
        ...sheepRecords,
        ...enemyRecords,
      ];
      const lockup = characterLockupWatchdog.inspect(characterRecords, activeDelta);
      if (lockup) console.warn("Character lockup detected; separating", lockup.labels);
      if (!TEMPORARILY_DISABLE_GREEN_GREEN_COLLISIONS) {
        separateOverlappingCharacterColliders(characterRecords, 0.01, 8, obstacleColliders);
      }
      let playerMovementCollider = playerRecord?.combat.isAlive
        ? playerRecord.actor.getMovementCollider()
        : null;
      let playerCombatCollider = playerRecord?.combat.getCombatCollider() ?? null;
      const sheepMovementColliders = sheepRecords.map((record) => ({
        record,
        collider: record.combat.isAlive ? record.actor.getMovementCollider() : null,
      }));
      const enemyMovementColliders = enemyRecords.map((record) => ({
        record,
        collider: record.combat.isAlive ? record.actor.getMovementCollider() : null,
      }));
      const sheepCombatColliders = sheepRecords.map((record) => ({
        record,
        collider: record.combat.getCombatCollider(),
      }));
      const enemyCombatColliders = enemyRecords.map((record) => ({
        record,
        collider: record.combat.getCombatCollider(),
      }));

      const playerPositionBeforeUpdate = playerRecord?.actor.getPosition();
      if (playerRecord?.combat.isAlive) {
        const dynamicColliders = [
          ...sheepMovementColliders.filter(({ collider }) => collider)
            .map(({ collider }) => ({ type: "npc", collider })),
          ...(TEMPORARILY_DISABLE_GREEN_GREEN_COLLISIONS ? [] : enemyMovementColliders.filter(({ collider }) => collider))
            .map(({ collider }) => ({ type: CharacterType.ENEMY, collider })),
        ];
        playerRecord.actor.update(activeDelta, dynamicColliders);
        playerMovementCollider = playerRecord.actor.getMovementCollider();
        playerCombatCollider = playerRecord.combat.getCombatCollider();
        playerRecord.actor.observeHidingBushes(reactiveDecorations.filter(bush =>
          bush.isAlive && collidersOverlap(playerCombatCollider, bush.getCombatCollider())));
      }

      const playerSnapshot = playerRecord
        ? {
            type: CharacterType.PLAYER,
            isAlive: playerRecord.combat.isAlive,
            hidden: isPlayerHidden(playerCombatCollider, reactiveDecorations),
            position: playerRecord.actor.getPosition(),
            cell: playerRecord.actor.getGridPosition(TILE_SIZE),
            detectedBy: characterPerception.getSnapshot().detections
              .filter(({ type }) => type === "visual" || type === "audio")
              .map(({ detectorId }) => detectorId),
          }
        : null;
      for (const record of enemyRecords) record.reaction?.update(activeDelta);
      const sheepDynamicColliders = playerMovementCollider
        ? [{ type: CharacterType.PLAYER, collider: playerMovementCollider }]
        : [];
      const projectileState = projectiles.getColliders();
      const sheepSnapshots = sheepRecords.map((record) => ({
        id: record.combat.label,
        isAlive: record.combat.isAlive,
        position: record.actor.getPosition(),
        requestedPosition: record.actor.getRequestedPosition(activeDelta),
        collider: record.combat.isAlive ? record.actor.getMovementCollider() : null,
        contactPartnerId: record.actor.getContactPartnerId(),
      }));
      const sheepContactResult = sheepContactCoordinator.update(sheepSnapshots);
      const sheepRecordById = new Map(
        sheepRecords.map((record) => [record.combat.label, record]),
      );
      for (const [id, intent] of sheepContactResult.intents) {
        const record = sheepRecordById.get(id);
        const partner = sheepRecordById.get(intent.partnerId);
        if (record?.combat.isAlive && partner?.combat.isAlive) {
          record.actor.beginContact({
            ...intent,
            partnerCell: partner.actor.getGridCell(),
          });
        }
      }

      for (const currentRecord of sheepRecords) {
        const otherSheepColliders = sheepRecords
          .filter((record) => (
            record.combat.isAlive
            && record.combat.label !== currentRecord.combat.label
          ))
          .map((record) => ({
            type: "npc",
            id: record.combat.label,
            collider: record.actor.getMovementCollider(),
          }));
        if (currentRecord.combat.isAlive) {
          currentRecord.actor.update(
            activeDelta,
            playerRecord?.combat.isAlive && playerSnapshot ? [playerSnapshot] : [],
            [...getNavigationColliders(currentRecord.actor), ...projectileState],
          );
        }
      }

      if (activeDelta > 0 && !TEMPORARILY_FREEZE_ENEMY_AI && !TEMPORARILY_DISABLE_ENEMY_UPDATES) enemyPlanningScheduler.beginFrame();
      for (const record of enemyRecords) {
        if (!record.combat.isAlive) {
          record.awareness?.dispose();
          record.controller.cancel?.();
          continue;
        }
        if (TEMPORARILY_DISABLE_ENEMY_UPDATES) {
          continue;
        }
        if (TEMPORARILY_FREEZE_ENEMY_AI) {
          record.actor.setMovementIntent?.({ x: 0, y: 0 });
        } else {
          record.awareness.update(activeDelta);
        }
        record.actor.update(activeDelta, getNavigationColliders(record.actor), record.character === SpawnerCharacter.WARRIOR ? projectileState : [], playerSnapshot
          ? { ...playerSnapshot, targetable: canEnemyTargetPlayer(playerSnapshot, record.reaction),
            detected: canEnemyTargetPlayer(playerSnapshot, record.reaction)
              && (playerSnapshot.detectedBy.includes(record.combat.label)
                || (playerSnapshot.hidden && record.reaction.canTrackHiddenPlayer())) }
          : null);
      }
      const stealthZones = stealthAttacks.update(enemyRecords.map((record) => ({
        id: record.combat.label,
        isAlive: record.combat.isAlive,
        cell: record.actor.getGridPosition(TILE_SIZE),
        position: record.actor.getPosition(),
        heading: record.actor.getHeading?.() ?? "right",
      })), activeDelta);
      playerRecord?.actor.observeStealthAttackZones(stealthZones);
      for (const record of [playerRecord, ...enemyRecords]) {
        if (record) characterPerception.updateActor(record.combat.label, {
          isAlive: record.combat.isAlive,
          isMoving: record === playerRecord && playerPositionBeforeUpdate != null
            && (record.actor.getPosition().x !== playerPositionBeforeUpdate.x
              || record.actor.getPosition().y !== playerPositionBeforeUpdate.y),
          suppressAudio: record === playerRecord && record.actor.isStealthAttackAudioSuppressed?.(),
          targetState: record === playerRecord && isPlayerHidden(playerCombatCollider, reactiveDecorations)
            ? PerceptionTargetState.Hidden
            : PerceptionTargetState.Default,
          cell: record.actor.getGridPosition(TILE_SIZE),
          heading: record.actor.getHeading?.() ?? "right",
        });
      }
      characterPerception.update(activeDelta);
      if (playerRecord?.combat.isAlive && playerCombatCollider) {
        const hidingBush = getPlayerHidingBush(playerCombatCollider, reactiveDecorations);
        const hidden = hidingBush !== null;
        const depthBush = getPlayerHidingBush(
          playerCombatCollider,
          reactiveDecorations,
          getCharacterGridCell(playerRecord.actor.getMovementCollider(), TILE_SIZE),
        );
        playerRecord.actor.setRenderOrder(depthBush ? depthBush.layer.order - 0.01 : null);
        if (playerRecord.targetState === undefined) playerRecord.targetState = PerceptionTargetState.Default;
        if (playerRecord.hiddenOpacity === undefined) playerRecord.hiddenOpacity = 1;
        const nextTargetState = hidden ? PerceptionTargetState.Hidden : PerceptionTargetState.Default;
        if (playerRecord.targetState !== nextTargetState) {
          playerRecord.targetState = nextTargetState;
          playerRecord.expressionInstances ??= [];
          for (const instance of playerRecord.expressionInstances) instance.phase = "out";
          if (hidden) playerRecord.expressionInstances.push({ icon: "H", flash: null, opacity: 0, phase: "in" });
        }
        playerRecord.hiddenOpacity = stepHiddenOpacity(
          playerRecord.hiddenOpacity,
          hidden,
          activeDelta,
          PLAYER_HIDDEN_FADE_SECONDS,
        );
        playerRecord.actor.setVisualTransform({ alpha: playerRecord.hiddenOpacity });
        const step = activeDelta / ENEMY_EXPRESSION_INSTANCE_FADE_SECONDS;
        for (const instance of playerRecord.expressionInstances) {
          if (instance.phase === "in") {
            instance.opacity = Math.min(1, instance.opacity + step);
            if (instance.opacity >= 1 - 1e-6) { instance.opacity = 1; instance.phase = "steady"; }
          } else if (instance.phase === "out") instance.opacity = Math.max(0, instance.opacity - step);
        }
        playerRecord.expressionInstances = playerRecord.expressionInstances.filter((instance) => instance.phase !== "out" || instance.opacity > 0.0001);
      }
      for (const record of enemyRecords) {
        record.reaction?.update(activeDelta);
        if (!record.expressionInstances) {
          record.expressionInstances = [];
        }
        const reactionSnapshot = record.reaction?.getSnapshot();
        const nextState = reactionSnapshot?.state ?? "NONE";
        const nextExpression = getEnemyExpression(nextState);
        if (record.expressionState !== nextState) {
          for (const instance of record.expressionInstances) {
            if (instance.phase !== "out") {
              instance.phase = "out";
            }
          }
          if (nextExpression.icon) {
            record.expressionInstances.push({
              icon: nextExpression.icon,
              flash: nextExpression.flash,
              opacity: 0,
              phase: "in",
            });
          }
          if (nextExpression.flash) {
            record.expressionFlashRemaining = ENEMY_EXPRESSION_FADE_SECONDS;
            record.expressionFlashColor = nextExpression.flash === "white" ? [1.8, 1.8, 1.8, 1]
              : nextExpression.flash === "yellow" ? [1.8, 1.8, 0.3, 1]
              : [1.8, 0.6, 0.6, 1];
          }
          record.expressionState = nextState;
        }

        const step = activeDelta / ENEMY_EXPRESSION_INSTANCE_FADE_SECONDS;
        for (const instance of record.expressionInstances) {
          if (instance.phase === "in") {
            instance.opacity = Math.min(1, instance.opacity + step);
            if (instance.opacity >= 1 - 1e-6) {
              instance.phase = "steady";
              instance.opacity = 1;
            }
          } else if (instance.phase === "out") {
            instance.opacity = Math.max(0, instance.opacity - step);
          }
        }

        record.expressionInstances = record.expressionInstances.filter((instance) => {
          if (instance.phase !== "out" || instance.opacity > 0.0001) {
            return true;
          }
          return false;
        });
        const visible = record.expressionInstances.find((instance) => instance.opacity > 0);
        record.expression = visible
          ? {
              ...getEnemyExpression(record.expressionState),
              icon: visible.icon,
              flash: visible.flash,
              opacity: visible.opacity,
            }
          : getEnemyExpression("NONE");
        if (record.expressionFlashRemaining > 0) {
          const expressionElapsedSeconds = ENEMY_EXPRESSION_FADE_SECONDS - record.expressionFlashRemaining;
          const jumpElapsedSeconds = Math.min(expressionElapsedSeconds, EMOTIONAL_JUMP_DURATION_SECONDS);
          const jumpProgress = jumpElapsedSeconds / EMOTIONAL_JUMP_DURATION_SECONDS;
          if (jumpElapsedSeconds >= EMOTIONAL_JUMP_DURATION_SECONDS) {
            record.actor.setArtYOffset?.(0);
            record.expressionJumpOffset = 0;
          } else {
            const bounceProgress = jumpProgress < 0.5 ? jumpProgress * 2 : (1 - jumpProgress) * 2;
            const jumpOffset = -EMOTIONAL_JUMP_HEIGHT_PIXELS * (1 - ((1 - bounceProgress) ** 2));
            record.actor.setArtYOffset?.(jumpOffset);
            record.expressionJumpOffset = jumpOffset;
          }
          if (!record.combat.isDamageFlashing) record.actor.setVisualTransform({ color: record.expressionFlashColor });
          record.expressionFlashRemaining = Math.max(0, record.expressionFlashRemaining - activeDelta);
          if (record.expressionFlashRemaining === 0) {
            if (!record.combat.isDamageFlashing) record.actor.setVisualTransform({ color: [1, 1, 1, 1] });
            record.actor.setArtYOffset?.(0);
            record.expressionJumpOffset = 0;
          }
        } else {
          record.expressionJumpOffset = 0;
        }
      }

      const reactiveCharacters = [
        ...(playerMovementCollider
          ? [{
              id: playerRecord.combat.label,
              type: CharacterType.PLAYER,
              collider: playerRecord.actor.getMovementCollider(),
            }]
          : []),
        ...sheepRecords.filter(({ combat }) => combat.isAlive).map((record) => ({
          id: record.combat.label,
          type: "npc",
          collider: record.actor.getMovementCollider(),
        })).filter(({ collider }) => collider),
        ...enemyRecords.filter(({ combat }) => combat.isAlive).map((record) => ({
          id: record.combat.label,
          type: CharacterType.ENEMY,
          collider: record.actor.getMovementCollider(),
        })).filter(({ collider }) => collider),
      ];
      for (const decoration of reactiveDecorations) {
        decoration.update(reactiveCharacters, activeDelta);
      }
      for (const object of goldStoneObjects) object.update(activeDelta);
      pickupSystem.update(activeDelta, playerCombatCollider);

      resolveMeleeImpacts(enemyRecords, playerRecord);
      projectiles.update(activeDelta, [], (arrow) => resolveEnemyArrowPlayerHit(arrow, playerRecord));
      projectiles.collectGroundedArrows(enemyRecords
        .filter(({ character, combat }) => character === SpawnerCharacter.ARCHER && combat.isAlive)
        .map(({ combat }) => ({ id: combat.label, collider: combat.getCombatCollider() })));
      const projectilesToRemove = [];
      for (const { id, collider, direction, ownerId } of projectiles.getColliders()) {
        // Owned archer arrows hit only the player through the flight-step check above.
        if (ownerId != null) continue;
        let hit = false;
        for (const target of [...sheepCombatColliders, ...enemyCombatColliders, ...goldStoneObjects.map((object) => ({ record: { type: "object", combat: object }, collider: object.getCombatCollider() }))]) {
          if (!target.record.combat.isAlive || !target.collider || target.record.combat.label === ownerId) {
            continue;
          }
          if (collidersOverlap(collider, target.collider)) {
            const result = target.record.type === "object"
              ? (target.record.combat.applyDamage(1), projectiles.markHit(id), "damaged")
              : resolveProjectileHit(
              projectiles,
              { id, direction },
              target.record,
            );
            if (result === "damaged") projectilesToRemove.push(id);
            hit = true;
            break;
          }
        }
        if (hit) {
          continue;
        }
      }
      if (projectilesToRemove.length > 0) {
        projectiles.removeProjectiles(projectilesToRemove);
      }

      for (const enemyTarget of enemyCombatColliders) {
        if (!enemyTarget.record.combat.isAlive || !enemyTarget.collider) {
          continue;
        }
        for (const sheepTarget of sheepCombatColliders) {
          if (
            !sheepTarget.record.combat.isAlive
            || !sheepTarget.collider
            || !collidersOverlap(enemyTarget.collider, sheepTarget.collider)
          ) {
            continue;
          }
          const pair = makeTouchKey(
            enemyTarget.record.combat.label,
            sheepTarget.record.combat.label,
          );
          nextTouchPairs.add(pair);
          if (!activeTouchPairs.has(pair)) {
            sheepTarget.record.combat.applyDamage(
              100,
              makeDirection(
                enemyTarget.record.actor.getPosition(),
                sheepTarget.record.actor.getPosition(),
              ),
            );
          }
        }
      }

      activeTouchPairs = nextTouchPairs;
      if (playerSnapshot) {
        coordinatesUi.update(playerSnapshot.position, playerSnapshot.cell);
        if (gameStateMachine.state === GameState.LEVEL_PLAYING && playerRecord.combat.isAlive
          && goal.isReachedBy(playerRecord.actor)) {
          playerRecord.actor.setInputEnabled(false);
          if(!progress.hasNext)treasure.end();
          gameStateMachine.goalReached();
          playSfx("win");
          pauseController.pause();
          goalExit = createGoalExit(playerRecord.actor, goal.position, () => levelReward.show());
        }
      }
    }
    const trackedPlayer = getRecordsByType(SpawnerType.PLAYER)[0];
    if(!pauseController.isPaused)for(const spawner of treasureSpawners)for(const chest of spawner.objects)chest.update(trackedPlayer?.actor,gameStateMachine.state===GameState.LEVEL_PLAYING&&trackedPlayer?.combat.isAlive);
    const cameraDelta = gameStateMachine.state === GameState.LEVEL_PLAYING ? pauseController.getDelta(activeDelta) : 0;
    camera.update(trackedPlayer?.actor.getPosition(), cameraDelta);
    goal.updateView(camera);
    syncVisionShadows(characterPerception.getSnapshot(), stealthShadowLifecycle.update(stealthAttacks.getZones(), activeDelta));
    const diagnosticCharacters = [
      ...spawnerByType.get(SpawnerType.PLAYER).actors,
      ...getRecordsByType(SpawnerType.SHEEP),
    ...getRecordsByType(SpawnerType.ENEMY),
    ].filter(({ combat }) => combat.isAlive).map((record) => ({
      actor: record.actor,
      combat: record.combat,
      type: record.type,
      movementCollider: record.actor.getMovementCollider(),
      character: record.character,
      reaction: record.reaction,
      expression: record.reaction || record.expressionInstances?.length
        ? (record.expression ?? getEnemyExpression("NONE"))
        : null,
      expressionInstances: record.expressionInstances ?? [],
    })).filter(({ combat }) => combat.isAlive).map((record) => ({
      combatCollider: record.combat.getCombatCollider(),
      movementCollider: record.movementCollider,
      character: record.character,
      expressionJumpOffset: record.expressionJumpOffset,
      expression: record.expression,
      expressionInstances: record.expressionInstances,
      perception: record.actor.getPerceptionSnapshot?.() ?? null,
      isPlayer: record.type === SpawnerType.PLAYER,
      gridSpot: record.actor.getGridSpot?.() ?? new GridSpot(
        getColliderCenter(record.actor.getMovementCollider()),
        { width: TILE_SIZE, height: TILE_SIZE },
      ),
    }));
    diagnosticCharacters.push(...reactiveDecorations
      .filter((decoration) => !decoration.isDead)
      .map((decoration) => {
        const combatCollider = decoration.getCombatCollider();
        if (!combatCollider) return null;
        const centerX = combatCollider.x + combatCollider.width / 2;
        const centerY = combatCollider.y + combatCollider.height / 2;
        return {
        combatCollider,
        // The bush sensor is a non-blocking trigger, not a walkability
        // collider. Keep it out of the green movement-collider diagnostics.
        movementCollider: null,
        gridSpot: decoration.getGridSpot?.() ?? new GridSpot({ x: centerX, y: centerY }, { width: TILE_SIZE, height: TILE_SIZE }),
        };
      }).filter(Boolean));
    diagnosticCharacters.push(...grassDecorations.instances.map(({ gridSpot }) => ({ gridSpot, movementCollider: null, combatCollider: null })));
    diagnosticCharacters.push(...goldStoneObjects
      .filter((object) => !object.isDead)
      .map((object) => ({
        combatCollider: object.getCombatCollider(),
        movementCollider: null,
        gridSpot: new GridSpot(getColliderCenter(object.getCombatCollider()), { width: TILE_SIZE, height: TILE_SIZE }),
      })));
    diagnosticCharacters.push(...pickupSystem.pickups
      .filter((pickup) => !pickup.isDead)
      .map((pickup) => ({
        combatCollider: pickup.getCombatCollider(),
        movementCollider: null,
        gridSpot: new GridSpot(pickup.position, { width: TILE_SIZE, height: TILE_SIZE }),
      })));
    diagnosticCharacters.push(...[...projectiles.getColliders(), ...projectiles.getPickupColliders()].map(({ collider, gridSpot }) => ({
      gridSpot: gridSpot ?? new GridSpot(getColliderCenter(collider), { width: TILE_SIZE, height: TILE_SIZE }),
      movementCollider: null,
      combatCollider: collider,
    })));
    if (goal?.movementCollider) {
      diagnosticCharacters.push({
        gridSpot: goal.getGridSpot?.() ?? new GridSpot(getColliderCenter(goal.movementCollider), { width: TILE_SIZE, height: TILE_SIZE }),
        combatCollider: null,
        movementCollider: goal.movementCollider,
      });
    }
    drawDiagnostics(
      terrainTiles,
      diagnosticCharacters,
      projectiles.getColliders(),
      showColliders,
      characterPerception.getSnapshot(),
      pickupSystem.pickups,
      selectionSystem.getSelectedGridSpot(),
      camera,
      runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showEnemyAiLabels)
        ? getRecordsByType(SpawnerType.ENEMY).filter(record => record.combat.isAlive).map(record => enemyAiLabel({
            position: record.actor.getPosition(), snapshot: record.brain.getNavigationSnapshot(), jumpOffset: record.expressionJumpOffset,
          }, SCREEN_HEIGHT)) : [],
      {
        overheadCharacters: spawners.flatMap(spawner => spawner.actors),
        coordinates: runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showCoordinates),
        perceptions: runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showEnemyPerceptions),
        visionOptions: getVisionOptions(characterPerception.getSnapshot()),
        tileMapInfo: runtimeSettingsStore.get(RUNTIME_DEBUG_SETTING_KEYS.showTileMapInfo),
      },
    );
    canvas.dataset.bushDebug = JSON.stringify(getBushBurningSnapshot());
    if (import.meta.env.DEV) canvas.dataset.aiWork = JSON.stringify(enemyPlanningScheduler.snapshot());
    if (import.meta.env.DEV) canvas.dataset.navigationDebug = JSON.stringify(
      [SpawnerType.ENEMY, SpawnerType.SHEEP].flatMap(type => getRecordsByType(type))
        .filter(record => record.combat.isAlive)
        .map(record => ({ id: record.combat.label, character: record.character ?? record.type,
          ...(record.controller ?? record.actor).getNavigationSnapshot?.() })),
    );

    if (!disposed) animationFrameId = requestAnimationFrame(update);
  }

  let animationFrameId = requestAnimationFrame(update);
  await startEngine(engine);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      bisSessionActive=false;
      rewardFeedback.dispose();
      setGameplayMusicActive(false);
      cancelAnimationFrame(animationFrameId);
    runPresentation.dispose();
    levelReward.dispose();
    paidContinue.dispose();
    grassDecorations.dispose();
    let preserveContracts=false;
    try{const next=JSON.parse(sessionStorage.getItem('stealth-steel-level-run-v1')??'null');preserveContracts=next?.pendingTransition===true&&next.completed>0;}catch{}
    unsubscribeTreasureReveal();treasureUi.dispose();treasure.dispose({preserveSession:preserveContracts});
    for(const spawner of treasureSpawners)spawner.dispose();
    for(const layer of treasureLayers)removeSpriteRendererLayer(renderer,layer);
    unsubscribeEquipment();
    accountHost.dispose({preserveContracts});
    canvas.removeEventListener("pointerup", handleGridSelection);
    unsubscribeCoordinates();
    unsubscribeColliders();
    for (const spawner of spawners) {
      spawner.dispose();
    }
    for (const decoration of reactiveDecorations) {
      decoration.dispose();
    }
    for (const object of goldStoneObjects) object.dispose();
    goal.dispose();
    removeSpriteRendererLayer(renderer, goalLayer);
    levelCompleteUi.dispose();
    levelLostUi.dispose();
    startGamePrompt?.close();
    itemsWindow?.window?.close?.();
    settingsUi?.developerWindow?.close?.();
    settingsUi?.activeWindow?.close?.();
    settingsUi?.gear.remove();
    gameUi.replaceChildren();
    pickupSystem.dispose();
    projectiles.dispose();
    for (const effect of daggerComboEffects) effect.dispose();
    debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    globalThis.characterPerceptionDebug = undefined;
    globalThis.bushBurningDebug = undefined;
    globalThis.levelCameraDebug = undefined;
    disposeSpriteRenderer(renderer);
    disposeEngine(engine);
    },
  };
}

function worldAabbToScreen(aabb) {
  return {
    x: aabb.x,
    y: SCREEN_HEIGHT - aabb.y - aabb.height,
    width: aabb.width,
    height: aabb.height,
  };
}

function drawAabb(aabb, fillStyle, strokeStyle, lineWidth = 2) {
  const screenAabb = worldAabbToScreen(aabb);
  debugContext.fillStyle = fillStyle;
  debugContext.fillRect(
    screenAabb.x,
    screenAabb.y,
    screenAabb.width,
    screenAabb.height,
  );
  debugContext.strokeStyle = strokeStyle;
  debugContext.lineWidth = lineWidth;
  debugContext.strokeRect(
    screenAabb.x + 1,
    screenAabb.y + 1,
    screenAabb.width - 2,
    screenAabb.height - 2,
  );
}

function drawPolygon(polygon, fillStyle, strokeStyle, lineWidth = 2) {
  const screenPoints = polygon.points.map((point) => ({
    x: point.x,
    y: SCREEN_HEIGHT - point.y,
  }));
  debugContext.beginPath();
  debugContext.moveTo(screenPoints[0].x, screenPoints[0].y);
  for (const point of screenPoints.slice(1)) {
    debugContext.lineTo(point.x, point.y);
  }
  debugContext.closePath();
  debugContext.fillStyle = fillStyle;
  debugContext.fill();
  debugContext.strokeStyle = strokeStyle;
  debugContext.lineWidth = lineWidth;
  debugContext.stroke();
}

function drawTerrainCollider(collider) {
  if (collider.type === "polygon") {
    drawPolygon(collider, TERRAIN_COLLIDER_STYLE.fillStyle, TERRAIN_COLLIDER_STYLE.strokeStyle, TERRAIN_COLLIDER_STYLE.lineWidth);
    return;
  }

  drawAabb(collider, TERRAIN_COLLIDER_STYLE.fillStyle, TERRAIN_COLLIDER_STYLE.strokeStyle, TERRAIN_COLLIDER_STYLE.lineWidth);
}

function drawCircle(circle, fillStyle, strokeStyle) {
  debugContext.beginPath();
  debugContext.arc(
    circle.x,
    SCREEN_HEIGHT - circle.y,
    circle.radius,
    0,
    Math.PI * 2,
  );
  debugContext.fillStyle = fillStyle;
  debugContext.fill();
  debugContext.strokeStyle = strokeStyle;
  debugContext.lineWidth = 2;
  debugContext.stroke();
}

function drawCharacterCollider(
  collider,
  fillStyle = "rgb(36 228 255 / 20%)",
  strokeStyle = "#24e4ff",
) {
  if (!collider) {
    return;
  }
  if (collider.type === "circle") {
    drawCircle(collider, fillStyle, strokeStyle);
    return;
  }

  drawAabb(collider, fillStyle, strokeStyle);
}

function drawGridLines(offset = { x: 0, y: 0 }) {
  const left = Math.floor(offset.x / TILE_SIZE) * TILE_SIZE;
  const top = Math.floor(-offset.y / TILE_SIZE) * TILE_SIZE;
  debugContext.beginPath();
  for (let x = left; x <= offset.x + SCREEN_WIDTH; x += TILE_SIZE) {
    debugContext.moveTo(x + 0.5, -offset.y);
    debugContext.lineTo(x + 0.5, SCREEN_HEIGHT - offset.y);
  }
  for (let y = top; y <= SCREEN_HEIGHT - offset.y; y += TILE_SIZE) {
    debugContext.moveTo(offset.x, y + 0.5);
    debugContext.lineTo(offset.x + SCREEN_WIDTH, y + 0.5);
  }
  debugContext.strokeStyle = "rgb(80 86 92 / 48%)";
  debugContext.lineWidth = 1;
  debugContext.stroke();
}

function drawDiagnostics(
  terrainTiles,
  diagnosticCharacters,
  projectileColliders,
  enabled,
  perceptionSnapshot = [],
  goldPickups = [],
  selectedGridSpot = null,
  camera = null,
  enemyAiLabels = [],
  { coordinates = false, perceptions = false, tileMapInfo = false, visionOptions = {}, overheadCharacters = [] } = {},
) {
  debugContext.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  const offset = camera?.getOffset() ?? { x: 0, y: 0 };
  debugContext.save();
  debugContext.translate(-offset.x, offset.y);
  drawCharacterOverheads(debugContext, statusBadgeArt, overheadCharacters, SCREEN_HEIGHT);
  drawEnemyAiLabels(debugContext, enemyAiLabels, { x: offset.x, y: -offset.y, width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  if (tileMapInfo) drawGridLines(offset);
  if (tileMapInfo && selectedGridSpot) {
    drawAabb({
      x: selectedGridSpot.x * TILE_SIZE,
      y: selectedGridSpot.y * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    }, "rgb(250 204 21 / 18%)", "#facc15");
  }
  debugContext.font = "700 8px system-ui, sans-serif";
  debugContext.textBaseline = "middle";

  for (const tile of terrainTiles) {
    if (enabled) for (const collider of tile.colliders) {
      drawTerrainCollider(collider);
    }

    if (!tileMapInfo) continue;
    const label = formatLevelCellLabel(tile.gameCell);
    const labelWidth = debugContext.measureText(label).width + 8;
    const labelX = tile.screenPosition.x + TILE_SIZE - labelWidth;
    const labelY = tile.screenPosition.y + 8;
    debugContext.fillStyle = "rgb(5 10 18 / 78%)";
    debugContext.fillRect(
      labelX,
      labelY - 8,
      labelWidth,
      16,
    );
    debugContext.fillStyle = tile.valid ? "#ffffff" : "#8f969f";
    debugContext.textAlign = "center";
    debugContext.fillText(
      label,
      labelX + labelWidth / 2,
      labelY,
    );
  }

  if (enabled) for (const { collider, style } of createCharacterColliderDrawCommands(
    diagnosticCharacters,
  )) {
    drawCharacterCollider(
      collider,
      style.fillStyle,
      style.strokeStyle,
    );
  }
  // Draw the black live-center marker first so the white logical marker
  // remains visually closer to the camera when both occupy the same area.
  if (coordinates) for (const marker of createPlayerCenterMarkerCommands(diagnosticCharacters)) {
    drawGridSpotMarker(debugContext, marker, SCREEN_HEIGHT);
  }
  if (coordinates) for (const marker of createGridSpotMarkerCommands(diagnosticCharacters)) {
    drawGridSpotMarker(debugContext, marker, SCREEN_HEIGHT);
  }
  drawPerceptionDiagnostics(debugContext, perceptionSnapshot, TILE_SIZE, SCREEN_HEIGHT, performance.now(), {
    enabled: perceptions, visionOptions,
  });
  if (perceptions) for (const marker of createActivePerceptionMarkerCommands(perceptionSnapshot, TILE_SIZE)) {
    const screenY = SCREEN_HEIGHT - marker.y;
    const halfSize = marker.style.size / 2;
    debugContext.beginPath();
    debugContext.moveTo(marker.x - halfSize, screenY - halfSize);
    debugContext.lineTo(marker.x + halfSize, screenY + halfSize);
    debugContext.moveTo(marker.x + halfSize, screenY - halfSize);
    debugContext.lineTo(marker.x - halfSize, screenY + halfSize);
    debugContext.strokeStyle = marker.style.strokeStyle;
    debugContext.lineWidth = marker.style.lineWidth;
    debugContext.stroke();
  }
  if (enabled) for (const { collider } of projectileColliders) {
    drawAabb(collider, "rgb(255 220 64 / 38%)", "#ffe066");
  }
  debugContext.restore();
}

function drawCharacterCenterMarker(center) {
  const screenY = SCREEN_HEIGHT - center.y;
  const size = 2.5;
  debugContext.beginPath();
  debugContext.moveTo(center.x - size, screenY - size);
  debugContext.lineTo(center.x + size, screenY + size);
  debugContext.moveTo(center.x + size, screenY - size);
  debugContext.lineTo(center.x - size, screenY + size);
  debugContext.strokeStyle = "#000000";
  debugContext.lineWidth = 2;
  debugContext.stroke();
}

function formatStartupError(error) {
  const detail = error instanceof Error ? error.message : String(error);

  if (/source image could not be decoded|decode/i.test(detail)) {
    return [
      "The game could not load one of its image assets because its image URL may be broken or the file is not a valid image.",
      "Refresh the page. If the problem continues, make sure the app is running through Vite and check the browser console for the broken URL or failed asset path.",
      `Details: ${detail}`,
    ].join(" ");
  }

  if (/WebGPU enabled/i.test(detail)) {
    return `${detail} Enable WebGPU in a supported browser, then refresh the page.`;
  }

  return `The game could not start. Refresh the page and check the browser console for more details. Details: ${detail}`;
}

const startupOptions = globalThis.stealthGridStartupOptions ?? {};
const skipIntro = shouldSkipIntro({
  isDevelopment: import.meta.env.DEV,
  search: globalThis.location?.search,
});

export const gameReady = start({ ...startupOptions, showStartPrompt: startupOptions.showStartPrompt !== false && !skipIntro }).catch((error) => {
  console.error(error);
  errorOutput.textContent = formatStartupError(error);
  throw error;
});

export function revealFullscreenTransition() {
  return fullscreenTransition.reveal();
}
