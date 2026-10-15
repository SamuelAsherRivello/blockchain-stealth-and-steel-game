## 1. Shared menu composition and text

- [x] 1.1 C071-T001 Add focused menu tests for the 15px toast-bottom composition anchor, logo/no-logo behavior, title-ribbon clearance, and shared prompt-prose hook; verify the new tests fail before implementation.
- [x] 1.2 C071-T002 Update the reusable menu composition and Tiny Swords menu styles to use the shared toast reservation anchor and title-ribbon clearance; verify start and logo-free menu structural tests pass.
- [x] 1.3 C071-T003 Apply the one shared body-text hook to Start, Treasure Chest, You Lost, and Level Completed prose while keeping slider/toggle labels control-specific; verify focused menu, treasure, and outcome UI tests pass.

## 2. Menu spacing, titles, and close controls

- [x] 2.1 C071-T004 Add focused CSS/DOM tests for 20px heading-content indents, 30-percent regular-action gaps, the 53px final-action bottom padding, and Map-order sub-button exclusion; verify the tests fail before implementation.
- [x] 2.2 C071-T005 Implement the shared menu layout values for section indentation and regular action rhythm without changing Map-order sub-button layout; verify the focused menu-paper and settings UI tests pass.
- [x] 2.3 C071-T006 Add and implement responsive one-line ribbon-title fitting from the doubled default size, reserving close-control width where present; verify long titles remain one line at desktop and narrow portrait widths.
- [x] 2.4 C071-T007 Add and implement a scale-relative close-X visual offset while preserving a 44px-or-larger pointer/touch/keyboard hit target; verify GameWindow close tests and resize-oriented UI checks pass.

## 3. Toast presentation and visual verification

- [x] 3.1 C071-T008 Trace the BIS account integration's themed toast presentation and add a focused assertion that account/contract toast messages omit the lightning-bolt icon without altering non-toast payment or Account action labels; verify the new assertion fails before implementation.
- [x] 3.2 C071-T009 Remove the lightning-bolt icon from themed toast presentation through the game-owned integration/style boundary; verify the toast assertion and existing BIS account tests pass.
- [ ] 3.3 C071-T010 Run the focused UI test set and the project build, then inspect Start, Settings/Developer, Treasure, You Lost, and Level Completed in a real browser at desktop and narrow portrait sizes; verify all requested layout rules and close interactions are visibly correct.

## 4. Final responsive rhythm and typography correction

- [x] 4.1 C071-T011 Add focused regression tests for one complete shared body-text style, 30-percent subtitle/form gaps, visible-ribbon title fitting, the 8px final-action safe edge, and non-scrolling menu composition; verify the new assertions fail before implementation.
- [x] 4.2 C071-T012 Replace scrolling menu layout with bounded responsive compact layout; apply the shared body-text, spacing, title-safe-area, and final-action rules without changing control behavior; verify the focused UI tests pass.
