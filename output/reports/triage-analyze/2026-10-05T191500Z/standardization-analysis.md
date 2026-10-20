[Overview](overview.md) · Standardization analysis · [Architecture analysis](architecture-analysis.md) · [Verification baseline](verification-baseline.md) · [Back](overview.md)

# Standardization Analysis

[standards-document.md](C:/Users/srive/.agents/skills/triage-standardize/references/standards-document.md) has not been customized by user. Using defaults. Observed conventions—not new mandates—are: one contained application at `stealth-steel/`, runtime domains under `src/runtime/`, matching test domains under `src/test/`, explicit public assets, and a root Vite/Pages boundary. The layout is a legitimate adaptation of the shipped baseline rather than a template violation.

## Findings

| # | Finding | Observed evidence | Baseline delta and severity | Recommended owner |
| --- | --- | --- | --- | --- |
| STND02 | Release documentation and test disagree on the demo URL. | `README.md` links `https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/`; `pages-publishing.test.js` requires `https://samuelasherrivello.github.io/stealth-and-steel-game/`; `npm run test:publish` fails that assertion. | Current-state documentation is contradicted by the repository's release contract. High: CI invokes the focused check before build/deploy. | Standardize |
| STND03 | The OpenSpec adapter's environment contract is brittle. | `openspec/cli.mjs` rejects every version except 1.13.1; the discovered 1.14.0 CLI causes `repository-layout.test.js` to fail during `npm test`. | Command discovery exists, but a supported tooling path cannot pass in the present environment. High delivery friction; version policy needs an explicit decision. | Standardize |
| STND04 | Static type checking protects only the BIS host adapter. | `tsconfig.bis-contract.json` lists only `runtime/integration/bis-host-game.js`; the command passed, while the JavaScript runtime contains 2141 lines in the entry module and many additional domains. | This is an intentional narrow contract check unless a broader JS check is adopted; it is a coverage limit, not a defect. Medium. | User decision / Standardize |

## Project tree and conventions

| # | Area | Evidence | Assessment |
| --- | --- | --- | --- |
| STND05 | Runtime boundary | Vite's root is `stealth-steel`; `src/runtime` contains named AI, audio, characters, gameplay, integration, systems, UI, and editor domains. | Strong alignment: ownership follows runtime concerns. |
| STND06 | Test organization | `src/test` mirrors AI, characters, gameplay, systems, UI, integration, release, and browser scenarios; the runner recursively selects `*.test.js`. | Strong test discoverability for Node checks. |
| STND07 | Configuration | Root `package.json`, `vite.config.js`, `tsconfig.bis-contract.json`, and Pages workflow centrally define execution and deployment. | Clear, compact configuration surface. |
| STND08 | Naming and contracts | Domain constructors use `create…` consistently; pure/state modules such as `enemy-state.js` expose small APIs, while character factories accept explicit collaborators. | Generally consistent; `runtime/main.js` is the material exception because it owns many concerns. |

## AI readiness

| # | Area | Status | Evidence | Practical improvement |
| --- | --- | --- | --- | --- |
| READY01 | Canonical agent instructions | complete | Root `AGENTS.md` defines UI sizing and mandatory mute parameters for AI-spawned game windows. | Keep it as the canonical short operational boundary. |
| READY02 | Command discovery | partial | README, `package.json`, and CI identify build/test/typecheck commands; two discovered release commands currently fail. | Reconcile the release URL and OpenSpec version policy, then record verified command outcomes. |
| READY03 | Project orientation | complete | README structure plus domain directories and focused runtime/AI documentation locate primary boundaries. | Add a short pointer to `runtime/main.js` as the composition root when it is split. |
| READY04 | Definition of done | partial | CI requires `test:publish`, full tests, then build; no general contribution/verification policy was found. | Document proportional checks for runtime, UI, browser, and release changes. |
| READY05 | Maintenance relationships | partial | Tests and feature documentation are nearby; `PROJECT_REFACTOR_THOUGHTS.md` maps BIS ownership, but the large entry module coordinates unrelated domains. | Keep new feature seams with their unit tests and record cross-domain update pairs in an architecture note. |
| READY06 | Safety boundaries | complete | `.gitignore`, root instructions, vendor provenance, and no secrets were observed; `.aiignore` is absent. | No `.aiignore` recommendation: the scan did not establish a specific additional AI access boundary beyond existing controls. |

## Repository integrity

| # | Candidate | Classification | Evidence and limits | Recommended owner |
| --- | --- | --- | --- | --- |
| INTG01 | README demo-link claim | confirmed stale | Its current URL contradicts the checked-in publishing test; the last commit changed README links, and the focused release check fails. This does not establish which URL is externally canonical. | Standardize |
| INTG02 | `openspec/cli.mjs` strict 1.13.1 guard | orphan candidate | Current environment supplies 1.14.0 and the guard blocks repository context. The guard may be intentional compatibility protection, so it must not be removed without reviewing the newer CLI. | Standardize |
| INTG03 | `Level01.tmj.bak.tmj` | intentionally future-facing | `repository-layout.test.js` explicitly excludes `*.bak.tmj` because historical editor backups can reference retired palettes. Static non-reference is therefore not removal evidence. | User decision |
| INTG04 | Browser HTML/CJS/MJS scenarios | not assessed | 49 browser scenario files were discovered, but no browser server or scenarios were run in this read-only assessment. Their absence from `npm test` is a coverage limit, not proof of obsolescence. | User decision |

No `.triageignore` material blind spot applies. No unused-export or asset-removal claim is made: static import/reference inspection cannot safely resolve framework discovery, test fixtures, Tiled references, or external consumers.
