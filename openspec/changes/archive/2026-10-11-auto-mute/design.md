## Context

The bootstrap already applies `muteMusic` and `muteSFX` before installing music
and SFX playback. The current parser only mutes when a parameter equals `true`,
so an ordinary window with no parameters can use persisted audio settings.
The settings store is the authority for category volumes and must remain
unchanged when a URL explicitly opts out of muting.

## Goals / Non-Goals

**Goals:**

- Keep each audio category unmuted for URLs that omit its parameter.
- Make `?muteMusic=true` and `?muteSFX=true` independently mute the matching
  category.
- Keep existing `true` mute behavior and return values deterministic.
- Require AI-created/test windows to explicitly pass both mute parameters.

**Non-Goals:**

- No new storage keys, migration, or Settings Menu controls.
- No change to audio playback, fade, volume-slider, or reset behavior.
- No interpretation of arbitrary numeric or truthy values as persisted volume.

## Decisions

### Explicit true is the only mute request

For each parameter, `parameters.get(name) === "true"` means the category is
URL-muted. Missing parameters and all other values retain the normal persisted
volume. AI launch instructions carry both explicit `true` values.

### URL muting overrides only the active session

When a category is URL-muted, startup sets its in-memory/store value to zero so
all existing audio consumers and Settings UI observe the mute immediately. When
the parameter is absent or not exactly `true`, startup does not write zero and
the store continues to expose the persisted category volume.

### Keep channels independent

Music and SFX are parsed and applied separately. A caller may pass
`muteMusic=true` while leaving SFX omitted, or the reverse, without affecting
the other category.

## Risks / Trade-offs

- AI launchers that omit the required parameters can produce sound; repository
  agent instructions make those parameters mandatory for compliant agents, but
  cannot technically enforce behavior from outside the repository.

## Migration Plan

Update the parser and focused tests, then run the full test suite and build.
Verify the default URL and the explicit mute URL in a browser, including the
Settings UI's displayed category values. No persisted-data migration is needed.
