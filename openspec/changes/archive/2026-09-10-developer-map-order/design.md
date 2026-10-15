## Context

See proposal.md for motivation. level-progress.js currently equates current map number with sequence position and serializes one-shot reload transitions. settings-ui.js exposes Developer controls through the existing settings store, whose validators currently support booleans and volume numbers. Two TMJ maps exist.

## Goals / Non-Goals

**Goals:** Keep stable map identities while introducing an independently ordered run, using the existing UI and persistence boundaries.

**Non-Goals:** Immediate map switching on selection, drag-and-drop, map renaming, new libraries, or wallet changes.

## Decisions

- Add a validated array preference to the runtime settings store. Normalize against the catalog: retain valid unique identities and append missing maps numerically. This integrates Clear All Settings rather than creating a separate reset path.
- Capture the preferred order when a fresh run starts. Serialize that snapshot and the next index for one-shot Continue reloads. Restart reads the latest preference. Manual refresh still starts a fresh run. Ignore old incompatible transition payloads rather than inferring ambiguous indices.
- Keep current as the actual map number and completed as the count preceding it. Advance by index and use completed + 1 in completion UI. Trophy selection remains keyed by current map identity.
- Pass catalog/settings into the existing Developer menu and use current themed buttons. Reordering updates the row immediately and retains keyboard focus. Clicks save only, allowing multiple selections before refresh.
- Copy Level02.tmj byte-for-byte to Level03.tmj; existing catalog discovery should include it automatically. Verify actual loader and asset paths during implementation.

## Risks / Trade-offs

- Storage unavailable: keep the existing in-memory settings fallback; persistence cannot survive refresh without browser storage.
- Stale transition or catalog: validate the full snapshot and index, falling back to a fresh normalized run on invalid data.
- Map identity mistaken for completion count: targeted reordered progression and reward tests cover this boundary.
- Preference changes mid-run: Continue keeps the run snapshot; refresh and Restart intentionally adopt the latest preference.

## Migration Plan

Absent order preferences default numerically. Reject incompatible old transition payloads safely. Ship UI, progress updates, and the new map together; no destructive migration is required.
