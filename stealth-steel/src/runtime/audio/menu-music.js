import { runtimeSettingsStore, RUNTIME_AUDIO_SETTING_KEYS } from "../runtime-settings/runtime-settings-store.js";
import { normalizeVolume } from "../runtime-settings/runtime-audio-settings.js";

export const MENU_MUSIC_FILE = "BackgroundMusicFantasy01.mp3";
export const GAMEPLAY_MUSIC_FILE = "ForegroundMusicFantasy01.mp3";
export const MUSIC_FADE_DURATION_MS = 300;

function resetAndPlay(track) {
  if (!track.audio.paused) return;
  track.audio.currentTime = 0;
  void track.resume?.();
  void track.audio.play?.().catch(() => {});
}

function toTrack(source) {
  if (source?.audio) {
    return {
      audio: source.audio,
      setGain: source.setGain ?? (value => { source.audio.volume = value; }),
      resume: source.resume,
    };
  }
  return {
    audio: source,
    setGain: value => { source.volume = value; },
    resume: null,
  };
}

/**
 * Keeps the two soundtrack instances mutually exclusive except during their
 * intentional crossfade. Menu count is a reference count, so stacked windows
 * never create a duplicate playback of the menu track.
 */
export function createMusicCrossfader({
  menuAudio,
  gameplayAudio,
  volume = () => 100,
  now = () => performance.now(),
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = frame => cancelAnimationFrame(frame),
  fadeDurationMs = MUSIC_FADE_DURATION_MS,
} = {}) {
  const tracks = [menuAudio, gameplayAudio].map(toTrack).map(track => ({ ...track, fade: 0, target: 0, from: 0 }));
  let openMenuCount = 0;
  let gameplayActive = false;
  let fadeStartedAt = null;
  let frame = null;
  const duration = Math.max(1, Number(fadeDurationMs) || MUSIC_FADE_DURATION_MS);

  const applyVolumes = () => {
    const categoryVolume = normalizeVolume(volume());
    for (const track of tracks) track.setGain(categoryVolume * track.fade);
  };
  const pauseSilentTracks = () => {
    for (const track of tracks) {
      if (track.target === 0 && track.fade === 0 && !track.audio.paused) {
        track.audio.pause?.();
      }
    }
  };
  const tick = (timestamp) => {
    const currentTime = Number.isFinite(timestamp) ? timestamp : now();
    const elapsed = Math.max(0, currentTime - fadeStartedAt);
    const progress = Math.min(1, elapsed / duration);
    for (const track of tracks) track.fade = track.from + (track.target - track.from) * progress;
    applyVolumes();
    if (progress < 1) {
      frame = requestFrame(tick);
      return;
    }
    frame = null;
    fadeStartedAt = null;
    pauseSilentTracks();
  };
  const updateTargets = () => {
    const nextTargets = [openMenuCount > 0 ? 1 : 0, gameplayActive && openMenuCount === 0 ? 1 : 0];
    if (tracks.every((track, index) => track.target === nextTargets[index])) return;
    for (const [index, track] of tracks.entries()) {
      track.target = nextTargets[index];
      track.from = track.fade;
      if (track.target > 0) resetAndPlay(track);
    }
    fadeStartedAt = now();
    if (frame !== null) cancelFrame(frame);
    frame = requestFrame(tick);
  };

  applyVolumes();
  return {
    setOpenMenuCount(count) {
      openMenuCount = Math.max(0, Math.floor(Number(count) || 0));
      updateTargets();
    },
    setGameplayActive(active) {
      gameplayActive = active === true;
      updateTargets();
    },
    unlock() {
      for (const track of tracks) {
        if (track.target > 0) resetAndPlay(track);
      }
    },
    setVolume() { applyVolumes(); },
    dispose() {
      if (frame !== null) cancelFrame(frame);
      frame = null;
      for (const track of tracks) {
        track.fade = 0;
        track.target = 0;
        track.setGain(0);
        track.audio.pause?.();
      }
    },
  };
}

function createTrack(documentRef, file, context = null) {
  const audio = documentRef.createElement("audio");
  audio.preload = "auto";
  audio.loop = true;
  audio.src = `${import.meta.env.BASE_URL}assets/audio/music/${file}`;
  audio.setAttribute("aria-hidden", "true");
  audio.setAttribute("data-game-music", file);
  documentRef.body?.append(audio);
  if (!context) return audio;
  const gain = context.createGain();
  context.createMediaElementSource(audio).connect(gain);
  gain.connect(context.destination);
  return {
    audio,
    setGain(value) { gain.gain.value = value; },
    resume() { return context.resume().catch(() => {}); },
  };
}

function visibleMenuCount(documentRef) {
  return documentRef.querySelectorAll?.(".menu-backdrop:not([hidden])").length ?? 0;
}

let installedMusic = null;

export function installMusic(documentRef = document) {
  if (installedMusic) return installedMusic.controller;
  const Context = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  let context = null;
  try { context = Context ? new Context() : null; } catch { context = null; }
  const controller = createMusicCrossfader({
    menuAudio: createTrack(documentRef, MENU_MUSIC_FILE, context),
    gameplayAudio: createTrack(documentRef, GAMEPLAY_MUSIC_FILE, context),
    volume: () => runtimeSettingsStore.get(RUNTIME_AUDIO_SETTING_KEYS.music),
  });
  const syncMenuMusic = () => controller.setOpenMenuCount(visibleMenuCount(documentRef));
  const observer = globalThis.MutationObserver && new MutationObserver(syncMenuMusic);
  observer?.observe(documentRef.body ?? documentRef.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["hidden", "class", "style"],
  });
  const unlock = () => {
    syncMenuMusic();
    controller.unlock();
  };
  documentRef.addEventListener("pointerdown", unlock, true);
  documentRef.addEventListener("keydown", unlock, true);
  const unsubscribe = runtimeSettingsStore.subscribe(
    RUNTIME_AUDIO_SETTING_KEYS.music,
    () => controller.setVolume(),
  );
  const dispose = () => {
    observer?.disconnect();
    documentRef.removeEventListener("pointerdown", unlock, true);
    documentRef.removeEventListener("keydown", unlock, true);
    unsubscribe();
    controller.dispose();
    void context?.close?.();
    documentRef.querySelectorAll?.("[data-game-music]").forEach(audio => audio.remove());
    installedMusic = null;
  };
  globalThis.addEventListener?.("pagehide", dispose, { once: true });
  installedMusic = { controller, dispose };
  syncMenuMusic();
  return controller;
}

export function setGameplayMusicActive(active) {
  installedMusic?.controller.setGameplayActive(active);
}
