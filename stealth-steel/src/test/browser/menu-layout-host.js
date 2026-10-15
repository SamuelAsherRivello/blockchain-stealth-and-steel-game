import { createItemsUi } from "../../runtime/ui/items-ui.js";
import { createTreasureUi } from "../../runtime/ui/treasure-ui.js";

const variant = new URLSearchParams(location.search).get("menu") ?? "items";
const host = document.getElementById("host");
const frameElement = document.getElementById("gameFrame");

if (variant === "items") {
  createItemsUi({
    host,
    frameElement,
    opener: document.createElement("button"),
    play: () => {},
    equipmentProvider: async () => ({
      refreshEquipmentAsync: async () => ({
        status: "ready",
        profileId: "fixture-player",
        ownedItems: [],
        effective: {},
      }),
    }),
  });
} else {
  const listeners = new Set();
  const session = {
    getState: () => ({ status: "active", remainingSeconds: 80 }),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    inspect: async () => {},
    act: async () => ({ status: "active" }),
  };
  const treasure = createTreasureUi({
    host,
    frameElement,
    pauseController: { pause() {}, resume() {} },
    session,
    playSound: () => {},
  });
  treasure.open();
}

window.menuLayoutFixture = { variant };
