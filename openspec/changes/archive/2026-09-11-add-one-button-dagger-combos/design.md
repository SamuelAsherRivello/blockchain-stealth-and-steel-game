## Context

See `proposal.md` for motivation. The current player owns one `createKnifeSwing()` with a fixed 400 ms duration, 200 ms impact, forward frame selection, and an active-swing input rejection. `main.js` invokes the existing attack and damage sound hooks at attack start and confirmed damage. Particle effects already support one-shot playback, but current gameplay ownership is bush-specific. The player also has existing stealth-attack and movement/teardown paths that must remain intact.

## Goals / Non-Goals

**Goals:**

- Keep all combat on one existing Attack button and one dagger collider.
- Make combo recognition deterministic with keyboard, accessible-button, and touch activation sharing one game-time clock.
- Keep tuning values data-driven so playtesting changes profile data, not sequence logic.
- Make every combo state and effect cancellation-safe.

**Non-Goals:**

- New weapon moves, a player-controlled jump, an enemy stagger/status system, a targeting system, new sound assets, or a player-facing tuning UI.
- Changing movement, stealth-attack, terrain, or collider geometry.

## Decisions

### Use a data-driven combo profile and pure sequence resolver

Create a single exported C072 tuning profile containing rhythm ranges, one-second over-fast cooldown, move durations, frame direction, impact fraction/time, visual-jump envelope, damage multiplier, recovery/delay, feedback recipe, and pitch values. A pure resolver will receive deliberate press timestamps and elapsed active gameplay time, produce the next move descriptor, and expose explicit state transitions for ordinary, Rapid Triple, over-fast cooldown, and cancellation.

This isolates playtest calibration from the player actor. Hard-coding timing decisions into key or pointer handlers was rejected because keyboard and touch would drift and iteration would be expensive. A developer tuning UI was rejected as out of scope.

### Buffer one future press and schedule all movement from descriptors

The player actor will forward every deliberate attack request to the resolver. An active move may retain one later press; it does not start another move until the current descriptor completes and the resolver permits it. Each descriptor controls whether the existing four dagger frames are read forward or backward, its speed, its one impact time, optional visual offset, and its recovery/delay.

The animation's changed impact time and the resolver's combat event share the same elapsed game-time clock. This preserves coarse-frame correctness and allows the Rapid Triple's finisher delay without adding a second attack state. Queuing arbitrary presses or using wall-clock input timestamps was rejected because it enables spam and breaks pause semantics.

### Track combo confirmation per hit enemy

The combat resolver will return the actual eligible enemy records or stable labels damaged by an impact, rather than only an aggregate count. The combo resolver uses those identifiers to advance each target independently; a target that misses a required impact loses its progression while another overlapping target can continue. Damage selection remains collider-overlap-based and applies the descriptor multiplier after the existing equipment outgoing-damage multiplier path.

Global combo confirmation was rejected because it would reward a later target for earlier hits against a different enemy. Target selection was rejected because current dagger behavior correctly applies to all overlapping enemies.

### Keep the finisher jump and feedback presentation-only

The Rapid Triple finisher will apply a temporary visual transform/vertical presentation offset while preserving the player's ground position and movement/combat colliders. Player and enemy flashes, one-shot particle effects, and sound pitch are triggered only by confirmed upgraded impacts. Existing `playSfx` already accepts pitch, so the runtime can use pitch recipes without new audio dependencies. A small gameplay-owned combo-effect manager will own effect creation/reuse/disposal independently of preview and bush fire effects.

Actual jump movement, collider displacement, or applying feedback at input time was rejected: each would make the combo less predictable or conflict with existing controller/collision contracts.

### Preserve existing lifecycle and stealth behavior

Pause freezes resolver time, active move time, visual offset, finisher delay, and cooldown. Input disable, death, level transition, actor disposal, and cancelled active moves clear buffered input and per-target combo state. Existing attack-start stealth handling remains authoritative; a consumed stealth kill must not leave a stale combo chain or visual effect. The over-fast cooldown begins only after the third ordinary move ends and rejects requests without accepting hidden queued inputs.

## Risks / Trade-offs

- [Rhythm feels too strict or too lenient across touch and keyboard] → Keep all bands and rates in the profile; test with controlled clock inputs and tune in browser playtests.
- [Large frame deltas skip changed impact points or final delays] → Advance descriptors by threshold crossing and consume every event at most once.
- [A visual jump appears to move gameplay geometry] → Test screen offset separately from unchanged world position and both colliders.
- [One-shot effects or audio accumulate during chained attacks] → Use bounded effect ownership, idempotent cleanup, and one feedback emission per confirmed impact.
- [Stealth attack callbacks interact with a buffered sequence] → Clear combo state whenever a stealth kill consumes an attack and cover it with integration tests.

## Migration Plan

1. Add resolver and profile tests before changing player integration.
2. Replace the fixed swing lifecycle with descriptor-driven moves while preserving base ordinary damage and overlap behavior.
3. Integrate feedback and browser fixture coverage, then tune profile values through playtests.
4. Roll back by removing C072 routing; no persisted data or save migration is involved.

## Open Questions

- Initial Rapid Triple band, its escalating multipliers, and all non-required animation/pitch/effect values are playtest parameters. The fixed requirement is the one-second over-fast cooldown.
