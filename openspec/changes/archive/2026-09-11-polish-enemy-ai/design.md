## Context

See [proposal.md](proposal.md) for motivation. The runtime centralizes enemy
capabilities in enemy profiles, makes autonomous decisions in the shared GOAP
brain, resolves Warrior guard in the character/combat layers, and supplies
per-frame knowledge and gold snapshots from the game loop. Existing perception
is per-enemy and time-bounded; gold collection is player-only. The shared
movement-recovery policy may choose a one-cell escape, so it must remain
separate from deliberately selected two-to-four-cell tactical fleeing.

## Goals / Non-Goals

**Goals:**

- Keep archetype-specific probabilities in deterministic profile configuration
  so focused tests can control every result.
- Make a Warrior's knife-impact reaction an event-time decision, early enough
  for guard to suppress the triggering damage while preserving one GOAP action
  owner.
- Route Monk proximity fleeing and optional gold pursuit through existing
  reachability, collision, and per-enemy perception primitives.
- Preserve both the player-only pickup system and existing bush concealment
  behavior.

**Non-Goals:**

- Changing enemy health, damage, movement speeds, animations, maps, or player
  controls.
- Adding attacks, pickup collection, or global player knowledge to Monks.
- Replacing shared stalled-movement recovery or changing its behavior for
  ordinary routes.
- Rebalancing arrow defense or non-Warrior combat.

## Decisions

### Put tuning on the enemy profile

Add the Warrior's four response thresholds, Monk's proximity-flee and
gold-seeking settings, and Goblin's 35-percent bush-burn chance to the shared
profile definition. The brain consumes a profile rather than branching on
character names throughout decision code.

This keeps tuning inspectable and deterministic in tests. A character-name
switch was considered, but would scatter balance values and make archetype
differences harder to verify.

### Resolve a Warrior response per eligible melee impact

When the existing player-melee path confirms an eligible adjacent knife impact
on a living Warrior, ask the Warrior/brain response API for one random bucket
before damage is applied. The guard bucket starts the existing guard mechanism
and marks just that impact blocked; fight and take-hit permit ordinary damage;
the flee bucket permits ordinary damage then replaces the interruptible
autonomous action with a tactical route when one is valid.

The decision is made at melee impact rather than by polling the brain each
frame. This is the only placement that can reliably block the precise
triggering hit, avoids a repeated fast combat loop, and makes one roll per hit
testable. A cooldown was rejected because the confirmed behavior requires an
independent roll on every eligible impact.

### Use an explicit tactical-flee route constructor

Add a route-selection path that considers only safe reachable cells at
cardinal distance two through four from the player. It reuses authoritative
grid occupancy, collision validation, bounded search, and deterministic
randomness, but reports no tactical route when the required range has no
candidate. The caller then resumes its archetype's normal action instead of
delegating to the generic one-cell recovery fallback.

Relaxing the range into recovery was considered, but would violate the agreed
flee distance and make a failed escape look like a different unrequested
behavior.

### Treat Monk gold as navigation evidence, not pickup ownership

At a post-idle normal decision, the Monk evaluates its 45-percent gold roll
after checking the higher-priority permitted proximity flee. On success it
uses the gold snapshot to select the nearest reachable living pickup, with
stable snapshot order for ties, and routes using normal movement. It never
calls the player pickup transaction or alters pickup state.

Giving the Monk a collecting action was rejected because the feature is meant
to create a moving blocker and would alter player economy. Checking gold before
flee was rejected because an approaching player must make the Monk yield
immediately.

### Preserve existing perception boundaries during all new decisions

Warrior knife reactions and Monk proximity routing use only the individual
enemy's currently permitted target information. They do not refresh alert
timers, bypass an occupied bush, or share hidden-player coordinates. Existing
movement, collision, and attack priority logic stays the source of truth.

Using a global player position for simpler flee selection was rejected because
it would break the established per-enemy concealment contract.

## Risks / Trade-offs

- [The response point may occur after damage has already been committed] →
  Place the response immediately before the existing melee damage application
  and add a guard-block regression test for the same impact.
- [A failed tactical route could accidentally invoke ordinary recovery] →
  Model tactical-route failure distinctly and test that no shorter destination
  is requested.
- [Gold targeting can become stale while a Monk walks] → Revalidate the gold
  snapshot and route at normal decision boundaries; safely resume normal
  behavior if the pickup disappears or is unreachable.
- [New brain callbacks can create competing action owners] → Keep all voluntary
  movement and action replacement inside the current brain owner, with
  character code limited to animation and immediate guard execution.
- [Probability changes may regress balance silently] → Use injected random
  sources and boundary tests for all buckets, including 0.35 and 0.45.

## Migration Plan

1. Extend the shared profile and brain interfaces while retaining default
   behavior for unrelated archetypes.
2. Wire Warrior knife-response timing and Monk/Goblin choices through the
   existing world snapshots and route primitives.
3. Add focused unit tests, run the repository test/build commands, and perform
   browser gameplay checks for each archetype.
4. If a regression is found, disable only the new profile fields or response
   call sites to restore the previous shared decision paths; no data migration
   or persisted state is involved.
