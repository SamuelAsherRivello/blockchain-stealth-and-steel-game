import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { catalogFromFiles } from "./stealth-steel/src/runtime/gameplay/level-progress.js";
import { REPOSITORY_BASE } from "./stealth-steel/tools/release/release-core.mjs";
import { pagesMetadataPlugin } from "./stealth-steel/tools/release/pages-metadata.mjs";
import { fileURLToPath } from 'node:url';

export default defineConfig({
  define: { __GAME_LEVELS__: JSON.stringify(catalogFromFiles(readdirSync(new URL('./stealth-steel/public/assets/levels/tiled/maps/', import.meta.url)))) },
  root: "stealth-steel",
  base: REPOSITORY_BASE,
  plugins: [pagesMetadataPlugin({manifestPath:fileURLToPath(new URL('./package.json',import.meta.url)),distPath:fileURLToPath(new URL('./dist',import.meta.url))})],
  build: { outDir: "../dist", emptyOutDir: true },
  server: { watch: { ignored: [/\.tmj\.[^\\/]+$/] } },
  // BIS development exports contain TSX using the automatic React runtime.
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
});

