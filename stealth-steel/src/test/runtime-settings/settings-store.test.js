import test from "node:test";
import assert from "node:assert/strict";

import {
  AUDIO_SETTING_KEYS,
  DEBUG_SETTING_KEYS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  createSettingsStore,
} from "../../runtime/runtime-settings/runtime-settings-store.js";
import {
  applyCategoryVolume,
  applyUrlAudioMuteParameters,
  normalizeVolume,
} from "../../runtime/runtime-settings/runtime-audio-settings.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    has(key) { return values.has(key); },
    read(key) { return values.get(key); },
  };
}

test("all visualization preferences persist independently and obsolete previews are ignored", () => {
  const obsolete = ["debug.showCropMarks", "debug.showParticleFxPreview", "debug.showAnimatedTilePreview"];
  const storage = createStorage({
    [SETTINGS_STORAGE_KEY]: JSON.stringify({ version: SETTINGS_VERSION,
      values: Object.fromEntries(obsolete.map(key => [key, true])) }),
  });
  const store = createSettingsStore(storage);
  const keys = Object.values(DEBUG_SETTING_KEYS);
  assert.equal(keys.length, 5);
  for (const key of obsolete) assert.equal(store.get(key), undefined);
  for (const key of keys) {
    store.reset();
    store.set(key, true);
    const reloaded = createSettingsStore(storage);
    for (const other of keys) assert.equal(reloaded.get(other), other === key);
    for (const removed of obsolete) assert.equal(Object.hasOwn(JSON.parse(storage.read(SETTINGS_STORAGE_KEY)).values, removed), false);
  }
  store.reset();
  for (const key of keys) assert.equal(store.get(key), false);
});

test("settings default to music 20, SFX 100, and debug visualizations off", () => {
  const store = createSettingsStore(createStorage());
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 20);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showCoordinates), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showEnemyPerceptions), false);
});

test("visualization settings persist independently and notify subscribers", () => {
  const storage = createStorage();
  const store = createSettingsStore(storage);
  const observed = [];
  store.subscribe(
    DEBUG_SETTING_KEYS.showCoordinates,
    (value) => observed.push(["coordinates", value]),
  );
  store.subscribe(
    DEBUG_SETTING_KEYS.showEnemyPerceptions,
    (value) => observed.push(["perceptions", value]),
  );

  assert.equal(store.set(DEBUG_SETTING_KEYS.showCoordinates, true), true);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showEnemyPerceptions), false);
  assert.equal(store.set(DEBUG_SETTING_KEYS.showEnemyPerceptions, true), true);
  assert.deepEqual(observed, [
    ["coordinates", true],
    ["perceptions", true],
  ]);
  assert.deepEqual(JSON.parse(storage.read(SETTINGS_STORAGE_KEY)), {
    version: SETTINGS_VERSION,
    values: {
      [DEBUG_SETTING_KEYS.showCoordinates]: true,
      [DEBUG_SETTING_KEYS.showEnemyPerceptions]: true,
    },
  });
});

test("valid settings persist in one versioned document and notify subscribers", () => {
  const storage = createStorage({
    unrelated: "keep",
    [SETTINGS_STORAGE_KEY]: JSON.stringify({
      version: SETTINGS_VERSION,
      values: { "display.fullScreen": true },
    }),
  });
  const store = createSettingsStore(storage);
  const observed = [];
  store.subscribe(AUDIO_SETTING_KEYS.music, (value) => observed.push(value));

  assert.equal(store.set(AUDIO_SETTING_KEYS.music, 42), 42);
  assert.deepEqual(observed, [42]);
  assert.equal(storage.read("unrelated"), "keep");
  assert.deepEqual(JSON.parse(storage.read(SETTINGS_STORAGE_KEY)), {
    version: SETTINGS_VERSION,
    values: { [AUDIO_SETTING_KEYS.music]: 42 },
  });
});

test("invalid, malformed, and wrong-version settings recover per key", () => {
  const malformed = createSettingsStore(createStorage({
    [SETTINGS_STORAGE_KEY]: "not json",
  }));
  assert.equal(malformed.get(AUDIO_SETTING_KEYS.music), 20);

  const wrongVersion = createSettingsStore(createStorage({
    [SETTINGS_STORAGE_KEY]: JSON.stringify({ version: 99, values: {
      [AUDIO_SETTING_KEYS.music]: 10,
    } }),
  }));
  assert.equal(wrongVersion.get(AUDIO_SETTING_KEYS.music), 20);

  const invalidValues = createSettingsStore(createStorage({
    [SETTINGS_STORAGE_KEY]: JSON.stringify({ version: SETTINGS_VERSION, values: {
      [AUDIO_SETTING_KEYS.music]: -1,
      [AUDIO_SETTING_KEYS.sfx]: 75,
      [DEBUG_SETTING_KEYS.showColliders]: "yes",
      [DEBUG_SETTING_KEYS.showCoordinates]: "yes",
      [DEBUG_SETTING_KEYS.showEnemyPerceptions]: 1,
    } }),
  }));
  assert.equal(invalidValues.get(AUDIO_SETTING_KEYS.music), 20);
  assert.equal(invalidValues.get(AUDIO_SETTING_KEYS.sfx), 75);
  assert.equal(invalidValues.get(DEBUG_SETTING_KEYS.showColliders), false);
  assert.equal(invalidValues.get(DEBUG_SETTING_KEYS.showCoordinates), false);
  assert.equal(invalidValues.get(DEBUG_SETTING_KEYS.showEnemyPerceptions), false);
});

test("unavailable storage falls back to an authoritative in-memory session", () => {
  const storage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("full"); },
    removeItem() { throw new Error("blocked"); },
  };
  const store = createSettingsStore(storage);
  assert.doesNotThrow(() => store.set(AUDIO_SETTING_KEYS.sfx, 35));
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 35);
  assert.doesNotThrow(() => store.reset());
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
});

test("reset removes only the game settings record, restores defaults, and notifies", () => {
  const storage = createStorage({
    "external-preference": "keep",
    "another-application-state": "preserve",
  });
  const store = createSettingsStore(storage);
  store.set(AUDIO_SETTING_KEYS.music, 10);
  store.set(AUDIO_SETTING_KEYS.sfx, 20);
  store.set(DEBUG_SETTING_KEYS.showColliders, true);
  store.set(DEBUG_SETTING_KEYS.showCoordinates, true);
  store.set(DEBUG_SETTING_KEYS.showEnemyPerceptions, true);
  const observed = [];
  store.subscribe(AUDIO_SETTING_KEYS.music, (value) => observed.push(["music", value]));
  store.subscribe(AUDIO_SETTING_KEYS.sfx, (value) => observed.push(["sfx", value]));
  store.subscribe(DEBUG_SETTING_KEYS.showColliders, (value) => observed.push(["debug", value]));
  store.subscribe(DEBUG_SETTING_KEYS.showCoordinates, (value) => observed.push(["coordinates", value]));
  store.subscribe(DEBUG_SETTING_KEYS.showEnemyPerceptions, (value) => observed.push(["perceptions", value]));

  store.reset();

  assert.equal(storage.has(SETTINGS_STORAGE_KEY), false);
  assert.equal(storage.read("external-preference"), "keep");
  assert.equal(storage.read("another-application-state"), "preserve");
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 20);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 100);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showColliders), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showCoordinates), false);
  assert.equal(store.get(DEBUG_SETTING_KEYS.showEnemyPerceptions), false);
  assert.deepEqual(observed, [
    ["music", 20],
    ["sfx", 100],
    ["coordinates", false],
    ["perceptions", false],
    ["debug", false],
  ]);
});

test("category volume normalizes, clamps, mutes, and tolerates no playback", () => {
  assert.equal(normalizeVolume(40), 0.4);
  assert.equal(normalizeVolume(-2), 0);
  assert.equal(normalizeVolume(120), 1);
  assert.equal(normalizeVolume("invalid"), 0);
  assert.equal(applyCategoryVolume(0.5, 40), 0.2);
  assert.equal(applyCategoryVolume(2, 100), 1);
  assert.equal(applyCategoryVolume(0.7, 0), 0);
  assert.doesNotThrow(() => applyCategoryVolume(undefined, undefined));
});

test("URL mute parameters initialize their matching audio settings independently", () => {
  const store = createSettingsStore(createStorage());

  assert.deepEqual(
    applyUrlAudioMuteParameters({ search: "?muteMusic=true&muteSFX=true", store }),
    { musicMuted: true, sfxMuted: true },
  );
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 0);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 0);

  const musicOnly = createSettingsStore(createStorage());
  assert.deepEqual(
    applyUrlAudioMuteParameters({ search: "?muteMusic=true", store: musicOnly }),
    { musicMuted: true, sfxMuted: false },
  );
  assert.equal(musicOnly.get(AUDIO_SETTING_KEYS.music), 0);
  assert.equal(musicOnly.get(AUDIO_SETTING_KEYS.sfx), 100);
});

test("URL mute parameters default to unmuted and preserve stored volumes unless true", () => {
  const storage = createStorage({
    [SETTINGS_STORAGE_KEY]: JSON.stringify({
      version: SETTINGS_VERSION,
      values: {
        [AUDIO_SETTING_KEYS.music]: 35,
        [AUDIO_SETTING_KEYS.sfx]: 65,
      },
    }),
  });
  const store = createSettingsStore(storage);

  assert.deepEqual(
    applyUrlAudioMuteParameters({ search: "", store }),
    { musicMuted: false, sfxMuted: false },
  );
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 35);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 65);

  assert.deepEqual(
    applyUrlAudioMuteParameters({ search: "?muteMusic=true", store }),
    { musicMuted: true, sfxMuted: false },
  );
  assert.equal(store.get(AUDIO_SETTING_KEYS.music), 0);
  assert.equal(store.get(AUDIO_SETTING_KEYS.sfx), 65);
});
