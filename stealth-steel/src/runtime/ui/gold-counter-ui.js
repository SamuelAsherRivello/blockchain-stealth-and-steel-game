export function formatGoldCounterText(collected, total) {
  return `Gold: ${Math.max(0, collected)}/${Math.max(0, total)}`;
}

export function createGoldCounterUi({ host, total = 0, documentRef = globalThis.document }) {
  const element = documentRef.createElement("p");
  element.className = "gold-counter";
  let collected = 0;
  const render = () => { element.textContent = formatGoldCounterText(collected, total); };
  render();
  host.append(element);
  return {
    element,
    increment() {
      collected += 1;
      render();
    },
    get collected() { return collected; },
    get total() { return total; },
  };
}
