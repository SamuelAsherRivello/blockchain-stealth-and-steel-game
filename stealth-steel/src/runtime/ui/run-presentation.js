/** Controls the static DOM elements that belong to one visible game run. */
export function createRunPresentation({ virtualController }) {
  const setVisible = (visible) => {
    if (!virtualController) return;
    virtualController.hidden = !visible;
    virtualController.style.display = visible ? "" : "none";
  };

  return Object.freeze({
    show: () => setVisible(true),
    dispose: () => setVisible(false),
  });
}
