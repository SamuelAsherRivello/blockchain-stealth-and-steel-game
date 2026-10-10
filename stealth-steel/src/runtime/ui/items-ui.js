import { GameWindow } from "./game-window.js";
import { playSfx } from "../audio/sfx.js";

const BODY_TEXT = "Click item to toggle activation.";
const EMPTY_BODY_TEXT = "You have no items.";
const afterPaint = () => typeof globalThis.requestAnimationFrame === "function"
  ? new Promise(resolve => requestAnimationFrame(resolve))
  : Promise.resolve();
const STAT_VALUES = (item) => {
  const values = new Map((item.attributeDeltas ?? []).map(change => [change.bisAttribute, change.bisAttributeDelta]));
  const value = attribute => `${values.get(attribute) > 0 ? "+" : ""}${values.get(attribute) ?? 0}%`;
  return [["Speed", value("movementSpeed")], ["Offense", value("playerDamage")], ["Defense", value("damageTaken")]];
};

function getInventoryLayout(itemCount) {
  if (itemCount <= 1) return "1x1";
  if (itemCount <= 3) return `1x${itemCount}`;
  const columns = itemCount <= 6 ? 2 : 3;
  return `${columns}x${Math.ceil(itemCount / columns)}`;
}

export function createItemsUi({ host, screenLayer, frameElement = null, opener, equipmentProvider,
  onClose = () => {}, onState = () => {},
  play = playSfx, documentRef = globalThis.document }) {
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
  let actionBusy = false;
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
  window.setVisible(false);

  function render(state) {
    if (disposed) return;
    grid.textContent = "";
    const itemCount = state?.ownedItems?.length ?? 0;
    status.textContent = state?.status === "ready"
      ? (itemCount === 0 ? EMPTY_BODY_TEXT : BODY_TEXT)
      : "";
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
        if (actionBusy || !equipment) return;
        actionBusy = true;
        try {
          const skipOwnershipCheck = { skipOwnershipCheck: true };
          const next = selected
            ? await equipment.clearEquipmentAsync(item.family, skipOwnershipCheck)
            : await equipment.selectEquipmentAsync(item.assetId, skipOwnershipCheck);
          if(disposed)return;
          if (!selected) play("activate");
          onState(next);
          render(next);
        } catch {
          render(state);
        } finally {
          actionBusy = false;
        }
      });
      grid.append(button);
    }
  }

  render({ status: "loading" });

  void (async () => {
    try {
      equipment = await equipmentProvider();
      if(disposed)return;
      await afterPaint();
      if(disposed)return;
      equipment.showLoadingUI?.();
      let state;
      try {
        state = await equipment.refreshEquipmentAsync();
      } finally {
        equipment.hideLoadingUI?.();
      }
      if(disposed)return;
      onState(state);
      render(state);
      window.setVisible(true);
    } catch {
      if (disposed) return;
      render({ status: "unavailable" });
      window.setVisible(true);
    }
  })();

  return { window, content, get equipment() { return equipment; } };
}
