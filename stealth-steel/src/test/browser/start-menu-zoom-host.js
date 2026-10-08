import { createStartGamePrompt } from "../../runtime/ui/start-game-prompt.js";

const frame = document.querySelector(".game-frame");
const layer = document.querySelector("#uiLayer");

function syncLayerToFrame() {
  const bounds = frame.getBoundingClientRect();
  Object.assign(layer.style, {
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
  });
}

const observer = new ResizeObserver(syncLayerToFrame);
observer.observe(frame);
observer.observe(document.documentElement);
syncLayerToFrame();

createStartGamePrompt({
  host: document.querySelector("#host"),
  frameElement: frame,
  itemsVisible: true,
  itemsEnabled: true,
  onStart: () => {},
  onItems: () => {},
});

window.startMenuZoomFixture = { syncLayerToFrame };
window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
