## Why

The Item control is temporarily unwanted, and Attack currently plays the knife sheet through an obsolete projectile path whose release frame lies beyond that sheet. Players need a working, repeatable knife swing with visible impact and predictable damage.

## What Changes

- Temporarily remove Item from the visible and accessible controller and stop accepting C as a gameplay action. Preserve item data and pickup systems for later restoration.
- Make Attack and V always swing the existing knife animation for exactly 25 damage, regardless of the selected weapon or an empty weapon slot, as confirmed by the user.
- Resolve one collider-overlap melee impact per swing against living enemies, with existing hit feedback and death behavior; never spawn a player arrow from Attack.
- Remove player-to-enemy walking/contact damage.
- Preserve simultaneous movement, prevent overlapping swings, and respect pause, death, and level transitions.
- Keep all enemy starting health at the current 100 HP: Goblin, Warrior, Lancer, Archer, and Monk require four isolated successful knife hits.

## Capabilities

### New Capabilities

- `player-melee-combat`: Knife animation, swing lifecycle, damage-collider overlap, enemy targeting, and impact timing.

### Modified Capabilities

- `virtual-player-controller`: Attack-only action area, inactive C, optional Item element, and fixed knife action without equipment gating.
- `combat-health-system`: Add the player knife as a defined 25-damage source against every enemy type.
- `character-collider-roles`: Replace player contact damage with explicit knife-impact overlap.
- `dom-ui-corner-anchoring`: Anchor the sole Attack action to the existing lower-right inset.
- `tiny-swords-ui-theme`: Temporarily omit Item while preserving the approved Move and Attack artwork and label presentation.

## Impact

Implementation will touch the player actor/state and pawn animation catalog, runtime combat integration, controller plugin, HTML/control hints, focused tests, and browser fixtures. Reuse bundled knife art and existing combat feedback; no new packages or assets are required. Existing unfinished UI work and local gameplay edits must be preserved. The scaffolded C### change ID and C###-T### task IDs remain the permanent identities; the readable label is controls-update-and-add-attacking.
