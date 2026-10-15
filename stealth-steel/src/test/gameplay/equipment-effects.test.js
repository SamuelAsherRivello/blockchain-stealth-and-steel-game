import test from "node:test";
import assert from "node:assert/strict";
import { createEquipmentSnapshot, getPlayerIncomingDamage, getPlayerOutgoingDamage } from "../../runtime/gameplay/equipment-effects.js";

test("equipment applies the approved tier percentages and keeps empty baseline stats", () => {
  const baseline = createEquipmentSnapshot({ status: "ready", effective: {} });
  assert.deepEqual([baseline.movementMultiplier, baseline.outgoingDamageMultiplier, baseline.incomingDamageMultiplier], [1, 1, 1]);
  const snapshot = createEquipmentSnapshot({ status: "ready", effective: {
    Shoes: { attributeDeltas: [{ bisAttribute: "movementSpeed", bisAttributeDelta: 10 }] },
    Dagger: { attributeDeltas: [{ bisAttribute: "playerDamage", bisAttributeDelta: 20 }] },
    Shield: { attributeDeltas: [{ bisAttribute: "damageTaken", bisAttributeDelta: -30 }] },
  } });
  assert.deepEqual([snapshot.movementMultiplier, snapshot.outgoingDamageMultiplier, snapshot.incomingDamageMultiplier], [1.1, 1.2, 0.7]);
  const player = { equipment: snapshot };
  assert.equal(getPlayerOutgoingDamage(player, 25), 30);
  assert.equal(getPlayerIncomingDamage(player, 25), 17.5);
});

test("unavailable equipment never prevents baseline gameplay", () => {
  const snapshot = createEquipmentSnapshot({ status: "unavailable" });
  assert.deepEqual([snapshot.movementMultiplier, snapshot.outgoingDamageMultiplier, snapshot.incomingDamageMultiplier], [1, 1, 1]);
});

test("every approved family and tier maps to its exact gameplay multiplier", () => {
  const cases = [
    ["Shoes", 10, "movementSpeed", "movementMultiplier", 1.1], ["Shoes", 20, "movementSpeed", "movementMultiplier", 1.2], ["Shoes", 30, "movementSpeed", "movementMultiplier", 1.3],
    ["Dagger", 10, "playerDamage", "outgoingDamageMultiplier", 1.1], ["Dagger", 20, "playerDamage", "outgoingDamageMultiplier", 1.2], ["Dagger", 30, "playerDamage", "outgoingDamageMultiplier", 1.3],
    ["Shield", -10, "damageTaken", "incomingDamageMultiplier", 0.9], ["Shield", -20, "damageTaken", "incomingDamageMultiplier", 0.8], ["Shield", -30, "damageTaken", "incomingDamageMultiplier", 0.7],
  ];
  for (const [family, effectPercent, attribute, property, expected] of cases) {
    const snapshot = createEquipmentSnapshot({ status: "ready", effective: { [family]: { attributeDeltas: [{ bisAttribute: attribute, bisAttributeDelta: effectPercent }] } } });
    assert.equal(snapshot[property], expected, `${family} ${effectPercent}%`);
  }
});

test("each spawn snapshot stays stable after a later selection state is read", () => {
  const firstSpawn = createEquipmentSnapshot({ status: "ready", effective: { Dagger: { attributeDeltas: [{ bisAttribute: "playerDamage", bisAttributeDelta: 10 }] } } });
  const nextSpawn = createEquipmentSnapshot({ status: "ready", effective: { Dagger: { attributeDeltas: [{ bisAttribute: "playerDamage", bisAttributeDelta: 30 }] } } });
  assert.equal(firstSpawn.outgoingDamageMultiplier, 1.1);
  assert.equal(nextSpawn.outgoingDamageMultiplier, 1.3);
});

test("gameplay ignores description, family tier, and unrelated deltas", () => {
  const snapshot = createEquipmentSnapshot({ status: "ready", effective: {
    Shoes: { description: "This claims 900% speed", family: "Shield", tier: 3, attributeDeltas: [
      { bisAttribute: "movementSpeed", bisAttributeDelta: 0 },
      { bisAttribute: "playerDamage", bisAttributeDelta: 40 },
    ] },
  } });
  assert.equal(snapshot.movementMultiplier, 1);
  assert.equal(snapshot.outgoingDamageMultiplier, 1);
  assert.equal(snapshot.incomingDamageMultiplier, 1);
});
