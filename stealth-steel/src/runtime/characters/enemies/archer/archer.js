import { loadSpriteAtlas } from "@babylonjs/lite";
import { createGridAlignedMovementController, getCharacterCollider } from "../../../gameplay/game-logic.js";
import { ARCHER_RECOVERY_SECONDS } from "./archer-ai.js";
import { getQuantizedGridCell } from "../../../systems/environment/grid-spot.js";
import { updatePlayerAttackPreparation, cancelPlayerAttackPreparation } from '../player-attack-preparation.js';
import { createEnemyKnockback } from '../../../gameplay/enemy-knockback.js';
import { createSharedCharacterVisual } from '../../shared-character-visual.js';

export const ARCHER_FRAME = Object.freeze({ width: 192, height: 192 });
export const ARCHER_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
export const ARCHER_ART_PIVOT = Object.freeze({ x: 0.5, y: 0.5 });
// The artwork anchor is the logical grid/collider center; the PNG pivot is centered.
export const ARCHER_ART_OFFSET = Object.freeze({ x: 0, y: 0 });
export const ARCHER_MOVEMENT_COLLIDER = Object.freeze({ type: "circle", x: 96, y: ARCHER_FRAME.height * ARCHER_PIVOT.y, radius: 24 });
export const ARCHER_COMBAT_COLLIDER = Object.freeze({ x: ARCHER_FRAME.width * ARCHER_PIVOT.x - 64 / 2, y: ARCHER_FRAME.height * ARCHER_PIVOT.y + 64 / 2 - 64, width: 64, height: 64 });
const ARROW_ATTACH_OFFSET = Object.freeze({ x: 24.48, y: 29.55 });
const ARROW_ATTACH_FRAME = 5;
const ARROW_ATTACH_ANGLE = Math.atan2(-55, -64);
const ANIMS = Object.freeze({ idle: ["Archer_Idle.png", 6, true], walking: ["Archer_Run.png", 4, true], shooting: ["Archer_Shoot.png", 6, false] });
const ARCHER_VISUAL_DEFINITION = Object.freeze({
  id: "archer",
  frame: ARCHER_FRAME,
  displaySize: ARCHER_FRAME,
  artPivot: ARCHER_ART_PIVOT,
  artOffset: Object.freeze({ x: -ARCHER_ART_OFFSET.x, y: -ARCHER_ART_OFFSET.y }),
  movementCollider: ARCHER_MOVEMENT_COLLIDER,
  animations: Object.freeze(Object.fromEntries(Object.entries(ANIMS).map(([name, [, frameCount, loop]]) => [name, Object.freeze({ frameCount, loop, frameDurationMs: 100, displaySize: [192, 192] })]))),
});

export async function loadArcherAtlases(engine) {
  return Object.fromEntries(await Promise.all(Object.entries(ANIMS).map(async ([name, [file]]) => [name, await loadSpriteAtlas(engine, `./assets/images/enemies/archer/${file}`, { gridSize: [192, 192], sampling: "nearest" })])));
}

export function createArcher({ atlases, initialPosition, bounds, obstacles = [], onShoot = () => {}, api }) {
  let position = { ...initialPosition }; let disposed = false; let manager = null; let state = "idle";
  let facing = 1; let target = null; let recovery = 0; let released = false; let shootElapsed = 0;
  let heading = "right";
  let movementIntent = { x: 0, y: 0 };
  const gridMovement = createGridAlignedMovementController({ frame: ARCHER_FRAME, pivot: ARCHER_PIVOT, collider: ARCHER_MOVEMENT_COLLIDER }, 64);
  const knockback = createEnemyKnockback({ character: { frame: ARCHER_FRAME, pivot: ARCHER_PIVOT, collider: ARCHER_MOVEMENT_COLLIDER }, bounds, obstacles });
  const visual = createSharedCharacterVisual({ definition: ARCHER_VISUAL_DEFINITION, atlases, initialPosition, bounds, tileSize: 64, api });

  function syncPosition(next) { position = { ...next }; visual.setPosition(position); }
  function play(name) {
    state = name;
    if (!manager || disposed) return;
    visual.playAnimation(name, { onEnd: () => {
      if (name === "shooting") { recovery = ARCHER_RECOVERY_SECONDS; state = "recovering"; }
      else play("idle");
    } });
  }

  return {
    layers: visual.layers,
    get isKnockedBack() { return knockback.active; },
    isMovementLocked() { return disposed || knockback.active || state === "shooting" || recovery > 0; },
    get state() { return state; },
    get isAttacking() { return state === "shooting"; },
    getHeading() { return heading; },
    getPosition() { return { ...position }; },
    getRotationCenter: visual.getRotationCenter,
    setPosition(next) { cancelPlayerAttackPreparation(this); syncPosition(next); },
    getMovementCollider() { return getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_MOVEMENT_COLLIDER); },
    getCombatCollider() { return getCharacterCollider(position, ARCHER_FRAME, ARCHER_PIVOT, ARCHER_COMBAT_COLLIDER); },
    getGridPosition: (tileSize = 64) => getQuantizedGridCell(position, { tileSizePx: tileSize }),
    playAnimation(m) { manager = m; visual.setAnimationManager(m); play("idle"); },
    faceDirection(direction) {
      if (this.isMovementLocked() || !direction.x) return;
      facing = Math.sign(direction.x); heading = facing < 0 ? "left" : "right";
      visual.setVisualTransform({ flipX: facing < 0 });
    },
    setMovementIntent(movement) { movementIntent = { x: movement.x, y: movement.y }; },
    update(deltaSeconds, dynamicColliders = []) {
      if (disposed) return;
      const delta = Math.max(0, deltaSeconds);
      if (delta <= 0) return;
      const knockedPosition = knockback.move(position, delta, dynamicColliders);
      if (knockedPosition) {
        cancelPlayerAttackPreparation(this); gridMovement.reset(); syncPosition(knockedPosition); return;
      }
      if (recovery > 0) {
        recovery = Math.max(0, recovery - delta);
        if (recovery === 0) play("idle");
        return;
      }
      if (state === "shooting") {
        shootElapsed += delta;
        if (!released && visual.getAnimationFrame() >= ARROW_ATTACH_FRAME && target) {
          released = true;
          const offsetX = ARROW_ATTACH_OFFSET.x * facing;
          const angle = (facing < 0 ? ARROW_ATTACH_ANGLE : Math.PI - ARROW_ATTACH_ANGLE) - facing * Math.PI / 180;
          onShoot(
            { x: position.x + offsetX, y: position.y + ARROW_ATTACH_OFFSET.y },
            { ...target },
            { initialRotation: angle, initialVelocityDirection: { x: Math.cos(angle), y: -Math.sin(angle) }, landingCenterY: position.y },
          );
        }
        return;
      }
      const preparing = updatePlayerAttackPreparation(this, delta, center => {
        syncPosition(gridMovement.moveTo(position, center, 120 * delta, bounds, [...obstacles, ...dynamicColliders.map(({ collider }) => collider)]));
      });
      if (state === "shooting") return;
      if (!preparing) syncPosition(gridMovement.move(position, movementIntent, 120 * delta, delta, bounds, [...obstacles, ...dynamicColliders.map(({ collider }) => collider)]));
      const locomotion = movementIntent.x || movementIntent.y ? "walking" : "idle";
      if (state !== locomotion) play(locomotion);
      if (!preparing) {
        if (Math.abs(movementIntent.y) > Math.abs(movementIntent.x)) heading = movementIntent.y < 0 ? "up" : "down";
        else if (movementIntent.x !== 0) heading = movementIntent.x < 0 ? "left" : "right";
      }
      const nextFacing = preparing ? facing : Math.sign(movementIntent.x) || facing;
      if (nextFacing !== facing) { facing = nextFacing; visual.setVisualTransform({ flipX: facing < 0 }); }
    },
    shootAt(nextPosition) {
      if (this.isMovementLocked()) return false;
      movementIntent = { x: 0, y: 0 }; this.faceDirection({ x: nextPosition.x - position.x, y: nextPosition.y - position.y });
      target = { ...nextPosition }; released = false; shootElapsed = 0; play("shooting"); return true;
    },
    shoot() { if (state !== "idle") return false; target = null; released = false; shootElapsed = 0; play("shooting"); return true; },
    setVisualTransform: visual.setVisualTransform,
    setArtYOffset: visual.setArtYOffset,
    applyKnockback(direction, options) { knockback.start(direction, options); },
    dispose() { if (disposed) return; cancelPlayerAttackPreparation(this); disposed = true; visual.dispose(); },
  };
}
