import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5173/blockchain-stealth-and-steel-game/";
const muteQuery = "muteMusic=true&muteSFX=true";
const browser = process.env.PLAYWRIGHT_CDP
  ? await chromium.connectOverCDP(process.env.PLAYWRIGHT_CDP)
  : await chromium.launch({
    headless: true,
    ...(process.env.SMOKE_CHROMIUM_EXECUTABLE ? { executablePath: process.env.SMOKE_CHROMIUM_EXECUTABLE } : { channel: "msedge" }),
    args: ["--enable-unsafe-webgpu", "--mute-audio"],
  });
const context = process.env.PLAYWRIGHT_CDP ? browser.contexts()[0] : browser;
const page = await context.newPage({ viewport: { width: 1440, height: 900 } });
const outputDirectory = fileURLToPath(new URL("../../../../output/playwright/", import.meta.url));
await mkdir(outputDirectory, { recursive: true });
const screenshotPath = join(outputDirectory, "items-bis-loading.png");
const actionScreenshotPath = join(outputDirectory, "items-bis-action-loading.png");
const hudScreenshotPath = join(outputDirectory, "items-hud-yellow-slot.png");

try {
  await page.goto(`${baseUrl}?${muteQuery}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.getByRole("button", { name: "Open settings", exact: true }).waitFor({ timeout: 60_000 });
  await page.evaluate(() => window.__codexPrepareItemsBisLoading());
  await page.locator(".items-menu-status").waitFor({ state: "attached", timeout: 10_000 });
  await page.locator(".bis-pending-dialog").waitFor({ state: "visible", timeout: 10_000 });
  assert.equal(await page.locator(".items-menu-status").textContent(), "");
  assert.match(await page.locator(".bis-pending-dialog").innerText(), /Loading/);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await page.evaluate(() => window.__codexReleaseItemsBisLoading());
  await page.locator(".bis-pending-dialog").waitFor({ state: "detached", timeout: 10_000 });
  assert.equal(await page.locator(".items-menu-status").textContent(), "Click item to toggle activation.");
  await page.locator('[data-asset-id="qa-dagger"]').click();
  await page.locator(".bis-pending-dialog").waitFor({ state: "visible", timeout: 10_000 });
  assert.equal(await page.locator(".items-menu-status").textContent(), "Click item to toggle activation.");
  assert.match(await page.locator(".bis-pending-dialog").innerText(), /Loading/);
  await page.screenshot({ path: actionScreenshotPath, fullPage: true });
  await page.evaluate(() => window.__codexReleaseItemsBisActionLoading());
  await page.locator(".bis-pending-dialog").waitFor({ state: "detached", timeout: 10_000 });
  await page.getByRole("button", { name: "Close items", exact: true }).click();
  const hudSlot = page.locator('.items-counter-slot[data-family="Dagger"]');
  await hudSlot.waitFor({ state: "visible", timeout: 10_000 });
  const hudProof = await hudSlot.evaluate(slot => {
    const background = getComputedStyle(slot).backgroundColor;
    const square = slot.getBoundingClientRect();
    const icon = slot.querySelector("img")?.getBoundingClientRect();
    return { background, square: { width: square.width, height: square.height }, icon: { width: icon?.width ?? 0, height: icon?.height ?? 0 } };
  });
  assert.equal(hudProof.background, "rgba(255, 245, 217, 0.18)");
  assert.equal(hudProof.square.width, hudProof.square.height);
  assert.equal(hudProof.icon.width, hudProof.square.width);
  assert.equal(hudProof.icon.height, hudProof.square.height);
  await page.screenshot({ path: hudScreenshotPath, fullPage: true });
  console.log("PASS: BIS loading dialog is visible during initial item loading and item activation");
  console.log(`Screenshots: ${screenshotPath}, ${actionScreenshotPath}, ${hudScreenshotPath}`);
} finally {
  await browser.close();
}
