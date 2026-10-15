import { createViewportSafeArea } from './viewport-safe-area.js';

export const MAX_PRODUCTION_DPR = 2;

export function productionPixelRatio(value) {
  return Number.isFinite(value) && value > 0 ? Math.min(value, MAX_PRODUCTION_DPR) : 1;
}

export function updateDiagnosticBacking(canvas, context, reference, dpr) {
  const ratio = productionPixelRatio(dpr);
  const width = Math.max(1, Math.floor(reference.width * ratio));
  const height = Math.max(1, Math.floor(reference.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  context.setTransform(width / reference.width, 0, 0, height / reference.height, 0, 0);
}

// Re-arm the media query after every change; no permanent polling loop.
export function observePixelRatio(windowRef, onChange) {
  let query;
  const refresh = () => {
    query?.removeEventListener('change', refresh);
    query = windowRef.matchMedia?.(`(resolution: ${windowRef.devicePixelRatio || 1}dppx)`);
    query?.addEventListener('change', refresh);
    onChange();
  };
  refresh();
  return () => query?.removeEventListener('change', refresh);
}

export function uiPresentation(visible, frame, reference, zoom = 1) {
  const frameScale = frame.height / reference.height || 1;
  return {
    left: visible.left + visible.width * (1 - zoom) / 2,
    top: visible.top + visible.height * (1 - zoom) / 2,
    width: visible.width / frameScale,
    height: visible.height / frameScale,
    scale: frameScale * zoom,
  };
}

export function createUiViewport({ element, frameElement, reference,
  windowRef = window, documentRef = document, ResizeObserverRef = globalThis.ResizeObserver }) {
  let zoomStep = 10;
  const coordinator = createViewportSafeArea({ element, frameElement, windowRef, documentRef, ResizeObserverRef,
    onUpdate(visible, frame) {
      const layout = uiPresentation(visible, frame, reference, zoomStep / 10);
      const crop = Math.max(0, (1 - 10 / zoomStep) / 2);
      Object.assign(element.style, {
        left: `${layout.left}px`, top: `${layout.top}px`,
        width: `${layout.width}px`, height: `${layout.height}px`,
        transformOrigin: '0 0', transform: `scale(${layout.scale})`,
        containerType: 'size',
        clipPath: `inset(${layout.height * crop}px ${layout.width * crop}px)`,
      });
      element.style.setProperty('--menu-toast-bottom', `${layout.height * 0.09}px`);
      element.style.setProperty('--menu-content-min-height', `${Math.min(325, layout.height * 0.25)}px`);
      element.dataset.uiReference = 'logical';
      element.dataset.uiZoom = String(zoomStep / 10);
      element.dataset.uiScale = String(layout.scale);
    },
  });
  const wheel = event => {
    if (event.ctrlKey || event.metaKey || event.altKey || !event.deltaY) return;
    const bounds = frameElement.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    event.preventDefault();
    zoomStep = Math.max(5, Math.min(15, zoomStep + (event.deltaY < 0 ? 1 : -1)));
    coordinator.update();
  };
  windowRef.addEventListener('wheel', wheel, { passive: false });
  return {
    update: coordinator.update,
    dispose() {
      windowRef.removeEventListener('wheel', wheel);
      coordinator.dispose();
    },
  };
}
