const TRANSITION_SECONDS = 0.1;
const HIDE_DELAY_SECONDS = 1;
const EPSILON = 1e-9;
const clamp = (value, maximum) => Math.max(0, Math.min(maximum, value));

/** Presentation only: health is authoritative in combat state. Time is gameplay time. */
export function createHealthBar(initialHealth, initialMaximum) {
  let maximum, health, target, fromHealth, opacity, fromOpacity;
  let phase, elapsed, age;

  function reset(current, max) {
    maximum = max;
    health = target = fromHealth = clamp(current, maximum);
    opacity = fromOpacity = 0;
    phase = 'hidden'; elapsed = age = 0;
  }
  function begin(next) {
    phase = next; elapsed = 0;
    fromHealth = health; fromOpacity = opacity;
  }
  reset(initialHealth, initialMaximum);

  return {
    reset,
    get snapshot() {
      return { health, maximum, ratio: maximum > 0 ? health / maximum : 0, opacity, phase };
    },
    healthChanged({ previous, current, maximum: max }) {
      if (previous === current) return;
      maximum = max;
      target = clamp(current, maximum);
      age = 0;
      if (phase === 'hidden') {
        health = clamp(previous, maximum);
        begin('fading-in');
      } else if (phase === 'fading-out') {
        begin('fading-in');
      } else if (phase !== 'fading-in') {
        begin('changing');
      }
    },
    update(deltaSeconds) {
      let remaining = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0;
      // Consume phase boundaries, including the hide deadline, without losing time
      // on long frames. New damage may retarget the fill without snapping it.
      while (remaining > EPSILON && phase !== 'hidden') {
        const transitioning = phase !== 'holding';
        const untilPhase = transitioning ? TRANSITION_SECONDS - elapsed : Infinity;
        const untilHide = phase === 'fading-out' ? Infinity : HIDE_DELAY_SECONDS - age;
        const step = Math.max(0, Math.min(remaining, untilPhase, untilHide));
        remaining -= step; elapsed += step; age += step;
        const progress = Math.min(1, elapsed / TRANSITION_SECONDS);
        if (phase === 'fading-in') opacity = fromOpacity + (1 - fromOpacity) * progress;
        if (phase === 'changing') health = fromHealth + (target - fromHealth) * progress;
        if (phase === 'fading-out') opacity = fromOpacity * (1 - progress);

        if (phase !== 'fading-out' && age >= HIDE_DELAY_SECONDS - EPSILON) {
          begin('fading-out');
        } else if (transitioning && elapsed >= TRANSITION_SECONDS - EPSILON) {
          if (phase === 'fading-in') { opacity = 1; begin('changing'); }
          else if (phase === 'changing') { health = target; begin('holding'); }
          else { opacity = 0; begin('hidden'); }
        }
      }
    },
  };
}
