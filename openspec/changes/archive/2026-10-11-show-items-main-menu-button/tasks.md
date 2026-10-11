# Tasks

## 1. Capability-driven Start Menu composition

- [x] `C085-T001` Update Start Menu construction so the Items button is created
  only when item support is available, while preserving Start-only behavior and
  null-safe capability refresh methods.
- [x] `C085-T002` Update runtime wiring and Items callback/focus handling for a
  nullable Items button without changing the existing inventory or selection
  contract.

## 2. Regression coverage

- [x] `C085-T003` Add focused UI tests proving unsupported sessions render only
  Start and supported sessions render Start plus Items, including DOM absence of
  the BIS-only action.
- [x] `C085-T004` Run the focused menu/capability tests, the relevant UI suite,
  and the production build; record unrelated pre-existing failures separately.
