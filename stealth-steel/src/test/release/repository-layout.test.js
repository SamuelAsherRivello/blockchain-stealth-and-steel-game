import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const app = join(root, "stealth-steel");
const assets = join(app, "public/assets");
const runOpenSpecContext = () => spawnSync(process.execPath, [join(root, "openspec/cli.mjs"), "context", "--json"], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, OPENSPEC_TELEMETRY: "0" },
});
const openSpecContextResult = runOpenSpecContext();
const openSpecMissing = openSpecContextResult.status !== 0
  && /Install OpenSpec 1\.14\.0/.test(openSpecContextResult.stderr || openSpecContextResult.stdout);
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

test("root commands target the contained application and preserve Pages output", async () => {
  const { default: config } = await import("../../../../vite.config.js");
  assert.equal(resolve(root, config.root), app);
  assert.equal(resolve(app, config.build.outDir), join(root, "dist"));
  assert.equal(config.base, "/blockchain-stealth-and-steel-game/");
  assert.ok(config.server.watch.ignored.some(pattern => (
    pattern instanceof RegExp && pattern.test("Level01.tmj.XuvJSi")
  )));
  assert.ok(config.server.watch.ignored.every(pattern => (
    !(pattern instanceof RegExp) || !pattern.test("Level01.tmj")
  )));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const index = readFileSync(join(app, "index.html"), "utf8");
  assert.match(index, /href="\.\/favicon\.svg\?v=2"/);
  assert.match(index, /href="\.\/favicon\.ico\?v=2"/);
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
  assert.equal(pkg.scripts.test, "node stealth-steel/src/test/run-tests.mjs");
  for (const [name, dependency] of Object.entries(pkg.dependencies)) {
    assert.equal(lock.packages[""].dependencies[name], dependency);
    if (dependency.startsWith("file:")) assert.ok(existsSync(join(root, dependency.slice(5))), dependency);
  }
  for (const legacy of ["src", "test", "scripts", "public", "plugins", "vendor", "documentation", "index.html"]) {
    assert.equal(existsSync(join(root, legacy)), false, `Legacy root path: ${legacy}`);
  }
  assert.ok(existsSync(join(root, "openspec/config.yaml")));
});

test("the repository OpenSpec adapter supports the pinned latest CLI in openspec", {
  skip: openSpecMissing ? "OpenSpec 1.14.0 is not installed in this environment." : false,
}, () => {
  assert.equal(openSpecContextResult.status, 0, openSpecContextResult.stderr || openSpecContextResult.stdout);
  const context = JSON.parse(openSpecContextResult.stdout);
  assert.equal(context.root.path, resolve(root));
  assert.equal(context.root.source, "nearest");
  assert.equal(context.root.role, "openspec_root");
});

test("the repository routes OpenSpec through its local adapter", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.openspec, "node openspec/cli.mjs");
  assert.ok(existsSync(join(root, "openspec/cli.mjs")));
});

test("every active Tiled image and external tileset resolves inside the public asset tree", () => {
  let references = 0;
  const visit = (value, file) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (["image", "source"].includes(key) && typeof child === "string") {
        const target = resolve(dirname(file), child);
        assert.ok(target.startsWith(assets + "/") || target.startsWith(assets + "\\"), target);
        assert.ok(existsSync(target), `${file}: ${child}`);
        if (key === "image") assert.ok(target.startsWith(join(assets, "images")), target);
        references++;
      } else visit(child, file);
    }
  };
  for (const file of walk(join(assets, "levels"))) {
    // Historical editor backups can reference retired palettes; preserve them.
    if (/\.(tmj|tsj)$/.test(file) && !file.endsWith(".bak.tmj")) visit(JSON.parse(readFileSync(file, "utf8")), file);
  }
  assert.ok(references > 20, "Check the maps and the entire tileset palette");
});

test("image sources sit beside their exports and public images use the game or themed UI folders", () => {
  assert.deepEqual(readdirSync(assets).sort(), ["audio", "images", "levels"]);
  for (const file of walk(join(app, "public"))) {
    if (/\.(png|svg|aseprite|jpe?g|webp)$/i.test(file)) {
      const inGameImages = file.startsWith(join(assets, "images") + "/") || file.startsWith(join(assets, "images") + "\\");
      const inThemedUi = dirname(file) === join(app, "public/ui/tiny-swords") && file.endsWith(".png");
      const isBrowserFavicon = file === join(app, "public/favicon.svg");
      assert.ok(inGameImages || inThemedUi || isBrowserFavicon, file);
    }
    if (file.endsWith(".aseprite")) {
      const bytes = readFileSync(file);
      assert.equal(bytes.readUInt16LE(4), 0xa5e0);
      assert.equal(bytes.readUInt32LE(0), bytes.length);
      assert.ok(readdirSync(dirname(file)).some(name => name.endsWith(".png")), file);
    }
  }
  assert.ok(existsSync(join(assets, "images/enemies/archer/Arrow.png")));
  assert.ok(existsSync(join(app, "public/environment.json")));
  const ignore = readFileSync(join(root, ".gitignore"), "utf8");
  assert.ok(ignore.includes("stealth-steel/public/assets/images/enemies/goblin/Torch_Red.aseprite"));
});
