import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createPickupSfxStreak, createSfxPlayer, SFX_FILES, isInteractiveButton } from "../../runtime/audio/sfx.js";

test("assigned sound files include the activation and treasure cues and exclude Attack05", async () => {
  assert.equal(Object.keys(SFX_FILES).length, 14);
  assert.equal(SFX_FILES.activate, "Activate01.mp3");
  assert.equal(SFX_FILES.treasure, "Treasure01.mp3");
  assert.ok(!Object.values(SFX_FILES).includes("Attack05.mp3"));
  await Promise.all(Object.values(SFX_FILES).map(file => access(new URL(`../../../public/assets/audio/sfx/${file}`, import.meta.url))));
});

test("a valid stealth execution uses the supplied stealth-hit sound", async () => {
  assert.equal(SFX_FILES.stealthHit, "StealthHit01.mp3");
  await access(new URL("../../../public/assets/audio/sfx/StealthHit01.mp3", import.meta.url));
  const main = await readFile(new URL("../../runtime/main.js", import.meta.url), "utf8");
  assert.match(main, /playSfx\("stealthHit"\)/);
});

test("playback unlocks, overlaps, respects mute and live volume", async () => {
  let volume = 50;
  const sources = [];
  const gain = { gain: { value: 1 }, connect() {} };
  const gains = [];
  const context = {
    state: "suspended", destination: {},
    createGain: () => {
      const node = gains.length === 0 ? gain : { gain: { value: 1 }, connect() {}, disconnect() {} };
      gains.push(node);
      return node;
    },
    decodeAudioData: async data => data,
    resume() { this.state = "running"; return Promise.resolve(); },
    createBufferSource() {
      const source = { playbackRate: { value: 1 }, connect() {}, start() { this.started = true; }, disconnect() {} };
      sources.push(source); return source;
    }, close() { return Promise.resolve(); },
  };
  const player = createSfxPlayer({ context, baseUrl: "/game/", volume: () => volume,
    fetchAudio: async url => {
      assert.ok(url.startsWith("/game/assets/audio/sfx/"));
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    } });
  await player.ready;
  assert.equal(player.play("pickup"), false);
  await player.unlock();
  assert.equal(player.play("pickup"), true);
  assert.equal(player.play("goblin"), true);
  assert.equal(sources.length, 2);
  for (const pitch of [0.65, 0.82, 1]) {
    assert.equal(player.play("alert", { pitch, volume: 0.2 }), true);
    assert.equal(sources.at(-1).playbackRate.value, pitch);
    assert.equal(gains.at(-1).gain.value, 0.2);
  }
  assert.ok(sources.every(source => source.started));
  assert.equal(gain.gain.value, 0.5);
  volume = 0;
  player.setVolume(volume);
  assert.equal(gain.gain.value, 0);
  assert.equal(player.play("win"), false);
  assert.equal(player.play("unknown"), false);
});

test("button click eligibility excludes disabled and hidden controls", () => {
  const target = (disabled, hidden) => ({ closest: () => ({ matches: () => disabled, closest: () => hidden }) });
  assert.equal(isInteractiveButton(target(false, null)), true);
  assert.equal(isInteractiveButton(target(true, null)), false);
  assert.equal(isInteractiveButton(target(false, {})), false);
  assert.equal(isInteractiveButton({ closest: () => null }), false);
});

test("item menu cards skip the generic click sound so only item activation controls their audio", () => {
  const button = { matches: () => false, closest: selector => selector === ".items-menu-grid" ? {} : null };
  const target = { closest: () => button };
  assert.equal(isInteractiveButton(target), false);
});

test("pickup sounds rise in pitch for a collection streak and cool down after half a second", () => {
  let now = 1_000;
  const plays = [];
  const pickupSfx = createPickupSfxStreak({
    now: () => now,
    play: (name, options) => plays.push({ name, ...options }),
  });

  pickupSfx.play();
  now += 499;
  pickupSfx.play();
  now += 499;
  pickupSfx.play();
  now += 500;
  pickupSfx.play();

  assert.deepEqual(plays, [
    { name: "pickup", pitch: 1 },
    { name: "pickup", pitch: 1.15 },
    { name: "pickup", pitch: 1.3 },
    { name: "pickup", pitch: 1 },
  ]);
});
