import { installSfx } from "./audio/sfx.js";
import { installMusic } from "./audio/menu-music.js";
import { applyUrlAudioMuteParameters } from "./runtime-settings/runtime-audio-settings.js";
import { runtimeSettingsStore } from "./runtime-settings/runtime-settings-store.js";

applyUrlAudioMuteParameters({ search: globalThis.location?.search, store: runtimeSettingsStore });
installSfx();
installMusic();
import { loadWithPreloader } from "./ui/startup-preloader.js";

await loadWithPreloader({
  load: () => import("./main.js"),
  overlay: document.querySelector("#startup-preloader"),
  message: document.querySelector("#startup-message"),
  spinner: document.querySelector("#startup-spinner"),
  retry: document.querySelector("#startup-retry"),
  game: document.querySelector("main"),
  reload: () => location.reload(),
});
