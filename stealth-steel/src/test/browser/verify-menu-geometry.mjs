import { chromium } from 'playwright';
import { browserOptions } from './bis-smoke-options.mjs';
import { mkdirSync } from 'node:fs';
mkdirSync('output/playwright', { recursive: true });

const base = process.argv[2] ?? 'http://127.0.0.1:5176/blockchain-stealth-and-steel-game/';
const parsedBase = new URL(base);
const fixtureRoot = `${parsedBase.origin}${parsedBase.pathname}`;
const zooms = Array.from({ length: 11 }, (_, index) => (index + 5) / 10);
const surfaces = [
  ['start-menu', 'src/test/browser/start-menu-zoom-host.html', '.start-game-prompt-panel'],
  ['settings-menu', 'src/test/browser/settings-menu-zoom-host.html', '.game-window'],
  ['completion-menu', 'src/test/browser/completion-host.html?mode=available', '.level-complete-panel'],
  ['loss-menu', 'src/test/browser/loss-menu-zoom-host.html', '.level-complete-panel'],
];
const browser = await chromium.launch(browserOptions);
const page = await browser.newPage();
try {
  for (const [name, path, selector] of surfaces) for (const zoom of zooms) {
    await page.setViewportSize({ width: Math.round(1280 / zoom), height: Math.round(800 / zoom) });
    const separator = path.includes('?') ? '&' : '?';
    await page.goto(`${fixtureRoot}${path}${separator}muteMusic=true&muteSFX=true`);
    await page.locator(`${selector} .tiny-swords-button:not([hidden])`).first().waitFor();
    const buttons = await page.locator(`${selector} .tiny-swords-button:not([hidden])`).evaluateAll(elements => elements.map(button => {
      const br = button.getBoundingClientRect();
      const lr = button.querySelector('menu-button-label').getBoundingClientRect();
      const paper = button.closest('.tiny-swords-panel').querySelector(':scope > .tiny-swords-slices').getBoundingClientRect();
      return { text: button.querySelector('menu-button-label').textContent, dx: ((lr.left + lr.right) - br.left - br.right) / 2, dy: ((lr.top + lr.bottom) - br.top - br.bottom) / 2, inside: br.left >= paper.left - 1 && br.right <= paper.right + 1 && br.top >= paper.top - 1 && br.bottom <= paper.bottom + 1 };
    }));
    for (const button of buttons) if (Math.abs(button.dx) > 1 || Math.abs(button.dy) > 1 || !button.inside) throw new Error(`${name} ${zoom * 100}% failed: ${JSON.stringify(button)}`);
    await page.screenshot({ path: `output/playwright/${name}-${Math.round(zoom * 100)}-pass.png` });
    console.log(`${name} ${zoom * 100}% PASS (${buttons.length} buttons)`);
    if (name === 'settings-menu') {
      await page.getByRole('button', { name: 'Developer', exact: true }).click();
      await page.locator('.developer-settings-backdrop .tiny-swords-button:not([hidden])').first().waitFor();
      const developerButtons = await page.locator('.developer-settings-backdrop .tiny-swords-button:not([hidden])').evaluateAll(elements => elements.map(button => {
        const br = button.getBoundingClientRect();
        const lr = button.querySelector('menu-button-label').getBoundingClientRect();
        const paper = button.closest('.tiny-swords-panel').querySelector(':scope > .tiny-swords-slices').getBoundingClientRect();
        return { text: button.querySelector('menu-button-label').textContent, dx: ((lr.left + lr.right) - br.left - br.right) / 2, dy: ((lr.top + lr.bottom) - br.top - br.bottom) / 2, br: { top: br.top, height: br.height }, lr: { top: lr.top, height: lr.height }, inside: br.left >= paper.left - 1 && br.right <= paper.right + 1 && br.top >= paper.top - 1 && br.bottom <= paper.bottom + 1 };
      }));
      for (const button of developerButtons) if (Math.abs(button.dx) > 1 || Math.abs(button.dy) > 1 || !button.inside) throw new Error(`developer ${zoom * 100}% failed: ${JSON.stringify(button)}`);
      await page.screenshot({ path: `output/playwright/developer-menu-${Math.round(zoom * 100)}-pass.png` });
      console.log(`developer-menu ${zoom * 100}% PASS (${developerButtons.length} buttons)`);
    }
  }
} finally { await browser.close(); }
