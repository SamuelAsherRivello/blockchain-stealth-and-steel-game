/** Native slider with shared presentation; independent of the settings store. */
export function createSliderControl({ labelText, value = 0, min = 0, max = 100, step = 1,
  onChange, documentRef = globalThis.document }) {
  const row = documentRef.createElement("label");
  row.className = "slider-control volume-control";
  const label = documentRef.createElement("span");
  label.className = "volume-label menu-label-text";
  label.textContent = labelText;
  const scale = documentRef.createElement("span");
  scale.className = "volume-scale";
  const slider = documentRef.createElement("input");
  slider.type = "range";
  slider.min = String(min); slider.max = String(max); slider.step = String(step);
  slider.value = String(value);
  slider.setAttribute("aria-label", labelText);
  const handleInput = () => onChange?.(Number(slider.value));
  slider.addEventListener("input", handleInput);
  scale.append(slider);
  row.append(label, scale);
  return { row, slider, dispose: () => slider.removeEventListener("input", handleInput) };
}

/** Native boolean control with the same label, sizing and focus treatment. */
export function createToggleControl({ labelText, checked = false, onChange,
  documentRef = globalThis.document }) {
  const row = documentRef.createElement("label");
  row.className = "toggle-control";
  const label = documentRef.createElement("span");
  label.className = "menu-label-text";
  label.textContent = labelText;
  const checkbox = documentRef.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checked;
  const handleChange = () => onChange?.(checkbox.checked);
  checkbox.addEventListener("change", handleChange);
  row.append(label, checkbox);
  return { row, checkbox, dispose: () => checkbox.removeEventListener("change", handleChange) };
}
