import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../../../${path}`, import.meta.url), "utf8");
const demoUrl = "https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/";

test("README screenshot opens the image and demo links to the renamed live game", async () => {
  const readme = await read("README.md");
  assert.match(readme, /<a href="(stealth-steel\/documentation\/images\/stealth-and-steel-gameplay\.png)"><img src="\1" width="400" alt="[^"]+"\s*\/><\/a>/);
  assert.ok(readme.includes(`[${demoUrl}](${demoUrl})`));
  const image = await readFile(new URL("../../../documentation/images/stealth-and-steel-gameplay.png", import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), "PNG");
  assert.deepEqual({ width: image.readUInt32BE(16), height: image.readUInt32BE(20) },
    { width: 576, height: 1024 }, "match the current portrait screenshot dimensions");
});

test("the app uses its GitHub Pages repository path as the deployment URL base", async () => {
  const { default: config } = await import("../../../../vite.config.js");
  assert.equal(config.base, "/blockchain-stealth-and-steel-game/");
});

test("main pushes independently deploy only the verified stable game", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");
  assert.match(workflow, /push:\s*\n\s+branches: \[main\]/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  for(const command of ["npm ci","node stealth-steel/tools/verify-bis-package.mjs","npm run test:publish","npm test","npm run typecheck:bis-contract","npm run build"])assert.ok(workflow.includes("run: "+command),command);
  assert.ok(workflow.indexOf("run: npm test") < workflow.indexOf("run: npm run build"));
  assert.ok(workflow.indexOf("run: npm run build") < workflow.indexOf("actions/upload-pages-artifact"));
  assert.match(workflow, /path: dist/);
  assert.match(workflow, /uses: actions\/deploy-pages@v4/);
  assert.doesNotMatch(workflow, /workflow_dispatch|git push|git tag|gh release|GAME_RELEASE_TAG|blockchain-integration-service|release-cli/);
  await assert.rejects(read(".github/workflows/release.yml"), /ENOENT/);
});

test("README documents BIS-first full-version alignment and one stable game link", async () => {
  const readme = await read("README.md");
  const section = readme.match(/### 🛠 Release Version\r?\n([\s\S]*?)## Project Overview/)?.[1] ?? "";
  assert.match(section, /Release BIS first/);
  assert.match(section, /same complete\s+version/);
  assert.match(section, /actions\/workflows\/deploy-pages\.yml/);
  assert.match(section, /No tag, GitHub Release or manual dispatch is required/);
  assert.doesNotMatch(section, /Manually run|retry_tag|releases\/v|latest\x60 link/);
  assert.equal(readme.split(`](${demoUrl})`).length - 1, 1);
});
