// Real installed package, fresh guest contexts. No account creation/import,
// credentials, wallet funding, payment, mint or claim actions are performed.
import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {mutedGameUrl,browserOptions} from './bis-smoke-options.mjs';
const base=process.argv[2];
if(!base)throw Error('Supply a game URL');
const development=process.argv.includes('--development');
const capture=process.argv.includes('--capture-readme');
const {version}=JSON.parse(await readFile(new URL('../../../../package.json',import.meta.url),'utf8'));
const browser=await chromium.launch(browserOptions);
const evidence=[];
async function run(label,work,query='') {
 const context=await browser.newContext({viewport:{width:576,height:1024}});
 const page=await context.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('response',r=>{if(r.status()>=400)network.push({url:r.url(),status:r.status()})});
 page.on('requestfailed',r=>network.push({url:r.url(),failure:r.failure()?.errorText}));
 try {
  await page.goto(mutedGameUrl(base+query));
  await page.waitForFunction(()=>document.querySelector('#startup-preloader')?.hidden,{},{timeout:60000});
  await work(page);
  assert.deepEqual(errors,[],`${label}: browser errors`);
  assert.deepEqual(network,[],`${label}: failed network requests`);
  evidence.push({label,status:'passed',errors,network});console.log('PASS',label);
 } catch(error) {console.error(label,await page.locator('body').innerText());throw error}
 finally {await context.close()}
}
try {
 await run('guest capabilities, gameplay, reset and matching visible versions',async page=>{
  const items=page.getByRole('button',{name:'⚡ Items',exact:true});
  if(await items.count())assert.equal(await items.isDisabled(),true,'Guest cannot activate Items');
  await page.getByRole('button',{name:'Start',exact:true}).click();
  assert.equal((await page.locator('.release-metadata').textContent()).split(' ')[0],`v${version}`);
  assert.equal(await page.getByRole('dialog',{name:'Treasure Chest',exact:true}).count(),0);
  await page.waitForTimeout(600); // Let the normal player spawn animation finish.
  if(capture)await page.screenshot({path:'stealth-steel/documentation/images/stealth-and-steel-gameplay.png'});
  await page.getByRole('button',{name:'Open settings',exact:true}).click();
  await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
  await page.getByRole('button',{name:'⚡ Create Account',exact:true}).waitFor();
  assert.equal(await page.locator('.bis-version-label').textContent(),`BIS: v${version}`);
  if(capture)await page.screenshot({path:'stealth-steel/documentation/images/stealth-and-steel-bis-hud.png'});
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:'Developer',exact:true}).click();
  await page.getByRole('button',{name:'Clear Local Storage',exact:true}).click();
  await page.getByText('Local settings cleared. Remote transactions are not cancelled.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Close developer settings',exact:true}).click();
  await page.getByRole('button',{name:'Close settings',exact:true}).first().click();
  await page.getByRole('button',{name:'Open settings',exact:true}).click();
  await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
  await page.getByRole('button',{name:'⚡ Create Account',exact:true}).waitFor();
  await page.getByRole('button',{name:'Back',exact:true}).click();
 });
 if(development)for(const outcome of ['loss','completion']) {
  await run(`real guest ${outcome} workflow and replacement runtime`,async page=>{
   const documentSession=await page.locator('html').getAttribute('data-game-document-session');
   if(outcome==='loss') {
    const pay=page.getByRole('button',{name:/Pay .*Sats To Continue/});
    await pay.waitFor();assert.equal(await pay.isDisabled(),true);
    assert.match(await pay.textContent(),/1000/,'BIS publishes the unchanged price');
   }else {
    const collect=page.getByRole('button',{name:'Collect Level 1 Trophy',exact:true});
    await collect.waitFor();
    await page.getByText(/Log in to collect this trophy/).waitFor();
    assert.equal(await collect.isDisabled(),true);
    assert.equal(await page.getByRole('button',{name:'Continue To Next Level',exact:true}).isEnabled(),true);
   }
   await page.getByRole('button',{name:'Restart Game',exact:true}).click();
   await page.waitForFunction(()=>document.querySelectorAll('.level-complete-backdrop').length===2 && !document.querySelector('.level-complete-backdrop:not([hidden])'),{},{timeout:60000});
   assert.equal(await page.locator('html').getAttribute('data-game-document-session'),documentSession,'Restart replaces the run without document reload');
   await page.getByRole('button',{name:'Open settings',exact:true}).click();
   await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
   await page.getByRole('button',{name:'⚡ Create Account',exact:true}).waitFor();
  },`?restartQaOutcome=${outcome}`);
 }
 await mkdir('output/playwright',{recursive:true});
 await writeFile(`output/playwright/bis-contracts-${development?'development':'production'}.json`,JSON.stringify({base,version,evidence,limits:'Guest-only; dev QA triggers gameplay outcomes, never financial success.'},null,2));
} finally {await browser.close()}
