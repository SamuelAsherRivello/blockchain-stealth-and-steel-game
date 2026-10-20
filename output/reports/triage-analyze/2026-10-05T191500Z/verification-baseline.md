[Overview](overview.md) · [Standardization analysis](standardization-analysis.md) · [Architecture analysis](architecture-analysis.md) · Verification baseline · [Back](overview.md)

# Verification Baseline

| # | Check or scenario | Source and scope | State | Result or limitation |
| --- | --- | --- | --- | --- |
| VERI01 | `npm test` | `package.json`; recursive Node runner over `stealth-steel/src/test/**/*.test.js`, including unit, integration, UI, release, and runtime behavior. | run | Failed: 1,092 passed, 2 failed, 1,094 total. Failures: README demo URL assertion and OpenSpec 1.13.1 guard against installed 1.14.0. |
| VERI02 | `npm run test:publish` | `package.json` and Pages workflow; focused Pages URL/config/release metadata checks before build. | run | Failed: 6 passed, 1 failed. The README demo URL does not match `pages-publishing.test.js`. |
| VERI03 | `npm run typecheck:bis-contract` | `tsconfig.bis-contract.json`; JS type checking limited to `runtime/integration/bis-host-game.js`. | run | Passed. This is an integration contract check, not whole-runtime static coverage. |
| VERI04 | `npm run build` | `package.json` and Pages workflow; Vite production bundle to ignored `dist/`. | discovered | Not run because this read-only triage packet does not create build output outside `output/`. CI orders it after both release test commands. |
| VERI05 | Browser scenario files | 49 files under `src/test/browser` (18 HTML, 18 JS, 9 CJS, 4 MJS). | discovered | Not run. No scripted package command or documented command-to-scenario mapping was found in the inspected manifest/README. |
| VERI06 | Pages deployment | `.github/workflows/deploy-pages.yml`; main-branch and manual workflow runs install, focused/full tests, build, then deploys `dist`. | discovered | Not run locally; it would currently stop at the failing checks before build. |

## Recommended verification sequence for approved changes

1. For release/documentation/OpenSpec-adapter work: run `npm run test:publish`, then `npm test` and `npm run typecheck:bis-contract`.
2. For runtime-domain changes: run targeted relevant Node tests first, then `npm test`; run the contract typecheck when touching BIS integration.
3. For entry composition, rendering, or browser-facing behavior: add or select the applicable browser scenario, start a muted AI diagnostic window only when needed, and use both `muteMusic=true` and `muteSFX=true` query parameters as required by `AGENTS.md`.
4. Once checks are green, run `npm run build`; deployment remains the workflow's responsibility unless explicitly requested.

Passing static/type checks do not establish gameplay behavior. Conversely, the Node suite's broad behavioral coverage does not validate the WebGPU/browser composition path.
