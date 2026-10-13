# Tasks

## 1. Add and import the logout authorization contract

- [x] C092-T001 Add the public BIS game-host logout authorization and recheck contract with typed allow, deny, and confirmation outcomes; verify the exported package contract typechecks without exposing wallet secrets.
- [x] C092-T002 Add BIS Account logout coverage for Start-menu allow, game-provided confirmation body with BIS title/buttons, stale recheck denial, and unavailable-host override; verify wallet cleanup occurs only after the authorized path.
- [x] C092-T003 Export and verify the immutable BIS package, then import it into the game; verify provenance, public contract compatibility, and the absence of source-folder or internal imports.

## 2. Implement game-owned lifecycle reconciliation

- [x] C092-T004 Extend focused game Account and run-lifecycle tests to model authorization, ordered Player disconnect plus `restartRequested`, repeated logout IDs, and Account-open state; verify exactly one interactive Start menu remains and no Account-owned inert or pause state survives.
- [x] C092-T005 Refactor the game host so it allows logout at Start, supplies active-run confirmation text, rechecks that authorization, and gives logout restart precedence over ordinary connection/menu refresh handling; verify no internal BIS import is introduced.
- [x] C092-T006 Add safe snapshot role-key comparison and a wallet-eligibility generation; verify Player/Game Wallet login, logout, identity/network replacement, stale completions, and preservation of Player session/free play after Game Wallet logout.

## 3. Verify the reported and adjacent flows

- [ ] C092-T007 Update the managed Playwright BIS fixture to exercise logout from Account over the Start menu and Game Wallet login/logout snapshot changes; verify Start is focusable/clickable, the backdrop is gone, and no page errors or unexpected navigation occur.
- [ ] C092-T008 Run the focused lifecycle, contract/type, full relevant test, build, and publishing checks; verify the vendored BIS boundary remains intact and record any coverage limits without wallet actions or secrets.
