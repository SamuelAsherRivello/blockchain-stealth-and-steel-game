# Verification — 2026-10-09

## Release identity

- BIS releases first; game imports the archive and publishes the same **complete** version: 0.0.18.
- BIS exported release source: `64b090f869656057823d023b5e31e202c28930b3`.
- [Successful BIS release Pages run](https://github.com/SamuelAsherRivello/blockchain-integration-service/actions/runs/37901274392).
- Archive: `bis-integration-0.0.18.tgz`, SHA-256 `bb9066ff8f82b9a85da0e3bd43255e21ba17a9a788b16145801630fdf8afe118`, 127 files.
- Later BIS same-version presentation/loading updates at `89e0b4beb5228c0ac275a3eb25ab456090e631e0` also deployed successfully. The imported immutable archive remains the verified source above, not those later UI edits.
- Game runtime release commit: `0d1987ca47abb4705eb6086b38a15251847600fc`; [successful push-triggered Pages run](https://github.com/SamuelAsherRivello/blockchain-stealth-and-steel-game/actions/runs/37907941884). No tag or GitHub Release required.
- Final paired live check: both BIS demo routes HTTP 200/version 0.0.18; stable game route HTTP 200/game `v0.0.18`/embedded `BIS: v0.0.18`, guest Account open/Back/Settings resume, zero page/console/network errors. Catalog and immutable shoes/trophy artwork routes HTTP 200. Raw evidence: `output/playwright/paired-live-check.json`.
- Linux CI: 1,122 tests pass, zero fail, one existing optional installed-OpenSpec test skipped because the runner does not install that CLI. That same compatibility test passes locally with the reviewed 1.14.0 CLI. CI package/typecheck/publishing/build/deployment gates all pass.
- Published metadata records the exact CI build total: **18,493,720 bytes**. This differs from the Windows checkout build below; each completed build independently measures its own output. Live metadata matches the successful CI log, not an assumed cross-platform byte count.

## Final local gates

- Lockfile installation reproduced with `npm ci --ignore-scripts`, without peer overrides.
- Package verifier: archive SHA-256, every installed file and public runtime/style/type entries pass.
- `npm run typecheck:bis-contract`: real installed public declarations and actual consumer modules pass; negative fixtures reject missing callbacks/private members.
- `npm test`: **1,123/1,123 pass**, zero skipped/failed.
- `npm run test:publish`: **10/10 pass**.
- `npm run build`: pass; `environment.json` is `v0.0.18`, fixed-width size **18,504,951** final uncompressed bytes. Mismatched full game/BIS versions fail the build hook.
- Strict C088 validation: pass. CLI compatibility/canonical-ID and documentation/link/type inventory tests pass.

## Actual browser acceptance

Fresh Windows Edge contexts, both mute query parameters on every URL, no existing wallet/storage:

- Development and production: normal startup/guest play, matching visible game/BIS versions, unavailable guest Items and treasure, Account open/close/native narrow layout, inert/focus containment, fullscreen relocation, Restore navigation after network selection, safe local reset and subsequent Account navigation.
- Production: held-key pause/no replay/resumed movement; deliberately aborted or delayed package loading yields bounded unavailable UI and Back-to-Settings without a late reopen.
- Development-only existing QA: triggers gameplay loss/completion, checks unchanged 1,000-sat price/disabled guest payment, disabled guest trophy collection, allowed normal navigation and in-document run replacement. No confirmed financial outcome is fabricated.
- Existing README images captured from the real production UI at their existing paths, both 576×1024, then visually inspected.
- Successful normal acceptance has zero page/console errors and failed network requests. Intentional failure tests are separate from normal network checks.

Initial diagnostic failures were harness assumptions: Windows SwiftShader produced no WebGPU adapter, Restore requires a selected network, the blocked Settings gear is not its modal Close control, and restart deliberately skips a second Welcome menu. Tests now use the actual supported behavior; no runtime gate was skipped to pass them.

## Documentation and limits

Both deep dives, communication analysis, three templates, treasure guide, refactor notes, README/provenance and current smoke guidance audited. Full reviewed-doc/media inventory and logs are under ignored `output/reports/formalize-bis-game-contracts/` and `output/logs/formalize-bis-game-contracts/`. The old exploration is clearly historical.

Remaining three CSS implementation-selector dependencies are disclosed; no official theme API or removal of all presentation coupling is claimed. Issued immutable artwork remains unchanged. Live account creation/import, recovery credentials, funding, signing/payment/mint/claim and physical-device acceptance were **not performed**. Existing npm audit reports one high dependency advisory; no out-of-scope forced dependency upgrade was applied.
