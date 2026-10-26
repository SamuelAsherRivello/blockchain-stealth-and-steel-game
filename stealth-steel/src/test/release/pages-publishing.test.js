import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../../../${path}`, import.meta.url), "utf8");
const demoUrl = "https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/";

test("README screenshot opens the image and demo links to the renamed live game", async () => {
  const readme = await read("README.md");
  assert.match(readme, /<a href="(docs\/images\/stealth-and-steel-gameplay\.png)"><img src="\1" width="400" alt="[^"]+"\s*\/><\/a>/);
  assert.ok(readme.includes(`[${demoUrl}](${demoUrl})`));
  const image = await readFile(new URL("../../../../docs/images/stealth-and-steel-gameplay.png", import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), "PNG");
  assert.deepEqual({ width: image.readUInt32BE(16), height: image.readUInt32BE(20) },
    { width: 576, height: 1024 }, "match the current portrait screenshot dimensions");
});

test("the app uses its GitHub Pages repository path as the deployment URL base", async () => {
  const { default: config } = await import("../../../../vite.config.js");
  assert.equal(config.base, "/blockchain-stealth-and-steel-game/");
});

test("main pushes deploy the stable game and manual releases publish versioned Pages", async () => {
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
  const release = await read(".github/workflows/release.yml");
  assert.match(release, /workflow_dispatch:/);
  assert.match(release, /run: node stealth-steel\/tools\/release\/release-cli\.mjs prepare/);
  assert.match(release, /run: npm ci/);
  assert.match(release, /run: npm run test:publish/);
  assert.match(release, /run: npm test/);
  assert.match(release, /run: npm run typecheck:bis-contract/);
  assert.match(release, /run: npm run build/);
  assert.match(release, /git push --atomic/);
  assert.match(release, /gh release create/);
  assert.match(release, /uses: actions\/deploy-pages@v4/);
});

test("README documents BIS-first full-version alignment and manual release publication", async () => {
  const readme = await read("README.md");
  const section = readme.match(/### 🛠 Release Version\r?\n([\s\S]*?)## Project Overview/)?.[1] ?? "";
  assert.match(section, /Release BIS first/);
  assert.match(section, /same\s+complete\s+version/);
  assert.match(section, /actions\/workflows\/release\.yml/);
  assert.match(section, /Manually run/);
  assert.match(section, /GitHub Release asset/);
  assert.match(section, /retry_tag/);
  assert.doesNotMatch(section, /v\d+\.\d+\.\d+/);
  assert.equal(readme.split(`](${demoUrl})`).length - 1, 1);
});
