import { createEnemyKnockback } from '../../../gameplay/enemy-knockback.js';
import { createAttackImpactQueue } from "../../../gameplay/attack-impact.js";
import { updatePlayerAttackPreparation, cancelPlayerAttackPreparation } from '../player-attack-preparation.js';
import {
  loadSpriteAtlas,
} from "@babylonjs/lite";

import {
  getCharacterCollider,
  createGridAlignedMovementController,
} from "../../../gameplay/game-logic.js";
import { getCharacterGridCell, getCharacterLayerOrder } from "../../character-spatial.js";
import {
  EnemyState,
  createEnemyStateMachine,
} from "../enemy-state.js";
import {
  GOBLIN_ANIMATION_CATALOG,
  GOBLIN_ANIMATION_NAMES,
} from "./goblin-animation-catalog.js";
import { selectGoblinAttackAnimation } from "./goblin-state.js";
import { createSharedCharacterVisual } from "../../shared-character-visual.js";

export const GOBLIN_FRAME = Object.freeze({ width: 192, height: 192 });
export const GOBLIN_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const GOBLIN_ART_PIVOT = Object.freeze({ x: 0.5, y: 0.5 });
// Keep the centered artwork pivot on the logical grid/collider center.
export const GOBLIN_ART_OFFSET = Object.freeze({ x: 0, y: 0 });
export const GOBLIN_MOVEMENT_COLLIDER = Object.freeze({
  type: "circle",
  x: 96,
  y: GOBLIN_FRAME.height * GOBLIN_PIVOT.y,
  radius: 24,
});
export const GOBLIN_COMBAT_COLLIDER = Object.freeze({
  x: GOBLIN_FRAME.width * GOBLIN_PIVOT.x - 64 / 2,
  y: GOBLIN_FRAME.height * GOBLIN_PIVOT.y + 64 / 2 - 64,
  width: 64,
  height: 64,
});

const DEFAULT_API = Object.freeze({
  loadSpriteAtlas,
});

const GOBLIN_VISUAL_DEFINITION = Object.freeze({
  id: "goblin",
  frame: GOBLIN_FRAME,
  displaySize: GOBLIN_FRAME,
  artPivot: GOBLIN_ART_PIVOT,
  artOffset: Object.freeze({ x: -GOBLIN_ART_OFFSET.x, y: -GOBLIN_ART_OFFSET.y }),
  movementCollider: GOBLIN_MOVEMENT_COLLIDER,
  animations: Object.freeze(Object.fromEntries(GOBLIN_ANIMATION_NAMES.map(name => [name, Object.freeze({ ...GOBLIN_ANIMATION_CATALOG[name], displaySize: GOBLIN_ANIMATION_CATALOG[name].displaySize ?? [192, 192] })]))),
});

export async function loadGoblinAtlases(engine, api = DEFAULT_API) {
  const entries = await Promise.all(
    GOBLIN_ANIMATION_NAMES.map(async (name) => {
      const descriptor = GOBLIN_ANIMATION_CATALOG[name];
      const atlas = await api.loadSpriteAtlas(
        engine,
        descriptor.imageUrl,
        {
          gridSize: [...descriptor.gridSize],
          sampling: descriptor.sampling,
        },
      );
      return [name, atlas];
    }),
  );
  return Object.fromEntries(entries);
}

function normalizeMovement(movement) {
  const length = Math.hypot(movement.x, movement.y);
  return length > 0
    ? { x: movement.x / length, y: movement.y / length }
    : { x: 0, y: 0 };
}

export function createGoblin({
  atlases,
  initialPosition,
  bounds,
  obstacles,
  onAttack = () => {},
  movementSpeed = 120,
  api = DEFAULT_API,
}) {
  const character = {
    frame: GOBLIN_FRAME,
    pivot: GOBLIN_PIVOT,
    collider: GOBLIN_MOVEMENT_COLLIDER,
  };
  const gridMovement = createGridAlignedMovementController(character, 64);
  const stateMachine = createEnemyStateMachine();
  let position = { ...initialPosition };
  let movementIntent = { x: 0, y: 0 };
  let facing = 1;
  let heading = "right";
  let currentFlipX = false;
  let animationManager = null;
  let disposed = false;
  const knockback = createEnemyKnockback({ character, bounds, obstacles });
  const attackImpacts = createAttackImpactQueue();

  const visual = createSharedCharacterVisual({ definition: GOBLIN_VISUAL_DEFINITION, atlases, initialPosition, bounds, tileSize: 64, api });

  function updateSprites() {
    visual.setPosition(position);
    visual.setVisualTransform({ flipX: currentFlipX });
  }

  function playStateAnimation(name) {
    if (!animationManager || disposed) {
      return;
    }
    visual.playAnimation(name, { onEnd: GOBLIN_ANIMATION_CATALOG[name].loop ? undefined : () => {
              if (disposed) {
                return;
              }
              attackImpacts.advance(Infinity);
              const transition = stateMachine.completeAttack(movementIntent);
              currentFlipX = facing < 0;
              if (transition.changed) {
                playStateAnimation(transition.state);
              }
            } });
    visual.setVisualTransform({ flipX: currentFlipX });
  }

  function setVisualTransform({
    scaleX,
    scaleY,
    alpha,
    rotation,
    color,
    sizePx,
  }) {
    const patch = {};
    if (scaleX !== undefined) {
      patch.scaleX = scaleX;
    }
    if (scaleY !== undefined) {
      patch.scaleY = scaleY;
    }
    if (alpha !== undefined) {
      patch.alpha = alpha;
    }
    if (rotation !== undefined) {
      patch.rotation = rotation;
    }
    if (color !== undefined) {
      patch.color = color;
    }
    if (sizePx !== undefined) {
      patch.sizePx = sizePx;
    }
    visual.setVisualTransform(patch);
  }

  function applyKnockback(direction, options) {
    knockback.start(direction, options);
  }

  return {
    layers: visual.layers,
    get isKnockedBack() { return knockback.active; },
    drainAttackImpacts() { return attackImpacts.drain(); },
    isMovementLocked() { return stateMachine.movementLocked || knockback.active; },
    get state() {
      return stateMachine.state;
    },
    attack(direction) {
      if (disposed) {
        return false;
      }
      const transition = stateMachine.startAttack();
      if (!transition.changed) {
        return false;
      }
      const selection = selectGoblinAttackAnimation(direction, facing);
      facing = selection.facing;
      currentFlipX = selection.flipX;
      playStateAnimation(selection.name);
      const impactAnimation = GOBLIN_ANIMATION_CATALOG[selection.name];
      attackImpacts.start(direction, impactAnimation.frameCount * impactAnimation.frameDurationMs / 1000);
      onAttack();
      return true;
    },
    dispose() {
      cancelPlayerAttackPreparation(this);
      if (disposed) {
        return;
      }
      disposed = true;
      visual.dispose();
    },
    getMovementCollider() {
      return getCharacterCollider(
        position,
        character.frame,
        character.pivot,
        character.collider,
      );
    },
    getCombatCollider() {
      return getCharacterCollider(
        position,
        character.frame,
        character.pivot,
        GOBLIN_COMBAT_COLLIDER,
      );
    },
    getGridPosition(tileSize) {
      return getCharacterGridCell(this.getMovementCollider(), tileSize);
    },
    getHeading() {
      return heading;
    },
    getPosition() {
      return { ...position };
    },
    getRotationCenter: visual.getRotationCenter,
    setPosition(next) { cancelPlayerAttackPreparation(this); position = { ...next }; updateSprites(); },
    playAnimation(manager) {
      animationManager = manager;
      visual.setAnimationManager(manager);
      playStateAnimation("idle");
    },
    setVisualTransform,
    setArtYOffset: visual.setArtYOffset,
    faceDirection(direction) {
      if (disposed || this.isMovementLocked()) return;
      if (direction.x !== 0) { facing = Math.sign(direction.x); currentFlipX = facing < 0; }
      if (Math.abs(direction.y) > Math.abs(direction.x)) heading = direction.y < 0 ? "up" : "down";
      else if (direction.x !== 0) heading = direction.x < 0 ? "left" : "right";
      updateSprites();
    },
    setMovementIntent(movement) {
      movementIntent = normalizeMovement(movement);
      if (Math.abs(movementIntent.y) > Math.abs(movementIntent.x) && movementIntent.y !== 0) {
        heading = movementIntent.y < 0 ? "up" : "down";
      } else if (movementIntent.x !== 0) {
        heading = movementIntent.x < 0 ? "left" : "right";
      }
    },
    update(deltaSeconds, dynamicColliders = []) {
      attackImpacts.advance(deltaSeconds);
      if (disposed) {
        return { position: { ...position }, state: stateMachine.state };
      }
      if (this.isMovementLocked()) cancelPlayerAttackPreparation(this);
      const knockedPosition = knockback.move(position, deltaSeconds, dynamicColliders);
      if (knockedPosition) {
        gridMovement.reset();
        position = knockedPosition;
        updateSprites();
        return { position: { ...position }, state: stateMachine.state };
      }
      const preparing = updatePlayerAttackPreparation(this, deltaSeconds, center => {
        position = gridMovement.moveTo(position, center, movementSpeed * Math.max(0, deltaSeconds), bounds,
          [...obstacles, ...dynamicColliders.map(({ collider }) => collider)]);
      });
      if (stateMachine.state !== EnemyState.ATTACKING) {
        if (movementIntent.x !== 0) {
          facing = movementIntent.x < 0 ? -1 : 1;
        }
        currentFlipX = facing < 0;
        const transition = stateMachine.updateLocomotion(movementIntent);
        if (transition.changed) {
          playStateAnimation(transition.state);
        }
      }
      const movement = stateMachine.movementLocked
        ? { x: 0, y: 0 }
        : movementIntent;
      if (!preparing) position = gridMovement.move(
        position,
        movement,
        movementSpeed * Math.max(0, deltaSeconds),
        deltaSeconds,
        bounds,
        [
          ...obstacles,
          ...dynamicColliders.map(({ collider }) => collider),
        ],
      );
      updateSprites();
      return { position: { ...position }, state: stateMachine.state };
    },
    applyKnockback,
  };
}
