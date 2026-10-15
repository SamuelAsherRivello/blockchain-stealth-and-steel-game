import { RUNTIME_AUDIO_SETTING_KEYS } from "./runtime-settings-store.js";

function hasMuteParameter(parameters, name) {
  return parameters.get(name) === "true";
}

export function applyUrlAudioMuteParameters({ search = "", store } = {}) {
  const parameters = new URLSearchParams(search);
  // Audio is unmuted by default. AI-created/test windows must explicitly pass
  // both parameters as true when they need to be silent.
  const musicMuted = hasMuteParameter(parameters, "muteMusic");
  const sfxMuted = hasMuteParameter(parameters, "muteSFX");

  if (musicMuted) store?.set(RUNTIME_AUDIO_SETTING_KEYS.music, 0);
  if (sfxMuted) store?.set(RUNTIME_AUDIO_SETTING_KEYS.sfx, 0);

  return { musicMuted, sfxMuted };
}

export function normalizeVolume(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.min(100, Math.max(0, numericValue)) / 100;
}

export function applyCategoryVolume(baseVolume = 1, categoryVolume = 100) {
  const normalizedBase = Number.isFinite(Number(baseVolume))
    ? Math.min(1, Math.max(0, Number(baseVolume)))
    : 1;
  return normalizedBase * normalizeVolume(categoryVolume);
}
