[Overview](overview.md) · [Standardization analysis](standardization-analysis.md) · [Architecture analysis](architecture-analysis.md) · Verification baseline · [Back](overview.md)

# Verification baseline

| # | Check or scenario | Source and scope | State | Result or limitation |
| --- | --- | --- | --- | --- |
| VERI01 | `npm test` | Root manifest, game unit suite | run | Passed, 1,145 tests. |
| VERI02 | `npm run test:publish` | Root manifest, Pages and release metadata contracts | run | Passed, 10 tests. |
| VERI03 | `npm run typecheck:bis-contract` | Root manifest, public BIS contract | run | Passed. |
| VERI04 | `node stealth-steel/tools/verify-bis-package.mjs` | Pages workflow, immutable vendored archive | run | Passed for `@bis/integration` `0.0.23`. |
| VERI05 | Browser smoke checks and public Pages routes | Browser scripts and release guidance | not run | Browser and remote deployment were outside this light pass. Use the required muted URL parameters for any AI-created game window. |
