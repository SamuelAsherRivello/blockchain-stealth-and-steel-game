[Overview](overview.md) · Standardization analysis · [Architecture analysis](architecture-analysis.md) · [Verification baseline](verification-baseline.md) · [Back](overview.md)

# Standardization analysis

[`standards-document.md`](C:/Users/srive/.agents/skills/triage-standardize/references/standards-document.md) has not been customized by user. Using defaults. The repository has a clear product boundary at `stealth-steel/`, documented root commands, a Pages workflow that requires provenance, tests, typechecking, and build before deployment.

| # | Candidate | Classification | Evidence and limits | Recommended owner |
| --- | --- | --- | --- | --- |
| INTG01 | `arkade-features-overview.md` and `arkade-wallet-workflows.md` at the repository root | orphan candidate | Both are durable reference documents, not source. Root `docs/` already exists. Their placement adds root clutter, but static inspection does not show whether external links rely on their current paths. | Standardize |
| INTG02 | `v0.0.23` game release tag | not assessed | `package.json` and the vendored BIS archive use `0.0.23`, but `git tag --list v0.0.23` returned no tag. Remote GitHub state was not checked. | user decision |

| # | Area | Status | Evidence | Practical improvement |
| --- | --- | --- | --- | --- |
| READY01 | Canonical agent instructions | nailed | `AGENTS.md` contains release, browser, UI, and audio constraints. | Keep it current. |
| READY02 | Command discovery | nailed | Root `package.json`, README, and Pages workflow identify checks. | None. |
| READY03 | Project orientation | nailed | README and `stealth-steel/` form a clear entry boundary. | None. |
| READY04 | Definition of done | nailed | Workflow requires provenance, publication tests, full tests, typecheck, and build. | None. |
| READY05 | Maintenance relationships | partial | The release relationship is tested, but root Arkade documents are separate from `docs/`. | Decide whether to relocate them with redirects or README links. |
| READY06 | Safety boundaries | partial | `.gitignore` and `AGENTS.md` exist. No repository-specific `.aiignore` was found. | Only add an `.aiignore` if a concrete protected path is identified. |
