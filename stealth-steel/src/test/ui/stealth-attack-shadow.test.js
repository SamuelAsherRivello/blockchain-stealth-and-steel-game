import test from "node:test";
import assert from "node:assert/strict";

import {
  STEALTH_ATTACK_YELLOW_FRAGMENT,
  createStealthAttackShadowLayer,
} from "../../runtime/ui/stealth-attack-shadow.js";

test("stealth attack shadows preserve the shadow shape while rendering their configured yellow", () => {
  const calls = [];
  const layer = {};
  const api = {
    createSprite2DCustomShader: (options) => ({ options }),
    createSprite2DLayer: (atlas, options) => {
      calls.push([atlas, options]);
      Object.assign(layer, options);
      return layer;
    },
  };

  const result = createStealthAttackShadowLayer("shadow-atlas", {
    capacity: 64,
    order: 41,
    pivot: [0.5, 0.5],
    api,
  });

  assert.match(STEALTH_ATTACK_YELLOW_FRAGMENT, /sampled\.a/);
  assert.match(STEALTH_ATTACK_YELLOW_FRAGMENT, /in\.tint\.rgb/);
  assert.match(STEALTH_ATTACK_YELLOW_FRAGMENT, /vec4f\(in\.tint\.rgb, alpha\)/);
  assert.equal(result, layer);
  assert.equal(calls[0][0], "shadow-atlas");
  assert.equal(calls[0][1].customShader.options.fragment, STEALTH_ATTACK_YELLOW_FRAGMENT);
});
