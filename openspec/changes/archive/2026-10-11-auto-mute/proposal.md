## Why

The normal game experience should retain its persisted audio settings when the
URL has no audio arguments. AI-generated game windows should be silent, but
their launch contract must explicitly request both mutes.

## What Changes

- Keep `muteMusic` and `muteSFX` unmuted when absent.
- Treat only the explicit value `true` as requesting a mute, leaving the
  persisted category volume unchanged otherwise.
- Keep the two URL controls independent so callers can enable one category while
  muting the other.
- Require AI-spawned/test windows to use `muteMusic=true&muteSFX=true`.
- Add focused unit coverage for omitted parameters, explicit false values,
  independent channels, and stored volume preservation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `persistent-game-settings`: Define URL-controlled default muting and the
  explicit false opt-out while preserving persisted category volumes.

## Impact

The change affects URL audio-parameter parsing, the AI launch instructions, and
focused runtime-settings tests. It does not change the Settings Menu, storage
schema, or normal audio volume persistence.
