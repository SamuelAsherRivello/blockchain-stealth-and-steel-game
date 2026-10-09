import { GameWindow } from "./game-window.js";
import { playSfx } from "../audio/sfx.js";

const BODY_TEXT = "Select 1 of each item type to activate it for gameplay";
const STAT_VALUES = (item) => [
  ["Speed", item.family === "Shoes" ? `+${item.effectPercent}%` : "0"],
  ["Offense", item.family === "Dagger" ? `+${item.effectPercent}%` : "0"],
  ["Defense", item.family === "Shield" ? `+${item.effectPercent}%` : "0"],
];

function getInventoryLayout(itemCount) {
  if (itemCount <= 1) return "1x1";
  if (itemCount <= 3) return `1x${itemCount}`;
  const columns = itemCount <= 6 ? 2 : 3;
  return `${columns}x${Math.ceil(itemCount / columns)}`;
}

export function createItemsUi({ host, screenLayer, frameElement = null, opener, equipmentProvider,
  onClose = () => {}, onState = () => {}, play = playSfx, documentRef = globalThis.document }) {
  const content = documentRef.createElement("div");
  content.className = "items-menu";
  const status = documentRef.createElement("p");
  status.className = "items-menu-status";
  status.setAttribute("role", "status");
  const grid = documentRef.createElement("div");
  grid.className = "items-menu-grid";
  content.append(status, grid);

  let disposed = false;
  let equipment;
  const window = new GameWindow({
    host,
    title: "Items",
    content,
    documentRef,
    opener,
    closeLabel: "Close items",
    screenLayer,
    frameElement,
    onClose() {
      disposed = true;
      onClose();
    },
  });

  function render(state) {
    if (disposed) return;
    grid.textContent = "";
    status.textContent = BODY_TEXT;
    const itemCount = state?.ownedItems?.length ?? 0;
    grid.dataset.layout = getInventoryLayout(itemCount);
    if (state?.status !== "ready" || !state.profileId) return;
    for (const item of state.ownedItems) {
      const selected = state.effective?.[item.family]?.assetId === item.assetId;
      const button = documentRef.createElement("button");
      button.type = "button";
      button.className = `items-menu-card${selected ? " is-selected" : ""}`;
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("data-asset-id", item.assetId);
      const art = documentRef.createElement("div");
      art.className = "items-menu-card-art";
      const icon = documentRef.createElement("img");
      icon.src = item.iconUrl;
      icon.alt = "";
      art.append(icon);
      const details = documentRef.createElement("div");
      details.className = "items-menu-card-details";
      const name = documentRef.createElement("strong");
      name.textContent = item.name;
      const price = documentRef.createElement("span");
      price.textContent = `${item.priceSats.toLocaleString("en-US")} sats`;
      details.append(name, price);
      const stats = documentRef.createElement("div");
      stats.className = "items-menu-card-stats";
      for (const [label, value] of STAT_VALUES(item)) {
        const stat = documentRef.createElement("span");
        stat.className = "items-menu-card-stat";
        const labelElement = documentRef.createElement("b");
        labelElement.textContent = label;
        const valueElement = documentRef.createElement("em");
        valueElement.textContent = value;
        stat.append(labelElement, valueElement);
        stats.append(stat);
      }
      button.append(art, details, stats);
      button.addEventListener("click", async () => {
        try {
          const next = selected ? await equipment.clearEquipment(item.family) : await equipment.selectEquipment(item.assetId);
          if(disposed)return;
          if (!selected) play("activate");
          onState(next);
          render(next);
        } catch {
          render(state);
        }
      });
      grid.append(button);
    }
  }

  void (async () => {
    try {
      equipment = await equipmentProvider();
      if(disposed)return;
      const state = await equipment.refreshEquipment();
      if(disposed)return;
      onState(state);
      render(state);
    } catch {
      render({ status: "unavailable" });
    }
  })();

  return { window, content, get equipment() { return equipment; } };
}
