## Current contract reconciliation (2026-09-08)

Retain the approved visual style and recorded acceptance gates. Later controls hide Item and its label without reserving space; Attack/V performs fixed knife melee. Outcome menus retain the current BIS trophy/progression actions and paid revival/Restart Game flow. Historical preview and review descriptions below do not restore Item or a single Continue-only outcome. Developer settings use the five independent toggles listed in the synchronized delta, with Clear All Settings; removed preview controls stay removed.

Existing task IDs, checkbox states and historical review evidence are retained. This specification sync does not claim new implementation or verification.

## Context

See `proposal.md` for motivation and scope. C061 spans DOM screens, controller styling, and canvas-rendered character badges. The current stack is vanilla JavaScript, CSS, Vite, and Babylon Lite. The logical game is 576 by 1024; the DOM overlay follows the visible intersection of the game frame and viewport. Existing viewport helpers own that geometry.

The user supplied a visual reference and the asset folder `C:\Users\srive\Downloads\Tiny Swords (Organized)\UI`. Several PNGs contain separated panel pieces, not a finished stretchable rectangle. Icon filenames do not reliably describe their meaning; mappings must come from inspecting the image.

## Goals / Non-Goals

**Goals:** Use one reusable visual system across every existing UI surface; keep the world readable; provide complete-screen visual evidence at the requested checkpoints; preserve gameplay and input behavior while updating presentation.

**Non-Goals:** A new UI framework, gameplay changes, new health/inventory systems, new menu destinations, or redesigning terrain and character artwork. Diagnostic geometry retains its precision and color meanings while its labels and presentation join the theme. Unrelated existing OpenSpec work is not completed or archived by C061.

## Decisions

Settings and outcome menu implementation is recorded in settings-outcomes-review.md.
Shared SliderControl and ToggleControl factories accept labels, initial values
and callbacks independently of any settings store. Settings adapters provide
existing persistence and fullscreen integration; all current developer
toggles, including Enemy AI Labels, share the toggle component.

UI text selection is disabled globally, including startup, menus, HUD,
and controller labels, per the user's latest interaction preference.
This supersedes the earlier selectable-label direction; accessible DOM
text and keyboard operation remain required.

### Latest implemented-HUD feedback

Final HUD approved on 2026-09-07. Version uses 9.6px text (80% of 12px).
Item square is 25% of its button dimensions. Labels are lowered another
20px from the earlier raised baseline; controller artwork stays in place.

Controller up/down states use the same regular artwork with tint only;
no pressed-art swap or squash. Item is a flat white square. The Attack
sword is 70% of its earlier size within the button. Preserve ordinary
joystick translation while dragging.

After reviewing milestone 02, the user removed the gold ribbon and coin,
requested upper-left version and gold text, and reduced the gear artwork
by 50% with its inner icon raised 5%. Controller labels move up one full
line-height and the entire controller moves down 20px. Existing margin
settings remain unchanged. This supersedes the initial preview's centered
metadata/banner treatment. See hud-review.md for the revised evidence.

### Accepted preview feedback (supersedes initial candidates below)

The user approved v2 with the logo only on Start Menu. Use Stealth & Steel
artwork above the Start Menu ribbon; no other menu shows the logo. Keep
existing instructions, outcome text, and Start/Continue actions. Prompt
bodies contain no decorative icons. Both prompts use the same blue ribbon,
raised by half its height, with parchment edge/corner rendering at 32px
instead of 64px. The accepted HUD uses a shared 14px safe inset at 576x1024,
centered metadata over gold, gear/gold center alignment, and common
controller artwork centers and text baselines. See preview-review.md.

Current implementation root is stealth-steel/; planning is openspec/.
The new Account integration remains outside this presentation milestone.

### 1. Four sequential milestones with recorded gates

| Milestone | Deliverable and boundary | Exit condition |
|---|---|---|
| 01 - Fullscreen visual previews | Three separate complete-screen images: gameplay HUD, main menu, end-level menu. Show a plausible finished composition using actual game imagery and selected asset artwork. | Send all three images, collect user feedback, revise as needed, and record the settled direction before milestone 02. |
| 02 - HUD | Implement shared primitives needed for the HUD, counters/readouts, gear, Move/Item/Attack controls, goal presentation, and overhead status badges. Leave menu art for later milestones. | Verify in the running game, send screenshots and a live local URL, then obtain explicit user approval before milestone 03. |
| 03 - Main menu | Apply the accepted design to the existing Stealth Grid start screen and its Start button. | Verify the actual startup flow, send screenshots and a live local URL, then obtain explicit user approval before milestone 04. |
| 04 - Finish the rest | End-level win/loss menus, settings/developer settings, loading/errors/Retry, remaining diagnostic presentation, global visual states, and final coverage verification. | All inventory rows complete; relevant tests, build, and browser checks pass. |

Each gate task remains unchecked until its condition is met. Feedback requesting revisions is not acceptance; silence or elapsed time is not approval. Approval evidence must identify the reviewed screenshot/version and the user's decision in a short note alongside the milestone tasks. A general request to apply C061 begins milestone 01 and does not waive later gates. No additional mandatory user approval is introduced after milestone 04.

Milestone 01 is a design deliverable produced when implementation work is subsequently requested, not during proposal creation. Mockups must be labeled as proposed visuals, not presented as screenshots of an implemented game. Fullscreen means the whole game presentation with world/background and controls, not isolated widgets or a contact sheet. Use a shared full-screen viewport size and preserve the existing portrait game composition; final browser QA also covers desktop, portrait, and fullscreen API behavior. The end-level preview uses Level Complete; the loss variant follows the same component with a distinct accent in milestone 04.

Alternative considered: finish the entire theme in one pass. The staged approach is selected because the user explicitly requested feedback and intermediate approval.

### 2. Complete replacement inventory and ownership

| Surface | Current elements | Replacement direction | Milestone |
|---|---|---|---|
| HUD | Gold collected/total, release version/download size, coordinate readouts, settings gear | Compact coin/ribbon badge, readable metadata/debug text, asset-backed gear button | 02 |
| Virtual controller | Move base/puck, Item square, Attack arrow, keyboard labels, pressed states | Layered round controls, meaningful action icons, real text labels/key hints | 02 |
| World UI | Gray circular ?, i, !, H badges; goal marker | Themed small badges preserving symbols/timing; curated goal presentation | 02 |
| Main menu | Stealth Grid title, instruction paragraph, Start | Parchment panel, ribbon heading, blue button/play icon | 03 |
| End-level menus | Level Complete/You Lost titles, messages, Continue | Shared parchment layout with outcome-specific accent | 04 |
| Settings | Gear-opened window, Music/SFX ranges, FullScreen checkbox, Developer Settings button, close/backdrop | Shared window, themed track/knob/toggle surfaces, red X | 04 |
| Developer settings | Debug Draw: Coordinates, Enemy Perceptions, Enemy Tasks, Physics Colliders, Tile Map Info; Open GitHub, Clear All Settings, close/backdrop | Same window/control system, independent persistent toggles, including scroll treatment | 04 |
| Startup | BABYLON.JS/loading text, spinner, startup failure, Retry, no-script message | Lightweight themed loading/error shell with legible fallback | 04 |
| Runtime errors | Error alert surface | Matching readable error panel | 04 |
| Developer overlays | Grid labels, selected-cell marker, collider/perception/grid-spot markers and coordinate readouts | Coordinated text and selection treatment; geometrically exact diagnostic primitives. Crop marks and particle/animated-tile demos removed at user request. | 04 |
| Shared presentation | Typography, backdrop, panel edges, focus, hover, pressed, disabled, cursors | One consistent theme; introduce per surface and complete the audit | 02-04 |

### 3. Curated assets and layout primitives

Initial candidates, subject to milestone 01 feedback:

- `Papers/RegularPaper.png` for readable panel surfaces; `Ribbons/Ribbon_Blue_3Slides.png` for headings and compact HUD decoration.
- Blue regular/pressed button families, appropriate round blue/red controls, hover and disabled variants where needed.
- `Bars/BigBar_Base.png` / fill or small-bar pieces for volume/loading presentation where suitable. A decorative loading animation must not imply measured download progress when no measurement exists.
- Verified icons: `Icon_03` coin, `Icon_05` sword, `Icon_07` play, `Icon_08` back, `Icon_09` close, `Icon_10` gear, `Icon_11` information, `Icon_12` music. Select the Item artwork based on the existing held-item behavior and retain the Item label. A sword icon denotes the generic Attack action, not a change to the equipped weapon.
- Inspect cursor candidates before choosing normal/pointer variants. Leave resource icons, avatars, decorative sword sheets, and wooden panels unused unless feedback provides a concrete role.

Copy only selected production PNGs into `public/ui/tiny-swords/`. Record source path, native dimensions, slice/frame coordinates, role, and applicable states. Assemble separated source pieces into reusable CSS layers or documented derived slices. Use edge/corner-preserving scaling; never stretch gutters or transparent gaps across a panel. Preserve source assets and record any derived slice mapping.

Keep labels as selectable/accessible DOM text; style actual buttons, ranges, and checkboxes. Define a small theme layer for colors, type, spacing, hit areas, pixel scaling, surfaces, and states. Use application-scoped controller overrides so the reusable input plugin keeps its behavior and default visual contract. Scope shared classes during milestones 02 and 03 so they do not prematurely reskin later menus. Extract a shared badge drawing treatment for canvas UI only as needed; keep perception timing and world placement unchanged.

Alternative considered: convert all UI to canvas/Babylon GUI or bake text into images. DOM text and native controls support accessibility, responsiveness, and incremental reskinning with less behavioral risk.

### 4. Preserve behavior and bound existing discrepancies

Use existing viewport/safe-area calculations and retain Move bottom-left, Item then Attack bottom-right, metadata upper-left, and settings upper-right. Keep multi-touch pointer capture, cancellation, keyboard bindings, pause/resume, fullscreen state, persisted settings, gold formatting, and restart actions intact. Ensure decorative layers do not intercept input.

Before changing each surface, re-read related specs and active changes. Known discrepancies include start-prompt backdrop dismissal versus its planning contract and different inset values in code versus the corner-anchoring spec. Record their baseline and ownership. Do not silently fix them or redefine them as C061 requirements. If a conflict prevents the approved visual layout, present that concrete conflict before changing its behavior contract.

### 5. Verification follows milestone boundaries

Milestone 01 checks visual coverage and asset feasibility only. Milestones 02 and 03 use relevant existing tests plus focused behavior tests if integration changes input or state. Each has real-browser evidence at desktop and narrow portrait sizes, including keyboard focus and pointer interaction. Milestone 04 runs the complete applicable UI/controller suite and production build, then verifies every inventory row and loading/error fallbacks. Pure asset/color changes do not require tests that merely assert CSS literals.

## Risks / Trade-offs

- [Sheets with separated tiles produce seams or distorted corners] -> Inspect native artwork, document slices, and test at multiple viewport sizes.
- [Detailed decoration crowds the playfield or makes text unreadable] -> Keep the HUD compact, body text on quiet parchment, and touch targets at least 44 CSS pixels without inflating every icon.
- [Early shared styles change unapproved menus] -> Use scoped opt-in theme classes until each milestone is implemented.
- [World badges accidentally alter perception/placement] -> Preserve state meanings, timing, coordinates, and diagnostic color semantics; test representative hidden/alert states.
- [Artwork fails before application boot] -> Keep startup/error text and Retry usable without a loaded image or application stylesheet; preload only critical assets.
- [Concept screenshots promise unavailable assets or new features] -> Base mockups on inspected source artwork and existing screens; identify any derived styling and exclude invented controls.
- [Related active changes drift during review] -> Refresh affected files before each implementation milestone and keep C061 task IDs stable.

## Migration Plan

Add selected assets and theme primitives incrementally at milestone 02; integrate each surface at its assigned milestone. Track evidence and approvals with the tasks. Once all surfaces are covered, remove obsolete application styles/assets only after checking their references. Keep the source asset folder untouched. If a milestone regresses behavior, repair it through ordinary forward edits or additive commits before seeking approval; do not discard unrelated work or rewrite Git history.
