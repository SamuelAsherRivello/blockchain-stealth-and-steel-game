import {mutedGameUrl,browserOptions} from './bis-smoke-options.mjs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const captureDirectory = new URL('../../../../output/playwright/', import.meta.url);
mkdirSync(captureDirectory, { recursive: true });
const capturePath = name => fileURLToPath(new URL(name, captureDirectory));
// Fresh browser profiles only; this script never creates a live account or handles recovery words.
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch(browserOptions);
const page=await browser.newPage({viewport:{width:1000,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.goto(mutedGameUrl(process.argv[2]??'http://127.0.0.1:5175/'));
 await page.getByRole('button',{name:'Open settings',exact:true}).waitFor({timeout:60000});
 await page.getByRole('button',{name:'Start',exact:true}).click();
 await page.getByRole('button',{name:'Open settings',exact:true}).click();
 await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
 await page.getByRole('button',{name:'⚡ Create Account',exact:true}).waitFor({timeout:30000});
 console.log('Account guest UI visible');
 const before = await page.locator('#coordinates-ui-pixel').textContent();
 await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
 if (before !== await page.locator('#coordinates-ui-pixel').textContent()) throw Error('Coordinates changed under Account');
 for (let i=0;i<12;i++) { await page.keyboard.press('Tab'); if (!await page.evaluate(()=>!!document.activeElement?.closest('.game-account-host'))) throw Error('Focus escaped Account'); }
 console.log('paused coordinates and keyboard focus containment verified');
 await page.screenshot({path:capturePath("bis-game-account.png")});
 await page.getByRole('button',{name:'Back',exact:true}).click();
 await page.getByRole('button',{name:'⚡ Account',exact:true}).waitFor();
 console.log('returned to Settings; focus:',await page.evaluate(()=>document.activeElement?.textContent));
 await page.getByText('FullScreen',{exact:true}).locator('..').locator('input').check();
 if (!await page.evaluate(()=>!!document.fullscreenElement)) throw Error('Fullscreen did not activate');
 await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
 await page.getByRole('button',{name:'Network',exact:true}).click();
 await page.getByRole('menuitemradio',{name:'Signet',exact:true}).click();
 await page.getByRole('button',{name:'⚡ Restore Account',exact:true}).click();
 await page.getByRole('button',{name:'Back',exact:true}).click();
 await page.getByRole('button',{name:'⚡ Create Account',exact:true}).waitFor();
 console.log('nested Back stays in Account');
 await page.evaluate(()=>document.exitFullscreen());
 await page.setViewportSize({width:360,height:640});
 await page.screenshot({path:capturePath("bis-game-account-narrow.png")});
 await page.setViewportSize({width:360,height:400});
 await page.getByRole('button',{name:'Back',exact:true}).click();
 await page.getByRole('button',{name:'Close settings',exact:true}).first().click();
 console.log('closed Settings; page errors:',JSON.stringify(errors));
 if(errors.length)process.exitCode=1;
} catch(e){console.log('FAIL:',e.message);console.log('page errors:',JSON.stringify(errors));await page.screenshot({path:capturePath("bis-game-failure.png")});process.exitCode=1;}
finally{await browser.close();}
