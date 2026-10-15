## 1. Treasure Rendering and Interaction Gate

- [x] 1.1 C079-T001 Update the level treasure creation path so every normalized treasure spawner creates its runtime-compatible visible chest at the authored position and depth order independently of BIS readiness; verify the runtime image check and level rendering path, while recording the pre-existing stale Tiled-coordinate assertion separately.
- [x] 1.2 C079-T002 Add a current BIS account/game-wallet readiness check at treasure sensor entry, leaving the rendered chest and sensor intact while suppressing the treasure window and treasure pause for missing, loading, or unavailable setup; verify focused unit tests cover guest and loading entry.
- [x] 1.3 C079-T003 Preserve ready-account entry through the existing treasure UI/session flow and ensure readiness changes do not recreate the chest or duplicate its sensor; verify focused unit tests cover ready setup, re-entry debounce, and post-readiness interaction.

## 2. Verification

- [x] 2.1 C079-T004 Add or update browser-facing coverage proving a guest can see the chest and continue ordinary movement without BIS setup, while a ready account can open the treasure window; verify with the relevant Playwright/browser smoke command and the live localhost browser check.
- [x] 2.2 C079-T005 Run the focused treasure/BIS test suite and production build, confirm all C079 scenarios pass, and record any unrelated pre-existing failures without broadening the change; verify with `npm test` and `npm run build`.

Full-suite verification note: the production build passed and focused C079 tests passed. The broader suite still reports unrelated pre-existing failures in the stale Level01/Tiled authored-coordinate expectation, Level01 roster placement, Warrior animation catalog, and C071 menu-style assertion. The Playwright CLI smoke process hung in this environment, but the same guest-start/no-dialog/no-console-error check passed through the connected Chrome browser against localhost.
