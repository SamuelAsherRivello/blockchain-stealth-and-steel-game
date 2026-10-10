import { createLevelCompleteUi } from '../../runtime/ui/level-complete-ui.js';

const frame = document.querySelector('.game-frame');
const layer = document.querySelector('#uiLayer');
const sync = () => {
  const bounds = frame.getBoundingClientRect();
  Object.assign(layer.style, { left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px` });
};
new ResizeObserver(sync).observe(frame);
sync();
const ui = createLevelCompleteUi({
  host: document.querySelector('#host'), outcome: 'loss',
  onRestart: () => {}, onPay: () => {}, frameElement: frame,
});
ui.show();
