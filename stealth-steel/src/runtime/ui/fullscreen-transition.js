export const FULLSCREEN_TRANSITION_DURATION_MS = 250;

/** Animates the circular hole in the full-screen black SVG mask. */
export function createFullscreenTransition({
  overlay,
  circle,
  blackout,
  target,
  durationMs = FULLSCREEN_TRANSITION_DURATION_MS,
  now = () => performance.now(),
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = frame => cancelAnimationFrame(frame),
  setTimer = (callback, delay) => setTimeout(callback, delay),
  clearTimer = timer => clearTimeout(timer),
} = {}) {
  if (!overlay || !circle || !blackout || !target) throw new Error("Fullscreen transition requires its target, overlay, circle, and blackout path.");

  let frame = null;
  let radius = 0;
  let maximumRadius = 0;
  let width = 1;
  let height = 1;
  let active = null;
  let completionTimer = null;
  const setHidden = (hidden) => {
    if (overlay.toggleAttribute) overlay.toggleAttribute("hidden", hidden);
    overlay.hidden = hidden;
  };
  const draw = (nextRadius) => {
    radius = nextRadius;
    circle.setAttribute("r", String(Math.round(nextRadius)));
    const centerX = width / 2;
    const centerY = height / 2;
    const left = centerX - nextRadius;
    const diameter = nextRadius * 2;
    blackout.setAttribute("d", `M0 0H${width}V${height}H0Z M${left} ${centerY}a${nextRadius} ${nextRadius} 0 1 0 ${diameter} 0a${nextRadius} ${nextRadius} 0 1 0 -${diameter} 0Z`);
  };
  const measure = () => {
    const bounds = target.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    overlay.style.left = `${bounds.left}px`;
    overlay.style.top = `${bounds.top}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    maximumRadius = Math.ceil(Math.hypot(width, height) / 2);
    overlay.setAttribute?.("viewBox", `0 0 ${width} ${height}`);
    circle.setAttribute?.("cx", String(width / 2));
    circle.setAttribute?.("cy", String(height / 2));
    if (radius >= maximumRadius || radius === 0) draw(radius === 0 ? 0 : maximumRadius);
  };
  const animateTo = (targetRadius, hideWhenComplete) => {
    if (active?.targetRadius === targetRadius) return active.promise;
    if (frame !== null) cancelFrame(frame);
    if (completionTimer !== null) clearTimer(completionTimer);
    active?.resolve();
    setHidden(false);
    const startRadius = radius;
    let startedAt = null;
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    active = { targetRadius, promise, resolve };
    const finish = () => {
      if (active?.targetRadius !== targetRadius) return;
      if (frame !== null) cancelFrame(frame);
      if (completionTimer !== null) clearTimer(completionTimer);
      frame = null;
      completionTimer = null;
      draw(targetRadius);
      if (hideWhenComplete) setHidden(true);
      const completed = active;
      active = null;
      completed.resolve();
    };
    const tick = (frameNow) => {
      if (startedAt === null) startedAt = frameNow ?? now();
      const elapsed = Math.max(0, (frameNow ?? now()) - startedAt);
      const progress = Math.min(1, elapsed / durationMs);
      draw(startRadius + (targetRadius - startRadius) * progress);
      // Browsers can park the next animation frame just short of the exact
      // endpoint. A rounded full radius is already visually complete, so do
      // not leave the invisible input blocker active waiting for that frame.
      const visuallyComplete = Math.round(radius) === Math.round(targetRadius);
      if (progress < 1 && !visuallyComplete) {
        frame = requestFrame(tick);
        return;
      }
      draw(targetRadius);
      finish();
    };
    frame = requestFrame(tick);
    // A timer is a fallback for a backgrounded browser that stops scheduling
    // animation frames at a rounded visual endpoint.
    completionTimer = setTimer(finish, durationMs + 32);
    return promise;
  };

  measure();
  draw(0);
  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
  resizeObserver?.observe(target);
  return Object.freeze({
    reveal() { measure(); return animateTo(maximumRadius, true); },
    cover() { measure(); return animateTo(0, false); },
    resize: measure,
    dispose() {
      if (frame !== null) cancelFrame(frame);
      if (completionTimer !== null) clearTimer(completionTimer);
      active?.resolve();
      active = null;
      resizeObserver?.disconnect();
    },
  });
}
