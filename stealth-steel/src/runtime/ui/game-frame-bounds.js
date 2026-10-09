/** @param {{overlay?: HTMLElement, frameElement?: HTMLElement | null, windowRef?: Window, ResizeObserverRef?: typeof ResizeObserver}} [options] */
export function bindToGameFrame({
  overlay,
  frameElement,
  windowRef = globalThis.window,
  ResizeObserverRef = globalThis.ResizeObserver,
} = {}) {
  if (!overlay || !frameElement) return () => {};

  const update = () => {
    const bounds = frameElement.getBoundingClientRect();
    overlay.style.left = `${bounds.left}px`;
    overlay.style.top = `${bounds.top}px`;
    overlay.style.width = `${bounds.width}px`;
    overlay.style.height = `${bounds.height}px`;
  };
  const observer = ResizeObserverRef ? new ResizeObserverRef(update) : null;
  observer?.observe(frameElement);
  windowRef?.addEventListener?.("resize", update);
  update();

  return () => {
    observer?.disconnect();
    windowRef?.removeEventListener?.("resize", update);
  };
}
