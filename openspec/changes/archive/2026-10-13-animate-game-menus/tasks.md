# Tasks

## 1. Shared menu transition lifecycle

- [x] 1.1 C093-T001 Add a shared `createMenu` transition lifecycle for enter, exit, hidden state, inert input blocking, reduced motion, and completion fallback; verify focused menu lifecycle unit tests pass.
- [x] 1.2 C093-T002 Add shared Tiny Swords backdrop and composition opacity-and-scale animation styles with a reduced-motion override; verify the menu transition tests assert the shared selectors and motion contract.

## 2. Menu caller adoption

- [x] 2.1 C093-T003 Update the start prompt and `GameWindow` to use the shared menu lifecycle for opening, closing, visibility changes, disposal, and focus restoration; verify their UI tests pass.
- [x] 2.2 C093-T004 Update loss and completion menu visibility and disposal flows to use the shared lifecycle without changing their actions; verify outcome-menu tests pass.

## 3. End-to-end validation

- [x] 3.1 C093-T005 Run the game test suite and validate opening and closing the Start and Settings menus in a managed Playwright browser, including reduced-motion behavior; verify no console errors and record the commands in the change notes.
