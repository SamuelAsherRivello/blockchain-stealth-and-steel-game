# C067 verification — 2026-09-07

Implemented the user-confirmed overlap plan: fixed knife on Attack/V, 25 damage to every living enemy whose damage collider overlaps the player's at 200 ms in a 400 ms swing, no player walking/contact damage, and no Item/C activation. Existing collider dimensions, enemy attacks, inventory, and loadout selection remain intact.

## Evidence

- Test-first: the new player tests initially failed because the controller dereferenced an absent Item element. After fixing that, they exposed the inactive empty-slot attack and C consuming a held item. The new melee tests initially failed because the melee module did not exist. All focused regressions now pass.
- `npm test -- --test-reporter=spec`: **902 passed, 0 failed**. Output: `output/c067-tests.log`. The suite includes concurrent workspace work; the count reflects the final run rather than only C067 tests.
- `npm run build`: passed. Output: `output/c067-build.log`. Vite reports its existing large-chunk advisory.
- `npm run openspec -- validate controls-update-and-add-attacking --strict`: passed with all six capability deltas present.
- Real Chromium browser checks: `stealth-steel/src/test/browser/check-player-knife.cjs` passed for Goblin, Warrior, Lancer, Archer, and Monk. Each displayed all four knife frames and health progressed 100 → 75 → 50 → 25 → 0 with death completion. Checks also passed for multiple targets, targets leaving overlap, alternate/empty loadout, C preserving held items, coarse updates, held V, accessible Enter, pause/resume, death cancellation, and simultaneous real touch pointers.
- Live game checks: `stealth-steel/src/test/browser/check-player-knife-hud.cjs` passed at 1280×720 and 320×720 with no page errors, no Item element, separated visible Move/Attack controls, and settings pause.
- Visually inspected `output/playwright/c067-hud-320.png` and `output/playwright/c067-goblin-swing.png`. Additional screenshots cover the desktop HUD and each enemy's swing.
- Preview: http://127.0.0.1:5177/ . Ports 5173–5176 were occupied, so Vite selected 5177. The deterministic fixture is `/src/test/browser/player-knife.html` on that server.

## Implementation notes

One game-time clock sets the knife frame and releases its synchronous impact callback. This avoids the generic sprite manager's one-frame-per-update behavior desynchronizing the displayed knife and damage. No queued impact can survive death or a level transition. Pause disables input while preserving the swing; other input disabling cancels it. Resuming gameplay only enables living players in LEVEL_PLAYING.

Two existing tests needed revised contact-damage expectations/extraction boundaries. Unrelated overhead-display tests briefly failed during concurrent workspace edits and passed in the final suite. Existing unrelated whitespace changes were not modified.

## Sync and archive — 2026-09-07

All six capability deltas were synced into main specs and compared again before archiving. All 50 main specs passed validation. The existing health-display requirements were preserved. C067 was archived to `2026-09-07-controls-update-and-add-attacking` with its identity and all 11 completed task IDs preserved.

C061 (`replace-in-game-ui-with-tiny-swords-art`) and other older active controller/corner-anchoring deltas still contain Item/C or two-button descriptions: reconcile those superseded requirements before any later archive would restore them.
