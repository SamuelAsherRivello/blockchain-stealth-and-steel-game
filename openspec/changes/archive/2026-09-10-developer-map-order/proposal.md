## Why

Testing a later Tiled map currently requires playing earlier levels. C070 lets the developer choose and retain a play order so refreshes with skip intro immediately start the map being edited.

## What Changes

- Add a Developer menu section titled `Map Order`, with map buttons labeled `Level1`, `Level2`, `Level3`, generated from packaged maps.
- Clicking a map moves it to the leftmost position and saves the order in local storage, preserving the relative order of other maps.
- Apply the preference on refresh or Restart Game; Continue follows the order captured for the current run.
- Separate map identity from run position for progress, final-map detection, and trophies.
- Clear All Settings restores numerical order for the next run.
- Duplicate `Level02.tmj` into an independently editable `Level03.tmj`, preserving the source.

## Capabilities

### New Capabilities

- `developer-map-order`: Persistent map ordering controls, ordered runs, and a third editable map. The default numerical order preserves existing behavior; a custom order replaces the assumption that Restart Game always loads Level1.

### Modified Capabilities

- `tiny-swords-ui-theme`: Continue, Restart Game, and final-map completion respect the selected map sequence; numerical ordering remains the default.

## Impact

Settings UI and runtime settings store; level catalog/progress and reload transition state; completion/reward integration; Tiled map assets; targeted settings/progression tests and real-browser checks. No new dependencies or wallet-storage changes. Implementation tasks use C070-T### identifiers.
