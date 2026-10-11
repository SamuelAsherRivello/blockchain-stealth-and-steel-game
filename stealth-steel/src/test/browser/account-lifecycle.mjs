import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { mutedGameUrl, browserOptions } from './bis-smoke-options.mjs';

// Synthetic public IBis boundary only. main.js, its host adapter and menu code
// run unchanged. No wallet identity, provider, recovery input or payment is used.
const fixture = `
export class BisService {
  constructor({getBisGame}) {
    this.connected=false; this.revision=0;
    this.getBisGame=getBisGame;
    window.accountLifecycleFixture={
      ready:()=>Boolean(getBisGame()),
      change:connected=>{
        this.connected=connected; this.revision++;
        const game=getBisGame();
        game.onBisEvent({type:'stateChanged',snapshot:this.getSnapshot()});
        game.onBisEvent({type:connected?'accountConnected':'accountDisconnected',profileId:'synthetic-player'});
      },
      restart:()=>getBisGame().onBisEvent({type:'restartRequested',logoutId:'synthetic-logout'}),
    };
  }
  async readyAsync() {}
  mount() {}
  dispose() {}
  hasItemSupport(){return this.connected;}
  hasAssetMintingSupport(){return false;}
  hasContractSupport(){return false;}
  hasPaymentSupport(){return false;}
  async refreshEquipmentAsync(){return this.getSnapshot().equipment;}
  getSnapshot(){return {
    revision:this.revision,version:'synthetic',disposed:false,
    account:{visible:false,hasProfile:this.connected,phase:this.connected?'ready':'guest',
      ...(this.connected?{playerWallet:{profileId:'synthetic-player'}}:{})},
    capabilities:{items:{available:this.connected},contracts:{available:false},payments:{available:false}},
    equipment:{status:this.connected?'ready':'unavailable',ownedItems:[],effective:{}},
    continuations:[],rewards:[],contracts:{status:'unavailable',contracts:[]},
  };}
}
`;
const directory='output/reports/notify-game-account-session';
await mkdir(directory,{recursive:true});
const browser=await chromium.launch(browserOptions);
const results=[];
try {
  for(const mode of ['connect','disconnect','logout']) {
    const context=await browser.newContext({viewport:{width:1280,height:1000}});
    const page=await context.newPage();
    const errors=[]; const modules=[]; let navigations=0;
    page.on('pageerror',error=>errors.push(error.message));
    page.on('pageerror',error=>console.error('Browser error:',error.message));
    page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
    await page.route(/.*(?:@bis_integration|integration\/dist\/integration).*\.js(?:\?.*)?$/,async route=>{
      modules.push(route.request().url());
      await route.fulfill({contentType:'text/javascript',body:fixture});
    });
    const url=new URL(process.argv[2]??'http://127.0.0.1:5175/blockchain-stealth-and-steel-game/');
    url.searchParams.delete('skipIntro');
    await page.goto(mutedGameUrl(url.href));
    try { await page.getByRole('button',{name:'Start',exact:true}).waitFor({timeout:60000}); }
    catch(error) {
      await page.screenshot({path:directory+'/startup-failure.png'});
      console.error(JSON.stringify({mode,modules,errors,body:await page.locator('body').innerText()}));
      throw error;
    }
    await page.waitForFunction(()=>window.accountLifecycleFixture?.ready());
    assert.ok(modules.length,'Public BIS module was replaced by isolated fixture');
    const menu=page.locator('[data-start-game-prompt]');
    const items=page.locator('.start-game-prompt-items');
    assert.equal(await items.count(),0);
    const oldMenu=await menu.elementHandle();
    await page.evaluate(()=>window.accountLifecycleFixture.change(true));
    await items.waitFor({state:'visible'});
    assert.equal(await items.isEnabled(),true);
    assert.equal(await oldMenu.evaluate(element=>element.isConnected),false);
    assert.equal(await menu.count(),1);
    await page.screenshot({path:directory+'/'+mode+'-connected.png'});
    const connectedMenu=await menu.elementHandle();
    await page.evaluate(()=>{
      window.accountLifecycleFixture.change(false);
      window.accountLifecycleFixture.restart();
      window.accountLifecycleFixture.restart();
    });
    await items.waitFor({state:'detached'});
    assert.equal(await connectedMenu.evaluate(element=>element.isConnected),false);
    assert.equal(await menu.count(),1);
    assert.equal(navigations,1,'Menu lifecycle is browser refresh neutral');
    await page.screenshot({path:directory+'/'+mode+'-disconnected.png'});
    // Fresh page for gameplay: logout adapter deliberately marks its session
    // restarting after the preceding synthetic logout.
    await page.reload();
    await page.getByRole('button',{name:'Start',exact:true}).waitFor({timeout:60000});
    await page.waitForFunction(()=>window.accountLifecycleFixture?.ready());
    if(mode==='disconnect')await page.evaluate(()=>window.accountLifecycleFixture.change(true));
    await page.getByRole('button',{name:'Start',exact:true}).click();
    await menu.waitFor({state:'detached'});
    const before=navigations;
    const navigation=page.waitForEvent('framenavigated',frame=>frame===page.mainFrame());
    await page.evaluate(mode=>{
      const fixture=window.accountLifecycleFixture;
      if(mode==='logout'){fixture.restart();fixture.restart();}
      else {fixture.change(mode==='connect');fixture.change(mode==='connect');}
    },mode);
    await navigation;
    await page.getByRole('button',{name:'Start',exact:true}).waitFor({timeout:60000});
    await page.waitForTimeout(750);
    assert.equal(navigations-before,1,'Repeated lifecycle requests navigate once');
    assert.deepEqual(errors,[]);
    results.push({mode,publicFixture:true,productionHostUnmodified:true,menuRebuilt:true,
      playerOnlyItems:true,menuReloads:0,outsideMenuReloads:navigations-before,pageErrors:errors});
    await context.close();
  }
  await writeFile(directory+'/browser-results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
