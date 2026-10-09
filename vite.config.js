import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { catalogFromFiles } from "./stealth-steel/src/runtime/gameplay/level-progress.js";
import { REPOSITORY_BASE, releaseBase } from "./stealth-steel/tools/release/release-core.mjs";

const releaseTag = process.env.GAME_RELEASE_TAG;

export default defineConfig({
  define: { __GAME_LEVELS__: JSON.stringify(catalogFromFiles(readdirSync(new URL('./stealth-steel/public/assets/levels/tiled/maps/', import.meta.url)))) },
  root: "stealth-steel",
  base: releaseTag ? releaseBase(releaseTag) : REPOSITORY_BASE,
  build: { outDir: "../dist", emptyOutDir: true },
  server: { watch: { ignored: [/\.tmj\.[^\\/]+$/] } },
  // BIS development exports contain TSX using the automatic React runtime.
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
});

