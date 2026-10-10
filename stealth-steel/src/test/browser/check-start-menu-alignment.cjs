async page => {
  const base = page.url().split('/src/test/')[0];
  const zooms = Array.from({ length: 11 }, (_, index) => (index + 5) / 10);
  const surfaces = [
    { name: 'start-menu', path: 'start-menu-zoom-host.html', selector: '.start-game-prompt-panel' },
    { name: 'settings-menu', path: 'settings-menu-zoom-host.html', selector: '.game-window' },
    { name: 'completion-menu', path: 'completion-host.html?mode=available', selector: '.level-complete-panel' },
    { name: 'loss-menu', path: 'loss-menu-zoom-host.html', selector: '.level-complete-panel' },
  ];
  const passes = [];
  for (const surface of surfaces) {
    for (const zoom of zooms) {
      await page.setViewportSize({ width: Math.round(1280 / zoom), height: Math.round(800 / zoom) });
      const separator = surface.path.includes('?') ? '&' : '?';
      await page.goto(`${base}/src/test/browser/${surface.path}${separator}muteMusic=true&muteSFX=true`);
      await page.locator(`${surface.selector} .tiny-swords-button`).first().waitFor();
      const result = await page.evaluate(surfaceSelector => {
        const panel = document.querySelector(surfaceSelector);
        const paper = panel?.querySelector(':scope > .tiny-swords-slices');
        if (!panel || !paper) throw new Error(`Missing menu paper for ${surfaceSelector}`);
        const center = rect => ({ x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 });
        const buttons = [...panel.querySelectorAll('.tiny-swords-button:not([hidden])')];
        if (!buttons.length) throw new Error(`No visible game-menu buttons for ${surfaceSelector}`);
        return buttons.map(button => {
          const buttonRect = button.getBoundingClientRect();
          const labelRect = button.querySelector('menu-button-label').getBoundingClientRect();
          const buttonCenter = center(buttonRect);
          const labelCenter = center(labelRect);
          const paperRect = paper.getBoundingClientRect();
          return {
            text: button.querySelector('menu-button-label').textContent,
            horizontalOffset: labelCenter.x - buttonCenter.x,
            verticalOffset: labelCenter.y - buttonCenter.y,
            labelInsideButton: labelRect.left >= buttonRect.left - 1 && labelRect.right <= buttonRect.right + 1 && labelRect.top >= buttonRect.top - 1 && labelRect.bottom <= buttonRect.bottom + 1,
            buttonInsidePaper: buttonRect.left >= paperRect.left - 1 && buttonRect.right <= paperRect.right + 1 && buttonRect.top >= paperRect.top - 1 && buttonRect.bottom <= paperRect.bottom + 1,
          };
        });
      }, surface.selector);
      for (const button of result) {
        if (Math.abs(button.horizontalOffset) > 1 || Math.abs(button.verticalOffset) > 1) throw new Error(`${surface.name} ${zoom * 100}% ${button.text} label is not centered: ${JSON.stringify(button)}`);
        if (!button.labelInsideButton) throw new Error(`${surface.name} ${zoom * 100}% label leaves button bounds`);
        if (!button.buttonInsidePaper) throw new Error(`${surface.name} ${zoom * 100}% button leaves paper bounds`);
      }
      await page.screenshot({ path: `output/playwright/${surface.name}-${Math.round(zoom * 100)}-pass.png` });
      passes.push({ surface: surface.name, zoom: `${zoom * 100}%`, buttons: result });
    }
  }
  return passes;
}
