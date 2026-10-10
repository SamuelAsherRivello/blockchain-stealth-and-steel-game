import { createLevelCompleteUi, createLevelLostUi } from "../../runtime/ui/level-complete-ui.js";

const outcome = new URLSearchParams(location.search).get("outcome") ?? "completion";
const host = document.getElementById("host");
const frameElement = document.getElementById("gameFrame");
const ui = outcome === "loss"
  ? createLevelLostUi({
    host,
    frameElement,
    onPay: () => {},
    onRestart: () => {},
  })
  : createLevelCompleteUi({
    host,
    frameElement,
    showTrophyActions: () => true,
    onContinue: () => {},
    onRestart: () => {},
  });

if (outcome === "loss") {
  ui.setState({ sats: 1000, canPay: true, status: "available", message: "Game wallet recipient is not configured." });
} else {
  ui.setCompletion({ levelNumber: 1, levelsCompleted: 1, totalLevels: 3, hasNext: true, collected: 0, total: 16 });
  ui.setState({ status: "guest", message: "Log in to collect this trophy." });
}
ui.show();
window.outcomeLayoutFixture = { outcome };
