// Run only through the playwright-cli skill's managed browser, from the game root.
// First navigate to the ownership-verified game URL with muteMusic=true,
// muteSFX=true and expectedBisVersion=<the imported candidate's exact version>.
// Then: playwright-cli -s <managed-session> run-code --filename=<this file>
// No accounts, profiles, wallet storage or financial projections are imported.
// All HTTP mutations, BIS endpoints and WebSockets are blocked before dispatch.
// These guest/outage checks cannot qualify a funded lifecycle or hidden tab.
async page => {
  const target = new URL(page.url());
  const expectedVersion = target.searchParams.get('expectedBisVersion');
  if (!['http:', 'https:'].includes(target.protocol) ||
      !target.pathname.includes('/blockchain-stealth-and-steel-game/') ||
      target.searchParams.get('muteMusic') !== 'true' || target.searchParams.get('muteSFX') !== 'true' ||
      !/^\d+\.\d+\.\d+$/.test(expectedVersion ?? '')) {
    throw Error('Use a verified muted game URL and explicit expectedBisVersion.');
  }
  target.searchParams.delete('expectedBisVersion');
  const browser = page.context().browser();
  if (!browser) throw Error('A managed Playwright browser is required.');
  const require = (condition, message) => { if (!condition) throw Error(message); };
  const results = [];
  for (const viewport of [{width:1280,height:844},{width:390,height:844}]) {
    const context = await browser.newContext({viewport, serviceWorkers:'block'});
    const attempts = [];
    const forwardedMethods = new Set();
    let phase = 'startup';
    try {
      await context.routeWebSocket('**/*', socket => socket.close());
      await context.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url()), method = request.method();
        const bis = url.pathname.startsWith('/api/bis/');
        if (bis || !['GET','HEAD'].includes(method) || url.origin !== target.origin) {
          attempts.push({phase,method,origin:url.origin,path:url.pathname,bis});
          return route.abort('blockedbyclient');
        }
        // The sole dispatch path accepts same-origin read-only resources.
        forwardedMethods.add(method);
        return route.continue();
      });
      const guest = await context.newPage();
      const errors = [];
      guest.on('pageerror', error => errors.push(error.message));
      await guest.goto(target.href);
      await guest.waitForFunction(() => document.querySelector('#startup-preloader')?.hidden, undefined, {timeout:60000});
      await guest.getByRole('button', {name:'Start Game',exact:true}).click();
      await guest.getByRole('button', {name:'Open settings',exact:true}).click();
      await guest.getByRole('button', {name:'⚡ Account',exact:true}).click();
      await guest.getByRole('button', {name:'⚡ Create Account',exact:true}).waitFor({timeout:25000});
      const card = guest.locator('.bis-card:visible');
      const observe = async (network, mode) => {
        await guest.waitForFunction(({network,mode,version}) => {
          const cards = [...document.querySelectorAll('.bis-card')].filter(element => element.getClientRects().length);
          return cards.some(element => element.querySelector('.bis-workflow-label')?.textContent === mode &&
            element.querySelector('.bis-network-text')?.textContent === `Network: ${network}` &&
            element.querySelector('.bis-version-label')?.textContent === `BIS: v${version}`);
        }, {network,mode,version:expectedVersion}, {timeout:10000});
        const row = card.locator('.bis-network-label'), label = row.locator('.bis-workflow-label');
        const [rowBox,modeBox,networkBox] = await Promise.all([row.boundingBox(),label.boundingBox(),row.locator('.bis-network-text').boundingBox()]);
        require(rowBox && modeBox && networkBox, 'Shared header must be visible.');
        require(modeBox.x <= networkBox.x && modeBox.y >= rowBox.y - 1 && modeBox.y <= rowBox.y + rowBox.height,
          'Mode label must occupy the left side of the shared header.');
        require(await card.getByRole('button', {name:/^(Local|Server)$/}).count() === 0, 'A user mode toggle must not appear.');
        require(await card.getByRole('button', {name:'⚡ Create Account',exact:true}).isEnabled(), 'Guest Create must remain available.');
        require(await card.getByRole('button', {name:'⚡ Restore Account',exact:true}).isEnabled(), 'Guest Restore must remain available.');
        if (mode === 'Local') require(await card.locator('.bis-server-health').count() === 0, 'Local must not display Server health.');
        else {
          await guest.waitForFunction(() => [...document.querySelectorAll('.bis-server-health')].some(element => /Unavailable|Not connected/.test(element.textContent ?? '')));
          require((await card.locator('.bis-workflow-label').innerText()) === 'Server', 'An outage must retain Server mode.');
        }
        const screenshot = `output/screenshots/treasure-candidate-guest/${expectedVersion}/${viewport.width}-${phase}.png`;
        await guest.screenshot({path:screenshot});
        results.push({viewport,phase,network,mode,version:expectedVersion,screenshot,header:{rowBox,modeBox,networkBox}});
      };
      for (const [network,mode] of [['Mutinynet','Local'],['Signet','Server'],['Mutinynet','Local']]) {
        phase = `${network.toLowerCase()}-${results.length}`;
        const before = attempts.length;
        await card.getByRole('button', {name:'Network',exact:true}).click();
        await card.getByRole('option', {name:network,exact:true}).click();
        await observe(network,mode);
        if (network === 'Mutinynet') require(!attempts.slice(before).some(request => request.bis), 'Mutinynet must skip BIS probes.');
        else require(attempts.slice(before).some(request => request.bis), 'The Server outage check must observe a blocked BIS attempt.');
      }
      phase = 'mutinynet-reload';
      const beforeReload = attempts.length;
      await guest.reload();
      await guest.waitForFunction(() => document.querySelector('#startup-preloader')?.hidden, undefined, {timeout:60000});
      await guest.getByRole('button', {name:'Start Game',exact:true}).click();
      await guest.getByRole('button', {name:'Open settings',exact:true}).click();
      await guest.getByRole('button', {name:'⚡ Account',exact:true}).click();
      await observe('Mutinynet','Local');
      require(!attempts.slice(beforeReload).some(request => request.bis), 'Persisted Mutinynet must skip BIS probes on reload.');
      require([...forwardedMethods].every(method => ['GET','HEAD'].includes(method)), 'No mutation may be dispatched.');
      require(errors.length === 0, `Guest page errors: ${errors.join('; ')}`);
      results.push({viewport,blockedRequests:attempts,forwardedMethods:[...forwardedMethods],pageErrors:errors});
    } finally { await context.close(); }
  }
  return {target:target.href,expectedVersion,browser:browser.version(),financialAcceptance:false,hiddenTabAcceptance:false,results};
}
