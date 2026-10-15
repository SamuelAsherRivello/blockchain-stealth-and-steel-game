import {mutedGameUrl,browserOptions} from './bis-smoke-options.mjs';
// Fresh browser profiles only; this script never creates a live account or handles recovery words.
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');import assert from 'node:assert/strict';
const browser=await chromium.launch(browserOptions);
try{for(const mode of ['failure','slow']){
 const context=await browser.newContext();const page=await context.newPage();
 await page.route(/\/assets\/integration-.*\.js/,async r=>{if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,17000));try{await r.abort();}catch{}});
 await page.goto(mutedGameUrl(process.argv[2] ?? 'http://127.0.0.1:4175/'));await page.getByRole('button',{name:'Start',exact:true}).click({timeout:60000});
 await page.getByRole('button',{name:'Open settings',exact:true}).click();await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
 await page.getByText('Account is unavailable. Return to Settings and try again.',{exact:true}).waitFor({timeout:25000});
 await page.getByRole('button',{name:'Back to Settings',exact:true}).click();await page.getByRole('button',{name:'Close settings',exact:true}).first().click();
 assert.equal(await page.locator('.game-account-host').evaluate(el=>el.classList.contains('game-account-passive')),true);await page.waitForTimeout(2500);assert.equal(await page.locator('.game-account-host').evaluate(el=>el.classList.contains('game-account-passive')),true);
 console.log('PASS production '+mode+': guest startup, bounded failure, Back to Settings, close to gameplay, no late reopen');await context.close();
}}finally{await browser.close();}
