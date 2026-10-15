export function formatLevelCounterText(level, total) {
  return `Level: ${Math.max(0, level)}/${Math.max(0, total)}`;
}

export function createLevelCounterUi({ host, level = 1, total = 0, documentRef = globalThis.document }) {
  const element = documentRef.createElement("p");
  element.className = "level-counter";
  element.textContent = formatLevelCounterText(level, total);
  host.append(element);
  return { element };
}
