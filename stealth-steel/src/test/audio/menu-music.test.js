import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";

import {
  GAMEPLAY_MUSIC_FILE,
  MENU_MUSIC_FILE,
  createMusicCrossfader,
} from "../../runtime/audio/menu-music.js";

function createAudio({ blockPlay = false } = {}) {
  return {
    currentTime: 12,
    paused: true,
    volume: 1,
    playCalls: 0,
    pauseCalls: 0,
    play() {
      this.playCalls += 1;
      if (blockPlay) return Promise.reject(new Error("gesture required"));
      this.paused = false;
      return Promise.resolve();
    },
    pause() { this.pauseCalls += 1; this.paused = true; },
  };
}

test("the supplied fantasy tracks are the menu and gameplay music assets", async () => {
  assert.equal(MENU_MUSIC_FILE, "BackgroundMusicFantasy01.mp3");
  assert.equal(GAMEPLAY_MUSIC_FILE, "ForegroundMusicFantasy01.mp3");
  await access(new URL(`../../../public/assets/audio/music/${MENU_MUSIC_FILE}`, import.meta.url));
  await access(new URL(`../../../public/assets/audio/music/${GAMEPLAY_MUSIC_FILE}`, import.meta.url));
});

test("menus crossfade over gameplay music once, regardless of how many windows are open", () => {
  const menuAudio = createAudio();
  const gameplayAudio = createAudio();
  let now = 0;
  let nextFrame = null;
  const player = createMusicCrossfader({
    menuAudio,
    gameplayAudio,
    volume: () => 20,
    now: () => now,
    requestFrame: callback => { nextFrame = callback; return 1; },
    cancelFrame: () => { nextFrame = null; },
    fadeDurationMs: 100,
  });

  player.setGameplayActive(true);
  assert.equal(gameplayAudio.playCalls, 1);
  now = 100;
  nextFrame();
  assert.equal(gameplayAudio.volume, 0.2);

  player.setOpenMenuCount(1);
  assert.equal(menuAudio.playCalls, 1);
  assert.equal(menuAudio.currentTime, 0);
  assert.equal(menuAudio.volume, 0);
  now = 150;
  nextFrame();
  assert.equal(menuAudio.volume, 0.1);
  assert.equal(gameplayAudio.volume, 0.1);

  player.setOpenMenuCount(2);
  assert.equal(menuAudio.playCalls, 1);
  now = 200;
  nextFrame();
  assert.equal(menuAudio.volume, 0.2);
  assert.equal(gameplayAudio.volume, 0);
  assert.equal(gameplayAudio.pauseCalls, 1);

  player.setOpenMenuCount(0);
  now = 250;
  nextFrame();
  assert.equal(menuAudio.volume, 0.1);
  assert.equal(gameplayAudio.volume, 0.1);
  assert.equal(menuAudio.pauseCalls, 0);
  now = 300;
  nextFrame();
  assert.equal(menuAudio.volume, 0);
  assert.equal(menuAudio.pauseCalls, 1);
  assert.equal(gameplayAudio.volume, 0.2);
});

test("both music tracks respect live settings while they are faded in", () => {
  const menuAudio = createAudio();
  const gameplayAudio = createAudio();
  let now = 0;
  let nextFrame = null;
  let volume = 20;
  const player = createMusicCrossfader({
    menuAudio,
    gameplayAudio,
    volume: () => volume,
    now: () => now,
    requestFrame: callback => { nextFrame = callback; return 1; },
    cancelFrame: () => { nextFrame = null; },
    fadeDurationMs: 100,
  });

  player.setGameplayActive(true);
  now = 100;
  nextFrame();
  assert.equal(gameplayAudio.volume, 0.2);
  volume = 50;
  player.setVolume(volume);
  assert.equal(gameplayAudio.volume, 0.5);
});

test("a user gesture retries a menu track that autoplay policy initially blocked", () => {
  const menuAudio = createAudio({ blockPlay: true });
  const player = createMusicCrossfader({
    menuAudio,
    gameplayAudio: createAudio(),
    requestFrame: () => 1,
    cancelFrame() {},
  });

  player.setOpenMenuCount(1);
  assert.equal(menuAudio.playCalls, 1);
  player.unlock();
  assert.equal(menuAudio.playCalls, 2);
});
