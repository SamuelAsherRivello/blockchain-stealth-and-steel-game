## Why

Level01 needs to show the authored treasure chest as part of the level presentation for every player, including guests. The chest's gameplay interaction must remain unavailable unless the BIS account and game-wallet setup required by the treasure flow is ready, so rendering the level object never implies that a reward operation can be performed.

## What Changes

- Add a level-rendering contract for authored treasure chest objects so the chest appears whenever the loaded level contains a treasure spawner.
- Keep treasure artwork and placement driven by the normalized Tiled level data and the runtime's decodable treasure-chest asset.
- Gate the chest's enter interaction and treasure window on the availability of the required BIS account/game-wallet session.
- Preserve ordinary guest gameplay and non-interactive treasure visuals when BIS setup is missing, unavailable, or still loading.
- Add focused unit and browser-facing coverage for visible-but-inert treasure and ready-account interaction.

## Capabilities

### New Capabilities

- `treasure-rendering`: Render authored treasure in levels while exposing interaction only when the required BIS setup is ready.

### Modified Capabilities

- None.

## Impact

- Affects the Tiled level normalization/rendering path and the treasure object creation path in `stealth-steel/src/runtime/main.js`.
- Reuses the existing treasure chest object, treasure UI/session controller, decodable PNG atlas, and BIS account host rather than introducing a new wallet or contract API.
- Adds regression coverage for guest, loading, unavailable, and ready BIS states; no new dependency is expected.
