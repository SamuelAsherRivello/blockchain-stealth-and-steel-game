export const EMPTY_EQUIPMENT_SNAPSHOT = Object.freeze({
  slots: Object.freeze({}),
  movementMultiplier: 1,
  outgoingDamageMultiplier: 1,
  incomingDamageMultiplier: 1,
});

function attributeDelta(item, attribute) {
  const change = item?.attributeDeltas?.find(entry => entry?.bisAttribute === attribute);
  const delta = Number(change?.bisAttributeDelta ?? 0);
  return Number.isSafeInteger(delta) && delta >= -100 && delta <= 100 ? delta : 0;
}

function multiplier(item, attribute) {
  return 1 + attributeDelta(item, attribute) / 100;
}

export function createEquipmentSnapshot(state) {
  if (state?.status !== "ready") return EMPTY_EQUIPMENT_SNAPSHOT;
  const slots = Object.freeze({
    ...(state.effective?.Shoes ? { Shoes: state.effective.Shoes } : {}),
    ...(state.effective?.Dagger ? { Dagger: state.effective.Dagger } : {}),
    ...(state.effective?.Shield ? { Shield: state.effective.Shield } : {}),
  });
  return Object.freeze({
    slots,
    movementMultiplier: multiplier(slots.Shoes, "movementSpeed"),
    outgoingDamageMultiplier: multiplier(slots.Dagger, "playerDamage"),
    incomingDamageMultiplier: multiplier(slots.Shield, "damageTaken"),
  });
}

export function getPlayerOutgoingDamage(player, baseDamage) {
  return baseDamage * (player?.equipment?.outgoingDamageMultiplier ?? 1);
}

export function getPlayerIncomingDamage(player, baseDamage) {
  return baseDamage * (player?.equipment?.incomingDamageMultiplier ?? 1);
}
