## 1. URL mute parsing and persistence behavior

- [x] `C081-T001` Update `applyUrlAudioMuteParameters` so each category defaults
  to unmuted and only an exact `true` value applies the zero-volume override;
  preserve independent return values and stored volumes otherwise.
- [x] `C081-T002` Extend runtime-settings tests for omitted parameters, explicit
  true values, independent channels, and persisted-volume preservation.

## 2. Runtime and browser verification

- [x] `C081-T003` Add repository agent instructions requiring AI-spawned/test
  windows to pass `muteMusic=true&muteSFX=true`.
- [x] `C081-T004` Run the focused tests, complete test suite, production build,
  and browser verification for both default-unmuted and explicit-true URLs;
  focused tests and build passed, browser values were verified, and the full
  suite's seven unrelated existing failures were recorded without changing
  unrelated dirty work.
