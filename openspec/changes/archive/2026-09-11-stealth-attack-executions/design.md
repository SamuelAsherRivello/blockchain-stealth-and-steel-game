## Context

See proposal.md for motivation. The current runtime already snapshots enemy grid cells and headings, uses `tile-shadow.png` for forward perception, keeps bush gravity inside the player movement loop, and owns health/death state in a shared combat actor. The prototype proves the base rear-cell, pull, and kill path but does not retain shadow sprites for transitions, distinguish execution presentation from the ordinary knife lifecycle, or implement the confirmed execution choreography and immunity.

## Goals / Non-Goals

**Goals:**
- Retain per-enemy eligibility versions so a turn or movement cancels gameplay use immediately while a prior visual instance can fade out.
- Keep the execution state owned by the player/combat lifecycle rather than by broad AI state or terrain collision.
- Reuse loaded knife art and the existing tile-shadow atlas without dependencies or new assets.

**Non-Goals:**
- Changing perception range, terrain sight blocking, enemy navigation, grid/collider dimensions, player-controlled jumping, or regular knife combat.

## Decisions

### Separate eligibility from presentation

The rear-cell controller will publish immutable eligibility tokens keyed by enemy record identity. A small render-instance registry will retain yellow shadow sprites independently, interpolate opacity over 0.125 active seconds, and remove them only after fade-out. Gameplay queries use only current tokens, never retained visual instances. This avoids a visual grace period after turning or movement.

Alternative: recreate all shadow sprites every frame. Rejected because it cannot represent a fade-out once a zone leaves the current snapshot.

### Reuse gravity mechanics without conflating bush ownership

The player will use a separate rear-cell gravity controller with the same 0.75-grid-distance gate, 0.125-second acceleration, collision cancellation, and 0.25-second hold as bush gravity. Zone selection sorts by stable record order before arming. Bush rearm/overlap state remains independent because a rear cell is not a bush collider.

Alternative: merge zone state into bush gravity. Rejected because bush exit/rearm semantics differ and would couple unrelated terrain behavior to enemy state.

### Limit opportunities to horizontal enemy facings

The opportunity controller will accept only `left` and `right` headings. It will continue to track vertical headings for stability/invalidation, but it will publish no token or yellow shadow for `up` or `down`. This keeps the rear-cell approach understandable in the 2D play space without changing enemy-facing or perception behavior.

### Make stealth entry quiet and readable

An armed gravity state will retain its selected source enemy identity and source position. While pull or hold owns player movement, the player actor will face that source enemy and expose an audio-suppression query. The perception integration will set the player's moving-audio signal false for every enemy during that ownership interval; visual perception remains unchanged. Leaving, invalidation, cancellation, or execution consumption clears the suppression immediately.

### Give the source enemy an idle opportunity window

On a successful entry, the selected source enemy brain will cancel its current voluntary action, stop movement, and enter a one-shot 2–3 second active-time idle gate. The sampled duration will be injectable for deterministic tests. Death, disposal, or an existing movement lock still takes precedence; once the gate expires, ordinary sensing and planning resume.

### Add an explicit execution player state

An armed Attack will atomically validate its token, select the target, consume the rear-cell arm, start player execution state, and start target execution death. The player center and grid spot stay fixed while rendering applies a temporary lunge offset based on the target vector. Execution state controls its 0.8-second lock, input handling, visual reset, and damage-immunity query; it must clear on pause-compatible teardown, player death, level reset, and completion.

Alternative: treat execution as a normal knife swing with a special attack-start callback. Rejected because that permits the normal 200ms midpoint, does not model lock/immunity, and cannot own the visual lunge lifecycle safely.

### Parameterize special combat death

Combat death will accept an execution profile so its target remains non-interactive from the immediate zero-health transition through the 0.8-second stronger-knockback, shrink/fade, and three-spin animation. Standard lethal damage keeps its existing 250ms behavior.

Alternative: add a parallel enemy-removal path. Rejected because it would bypass shared health events, collider removal, and death completion ownership.

## Risks / Trade-offs

- [A yellow cell under terrain looks actionable] → Keep it as the requested directional signal; physical collision makes unreachable cells inert.
- [Multiple yellow cells share one position] → Sort by stable record order before arming and test repeatability.
- [Invulnerability can mask incoming projectile cleanup] → Continue consuming/dismissing valid incoming hit projectiles even when their damage is ignored.
- [Visual transforms can conflict with spawn, damage, or death transforms] → Give execution lunge an explicit lifecycle and clear it before ordinary presentation resumes; target death supersedes other target transforms.
- [Concurrent normal and execution attacks] → Atomically consume the armed zone before starting execution and reject Attack while either lifecycle is active.
- [C072 dagger-combo work changes the ordinary Attack lifecycle] → Keep C073 execution as a distinct armed branch and integrate it with the composed lifecycle rather than restoring a fixed knife-swing assumption.

## Migration Plan

1. Add focused controller, renderer, player-state, combat-state, and game-loop tests before changing runtime behavior.
2. Implement eligibility and fading presentation, then rear-cell gravity and deterministic selection.
3. Implement execution state, special death profile, immunity, and visual-only lunge.
4. Run focused and full tests, production build, and a browser scenario covering activation, cancellation, overlap selection, immunity, and recovery.
5. Roll back by removing the C073 runtime wiring; no persisted data or migration is required.
