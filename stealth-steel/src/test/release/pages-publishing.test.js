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

test("manual release checks contracts before changing remote state or deploying Pages", async () => {
  const workflow = await read(".github/workflows/release.yml");
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\bpush:\s*\n/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /contents: write/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /run: node stealth-steel\/tools\/release\/release-cli\.mjs prepare/);
  assert.match(workflow, /run: npm ci/);
  assert.match(workflow, /run: npm run test:publish/);
  assert.match(workflow, /run: npm test/);
  assert.match(workflow, /run: npm run typecheck:bis-contract/);
  assert.ok(workflow.indexOf("run: npm test") < workflow.indexOf("run: npm run build"));
  assert.ok(workflow.indexOf("run: npm run test:publish") < workflow.indexOf("run: npm run build"));
  assert.ok(workflow.indexOf("run: npm run build") < workflow.indexOf("git push --atomic"));
  assert.ok(workflow.indexOf("git push --atomic") < workflow.indexOf("gh release create"));
  assert.ok(workflow.indexOf("gh release create") < workflow.indexOf("release-cli.mjs stage"));
  assert.match(workflow, /gh release create "\$RELEASE_TAG" "\$RELEASE_ASSET" --verify-tag/);
  assert.match(workflow, /gh release download "\$RELEASE_TAG"/);
  assert.match(workflow, /cmp "\$RELEASE_ASSET" "\$RELEASE_WORK\/existing\/stealth-and-steel-web-build\.zip"/);
  assert.match(workflow, /gh release edit "\$RELEASE_TAG" --draft=false/);
  assert.doesNotMatch(workflow, /--clobber/);
  assert.match(workflow, /run: node stealth-steel\/tools\/release\/release-cli\.mjs stage/);
  assert.match(workflow, /uses: actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /uses: actions\/deploy-pages@v4/);
  assert.match(workflow, /pages-published:%s/);
  assert.doesNotMatch(workflow, /babylon-light-stealth-grid/);
});

test("README documents the manual patch release and incomplete-tag retry", async () => {
  const readme = await read("README.md");
  const section = readme.match(/### 🛠 Release Version\r?\n([\s\S]*?)## Project Overview/)?.[1] ?? "";
  assert.match(section, /blockchain-stealth-and-steel-game\/actions\/workflows\/release\.yml/);
  assert.match(section, /Manually run/);
  assert.match(section, /increments the patch version in `package\.json` and the lockfile/);
  assert.match(section, /GitHub Release asset/);
  assert.match(section, /`latest` link/);
  assert.match(section, /`retry_tag`/);
  assert.doesNotMatch(section, /v\d+\.\d+\.\d+/);
  assert.doesNotMatch(section, /stealth-and-steel-game\/actions\/workflows\/deploy-pages\.yml/);
});
