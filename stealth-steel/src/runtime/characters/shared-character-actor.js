import { createGridAlignedMovementController } from "../gameplay/game-logic.js";
import {
  getCharacterCombatCollider,
  getCharacterMovementCollider,
} from "./character-contract.js";
import { GridSpot } from "../systems/environment/grid-spot.js";
import { createSharedCharacterVisual } from "./shared-character-visual.js";

export function createSharedCharacterActor({
  definition,
  atlases,
  bounds,
  initialPosition,
  tileSize,
  obstacles = [],
  movementSpeed = 120,
  api,
}) {
  let position = { ...initialPosition };
  const gridSpot = new GridSpot(position, { width: tileSize, height: tileSize });
  let movementIntent = { x: 0, y: 0 };
  let heading = "right";
  const visual = createSharedCharacterVisual({
    definition,
    atlases,
    initialPosition,
    bounds,
    tileSize,
    api,
  });
  const gridMovement = createGridAlignedMovementController(
    {
      frame: definition.frame,
      pivot: { x: 0.5, y: 1 - tileSize / 2 / definition.frame.height },
      collider: { type: "circle", x: definition.frame.width / 2, y: definition.frame.height - tileSize / 2, radius: definition.movementCollider.radius },
    },
    tileSize,
  );

  function syncPosition(next) {
    position = { ...next };
    gridSpot.update(position);
    visual.setPosition(position);
  }

  return {
    layers: visual.layers,
    getPosition: () => ({ ...position }),
    getRotationCenter: visual.getRotationCenter,
    setPosition: syncPosition,
    getMovementCollider: () => getCharacterMovementCollider(position, definition),
    getCombatCollider: () => getCharacterCombatCollider(position, tileSize),
    faceDirection(direction) {
      if (Math.abs(direction.y) > Math.abs(direction.x)) heading = direction.y < 0 ? "up" : "down";
      else if (direction.x !== 0) {
        heading = direction.x < 0 ? "left" : "right";
        visual.setVisualTransform({ flipX: direction.x < 0 });
      }
    },
    setMovementIntent(intent) {
      movementIntent = { x: intent.x, y: intent.y };
      if (movementIntent.x !== 0) visual.setVisualTransform({ flipX: movementIntent.x < 0 });
      if (Math.abs(movementIntent.y) > Math.abs(movementIntent.x) && movementIntent.y !== 0) {
        heading = movementIntent.y < 0 ? "up" : "down";
      } else if (movementIntent.x !== 0) {
        heading = movementIntent.x < 0 ? "left" : "right";
      }
    },
    getHeading: () => heading,
    update(deltaSeconds, dynamicColliders = []) {
      const movement = movementIntent;
      syncPosition(gridMovement.move(
        position,
        movement,
        movementSpeed * Math.max(0, deltaSeconds),
        deltaSeconds,
        bounds,
        [...obstacles, ...dynamicColliders.map(({ collider }) => collider)],
      ));
      if (movement.x !== 0 || movement.y !== 0) visual.playAnimation("walking");
      else visual.playAnimation("idle");
      visual.update();
      return { position: { ...position }, state: movement.x || movement.y ? "walking" : "idle" };
    },
    getGridPosition: () => ({ ...gridSpot.cell }),
    getGridSpot: () => gridSpot,
    setArtYOffset: visual.setArtYOffset,
    setVisualTransform: visual.setVisualTransform,
    playAnimation(name) { visual.playAnimation(name); },
    setAnimationManager: visual.setAnimationManager,
    dispose: visual.dispose,
  };
}
