/** @param {{overlay?: HTMLElement, frameElement?: HTMLElement | null, coordinateRoot?: HTMLElement | null, windowRef?: Window, ResizeObserverRef?: typeof ResizeObserver}} [options] */
export function bindToGameFrame({
  overlay,
  frameElement,
  coordinateRoot = overlay?.closest?.('.ui-layer[data-ui-reference="logical"]'),
  windowRef = globalThis.window,
  ResizeObserverRef = globalThis.ResizeObserver,
} = {}) {
  if (!overlay || !frameElement) return () => {};

  const update = () => {
    // A transformed logical UI root is the containing block for fixed menus.
    // Its dimensions are already normalized; client frame pixels would scale twice.
    const layer = coordinateRoot;
    if (layer) {
      Object.assign(overlay.style, { left: '0px', top: '0px', width: layer.style.width, height: layer.style.height });
      return;
    }
    const bounds = frameElement.getBoundingClientRect();
    overlay.style.left = `${bounds.left}px`;
    overlay.style.top = `${bounds.top}px`;
    overlay.style.width = `${bounds.width}px`;
    overlay.style.height = `${bounds.height}px`;
  };
  const observer = ResizeObserverRef ? new ResizeObserverRef(update) : null;
  observer?.observe(frameElement);
  const layer = coordinateRoot;
  if (layer) observer?.observe(layer);
  windowRef?.addEventListener?.("resize", update);
  update();

  return () => {
    observer?.disconnect();
    windowRef?.removeEventListener?.("resize", update);
  };
}
