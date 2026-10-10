import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const paperUrl = new URL("../../../public/ui/tiny-swords/RegularPaper-v2.png", import.meta.url);

test("all menu panels use the high-resolution second paper artwork", async () => {
  const [styles, paper] = await Promise.all([
    readFile(new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url), "utf8"),
    readFile(paperUrl),
  ]);

  assert.match(styles, /url\('\/ui\/tiny-swords\/RegularPaper-v2\.png'\)/);
  assert.doesNotMatch(styles, /url\('\/ui\/tiny-swords\/RegularPaper\.png'\)/);
  assert.match(styles, /\.tiny-swords-panel > \.tiny-swords-slices\s*\{[^}]*border-radius:\s*12px;/s);
  assert.equal(paper.toString("ascii", 1, 4), "PNG");
  assert.ok(paper.readUInt32BE(16) >= 1200, "paper artwork should be at least 1200px wide");
  assert.ok(paper.readUInt32BE(20) >= 1200, "paper artwork should be at least 1200px high");
});

test("primitive menu layout owns shared body and action spacing", async () => {
  const styles = await readFile(
    new URL("../../runtime/ui/tiny-swords-menu.css", import.meta.url),
    "utf8",
  );

  assert.match(styles, /\.ui-layer \.menu-body\s*\{[^}]*gap:\s*12px;/s);
  assert.match(styles, /\.ui-layer \.tiny-swords-body-text\s*\{[^}]*font:\s*22px\/1\.6 Georgia, serif;/s);
  assert.match(styles, /\.ui-layer \.menu-button-container\s*\{[^}]*gap:\s*var\(--menu-action-gap\);/s);
  assert.match(styles, /\.ui-layer \.menu-button-container > \.tiny-swords-button\s*\{[^}]*width:\s*100%;/s);
  assert.doesNotMatch(styles, /\.treasure-content\s*\{[^}]*gap:/s);
  assert.doesNotMatch(styles, /\.tiny-swords-panel > \.tiny-swords-button \+ \.tiny-swords-button/);
});
