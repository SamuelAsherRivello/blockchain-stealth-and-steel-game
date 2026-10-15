import {
  createSprite2DCustomShader,
  createSprite2DLayer,
} from "@babylonjs/lite";

/**
 * The shared shadow art is blue-black.  Preserve its alpha silhouette while
 * emitting the supplied tint directly, so the stealth opportunity is yellow.
 */
export const STEALTH_ATTACK_YELLOW_FRAGMENT = `
let sampled = textureSample(atlasTex, atlasSamp, in.uv);
let alpha = sampled.a * in.tint.a * L.opacityMul.a;
return vec4f(in.tint.rgb, alpha);
`;

const DEFAULT_API = {
  createSprite2DCustomShader,
  createSprite2DLayer,
};

export function createStealthAttackShadowLayer(atlas, {
  capacity,
  order,
  pivot,
  api = DEFAULT_API,
}) {
  const customShader = api.createSprite2DCustomShader({
    fragment: STEALTH_ATTACK_YELLOW_FRAGMENT,
  });
  return api.createSprite2DLayer(atlas, {
    capacity,
    order,
    pivot,
    customShader,
  });
}
