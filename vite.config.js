import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { catalogFromFiles } from "./stealth-steel/src/runtime/gameplay/level-progress.js";
import { REPOSITORY_BASE } from "./stealth-steel/tools/release/release-core.mjs";
import { pagesMetadataPlugin } from "./stealth-steel/tools/release/pages-metadata.mjs";
import { fileURLToPath } from 'node:url';
import {gameContentSecurityPolicy} from './stealth-steel/tools/release/content-security-policy.mjs';

export default defineConfig({
  define: { __GAME_LEVELS__: JSON.stringify(catalogFromFiles(readdirSync(new URL('./stealth-steel/public/assets/levels/tiled/maps/', import.meta.url)))) },
  root: "stealth-steel",
  base: REPOSITORY_BASE,
  plugins: [gameContentSecurityPolicy(),pagesMetadataPlugin({manifestPath:fileURLToPath(new URL('./package.json',import.meta.url)),distPath:fileURLToPath(new URL('./dist',import.meta.url))})],
  build: { outDir: "../dist", emptyOutDir: true },
  server: { host: '127.0.0.1', port: 5176, strictPort: true,
    // Keep local game API calls on this origin while the shared BIS Vite
    // server owns the local signer on its reserved port.
    proxy: { '/api/bis': { target: 'http://127.0.0.1:5174', changeOrigin: false } },
    watch: { ignored: [/\.tmj\.[^\\/]+$/] } },
  // BIS development exports contain TSX using the automatic React runtime.
  oxc: { jsx: { runtime: "automatic" } },
  optimizeDeps: { rolldownOptions: { transform: { jsx: { runtime: "automatic" } } } },
});

