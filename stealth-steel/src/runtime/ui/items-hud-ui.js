const FAMILIES = ["Shoes", "Dagger", "Shield"];

export function createItemsHudUi({ host, snapshot, documentRef = globalThis.document }) {
  const element = documentRef.createElement("p");
  element.className = "items-counter";
  const label = documentRef.createElement("span");
  label.textContent = "Items:";
  element.append(label);

  const slots = FAMILIES.map((family) => {
    const slot = documentRef.createElement("span");
    slot.className = "items-counter-slot";
    slot.setAttribute("data-family", family);
    element.append(slot);
    return slot;
  });

  function render(next = snapshot) {
    snapshot = next;
    const activeItems = FAMILIES.filter((family) => snapshot?.slots?.[family]).length;
    element.hidden = activeItems === 0;
    FAMILIES.forEach((family, index) => {
      const slot = slots[index];
      slot.textContent = "";
      const item = snapshot?.slots?.[family];
      if (!item) {
        slot.hidden = true;
        slot.setAttribute("aria-label", `${family}: empty`);
        return;
      }
      slot.hidden = false;
      const icon = documentRef.createElement("img");
      icon.src = item.iconUrl;
      icon.alt = item.name;
      icon.title = `${item.name}: ${item.effect}`;
      slot.setAttribute("aria-label", `${family}: ${item.name}`);
      slot.append(icon);
    });
  }

  render(snapshot);
  host.append(element);
  return { element, render };
}
