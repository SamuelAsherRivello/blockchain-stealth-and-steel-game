import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { browserOptions } from "./bis-smoke-options.mjs";

const desktopZoomContext = zoom => ({ viewport: { width: Math.round(1440 / zoom), height: Math.round(1080 / zoom) }, deviceScaleFactor: zoom });

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5175/blockchain-stealth-and-steel-game";
const muteQuery = "muteMusic=true&muteSFX=true";
const zoomLevels = [0.5, 0.75, 0.8, 0.9, 1.1, 1.25];

const screenshotDirectory = fileURLToPath(new URL("../../../../output/screenshots/improve-ui-layout-scales-50-to-125/", import.meta.url));
mkdirSync(screenshotDirectory, { recursive: true });

// C084/C085 retain the current centered header and full-size actions. The
// historical C087 action rectangles predate those changes; preserve the
// approved 110% logo/panel anchors and compare all current geometry to 110%.
const approvedReferenceGeometry = new Map([[1.1, {
  composition: { left: 0.065513, top: 0.105270, width: 0.868975 },
  logo: { left: 0.253790, top: 0.105270, width: 0.492419, height: 0.202727 },
  panel: { left: 0.065513, top: 0.320217, width: 0.868975 },
  paper: { left: 0.108961, top: 0.320217, width: 0.782077 },
}]]);
const referenceTolerance = 0.002;

function within(outer, inner) {
  return inner.left >= outer.left
    && inner.top >= outer.top
    && inner.right <= outer.right
    && inner.bottom <= outer.bottom;
}

function frameRelative(rect, frame) {
  return {
    left: (rect.left - frame.left) / frame.width,
    top: (rect.top - frame.top) / frame.height,
    width: rect.width / frame.width,
    height: rect.height / frame.height,
  };
}

function physicalInFrame(rect, frame, zoom) {
  return {
    left: (rect.left - frame.left) * zoom,
    top: (rect.top - frame.top) * zoom,
    width: rect.width * zoom,
    height: rect.height * zoom,
  };
}

function assertSameGeometry(actual, expected, tolerance, message) {
  for (const edge of Object.keys(expected)) {
    assert.ok(Math.abs(actual[edge] - expected[edge]) <= tolerance,
      `${message} ${edge} ${actual[edge].toFixed(3)} differs from ${expected[edge].toFixed(3)}`);
  }
}

const browser = await chromium.launch(browserOptions);

try {
  const layouts = [];
  for (const zoom of zoomLevels) {
    console.log(`Checking ${Math.round(zoom * 100)}% Chrome zoom-equivalent viewport`);
    const context = await browser.newContext(desktopZoomContext(zoom));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));

    await page.goto(`${baseUrl}/src/test/browser/start-menu-zoom-host.html?${muteQuery}`, {
      waitUntil: "domcontentloaded",
      timeout: 10_000,
    });
    await page.waitForFunction(() => Boolean(window.startMenuZoomFixture));
    await page.getByRole("button", { name: "Start", exact: true }).waitFor();

    const layout = await page.evaluate(() => {
      const bounds = selector => {
        const rect = document.querySelector(selector)?.getBoundingClientRect();
        if (!rect) throw new Error(`Missing ${selector}`);
        return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
      };
      return {
        frame: bounds(".game-frame"),
        composition: bounds(".tiny-swords-menu-composition"),
        logo: bounds(".tiny-swords-menu-logo"),
        ribbon: bounds(".start-game-prompt-panel .game-window-header"),
        panel: bounds(".start-game-prompt-panel"),
        paper: bounds(".start-game-prompt-panel > .tiny-swords-slices"),
        start: bounds(".start-game-prompt-start"),
        items: bounds(".start-game-prompt-items"),
      };
    });

    writeFileSync(`${screenshotDirectory}layout-${Math.round(zoom * 100)}.json`, JSON.stringify(layout,null,2));
    for (const [name, rect] of Object.entries(layout)) {
      if (name !== "frame") assert.ok(within(layout.frame, rect), `${zoom * 100}% ${name} leaves the game frame`);
    }
    assert.ok(layout.paper.bottom > layout.items.bottom, `${zoom * 100}% parchment does not enclose Items`);
    for(const action of [layout.start,layout.items]) {
      assert.ok(within(layout.paper,action), "complete action must fit parchment");
      assert.ok(action.height>=44,"action must retain a 44 CSS-pixel hit target");
    }
    assert.deepEqual(errors, [], `${zoom * 100}% browser errors: ${errors.join("; ")}`);

    if (zoom === 1.1 || zoom === 1.25) {
      await page.screenshot({ path: `${screenshotDirectory}fixture-start-menu-${Math.round(zoom * 100)}.png` });
    }
    layouts.push({ zoom, ...layout });
    await page.getByRole('button', { name: 'Items', exact: true }).click();
    assert.deepEqual(await page.evaluate(()=>window.startMenuZoomFixture.events), {start:0,items:1});
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    assert.deepEqual(await page.evaluate(()=>window.startMenuZoomFixture.events), {start:1,items:1});
    await page.locator('[data-start-game-prompt]').waitFor({state:'detached'});
    await context.close();
  }

  const measured = layouts.map(layout => ({
    zoom: layout.zoom,
    relative: Object.fromEntries(Object.entries(layout)
      .filter(([name]) => name !== "frame" && name !== "zoom")
      .map(([name, rect]) => [name, frameRelative(rect, layout.frame)])),
    physical: Object.fromEntries(Object.entries(layout)
      .filter(([name]) => name !== "frame" && name !== "zoom")
      .map(([name, rect]) => [name, physicalInFrame(rect, layout.frame, layout.zoom)])),
  }));
  console.log("MEASURED fixture Start Menu zoom layout", JSON.stringify(measured));

  for (const layout of measured.filter(layout => approvedReferenceGeometry.has(layout.zoom))) {
    const expected = approvedReferenceGeometry.get(layout.zoom);
    for (const [name, expectedBounds] of Object.entries(expected)) {
      assertSameGeometry(layout.relative[name], expectedBounds, referenceTolerance,
        `${layout.zoom * 100}% ${name} must retain its approved geometry`);
    }
  }

  const referencePhysical = measured.find(layout => layout.zoom === 1.1).physical;
  for (const layout of measured) {
    for (const name of Object.keys(referencePhysical)) {
      assertSameGeometry(layout.physical[name], referencePhysical[name], 3,
        `${layout.zoom * 100}% ${name} must retain the approved 110% physical geometry`);
      assertSameGeometry(layout.relative[name], measured.find(item=>item.zoom===1.1).relative[name], referenceTolerance, `${layout.zoom*100}% ${name} frame-relative geometry`);
    }
  }

  console.log("PASS fixture Start Menu zoom layout");
} finally {
  await browser.close();
}
