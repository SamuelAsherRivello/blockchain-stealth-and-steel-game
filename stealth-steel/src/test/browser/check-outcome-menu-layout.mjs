import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5173/stealth-and-steel-game";
const muteQuery = "muteMusic=true&muteSFX=true";
const executablePath = process.env.CHROME_PATH
  ?? (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined);
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : {}),
  args: ["--no-sandbox", "--disable-crash-reporter", "--disable-crashpad"],
});

try {
  const context = await browser.newContext({ viewport: { width: 2560, height: 1600 } });
  for (const outcome of ["completion", "loss"]) {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${baseUrl}/src/test/browser/outcome-layout-host.html?outcome=${outcome}&${muteQuery}`, {
      waitUntil: "domcontentloaded",
      timeout: 10_000,
    });
    await page.waitForFunction(() => Boolean(window.outcomeLayoutFixture));

    const layout = await page.evaluate(() => {
      const bounds = selector => {
        const value = document.querySelector(selector)?.getBoundingClientRect();
        if (!value) throw new Error(`Missing ${selector}`);
        return { left: value.left, top: value.top, right: value.right, bottom: value.bottom, width: value.width, height: value.height };
      };
      const visible = [...document.querySelectorAll(".level-complete-panel .menu-actions > .tiny-swords-button")]
        .filter(button => !button.hidden);
      return {
        frame: bounds(".game-frame"),
        paper: bounds(".level-complete-panel > .tiny-swords-slices"),
        body: bounds(".level-complete-panel .tiny-swords-body-text"),
        actions: visible.map(button => ({
          rect: (() => { const value = button.getBoundingClientRect(); return { top: value.top, bottom: value.bottom }; })(),
          label: button.textContent,
        })),
      };
    });

    assert.deepEqual(errors, [], `${outcome} browser errors: ${errors.join("; ")}`);
    assert.ok(layout.actions.length >= 2, `${outcome} should show at least two actions`);
    for (const action of layout.actions) {
      assert.ok(action.rect.top >= layout.paper.top, `${outcome} action starts above paper`);
      assert.ok(action.rect.bottom <= layout.paper.bottom, `${outcome} action leaves paper`);
    }
    assert.ok(layout.paper.bottom - layout.actions.at(-1).rect.bottom >= 8, `${outcome} lacks lower paper breathing room`);
    assert.ok(layout.actions.slice(1).every((action, index) => action.rect.top - layout.actions[index].rect.bottom >= 1), `${outcome} action faces overlap`);
    assert.ok(layout.actions[0].rect.top - layout.body.bottom >= 8, `${outcome} body and actions are crowded`);
    await page.screenshot({ path: `output/playwright/outcome-${outcome}-100.png` });
    await page.close();
  }
  await context.close();
  console.log("PASS fullscreen 100% outcome menu layout");
} finally {
  await browser.close();
}
