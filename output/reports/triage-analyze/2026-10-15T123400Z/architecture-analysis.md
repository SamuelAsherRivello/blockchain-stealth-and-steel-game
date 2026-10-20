[Overview](overview.md) · [Standardization analysis](standardization-analysis.md) · Architecture analysis · [Verification baseline](verification-baseline.md) · [Back](overview.md)

# Architecture analysis

The runtime is organized under `stealth-steel/src/` with distinct editor, AI, integration, UI, systems, and test areas. `runtime/integration/bis-account.js` dynamically loads `@bis/integration`, while the checked-in TypeScript contract project checks the public integration boundary. Game behavior has targeted unit coverage across AI, combat, audio, menus, progression, and viewport handling.

No high-confidence architecture defect was found in this light pass. The only promotion risk is release-state evidence, not dependency direction or ownership.

| # | Candidate | Evidence | Expected value | Risk and non-goals | Urgency | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| ARCH02 | Formalize the next release as a single verified state | Full version alignment is enforced locally, but the local tag is missing. | Gives reviewers a complete release trail. | Do not restructure game code. Remote verification is required. | Medium | user decision |
