## Context

See proposal.md for motivation. C067 spans player input, animation, controller DOM, and game-owned damage resolution. The current player loads Pawn_Interact Knife.png as shoot (four frames, 100 ms each), while its state machine releases a projectile at frame 5. main.js still connects onShoot to projectiles.shoot. Weapon selection starts empty and blocks attacks. The catalog's knife damage is currently 10 but is not used by that path.

All five enemy factories use createCombatActorState, whose starting health is 100. Existing attack-impact.js provides immutable directions and a single midpoint event. Existing enemy-to-player melee uses an area covering the attacker's current grid cell and the adjacent cardinal cell. Existing combat state already owns hit flash, supported knockback, death, and collider removal.

## Goals / Non-Goals

**Goals:** Make control activation, visible knife playback, and one damage event agree. Keep combat resolution testable outside rendering. Preserve independent movement and touch input.

**Non-Goals:** New art, audio, weapons, armor, health UI, enemy AI changes, item-system deletion, altered enemy starting health, or changes to enemy-to-player attacks. This change does not implement the unfinished UI proposal or modify unrelated local edits.

## Decisions

1. **Fixed knife action.** Attack and V use the knife regardless of weapon/item slots, including empty slots. Keep 1/2 selection and item inventory behavior for compatibility; selection does not affect this fixed attack. Use the knife sheet for the full attack, then restore the current locomotion/loadout visual. The user explicitly chose this over weapon-specific attacks.
2. **One game-time midpoint impact.** Use a player-specific swing clock for a 400 ms knife swing with one event at 200 ms (entry into zero-based frame 2). That clock also sets the displayed frame directly: the generic sprite manager advances at most one frame per update and cannot guarantee midpoint alignment on coarse updates. Derive duration from the catalog and set the authoritative knife damage to 25. Resolve synchronously through an attack callback (no queued hit) to game-owned melee resolution, removing the player's dependency on projectile release. Timer/frame crossing must survive a coarse update and animation completion without losing or duplicating impact. Do not restart locomotion when the temporary loadout presentation timer expires mid-swing. Ignore new attacks until completion; held V does not auto-repeat.
3. **Direct damage-collider overlap.** At the midpoint compare the player damage collider with every living enemy damage collider through the existing overlap test. Deal 25 to each overlapping enemy once. Do not use GridSpot reach, facing filters, collider enlargement, or additional terrain checks. Current collider positions determine the hit, not start-of-swing positions.
4. **Preserve established combat outcomes.** Pass damage through each target's combat state to retain flash, supported knockback, and lethal removal. The knife targets only enemy records, including Monk. It does not target sheep, pickups, bushes, stones, or the player. Existing Warrior projectile defense is not a knife defense. Remove the player-to-enemy walking/contact damage trigger; enemy-to-sheep contact and enemy-to-player attacks stay unchanged.
5. **Temporarily remove Item input at the UI boundary.** Omit Item markup from the active HUD and tolerate an absent optional itemButton in controller registration, reset, and disposal. Do not only hide it with CSS: no focusable Item control, hit target, or C handler remains. Keep reusable item data and controller support for future restoration. Update visible hints. Attack retains its current artwork, accessible keyboard activation, and lower-right anchor without an empty Item-sized gap.
6. **Lifecycle authority.** Input cannot start swings while disabled, dead, paused, or outside gameplay. Pause freezes both animation and impact time. Player death, level teardown, and transitions cancel the swing; resuming cannot replay a stale hit. A swing already in progress can coexist with walking, with its horizontal sprite facing preserved until its end.

## Risks / Trade-offs

- Knife art is a single existing sheet rather than four directional sheets -> preserve horizontal mirroring, use damage-collider overlap independent of facing, and visually check up/down playback without inventing assets.
- The controller assumes both buttons exist -> test construction, blur/reset, pointer cancellation, and disposal with Item absent.
- Render callback order can miss a midpoint on coarse updates -> test crossing the midpoint and the end in one update, including cancellation before the synchronous callback.
- Unfinished C061 UI artifacts still describe two buttons -> C067 changes the relevant main-spec requirements when synced; preserve other C061 work and flag the superseding control requirement during later sync/archive.
- Legacy contact-damage expectations conflict with knife-only damage -> update the player contact regression and retain enemy-to-sheep coverage.
- Pre-existing duplicate C052/C053 metadata was observed while checking ID allocation -> C067 uses the next unused ID after C066; unrelated metadata repair is outside this proposal.

## Migration Plan

Implement focused failing tests, then controller and player/combat changes, then run unit and browser verification. No data migration or package installation is needed. Keep archived specs and existing assets intact. If behavior needs reversal, make additive source edits restoring the previous control wiring; do not rewrite Git history. Before archiving, sync these deltas and reconcile any older active delta that would restore Item/C.
