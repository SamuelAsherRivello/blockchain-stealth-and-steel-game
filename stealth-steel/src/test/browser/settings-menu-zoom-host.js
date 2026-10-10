import { createSettingsUi } from '../../runtime/ui/settings-ui.js';

const frame = document.querySelector('.game-frame');
const layer = document.querySelector('#uiLayer');
const syncLayerToFrame = () => {
  const bounds = frame.getBoundingClientRect();
  Object.assign(layer.style, {
    left: `${bounds.left}px`, top: `${bounds.top}px`,
    width: `${bounds.width}px`, height: `${bounds.height}px`,
  });
};
new ResizeObserver(syncLayerToFrame).observe(frame);
syncLayerToFrame();

const store = {
  values: new Map(),
  get(key) { return this.values.get(key) ?? 50; },
  set(key, value) { this.values.set(key, value); },
  reset() { this.values.clear(); },
};
const settings = createSettingsUi({
  host: document.querySelector('#host'),
  frameElement: frame,
  pauseController: { pause() {}, resume() {} },
  store,
  openAccount: async () => {},
  catalog: [{ number: 1 }, { number: 2 }, { number: 3 }],
  applyFullscreen: async () => {},
});
settings.open();
window.settingsMenuZoomFixture = { settings };
