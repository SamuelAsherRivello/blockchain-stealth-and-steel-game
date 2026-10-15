import { loadSpriteAtlas } from "@babylonjs/lite";
import { createSharedCharacterActor } from "../../shared-character-actor.js";
import { createCharacterDefinition } from "../../character-contract.js";
import { MONK_ANIMATION_CATALOG, MONK_ANIMATION_NAMES } from "./monk-animation-catalog.js";
import { createEnemyKnockback } from '../../../gameplay/enemy-knockback.js';

export const MONK_FRAME = Object.freeze({ width: 192, height: 192 });
export const MONK_PIVOT = Object.freeze({ x: 0.5, y: 0.84 });
// Shared actor offsets are screen-space, where positive Y moves artwork down.
export const MONK_ART_OFFSET = Object.freeze({ x: 0, y: 55 });
export const MONK_MOVEMENT_COLLIDER = Object.freeze({ type: "circle", x: 96, y: 161.28, radius: 24 });
export const MONK_COMBAT_COLLIDER = Object.freeze({ x: 64, y: 97.28, width: 64, height: 64 });

const DEFAULT_API = { loadSpriteAtlas };
const MONK_DEFINITION = createCharacterDefinition({
  id: "monk", frame: MONK_FRAME,
  movementCollider: { radius: MONK_MOVEMENT_COLLIDER.radius }, artOffset: MONK_ART_OFFSET,
  animations: Object.fromEntries(MONK_ANIMATION_NAMES.map((name) => [name, MONK_ANIMATION_CATALOG[name]])),
});

export async function loadMonkAtlases(engine, api = DEFAULT_API) {
  return Object.fromEntries(await Promise.all(MONK_ANIMATION_NAMES.map(async (name) => [name,
    await api.loadSpriteAtlas(engine, MONK_ANIMATION_CATALOG[name].imageUrl, {
      gridSize: [192, 192], sampling: "nearest",
    }),
  ])));
}

export function createMonk({ atlases, initialPosition, bounds, obstacles = [], runtimeApi, onHeal = () => {} }) {
  const actor = createSharedCharacterActor({
    definition: MONK_DEFINITION, atlases, initialPosition, bounds,
    tileSize: 64, obstacles, api: runtimeApi,
  });
  const knockback = createEnemyKnockback({
    character: { frame: MONK_FRAME, pivot: { x: .5, y: 1 - 32 / MONK_FRAME.height },
      collider: { type: 'circle', x: 96, y: 160, radius: MONK_MOVEMENT_COLLIDER.radius } },
    bounds, obstacles,
  });
  return {
    ...actor,
    get isKnockedBack() { return knockback.active; },
    get state() { return "idle"; },
    get isAttacking() { return false; },
    getHeading() { return actor.getHeading(); },
    isMovementLocked() { return knockback.active; },
    update(deltaSeconds, dynamicColliders) {
      const position = knockback.move(actor.getPosition(), deltaSeconds, dynamicColliders);
      if (position) { actor.setPosition(position); return { position, state: 'idle' }; }
      return actor.update(deltaSeconds, dynamicColliders);
    },
    playAnimation(manager) { actor.setAnimationManager(manager); actor.playAnimation("idle"); },
    playHeal() { actor.playAnimation("heal"); onHeal(); },
    playHealEffect() { actor.playAnimation("heal-effect"); },
    applyKnockback(direction, options) { knockback.start(direction, options); },
  };
}
