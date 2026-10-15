import test from "node:test";
import assert from "node:assert/strict";
import { createDaggerComboController } from "../../runtime/gameplay/player-dagger-combo.js";

function start(controller) { return controller.request().move; }
test("one-button sequences select ordinary, rapid, and over-fast outcomes", () => {
  const ordinary = createDaggerComboController(); start(ordinary); ordinary.complete(); ordinary.advance(1.5); assert.equal(ordinary.request().move.id, "ordinary");
  const rapid = createDaggerComboController(); start(rapid); rapid.advance(.5); rapid.request(); assert.equal(rapid.complete().id, "rapid-second"); rapid.advance(.5); rapid.request(); assert.equal(rapid.complete().id, "rapid-final");
  const relaxedRapid = createDaggerComboController(); start(relaxedRapid); relaxedRapid.advance(.5); relaxedRapid.request(); assert.equal(relaxedRapid.complete().id, "rapid-second"); assert.equal(relaxedRapid.complete(), null); assert.equal(relaxedRapid.awaitingRapidFinisher, true); relaxedRapid.advance(.5); assert.equal(relaxedRapid.request().move.id, "rapid-final");
  const successfulRapid = createDaggerComboController(); start(successfulRapid); successfulRapid.advance(.5); successfulRapid.request(); assert.equal(successfulRapid.complete().id, "rapid-second"); successfulRapid.advance(.5); successfulRapid.request(); assert.equal(successfulRapid.complete().id, "rapid-final"); successfulRapid.confirmRapidFinisherHit(); successfulRapid.complete(); assert.equal(successfulRapid.cooldown, 1.95);
  const spam = createDaggerComboController(); start(spam); spam.advance(.1); spam.request(); assert.equal(spam.complete().id, "ordinary"); spam.advance(.1); spam.request(); assert.equal(spam.complete().overFast, true); spam.complete(); assert.equal(spam.cooldown, 1);
});
test("only one press buffers, a third over-fast press is penalized, and cancellation clears state", () => {
  const c = createDaggerComboController(); start(c); assert.equal(c.request().buffered, true); assert.equal(c.request().accepted, false); c.complete(); c.advance(.4); assert.equal(c.active, true); c.cancel(); assert.equal(c.active, false); assert.equal(c.cooldown, 0);
  const penalty = createDaggerComboController(); start(penalty); penalty.advance(.05); penalty.request(); penalty.advance(.05); assert.equal(penalty.request().reason, "over-fast"); assert.equal(penalty.complete().id, "ordinary"); assert.equal(penalty.complete().overFast, true); penalty.complete(); assert.equal(penalty.cooldown, 1); penalty.advance(.25); assert.equal(penalty.cooldown, .75);
});
