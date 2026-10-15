import { createKnifeSwing } from "../../gameplay/player-melee.js";
import { createDaggerComboController } from "../../gameplay/player-dagger-combo.js";
import { createDistanceImpulse } from "../../gameplay/player-damage.js";
import { createBushGravity } from "./bush-gravity.js";
import { createStealthAttackGravity, createStealthExecution } from "../../gameplay/stealth-attack.js";
import {
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  playSprite2DAnimation,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";

import {
  createGridAlignedMovementController,
  getCharacterCollider,
  isColliderWithinBounds,
  getMovementVector,
  moveWithCollisions,
  selectMovementInput,
  worldToScreen,
} from "../../gameplay/game-logic.js";
import { GRID } from "../../systems/environment/grid-contract.js";
import { PlayerState, createPlayerStateMachine } from "./player-state.js";
import { createVirtualController } from "../../../../plugins/virtual-controller-babylon-lite/index.js";
import { getCharacterGridCell, getCharacterLayerOrder } from "../character-spatial.js";
import { GridSpot } from "../../systems/environment/grid-spot.js";
import {
  PLAYER_ITEMS,
  PLAYER_PAWN_FRAME,
  PLAYER_WEAPONS,
  cycleLoadout,
} from "./player-pawn-catalog.js";
import {
  CardinalDirection,
  createCardinalDirectionMemory,
} from "../../gameplay/cardinal-direction.js";

export function getLoadoutCycleType(event) {
  if (event.code === "Digit1" || event.code === "Numpad1" || event.key === "1") {
    return "weapon";
  }
  if (event.code === "Digit2" || event.code === "Numpad2" || event.key === "2") {
    return "item";
  }
  return null;
}

export const PLAYER_FRAME = PLAYER_PAWN_FRAME;
export const PLAYER_PIVOT = { x: 0.5, y: 0.78 };
// Artwork offset within the character's grid cell. Colliders stay anchored
// to the gameplay position so this can be tuned independently later.
export const PLAYER_ART_OFFSET = Object.freeze({ x: 0, y: -40 });
export const PLAYER_MOVEMENT_COLLIDER = {
  type: "circle",
  x: PLAYER_FRAME.width * PLAYER_PIVOT.x,
  y: PLAYER_FRAME.height * PLAYER_PIVOT.y,
  radius: 18.2,
};
export const PLAYER_COMBAT_COLLIDER = {
  x: PLAYER_FRAME.width * PLAYER_PIVOT.x - GRID.tileSizePx / 2,
  y: PLAYER_FRAME.height * PLAYER_PIVOT.y + GRID.tileSizePx / 2 - GRID.tileSizePx,
  width: GRID.tileSizePx,
  height: GRID.tileSizePx,
};
const PLAYER_CHARACTER = {
  frame: PLAYER_FRAME,
  pivot: PLAYER_PIVOT,
  collider: PLAYER_MOVEMENT_COLLIDER,
};

const PLAYER_SPEED = 210;
const ENABLE_QUANTIZE_MOVEMENT = false;
const ARROW_SPAWN_OFFSETS = new Map([
  ["1,0", { x: 64, y: 55 }],
  ["-1,0", { x: -64, y: 55 }],
  ["0,1", { x: 0, y: 64 }],
  ["0,-1", { x: 0, y: 0 }],
]);
const DEFAULT_KNOCKBACK_DURATION_SECONDS = 0.15;
const DEFAULT_KNOCKBACK_SPEED = 300;
const MOVEMENT_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
]);

export function getArrowSpawnPosition(position, direction) {
  const offset = ARROW_SPAWN_OFFSETS.get(`${direction.x},${direction.y}`)
    ?? ARROW_SPAWN_OFFSETS.get("1,0");
  return {
    x: position.x + offset.x,
    y: position.y + offset.y,
  };
}

export async function loadPlayerAtlases(engine) {
  const options = {
    gridSize: [PLAYER_FRAME.width, PLAYER_FRAME.height],
    sampling: "nearest",
  };
  const [idle, run, attack, ...loadoutAtlases] = await Promise.all([
    loadSpriteAtlas(engine, "./assets/images/player/pawn/Pawn_Idle.png", options),
    loadSpriteAtlas(engine, "./assets/images/player/pawn/Pawn_Run.png", options),
    loadSpriteAtlas(engine, "./assets/images/player/pawn/Pawn_Interact Knife.png", options),
    ...["Axe", "Gold", "Hammer", "Knife", "Meat", "Pickaxe", "Wood"].flatMap((name) => [
      loadSpriteAtlas(engine, `./assets/images/player/pawn/Pawn_Idle ${name}.png`, options),
      loadSpriteAtlas(engine, `./assets/images/player/pawn/Pawn_Run ${name}.png`, options),
    ]),
  ]);
  const atlases = { idle, run, attack };
  for (const [index, name] of ["axe", "gold", "hammer", "knife", "meat", "pickaxe", "wood"].entries()) {
    atlases[`idle-${name}`] = loadoutAtlases[index * 2];
    atlases[`run-${name}`] = loadoutAtlases[index * 2 + 1];
  }
  return atlases;
}

export function createPlayer({
  atlases,
  bounds,
  obstacles,
  initialPosition,
  initialLoadout = {},
  movementMultiplier = 1,
  onAttackStart = () => {},
  onExecutionStart = () => null,
  onStealthAttackEnter = () => {},
  onAttackImpact = () => {},
  onDropItem = () => {},
}) {
  let position = { ...initialPosition };
  const gridSpot = new GridSpot(position, { width: GRID.tileSizePx, height: GRID.tileSizePx });
  const getArtScreenPosition = (worldPosition) => worldToScreen({
    x: worldPosition.x + PLAYER_ART_OFFSET.x,
    y: worldPosition.y + PLAYER_ART_OFFSET.y,
  }, 1, (bounds.renderHeight ?? bounds.height));
  const initialScreenPosition = getArtScreenPosition(position);
  const initialOrder = getCharacterLayerOrder(
    getCharacterCollider(position, PLAYER_FRAME, PLAYER_PIVOT, PLAYER_MOVEMENT_COLLIDER), bounds,
  );
  const layers = {};
  const sprites = {};
  let visualPivot = PLAYER_PIVOT;
  for (const animation of Object.keys(atlases)) {
    const layer = createSprite2DLayer(atlases[animation], {
      capacity: 1,
      order: initialOrder,
      pivot: [PLAYER_PIVOT.x, PLAYER_PIVOT.y],
      visible: animation === "idle",
    });
    layers[animation] = layer;
    sprites[animation] = addSprite2D(layer, {
      positionPx: [initialScreenPosition.x, initialScreenPosition.y],
      sizePx: [PLAYER_FRAME.width, PLAYER_FRAME.height],
      frame: 0,
    });
  }

  const pressedKeys = new Set();
  let inputEnabled = true;
  const bushGravity = createBushGravity();
  const stealthAttackGravity = createStealthAttackGravity();
  const stealthExecution = createStealthExecution();
  const knockbackImpulse = createDistanceImpulse();
  const stateMachine = createPlayerStateMachine();
  const knifeSwing = createKnifeSwing();
  const daggerCombo = createDaggerComboController();
  let activeDaggerMove = null;
  let comboEligibleTargetIds = new Set();
  let weaponSlot = initialLoadout.weapon ?? null;
  let itemSlot = initialLoadout.item ?? null;
  let presentationOverride = null;
  let presentationOverrideTimer = 0;
  let comboFlashTimer = 0;
  let animationManager = null;
  let activeAnimation = null;
  let visualAlpha = 1;
  let renderOrderOverride = null;
  const shotDirectionMemory = createCardinalDirectionMemory(
    CardinalDirection.RIGHT,
  );
  const gridAlignedMovement = createGridAlignedMovementController(
    PLAYER_CHARACTER,
    GRID.tileSizePx,
  );

  function getSelectedMovement() {
    if (!inputEnabled) return { x: 0, y: 0 };
    return selectMovementInput(
      getMovementVector(pressedKeys),
      virtualController.getMovement(),
    );
  }

  function playStateAnimation(name) {
    if (!animationManager) {
      return;
    }
    if (activeAnimation) {
      stopSpriteAnimation(activeAnimation);
    }
    const visibleName = name === "idle" || name === "run"
      ? getLocomotionAnimationName(name)
      : name;
    for (const [layerName, layer] of Object.entries(layers)) {
      layer.visible = layerName === visibleName;
    }
    if (visibleName === "attack") {
      activeAnimation = null;
      updateSprite2D(sprites.attack, { frame: knifeSwing.frame });
      return;
    }
    const lastFrame = visibleName.startsWith("idle") ? 7 : 5;
    activeAnimation = playSprite2DAnimation(animationManager, sprites[visibleName], 0, lastFrame, true, 100);
  }

  function getLocomotionAnimationName(name) {
    const suffix = presentationOverride
      || itemSlot
      || (!itemSlot && weaponSlot);
    return suffix ? `${name}-${suffix}` : name;
  }

  function getAnimationName(state) {
    if (state === PlayerState.RUNNING) {
      return "run";
    }
    if (state === PlayerState.ATTACKING) {
      return "attack";
    }
    return "idle";
  }

  function attack() {
    if (!inputEnabled || stealthExecution.active) return;
    const execution = onExecutionStart();
    if (execution && stealthExecution.start(execution.direction)) {
      // An execution owns this Attack completely: discard an in-flight normal
      // move as well as any buffered combo input before it can reach a midpoint.
      knifeSwing.cancel();
      daggerCombo.cancel();
      activeDaggerMove = null;
      comboEligibleTargetIds.clear();
      const transition = stateMachine.startAttack("stealth-execution");
      if (transition.changed) playStateAnimation("attack");
      return;
    }
    const request = daggerCombo.request();
    if (!request.accepted || request.buffered) return;
    if (!knifeSwing.start(request.move)) return;
    activeDaggerMove = request.move;
    if (activeDaggerMove.id === "ordinary") comboEligibleTargetIds.clear();
    if (activeDaggerMove.multiplier > 1) {
      comboFlashTimer = 0.12;
      setVisualTransform({ color: [1.15, 1.35, 1.6, 1] });
    }
    onAttackStart(activeDaggerMove);
    const transition = stateMachine.startAttack("knife");
    if (transition.changed) playStateAnimation("attack");
  }

  function cancelAttack() {
    knifeSwing.cancel();
    daggerCombo.cancel();
    activeDaggerMove = null;
    comboEligibleTargetIds.clear();
    stealthExecution.cancel();
    const transition = stateMachine.completeAttack(getSelectedMovement());
    if (transition.changed) playStateAnimation(getAnimationName(transition.state));
  }

  function setVisualTransform({
    scaleX,
    scaleY,
    alpha,
    rotation,
    pivot,
    color,
    sizePx,
  }) {
    const patch = {};
    if (pivot !== undefined) {
      visualPivot = { x: pivot[0], y: pivot[1] };
      for (const layer of Object.values(layers)) layer.pivot = [...pivot];
      updateSprites();
    }
    if (scaleX !== undefined) {
      patch.scaleX = scaleX;
    }
    if (scaleY !== undefined) {
      patch.scaleY = scaleY;
    }
    if (alpha !== undefined) {
      visualAlpha = alpha;
      for (const layer of Object.values(layers)) {
        layer.opacity = visualAlpha;
      }
    }
    if (rotation !== undefined) {
      patch.rotation = rotation;
    }
    if (color !== undefined) {
      patch.color = color;
    }
    if (sizePx !== undefined) {
      patch.sizePx = sizePx;
      const screenPosition = getArtScreenPosition(position);
      patch.positionPx = [
        screenPosition.x + (0.5 - PLAYER_PIVOT.x) * (PLAYER_FRAME.width - sizePx[0]),
        screenPosition.y + (0.5 - PLAYER_PIVOT.y) * (PLAYER_FRAME.height - sizePx[1]),
      ];
    }
    for (const sprite of Object.values(sprites)) {
      updateSprite2D(sprite, patch);
    }
  }

  function updateSprites() {
    const screenPosition = getArtScreenPosition(position);
    const order = renderOrderOverride ?? getCharacterLayerOrder(
      getCharacterCollider(position, PLAYER_FRAME, PLAYER_PIVOT, PLAYER_MOVEMENT_COLLIDER), bounds,
    );
    for (const layer of Object.values(layers)) layer.order = order;
    for (const sprite of Object.values(sprites)) {
      updateSprite2D(sprite, {
        positionPx: [
          screenPosition.x + (visualPivot.x - PLAYER_PIVOT.x) * PLAYER_FRAME.width,
          screenPosition.y + (visualPivot.y - PLAYER_PIVOT.y) * PLAYER_FRAME.height,
        ],
      });
    }
  }

  function useItem() {
    if (!inputEnabled || !itemSlot) return;
    const item = itemSlot;
    itemSlot = null;
    presentationOverride = null;
    onDropItem(item, { ...position }, getSelectedMovement());
    playStateAnimation(stateMachine.state === PlayerState.RUNNING ? "run" : "idle");
  }

  const virtualController = createVirtualController({
    joystick: document.querySelector("#movement-joystick"),
    puck: document.querySelector("#movement-puck"),
    attackButton: document.querySelector("#attack-action"),
    onAttack: attack,
    onMovementChange: (movement) => {
      shotDirectionMemory.rememberMovement(movement);
    },
  });

  function resetInput() {
    pressedKeys.clear();
    virtualController.reset();
    gridAlignedMovement.reset();
  }

  function setKey(event, isPressed) {
    if (!MOVEMENT_KEYS.has(event.code)) {
      return;
    }

    event.preventDefault();
    if (!inputEnabled) {
      pressedKeys.delete(event.code);
      return;
    }
    if (isPressed) {
      pressedKeys.add(event.code);
      shotDirectionMemory.rememberCode(event.code, event.repeat);
    } else {
      pressedKeys.delete(event.code);
    }
  }

  function handleKeyDown(event) {
    const loadoutCycleType = getLoadoutCycleType(event);
    if (loadoutCycleType && !event.repeat) {
      event.preventDefault();
      if (inputEnabled && stateMachine.canChangeLoadout) {
        if (loadoutCycleType === "weapon") {
          weaponSlot = cycleLoadout(weaponSlot, PLAYER_WEAPONS);
          presentationOverride = weaponSlot;
          presentationOverrideTimer = weaponSlot ? 0.5 : 0;
        } else {
          itemSlot = cycleLoadout(itemSlot, PLAYER_ITEMS);
          presentationOverride = itemSlot;
          presentationOverrideTimer = 0;
        }
        if (stateMachine.state !== PlayerState.ATTACKING) {
          playStateAnimation(
            stateMachine.state === PlayerState.RUNNING ? "run" : "idle",
          );
        }
      }
      return;
    }
    if (event.code === "KeyV") {
      event.preventDefault();
      if (!event.repeat) attack();
      return;
    }
    setKey(event, true);
  }

  function handleKeyUp(event) {
    setKey(event, false);
  }

  function handleBlur() {
    pressedKeys.clear();
  }

  function applyKnockback(direction, {
    duration = DEFAULT_KNOCKBACK_DURATION_SECONDS,
    speed = DEFAULT_KNOCKBACK_SPEED,
    distance = speed * duration / 2,
  } = {}) {
    knockbackImpulse.start(direction, { distance, duration });
    bushGravity.cancel();
    stealthAttackGravity.cancel();
  }

  function getKnockbackMovement(deltaSeconds) {
    const displacement = knockbackImpulse.step(deltaSeconds);
    return displacement && { x: displacement.x / Math.max(deltaSeconds, 1e-9), y: displacement.y / Math.max(deltaSeconds, 1e-9) };
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);

  return {
    layers: Object.values(layers),
    get state() { return stateMachine.state; },
    get isAttacking() { return knifeSwing.active || stealthExecution.active; },
    get isExecuting() { return stealthExecution.active; },
    get daggerComboCooldown() { return daggerCombo.cooldown; },
    getFacing() { return stateMachine.facing; },
    cancelAttack,
    observeHidingBushes(bushes) {
      const wasActive = bushGravity.active;
      bushGravity.observe(bushes, position, inputEnabled && !knockbackImpulse.active);
      if (wasActive !== bushGravity.active) gridAlignedMovement.reset();
    },
    observeStealthAttackZones(zones) {
      stealthAttackGravity.observe(zones, position, inputEnabled && !knockbackImpulse.active);
    },
    getArmedStealthAttack() { return stealthAttackGravity.getArmed(); },
    consumeStealthAttack() { return stealthAttackGravity.consume(position); },
    isGravityMoving() { return bushGravity.active; },
    dispose() {
      inputEnabled = false;
      cancelAttack();
      stealthAttackGravity.cancel();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      virtualController.dispose();
      if (activeAnimation) {
        stopSpriteAnimation(activeAnimation);
      }
    },
    getMovementCollider() {
      return getCharacterCollider(
        position,
        PLAYER_FRAME,
        PLAYER_PIVOT,
        PLAYER_MOVEMENT_COLLIDER,
      );
    },
    getCombatCollider() {
      return getCharacterCollider(
        position,
        PLAYER_FRAME,
        PLAYER_PIVOT,
        PLAYER_COMBAT_COLLIDER,
      );
    },
    setMovementMultiplier(value) {
      movementMultiplier = Number.isFinite(value) && value >= 0 && value <= 2 ? value : 1;
    },
    getMovementSpeed() {
      return PLAYER_SPEED * movementMultiplier;
    },
    getPosition() {
      return { ...position };
    },
    setPosition(next) { position = { ...next }; gridSpot.update(position); updateSprites(); },
    getLoadout() {
      return { weapon: weaponSlot, item: itemSlot };
    },
    getGridPosition(tileSize) {
      if (tileSize === GRID.tileSizePx) return { ...gridSpot.cell };
      return getCharacterGridCell(this.getMovementCollider(), tileSize);
    },
    getGridSpot() { return gridSpot; },
    getHeading() {
      return stateMachine.heading;
    },
    isStealthAttackAudioSuppressed() { return stealthAttackGravity.isAudioSuppressed(); },
    resetInput,
    setInputEnabled(enabled, { preserveAttack = false } = {}) {
      inputEnabled = Boolean(enabled);
      if (!inputEnabled) {
        bushGravity.cancel();
        stealthAttackGravity.cancel();
        resetInput();
        if (!preserveAttack) cancelAttack();
      }
    },
    playAnimation(manager) {
      animationManager = manager;
      playStateAnimation("idle");
    },
    setVisualTransform,
    setRenderOrder(order) {
      renderOrderOverride = order === null ? null : Number(order);
      updateSprites();
    },
    update(deltaSeconds, dynamicColliders = []) {
      if (comboFlashTimer > 0) {
        comboFlashTimer = Math.max(0, comboFlashTimer - Math.max(0, deltaSeconds));
        if (comboFlashTimer === 0) setVisualTransform({ color: [1, 1, 1, 1] });
      }
      if (presentationOverrideTimer > 0) {
        presentationOverrideTimer = Math.max(
          0,
          presentationOverrideTimer - Math.max(0, deltaSeconds),
        );
        if (presentationOverrideTimer === 0) {
          presentationOverride = null;
          if (!knifeSwing.active && !stealthExecution.active) playStateAnimation(
            stateMachine.state === PlayerState.RUNNING ? "run" : "idle",
          );
        }
      }
      const gravity = stealthExecution.active ? null : bushGravity.movementLocked ? bushGravity
        : stealthAttackGravity.movementLocked ? stealthAttackGravity : null;
      const stealthSourcePosition = stealthAttackGravity.getSourcePosition();
      if (stealthSourcePosition) {
        stateMachine.faceDirection({
          x: stealthSourcePosition.x - position.x,
          y: stealthSourcePosition.y - position.y,
        });
      }
      const selectedMovement = gravity || stealthExecution.active ? { x: 0, y: 0 } : getSelectedMovement();
      const knockbackMovement = getKnockbackMovement(deltaSeconds);
      const transition = stateMachine.updateLocomotion(selectedMovement);
      if (transition.changed) {
        playStateAnimation(getAnimationName(transition.state));
      }

      const movement = knockbackMovement || (stateMachine.movementLocked
        ? { x: 0, y: 0 }
        : selectedMovement);
      const distance = knockbackMovement
        ? Math.hypot(knockbackMovement.x, knockbackMovement.y) * deltaSeconds
        : this.getMovementSpeed() * deltaSeconds;
      const activeObstacles = [
        ...obstacles,
        ...dynamicColliders.map(({ collider }) => collider),
      ];
      if (knockbackMovement) {
        gridAlignedMovement.reset();
        const length = Math.hypot(movement.x, movement.y) || 1;
        const direction = { x: movement.x / length, y: movement.y / length };
        const steps = Math.max(1, Math.ceil(distance));
        for (let step = 0; step < steps; step++) {
          const candidate = moveWithCollisions(position, direction, distance / steps, bounds, PLAYER_CHARACTER, activeObstacles);
          const collider = getCharacterCollider(candidate, PLAYER_FRAME, PLAYER_PIVOT, PLAYER_MOVEMENT_COLLIDER);
          if (isColliderWithinBounds(collider, bounds)) position = candidate;
        }
      } else if (gravity) {
        gridAlignedMovement.reset();
        const target = gravity.step(deltaSeconds);
        if (target) {
          const stealthEntry = gravity === stealthAttackGravity ? stealthAttackGravity.getEntry() : null;
          const dx = target.x - position.x;
          const dy = target.y - position.y;
          const length = Math.hypot(dx, dy);
          const steps = Math.max(1, Math.ceil(length));
          const direction = length ? { x: dx / length, y: dy / length } : { x: 0, y: 0 };
          for (let step = 0; step < steps; step++) {
            const next = moveWithCollisions(position, direction, length / steps, bounds, PLAYER_CHARACTER, activeObstacles);
            const expected = { x: position.x + dx / steps, y: position.y + dy / steps };
            position = next;
            if (Math.hypot(next.x - expected.x, next.y - expected.y) > 1e-6) {
              gravity.cancel();
              break;
            }
            if (step === steps - 1) position = target;
          }
          if (stealthEntry && Math.hypot(position.x - target.x, position.y - target.y) <= 1e-6) {
            onStealthAttackEnter(stealthEntry);
          }
        }
      } else if (ENABLE_QUANTIZE_MOVEMENT) {
        position = gridAlignedMovement.move(
          position,
          movement,
          distance,
          deltaSeconds,
          bounds,
          activeObstacles,
        );
      } else {
        gridAlignedMovement.reset();
        position = moveWithCollisions(
          position,
          movement,
          distance,
          bounds,
          PLAYER_CHARACTER,
          activeObstacles,
        );
      }

      gridSpot.update(position);

      if (inputEnabled) daggerCombo.advance(deltaSeconds);
      if (inputEnabled && knifeSwing.active) {
        const { impact, completed } = knifeSwing.advance(deltaSeconds);
        updateSprite2D(sprites.attack, { frame: knifeSwing.frame });
        if (impact) {
          const result = onAttackImpact(activeDaggerMove, comboEligibleTargetIds) ?? {};
          if (activeDaggerMove?.id === "rapid-final" && result.confirmedTargetIds?.length > 0) {
            daggerCombo.confirmRapidFinisherHit();
          }
          const advancedTargetIds = result.advancedTargetIds ?? result.confirmedTargetIds ?? result;
          comboEligibleTargetIds = new Set(Array.isArray(advancedTargetIds) ? advancedTargetIds : []);
        }
        if (completed) {
          const nextMove = daggerCombo.complete();
          if (nextMove) {
            activeDaggerMove = nextMove;
            if (nextMove.id === "ordinary") comboEligibleTargetIds.clear();
            knifeSwing.start(nextMove);
            if (nextMove.multiplier > 1) {
              comboFlashTimer = 0.12;
              setVisualTransform({ color: [1.15, 1.35, 1.6, 1] });
            }
            onAttackStart(nextMove);
            playStateAnimation("attack");
          } else {
            activeDaggerMove = null;
            if (!daggerCombo.awaitingRapidFinisher) comboEligibleTargetIds.clear();
            const result = stateMachine.completeAttack(getSelectedMovement());
            if (result.changed) playStateAnimation(getAnimationName(result.state));
          }
        }
      }
      let executionOffset = { x: 0, y: 0 };
      if (inputEnabled && stealthExecution.active) {
        const step = stealthExecution.advance(deltaSeconds);
        executionOffset = step.visualOffset;
        updateSprite2D(sprites.attack, { frame: step.frame });
        if (step.completed) {
          const result = stateMachine.completeAttack(getSelectedMovement());
          if (result.changed) playStateAnimation(getAnimationName(result.state));
        }
      }
      const screenPosition = getArtScreenPosition(position);
      const comboJumpHeight = activeDaggerMove?.visualJump && knifeSwing.active
        ? Math.sin(Math.PI * Math.max(0, Math.min(1, (knifeSwing.elapsed - activeDaggerMove.delay) / activeDaggerMove.duration))) * 12
        : 0;
      const order = renderOrderOverride ?? getCharacterLayerOrder(this.getMovementCollider(), bounds);
      for (const layer of Object.values(layers)) {
        layer.order = order;
      }
      for (const sprite of Object.values(sprites)) {
        updateSprite2D(sprite, {
          positionPx: [screenPosition.x + executionOffset.x, screenPosition.y - executionOffset.y - comboJumpHeight],
          flipX: stateMachine.facing < 0,
        });
      }

      return { movement, position: { ...position } };
    },
    applyKnockback,
  };
}
