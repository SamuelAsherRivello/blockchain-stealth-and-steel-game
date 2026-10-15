## 1. Destination selection

- [x] 1.1 C069-T001 Add failing deterministic tests for separated versus clustered candidates, the preferred/unrestricted distribution, nearby choices, ties, self exclusion, current versus intended positions, and empty/single candidate sets; verify they fail against the current independent selector.
- [x] 1.2 C069-T002 Implement the pure Manhattan-separation selector and named 0.8 preference probability using injected randomness and stable candidate order; verify the focused tests pass, including timed continuity without eliminating other legal choices.

## 2. Production coordination and patrol integration

- [x] 2.1 C069-T003 Wire a dedicated living-enemy peer snapshot input into the production shared brain and expose copied patrol intent through its immutable navigation snapshot; verify teammate lookup excludes self and non-enemies, uses full-level GridSpots, and does not expand combat targets or player knowledge.
- [x] 2.2 C069-T004 Integrate scoring and immediate intent publication into route and timed shared patrol selection after existing candidate filters; verify all five profiles, same-update sequential choices, scheduler-delayed searches reading fresh peers, route/home bounds, timed duration, and camera independence in action/brain tests.
- [x] 2.3 C069-T005 Clear intent on success, failure, cancellation, awareness/combat preemption, defense/displacement, death, removal, and level reset; verify lifecycle tests and confirm narrow-corridor fallback, live occupancy checks, escape, and retries remain functional.

## 3. Group behavior and validation

- [x] 3.1 C069-T006 Add a repeatable multi-enemy open-grid comparison against the original patrol policy over fixed seeds and observation times; verify improved mean nearest-neighbor distance and no reduction in occupied coarse sectors, and record measurements plus a constrained-corridor result in verification.md.
- [x] 3.2 C069-T007 Run the focused AI tests, `npm test`, and `npm run build`; verify all pass and document any pre-existing failures separately in verification.md.
- [x] 3.3 C069-T008 Verify a real browser running the production mixed-enemy patrol path across multiple cycles: wider group spread, occasional nearby choices, smooth completed steps, necessary corridor grouping, and intact combat/awareness interrupts; record the URL and observed evidence in verification.md.
- [x] 3.4 C069-T009 Run `npm run openspec -- validate spread-enemy-patrol-destinations --strict` and reconcile artifacts with the verified behavior; verify validation passes and each completed task has recorded evidence.
