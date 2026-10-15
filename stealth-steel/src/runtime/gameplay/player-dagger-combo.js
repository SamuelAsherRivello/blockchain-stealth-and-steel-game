export const DAGGER_COMBO_PROFILE = Object.freeze({
  base: Object.freeze({ id: "ordinary", duration: 0.4, impactAt: 0.2, multiplier: 1, direction: 1 }),
  // Temporary learning windows: tune back to narrower rhythmic bands after playtesting.
  rapid: Object.freeze({ minGap: 0.12, maxGap: 1, second: Object.freeze({ id: "rapid-second", duration: 0.4, impactAt: 0.2, multiplier: 2, direction: -1 }), final: Object.freeze({ id: "rapid-final", delay: 0, duration: 0.4, impactAt: 0.2, multiplier: 3, direction: 1, visualJump: true }) }),
  overFastGap: 0.12,
  overFastCooldown: 1,
  rapidFinisherCooldown: 1.95,
});

function inRange(value, { minGap, maxGap }) { return value >= minGap && value <= maxGap; }
function cloneMove(move) { return { ...move, delay: move.delay ?? 0, visualJump: Boolean(move.visualJump) }; }

// This intentionally owns only timing/classification. Actor and combat code own animation,
// collider overlap, and per-target hit confirmation.
export function createDaggerComboController(profile = DAGGER_COMBO_PROFILE) {
  let time = 0;
  let cooldown = 0;
  let active = false;
  let buffered = false;
  let presses = [];
  let rapidCandidate = false;
  let overFastCandidate = false;
  let moveNumber = 0;
  let activeMove = null;
  let rapidFinisherHit = false;

  function resetSequence() {
    presses = []; rapidCandidate = false;
    overFastCandidate = false; moveNumber = 0; activeMove = null; rapidFinisherHit = false;
  }
  function classifyNext() {
    moveNumber++;
    if (moveNumber === 1) return cloneMove(profile.base);
    const gap = presses.at(-1) - presses.at(-2);
    if (moveNumber === 2) {
      rapidCandidate = inRange(gap, profile.rapid);
      overFastCandidate = gap < profile.overFastGap;
      return rapidCandidate ? cloneMove(profile.rapid.second) : cloneMove(profile.base);
    }
    if (moveNumber === 3) {
      const rapid = rapidCandidate && inRange(gap, profile.rapid);
      const overFast = overFastCandidate && gap < profile.overFastGap;
      if (rapid) return cloneMove(profile.rapid.final);
      if (overFast) return { ...cloneMove(profile.base), overFast: true };
      return cloneMove(profile.base);
    }
    return cloneMove(profile.base);
  }
  return {
    get cooldown() { return cooldown; },
    get active() { return active; },
    get hasBufferedPress() { return buffered; },
    // A relaxed third press may arrive after the short second animation ends.
    get awaitingRapidFinisher() { return rapidCandidate && moveNumber === 2 && !active; },
    advance(deltaSeconds) { cooldown = Math.max(0, cooldown - Math.max(0, deltaSeconds)); time += Math.max(0, deltaSeconds); },
    request() {
      if (cooldown > 0) return { accepted: false, reason: "cooldown" };
      if (active) {
        if (buffered) {
          const gap = time - presses.at(-1);
          if (gap < profile.overFastGap) {
            presses.push(time);
            overFastCandidate = true;
            return { accepted: false, reason: "over-fast" };
          }
          return { accepted: false, reason: "buffered" };
        }
        buffered = true; presses.push(time); return { accepted: true, buffered: true };
      }
      presses.push(time); active = true;
      activeMove = classifyNext();
      return { accepted: true, move: activeMove };
    },
    complete() {
      const completedMove = activeMove;
      active = false;
      activeMove = null;
      if (!buffered) {
        if (overFastCandidate && moveNumber === 2) {
          active = true;
          return classifyNext();
        }
        if (rapidCandidate && moveNumber === 2) return null;
        if (moveNumber >= 2) {
          if (overFastCandidate && moveNumber >= 3) cooldown = profile.overFastCooldown;
          if (completedMove?.id === "rapid-final" && rapidFinisherHit) {
            cooldown = Math.max(cooldown, profile.rapidFinisherCooldown);
          }
          resetSequence();
        }
        return null;
      }
      buffered = false; active = true;
      activeMove = classifyNext();
      return activeMove;
    },
    confirmRapidFinisherHit() {
      if (activeMove?.id === "rapid-final") rapidFinisherHit = true;
    },
    cancel() { active = false; buffered = false; cooldown = 0; resetSequence(); },
  };
}
