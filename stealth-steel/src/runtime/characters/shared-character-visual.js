import {
  addSprite2D,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
} from "@babylonjs/lite";
import { getCharacterMovementCollider } from "./character-contract.js";
import { getCharacterLayerOrder } from "./character-spatial.js";
import { getRenderedArtPivot } from "./character-art-offsets.js";

const DEFAULT_API = {
  addSprite2D,
  createSprite2DLayer,
  playSprite2DAnimation,
  removeSprite2D,
  stopSpriteAnimation,
  updateSprite2D,
};

function finitePivot(value, name) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1.`);
  }
  return value;
}

export function createCharacterVisualDefinition({
  id,
  frame,
  displaySize = frame,
  artPivot = { x: 0.5, y: 0.84 },
  artOffset = { x: 0, y: 0 },
  movementCollider,
  animations,
}) {
  if (typeof id !== "string" || id.length === 0) throw new TypeError("id is required");
  const pivot = Object.freeze({
    x: finitePivot(artPivot.x, "artPivot.x"),
    y: finitePivot(artPivot.y, "artPivot.y"),
  });
  return Object.freeze({
    id,
    frame: Object.freeze({ width: frame.width, height: frame.height }),
    displaySize: Object.freeze({ width: displaySize.width, height: displaySize.height }),
    artPivot: pivot,
    artOffset: Object.freeze({ x: artOffset.x, y: artOffset.y }),
    movementCollider,
    animations,
  });
}

export function createSharedCharacterVisual({
  definition,
  atlases,
  initialPosition,
  bounds,
  tileSize = 64,
  api = DEFAULT_API,
}) {
  const rendererApi = { ...DEFAULT_API, ...api };
  let position = { ...initialPosition };
  let artYOffset = 0;
  let animationManager = null;
  let activeAnimation = null;
  let currentAnimation = null;
  let disposed = false;
  const layers = {};
  const sprites = {};
  const pivot = definition.artPivot ?? {
    x: 0.5,
    y: 1 - tileSize / 2 / definition.frame.height,
  };
  // Keep the logical rotation/center point fixed while applying the editable
  // per-character artwork offset.
  const renderPivot = getRenderedArtPivot(definition.id, pivot, definition.frame);

  function getVisualTransform(size = definition.displaySize) {
    return {
      positionPx: [
        position.x + definition.artOffset.x,
        (bounds.renderHeight ?? bounds.height) - position.y + definition.artOffset.y + artYOffset,
      ],
      sizePx: [size.width, size.height],
      pivot: [renderPivot.x, renderPivot.y],
    };
  }

  function update(patch = {}) {
    const order = getCharacterLayerOrder(
      getCharacterMovementCollider(position, {
        movementCollider: definition.movementCollider,
        frame: definition.frame,
        artOffset: definition.artOffset,
      }),
      bounds,
    );
    const size = patch.sizePx
      ? { width: patch.sizePx[0], height: patch.sizePx[1] }
      : definition.displaySize;
    const visual = getVisualTransform(size);
    for (const layer of Object.values(layers)) layer.order = order;
    for (const sprite of Object.values(sprites)) {
      rendererApi.updateSprite2D(sprite, { ...visual, ...patch });
    }
  }

  for (const [name, descriptor] of Object.entries(definition.animations)) {
    const layer = rendererApi.createSprite2DLayer(atlases[name], {
      capacity: 1,
      order: getCharacterLayerOrder(
        getCharacterMovementCollider(position, {
          movementCollider: definition.movementCollider,
          frame: definition.frame,
        }),
        bounds,
      ),
      pivot: [renderPivot.x, renderPivot.y],
      visible: name === "idle",
    });
    layers[name] = layer;
    sprites[name] = rendererApi.addSprite2D(layer, {
      ...getVisualTransform(),
      frame: 0,
    });
    if (descriptor.displaySize) {
      rendererApi.updateSprite2D(sprites[name], { sizePx: [...descriptor.displaySize] });
    }
  }

  return {
    layers: Object.values(layers),
    sprites: Object.values(sprites),
    getPosition: () => ({ ...position }),
    getRotationCenter: () => ({
      x: position.x + definition.artOffset.x,
      y: position.y - definition.artOffset.y - artYOffset,
    }),
    setPosition(next) { position = { ...next }; update(); },
    setArtYOffset(value) { artYOffset = Number.isFinite(value) ? value : 0; update(); },
    setVisualTransform(patch) {
      const scaledSize = patch.sizePx ?? (
        patch.scaleX !== undefined || patch.scaleY !== undefined
          ? [
            definition.displaySize.width * (patch.scaleX ?? 1),
            definition.displaySize.height * (patch.scaleY ?? 1),
          ]
          : null
      );
      const visualPatch = { ...patch };
      delete visualPatch.scaleX;
      delete visualPatch.scaleY;
      if (scaledSize) visualPatch.sizePx = scaledSize;
      const size = visualPatch.sizePx
        ? { width: visualPatch.sizePx[0], height: visualPatch.sizePx[1] }
        : definition.displaySize;
      update({ ...getVisualTransform(size), ...visualPatch });
    },
    setAnimationManager(manager) { animationManager = manager; },
    getAnimationFrame() { return activeAnimation?.current ?? 0; },
    playAnimation(name, { onEnd } = {}) {
      if (!animationManager || disposed || !sprites[name]) return;
      if (currentAnimation === name) return;
      currentAnimation = name;
      if (activeAnimation) rendererApi.stopSpriteAnimation(activeAnimation);
      for (const [layerName, layer] of Object.entries(layers)) layer.visible = layerName === name;
      const descriptor = definition.animations[name];
      activeAnimation = rendererApi.playSprite2DAnimation(
        animationManager,
        sprites[name],
        0,
        descriptor.frameCount - 1,
        descriptor.loop,
        descriptor.frameDurationMs,
        descriptor.loop || !onEnd ? undefined : { onEnd },
      );
      update();
    },
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (activeAnimation) rendererApi.stopSpriteAnimation(activeAnimation);
      for (const sprite of Object.values(sprites)) rendererApi.removeSprite2D(sprite);
      for (const layer of Object.values(layers)) layer.visible = false;
    },
  };
}
