## 1. Shared health presentation

- [x] 1.1 C068-T001 Add maximum health and unsubscribable change events before death callbacks; verify silent initialization, invalid damage, lethal notification order, unsubscribe, and revival in combat-health-events.test.js.
- [x] 1.2 C068-T002 Implement the gameplay-time meter controller; verify exact fade/fill boundaries, latest-change timeout, rapid retargeting, both fade interruptions, pause, healing, and lethal clamping in health-bar.test.js.

## 2. Overhead layout and lifecycle

- [x] 2.1 C068-T003 Add the shared renderer, fixed icon/bar slots, and seven character offsets; verify layout, rendering state, removal, revival, and subscription cleanup in character-overhead.test.js.
- [x] 2.2 C068-T004 Integrate attachment, updates, disposal, and debug-independent drawing in the main loop; verify spawn-animation.test.js and all debug-toggle combinations in debug-visualizations.test.js.

## 3. Integration verification and specifications

- [x] 3.1 C068-T005 Verify all seven real character types using health-bars.html: 18 browser checks passed, and visual inspection confirmed head clearance, simultaneous icons/meters, movement, jump, and camera tracking.
- [x] 3.2 C068-T006 Run the full Node test suite and production build and replace the character health-visibility prohibition in the main spec; all passed during implementation, including strict combat-health-system validation.

This checklist records completed implementation from 2026-09-07. See design.md for the verification evidence and the reason this change record was created retrospectively.
