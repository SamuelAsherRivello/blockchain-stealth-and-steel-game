# Tasks

## 1. Establish the shared parchment layout contract

- [x] C091-T001 Consolidate the shared menu CSS so the visible parchment below the ribbon owns one four-sided content inset, and verify the existing menu factory still exposes header, body-parent, and buttons-parent regions.
- [x] C091-T002 Make the body parent flex into the remaining parchment height and the buttons parent size to rendered regular actions, gaps, and lower action spacing; verify an empty Items footer reserves no visible action height.
- [x] C091-T003 Remove only superseded menu-specific geometry overrides while retaining intentional control-specific grouping, Map Order sub-button spacing, title/logo behavior, and action semantics; verify Start, Settings, Developer, Treasure, loss, and completion retain their current content and controls.

## 2. Preserve review instrumentation

- [x] C091-T004 Keep the three temporary layout boxes as a pointer-inert sibling debug layer aligned to the menu content stack, body parent, and buttons parent; verify they do not affect target dimensions or menu interaction.

## 3. Verify all menu families

- [x] C091-T005 Add or update focused UI tests for shared parchment allocation, content-sized action regions, and an empty buttons parent; verify the relevant test command passes.
- [x] C091-T006 Use Playwright in the managed browser to capture and inspect Start, Items, Settings, Developer, Treasure Chest, You Lost, and Level Completed at the user-reported 100% browser zoom/high-display-scale composition and a narrow portrait viewport; verify all three overlays remain visible and aligned and no content overlaps, escapes the parchment, or scrolls.
