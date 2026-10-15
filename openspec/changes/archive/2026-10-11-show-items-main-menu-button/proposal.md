# Proposal

## Why

The Start Menu currently creates an Items control for every visitor and then
uses visibility and disabled state to gate it. That leaves the main menu with
an unnecessary BIS-only surface in non-BIS sessions and does not express the
simple public menu contract: Start alone when item support is unavailable, or
Start plus Items when it is available.

## What Changes

- Render the Start Menu action set from the active item-support capability.
- Show exactly Start and Items when `hasItemSupport()` is true.
- Show exactly Start when item support is false, unavailable, loading, logged
  out, or otherwise absent.
- Keep Items opening, focus return, inventory loading, and selection behavior
  unchanged when the capability is available.
- Ensure non-BIS visitors do not see BIS-only item buttons, labels, or disabled
  placeholders in the main menu.
- Add focused structural and runtime regression coverage for both menu states.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `item-equipment-selection`: Define the capability-driven Start Menu action
  set and the absence of BIS-only Items UI when unsupported.

## Impact

The change affects Start Menu construction, the capability-to-UI wiring, and
focused menu tests. It does not change the BIS contract, wallet behavior,
item inventory semantics, Start behavior, or the existing Items dialog.
