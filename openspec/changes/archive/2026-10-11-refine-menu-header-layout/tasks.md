# Tasks

## 1. Shared header structure

- [x] C084-T001 Update the shared menu factory so closable menus expose explicit header container, header text, and header button roles while preserving accessible title IDs and existing returned references; verify with focused menu structure tests.
- [x] C084-T002 Update shared Tiny Swords header CSS so title centering uses the safe ribbon region and the close button is vertically aligned and right-aligned within a 44px hit target; verify with focused style assertions.

## 2. Regression coverage

- [x] C084-T003 Extend menu and composition tests to cover Settings/Developer-equivalent closable headers, title non-overlap, and unchanged close labels/focus behavior; verify the focused UI test files pass.
- [x] C084-T004 Run the project UI test suite and production build, then inspect Settings and Developer in the running game at desktop and narrow portrait sizes with both AI/test audio mute query parameters; record any unrelated failures separately.
