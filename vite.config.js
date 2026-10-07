import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { catalogFromFiles } from "./stealth-steel/src/runtime/gameplay/level-progress.js";

export default defineConfig({
  define: { __GAME_LEVELS__: JSON.stringify(catalogFromFiles(readdirSync(new URL('./stealth-steel/public/assets/levels/tiled/maps/', import.meta.url)))) },
  root: "stealth-steel",
  base: "/blockchain-stealth-and-steel-game/",
  build: { outDir: "../dist", emptyOutDir: true },
  server: { watch: { ignored: [/\.tmj\.[^\\/]+$/] } },
  // BIS development exports contain TSX using the automatic React runtime.
  esbuild: { jsx: "automatic" },
  optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
});

