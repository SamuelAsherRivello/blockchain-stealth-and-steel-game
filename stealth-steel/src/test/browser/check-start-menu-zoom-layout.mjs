import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { desktopZoomContext, launchWebGpuChrome } from "./chrome-webgpu.mjs";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5173/stealth-and-steel-game";
const muteQuery = "muteMusic=true&muteSFX=true";
const zoomLevels = [0.5, 0.75, 0.8, 0.9, 1.1, 1.25];
const lowZoomLevels = new Set([0.5, 0.75, 0.8, 0.9]);
const screenshotDirectory = fileURLToPath(new URL("../../../../output/playwright/", import.meta.url));
mkdirSync(screenshotDirectory, { recursive: true });

const approvedReferenceGeometry = new Map([
  [1.1, {
    composition: { left: 0.065513, top: 0.105270, width: 0.868975, height: 0.531139 },
    logo: { left: 0.253790, top: 0.105270, width: 0.492419, height: 0.202727 },
    ribbon: { left: 0.051030, top: 0.291704, width: 0.868975, height: 0.083503 },
    panel: { left: 0.065513, top: 0.320217, width: 0.868975, height: 0.316191 },
    paper: { left: 0.108961, top: 0.320217, width: 0.782077, height: 0.316191 },
    start: { left: 0.172748, top: 0.543995, width: 0.496040, height: 0.039715 },
    items: { left: 0.172748, top: 0.577186, width: 0.496040, height: 0.039715 },
  }],
  [1.25, {
    composition: { left: 0.045267, top: 0.107350, width: 0.909465, height: 0.590766 },
    logo: { left: 0.220165, top: 0.107350, width: 0.559671, height: 0.230414 },
    ribbon: { left: 0.028807, top: 0.319246, width: 0.909465, height: 0.094907 },
    panel: { left: 0.045267, top: 0.351653, width: 0.909465, height: 0.346463 },
    paper: { left: 0.090728, top: 0.351653, width: 0.818544, height: 0.346463 },
    start: { left: 0.153485, top: 0.605993, width: 0.563786, height: 0.045139 },
    items: { left: 0.153485, top: 0.643717, width: 0.563786, height: 0.045139 },
  }],
]);
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

const browser = await launchWebGpuChrome(chromium);

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
        ribbon: bounds(".start-game-prompt-panel .tiny-swords-ribbon"),
        panel: bounds(".start-game-prompt-panel"),
        paper: bounds(".start-game-prompt-panel > .tiny-swords-slices"),
        start: bounds(".start-game-prompt-start"),
        items: bounds(".start-game-prompt-items"),
      };
    });

    for (const [name, rect] of Object.entries(layout)) {
      if (name !== "frame") assert.ok(within(layout.frame, rect), `${zoom * 100}% ${name} leaves the game frame`);
    }
    assert.ok(layout.paper.bottom > layout.items.bottom, `${zoom * 100}% parchment does not enclose Items`);
    assert.deepEqual(errors, [], `${zoom * 100}% browser errors: ${errors.join("; ")}`);

    if (zoom === 1.1 || zoom === 1.25) {
      await page.screenshot({ path: `${screenshotDirectory}fixture-start-menu-${Math.round(zoom * 100)}.png` });
    }
    layouts.push({ zoom, ...layout });
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
  for (const layout of measured.filter(layout => lowZoomLevels.has(layout.zoom))) {
    for (const name of Object.keys(referencePhysical)) {
      assertSameGeometry(layout.physical[name], referencePhysical[name], 3,
        `${layout.zoom * 100}% ${name} must retain the approved 110% physical geometry`);
    }
  }

  console.log("PASS fixture Start Menu zoom layout");
} finally {
  await browser.close();
}
