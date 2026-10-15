import {mutedGameUrl,browserOptions} from './bis-smoke-options.mjs';
// Fresh guest profile: verify the published BIS package in the real game without wallet operations.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 743, height: 1321 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(mutedGameUrl(process.argv[2] ?? 'http://127.0.0.1:4175/'));
  await page.getByRole('button', { name: 'Start', exact: true }).click({ timeout: 60000 });
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  await page.getByRole('button', { name: '⚡ Account', exact: true }).click();
  await page.getByRole('button', { name: 'Network', exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'Signet', exact: true }).click();
  await page.getByRole('button', { name: '⚡ Restore Account', exact: true }).click();
  for (const size of [{ width: 743, height: 1321 }, { width: 360, height: 640 }, { width: 276, height: 300 }]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(100);
    await page.locator('.bis-card').evaluate(card => { card.scrollTop = 6; });
    const layout = await page.locator('.bis-card').evaluate(card => {
      const bounds = card.getBoundingClientRect(), header = card.querySelector('.bis-network-label').getBoundingClientRect();
      const host = document.querySelector('.game-account-host');
      const frame = host.getBoundingClientRect();
      return { top: bounds.top, headerTop: header.top, bottom: bounds.bottom, headerBottom: header.bottom,
        blocked: host.contains(document.elementFromPoint(Math.max(1,frame.left+1),Math.max(1,frame.top+1))), scale: getComputedStyle(document.querySelector('.game-account-mount')).transform };
    });
    assert.ok(layout.headerTop >= layout.top && layout.headerBottom <= layout.bottom, 'Network header is clipped');
    assert.ok(layout.blocked, 'Backdrop must intercept game input');
    assert.equal(layout.scale, 'none', 'BIS uses native sizing');
  }
  await page.setViewportSize({ width: 743, height: 1321 });
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  const output = new URL('../../../../output/playwright/', import.meta.url);
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: fileURLToPath(new URL('bis-release-game.png', output)) });
  assert.deepEqual(errors, []);
  console.log('PASS published BIS package: header visible, native layout, blocking backdrop, guest navigation, zero page errors');
} finally { await browser.close(); }
