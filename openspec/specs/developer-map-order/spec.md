# Developer Map Order Specification

## Purpose

Allow developers to persist a preferred map sequence and replay the Tiled map they are editing first.

## Requirements

### Requirement: Move map to front
The Developer menu SHALL show `Map Order` with one button per packaged map, labeled `Level1`, `Level2`, and so on, in left-to-right play order. Clicking a button SHALL move it to the front while retaining the relative order of other maps, without loading a map immediately.

#### Scenario: Successive selections
- **WHEN** the order is Level1,Level2,Level3 and the user clicks Level2 then Level3
- **THEN** the buttons show Level3,Level2,Level1
- **AND** clicking Level3 again leaves that order unchanged

### Requirement: Persistent order
The selected order SHALL be saved in local storage and restored on refresh. Missing or invalid preferences SHALL use numerical order. Unknown and duplicate map entries SHALL be ignored and newly packaged maps appended numerically. Clear All Settings SHALL restore numerical order without touching account data.

#### Scenario: Refresh after selecting a map
- **WHEN** the user saves Level3,Level2,Level1 and refreshes
- **THEN** Level3 loads first and the menu retains that order

#### Scenario: Reset preferences
- **WHEN** the user clicks Clear All Settings
- **THEN** the visible order becomes Level1,Level2,Level3 and the next fresh run uses it

### Requirement: Ordered run progression
Fresh runs and Restart Game SHALL start the first map of the saved preference. Continue SHALL follow the sequence captured at run start even if the preference changes during that run. Map titles and trophies SHALL retain map identity; completion counts and game completion SHALL use run position. Existing development skipIntro behavior SHALL remain supported.

#### Scenario: Complete a reordered run
- **WHEN** the run order is Level3,Level2,Level1
- **THEN** completing Level3 counts as one of three completed maps and uses the Level3 trophy identity
- **AND** Continue loads Level2 then Level1, where the game is complete and Continue is absent

#### Scenario: Edit and replay
- **WHEN** Level3 is first and the user refreshes the development game with skipIntro=true after saving Level03.tmj
- **THEN** the saved Level03.tmj loads with the intro skipped

### Requirement: Independent third map
Level03.tmj SHALL initially duplicate Level02.tmj exactly in the same maps directory, preserving all relative references and leaving Level02.tmj unchanged.

#### Scenario: Edit third map
- **WHEN** the copy is created
- **THEN** three maps are available and Level03.tmj can be edited independently in Tiled
