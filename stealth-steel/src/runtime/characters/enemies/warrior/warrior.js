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
import { getCharacterGridCell } from "../../character-spatial.js";
import {
  WARRIOR_ANIMATION_CATALOG,
  WARRIOR_ANIMATION_NAMES,
  WARRIOR_BODY_ART_PIVOT,
} from "./warrior-animation-catalog.js";
import {
  WarriorState,
  createWarriorStateMachine,
  selectWarriorAction,
} from "./warrior-state.js";
import {
  createWarriorDefenseConfig,
  selectIncomingProjectile,
} from "./warrior-defense.js";
import { createSharedCharacterVisual } from "../../shared-character-visual.js";

export const WARRIOR_FRAME = Object.freeze({ width: 192, height: 192 });
export const WARRIOR_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
// Preserve the established world placement while the rendered pivot moves
// from its legacy canvas-space location to the body-art bottom.
export const WARRIOR_ART_OFFSET = Object.freeze({
  x: 0,
  y: -55 + WARRIOR_FRAME.height * (WARRIOR_PIVOT.y - WARRIOR_BODY_ART_PIVOT[1]),
});
export const WARRIOR_MOVEMENT_COLLIDER = Object.freeze({
  type: "circle",
  x: 96,
  y: WARRIOR_FRAME.height * WARRIOR_PIVOT.y,
  radius: 24,
});
export const WARRIOR_COMBAT_COLLIDER = Object.freeze({
  x: WARRIOR_FRAME.width * WARRIOR_PIVOT.x - 64 / 2,
  y: WARRIOR_FRAME.height * WARRIOR_PIVOT.y + 64 / 2 - 64,
  width: 64,
  height: 64,
});

const DEFAULT_API = Object.freeze({
  loadSpriteAtlas,
});

const WARRIOR_VISUAL_DEFINITION = Object.freeze({
  id: "warrior",
  frame: WARRIOR_FRAME,
  displaySize: WARRIOR_FRAME,
  artPivot: Object.freeze({ x: WARRIOR_BODY_ART_PIVOT[0], y: WARRIOR_BODY_ART_PIVOT[1] }),
  artOffset: Object.freeze({ x: -WARRIOR_ART_OFFSET.x, y: -WARRIOR_ART_OFFSET.y }),
  movementCollider: WARRIOR_MOVEMENT_COLLIDER,
  animations: Object.freeze(Object.fromEntries(WARRIOR_ANIMATION_NAMES.map(name => {
    const descriptor = WARRIOR_ANIMATION_CATALOG[name];
    return [name, Object.freeze({ ...descriptor, displaySize: [...descriptor.displaySize] })];
  }))),
});

export async function loadWarriorAtlases(engine, api = DEFAULT_API) {
  const entries = await Promise.all(
    WARRIOR_ANIMATION_NAMES.map(async (name) => {
      const descriptor = WARRIOR_ANIMATION_CATALOG[name];
      const atlas = await api.loadSpriteAtlas(engine, descriptor.imageUrl, {
        gridSize: [...descriptor.gridSize],
        sampling: descriptor.sampling,
      });
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

export function createWarrior({
  atlases,
  initialPosition,
  bounds,
  obstacles,
  onAttack = () => {},
  movementSpeed = 120,
  defenseConfig = {},
  api = DEFAULT_API,
}) {
  const character = {
    frame: WARRIOR_FRAME,
    pivot: WARRIOR_PIVOT,
    collider: WARRIOR_MOVEMENT_COLLIDER,
  };
  const gridMovement = createGridAlignedMovementController(character, 64);
  const stateMachine = createWarriorStateMachine();
  const defense = createWarriorDefenseConfig(defenseConfig);
  const attemptedProjectileIds = new Set();
  let position = { ...initialPosition };
  let movementIntent = { x: 0, y: 0 };
  let facing = 1;
  let heading = "right";
  let currentFlipX = false;
  let animationManager = null;
  let disposed = false;
  const knockback = createEnemyKnockback({ character, bounds, obstacles });
  const attackImpacts = createAttackImpactQueue();
  let defenseRemainingSeconds = 0;

  const visual = createSharedCharacterVisual({ definition: WARRIOR_VISUAL_DEFINITION, atlases, initialPosition, bounds, tileSize: 64, api });

  function updateSprites() {
    visual.setPosition(position);
    visual.setVisualTransform({ flipX: currentFlipX });
  }

  function playStateAnimation(name) {
    if (!animationManager || disposed) {
      return;
    }
    const descriptor = WARRIOR_ANIMATION_CATALOG[name];
    visual.playAnimation(name, { onEnd: descriptor.loop ? undefined : () => {
      if (disposed) return;
      attackImpacts.advance(Infinity);
      const transition = stateMachine.completeAttack(movementIntent);
      currentFlipX = facing < 0;
      if (transition.changed) playStateAnimation(transition.state);
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
    anchor: _anchor,
  }) {
    const patch = {};
    if (scaleX !== undefined) patch.scaleX = scaleX;
    if (scaleY !== undefined) patch.scaleY = scaleY;
    if (alpha !== undefined) patch.alpha = alpha;
    if (rotation !== undefined) patch.rotation = rotation;
    if (color !== undefined) patch.color = color;
    if (sizePx !== undefined) patch.sizePx = sizePx;
    visual.setVisualTransform(patch);
  }

  function applyKnockback(direction, options) {
    knockback.start(direction, options);
  }

  function beginDefense(direction = { x: 0, y: 0 }, duration = defense.defenseDurationSeconds) {
    if (disposed || defenseRemainingSeconds > 0) return false;
    const selection = selectWarriorAction("guard", direction, facing);
    facing = selection.facing;
    currentFlipX = selection.flipX;
    const transition = stateMachine.startDefense();
    if (!transition.changed) return false;
    defenseRemainingSeconds = Math.max(0, duration);
    attackImpacts.cancel();
    playStateAnimation(WarriorState.GUARD);
    return true;
  }

  return {
    layers: visual.layers,
    get isKnockedBack() { return knockback.active; },
    drainAttackImpacts() { return attackImpacts.drain(); },
    isMovementLocked() { return stateMachine.movementLocked || knockback.active; },
    get state() {
      return stateMachine.state;
    },
    get isAttacking() {
      return stateMachine.state === WarriorState.ATTACK_1
        || stateMachine.state === WarriorState.ATTACK_2;
    },
    get isDefending() {
      return defenseRemainingSeconds > 0;
    },
    beginDefense,
    attack(name = WarriorState.ATTACK_1, direction = { x: 0, y: 0 }) {
      if (disposed) return false;
      const transition = stateMachine.startAttack(name);
      if (!transition.changed) return false;
      const selection = selectWarriorAction(name, direction, facing);
      facing = selection.facing;
      currentFlipX = selection.flipX;
      playStateAnimation(selection.name);
      const impactAnimation = WARRIOR_ANIMATION_CATALOG[selection.name];
      attackImpacts.start(direction, impactAnimation.frameCount * impactAnimation.frameDurationMs / 1000);
      onAttack();
      return true;
    },
    setGuarding(enabled, direction = { x: 0, y: 0 }) {
      if (disposed) return false;
      if (defenseRemainingSeconds > 0) return false;
      const selection = selectWarriorAction("guard", direction, facing);
      facing = selection.facing;
      currentFlipX = selection.flipX;
      const transition = stateMachine.setGuarding(enabled, movementIntent);
      if (transition.changed) playStateAnimation(transition.state);
      return transition.changed;
    },
    dispose() {
      cancelPlayerAttackPreparation(this);
      if (disposed) return;
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
        WARRIOR_COMBAT_COLLIDER,
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
      playStateAnimation(WarriorState.IDLE);
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
    update(deltaSeconds, dynamicColliders = [], projectiles = []) {
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
      if (defenseRemainingSeconds <= 0) {
        const incoming = selectIncomingProjectile(
          projectiles,
          this.getCombatCollider(),
          facing,
          defense,
          attemptedProjectileIds,
        );
        if (incoming) beginDefense({ x: -incoming.direction.x, y: -incoming.direction.y });
      }
      if (defenseRemainingSeconds > 0) {
        cancelPlayerAttackPreparation(this);
        defenseRemainingSeconds = Math.max(
          0,
          defenseRemainingSeconds - Math.max(0, deltaSeconds),
        );
        if (defenseRemainingSeconds < 1e-9) defenseRemainingSeconds = 0;
        if (defenseRemainingSeconds === 0) {
          const transition = stateMachine.completeDefense(movementIntent);
          if (transition.changed) playStateAnimation(transition.state);
        }
        updateSprites();
        return { position: { ...position }, state: stateMachine.state };
      }
      const preparing = updatePlayerAttackPreparation(this, deltaSeconds, center => {
        position = gridMovement.moveTo(position, center, movementSpeed * Math.max(0, deltaSeconds), bounds,
          [...obstacles, ...dynamicColliders.map(({ collider }) => collider)]);
      });
      if (!stateMachine.movementLocked) {
        if (movementIntent.x !== 0) facing = movementIntent.x < 0 ? -1 : 1;
        currentFlipX = facing < 0;
        const transition = stateMachine.updateLocomotion(movementIntent);
        if (transition.changed) playStateAnimation(transition.state);
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
        [...obstacles, ...dynamicColliders.map(({ collider }) => collider)],
      );
      updateSprites();
      return { position: { ...position }, state: stateMachine.state };
    },
    applyKnockback,
  };
}
