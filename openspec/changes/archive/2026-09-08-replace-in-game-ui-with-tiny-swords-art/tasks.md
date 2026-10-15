# C061 - Replace in-game UI with Tiny Swords art

## Current contract reconciliation (2026-09-08)

Retain the approved visual style and recorded acceptance gates. Later controls hide Item and its label without reserving space; Attack/V performs fixed knife melee. Outcome menus retain the current BIS trophy/progression actions and paid revival/Restart Game flow. Historical preview and review descriptions below do not restore Item or a single Continue-only outcome. Developer settings use the five independent toggles listed in the synchronized delta, with Clear All Settings; removed preview controls stay removed.

Existing task IDs, checkbox states and historical review evidence are retained. This specification sync does not claim new implementation or verification.

Execute milestones in order. Begin milestone 01 only after a new request to apply this change. Tasks C061-T006, C061-T012, and C061-T016 are user-feedback/approval gates: leave them unchecked until their stated condition is met. Applying the change does not waive these gates. Record the reviewed image/version and user's decision in the checkpoint notes below. All tasks are initially pending; proposal completion is not milestone completion.

## 01 - Send three fullscreen previews and collect feedback

- [x] 1.1 C061-T001 Refresh the current UI inventory and related active changes, including start-prompt dismissal and inset discrepancies; verify the baseline is documented without unrelated behavior edits.
- [x] 1.2 C061-T002 Inspect a selective source-asset set and define feasible panel/button/icon mappings; verify candidate native dimensions and slice boundaries are documented for the mockups.
- [x] 1.3 C061-T003 Create and send one fullscreen potential finished HUD image showing the game world, counters, settings control, joystick, Item/Attack controls, and representative world badges; verify it is labeled as a proposed visual and shows the complete composition.
- [x] 1.4 C061-T004 Create and send one fullscreen potential finished main-menu image with Stealth Grid, existing instructions, and Start; verify it uses the same viewport and art direction as the HUD preview.
- [x] 1.5 C061-T005 Create and send one fullscreen potential finished end-level menu image with Level Complete, its existing message, and Continue; verify all three separate images are available for user feedback before runtime artwork changes.
- [x] 1.6 C061-T006 CHECKPOINT: collect user feedback on the three images, revise the previews as requested, and record the settled direction; verify the user has resolved any requested revisions before starting milestone 02.

## 02 - Update the in-game HUD art and get approval

- [x] 2.1 C061-T007 Copy only HUD-required approved assets into the project and introduce scoped theme primitives; verify source/slice mapping and deployed asset paths, and confirm later menus retain their current presentation.
- [x] 2.2 C061-T008 Replace gold, metadata, coordinate-readout, and settings-gear presentation; verify existing values/visibility and gear behavior with relevant UI tests and browser inspection.
- [x] 2.3 C061-T009 Theme Move/puck, Item, Attack, labels, and control states through application-scoped overrides; verify keyboard input, simultaneous touch, pointer cancellation, hit areas, and focus using controller tests and a real browser.
- [x] 2.4 C061-T010 Theme overhead status badges and goal presentation; verify hidden/perception meanings, transitions, positions, and goal interaction remain intact in representative running-game states.
- [x] 2.5 C061-T011 Run relevant HUD/input tests and the production build, then present actual HUD screenshots at desktop and narrow portrait sizes with the live local URL; verify clear artwork, legible controls, and no new runtime errors.
- [x] 2.6 C061-T012 CHECKPOINT: obtain explicit user approval of the implemented HUD, addressing requested revisions first; verify the approval note identifies the reviewed result before starting milestone 03.

## 03 - Update the in-game main-menu art and get approval

- [x] 3.1 C061-T013 Add the remaining main-menu assets and theme the existing start prompt with reusable parchment/ribbon/button primitives; verify exact title, body, and Start text remain available and unrelated screens are not reskinned early.
- [x] 3.2 C061-T014 Verify the themed startup flow, Start action, focus, pause/input gating, and supported prompt-suppression path with relevant tests; document pre-existing discrepancies separately from regressions caused by C061.
- [x] 3.3 C061-T015 Build and inspect the main menu in a real browser at desktop and narrow portrait sizes; send actual screenshots and the live local URL, verifying legible text, reachable controls, and the Start-to-HUD transition.
- [x] 3.4 C061-T016 CHECKPOINT: obtain explicit user approval of the implemented main menu, addressing requested revisions first; verify the approval note identifies the reviewed result before starting milestone 04.

## 04 - Finish the rest

- [x] 4.1 C061-T017 Theme both win and loss end-level menus with shared components and distinct outcome accents; verify exact messages, Continue behavior, focus, and overlay layering in tests and browser captures.
- [x] 4.2 C061-T018 Theme settings, Music/SFX sliders, FullScreen toggle, Developer Settings action, close button, and backdrop; verify input values, fullscreen synchronization, persistence, and pause/resume in relevant tests and browser interaction.
- [x] 4.3 C061-T019 Theme developer settings, all four toggles, Reset, navigation, and scroll treatment; verify each control remains reachable and retains its effect, including on narrow screens.
- [ ] 4.4 C061-T020 Theme loading, startup failure, Retry, no-script messaging, and runtime errors; verify image-failure fallbacks and supported startup error paths remain readable and usable without misleading progress values.
- [ ] 4.5 C061-T021 Complete diagnostic text/selection treatment and shared typography, cursors, hover, pressed, checked, disabled, focus, and backdrop states; verify every design inventory row is covered while diagnostic geometry and color meanings remain accurate.
- [ ] 4.6 C061-T022 Audit production asset references and remove only obsolete application theme remnants after reference checks; verify selected assets resolve under the configured deployment base and no unused source pack or local filesystem dependency is shipped.
- [ ] 4.7 C061-T023 Run the applicable complete UI/controller tests and production build; perform browser QA at desktop and 320 CSS pixel portrait width, resize/orientation, 50/100/150 percent zoom, and fullscreen transitions; verify no clipping, overlapping targets, stuck input, or new console errors across the complete flow.
- [ ] 4.8 C061-T024 Deliver final HUD, main-menu, end-level, settings/developer-settings, and loading/error evidence with the live local URL; verify the inventory is fully accounted for and run strict OpenSpec validation plus diff checks before reporting completion.

## Checkpoint notes

- **01 - Preview feedback:** v2 HUD, Start Menu, and Level Complete images delivered on 2026-09-07 incorporating the requested safe area, alignments, logo, thinner paper edges, raised blue banners, and removal of body artwork. See `preview-review.md` for exact decisions and image paths. Approved by the user with one correction: the logo appears only on Start Menu, never other menus. C061-T006 is complete.
- **02 - HUD approval:** Approved on 2026-09-07: user said "done. sync the feature and commit those changes" and requested continued implementation after reviewing the latest live HUD, including labels lowered 20px and version font reduced to 9.6px. See `hud-review.md` for screenshots and verification. C061-T012 is complete.
- **03 - Main-menu approval:** Approved on 2026-09-07 when the user said "That looks good" and requested reusable title/body text, optional logo and shared menu buttons after the final text-position, banner, parchment and selection revisions. C061-T016 is complete. The reusable menu/button extraction is verified in main-menu-review.md; remaining full-surface milestone 04 tasks retain their own completion checks.
